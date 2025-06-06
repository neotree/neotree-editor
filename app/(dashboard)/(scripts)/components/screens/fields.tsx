import { useCallback, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import { Plus, MoreVertical, Trash, Edit } from "lucide-react";
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
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const { confirm } = useConfirmModal();

    const fields = form.watch('fields');

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
                    inputPlaceholder: 'Search fields',
                }}
                headerActions={disabled ? undefined : (
                    <>
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
                                            onClick={() => onDelete([rowIndex])}
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
                data={fields.map(f => [
                    f.type,
                    f.key,
                    f.label,
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
