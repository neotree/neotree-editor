'use client';

import { useCallback, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { arrayMoveImmutable } from 'array-move';

import { getScreensTableData } from "@/app/actions/_screens";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAppContext } from "@/contexts/app";
import { Loader } from "@/components/loader";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { ScreensTableRowActions } from "./table-row-actions";
import { ScreensBottomActions } from "./bottom-actions";
import { SocketEventsListener } from "../socket-events-listener";
import { getScriptPageHref } from "../../utils";

type Props = {
    scriptId?: string;
    scriptDraftId?: string;
    screens: Awaited<ReturnType<typeof getScreensTableData>>;
};

export function ScreensTable({ screens: screensProp, scriptDraftId, scriptId }: Props) {
    const [screens, setScreens] = useState(screensProp);

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { viewOnly, sys } = useAppContext();

    const scriptPageHref = useMemo(() => getScriptPageHref({ scriptDraftId, scriptId }), [scriptDraftId, scriptId]);

    const {
        _copyScreens,
        _deleteScreensDrafts,
        _deleteScreens,
        _updateScreensWithoutPublishing,
    } = useScriptsContext();

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    useEffect(() => {
        setScreens(screensProp);
        setSelectedIndexes([]);
    }, [screensProp]);

    const onDelete = useCallback((screensIds: string[], cb?: () => void) => {
        const data = screens.data.filter(s => screensIds.includes(s.screenId));
        const titles = data.map(s => s.title);

        confirm(() => {
            (async () => {
                try {
                    setLoading(true);
                    const published = data.filter(c => c.publishedVersion).map(c => c.screenId);
                    const unpublished = data.filter(c => !c.publishedVersion).map(c => c.screenDraftId!);
                    if (published.length) await _deleteScreens(published);
                    if (unpublished.length) await _deleteScreensDrafts(unpublished);
                    router.refresh();
                    setSelectedIndexes([]);
                    cb?.();

                } catch(e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            })();
        }, {
            title: 'Delete ' + (titles.length > 1 ? 'screens' : 'screen'),
            message: `<p>Are you sure you want to delete:</p> ${titles.map(n => `<div class="font-bold text-danger">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Delete',
            danger: true,
        });
    }, [confirm, _deleteScreens, _deleteScreensDrafts, router, screens]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number) => {
        try {
            setLoading(true);

            const payload: Parameters<typeof _updateScreensWithoutPublishing>[0] = [];

            const data = arrayMoveImmutable([...screens.data], oldIndex, newIndex);
            
            data.forEach((s, i) => {
                const old = screens.data[i];
                if (old.position !== s.position) {
                    payload.push({
                        screenId: s.screenId!,
                        scriptReference: (scriptId || scriptDraftId)!,
                        data: {
                            position: i + 1,
                        },
                    });
                }
            });

            setScreens(prev => ({ 
                ...prev, 
                data: data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })), 
            }));

            if (payload.length) {
                await _updateScreensWithoutPublishing(payload);
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
    }, [_updateScreensWithoutPublishing, alert, router, screens, scriptDraftId, scriptId]);

    const onCopy = useCallback(async ({ screensIds, scripts }: { 
        screensIds: string[], 
        scripts: { scriptReference: string; isDraft: boolean; }[]; 
    }, cb?: () => void) => {
        try {
            setLoading(true);

            const res = await _copyScreens({
                screensReferences: screensIds,
                scriptsReferences: scripts.map(s => s.scriptReference),
            });

            if (res.error) throw new Error(res.error);

            alert({
                title: 'Success',
                message: 'Screens copied successfully',
                variant: 'success',
                onClose: cb,
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
            });
        } finally {
            setTimeout(() => setLoading(false), 2000);
            setLoading(false);
        }
    }, [_copyScreens, alert]);

    return (
        <>
            {loading && <Loader overlay />}

            <SocketEventsListener 
                // onDiscardDrafts={() => router.push(scriptId ? scriptPageHref : '/')}
                // onPublishData={() => router.push(scriptId ? scriptPageHref : '/')}
                // onCreateScreensDrafts={() => router.refresh()}
                // onUpdateScreensDrafts={() => router.refresh()}
                // onDeleteScreensDrafts={() => router.refresh()}
            />

            <DataTable
                selectable={!viewOnly}
                sortable={!viewOnly}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                onSort={onSort}
                tableBodyClassname="[&_tr:last-child]:last:border-b"
                title=""
                getRowOptions={({ rowIndex }) => {
                    const s = screens.data[rowIndex];
                    return {
                        className: cn(!viewOnly && s?.screenDraftId && 'bg-danger/20 hover:bg-danger/30')
                    };
                }}
                search={{
                    inputPlaceholder: 'Search screens',
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
                        name: 'Type',
                    },
                    {
                        name: 'Epic',
                    },
                    {
                        name: 'Story',
                    },
                    {
                        name: 'Ref',
                    },
                    {
                        name: 'Title',
                    },
                    {
                        name: 'Version',
                        align: 'center',
                        cellClassName: cn('min-w-10', sys.hide_data_table_version === 'yes' && 'hidden'),
                        cellRenderer(cell) {
                            const s = screens.data[cell.rowIndex];
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
                            const s = screens.data[cell.rowIndex];
                            return (
                                <ScreensTableRowActions 
                                    screen={s}
                                    onDelete={() => onDelete([s.screenId])}
                                />
                            );
                        },
                    },
                ]}
                data={screens.data.map(s => [
                    s.position,
                    s.type,
                    s.epicId,
                    s.storyId,
                    s.refId,
                    s.title,
                    s.version,
                    '',
                ])}
            />

            {!!selectedIndexes.length && (
                <ScreensBottomActions 
                    scriptDraftId={scriptDraftId}
                    scriptId={scriptId}
                    screens={screens}
                    disabled={false}
                    onDelete={() => onDelete(screens.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.screenId))}
                    selected={screens.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.screenId)}
                    onCopy={scripts => onCopy({
                        scripts,
                        screensIds: screens.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.screenDraftId || s.screenId),
                    }, () => setSelectedIndexes([]))}
                />
            )}
        </>
    );
}
