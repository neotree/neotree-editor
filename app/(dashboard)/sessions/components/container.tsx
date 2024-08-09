'use client';

import { cn } from "@/lib/utils";

type Props = {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    classes?: {
        bg?: string;
    },
};

export function Container({ children, header, footer, classes }: Props) {
    return (
        <>
            <div
                className={cn('flex flex-col fixed h-full w-full top-0 left-0 z-[999999] bg-background', classes?.bg)}
            >
                {!!header && (
                    <div
                        className={cn('fixed top-0 h-14 w-full border-b border-b-border bg-background p-4 flex items-center gap-x-2 z-[1]', classes?.bg)}
                    >
                        {header}
                    </div>
                )}

                <div
                    className={cn('flex-1 overflow-y-auto', header && 'pt-14', footer && 'pb-14')}
                >
                    {children}
                </div>

                {!!footer && (
                    <div
                        className={cn('fixed bottom-0 h-14 w-full border-t border-t-border bg-background p-4 flex items-center gap-x-2', classes?.bg)}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </>
    )
}
