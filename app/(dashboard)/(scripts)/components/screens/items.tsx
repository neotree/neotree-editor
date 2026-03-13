import { useCallback, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    const btnRef = useRef<HTMLButtonElement>(null);
    const screenType = form.getValues('type');
    const isDiagnosisScreen = screenType === 'diagnosis';
    const isChecklistScreen = screenType === 'checklist';
    const isProgressScreen = screenType === 'progress';

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const { confirm } = useConfirmModal();

    const items = form.watch('items');
    const rankItems = form.watch('rankItems');
    
    const canRankItems = screenType === 'multi_select';

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

    const [currentItem, setCurrentItem] = useQueryState('item', {
        defaultValue: '',
        clearOnDefault: true,
    });

    return (
        <>
            <button ref={btnRef} />

            {!!currentItem && (
                <Item
                    open={!!currentItem}
                    onClose={() => setCurrentItem('')}
                    form={form}
                    disabled={disabled}
                    item={!items[Number(currentItem)] ? undefined : {
                        data: items[Number(currentItem)],
                        index: Number(currentItem),
                    }}
                />
            )}

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
                headerActions={disabled ? undefined : (
                    <>
                        <Button 
                            className="text-primary border-primary" 
                            variant="outline"
                            onClick={() => setCurrentItem('new')}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            New item
                        </Button>
                    </>
                )}
                headerContent={(
                    <>
                        {canRankItems && (
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="rankItems"
                                    checked={rankItems}
                                    disabled={disabled}
                                    onCheckedChange={() => {
                                        form.setValue('rankItems', !rankItems, { shouldDirty: true, });
                                    }}
                                />
                                <Label htmlFor="rankItems" className="flex flex-col gap-y-2">
                                    <span>Rank items</span>
                                    <span className="opacity-60 font-normal">If checked, you&apos;ll be able to set a <b>ranking score</b> on each item and allow a user to re-order the items on the app.</span>
                                </Label>
                            </div>
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
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                setTimeout(() => setCurrentItem(`${rowIndex}`), 0);
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
