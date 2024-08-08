'use client';

import { Logo } from "@/components/logo";
import { Content } from "@/components/content";
import { ModeToggle } from "@/components/mode-toggle";
import { IAppContext } from "@/contexts/app";
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
    return (
        <>
            <div className={cn('h-16', !!showTopBar && 'h-24')} />

            {!!showTopBar && (
                <div 
                    className="
                        fixed 
                        top-0 
                        left-0
                        border-b
                        border-b-border
                        bg-background
                        h-8
                        w-full
                        z-[1]
                    "
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
                        bg-primary-foreground
                        dark:bg-background
                        shadow-md
                        dark:shadow-foreground/10
                        flex
                        justify-center
                        z-[1]
                    `,
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
                        <Logo size="sm" href="/" />
                    </div>

                    <div className="ml-auto" />

                    <HeaderDesktopMenu />

                    <div className="my-auto">
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
