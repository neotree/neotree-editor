import crypto from "crypto"
import { isHeadwindDeviceRow } from "./headwind-shape"
import type { MdmActionResult, MdmApkPayload, MdmConfiguration, MdmDeviceIdentityStamp, MdmDeviceStatus, MdmProvider, MdmProviderConfig, MdmSyncDiagnostics } from "./types"

// A device not seen by Headwind in this long is treated as no longer actively
// managed (#8) so we stop pushing rollouts to decommissioned/offline tablets.
const DEVICE_STALE_MS = 30 * 24 * 60 * 60 * 1000
// Hard cap on pages so a misbehaving server can never spin us forever (#5).
const MAX_PAGES = 100
const PAGE_SIZE = 200

// Short-lived JWT cache so a burst of server actions doesn't re-login (md5
// password) on every call and trip Headwind rate-limits/lockouts.
const tokenCache = new Map<string, { token: string; expiresAt: number }>()
const TOKEN_TTL_MS = 5 * 60 * 1000

export class HeadwindMdmProvider implements MdmProvider {
  readonly name = "headwind" as const
  private accessToken?: string | null
  private lastSyncDiagnostics: MdmSyncDiagnostics | null = null

  constructor(private readonly config: MdmProviderConfig) {}

  getLastSyncDiagnostics() {
    return this.lastSyncDiagnostics
  }

  private get baseUrl() {
    return this.config.baseUrl.replace(/\/+$/, "")
  }

  private get token() {
    return this.accessToken || this.config.apiKey || this.config.settings?.accessToken || null
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    }
  }

  private md5(value: string) {
    return crypto.createHash("md5").update(value).digest("hex").toUpperCase()
  }

  private get cacheKey() {
    return `${this.baseUrl}::${this.config.username || ""}`
  }

  private async authenticate() {
    if (this.token) return this.token
    if (!this.config.username || !this.config.password) {
      throw new Error("Headwind service username and password are required")
    }

    const cached = tokenCache.get(this.cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      this.accessToken = cached.token
      return cached.token
    }

    const loginPath = this.config.settings?.loginPath || "/rest/public/jwt/login"
    const res = await fetch(`${this.baseUrl}${loginPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: this.config.username,
        password: this.md5(this.config.password),
      }),
      cache: "no-store",
    })

    const payload = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(payload?.message || `Headwind login failed: ${res.status}`)

    const token = payload?.id_token || payload?.token || payload?.accessToken
    if (!token) throw new Error("Headwind login did not return an access token")

    this.accessToken = token
    tokenCache.set(this.cacheKey, { token, expiresAt: Date.now() + TOKEN_TTL_MS })
    return token
  }

  private async requestJson(path: string, init?: RequestInit, allowRetry = true): Promise<any> {
    await this.authenticate()
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(init?.headers || {}),
      },
      cache: "no-store",
    })

    // A cached JWT may have expired server-side: drop it and retry once.
    if (res.status === 401 && allowRetry && !this.config.apiKey) {
      tokenCache.delete(this.cacheKey)
      this.accessToken = null
      return this.requestJson(path, init, false)
    }

    const payload = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(payload?.message || `Headwind request failed: ${res.status}`)
    return payload
  }

  private extractArray(payload: any, keys: string[]) {
    if (Array.isArray(payload)) return payload
    for (const key of keys) {
      const value = payload?.[key] || payload?.data?.[key]
      if (Array.isArray(value)) return value
    }
    if (Array.isArray(payload?.data)) return payload.data
    const nested = this.findArrayByKeys(payload, keys)
    if (nested) return nested
    return []
  }

  private findArrayByKeys(payload: any, keys: string[], depth = 0): any[] | null {
    if (!payload || typeof payload !== "object" || depth > 4) return null
    for (const key of keys) {
      const value = payload[key]
      if (Array.isArray(value)) return value
    }
    for (const value of Object.values(payload)) {
      const nested = this.findArrayByKeys(value, keys, depth + 1)
      if (nested) return nested
    }
    return null
  }

  private objectKeys(value: any) {
    return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).slice(0, 12) : []
  }

  private extractDeviceItems(payload: any) {
    const devicePage = payload?.devices || payload?.data?.devices
    const candidates = [
      devicePage?.items,
      Array.isArray(devicePage) ? devicePage : null,
      Array.isArray(payload) ? payload : null,
      Array.isArray(payload?.data) ? payload.data : null,
      payload?.device ? [payload.device] : null,
      payload?.data?.device ? [payload.data.device] : null,
    ]

    for (const candidate of candidates) {
      if (!Array.isArray(candidate)) continue
      const devices = candidate.filter((item) => isHeadwindDeviceRow(item))
      if (devices.length || candidate.length === 0) return devices
    }

    return []
  }

  private deriveDeviceState(item: any, lastSeenMs: number): Pick<MdmDeviceStatus, "enrollmentStatus" | "managementState"> {
    // Prefer any explicit status Headwind exposes; otherwise infer.
    const explicit = `${item?.enrollmentStatus || item?.status || item?.state || ""}`.toLowerCase()

    let enrollmentStatus: MdmDeviceStatus["enrollmentStatus"] = "enrolled"
    if (explicit.includes("pending")) enrollmentStatus = "pending"
    else if (explicit.includes("unenroll") || explicit.includes("removed") || explicit.includes("deleted")) enrollmentStatus = "unenrolled"
    else if (explicit.includes("fail")) enrollmentStatus = "failed"
    // A device returned by the MDM device list is, by definition, enrolled.

    // Managed unless we have a concrete last-seen timestamp that is stale. We do
    // NOT downgrade devices that simply lack a timestamp, to avoid excluding
    // valid devices from rollouts.
    const isStale = Number.isFinite(lastSeenMs) && Date.now() - lastSeenMs > DEVICE_STALE_MS
    const managementState: MdmDeviceStatus["managementState"] =
      enrollmentStatus === "unenrolled" ? "unmanaged" : isStale ? "unmanaged" : "managed"

    return { enrollmentStatus, managementState }
  }

  /** Headwind's device `info` arrives as a JSON string; parse it defensively. */
  private parseDeviceInfo(raw: unknown): Record<string, any> {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, any>
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
      } catch {
        return {}
      }
    }
    return {}
  }

  private mapDeviceStatus(item: any): MdmDeviceStatus {
    const lastSeenRaw = item?.lastUpdate || item?.lastSeen || item?.lastLogin || null
    const lastSeenMs = lastSeenRaw ? new Date(lastSeenRaw).getTime() : NaN
    const { enrollmentStatus, managementState } = this.deriveDeviceState(item, lastSeenMs)
    // Headwind serialises the device DTO with `info` as a JSON STRING (the
    // DeviceInfo blob: serial, imei, custom1..3, etc.), not a nested object. Parse
    // it so the info-level fallbacks below are actually live instead of dead code.
    const info = this.parseDeviceInfo(item?.info)
    const headwindId = item?.id != null ? `${item.id}` : null
    const headwindNumber = item?.number || info?.deviceId || null
    const oldHeadwindNumber = item?.oldNumber || info?.oldNumber || null
    const serialNumber = item?.serialNumber || item?.serial || item?.androidSerial || info?.serialNumber || info?.serial || null
    const custom1 = item?.custom1 || info?.custom1 || null
    const custom2 = item?.custom2 || info?.custom2 || null
    const custom3 = item?.custom3 || info?.custom3 || null
    // Headwind returns group membership as a LIST (`groups: [{ id, name }]`), not a
    // scalar groupId. Without reading the list the link's mdmGroupId/Name stay null,
    // which silently breaks group-targeted APK rollout policies (#group-target).
    const groups = (Array.isArray(item?.groups) ? item.groups : [])
      .filter((group: any) => group && (group.id != null || group.name))
      .map((group: any) => ({
        id: group.id != null ? `${group.id}` : null,
        name: group.name ? `${group.name}` : null,
      }))
      .sort((left: any, right: any) => `${left.id || left.name || ""}`.localeCompare(`${right.id || right.name || ""}`))
    const scalarGroup = item?.groupId != null || item?.deviceGroupId != null || item?.groupName || item?.deviceGroupName || item?.group?.name
      ? {
          id: item?.groupId != null ? `${item.groupId}` : item?.deviceGroupId != null ? `${item.deviceGroupId}` : null,
          name: item?.groupName || item?.deviceGroupName || item?.group?.name || null,
        }
      : null
    const memberships = [scalarGroup, ...groups]
      .filter(Boolean)
      .filter((group: any, index, values) => values.findIndex((candidate: any) =>
        `${candidate?.id || ""}` === `${group?.id || ""}` && `${candidate?.name || ""}` === `${group?.name || ""}`,
      ) === index)
    const primaryGroup = scalarGroup || memberships[0] || null
    const headwindGroupIds = Array.from(new Set(memberships.map((group: any) => group?.id).filter(Boolean))) as string[]
    const headwindGroupNames = Array.from(new Set(memberships.map((group: any) => group?.name).filter(Boolean))) as string[]
    const headwindGroupId =
      item?.groupId != null ? `${item.groupId}` :
      item?.deviceGroupId != null ? `${item.deviceGroupId}` :
      primaryGroup?.id != null ? `${primaryGroup.id}` : null
    const headwindGroupName = item?.groupName || item?.deviceGroupName || item?.group?.name || primaryGroup?.name || null

    return {
      deviceId: item?.neotreeDeviceId || item?.customDeviceId || info?.neotreeDeviceId || null,
      // Headwind device number is the stable cross-system key. The internal id is
      // kept as metadata only because older links may have stored it.
      mdmDeviceId: headwindNumber || headwindId || null,
      mdmConfigId: item?.configurationId != null ? `${item.configurationId}` : item?.configId != null ? `${item.configId}` : null,
      mdmConfigName: item?.configurationName || item?.configName || item?.configuration?.name || null,
      mdmGroupId: headwindGroupId,
      mdmGroupName: headwindGroupName,
      mdmGroupIds: headwindGroupIds,
      mdmGroupNames: headwindGroupNames,
      enrollmentStatus,
      managementState,
      serialNumber,
      androidVersion: item?.androidVersion || item?.sdkVersion || info?.androidVersion || item?.info?.androidVersion || null,
      androidSdk: item?.androidSdk || item?.sdkInt || info?.androidSdk || null,
      deviceCapabilities: {
        identifiers: {
          headwindId,
          headwindNumber,
          headwindOldNumber: oldHeadwindNumber,
          number: headwindNumber,
          deviceNumber: headwindNumber,
          oldNumber: oldHeadwindNumber,
          neotreeDeviceId: item?.neotreeDeviceId || item?.customDeviceId || info?.neotreeDeviceId || null,
          serialNumber,
          custom1,
          custom2,
          custom3,
          displayName: headwindNumber,
        },
        mdm: {
          provider: "headwind",
          headwindId,
          deviceId: headwindId,
          deviceNumber: headwindNumber,
          headwindNumber,
          oldDeviceNumber: oldHeadwindNumber,
          oldNumber: oldHeadwindNumber,
          custom1,
          custom2,
          custom3,
          serialNumber,
          managed: item?.mdmMode ?? info?.mdmMode ?? managementState === "managed",
          kiosk: item?.kioskMode ?? info?.kioskMode ?? null,
          serverDeviceId: info?.deviceId || null,
        },
        groups: {
          ids: headwindGroupIds,
          names: headwindGroupNames,
          memberships,
        },
      },
      lastMdmSeenAt: lastSeenRaw,
      payload: item || {},
    }
  }

  private stampValue(prefix: "nt_hash" | "nt_device", value?: string | null) {
    const clean = `${value || ""}`.trim()
    return clean ? `${prefix}:${clean}` : null
  }

  private stampIfSafe(current: unknown, next?: string | null) {
    const currentValue = `${current || ""}`.trim()
    if (!next) return currentValue || null
    if (!currentValue || currentValue.startsWith("nt_hash:") || currentValue.startsWith("nt_device:")) return next
    return currentValue
  }

  private normalized(value: unknown) {
    return `${value || ""}`.trim().toLowerCase()
  }

  private deviceMatchesLookupValue(device: any, value: string) {
    const normalizedValue = this.normalized(value)
    if (!normalizedValue) return false
    const info = device?.info || {}
    return [
      device?.id,
      device?.number,
      device?.oldNumber,
      device?.serial,
      device?.serialNumber,
      device?.androidSerial,
      info?.deviceId,
      info?.oldNumber,
      info?.serial,
      info?.serialNumber,
    ].some((candidate) => this.normalized(candidate) === normalizedValue)
  }

  private async searchRawDevice(value: string): Promise<any | null> {
    try {
      const payload = await this.requestJson("/rest/private/devices/search", {
        method: "POST",
        body: JSON.stringify({
          value,
          groupId: -1,
          configurationId: -1,
          pageSize: PAGE_SIZE,
          pageNum: 1,
          sortBy: null,
          sortDir: "ASC",
        }),
      })
      const devices = this.extractDeviceItems(payload)
      return devices.find((device) => this.deviceMatchesLookupValue(device, value)) || null
    } catch {
      return null
    }
  }

  /** Fetches the authoritative full device record so a PUT never drops fields. */
  private async getRawDevice(numberOrId: string): Promise<any | null> {
    const value = `${numberOrId || ""}`.trim()
    if (!value) return null

    const configuredPath = this.config.settings?.deviceStatusPath
    const paths = [
      configuredPath ? `${configuredPath}`.replace(":mdmDeviceId", encodeURIComponent(value)) : null,
      `/rest/private/devices/number/${encodeURIComponent(value)}`,
      `/rest/private/devices/${encodeURIComponent(value)}`,
    ].filter(Boolean) as string[]

    for (const path of paths) {
      try {
        const payload = await this.requestJson(path)
        const device = payload?.data ?? payload?.device ?? payload?.data?.device ?? payload ?? null
        // Guard against endpoints that return a list/wrapper instead of a device.
        if (device && typeof device === "object" && (device.id != null || device.number != null)) return device
      } catch {
        // Try the next known Headwind lookup shape.
      }
    }

    return this.searchRawDevice(value)
  }

  async stampDeviceIdentity(device: MdmDeviceStatus, identity: MdmDeviceIdentityStamp): Promise<MdmActionResult> {
    const payload = device.payload || {}
    const identifiers = (device.deviceCapabilities?.identifiers || {}) as Record<string, any>
    const headwindNumber = `${payload.number || identifiers.number || identifiers.headwindNumber || device.mdmDeviceId || ""}`.trim()

    if (!headwindNumber) {
      return {
        success: false,
        provider: this.name,
        message: "Headwind device number is required for stamp-back",
      }
    }

    // Headwind's device PUT is a full-object replace, and the device LIST payload
    // does not include groups/description/config. Re-fetch the authoritative
    // record and override ONLY the custom fields, so we never wipe membership.
    const full = await this.getRawDevice(headwindNumber)
    if (!full) {
      return {
        success: false,
        provider: this.name,
        message: "Could not load the full Headwind device record; skipped stamp-back to avoid overwriting device data",
      }
    }

    const id = full.id ?? payload.id ?? identifiers.headwindId
    const configurationId = full.configurationId ?? full.configId ?? payload.configurationId ?? device.mdmConfigId
    if (id == null || configurationId == null) {
      return {
        success: false,
        provider: this.name,
        message: "Headwind device record is missing id/configurationId required for stamp-back",
      }
    }

    const custom1 = this.stampIfSafe(full.custom1, this.stampValue("nt_hash", identity.neotreeDeviceHash))
    const custom2 = this.stampIfSafe(full.custom2, this.stampValue("nt_device", identity.neotreeDeviceId))

    if (custom1 === (full.custom1 || null) && custom2 === (full.custom2 || null)) {
      return {
        success: true,
        provider: this.name,
        message: "Headwind device identity stamp already current",
        payload: { skipped: true },
      }
    }

    // Echo the full device back with only the custom fields changed.
    const request = {
      ...full,
      custom1,
      custom2,
    }

    await this.requestJson("/rest/private/devices", {
      method: "PUT",
      body: JSON.stringify(request),
    })

    return {
      success: true,
      provider: this.name,
      providerActionId: `${id}`,
      message: "Headwind custom fields stamped with NeoTree identity",
      payload: { custom1, custom2 },
    }
  }

  private async withConfigurationNames(devices: MdmDeviceStatus[]) {
    const missingNames = devices.filter((device) => device.mdmConfigId && !device.mdmConfigName)
    if (!missingNames.length) return devices

    try {
      const configurations = await this.listConfigurations()
      const nameById = new Map(
        configurations
          .filter((configuration) => configuration.id && configuration.name)
          .map((configuration) => [`${configuration.id}`.trim().toLowerCase(), configuration.name]),
      )

      if (!nameById.size) return devices

      return devices.map((device) => {
        if (!device.mdmConfigId || device.mdmConfigName) return device
        const mdmConfigName = nameById.get(`${device.mdmConfigId}`.trim().toLowerCase()) || null
        if (!mdmConfigName) return device

        return {
          ...device,
          mdmConfigName,
          payload: {
            ...(device.payload || {}),
            configurationName: mdmConfigName,
          },
        }
      })
    } catch {
      return devices
    }
  }

  async listConfigurations(): Promise<MdmConfiguration[]> {
    const configuredPath = this.config.settings?.configurationsPath
    const attempts: { path: string; init: RequestInit; paged?: boolean }[] = configuredPath
      ? [{ path: configuredPath, init: { method: "GET" } }]
      : [
          { path: "/rest/private/configurations/list", init: { method: "GET" } },
          { path: "/rest/private/configurations/search", init: { method: "GET" } },
          { path: "/rest/private/configurations/search/", init: { method: "GET" } },
          { path: "/rest/private/configurations/search/%20", init: { method: "GET" } },
          { path: "/rest/private/configurations/search", init: { method: "POST" }, paged: true },
          { path: "/rest/private/configurations", init: { method: "GET" } },
        ]

    const errors: string[] = []
    let raw: any[] | null = null

    for (const attempt of attempts) {
      try {
        if (attempt.paged) {
          const collected: any[] = []
          for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum += 1) {
            const payload = await this.requestJson(attempt.path, {
              ...attempt.init,
              body: JSON.stringify({ pageSize: PAGE_SIZE, pageNum }),
            })
            const page = this.extractArray(payload, ["configurations", "items", "results", "data"])
            collected.push(...page)
            if (page.length < PAGE_SIZE) break
          }
          raw = collected
        } else {
          const payload = await this.requestJson(attempt.path, attempt.init)
          raw = this.extractArray(payload, ["configurations", "items", "results", "data"])
        }
        break
      } catch (e: any) {
        errors.push(`${attempt.init.method} ${attempt.path}: ${e.message}`)
      }
    }

    if (raw === null) {
      throw new Error(`Headwind configurations lookup failed. Tried ${errors.join("; ")}`)
    }

    return raw
      .map((item: any) => ({
        id: item?.id != null ? `${item.id}` : item?.configurationId != null ? `${item.configurationId}` : item?.name || "",
        name: item?.name || item?.configurationName || `${item?.id || ""}`,
        description: item?.description || null,
        payload: item || {},
      }))
      .filter((item: MdmConfiguration) => item.id && item.name)
  }

  private async postAction(action: string, mdmDeviceId: string, body: Record<string, any>): Promise<MdmActionResult> {
    const actionPaths = this.config.settings?.actionPaths || {}
    const template = actionPaths[action]

    if (!template) {
      return {
        success: false,
        provider: this.name,
        message: `Headwind ${action} endpoint is not configured`,
        payload: { action, mdmDeviceId },
      }
    }

    const path = `${template}`.replace(":mdmDeviceId", encodeURIComponent(mdmDeviceId))
    const request = { mdmDeviceId, ...body }
    try {
      const response = await this.requestJson(path, { method: "POST", body: JSON.stringify(request) })
      return this.normalizeActionResult({ action, path, request, response })
    } catch (e: any) {
      return {
        success: false,
        provider: this.name,
        message: e?.message || `Headwind ${action} failed`,
        payload: { action, path, request: this.redactActionValue(request) },
      }
    }
  }

  async getDeviceStatus(mdmDeviceId: string): Promise<MdmDeviceStatus> {
    if (!mdmDeviceId) {
      return {
        mdmDeviceId,
        enrollmentStatus: "unknown",
        managementState: "unknown",
        payload: { reason: "missing_mdm_device_id" },
      }
    }

    const payload = await this.getRawDevice(mdmDeviceId)
    if (!payload) throw new Error("Headwind device status failed: device not found")
    const mapped = this.mapDeviceStatus(payload)

    return {
      ...mapped,
      mdmDeviceId: mapped.mdmDeviceId || mdmDeviceId,
    }
  }

  async syncDevices(): Promise<MdmDeviceStatus[]> {
    const configuredPath = this.config.settings?.devicesPath
    // Each strategy describes how to request a single page; `paged` ones get
    // looped until exhausted (#5), non-paged GETs are single-shot fallbacks.
    const defaultStrategies: { path: string; method: string; paged: boolean }[] = [
      { path: "/rest/private/devices/search", method: "POST", paged: true },
      { path: "/rest/private/devices/search", method: "GET", paged: false },
      { path: "/rest/private/devices", method: "GET", paged: false },
    ]
    const strategies: { path: string; method: string; paged: boolean }[] = configuredPath
      ? [
          { path: configuredPath, method: "POST", paged: true },
          { path: configuredPath, method: "GET", paged: false },
          ...defaultStrategies.filter((strategy) => strategy.path !== configuredPath),
        ]
      : defaultStrategies

    const errors: string[] = []
    const attempts: MdmSyncDiagnostics["attempts"] = []
    let emptyResult: MdmDeviceStatus[] | null = null

    for (const strategy of strategies) {
      try {
        const collected: any[] = []
        let lastPayload: any = null
        for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum += 1) {
          const init: RequestInit =
            strategy.method === "POST"
              ? {
                  method: "POST",
                  body: JSON.stringify({
                    value: "",
                    groupId: -1,
                    configurationId: -1,
                    pageSize: PAGE_SIZE,
                    pageNum,
                    sortBy: null,
                    sortDir: "ASC",
                  }),
                }
              : { method: "GET" }
          const payload = await this.requestJson(strategy.path, init)
          lastPayload = payload
          const page = this.extractDeviceItems(payload)
          collected.push(...page)
          // Stop when the server can't page, or returned a short/empty final page.
          if (!strategy.paged || page.length < PAGE_SIZE) break
        }
        attempts.push({
          path: strategy.path,
          method: strategy.method,
          count: collected.length,
          payloadKeys: this.objectKeys(lastPayload),
          dataKeys: this.objectKeys(lastPayload?.data),
          error: null,
        })
        const mapped = await this.withConfigurationNames(collected.map((item: any) => this.mapDeviceStatus(item)))
        if (mapped.length > 0) {
          this.lastSyncDiagnostics = {
            attempts,
            selectedPath: strategy.path,
            selectedMethod: strategy.method,
            selectedCount: mapped.length,
          }
          return mapped
        }
        emptyResult = mapped
      } catch (e: any) {
        errors.push(`${strategy.method} ${strategy.path}: ${e.message}`)
        attempts.push({
          path: strategy.path,
          method: strategy.method,
          count: 0,
          payloadKeys: [],
          dataKeys: [],
          error: e.message,
        })
      }
    }

    this.lastSyncDiagnostics = {
      attempts,
      selectedPath: null,
      selectedMethod: null,
      selectedCount: 0,
    }

    if (emptyResult) return emptyResult
    throw new Error(`Headwind device lookup failed. Tried ${errors.join("; ")}`)
  }

  // Remote device control is provided by Headwind's "Reboot, lock, reset" plugin
  // (devicereset). Endpoints + payloads confirmed against a 5.39.3 cloud instance
  // from the web panel's own requests:
  //   PUT /rest/plugins/devicereset/private/reboot/{id}    body {}
  //   PUT /rest/plugins/devicereset/private/reset/{id}     body {}   (factory reset)
  //   PUT /rest/plugins/devicereset/private/lock           body {deviceId, lock, message}
  //   PUT /rest/plugins/devicereset/private/password       body {deviceId, password}
  // {id}/deviceId is the Headwind INTERNAL device id (Device.id), not the device
  // number. An admin can still override any endpoint via settings.actionPaths
  // (templated with :headwindId / :mdmDeviceId) for a differently-configured server.
  private static readonly DEVICERESET_BASE = "/rest/plugins/devicereset/private"

  private redactActionValue(value: any): any {
    if (Array.isArray(value)) return value.map((item) => this.redactActionValue(item))
    if (!value || typeof value !== "object") return value

    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /password|token|secret|authorization|api[_-]?key/i.test(key)
          ? "[REDACTED]"
          : this.redactActionValue(item),
      ]),
    )
  }

  private actionTimestamp(value: unknown): string | null {
    if (value == null || value === "") return null
    const numeric = typeof value === "number" ? value : Number(`${value}`)
    const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(`${value}`)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  private normalizeActionResult({
    action,
    path,
    request,
    response,
    httpSuccess = true,
    httpStatus,
  }: {
    action: string
    path: string
    request?: Record<string, any>
    response: any
    httpSuccess?: boolean
    httpStatus?: number
  }): MdmActionResult {
    const responseData = response?.data && typeof response.data === "object" ? response.data : response || {}
    const providerStatus = response?.status == null ? null : `${response.status}`
    const normalizedStatus = `${providerStatus || ""}`.trim().toUpperCase()
    const providerAccepted = !normalizedStatus || normalizedStatus === "OK" || normalizedStatus === "SUCCESS"
    const success = httpSuccess && providerAccepted
    const providerActionId = responseData?.id ?? responseData?.actionId ?? response?.id ?? response?.actionId ?? null
    const state = {
      deviceId: responseData?.deviceId == null ? null : `${responseData.deviceId}`,
      deviceLocked: typeof responseData?.deviceLocked === "boolean" ? responseData.deviceLocked : null,
      lockMessage: typeof responseData?.lockMessage === "string" ? responseData.lockMessage : null,
      statusResetRequestedAt: this.actionTimestamp(responseData?.statusResetRequested),
      statusResetConfirmedAt: this.actionTimestamp(responseData?.statusResetConfirmed),
      rebootRequestedAt: this.actionTimestamp(responseData?.rebootRequested),
      rebootConfirmedAt: this.actionTimestamp(responseData?.rebootConfirmed),
    }
    const hasState = Object.values(state).some((value) => value !== null)
    const actionLabel = action.replace(/([A-Z])/g, " $1").toLowerCase()
    const fallbackMessage = success
      ? `Headwind accepted the ${actionLabel} request`
      : `Headwind rejected the ${actionLabel} request${httpStatus ? ` (${httpStatus})` : providerStatus ? ` (${providerStatus})` : ""}`

    return {
      success,
      provider: this.name,
      providerActionId: providerActionId == null ? null : `${providerActionId}`,
      providerStatus,
      message: response?.message || fallbackMessage,
      state: hasState ? state : undefined,
      payload: {
        action,
        path,
        request: this.redactActionValue(request || {}),
        response: this.redactActionValue(responseData),
      },
    }
  }

  private async deviceResetCommand(
    command: "reboot" | "factoryReset" | "lock" | "unlock" | "resetPassword",
    settingsKey: "rebootDevice" | "wipeDevice" | "lockDevice" | "resetPassword",
    headwindId: string,
    body?: Record<string, any>,
  ): Promise<MdmActionResult> {
    const id = `${headwindId || ""}`.trim()
    if (!id) {
      return { success: false, provider: this.name, message: "Missing Headwind device id for command" }
    }
    const numericId = Number(id)
    if (!Number.isSafeInteger(numericId) || numericId <= 0) {
      return {
        success: false,
        provider: this.name,
        message: "Headwind internal device id is invalid; re-sync the MDM profile before retrying",
      }
    }

    const endpoint = command === "factoryReset" ? "reset" : command === "resetPassword" ? "password" : command === "unlock" ? "lock" : command
    const override = this.config.settings?.actionPaths?.[settingsKey]
    const idInPath = endpoint === "reboot" || endpoint === "reset"

    let path: string
    let payload: Record<string, any>
    if (override) {
      // Custom endpoint: template the id and carry the body (deviceId + extras).
      path = `${override}`
        .replace(":headwindId", encodeURIComponent(id))
        .replace(":mdmDeviceId", encodeURIComponent(id))
      payload = idInPath ? {} : { deviceId: numericId, ...(body || {}) }
    } else if (idInPath) {
      path = `${HeadwindMdmProvider.DEVICERESET_BASE}/${endpoint}/${encodeURIComponent(id)}`
      payload = {}
    } else {
      path = `${HeadwindMdmProvider.DEVICERESET_BASE}/${endpoint}`
      payload = { deviceId: numericId, ...(body || {}) }
    }

    try {
      const res = await this.requestJson(path, { method: "PUT", body: JSON.stringify(payload) })
      return this.normalizeActionResult({ action: command, path, request: payload, response: res })
    } catch (e: any) {
      return {
        success: false,
        provider: this.name,
        message: e?.message || `Headwind ${command} failed`,
        payload: { action: command, path, request: this.redactActionValue(payload) },
      }
    }
  }

  // The lock endpoint toggles lock state via a `lock` boolean. Confirmed payload:
  // {deviceId, lock, message}. Locking sets lock:true with the on-device message;
  // unlocking sets lock:false with an empty message (matches the panel's request).
  async lockDevice(headwindId: string, reason?: string): Promise<MdmActionResult> {
    return this.deviceResetCommand("lock", "lockDevice", headwindId, {
      lock: true,
      message: `${reason || ""}`.trim(),
    })
  }

  async unlockDevice(headwindId: string, _reason?: string): Promise<MdmActionResult> {
    return this.deviceResetCommand("unlock", "lockDevice", headwindId, { lock: false, message: "" })
  }

  async wipeDevice(headwindId: string, _reason?: string): Promise<MdmActionResult> {
    return this.deviceResetCommand("factoryReset", "wipeDevice", headwindId)
  }

  async rebootDevice(headwindId: string, _reason?: string): Promise<MdmActionResult> {
    return this.deviceResetCommand("reboot", "rebootDevice", headwindId)
  }

  async resetPassword(headwindId: string, password?: string | null): Promise<MdmActionResult> {
    return this.deviceResetCommand("resetPassword", "resetPassword", headwindId, { password: `${password || ""}` })
  }

  async assignKioskPolicy(mdmDeviceId: string, policyId: string): Promise<MdmActionResult> {
    return this.postAction("assignKioskPolicy", mdmDeviceId, { policyId })
  }

  async pushApk(mdmDeviceId: string, apk: MdmApkPayload): Promise<MdmActionResult> {
    return this.postAction("pushApk", mdmDeviceId, {
      ...apk,
      // Common aliases make the configurable Headwind action endpoint easier
      // to integrate with without forcing admins to understand payload shape.
      url: apk.downloadUrl,
      fileUrl: apk.downloadUrl,
      apkUrl: apk.downloadUrl,
      install: true,
    })
  }
}
