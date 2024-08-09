import { redirect } from "next/navigation";

import * as serverActions from '@/app/actions/scripts';
import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptsTable } from "./components/scripts-table";
import { ScriptsFab } from "./components/scripts-fab";

export default async function ScriptsPage() { 
    const scripts = await serverActions.getScripts({ returnDraftsIfExist: true, });

    return (
        <>
            <Title>Scripts</Title>

            <Content>
                <Card>
                    <CardContent className="p-0">
                        <ScriptsTable 
                            scripts={scripts}
                        />
                    </CardContent>
                </Card>
            </Content>

            <ScriptsFab />
        </>
    );
}
