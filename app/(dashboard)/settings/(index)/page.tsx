import { Content } from '@/components/content';
import { getSites } from '@/app/actions/sites';
import { Sites } from './components/sites';

export default async function GeneralSettingsPage() {
    const [
        sites,
    ] = await Promise.all([
        getSites()
    ]);

    return (
        <>
            <Sites sites={sites} />
            
            <Content>
                
            </Content>
        </>
    );
}
