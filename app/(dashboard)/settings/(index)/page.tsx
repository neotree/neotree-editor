import { Content } from '@/components/content';
import * as sitesActions from '@/app/actions/sites';
import { Sites } from './components/sites';

export const dynamic = 'force-dynamic';

export default async function GeneralSettingsPage() {
    const [
        sites,
    ] = await Promise.all([
        sitesActions.getSites()
    ]);

    return (
        <>
            <Sites 
                {...sitesActions}
                sites={sites} 
            />
            
            <Content>
                
            </Content>
        </>
    );
}
