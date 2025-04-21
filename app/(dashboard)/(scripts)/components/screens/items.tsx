import { useCallback, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import { Plus, MoreVertical, Trash, Edit, Copy } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { useScreenForm } from "../../hooks/use-screen-form";
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
import { ItemsBottomActions } from "./items-bottom-actions";
import { Item } from "./item";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
};

export function Items({
    form,
    disabled,
}: Props) {
    const screenType = form.getValues('type');
    const isDiagnosisScreen = screenType === 'diagnosis';
    const isChecklistScreen = screenType === 'checklist';

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const { confirm } = useConfirmModal();

    const items = form.watch('items');

    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [activeItem, setActiveItem] = useState<null | {
        index: number;
        data: typeof items[0];
    }>(null);

    const onSort = useCallback((oldIndex: number, newIndex: number) => {
        const data = arrayMoveImmutable([...items], oldIndex, newIndex);
        form.setValue(
            'items',
            data.map((s, i) => ({
                ...s,
                position: i + 1,
            })),
            { shouldDirty: true, }
        );
    }, [form, items]);

    const onDelete = useCallback((indexes: number[]) => {
        const labels = items.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold text-danger">${s.label}</div>`).join('');
        confirm(() => {
            const data = items.filter((_, i) => !indexes.includes(i));
            form.setValue(
                'items',
                data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })),
                { shouldDirty: true, }
            );
            setSelectedIndexes([]);
        }, {
            title: 'Delete',
            message: `<p>Are you sure you want to delete ${indexes.length > 1 ? `${indexes.length} items: ` : 'item: '}</p> ${labels}`,
            danger: true,
            positiveLabel: 'Delete',
        });
    }, [form, items, confirm]);

    const onCopy = useCallback((indexes: number[]) => {
        const labels = items.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold">${s.label}</div>`).join('');
        confirm(() => {
            const data = [
                ...items,
                ...items.filter((_, i) => indexes.includes(i)).map((f, i) => ({
                    ...f,
                    position: items.length + 1 + i,
                })),
            ];
            form.setValue(
                'items',
                data.map((s, i) => ({
                    ...s,
                    position: i + 1,
                })),
                { shouldDirty: true, }
            );
            setSelectedIndexes([]);
        }, {
            title: 'Duplicate',
            message: `<p>Are you sure you want to duplicate ${indexes.length > 1 ? `${indexes.length} items: ` : 'item: '}</p> ${labels}`,
            positiveLabel: 'Duplicate',
        })
    }, [form, items, confirm]);

    return (
        <>
            <div>
                <Item 
                    open={showAddItemForm || !!activeItem}
                    disabled={disabled} 
                    form={form}
                    item={activeItem || undefined}
                    onClose={() => {
                        setActiveItem(null);
                        setShowAddItemForm(false);
                    }}
                />
            </div>

            <DataTable 
                title="Items"
                sortable={!disabled}
                selectable={!disabled}
                onSort={onSort}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                search={{
                    inputPlaceholder: 'Search items',
                }}
                headerActions={(isDiagnosisScreen || isChecklistScreen) && (
                    <>
                        {disabled ? null : (
                            <Button 
                                className="text-primary border-primary w-full" 
                                variant="outline"
                                onClick={() => setShowAddItemForm(true)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                New item
                            </Button>
                        )}
                    </>
                )}
                columns={[
                    {
                        name: 'Key',
                    },
                    {
                        name: 'Label',
                    },
                    ...(!isDiagnosisScreen ? [] : [{
                        name: 'Severity order',
                    }]),
                    {
                        name: 'Action',
                        align: 'right',
                        cellRenderer({ rowIndex }){
                            const item = items[rowIndex];

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
                                            <Button 
                                                variant="ghost"
                                                className="justify-start w-full"
                                                onClick={() => {
                                                    setTimeout(() => setActiveItem({
                                                        data: item,
                                                        index: rowIndex,
                                                    }), 0);
                                                }}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                <span>{disabled ? 'View' : 'Edit'}</span>
                                            </Button>
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
                data={items.map(f => [
                    f.key || f.id,
                    f.label,
                    isDiagnosisScreen ? f.severity_order : '',
                    '',
                ])}
            />

            {!disabled && (
                <ItemsBottomActions 
                    disabled={disabled}
                    selected={selectedIndexes}
                    onDelete={() => onDelete(selectedIndexes)}
                    onCopy={() => onCopy(selectedIndexes)}
                />
            )}
        </>
    );
}
