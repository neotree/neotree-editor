'use client';

import { cn } from "@/lib/utils";

type Props = {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
};

export function Container({ children, header, footer }: Props) {

    return (
        <>
            <div
                className="flex flex-col fixed h-full w-full top-0 left-0 z-[999999] bg-background"
            >
                {!!header && (
                    <div
                        className="fixed top-0 h-14 w-full border-b border-b-border bg-background p-4 flex items-center gap-x-4 z-[1]"
                    >

                    </div>
                )}

                <div
                    className={cn('flex-1 overflow-y-auto pt-14', header && 'pt-14', footer && 'pb-14')}
                >
                    {children}
                </div>

                {!!footer && (
                    <div
                        className="fixed bottom-0 h-14 w-full border-t border-t-border bg-background p-4 flex items-center gap-x-4"
                    >
                        {footer}
                    </div>
                )}
            </div>
        </>
    )
}
