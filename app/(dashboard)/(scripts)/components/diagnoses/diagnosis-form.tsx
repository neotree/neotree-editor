'use client';

import { useCallback, useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/loader";
import { IScriptsContext } from "@/contexts/scripts";
import { useAppContext } from "@/contexts/app";
import { cn } from "@/lib/utils";
import { nuidSearchOptions } from "@/constants/fields";
import { WHY_DIAGNOSIS_OPTION_DISABLED } from "@/constants/copy";
import { useDiagnosisForm } from "@/hooks/scripts/use-diagnosis-form";
import { Title } from "../title";
import { SocketEventsListener } from "../socket-events-listener";
import { ImageField } from "../image-field";
import { Symptoms } from "./symptoms";
import { Separator } from "@/components/ui/separator";

type DraftType = Awaited<ReturnType<IScriptsContext['_getDiagnosis']>>['draft']['data'];

type Props = {
    scriptId?: string;
    scriptDraftId?: string;
    diagnosisId?: string;
    diagnosisDraftId?: string;
    formData?: DraftType;
    hideActions?: boolean;
    draftVersion: number;
};

export function DiagnosisForm({
    formData,
    scriptId,
    scriptDraftId,
    diagnosisId,
    diagnosisDraftId,
    draftVersion,
}: Props) {
    const router = useRouter();

    const { viewOnly } = useAppContext();

    const form = useDiagnosisForm({
        formData,
        scriptId,
        diagnosisId,
        scriptDraftId,
        diagnosisDraftId,
        draftVersion,
    });

    const {
        formIsDirty,
        saving,
        register,
        watch,
        setValue,
        save,
        getDefaultValues,
    } = form;

    const name = watch('name');
    const key = watch('key');
    const image1 = watch('image1');
    const image2 = watch('image2');
    const image3 = watch('image3');

    const scriptPageHref = useMemo(() => `/script/${scriptId || scriptDraftId}`, [scriptDraftId, scriptId]);

    const goToScriptPage = useCallback(() => { router.push(scriptPageHref); }, [router, scriptPageHref]);

    const disabled = useMemo(() => saving || viewOnly, [saving, viewOnly]);

    return (
        <>
            {saving && <Loader overlay />}

            <SocketEventsListener 
                onDiscardDrafts={() => !diagnosisId ? router.push(`/script/${scriptId}`) : router.refresh()}
                onPublishData={() => router.refresh()}
            />

            <div className="flex flex-col gap-y-5 [&>*]:px-4">
                <div>
                    <Label htmlFor="name" error={!disabled && !name}>Name *</Label>
                    <Input 
                        {...register('name', { disabled, required: true, })}
                        name="name"
                        noRing={false}
                        error={!disabled && !name}
                    />
                </div>

                <div className="flex gap-x-2">
                    <div>
                        <Label htmlFor="severityOrder">Severity order</Label>
                        <Input 
                            {...register('severityOrder', { disabled, })}
                            name="severityOrder"
                            noRing={false}
                            type="number"
                        />
                    </div>

                    <div className="flex-1">
                        <Label htmlFor="key" error={!disabled && !key}>Key *</Label>
                        <Input 
                            {...register('key', { disabled, required: true, })}
                            name="key"
                            noRing={false}
                            error={!disabled && !key}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input 
                        {...register('description', { disabled, })}
                        name="description"
                        noRing={false}
                    />
                </div>

                <div>
                    <Label htmlFor="expression">Diagnosis expression (e.g. $Temp &gt; 37 or $Gestation &lt; 20)</Label>
                    <Input 
                        {...register('expression', { disabled, })}
                        name="expression"
                        noRing={false}
                    />
                </div>

                <div>
                    <Label htmlFor="expressionMeaning">Diagnosis expression (e.g. Temperature greater than 37 or Gestation period less than 20 weeks)</Label>
                    <Input 
                        {...register('expressionMeaning', { disabled, })}
                        name="expressionMeaning"
                        noRing={false}
                    />
                </div>

                {[
                    [
                        'text1',
                        image1,
                    ],
                    [
                        'text2',
                        image2,
                    ],
                    [
                        'text3',
                        image3,
                    ],
                ].map(([text, imageValue], i) => {
                    const image = `image${i + 1}` as Parameters<typeof register>[0];
                    
                    return (
                        <Fragment key={`imageTextFields.${i}`}>
                            <div className="flex gap-x-4">
                                <div className="flex-1">
                                    <Label htmlFor={`imageTextFields.${i}.text`}>Text {i+1}</Label>
                                    <Textarea 
                                        {...register(text as Parameters<typeof register>[0], { disabled })}
                                        name={`text${i}`}
                                        noRing={false}
                                        rows={5}
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
            </div>

            <div className="flex items-center justify-end gap-x-2 py-6 px-4">
                <span className={cn('text-danger text-xs', disabled && 'hidden')}>* Required</span>

                <div className="flex-1" />

                <Button
                    variant="ghost"
                    onClick={() => goToScriptPage()}
                >Cancel</Button>

                <Button 
                    disabled={!formIsDirty || disabled}
                    onClick={() => save()}
                >
                    Save Draft
                </Button>
            </div>

            <Separator className="my-20" />

            <div>
                <Symptoms 
                    disabled={disabled}
                    form={form}
                />
            </div>
        </>
    );
}
