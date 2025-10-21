'use client';

import { useState } from "react";
import { useMount } from "react-use";

import { Logo } from "@/components/logo";
import { Content } from "@/components/content";
import { ModeToggle } from "@/components/mode-toggle";
import { IAppContext, useAppContext } from "@/contexts/app";
import { cn } from "@/lib/utils";
import { HeaderDesktopMenu } from "./header-desktop-menu";
import { MobileMenu } from "./mobile-menu";
import { User } from "./user";
import { TopBar } from "./top-bar";

type Props = {
    user: IAppContext['authenticatedUser'];
    showTopBar: boolean;
    showSidebar: boolean;
    showThemeToggle: boolean;
};

export function Header({ 
    user, 
    showSidebar, 
    showTopBar, 
    showThemeToggle, 
}: Props) {
    const [mounted, setMounted] = useState(false);
    
    const { sys, info } = useAppContext();

    const usePlainBg = sys.data.use_plain_background === 'yes';

    useMount(() => { setMounted(true); });

    if (!mounted) return null;

    return (
        <>
            <div className={cn('h-16', !!showTopBar && 'h-24')} />

            {!!showTopBar && (
                <div 
                    className={cn(
                        `
                            fixed 
                            top-0 
                            left-0
                            border-b
                            h-8
                            w-full
                            z-[1]
                        `,
                        usePlainBg ? 'bg-background border-b-border' : 'bg-secondary border-b-border/5',
                    )}
                >
                    <TopBar />
                </div>
            )}

            <div 
                className={cn(
                    `
                        fixed
                        top-0
                        left-0
                        w-full
                        h-16
                        shadow-md
                        dark:shadow-foreground/10
                        flex
                        justify-center
                        z-[1]
                    `,
                    usePlainBg ? 'bg-primary-foreground dark:bg-background' : 'bg-primary text-primary-foreground dark:bg-background',
                    !!showTopBar && 'top-8',
                )}
            >
                <Content
                    className={cn(
                        `
                            flex
                            flex-1
                            gap-x-4
                            py-0
                        `,
                        showSidebar && 'max-w-full',
                    )}
                >
                    <div className="my-auto">
                        <MobileMenu />
                    </div>

                    <div className="my-auto">
                        <Logo size="sm" href="/" theme="dark" />
                    </div>

                    {!!info && (
                        <div className="my-auto">
                            v{info.dataVersion}
                        </div>
                    )}

                    <div className="ml-auto" />

                    <HeaderDesktopMenu />

                    <div className="flex gap-x-2 items-center my-auto">
                        <User user={user} />
                    </div>

                    <div className={cn("my-auto", !showThemeToggle && 'hidden')}>
                        <ModeToggle />
                    </div>
                </Content>
            </div>
        </>
    );
}
