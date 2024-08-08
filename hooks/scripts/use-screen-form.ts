import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { IScriptsContext, useScriptsContext } from "@/contexts/scripts";
import { isEmpty } from "@/lib/isEmpty";
import { useAlertModal } from "@/hooks/use-alert-modal";

type DraftType = Awaited<ReturnType<IScriptsContext['_getScreen']>>['draft']['data'];

export type UseScreenFormParams = {
    scriptId?: string;
    screenId?: string;
    scriptDraftId?: string;
    screenDraftId?: string;
    formData?: DraftType;
    draftVersion: number;
};

export function useScreenForm({
    formData,
    scriptId,
    screenId,
    scriptDraftId,
    screenDraftId,
    draftVersion,
}: UseScreenFormParams) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const { _createScreensDrafts, _updateScreensDrafts } = useScriptsContext();
    const { alert } = useAlertModal();

    const getDefaultValues = useCallback(() => {
        return {
            version: formData?.version || draftVersion || 1,
            scriptId: formData?.scriptId || scriptId!,
            screenId: screenId || formData?.screenId || uuidv4(),
            type: (formData?.type || '') as DraftType['type'],
            position: formData?.position || 1,
            sectionTitle: formData?.sectionTitle || '',
            previewTitle: formData?.previewTitle || '',
            previewPrintTitle: formData?.previewPrintTitle || '',
            condition: formData?.condition || '',
            epicId: formData?.epicId || '',
            storyId: formData?.storyId || '',
            refId: formData?.refId || '',
            refKey: formData?.refKey || '',
            step: formData?.step || '',
            actionText: formData?.actionText || '',
            contentText: formData?.contentText || '',
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
            timerValue: (formData?.timerValue || '') as DraftType['timerValue'],
            multiplier: (formData?.multiplier || '') as DraftType['multiplier'],
            minValue: (formData?.minValue || '') as DraftType['minValue'],
            maxValue: (formData?.maxValue || '') as DraftType['maxValue'],
            exportable: isEmpty(formData?.exportable) ? true : formData?.exportable,
            skippable: isEmpty(formData?.skippable) ? false : formData?.skippable,
            confidential: isEmpty(formData?.confidential) ? false : formData?.confidential,
            printable: isEmpty(formData?.printable) ? true : formData?.printable,
            prePopulate: formData?.prePopulate || [],
            fields: formData?.fields || [],
            items: formData?.items || [],
        } satisfies DraftType;
    }, [formData, draftVersion, screenId, scriptId]);

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
                screenDraftId,
                scriptDraftId,
                timerValue: data.timerValue ? Number(data.timerValue) : null,
                multiplier: data.multiplier ? Number(data.multiplier) : null,
                minValue: data.minValue ? Number(data.minValue) : null,
                maxValue: data.maxValue ? Number(data.maxValue) : null,
            };

            if (!payloadData.scriptDraftId && !payloadData.scriptId) {
                alert({
                    title: 'Error',
                    message: 'Screen is missing script reference!',
                    buttonLabel: 'Ok',
                });
                throw new Error('Screen is missing script reference!');
            }

            if (screenDraftId) {
                const res = await _updateScreensDrafts([{
                    screenDraftId,
                    data: payloadData,
                }]);
                res.forEach(({ error }) => error && errors.push(error));
            } else {
                payloadData.screenDraftId = screenDraftId;
                const res = await _createScreensDrafts([{
                    type: data.type,
                    position: data.position,
                    screenDraftId: data.screenId,
                    scriptDraftId,
                    scriptId,
                    screenId,
                    data: payloadData,
                }]);
                if (res.error) errors.push(res.error);
            }

            if (errors.length) {
                alert({
                    title: 'Error',
                    message: errors.join(', '),
                    buttonLabel: 'Ok',
                });
                throw new Error(errors.join(', '));
            } else {
                router.refresh();
                alert({
                    variant: 'success',
                    message: 'Screen draft was saved successfully!',
                    onClose: () => router.push(`/script/${scriptId || scriptDraftId}`),
                });
            }
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
        save,
        getDefaultValues,
    }
}
