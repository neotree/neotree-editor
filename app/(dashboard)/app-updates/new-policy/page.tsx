
import { redirect } from "next/navigation";

import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessPage } from "@/app/actions/is-allowed";
import * as appUpdatesActions from "@/app/actions/app-updates";
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

  const [policyRes, policyDraftsRes, releasesRes, releaseDraftsRes] = await Promise.all([
    appUpdatesActions.getAppUpdatePolicy(),
    appUpdatesActions.getAppUpdatePolicyDrafts(),
    appUpdatesActions.getApkReleases(),
    appUpdatesActions.getApkReleaseDrafts(),
  ]);

  return (
    <>
      <Title>App Update Policy</Title>
      <Content>
        <AppUpdatePolicyForm
          policy={policyRes.data}
          policyDrafts={policyDraftsRes.data}
          apkReleases={releasesRes.data}
          apkReleaseDrafts={releaseDraftsRes.data}
          saveAppUpdatePolicies={appUpdatesActions.saveAppUpdatePolicies}
        />
      </Content>
    </>
  );
}
