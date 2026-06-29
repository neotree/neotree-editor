import { getDataKeysIntegrity } from "@/app/actions/data-keys";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { ScriptDataKeysTable } from "./table";
import { Alert } from "@/components/alert";

type Props = {
    params: { scriptId: string; };
    searchParams: { [key: string]: string | string[] | undefined; };
};

export default async function ScriptDataKeys({ params, searchParams }: Props) {
    const { scriptId } = await params;
    // The publish blocker can deep-link into this page with a focused
    // "newly introduced issues" view so users land on the exact blocking set.
    const focusParam = Array.isArray(searchParams?.focus) ? searchParams.focus[0] : searchParams?.focus;
    const initialFocus = focusParam === "newly_introduced" ? "newly_introduced" : "all";

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
                initialFocus={initialFocus}
            />
        </>
    );
}
