'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CopyIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { findDuplicateParentGroups } from '@/lib/data-key-merge-plan';

/** Opens the harmonise page; hidden when the library has no duplicate parents. */
export function DuplicateParentsButton() {
    const { allDataKeys } = useDataKeysCtx();
    const groups = useMemo(() => findDuplicateParentGroups(allDataKeys), [allDataKeys]);

    if (!groups.length) return null;

    return (
        <Button asChild variant="outline" className="w-auto h-auto">
            <Link href="/data-keys/merge">
                <CopyIcon className="size-4 mr-2" />
                Duplicate parents
                <Badge variant="secondary" className="ml-2 font-normal">{groups.length}</Badge>
            </Link>
        </Button>
    );
}
