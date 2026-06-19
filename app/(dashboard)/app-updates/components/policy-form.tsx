'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "@/components/loader";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { Loader2Icon } from "lucide-react";

import type { saveAppUpdatePolicies } from "@/app/actions/app-updates";
import type { AppUpdatePolicy, AppUpdatePolicyDraft, ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases, hospitals as hospitalsTable } from "@/databases/pg/schema";
import { buildAppUpdateReleaseRows } from "@/lib/app-updates/release-rows";
import { releaseSemanticKey } from "@/lib/app-updates/policy-release-resolution";
import {
  appUpdateChannels,
  normalizeAppUpdateChannel,
  normalizeAppUpdatePolicyPayload,
  validateAppUpdatePolicyPayload,
  isApkReleaseDeviceAvailable,
  getApkReleaseReadiness,
} from "@/lib/app-updates/validation";

const installWindows = [
  { value: "on_restart", label: "On restart" },
  { value: "idle", label: "When idle" },
  { value: "immediate", label: "Immediate" },
] as const;
const deliveryModes = [
  { value: "in_app", label: "In-app", description: "NeoTree downloads and prompts for install inside the app." },
  { value: "mdm", label: "MDM", description: "Headwind pushes the APK; the app only reports state and shows status." },
  { value: "hybrid", label: "Hybrid", description: "Headwind is primary, with in-app download as a fallback." },
  { value: "manual", label: "Manual", description: "No automatic install; devices show guidance and telemetry only." },
] as const;
const targetScopes = [
  { value: "country", label: "Country" },
  { value: "group", label: "MDM group" },
  { value: "hospital", label: "Hospital" },
] as const;
const countryOptions = [
  { value: "ZW", label: "Zimbabwe" },
  { value: "MW", label: "Malawi" },
  { value: "ZM", label: "Zambia" },
] as const;

type ApkRelease = typeof apkReleases.$inferSelect;
type Hospital = typeof hospitalsTable.$inferSelect;

type Props = {
  policy: AppUpdatePolicy | null;
  policyDrafts: AppUpdatePolicyDraft[];
  apkReleases: ApkRelease[];
  apkReleaseDrafts: ApkReleaseDraft[];
  hospitals: Hospital[];
  mdmGroupOptions?: { value: string; label: string }[];
  saveAppUpdatePolicies: typeof saveAppUpdatePolicies;
};

type PolicyFormState = {
  policyId?: string | null;
  runtimeVersion: string;
  policyVersion: number;
  otaEnabled: boolean;
  otaChannel: string;
  apkAutoDownload: boolean;
  apkDeliveryMode: string;
  apkForceInstall: boolean;
  apkGracePeriodHours?: number | null;
  apkForceAfter?: string | null;
  apkInstallWindow: string;
  apkMessageTitle?: string | null;
  apkMessageBody?: string | null;
  currentApkReleaseId?: string | null;
  rollbackApkReleaseId?: string | null;
  targetScope: string;
  targetGroupId?: string | null;
  targetHospitalId?: string | null;
  targetCountryISO?: string | null;
  rollbackEnabled: boolean;
};

const defaultPolicy = (): PolicyFormState => ({
  runtimeVersion: "",
  policyVersion: 1,
  otaEnabled: true,
  otaChannel: "prod",
  apkAutoDownload: true,
  apkDeliveryMode: "in_app",
  apkForceInstall: false,
  apkGracePeriodHours: null,
  apkForceAfter: null,
  apkInstallWindow: "on_restart",
  apkMessageTitle: "",
  apkMessageBody: "",
  currentApkReleaseId: null,
  rollbackApkReleaseId: null,
  targetScope: "country",
  targetGroupId: null,
  targetHospitalId: null,
  targetCountryISO: null,
  rollbackEnabled: false,
});

const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

const toNumberOrNull = (value: string) => {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function AppUpdatePolicyForm({
  policy,
  policyDrafts,
  apkReleases,
  apkReleaseDrafts,
  hospitals,
  mdmGroupOptions = [],
  saveAppUpdatePolicies,
}: Props) {
  const router = useRouter();
  const { alert } = useAlertModal();
  const { viewOnly, mode } = useAppContext();
  const editingDisabled = viewOnly;

  const [loading, setLoading] = useState(false);

  const latestPolicyDraft = useMemo(() => {
    if (!policyDrafts.length) return null;
    const sorted = [...policyDrafts].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
    return sorted[0];
  }, [policyDrafts]);

  const effectivePolicy = useMemo(() => {
    if (latestPolicyDraft?.data) return latestPolicyDraft.data as any;
    return policy || null;
  }, [latestPolicyDraft, policy]);

  const [policyForm, setPolicyForm] = useState<PolicyFormState>(() => {
    if (effectivePolicy) {
      return {
        ...defaultPolicy(),
        ...effectivePolicy,
        policyId: effectivePolicy.policyId || null,
        otaChannel: normalizeAppUpdateChannel((effectivePolicy as any).otaChannel),
        apkForceAfter: toDateInput((effectivePolicy as any).apkForceAfter),
      };
    }
    return defaultPolicy();
  });

  useEffect(() => {
    if (effectivePolicy) {
      setPolicyForm({
        ...defaultPolicy(),
        ...effectivePolicy,
        policyId: (effectivePolicy as any).policyId || null,
        otaChannel: normalizeAppUpdateChannel((effectivePolicy as any).otaChannel),
        apkForceAfter: toDateInput((effectivePolicy as any).apkForceAfter),
      });
    } else {
      setPolicyForm(defaultPolicy());
    }
  }, [effectivePolicy]);

  const releaseRows = useMemo(() => {
    return buildAppUpdateReleaseRows(apkReleases, apkReleaseDrafts);
  }, [apkReleaseDrafts, apkReleases]);

  const publishedReleaseRows = useMemo(() => {
    return releaseRows.filter((release) => !release.__draft);
  }, [releaseRows]);

  const resolvePublishedReleaseId = useCallback((releaseId?: string | null) => {
    if (!releaseId) return null;
    if (publishedReleaseRows.some((release) => release.apkReleaseId === releaseId)) return releaseId;

    const draft = apkReleaseDrafts.find((entry) => {
      const payload = (entry.data || {}) as any;
      return entry.apkReleaseDraftId === releaseId || payload.apkReleaseId === releaseId;
    });
    if (!draft) return releaseId;

    const semanticKey = releaseSemanticKey((draft.data || {}) as any);
    return publishedReleaseRows.find((release) => releaseSemanticKey(release) === semanticKey)?.apkReleaseId || releaseId;
  }, [apkReleaseDrafts, publishedReleaseRows]);

  const releaseOptions = useMemo(() => {
    return publishedReleaseRows.map((r) => {
      const ready = isApkReleaseDeviceAvailable(r);
      const openChecks = getApkReleaseReadiness(r)
        .filter((check) => !check.passed)
        .map((check) => check.label);

      return {
        value: r.apkReleaseId,
        ready,
        label: `${r.versionName || ""} (${r.versionCode || ""})${ready ? "" : " - not ready"}`,
        description: openChecks[0] || "",
      };
    });
  }, [publishedReleaseRows]);

  const releasesById = useMemo(() => {
    return new Map(publishedReleaseRows.map((release) => [release.apkReleaseId, release]));
  }, [publishedReleaseRows]);

  const latestRelease = useMemo(() => {
    return publishedReleaseRows.find((release) => isApkReleaseDeviceAvailable(release)) || null;
  }, [publishedReleaseRows]);

  useEffect(() => {
    setPolicyForm((prev) => {
      const resolvedCurrentApkReleaseId = resolvePublishedReleaseId(prev.currentApkReleaseId);
      const resolvedRollbackApkReleaseId = resolvePublishedReleaseId(prev.rollbackApkReleaseId);

      if (resolvedCurrentApkReleaseId === prev.currentApkReleaseId
        && resolvedRollbackApkReleaseId === prev.rollbackApkReleaseId) {
        return prev;
      }

      return {
        ...prev,
        currentApkReleaseId: resolvedCurrentApkReleaseId,
        rollbackApkReleaseId: resolvedRollbackApkReleaseId,
      };
    });
  }, [resolvePublishedReleaseId]);

  useEffect(() => {
    if (!latestRelease) return;
    if (effectivePolicy) return;
    setPolicyForm((prev) => {
      const next = { ...prev };
      if (!next.runtimeVersion) next.runtimeVersion = latestRelease.runtimeVersion || "";
      if (!next.currentApkReleaseId) next.currentApkReleaseId = latestRelease.apkReleaseId || null;
      return next;
    });
  }, [effectivePolicy, latestRelease]);

  const onSavePolicy = useCallback(async () => {
    try {
      if (editingDisabled) return;
      setLoading(true);

      const payload = normalizeAppUpdatePolicyPayload({
        ...policyForm,
        apkGracePeriodHours: policyForm.apkGracePeriodHours ?? null,
        apkForceAfter: policyForm.apkForceAfter ? new Date(policyForm.apkForceAfter) : null,
        policyVersion: Number(policyForm.policyVersion || 1),
      } as any);

      const errors = validateAppUpdatePolicyPayload(payload, releasesById);
      if (errors.length) throw new Error(errors.join(", "));

      const res = await saveAppUpdatePolicies({ data: [payload] });

      if (res.errors?.length) {
        throw new Error(res.errors.join(", "));
      }

      router.refresh();

      alert({
        title: "Success",
        message: "App update policy saved to drafts.",
        variant: "success",
      });
    } catch (e: any) {
      alert({
        title: "Error",
        message: `Failed to save policy: ${e.message}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [alert, editingDisabled, policyForm, releasesById, router, saveAppUpdatePolicies]);

  const selectedDeliveryMode = deliveryModes.find((mode) => mode.value === policyForm.apkDeliveryMode);

  return (
    <>
      {loading && <Loader overlay />}

      <Card>
        <CardContent className="p-4">
          <div>
            <div className="text-sm text-muted-foreground">Policy draft</div>
            <div className="text-xs text-muted-foreground">
              {latestPolicyDraft
                ? `Draft updated ${latestPolicyDraft.updatedAt?.toString?.() || ""}`
                : policy
                ? "Published policy is live"
                : "No policy yet"}
            </div>
            {latestRelease ? (
              <div className="text-xs text-muted-foreground">
                Latest APK: {latestRelease.versionName} ({latestRelease.versionCode})
              </div>
            ) : null}
           
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-6">
            <div>
              <Label>Runtime Version</Label>
              <Input
                value={policyForm.runtimeVersion}
                onChange={(e) => setPolicyForm((prev) => ({ ...prev, runtimeVersion: e.target.value }))}
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>OTA Channel</Label>
              <Select
                value={policyForm.otaChannel}
                onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, otaChannel: value }))}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select OTA channel" />
                </SelectTrigger>
                <SelectContent>
                  {appUpdateChannels.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-1 text-xs text-muted-foreground">
                Match the Expo update channel used by the tablet build.
              </div>
            </div>

            <div>
              <Label>Current APK Release</Label>
              <Select
                value={policyForm.currentApkReleaseId || ""}
                onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, currentApkReleaseId: value || null }))}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select current APK" />
                </SelectTrigger>
                <SelectContent>
                  {releaseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={!opt.ready}>
                      {opt.description ? `${opt.label} (${opt.description})` : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-1 text-xs text-muted-foreground">
                Only published APK releases can be attached to a policy.
              </div>
            </div>

            <div>
              <Label>APK Delivery Mode</Label>
              <Select
                value={policyForm.apkDeliveryMode}
                onValueChange={(value) => setPolicyForm((prev) => ({
                  ...prev,
                  apkDeliveryMode: value,
                  apkAutoDownload: value === "in_app" || value === "hybrid" ? prev.apkAutoDownload : false,
                }))}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery mode" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-1 text-xs text-muted-foreground">
                {selectedDeliveryMode?.description || "Choose how this APK should reach tablets."}
              </div>
            </div>

            <div>
              <Label>Country</Label>
              <Select
                value={policyForm.targetCountryISO || "all"}
                onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, targetCountryISO: value === "all" ? null : value }))}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose the country this policy applies to, or leave it available everywhere.
              </p>
            </div>

            <div>
              <Label>Target Scope</Label>
              <Select
                value={policyForm.targetScope}
                onValueChange={(value) => setPolicyForm((prev) => ({
                  ...prev,
                  targetScope: value,
                  targetGroupId: value === "group" ? prev.targetGroupId : null,
                  targetHospitalId: value === "hospital" ? prev.targetHospitalId : null,
                }))}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target scope" />
                </SelectTrigger>
                <SelectContent>
                  {targetScopes.map((scope) => (
                    <SelectItem key={scope.value} value={scope.value}>
                      {scope.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {policyForm.targetScope === "group" ? (
            <div>
              <Label>Target Group ID</Label>
              {mdmGroupOptions.length ? (
                <Select
                  value={policyForm.targetGroupId || "none"}
                  onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, targetGroupId: value === "none" ? null : value }))}
                  disabled={editingDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select MDM group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No MDM group</SelectItem>
                    {mdmGroupOptions.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={policyForm.targetGroupId || ""}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, targetGroupId: e.target.value || null }))}
                  disabled={editingDisabled}
                  placeholder="Sync Headwind devices to load groups"
                />
              )}
            </div>
            ) : null}

            {policyForm.targetScope === "hospital" ? (
            <div>
              <Label>Target Hospital ID</Label>
              <Select
                value={policyForm.targetHospitalId || "none"}
                onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, targetHospitalId: value === "none" ? null : value }))}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No hospital</SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.hospitalId} value={hospital.hospitalId}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Switch
                checked={policyForm.otaEnabled}
                onCheckedChange={(checked) => setPolicyForm((prev) => ({ ...prev, otaEnabled: checked }))}
                disabled={editingDisabled}
              />
              <Label>OTA Enabled</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={policyForm.apkAutoDownload}
                onCheckedChange={(checked) => setPolicyForm((prev) => ({ ...prev, apkAutoDownload: checked }))}
                disabled={editingDisabled || policyForm.apkDeliveryMode === "mdm" || policyForm.apkDeliveryMode === "manual"}
              />
              <Label>Auto-download APK</Label>
            </div>
          </div>

          <details className="mt-6 rounded-md border p-4">
            <summary className="cursor-pointer text-sm font-medium">Advanced update rules</summary>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Policy Version</Label>
                <Input
                  type="number"
                  value={policyForm.policyVersion ?? 1}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, policyVersion: Number(e.target.value || 1) }))}
                  disabled={editingDisabled}
                />
              </div>

              <div>
                <Label>APK Install Window</Label>
                <Select
                  value={policyForm.apkInstallWindow}
                  onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, apkInstallWindow: value }))}
                  disabled={editingDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select install window" />
                  </SelectTrigger>
                  <SelectContent>
                    {installWindows.map((window) => (
                      <SelectItem key={window.value} value={window.value}>
                        {window.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={policyForm.apkForceInstall}
                  onCheckedChange={(checked) => setPolicyForm((prev) => ({ ...prev, apkForceInstall: checked }))}
                  disabled={editingDisabled}
                />
                <Label>Force install APK</Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={policyForm.rollbackEnabled}
                  onCheckedChange={(checked) => setPolicyForm((prev) => ({ ...prev, rollbackEnabled: checked }))}
                  disabled={editingDisabled}
                />
                <Label>Rollback enabled</Label>
              </div>

              <div>
                <Label>APK Grace Period (hours)</Label>
                <Input
                  type="number"
                  value={policyForm.apkGracePeriodHours ?? ""}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apkGracePeriodHours: toNumberOrNull(e.target.value),
                    }))
                  }
                  disabled={editingDisabled}
                />
              </div>

              <div>
                <Label>APK Force After</Label>
                <Input
                  type="datetime-local"
                  value={policyForm.apkForceAfter ?? ""}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, apkForceAfter: e.target.value || null }))}
                  disabled={editingDisabled}
                />
              </div>

              <div>
                <Label>Rollback APK Release</Label>
                <Select
                  value={policyForm.rollbackApkReleaseId || ""}
                  onValueChange={(value) => setPolicyForm((prev) => ({ ...prev, rollbackApkReleaseId: value || null }))}
                  disabled={editingDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rollback APK" />
                  </SelectTrigger>
                  <SelectContent>
                    {releaseOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} disabled={!opt.ready}>
                        {opt.description ? `${opt.label} (${opt.description})` : opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-1 text-xs text-muted-foreground">
                  Publish the rollback APK release first before selecting it here.
                </div>
              </div>

              <div>
                <Label>APK Message Title</Label>
                <Input
                  value={policyForm.apkMessageTitle || ""}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, apkMessageTitle: e.target.value }))}
                  disabled={editingDisabled}
                />
              </div>

              <div className="md:col-span-2">
                <Label>APK Message Body</Label>
                <Textarea
                  value={policyForm.apkMessageBody || ""}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, apkMessageBody: e.target.value }))}
                  disabled={editingDisabled}
                />
              </div>
            </div>
          </details>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => router.push("/app-updates")}>
              Cancel
            </Button>
            <Button onClick={onSavePolicy} disabled={loading || editingDisabled} aria-busy={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving draft...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
