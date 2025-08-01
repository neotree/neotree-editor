import { useCallback, useMemo, useState, useEffect } from "react";
import { v4 } from "uuid";
import { Controller, useForm } from "react-hook-form";
import axios from 'axios';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScriptsContext } from "@/contexts/scripts";
import { getLeanAlias } from '@/app/actions/aliases'
import { ChevronDown, XIcon } from "lucide-react";
import { SelectModal } from "@/components/select-modal";
import { CONDITIONAL_EXP_EXAMPLE, DATA_KEYS_MAP } from "@/constants";
import { ScriptField as FieldType } from "@/types";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldTypes, nuidSearchOptions, PERIOD_FIELD_FORMATS } from "@/constants/fields";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/datetime-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { validateDropdownValues } from "@/lib/validate-dropdown-values";
import { cn } from "@/lib/utils";
import { isEmpty } from "@/lib/isEmpty";
import { Title } from "../title";
import { useScreenForm } from "../../hooks/use-screen-form";
import { useField } from "../../hooks/use-field";

type Props = {
    open: boolean;
    disabled?: boolean;
    field?: {
        index: number;
        data: FieldType,
    };
    form: ReturnType<typeof useScreenForm>;
    onClose: () => void;
    scriptId: any;
};

export function Field<P = {}>({
    open,
    field: fieldProp,
    form,
    scriptId,
    disabled: disabledProp,
    onClose,
}: Props & P) {
    const { dataKeys } = useScriptsContext();
    
    const { data: field, index: fieldIndex, } = { ...fieldProp, };

    const [showForm, setShowForm] = useState(!!field);

    const { getDefaultValues } = useField(!field ? undefined : {
        ...field,
    });

    const {
        control,
        reset: resetForm,
        register,
        getValues,
        watch,
        setValue,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultValues(),
    });
    const [alias, setAlias] = useState('');

    const type = watch('type');
    const format = watch('format');
    const key = watch('key');
    const label = watch('label');
    const optional = watch('optional');
    const printable = watch('printable');
    const confidential = watch('confidential');
    const maxDate = watch('maxDate');
    const minDate = watch('minDate');
    const maxTime = watch('maxTime');
    const minTime = watch('minTime');
    const prePopulate = watch('prePopulate');
    const defaultValue = watch('defaultValue');
    const values = watch('values');
    const valuesOptions = watch('valuesOptions');
    const editable = watch('editable');

    const valuesErrors = useMemo(() => validateDropdownValues(values), [values]);

    const isDateField = useMemo(() => (type === 'date') || (type === 'datetime'), [type]);
    const isTimeField = useMemo(() => type === 'time', [type]);
    const isTextField = useMemo(() => type === 'text', [type]);
    const isPeriodField = useMemo(() => type === 'period', [type]);
    const isNumberField = useMemo(() => type === 'number', [type]);
    const isDropdownField = useMemo(() => type === 'dropdown', [type]);
    const isMultiSelectField = useMemo(() => type === 'multi_select', [type]);


    const getAlias = useCallback(async (name: string) => {
         if (!name) return;
        try {

            const res = await axios.get<Awaited<ReturnType<typeof getLeanAlias>>>('/api/aliases/lean?data=' + JSON.stringify({ script: scriptId, name: name}))
            setAlias(res?.data?.alias || '');
        } catch (err) {
            setAlias('');
        }
    }, []);

    useEffect(() => {
        getAlias(key)
    }, [getAlias,key]);



    const disabled = useMemo(() => !!disabledProp, [disabledProp]);

    const onSave = handleSubmit(data => {
        if (!isEmpty(fieldIndex) && field) {
            form.setValue('fields', form.getValues('fields').map((f, i) => ({
                ...f,
                ...(i === fieldIndex ? data : null),
            })));
        } else {
            form.setValue('fields', [...form.getValues('fields'), data], { shouldDirty: true, })
        }
        onClose();
    });

    const valuesParsed = useMemo(() => {
        return (values || '').split('\n')
            .map((v = '') => v.trim())
            .map((value) => {
                const valueSplit = value.split(',');
                return { value: valueSplit[0], label: valueSplit[1], };
            })
            .filter(o => o.value && o.label);
    }, [values]);

    return (
        <>
            <Modal
                open={open}
                onOpenChange={open => {
                    if (!open) onClose();
                    resetForm(getDefaultValues());
                    setShowForm(!!field);
                }}
                title={field ? 'New field' : 'Edit field'}
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
                            disabled={disabled || !type}
                            onClick={() => {
                                if (!showForm) {
                                    setShowForm(true);
                                    resetForm({
                                        ...getDefaultValues(),
                                        type,
                                    });
                                } else {
                                    setValue(
                                        'valuesOptions',
                                        valuesOptions.filter(o => o.optionKey && o.optionLabel && o.key),
                                        { shouldDirty: true, },
                                    );
                                    onSave();
                                }
                            }}
                        >
                            {showForm ? 'Save' : 'Continue'}
                        </Button>
                    </>
                )}
            >
                {!showForm ? (
                    <RadioGroup
                        defaultValue={type}
                        onValueChange={value => setValue('type', value, { shouldDirty: true, })}
                        className="flex flex-col gap-y-4"
                    >
                        {FieldTypes.map(t => (
                            <div key={t.name} className="flex items-center space-x-2">
                                <RadioGroupItem value={t.name} id={t.name} />
                                <Label htmlFor={t.name}>{t.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                ) : (
                    <div className="flex flex-col gap-y-5">
                        <>
                            <Title>Field type</Title>

                            <div>
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={type}
                                    required
                                    name="type"
                                    disabled
                                    onValueChange={value => {
                                        setValue('type', value as typeof type, { shouldDirty: true, });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>User role</SelectLabel>
                                            {FieldTypes.map(t => (
                                                <SelectItem key={t.name} value={t.name}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>

                        <>
                            <Title>Flow control</Title>
                            <div>
                                <Label htmlFor="condition">Conditional expression</Label>
                                <Input
                                    {...register('condition', { disabled, })}
                                    name="condition"
                                    noRing={false}
                                />
                                <span className="text-xs text-muted-foreground">Example: {CONDITIONAL_EXP_EXAMPLE}</span>
                            </div>
                        </>

                        <>
                            <Title>Properties</Title>

                            <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                                <div>
                                    <Label error={!disabled && !key} htmlFor="key">Key *</Label>
                                    {/* <Input
                                        {...register('key', { disabled, required: true, })}
                                        name="key"
                                        error={!disabled && !key}
                                    /> */}
                                    <SelectModal 
                                        modal
                                        selected={key}
                                        error={!disabled && !key}
                                        placeholder="Select key"
                                        search={{
                                            placeholder: 'Search data keys',
                                        }}
                                        options={dataKeys.data
                                            .sort((a, b) => {
                                                const aVal = !DATA_KEYS_MAP[type!].includes(a.dataType!) ? 1 : 0;
                                                const bVal = !DATA_KEYS_MAP[type!].includes(b.dataType!) ? 1 : 0;
                                                return aVal - bVal;
                                            })
                                            .map(o => ({
                                                value: o.name,
                                                label: o.name,
                                                description: o.label || '',
                                                caption: o.dataType || '',
                                                // disabled: !DATA_KEYS_MAP[type!].includes(o.dataType!),
                                            }))}
                                        onSelect={([key]) => {
                                            const fullKey = dataKeys.data.find(k => k.name === key?.value);
                                            const children = dataKeys.data
                                                .filter(k => k.parentKeys.map(k => k.toLowerCase()).includes(`${key?.value}`.toLowerCase()));

                                            setValue('key', `${key?.value || ''}`, { shouldDirty: true, });
                                            setValue('label', `${key?.description || key?.value || ''}`.trim(), { shouldDirty: true, });

                                            if (fullKey?.dataType === 'dropdown' && isDropdownField) {
                                                const values = children.map(k => `${k.name},${(k.label || k.name).trim()}`).join('\n');
                                                setValue('values', values || '', { shouldDirty: true, });
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                                    <Input
                                        {...register('label', { disabled, })}
                                        name="label"
                                        error={!disabled && !label}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="refKey">Reference Key</Label>
                                <Input
                                    {...register('refKey', { disabled, })}
                                    name="refKey"
                                    noRing={false}
                                />
                                <span className="text-xs text-muted-foreground">Link this field to <b>another field with this key</b></span>
                            </div>

                            <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                                <div className="flex-1 flex items-center space-x-2">
                                    <Switch
                                        id="confidential"
                                        disabled={disabled}
                                        checked={confidential}
                                        onCheckedChange={checked => setValue('confidential', checked, { shouldDirty: true, })}
                                    />
                                    <Label htmlFor="confidential">Confidential</Label>
                                </div>

                                <div className="flex-1 flex items-center space-x-2">
                                    <Switch
                                        id="optional"
                                        disabled={disabled}
                                        checked={optional}
                                        onCheckedChange={checked => setValue('optional', checked, { shouldDirty: true, })}
                                    />
                                    <Label htmlFor="optional">Optional</Label>
                                </div>
                            </div>

                            {(isDropdownField || isMultiSelectField) && (
                                <>
                                    

                                    <Controller 
                                        control={control}
                                        name="values"
                                        render={({ field }) => {
                                            return (
                                                <div>
                                                    <Label htmlFor="values" className={cn(valuesErrors.length ? 'text-danger' : '')}>Values</Label>
                                                    <Textarea
                                                        value={field.value}
                                                        disabled={disabled}
                                                        name="values"
                                                        rows={5}
                                                        noRing={false}
                                                        className={cn(valuesErrors.length ? 'border-danger' : '')}
                                                        onChange={e => {
                                                            const values = e.target.value;
                                                            const valuesParsed = (values || '').split('\n')
                                                                .map((v = '') => v.trim())
                                                                .map((value) => {
                                                                    const valueSplit = value.split(',');
                                                                    return { value: valueSplit[0], label: valueSplit[1], };
                                                                })
                                                                .filter(o => o.value && o.label);

                                                            field.onChange(values);

                                                            setValue(
                                                                'valuesOptions',
                                                                valuesOptions.filter(o => valuesParsed.map(o => o.value).includes(o.key)),
                                                                { shouldDirty: true, },
                                                            );
                                                        }}
                                                    />
                                                    <span className="text-xs text-danger">{valuesErrors.join(', ')}</span>
                                                </div>
                                            );
                                        }}
                                    />

                                    {!!valuesParsed.length && (
                                        <div className="flex flex-col gap-y-4">
                                            {!!valuesOptions.length && (
                                                <>
                                                    <Title>Options</Title>
                                                    {valuesOptions.map((o, i) => {
                                                        const label = valuesParsed.find(v => v.value === o.key)?.label;
                                                        return (
                                                            <Controller
                                                                key={o.key + i}
                                                                control={control}
                                                                name={`valuesOptions.${i}`}
                                                                render={({ field }) => {
                                                                    return (
                                                                        <div>
                                                                            <div className="text-xs p-2 rounded-sm bg-primary/20 font-bold inline-block mb-2">{label}</div>
                                                                            <div className="flex gap-x-2 items-end">
                                                                                <div className="flex-1">
                                                                                    <Label htmlFor={`valuesOptions${i}.optionKey`}>Key</Label>
                                                                                    <Input 
                                                                                        disabled={disabled}
                                                                                        value={field.value.optionKey}
                                                                                        onChange={e => field.onChange({
                                                                                            ...field.value,
                                                                                            optionKey: e.target.value,
                                                                                        })}
                                                                                        onBlur={field.onBlur}
                                                                                    />
                                                                                </div>

                                                                                <div className="flex-1">
                                                                                    <Label htmlFor={`valuesOptions${i}.optionLabel`}>Label</Label>
                                                                                    <Input 
                                                                                        disabled={disabled}
                                                                                        value={field.value.optionLabel}
                                                                                        onChange={e => field.onChange({
                                                                                            ...field.value,
                                                                                            optionLabel: e.target.value,
                                                                                        })}
                                                                                        onBlur={field.onBlur}
                                                                                    />
                                                                                </div>

                                                                                {!disabled && (
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        onClick={() => setValue(
                                                                                            'valuesOptions',
                                                                                            valuesOptions.filter((_, j) => j !== i),
                                                                                            { shouldDirty: true, },
                                                                                        )} 
                                                                                    >
                                                                                        <XIcon className="size-4" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </>
                                            )}

                                            {!disabled && (valuesOptions.length < valuesParsed.length) && (
                                                <div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                            >
                                                                Add value option
                                                                <ChevronDown className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            {valuesParsed.filter(o => !valuesOptions.map(o => o.key).includes(o.value)).map(o => (
                                                                <DropdownMenuItem 
                                                                    key={o.value} 
                                                                    onClick={() => {
                                                                        setValue(
                                                                            'valuesOptions',
                                                                            [...valuesOptions, {
                                                                                key: o.value,
                                                                                optionKey: '',
                                                                                optionLabel: '',
                                                                            }],
                                                                            { shouldDirty: true, },
                                                                        );
                                                                    }}
                                                                >
                                                                    {o.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {(isPeriodField || isNumberField) && (
                                <>
                                    <div>
                                        <Label htmlFor="calculation">Reference expression</Label>
                                        <Input
                                            {...register('calculation', { disabled, })}
                                            name="calculation"
                                            noRing={false}
                                        />
                                        <span className="text-xs text-muted-foreground">Example: $key or SUM($key1,$key2...) or DIVIDE($key1,$key2...) or MULTIPLY($key1,$key2...) or SUBTRACT($key1,$key2...)</span>
                                    </div>
                                </>
                            )}

                            {isPeriodField && (
                                <div>
                                    <Label htmlFor="periodFormart">Format</Label>
                                    <Select
                                        value={format}
                                        required
                                        name="format"
                                        onValueChange={value => {
                                            setValue('format', value || 'days_hours', { shouldDirty: true, });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Formats</SelectLabel>
                                                {PERIOD_FIELD_FORMATS.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {isNumberField && (
                                <>
                                    <div className="flex flex-col gap-y-2">
                                        <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                                            <div className="sm:flex-1">
                                                <Label htmlFor="minValue">Min value</Label>
                                                <Input
                                                    {...register('minValue', { disabled, })}
                                                    name="minValue"
                                                    noRing={false}
                                                />
                                            </div>

                                            <div className="sm:flex-1">
                                                <Label htmlFor="maxValue">Max value</Label>
                                                <Input
                                                    {...register('maxValue', { disabled, })}
                                                    name="maxValue"
                                                    noRing={false}
                                                />
                                            </div>

                                            <div className="sm:flex-1">
                                                <Label htmlFor="format">Format</Label>
                                                <Input
                                                    {...register('format', { disabled, })}
                                                    name="format"
                                                    noRing={false}
                                                />
                                            </div>
                                        </div>

                                        <span className="text-xs text-muted-foreground">Format: Add as many # as the number of decimal digits or leave empty</span>
                                    </div>
                                </>
                            )}

                            {isDateField && (
                                <>
                                    <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                                        <div className="flex-1 flex flex-col gap-y-5">
                                            <div>
                                                <Label>Min date</Label>
                                                <DateTimePicker
                                                    disabled={disabled || (minDate === 'date_now')}
                                                    type="datetime"
                                                    value={minDate}
                                                    onChange={({ date }) => {
                                                        let _minDate = date?.toISOString?.() || '';
                                                        if (minDate === 'date_now') _minDate = minDate;
                                                        setValue('minDate', _minDate, { shouldDirty: true, });
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 flex items-center space-x-2">
                                                <Checkbox
                                                    id="minDateCurrent"
                                                    disabled={disabled}
                                                    checked={minDate === 'date_now'}
                                                    onCheckedChange={checked => setValue('minDate', checked ? 'date_now' : '', { shouldDirty: true, })}
                                                />
                                                <Label htmlFor="minDateCurrent">Current date</Label>
                                            </div>

                                            <div>
                                                <Label htmlFor="minDateKey">Min Date Key e.g $DateOfBirth</Label>
                                                <Input
                                                    {...register('minDateKey', { disabled, })}
                                                    name="minDateKey"
                                                    noRing={false}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-y-5">
                                            <div>
                                                <Label>Max date</Label>
                                                <DateTimePicker
                                                    disabled={disabled || (maxDate === 'date_now')}
                                                    type="datetime"
                                                    value={maxDate}
                                                    onChange={({ date }) => {
                                                        let _maxDate = date?.toISOString?.() || '';
                                                        if (maxDate === 'date_now') _maxDate = maxDate;
                                                        setValue('maxDate', _maxDate, { shouldDirty: true, });
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 flex items-center space-x-2">
                                                <Checkbox
                                                    id="maxDateCurrent"
                                                    disabled={disabled}
                                                    checked={maxDate === 'date_now'}
                                                    onCheckedChange={checked => setValue('maxDate', checked ? 'date_now' : '', { shouldDirty: true, })}
                                                />
                                                <Label htmlFor="maxDateCurrent">Current date</Label>
                                            </div>

                                            <div>
                                                <Label htmlFor="maxDateKey">Max Date Key e.g $DateOfBirth</Label>
                                                <Input
                                                    {...register('maxDateKey', { disabled, })}
                                                    name="maxDateKey"
                                                    noRing={false}
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    <Title>Default</Title>

                                    <RadioGroup
                                        disabled={disabled}
                                        defaultValue={defaultValue || 'empty'}
                                        onValueChange={value => setValue('defaultValue', (value === 'empty' ? '' : value) || '', { shouldDirty: true, })}
                                        className="flex flex-col gap-y-4"
                                    >
                                        {[
                                            { label: 'Empty', name: 'empty' },
                                            { label: 'Current time', name: 'date_now' },
                                            { label: 'Today at noon', name: 'date_noon' },
                                            { label: 'Today at midnight', name: 'date_midnight' },
                                        ].map(t => (
                                            <div key={t.name} className="flex items-center space-x-2">
                                                <RadioGroupItem value={t.name} id={t.name} />
                                                <Label htmlFor={t.name}>{t.label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </>
                            )}

                            {isTimeField && (
                                <>
                                    <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                                        <div className="flex-1 flex flex-col gap-y-5">
                                            <div>
                                                <Label>Min time</Label>
                                                {minTime === 'time_now' ? <Input disabled type="time" /> : (
                                                    <DateTimePicker
                                                        disabled={disabled}
                                                        type="time"
                                                        value={minTime}
                                                        onChange={({ time }) => setValue('minTime', time || '', { shouldDirty: true, })}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 flex items-center space-x-2">
                                                <Checkbox
                                                    id="minTime"
                                                    disabled={disabled}
                                                    checked={minTime === 'time_now'}
                                                    onCheckedChange={checked => setValue('minTime', checked ? 'time_now' : '', { shouldDirty: true, })}
                                                />
                                                <Label htmlFor="minTime">Current time</Label>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-y-5">
                                            <div>
                                                <Label>Max time</Label>
                                                {maxTime === 'time_now' ? <Input disabled type="time" /> : (
                                                    <DateTimePicker
                                                        disabled={disabled}
                                                        type="time"
                                                        value={maxTime}
                                                        onChange={({ time }) => setValue('maxTime', time || '', { shouldDirty: true, })}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 flex items-center space-x-2">
                                                <Checkbox
                                                    id="maxTime"
                                                    disabled={disabled}
                                                    checked={maxTime === 'time_now'}
                                                    onCheckedChange={checked => setValue('maxTime', checked ? 'time_now' : '', { shouldDirty: true, })}
                                                />
                                                <Label htmlFor="maxTime">Current time</Label>
                                            </div>
                                        </div>

                                    </div>
                                </>
                            )}
                        </>

                        {isTextField && (
                            <>
                                <Title>Default</Title>

                                <RadioGroup
                                    disabled={disabled}
                                    defaultValue={defaultValue || 'empty'}
                                    onValueChange={value => setValue('defaultValue', (value === 'empty' ? '' : value) || '', { shouldDirty: true, })}
                                    className="flex flex-col gap-y-4"
                                >
                                    {[
                                        { label: 'Empty', name: 'empty' },
                                        { label: 'Generated ID', name: 'uid' },
                                    ].map(t => (
                                        <div key={t.name} className="flex items-center space-x-2">
                                            <RadioGroupItem value={t.name} id={t.name} />
                                            <Label htmlFor={t.name}>{t.label}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </>
                        )}

                        <>
                            <Title>Neotree ID Search</Title>
                            <div className="flex flex-col gap-y-4">
                                {nuidSearchOptions.map(o => {
                                    const id = `prePopulate_${o.value}`;
                                    const all = nuidSearchOptions.filter(o => o.value !== nuidSearchOptions[0].value).map(o => o.value);
                                    const checked = prePopulate.includes(o.value) || (prePopulate.length === all.length);

                                    return (
                                        <div key={id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={id}
                                                checked={checked}
                                                disabled={disabled}
                                                onCheckedChange={checked => {
                                                    let data: string[] = [];
                                                    if (checked) {
                                                        data = [...prePopulate, o.value];
                                                        if (o.value === nuidSearchOptions[0].value) {
                                                            data = all;
                                                        }
                                                    } else {
                                                        data = prePopulate.filter(s => s !== o.value);
                                                        if (o.value === nuidSearchOptions[0].value) data = [];
                                                    }
                                                    setValue('prePopulate', data, { shouldDirty: true, });
                                                }}
                                            />
                                            <Label htmlFor={id}>{o.label}</Label>
                                        </div>
                                    );
                                })}
                            </div>
                            {
                                prePopulate?.length > 0 && (
                                    <div className="max-w-64">
                                        <Label secondary htmlFor="alias">ALIAS</Label>
                                        <Input
                                            value={alias}
                                            disabled={true}
                                            name="alias"
                                            placeholder=""
                                            noRing={false}
                                        />
                                    </div>
                                )

                            }
                        </>

                        <>
                            <Title>Print</Title>
                            <div>
                                <div className="flex-1 flex items-center space-x-2">
                                    <Checkbox
                                        id="printable"
                                        disabled={disabled}
                                        checked={printable}
                                        onCheckedChange={() => setValue('printable', !printable, { shouldDirty: true, })}
                                    />
                                    <Label htmlFor="printable">Print</Label>
                                </div>

                                <span className="text-muted-foreground text-xs">If not checked, data will not be display on the session summary and the printout.</span>
                            </div>
                        </>
                        <>
                            <Title>Editable</Title>
                            <div>
                                <div className="flex-1 flex items-center space-x-2">
                                    <Checkbox
                                        id="editable"
                                        disabled={disabled}
                                        checked={editable}
                                        onCheckedChange={() => setValue('editable', !editable, { shouldDirty: true, })}
                                    />
                                    <Label htmlFor="editable">Editable</Label>
                                </div>

                                <span className="text-muted-foreground text-xs">If not checked,values on a form field,if auto populated will be read only.</span>
                            </div>
                        </>
                    </div>
                )}
            </Modal>
        </>
    );
}
