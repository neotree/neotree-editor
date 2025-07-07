'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export function ScriptsIndexTabs({ tab }: {
    tab: 'scripts' | 'data-keys';
}) {
    const tabs = useMemo(() => [
        {
            label: 'Scripts',
            value: 'scripts',
            href: '/',
            isActive: tab === 'scripts',
        },
        {
            label: 'Data keys',
            value: 'data-keys',
            href: '/data-keys',
            isActive: tab === 'data-keys',
        },
    ], [tab]);

    const activeTab = (tabs.find(t => t.isActive) || tabs[0]).value;
    
    const onChange = useCallback(() => {

    }, []);

    return (
        <div>
            <Tabs 
                defaultValue={activeTab} 
                value={activeTab}
                className="w-full [&>div]:w-full"
                onValueChange={onChange}
            >
                <TabsList>
                    {tabs.map(t => (
                        <TabsTrigger 
                            asChild
                            key={t.value} 
                            value={t.value} 
                            className="flex-1"
                        >
                            <Link 
                                href={t.href}
                            >{t.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map(t => (
                    <TabsContent key={t.value} value={t.value} className="hidden" />
                ))}
            </Tabs>
        </div>
    );
}
