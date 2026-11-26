import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import * as scriptsActions from '@/app/actions/scripts';
import * as configKeysActions from '@/app/actions/config-keys';
import { Content } from '@/components/content';
import { Button } from '@/components/ui/button';
import { Title } from "@/components/title";
import { StatsCard } from '../components/stats-card';

export const dynamic = 'force-dynamic';

export default async function DataSettingsPage() {
    const [
        countScripts,
        countDiagnoses,
        countScreens,
        countConfigKeys,
    ] = await Promise.all([
        scriptsActions.countScripts(),
        scriptsActions.countDiagnoses(),
        scriptsActions.countScreens(),
        configKeysActions.countConfigKeys(),
    ]);

    return (
        <>
            <Title>Data Settings</Title>
            
            <Content>
                <div
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4"
                >
                    {[
                        { href: '/', title: 'Total scripts', ...countScripts, },
                        { href: '', title: 'Total screens', ...countScreens, },
                        { href: '', title: 'Total diagnoses', ...countDiagnoses, },
                        { href: '/configuration', title: 'Total config keys', ...countConfigKeys, },
                    ].map(({ href, title, errors, data }) => {
                        return (
                            <StatsCard 
                                key={title}
                                mainCount={data.allPublished}
                                title={title}
                                errors={errors}
                                externalLink={href}
                                moreStats={[
                                    { count: data.allDrafts, label: 'total drafts', },
                                    { count: data.newDrafts, label: 'new drafts', },
                                ]}
                            />
                        );
                    })}
                </div>
            </Content>
        </>
    );
}
