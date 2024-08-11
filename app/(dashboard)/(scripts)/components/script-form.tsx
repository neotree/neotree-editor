'use client';

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
import { NuidSearchFieldsConfig } from "./nuid-search-fields-config";
import { Title } from "./title";
import { ScriptItemsFab } from "./script-items-fab";
import { useScriptForm } from "../hooks/use-script-form";

type Props = {
    formData?: ScriptFormDataType;
    hospitals: Awaited<ReturnType<IScriptsContext['getHospitals']>>['data'];
};

export function ScriptForm(props: Props) {
    const { onCancelScriptForm } = useScriptsContext();

    const form = useScriptForm(props);
    const {
        formData,
        formIsDirty,
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

    const type = watch('type');
    const hospitalId = watch('hospitalId');
    const exportable = watch('exportable');
    const nuidSearchFields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');

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
                                setValue('hospitalId', value || null, { shouldDirty: true, });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Hospitals</SelectLabel>
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
                    </div>

                    <div>
                        <Label secondary htmlFor="printTitle">Print title</Label>
                        <Input 
                            {...register('printTitle', { disabled, })}
                            placeholder="Print title"
                            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                        />
                    </div>

                    <div>
                        <Label secondary htmlFor="description">Description</Label>
                        <Input 
                            {...register('description', { disabled, })}
                            placeholder="Description"
                            className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
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
                        disabled={!formIsDirty}
                    >
                        Save draft
                    </Button>
                </div>
            </div>
        </>
    );
}
