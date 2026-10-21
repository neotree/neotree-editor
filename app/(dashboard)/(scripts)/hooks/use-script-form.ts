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
import { useContentViewOnly } from "@/hooks/use-content-lock"
import { resetDrugsLibraryState } from "@/hooks/use-drugs-library"
import { useIsLocked } from "@/hooks/use-is-locked"

export type UseScriptFormParams = {
  formData?: ScriptFormDataType
  hospitals: Awaited<ReturnType<IScriptsContext["getHospitals"]>>["data"]
}

export function useScriptForm(params: UseScriptFormParams) {
  const { formData } = params

  const { alert } = useAlertModal()
  const viewOnly = useContentViewOnly("scripts", formData?.scriptId || null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { saveScripts } = useScriptsContext()

  const isNewScript = !formData?.scriptId

  useEffect(() => {
    return () => {
      resetDrugsLibraryState()
    }
  }, [])

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
      eligibilityCriteria: formData?.eligibilityCriteria || null,
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

  // dirtyFields is updated in place: a useMemo on it never sees a later edit. The form re-renders

  // whenever it changes, so read it on every render.

  const formIsDirty = Object.keys(dirtyFields).length > 0

  // The revision of the stored script the form's values came from; sent back on save so the server can
  // refuse to overwrite changes made in the meantime (an import, another user).
  const loadedRevision = useRef(formData?.revision)

  // When the stored script changes and there are no unsaved edits here, show the new version.
  useEffect(() => {
    if (!formData?.revision || formData.revision === loadedRevision.current) return
    if (formIsDirty) return
    loadedRevision.current = formData.revision
    form.reset(getDefaultFormValues())
  }, [formData?.revision, formIsDirty, form, getDefaultFormValues])

  const saveDraft = useCallback(async (data: ScriptFormDataType) => {
    setLoading(true)

    const generateScriptId = () =>
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : uuidv4()

    const scriptId = data.scriptId ?? (isNewScript ? generateScriptId() : undefined)
    const payload: typeof data & { baseRevision?: string } = {
      ...data,
      baseRevision: loadedRevision.current,
      scriptId,
    }
    if (scriptId && data.scriptId !== scriptId) {
      form.setValue("scriptId", scriptId, { shouldDirty: false })
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
      // Saved: the current values are the new baseline (no longer "unsaved").
      form.reset(form.getValues())
      router.refresh()
      alert({
        title: "Success",
        message: isNewScript
          ? "Draft saved successfully. You can now add screens, diagnoses, problems, and print sections."
          : "Draft saved successfully!",
        variant: "success",
        onClose: isNewScript && scriptId ? () => router.replace(`/script/${scriptId}`) : undefined,
      })
    }

    setLoading(false)
    return !res.errors?.length
  }, [
    alert,
    form,
    isNewScript,
    router,
  ])

  const onSubmit = handleSubmit(async (data) => {
    await saveDraft(data)
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
    saveDraft,
    onSubmit,
  }
}
