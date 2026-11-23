"use client"

import { useMemo, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Tabs } from "@/components/tabs"
import { syncAllEnabledMdmProfilesReport } from "@/app/actions/device-management"
import type { _getDeviceManagementOverview } from "@/databases/queries/device-management"
import { Loader2Icon, PlusIcon, RefreshCwIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { DeviceManagementRowActions } from "./device-management-row-actions"
import { MdmInventoryReviewActions } from "./mdm-inventory-review-actions"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { isHeadwindApplicationRow } from "@/lib/mdm/headwind-shape"

type Overview = Awaited<ReturnType<typeof _getDeviceManagementOverview>>["data"]
type InventoryItem = Overview["inventory"][number]
type ConsolidatedInventoryItem = {
  key: string
  item: InventoryItem
  profileNames: string[]
  configurationNames: string[]
  rowCount: number
  lastSeenAt?: Date | string | null
  isStale: boolean
}

const STALE_UNMATCHED_DAYS = 30
const STALE_UNMATCHED_MS = STALE_UNMATCHED_DAYS * 24 * 60 * 60 * 1000

const fmt = (value?: Date | string | null) => value ? new Date(value).toLocaleString() : "Never"

function managementBadgeVariant(state?: string | null) {
  if (state === "managed") return "default" as const
  if (state === "unmanaged") return "secondary" as const
  return "outline" as const
}

function enrollmentBadgeVariant(status?: string | null) {
  if (status === "enrolled") return "default" as const
  if (status === "failed") return "destructive" as const
  return "secondary" as const
}

function connectionBadgeVariant(status?: string | null) {
  if (status === "connected") return "default" as const
  if (status === "failed") return "destructive" as const
  return "secondary" as const
}

function authMode(profile: Overview["profiles"][number]) {
  const settings = (profile.settings || {}) as Record<string, any>
  const serviceAuth = (settings.serviceAuth || {}) as Record<string, any>
  if (serviceAuth.username) return `Service user: ${serviceAuth.username}`
  if (profile.apiKey) return "Token override"
  return "Not configured"
}

function syncSummary(profile: Overview["profiles"][number]) {
  const settings = (profile.settings || {}) as Record<string, any>
  return (settings.lastDeviceSyncSummary || {}) as Record<string, any>
}

function profileReviewThreshold(profile: Overview["profiles"][number]) {
  const settings = (profile.settings || {}) as Record<string, any>
  const value = Number(settings.reviewMinConfidence || 50)
  return Number.isFinite(value) ? value : 50
}

function formatSyncSummary(profile: Overview["profiles"][number]) {
  const summary = syncSummary(profile)
  if (!profile.lastDeviceSyncAt) return "No sync yet"
  if (profile.lastDeviceSyncStatus === "failed") return summary.error || profile.lastDeviceSyncError || "Sync failed"
  const diagnostics = summary.diagnostics as { selectedMethod?: string | null; selectedPath?: string | null; attempts?: Array<{ method: string; path: string; count: number; error?: string | null }> } | null
  const selected = diagnostics?.selectedPath
    ? `${diagnostics.selectedMethod} ${diagnostics.selectedPath}`
    : diagnostics?.attempts?.length
      ? diagnostics.attempts.map((attempt) => `${attempt.method} ${attempt.path}: ${attempt.error || `${attempt.count} found`}`).join("; ")
      : ""
  const scope = summary.rawRemoteDevices && summary.rawRemoteDevices !== summary.remoteDevices
    ? `${summary.remoteDevices || 0} in scope from ${summary.rawRemoteDevices} scanned`
    : `${summary.remoteDevices || 0} scanned`
  return [
    scope,
    `${summary.autoLinked || 0} auto-linked`,
    `${summary.needsReview || 0} review`,
    `${summary.unmatched || 0} unmatched`,
    `${summary.conflicts || 0} conflicts`,
    `${summary.identityStamped || 0} stamped`,
    summary.identityStampFailed ? `${summary.identityStampFailed} stamp failed` : "",
    summary.ignoredLegacyApplicationRows ? `${summary.ignoredLegacyApplicationRows} legacy app rows ignored` : "",
    selected,
  ].filter(Boolean).join(" | ")
}

function matchBadgeVariant(status?: string | null) {
  if (status === "auto_linked" || status === "manually_linked") return "default" as const
  if (status === "conflict") return "destructive" as const
  if (status === "ignored") return "secondary" as const
  return "outline" as const
}

function reviewEvidence(item: Overview["inventory"][number]) {
  const reasons = item.matchReasons?.length ? item.matchReasons.join(", ") : "No strong identifier matched"
  const confidence = item.matchConfidence || 0
  if (item.matchStatus === "conflict") return `${reasons}. Multiple devices had the same score.`
  if (confidence >= 95) return reasons
  if (confidence > 0) return `${reasons}. Below auto-link threshold.`
  return "No Headwind device number or NeoTree identity stamp matched."
}

function unmatchedEvidence(item: Overview["inventory"][number]) {
  if (item.matchConfidence > 0 && item.matchReasons?.length) {
    return `${item.matchReasons.join(", ")}. Below review threshold.`
  }
  return "No credible NeoTree device evidence was found."
}

function staleUnmatchedEvidence(item: Overview["inventory"][number]) {
  return `${unmatchedEvidence(item)} No evidence has appeared for ${STALE_UNMATCHED_DAYS}+ days, so it is kept out of the active unmatched view.`
}

function normalizeInventoryKey(value?: string | null) {
  return `${value || ""}`.trim().toLowerCase()
}

function inventoryIdentifiers(item: InventoryItem) {
  const payload = (item.payload || {}) as Record<string, any>
  const capabilities = (item.deviceCapabilities || {}) as Record<string, any>
  const identifiers = (capabilities.identifiers || payload.identifiers || payload.deviceCapabilities?.identifiers || {}) as Record<string, any>
  const info = (payload.info || {}) as Record<string, any>

  return {
    displayName: identifiers.displayName || identifiers.number || identifiers.name || payload.number || payload.name || payload.deviceName || item.serialNumber || item.mdmDeviceId,
    number: identifiers.number || payload.number,
    serialNumber: item.serialNumber || identifiers.serialNumber || payload.serialNumber || payload.serial || info.serialNumber,
  }
}

function remoteDeviceDisplay(item: InventoryItem) {
  return inventoryIdentifiers(item).displayName || item.mdmDeviceId
}

function configurationDisplay(name?: string | null, id?: string | null) {
  if (name && name !== id) return name
  if (id) return `Unknown configuration (ID ${id})`
  return ""
}

function remoteInventoryKey(item: InventoryItem) {
  const identifiers = inventoryIdentifiers(item)
  const values = [
    identifiers.serialNumber,
    identifiers.number,
    item.mdmDeviceId,
  ]
    .map(normalizeInventoryKey)
    .filter(Boolean)

  return values[0] || item.inventoryId
}

function latestDate(...values: Array<Date | string | null | undefined>) {
  const timestamps = values
    .map((value) => value ? new Date(value).getTime() : 0)
    .filter((value) => Number.isFinite(value) && value > 0)
  return timestamps.length ? new Date(Math.max(...timestamps)) : null
}

function joinUnique(values: string[]) {
  const unique = Array.from(new Set(values.filter(Boolean)))
  return unique.join(", ")
}

function consolidateUnmatchedInventory(items: InventoryItem[]) {
  const grouped = new Map<string, ConsolidatedInventoryItem>()

  for (const item of items) {
    const key = remoteInventoryKey(item)
    const existing = grouped.get(key)
    const lastSeenAt = latestDate(item.lastMdmSeenAt, item.lastSeenAt)
    const profileName = item.profile?.name || ""
    const configurationName = configurationDisplay(item.mdmConfigName, item.mdmConfigId)

    const isStale = Boolean(
      lastSeenAt &&
      Date.now() - lastSeenAt.getTime() > STALE_UNMATCHED_MS &&
      !item.matchConfidence &&
      !item.matchReasons?.length,
    )

    if (!existing) {
      grouped.set(key, {
        key,
        item,
        profileNames: profileName ? [profileName] : [],
        configurationNames: configurationName ? [configurationName] : [],
        rowCount: 1,
        lastSeenAt,
        isStale,
      })
      continue
    }

    existing.rowCount += 1
    if (profileName) existing.profileNames.push(profileName)
    if (configurationName) existing.configurationNames.push(configurationName)

    const existingTime = latestDate(existing.lastSeenAt)?.getTime() || 0
    const itemTime = lastSeenAt?.getTime() || 0
    if (itemTime >= existingTime) {
      existing.item = item
      existing.lastSeenAt = lastSeenAt
    }
    existing.isStale = existing.isStale && isStale
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const aTime = latestDate(a.lastSeenAt)?.getTime() || 0
    const bTime = latestDate(b.lastSeenAt)?.getTime() || 0
    return bTime - aTime
  })
}

function escapeHtml(value: unknown) {
  return `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatResultLine(result: any) {
  if (!result?.success) {
    return `<li><strong>${escapeHtml(result?.name || "Profile")}</strong>: failed - ${escapeHtml(result?.error || "Could not sync")}</li>`
  }
  const scanned = result.rawRemoteDevices && result.rawRemoteDevices !== result.remoteDevices
    ? `${result.remoteDevices || 0} in scope from ${result.rawRemoteDevices} scanned`
    : `${result.remoteDevices || 0} scanned`
  const ignored = result.ignoredLegacyApplicationRows ? `, ${result.ignoredLegacyApplicationRows} legacy application rows ignored` : ""
  return `<li><strong>${escapeHtml(result.name)}</strong>: ${scanned}, ${result.autoLinked || 0} auto-linked, ${result.needsReview || 0} review, ${result.unmatched || 0} unmatched, ${result.conflicts || 0} conflicts${ignored}.</li>`
}

function isApplicationInventoryItem(item: InventoryItem) {
  return isHeadwindApplicationRow(item.payload)
}

export function DeviceManagementPanel({ overview }: { overview: Overview }) {
  const router = useRouter()
  const { alert } = useAlertModal()
  const [syncAllPending, startSyncAllTransition] = useTransition()
  const { profiles, devices, inventory } = overview
  // Capabilities by profile so each device row only offers the remote commands its
  // MDM profile enables (the server enforces the same gate authoritatively).
  const capabilitiesByProfileId = new Map(
    profiles.map((profile) => [profile.profileId, (profile.providerCapabilities || {}) as Record<string, any>]),
  )
  const searchParams = useSearchParams()
  const section = searchParams.get("section")
  const activeSection = section === "devices" || section === "review" || section === "unmatched" || section === "stale" ? section : "profiles"
  const connectedProfiles = profiles.filter((profile) => profile.lastConnectionStatus === "connected").length
  const failedProfiles = profiles.filter((profile) => profile.lastConnectionStatus === "failed").length
  const legacyApplicationInventory = inventory.filter((item) => item.matchStatus !== "ignored" && isApplicationInventoryItem(item))
  const activeInventory = inventory.filter((item) => item.matchStatus !== "ignored" && !isApplicationInventoryItem(item))
  const remoteMdmDevices = consolidateUnmatchedInventory(activeInventory).length
  const managedDevices = devices.filter((row) => row.mdmLink?.managementState === "managed").length
  const reviewItems = activeInventory.filter((item) => item.matchStatus === "needs_review" || item.matchStatus === "conflict")
  const unmatchedItems = activeInventory.filter((item) => item.matchStatus === "unmatched")
  const consolidatedUnmatchedInventory = consolidateUnmatchedInventory(unmatchedItems)
  const consolidatedUnmatchedItems = consolidatedUnmatchedInventory.filter((item) => !item.isStale)
  const staleUnmatchedItems = consolidatedUnmatchedInventory.filter((item) => item.isStale)
  const autoLinkedItems = activeInventory.filter((item) => item.matchStatus === "auto_linked").length
  const autoSyncProfiles = profiles.filter((profile) => profile.autoSyncEnabled !== false).length
  const autoLinkProfiles = profiles.filter((profile) => profile.autoLinkEnabled !== false).length
  const lastDeviceSyncAt = profiles
    .map((profile) => profile.lastDeviceSyncAt ? new Date(profile.lastDeviceSyncAt).getTime() : 0)
    .filter(Boolean)
    .sort((a, b) => b - a)[0]
  const latestSyncProfile = profiles
    .filter((profile) => profile.lastDeviceSyncAt)
    .sort((a, b) => new Date(b.lastDeviceSyncAt || 0).getTime() - new Date(a.lastDeviceSyncAt || 0).getTime())[0]
  const syncAllReportMessage = useMemo(() => {
    return "NeoTree will scan all enabled Headwind profiles and reconcile device links."
  }, [])

  function syncAllProfiles() {
    startSyncAllTransition(async () => {
      const result = await syncAllEnabledMdmProfilesReport("Operator requested full MDM inventory reconciliation")
      router.refresh()
      if (result.results.length) {
        const scanned = result.results.reduce((total: number, item: any) => total + (item.remoteDevices || 0), 0)
        const rawScanned = result.results.reduce((total: number, item: any) => total + (item.rawRemoteDevices || item.remoteDevices || 0), 0)
        const autoLinked = result.results.reduce((total: number, item: any) => total + (item.autoLinked || 0), 0)
        const review = result.results.reduce((total: number, item: any) => total + (item.needsReview || 0), 0)
        const unmatched = result.results.reduce((total: number, item: any) => total + (item.unmatched || 0), 0)
        const conflicts = result.results.reduce((total: number, item: any) => total + (item.conflicts || 0), 0)
        const failed = result.results.filter((item: any) => !item.success).length
        alert({
          title: failed ? "MDM sync completed with issues" : "MDM sync complete",
          variant: failed ? "info" : "success",
          buttonLabel: "Ok",
          message: `
            <p>${scanned} in-scope devices reconciled across ${result.results.length} profile${result.results.length === 1 ? "" : "s"}${rawScanned !== scanned ? ` from ${rawScanned} raw Headwind rows` : ""}.</p>
            <p>${autoLinked} auto-linked, ${review} need review, ${unmatched} unmatched, ${conflicts} conflicts${failed ? `, ${failed} failed` : ""}.</p>
            <ul class="mt-3 list-disc pl-5 text-sm">${result.results.map(formatResultLine).join("")}</ul>
            <p class="mt-3 text-sm"><a href="/device-management?section=review">Open review queue</a> or <a href="/device-management?section=unmatched">open unmatched inventory</a>.</p>
          `,
        })
      } else {
        alert({
          title: "MDM sync failed",
          variant: "error",
          buttonLabel: "Ok",
          message: escapeHtml(result.errors?.[0] || "Could not sync MDM profiles"),
        })
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Connected profiles</div>
            <div className="mt-1 text-2xl font-semibold">{connectedProfiles} / {profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Profile issues</div>
            <div className="mt-1 text-2xl font-semibold">{failedProfiles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Remote MDM devices</div>
            <div className="mt-1 text-2xl font-semibold">{remoteMdmDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Managed NeoTree devices</div>
            <div className="mt-1 text-2xl font-semibold">{managedDevices} / {devices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Actionable review</div>
            <div className="mt-1 text-2xl font-semibold">{reviewItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Auto-linked</div>
            <div className="mt-1 text-2xl font-semibold">{autoLinkedItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">MDM automation</div>
            <div className="text-xs text-muted-foreground">
              Auto-sync enabled on {autoSyncProfiles} / {profiles.length} profiles. Auto-link enabled on {autoLinkProfiles} / {profiles.length} profiles.
              {lastDeviceSyncAt ? ` Last sync ${fmt(new Date(lastDeviceSyncAt))}.` : " No sync has run yet."}
              {latestSyncProfile ? ` ${formatSyncSummary(latestSyncProfile)}.` : ""}
              {unmatchedItems.length ? ` ${unmatchedItems.length} unmatched inventory record${unmatchedItems.length === 1 ? "" : "s"} consolidated into ${consolidatedUnmatchedItems.length} active remote device${consolidatedUnmatchedItems.length === 1 ? "" : "s"}.` : ""}
              {staleUnmatchedItems.length ? ` ${staleUnmatchedItems.length} stale remote device${staleUnmatchedItems.length === 1 ? "" : "s"} hidden from the active unmatched view.` : ""}
              {legacyApplicationInventory.length ? ` ${legacyApplicationInventory.length} legacy Headwind application row${legacyApplicationInventory.length === 1 ? "" : "s"} hidden from device counts until the next sync marks them ignored.` : ""}
            </div>
          </div>
          <Badge variant={autoSyncProfiles ? "default" : "secondary"}>
            {autoSyncProfiles ? "automation on" : "automation off"}
          </Badge>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary-outline"
          disabled={syncAllPending}
          aria-busy={syncAllPending}
          title={syncAllReportMessage}
          onClick={syncAllProfiles}
        >
          {syncAllPending ? (
            <>
              <Loader2Icon className="size-4 mr-2 animate-spin" />
              Syncing profiles...
            </>
          ) : (
            <>
              <RefreshCwIcon className="size-4 mr-2" />
              Sync all MDM profiles
            </>
          )}
        </Button>
      </div>

      <Tabs
        searchParamsKey="section"
        options={[
          { value: "profiles", label: "MDM profiles" },
          { value: "devices", label: "Device fleet" },
          { value: "review", label: `Review queue${reviewItems.length ? ` (${reviewItems.length})` : ""}` },
          { value: "unmatched", label: `Unmatched inventory${consolidatedUnmatchedItems.length ? ` (${consolidatedUnmatchedItems.length})` : ""}` },
          { value: "stale", label: `Stale inventory${staleUnmatchedItems.length ? ` (${staleUnmatchedItems.length})` : ""}` },
        ]}
      />

      {activeSection === "profiles" ? (
        <Card className="w-full">
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              title={<div className="text-2xl">MDM profiles</div>}
              tableClassname="min-w-[980px]"
              search={{ inputPlaceholder: "Search MDM profiles" }}
              headerActions={
                <Button asChild variant="ghost" className="w-auto h-auto">
                  <Link href="/device-management/profiles/new">
                    <PlusIcon className="size-4 mr-2" />
                    Add
                  </Link>
                </Button>
              }
              noDataMessage={<div>No MDM profiles configured.</div>}
              columns={[
                { name: "Name" },
                { name: "Country" },
                { name: "Environment" },
                { name: "Provider" },
                { name: "URL" },
                { name: "Authentication" },
                { name: "Matching" },
                {
                  name: "Connection",
                  cellRenderer({ rowIndex }) {
                    const profile = profiles[rowIndex]
                    return (
                      <Badge variant={connectionBadgeVariant(profile?.lastConnectionStatus)}>
                        {profile?.lastConnectionStatus || "not checked"}
                      </Badge>
                    )
                  },
                },
                {
                  name: "Device sync",
                  cellRenderer({ rowIndex }) {
                    const profile = profiles[rowIndex]
                    return (
                      <Badge variant={connectionBadgeVariant(profile?.lastDeviceSyncStatus)}>
                        {profile?.lastDeviceSyncStatus || "not synced"}
                      </Badge>
                    )
                  },
                },
                { name: "Last sync result" },
                {
                  name: "Status",
                  cellRenderer({ rowIndex }) {
                    const profile = profiles[rowIndex]
                    return (
                      <Badge variant={profile?.isEnabled ? "default" : "secondary"}>
                        {profile?.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    )
                  },
                },
                {
                  name: "Action",
                  align: "right",
                  cellClassName: "w-10",
                  cellRenderer({ rowIndex }) {
                    const profile = profiles[rowIndex]
                    if (!profile) return null
                    return <DeviceManagementRowActions editHref={`/device-management/profiles/${profile.profileId}`} profileId={profile.profileId} />
                  },
                },
              ]}
              data={profiles.map((profile) => [
                profile.name || "",
                profile.countryISO || "",
                profile.environment || "production",
                profile.provider || "",
                profile.baseUrl || "",
                authMode(profile),
                `Auto ${profile.autoLinkMinConfidence || 95}% | Review ${profileReviewThreshold(profile)}%`,
                profile.lastConnectionStatus || "not checked",
                profile.lastDeviceSyncStatus || "not synced",
                formatSyncSummary(profile),
                profile.isEnabled ? "Enabled" : "Disabled",
                "",
              ])}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "devices" ? (
        <Card className="w-full">
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              title={<div className="text-2xl">Device fleet</div>}
              tableClassname="min-w-[980px]"
              search={{ inputPlaceholder: "Search devices" }}
              headerActions={
                <Button asChild variant="ghost" className="w-auto h-auto">
                  <Link href="/device-management/links/new">
                    <PlusIcon className="size-4 mr-2" />
                    Link device
                  </Link>
                </Button>
              }
              noDataMessage={<div>No registered devices yet.</div>}
              columns={[
                { name: "Device" },
                { name: "Country" },
                {
                  name: "MDM",
                  cellRenderer({ rowIndex }) {
                    const row = devices[rowIndex]
                    return (
                      <Badge variant={managementBadgeVariant(row?.mdmLink?.managementState)}>
                        {row?.mdmLink?.managementState || "unlinked"}
                      </Badge>
                    )
                  },
                },
                { name: "Profile" },
                { name: "Group" },
                {
                  name: "Enrollment",
                  cellRenderer({ rowIndex }) {
                    const row = devices[rowIndex]
                    return (
                      <Badge variant={enrollmentBadgeVariant(row?.mdmLink?.enrollmentStatus)}>
                        {row?.mdmLink?.enrollmentStatus || "unknown"}
                      </Badge>
                    )
                  },
                },
                { name: "App" },
                { name: "Update" },
                { name: "Runtime" },
                { name: "Sync" },
                { name: "Last Seen" },
                {
                  name: "Action",
                  align: "right",
                  cellClassName: "w-10",
                  cellRenderer({ rowIndex }) {
                    const row = devices[rowIndex]
                    if (!row) return null
                    const href = row.mdmLink?.linkId
                      ? `/device-management/links/${row.mdmLink.linkId}`
                      : `/device-management/links/new?deviceId=${row.device.deviceId}`
                    return <DeviceManagementRowActions editHref={href} linkId={row.mdmLink?.linkId} capabilities={row.mdmLink?.profileId ? capabilitiesByProfileId.get(row.mdmLink.profileId) : undefined} />
                  },
                },
              ]}
              data={devices.map(({ device, appState, mdmLink }) => [
                device.deviceHash || device.deviceId,
                mdmLink?.countryISO || appState?.countryISO || "",
                mdmLink?.managementState || "unlinked",
                mdmLink?.profile?.name || "",
                mdmLink?.mdmGroupName || mdmLink?.mdmGroupId || "",
                mdmLink?.enrollmentStatus || "unknown",
                appState?.appVersion || "",
                appState?.updateRelease || "",
                appState?.runtimeVersion || "",
                mdmLink?.lastSyncStatus || "",
                fmt(appState?.lastSeenAt || mdmLink?.lastMdmSeenAt),
                "",
              ])}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "review" ? (
        <Card className="w-full">
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              title={<div className="text-2xl">MDM review queue</div>}
              tableClassname="min-w-[1100px]"
              search={{ inputPlaceholder: "Search remote MDM devices" }}
              noDataMessage={<div>No MDM devices need review.</div>}
              columns={[
                { name: "Remote device" },
                { name: "Profile" },
                { name: "Configuration" },
                {
                  name: "Match",
                  cellRenderer({ rowIndex }) {
                    const item = reviewItems[rowIndex]
                    return (
                      <Badge variant={matchBadgeVariant(item?.matchStatus)}>
                        {item?.matchStatus?.replace("_", " ") || "unknown"}
                      </Badge>
                    )
                  },
                },
                { name: "Confidence" },
                { name: "Suggested NeoTree device" },
                { name: "Why not auto-linked" },
                { name: "Last seen" },
                {
                  name: "Action",
                  align: "right",
                  cellClassName: "w-10",
                  cellRenderer({ rowIndex }) {
                    const item = reviewItems[rowIndex]
                    if (!item) return null
                    return (
                      <MdmInventoryReviewActions
                        inventoryId={item.inventoryId}
                        suggestedDeviceId={item.suggestedDeviceId}
                      />
                    )
                  },
                },
              ]}
              data={reviewItems.map((item) => [
                remoteDeviceDisplay(item),
                item.profile?.name || "",
                configurationDisplay(item.mdmConfigName, item.mdmConfigId),
                item.matchStatus || "",
                `${item.matchConfidence || 0}%`,
                item.suggestedDevice?.deviceHash || item.suggestedDeviceId || "",
                reviewEvidence(item),
                fmt(item.lastMdmSeenAt || item.lastSeenAt),
                "",
              ])}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "unmatched" ? (
        <Card className="w-full">
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              title={<div className="text-2xl">Unmatched MDM inventory</div>}
              tableClassname="min-w-[980px]"
              search={{ inputPlaceholder: "Search unmatched MDM devices" }}
              noDataMessage={<div>No unmatched MDM inventory.</div>}
              columns={[
                { name: "Remote device" },
                { name: "Profile" },
                { name: "Configuration" },
                { name: "Overlap" },
                { name: "Confidence" },
                { name: "Why unmatched" },
                { name: "Last seen" },
              ]}
              data={consolidatedUnmatchedItems.map((entry) => [
                remoteDeviceDisplay(entry.item),
                entry.profileNames.length > 1 ? `${joinUnique(entry.profileNames)} (${entry.rowCount} records)` : joinUnique(entry.profileNames),
                joinUnique(entry.configurationNames),
                entry.profileNames.length > 1 ? "Seen in multiple profiles" : "Single profile",
                `${entry.item.matchConfidence || 0}%`,
                unmatchedEvidence(entry.item),
                fmt(entry.lastSeenAt),
              ])}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "stale" ? (
        <Card className="w-full">
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              title={<div className="text-2xl">Stale MDM inventory</div>}
              tableClassname="min-w-[980px]"
              search={{ inputPlaceholder: "Search stale MDM devices" }}
              noDataMessage={<div>No stale unmatched MDM inventory.</div>}
              columns={[
                { name: "Remote device" },
                { name: "Profile" },
                { name: "Configuration" },
                { name: "Overlap" },
                { name: "Why hidden" },
                { name: "Last seen" },
              ]}
              data={staleUnmatchedItems.map((entry) => [
                remoteDeviceDisplay(entry.item),
                entry.profileNames.length > 1 ? `${joinUnique(entry.profileNames)} (${entry.rowCount} records)` : joinUnique(entry.profileNames),
                joinUnique(entry.configurationNames),
                entry.profileNames.length > 1 ? "Seen in multiple profiles" : "Single profile",
                staleUnmatchedEvidence(entry.item),
                fmt(entry.lastSeenAt),
              ])}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
