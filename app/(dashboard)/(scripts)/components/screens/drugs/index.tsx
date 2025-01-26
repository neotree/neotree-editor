import { useCallback, useMemo, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import { Plus, MoreVertical, Trash, Edit, Copy } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { useScreenForm } from "../../../hooks/use-screen-form";
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
import { useDrugsLibrary } from "@/hooks/use-drugs-library";
import { GetDrugsLibraryItemsResults } from '@/databases/queries/drugs-library';
import { ItemsBottomActions } from "./items-bottom-actions";
import { Item } from "./item";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
    type: GetDrugsLibraryItemsResults['data'][0]['type'];
};

export function Drugs({
    form,
    disabled,
    type,
}: Props) {
    const { drugs: allDrugs } = useDrugsLibrary();
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const { confirm } = useConfirmModal();

    const drugs = useMemo(() => allDrugs.filter(d => d.type === type), [allDrugs, type]);

    const drugsField = form.watch('drugs');
    const fluidsField = form.watch('fluids');
    const feedsField = form.watch('feeds');

    const itemTypeInfo = useMemo(() => {
        let screenDrugs = drugsField;
        let formKey: 'drugs' | 'feeds' | 'fluids' = 'drugs';
        let title = 'Drugs';

        if (type === 'feed') {
            screenDrugs = feedsField;
            formKey = 'feeds';
            title = 'Feeds';
        } else if (type === 'fluid') {
            screenDrugs = fluidsField;
            formKey = 'fluids';
            title = 'Fluids';
        } 

        return { 
            screenDrugs, 
            formKey, 
            title, 
            type,
        };
    }, [type, drugsField, fluidsField, feedsField]);

    const { 
        screenDrugs, 
        formKey, 
        title, 
    } = itemTypeInfo;

    const items = useMemo(() => {
        return screenDrugs.map(item => {
            const data = drugs.filter(d => d.key === item.key)[0];
            return {
                ...item,
                data: data as typeof data | null,
            };
        });
    }, [screenDrugs, drugs]);

    const setValue = useCallback((data: typeof screenDrugs) => {
        form.setValue(
            formKey,
            data,
            { shouldDirty: true, }
        );
    }, [form.setValue, formKey]);

    const onSort = useCallback((oldIndex: number, newIndex: number) => {
        const sorted = arrayMoveImmutable([...items], oldIndex, newIndex);
        setValue(
            sorted.map(({ data, ...s }, i) => ({
                ...s,
                position: i + 1,
            })),
        );
    }, [setValue, items]);

    const onDelete = useCallback((indexes: number[]) => {
        const labels = items.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold text-danger">${s?.data?.drug}</div>`).join('');
        confirm(() => {
            const data = items.filter((_, i) => !indexes.includes(i));
            setValue(
                data.map(({ data, ...s }, i) => ({
                    ...s,
                    position: i + 1,
                })),
            );
            setSelectedIndexes([]);
        }, {
            title: 'Delete',
            message: `<p>Are you sure you want to delete ${indexes.length > 1 ? `${indexes.length} items: ` : 'item: '}</p> ${labels}`,
            danger: true,
            positiveLabel: 'Delete',
        });
    }, [setValue, items, confirm]);

    const onCopy = useCallback((indexes: number[]) => {
        const labels = items.filter((_, i) => indexes.includes(i)).map(s => `<div class="font-bold">${s?.data?.drug}</div>`).join('');
        confirm(() => {
            const data = [
                ...items,
                ...items.filter((_, i) => indexes.includes(i)).map((f, i) => ({
                    ...f,
                    position: items.length + 1 + i,
                })),
            ];
            setValue(
                data.map(({ data, ...s }, i) => ({
                    ...s,
                    position: i + 1,
                })),
            );
            setSelectedIndexes([]);
        }, {
            title: 'Duplicate',
            message: `<p>Are you sure you want to duplicate ${indexes.length > 1 ? `${indexes.length} items: ` : 'item: '}</p> ${labels}`,
            positiveLabel: 'Duplicate',
        })
    }, [setValue, items, confirm]);

    return (
        <>
            <DataTable 
                title={title}
                sortable={!disabled}
                selectable={!disabled}
                onSort={onSort}
                selectedIndexes={selectedIndexes}
                onSelect={setSelectedIndexes}
                noDataMessage={`No ${formKey} to display.`}
                search={{
                    inputPlaceholder: `Search ${formKey}`,
                }}
                headerActions={(
                    <>
                        <Item
                            form={form}
                            disabled={disabled}
                            itemType={type}
                            itemTypeInfo={itemTypeInfo}
                        >
                            {!disabled && (
                                <DialogTrigger asChild>
                                    <Button className="text-primary border-primary" variant="outline">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add {type}
                                    </Button>
                                </DialogTrigger>
                            )}
                        </Item>
                    </>
                )}
                columns={[
                    {
                        name: 'Drug / Fluid',
                    },
                    {
                        name: 'Type',
                        cellClassName: 'w-[80px]',
                    },
                    {
                        name: 'Key',
                    },
                    {
                        name: 'Dosage',
                    },
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
                                            <Item 
                                                disabled={disabled} 
                                                form={form}
                                                itemTypeInfo={itemTypeInfo}
                                                item={{
                                                    data: item,
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
                                            </Item>
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
                    f.data?.drug || '',
                    f.data?.type || '',
                    f.key || '',
                    f.data?.dosageText || '',
                    f.key,
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
