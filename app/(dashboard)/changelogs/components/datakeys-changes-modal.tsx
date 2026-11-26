import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, DownloadIcon, EditIcon, XIcon } from "lucide-react";
import axios from "axios";
import moment from "moment";

import { cn } from "@/lib/utils";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { getChangeLogs } from '@/app/actions/change-logs';
import { ScriptField, ScriptItem } from "@/types";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { DataVersionSummary } from "../hooks/use-changelogs-table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getScripts } from "@/app/actions/scripts";
import { downloadExcel } from "@/lib/excel-export";

type Props = React.HTMLAttributes<HTMLButtonElement> & {
    entry: DataVersionSummary;
    open: boolean;
    onClose: () => void;
};

export function DataKeysChangesModal({
    entry,
    open,
    onClose,
    ...props
}: Props) {
    const initialised = useRef(false);
    const [loading, setLoading] = useState(false);
    const [sheetData, setSheetData] = useState<Awaited<ReturnType<typeof generateSheetData>>>([]);
    const [formData, setFormData] = useState<{
        label: string;
        value: string;
        index: number;
        field: keyof typeof sheetData[0];
        edited?: boolean;
    }[][]>([]);
    const [editIndexes, setEditIndexes] = useState<number[]>([]);

    const { alert } = useAlertModal();

    const init = useCallback(async () => {
        try {
            setLoading(true);

            const sheetData = await generateSheetData({ entry, });
            const _formData: typeof formData = sheetData.map((item, i) => [
                { label: 'Script name', value: item.script_name, field: 'script_name', index: i, },
                { label: 'Site', value: item.site, field: 'site', index: i, },
                { label: 'Change type', value: item.change_type, field: 'change_type', index: i, },
                { label: 'Field label', value: item.field_label, field: 'field_label', index: i, },
                { label: 'Option code', value: item.option_code, field: 'option_code', index: i, },
                { label: 'Before', value: item.before, field: 'before', index: i, },
                { label: 'After', value: item.after, field: 'after', index: i, },
                { label: 'Meaning risk', value: item.meaning_risk, field: 'meaning_risk', index: i, },
                { label: 'Effect on data', value: item.effect_on_data, field: 'effect_on_data', index: i, },
                { label: 'Analyst action', value: item.analyst_action, field: 'analyst_action', index: i, },
                { label: 'Reason', value: item.reason, field: 'reason', index: i, },
            ]);

            initialised.current = true;

            setSheetData(sheetData);
            setFormData(_formData);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'ERROR: ' + e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [entry, alert, setLoading]);

    const onDownloadExcel = useCallback(() => {
        downloadExcel([{
            name: `v${entry.dataVersion}`,
            rows: sheetData.map(item => {
                const { 
                    country,
                    script_id, 
                    ...row 
                } = item;
                return row;
            }),
        }], `v${entry.dataVersion}.xlsx`);
    }, [sheetData]);

    useEffect(() => {
        if (!initialised.current) {
            init();
        }
    }, [init]);

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={() => { /**/ }}
            >
                <DialogContent hideCloseButton className="!flex min-h-0 max-h-[90dvh] flex-col overflow-hidden gap-y-4 p-0 m-0 sm:max-w-xl">
                    <DialogHeader className="shrink-0 border-b border-b-border px-4 py-4">
                        <DialogTitle>Datakeys changes</DialogTitle>
                        <DialogDescription className="hidden">{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-2">
                        {!sheetData.length ? (
                            <div className="text-xl text-center">
                                No datakeys changes found
                            </div>
                        ) : (
                            <div>
                                {formData.map((item, i) => {
                                    const key = `${i}`;
                                    const isEditing = editIndexes.includes(i);
                                    const editables = ['meaning_risk', 'effect_on_data', 'analyst_action', 'reason',];

                                    return (
                                        <Card key={key} className="mb-2">
                                            <CardContent>
                                                <div>
                                                    <div className="py-4 flex items-start">
                                                        <button
                                                            className="ml-auto"
                                                            onClick={() => setEditIndexes(prev => {
                                                                if (prev.includes(i)) {
                                                                    return prev.filter(v => v !== i);
                                                                } else {
                                                                    return [...prev, i];
                                                                }
                                                            })}
                                                        >
                                                            {isEditing ? <XIcon className="size-4" /> : <EditIcon className="size-4" />}
                                                        </button>
                                                    </div>

                                                    {item.map((f, j) => {
                                                        const key = `${j}`;

                                                        return (
                                                            <div key={key} className="text-xs flex items-start">
                                                                <div className="font-bold">{f.label}</div>
                                                                <div className="flex-1">
                                                                    {(isEditing && editables.includes(f.field)) ? 
                                                                        <div className="ml-2 mb-2">
                                                                            <Textarea 
                                                                                rows={2}
                                                                                value={f.value}
                                                                                onChange={e => {
                                                                                    setFormData(prev => prev.map((_item, _itemIndex) => {
                                                                                        if (i !== _itemIndex) return _item;
                                                                                        return _item.map((f, _j) => {
                                                                                            if (j !== _j) return f;
                                                                                            return { ...f, value: e.target.value, };
                                                                                        })
                                                                                    }));
                                                                                    setSheetData(prev => prev.map((_item, _itemIndex) => {
                                                                                        if (_itemIndex !== i) return _item;
                                                                                        return {
                                                                                            ..._item,
                                                                                            [f.field]: e.target.value,
                                                                                        };
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        : 
                                                                        <div className="text-right">{f.value}</div> }
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="shrink-0 border-t border-t-border px-4 py-2 items-center w-full">
                        <DialogClose asChild>
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        </DialogClose>

                        <Button onClick={onDownloadExcel}>
                            Download excel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {loading && <Loader overlay />}
        </>
    );
}

type SheetDataItem = {
    script_name: string;
    script_id: string;
    country: string;
    site: string;
    form: string;
    version_from: string;
    version_to: string;
    published_on: string;
    live_from: string;
    change_id: string;
    change_type: string;
    screen: string;
    data_key: string;
    field_label: string;
    option_code: string;
    before: string;
    after: string;
    meaning_risk: string;
    effect_on_data: string;
    analyst_action: string;
    reason: string;
    published_by: string;
};

async function generateSheetData({ entry, }: {
    entry: Props['entry'];
}) {
    const res = await axios.get<Awaited<ReturnType<typeof getChangeLogs>>>(
        `/api/changelogs/get/${entry.dataVersion}?limit=999999`
    );

    const entries = res.data.data;

    const sheetData: SheetDataItem[] = [];
    
    entries
        .filter(s => s.scriptId)
        .filter(s => s.action !== 'create')
        .forEach(s => {
            const item: SheetDataItem = {
                script_name: s.scriptTitle || '',
                script_id: s.scriptId || '',
                country: '',
                site: '',
                form: '',
                version_from: s.dataVersion ? `${s.dataVersion - 1 || ''}` : '',
                version_to: s.dataVersion ? `${s.dataVersion || ''}` : '',
                published_on: moment(s.createdAt).format('LLL'),
                live_from: '',
                change_id: '',
                change_type: '',
                screen: s.entityType === 'screen' ? `${s.entityName || ''}` : '',
                data_key: '',
                field_label: '',
                option_code: '',
                before: '',
                after: '',
                meaning_risk: '',
                effect_on_data: '',
                analyst_action: '',
                reason: '',
                published_by: s.userName || '',
            };

            const oldFields: ScriptField[] = ((s.changes as any)?.oldValues || []).find((s: any) => s.fields)?.fields || [];
            const oldItems: ScriptItem[] = ((s.changes as any)?.oldValues || []).find((s: any) => s.items)?.items || [];
            const oldKey: string = ((s.changes as any)?.oldValues || []).find((s: any) => s.key)?.key || '';
            const oldLabel: string = ((s.changes as any)?.oldValues || []).find((s: any) => s.label)?.label || '';

            const newFields: ScriptField[] = ((s.changes as any)?.newValues || []).find((s: any) => s.fields)?.fields || [];
            const newItems: ScriptItem[] = ((s.changes as any)?.newValues || []).find((s: any) => s.items)?.items || [];
            const newKey: string = ((s.changes as any)?.newValues || []).find((s: any) => s.key)?.key || '';
            const newLabel: string = ((s.changes as any)?.newValues || []).find((s: any) => s.label)?.label || '';

            if (newKey || newLabel || newFields.length || newItems.length) {
                const addedFields = newFields.filter(f => !oldFields.map(f => f.fieldId).includes(f.fieldId));
                const removedFields = oldFields.filter(f => !newFields.map(f => f.fieldId).includes(f.fieldId));

                const addedItems = newItems.filter(f => !oldItems.map(f => f.itemId).includes(f.itemId));
                const removedItems = oldItems.filter(f => !newItems.map(f => f.itemId).includes(f.itemId));

                newFields
                    .filter(f => !addedFields.map(f => f.fieldId).includes(f.fieldId))
                    .filter(f => !removedFields.map(f => f.fieldId).includes(f.fieldId))
                    .forEach(f => {
                        const prevFields: ScriptField[] = s.previousSnapshot.fields || [];
                        const prevField = prevFields.find(prevF => prevF.fieldId === f.fieldId);

                        const newOptions = f.items || [];
                        const oldOptions = prevField?.items || [];
                        const addedOptions = newOptions.filter(f => !oldOptions.map(f => f.itemId).includes(f.itemId));
                        const removedOptions = oldOptions.filter(f => !newOptions.map(f => f.itemId).includes(f.itemId));

                        addedOptions.forEach(o => {
                            sheetData.push({
                                ...item,
                                change_type: 'option_added',
                                data_key: f.key || '',
                                option_code: `${o.value || ''}`,
                                field_label: `${o.label || ''}`,
                                before: '',
                                after: `${o.label || ''}`,
                            });
                        });

                        removedOptions.forEach(o => {
                            sheetData.push({
                                ...item,
                                change_type: 'option_removed',
                                data_key: f.key || '',
                                option_code: `${o.value || ''}`,
                                field_label: `${o.label || ''}`,
                                before: `${o.label || ''}`,
                                after: '',
                            });
                        });

                        newOptions
                            .filter(f => !addedOptions.map(f => f.itemId).includes(f.itemId))
                            .filter(f => !removedOptions.map(f => f.itemId).includes(f.itemId))
                            .forEach(o => {
                                const prevOption = (prevField?.items || []).find(prevO => prevO.itemId === o.itemId);

                                if (prevOption?.value !== o?.value) {
                                    sheetData.push({
                                        ...item,
                                        change_type: 'option_key_changed',
                                        data_key: f.key,
                                        option_code: `${o.value || ''}`,
                                        field_label: f.label,
                                        before: `${prevOption?.value || ''}`,
                                        after: `${o.value || ''}`,
                                    });
                                }

                                if (prevOption?.label !== o?.label) {
                                    sheetData.push({
                                        ...item,
                                        change_type: 'option_label_changed',
                                        data_key: f.key,
                                        option_code: `${o.value || ''}`,
                                        field_label: f.label,
                                        before: `${prevOption?.label || ''}`,
                                        after: `${o.label || ''}`,
                                    });
                                }
                            });

                        if (prevField?.key !== f?.key) {
                            sheetData.push({
                                ...item,
                                change_type: 'key_changed',
                                data_key: f.key,
                                field_label: f.label,
                                before: prevField?.key || '',
                                after: f.key,
                            });
                        }

                        if (prevField?.label !== f?.label) {
                            sheetData.push({
                                ...item,
                                change_type: 'label_changed',
                                data_key: f.key,
                                field_label: f.label,
                                before: prevField?.label || '',
                                after: f.label,
                            });
                        }

                        if (prevField?.unit !== f?.unit) {
                            sheetData.push({
                                ...item,
                                change_type: 'unit_changed',
                                data_key: f.key,
                                field_label: f.label,
                                before: prevField?.unit || '',
                                after: f.unit || '',
                            });
                        }

                        if (prevField?.optional !== f?.optional) {
                            sheetData.push({
                                ...item,
                                change_type: 'required_changed',
                                data_key: f.key,
                                field_label: f.label,
                                before: `${prevField?.optional || ''}` || '',
                                after: `${f.optional || ''}`,
                            });
                        }
                    });

                newItems
                    .filter(f => !addedItems.map(f => f.itemId).includes(f.itemId))
                    .filter(f => !removedItems.map(f => f.itemId).includes(f.itemId))
                    .forEach(f => {
                        const prevItems: ScriptItem[] = s.previousSnapshot.items || [];
                        const prevField = prevItems.find(prevF => prevF.itemId === f.itemId);
                        if (prevField?.key !== f?.key) {
                            sheetData.push({
                                ...item,
                                change_type: 'key_changed',
                                data_key: f.id || f.key,
                                field_label: f.label,
                                before: prevField?.key || '',
                                after: f.key,
                            });
                        }

                        if (prevField?.label !== f?.label) {
                            sheetData.push({
                                ...item,
                                change_type: 'label_changed',
                                data_key: f.id || f.key,
                                field_label: f.label,
                                before: prevField?.label || '',
                                after: f.label,
                            });
                        }
                    });

                addedFields.forEach(f => {
                    sheetData.push({
                        ...item,
                        change_type: 'field_added',
                        data_key: f.key,
                        field_label: f.label,
                        before: '',
                        after: f.label,
                    });
                });

                removedFields.forEach(f => {
                    sheetData.push({
                        ...item,
                        change_type: 'field_removed',
                        data_key: f.key,
                        field_label: f.label,
                        before: f.label,
                        after: '',
                    });
                });

                addedItems.forEach(f => {
                    sheetData.push({
                        ...item,
                        change_type: 'field_added',
                        data_key: f.id || f.key,
                        field_label: f.label,
                        before: '',
                        after: f.label,
                    });
                });

                removedItems.forEach(f => {
                    sheetData.push({
                        ...item,
                        change_type: 'field_removed',
                        data_key: f.id || f.key,
                        field_label: f.label,
                        before: f.label,
                        after: '',
                    });
                });

                if (newKey !== oldKey) {
                    sheetData.push({
                        ...item,
                        change_type: 'key_changed',
                        data_key: newKey,
                        field_label: s.fullSnapshot.label || '',
                        before: oldKey,
                        after: newKey,
                    });
                }

                if (newLabel !== oldLabel) {
                    sheetData.push({
                        ...item,
                        change_type: 'label_changed',
                        data_key: s.previousSnapshot?.key || '',
                        field_label: s.previousSnapshot?.label || '',
                        before: oldLabel,
                        after: newLabel,
                    });
                }
            }
        });

    let scriptsIds = sheetData.filter(s => s.script_id).map(s => s.script_id!);
    scriptsIds = scriptsIds.filter((s, i) => scriptsIds.indexOf(s) === i);

    if (scriptsIds.length) {
        const scriptsRes = await axios.get<Awaited<ReturnType<typeof getScripts>>>(
            `/api/scripts?data=${JSON.stringify({ scriptsIds, })}`
        );

        const scripts = scriptsRes.data.data;

        sheetData.forEach((item, i) => {
            const script = scripts.find(s => s.scriptId === item.script_id);
            if (script) {
                sheetData[i].site = script.hospitalName;
                sheetData[i].form = script.type;
            }
        });
    }

    return sheetData;
}
