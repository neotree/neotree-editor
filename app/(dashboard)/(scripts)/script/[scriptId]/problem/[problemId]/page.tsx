import { getProblem, getScript } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { ProblemForm } from "../../../../components/problems/form";
import { PageContainer } from "../../../../components/page-container";

type Props = {
    params: { problemId: string; scriptId: string; };
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function Problems({ params: { problemId, scriptId } }: Props) {
    const [problem, script] = await Promise.all([
        getProblem({ problemId, returnDraftIfExists: true, }),
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

    if (!problem.data) {
        return (
            <Alert 
                title="Not found"
                message="Problem was not found or it might have been deleted!"
                redirectTo={`/script/${scriptId}?section=diagnoses`}
            />
        );
    }

    return (
        <>
            <Title>{'Edit problem - ' + problem.data.name}</Title>

            <PageContainer
                title="Edit problem"
                backLink={`/script/${scriptId}`}
            >
                <ProblemForm 
                    scriptId={scriptId}
                    formData={problem.data} 
                    script={script.data}
                />
            </PageContainer>
        </>
    )
}
