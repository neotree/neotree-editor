import type { MdmDeviceStatus, MdmProvider, MdmProviderConfig } from "./types"

export class HeadwindMdmProvider implements MdmProvider {
  readonly name = "headwind" as const

  constructor(private readonly config: MdmProviderConfig) {}

  private get baseUrl() {
    return this.config.baseUrl.replace(/\/+$/, "")
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
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

    const path = this.config.settings?.deviceStatusPath || `/rest/private/devices/${encodeURIComponent(mdmDeviceId)}`
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers, cache: "no-store" })
    if (!res.ok) throw new Error(`Headwind device status failed: ${res.status}`)
    const payload = await res.json()

    return {
      mdmDeviceId,
      mdmConfigId: payload?.configurationId || payload?.configId || null,
      enrollmentStatus: "enrolled",
      managementState: "managed",
      serialNumber: payload?.serialNumber || payload?.serial || null,
      androidVersion: payload?.androidVersion || payload?.sdkVersion || null,
      lastMdmSeenAt: payload?.lastUpdate || payload?.lastSeen || null,
      payload,
    }
  }

  async syncDevices(): Promise<MdmDeviceStatus[]> {
    const path = this.config.settings?.devicesPath || "/rest/private/devices"
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers, cache: "no-store" })
    if (!res.ok) throw new Error(`Headwind device sync failed: ${res.status}`)
    const payload = await res.json()
    const devices = Array.isArray(payload) ? payload : payload?.data || payload?.devices || []

    return devices.map((item: any) => ({
      mdmDeviceId: item?.id ? `${item.id}` : item?.deviceId || item?.number || null,
      mdmConfigId: item?.configurationId || item?.configId || null,
      enrollmentStatus: "enrolled",
      managementState: "managed",
      serialNumber: item?.serialNumber || item?.serial || null,
      androidVersion: item?.androidVersion || item?.sdkVersion || null,
      lastMdmSeenAt: item?.lastUpdate || item?.lastSeen || null,
      payload: item || {},
    }))
  }
}
