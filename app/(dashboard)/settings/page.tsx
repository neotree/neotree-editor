import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import * as scriptsActions from '@/app/actions/scripts';
import * as configKeysActions from '@/app/actions/config-keys';
import * as sessionsActions from '@/app/actions/sessions';
import { Content } from '@/components/content';
import { Button } from '@/components/ui/button';
import { StatsCard } from './components/stats-card';

export default async function GeneralSettingsPage() {
    const [
        countSessions,
        countScripts,
        countDiagnoses,
        countScreens,
        countConfigKeys,
    ] = await Promise.all([
        sessionsActions.countSessions(),
        scriptsActions.countScripts(),
        scriptsActions.countDiagnoses(),
        scriptsActions.countScreens(),
        configKeysActions.countConfigKeys(),
    ]);

    return (
        <>
            <Content>
                
            </Content>
        </>
    );
}
