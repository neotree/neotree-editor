import { Title } from "@/components/title";
import { countScreens, getScript, listScreens } from "@/app/actions/scripts";
import { Alert } from "@/components/alert";
import { ScreenForm } from "../../../components/screens/form";
import { PageContainer } from "../../../components/page-container";

type Props = {
    params: { scriptId: string };
    searchParams: { [key: string]: string; };
};

export default async function NewScreenPage({ params: { scriptId, } }: Props) {
    const [
        script,
        countDiagnosesScreens,
        screens,
    ] = await Promise.all([
        getScript({ scriptId, returnDraftIfExists: true, }),
        countScreens({ types: ['diagnosis'], scriptsIds: [scriptId], }),
        listScreens({ scriptsIds: [scriptId], }),
    ]);

    if (countDiagnosesScreens?.errors?.length) {
        return (
            <Alert 
                title="Error"
                message="Failed to count how many diagnoses screens this script has. This is important as we can only add one diagnosis screen per script."
                redirectTo={`/script/${scriptId}`}
            />
        );
    }

    if (!script.data) {
        return (
            <Alert 
                title="Error"
                message="Script was not found or it might have been deleted!"
                redirectTo={`/script/${scriptId}`}
            />
        );
    }

    return (
        <>
            <Title>New Screen</Title>

            <PageContainer
                title="New screen"
                backLink={`/script/${scriptId}?section=screens`}
            >
                <ScreenForm 
                    screens={screens.data}
                    scriptId={scriptId} 
                    countDiagnosesScreens={countDiagnosesScreens.data.allPublished || countDiagnosesScreens.data.allDrafts}
                />
            </PageContainer>
        </>
    )
}
