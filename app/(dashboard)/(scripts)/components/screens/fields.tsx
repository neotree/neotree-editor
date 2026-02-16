import { useCallback, useMemo, useState, useRef } from "react";
import { arrayMoveImmutable } from "array-move";
import { Plus, MoreVertical, Trash, Edit, CircleCheck, AlertCircle, X } from "lucide-react";
import { useQueryState } from 'nuqs';

import { DataTable } from "@/components/data-table";
import { useScreenForm } from "../../hooks/use-screen-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { FieldsBottomActions } from "./fields-bottom-actions";
import { Field } from "./field";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
    scriptId? : string;
};

export function Fields({
    form,
    disabled,
    scriptId
}: Props) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [manualOnly, setManualOnly] = useState(false);
    const [missingManualLabelOnly, setMissingManualLabelOnly] = useState(false);
    const { confirm } = useConfirmModal();

    const fields = form.watch('fields');
    const fieldMeta = useMemo(() => {
        return fields.map((field) => {
            const items = field.items || [];
            const manualItems = items.filter(item => !!item?.enterValueManually);
            const manualCount = manualItems.length;
            const hasManual = manualCount > 0;
            const missingManualLabelCount = manualItems.filter(item => !`${item?.enterValueManuallyLabel || ''}`.trim()).length;

            const searchableParts = [
                field.type,
                field.key,
                field.label,
                ...manualItems.map(item => `${item.label || ''}`),
                ...manualItems.map(item => `${item.value || ''}`),
                ...manualItems.map(item => `${item.enterValueManuallyLabel || ''}`),
            ];

            return {
                hasManual,
                manualCount,
                missingManualLabelCount,
                searchableText: searchableParts.join(' ').trim(),
            };
        });
    }, [fields]);

    const manualFieldsCount = useMemo(() => fieldMeta.filter(meta => meta.hasManual).length, [fieldMeta]);
    const missingLabelFieldsCount = useMemo(
        () => fieldMeta.filter(meta => meta.missingManualLabelCount > 0).length,
        [fieldMeta],
    );

    const onSort = useCallback((oldIndex: number, newIndex: number) => {
        const data = arrayMoveImmutable([...fields], oldIndex, newIndex);
        form.setValue(
            'fields',
            data.map((s, i) => ({
                ...s,
                position: i + 1,
            })),
            { shouldDirty: true, }
        );
    }, [form, fields]);

    const onDelete = useCallback((indexes: number[]) => {
        const labels = fields.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold text-danger">${s.label}</div>`).join('');
        confirm(() => {
            const data = fields.filter((_, i) => !indexes.includes(i));
            form.setValue(
                'fields',
                data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })),
                { shouldDirty: true, }
            );
            setSelectedIndexes([]);
        }, {
            title: 'Delete',
            message: `<p>Are you sure you want to delete ${indexes.length > 1 ? `${indexes.length} fields: ` : 'field: '}</p> ${labels}`,
            danger: true,
            positiveLabel: 'Delete',
        });
    }, [form, fields, confirm]);

    const onCopy = useCallback((indexes: number[]) => {
        const labels = fields.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold">${s.label}</div>`).join('');
        confirm(() => {
            const data = [
                ...fields,
                ...fields.filter((_, i) => indexes.includes(i)).map((f, i) => ({
                    ...f,
                    position: fields.length + 1 + i,
                })),
            ];
            form.setValue(
                'fields',
                data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })),
                { shouldDirty: true, }
            );
            setSelectedIndexes([]);
        }, {
            title: 'Duplicate',
            message: `<p>Are you sure you want to duplicate ${indexes.length > 1 ? `${indexes.length} fields: ` : 'field: '}</p> ${labels}`,
            positiveLabel: 'Duplicate',
        })
    }, [form, fields, confirm]);

    const [currentField, setCurrentField] = useQueryState('field', {
        defaultValue: '',
        clearOnDefault: true,
    });

    return (
        <>
            <button ref={btnRef} />

            {!!currentField && (
                <Field
                    open={!!currentField}
                    onClose={() => setCurrentField('')}
                    form={form}
                    scriptId={scriptId}
                    disabled={disabled}
                    field={!fields[Number(currentField)] ? undefined : {
                        data: fields[Number(currentField)],
                        index: Number(currentField),
                    }}
                />
            )}

            <DataTable 
                title="Fields"
                sortable={!disabled}
                selectable={!disabled}
                onSort={onSort}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                search={{
                    inputPlaceholder: 'Search fields, manual labels, or option keys',
                }}
                filter={(rowIndex) => {
                    const meta = fieldMeta[rowIndex];
                    if (!meta) return true;
                    if (manualOnly && !meta.hasManual) return false;
                    if (missingManualLabelOnly && meta.missingManualLabelCount < 1) return false;
                    return true;
                }}
                headerActions={disabled ? undefined : (
                    <>
                        <Button
                            variant={manualOnly ? "default" : "outline"}
                            onClick={() => setManualOnly(prev => !prev)}
                        >
                            <CircleCheck className="h-4 w-4 mr-2" />
                            Manual entry ({manualFieldsCount})
                        </Button>

                        <Button
                            variant={missingManualLabelOnly ? "default" : "outline"}
                            onClick={() => setMissingManualLabelOnly(prev => !prev)}
                        >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Missing label ({missingLabelFieldsCount})
                        </Button>

                        {(manualOnly || missingManualLabelOnly) && (
                            <Button
                                variant="ghost"
                                className="text-muted-foreground"
                                onClick={() => {
                                    setManualOnly(false);
                                    setMissingManualLabelOnly(false);
                                }}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear filters
                            </Button>
                        )}

                        <Button 
                            className="text-primary border-primary" 
                            variant="outline"
                            onClick={() => setCurrentField('new')}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            New field
                        </Button>
                    </>
                )}
                columns={[
                    {
                        name: 'Type',
                    },
                    {
                        name: 'Key',
                    },
                    {
                        name: 'Label',
                    },
                    {
                        name: 'Manual Entry',
                    },
                    {
                        name: 'Manual Search',
                        cellClassName: 'hidden',
                    },
                    {
                        name: 'Action',
                        align: 'right',
                        cellRenderer({ rowIndex }){
                            const field = fields[rowIndex];

                            return (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent>
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setTimeout(() => setCurrentField(`${rowIndex}`), 0);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            <span>{disabled ? 'View' : 'Edit'}</span>
                                        </DropdownMenuItem>

                                        {/* <DropdownMenuItem 
                                            disabled={disabled} 
                                            onClick={() => onCopy([rowIndex])}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            <span>Duplicate</span>
                                        </DropdownMenuItem> */}

                                        <DropdownMenuItem
                                            onClick={() => {
                                                btnRef.current?.click?.();
                                                setTimeout(() => onDelete([rowIndex]), 0);
                                            }}
                                            className={cn(
                                                'text-danger focus:bg-danger focus:text-danger-foreground',
                                            )}
                                            disabled={disabled}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        }
                    },
                ]}
                data={fields.map((f, i) => [
                    f.type,
                    f.key,
                    f.label,
                    fieldMeta[i]?.manualCount ? `${fieldMeta[i].manualCount} option${fieldMeta[i].manualCount > 1 ? 's' : ''}` : 'No',
                    fieldMeta[i]?.searchableText || '',
                    '',
                ])}
            />

            {!disabled && (
                <FieldsBottomActions 
                    disabled={disabled}
                    selected={selectedIndexes}
                    onDelete={() => onDelete(selectedIndexes)}
                    onCopy={() => onCopy(selectedIndexes)}
                />
            )}
        </>
    );
}
