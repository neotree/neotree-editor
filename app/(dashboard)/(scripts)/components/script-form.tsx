'use client';

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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
import { defaultNuidSearchFields } from "@/constants/fields";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { scriptTypes } from "@/constants";
import { isEmpty } from "@/lib/isEmpty";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { NuidSearchFieldsConfig } from "./nuid-search-fields-config";
import { Title } from "./title";
import { ScriptItemsFab } from "./script-items-fab";

type Props = {
    formData?: ScriptFormDataType;
    hospitals: Awaited<ReturnType<IScriptsContext['getHospitals']>>['data'];
};

export function ScriptForm({ 
    formData, 
    hospitals,
}: Props) {
    const { alert } = useAlertModal();
    const { viewOnly, isDefaultUser, } = useAppContext();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { saveScripts, onCancelScriptForm } = useScriptsContext();

    const getDefaultFormValues = useCallback(() => ({
        position: formData?.position || undefined,
        scriptId: formData?.scriptId || undefined,
        type: formData?.type || scriptTypes[0].value,
        title: formData?.title || '',
        printTitle: formData?.printTitle || '',
        description: formData?.description || '',
        hospitalId: formData?.hospitalId || null,
        exportable: isEmpty(formData?.exportable) ? true : formData?.exportable,
        nuidSearchEnabled: isEmpty(formData?.nuidSearchEnabled) ? false : formData?.nuidSearchEnabled,
        nuidSearchFields: (formData?.nuidSearchFields || []),
    } satisfies ScriptFormDataType), [formData]);

    const {
        formState: { dirtyFields, },
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultFormValues(),
    });

    const type = watch('type');
    const hospitalId = watch('hospitalId');
    const exportable = watch('exportable');
    const nuidSearchFields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    const onSubmit = handleSubmit(async data => {
        setLoading(true);

        const res = await saveScripts({ data: [data], broadcastAction: true, });

        if (res.errors?.length) {
            alert({
                title: 'Error',
                message: res.errors.join(', '),
                variant: 'error',
            });
        } else {
            router.refresh();
            alert({
                title: 'Success',
                message: 'Scripts saved successfully!',
                variant: 'success',
                onClose: () => router.push('/'),
            });
        }

        setLoading(false);
    });

    const disabled = useMemo(() => viewOnly || isDefaultUser, [isDefaultUser]);

    return (
        <>
            {loading && <Loader overlay />}

            <ScriptItemsFab disabled={disabled} />

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

                                let fields = formData?.nuidSearchFields?.length ? formData.nuidSearchFields : (type === 'admission' ? 
                                    defaultNuidSearchFields.admission : defaultNuidSearchFields.other) as unknown as typeof nuidSearchFields;
                                if (!enabled) fields = [];
                                setValue('nuidSearchFields', fields, { shouldDirty: true, });
                            }}
                        />
                        <Label secondary htmlFor="nuidSearchEnabled">Enable NUID Search</Label>
                        {nuidSearchEnabled && (
                            <NuidSearchFieldsConfig 
                                disabled={disabled}
                                fields={nuidSearchFields}
                                onChange={fields => setValue('nuidSearchFields', fields!, { shouldDirty: true, })}
                            />
                        )}
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
