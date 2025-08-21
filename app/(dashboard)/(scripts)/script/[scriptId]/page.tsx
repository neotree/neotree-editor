import { getHospitals } from "@/app/actions/hospitals";
import { getScript } from "@/app/actions/scripts";
import { Title } from "@/components/title";
import { Alert } from "@/components/alert";
import { ScriptForm } from "../../components/script-form";
import { PageContainer } from "../../components/page-container";
import { getLockStatus } from "@/app/actions/locks";

type Props = {
    params: { scriptId: string; };
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function Scripts({ params: { scriptId }, searchParams: { section } }: Props) {
    const [hospitals, { data: formData },lockStatus] = await Promise.all([
        getHospitals(),
        getScript({ scriptId, returnDraftIfExists: true, }),
        getLockStatus({script:scriptId})
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
                    locked={lockStatus}
                />
            </PageContainer>
        </>
    )
}
