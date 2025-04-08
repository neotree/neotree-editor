import { Title } from "@/components/title";
import { ScriptForm } from "../components/script-form";
import { PageContainer } from "../components/page-container";
import { getHospitals } from "@/app/actions/hospitals";

type Props = {
    searchParams: { [key: string]: string; };
};

export const dynamic = 'force-dynamic';

export default async function NewScriptPage({}: Props) {
    const hospitals = await getHospitals();

    return (
        <>
            <Title>New Script</Title>

            <PageContainer
                title="New script"
                backLink="/"
            >
                <ScriptForm hospitals={hospitals.data} />
            </PageContainer>
        </>
    )
}
