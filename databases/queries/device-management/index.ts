import { and, desc, eq, inArray, isNull } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import { deviceAppStates, deviceMdmLinks, devices, mdmDeviceInventory, mdmProviderProfiles } from "@/databases/pg/schema"
import logger from "@/lib/logger"

type MdmInventoryRow = typeof mdmDeviceInventory.$inferSelect

async function hydrateInventoryRows(rows: MdmInventoryRow[]) {
  const profileIds = Array.from(new Set(rows.map((row) => row.profileId).filter(Boolean)))
  const deviceIds = [
    ...Array.from(new Set(
      rows
        .flatMap((row) => [row.suggestedDeviceId, row.linkedDeviceId])
        .filter((value): value is string => Boolean(value)),
    )),
  ]

  const [profiles, deviceRows] = await Promise.all([
    profileIds.length
      ? db.query.mdmProviderProfiles.findMany({
          where: inArray(mdmProviderProfiles.profileId, profileIds),
          with: { hospital: true },
        })
      : Promise.resolve([]),
    deviceIds.length
      ? db.query.devices.findMany({
          where: inArray(devices.deviceId, deviceIds),
        })
      : Promise.resolve([]),
  ])

  const profileById = new Map(profiles.map((profile) => [profile.profileId, profile]))
  const deviceById = new Map(deviceRows.map((device) => [device.deviceId, device]))

  return rows.map((row) => ({
    ...row,
    profile: profileById.get(row.profileId) || null,
    suggestedDevice: row.suggestedDeviceId ? deviceById.get(row.suggestedDeviceId) || null : null,
    linkedDevice: row.linkedDeviceId ? deviceById.get(row.linkedDeviceId) || null : null,
  }))
}

export type GetMdmProviderProfilesParams = {
  countryISO?: string
  includeDisabled?: boolean
  profileId?: string
}

export async function _getMdmProviderProfiles(params?: GetMdmProviderProfilesParams) {
  try {
    const where = [
      ...(params?.profileId ? [eq(mdmProviderProfiles.profileId, params.profileId)] : []),
      ...(params?.countryISO ? [eq(mdmProviderProfiles.countryISO, params.countryISO)] : []),
      ...(params?.includeDisabled ? [] : [eq(mdmProviderProfiles.isEnabled, true)]),
      isNull(mdmProviderProfiles.deletedAt),
    ]

    const data = await db.query.mdmProviderProfiles.findMany({
      where: and(...where),
      with: { hospital: true },
      orderBy: [desc(mdmProviderProfiles.updatedAt)],
    })

    return { data }
  } catch (e: any) {
    logger.error("_getMdmProviderProfiles ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export async function _getMdmProviderProfile(profileId: string) {
  try {
    const data = await db.query.mdmProviderProfiles.findFirst({
      where: and(eq(mdmProviderProfiles.profileId, profileId), isNull(mdmProviderProfiles.deletedAt)),
      with: { hospital: true },
    })

    return { data: data || null }
  } catch (e: any) {
    logger.error("_getMdmProviderProfile ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export type GetDeviceMdmLinksParams = {
  deviceIds?: string[]
  profileId?: string
  linkId?: string
}

export async function _getDeviceMdmLinks(params?: GetDeviceMdmLinksParams) {
  try {
    const where = [
      ...(params?.linkId ? [eq(deviceMdmLinks.linkId, params.linkId)] : []),
      ...(!params?.deviceIds?.length ? [] : [inArray(deviceMdmLinks.deviceId, params.deviceIds)]),
      ...(params?.profileId ? [eq(deviceMdmLinks.profileId, params.profileId)] : []),
    ]

    const data = await db.query.deviceMdmLinks.findMany({
      where: where.length ? and(...where) : undefined,
      with: { profile: true },
      orderBy: [desc(deviceMdmLinks.updatedAt)],
    })

    return { data }
  } catch (e: any) {
    logger.error("_getDeviceMdmLinks ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export async function _getDeviceMdmLink(linkId: string) {
  try {
    const data = await db.query.deviceMdmLinks.findFirst({
      where: eq(deviceMdmLinks.linkId, linkId),
      with: { profile: true },
    })

    return { data: data || null }
  } catch (e: any) {
    logger.error("_getDeviceMdmLink ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export async function _getMdmDeviceInventory(params?: {
  profileId?: string
  matchStatus?: "unmatched" | "auto_linked" | "manually_linked" | "needs_review" | "conflict" | "ignored"
  includeIgnored?: boolean
}) {
  try {
    const where = [
      ...(params?.profileId ? [eq(mdmDeviceInventory.profileId, params.profileId)] : []),
      ...(params?.matchStatus ? [eq(mdmDeviceInventory.matchStatus, params.matchStatus)] : []),
      ...(params?.includeIgnored ? [] : []),
    ]

    const rows = await db
      .select()
      .from(mdmDeviceInventory)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(mdmDeviceInventory.updatedAt))
    const data = await hydrateInventoryRows(rows)

    return { data }
  } catch (e: any) {
    logger.error("_getMdmDeviceInventory ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export async function _getMdmDeviceInventoryById(inventoryId: string) {
  try {
    const [row] = await db
      .select()
      .from(mdmDeviceInventory)
      .where(eq(mdmDeviceInventory.inventoryId, inventoryId))
      .limit(1)
    const [data] = row ? await hydrateInventoryRows([row]) : []

    return { data: data || null }
  } catch (e: any) {
    logger.error("_getMdmDeviceInventoryById ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export async function _getDeviceManagementOverview() {
  try {
    const [profiles, links, inventory, deviceRows, stateRows] = await Promise.all([
      db.query.mdmProviderProfiles.findMany({
        where: isNull(mdmProviderProfiles.deletedAt),
        with: { hospital: true },
        orderBy: [desc(mdmProviderProfiles.updatedAt)],
      }),
      db.query.deviceMdmLinks.findMany({
        with: { profile: true },
        orderBy: [desc(deviceMdmLinks.updatedAt)],
      }),
      db.select().from(mdmDeviceInventory).orderBy(desc(mdmDeviceInventory.updatedAt)),
      db.query.devices.findMany({ orderBy: [desc(devices.updatedAt)] }),
      db.query.deviceAppStates.findMany({ orderBy: [desc(deviceAppStates.lastSeenAt)] }),
    ])

    const appStateByDevice = new Map(stateRows.map((state) => [state.deviceId, state]))
    const linkByDevice = new Map(links.map((link) => [link.deviceId, link]))

    const devicesWithManagement = deviceRows.map((device) => ({
      device,
      appState: appStateByDevice.get(device.deviceId) || null,
      mdmLink: linkByDevice.get(device.deviceId) || null,
    }))

    const hydratedInventory = await hydrateInventoryRows(inventory)

    return { data: { profiles, links, inventory: hydratedInventory, devices: devicesWithManagement } }
  } catch (e: any) {
    logger.error("_getDeviceManagementOverview ERROR", e.message)
    return { data: { profiles: [], links: [], inventory: [], devices: [] }, errors: [e.message] }
  }
}
