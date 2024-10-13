import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { SettingsHeader } from "./components/header";
import { Card, CardContent } from "@/components/ui/card";

export default async function SettingsPageLayout({ children }: {
    children: React.ReactNode;
}) {
    const [user] = await Promise.all([
        getAuthenticatedUser(),
    ]);

    if (!user) redirect('/login');

    return (
        <>
            <Title>Settings</Title>

            <Content>
                <Card>
                    <CardContent className="px-0">
                        <SettingsHeader user={user} />
                        {children}
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
