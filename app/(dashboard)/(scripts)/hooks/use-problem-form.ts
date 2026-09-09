import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { ProblemFormDataType, useScriptsContext } from "@/contexts/scripts";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { defaultPreferences } from "@/constants";
import { useIsLocked } from "@/hooks/use-is-locked";
import { ScriptType } from "@/databases/queries/scripts";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { fetchOutcomeReferenceImpact, formatOutcomeImpactMessage } from "@/components/conditional-expression/outcome-impact";

export type UseProblemFormParams = {
    scriptId: string;
    script?: ScriptType;
    screens?: { screenId?: string; type?: string; key?: string; title?: string; position?: number }[];
    formData?: ProblemFormDataType;
};

export function useProblemForm({
    formData,
    scriptId,
    script,
}: UseProblemFormParams) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const { saveProblems, reloadKeys } = useScriptsContext();
    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();
    const { viewOnly } = useAppContext();

    const scriptPageHref = useMemo(() => `/script/${scriptId}?section=diagnoses`, [scriptId]);
    const isNewProblem = !formData?.problemId;
    const generateProblemId = useCallback(
        () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : uuidv4()),
        [],
    );

    const getDefaultValues = useCallback(() => {
        return {
            version: formData?.version || 1,
            scriptId: formData?.scriptId || scriptId!,
            problemId: formData?.problemId || generateProblemId(),
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
        } satisfies ProblemFormDataType;
    }, [formData, scriptId, generateProblemId]);

    const form = useForm({
        defaultValues: getDefaultValues(),
    });

    const {
        formState: { dirtyFields, },
        handleSubmit,
    } = form;

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    const persist = async (data: ProblemFormDataType, rewrittenReferences = 0) => {
        try {
            setSaving(true);

            const problemId = data.problemId || generateProblemId();
            const payloadData = {
                ...data,
                problemId,
                severityOrder: data.severityOrder ? Number(data.severityOrder) : null,
            };

            if (!payloadData.scriptId) throw new Error('Problem is missing script reference!');

            // const res = await saveProblems({ data: [payloadData], broadcastAction: true, });

            // TODO: Replace this with server action
            const response = await axios.post('/api/problems/save', { data: [payloadData], broadcastAction: true, });
            const res = response.data as Awaited<ReturnType<typeof saveProblems>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            await reloadKeys();
            router.refresh();
            alert({
                variant: 'success',
                message: rewrittenReferences
                    ? `Problem draft was saved and ${rewrittenReferences} conditional-expression reference${rewrittenReferences === 1 ? '' : 's'} were updated.`
                    : 'Problem draft was saved successfully!',
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
    };

    const save = handleSubmit(async (data) => {
        const oldKey = `${formData?.key || ''}`.trim();
        const newKey = `${data?.key || ''}`.trim();
        if (formData?.problemId && oldKey && newKey && oldKey !== newKey) {
            try {
                setSaving(true);
                const impact = await fetchOutcomeReferenceImpact({
                    scriptId,
                    collection: "Problems",
                    values: [oldKey],
                    sourceEntityId: formData.problemId,
                });
                if (impact?.count) {
                    setSaving(false);
                    confirm(() => void persist(data, impact.occurrences), {
                        title: "Rename problem key",
                        message: formatOutcomeImpactMessage(impact, "rename"),
                        positiveLabel: "Rename and update references",
                        negativeLabel: "Cancel",
                    });
                    return;
                }
            } catch (e: any) {
                alert({ variant: "error", title: "Could not inspect references", message: e.message });
                return;
            } finally {
                setSaving(false);
            }
        }
        await persist(data);
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
