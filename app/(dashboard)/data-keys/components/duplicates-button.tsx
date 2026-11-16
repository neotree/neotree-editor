'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CopyIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { findDuplicateKeyGroups } from '@/lib/data-key-merge-plan';

/** Opens the harmonise page; hidden when the library has no duplicate keys. */
export function DuplicatesButton() {
    const { allDataKeys } = useDataKeysCtx();
    const groups = useMemo(() => findDuplicateKeyGroups(allDataKeys), [allDataKeys]);

    if (!groups.length) return null;

    return (
        <Button asChild variant="outline" className="w-auto h-auto">
            <Link href="/data-keys/merge">
                <CopyIcon className="size-4 mr-2" />
                Duplicates
                <Badge variant="secondary" className="ml-2 font-normal">{groups.length}</Badge>
            </Link>
        </Button>
    );
}
