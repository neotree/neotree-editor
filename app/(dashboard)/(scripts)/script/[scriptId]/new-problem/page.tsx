import { Title } from "@/components/title";
import { getScript } from "@/app/actions/scripts";
import { Alert } from "@/components/alert";
import { ProblemForm } from "../../../components/problems/form";
import { PageContainer } from "../../../components/page-container";

type Props = {
    params: { scriptId: string };
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function NewProblemPage({ params: { scriptId, } }: Props) {
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
            <Title>New Problem</Title>

            <PageContainer
                title="New problem"
                backLink={`/script/${scriptId}?section=diagnoses`}
            >
                <ProblemForm scriptId={scriptId} />
            </PageContainer>
        </>
    )
}
