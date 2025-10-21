import { getDiagnosis, getScript } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { DiagnosisForm } from "../../../../components/diagnoses/form";
import { PageContainer } from "../../../../components/page-container";

type Props = {
    params: { diagnosisId: string; scriptId: string; };
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function Diagnoses({ params: { diagnosisId, scriptId } }: Props) {
    const [diagnosis, script] = await Promise.all([
        getDiagnosis({ diagnosisId, returnDraftIfExists: true, }),
        getScript({ scriptId, returnDraftIfExists: true, }),
    ]);

    if (!script.data) {
        return (
            <Alert 
                title="Error"
                message="Failed to load script!"
                redirectTo={`/script/${scriptId}?section=diagnoses`}
            />
        );
    }

    if (!diagnosis.data) {
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
            <Title>{'Edit diagnosis - ' + diagnosis.data.name}</Title>

            <PageContainer
                title="Edit diagnosis"
                backLink={`/script/${scriptId}`}
            >
                <DiagnosisForm 
                    scriptId={scriptId}
                    formData={diagnosis.data} 
                    script={script.data}
                />
            </PageContainer>
        </>
    )
}
