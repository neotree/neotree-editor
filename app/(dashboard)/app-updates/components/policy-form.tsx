'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "@/components/loader";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";

import type { saveAppUpdatePolicies } from "@/app/actions/app-updates";
import type { AppUpdatePolicy, AppUpdatePolicyDraft, ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases } from "@/databases/pg/schema";

const installWindows = ["on_restart", "idle", "immediate"] as const;

type ApkRelease = typeof apkReleases.$inferSelect;

type Props = {
  policy: AppUpdatePolicy | null;
  policyDrafts: AppUpdatePolicyDraft[];
  apkReleases: ApkRelease[];
  apkReleaseDrafts: ApkReleaseDraft[];
  saveAppUpdatePolicies: typeof saveAppUpdatePolicies;
};

type PolicyFormState = {
  policyId?: string | null;
  runtimeVersion: string;
  policyVersion: number;
  otaEnabled: boolean;
  otaChannel: string;
  apkAutoDownload: boolean;
  apkForceInstall: boolean;
  apkGracePeriodHours?: number | null;
  apkForceAfter?: string | null;
  apkInstallWindow: string;
  apkMessageTitle?: string | null;
  apkMessageBody?: string | null;
  currentApkReleaseId?: string | null;
  rollbackApkReleaseId?: string | null;
};

const defaultPolicy = (): PolicyFormState => ({
  runtimeVersion: "",
  policyVersion: 1,
  otaEnabled: true,
  otaChannel: "production",
  apkAutoDownload: true,
  apkForceInstall: false,
  apkGracePeriodHours: null,
  apkForceAfter: null,
  apkInstallWindow: "on_restart",
  apkMessageTitle: "",
  apkMessageBody: "",
  currentApkReleaseId: null,
  rollbackApkReleaseId: null,
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
        apkForceAfter: toDateInput((effectivePolicy as any).apkForceAfter),
      });
    } else {
      setPolicyForm(defaultPolicy());
    }
  }, [effectivePolicy]);

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

  const releaseOptions = useMemo(() => {
    return releaseRows.map((r) => ({
      value: r.apkReleaseId,
      label: `${r.versionName || ""} (${r.versionCode || ""})${r.__draft ? " - draft" : ""}`,
    }));
  }, [releaseRows]);

  const latestRelease = useMemo(() => {
    return releaseRows[0] || null;
  }, [releaseRows]);

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

      const payload = {
        ...policyForm,
        apkGracePeriodHours: policyForm.apkGracePeriodHours ?? null,
        apkForceAfter: policyForm.apkForceAfter ? new Date(policyForm.apkForceAfter) : null,
        policyVersion: Number(policyForm.policyVersion || 1),
      } as any;

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
  }, [alert, editingDisabled, policyForm, router, saveAppUpdatePolicies]);

  return (
    <>
      {loading && <Loader overlay />}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              <div className="text-xs text-muted-foreground">
                {viewOnly
                  ? "View mode: edits disabled"
                  : mode === "development"
                  ? "Development mode: drafts enabled"
                  : `Mode: ${mode}`}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => router.push("/app-updates")}>Cancel</Button>
              <Button onClick={onSavePolicy} disabled={loading || editingDisabled}>
                Save Draft
              </Button>
            </div>
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
              <Label>Policy Version</Label>
              <Input
                type="number"
                value={policyForm.policyVersion ?? 1}
                onChange={(e) => setPolicyForm((prev) => ({ ...prev, policyVersion: Number(e.target.value || 1) }))}
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>OTA Channel</Label>
              <Input
                value={policyForm.otaChannel}
                onChange={(e) => setPolicyForm((prev) => ({ ...prev, otaChannel: e.target.value }))}
                disabled={editingDisabled}
              />
            </div>

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
                disabled={editingDisabled}
              />
              <Label>Auto-download APK</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={policyForm.apkForceInstall}
                onCheckedChange={(checked) => setPolicyForm((prev) => ({ ...prev, apkForceInstall: checked }))}
                disabled={editingDisabled}
              />
              <Label>Force install APK</Label>
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
                    <SelectItem key={window} value={window}>
                      {window}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <Label>APK Message Title</Label>
              <Input
                value={policyForm.apkMessageTitle || ""}
                onChange={(e) => setPolicyForm((prev) => ({ ...prev, apkMessageTitle: e.target.value }))}
                disabled={editingDisabled}
              />
            </div>
            <div>
              <Label>APK Message Body</Label>
              <Textarea
                value={policyForm.apkMessageBody || ""}
                onChange={(e) => setPolicyForm((prev) => ({ ...prev, apkMessageBody: e.target.value }))}
                disabled={editingDisabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
