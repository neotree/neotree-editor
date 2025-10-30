"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"

import { useScriptsContext, type ScriptFormDataType, type IScriptsContext } from "@/contexts/scripts"
import { defaultNuidSearchFields } from "@/constants/fields"
import { defaultPreferences, scriptPrintConfig, scriptTypes } from "@/constants"
import { isEmpty } from "@/lib/isEmpty"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { useAppContext } from "@/contexts/app"
import { resetDrugsLibraryState } from "@/hooks/use-drugs-library"
import { useIsLocked } from "@/hooks/use-is-locked"
import { usePendingChanges } from "@/hooks/use-pending-changes"
import { createChangeTracker } from "@/lib/change-tracker"
import { pendingChangesAPI } from "@/lib/indexed-db"

export type UseScriptFormParams = {
  formData?: ScriptFormDataType
  hospitals: Awaited<ReturnType<IScriptsContext["getHospitals"]>>["data"]
}

export function useScriptForm(params: UseScriptFormParams) {
  const { formData } = params

  const { alert } = useAlertModal()
  const { viewOnly, authenticatedUser } = useAppContext()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { saveScripts } = useScriptsContext()

  const isNewScript = !formData?.scriptId

  const { trackChange, clearChanges } = usePendingChanges({
    entityId: formData?.scriptId,
    entityType: "script",
    userId: authenticatedUser?.userId,
    autoTrack: false,
  })

  const changeTrackerRef = useRef(
    formData?.scriptId
      ? createChangeTracker({
          entityId: formData.scriptId,
          entityType: "script",
          userId: authenticatedUser?.userId,
          userName: authenticatedUser?.displayName,
        })
      : null,
  )

  const originalSnapshotRef = useRef<ScriptFormDataType | null>(null)

  useEffect(() => {
    return () => {
      resetDrugsLibraryState()
    }
  }, [])

  useEffect(() => {
    if (changeTrackerRef.current && formData && !originalSnapshotRef.current) {
      console.log("Initializing original snapshot for script:", formData.scriptId)
      originalSnapshotRef.current = formData
      changeTrackerRef.current.setSnapshot(formData)
    }
  }, [formData])

  const getDefaultFormValues = useCallback(() => {
    return {
      position: formData?.position || undefined,
      scriptId: formData?.scriptId || undefined,
      type: (formData?.type || scriptTypes[0].value) as ScriptFormDataType["type"],
      title: formData?.title || "",
      printTitle: formData?.printTitle || "",
      description: formData?.description || "",
      hospitalId: formData?.hospitalId || null,
      exportable: isEmpty(formData?.exportable) ? true : formData?.exportable,
      nuidSearchEnabled: isEmpty(formData?.nuidSearchEnabled) ? false : formData?.nuidSearchEnabled,
      nuidSearchFields: formData?.nuidSearchFields || [],
      preferences: formData?.preferences || defaultPreferences,
      printSections: formData?.printSections || [],
      printConfig: (formData?.printConfig || scriptPrintConfig) satisfies NonNullable<
        NonNullable<typeof formData>["printConfig"]
      >,
      reviewConfigurations: formData?.reviewConfigurations || [],
      reviewable: isEmpty(formData?.reviewable) ? false : formData?.reviewable,
    } satisfies ScriptFormDataType
  }, [formData])

  const form = useForm({
    defaultValues: getDefaultFormValues(),
  })

  const getDefaultNuidSearchFields = useCallback(() => {
    const fields = form.getValues("nuidSearchFields")
    const type = form.getValues("type")
    const enabled = form.getValues("nuidSearchEnabled")
    let _fields = formData?.nuidSearchFields?.length
      ? formData.nuidSearchFields
      : ((type === "admission"
          ? defaultNuidSearchFields.admission
          : defaultNuidSearchFields.other) as unknown as typeof fields)
    if (!enabled) _fields = []
    return _fields
  }, [form, formData?.nuidSearchFields])

  const getDefaultScreenReviewConfigurations = useCallback(() => {
    const fields = form.getValues("reviewConfigurations")
    const enabled = form.getValues("reviewable")
    let _fields = formData?.reviewConfigurations as unknown as typeof fields
    if (!enabled) _fields = []
    return _fields
  }, [form, formData?.reviewConfigurations])

  const {
    handleSubmit,
    formState: { dirtyFields },
    watch,
  } = form

  const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields])

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true)

    const generateScriptId = () =>
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : uuidv4()

    const scriptId = data.scriptId ?? (isNewScript ? generateScriptId() : undefined)
    const payload: typeof data = {
      ...data,
      scriptId,
    }

    if (isNewScript) {
      // For new scripts, we'll track the creation after we get the scriptId from the server
      console.log("New script will be tracked after creation")
    } else if (changeTrackerRef.current && originalSnapshotRef.current) {
      console.log("Tracking changes on save draft")
      await changeTrackerRef.current.trackChanges(data, "Draft saved")
    }

    // const res = await saveScripts({ data: [data], broadcastAction: true, });

    // TODO: Replace this with server action
    const response = await axios.post("/api/scripts/save", { data: [payload], broadcastAction: true })
    const res = response.data as Awaited<ReturnType<typeof saveScripts>>

    if (res.errors?.length) {
      alert({
        title: "Error",
        message: res.errors.join(", "),
        variant: "error",
      })
    } else {
      if (isNewScript && scriptId) {
        const newScriptId = scriptId
        console.log("Tracking new script creation:", newScriptId)

        // Track the creation of the new script
        await pendingChangesAPI.addChange({
          entityType: "script",
          entityId: newScriptId,
          action: "create",
          fieldPath: "script",
          fieldName: "New Script",
          oldValue: null,
          newValue: payload.title || "Untitled Script",
        })
      }

      router.refresh()
      alert({
        title: "Success",
        message: "Draft saved successfully!",
        variant: "success",
      })
    }

    setLoading(false)
  })

  const lockedByUserId = params.formData?.draftCreatedByUserId || params.formData?.itemsChangedByUserId

  const isLocked = useIsLocked({
    isDraft: !!params.formData?.isDraft || !!params.formData?.hasChangedItems,
    userId: lockedByUserId,
  })

  const disabled = useMemo(() => viewOnly || isLocked, [viewOnly, isLocked])

  return {
    ...params,
    ...form,
    formIsDirty,
    loading,
    disabled,
    isLocked,
    lockedByUserId: !isLocked ? null : lockedByUserId,
    setLoading,
    getDefaultFormValues,
    getDefaultNuidSearchFields,
    getDefaultScreenReviewConfigurations,
    onSubmit,
  }
}
