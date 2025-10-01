import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { DiagnosisFormDataType, useScriptsContext } from "@/contexts/scripts";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { defaultPreferences } from "@/constants";
import { useIsLocked } from "@/hooks/use-is-locked";
import { ScriptType } from "@/databases/queries/scripts";

export type UseDiagnosisFormParams = {
    scriptId: string;
    script?: ScriptType;
    formData?: DiagnosisFormDataType;
};

export function useDiagnosisForm({
    formData,
    scriptId,
    script,
}: UseDiagnosisFormParams) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const { saveDiagnoses } = useScriptsContext();
    const { alert } = useAlertModal();
    const { viewOnly } = useAppContext();

    const scriptPageHref = useMemo(() => `/script/${scriptId}?section=diagnoses`, [scriptId]);

    const getDefaultValues = useCallback(() => {
        return {
            version: formData?.version || 1,
            scriptId: formData?.scriptId || scriptId!,
            diagnosisId: formData?.diagnosisId || uuidv4(),
            name: formData?.name || '',
            description: formData?.description || '',
            key: formData?.key || '',
            keyId: formData?.keyId || '',
            expression: formData?.expression || '',
            expressionMeaning: formData?.expressionMeaning || '',
            severityOrder: formData?.severityOrder || null,
            symptoms: formData?.symptoms || [],
            text1: formData?.text1 || '',
            text2: formData?.text2 || '',
            text3: formData?.text3 || '',
            image1: formData?.image1 || null,
            image2: formData?.image2 || null,
            image3: formData?.image3 || null,
            preferences: formData?.preferences || defaultPreferences,
        } satisfies DiagnosisFormDataType;
    }, [formData, scriptId]);

    const form = useForm({
        defaultValues: getDefaultValues(),
    });

    const {
        formState: { dirtyFields, },
        handleSubmit,
    } = form;

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    const save = handleSubmit(async (data) => {
        try {
            setSaving(true);

            const errors: string[] = [];

            const payloadData = {
                ...data,
                severityOrder: data.severityOrder ? Number(data.severityOrder) : null,
            };

            if (!payloadData.scriptId) throw new Error('Diagnosis is missing script reference!');

            // const res = await saveDiagnoses({ data: [payloadData], broadcastAction: true, });

            // TODO: Replace this with server action
            const response = await axios.post('/api/diagnoses/save', { data: [payloadData], broadcastAction: true, });
            const res = response.data as Awaited<ReturnType<typeof saveDiagnoses>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            router.refresh();
            alert({
                variant: 'success',
                message: 'Diagnosis draft was saved successfully!',
                onClose: () => router.push(scriptPageHref),
            });
        } catch(e: any) {
            alert({
                variant: 'error',
                message: 'Failed to save draft: '+ e.message,
            });
        } finally {
            setSaving(false);
        }
    });

    const isLocked = useIsLocked({
        isDraft: !!formData?.isDraft,
        userId: formData?.draftCreatedByUserId,
    });

    const scriptLockedByUserId = script?.draftCreatedByUserId || script?.itemsChangedByUserId;
    
    const isScriptLocked = useIsLocked({
        isDraft: !!script?.isDraft || !!script?.hasChangedItems,
        userId: scriptLockedByUserId,
    });

    const disabled = useMemo(() => (
        saving || 
        viewOnly || 
        isLocked ||
        isScriptLocked
    ), [saving, viewOnly, isLocked, isScriptLocked]);

    return {
        ...form,
        formIsDirty,
        saving,
        scriptPageHref,
        disabled,
        isLocked,
        isScriptLocked,
        scriptLockedByUserId,
        save,
        getDefaultValues,
    }
}
