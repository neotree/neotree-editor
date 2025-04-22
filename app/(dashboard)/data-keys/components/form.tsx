'use client';

import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { ChevronDown, ChevronUp, PlusIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import * as dialog from '@/components/ui/dialog';
import * as select from '@/components/ui/select';
import { DataKey } from "@/databases/queries/data-keys";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SelectModal } from '@/components/select-modal';

type Props = {
    open: boolean;
    disabled?: boolean;
    types: string[];
    dataKeys: DataKey[];
    item?: {
        dataKey: DataKey & {
            children: DataKey[];
        };
        index: number
    };
    onOpenChange: (open: boolean) => void;
};

export function DataKeyForm(props: Props) {
    return (
        <>
            <dialog.Dialog
                open={props.open}
                onOpenChange={props.onOpenChange}
            >
                <dialog.DialogContent
                    hideCloseButton
                    className="flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl"
                >
                    <dialog.DialogHeader className="border-b border-b-border px-4 py-4">
                        <dialog.DialogTitle>
                            {props.item?.dataKey ? 'Edit data key' : 'Add data key'}
                        </dialog.DialogTitle>
                        <dialog.DialogDescription className="hidden">{''}</dialog.DialogDescription>
                    </dialog.DialogHeader>

                    {props.open && <Form {...props} />}
                </dialog.DialogContent>
            </dialog.Dialog>
        </>
    );
}

function Form(props: Props) {
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const { 
        item, 
        types,
        dataKeys,
        disabled: disabledProp,
        onOpenChange 
    } = props;

    const { dataKey } = { ...item };

    const form = useForm({
        defaultValues: {
            uuid: dataKey?.uuid || v4(),
            name: dataKey?.name || '',
            label: dataKey?.label || '',
            dataType: dataKey?.dataType || null,
            parentKeys: dataKey?.parentKeys || [],
            children: dataKey?.children || [],
        } satisfies DataKey & {
            children: DataKey[];
        },
    });

    const {
        control,
        formState,
        getValues,
        handleSubmit,
        setValue,
        watch,
    } = form;

    const onSave = handleSubmit(async data => {
        try {
            onOpenChange(false);
        } catch(e: any) {

        }
    });

    const [visibleChildren, setVisible] = useState<Record<string, boolean>>({});
    const [showAddForm, setShowAddForm] = useState(false);

    const name = watch('name');
    const dataType = watch('dataType');
    const children = watch('children');

    const canDelete = !disabledProp && !!item;
    const disabled = !!disabledProp || !!item;
    const hasChildren = [
        'dropdown',
        'checklist',
        'diagnosis',
        'drug',
        'fluid',
        'multi_select',
        'single_select',
        'zw_edliz_summary_table_option',
        'mwi_edliz_summary_table_option',
    ].includes(dataType!);

    return (
        <>
            <div ref={scrollableDiv} className="flex-1 flex flex-col gap-y-4 overflow-y-auto px-4 py-2">
                <FormFields 
                    {...props}
                    form={form}
                    disabled={disabled}
                />

                {!hasChildren ? null : (
                    <>
                        <div className="mt-2 flex items-center">
                            <h1 className="text-xl flex-1">Options</h1>
                            {!showAddForm ? (
                                <Button
                                    variant="outline"
                                    className="h-auto"
                                    disabled={!canDelete}
                                    onClick={() => setShowAddForm(true)}
                                >
                                    <PlusIcon className="size-4" />
                                </Button>
                            ) : (
                                <div className="w-[100px]">
                                    <SelectModal
                                        selected={[]}
                                        placeholder="Select"
                                        search={{
                                            placeholder: 'Search data keys',
                                        }}
                                        options={dataKeys.filter(k => !children.map(k => k.name).includes(k.name)).map(o => ({
                                            value: o.name,
                                            label: o.name,
                                            description: o.label || '',
                                            caption: o.dataType || '',
                                            disabled: o.dataType !== `${dataType}_option`,
                                        }))}
                                        onSelect={([key]) => {
                                            const _dataKey = dataKeys.find(k => k.name === key?.value);
                                            setShowAddForm(false);
                                            if (dataKey) {
                                                const i = children.length;
                                                const dataKey = { ..._dataKey!, parentKeys: [..._dataKey!.parentKeys, name], };
                                                setValue(`children.${i}`, dataKey, { shouldDirty: true, });
                                                setTimeout(() => {
                                                    setValue(`children.${i}.uuid`, dataKey.uuid, { shouldDirty: true, shouldTouch: true, });
                                                    setValue(`children.${i}.name`, dataKey.name, { shouldDirty: true, shouldTouch: true, });
                                                    setValue(`children.${i}.label`, dataKey.label, { shouldDirty: true, shouldTouch: true, });
                                                    setValue(`children.${i}.dataType`, dataKey.dataType, { shouldDirty: true, shouldTouch: true, });
                                                    setValue(`children.${i}.parentKeys`, dataKey.parentKeys, { shouldDirty: true, shouldTouch: true, });
                                                }, 0);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {children.map((child, i) => {
                            const childKey = `children.${i}`;
                            const isVisible = visibleChildren[childKey];

                            return (
                                <Card key={child.uuid}>
                                    <CardContent className="px-4 py-4">
                                        <div className="flex items-center gap-x-2">
                                            <div className="flex-1">
                                                <div 
                                                    className={cn(
                                                        'text-sm font-bold',
                                                        isVisible && 'hidden',
                                                    )}
                                                >{child.label}</div>
                                            </div>

                                            <button
                                                className="hidden" // TODO: unhide
                                                onClick={() => {
                                                    const confirmed = confirm('Are you sure?');
                                                    if (confirmed) {
                                                        setValue(
                                                            'children',
                                                            children.filter((_, j) => j !== i),
                                                            { shouldDirty: true, },
                                                        );
                                                    }
                                                }}
                                            >
                                                <X className="size-4 opacity-40" />
                                            </button>

                                            <button
                                                className="h-auto"
                                                onClick={() => setVisible(prev => ({
                                                    ...prev,
                                                    [childKey]: !prev[childKey],
                                                }))}
                                            >
                                                {!isVisible ? 
                                                    <ChevronDown className="size-4 opacity-40" />
                                                    :
                                                    <ChevronUp className="size-4 opacity-40" />}
                                            </button>
                                        </div>

                                        {isVisible && (
                                            <div 
                                                className={cn(
                                                    'flex flex-col mt-5 gap-y-2',
                                                )}
                                            >
                                                <FormFields 
                                                    {...props}
                                                    form={form}
                                                    disabled={disabled}
                                                    childIndex={i}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </>
                )}
            </div>

            <dialog.DialogFooter className="border-t border-t-border px-4 py-2 items-center w-full">
                <dialog.DialogClose asChild>
                    <Button
                        variant="ghost"
                    >
                        Cancel
                    </Button>
                </dialog.DialogClose>

                <Button
                    onClick={onSave}
                >
                    Save
                </Button>
            </dialog.DialogFooter>
        </>
    );
}

function FormFields({ 
    types,
    disabled,
    childIndex,
    form: {
        control,
        register,
    },
}: Props & {
    childIndex?: number;
    form: UseFormReturn<NonNullable<Props['item']>['dataKey']>;
    disabled: boolean;
}) {
    const dataTypeKey = (childIndex === undefined ? 
        'dataType' 
        : 
        `children.${childIndex}.dataType`
    ) as any;

    const labelKey = (childIndex === undefined ? 
        'label' 
        : 
        `children.${childIndex}.label`
    ) as any;

    const nameKey = (childIndex === undefined ? 
        'name' 
        : 
        `children.${childIndex}.name`
    ) as any;

    return (
        <>
            <div>
                <Label htmlFor={dataTypeKey}>Type *</Label>
                <Controller
                    control={control}
                    name={dataTypeKey}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { value, onChange, } }) => {
                        return (
                            <select.Select
                                value={value || undefined}
                                onValueChange={v => onChange(v)}
                                disabled={disabled}
                            >
                                <select.SelectTrigger>
                                    <select.SelectValue 
                                        placeholder=""
                                    />
                                </select.SelectTrigger>
                
                                <select.SelectContent>
                                    {types.map(t => {
                                        return (
                                            <select.SelectItem
                                                key={t}
                                                value={t}
                                            >
                                                {t}
                                            </select.SelectItem>
                                        )
                                    })}
                                </select.SelectContent>
                            </select.Select>
                        );
                    }}
                />
            </div>

            <div>
                <Label htmlFor={nameKey}>Key *</Label>
                <Controller
                    control={control}
                    name={nameKey}
                    rules={{ required: true, }}
                    render={({ field: { value, name, onChange, onBlur, } }) => {
                        return (
                            <Input 
                                name={name}
                                disabled={disabled}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                            />
                        )
                    }}
                />
            </div>

            <div>
                <Label htmlFor={labelKey}>Label *</Label>
                <Controller
                    control={control}
                    name={labelKey}
                    rules={{ required: true, }}
                    render={({ field: { value, name, onChange, onBlur, } }) => {
                        return (
                            <Input 
                                name={name}
                                disabled={disabled}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                            />
                        )
                    }}
                />
            </div>
        </>
    );
}
