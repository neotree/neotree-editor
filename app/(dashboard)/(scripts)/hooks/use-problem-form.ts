import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { pendingChangesAPI } from "@/lib/indexed-db";
import { createChangeTracker } from "@/lib/change-tracker";

export type UseProblemFormParams = {
    scriptId: string;
    script?: ScriptType;
    formData?: ProblemFormDataType;
};

export function useProblemForm({
    formData,
    scriptId,
    script,
}: UseProblemFormParams) {
    const router = useRouter();

    const [saving, setSaving] = useState(false);

    const { saveProblems } = useScriptsContext();
    const { alert } = useAlertModal();
    const { viewOnly, authenticatedUser } = useAppContext();

    const scriptPageHref = useMemo(() => `/script/${scriptId}?section=diagnoses`, [scriptId]);
    const isNewProblem = !formData?.problemId;
    const generateProblemId = useCallback(
        () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : uuidv4()),
        [],
    );

    const changeTrackerRef = useRef(
        formData?.problemId
            ? createChangeTracker({
                entityId: formData.problemId,
                entityType: "problem",
                userId: authenticatedUser?.userId,
                userName: authenticatedUser?.displayName,
                entityTitle: formData?.name || formData?.key || "Problem",
                resolveEntityTitle: (data) => data?.name || data?.key || data?.description,
            })
            : null,
    );

    const originalSnapshotRef = useRef<ProblemFormDataType | null>(null);

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

    useEffect(() => {
        if (changeTrackerRef.current && formData && !originalSnapshotRef.current) {
            originalSnapshotRef.current = formData;
            changeTrackerRef.current.setSnapshot(formData);
        }
    }, [formData]);

    const {
        formState: { dirtyFields, },
        handleSubmit,
    } = form;

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    const save = handleSubmit(async (data) => {
        try {
            setSaving(true);

            const errors: string[] = [];

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

            if (isNewProblem) {

                await pendingChangesAPI.addChange({
                    entityType: "problem",
                    entityId: problemId,
                    entityTitle: payloadData.name || payloadData.key || "Untitled Problem",
                    action: "create",
                    fieldPath: "problem",
                    fieldName: "New Problem",
                    oldValue: null,
                    newValue: payloadData.name || "Untitled Problem",
                    userId: authenticatedUser?.userId,
                    userName: authenticatedUser?.displayName,
                    fullSnapshot: payloadData,
                });
            } else if (changeTrackerRef.current && originalSnapshotRef.current) {
           
                await changeTrackerRef.current.trackChanges(payloadData, "Problem draft saved");
            }

            router.refresh();
            alert({
                variant: 'success',
                message: 'Problem draft was saved successfully!',
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
