'use client';

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/contexts/app";

import type { AppUpdatePolicy, AppUpdatePolicyDraft, ApkReleaseDraft } from "@/databases/queries/app-updates";
import type { apkReleases, deviceUpdateEvents } from "@/databases/pg/schema";

type ApkRelease = typeof apkReleases.$inferSelect;
type OtaEvent = typeof deviceUpdateEvents.$inferSelect;

type Props = {
  policy: AppUpdatePolicy | null;
  policyDrafts: AppUpdatePolicyDraft[];
  apkReleases: ApkRelease[];
  apkReleaseDrafts: ApkReleaseDraft[];
  otaEvents: OtaEvent[];
};

export function AppUpdatesClient({
  policy,
  policyDrafts,
  apkReleases,
  apkReleaseDrafts,
  otaEvents,
}: Props) {
  const router = useRouter();
  const { viewOnly, mode } = useAppContext();
  const editingDisabled = viewOnly;

  const [activeTab, setActiveTab] = useState("apk");

  const latestPolicyDraft = useMemo(() => {
    if (!policyDrafts.length) return null;
    const sorted = [...policyDrafts].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
    return sorted[0];
  }, [policyDrafts]);

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
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Recommended release flow</div>
              <div className="text-sm">
                1) Upload APK and save a draft {"->"} 2) Mark it available {"->"} 3) Update policy to point to the release
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {latestPolicyDraft
                  ? `Policy draft updated ${latestPolicyDraft.updatedAt?.toString?.() || ""}`
                  : policy
                  ? "Published policy is live"
                  : "No policy yet"}
              </div>
              <div className="text-xs text-muted-foreground">
                {viewOnly
                  ? "View mode: edits disabled"
                  : mode === "development"
                  ? "Development mode: drafts enabled"
                  : `Mode: ${mode}`}
              </div>
            </div>
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
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="apk" className="flex-1">
            APK Updates
          </TabsTrigger>
          <TabsTrigger value="ota" className="flex-1">
            OTA Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apk" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">APK releases</div>
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
                          <td className="py-2 pr-4">{release.status}</td>
                          <td className="py-2 pr-4">{release.isAvailable ? "Yes" : "No"}</td>
                          <td className="py-2 pr-4">{release.__draft ? "Draft" : "Published"}</td>
                          <td className="py-2 pr-4">{release.fileId || ""}</td>
                          <td className="py-2 pr-4">
                            {release.__updatedAt?.toString?.() || release.updatedAt?.toString?.() || ""}
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
        </TabsContent>

        <TabsContent value="ota" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">OTA updates applied (device acknowledgements)</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Device</th>
                        <th className="py-2 pr-4">App Version</th>
                        <th className="py-2 pr-4">Runtime</th>
                        <th className="py-2 pr-4">OTA Update ID</th>
                        <th className="py-2 pr-4">Channel</th>
                        <th className="py-2 pr-4">Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otaAppliedEvents.map((event) => (
                        <tr key={event.eventId} className="border-b">
                          <td className="py-2 pr-4">{event.deviceId}</td>
                          <td className="py-2 pr-4">{event.appVersion || ""}</td>
                          <td className="py-2 pr-4">{event.runtimeVersion || ""}</td>
                          <td className="py-2 pr-4">{event.otaUpdateId || ""}</td>
                          <td className="py-2 pr-4">{event.otaChannel || ""}</td>
                          <td className="py-2 pr-4">{event.createdAt?.toString?.() || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!otaAppliedEvents.length ? (
                    <div className="text-muted-foreground text-sm">No OTA acknowledgements yet.</div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
