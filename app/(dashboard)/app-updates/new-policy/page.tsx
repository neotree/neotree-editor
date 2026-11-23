
import { redirect } from "next/navigation";

import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessPage } from "@/app/actions/is-allowed";
import * as appUpdatesActions from "@/app/actions/app-updates";
import { getDeviceManagementOverview } from "@/app/actions/device-management";
import { getHospitals } from "@/app/actions/hospitals";
import { AppUpdatePolicyForm } from "../components/policy-form";

export const dynamic = "force-dynamic";

export default async function AppUpdatePolicyPage() {
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

  const [policyRes, policyDraftsRes, releasesRes, releaseDraftsRes, hospitalsRes, deviceManagementRes] = await Promise.all([
    appUpdatesActions.getAppUpdatePolicy(),
    appUpdatesActions.getAppUpdatePolicyDrafts(),
    appUpdatesActions.getApkReleases(),
    appUpdatesActions.getApkReleaseDrafts(),
    getHospitals({ returnDraftsIfExist: false }),
    getDeviceManagementOverview(),
  ]);

  const mdmGroupOptions = Array.from(
    new Map(
      [
        ...(deviceManagementRes.data.links || []),
        ...(deviceManagementRes.data.inventory || []),
      ]
        .filter((item: any) => item.mdmGroupId)
        .map((item: any) => [
          item.mdmGroupId,
          {
            value: item.mdmGroupId,
            label: item.mdmGroupName || item.mdmGroupId,
          },
        ]),
    ).values(),
  );

  return (
    <>
      <Title>App Update Policy</Title>
      <Content>
        <AppUpdatePolicyForm
          policy={policyRes.data}
          policyDrafts={policyDraftsRes.data}
          apkReleases={releasesRes.data}
          apkReleaseDrafts={releaseDraftsRes.data}
          hospitals={hospitalsRes.data || []}
          mdmGroupOptions={mdmGroupOptions}
          saveAppUpdatePolicies={appUpdatesActions.saveAppUpdatePolicies}
        />
      </Content>
    </>
  );
}
