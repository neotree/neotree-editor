'use client';

import { useMemo, useState, useTransition } from 'react';
import { MoreVertical, EditIcon, EyeIcon, TrashIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { buildDataKeyParentIndex } from '@/lib/data-key-children';
import { DataKeyParentsIndicator } from './parents-indicator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { Loader } from '@/components/loader';
import { LockStatus, type LockStatusProps } from "@/components/lock-status";
import { useIsLocked } from "@/hooks/use-is-locked";
import { fetchDataKeyDeleteImpact, type DeleteImpactItem } from './delete-confirmation';
import { DataKeyDeleteReplacementDialog } from './delete-replacement-dialog';

export function DataKeysTableRowActions({
    rowIndex,
    disabled,
    setCurrentDataKeyUuid,
}: {
    rowIndex: number;
    disabled: boolean;
    setCurrentDataKeyUuid: (uuid: string) => void;
}) {
    const [isTransitionPending, startTransition] = useTransition();
    const [impactLoading, setImpactLoading] = useState(false);
    const [replacementImpact, setReplacementImpact] = useState<DeleteImpactItem[]>([]);
    const [showReplacementDialog, setShowReplacementDialog] = useState(false);

    const { dataKeys, allDataKeys, deleteDataKeys, deleting } = useDataKeysCtx();
    const { alert } = useAlertModal();

    const dataKey = dataKeys[rowIndex];

    // A key linked as a child option of another key cannot be deleted from the
    // library — it must be unlinked from its parent(s) first, so the delete
    // action is hidden and the linked parents are surfaced instead.
    const parentIndex = useMemo(() => buildDataKeyParentIndex(allDataKeys), [allDataKeys]);
    const linkedParents = !dataKey?.uniqueKey ? [] : (parentIndex.get(dataKey.uniqueKey) || []);
    const isChildKey = !!linkedParents.length;

    const lockStatusParams: LockStatusProps = {
        isDraft: dataKey?.isDraft,
        userId: dataKey?.draftCreatedByUserId,
        dataType: 'data key',
    };

    const isLocked = useIsLocked(lockStatusParams);

    disabled = disabled || isLocked;

    if (!dataKey) return null;

    return (
        <div className="flex gap-x-2">
            {isTransitionPending && <Loader overlay />}

            <DataKeyDeleteReplacementDialog
                open={showReplacementDialog}
                onOpenChange={setShowReplacementDialog}
                impact={replacementImpact}
                dataKeys={allDataKeys}
                deleting={deleting}
                loading={impactLoading}
                onConfirm={async ({ replacements, scriptRemovals }) => {
                    const success = await deleteDataKeys([dataKey.uuid], replacements, { scriptRemovals });
                    if (success) setShowReplacementDialog(false);
                    return success;
                }}
                onDeleteAnyway={async ({ replacements, scriptRemovals }) => {
                    const success = await deleteDataKeys([dataKey.uuid], replacements, {
                        allowMissingReplacements: true,
                        scriptRemovals,
                    });
                    if (success) setShowReplacementDialog(false);
                    return success;
                }}
            />

            <DataKeyParentsIndicator parents={linkedParents} />

            <LockStatus {...lockStatusParams} />

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem
                        asChild
                        onClick={() => setTimeout(() => startTransition(() => {}), 0)}
                    >
                        <Link href={`/data-keys/edit/${dataKey.uuid}`}>
                            {disabled ? (
                                <>
                                    <EyeIcon className="h-4 w-4 mr-2" /> View
                                </>
                            ) : (
                                <>
                                    <EditIcon className="h-4 w-4 mr-2" /> Edit
                                </>
                            )}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link target="_blank" href={`/data-keys/${dataKey.uuid}/metadata`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View metadata
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className={cn('text-destructive', (disabled || isChildKey) && 'hidden')}
                        onClick={() => setTimeout(async () => {
                            // Open instantly with a skeleton; the usage check fills it in.
                            setReplacementImpact([]);
                            setImpactLoading(true);
                            setShowReplacementDialog(true);
                            try {
                                const impact = await fetchDataKeyDeleteImpact([dataKey.uuid]);
                                setReplacementImpact(impact);
                            } catch (e: any) {
                                setShowReplacementDialog(false);
                                alert({
                                    title: 'Error',
                                    message: `Failed to check data key usage: ${e.message}`,
                                    variant: 'error',
                                });
                            } finally {
                                setImpactLoading(false);
                            }
                        }, 0)}
                    >
                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
