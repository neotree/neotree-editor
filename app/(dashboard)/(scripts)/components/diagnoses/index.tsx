import { getDiagnosesTableData } from "@/app/actions/_diagnoses";
import { DiagnosesTable } from './table';

type Props = {
    scriptId: string;
};

export default async function Diagnoses({ scriptId }: Props) {
    const diagnoses: Awaited<ReturnType<typeof getDiagnosesTableData>> = await getDiagnosesTableData({
        scriptsDraftsIds: [scriptId!],
        scriptsIds: [scriptId!],
    });

    return (
        <>
            <DiagnosesTable 
                diagnoses={diagnoses}
            />
        </>
    )
}
