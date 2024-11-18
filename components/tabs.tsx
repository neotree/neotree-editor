'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import queryString from "query-string";

import {
    Tabs as UiTabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export function Tabs({ 
    options: tabs, 
    searchParamsKey,
    onChange,
}: {
    options: {
        value: string,
        label: string,
    }[],
    searchParamsKey?: string;
    onChange?: (value: string) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const searchParams = useSearchParams();
    const searchParamsObj = useMemo(() => queryString.parse(searchParams.toString()), [searchParams]);

    const section = useMemo(() => !searchParamsKey ? null : searchParamsObj[searchParamsKey], [searchParamsObj, searchParamsKey]);
    const activeTab = useMemo(() => tabs.filter(t => t.value === section)[0]?.value || tabs[0].value, [section, tabs]);
    const useLink = useMemo(() => !!searchParamsKey, [searchParamsKey]);

    useEffect(() => {
        if (scrollPosition) {
            setTimeout(() => {
                window.scrollTo({ top: scrollPosition, });
                setScrollPosition(0);
            }, 100);
        }
    }, [scrollPosition]);

    return (
        <div ref={containerRef}>
            <UiTabs 
                defaultValue={activeTab} 
                value={activeTab}
                className="w-full [&>div]:w-full"
                onValueChange={onChange}
            >
                <TabsList>
                    {tabs.map(t => (
                        <TabsTrigger 
                            asChild={useLink}
                            key={t.value} 
                            value={t.value} 
                            className="flex-1"
                            onClick={() => setScrollPosition(containerRef.current?.getBoundingClientRect()?.top || 0)}
                        >
                            {!useLink ? t.label : (
                                <Link 
                                    href={`?${queryString.stringify({
                                        ...searchParamsObj,
                                        [searchParamsKey!]: t.value,
                                    })}`}
                                >{t.label}</Link>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map(t => (
                    <TabsContent key={t.value} value={t.value} className="hidden" />
                ))}
            </UiTabs>
        </div>
    );
}
