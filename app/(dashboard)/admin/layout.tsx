import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { AdminHeader } from "./components/header";
import { Card, CardContent } from "@/components/ui/card";
import { getSys } from "@/app/actions/sys";

export default async function AdminPageLayout({ children }: {
    children: React.ReactNode;
}) {
    const [sys, user] = await Promise.all([
        getSys(),
        getAuthenticatedUser(),
    ]);

    if (!user) redirect('/login');

    if (sys.data.hide_admin_page === 'yes') redirect('/not-found');

    return (
        <>
            <Title>Admin</Title>

            <Content>
                <Card>
                    <CardContent className="px-0">
                        <AdminHeader user={user} />
                        {children}
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
