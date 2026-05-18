import { redirect } from "next/navigation";

import { getDeviceManagementOverview } from "@/app/actions/device-management";
import { canAccessPage } from "@/app/actions/is-allowed";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { DeviceManagementPanel } from "./components/device-management-panel";

export const dynamic = "force-dynamic";

export default async function DeviceManagementPage() {
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

  const overview = await getDeviceManagementOverview();

  return (
    <>
      <Title>Device Management</Title>
      <Content>
        <DeviceManagementPanel overview={overview.data} />
      </Content>
    </>
  );
}
