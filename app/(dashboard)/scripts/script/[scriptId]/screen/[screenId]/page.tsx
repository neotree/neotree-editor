import { getFullScreenDraft } from "@/app/actions/_screens-drafts";
import { getScreenWithDraft } from "@/app/actions/_screens";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { getScriptWithDraft } from "@/app/actions/_scripts";
import { getScriptDraft } from "@/app/actions/_scripts-drafts";
import { ScreenForm } from "../../../../components/screens/screen-form";
import { PageContainer } from "../../../../components/page-container";

type Props = {
    params: { screenId: string; scriptId: string; };
    searchParams: { [key: string]: string; };
};

export default async function Screens({ params: { screenId, scriptId } }: Props) {
    const screen = await getScreenWithDraft(screenId);
    const screenDraft = screen?.draft || await getFullScreenDraft(screenId);

    const script = await getScriptWithDraft(scriptId);
    const scriptDraft = script?.draft || await getScriptDraft(scriptId);

    const formData = screen?.draft?.data || screenDraft?.data || screen;

    if (!script && !scriptDraft) {
        return (
            <Alert 
                title="Error"
                message="Failed to load script!"
                redirectTo={`/script/${scriptId}?section=screens`}
            />
        );
    }

    if (!formData) {
        return (
            <Alert 
                title="Not found"
                message="Screen was not found or it might have been deleted!"
                redirectTo={`/script/${scriptId}?section=screens`}
            />
        );
    }

    return (
        <>
            <Title>{'Edit screen - ' + formData?.title}</Title>

            <PageContainer
                title="Edit screen"
                backLink={`/script/${scriptId}`}
            >
                <ScreenForm 
                    scriptId={scriptId}
                    scriptDraftId={script?.draft?.scriptId || undefined}
                    screenId={screenId}
                    screenDraftId={screenDraft?.screenDraftId}
                    formData={formData} 
                    draftVersion={screen?.draft?.data?.version || (screen?.version! + 1)}
                />
            </PageContainer>
        </>
    )
}
