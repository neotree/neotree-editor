import { redirect } from "next/navigation";

import { getFullScript } from "@/app/actions/_scripts";
import { getFullScriptDraft } from "@/app/actions/_scripts-drafts";
import { Title } from "@/components/title";
import { ScriptForm } from "../components/script-form";
import { PageContainer } from "../components/page-container";

type Props = {
    searchParams: { [key: string]: string; };
};

export default async function Scripts({ searchParams: { scriptId, scriptDraftId } }: Props) {
    const [script, draft] = await Promise.all([
        scriptId ? getFullScript(scriptId) : null,
        scriptDraftId ? getFullScriptDraft(scriptDraftId) : null,
    ]);

    if (!(draft || script)) redirect('/not-found');

    return (
        <>
            <Title>{draft?.data?.title || script?.title || 'Script'}</Title>
            <PageContainer
                title="Script"
            >
                <ScriptForm 
                    scriptId={scriptId}
                    scriptDraftId={scriptDraftId}
                    formData={draft?.data! || script!} 
                    draftVersion={draft?.data?.version || (script?.version! + 1)}
                />
            </PageContainer>
        </>
    )
}
