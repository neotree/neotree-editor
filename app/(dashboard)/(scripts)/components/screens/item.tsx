import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";

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

type Props = {
    children: React.ReactNode | ((params: { extraProps: any }) => React.ReactNode);
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
    types?: { value: string; label: string; }[];
    subTypes?: { value: string; label: string; }[];
    itemType?: string;
    item?: {
        index: number;
        data: ItemType,
    };
};

export function Item<P = {}>({
    children,
    item: itemProp,
    itemType,
    form,
    disabled: disabledProp,
    types = [],
    subTypes = [],
    ...extraProps
}: Props & P) {
    const screenType = form.getValues('type');
    const isDiagnosisScreen = screenType === 'diagnosis';
    const isProgressScreen = screenType === 'progress';
    const isChecklistScreen = screenType === 'checklist';
    const isMultiSelectScreen = screenType === 'multi_select';
    const isEdlizSummaryScreen = ['zw_edliz_summary_table', 'mwi_edliz_summary_table'].includes(screenType!);

    const { data: item, index: itemIndex, } = { ...itemProp, };

    const [open, setOpen] = useState(false);
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

    const keyHasError = key && /[a-zA-Z0-9]+/.test(key) ? false : true;

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
        setOpen(false);
    });

    return (
        <>
            <Modal
                open={open}
                title={!item ? 'New item' : 'Edit item'}
                trigger={typeof children === 'function' ? children({ extraProps }) : children}
                onOpenChange={open => {
                    setOpen(open);
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
                                            <Label error={!disabled && (!key || keyHasError)} htmlFor="key">Key *</Label>
                                            <Input
                                                {...register('key', { disabled, required: true, })}
                                                name="key"
                                                error={!disabled && (!key || keyHasError)}
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
                                                <Label error={!disabled && !id} htmlFor="id">ID *</Label>
                                                <Input
                                                    {...register('id', { disabled, required: true, })}
                                                    name="id"
                                                    error={!disabled && !id}
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
