import { and, desc, eq, inArray, isNull } from "drizzle-orm"

import db from "@/databases/pg/drizzle"
import { deviceAppStates, deviceMdmLinks, devices, mdmProviderProfiles } from "@/databases/pg/schema"
import logger from "@/lib/logger"

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

export async function _getDeviceManagementOverview() {
  try {
    const [profiles, links, deviceRows, stateRows] = await Promise.all([
      db.query.mdmProviderProfiles.findMany({
        where: isNull(mdmProviderProfiles.deletedAt),
        with: { hospital: true },
        orderBy: [desc(mdmProviderProfiles.updatedAt)],
      }),
      db.query.deviceMdmLinks.findMany({
        with: { profile: true },
        orderBy: [desc(deviceMdmLinks.updatedAt)],
      }),
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

    return { data: { profiles, links, devices: devicesWithManagement } }
  } catch (e: any) {
    logger.error("_getDeviceManagementOverview ERROR", e.message)
    return { data: { profiles: [], links: [], devices: [] }, errors: [e.message] }
  }
}
