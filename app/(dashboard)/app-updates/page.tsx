import { redirect } from "next/navigation";

import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessPage } from "@/app/actions/is-allowed";
import * as appUpdatesActions from "@/app/actions/app-updates";
import { getDeviceUpdateEvents } from "@/app/actions/update-events";
import { AppUpdatesClient } from "./components/app-updates-client";

export const dynamic = "force-dynamic";

export default async function AppUpdatesPage() {
  const { user, yes: hasAccess } = await canAccessPage();

  if (!user) redirect("/login");

  if (!hasAccess) {
    return (
      <Content>
        <Card>
          <CardContent className="p-4 text-xl text-center text-danger bg-danger/10">
            You don&apos;t have sufficient rights to access this page!
          </CardContent>
        </Card>
      </Content>
    );
  }

  const [policyRes, policyDraftsRes, releasesRes, releaseDraftsRes, otaEventsRes] = await Promise.all([
        appUpdatesActions.getAppUpdatePolicy(),
        appUpdatesActions.getAppUpdatePolicyDrafts(),
        appUpdatesActions.getApkReleases(),
        appUpdatesActions.getApkReleaseDrafts(),
        getDeviceUpdateEvents({ limit: 200, offset: 0 }),
      ]);

  return (
    <>
      <Title>App Updates</Title>
      <Content>
        <AppUpdatesClient
          policy={policyRes.data}
          policyDrafts={policyDraftsRes.data}
          apkReleases={releasesRes.data}
          apkReleaseDrafts={releaseDraftsRes.data}
          otaEvents={otaEventsRes.data || []}
        />
      </Content>
    </>
  );
}
