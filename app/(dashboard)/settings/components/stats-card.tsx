'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card";
import { displayBigNumber } from '@/lib/displayBigNumber';

type Props = {
    children?: React.ReactNode;
    mainCount: number;
    title: string;
    externalLink?: string;
    errors?: string[];
    moreStats?: {
        count: number;
        label: string;
    }[];
};

export function StatsCard({
    children,
    mainCount,
    title,
    externalLink,
    moreStats = [],
    errors = [],
}: Props) {
    if (errors.length) {
        return (
            <Card className="text-danger border-danger bg-danger/10 flex items-center justify-center">
                <CardContent className="p-4 text-xl text-center">
                    {errors.join('\n')}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardContent className="p-4 relative">
                    {!!externalLink && (
                        <Link href={externalLink} className="absolute top-4 right-4">
                            <ExternalLink className="transition-colors text-muted-foreground hover:text-primary h-4 w-4 ml-2" />
                        </Link>
                    )}
                    <div className="flex items-centerflex flex-col items-start gap-y-4 sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <div className="text-sm mb-1">{title}</div>
                            <div className='text-4xl font-bold mb-1'>
                                {displayBigNumber(mainCount)}
                            </div>
                            {!!moreStats.length && (
                                <div className="text-xs flex flex-col gap-y-1">
                                    {moreStats.map(({ count, label, }, i) => (
                                        <div key={i}>
                                            {displayBigNumber(count)}&nbsp;
                                            <span className="text-muted-foreground">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            {children}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
