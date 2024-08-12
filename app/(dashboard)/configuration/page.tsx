import { redirect } from "next/navigation";

import * as serverActions from '@/app/actions/config-keys';
import { ConfigKeysContextProvider } from "@/contexts/config-keys";
import { Title } from "@/components/title";
import { canAccessPage } from "@/app/actions/is-allowed";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { ConfigKeysTable } from "./components/table";

export default async function ConfigKeysPage() {
    const { user, yes: hasAccess, } = await canAccessPage();

    if (!user) redirect('/login');

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

    const [configKeys] = await Promise.all([
        serverActions.getConfigKeys({ returnDraftsIfExist: true, }),
    ]);

    return (
        <>
            <Title>Configuration</Title>

            <ConfigKeysContextProvider
                {...serverActions}
                configKeys={configKeys}
            >
                <Content>
                    <Card>
                        <CardContent className="p-0">
                            <ConfigKeysTable />
                        </CardContent>
                    </Card>
                </Content>
            </ConfigKeysContextProvider>
        </>
    );
}
