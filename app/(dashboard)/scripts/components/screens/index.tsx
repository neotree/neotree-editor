import { getScreensTableData } from "@/app/actions/_screens";
import { ScreensTable } from './table';

type Props = {
    scriptId: string;
};

export default async function Screens({ scriptId }: Props) {
    const screens: Awaited<ReturnType<typeof getScreensTableData>> = await getScreensTableData({
        scriptsDraftsIds: [scriptId!],
        scriptsIds: [scriptId!],
    });

    return (
        <>
            <ScreensTable 
                screens={screens}
            />
        </>
    )
}
