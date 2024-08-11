import { getHospitals } from "@/app/actions/hospitals";
import { getScript } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { Tabs } from '@/components/tabs';
import { scriptsPageTabs } from '@/constants';
import { ScriptForm } from "../../components/script-form";
import { PageContainer } from "../../components/page-container";
import Diagnoses from "../../components/diagnoses";
import Screens from "../../components/screens";

type Props = {
    params: { scriptId: string; };
    searchParams: { [key: string]: string; };
};

export default async function Scripts({ params: { scriptId }, searchParams: { section } }: Props) {
    const [hospitals, { data: formData }] = await Promise.all([
        getHospitals(),
        getScript({ scriptId, returnDraftIfExists: true, }),
    ]);

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
            <Title>{'Edit script - ' + formData.title}</Title>

            <PageContainer
                title="Edit script"
                backLink="/"
            >
                <ScriptForm 
                    hospitals={hospitals.data}
                    formData={formData} 
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
        </>
    )
}
