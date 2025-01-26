'use client';

import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

import { Tabs } from '@/components/tabs';
import { scriptsPageTabs } from '@/constants';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/loader";
import { useScriptsContext, ScriptFormDataType, IScriptsContext } from "@/contexts/scripts";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { scriptTypes } from "@/constants";
import { useAppContext } from "@/contexts/app";
import { NuidSearchFieldsConfig } from "./nuid-search-fields-config";
import { Title } from "./title";
import { ScriptItemsFab } from "./script-items-fab";
import { useScriptForm } from "../hooks/use-script-form";
import { PreferencesForm } from "@/components/preferences-form";
import Screens from './screens';
import Diagnoses from './diagnoses';
import { PrintSections } from './print';

type Props = {
    formData?: ScriptFormDataType;
    hospitals: Awaited<ReturnType<IScriptsContext['getHospitals']>>['data'];
};

export function ScriptForm(props: Props) {
    const searchParams = useSearchParams();
    const section = searchParams.get('section');

    const { onCancelScriptForm } = useScriptsContext();

    const form = useScriptForm(props);
    const {
        formData,
        hospitals,
        loading,
        disabled,
        reset: resetForm,
        watch,
        setValue,
        register,
        getDefaultFormValues,
        getDefaultNuidSearchFields,
        onSubmit,
    } = form;

    const { mode } = useAppContext();

    const type = watch('type');
    const hospitalId = watch('hospitalId');
    const exportable = watch('exportable');
    const nuidSearchFields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');
    const preferences = watch('preferences');

    return (
        <>
            {loading && <Loader overlay />}

            <ScriptItemsFab 
                disabled={disabled} 
                resetForm={() => resetForm(getDefaultFormValues())}
            />

            <div 
                className="flex flex-col gap-y-4 [&>*]:px-4"
            >
                <>
                    <Title>Type</Title>

                    <div>
                        <RadioGroup
                            disabled={disabled}
                            defaultValue={type}
                            onValueChange={value => setValue('type', value as typeof type, { shouldDirty: true, })}
                            className="flex flex-col gap-y-4"
                        >
                            {scriptTypes.map(t => (
                                <div key={t.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={t.value} id={t.value} />
                                    <Label secondary htmlFor={t.value}>{t.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <Title className="mt-5">Hospital</Title>

                    <div>
                        <Label secondary htmlFor="hospital">Hospital</Label>
                        <Select
                            value={hospitalId || ''}
                            required
                            name="hospital"
                            disabled={disabled}
                            onValueChange={value => {
                                value = value === 'none' ? null! : value;
                                setValue('hospitalId', value || null, { shouldDirty: true, });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                {/* <SelectLabel>Hospitals</SelectLabel> */}
                                <SelectItem value="none">No hospital</SelectItem>
                                {hospitals.map(h => (
                                    <SelectItem key={h.hospitalId} value={h.hospitalId}>
                                        {h.name}
                                    </SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <Title className="mt-5">Properties</Title>

                    <div>
                        <Label secondary htmlFor="title">Title *</Label>
                        <Input 
                            {...register('title', { required: true, disabled, })}
                            placeholder="Title"
                            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                        />
                        <PreferencesForm 
                            id="title"
                            title="Title"
                            disabled={disabled}
                            data={preferences}
                            onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                            hide
                        />
                    </div>

                    <div>
                        <Label secondary htmlFor="printTitle">Print title</Label>
                        <Input 
                            {...register('printTitle', { disabled, })}
                            placeholder="Print title"
                            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                        />
                        <PreferencesForm 
                            id="printTitle"
                            title="Print title"
                            disabled={disabled}
                            data={preferences}
                            onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                            hide
                        />
                    </div>

                    <div>
                        <Label secondary htmlFor="description">Description</Label>
                        <Input 
                            {...register('description', { disabled, })}
                            placeholder="Description"
                            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                        />
                        <PreferencesForm 
                            id="description"
                            title="Description"
                            disabled={disabled}
                            data={preferences}
                            onSave={data => setValue('preferences', data, { shouldDirty: true, })}
                            hide
                        />
                    </div>

                    <div className="flex gap-x-2">
                        <Checkbox 
                            name="exportable"
                            id="exportable"
                            disabled={disabled}
                            checked={exportable}
                            onCheckedChange={() => setValue('exportable', !exportable, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="exportable">Exportable</Label>
                    </div>

                    <Title className="mt-5">Neotree ID Search</Title>

                    <div className="flex gap-x-2">
                        <Checkbox 
                            name="nuidSearchEnabled"
                            id="nuidSearchEnabled"
                            disabled={disabled}
                            checked={nuidSearchEnabled}
                            onCheckedChange={() => {
                                const enabled = !nuidSearchEnabled;
                                setValue('nuidSearchEnabled', enabled, { shouldDirty: true, });
                                setValue('nuidSearchFields', getDefaultNuidSearchFields(), { shouldDirty: true, });
                            }}
                        />
                        <Label secondary htmlFor="nuidSearchEnabled">Enable NUID Search</Label>

                        <NuidSearchFieldsConfig 
                            disabled={disabled}
                            form={form}
                        />
                    </div>
                </>

                <div className={cn('flex gap-x-2 py-4')}>
                    <div className="ml-auto" />

                    <Button
                        variant="ghost"
                        onClick={() => onCancelScriptForm()}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={() => onSubmit()}
                        disabled={disabled}
                    >
                        Save draft
                    </Button>
                </div>
            </div>

            {!!props.formData && (
                <div 
                    className={clsx(
                        'flex flex-col gap-y-4 mt-10',
                    )}
                >
                    <Tabs 
                        options={scriptsPageTabs}
                        searchParamsKey="section"
                    />

                    {(!section || (section === 'screens')) && (
                        <Screens 
                            scriptId={props.formData.scriptId!} 
                        />
                    )}

                    {section === 'diagnoses' && (
                        <Diagnoses 
                            scriptId={props.formData.scriptId!} 
                        />
                    )}

                    {section === 'print' && (
                        <PrintSections 
                            disabled={disabled}
                            form={form}
                        />
                    )}
                </div>
            )}
        </>
    );
}
