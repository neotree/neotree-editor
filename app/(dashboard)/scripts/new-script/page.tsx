import { Title } from "@/components/title";
import { ScriptForm } from "../components/script-form";
import { PageContainer } from "../components/page-container";


type Props = {
    searchParams: { [key: string]: string; };
};

export default async function NewScripts({}: Props) {
    return (
        <>
            <Title>New Script</Title>

            <PageContainer
                title="New script"
                backLink="/"
            >
                <ScriptForm draftVersion={1} />
            </PageContainer>
        </>
    )
}
