import { Content } from "../components/content";

export const dynamic = 'force-dynamic';

export default async function OpsDiagnosesPage() {
    return (
        <>
            <Content 
                dataType="diagnoses"
            />
        </>
    );
}
