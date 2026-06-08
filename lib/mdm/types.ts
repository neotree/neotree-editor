export type MdmProviderName = "headwind"

export type MdmDeviceStatus = {
  deviceId?: string | null
  mdmDeviceId?: string | null
  mdmConfigId?: string | null
  mdmConfigName?: string | null
  mdmGroupId?: string | null
  mdmGroupName?: string | null
  enrollmentStatus: "pending" | "enrolled" | "unenrolled" | "failed" | "unknown"
  managementState: "managed" | "unmanaged" | "unknown"
  serialNumber?: string | null
  androidVersion?: string | null
  androidSdk?: number | null
  deviceCapabilities?: Record<string, any>
  lastMdmSeenAt?: Date | string | null
  payload?: Record<string, any>
}

export type MdmConfiguration = {
  id: string
  name: string
  description?: string | null
  payload?: Record<string, any>
}

export type MdmActionResult = {
  success: boolean
  provider: MdmProviderName
  providerActionId?: string | null
  message?: string | null
  payload?: Record<string, any>
}

export type MdmProviderConfig = {
  profileId?: string | null
  provider: MdmProviderName
  baseUrl: string
  apiKey?: string | null
  username?: string | null
  password?: string | null
  settings?: Record<string, any>
}

export interface MdmProvider {
  readonly name: MdmProviderName
  listConfigurations(): Promise<MdmConfiguration[]>
  getDeviceStatus(mdmDeviceId: string): Promise<MdmDeviceStatus>
  syncDevices(): Promise<MdmDeviceStatus[]>
  lockDevice(mdmDeviceId: string, reason?: string): Promise<MdmActionResult>
  wipeDevice(mdmDeviceId: string, reason?: string): Promise<MdmActionResult>
  assignKioskPolicy(mdmDeviceId: string, policyId: string): Promise<MdmActionResult>
  pushApk(mdmDeviceId: string, apk: { apkReleaseId: string; downloadUrl: string }): Promise<MdmActionResult>
}
