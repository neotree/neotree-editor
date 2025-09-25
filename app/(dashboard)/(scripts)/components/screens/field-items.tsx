'use client';

import { useState } from 'react';
import { MoreVertical, EditIcon, TrashIcon, PlusIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidV4 } from 'uuid';
import { arrayMoveImmutable } from 'array-move';

import { ScriptField } from "@/types";
import { DataTable } from "@/components/data-table";
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader } from '@/components/loader';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useDataKeysCtx } from '@/contexts/data-keys';
import { SelectDataKey } from '@/components/select-data-key';
type Item = NonNullable<ScriptField['items']>[0];

export function FieldItems({
    items = [],
    disabled,
    fieldType,
    onChange,
}: {
    disabled: boolean;
    items: Item[];
    fieldType: string;
    onChange: (items: Item[]) => void;
}) {
    const { confirm } = useConfirmModal();
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
    const [newItem, setNewItem] = useState(false);

    const showForm = newItem || (currentItemIndex >= 0);

    return (
        <>
            {showForm && (
                <Form 
                    fieldType={fieldType}
                    item={items[currentItemIndex] || null}
                    onClose={() => {
                        setCurrentItemIndex(-1);
                        setNewItem(false);
                    }}
                    onChange={data => {
                        if (newItem) {
                            onChange([...items, data]);
                        } else {
                            onChange(items.map((item, i) => {
                                if (i !== currentItemIndex) return item;
                                return {
                                    ...item,
                                    ...data,
                                };
                            }));
                        }
                    }}
                />
            )}

            <div>
                <DataTable 
                    sortable
                    title="Options"
                    data={items.map(item => [
                        item.value,
                        item.label,
                        item.exclusive ? '✓' : '✕',
                        item.enterValueManually ? '✓' : '✕',
                        '',
                    ])}
                    onSort={(oldIndex: number, newIndex: number) => {
                        const sorted = arrayMoveImmutable([...items], oldIndex, newIndex);
                        onChange(sorted);
                    }}
                    headerActions={disabled ? null : (
                        <Button
                            variant="ghost"
                            onClick={() => setNewItem(true)}
                        >
                            <PlusIcon className="h-4 w-4 mr-2" /> Add
                        </Button>
                    )}
                    columns={[
                        {
                            name: 'Key',
                        },
                        {
                            name: 'Label',
                        },
                        {
                            name: 'Exclusive',
                            align: 'center',
                            cellClassName: fieldType !== 'multi_select' ? 'hidden' : '',
                        },
                        {
                            name: 'Enter Value Manually',
                            align: 'center',
                        },
                        {
                            name: '',
                            align: 'right',
                            cellRenderer({ rowIndex }) {
                                const item = items[rowIndex];

                                if (!item || disabled) return null;

                                return (
                                    <>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <MoreVertical className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                            
                                            <DropdownMenuContent>                            
                                                <DropdownMenuItem 
                                                    onClick={() => setTimeout(() => setCurrentItemIndex(rowIndex), 0)}
                                                >
                                                    <EditIcon className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                            
                                                <DropdownMenuItem 
                                                    className="text-destructive"
                                                    onClick={() => setTimeout(() => {
                                                        confirm(() => onChange(items.filter((_, i) => i !== rowIndex)), {
                                                            title: 'Delete option',
                                                            message: 'Are you sure?',
                                                        });
                                                    }, 0)}
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                );
                            }
                        },
                    ]}
                />
            </div>
        </>
    );
}

function Form({
    item,
    fieldType,
    onClose,
    onChange,
}: {
    item: null | Item;
    fieldType: string;
    onClose: () => void;
    onChange: (item: Item) => void;
}) {
    const { loadingSelectOptions, selectOptions, } = useDataKeysCtx();

    const {
        control,
        register,
        handleSubmit,
        setValue,
    } = useForm<Item>({
        defaultValues: {
            ...item,
            enterValueManually: item?.enterValueManually || false,
            exclusive: item?.exclusive || false,
            itemId: item?.itemId || uuidV4(),
            label: item?.label || '',
            label2: item?.label2 || '',
            value: item?.value || '',
        },
    });

    const onSave = handleSubmit(data => {
        console.log(data);
        onChange(data);
    });

    return (
        <>
            <Sheet 
                open
                modal
                onOpenChange={onClose}
            >
                <SheetContent
                    hideCloseButton
                    side="right"
                    className={"p-0 m-0 flex flex-col"}
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle>{item ? 'Edit' : 'New'} option</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                        {loadingSelectOptions && <Loader overlay />}

                        <div className="px-4">
                            <Label htmlFor="value">Key *</Label>
                            <Controller 
                                control={control}
                                name="value"
                                render={({ field: { value, onChange, }, }) => {
                                    return (
                                        <SelectDataKey 
                                            value={`${value}`}
                                            disabled={false}
                                            onChange={item => {
                                                onChange(item.value);
                                                setValue('label', item.label || '');
                                            }}
                                        />
                                    );
                                }}
                            />
                        </div>

                        <div className="px-4">
                            <Label htmlFor="label">Label *</Label>
                            <Input 
                                {...register('label', {
                                    required: true,
                                    disabled: false,
                                })}
                            />
                        </div>

                        {(fieldType === 'multi_select') && (
                            <Controller 
                                control={control}
                                name="exclusive"
                                render={({ field: { value, onChange, }, }) => {
                                    return (
                                        <div className="px-4 flex items-center space-x-2">
                                            <Switch 
                                                id="exclusive" 
                                                checked={value}
                                                onCheckedChange={() => onChange(!value)}
                                            />
                                            <Label secondary htmlFor="exclusive">Disable other items if selected</Label>
                                        </div>
                                    );
                                }}
                            />
                        )}

                        <Controller 
                            control={control}
                            name="enterValueManually"
                            render={({ field: { value, onChange, }, }) => {
                                return (
                                    <div className="px-4 flex items-center space-x-2">
                                        <Switch 
                                            id="enterValueManually" 
                                            checked={value}
                                            onCheckedChange={() => onChange(!value)}
                                        />
                                        <Label secondary htmlFor="enterValueManually">Enter value manually if selected</Label>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex gap-x-2 items-center">
                        <i className="text-sm text-destructive">* Required</i>

                        <div className="ml-auto" />

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                onClick={() => onClose()}
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <SheetClose asChild>
                            <Button
                                onClick={() => onSave()}
                            >
                                Save
                            </Button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
