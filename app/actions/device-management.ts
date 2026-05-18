"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import logger from "@/lib/logger"
import { isAllowed } from "./is-allowed"
import {
  _getDeviceMdmLink,
  _getDeviceManagementOverview,
  _getDeviceMdmLinks,
  _getMdmProviderProfile,
  _getMdmProviderProfiles,
} from "@/databases/queries/device-management"
import {
  _linkDeviceToMdm,
  _saveMdmProviderProfile,
} from "@/databases/mutations/device-management"

export const getDeviceManagementOverview: typeof _getDeviceManagementOverview = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceManagementOverview(...args)
  } catch (e: any) {
    logger.error("getDeviceManagementOverview ERROR", e.message)
    return { data: { profiles: [], links: [], devices: [] }, errors: [e.message] }
  }
}

export const getMdmProviderProfiles: typeof _getMdmProviderProfiles = async (...args) => {
  try {
    await isAllowed()
    return await _getMdmProviderProfiles(...args)
  } catch (e: any) {
    logger.error("getMdmProviderProfiles ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export const getMdmProviderProfile: typeof _getMdmProviderProfile = async (...args) => {
  try {
    await isAllowed()
    return await _getMdmProviderProfile(...args)
  } catch (e: any) {
    logger.error("getMdmProviderProfile ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export const getDeviceMdmLinks: typeof _getDeviceMdmLinks = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceMdmLinks(...args)
  } catch (e: any) {
    logger.error("getDeviceMdmLinks ERROR", e.message)
    return { data: [], errors: [e.message] }
  }
}

export const getDeviceMdmLink: typeof _getDeviceMdmLink = async (...args) => {
  try {
    await isAllowed()
    return await _getDeviceMdmLink(...args)
  } catch (e: any) {
    logger.error("getDeviceMdmLink ERROR", e.message)
    return { data: null, errors: [e.message] }
  }
}

export async function saveMdmProviderProfileFromForm(formData: FormData) {
  let shouldRedirect = false

  try {
    await isAllowed()
    const settingsRaw = `${formData.get("settings") || ""}`.trim()
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {}

    const result = await _saveMdmProviderProfile({
      profileId: `${formData.get("profileId") || ""}` || undefined,
      name: `${formData.get("name") || ""}`,
      provider: "headwind",
      countryISO: `${formData.get("countryISO") || ""}`,
      hospitalId: `${formData.get("hospitalId") || ""}` || null,
      baseUrl: `${formData.get("baseUrl") || ""}`,
      apiKey: `${formData.get("apiKey") || ""}` || null,
      defaultKioskPolicy: `${formData.get("defaultKioskPolicy") || ""}` || null,
      settings,
      isEnabled: formData.get("isEnabled") !== "off",
    })

    if (result.success) {
      revalidatePath("/device-management")
      shouldRedirect = true
    }
  } catch (e: any) {
    logger.error("saveMdmProviderProfileFromForm ERROR", e.message)
  }

  if (shouldRedirect) redirect("/device-management")
}

export async function linkDeviceToMdmFromForm(formData: FormData) {
  let shouldRedirect = false

  try {
    await isAllowed()
    const result = await _linkDeviceToMdm({
      deviceId: `${formData.get("deviceId") || ""}`,
      provider: "headwind",
      profileId: `${formData.get("profileId") || ""}` || null,
      mdmDeviceId: `${formData.get("mdmDeviceId") || ""}`,
      mdmConfigId: `${formData.get("mdmConfigId") || ""}` || null,
      enrollmentStatus: "enrolled",
      managementState: "managed",
      serialNumber: `${formData.get("serialNumber") || ""}` || null,
      androidVersion: `${formData.get("androidVersion") || ""}` || null,
      lastSyncedAt: new Date(),
    })

    if (result.success) {
      revalidatePath("/device-management")
      shouldRedirect = true
    }
  } catch (e: any) {
    logger.error("linkDeviceToMdmFromForm ERROR", e.message)
  }

  if (shouldRedirect) redirect("/device-management")
}
