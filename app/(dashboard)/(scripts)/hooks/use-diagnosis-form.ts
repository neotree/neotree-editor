import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { DiagnosisFormDataType, useScriptsContext } from "@/contexts/scripts";
import { useAlertModal } from "@/hooks/use-alert-modal";

export type UseDiagnosisFormParams = {
    scriptId: string;
    formData?: DiagnosisFormDataType;
};

export function useDiagnosisForm({
    formData,
    scriptId,
}: UseDiagnosisFormParams) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const { saveDiagnoses } = useScriptsContext();
    const { alert } = useAlertModal();

    const scriptPageHref = useMemo(() => `/script/${scriptId}`, [scriptId]);

    const getDefaultValues = useCallback(() => {
        return {
            version: formData?.version || 1,
            scriptId: formData?.scriptId || scriptId!,
            diagnosisId: formData?.diagnosisId || uuidv4(),
            name: formData?.name || '',
            description: formData?.description || '',
            key: formData?.key || '',
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

            const res = await saveDiagnoses({ data: [payloadData], broadcastAction: true, });

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

    return {
        ...form,
        formIsDirty,
        saving,
        scriptPageHref,
        save,
        getDefaultValues,
    }
}
