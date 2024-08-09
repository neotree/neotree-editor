import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { AdminHeader } from "./components/header";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminPageLayout({ children }: {
    children: React.ReactNode;
}) {
    const [user] = await Promise.all([
        getAuthenticatedUser(),
    ]);

    if (!user) redirect('/sign-in');

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
