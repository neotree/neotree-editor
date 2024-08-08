import { redirect } from "next/navigation";

import * as serverActions from '@/app/actions/scripts';
import { getHospitals } from "@/app/actions/hospitals";
import { ScriptsContextProvider } from "@/contexts/scripts";
import { Title } from "@/components/title";
import { canAccessPage } from "@/app/actions/is-allowed";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptsTable } from "./components/scripts-table";
import { ScriptsFab } from "./components/scripts-fab";

export default async function ScriptsPage() {
    const { user, yes: hasAccess, } = await canAccessPage();

    if (!user) redirect('/sign-in');

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

    const [scripts] = await Promise.all([
        serverActions.getScripts({ returnDraftsIfExist: true, }),
    ]);

    return (
        <>
            <Title>Scripts</Title>

            <ScriptsContextProvider
                {...serverActions}
                scripts={scripts}
                getHospitals={getHospitals}
            >
                <Content>
                    <Card>
                        <CardContent className="p-0">
                            <ScriptsTable />
                        </CardContent>
                    </Card>
                </Content>

                <ScriptsFab />
            </ScriptsContextProvider>
        </>
    );
}
