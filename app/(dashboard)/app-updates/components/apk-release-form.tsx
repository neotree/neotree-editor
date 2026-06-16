'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadModal } from "@/components/upload-modal";
import { Loader } from "@/components/loader";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Link2 } from "lucide-react";

import type { importEasApkReleaseDraft, saveApkReleases } from "@/app/actions/app-updates";
import type { ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases } from "@/databases/pg/schema";
import { getApkReleaseReadiness, normalizeApkReleasePayload, validateApkReleasePayload } from "@/lib/app-updates/validation";

const apkReleaseStatuses = [
  "uploaded",
  "validated",
  "approved",
  "available",
  "deprecated",
  "revoked",
  "rolled_back",
] as const;

type ApkRelease = typeof apkReleases.$inferSelect;

type Props = {
  apkReleases: ApkRelease[];
  apkReleaseDrafts: ApkReleaseDraft[];
  apkReleaseId?: string | null;
  saveApkReleases: typeof saveApkReleases;
  importEasApkReleaseDraft: typeof importEasApkReleaseDraft;
};

type ApkFormState = {
  apkReleaseId?: string | null;
  runtimeVersion: string;
  versionName: string;
  versionCode: number | null;
  status: string;
  isAvailable: boolean;
  fileId?: string | null;
  fileSize?: number | null;
  checksumSha256?: string | null;
  signatureSha256?: string | null;
  releaseNotes?: string | null;
  // Informational metadata read from the APK (not persisted on the release row).
  packageName?: string | null;
  minSdkVersion?: number | null;
  targetSdkVersion?: number | null;
};

const defaultApkForm = (): ApkFormState => ({
  runtimeVersion: "",
  versionName: "",
  versionCode: null,
  status: "uploaded",
  isAvailable: false,
  fileId: null,
  fileSize: null,
  checksumSha256: null,
  signatureSha256: null,
  releaseNotes: "",
  packageName: null,
  minSdkVersion: null,
  targetSdkVersion: null,
});

const toNumberOrNull = (value: string) => {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function ApkReleaseForm({
  apkReleases,
  apkReleaseDrafts,
  apkReleaseId,
  saveApkReleases,
  importEasApkReleaseDraft,
}: Props) {
  const router = useRouter();
  const { alert } = useAlertModal();
  const { viewOnly, mode } = useAppContext();
  const editingDisabled = viewOnly;

  const [loading, setLoading] = useState(false);
  const [artifactUrl, setArtifactUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [apkSource, setApkSource] = useState<"eas" | "upload">("eas");

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

  const latestRelease = useMemo(() => {
    return releaseRows[0] || null;
  }, [releaseRows]);

  const initialRelease = useMemo(() => {
    if (!apkReleaseId) return null;
    return releaseRows.find((release) => release.apkReleaseId === apkReleaseId) || null;
  }, [apkReleaseId, releaseRows]);

  const [apkForm, setApkForm] = useState<ApkFormState>(() => defaultApkForm());

  useEffect(() => {
    if (initialRelease) {
      setApkForm({
        ...defaultApkForm(),
        ...initialRelease,
        apkReleaseId: initialRelease.apkReleaseId,
        versionCode: initialRelease.versionCode ?? null,
      });
      return;
    }
    setApkForm(defaultApkForm());
  }, [initialRelease]);

  useEffect(() => {
    if (initialRelease) return;
    if (!latestRelease) return;
    setApkForm((prev) => {
      if (prev.runtimeVersion || prev.versionName || prev.versionCode) return prev;
      return {
        ...prev,
        runtimeVersion: latestRelease.runtimeVersion || "",
        versionName: latestRelease.versionName || "",
        versionCode: typeof latestRelease.versionCode === "number" ? latestRelease.versionCode + 1 : null,
      };
    });
  }, [initialRelease, latestRelease]);

  const onSaveApkRelease = useCallback(async () => {
    try {
      if (editingDisabled) return;
      setLoading(true);

      if (!apkForm.runtimeVersion) throw new Error("Runtime version is required");
      if (!apkForm.versionName) throw new Error("Version name is required");
      if (!apkForm.versionCode) throw new Error("Version code is required");

      const payload = normalizeApkReleasePayload({
        ...apkForm,
        versionCode: Number(apkForm.versionCode || 0),
      } as any);

      const errors = validateApkReleasePayload(payload);
      if (errors.length) throw new Error(errors.join(", "));

      const res = await saveApkReleases({ data: [payload] });

      if (res.errors?.length) {
        throw new Error(res.errors.join(", "));
      }

      router.refresh();

      alert({
        title: "Success",
        message: "APK release saved to drafts.",
        variant: "success",
      });
    } catch (e: any) {
      alert({
        title: "Error",
        message: `Failed to save APK release: ${e.message}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [alert, apkForm, editingDisabled, router, saveApkReleases]);

  const onUploadApk = useCallback(async (formData: FormData) => {
    if (editingDisabled) return;
    const response = await axios.post("/api/files/upload", formData);
    const res = response.data as { data?: any; errors?: string[] };
    if (res.errors?.length) throw new Error(res.errors.join(", "));
    const file = res.data;
    if (!file?.fileId) throw new Error("File upload failed");

    setApkForm((prev) => ({
      ...prev,
      fileId: file.fileId,
      fileSize: file.size || prev.fileSize || null,
      checksumSha256: file.metadata?.apkChecksumSha256 || prev.checksumSha256 || null,
      signatureSha256: file.metadata?.apkSignatureSha256 || prev.signatureSha256 || null,
      // Auto-fill version details extracted from the APK (like Headwind).
      versionName: file.metadata?.apkVersionName || prev.versionName,
      versionCode: file.metadata?.apkVersionCode ?? prev.versionCode,
      packageName: file.metadata?.apkPackageName || prev.packageName || null,
      minSdkVersion: file.metadata?.apkMinSdkVersion ?? prev.minSdkVersion ?? null,
      targetSdkVersion: file.metadata?.apkTargetSdkVersion ?? prev.targetSdkVersion ?? null,
    }));
  }, [editingDisabled]);

  const onImportEasArtifact = useCallback(async () => {
    try {
      if (editingDisabled) return;
      if (!artifactUrl.trim()) throw new Error("Paste the EAS APK link first");
      if (!apkForm.runtimeVersion) throw new Error("Enter the runtime version first");
      // Version name/code are read from the APK automatically; no need to type them.

      setImporting(true);
      const formData = new FormData();
      formData.set("artifactUrl", artifactUrl.trim());
      formData.set("apkReleaseId", apkForm.apkReleaseId || "");
      formData.set("runtimeVersion", apkForm.runtimeVersion);
      formData.set("versionName", apkForm.versionName);
      formData.set("versionCode", `${apkForm.versionCode}`);
      formData.set("releaseNotes", apkForm.releaseNotes || "");

      const result = await importEasApkReleaseDraft(formData);
      if (!result.success) throw new Error(result.errors?.join(", ") || "Could not import APK");

      setApkForm((prev) => ({
        ...prev,
        status: "uploaded",
        isAvailable: false,
        fileId: result.data?.fileId || prev.fileId,
        fileSize: result.data?.fileSize || prev.fileSize,
        checksumSha256: result.data?.checksumSha256 || prev.checksumSha256,
        signatureSha256: result.data?.signatureSha256 || prev.signatureSha256,
        versionName: result.data?.versionName || prev.versionName,
        versionCode: result.data?.versionCode ?? prev.versionCode,
        packageName: result.data?.packageName || prev.packageName || null,
        minSdkVersion: result.data?.minSdkVersion ?? prev.minSdkVersion ?? null,
        targetSdkVersion: result.data?.targetSdkVersion ?? prev.targetSdkVersion ?? null,
      }));
      router.refresh();
      if (!result.data?.signatureSha256) {
        alert({
          title: "APK imported - verification pending",
          message: "NeoTree copied the EAS APK, but the server could not verify its signing certificate yet. The release is saved as a draft and will stay blocked from device rollout until APK verification is enabled on the server and the APK is imported or uploaded again.",
          variant: "info",
        });
      } else {
        alert({
          title: "APK imported",
          message: "NeoTree copied the EAS APK into its own storage and saved a release draft for review.",
          variant: "success",
        });
      }
    } catch (e: any) {
      alert({
        title: "Import failed",
        message: e.message || "Could not import the EAS APK link.",
        variant: "error",
      });
    } finally {
      setImporting(false);
    }
  }, [alert, apkForm, artifactUrl, editingDisabled, importEasApkReleaseDraft, router]);

  const resetApkForm = useCallback(() => {
    setApkForm(defaultApkForm());
  }, []);

  const readiness = useMemo(() => getApkReleaseReadiness(normalizeApkReleasePayload(apkForm)), [apkForm]);
  const apkArtifactReady = useMemo(
    () => readiness.filter((check) => check.key !== "status").every((check) => check.passed),
    [readiness],
  );
  const validationErrors = useMemo(() => validateApkReleasePayload(normalizeApkReleasePayload(apkForm)), [apkForm]);

  const explainBlockedAvailability = useCallback(() => {
    const openChecks = readiness
      .filter((check) => check.key !== "status" && !check.passed)
      .map((check) => check.label);

    alert({
      title: "Release is not ready",
      message: openChecks.length
        ? `NeoTree cannot make this APK available yet. Missing: ${openChecks.join(", ")}.`
        : "NeoTree cannot make this APK available yet. Review the release checks first.",
      variant: "error",
    });
  }, [alert, readiness]);

  return (
    <>
      {loading && <Loader overlay />}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">APK release draft</div>
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
              <Button variant="primary-outline" onClick={resetApkForm} disabled={editingDisabled}>
                Reset
              </Button>
              <Button onClick={onSaveApkRelease} disabled={loading || editingDisabled}>
                Save Draft
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {readiness.map((check) => (
              <div key={check.key} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  {check.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <span>{check.label}</span>
                </div>
                <Badge variant={check.passed ? "default" : "secondary"}>{check.passed ? "Pass" : "Open"}</Badge>
              </div>
            ))}
          </div>

          {validationErrors.length ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {validationErrors[0]}
              {validationErrors.length > 1 ? ` and ${validationErrors.length - 1} more` : ""}
            </div>
          ) : null}

          <div className="mt-6 rounded-md border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-medium">APK source</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Choose where NeoTree should get the APK from. EAS build link is recommended because it avoids manual file handling.
                </div>
              </div>
              <div className="w-full lg:w-64">
                <Select
                  value={apkSource}
                  onValueChange={(value) => setApkSource(value as "eas" | "upload")}
                  disabled={editingDisabled || importing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select APK source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eas">EAS build link</SelectItem>
                    <SelectItem value="upload">Upload APK file</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {apkSource === "eas" ? (
              <>
                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={artifactUrl}
                      onChange={(event) => setArtifactUrl(event.target.value)}
                      placeholder="Paste EAS APK download link"
                      disabled={editingDisabled || importing}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={onImportEasArtifact}
                    disabled={editingDisabled || importing}
                  >
                    {importing ? "Importing..." : "Import APK"}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Enter the runtime version first. NeoTree copies the APK, reads version details, captures checksum and signing certificate, then saves a draft for review.
                </div>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
                <UploadModal
                  type=".apk,application/vnd.android.package-archive"
                  inputProps={{ multiple: false, placeholder: "Choose APK" }}
                  onUpload={onUploadApk}
                >
                  <Button variant="primary-outline" disabled={editingDisabled}>Upload APK</Button>
                </UploadModal>
                <span className={cn("text-xs", !apkForm.fileId && "text-muted-foreground")}>
                  {apkForm.fileId ? `File: ${apkForm.fileId}` : "No file uploaded"}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-6">
            <div>
              <Label>Runtime Version</Label>
              <Input
                value={apkForm.runtimeVersion}
                onChange={(e) => setApkForm((prev) => ({ ...prev, runtimeVersion: e.target.value }))}
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>Version Name</Label>
              <Input
                value={apkForm.versionName}
                onChange={(e) => setApkForm((prev) => ({ ...prev, versionName: e.target.value }))}
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>Version Code</Label>
              <Input
                type="number"
                value={apkForm.versionCode ?? ""}
                onChange={(e) =>
                  setApkForm((prev) => ({ ...prev, versionCode: toNumberOrNull(e.target.value) }))
                }
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={apkForm.status}
                onValueChange={(value) => {
                  if (value === "available" && !apkArtifactReady) {
                    explainBlockedAvailability();
                    return;
                  }
                  setApkForm((prev) => ({
                    ...prev,
                    status: value,
                    isAvailable: value === "available" ? true : prev.isAvailable,
                  }));
                }}
                disabled={editingDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {apkReleaseStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={apkForm.isAvailable}
                onCheckedChange={(checked) => {
                  if (checked && !apkArtifactReady) {
                    explainBlockedAvailability();
                    return;
                  }
                  setApkForm((prev) => ({
                    ...prev,
                    isAvailable: checked,
                    status: checked ? "available" : prev.status === "available" ? "approved" : prev.status,
                  }));
                }}
                disabled={editingDisabled}
              />
              <Label>Available to devices</Label>
            </div>

            {apkForm.packageName ? (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium mb-1">Detected from APK</p>
                <p className="text-muted-foreground">Package: {apkForm.packageName}</p>
                {apkForm.minSdkVersion != null ? (
                  <p className="text-muted-foreground">Min Android SDK: {apkForm.minSdkVersion}</p>
                ) : null}
                {apkForm.targetSdkVersion != null ? (
                  <p className="text-muted-foreground">Target Android SDK: {apkForm.targetSdkVersion}</p>
                ) : null}
                <p className="text-muted-foreground">Version: {apkForm.versionName || "—"} ({apkForm.versionCode ?? "—"})</p>
              </div>
            ) : null}

            <div>
              <Label>Checksum (SHA-256)</Label>
              <Input value={apkForm.checksumSha256 || ""} disabled />
            </div>

            <div>
              <Label>Signature (SHA-256)</Label>
              <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2">
                <span className="min-w-0 truncate text-sm text-muted-foreground">
                  {apkForm.signatureSha256 || "Waiting for automatic APK verification"}
                </span>
                <Badge variant={apkForm.signatureSha256 ? "default" : "secondary"}>
                  {apkForm.signatureSha256 ? "Captured" : "Blocked"}
                </Badge>
              </div>
              {!apkForm.signatureSha256 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  This is captured automatically from the APK. Releases without a verified signing certificate cannot be made available to devices.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <Label>Release Notes</Label>
            <Textarea
              value={apkForm.releaseNotes || ""}
              onChange={(e) => setApkForm((prev) => ({ ...prev, releaseNotes: e.target.value }))}
              disabled={editingDisabled}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
