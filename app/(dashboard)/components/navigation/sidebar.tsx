'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useRoutes } from "@/hooks/use-routes"
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();
    const routes = useRoutes();

    return (
        <div className="hidden md:flex">
            <div className={cn('w-[250px]')} />

            <div 
                className={cn(
                    `
                        fixed
                        top-0
                        left-0
                        w-[250px]
                        h-full
                        bg-primary-foreground
                        dark:bg-background
                        shadow-md
                        dark:shadow-foreground/10
                        flex
                        flex-col
                        z-[1]
                        border-r
                        border-border
                        pt-28
                    `,
                )}
            >
                <div className="flex flex-col">
                    {routes.map(route => {
                        const isActive = pathname === route.href;

                        return (
                            <Link
                                key={route.id}
                                href={route.href}
                                className={cn(
                                    'p-4 flex flex-col justify-center transition-colors dark:text-foreground',
                                    isActive ? 
                                        'bg-primary text-primary-foreground' 
                                        : 
                                        'text-secondary hover:bg-primary/10 dark:hover:bg-primary-foreground/10'
                                )}
                            >
                                {route.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
