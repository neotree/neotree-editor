import { Title } from "@/components/title";
import { getFullScriptDraft } from "@/app/actions/_scripts-drafts";
import { getScriptWithDraft, countScriptsItems } from "@/app/actions/_scripts";
import { ScreenForm } from "../../../components/screens/screen-form";
import { PageContainer } from "../../../components/page-container";
import { Alert } from "@/components/alert";

type Props = {
    params: { scriptId: string };
    searchParams: { [key: string]: string; };
};

export default async function NewScreens({ params: { scriptId, } }: Props) {
    const countDiagnosesScreens = await countScriptsItems('screens', { scriptsIds: [scriptId], itemsTypes: ['diagnosis'] });

    if (countDiagnosesScreens?.errors?.length) {
        return (
            <Alert 
                title="Error"
                message="Failed to count how many diagnoses screens this script has. This is important as we can only add one diagnosis screen per script."
                redirectTo={`/script/${scriptId}`}
            />
        );
    }

    const script = await getScriptWithDraft(scriptId);
    const scriptDraft = script?.draft || await getFullScriptDraft(scriptId);

    return (
        <>
            <Title>New Screen</Title>

            <PageContainer
                title="New screen"
                backLink={`/script/${scriptId}?section=screens`}
            >
                <ScreenForm 
                    scriptId={scriptDraft ? scriptDraft?.scriptId! : scriptId}
                    scriptDraftId={scriptDraft?.scriptId!}
                    draftVersion={1} 
                    countDiagnosesScreens={countDiagnosesScreens?.data[0]?.total}
                />
            </PageContainer>
        </>
    )
}
