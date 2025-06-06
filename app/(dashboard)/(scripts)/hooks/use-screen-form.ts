import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { ScreenFormDataType, useScriptsContext } from "@/contexts/scripts";
import { isEmpty } from "@/lib/isEmpty";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { defaultPreferences } from "@/constants";

export type UseScreenFormParams = {
    scriptId: string;
    formData?: ScreenFormDataType;
};

export function useScreenForm({
    formData,
    scriptId,
}: UseScreenFormParams) {
    const router = useRouter();

    const mounted = useRef(false);
    const [saving, setSaving] = useState(false);

    const { saveScreens } = useScriptsContext();
    const { alert } = useAlertModal();
    const { viewOnly } = useAppContext();

    const scriptPageHref = useMemo(() => `/script/${scriptId}?section=screens`, [scriptId]);

    const getDefaultValues = useCallback(() => {
        return {
            version: formData?.version || 1,
            scriptId: formData?.scriptId || scriptId,
            screenId: formData?.screenId || uuidv4(),
            type: (formData?.type || '') as ScreenFormDataType['type'],
            sectionTitle: formData?.sectionTitle || '',
            previewTitle: formData?.previewTitle || '',
            previewPrintTitle: formData?.previewPrintTitle || '',
            condition: formData?.condition || '',
            skipToCondition: formData?.skipToCondition || '',
            skipToScreenId: formData?.skipToScreenId || '',
            epicId: formData?.epicId || '',
            storyId: formData?.storyId || '',
            refId: formData?.refId || '',
            refKey: formData?.refKey || '',
            step: formData?.step || '',
            actionText: formData?.actionText || '',
            contentText: formData?.contentText || '',
            contentTextImage: formData?.contentTextImage || null,
            title: formData?.title || '',
            title1: formData?.title1 || '',
            title2: formData?.title2 || '',
            title3: formData?.title3 || '',
            title4: formData?.title4 || '',
            text1: formData?.text1 || '',
            text2: formData?.text2 || '',
            text3: formData?.text3 || '',
            image1: formData?.image1 || null,
            image2: formData?.image2 || null,
            image3: formData?.image3 || null,
            instructions: formData?.instructions || '',
            instructions2: formData?.instructions2 || '',
            instructions3: formData?.instructions3 || '',
            instructions4: formData?.instructions4 || '',
            hcwDiagnosesInstructions: formData?.hcwDiagnosesInstructions || '',
            suggestedDiagnosesInstructions: formData?.suggestedDiagnosesInstructions || '',
            notes: formData?.notes || '',
            dataType: formData?.dataType || '',
            key: formData?.key || '',
            label: formData?.label || '',
            negativeLabel: formData?.negativeLabel || '',
            positiveLabel: formData?.positiveLabel || '',
            timerValue: (formData?.timerValue || '') as ScreenFormDataType['timerValue'],
            multiplier: (formData?.multiplier || '') as ScreenFormDataType['multiplier'],
            minValue: (formData?.minValue || '') as ScreenFormDataType['minValue'],
            maxValue: (formData?.maxValue || '') as ScreenFormDataType['maxValue'],
            exportable: isEmpty(formData?.exportable) ? true : formData?.exportable,
            skippable: isEmpty(formData?.skippable) ? false : formData?.skippable,
            confidential: isEmpty(formData?.confidential) ? false : formData?.confidential,
            printable: (isEmpty(formData?.printable) ? null : formData?.printable!) as boolean,
            prePopulate: formData?.prePopulate || [],
            fields: formData?.fields || [],
            items: formData?.items || [],
            drugs: formData?.drugs || [],
            feeds: formData?.feeds || [],
            fluids: formData?.fluids || [],
            reasons: formData?.reasons || [],
            preferences: formData?.preferences || defaultPreferences,
            repeatable:  (isEmpty(formData?.repeatable) ? null : formData?.repeatable!) as boolean,
            collectionName:  formData?.collectionName || '',
            collectionLabel:  formData?.collectionLabel || '',
        } satisfies ScreenFormDataType;
    }, [formData, scriptId]);

    const form = useForm({
        defaultValues: getDefaultValues(),
    });

    useEffect(() => {
        if (mounted.current) {
            form.reset(getDefaultValues());
        } else {
            mounted.current = true;
        }
    }, [formData?.drugs, formData?.feeds, formData?.fluids, form.reset, getDefaultValues]);

    const {
        formState: { dirtyFields, },
        handleSubmit,
    } = form;

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    const save = handleSubmit(async (data) => {
        try {
            setSaving(true);

            const payloadData = {
                ...data,
                timerValue: data.timerValue ? Number(data.timerValue) : null,
                multiplier: data.multiplier ? Number(data.multiplier) : null,
                minValue: data.minValue ? Number(data.minValue) : null,
                maxValue: data.maxValue ? Number(data.maxValue) : null,
            };

            if (!payloadData.scriptId) throw new Error('Screen is missing script reference!');

            // const res = await saveScreens({ data: [payloadData], broadcastAction: true, });

            // TODO: Replace this with server action
            const response = await axios.post('/api/screens/save', { data: [payloadData], broadcastAction: true, });
            const res = response.data as Awaited<ReturnType<typeof saveScreens>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            router.refresh();
            alert({
                variant: 'success',
                message: 'Screen draft was saved successfully!',
                onClose: () => router.push(scriptPageHref),
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                variant: 'error',
                message: 'Failed to save draft: '+ e.message,
            });
        } finally {
            setSaving(false);
        }
    });

    const disabled = useMemo(() => saving || viewOnly, [saving, viewOnly]);

    return {
        ...form,
        formIsDirty,
        saving,
        scriptPageHref,
        disabled,
        save,
        getDefaultValues,
    }
}
