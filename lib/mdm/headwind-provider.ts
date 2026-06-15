import crypto from "crypto"
import type { MdmActionResult, MdmConfiguration, MdmDeviceStatus, MdmProvider, MdmProviderConfig } from "./types"

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

  constructor(private readonly config: MdmProviderConfig) {}

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

  private mapDeviceStatus(item: any): MdmDeviceStatus {
    const lastSeenRaw = item?.lastUpdate || item?.lastSeen || item?.lastLogin || null
    const lastSeenMs = lastSeenRaw ? new Date(lastSeenRaw).getTime() : NaN
    const { enrollmentStatus, managementState } = this.deriveDeviceState(item, lastSeenMs)
    const info = item?.info || {}

    return {
      deviceId: item?.deviceId || item?.neotreeDeviceId || item?.customDeviceId || info?.deviceId || null,
      mdmDeviceId: item?.id != null ? `${item.id}` : item?.deviceId || item?.number || item?.imei || null,
      mdmConfigId: item?.configurationId != null ? `${item.configurationId}` : item?.configId != null ? `${item.configId}` : null,
      mdmConfigName: item?.configurationName || item?.configName || item?.configuration?.name || null,
      mdmGroupId: item?.groupId != null ? `${item.groupId}` : item?.deviceGroupId != null ? `${item.deviceGroupId}` : null,
      mdmGroupName: item?.groupName || item?.deviceGroupName || item?.group?.name || null,
      enrollmentStatus,
      managementState,
      serialNumber: item?.serialNumber || item?.serial || item?.androidSerial || info?.serialNumber || info?.serial || item?.imei || null,
      androidVersion: item?.androidVersion || item?.sdkVersion || info?.androidVersion || null,
      androidSdk: item?.androidSdk || item?.sdkInt || info?.androidSdk || null,
      deviceCapabilities: {
        identifiers: {
          number: item?.number || null,
          name: item?.name || null,
          deviceId: item?.deviceId || null,
          neotreeDeviceId: item?.neotreeDeviceId || item?.customDeviceId || null,
          serialNumber: item?.serialNumber || item?.serial || info?.serialNumber || info?.serial || null,
          imei: item?.imei || info?.imei || null,
        },
      },
      lastMdmSeenAt: lastSeenRaw,
      payload: item || {},
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
    await this.authenticate()
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
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ mdmDeviceId, ...body }),
      cache: "no-store",
    })
    const payload = await res.json().catch(() => ({}))

    return {
      success: res.ok,
      provider: this.name,
      providerActionId: payload?.id || payload?.actionId || null,
      message: res.ok ? payload?.message || null : payload?.message || `Headwind ${action} failed: ${res.status}`,
      payload,
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

    await this.authenticate()
    const path = this.config.settings?.deviceStatusPath || `/rest/private/devices/${encodeURIComponent(mdmDeviceId)}`
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers, cache: "no-store" })
    if (!res.ok) throw new Error(`Headwind device status failed: ${res.status}`)
    const payload = await res.json()

    return {
      ...this.mapDeviceStatus(payload),
      mdmDeviceId,
    }
  }

  async syncDevices(): Promise<MdmDeviceStatus[]> {
    const configuredPath = this.config.settings?.devicesPath
    // Each strategy describes how to request a single page; `paged` ones get
    // looped until exhausted (#5), non-paged GETs are single-shot fallbacks.
    const strategies: { path: string; method: string; paged: boolean }[] = configuredPath
      ? [{ path: configuredPath, method: "POST", paged: true }]
      : [
          { path: "/rest/private/devices/search", method: "POST", paged: true },
          { path: "/rest/private/devices/search", method: "GET", paged: false },
          { path: "/rest/private/devices", method: "GET", paged: false },
        ]

    const errors: string[] = []

    for (const strategy of strategies) {
      try {
        const collected: any[] = []
        for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum += 1) {
          const init: RequestInit =
            strategy.method === "POST"
              ? { method: "POST", body: JSON.stringify({ pageSize: PAGE_SIZE, pageNum }) }
              : { method: "GET" }
          const payload = await this.requestJson(strategy.path, init)
          const page = this.extractArray(payload, ["devices", "items", "results", "data"])
          collected.push(...page)
          // Stop when the server can't page, or returned a short/empty final page.
          if (!strategy.paged || page.length < PAGE_SIZE) break
        }
        return collected.map((item: any) => this.mapDeviceStatus(item))
      } catch (e: any) {
        errors.push(`${strategy.method} ${strategy.path}: ${e.message}`)
      }
    }

    throw new Error(`Headwind device lookup failed. Tried ${errors.join("; ")}`)
  }

  async lockDevice(mdmDeviceId: string, reason?: string): Promise<MdmActionResult> {
    return this.postAction("lockDevice", mdmDeviceId, { reason: reason || null })
  }

  async wipeDevice(mdmDeviceId: string, reason?: string): Promise<MdmActionResult> {
    return this.postAction("wipeDevice", mdmDeviceId, { reason: reason || null })
  }

  async assignKioskPolicy(mdmDeviceId: string, policyId: string): Promise<MdmActionResult> {
    return this.postAction("assignKioskPolicy", mdmDeviceId, { policyId })
  }

  async pushApk(mdmDeviceId: string, apk: { apkReleaseId: string; downloadUrl: string }): Promise<MdmActionResult> {
    return this.postAction("pushApk", mdmDeviceId, apk)
  }
}
