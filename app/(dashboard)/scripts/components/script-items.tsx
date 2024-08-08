import { scriptsPageTabs } from '@/constants';
import { getScreensTableData } from '@/app/actions/_screens';
import { getDiagnosesTableData } from '@/app/actions/_diagnoses';
import { Tabs } from '@/components/tabs';
import { ScreensTable } from './screens/table';
import { DiagnosesTable } from './diagnoses/table';
import { ScriptItemsFab } from './script-items-fab';

type Props = {
    scriptId?: string;
    scriptDraftId?: string;
    itemType: string;
    screens: Awaited<ReturnType<typeof getScreensTableData>>;
    diagnoses: Awaited<ReturnType<typeof getDiagnosesTableData>>;
};

export async function ScriptItems({ itemType, screens, diagnoses, ...props }: Props) {
    const tab = scriptsPageTabs.filter(t => t.value === itemType)[0]?.value || scriptsPageTabs[0].value;

    return (
        <div className="flex flex-col gap-y-4 mt-10">
            <Tabs 
                options={scriptsPageTabs}
                searchParamsKey="section"
            />

            {tab === 'screens' && (
                <>
                    <ScreensTable 
                        {...props}
                        screens={screens}
                    />

                    <ScriptItemsFab />
                </>
            )}

            {tab === 'diagnoses' && (
                <>
                    <DiagnosesTable 
                        {...props}
                        diagnoses={diagnoses}
                    />

                    <ScriptItemsFab />
                </>
            )}
        </div>
    )
}
