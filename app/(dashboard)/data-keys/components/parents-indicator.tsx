'use client';

import Link from 'next/link';
import { ExternalLinkIcon, Link2Icon } from 'lucide-react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { getDataKeyParentTitle, type DataKeyParentRef } from '@/lib/data-key-children';

/**
 * Small row indicator for keys linked as child options of other keys — mirrors
 * the LockStatus icon-with-popover pattern. The popover lists the linked
 * parents and explains why the key cannot be deleted from the library.
 */
export function DataKeyParentsIndicator({ parents }: {
    parents: DataKeyParentRef[];
}) {
    if (!parents.length) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button title="Linked parent data keys">
                    <Link2Icon className="w-4 h-4 text-primary/80" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="p-0 text-sm w-[260px]">
                <div className="p-2 border-b border-border text-xs text-muted-foreground">
                    Child option of {parents.length} data key{parents.length === 1 ? '' : 's'}.
                    Unlink it from the parent{parents.length === 1 ? '' : 's'} before deleting it.
                </div>

                <div className="max-h-[220px] overflow-y-auto">
                    {parents.map(parent => (
                        <Link
                            key={parent.uniqueKey}
                            href={`/data-keys/edit/${parent.uuid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-x-2 p-2 hover:bg-accent"
                        >
                            <div className="min-w-0">
                                <div className="truncate font-medium">{getDataKeyParentTitle(parent)}</div>
                                <div className="truncate text-xs text-muted-foreground">{parent.dataType || ''}</div>
                            </div>
                            <ExternalLinkIcon className="h-3 w-3 shrink-0 text-primary" />
                        </Link>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
