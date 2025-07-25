import { redirect } from "next/navigation";

import * as serverActions from '@/app/actions/scripts';
import * as filesActions from "@/app/actions/files";
import { getHospitals } from "@/app/actions/hospitals";
import { ScriptsContextProvider } from "@/contexts/scripts";
import { Title } from "@/components/title";
import { canAccessPage } from "@/app/actions/is-allowed";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { getDataKeys } from "@/app/actions/data-keys";

export default async function ScriptsLayout({ children }: {
    children: React.ReactNode;
}) {
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

    const [hospitals, dataKeys] = await Promise.all([
        getHospitals(),
        getDataKeys(),
    ]);

    return (
        <>
            <Title>Scripts</Title>

            <ScriptsContextProvider
                {...serverActions}
                {...filesActions}
                hospitals={hospitals}
                getHospitals={getHospitals}
                dataKeys={dataKeys}
            >
                {children}
            </ScriptsContextProvider>
        </>
    );
}
