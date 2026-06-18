'use client';

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Tabs } from "@/components/tabs";
import { useAppContext } from "@/contexts/app";
import { buildAppUpdateReleaseRows } from "@/lib/app-updates/release-rows";
import { AlertTriangle, CheckCircle2, Download, Loader2Icon } from "lucide-react";

import type { AppUpdatePolicy, AppUpdatePolicyDraft, ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases, deviceAppStates, deviceRolloutStates, deviceUpdateEvents } from "@/databases/pg/schema";
import { getApkReleaseReadiness, isApkReleaseDeviceAvailable, normalizeAppUpdateChannel } from "@/lib/app-updates/validation";
import { requestCurrentPolicyMdmApkRollout } from "@/app/actions/app-updates";

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

const formatChannel = (value?: string | null) => {
  const channel = normalizeAppUpdateChannel(value);
  if (channel === "prod") return "Prod";
  if (channel === "stage") return "Stage";
  if (channel === "demo") return "Demo";
  return value || "";
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

const getCapabilitySoftware = (state?: DeviceAppState | null) => {
  return ((state?.deviceCapabilities as Record<string, any> | null)?.software || {}) as Record<string, any>;
};

const getStateUpdateRelease = (state?: DeviceAppState | null) => {
  return state?.updateRelease || getCapabilitySoftware(state).updateRelease || "";
};

const getEventUpdateRelease = (event?: OtaEvent | null) => {
  return event?.updateRelease || ((event?.payload as Record<string, any> | null)?.updateRelease || "");
};

const formatUpdateRelease = (value?: string | null) => {
  return value || "-";
};

const parseVersionParts = (value?: string | null) => {
  return `${value || ""}`
    .split(".")
    .map((part) => Number(part))
    .map((part) => (Number.isFinite(part) ? part : 0));
};

const compareVersionDesc = (a?: string | null, b?: string | null) => {
  const aParts = parseVersionParts(a);
  const bParts = parseVersionParts(b);
  const max = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < max; i += 1) {
    const diff = (bParts[i] || 0) - (aParts[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const parseUpdateSequence = (value?: string | null) => {
  const match = `${value || ""}`.match(/-(\d+)$/);
  return match ? Number(match[1]) : 0;
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
  const [isRolloutPending, startRolloutTransition] = useTransition();
  const [rolloutActionMessage, setRolloutActionMessage] = useState<string | null>(null);
  const editingDisabled = viewOnly;
  const section = searchParams.get("section");
  const activeOverviewSection = section === "ota" ? "ota" : "apk";
  const activeOtaSection = section === "acknowledgements" || section === "exceptions" || section === "rollout" ? section : "adoption";

  const releaseRows = useMemo(() => {
    return buildAppUpdateReleaseRows(apkReleases, apkReleaseDrafts);
  }, [apkReleaseDrafts, apkReleases]);

  const otaAppliedEvents = useMemo(() => {
    const unique = new Map<string, OtaEvent>();
    for (const event of otaEvents.filter((item) => item.eventType === "ota_update_applied")) {
      const key = [
        event.deviceId,
        event.otaUpdateId || "embedded",
        getEventUpdateRelease(event) || "no-update-release",
        event.otaChannel || "",
      ].join("|");
      const existing = unique.get(key);
      if (!existing || new Date(event.createdAt || 0).getTime() > new Date(existing.createdAt || 0).getTime()) {
        unique.set(key, event);
      }
    }

    return Array.from(unique.values())
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
    const counts = new Map<string, { count: number; state: DeviceAppState }>();
    for (const state of deviceAppStates) {
      const updateRelease = getStateUpdateRelease(state);
      const key = state.apkReleaseId || [
        state.appVersion || "Unknown",
        updateRelease || "no-update-release",
        state.runtimeVersion || "Unknown",
      ].join("|");
      const existing = counts.get(key);
      counts.set(key, { count: (existing?.count || 0) + 1, state: existing?.state || state });
    }

    const rows = Array.from(counts.entries())
      .map(([key, value]) => {
        const release = releaseRows.find((item) => item.apkReleaseId === key);
        const state = value.state;
        const updateRelease = getStateUpdateRelease(state);
        return {
          key,
          count: value.count,
          appVersion: release?.versionName || state?.appVersion || "Unknown",
          versionCode: release?.versionCode || null,
          runtimeVersion: release?.runtimeVersion || state?.runtimeVersion || "",
          updateRelease,
          isCurrent: !!liveCurrentRelease?.apkReleaseId && key === liveCurrentRelease.apkReleaseId,
        };
      })
      .sort((a, b) => {
        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
        const versionDiff = compareVersionDesc(a.appVersion, b.appVersion);
        if (versionDiff !== 0) return versionDiff;
        const updateDiff = parseUpdateSequence(b.updateRelease) - parseUpdateSequence(a.updateRelease);
        if (updateDiff !== 0) return updateDiff;
        return b.count - a.count;
      });

    if (liveCurrentRelease?.apkReleaseId) return rows;
    return rows.map((row, index) => ({ ...row, isCurrent: index === 0 }));
  }, [deviceAppStates, liveCurrentRelease, releaseRows]);

  const recentFailures = useMemo(() => {
    return otaEvents
      .filter((event) => isFailureEvent(event.eventType))
      .filter((event) => isRecent(event.createdAt, 72))
      .slice(0, 8);
  }, [otaEvents]);

  const rolloutSummary = useMemo(() => {
    const currentReleaseId = liveCurrentRelease?.apkReleaseId || policy?.currentApkReleaseId || null;
    const currentStates = currentReleaseId
      ? rolloutStates.filter((state) => state.apkReleaseId === currentReleaseId)
      : rolloutStates;
    return {
      total: currentStates.length,
      installed: currentStates.filter((state) => state.rolloutState === "installed").length,
      failed: currentStates.filter((state) => state.rolloutState === "failed").length,
      mdmRequested: currentStates.filter((state) => state.rolloutState === "mdm_push_requested").length,
    };
  }, [liveCurrentRelease?.apkReleaseId, policy?.currentApkReleaseId, rolloutStates]);

  const deliveryMode = policy?.apkDeliveryMode || "not configured";
  const usesMdm = deliveryMode === "mdm" || deliveryMode === "hybrid";
  const currentApkReady = !!liveCurrentRelease && isApkReleaseDeviceAvailable(liveCurrentRelease);

  const loadRelease = useCallback(
    (release: any) => {
      const releaseId = release.apkReleaseId || release.apkReleaseDraftId;
      if (releaseId) {
        router.push(`/app-updates/new-apk?apkReleaseId=${releaseId}`);
      }
    },
    [router],
  );

  const requestMdmRollout = useCallback(() => {
    setRolloutActionMessage(null);
    startRolloutTransition(async () => {
      const result = await requestCurrentPolicyMdmApkRollout();
      const summary = result.data;
      if (result.success) {
        setRolloutActionMessage(
          `MDM rollout requested for ${summary.requested} device${summary.requested === 1 ? "" : "s"}. ${summary.skipped} skipped.`,
        );
      } else {
        setRolloutActionMessage(result.errors?.[0] || "Could not request MDM rollout");
      }
      router.refresh();
    });
  }, [router]);

  return (
    <>
      {screen === "overview" ? (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Live policy</div>
                <div className="mt-1 text-lg font-semibold">{policy ? `v${policy.policyVersion}` : "Not configured"}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={policy?.otaEnabled ? "default" : "secondary"}>{policy?.otaEnabled ? "OTA on" : "OTA off"}</Badge>
                    {policy?.otaChannel ? <Badge variant="secondary">{formatChannel(policy.otaChannel)}</Badge> : null}
                    <Badge variant={policy ? "default" : "secondary"}>{deliveryMode}</Badge>
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Current APK</div>
                <div className="mt-1 text-lg font-semibold">
                  {liveCurrentRelease ? `${liveCurrentRelease.versionName} (${liveCurrentRelease.versionCode})` : "None"}
                </div>
                <div className="mt-2">
                  <Badge variant={liveCurrentRelease && isApkReleaseDeviceAvailable(liveCurrentRelease) ? "default" : "secondary"}>
                    {liveCurrentRelease && isApkReleaseDeviceAvailable(liveCurrentRelease) ? "Ready" : "Not ready"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Fleet rollout</div>
                <div className="mt-1 text-lg font-semibold">
                  {rolloutSummary.installed} / {rolloutSummary.total}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {rolloutSummary.mdmRequested} MDM requested
                </div>
                {usesMdm ? (
                  <div className="mt-3 space-y-2">
                    <Button
                      variant="outline"
                      className="h-9 w-full"
                      onClick={requestMdmRollout}
                      disabled={editingDisabled || isRolloutPending || !currentApkReady}
                    >
                      {isRolloutPending ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Requesting push...
                        </>
                      ) : (
                        "Push APK via MDM"
                      )}
                    </Button>
                    {rolloutActionMessage ? (
                      <div className="text-xs text-muted-foreground">
                        {rolloutActionMessage}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Rollout risk</div>
                <div className="mt-1 text-lg font-semibold">{rolloutSummary.failed + recentFailures.length} issues</div>
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    className="h-auto w-auto p-0"
                    onClick={() => router.push(usesMdm ? "/device-management?section=review" : "/app-updates/ota?section=exceptions")}
                  >
                    {usesMdm ? "Open Device Management" : "View exceptions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  tableClassname="min-w-[860px]"
                  search={{ inputPlaceholder: "Search OTA adoption" }}
                  headerActions={
                    <Button variant="ghost" className="w-auto h-auto" onClick={() => router.push("/app-updates/ota")}>
                      View OTA Updates
                    </Button>
                  }
                  noDataMessage={<div>No device app state reports yet.</div>}
                  columns={[
                    { name: "App Version" },
                    { name: "Update Release" },
                    { name: "Runtime" },
                    { name: "Devices" },
                    {
                      name: "Status",
                      cellRenderer({ rowIndex }) {
                        const item = releaseAdoption[rowIndex]
                        return item?.isCurrent ? <Badge variant="default">Latest</Badge> : <Badge variant="secondary">Older</Badge>
                      },
                    },
                  ]}
                  data={releaseAdoption.map((item) => [
                    item.versionCode ? `${item.appVersion} (${item.versionCode})` : item.appVersion,
                    formatUpdateRelease(item.updateRelease),
                    item.runtimeVersion,
                    `${item.count}`,
                    item.isCurrent ? "Latest" : "Older",
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

            <Card className="w-full">
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="APK releases"
                  tableClassname="min-w-[980px]"
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
                    {
                      name: "File",
                      cellRenderer({ rowIndex }) {
                        const release = releaseRows[rowIndex]
                        return release?.fileId ? (
                          <span className="inline-flex items-center gap-1">
                            <Download className="h-3.5 w-3.5" />
                            {formatBytes(release.fileSize) || "Attached"}
                          </span>
                        ) : null
                      },
                    },
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
                    release.fileId ? (formatBytes(release.fileSize) || "Attached") : "",
                    formatDateTime(release.__updatedAt || release.updatedAt),
                    "",
                  ])}
                />
              </CardContent>
            </Card>
          </div>
      ) : null}

      {screen === "ota" ? (
          <div className="grid grid-cols-1 gap-4">
            <Tabs
              searchParamsKey="section"
              options={[
                { value: "adoption", label: "Fleet app adoption" },
                { value: "rollout", label: "Rollout states" },
                { value: "acknowledgements", label: "OTA acknowledgements" },
                { value: "exceptions", label: "Rollout exceptions" },
              ]}
            />

            {activeOtaSection === "adoption" ? (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <DataTable
                  title="Fleet app adoption"
                  tableClassname="min-w-[860px]"
                  search={{ inputPlaceholder: "Search fleet adoption" }}
                  noDataMessage={<div>No device app state reports yet.</div>}
                  columns={[
                    { name: "App Version" },
                    { name: "Update Release" },
                    { name: "Runtime" },
                    { name: "Devices" },
                    {
                      name: "Status",
                      cellRenderer({ rowIndex }) {
                        const item = releaseAdoption[rowIndex]
                        return item?.isCurrent ? <Badge variant="default">Latest</Badge> : <Badge variant="secondary">Older</Badge>
                      },
                    },
                  ]}
                  data={releaseAdoption.map((item) => [
                    item.versionCode ? `${item.appVersion} (${item.versionCode})` : item.appVersion,
                    formatUpdateRelease(item.updateRelease),
                    item.runtimeVersion,
                    `${item.count}`,
                    item.isCurrent ? "Latest" : "Older",
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
                    { name: "Update Release" },
                    { name: "Runtime" },
                    { name: "OTA Update ID" },
                    { name: "Channel" },
                    { name: "Received" },
                  ]}
                  data={otaAppliedEvents.map((event) => [
                    event.deviceId,
                    event.appVersion || "",
                    formatUpdateRelease(getEventUpdateRelease(event)),
                    event.runtimeVersion || "",
                    event.otaUpdateId || "",
                    formatChannel(event.otaChannel),
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
                    { name: "Update Release" },
                    { name: "Runtime" },
                    { name: "Received" },
                  ]}
                  data={recentFailures.map((event) => [
                    event.deviceId,
                    event.eventType,
                    event.appVersion || "",
                    formatUpdateRelease(getEventUpdateRelease(event)),
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
