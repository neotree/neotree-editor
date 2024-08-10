import * as scriptsActions from '@/app/actions/scripts';
import { DiagnosesTable } from './table';

type Props = {
    scriptId: string;
};

export default async function Diagnoses({ scriptId }: Props) {
    const [diagnoses] = await Promise.all([
        scriptsActions.getDiagnoses({ scriptsIds: [scriptId], returnDraftsIfExist: true, }),
    ]);

    return (
        <>
            <DiagnosesTable 
                diagnoses={diagnoses}
            />
        </>
    );
}
