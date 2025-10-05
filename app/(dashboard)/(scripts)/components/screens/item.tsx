import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { Controller, useForm } from "react-hook-form";

import { useScreenForm } from "../../hooks/use-screen-form";
import { ScriptItem as ItemType } from "@/types";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { isEmpty } from "@/lib/isEmpty";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SelectDataKey } from "@/components/select-data-key";
import { useDataKeysCtx } from "@/contexts/data-keys";

type Props = {
    open: boolean;
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
    types?: { value: string; label: string; }[];
    subTypes?: { value: string; label: string; }[];
    itemType?: string;
    item?: {
        index: number;
        data: ItemType,
    };
    onClose: () => void;
};

export function Item<P = {}>({
    open,
    item: itemProp,
    itemType,
    form,
    disabled: disabledProp,
    types = [],
    subTypes = [],
    onClose,
}: Props & P) {
    const { extractDataKeys, } = useDataKeysCtx();
    
    const screenType = form.getValues('type');
    const screenKeyId = form.getValues('keyId');
    const screenRefIdDataKey = form.getValues('refIdDataKey');
    const isDiagnosisScreen = screenType === 'diagnosis';
    const isProgressScreen = screenType === 'progress';
    const isChecklistScreen = screenType === 'checklist';
    const isMultiSelectScreen = screenType === 'multi_select';
    const isSingleSelectScreen = screenType === 'single_select';
    const isEdlizSummaryScreen = ['zw_edliz_summary_table', 'mwi_edliz_summary_table'].includes(screenType!);

    const screenDataKey = useMemo(() => {
        const keyId = screenKeyId || screenRefIdDataKey;
        const [key] = !keyId ? [null] : extractDataKeys([keyId]);
        return key;
    }, [screenKeyId, screenRefIdDataKey, extractDataKeys]);

    const { data: item, index: itemIndex, } = { ...itemProp, };

    const [isCustomType, setIsCustomType] = useState(false);
    const [isCustomSubType, setIsCustomSubType] = useState(false);

    useEffect(() => {
        setIsCustomType(!types.length);
        setIsCustomSubType(!subTypes.length);
    }, [open, types, subTypes]);

    const getDefaultValues = useCallback(() => {
        return {
            itemId: item?.itemId || v4(),
            id: item?.id || '',
            label: item?.label || '',
            position: item?.position || 1,
            subType: item?.subType || '',
            type: item?.type || itemType || '',
            exclusive: item?.exclusive || false,
            confidential: item?.confidential || false,
            checked: item?.checked || false,
            enterValueManually: item?.enterValueManually || false,
            severity_order: item?.severity_order || '',
            summary: item?.summary || '',
            key: item?.key || '',
            score: item?.score || ('' as unknown as number),
            dataType: (() => {
                switch (screenType) {
                    //   case 'list':
                    //     return 'void';
                    case 'checklist':
                        return 'boolean';
                    case 'single_select':
                        return 'id';
                    case 'diagnosis':
                        return 'diagnosis';
                    default:
                        return null;
                }
            })(),
            ...item
        } satisfies ItemType;
    }, [item, screenType, itemType]);

    const {
        control,
        reset: resetForm,
        watch,
        register,
        handleSubmit,
        setValue,
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const id = watch('id');
    const subType = watch('subType');
    const type = watch('type');
    const label = watch('label');
    const key = watch('key');
    const enterValueManually = watch('enterValueManually');
    const confidential = watch('confidential');
    const exclusive = watch('exclusive');
    const checked = watch('checked');

    const keyHasError = false; // key && /[a-zA-Z0-9]+/.test(key) ? false : true;

    const disabled = useMemo(() => !!disabledProp, [disabledProp]);

    const onSave = handleSubmit(data => {
        if (!isEmpty(itemIndex) && item) {
            form.setValue('items', form.getValues('items').map((f, i) => ({
                ...f,
                ...(i !== itemIndex ? null : {
                    ...data,
                    score: data.score ? Number(data.score) : null,
                }),
            })));
        } else {
            form.setValue('items', [...form.getValues('items'), data], { shouldDirty: true, })
        }
        onClose();
    });

    const isKeyDisabled = false; // isChecklistScreen ? disabled : true;

    const renderKeyComponent = ({ 
        value: key, 
        label = "Select key", 
        variant = 'id',
    }: {
        value: string;
        label?: string;
        variant?: 'key' | 'id';
    }) => {
        // const _type = isChecklistScreen ? 'checklist_option' : type;
        const _type = screenType + '_option';

        return (
            <SelectDataKey
                modal
                value={key}
                placeholder={label}
                disabled={isKeyDisabled}
                filterDataKeys={k => {
                    if (isChecklistScreen || isMultiSelectScreen || isSingleSelectScreen) {
                        const opts = screenDataKey?.options || [];
                        if (!screenDataKey) return true;
                        return opts.includes(k.uniqueKey);
                    } else {
                        return true;
                    }
                }}
                onChange={([dataKey]) => {
                    const label = dataKey?.label || '';
                    const key = dataKey?.name || '';

                    setValue(variant, key, { shouldDirty: true, });
                    setValue('keyId', dataKey?.uniqueKey, { shouldDirty: true, });
                    setValue('label', label, { shouldDirty: true, });
                }}
            />
        );
    }

    return (
        <>
            <Modal
                open={open}
                title={!item ? 'New item' : 'Edit item'}
                onOpenChange={open => {
                    if (!open) onClose();
                    resetForm(getDefaultValues());
                }}
                actions={(
                    <>
                        <span className={cn('text-danger text-xs', disabled && 'hidden')}>* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            disabled={disabled}
                            onClick={() => onSave()}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div className="flex flex-col gap-y-5">
                        {(() => {
                            if (isChecklistScreen) {
                                return (
                                    <>
                                        <div>
                                            <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                                            <Input
                                                {...register('label', { disabled, required: true, })}
                                                name="label"
                                                error={!disabled && !label}
                                            />
                                        </div>

                                        <div>
                                            <Label 
                                                error={(isKeyDisabled || disabled) ? undefined : (!key || keyHasError)} 
                                                htmlFor="key"
                                            >Key *</Label>
                                            <Controller 
                                                control={control}
                                                name="key"
                                                render={({ field: { value }, }) => renderKeyComponent({
                                                    value,
                                                    variant: 'key',
                                                    label: 'Select key',
                                                })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="summary">Summary</Label>
                                            <Input
                                                {...register('summary', { disabled, required: false, })}
                                                name="summary"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="confidential" 
                                                checked={confidential}
                                                disabled={disabled}
                                                onCheckedChange={checked => setValue('confidential', checked, { shouldDirty: true, })}
                                            />
                                            <Label secondary htmlFor="confidential">Confidential</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="exclusive" 
                                                checked={exclusive}
                                                disabled={disabled}
                                                onCheckedChange={checked => setValue('exclusive', checked, { shouldDirty: true, })}
                                            />
                                            <Label secondary htmlFor="exclusive">Disable other items if selected</Label>
                                        </div>
                                    </>
                                );
                            } else if (isProgressScreen) {
                                return (
                                    <>
                                        <div>
                                            <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                                            <Input
                                                {...register('label', { disabled, required: true, })}
                                                name="label"
                                                error={!disabled && !label}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id="checked" 
                                                checked={checked}
                                                disabled={disabled}
                                                onCheckedChange={checked => setValue('checked', checked, { shouldDirty: true, })}
                                            />
                                            <Label secondary htmlFor="checked">Mark as checked</Label>
                                        </div>
                                    </>
                                );
                            } else {
                                return (
                                    <>
                                        <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                                            <div>
                                                <Label 
                                                    error={(isKeyDisabled || disabled) ? undefined : !id} 
                                                    htmlFor="id"
                                                >ID *</Label>
                                                <Controller 
                                                    control={control}
                                                    name="id"
                                                    render={({ field: { value }, }) => renderKeyComponent({
                                                        value,
                                                        variant: 'id',
                                                        label: 'Select id',
                                                    })}
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                                                <Input
                                                    {...register('label', { disabled, required: true, })}
                                                    name="label"
                                                    error={!disabled && !label}
                                                />
                                            </div>
                                        </div>

                                        {(isMultiSelectScreen || isDiagnosisScreen) && (
                                            <>
                                                {isDiagnosisScreen && (
                                                    <div>
                                                        <Label htmlFor="severity_order">Severity Order</Label>
                                                        <Input
                                                            {...register('severity_order', { disabled, required: false, })}
                                                            name="severity_order"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-2">
                                                    <Switch 
                                                        id="exclusive" 
                                                        checked={exclusive}
                                                        disabled={disabled}
                                                        onCheckedChange={checked => setValue('exclusive', checked, { shouldDirty: true, })}
                                                    />
                                                    <Label secondary htmlFor="exclusive">Disable other items if selected</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch 
                                                        id="enterValueManually" 
                                                        checked={enterValueManually}
                                                        disabled={disabled}
                                                        onCheckedChange={checked => setValue('enterValueManually', checked, { shouldDirty: true, })}
                                                    />
                                                    <Label secondary htmlFor="enterValueManually">Enter value manually if selected</Label>
                                                </div>
                                            </>
                                        )}

                                        {isEdlizSummaryScreen && (
                                            <>
                                                <div>
                                                    <Label htmlFor="type">Type</Label>
                                                    <div>
                                                        {isCustomType ? (
                                                            <Input
                                                                {...register('type', { disabled, required: true, })}
                                                                name="type"
                                                                error={!disabled && !type}
                                                            />
                                                        ) : (
                                                            <Select
                                                                value={type || ''}
                                                                disabled={disabled}
                                                                name="type"
                                                                onValueChange={value => {
                                                                    setValue('type', value, { shouldDirty: true, });
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Types</SelectLabel>
                                                                    {types.map(s => (
                                                                        <SelectItem key={s.value} value={s.value}>
                                                                            {s.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                        {!!types.length && (
                                                            <a
                                                                href="#"
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    setValue('type', isCustomType ? itemType || item?.type || '' : '', { shouldDirty: true, });
                                                                    setIsCustomType(prev => !prev);
                                                                }}
                                                                className="text-xs text-primary"
                                                            >
                                                                {isCustomType ? 'Select existing type' : 'Add new type'}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="subType">Sub type</Label>
                                                    <div>
                                                        {isCustomSubType ? (
                                                            <Input
                                                                {...register('subType', { disabled, required: false, })}
                                                                name="subType"
                                                            />
                                                        ) : (
                                                            <Select
                                                                value={subType || ''}
                                                                disabled={disabled}
                                                                name="subType"
                                                                onValueChange={value => {
                                                                    setValue('subType', value, { shouldDirty: true, });
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select sub type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>Sub types</SelectLabel>
                                                                    {subTypes.map(s => (
                                                                        <SelectItem key={s.value} value={s.value}>
                                                                            {s.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                        {!!subTypes.length && (
                                                            <a
                                                                href="#"
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    setValue('subType', isCustomSubType ? item?.subType || '' : '', { shouldDirty: true, });
                                                                    setIsCustomSubType(prev => !prev);
                                                                }}
                                                                className="text-xs text-primary"
                                                            >
                                                                {isCustomSubType ? 'Select existing sub type' : 'Add new sub type'}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="label">Score</Label>
                                                    <Input
                                                        {...register('score', { disabled, required: false, })}
                                                        name="score"
                                                        type="number"
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Switch 
                                                        id="exclusive" 
                                                        checked={exclusive}
                                                        disabled={disabled}
                                                        onCheckedChange={checked => setValue('exclusive', checked, { shouldDirty: true, })}
                                                    />
                                                    <Label secondary htmlFor="exclusive">Disable other items if selected</Label>
                                                </div>
                                            </>
                                        )}
                                    </>
                                );
                            }
                        })()}
                    </div>
                </div>
            </Modal>
        </>
    );
}
