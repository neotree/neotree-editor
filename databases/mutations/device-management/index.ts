import { and, eq } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import { deviceMdmLinks, mdmDeviceInventory, mdmProviderProfiles } from "@/databases/pg/schema"
import logger from "@/lib/logger"

type SaveMdmProviderProfileData = typeof mdmProviderProfiles.$inferInsert

export async function _saveMdmProviderProfile(data: SaveMdmProviderProfileData) {
  try {
    const payload = {
      ...data,
      provider: data.provider || "headwind",
      countryISO: data.countryISO?.trim?.() || "",
      baseUrl: data.baseUrl?.trim?.() || "",
      providerCapabilities: data.providerCapabilities || {},
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

export async function _updateMdmProviderConnectionStatus(
  profileId: string,
  status: {
    lastConnectionStatus: string
    lastConnectionError?: string | null
    lastConnectionCheckedAt?: Date
  },
) {
  try {
    if (!profileId) return { success: false, errors: ["MDM profile ID is required"] }

    const [updated] = await db
      .update(mdmProviderProfiles)
      .set({
        lastConnectionStatus: status.lastConnectionStatus,
        lastConnectionError: status.lastConnectionError || null,
        lastConnectionCheckedAt: status.lastConnectionCheckedAt || new Date(),
      })
      .where(eq(mdmProviderProfiles.profileId, profileId))
      .returning()

    if (!updated) return { success: false, errors: ["MDM profile not found"] }
    return { success: true, data: updated }
  } catch (e: any) {
    logger.error("_updateMdmProviderConnectionStatus ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}

export async function _linkDeviceToMdm(
  data: typeof deviceMdmLinks.$inferInsert & { linkId?: string },
) {
  try {
    if (!data.deviceId) return { success: false, errors: ["Device ID is required"] }
    if (!data.mdmDeviceId) return { success: false, errors: ["MDM device ID is required"] }

    const payload = {
      ...data,
      provider: data.provider || "headwind",
      enrollmentStatus: data.enrollmentStatus || "unknown",
      managementState: data.managementState || "unknown",
      deviceCapabilities: data.deviceCapabilities || {},
      payload: data.payload || {},
      lastSyncedAt: data.lastSyncedAt || new Date(),
    } satisfies typeof deviceMdmLinks.$inferInsert

    if (payload.linkId) {
      const [updated] = await db
        .update(deviceMdmLinks)
        .set({
          deviceId: payload.deviceId,
          provider: payload.provider,
          profileId: payload.profileId,
          mdmDeviceId: payload.mdmDeviceId,
          mdmConfigId: payload.mdmConfigId,
          mdmConfigName: payload.mdmConfigName,
          mdmGroupId: payload.mdmGroupId,
          mdmGroupName: payload.mdmGroupName,
          countryISO: payload.countryISO,
          hospitalId: payload.hospitalId,
          enrollmentStatus: payload.enrollmentStatus,
          managementState: payload.managementState,
          serialNumber: payload.serialNumber,
          androidVersion: payload.androidVersion,
          deviceCapabilities: payload.deviceCapabilities,
          lastMdmSeenAt: payload.lastMdmSeenAt,
          lastSyncedAt: payload.lastSyncedAt,
          lastSyncStatus: payload.lastSyncStatus,
          lastSyncError: payload.lastSyncError,
          linkSource: payload.linkSource,
          matchConfidence: payload.matchConfidence,
          matchReasons: payload.matchReasons,
          payload: payload.payload,
        })
        .where(eq(deviceMdmLinks.linkId, payload.linkId))
        .returning()

      if (!updated) return { success: false, errors: ["Device MDM link not found"] }
      return { success: true, data: updated }
    }

    const [inserted] = await db
      .insert(deviceMdmLinks)
      .values(payload)
      .onConflictDoUpdate({
        target: [deviceMdmLinks.deviceId, deviceMdmLinks.provider],
        set: {
          profileId: payload.profileId,
          mdmDeviceId: payload.mdmDeviceId,
          mdmConfigId: payload.mdmConfigId,
          mdmConfigName: payload.mdmConfigName,
          mdmGroupId: payload.mdmGroupId,
          mdmGroupName: payload.mdmGroupName,
          countryISO: payload.countryISO,
          hospitalId: payload.hospitalId,
          enrollmentStatus: payload.enrollmentStatus,
          managementState: payload.managementState,
          serialNumber: payload.serialNumber,
          androidVersion: payload.androidVersion,
          deviceCapabilities: payload.deviceCapabilities,
          lastMdmSeenAt: payload.lastMdmSeenAt,
          lastSyncedAt: payload.lastSyncedAt,
          lastSyncStatus: payload.lastSyncStatus,
          lastSyncError: payload.lastSyncError,
          linkSource: payload.linkSource,
          matchConfidence: payload.matchConfidence,
          matchReasons: payload.matchReasons,
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

export async function _upsertMdmDeviceInventory(
  data: typeof mdmDeviceInventory.$inferInsert,
) {
  try {
    if (!data.profileId) return { success: false, errors: ["MDM profile ID is required"] }
    if (!data.mdmDeviceId) return { success: false, errors: ["MDM device ID is required"] }

    const payload = {
      ...data,
      provider: data.provider || "headwind",
      matchStatus: data.matchStatus || "unmatched",
      matchConfidence: data.matchConfidence || 0,
      matchReasons: data.matchReasons || [],
      payload: data.payload || {},
      lastSeenAt: data.lastSeenAt || new Date(),
    } satisfies typeof mdmDeviceInventory.$inferInsert

    const [upserted] = await db
      .insert(mdmDeviceInventory)
      .values(payload)
      .onConflictDoUpdate({
        target: [mdmDeviceInventory.profileId, mdmDeviceInventory.mdmDeviceId],
        set: {
          suggestedDeviceId: payload.suggestedDeviceId,
          linkedDeviceId: payload.linkedDeviceId,
          countryISO: payload.countryISO,
          mdmConfigId: payload.mdmConfigId,
          mdmConfigName: payload.mdmConfigName,
          mdmGroupId: payload.mdmGroupId,
          mdmGroupName: payload.mdmGroupName,
          enrollmentStatus: payload.enrollmentStatus,
          managementState: payload.managementState,
          serialNumber: payload.serialNumber,
          androidVersion: payload.androidVersion,
          androidSdk: payload.androidSdk,
          manufacturer: payload.manufacturer,
          model: payload.model,
          deviceCapabilities: payload.deviceCapabilities,
          lastMdmSeenAt: payload.lastMdmSeenAt,
          matchStatus: payload.matchStatus,
          matchConfidence: payload.matchConfidence,
          matchReasons: payload.matchReasons,
          reviewNote: payload.reviewNote,
          ignoredAt: payload.ignoredAt,
          reviewedAt: payload.reviewedAt,
          reviewedByUserId: payload.reviewedByUserId,
          payload: payload.payload,
          lastSeenAt: payload.lastSeenAt,
        },
      })
      .returning()

    return { success: true, data: upserted }
  } catch (e: any) {
    logger.error("_upsertMdmDeviceInventory ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}

export async function _updateMdmDeviceInventoryReview(
  inventoryId: string,
  data: Partial<typeof mdmDeviceInventory.$inferInsert>,
) {
  try {
    if (!inventoryId) return { success: false, errors: ["MDM inventory ID is required"] }

    const [updated] = await db
      .update(mdmDeviceInventory)
      .set(data)
      .where(eq(mdmDeviceInventory.inventoryId, inventoryId))
      .returning()

    if (!updated) return { success: false, errors: ["MDM inventory row not found"] }
    return { success: true, data: updated }
  } catch (e: any) {
    logger.error("_updateMdmDeviceInventoryReview ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}

export async function _updateMdmProviderDeviceSyncStatus(
  profileId: string,
  status: {
    lastDeviceSyncStatus: string
    lastDeviceSyncError?: string | null
    lastDeviceSyncAt?: Date
    lastDeviceSyncSummary?: Record<string, any>
  },
) {
  try {
    if (!profileId) return { success: false, errors: ["MDM profile ID is required"] }
    const existing = await db.query.mdmProviderProfiles.findFirst({
      where: eq(mdmProviderProfiles.profileId, profileId),
      columns: { settings: true },
    })
    const settings = {
      ...((existing?.settings || {}) as Record<string, any>),
      lastDeviceSyncSummary: status.lastDeviceSyncSummary || null,
    }

    const [updated] = await db
      .update(mdmProviderProfiles)
      .set({
        lastDeviceSyncStatus: status.lastDeviceSyncStatus,
        lastDeviceSyncError: status.lastDeviceSyncError || null,
        lastDeviceSyncAt: status.lastDeviceSyncAt || new Date(),
        settings,
      })
      .where(eq(mdmProviderProfiles.profileId, profileId))
      .returning()

    if (!updated) return { success: false, errors: ["MDM profile not found"] }
    return { success: true, data: updated }
  } catch (e: any) {
    logger.error("_updateMdmProviderDeviceSyncStatus ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}

export async function _findMdmDeviceInventory(profileId: string, mdmDeviceId: string) {
  try {
    const [data] = await db
      .select()
      .from(mdmDeviceInventory)
      .where(and(eq(mdmDeviceInventory.profileId, profileId), eq(mdmDeviceInventory.mdmDeviceId, mdmDeviceId)))
      .limit(1)
    return { data: data || null }
  } catch (e: any) {
    logger.error("_findMdmDeviceInventory ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export async function _unlinkDeviceFromMdm(linkId: string) {
  try {
    if (!linkId) return { success: false, errors: ["Device MDM link ID is required"] }

    const [deleted] = await db
      .delete(deviceMdmLinks)
      .where(eq(deviceMdmLinks.linkId, linkId))
      .returning()

    if (!deleted) return { success: false, errors: ["Device MDM link not found"] }
    return { success: true, data: deleted }
  } catch (e: any) {
    logger.error("_unlinkDeviceFromMdm ERROR", e.message)
    return { success: false, errors: [e.message] }
  }
}
