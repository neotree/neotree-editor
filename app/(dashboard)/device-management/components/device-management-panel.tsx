"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Tabs } from "@/components/tabs"
import { syncAllEnabledMdmProfilesFromForm } from "@/app/actions/device-management"
import type { _getDeviceManagementOverview } from "@/databases/queries/device-management"
import { PlusIcon, RefreshCwIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { DeviceManagementRowActions } from "./device-management-row-actions"
import { MdmInventoryReviewActions } from "./mdm-inventory-review-actions"

type Overview = Awaited<ReturnType<typeof _getDeviceManagementOverview>>["data"]

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

function formatSyncSummary(profile: Overview["profiles"][number]) {
  const summary = syncSummary(profile)
  if (!profile.lastDeviceSyncAt) return "No sync yet"
  if (profile.lastDeviceSyncStatus === "failed") return summary.error || profile.lastDeviceSyncError || "Sync failed"
  return [
    `${summary.remoteDevices || 0} scanned`,
    `${summary.autoLinked || 0} auto-linked`,
    `${summary.needsReview || 0} review`,
    `${summary.conflicts || 0} conflicts`,
  ].join(" | ")
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
  return "No NeoTree ID, Android ID, serial, IMEI, or strong device hash matched."
}

export function DeviceManagementPanel({ overview }: { overview: Overview }) {
  const { profiles, devices, inventory } = overview
  const searchParams = useSearchParams()
  const section = searchParams.get("section")
  const activeSection = section === "devices" || section === "review" ? section : "profiles"
  const connectedProfiles = profiles.filter((profile) => profile.lastConnectionStatus === "connected").length
  const failedProfiles = profiles.filter((profile) => profile.lastConnectionStatus === "failed").length
  const managedDevices = devices.filter((row) => row.mdmLink?.managementState === "managed").length
  const reviewItems = inventory.filter((item) => item.matchStatus === "needs_review" || item.matchStatus === "conflict" || item.matchStatus === "unmatched")
  const autoLinkedItems = inventory.filter((item) => item.matchStatus === "auto_linked").length
  const autoSyncProfiles = profiles.filter((profile) => profile.autoSyncEnabled !== false).length
  const autoLinkProfiles = profiles.filter((profile) => profile.autoLinkEnabled !== false).length
  const lastDeviceSyncAt = profiles
    .map((profile) => profile.lastDeviceSyncAt ? new Date(profile.lastDeviceSyncAt).getTime() : 0)
    .filter(Boolean)
    .sort((a, b) => b - a)[0]
  const latestSyncProfile = profiles
    .filter((profile) => profile.lastDeviceSyncAt)
    .sort((a, b) => new Date(b.lastDeviceSyncAt || 0).getTime() - new Date(a.lastDeviceSyncAt || 0).getTime())[0]

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
            <div className="text-sm text-muted-foreground">Managed devices</div>
            <div className="mt-1 text-2xl font-semibold">{managedDevices} / {devices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Review queue</div>
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
            </div>
          </div>
          <Badge variant={autoSyncProfiles ? "default" : "secondary"}>
            {autoSyncProfiles ? "automation on" : "automation off"}
          </Badge>
        </div>
      </div>

      <div className="flex justify-end">
        <form action={syncAllEnabledMdmProfilesFromForm}>
          <input type="hidden" name="reason" value="Operator requested full MDM inventory reconciliation" />
          <Button type="submit" variant="primary-outline">
            <RefreshCwIcon className="size-4 mr-2" />
            Sync all MDM profiles
          </Button>
        </form>
      </div>

      <Tabs
        searchParamsKey="section"
        options={[
          { value: "profiles", label: "MDM profiles" },
          { value: "devices", label: "Device fleet" },
          { value: "review", label: `Review queue${reviewItems.length ? ` (${reviewItems.length})` : ""}` },
        ]}
      />

      {activeSection === "profiles" ? (
        <Card className="w-full">
          <CardContent className="p-0 overflow-x-auto">
            <DataTable
              title={<div className="text-2xl">MDM profiles</div>}
              tableClassname="min-w-[860px]"
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
                    return <DeviceManagementRowActions editHref={href} linkId={row.mdmLink?.linkId} />
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
                item.serialNumber || item.mdmDeviceId,
                item.profile?.name || "",
                item.mdmConfigName || item.mdmConfigId || "",
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
    </div>
  )
}
