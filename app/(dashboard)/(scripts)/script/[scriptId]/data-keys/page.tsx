import { getDataKeysIntegrity } from "@/app/actions/data-keys";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { ScriptDataKeysTable } from "./table";
import { Alert } from "@/components/alert";

type Props = {
    params: { scriptId: string; };
    searchParams: { [key: string]: string; };
};

export default async function ScriptDataKeys({ params }: Props) {
    const { scriptId } = await params;

    const [{ data: scripts, }, integrity] = await Promise.all([
        getScriptsWithItems({
            scriptsIds: [scriptId],
        }),
        getDataKeysIntegrity({
            scriptsIds: [scriptId],
            onlyIssues: false,
        }),
    ]);

    if (!scripts[0]) {
        return (
            <Alert 
                title="Error"
                message="Script not found"
                variant="error"
            />
        );
    }
    
    return (
        <>
            <ScriptDataKeysTable 
                data={scripts[0]}
                integrity={integrity.data}
            />
        </>
    );
}
