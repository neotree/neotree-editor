'use client';

import { useMemo, useCallback } from "react";
import { Edit, MoreVertical, Trash, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/data-table";
import { ScriptItem } from '@/types';
import { useScreenForm } from "../../hooks/use-screen-form";
import { Item } from "./item";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
};

export function EdlizSummary({
    disabled,
    form,
}: Props) {
    const { confirm } = useConfirmModal();
    const items = form.watch('items');

    const sections = useMemo(() => {
        return items.reduce((acc, item, index) => {
            if (item.type) {
                acc[item.type] = acc[item.type] || [];
                acc[item.type].push({ ...item, index });
            }
            return acc;
        }, {} as { [key: string]: (ScriptItem & { index: number; })[]; });
    }, [items]);

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
            }, {
                title: 'Delete',
                message: `<p>Are you sure you want to delete ${indexes.length > 1 ? `${indexes.length} items: ` : 'item: '}</p> ${labels}`,
                danger: true,
                positiveLabel: 'Delete',
            });
        }, [form, items, confirm]);
    
    return (
        <>
            {Object.keys(sections).map(key => {
                const data = sections[key];
                return (
                    <div key={key}>
                        <Separator />
                        <div className="mt-5">
                            <DataTable 
                                title={key}
                                headerActions={(
                                    <>
                                        <Item
                                            form={form}
                                            disabled={disabled}
                                            itemType={key}
                                        >
                                            {!disabled && (
                                                <DialogTrigger asChild>
                                                    <Button className="text-primary border-primary" variant="outline">
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        New item
                                                    </Button>
                                                </DialogTrigger>
                                            )}
                                        </Item>
                                    </>
                                )}
                                columns={[
                                    {
                                        name: 'ID',
                                        cellClassName: 'w-[150px]',
                                    },
                                    {
                                        name: 'Sub type',
                                        cellClassName: 'w-[150px]',
                                    },
                                    {
                                        name: 'Label',
                                    },
                                    {
                                        name: 'Action',
                                        align: 'right',
                                        cellRenderer({ value }) {
                                            const rowIndex = Number(value);
                                            const item = items[rowIndex];

                                            return (
                                                <>
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
                                                </>
                                            );
                                        },
                                    },
                                ]}
                                data={data.map(item => {
                                    return [
                                        item.id || '',
                                        item.subType || '',
                                        item.label || '',
                                        item.index,
                                    ];
                                })}
                            />
                        </div>
                    </div>
                );
            })}
        </>
    );
}
