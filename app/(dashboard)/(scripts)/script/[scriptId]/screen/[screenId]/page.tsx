import { getScreen, getScript } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { ScreenForm } from "../../../../components/screens/form";
import { PageContainer } from "../../../../components/page-container";

type Props = {
    params: { screenId: string; scriptId: string; };
    searchParams: { [key: string]: string; };
};

export default async function Screens({ params: { screenId, scriptId } }: Props) {
    const [screen, script] = await Promise.all([
        getScreen({ screenId, returnDraftIfExists: true, }),
        getScript({ scriptId, returnDraftIfExists: true, }),
    ]);

    if (!script.data) {
        return (
            <Alert 
                title="Error"
                message="Failed to load script!"
                redirectTo={`/script/${scriptId}?section=screens`}
            />
        );
    }

    if (!screen.data) {
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
            <Title>{'Edit screen - ' + screen.data.title}</Title>

            <PageContainer
                title="Edit screen"
                backLink={`/script/${scriptId}`}
            >
                <ScreenForm 
                    scriptId={scriptId}
                    formData={screen.data} 
                />
            </PageContainer>
        </>
    )
}
