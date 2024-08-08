import { getFullDiagnosisDraft } from "@/app/actions/_diagnoses-drafts";
import { getDiagnosisWithDraft } from "@/app/actions/_diagnoses";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { getScriptWithDraft } from "@/app/actions/_scripts";
import { getScriptDraft } from "@/app/actions/_scripts-drafts";
import { DiagnosisForm } from "../../../../components/diagnoses/diagnosis-form";
import { PageContainer } from "../../../../components/page-container";

type Props = {
    params: { diagnosisId: string; scriptId: string; };
    searchParams: { [key: string]: string; };
};

export default async function Diagnoses({ params: { diagnosisId, scriptId } }: Props) {
    const diagnosis = await getDiagnosisWithDraft(diagnosisId);
    const diagnosisDraft = diagnosis?.draft || await getFullDiagnosisDraft(diagnosisId);

    const script = await getScriptWithDraft(scriptId);
    const scriptDraft = script?.draft || await getScriptDraft(scriptId);

    const formData = diagnosis?.draft?.data || diagnosisDraft?.data || diagnosis;

    if (!script && !scriptDraft) {
        return (
            <Alert 
                title="Error"
                message="Failed to load script!"
                redirectTo={`/script/${scriptId}?section=diagnoses`}
            />
        );
    }

    if (!formData) {
        return (
            <Alert 
                title="Not found"
                message="Diagnosis was not found or it might have been deleted!"
                redirectTo={`/script/${scriptId}?section=diagnoses`}
            />
        );
    }

    return (
        <>
            <Title>{'Edit diagnosis - ' + formData?.name}</Title>

            <PageContainer
                title="Edit diagnosis"
                backLink={`/script/${scriptId}`}
            >
                <DiagnosisForm 
                    scriptId={scriptId}
                    scriptDraftId={script?.draft?.scriptId || undefined}
                    diagnosisId={diagnosisId}
                    diagnosisDraftId={diagnosisDraft?.diagnosisDraftId}
                    formData={formData} 
                    draftVersion={diagnosis?.draft?.data?.version || (diagnosis?.version! + 1)}
                />
            </PageContainer>
        </>
    )
}
