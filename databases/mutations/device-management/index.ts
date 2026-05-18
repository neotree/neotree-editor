import { eq } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import { deviceMdmLinks, mdmProviderProfiles } from "@/databases/pg/schema"
import logger from "@/lib/logger"

type SaveMdmProviderProfileData = typeof mdmProviderProfiles.$inferInsert

export async function _saveMdmProviderProfile(data: SaveMdmProviderProfileData) {
  try {
    const payload = {
      ...data,
      provider: data.provider || "headwind",
      countryISO: data.countryISO?.trim?.() || "",
      baseUrl: data.baseUrl?.trim?.() || "",
      settings: data.settings || {},
    } satisfies SaveMdmProviderProfileData

    if (!payload.name?.trim()) return { success: false, errors: ["Name is required"] }
    if (!payload.countryISO) return { success: false, errors: ["Country ISO is required"] }
    if (!payload.baseUrl) return { success: false, errors: ["MDM base URL is required"] }

    if (payload.profileId) {
      const [updated] = await db
        .update(mdmProviderProfiles)
        .set(payload)
        .where(eq(mdmProviderProfiles.profileId, payload.profileId))
        .returning()
      return { success: true, data: updated }
    }

    const [inserted] = await db.insert(mdmProviderProfiles).values(payload).returning()
    return { success: true, data: inserted }
  } catch (e: any) {
    logger.error("_saveMdmProviderProfile ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}

export async function _linkDeviceToMdm(data: typeof deviceMdmLinks.$inferInsert) {
  try {
    if (!data.deviceId) return { success: false, errors: ["Device ID is required"] }
    if (!data.mdmDeviceId) return { success: false, errors: ["MDM device ID is required"] }

    const payload = {
      ...data,
      provider: data.provider || "headwind",
      enrollmentStatus: data.enrollmentStatus || "unknown",
      managementState: data.managementState || "unknown",
      payload: data.payload || {},
      lastSyncedAt: data.lastSyncedAt || new Date(),
    } satisfies typeof deviceMdmLinks.$inferInsert

    const [inserted] = await db
      .insert(deviceMdmLinks)
      .values(payload)
      .onConflictDoUpdate({
        target: [deviceMdmLinks.deviceId, deviceMdmLinks.provider],
        set: {
          profileId: payload.profileId,
          mdmDeviceId: payload.mdmDeviceId,
          mdmConfigId: payload.mdmConfigId,
          enrollmentStatus: payload.enrollmentStatus,
          managementState: payload.managementState,
          serialNumber: payload.serialNumber,
          androidVersion: payload.androidVersion,
          lastMdmSeenAt: payload.lastMdmSeenAt,
          lastSyncedAt: payload.lastSyncedAt,
          payload: payload.payload,
        },
      })
      .returning()

    return { success: true, data: inserted }
  } catch (e: any) {
    logger.error("_linkDeviceToMdm ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}
