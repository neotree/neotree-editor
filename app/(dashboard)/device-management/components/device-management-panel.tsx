"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { _getDeviceManagementOverview } from "@/databases/queries/device-management"
import { maskSecret } from "@/lib/mdm"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useQueryState } from "nuqs"
import { DeviceManagementRowActions } from "./device-management-row-actions"

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

export function DeviceManagementPanel({ overview }: { overview: Overview }) {
  const { profiles, devices } = overview
  const [section, setSection] = useQueryState("section", { defaultValue: "profiles" })
  const activeSection = section === "devices" ? "devices" : "profiles"

  return (
    <Tabs value={activeSection} onValueChange={setSection} className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="profiles">MDM profiles</TabsTrigger>
        <TabsTrigger value="devices">Device fleet</TabsTrigger>
      </TabsList>

      <TabsContent value="profiles" className="mt-0">
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
                { name: "Provider" },
                { name: "URL" },
                { name: "Token" },
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
                    return <DeviceManagementRowActions editHref={`/device-management/profiles/${profile.profileId}`} />
                  },
                },
              ]}
              data={profiles.map((profile) => [
                profile.name || "",
                profile.countryISO || "",
                profile.provider || "",
                profile.baseUrl || "",
                maskSecret(profile.apiKey),
                profile.isEnabled ? "Enabled" : "Disabled",
                "",
              ])}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="devices" className="mt-0">
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
                    return <DeviceManagementRowActions editHref={href} />
                  },
                },
              ]}
              data={devices.map(({ device, appState, mdmLink }) => [
                device.deviceHash || device.deviceId,
                mdmLink?.managementState || "unlinked",
                mdmLink?.profile?.name || "",
                mdmLink?.enrollmentStatus || "unknown",
                appState?.appVersion || "",
                appState?.runtimeVersion || "",
                fmt(appState?.lastSeenAt || mdmLink?.lastMdmSeenAt),
                "",
              ])}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
