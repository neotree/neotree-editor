'use client';

import { cn } from "@/lib/utils";
import { DataTableSearch } from "./search";
import { DataTableHeaderProps } from "./types";

export function DataTableHeader({
    title,
    search,
    headerActions,
}: DataTableHeaderProps) {
    const hidden = !search && !title && !headerActions;

    if (hidden) return null;

    return (
        <>
            <div className="px-4 py-4 flex flex-col gap-y-2">
                <div className="flex flex-col gap-y-2 md:flex-row md:gap-y-0 md:gap-x-2">
                    <div 
                        className={cn(
                            'flex items-center gap-x-2',
                            !title && 'hidden',
                        )}
                    >
                        {!!title && (
                            <div 
                                className={cn(
                                    'md:mr-auto',
                                    typeof title === 'string' ? 'text-2xl' : '',
                                )}
                            >
                                {title}
                            </div>
                        )}

                        <div className="ml-auto" />
                    </div>

                    <div 
                        className={cn(
                            'flex-1',
                            !search && 'hidden',
                        )}
                    >
                        {!!search && (
                            <>
                                <DataTableSearch 
                                    {...search}
                                />
                            </>
                        )}
                    </div>

                    <div 
                        className={cn(
                            'flex flex-row flex-wrap gap-x-2 gap-y-1',
                            !headerActions && 'hidden',
                        )}
                    >
                        {headerActions}
                    </div>
                </div>
            </div>
        </>
    );
}
