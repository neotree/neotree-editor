'use client';

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { arrayMoveImmutable } from "array-move";

import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { Loader } from "@/components/loader";
import { ScriptsTableRowActions } from "./scripts-table-row-actions";
import { SocketEventsListener } from "./socket-events-listener";
import { ScriptsBottomActions } from "./scripts-bottom-actions";

export function ScriptsTable({ scripts: scriptsProp }: {
    scripts: Awaited<ReturnType<IScriptsContext['_getScripts']>>;
}) {
    const [scripts, setScripts] = useState(scriptsProp);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setScripts(scriptsProp);
        setSelectedIndexes([]);
    }, [scriptsProp]);

    const router = useRouter();
    const { viewOnly, sys } = useAppContext();

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();
    
    const {
        _deleteDrafts,
        _deleteScripts,
        _importScripts,
        _updateScriptsWithoutPublishing,
    } = useScriptsContext();

    const onDelete = useCallback((scriptIds: string[]) => {
        const data = scripts.data.filter(u => scriptIds.includes(u.scriptId));
        const titles = data.map(u => u.title);

        confirm(() => {
            (async () => {
                try {
                    setLoading(true);
                    const published = data.filter(c => c.publishedVersion).map(c => c.scriptId);
                    const unpublished = data.filter(c => !c.publishedVersion).map(c => c.scriptDraftId!);
                    if (published.length) await _deleteScripts(published);
                    if (unpublished.length) await _deleteDrafts(unpublished);
                    setSelectedIndexes([]);
                    router.push('/');
                } catch(e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            })();
        }, {
            title: 'Delete ' + (titles.length > 1 ? 'scripts' : 'script'),
            message: `<p>Are you sure you want to delete:</p> ${titles.map(n => `<div class="font-bold text-danger">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Delete',
            danger: true,
        });
    }, [confirm, _deleteScripts, _deleteDrafts, router, scripts]);

    const onDuplicate = useCallback((scriptsIds: string[]) => {
        const data = scripts.data.filter(u => scriptsIds.includes(u.scriptId));
        const titles = data.map(u => u.title);

        confirm(() => {
            (async () => {
                let errors: string[] = [];
                try {
                    setLoading(true);
                    const res = await _importScripts(scriptsIds.map(scriptId => ({ scriptId })), { broadcastAction: true, });
                    if (res.errors?.length) {
                        res.errors.forEach(e => errors.push(e));
                    } else {
                        setSelectedIndexes([]);
                        router.refresh();
                    }
                } catch(e: any) {
                    errors.push(e.message);
                } finally {
                    setLoading(false);
                    if (errors.length) {
                        alert({
                            variant: 'error',
                            title: 'Error',
                            message: 'Failed to duplicate scripts: ' + errors.join('\n'),
                        });
                    } else {
                        alert({
                            variant: 'success',
                            title: 'success',
                            message: 'Script duplicated successfully!',
                        });
                    }
                }
            })();
        }, {
            title: 'Duplicate ' + (titles.length > 1 ? 'scripts' : 'script'),
            message: `<p>Are you sure you want to duplicate:</p> ${titles.map(n => `<div class="font-bold">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Duplicate',
        });
    }, [confirm, _importScripts, alert, router, scripts]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number) => {
        try {
            setLoading(true);

            const payload: Parameters<typeof _updateScriptsWithoutPublishing>[0] = [];

            const data = arrayMoveImmutable([...scripts.data], oldIndex, newIndex);
            
            data.forEach((s, i) => {
                const old = scripts.data[i];
                if (old.position !== s.position) {
                    payload.push({
                        scriptId: s.scriptId!,
                        data: {
                            position: i + 1,
                        },
                    });
                }
            });

            setScripts(prev => ({ 
                ...prev, 
                data: data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })), 
            }));

            if (payload.length) {
                await _updateScriptsWithoutPublishing(payload);
                router.refresh();
            }
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [_updateScriptsWithoutPublishing, alert, router, scripts]);

    return (
        <>
            {loading && <Loader overlay />}

            <SocketEventsListener 
                onDiscardDrafts={() => router.refresh()}
                onPublishData={() => router.refresh()}
                onCreateScriptsDrafts={() => router.refresh()}
                onUpdateScriptsDrafts={() => router.refresh()}
                onDeleteScriptsDrafts={() => router.refresh()}
            />

            <div className="flex flex-col">
                <DataTable
                    selectable={!viewOnly}
                    sortable={!viewOnly}
                    loading={loading}
                    maxRows={25}
                    selectedIndexes={selectedIndexes}
                    onSelect={setSelectedIndexes}
                    onSort={onSort}
                    title="Scripts"
                    getRowOptions={({ rowIndex }) => {
                        const s = scripts.data[rowIndex];
                        return {
                            className: cn(!viewOnly && s?.scriptDraftId && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    search={{
                        inputPlaceholder: 'Search scripts',
                    }}
                    columns={[
                        {
                            name: 'Position',
                            cellClassName: 'w-10',
                            align: 'center',
                            cellRenderer({ rowIndex }) {
                                return rowIndex + 1;
                            },
                        },
                        {
                            name: 'Title',
                        },
                        {
                            name: 'Description',
                        },
                        {
                            name: 'Version',
                            align: 'center',
                            cellClassName: cn('min-w-10', sys.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = scripts.data[cell.rowIndex];
                                return (
                                    <div className="inline-flex items-center gap-x-[2px]">
                                        <div className={cn('w-2 h-2 rounded-full', s.publishedVersion ? 'bg-green-400' : 'bg-gray-300')} />
                                        <span>{s.publishedVersion || s.version}</span>
                                        {(s.publishedVersion && (s.version !== s.publishedVersion)) && <span>(Draft v{s.version})</span>}
                                    </div>
                                );
                            },
                        },
                        {
                            name: 'Action',
                            align: 'center',
                            cellClassName: 'w-10',
                            cellRenderer(cell) {
                                const s = scripts.data[cell.rowIndex];
                                return (
                                    <ScriptsTableRowActions 
                                        script={s}
                                        onDelete={() => onDelete([s.scriptId])}
                                        onDuplicate={() => onDuplicate([s.scriptId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={scripts.data.map(u => [
                        u.position,
                        u.title || '',
                        u.description || '',
                        u.version,
                        '',
                    ])}
                />
            </div>

            {!!selectedIndexes.length && (
                <ScriptsBottomActions 
                    selected={scripts.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.scriptId || s.scriptDraftId!).filter(s => s)}
                    onDelete={() => onDelete(scripts.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.scriptId || s.scriptDraftId!).filter(s => s))}
                    onCopy={() => {}}
                />
            )}
        </>
    )
}
