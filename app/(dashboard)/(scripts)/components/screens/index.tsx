import * as scriptsActions from '@/app/actions/scripts';
import { ScreensTable } from './table';

type Props = {
    scriptId: string;
};

export default async function Screens({ scriptId }: Props) {
    const [screens] = await Promise.all([
        scriptsActions.getScreens({ scriptsIds: [scriptId], returnDraftsIfExist: true, }),
    ]);

    return (
        <>
            <ScreensTable 
                screens={screens}
            />
        </>
    );
}
