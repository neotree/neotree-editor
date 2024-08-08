'use client';

import { Content } from "@/components/content";
import { cn } from "@/lib/utils";

export function ActionsBar({ children, className, }: {
    className?: string,
    children?: React.ReactNode;
}) {
    return (
        <>
            <div className="h-16" />

            <div
                className={cn(
                    `
                        fixed 
                        left-0 
                        bottom-0 
                        h-16 
                        w-full 
                        border-t 
                        border-t-border 
                        z-[1] 
                        bg-primary-foreground 
                        dark:bg-background 
                        shadow-md 
                        dark:shadow-foreground/10
                    `,
                )}
            >
                <Content>
                        <div 
                            className={cn(
                                'flex justify-end gap-x-4',
                                className,
                            )}
                        >
                            {children}
                        </div>
                </Content>
            </div>
        </>
    );
}
