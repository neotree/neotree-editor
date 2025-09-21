'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import queryString from 'query-string';
import { v4 } from 'uuid';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { ChevronDown, ChevronUp, PlusIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from "axios";

import { cn } from '@/lib/utils';
import { getDataKeysTypes } from '@/lib/data-keys-filter';
import { Loader } from '@/components/loader';
import * as actions from '@/app/actions/data-keys';
import { Button } from '@/components/ui/button';
import * as dialog from '@/components/ui/dialog';
import * as select from '@/components/ui/select';
import { DataKey } from "@/databases/queries/data-keys";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SelectModal } from '@/components/select-modal';
import { SaveDataKeysParams } from '@/databases/mutations/data-keys';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { useAppContext } from '@/contexts/app';

type FormData = Partial<DataKey>;

type Props = typeof actions & {
    open?: boolean;
    disabled?: boolean;
    dataKeys: DataKey[];
    dataKey?: FormData;
    item?: {
        dataKey: FormData;
        index: number
    };
    modal?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function DataKeyForm(props: Props) {
    if (props.modal !== true) return <Form {...props} />;

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
        dataKeys,
        dataKey: dataKeyProp,
        disabled: disabledProp,
        onOpenChange,
    } = props;

    const dataKey = dataKeyProp || item?.dataKey;

    const form = useForm<FormData>({
        defaultValues: {
            id: dataKey?.id || undefined,
            uuid: dataKey?.uuid || v4(),
            name: dataKey?.name || '',
            label: dataKey?.label || '',
            dataType: dataKey?.dataType || null,
            defaults: dataKey?.defaults || {},
            children: dataKey?.children || [],
        },
    });

    const {
        formState: {
            isDirty,
        },
        handleSubmit,
        setValue,
        watch,
    } = form;

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();
    const router = useRouter();
    const { viewOnly, } = useAppContext();

    const onSave = handleSubmit(async (data) => {
        try {
            setLoading(true);

            const keys = [
                data,
            ];

            const response = await axios.post('/api/data-keys/save', { 
                data: keys, 
                broadcastAction: true, 
            } satisfies SaveDataKeysParams);
            const res = response.data as Awaited<ReturnType<typeof actions.saveDataKeys>>;

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                });
            } else {
                router.refresh();
                alert({
                    message: "Data key created!",
                    variant: 'success',
                    onClose: () => {
                        onOpenChange?.(false);
                        router.push('/data-keys?' + queryString.stringify({
                            sort: data.id ? undefined : 'createdAt.desc',
                        }));
                    },
                });
            }
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    });

    const [visibleChildren, setVisible] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const name = watch('name');
    const dataType = watch('dataType');
    const children = watch('children') || [];

    const disabled = viewOnly || !!disabledProp;
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
    const canAddOption = hasChildren && !disabledProp;

    return (
        <>
            {loading && <Loader overlay />}

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
                            {canAddOption && (
                                <div className="w-[130px]">
                                    <SelectModal
                                        disabled={disabled}
                                        selected={[]}
                                        placeholder="Add option"
                                        search={{
                                            placeholder: 'Search data keys',
                                        }}
                                        options={dataKeys
                                            .sort((a, b) => {
                                                const aVal = a.dataType !== `${dataType}_option` ? 1 : 0;
                                                const bVal = b.dataType !== `${dataType}_option` ? 1 : 0;
                                                return aVal - bVal;
                                            })
                                            .filter(k => !children.map(k => k.name).includes(k.name)).map(o => ({
                                                value: o.name,
                                                label: o.name,
                                                description: o.label || '',
                                                caption: o.dataType || '',
                                                // disabled: o.dataType !== `${dataType}_option`,
                                            })) }
                                        onSelect={([key]) => {
                                            console.log(key);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {children.map((child, i) => {
                            const childKey = `children.${i}`;
                            const isVisible = visibleChildren[childKey];
                            const toggle = () => setVisible(prev => ({
                                ...prev,
                                [childKey]: !prev[childKey],
                            }));

                            return (
                                <Card key={child.uuid}>
                                    <CardContent className="px-4 py-4">
                                        <div className="flex items-center gap-x-2">
                                            <div className="flex-1">
                                                <div 
                                                    role="button"
                                                    className={cn(
                                                        'text-sm font-bold',
                                                        isVisible && 'hidden',
                                                    )}
                                                    onClick={toggle}
                                                >{child.label}</div>
                                            </div>

                                            <button
                                                className={cn(disabled && 'hidden')}
                                                onClick={() => {
                                                    confirm(
                                                        () => setValue(
                                                            'children',
                                                            children.filter((_, j) => j !== i),
                                                            { shouldDirty: true, },
                                                        ),
                                                        {
                                                            title: 'Delete option',
                                                            message: 'Are you sure?',
                                                            danger: true,
                                                        },
                                                    );
                                                }}
                                            >
                                                <X className="size-4 opacity-40" />
                                            </button>

                                            <button
                                                className="h-auto"
                                                onClick={toggle}
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

            {props.modal ? (
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
            ) : (
                <div className="flex items-center justify-end border-t border-t-border px-4 py-2 w-full gap-x-4">
                    <Button
                        asChild
                        variant="ghost"
                    >
                        <Link
                            href="/data-keys"
                        >
                            Cancel
                        </Link>
                    </Button>

                    <Button
                        disabled={disabled || !isDirty}
                        onClick={onSave}
                    >
                        Save
                    </Button>
                </div>
            )}
        </>
    );
}

function FormFields({ 
    disabled,
    childIndex,
    dataKeys,
    form: {
        control,
        register,
    },
}: Props & {
    childIndex?: number;
    form: UseFormReturn<FormData>;
    disabled: boolean;
}) {
    const types = useMemo(() => getDataKeysTypes(dataKeys).map(k => k.value), [dataKeys]);

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
