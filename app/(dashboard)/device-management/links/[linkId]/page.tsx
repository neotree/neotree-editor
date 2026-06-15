import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getDeviceMdmLink, getMdmProviderProfiles } from "@/app/actions/device-management";
import { canAccessPage } from "@/app/actions/is-allowed";
import { Alert } from "@/components/alert";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceMdmLinkForm } from "../../components/device-mdm-link-form";

export const dynamic = "force-dynamic";

type Props = {
  params: { linkId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function EditDeviceMdmLinkPage({ params, searchParams }: Props) {
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

  const [link, profiles] = await Promise.all([
    getDeviceMdmLink(params.linkId),
    getMdmProviderProfiles({ includeDisabled: true }),
  ]);

  if (!link.data) {
    return <Alert title="Not found" message="Device MDM link was not found or it might have been deleted!" redirectTo="/device-management" />;
  }

  return (
    <>
      <Title>Device Management</Title>
      <Content>
        <Card className="mb-20">
          <CardContent className="p-0">
            <div className="text-xl flex items-center gap-x-4 mb-4 p-4">
              <Link href="/device-management">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <span>Edit device MDM link</span>
            </div>
            <DeviceMdmLinkForm
              link={link.data}
              profiles={profiles.data}
              error={typeof searchParams?.error === "string" ? searchParams.error : null}
              returnTo={`/device-management/links/${params.linkId}`}
            />
          </CardContent>
        </Card>
      </Content>
    </>
  );
}
