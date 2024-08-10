'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DataTable } from "@/components/data-table";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app";
import { ScriptsTableBottomActions } from "./scripts-table-bottom-actions";
import { ScriptsTableActions } from "./scripts-table-row-actions";
import { ScriptsExportModal } from "./scripts-export-modal";
import { ScriptsFab } from "./scripts-fab";


type Props = {
    scripts: Awaited<ReturnType<IScriptsContext['getScripts']>>;
};

export function ScriptsTable({
    scripts: scriptsProp,
}: Props) {
    const [scripts, setScripts] = useState(scriptsProp);
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [scriptsIdsToExport, setScriptsIdsToExport] = useState<string[]>([]);

    useEffect(() => { setScripts(scriptsProp); }, [scriptsProp]);

    const router = useRouter();
    const { sys, viewOnly, isDefaultUser } = useAppContext();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const {
        hospitals,
        deleteScripts,
        saveScripts,
    } = useScriptsContext();

    const onDelete = useCallback(async (scriptsIds: string[]) => {
        confirm(async () => {
            const _scripts = { ...scripts };

            setScripts(prev => ({ ...prev, data: prev.data.filter(s => !scriptsIds.includes(s.scriptId)) }));
            setSelected([]);

            setLoading(true);

            const res = await deleteScripts({ scriptsIds, broadcastAction: true, });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                    onClose: () => setScripts(_scripts),
                });
            } else {
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Scripts deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete scripts',
            message: 'Are you sure you want to delete scripts?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteScripts, confirm, alert, router, scripts]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number, sortedIndexes: { oldIndex: number, newIndex: number, }[]) => {
        const payload: { scriptId: string; position: number; }[] = [];
        const sorted = sortedIndexes.map(({ oldIndex, newIndex }) => {
            const s = scripts.data[oldIndex];
            let position = s.position;
            if (oldIndex !== newIndex) {
                position = newIndex + 1;
                payload.push({ scriptId: s.scriptId, position, });
            }
            return {
                ...s,
                position,
            };
        }).sort((a, b) => a.position - b.position);

        setScripts(prev => ({ ...prev, data: sorted, }));
        
        await saveScripts({ data: payload, broadcastAction: true, });

        router.refresh();
    }, [saveScripts, alert, scripts, router]);

    const onDuplicate = useCallback(async (scriptsIds?: string[]) => {
        window.alert('DUPLICATE SCRIPT!!!');
    }, []);

    const disabled = useMemo(() => viewOnly || isDefaultUser, [isDefaultUser]);
    const scriptsToExport = useMemo(() => scripts.data.filter(t => scriptsIdsToExport.includes(t.scriptId)), [scriptsIdsToExport, scripts]);

    return (
        <>
            {loading && <Loader overlay />}

            {!!scriptsIdsToExport.length && (
                <ScriptsExportModal 
                    open 
                    scriptsIdsToExport={scriptsIdsToExport}
                    onOpenChange={() => setScriptsIdsToExport([])} 
                    setScriptsIdsToExport={setScriptsIdsToExport}
                />
            )}

            <ScriptsFab disabled={disabled} />

            <div className="">
                <DataTable 
                    selectedIndexes={selected}
                    onSelect={setSelected}
                    title="Scripts"
                    selectable={!disabled}
                    sortable={!disabled}
                    loading={loading}
                    maxRows={25}
                    onSort={onSort}
                    getRowOptions={({ rowIndex }) => {
                        const s = scripts.data[rowIndex];
                        return !s ? {} : {
                            className: cn(!viewOnly && s.isDraft && 'bg-danger/20 hover:bg-danger/30')
                        };
                    }}
                    search={{
                        inputPlaceholder: 'Search scripts',
                    }}
                    noDataMessage={(
                        <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                            <div>No scripts saved.</div>
                        </div>
                    )}
                    columns={[
                        {
                            name: 'Position',
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
                            name: 'Hospital',
                            cellRenderer({ rowIndex }) {
                                const s = scripts.data[rowIndex];
                                if (!s) return null;
                                return hospitals.data.filter(h => h.hospitalId === s.hospitalId)[0]?.name || '';
                            },
                        },
                        {
                            name: 'Version',
                            align: 'right',
                            cellClassName: cn('w-[100px]', sys.hide_data_table_version === 'yes' && 'hidden'),
                            cellRenderer(cell) {
                                const s = scripts.data[cell.rowIndex];

                                if (!s) return null;

                                const publishedVersion = s.isDraft ? Math.max(0, (s.version - 1)) : s.version;

                                return (
                                    <div className="inline-flex w-full justify-end items-center gap-x-[2px]">
                                        <div className={cn('w-2 h-2 rounded-full', publishedVersion ? 'bg-green-400' : 'bg-gray-300')} />
                                        <span>{publishedVersion || s.version}</span>
                                        {s.isDraft && <Edit className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                );
                            },
                        },
                        {
                            name: 'Action',
                            align: 'right',
                            cellClassName: 'w-10',
                            cellRenderer({ rowIndex, }) {
                                const s = scripts.data[rowIndex];
                                if (!s) return null;
                                return (
                                    <ScriptsTableActions 
                                        item={s}
                                        disabled={disabled}
                                        setScriptsIdsToExport={() => setScriptsIdsToExport([s.scriptId])}
                                        onDelete={() => onDelete([s.scriptId])}
                                        onDuplicate={() => onDuplicate([s.scriptId])}
                                    />
                                );
                            },
                        },
                    ]}
                    data={scripts.data.map(s => [
                        s.position,
                        s.title || '',
                        s.description || '',
                        s.hospitalName || '',
                        s.version,
                        '',
                    ])}
                />
            </div>

            <ScriptsTableBottomActions 
                selected={selected}
                onDelete={() => onDelete(selected.map(i => scripts.data[i].scriptId).filter(s => s))}
                setScriptsIdsToExport={() => setScriptsIdsToExport(selected.map(i => scripts.data[i].scriptId).filter(s => s))}
            />
        </>
    )
}
