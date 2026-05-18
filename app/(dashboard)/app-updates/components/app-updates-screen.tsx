import { redirect } from "next/navigation";

import { canAccessPage } from "@/app/actions/is-allowed";
import * as appUpdatesActions from "@/app/actions/app-updates";
import { getDeviceAppStates } from "@/app/actions/device-app-states";
import { getDeviceUpdateEvents } from "@/app/actions/update-events";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { AppUpdatesClient } from "./app-updates-client";

type AppUpdatesScreenMode = "overview" | "apk" | "ota";

type Props = {
  title: string;
  screen: AppUpdatesScreenMode;
};

export async function AppUpdatesScreen({ title, screen }: Props) {
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

  const [
    policyRes,
    policyDraftsRes,
    releasesRes,
    releaseDraftsRes,
    otaEventsRes,
    deviceStatesRes,
  ] = await Promise.all([
    appUpdatesActions.getAppUpdatePolicy(),
    appUpdatesActions.getAppUpdatePolicyDrafts(),
    appUpdatesActions.getApkReleases(),
    appUpdatesActions.getApkReleaseDrafts(),
    getDeviceUpdateEvents({ limit: 200, offset: 0 }),
    getDeviceAppStates(),
  ]);

  return (
    <>
      <Title>{title}</Title>
      <Content>
        <AppUpdatesClient
          screen={screen}
          policy={policyRes.data}
          policyDrafts={policyDraftsRes.data}
          apkReleases={releasesRes.data}
          apkReleaseDrafts={releaseDraftsRes.data}
          otaEvents={otaEventsRes.data || []}
          deviceAppStates={deviceStatesRes.data || []}
        />
      </Content>
    </>
  );
}
