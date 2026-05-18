import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getMdmProviderProfile } from "@/app/actions/device-management";
import { canAccessPage } from "@/app/actions/is-allowed";
import { Alert } from "@/components/alert";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceManagementProfileForm } from "../../components/device-management-profile-form";

export const dynamic = "force-dynamic";

type Props = {
  params: { profileId: string };
};

export default async function EditMdmProfilePage({ params }: Props) {
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

  const profile = await getMdmProviderProfile(params.profileId);

  if (!profile.data) {
    return <Alert title="Not found" message="MDM profile was not found or it might have been deleted!" redirectTo="/device-management" />;
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
              <span>Edit MDM profile</span>
            </div>
            <DeviceManagementProfileForm profile={profile.data} />
          </CardContent>
        </Card>
      </Content>
    </>
  );
}
