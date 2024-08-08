import { useCallback, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import { Plus, MoreVertical, Trash, Edit, Copy } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { useScreenForm } from "@/hooks/scripts/use-screen-form";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
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
};

export function Fields({
    form,
    disabled,
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

    return (
        <>
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
                headerActions={(
                    <>
                        <Field
                            form={form}
                            disabled={disabled}
                        >
                            {!disabled && (
                                <DialogTrigger asChild>
                                    <Button className="text-primary border-primary" variant="outline">
                                        <Plus className="h-4 w-4 mr-1" />
                                        New field
                                    </Button>
                                </DialogTrigger>
                            )}
                        </Field>
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
                                        <DropdownMenuItem asChild>
                                            <Field 
                                                disabled={disabled} 
                                                form={form}
                                                field={{
                                                    data: field,
                                                    index: rowIndex,
                                                }}
                                            >
                                                {({ extraProps }) => (
                                                    <DialogTrigger 
                                                        {...extraProps}
                                                        className={cn(extraProps?.className, 'w-full')}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        <span>{disabled ? 'View' : 'Edit'}</span>
                                                    </DialogTrigger>
                                                )}
                                            </Field>
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
