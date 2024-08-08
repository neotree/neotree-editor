import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { IScriptsContext, useScriptsContext } from "@/contexts/scripts";
import { useAlertModal } from "@/hooks/use-alert-modal";

type DraftType = Awaited<ReturnType<IScriptsContext['_getDiagnosis']>>['draft']['data'];

export type UseDiagnosisFormParams = {
    scriptId?: string;
    diagnosisId?: string;
    scriptDraftId?: string;
    diagnosisDraftId?: string;
    formData?: DraftType;
    draftVersion: number;
};

export function useDiagnosisForm({
    formData,
    scriptId,
    diagnosisId,
    scriptDraftId,
    diagnosisDraftId,
    draftVersion,
}: UseDiagnosisFormParams) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const { _createDiagnosesDrafts, _updateDiagnosesDrafts } = useScriptsContext();
    const { alert } = useAlertModal();

    const getDefaultValues = useCallback(() => {
        return {
            version: formData?.version || draftVersion || 1,
            scriptId: formData?.scriptId || scriptId!,
            diagnosisId: diagnosisId || formData?.diagnosisId || uuidv4(),
            name: formData?.name || '',
            description: formData?.description || '',
            position: formData?.position || 1,
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
        } satisfies DraftType;
    }, [formData, draftVersion, diagnosisId, scriptId]);

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
                diagnosisDraftId,
                scriptDraftId,
                severityOrder: data.severityOrder ? Number(data.severityOrder) : null,
            };

            if (!payloadData.scriptDraftId && !payloadData.scriptId) {
                alert({
                    title: 'Error',
                    message: 'Diagnosis is missing script reference!',
                    buttonLabel: 'Ok',
                });
                throw new Error('Diagnosis is missing script reference!');
            }

            if (diagnosisDraftId) {
                const res = await _updateDiagnosesDrafts([{
                    diagnosisDraftId,
                    data: payloadData,
                }]);
                res.forEach(({ error }) => error && errors.push(error));
            } else {
                payloadData.diagnosisDraftId = diagnosisDraftId;
                const res = await _createDiagnosesDrafts([{
                    position: data.position,
                    diagnosisDraftId: data.diagnosisId,
                    scriptDraftId,
                    scriptId,
                    diagnosisId,
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
                    message: 'Diagnosis draft was saved successfully!',
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
