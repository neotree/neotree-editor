import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import * as scriptsActions from '@/app/actions/scripts';
import * as configKeysActions from '@/app/actions/config-keys';
import { Content } from '@/components/content';
import { Button } from '@/components/ui/button';
import { StatsCard } from './components/stats-card';

export default async function GeneralAdminPage() {
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
            <Content>
                <StatsCard 
                    mainCount={669}
                    title="Total sessions"
                    errors={['Failed to count totals sessions']}
                    moreStats={[]}
                >
                        <Button 
                            asChild
                            variant="primary-outline"
                        >
                            <Link href="/sessions" target="_blank">
                                View sessions
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                </StatsCard>

                <br />

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
