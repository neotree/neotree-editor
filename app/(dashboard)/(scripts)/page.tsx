import * as serverActions from '@/app/actions/scripts';
import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptsTable } from "./components/scripts-table";

export default async function ScriptsPage() { 
    const scripts = await serverActions.getScripts({ returnDraftsIfExist: true, });

    return (
        <>
            <Title>Scripts</Title>

            <Content>
                <Card className="mb-20">
                    <CardContent className="p-0">
                        <ScriptsTable 
                            scripts={scripts}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
