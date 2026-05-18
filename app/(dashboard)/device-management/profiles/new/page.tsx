import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { canAccessPage } from "@/app/actions/is-allowed";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceManagementProfileForm } from "../../components/device-management-profile-form";

export const dynamic = "force-dynamic";

export default async function NewMdmProfilePage() {
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
              <span>New MDM profile</span>
            </div>
            <DeviceManagementProfileForm />
          </CardContent>
        </Card>
      </Content>
    </>
  );
}
