'use client';

import { useMemo, useState } from "react";
import Link from "next/link";

import { useAppContext } from "@/contexts/app";
import { useRoutes } from "@/hooks/use-routes"
import { cn } from "@/lib/utils";

export function HeaderDesktopMenu() {
    const { sys } = useAppContext();
    const routes = useRoutes();

    const showSidebar = sys.data.use_sidebar_menu === 'yes';
    const usePlainBg = sys.data.use_plain_background === 'yes';

    if (showSidebar) return null;

    return (
        <>
            <div className="hidden md:flex">
                {routes.map((route, i) => {
                    const isActive = route.isActive;

                    return (
                        <Link
                            key={i}
                            href={route.href}
                            className={cn(
                                usePlainBg ? 
                                    (
                                        isActive ? 
                                            'bg-primary text-primary-foreground' 
                                            : 
                                            'text-secondary hover:bg-primary/10 dark:hover:bg-primary-foreground/10'
                                    ) 
                                    :
                                    (
                                        isActive ? 
                                            'bg-primary-foreground text-primary dark:bg-primary dark:text-primary-foreground' 
                                            : 
                                            'text-primary-foreground hover:bg-primary-foreground/20 dark:hover:bg-primary/20'
                                    ),
                                'px-4 flex flex-col justify-center transition-colors dark:text-foreground',
                                
                            )}
                        >
                            {route.label}
                        </Link>
                    );
                })}
            </div>
        </>
    )
}
