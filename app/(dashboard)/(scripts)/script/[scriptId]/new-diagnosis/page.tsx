import { Title } from "@/components/title";
import { getScript } from "@/app/actions/scripts";
import { Alert } from "@/components/alert";
import { DiagnosisForm } from "../../../components/diagnoses/form";
import { PageContainer } from "../../../components/page-container";

type Props = {
    params: { scriptId: string };
    searchParams: { [key: string]: string; };
};

export default async function NewDiagnosisPage({ params: { scriptId, } }: Props) {
    const [
        script,
    ] = await Promise.all([
        getScript({ scriptId, returnDraftIfExists: true, }),
    ]);

    if (!script.data) {
        return (
            <Alert 
                title="Error"
                message="Script was not found or it might have been deleted!"
                redirectTo={`/script/${scriptId}?section=diagnoses`}
            />
        );
    }

    return (
        <>
            <Title>New Diagnosis</Title>

            <PageContainer
                title="New diagnosis"
                backLink={`/script/${scriptId}?section=diagnoses`}
            >
                <DiagnosisForm scriptId={scriptId} />
            </PageContainer>
        </>
    )
}
