'use client';

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MoreVertical, PlusIcon, TrashIcon } from 'lucide-react';
import { arrayMoveImmutable } from "array-move";
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { type DataKeyFormData, useDataKeysCtx } from '@/contexts/data-keys';
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
import { DataTable } from '@/components/data-table';
import { dataKeyTypes } from '@/constants';
import { Loader } from '@/components/loader';
import { SelectModal } from "@/components/select-modal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function DataKeyForm(props: {
    disabled?: boolean;
}) {
    const { loadingDataKeys, } = useDataKeysCtx();
    
    if (loadingDataKeys) return <Loader overlay />;

    return <Form {...props} />;
}

function Form({
    disabled,
}: {
    disabled?: boolean;
}) {
    const { dataKeyId, } = useParams();

    const { allDataKeys: dataKeys, loadingDataKeys, saving, saveDataKeys, } = useDataKeysCtx();
    const { confirm, } = useConfirmModal();

    const dataKey = useMemo(() => dataKeys.find(k => (
        (k.uuid === dataKeyId) ||
        (k.uniqueKey === dataKeyId)
    )), [dataKeys, dataKeyId]);

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
            refId: dataKey?.refId || '',
            dataType: dataKey?.dataType || '',
            label: dataKey?.label || '',
            options: dataKey?.options || [],
            metadata: dataKey?.metadata || {},
            version: dataKey?.version || 1,
        },
    });

    const dataType = watch('dataType');
    const options = watch('options');

    const dataTypeInfo = dataKeyTypes.find(t => t.value === dataType);

    const onSave = handleSubmit(async data => {
        await saveDataKeys([data as DataKeyFormData], err => {
            if (!err) window.location.href = '/data-keys';
        });
    });

    const isFormDisabled = disabled || saving;

    const children = useMemo(() => {
        return options.map(o => dataKeys.find(k => k.uniqueKey === o)!).filter(k => k);
    }, [dataKeys, options]);

    const displayLoader = loadingDataKeys || saving;


    return (
        <>
            {displayLoader && <Loader overlay />}

            <Card>
                <CardContent>
                    <CardHeader>
                        <CardTitle>{!dataKey ? 'New' : 'Edit'} data key</CardTitle>
                        <CardDescription className="hidden">{''}</CardDescription>
                    </CardHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
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
                                                        'options',
                                                        !dataTypeInfo?.hasChildren ? [] : (dataKey?.options || []),
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

                        <div className="px-4 hidden">
                            <Label htmlFor="refId">Ref ID</Label>
                            <Input 
                                disabled={isFormDisabled}
                                {...register('refId', {
                                    disabled: isFormDisabled,
                                    required: false,
                                })}
                            />
                        </div>

                        <Controller
                            control={control}
                            name="options"
                            disabled={isFormDisabled}
                            render={({ field: { value, onChange, }, }) => {
                                if (!dataTypeInfo?.hasChildren) return <></>;

                                return (
                                    <div className="mt-4 pt-4 border-t border-t-border">
                                        <DataTable 
                                            sortable={!disabled}
                                            onSort={(oldIndex: number, newIndex: number) => {
                                                const sorted = arrayMoveImmutable([...value], oldIndex, newIndex);
                                                onChange(sorted);
                                            }}
                                            search={{}}
                                            title="Options"
                                            headerActions={(
                                                <>
                                                    <SelectModal 
                                                        multiple
                                                        search={{
                                                            placeholder: 'Search data keys',
                                                        }}
                                                        options={dataKeys.filter(k => !options.includes(k.uniqueKey)).map(k => ({
                                                            label: k.name,
                                                            value: k.uniqueKey,
                                                            caption: k.dataType || '',
                                                            description: k.label,
                                                        }))}
                                                        trigger={(
                                                            <Button 
                                                                variant="ghost"
                                                                className="w-auto h-auto"
                                                            >
                                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                                Add
                                                            </Button>
                                                        )}
                                                        onSelect={(keys) => {
                                                            onChange([...value, ...keys.map(k => k.value)]);
                                                        }}
                                                    />
                                                </>
                                            )}
                                            noDataMessage={(
                                                <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                                                    <div>Data keys has no options</div>
                                                </div>
                                            )}
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
                                                                            className="text-destructive"
                                                                            onClick={() => setTimeout(() => confirm(
                                                                                () => setValue(
                                                                                    'options',
                                                                                    options.filter((_, i) => i !== rowIndex),
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
                                            data={children.map(v => [
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

                    <br />

                    <CardFooter className="gap-x-2">
                        <div className="ml-auto" />

                        <Button
                            asChild
                            variant="ghost"
                        >
                            <Link href="/data-keys">Cancel</Link>
                        </Button>

                        {!disabled && (
                            <Button
                                onClick={() => onSave()}
                                disabled={isFormDisabled}
                            >
                                Save
                            </Button>
                        )}
                    </CardFooter>
                </CardContent>
            </Card>
        </>
    );
}
