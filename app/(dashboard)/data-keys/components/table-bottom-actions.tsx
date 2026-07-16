'use client';

import { useState } from 'react';
import { TrashIcon } from 'lucide-react';

import { useDataKeysCtx } from '@/contexts/data-keys';
import { Button } from '@/components/ui/button';
import { ActionsBar } from '@/components/actions-bar';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { getBlockedChildDeletions, getDataKeyParentTitle } from '@/lib/data-key-children';
import { ExportModal } from './export-modal';
import { fetchDataKeyDeleteImpact, type DeleteImpactItem } from './delete-confirmation';
import { DataKeyDeleteReplacementDialog } from './delete-replacement-dialog';

export function DataKeysTableBottomActions({ disabled, }: {
    disabled: boolean;
}) {
    const [impactLoading, setImpactLoading] = useState(false);
    const [replacementImpact, setReplacementImpact] = useState<DeleteImpactItem[]>([]);
    const [showReplacementDialog, setShowReplacementDialog] = useState(false);
    const { alert } = useAlertModal();
    const { selected, setSelected, deleteDataKeys, allDataKeys, deleting } = useDataKeysCtx();

    if (disabled || !selected.length) return null;

    return (
        <>
            <DataKeyDeleteReplacementDialog
                open={showReplacementDialog}
                onOpenChange={setShowReplacementDialog}
                impact={replacementImpact}
                dataKeys={allDataKeys}
                deleting={deleting}
                loading={impactLoading}
                onConfirm={async ({ replacements, scriptRemovals }) => {
                    const success = await deleteDataKeys(selected.map(s => s.uuid), replacements, { scriptRemovals });
                    if (success) setShowReplacementDialog(false);
                    return success;
                }}
                onDeleteAnyway={async ({ replacements, scriptRemovals }) => {
                    const success = await deleteDataKeys(selected.map(s => s.uuid), replacements, {
                        allowMissingReplacements: true,
                        scriptRemovals,
                    });
                    if (success) setShowReplacementDialog(false);
                    return success;
                }}
            />
            <ActionsBar>
                <Button
                    variant="ghost"
                    onClick={() => setSelected([])}
                >
                    Cancel
                </Button>

                <ExportModal
                    uuids={selected.map(s => s.uuid)}
                />

                <Button
                    variant="destructive"
                    onClick={() => setTimeout(async () => {
                        const uuids = selected.map(s => s.uuid);

                        // Child keys can only be deleted together with every
                        // parent that links them; otherwise they must be
                        // unlinked from the parent first. The server enforces
                        // the same rule.
                        const selectedIds = new Set(uuids);
                        const blocked = getBlockedChildDeletions({
                            dataKeys: allDataKeys,
                            targets: allDataKeys.filter(key => key?.uuid && selectedIds.has(key.uuid)),
                        });
                        if (blocked.length) {
                            alert({
                                title: 'Cannot delete child data keys',
                                variant: 'error',
                                message: blocked
                                    .map(item => `"${item.name || item.label || item.uniqueKey}" is a child option of ${item.parents.map(p => `"${getDataKeyParentTitle(p)}"`).join(', ')}.`)
                                    .join(' ') + ' Unlink them from their parent data keys first.',
                            });
                            return;
                        }

                        // Open instantly with a skeleton; the usage check fills it in.
                        setReplacementImpact([]);
                        setImpactLoading(true);
                        setShowReplacementDialog(true);
                        try {
                            const impact = await fetchDataKeyDeleteImpact(uuids);
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
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete{selected.length > 1 ? ` ${selected.length} keys` : ''}
                </Button>
            </ActionsBar>
        </>
    );
}
