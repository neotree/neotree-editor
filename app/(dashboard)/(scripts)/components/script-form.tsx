'use client';

import { useCallback, useMemo, useState, useEffect } from "react";
import { v4 } from "uuid";
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
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Loader } from "@/components/loader";
import { useScriptsContext, IScriptsContext } from "@/contexts/scripts";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultNuidSearchFields } from "@/constants/fields";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/contexts/app";
import { scriptTypes } from "@/constants";
import { isEmpty } from "@/lib/isEmpty";
import { NuidSearchFieldsConfig } from "./nuid-search-fields-config";
import { Title } from "./title";
import { SocketEventsListener } from "./socket-events-listener";

type Props = {
    scriptId?: string;
    scriptDraftId?: string;
    formData?: Awaited<ReturnType<IScriptsContext['_getScript']>>['draft']['data'];
    hideActions?: boolean;
    draftVersion: number;
};

export function ScriptForm({ 
    scriptId: updateScriptId, 
    scriptDraftId: updateScriptDraftId,
    formData,
    hideActions,
    draftVersion,
}: Props) {
    const newScriptId = useMemo(() => v4(), []);

    const { viewOnly } = useAppContext();

    const {  
        hospitals,
        _getScript: getScript, 
        _updateDrafts: updateDrafts,
        _createDrafts: createDrafts,
    } = useScriptsContext();

    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();
    const router = useRouter();

    const [submitting, setSubmitting] = useState(false);

    const getDefaultFormValues = useCallback(() => ({
        ...formData,
        scriptDraftId: updateScriptDraftId || newScriptId,
        scriptId: updateScriptId || formData?.scriptId || newScriptId,
        version: formData?.version || draftVersion || 1,
        type: formData?.type || scriptTypes[0].value,
        position: formData?.position || 1,
        title: formData?.title || '',
        printTitle: formData?.printTitle || '',
        description: formData?.description || '',
        hospitalId: formData?.hospitalId || null,
        exportable: isEmpty(formData?.exportable) ? true : formData?.exportable,
        nuidSearchEnabled: isEmpty(formData?.nuidSearchEnabled) ? false : formData?.nuidSearchEnabled,
        nuidSearchFields: (formData?.nuidSearchFields || []) as Awaited<ReturnType<typeof getScript>>['nuidSearchFields'],
    }), [formData, draftVersion, newScriptId, updateScriptDraftId, updateScriptId]);

    const {
        formState: { dirtyFields, },
        watch,
        setValue,
        register,
        handleSubmit,
        reset: resetForm,
    } = useForm({
        defaultValues: getDefaultFormValues(),
    });

    const type = watch('type');
    const hospitalId = watch('hospitalId');
    const exportable = watch('exportable');
    const nuidSearchFields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    useEffect(() => {
        resetForm(getDefaultFormValues());
    }, [formData, resetForm, getDefaultFormValues]);

    const onSave = handleSubmit(({ scriptDraftId, ...data }) => {
        (async () => {
            try {
                setSubmitting(true);

                let error: string | undefined = undefined;
    
                if (updateScriptDraftId) {
                    const res = await updateDrafts([{ scriptDraftId, data }]);
                    error = res[0]?.error;
                    if (!error) router.refresh();
                } else {
                    const res = await createDrafts([{ 
                        scriptDraftId: data.scriptId, 
                        scriptId: updateScriptId, 
                        position: data.position,
                        data, 
                    }]);
                    error = res?.error;
                }

                if (error) throw new Error(error);
    
                alert({
                    variant: 'success',
                    message: 'Script draft was saved successfully!',
                    onClose: () => router.push('/'),
                });
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Failed to save script: ' + e.message,
                    variant: 'error',
                });
            } finally {
                setSubmitting(false);
            }
        })();
    });

    const onCancel = useCallback((cb?: () => void) => {
        const exit = () => {
            router.push('/');
        };

        if (!formIsDirty) {
            exit();
        } else {
            confirm(exit, {
                danger: true,
                title: 'Discard changes',
                message: 'Are you sure you want to exit editor? Your unsaved changes will be lost',
                negativeLabel: 'Cancel',
                positiveLabel: 'Exit',
            });
        }
    }, [confirm, router, formIsDirty]);
    
    const disabled = useMemo(() => submitting || viewOnly, [submitting, viewOnly]);

    useEffect(() => {
        const unloadCallback = (event: BeforeUnloadEvent) => {
            if (formIsDirty) {
                event.preventDefault();
                event.returnValue = '';
                return '';
            }
        };
        window.addEventListener('beforeunload', unloadCallback);
        return () => window.removeEventListener('beforeunload', unloadCallback);
    }, [formIsDirty, onCancel]);

    return (
        <>
            {submitting && <Loader overlay />}

            <SocketEventsListener 
                onDiscardDrafts={() => router.refresh()}
                onPublishData={() => router.refresh()}
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
                                onChange={fields => setValue('nuidSearchFields', fields, { shouldDirty: true, })}
                            />
                        )}
                    </div>
                </>

                <div className={cn('flex gap-x-2', hideActions && 'hidden')}>
                    <div className="ml-auto" />

                    <Button
                        variant="ghost"
                        onClick={() => onCancel()}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={onSave}
                        disabled={!formIsDirty}
                    >
                        Save draft
                    </Button>
                </div>
            </div>
        </>
    );
}
