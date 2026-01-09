"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"

import { type ScreenFormDataType, useScriptsContext } from "@/contexts/scripts"
import { isEmpty } from "@/lib/isEmpty"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useAppContext } from "@/contexts/app"
import { defaultPreferences } from "@/constants"
import { useIsLocked } from "@/hooks/use-is-locked"
import type { ScriptType } from "@/databases/queries/scripts"
import { createChangeTracker } from "@/lib/change-tracker"
import type { ChangeTracker } from "@/lib/change-tracker"
import { pendingChangesAPI } from "@/lib/indexed-db"

export type UseScreenFormParams = {
  scriptId: string
  script?: ScriptType
  formData?: ScreenFormDataType
}

export function useScreenForm({ formData, scriptId, script }: UseScreenFormParams) {
  const router = useRouter()

  const mounted = useRef(false)
  const [saving, setSaving] = useState(false)

  const { saveScreens } = useScriptsContext()
  const { alert } = useAlertModal()
  const { viewOnly, authenticatedUser } = useAppContext()

  const scriptPageHref = useMemo(() => `/script/${scriptId}?section=screens`, [scriptId])
  const isNewScreen = !formData?.screenId
  const generateScreenId = useCallback(
    () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : uuidv4()),
    [],
  )

  const changeTrackerRef = useRef<ChangeTracker | null>(
    formData?.screenId
      ? createChangeTracker({
          entityId: formData.screenId,
          entityType: "screen",
          userId: authenticatedUser?.userId,
          userName: authenticatedUser?.displayName,
          entityTitle: formData?.title || formData?.sectionTitle || formData?.label || "Screen",
          resolveEntityTitle: (data) => data?.title || data?.sectionTitle || data?.label || data?.previewTitle,
        })
      : null,
  )

  const originalSnapshotRef = useRef<ScreenFormDataType | null>(null)

  const getDefaultValues = useCallback(() => {
    return {
      version: formData?.version || 1,
      scriptId: formData?.scriptId || scriptId,
      screenId: formData?.screenId || generateScreenId(),
      type: (formData?.type || "") as ScreenFormDataType["type"],
      sectionTitle: formData?.sectionTitle || "",
      previewTitle: formData?.previewTitle || "",
      previewPrintTitle: formData?.previewPrintTitle || "",
      condition: formData?.condition || "",
      skipToCondition: formData?.skipToCondition || "",
      skipToScreenId: formData?.skipToScreenId || "",
      epicId: formData?.epicId || "",
      storyId: formData?.storyId || "",
      refId: formData?.refId || "",
      refKey: formData?.refKey || "",
      refIdDataKey: formData?.refIdDataKey || "",
      refKeyDataKey: formData?.refKeyDataKey || "",
      step: formData?.step || "",
      actionText: formData?.actionText || "",
      contentText: formData?.contentText || "",
      contentTextImage: formData?.contentTextImage || null,
      title: formData?.title || "",
      title1: formData?.title1 || "",
      title2: formData?.title2 || "",
      title3: formData?.title3 || "",
      title4: formData?.title4 || "",
      text1: formData?.text1 || "",
      text2: formData?.text2 || "",
      text3: formData?.text3 || "",
      image1: formData?.image1 || null,
      image2: formData?.image2 || null,
      image3: formData?.image3 || null,
      instructions: formData?.instructions || "",
      instructions2: formData?.instructions2 || "",
      instructions3: formData?.instructions3 || "",
      instructions4: formData?.instructions4 || "",
      hcwDiagnosesInstructions: formData?.hcwDiagnosesInstructions || "",
      suggestedDiagnosesInstructions: formData?.suggestedDiagnosesInstructions || "",
      notes: formData?.notes || "",
      dataType: formData?.dataType || "",
      key: formData?.key || "",
      keyId: formData?.keyId || "",
      label: formData?.label || "",
      negativeLabel: formData?.negativeLabel || "",
      positiveLabel: formData?.positiveLabel || "",
      timerValue: (formData?.timerValue || "") as ScreenFormDataType["timerValue"],
      multiplier: (formData?.multiplier || "") as ScreenFormDataType["multiplier"],
      minValue: (formData?.minValue || "") as ScreenFormDataType["minValue"],
      maxValue: (formData?.maxValue || "") as ScreenFormDataType["maxValue"],
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
      repeatable: (isEmpty(formData?.repeatable) ? null : formData?.repeatable!) as boolean,
      collectionName: formData?.collectionName || "",
      collectionLabel: formData?.collectionLabel || "",
      listStyle: formData?.listStyle || "none",
    } satisfies ScreenFormDataType
  }, [formData, scriptId, generateScreenId])

  const form = useForm({
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    if (changeTrackerRef.current && formData && !originalSnapshotRef.current) {

      originalSnapshotRef.current = formData
      changeTrackerRef.current.setSnapshot(formData)
    }
  }, [formData])

  useEffect(() => {
    if (mounted.current) {
      // form.reset(getDefaultValues())
    } else {
      mounted.current = true
    }
  }, [formData?.drugs, formData?.feeds, formData?.fluids, form.reset, getDefaultValues])

  const {
    formState: { dirtyFields },
    handleSubmit,
  } = form

  const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields])

  const save = handleSubmit(async (data) => {
    try {
      setSaving(true)

      const screenId = data.screenId || generateScreenId()
      const payloadData = {
        ...data,
        screenId,
        timerValue: data.timerValue ? Number(data.timerValue) : null,
        multiplier: data.multiplier ? Number(data.multiplier) : null,
        minValue: data.minValue ? Number(data.minValue) : null,
        maxValue: data.maxValue ? Number(data.maxValue) : null,
      }

      if (!payloadData.scriptId) throw new Error("Screen is missing script reference!")

      if (isNewScreen) {
        
      } else if (changeTrackerRef.current && originalSnapshotRef.current) {
        
        await changeTrackerRef.current.trackChanges(payloadData, "Screen draft saved")
      }

      // const res = await saveScreens({ data: [payloadData], broadcastAction: true, });

      // TODO: Replace this with server action
      const response = await axios.post("/api/screens/save", { data: [payloadData], broadcastAction: true })
      const res = response.data as Awaited<ReturnType<typeof saveScreens>>

      if (res.errors?.length) throw new Error(res.errors.join(", "))

      if (isNewScreen) {
       
        await pendingChangesAPI.addChange({
          entityType: "screen",
          entityId: screenId,
          entityTitle: payloadData.title || payloadData.sectionTitle || payloadData.label || "Untitled Screen",
          action: "create",
          fieldPath: "screen",
          fieldName: "New Screen",
          oldValue: null,
          newValue: payloadData.title || payloadData.sectionTitle || payloadData.label || "Untitled Screen",
          userId: authenticatedUser?.userId,
          userName: authenticatedUser?.displayName,
          fullSnapshot: payloadData,
        })
      }

      router.refresh()
      alert({
        variant: "success",
        message: "Screen draft was saved successfully!",
        onClose: () => router.push(scriptPageHref),
      })
    } catch (e: any) {
      alert({
        title: "Error",
        variant: "error",
        message: "Failed to save draft: " + e.message,
      })
    } finally {
      setSaving(false)
    }
  })

  const isLocked = useIsLocked({
    isDraft: !!formData?.isDraft,
    userId: formData?.draftCreatedByUserId,
  })

  const scriptLockedByUserId = script?.draftCreatedByUserId || script?.itemsChangedByUserId

  const isScriptLocked = useIsLocked({
    isDraft: !!script?.isDraft || !!script?.hasChangedItems,
    userId: scriptLockedByUserId,
  })

  const disabled = useMemo(
    () => saving || viewOnly || isLocked || isScriptLocked,
    [saving, viewOnly, isLocked, isScriptLocked],
  )

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
    changeTracker: changeTrackerRef.current,
  }
}
