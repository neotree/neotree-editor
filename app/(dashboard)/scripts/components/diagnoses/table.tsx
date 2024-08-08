'use client';

import { useCallback, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { arrayMoveImmutable } from 'array-move';

import { getDiagnosesTableData } from "@/app/actions/_diagnoses";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAppContext } from "@/contexts/app";
import { Loader } from "@/components/loader";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DiagnosesTableRowActions } from "./table-row-actions";
import { DiagnosesBottomActions } from "./bottom-actions";
import { SocketEventsListener } from "../socket-events-listener";
import { getScriptPageHref } from "../../utils";

type Props = {
    scriptId?: string;
    scriptDraftId?: string;
    diagnoses: Awaited<ReturnType<typeof getDiagnosesTableData>>;
};

export function DiagnosesTable({ diagnoses: diagnosesProp, scriptDraftId, scriptId }: Props) {
    const [diagnoses, setDiagnoses] = useState(diagnosesProp);

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { viewOnly, sys } = useAppContext();

    const scriptPageHref = useMemo(() => getScriptPageHref({ scriptDraftId, scriptId }), [scriptDraftId, scriptId]);

    const {
        _copyDiagnoses,
        _deleteDiagnosesDrafts,
        _deleteDiagnoses,
        _updateDiagnosesWithoutPublishing,
    } = useScriptsContext();

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    useEffect(() => {
        setDiagnoses(diagnosesProp);
        setSelectedIndexes([]);
    }, [diagnosesProp]);

    const onDelete = useCallback((diagnosesIds: string[], cb?: () => void) => {
        const data = diagnoses.data.filter(s => diagnosesIds.includes(s.diagnosisId));
        const names = data.map(s => s.name);

        confirm(() => {
            (async () => {
                try {
                    setLoading(true);
                    const published = data.filter(c => c.publishedVersion).map(c => c.diagnosisId);
                    const unpublished = data.filter(c => !c.publishedVersion).map(c => c.diagnosisDraftId!);
                    if (published.length) await _deleteDiagnoses(published);
                    if (unpublished.length) await _deleteDiagnosesDrafts(unpublished);
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
            title: 'Delete ' + (names.length > 1 ? 'diagnoses' : 'diagnosis'),
            message: `<p>Are you sure you want to delete:</p> ${names.map(n => `<div class="font-bold text-danger">${n}</div>`).join('')}`,
            negativeLabel: 'Cancel',
            positiveLabel: 'Delete',
            danger: true,
        });
    }, [confirm, _deleteDiagnoses, _deleteDiagnosesDrafts, router, diagnoses]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number) => {
        try {
            setLoading(true);

            const payload: Parameters<typeof _updateDiagnosesWithoutPublishing>[0] = [];

            const data = arrayMoveImmutable([...diagnoses.data], oldIndex, newIndex);
            
            data.forEach((s, i) => {
                const old = diagnoses.data[i];
                if (old.position !== s.position) {
                    payload.push({
                        diagnosisId: s.diagnosisId!,
                        scriptReference: (scriptId || scriptDraftId)!,
                        data: {
                            position: i + 1,
                        },
                    });
                }
            });

            setDiagnoses(prev => ({ 
                ...prev, 
                data: data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })), 
            }));

            if (payload.length) {
                await _updateDiagnosesWithoutPublishing(payload);
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
    }, [_updateDiagnosesWithoutPublishing, alert, router, diagnoses, scriptDraftId, scriptId]);

    const onCopy = useCallback(async ({ diagnosesIds, scripts }: { 
        diagnosesIds: string[], 
        scripts: { scriptReference: string; isDraft: boolean; }[]; 
    }, cb?: () => void) => {
        try {
            setLoading(true);

            const res = await _copyDiagnoses({
                diagnosesReferences: diagnosesIds,
                scriptsReferences: scripts.map(s => s.scriptReference),
            });

            if (res.error) throw new Error(res.error);

            alert({
                title: 'Success',
                message: 'Diagnoses copied successfully',
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
    }, [_copyDiagnoses, alert]);

    return (
        <>
            {loading && <Loader overlay />}

            <SocketEventsListener 
                // onDiscardDrafts={() => router.push(scriptId ? scriptPageHref : '/')}
                // onPublishData={() => router.push(scriptId ? scriptPageHref : '/')}
                // onCreateDiagnosesDrafts={() => router.refresh()}
                // onUpdateDiagnosesDrafts={() => router.refresh()}
                // onDeleteDiagnosesDrafts={() => router.refresh()}
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
                    const s = diagnoses.data[rowIndex];
                    return {
                        className: cn(!viewOnly && s?.diagnosisDraftId && 'bg-danger/20 hover:bg-danger/30')
                    };
                }}
                search={{
                    inputPlaceholder: 'Search diagnoses',
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
                        name: 'Name',
                    },
                    {
                        name: 'Description',
                    },
                    {
                        name: 'Version',
                        align: 'center',
                        cellClassName: cn('min-w-10', sys.hide_data_table_version === 'yes' && 'hidden'),
                        cellRenderer(cell) {
                            const s = diagnoses.data[cell.rowIndex];
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
                            const s = diagnoses.data[cell.rowIndex];
                            return (
                                <DiagnosesTableRowActions 
                                    diagnosis={s}
                                    onDelete={() => onDelete([s.diagnosisId])}
                                />
                            );
                        },
                    },
                ]}
                data={diagnoses.data.map(s => [
                    s.position,
                    s.name,
                    s.description,
                    s.version,
                    '',
                ])}
            />

            {!!selectedIndexes.length && (
                <DiagnosesBottomActions 
                    scriptDraftId={scriptDraftId}
                    scriptId={scriptId}
                    diagnoses={diagnoses}
                    disabled={false}
                    onDelete={() => onDelete(diagnoses.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.diagnosisId))}
                    selected={diagnoses.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.diagnosisId)}
                    onCopy={scripts => onCopy({
                        scripts,
                        diagnosesIds: diagnoses.data.filter((_, i) => selectedIndexes.includes(i)).map(s => s.diagnosisDraftId || s.diagnosisId),
                    }, () => setSelectedIndexes([]))}
                />
            )}
        </>
    );
}
