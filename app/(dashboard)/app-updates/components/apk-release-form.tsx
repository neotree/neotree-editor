'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
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

import type { saveApkReleases } from "@/app/actions/app-updates";
import type { ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases } from "@/databases/pg/schema";

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
  validatedAt?: string | null;
  approvedAt?: string | null;
  releasedAt?: string | null;
  releaseNotes?: string | null;
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
  validatedAt: null,
  approvedAt: null,
  releasedAt: null,
  releaseNotes: "",
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

export function ApkReleaseForm({
  apkReleases,
  apkReleaseDrafts,
  apkReleaseId,
  saveApkReleases,
}: Props) {
  const router = useRouter();
  const { alert } = useAlertModal();
  const { viewOnly, mode } = useAppContext();
  const editingDisabled = viewOnly;

  const [loading, setLoading] = useState(false);

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
        validatedAt: toDateInput(initialRelease.validatedAt),
        approvedAt: toDateInput(initialRelease.approvedAt),
        releasedAt: toDateInput(initialRelease.releasedAt),
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

      const payload = {
        ...apkForm,
        versionCode: Number(apkForm.versionCode || 0),
        validatedAt: apkForm.validatedAt ? new Date(apkForm.validatedAt) : null,
        approvedAt: apkForm.approvedAt ? new Date(apkForm.approvedAt) : null,
        releasedAt: apkForm.releasedAt ? new Date(apkForm.releasedAt) : null,
      } as any;

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
    }));
  }, [editingDisabled]);

  const resetApkForm = useCallback(() => {
    setApkForm(defaultApkForm());
  }, []);

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
                onValueChange={(value) => setApkForm((prev) => ({ ...prev, status: value }))}
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
                onCheckedChange={(checked) => setApkForm((prev) => ({ ...prev, isAvailable: checked }))}
                disabled={editingDisabled}
              />
              <Label>Available to devices</Label>
            </div>

            <div className="flex items-center gap-2">
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

            <div>
              <Label>Checksum (SHA-256)</Label>
              <Input value={apkForm.checksumSha256 || ""} disabled />
            </div>

            <div>
              <Label>Signature (SHA-256)</Label>
              <Input value={apkForm.signatureSha256 || ""} disabled />
            </div>

            <div>
              <Label>Validated At</Label>
              <Input
                type="datetime-local"
                value={apkForm.validatedAt || ""}
                onChange={(e) => setApkForm((prev) => ({ ...prev, validatedAt: e.target.value || null }))}
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>Approved At</Label>
              <Input
                type="datetime-local"
                value={apkForm.approvedAt || ""}
                onChange={(e) => setApkForm((prev) => ({ ...prev, approvedAt: e.target.value || null }))}
                disabled={editingDisabled}
              />
            </div>

            <div>
              <Label>Released At</Label>
              <Input
                type="datetime-local"
                value={apkForm.releasedAt || ""}
                onChange={(e) => setApkForm((prev) => ({ ...prev, releasedAt: e.target.value || null }))}
                disabled={editingDisabled}
              />
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
