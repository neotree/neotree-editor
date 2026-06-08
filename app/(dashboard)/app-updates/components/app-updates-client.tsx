'use client';

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Tabs } from "@/components/tabs";
import { useAppContext } from "@/contexts/app";
import { AlertTriangle, CheckCircle2, Download } from "lucide-react";

import type { AppUpdatePolicy, AppUpdatePolicyDraft, ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases, deviceAppStates, deviceRolloutStates, deviceUpdateEvents } from "@/databases/pg/schema";
import { getApkReleaseReadiness, isApkReleaseDeviceAvailable } from "@/lib/app-updates/validation";

type ApkRelease = typeof apkReleases.$inferSelect;
type DeviceAppState = typeof deviceAppStates.$inferSelect;
type OtaEvent = typeof deviceUpdateEvents.$inferSelect;
type RolloutState = typeof deviceRolloutStates.$inferSelect;

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const formatBytes = (value?: number | null) => {
  if (!value) return "";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const isRecent = (value?: string | Date | null, maxAgeHours = 24) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= maxAgeHours * 60 * 60 * 1000;
};

const isFailureEvent = (eventType: string) => {
  const normalized = eventType.toLowerCase();
  return normalized.includes("fail") || normalized.includes("error") || normalized.includes("rollback");
};

function statusBadgeVariant(status?: string | null) {
  if (status === "available") return "default" as const;
  if (status === "revoked" || status === "deprecated") return "destructive" as const;
  return "secondary" as const;
}

type Props = {
  policy: AppUpdatePolicy | null;
  policyDrafts: AppUpdatePolicyDraft[];
  apkReleases: ApkRelease[];
  apkReleaseDrafts: ApkReleaseDraft[];
  otaEvents: OtaEvent[];
  deviceAppStates: DeviceAppState[];
  rolloutStates: RolloutState[];
  screen?: "overview" | "apk" | "ota";
};

export function AppUpdatesClient({
  policy,
  apkReleases,
  apkReleaseDrafts,
  otaEvents,
  deviceAppStates,
  rolloutStates,
  screen = "overview",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewOnly } = useAppContext();
  const editingDisabled = viewOnly;
  const section = searchParams.get("section");
  const activeOverviewSection = section === "ota" ? "ota" : "apk";
  const activeOtaSection = section === "acknowledgements" || section === "exceptions" || section === "rollout" ? section : "adoption";

  const releaseRows = useMemo(() => {
    const byId = new Map<string, any>();

    for (const draft of apkReleaseDrafts) {
      const payload = (draft.data || {}) as any;
      const releaseId = payload.apkReleaseId || draft.apkReleaseDraftId;
      if (!releaseId) continue;
      byId.set(releaseId, {
        ...payload,
        apkReleaseId: releaseId,
        __draft: true,
        __draftId: draft.apkReleaseDraftId,
        __updatedAt: draft.updatedAt || draft.createdAt,
      });
    }

    for (const release of apkReleases) {
      const releaseId = release.apkReleaseId;
      if (!releaseId) continue;
      if (byId.has(releaseId)) continue;
      byId.set(releaseId, { ...release, __draft: false });
    }

    return Array.from(byId.values()).sort((a, b) => {
      const aDate = new Date(a.__updatedAt || a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.__updatedAt || b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [apkReleaseDrafts, apkReleases]);

  const otaAppliedEvents = useMemo(() => {
    return [...otaEvents]
      .filter((event) => event.eventType === "ota_update_applied")
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });
  }, [otaEvents]);

  const liveCurrentRelease = useMemo(() => {
    if (!policy?.currentApkReleaseId) return null;
    return releaseRows.find((release) => release.apkReleaseId === policy.currentApkReleaseId) || policy.currentApkRelease || null;
  }, [policy, releaseRows]);

  const liveRollbackRelease = useMemo(() => {
    if (!policy?.rollbackApkReleaseId) return null;
    return releaseRows.find((release) => release.apkReleaseId === policy.rollbackApkReleaseId) || policy.rollbackApkRelease || null;
  }, [policy, releaseRows]);

  const releaseAdoption = useMemo(() => {
    const counts = new Map<string, number>();
    for (const state of deviceAppStates) {
      const key = state.apkReleaseId || `${state.appVersion || "unknown"}:${state.runtimeVersion || "unknown"}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([key, count]) => {
        const release = releaseRows.find((item) => item.apkReleaseId === key);
        return {
          key,
          count,
          label: release ? `${release.versionName} (${release.versionCode})` : key,
          runtimeVersion: release?.runtimeVersion || "",
          isCurrent: !!liveCurrentRelease?.apkReleaseId && key === liveCurrentRelease.apkReleaseId,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [deviceAppStates, liveCurrentRelease, releaseRows]);

  const recentFailures = useMemo(() => {
    return otaEvents
      .filter((event) => isFailureEvent(event.eventType))
      .filter((event) => isRecent(event.createdAt, 72))
      .slice(0, 8);
  }, [otaEvents]);

  const loadRelease = useCallback(
    (release: any) => {
      const releaseId = release.apkReleaseId || release.apkReleaseDraftId;
      if (releaseId) {
        router.push(`/app-updates/new-apk?apkReleaseId=${releaseId}`);
      }
    },
    [router],
  );

  return (
    <>
      {screen === "overview" ? (
        <div className="w-full space-y-4">
          <Tabs
            searchParamsKey="section"
            options={[
              { value: "apk", label: "APK Updates" },
              { value: "ota", label: "OTA Updates" },
            ]}
          />

          {activeOverviewSection === "apk" ? (
            <Card className="w-full">
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="APK Updates"
                  tableClassname="min-w-[900px]"
                  search={{ inputPlaceholder: "Search APK releases" }}
                  headerActions={
                    <>
                      <Button
                        variant="ghost"
                        className="w-auto h-auto"
                        onClick={() => router.push("/app-updates/new-apk")}
                        disabled={editingDisabled}
                      >
                        New APK Release
                      </Button>
                      <Button variant="ghost" className="w-auto h-auto" onClick={() => router.push("/app-updates/new-policy")}>
                        {viewOnly ? "View Policy" : "New Policy"}
                      </Button>
                    </>
                  }
                  noDataMessage={<div>No APK releases found.</div>}
                  columns={[
                    { name: "Version" },
                    { name: "Runtime" },
                    {
                      name: "Status",
                      cellRenderer({ rowIndex }) {
                        const release = releaseRows[rowIndex]
                        return <Badge variant={statusBadgeVariant(release?.status)}>{release?.status || "unknown"}</Badge>
                      },
                    },
                    {
                      name: "Available",
                      cellRenderer({ rowIndex }) {
                        const release = releaseRows[rowIndex]
                        return isApkReleaseDeviceAvailable(release) ? (
                          <Badge variant="default">Ready</Badge>
                        ) : (
                          <Badge variant="secondary">Not ready</Badge>
                        )
                      },
                    },
                    { name: "Draft" },
                    { name: "Updated" },
                    {
                      name: "Action",
                      align: "right",
                      cellClassName: "w-10",
                      cellRenderer({ rowIndex }) {
                        const release = releaseRows[rowIndex]
                        if (!release) return null
                        return (
                          <Button variant="ghost" onClick={() => loadRelease(release)}>
                            {viewOnly ? "View" : "Edit"}
                          </Button>
                        )
                      },
                    },
                  ]}
                  data={releaseRows.map((release) => [
                    `${release.versionName || ""} (${release.versionCode || ""})`,
                    release.runtimeVersion || "",
                    release.status || "",
                    isApkReleaseDeviceAvailable(release) ? "Ready" : "Not ready",
                    release.__draft ? "Draft" : "Published",
                    formatDateTime(release.__updatedAt || release.updatedAt),
                    "",
                  ])}
                />
              </CardContent>
            </Card>
          ) : null}

          {activeOverviewSection === "ota" ? (
            <Card className="w-full">
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="OTA Updates"
                  tableClassname="min-w-[680px]"
                  search={{ inputPlaceholder: "Search OTA adoption" }}
                  headerActions={
                    <Button variant="ghost" className="w-auto h-auto" onClick={() => router.push("/app-updates/ota")}>
                      View OTA Updates
                    </Button>
                  }
                  noDataMessage={<div>No device app state reports yet.</div>}
                  columns={[
                    { name: "Release" },
                    { name: "Runtime" },
                    { name: "Devices" },
                    {
                      name: "Status",
                      cellRenderer({ rowIndex }) {
                        const item = releaseAdoption[rowIndex]
                        return item?.isCurrent ? <Badge variant="default">Current</Badge> : <Badge variant="secondary">Older</Badge>
                      },
                    },
                  ]}
                  data={releaseAdoption.map((item) => [
                    item.label,
                    item.runtimeVersion,
                    `${item.count}`,
                    item.isCurrent ? "Current" : "Older",
                  ])}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {screen === "apk" ? (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Release readiness</div>
                    <div className="mt-1 text-base font-medium">
                      {liveCurrentRelease ? `${liveCurrentRelease.versionName} (${liveCurrentRelease.versionCode})` : "No current release selected"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Runtime {policy?.runtimeVersion || liveCurrentRelease?.runtimeVersion || "not set"}
                      {liveRollbackRelease ? `, rollback ${liveRollbackRelease.versionName} (${liveRollbackRelease.versionCode})` : ""}
                    </div>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                    {getApkReleaseReadiness(liveCurrentRelease || {}).map((check) => (
                      <div key={check.key} className="flex items-center gap-2 text-sm">
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        )}
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-muted-foreground">APK releases</div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary-outline"
                      onClick={() => router.push("/app-updates/new-apk")}
                      disabled={editingDisabled}
                    >
                      New APK Release
                    </Button>
                    <Button onClick={() => router.push("/app-updates/new-policy")}>
                      {viewOnly ? "View Policy" : "New Policy"}
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Version</th>
                        <th className="py-2 pr-4">Runtime</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Available</th>
                        <th className="py-2 pr-4">Draft</th>
                        <th className="py-2 pr-4">File</th>
                        <th className="py-2 pr-4">Updated</th>
                        <th className="py-2 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {releaseRows.map((release) => (
                        <tr key={release.apkReleaseId} className="border-b">
                          <td className="py-2 pr-4">
                            {release.versionName} ({release.versionCode})
                          </td>
                          <td className="py-2 pr-4">{release.runtimeVersion}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={statusBadgeVariant(release.status)}>{release.status}</Badge>
                          </td>
                          <td className="py-2 pr-4">
                            {isApkReleaseDeviceAvailable(release) ? (
                              <Badge variant="default">Ready</Badge>
                            ) : (
                              <Badge variant="secondary">Not ready</Badge>
                            )}
                          </td>
                          <td className="py-2 pr-4">{release.__draft ? "Draft" : "Published"}</td>
                          <td className="py-2 pr-4">
                            {release.fileId ? (
                              <span className="inline-flex items-center gap-1">
                                <Download className="h-3.5 w-3.5" />
                                {formatBytes(release.fileSize) || "Attached"}
                              </span>
                            ) : ""}
                          </td>
                          <td className="py-2 pr-4">
                            {formatDateTime(release.__updatedAt || release.updatedAt)}
                          </td>
                          <td className="py-2 pr-4">
                            <Button variant="ghost" onClick={() => loadRelease(release)}>
                              {viewOnly ? "View" : "Edit"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!releaseRows.length ? (
                    <div className="text-muted-foreground text-sm">No releases found.</div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
      ) : null}

      {screen === "ota" ? (
          <div className="grid grid-cols-1 gap-4">
            <Tabs
              searchParamsKey="section"
              options={[
                { value: "adoption", label: "Fleet APK adoption" },
                { value: "rollout", label: "Rollout states" },
                { value: "acknowledgements", label: "OTA acknowledgements" },
                { value: "exceptions", label: "Rollout exceptions" },
              ]}
            />

            {activeOtaSection === "adoption" ? (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="Fleet APK adoption"
                  tableClassname="min-w-[680px]"
                  search={{ inputPlaceholder: "Search fleet adoption" }}
                  noDataMessage={<div>No device app state reports yet.</div>}
                  columns={[
                    { name: "Release" },
                    { name: "Runtime" },
                    { name: "Devices" },
                    {
                      name: "Status",
                      cellRenderer({ rowIndex }) {
                        const item = releaseAdoption[rowIndex]
                        return item?.isCurrent ? <Badge variant="default">Current</Badge> : <Badge variant="secondary">Older</Badge>
                      },
                    },
                  ]}
                  data={releaseAdoption.map((item) => [
                    item.label,
                    item.runtimeVersion,
                    `${item.count}`,
                    item.isCurrent ? "Current" : "Older",
                  ])}
                />
              </CardContent>
            </Card>
            ) : null}

            {activeOtaSection === "rollout" ? (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="Device rollout states"
                  tableClassname="min-w-[980px]"
                  search={{ inputPlaceholder: "Search rollout states" }}
                  noDataMessage={<div>No rollout states reported yet.</div>}
                  columns={[
                    { name: "Device" },
                    { name: "Release" },
                    { name: "Country" },
                    { name: "Delivery" },
                    {
                      name: "State",
                      cellRenderer({ rowIndex }) {
                        const row = rolloutStates[rowIndex]
                        return row ? <Badge variant={row.rolloutState === "failed" ? "destructive" : "secondary"}>{row.rolloutState}</Badge> : null
                      },
                    },
                    { name: "Progress" },
                    { name: "Last Error" },
                    { name: "Updated" },
                  ]}
                  data={rolloutStates.map((state) => [
                    state.deviceId,
                    state.apkReleaseId || "",
                    state.countryISO || "",
                    state.deliveryMode,
                    state.rolloutState,
                    `${state.downloadProgress || 0}%`,
                    state.lastErrorCode || state.lastErrorMessage || "",
                    formatDateTime(state.updatedAt),
                  ])}
                />
              </CardContent>
            </Card>
            ) : null}

            {activeOtaSection === "acknowledgements" ? (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="OTA updates applied"
                  tableClassname="min-w-[900px]"
                  search={{ inputPlaceholder: "Search OTA acknowledgements" }}
                  noDataMessage={<div>No OTA acknowledgements yet.</div>}
                  columns={[
                    { name: "Device" },
                    { name: "App Version" },
                    { name: "Runtime" },
                    { name: "OTA Update ID" },
                    { name: "Channel" },
                    { name: "Received" },
                  ]}
                  data={otaAppliedEvents.map((event) => [
                    event.deviceId,
                    event.appVersion || "",
                    event.runtimeVersion || "",
                    event.otaUpdateId || "",
                    event.otaChannel || "",
                    formatDateTime(event.createdAt),
                  ])}
                />
              </CardContent>
            </Card>
            ) : null}

            {activeOtaSection === "exceptions" ? (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="Recent rollout exceptions"
                  tableClassname="min-w-[820px]"
                  search={{ inputPlaceholder: "Search rollout exceptions" }}
                  noDataMessage={<div>No rollout exceptions in the last 72 hours.</div>}
                  columns={[
                    { name: "Device" },
                    {
                      name: "Event",
                      cellRenderer({ rowIndex }) {
                        const event = recentFailures[rowIndex]
                        return event ? <Badge variant="destructive">{event.eventType}</Badge> : null
                      },
                    },
                    { name: "App Version" },
                    { name: "Runtime" },
                    { name: "Received" },
                  ]}
                  data={recentFailures.map((event) => [
                    event.deviceId,
                    event.eventType,
                    event.appVersion || "",
                    event.runtimeVersion || "",
                    formatDateTime(event.createdAt),
                  ])}
                />
              </CardContent>
            </Card>
            ) : null}
          </div>
      ) : null}
    </>
  );
}
