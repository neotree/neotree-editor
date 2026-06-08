import crypto from "crypto"
import type { MdmActionResult, MdmConfiguration, MdmDeviceStatus, MdmProvider, MdmProviderConfig } from "./types"

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

  private async authenticate() {
    if (this.token) return this.token
    if (!this.config.username || !this.config.password) {
      throw new Error("Headwind service username and password are required")
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
    return token
  }

  private async requestJson(path: string, init?: RequestInit) {
    await this.authenticate()
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(init?.headers || {}),
      },
      cache: "no-store",
    })
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

  private mapDeviceStatus(item: any): MdmDeviceStatus {
    return {
      mdmDeviceId: item?.id != null ? `${item.id}` : item?.deviceId || item?.number || item?.imei || null,
      mdmConfigId: item?.configurationId != null ? `${item.configurationId}` : item?.configId != null ? `${item.configId}` : null,
      mdmConfigName: item?.configurationName || item?.configName || item?.configuration?.name || null,
      mdmGroupId: item?.groupId != null ? `${item.groupId}` : item?.deviceGroupId != null ? `${item.deviceGroupId}` : null,
      mdmGroupName: item?.groupName || item?.deviceGroupName || item?.group?.name || null,
      enrollmentStatus: "enrolled",
      managementState: "managed",
      serialNumber: item?.serialNumber || item?.serial || item?.imei || null,
      androidVersion: item?.androidVersion || item?.sdkVersion || item?.info?.androidVersion || null,
      androidSdk: item?.androidSdk || item?.sdkInt || item?.info?.androidSdk || null,
      lastMdmSeenAt: item?.lastUpdate || item?.lastSeen || item?.lastLogin || null,
      payload: item || {},
    }
  }

  async listConfigurations(): Promise<MdmConfiguration[]> {
    const configuredPath = this.config.settings?.configurationsPath
    const attempts = configuredPath
      ? [{ path: configuredPath, init: { method: "GET" } }]
      : [
          { path: "/rest/private/configurations/list", init: { method: "GET" } },
          { path: "/rest/private/configurations/search", init: { method: "GET" } },
          { path: "/rest/private/configurations/search/", init: { method: "GET" } },
          { path: "/rest/private/configurations/search/%20", init: { method: "GET" } },
          {
            path: "/rest/private/configurations/search",
            init: {
              method: "POST",
              body: JSON.stringify({ pageSize: 200, pageNum: 1 }),
            },
          },
          { path: "/rest/private/configurations", init: { method: "GET" } },
        ]

    const errors: string[] = []
    let payload: any = null

    for (const attempt of attempts) {
      try {
        payload = await this.requestJson(attempt.path, attempt.init)
        break
      } catch (e: any) {
        errors.push(`${attempt.init.method} ${attempt.path}: ${e.message}`)
      }
    }

    if (!payload) {
      throw new Error(`Headwind configurations lookup failed. Tried ${errors.join("; ")}`)
    }

    const configurations = this.extractArray(payload, ["configurations", "items", "results", "data"])

    return configurations
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
    const attempts = configuredPath
      ? [{ path: configuredPath, init: { method: "POST", body: JSON.stringify({ pageSize: 200, pageNum: 1 }) } }]
      : [
          {
            path: "/rest/private/devices/search",
            init: {
              method: "POST",
              body: JSON.stringify({ pageSize: 200, pageNum: 1 }),
            },
          },
          { path: "/rest/private/devices/search", init: { method: "GET" } },
          { path: "/rest/private/devices", init: { method: "GET" } },
        ]

    const errors: string[] = []
    let payload: any = null

    for (const attempt of attempts) {
      try {
        payload = await this.requestJson(attempt.path, attempt.init)
        break
      } catch (e: any) {
        errors.push(`${attempt.init.method} ${attempt.path}: ${e.message}`)
      }
    }

    if (!payload) {
      throw new Error(`Headwind device lookup failed. Tried ${errors.join("; ")}`)
    }

    const devices = this.extractArray(payload, ["devices", "items", "results", "data"])
    return devices.map((item: any) => this.mapDeviceStatus(item))
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
