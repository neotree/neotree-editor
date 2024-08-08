import { Title } from "@/components/title";
import { getFullScriptDraft } from "@/app/actions/_scripts-drafts";
import { getScriptWithDraft, countScriptsItems } from "@/app/actions/_scripts";
import { DiagnosisForm } from "../../../components/diagnoses/diagnosis-form";
import { PageContainer } from "../../../components/page-container";
import { Alert } from "@/components/alert";

type Props = {
    params: { scriptId: string };
    searchParams: { [key: string]: string; };
};

export default async function NewDiagnoses({ params: { scriptId, } }: Props) {
    const script = await getScriptWithDraft(scriptId);
    const scriptDraft = script?.draft || await getFullScriptDraft(scriptId);

    return (
        <>
            <Title>New Diagnosis</Title>

            <PageContainer
                title="New diagnosis"
                backLink={`/script/${scriptId}?section=diagnoses`}
            >
                <DiagnosisForm 
                    scriptId={scriptDraft ? scriptDraft?.scriptId! : scriptId}
                    scriptDraftId={scriptDraft?.scriptId!}
                    draftVersion={1} 
                />
            </PageContainer>
        </>
    )
}
