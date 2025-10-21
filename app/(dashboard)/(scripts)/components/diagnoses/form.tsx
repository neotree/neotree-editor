'use client';

import { useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { PreferencesForm } from "@/components/preferences-form";
import { SelectDataKey } from "@/components/select-data-key";
import { useDiagnosisForm, UseDiagnosisFormParams } from "../../hooks/use-diagnosis-form";
import { ImageField } from "../image-field";
import { Symptoms } from "./symptoms";
import { LockStatus } from "@/components/lock-status";

type Props = UseDiagnosisFormParams;

export function DiagnosisForm(props: Props) {
    const router = useRouter();

    const form = useDiagnosisForm(props);

    const {
        isLocked,
        control,
        saving,
        scriptPageHref,
        disabled,
        isScriptLocked,
        scriptLockedByUserId,
        register,
        watch,
        setValue,
        save,
    } = form;

    const name = watch('name');
    const key = watch('key');
    const image1 = watch('image1');
    const image2 = watch('image2');
    const image3 = watch('image3');
    const preferences = watch('preferences');

    const goToScriptPage = useCallback(() => { router.push(scriptPageHref); }, [router, scriptPageHref]);

    return (
        <>
            {saving && <Loader overlay />}

            <div className="flex flex-col gap-y-5 [&>*]:px-4">
                {(isLocked || isScriptLocked) && (
                    <div>
                        <LockStatus 
                            card
                            isDraft={!!props.formData?.isDraft || isScriptLocked}
                            userId={props.formData?.draftCreatedByUserId || scriptLockedByUserId}
                            dataType="diagnosis"
                        />
                    </div>
                )}

                <div>
                    <Label htmlFor="key" error={!disabled && !key}>Key *</Label>
                    {/* <Input 
                        {...register('key', { disabled, required: true, })}
                        name="key"
                        noRing={false}
                        error={!disabled && !key}
                    /> */}
                    <Controller 
                        control={control}
                        name="key"
                        render={({ field: { value, onChange, }, }) => {
                            return (
                                <SelectDataKey
                                    value={`${value || ''}`}
                                    disabled={false}
                                    onChange={([item]) => {
                                        onChange(item.name);
                                        setValue('name', item?.label, { shouldDirty: true, });
                                        setValue('keyId', item?.uniqueKey, { shouldDirty: true, });
                                    }}
                                />
                            );
                        }}
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
                        <Label htmlFor="name" error={!disabled && !name}>Name *</Label>
                        <Input 
                            {...register('name', { disabled, required: true, })}
                            name="name"
                            noRing={false}
                            error={!disabled && !name}
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
                    <PreferencesForm 
                        id="description"
                        title="Description"
                        disabled={disabled}
                        data={preferences}
                        onSave={data => setValue('preferences', data, { shouldDirty: true, })}
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
                                        name={`text${i+1}`}
                                        noRing={false}
                                        rows={5}
                                    />
                                    <PreferencesForm 
                                        id={text as unknown as string}
                                        title={`Text ${i+1}`}
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
