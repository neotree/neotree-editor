import { getScriptsTableData } from "@/app/actions/_scripts";
import { Content } from "@/components/content";
import { Title } from "@/components/title";
import { Card, CardContent } from "@/components/ui/card";
import { ScriptsTable } from "./components/scripts-table";
import { ScriptsFab } from "./components/scripts-fab";

type Props = {
    params: { [key: string]: string; };
    searchParams: { [key: string]: string; };
};

export default async function Scripts({ searchParams: { page, status } }: Props) {
    const [scripts] = await Promise.all([
        getScriptsTableData(),
    ]);

    return (
        <>
            <Title>Scripts</Title>

            <Content>
                {scripts.error ? (
                    <Card
                        className="border-danger bg-danger/20 text-center"
                    >
                        <CardContent>
                            <div className="text-danger">{scripts.error}</div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mb-20">
                        <Card>
                            <CardContent className="p-0">
                                <ScriptsTable 
                                    scripts={scripts}
                                />
                                
                                <ScriptsFab />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Content>
        </>
    )
}
