
import { redirect } from "next/navigation";

import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessPage } from "@/app/actions/is-allowed";
import * as appUpdatesActions from "@/app/actions/app-updates";
import { ApkReleaseForm } from "../components/apk-release-form";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function AppUpdateApkPage({ searchParams }: Props) {
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

  const [releasesRes, releaseDraftsRes] = await Promise.all([
    appUpdatesActions.getApkReleases(),
    appUpdatesActions.getApkReleaseDrafts(),
  ]);

  const apkReleaseId =
    typeof searchParams?.apkReleaseId === "string" ? searchParams?.apkReleaseId : undefined;

  return (
    <>
      <Title>APK Release</Title>
      <Content>
        <ApkReleaseForm
          apkReleases={releasesRes.data}
          apkReleaseDrafts={releaseDraftsRes.data}
          apkReleaseId={apkReleaseId}
          saveApkReleases={appUpdatesActions.saveApkReleases}
        />
      </Content>
    </>
  );
}
