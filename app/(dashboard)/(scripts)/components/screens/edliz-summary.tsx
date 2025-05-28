'use client';

import { useMemo, useCallback, useState } from "react";
import { Edit, MoreVertical, Trash, Plus } from "lucide-react"
import { useQueryState } from 'nuqs';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogProps,
    DialogContentProps,
    DialogFooterProps,
    DialogTriggerProps,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

    const getTypes = useCallback(() => {
        const { types, subTypes } = items.reduce((acc, item) => {
            if (item.type) acc.types[item.type] = item.type; 
                if (item.subType) acc.subTypes[item.subType] = item.subType; 
            return acc;
        }, { types: {}, subTypes: {}, } as {
            types: { [key: string]: string; };
            subTypes: { [key: string]: string; };
        });
        return { 
            types: Object.keys(types).map(value => ({
                value,
                label: types[value],
            })), 
            subTypes: Object.keys(subTypes).map(value => ({
                value,
                label: subTypes[value],
            })), 
        };
    }, [items]);

    const [currentItem, setCurrentItem] = useQueryState('item', {
        defaultValue: '',
        clearOnDefault: true,
    });

    const [currentItemType, setCurrentItemType] = useQueryState('itemType', {
        defaultValue: '',
        clearOnDefault: true,
    });
    
    return (
        <>
            {!!currentItem && (
                <Item
                    open={!!currentItem}
                    onClose={() => {
                        setCurrentItem('');
                        setCurrentItemType('');
                    }}
                    form={form}
                    disabled={disabled}
                    itemType={!currentItemType ? undefined : currentItemType}
                    item={!items[Number(currentItem)] ? undefined : {
                        data: items[Number(currentItem)],
                        index: Number(currentItem),
                    }}
                    {...getTypes()}
                />
            )}

            {!items.length && (
                <Button 
                    className="text-primary border-primary" 
                    variant="outline"
                    onClick={() => setCurrentItem('new')}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    New item
                </Button>
            )}

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
                                        {!disabled && (
                                            <div className="flex gap-x-4">
                                                <Button 
                                                    className="text-primary border-primary" 
                                                    variant="outline"
                                                    onClick={() => {
                                                        setCurrentItem('new');
                                                        setCurrentItemType(key);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    New item
                                                </Button>

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
                                                            <EditSection
                                                                form={form}
                                                                title={key}
                                                            >
                                                                {({ open, setOpen, ...props }) => (
                                                                    <div 
                                                                        {...props}
                                                                        onClick={() => setOpen(true)} 
                                                                    >
                                                                        <Edit className="w-4 h-4 mr-2" />
                                                                        <span>Edit section</span>
                                                                    </div>
                                                                )}
                                                            </EditSection>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                onDelete(data.map(item => item.index));
                                                            }}
                                                            className={cn(
                                                                'text-danger focus:bg-danger focus:text-danger-foreground',
                                                            )}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            <span>Delete section</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
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
                                                            <DropdownMenuItem 
                                                                onClick={() => {
                                                                    setTimeout(() => setCurrentItem(`${rowIndex}`), 0);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                <span>{disabled ? 'View' : 'Edit'}</span>
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

function EditSection({ 
    children, 
    title: titleProp, 
    form,
    ...props
}: {
    title: string;
    children: (opts: { open: boolean; setOpen: (open: boolean) => void; }) => React.ReactNode;
    form: ReturnType<typeof useScreenForm>;
}) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(titleProp);

    return (
        <>
            {children({ open, setOpen, ...props })}
            
            <Dialog
                open={open}
                onOpenChange={setOpen}
            >
                <DialogContent className="p-0">
                    <DialogHeader className="px-4 py-4">
                        <DialogTitle>Edit section</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="px-4">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            name="title"
                            value={title}
                            onChange={(e => setTitle(e.target.value))}
                        />
                    </div>

                    <DialogFooter className="px-4 py-4">
                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button
                                disabled={!title}
                                onClick={() => {
                                    const items = form.getValues('items');
                                    form.setValue(
                                        'items',
                                        items.map(item => {
                                            return {
                                                ...item,
                                                type: item.type === titleProp ? title : item.type,
                                            };
                                        }),
                                    );
                                }}
                            >
                                Save
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
