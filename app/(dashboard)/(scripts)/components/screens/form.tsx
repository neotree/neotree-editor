'use client';

import { useCallback, useState, Fragment,useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Controller } from "react-hook-form";
import { v4 } from "uuid";
import axios from 'axios';

import { getLeanAlias } from '@/app/actions/aliases'
import { KeyValueTextarea } from "@/components/key-value-textarea";
import { SelectModal } from "@/components/select-modal";
import { listScreens } from "@/app/actions/scripts";
import { useDataKeysCtx } from "@/contexts/data-keys";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { GetDrugsLibraryItemsResults } from '@/databases/queries/drugs-library';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/loader";
import { ScreenFormDataType } from "@/contexts/scripts";
import { screenTypes, CONDITIONAL_EXP_EXAMPLE } from '@/constants';
import { cn } from "@/lib/utils";
import { nuidSearchOptions } from "@/constants/fields";
import { WHY_DIAGNOSIS_OPTION_DISABLED } from "@/constants/copy";
import { Separator } from "@/components/ui/separator";
import edlizSummaryData from "@/constants/edliz-summary-table";
import { ScriptField, ScriptItem } from "@/types";
import { PreferencesForm } from "@/components/preferences-form";
import { Title } from "../title";
import { useScreenForm } from "../../hooks/use-screen-form";
import { getScreenDataType } from "../../utils";
import { ImageField } from "../image-field";
import { Fields } from "./fields";
import { Items } from "./items";
import { Drugs } from "./drugs";
import { EdlizSummary } from "./edliz-summary";

type Props = {
    scriptId: string;
    formData?: ScreenFormDataType;
    countDiagnosesScreens?: number;
    screens: Awaited<ReturnType<typeof listScreens>>['data'];
};

export function ScreenForm({
    formData,
    scriptId,
    countDiagnosesScreens,
    screens,
}: Props) {
    const { loadingSelectOptions, selectOptions, } = useDataKeysCtx();

    const router = useRouter();
    const [showForm, setShowForm] = useState(!!formData);

    const form = useScreenForm({
        formData,
        scriptId,
    });

    const {
        control,
        formIsDirty,
        saving,
        scriptPageHref,
        disabled,
        register,
        watch,
        setValue,
        save,
    } = form;
    const [alias, setAlias] = useState('');
    const type = watch('type');
    const skippable = watch('skippable');
    const printable = watch('printable');
    const confidential = watch('confidential');
    const prePopulate = watch('prePopulate');
    const image1 = watch('image1');
    const image2 = watch('image2');
    const image3 = watch('image3');
    const preferences = watch('preferences');
    const skipToScreenId = watch('skipToScreenId');
    const reasons = watch('reasons');
    const repeatable = watch('repeatable');
    const collectionLabel = watch('collectionLabel');
    const key = watch('key');
    const listStyle = form.watch('listStyle');

    const goToScriptPage = useCallback(() => { router.push(scriptPageHref); }, [router, scriptPageHref]);

    const displayLoader = saving || loadingSelectOptions;

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

    if (!showForm) {
        return (
            <>
                <div className="flex flex-col gap-y-4 [&>*]:px-4">
                    <Title>Type</Title>

                    <div>
                        <RadioGroup
                            disabled={disabled}
                            defaultValue={type}
                            onValueChange={value => {
                                setValue('type', value as typeof type, { shouldDirty: true, });
                                setValue('items', [], { shouldDirty: true, });
                                if ((value === 'mwi_edliz_summary_table') || (value === 'zw_edliz_summary_table')) {
                                    const items = edlizSummaryData[value] as ScriptItem[];
                                    setValue('items', items, { shouldDirty: true, });
                                }
                            }}
                            className="flex flex-col gap-y-4"
                        >
                            {screenTypes.map(t => {
                                let disabled = false;
                                let helperText = '';
                                if (t.value === 'diagnosis') {
                                    disabled = !!countDiagnosesScreens;
                                    helperText = !disabled ? '' : WHY_DIAGNOSIS_OPTION_DISABLED;
                                }
                                return (
                                    <div key={t.value} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={t.value}
                                            id={t.value}
                                            disabled={disabled}
                                        />

                                        <Label
                                            secondary
                                            htmlFor={t.value}
                                            aria-disabled={disabled}
                                            className={disabled ? 'opacity-70 cursor-not-allowed' : ''}
                                        >{t.label}</Label>

                                        {!!helperText && (
                                            <Popover>
                                                <PopoverTrigger>
                                                    <Info className="text-primary h-4 w-4" />
                                                </PopoverTrigger>
                                                <PopoverContent className="max-w-[200px] bg-primary text-primary-foreground">
                                                    <div dangerouslySetInnerHTML={{ __html: helperText }} />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    <div className="flex items-center justify-end gap-x-2 py-6">
                        <Button
                            variant="ghost"
                            onClick={() => goToScriptPage()}
                        >Cancel</Button>

                        <Button
                            disabled={!type && !formIsDirty || disabled}
                            onClick={() => {
                                setValue('dataType', getScreenDataType(type));
                                if (type === 'management') {
                                    setValue('printable', false);
                                }
                                setShowForm(true);
                            }}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    const isDiagnosisScreen = type === 'diagnosis';
    const isProgressScreen = type === 'progress';
    const isFormScreen = type === 'form';
    const isChecklistScreen = type === 'checklist';
    const isManagementScreen = type === 'management';
    const isZwEdlizScreen = type === 'zw_edliz_summary_table';
    const isMwEdlizScreen = type === 'mwi_edliz_summary_table';
    const isEdlizScreen = isZwEdlizScreen || isMwEdlizScreen;
    const isYesNoScreen = type === 'yesno';
    const isTimerScreen = type === 'timer';
    const isMultiSelectScreen = type === 'multi_select';
    const isSingleSelectScreen = type === 'single_select';
    const isSelectScreen = isMultiSelectScreen || isSingleSelectScreen;
    const isDrugsScreen = type === 'drugs';
    const isFluidsScreen = type === 'fluids';
    const canConfigureNuidSearch = isYesNoScreen || isSelectScreen || isTimerScreen;
    const canConfigurePrint = isYesNoScreen || isSelectScreen || isTimerScreen || isManagementScreen || isDiagnosisScreen;
    const hasItems = isSingleSelectScreen || isMultiSelectScreen || isChecklistScreen || isProgressScreen || isDiagnosisScreen;
    const hasFields = isFormScreen;

    const renderKeyInput = ({ 
        value: key, 
    }: {
        value: string;
    }) => {
        return (
            <SelectModal
                // selected={key}
                error={!disabled && !key}
                placeholder={`${key || ''}` || 'Select key'}
                search={{
                    placeholder: 'Search data keys',
                }}
                options={selectOptions}
                onSelect={([dataKey]) => {
                    console.log(dataKey)
                    const label = dataKey?.data?.label || '';
                    const key = dataKey?.data?.key || '';
                    const dataType = dataKey?.data?.dataType;
                    const children: {
                        value: string;
                        label: string;
                        children?: {
                            value: string;
                            label: string;
                        }[];
                    }[] = dataKey?.data?.children || [];

                    setValue('key', key, { shouldDirty: true, });
                    setValue('label', label, { shouldDirty: true, });

                    if (hasItems) {
                        const items = children.map((k, i) => {
                            return {
                                itemId: v4(),
                                id: (isChecklistScreen || isProgressScreen) ? '' : k.value,
                                label: k.label,
                                position: i + 1,
                                subType: '', // edliz
                                type: '', // edliz,
                                exclusive: false,
                                confidential: false,
                                checked: false,
                                enterValueManually: false,
                                severity_order: '',
                                summary: '',
                                key: isChecklistScreen ? k.value : '',
                                score: (isEdlizScreen ? '' : '') as unknown as number,
                                dataType: (() => {
                                    switch (type) {
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
                            };
                        });

                        setValue('items', items, { shouldDirty: true, });
                    }

                    if (hasFields) {
                        const fields = children.map((k, i) => {
                            const f = {
                                fieldId: v4(),
                                type: dataType,
                                key: k.value,
                                label: (k.label || k.value).trim(),
                                refKey: '',
                                calculation: '',
                                condition: '',
                                dataType: '',
                                defaultValue: '',
                                format: '',
                                minValue: '',
                                maxValue: '',
                                minDate: '',
                                maxDate: '',
                                minTime: '',
                                maxTime: '',
                                minDateKey: '',
                                maxDateKey: '',
                                minTimeKey: '',
                                maxTimeKey: '',
                                values: '',
                                valuesOptions: [],
                                confidential: false,
                                optional: false,
                                printable: false,
                                prePopulate: [],
                                editable: false,
                                // items: (k.children || []).map(k => ({
                                //     itemId: v4(),

                                // })),
                            } satisfies ScriptField;

                            return f;
                        });

                        setValue('fields', fields, { shouldDirty: true, });
                    }
                }}
            />
        );
    }

    return (
        <>
            {displayLoader && <Loader overlay />}

            <div className="flex flex-col gap-y-5 [&>*]:px-4">
                <Title>Type</Title>

                <div>
                    <Select
                        value={type || ''}
                        disabled
                        name="type"
                        onValueChange={v => {
                            const value = (v || screenTypes[0].value) as typeof type;
                            setValue('type', value, { shouldDirty: true, });
                            setValue('items', [], { shouldDirty: true, });
                            if ((value === 'mwi_edliz_summary_table') || (value === 'zw_edliz_summary_table')) {
                                setValue('items', [], { shouldDirty: true, });
                            }
                            if (value === 'management') setValue('printable', false);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Screen types</SelectLabel>
                                {screenTypes.map(s => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <Title>Flow control</Title>

                <div className="flex-1 flex items-center space-x-2">
                    <Switch
                        id="skippable"
                        checked={skippable}
                        disabled={disabled}
                        onCheckedChange={checked => setValue('skippable', checked, { shouldDirty: true, })}
                    />
                    <Label secondary htmlFor="skippable">Allow user to skip this screen</Label>
                </div>

                <div>
                    <Label secondary htmlFor="condition">Conditional expression</Label>
                    <Textarea
                        {...register('condition', { disabled, })}
                        name="condition"
                        noRing={false}
                        rows={5}
                    />
                    <span className="text-xs text-muted-foreground">Example: {CONDITIONAL_EXP_EXAMPLE}</span>
                </div>

                <div className="flex flex-col gap-y-5 sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:items-baseline">
                    <div className="flex-1">
                        <Label secondary htmlFor="skipToCondition">Skip to screen conditional expression</Label>
                        <Input
                            {...register('skipToCondition', { disabled, })}
                            name="skipToCondition"
                            noRing={false}
                        />
                        <span className="text-xs text-muted-foreground">Example: {CONDITIONAL_EXP_EXAMPLE}</span>
                    </div>

                    <div className="min-w-[300px]">
                        <Label secondary htmlFor="skipToScreenId">Skip to screen</Label>
                        <Select
                            value={skipToScreenId}
                            name="skipToScreenId"
                            onValueChange={val => {
                                setValue('skipToScreenId', val === 'none' ? '' : val);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select screen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="none">None</SelectItem>
                                    {screens.map(s => (
                                        <SelectItem key={s.screenId} value={s.oldScreenId || s.screenId}>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: [
                                                        s.position,
                                                        s.title,
                                                        `<span class="opacity-50">${s.refId || ''}</span>`,
                                                    ].join(' - '),
                                                }}
                                            />
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Title>Properties</Title>

                <div className="flex flex-col gap-y-5 sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1">
                    <div>
                        <Label secondary htmlFor="epicId">Epic ID</Label>
                        <Input
                            {...register('epicId', { disabled, })}
                            name="epicId"
                            noRing={false}
                        />
                    </div>

                    <div>
                        <Label secondary htmlFor="storyId">Story ID</Label>
                        <Input
                            {...register('storyId', { disabled, })}
                            name="storyId"
                            noRing={false}
                        />
                    </div>

                    <div>
                        <Label secondary htmlFor="refId">Ref *</Label>
                        <Input
                            {...register('refId', { disabled, required: true, })}
                            name="refId"
                            noRing={false}
                        />
                    </div>

                    <div>
                        <Label secondary htmlFor="step">Step</Label>
                        <Input
                            {...register('step', { disabled, })}
                            name="step"
                            noRing={false}
                        />
                    </div>
                </div>

                <div>
                    <Label secondary htmlFor="title">Title *</Label>
                    <Input
                        {...register('title', { disabled, required: true, })}
                        name="title"
                        noRing={false}
                    />
                    <PreferencesForm
                        id="title"
                        title="Title"
                        disabled={disabled}
                        data={preferences}
                        onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                        hide={false}
                    />
                </div>

                {isDiagnosisScreen && (
                    <>
                        <div>
                            <Label secondary htmlFor="title2">Title 2 *</Label>
                            <Input
                                {...register('title2', { disabled, required: false, })}
                                name="title2"
                                noRing={false}
                            />
                            <PreferencesForm
                                id="title2"
                                title="Title 2"
                                disabled={disabled}
                                data={preferences}
                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                hide={false}
                            />
                        </div>

                        <div>
                            <Label secondary htmlFor="title3">Title 3 *</Label>
                            <Input
                                {...register('title3', { disabled, required: false, })}
                                name="title3"
                                noRing={false}
                            />
                            <PreferencesForm
                                id="title3"
                                title="Title 3"
                                disabled={disabled}
                                data={preferences}
                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                hide={false}
                            />
                        </div>

                        <div>
                            <Label secondary htmlFor="previewTitle">Preview title *</Label>
                            <Input
                                {...register('previewTitle', { disabled, required: false })}
                                name="previewTitle"
                                noRing={false}
                            />
                            <PreferencesForm
                                id="previewTitle"
                                title="Preview title"
                                disabled={disabled}
                                data={preferences}
                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                hide={false}
                            />
                        </div>

                        <div>
                            <Label secondary htmlFor="previewPrintTitle">Preview print title *</Label>
                            <Input
                                {...register('previewPrintTitle', { disabled, required: false })}
                                name="previewPrintTitle"
                                noRing={false}
                            />
                            <PreferencesForm
                                id="previewPrintTitle"
                                title="Preview print title"
                                disabled={disabled}
                                data={preferences}
                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                hide={false}
                            />
                        </div>
                    </>
                )}

                <div>
                    <Label secondary htmlFor="sectionTitle">Print section title *</Label>
                    <Input
                        {...register('sectionTitle', { disabled, required: false, })}
                        name="sectionTitle"
                        noRing={false}
                    />
                    <PreferencesForm
                        id="sectionTitle"
                        title="Print section title"
                        disabled={disabled}
                        data={preferences}
                        onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                        hide={false}
                    />
                </div>

                <div>
                    <Label secondary htmlFor="actionText">Action</Label>
                    <Input
                        {...register('actionText', { disabled, })}
                        name="actionText"
                        noRing={false}
                    />
                    <PreferencesForm
                        id="actionText"
                        title="Action"
                        disabled={disabled}
                        data={preferences}
                        onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                    />
                </div>

                <div className="flex gap-x-4">
                    <div className="flex-1">
                        <Label secondary htmlFor="contentText">Content</Label>
                        <Textarea
                            {...register('contentText', { disabled, })}
                            name="contentText"
                            noRing={false}
                            rows={5}
                        />
                        <PreferencesForm
                            id="contentText"
                            title="Content"
                            disabled={disabled}
                            data={preferences}
                            onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                        />
                    </div>

                    <Controller
                        control={control}
                        name="contentTextImage"
                        render={({ field }) => {
                            return (
                                <ImageField
                                    disabled={disabled}
                                    image={field.value}
                                    onChange={value => field.onChange(value)}
                                />
                            );
                        }}
                    />
                </div>

                {isManagementScreen && (
                    <>
                        {[
                            [
                                'title1',
                                'text1',
                                image1,
                            ],
                            [
                                'title2',
                                'text2',
                                image2,
                            ],
                            [
                                'title3',
                                'text3',
                                image3,
                            ],
                        ].map((keys, i) => {
                            const title = keys[0] as 'title1' | 'title2' | 'title3';
                            const text = keys[1] as 'text1' | 'text2' | 'text3';
                            const imageValue = keys[2];

                            const image = `image${i + 1}` as Parameters<typeof register>[0];

                            return (
                                <Fragment key={`imageTextFields.${i}`}>
                                    <div>
                                        <Label secondary htmlFor={`imageTextFields.${i}.title`}>Title {i + 1}</Label>
                                        <Input
                                            {...register(title, { disabled, })}
                                            name={title}
                                            noRing={false}
                                        />
                                        <PreferencesForm
                                            id={title as unknown as string}
                                            title={`Title ${i + 1}`}
                                            disabled={disabled}
                                            data={preferences}
                                            onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                            hide
                                        />
                                    </div>

                                    <div className="flex gap-x-4">
                                        <div className="flex-1">
                                            <Label htmlFor={`imageTextFields.${i}.text`}>Text {i + 1}</Label>
                                            <Textarea
                                                {...register(text, { disabled })}
                                                name={text}
                                                noRing={false}
                                                rows={5}
                                            />
                                            <PreferencesForm
                                                id={text as unknown as string}
                                                title={`Text ${i + 1}`}
                                                disabled={disabled}
                                                data={preferences}
                                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                            />
                                        </div>

                                        <ImageField
                                            disabled={disabled}
                                            image={imageValue as typeof image1}
                                            onChange={value => setValue(image, value, { shouldDirty: true, })}
                                        />
                                    </div>
                                </Fragment>
                            );
                        })}
                    </>
                )}

                {(isTimerScreen || isYesNoScreen || isSelectScreen || isChecklistScreen) && (
                    <div className={cn('flex flex-col gap-y-5', isTimerScreen && 'sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1')}>
                        <div>
                            <Label secondary htmlFor="key">Input key{!isTimerScreen ? ' *' : ''}</Label>
                            {/* <Input
                                {...register('key', { disabled, required: !isTimerScreen, })}
                                name="key"
                                noRing={false}
                            /> */}
                            <Controller 
                                name="key"
                                control={control}
                                render={({ field: { value: key, } }) => {
                                    return renderKeyInput({ value: key, });
                                }}
                            />
                        </div>

                        <div>
                            <Label secondary htmlFor="label">Input label{!isTimerScreen ? ' *' : ''}</Label>
                            <Input
                                {...register('label', { disabled, required: !isTimerScreen, })}
                                name="label"
                                noRing={false}
                            />
                        </div>
                    </div>
                )}

                {isYesNoScreen && (
                    <>
                        <div className="flex flex-col gap-y-5 sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1">
                            <div>
                                <Label secondary htmlFor="negativeLabel">Negative label *</Label>
                                <Input
                                    {...register('negativeLabel', { disabled, required: true, })}
                                    name="negativeLabel"
                                    noRing={false}
                                />
                            </div>

                            <div>
                                <Label secondary htmlFor="positiveLabel">Positive label *</Label>
                                <Input
                                    {...register('positiveLabel', { disabled, required: true, })}
                                    name="positiveLabel"
                                    noRing={false}
                                />
                            </div>
                        </div>
                    </>
                )}

                {isTimerScreen && (
                    <>
                        <div className="flex flex-col gap-y-5 sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1">
                            <div>
                                <Label secondary htmlFor="timerValue">Timer value</Label>
                                <Input
                                    {...register('timerValue', { disabled, })}
                                    name="timerValue"
                                    noRing={false}
                                />
                            </div>

                            <div>
                                <Label secondary htmlFor="multiplier">Multiplier</Label>
                                <Input
                                    {...register('multiplier', { disabled, })}
                                    name="multiplier"
                                    noRing={false}
                                />
                            </div>

                            <div>
                                <Label secondary htmlFor="minValue">Input value min.</Label>
                                <Input
                                    {...register('minValue', { disabled, })}
                                    name="minValue"
                                    noRing={false}
                                />
                            </div>

                            <div>
                                <Label secondary htmlFor="maxValue">Input value max.</Label>
                                <Input
                                    {...register('maxValue', { disabled, })}
                                    name="maxValue"
                                    noRing={false}
                                />
                            </div>
                        </div>
                    </>
                )}

                {(isYesNoScreen || isTimerScreen || isSelectScreen) && (
                    <>
                        <div className="flex-1 flex items-center space-x-2">
                            <Switch
                                id="confidential"
                                checked={confidential}
                                disabled={disabled}
                                onCheckedChange={checked => setValue('confidential', checked, { shouldDirty: true, })}
                            />
                            <Label secondary htmlFor="confidential">Confidential</Label>
                        </div>
                    </>
                )}

                <div>
                    <Label secondary htmlFor="instructions">Instructions</Label>
                    <Textarea
                        {...register('instructions', { disabled, })}
                        name="instructions"
                        noRing={false}
                        rows={5}
                    />
                    <PreferencesForm
                        id="instructions"
                        title="Instructions"
                        disabled={disabled}
                        data={preferences}
                        onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                    />
                </div>

                {isDiagnosisScreen && (
                    <>
                        <div>
                            <Label secondary htmlFor="instructions2">Instructions 2</Label>
                            <Textarea
                                {...register('instructions2', { disabled, })}
                                name="instructions2"
                                noRing={false}
                                rows={5}
                            />
                            <PreferencesForm
                                id="instructions2"
                                title="Instructions 2"
                                disabled={disabled}
                                data={preferences}
                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                            />
                        </div>

                        <div>
                            <Label secondary htmlFor="instructions3">Instructions 3</Label>
                            <Textarea
                                {...register('instructions3', { disabled, })}
                                name="instructions3"
                                noRing={false}
                                rows={5}
                            />
                            <PreferencesForm
                                id="instructions3"
                                title="Instructions 3"
                                disabled={disabled}
                                data={preferences}
                                onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                            />
                        </div>

                        <div className="flex flex-col gap-y-5 sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1">
                            <div>
                                <Label secondary htmlFor="hcwDiagnosesInstructions">HCW diagnoses instructions</Label>
                                <Textarea
                                    {...register('hcwDiagnosesInstructions', { disabled, })}
                                    name="hcwDiagnosesInstructions"
                                    noRing={false}
                                    rows={5}
                                />
                                <PreferencesForm
                                    id="hcwDiagnosesInstructions"
                                    title="HCW diagnoses instructions"
                                    disabled={disabled}
                                    data={preferences}
                                    onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                />
                            </div>

                            <div>
                                <Label secondary htmlFor="suggestedDiagnosesInstructions">Suggested diagnoses instructions</Label>
                                <Textarea
                                    {...register('suggestedDiagnosesInstructions', { disabled, })}
                                    name="suggestedDiagnosesInstructions"
                                    noRing={false}
                                    rows={5}
                                />
                                <PreferencesForm
                                    id="suggestedDiagnosesInstructions"
                                    title="Suggested diagnoses instructions"
                                    disabled={disabled}
                                    data={preferences}
                                    onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div>
                    <Label secondary htmlFor="notes">Notes</Label>
                    <Textarea
                        {...register('notes', { disabled, })}
                        name="notes"
                        noRing={false}
                        rows={5}
                    />
                    <PreferencesForm
                        id="notes"
                        title="Notes"
                        disabled={disabled}
                        data={preferences}
                        onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                    />
                </div>

                {(isDrugsScreen || isFluidsScreen) && (
                    <div>
                        <Label secondary htmlFor="reasons">Reasons for not administering {isFluidsScreen ? 'fluid' : 'drug'}</Label>
                        <KeyValueTextarea
                            name="reasons"
                            noRing={false}
                            rows={5}
                            value={reasons}
                            disabled={disabled}
                            onChange={reasons => setValue('reasons', reasons, { shouldDirty: true, })}
                        />
                    </div>
                )}

                {canConfigureNuidSearch && (
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
                            {
                                prePopulate?.length > 0 && !!alias &&(
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
                        </div>

                    </>

                )}

                {canConfigurePrint && (
                    <>
                        <Title>Print</Title>

                        <div className="flex flex-col gap-y-5 items-end sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1">
                            {isManagementScreen && (
                                <div className="max-w-64">
                                    <Label secondary htmlFor="refKey">Reference key</Label>
                                    <Input
                                        {...register('refKey', { disabled, })}
                                        name="refKey"
                                        placeholder="$refKey"
                                        noRing={false}
                                    />
                                </div>
                            )}

                            <div>
                                <div className="flex-1 flex items-center space-x-2">
                                    <Checkbox
                                        id="printable"
                                        checked={printable}
                                        disabled={disabled}
                                        onCheckedChange={() => setValue('printable', !printable, { shouldDirty: true, })}
                                    />
                                    <Label htmlFor="printable">Print</Label>
                                </div>

                                <span className="text-muted-foreground text-xs">If not checked, data will not be display on the session summary and the printout.</span>
                            </div>
                        </div>
                    </>
                )}

                {(isChecklistScreen || isMultiSelectScreen || isEdlizScreen || isDiagnosisScreen) && (
                    <>
                        <div>
                            <Label secondary htmlFor="listStyle">List style</Label>
                            <Select
                                value={listStyle}
                                name="listStyle"
                                onValueChange={(val: typeof listStyle) => {
                                    form.setValue('listStyle', val || 'none');
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="bullet">Bullet</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-end gap-x-2 py-6 px-4">
                <span className={cn('text-danger text-xs', disabled && 'hidden')}>* Required</span>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    onClick={() => goToScriptPage()}
                >Cancel</Button>

                <Button
                    disabled={disabled}
                    onClick={() => save()}
                >
                    Save Draft
                </Button>
            </div>

            {isEdlizScreen && (
                <EdlizSummary
                    form={form}
                    disabled={disabled}
                />
            )}

            {isFormScreen && (
                <>
                    <div className="flex flex-col gap-y-5 sm:flex-row sm:gap-y-0 sm:gap-x-2 sm:[&>*]:flex-1">
                        <div className="flex items-center justify-start gap-x-2 py-6 px-4">
                            <Switch
                                id="repeatable"
                                checked={repeatable}
                                disabled={disabled}
                                onCheckedChange={checked => setValue('repeatable', checked, { shouldDirty: true, })}
                            />
                            <Label secondary htmlFor="repeatable">Repeatable Form</Label>
                        </div>
                    </div>
                    
                    <Separator className="my-20" />

                    <Fields
                        form={form}
                        disabled={disabled}
                        scriptId={scriptId}
                    />
                    
                    {repeatable && (
                        <>
                            <Separator className="my-8" />

                            <div className="flex flex-col gap-y-5 [&>*]:px-4">
                                <div className="flex flex-col gap-x-2">
                                    <Label secondary htmlFor="collectionName">Collection Name</Label>
                                    <Input
                                        {...register('collectionName', { disabled, required: repeatable })}
                                        name="collectionName"
                                        noRing={false}
                                        required={repeatable}
                                        className="flex-col"

                                    />
                                </div>
                                    <div className="flex flex-col gap-y-5">
                                        <Label secondary htmlFor="collectionLabel">Collection Label</Label>
                                        <Select
                                            value={collectionLabel || ''}
                                            required={repeatable}
                                            name="collectionLabel"
                                            disabled={disabled}
                                            onValueChange={value => {
                                                value = value === 'none' ? '': value;
                                                setValue('collectionLabel', value || '', { shouldDirty: true, });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Collection Label" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>

                                                    <SelectItem value="none">No Collection Label</SelectItem>
                                                    {form?.getValues()?.fields?.map(f => (
                                                        <SelectItem key={f.key} value={f.key}>
                                                            {f.key}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>


                                    </div>
                                    <Separator className="my-8" />
                            </div>
                        </>
                    )}
                </>
            )}

            {hasItems && (
                <>
                    <Separator className="my-20" />

                    <Items
                        form={form}
                        disabled={disabled}
                    />
                </>
            )}

            {(isDrugsScreen || isFluidsScreen) && (
                <>
                    <Separator className="my-20" />

                    <Drugs
                        form={form}
                        disabled={disabled}
                        type={(() => {
                            let val: GetDrugsLibraryItemsResults['data'][0]['type'] = 'drug';
                            if (type === 'fluids') return 'fluid';
                            return val;
                        })()}
                    />
                </>
            )}
        </>
    );
}
