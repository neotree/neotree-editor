'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { EditIcon, MoreVertical, PlusIcon, TrashIcon } from 'lucide-react';

import { type DataKeyFormData, useDataKeysCtx } from '@/contexts/data-keys';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { DataTable } from '@/components/data-table';
import { dataKeyTypes } from '@/constants';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/loader';

export function DataKeyForm({
    dataKey,
    disabled,
    modal,
    isChild,
    onClose,
    onSave: onSaveProp,
}: {
    modal?: boolean;
    isChild?: boolean;
    dataKey?: DataKeyFormData;
    parentDataKey?: DataKeyFormData;
    disabled?: boolean;
    onClose: () => void;
    onSave?: (formData: DataKeyFormData) => void;
}) {
    const { saving, saveDataKeys, } = useDataKeysCtx();
    const { confirm, } = useConfirmModal();
    const { alert, } = useAlertModal();

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            ...dataKey,
            name: dataKey?.name || '',
            dataType: dataKey?.dataType || '',
            label: dataKey?.label || '',
            children: dataKey?.children || [],
            defaults: dataKey?.defaults || {},
            version: dataKey?.version || 1,
        },
    });

    const dataType = watch('dataType');
    const children = watch('children');

    const dataTypeInfo = dataKeyTypes.find(t => t.value === dataType);

    const onSave = handleSubmit(async data => {
        if (onSaveProp) {
            onSaveProp(data as DataKeyFormData);
            onClose();
        } else {
            await saveDataKeys([data as DataKeyFormData], err => !err && onClose?.());
        }
    });

    const isFormDisabled = disabled || saving;

    const [selectedChildIndex, setSelectedChildIndex] = useState<number | null>(null);
    const [newChild, setNewChild] = useState(false);

    return (
        <>
            {saving && <Loader overlay />}

            <Sheet 
                open
                modal={modal}
            >
                <SheetContent
                    hideCloseButton
                    side="right"
                    className={cn(
                        'p-0 m-0 flex flex-col',
                        !isChild && 'w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]',
                    )}
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle>{dataKey ? 'Edit' : 'New'} data key{isChild ? ` option` : ''}</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    {(newChild || (selectedChildIndex !== null)) && (
                        <DataKeyForm 
                            modal
                            isChild
                            disabled={false}
                            dataKey={selectedChildIndex !== null ? children[selectedChildIndex] : undefined}
                            parentDataKey={dataKey}
                            onSave={data => {
                                if (selectedChildIndex === null) {
                                    setValue('children', [...children, {
                                        ...data,
                                        dataType: `${dataType}_option`,
                                    }])
                                } else {
                                    setValue(`children.${selectedChildIndex}`, data);
                                }
                            }}
                            onClose={() => {
                                setSelectedChildIndex(null);
                                setNewChild(false);
                            }}
                        />
                    )}

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                        {!isChild && (
                            <Controller 
                                control={control}
                                name="dataType"
                                disabled={isFormDisabled}
                                rules={{ required: true, }}
                                render={({ field: { value, onChange, } }) => {
                                    return (
                                        <>
                                            <div className="px-4">
                                                <Label htmlFor="name">Data type *</Label>
                                                <Select
                                                    value={value}
                                                    name="name"
                                                    onValueChange={val => {
                                                        onChange(val);

                                                        const dataTypeInfo = dataKeyTypes.find(t => t.value === val);

                                                        setValue(
                                                            'children',
                                                            !dataTypeInfo?.hasChildren ? [] : (dataKey?.children || []).map(child => ({
                                                                ...child,
                                                                dataType: `${val}_option`,
                                                            })),
                                                        );

                                                        setValue(
                                                            'defaults', 
                                                            { ...(val === dataKey?.dataType ? dataKey.defaults : dataTypeInfo?.defaults), },
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {dataKeyTypes.map((t) => (
                                                                <SelectItem key={t.value} value={t.value}>
                                                                    {t.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    );
                                }}
                            />
                        )}

                        <div className="px-4">
                            <Label htmlFor="name">Key *</Label>
                            <Input 
                                disabled={isFormDisabled}
                                {...register('name', {
                                    disabled: isFormDisabled,
                                    required: true,
                                })}
                            />
                        </div>

                        <div className="px-4">
                            <Label htmlFor="label">Label *</Label>
                            <Input 
                                disabled={isFormDisabled}
                                {...register('label', {
                                    disabled: isFormDisabled,
                                    required: true,
                                })}
                            />
                        </div>

                        <Controller
                            control={control}
                            name="children"
                            disabled={isFormDisabled}
                            render={({ field: { value, }, }) => {
                                if (!dataTypeInfo?.hasChildren) return <></>;

                                return (
                                    <div className="mt-4 pt-4 border-t border-t-border">
                                        <DataTable 
                                            sortable={!disabled}
                                            search={{}}
                                            title="Options"
                                            headerActions={(
                                                <>
                                                    <Button 
                                                        variant="ghost"
                                                        className="w-auto h-auto"
                                                        onClick={() => setNewChild(true)}
                                                    >
                                                        <PlusIcon className="w-4 h-4 mr-2" />
                                                        Add
                                                    </Button>
                                                </>
                                            )}
                                            noDataMessage={(
                                                <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                                                    <div>Data keys has no options</div>
                                                </div>
                                            )}
                                            getRowOptions={({ rowIndex }) => {
                                                const s = children[rowIndex];
                                                const highlight = rowIndex === selectedChildIndex;
                                                return !s ? {} : {
                                                    className: cn(highlight && 'bg-primary/20 hover:bg-primary/30')
                                                };
                                            }}
                                            columns={[
                                                {
                                                    name: 'Key',
                                                },
                                                {
                                                    name: 'Label',
                                                },
                                                {
                                                    name: 'Data type',
                                                },

                                                {
                                                    name: '',
                                                    align: 'right',
                                                    cellClassName: 'w-20',
                                                    cellRenderer({ rowIndex }) {
                                                        const child = value[rowIndex];

                                                        if (!child || disabled) return null;

                                                        return (
                                                            <>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger>
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </DropdownMenuTrigger>

                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem
                                                                            onClick={() => setTimeout(() => setSelectedChildIndex(rowIndex), 0)}
                                                                        >
                                                                            <EditIcon className="h-4 w-4 mr-2" /> Edit
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuItem 
                                                                            className="text-destructive"
                                                                            onClick={() => setTimeout(() => confirm(
                                                                                () => setValue(
                                                                                    'children',
                                                                                    children.filter((_, i) => i !== rowIndex),
                                                                                ),
                                                                                {
                                                                                    title: 'Delete',
                                                                                    message: 'Are you sure you want to delete data key option?',
                                                                                    danger: true,
                                                                                },
                                                                            ), 0)}
                                                                        >
                                                                            <TrashIcon className="h-4 w-4 mr-2" /> Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </>
                                                        );
                                                    },
                                                }
                                            ]}
                                            data={value.map(v => [
                                                v.name || '',
                                                v.label || '',
                                                v.dataType || '',
                                                '',
                                            ])}
                                        />
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

                        {!disabled && (
                            <SheetClose asChild>
                                <Button
                                    onClick={() => onSave()}
                                    disabled={isFormDisabled}
                                >
                                    Save
                                </Button>
                            </SheetClose>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
