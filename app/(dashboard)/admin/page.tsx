import { ExternalLink } from 'lucide-react';

import * as scriptsActions from '@/app/actions/scripts';
import * as configKeysActions from '@/app/actions/config-keys';
import { Card, CardContent } from '@/components/ui/card';
import { Content } from '@/components/content';
import { displayBigNumber } from '@/lib/displayBigNumber';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
                <Card>
                    <CardContent className="p-4 flex flex-col items-start gap-y-4 sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <div className="text-sm">Total sessions</div>
                            <div className='text-4xl font-bold text-secondary'>
                                {displayBigNumber(2009)}
                            </div>
                        </div>
                        <div className="text-xs flex flex-col gap-y-1">
                            <Button 
                                asChild
                                variant="primary-outline"
                            >
                                <Link href="/sessions" target="_blank">
                                    View sessions
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

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
                            <div key={title} className="relative">
                                {errors?.length ? (
                                    <Card>
                                        <CardContent className="p-4 text-xl text-center text-danger bg-danger/10">
                                            {errors.join('\n')}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="p-4">
                                            {!!href && (
                                                <Link href={href} className="absolute top-4 right-4">
                                                    <ExternalLink className="transition-colors text-muted-foreground hover:text-primary h-4 w-4 ml-2" />
                                                </Link>
                                            )}

                                            <div className="text-sm mb-1">{title}</div>
                                            <div className='text-4xl font-bold text-secondary mb-1'>
                                                {displayBigNumber(data.allPublished)}
                                            </div>
                                            <div className="text-xs flex flex-col gap-y-1">
                                                <div>
                                                    {displayBigNumber(data.allDrafts)}&nbsp;
                                                    <span className="text-muted-foreground">total drafts</span>
                                                </div>
                                                <div>
                                                    {displayBigNumber(data.newDrafts)}&nbsp;
                                                    <span className="text-muted-foreground">new drafts</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Content>
        </>
    );
}
