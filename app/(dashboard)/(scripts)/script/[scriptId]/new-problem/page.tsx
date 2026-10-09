import { Title } from "@/components/title";
import { getScript, listScreens } from "@/app/actions/scripts";
import { Alert } from "@/components/alert";
import { ProblemForm } from "../../../components/problems/form";
import { PageContainer } from "../../../components/page-container";

type Props = {
    params: Promise<{ scriptId: string }>;
    searchParams: Promise<{ [key: string]: string; }>;
};

export const dynamic = 'force-dynamic';

export default async function NewProblemPage(props: Props) {
    const params = await props.params;

    const {
        scriptId
    } = params;

    const [
        script,
        screens,
    ] = await Promise.all([
        getScript({ scriptId, returnDraftIfExists: true, }),
        listScreens({ scriptsIds: [scriptId], returnDraftsIfExist: true }),
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
                <ProblemForm scriptId={scriptId} script={script.data} screens={screens.data} />
            </PageContainer>
        </>
    )
}
