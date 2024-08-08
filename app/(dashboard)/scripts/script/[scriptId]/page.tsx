import { getFullScriptDraft } from "@/app/actions/_scripts-drafts";
import { getScriptWithDraft } from "@/app/actions/_scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { Tabs } from '@/components/tabs';
import { scriptsPageTabs } from '@/constants';
import { ScriptForm } from "../../components/script-form";
import { PageContainer } from "../../components/page-container";
import Diagnoses from "../../components/diagnoses";
import Screens from "../../components/screens";
import { ScriptItemsFab } from "../../components/script-items-fab";

type Props = {
    params: { scriptId: string; };
    searchParams: { [key: string]: string; };
};

export default async function Scripts({ params: { scriptId }, searchParams: { section } }: Props) {
    const script = await getScriptWithDraft(scriptId);
    const scriptDraft = script?.draft || await getFullScriptDraft(scriptId);

    const formData = script?.draft?.data || scriptDraft?.data || script;

    if (!formData) {
        return (
            <Alert 
                title="Not found"
                message="Script was not found or it might have been deleted!"
                redirectTo="/"
            />
        );
    }

    return (
        <>
            <Title>{'Edit script - ' + formData?.title}</Title>

            <PageContainer
                title="Edit script"
                backLink="/"
            >
                <ScriptForm 
                    scriptId={scriptDraft ? scriptDraft?.scriptId! : scriptId}
                    scriptDraftId={scriptDraft?.scriptDraftId}
                    formData={formData} 
                    draftVersion={script?.draft?.data?.version || (script?.version! + 1)}
                />

                <div className="flex flex-col gap-y-4 mt-10">
                    <Tabs 
                        options={scriptsPageTabs}
                        searchParamsKey="section"
                    />

                    {section === 'diagnoses' ? 
                        <Diagnoses scriptId={formData.scriptId!} /> 
                        : 
                        <Screens scriptId={formData.scriptId!} />}
                </div>
            </PageContainer>

            <ScriptItemsFab />
        </>
    )
}
