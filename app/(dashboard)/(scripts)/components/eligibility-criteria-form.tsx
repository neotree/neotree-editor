"use client"

import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { PlusIcon } from "lucide-react"

import type { EligibilityCriteria } from "@/types"
import type { ConditionKey } from "@/lib/conditional-expression"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ReactSelect } from "@/components/react-select"
import { ConditionEditor } from "@/components/conditional-expression"
import { useScriptsContext } from "@/contexts/scripts"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { FieldItems } from "./screens/field-items"

type Props = {
  disabled: boolean
  scriptId?: string
  value?: EligibilityCriteria | null
  onChange: (value: EligibilityCriteria | null) => void | boolean | Promise<void | boolean>
}

type KeyOption = {
  value: string
  label: string
  dataType: string
}

const criteriaTypes: { value: EligibilityCriteria["criteria_type"]; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date and time" },
  { value: "dropdown", label: "Dropdown" },
  { value: "yesno", label: "Yes/No" },
]

const feasibilityPromptKey = "feasibilityprompt"
const alternativeActivationCondition = `$${feasibilityPromptKey}="No"`
const yesNoItems: NonNullable<EligibilityCriteria["items"]> = [
  { itemId: "yes", value: "yes", label: "Yes" },
  { itemId: "no", value: "no", label: "No" },
]

export function EligibilityCriteriaForm({ disabled, scriptId, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { keys, loadKeys, keysLoading } = useScriptsContext()
  const safeKeys = useMemo(() => {
    try {
      return { options: getKeyOptions(keys), error: "" }
    } catch (error: any) {
      return {
        options: [] as KeyOption[],
        error: error?.message || "Script keys could not be loaded for eligibility criteria.",
      }
    }
  }, [keys])

  const hasCriteria = !!value?.criteria_type && !!value?.criteria_label

  useEffect(() => {
    if (open) loadKeys()
  }, [loadKeys, open])

  return (
    <>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        {hasCriteria ? "Update Eligibility Criteria" : "Add Eligibility Criteria"}
      </Button>

      {open && (
        <Form
          value={value || null}
          keyOptions={safeKeys.options}
          keyOptionsError={safeKeys.error}
          keysLoading={keysLoading}
          onClose={() => setOpen(false)}
          onChange={async (nextValue) => {
            const saved = await onChange(nextValue)
            if (saved !== false) setOpen(false)
          }}
        />
      )}
    </>
  )
}

function Form({
  value,
  keyOptions,
  keyOptionsError,
  keysLoading,
  onClose,
  onChange,
}: {
  value: EligibilityCriteria | null
  keyOptions: KeyOption[]
  keyOptionsError: string
  keysLoading: boolean
  onClose: () => void
  onChange: (value: EligibilityCriteria) => void | boolean | Promise<void | boolean>
}) {
  const { alert } = useAlertModal()
  const [conditionHasErrors, setConditionHasErrors] = useState(false)
  const [alternativeConditionHasErrors, setAlternativeConditionHasErrors] = useState(false)
  const [hasAlternative, setHasAlternative] = useState(!!(value?.feasibilityprompt || value?.alternative_criteria_condition))
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EligibilityCriteria>({
    defaultValues: {
      criteria_type: value?.criteria_type || "date",
      criteria_label: value?.criteria_label || "",
      auto_fills: value?.auto_fills || "",
      criteria_condition: value?.criteria_condition || "",
      failure_message: value?.failure_message || "",
      items: value?.items || [],
      min_date: value?.min_date || "",
      max_date: value?.max_date || "",
      min_date_current: value?.min_date_current || false,
      max_date_current: value?.max_date_current || false,
      alternative_activation_prompt: value?.feasibilityprompt?.criteria_label || value?.alternative_activation_prompt || "",
      alternative_activation_condition: alternativeActivationCondition,
      alternative_criteria_type: value?.alternative_criteria_type,
      alternative_criteria_label: value?.alternative_criteria_label || "",
      alternative_auto_fills: value?.alternative_auto_fills || "",
      alternative_criteria_condition: value?.alternative_criteria_condition || "",
      alternative_items: value?.alternative_items || [],
      alternative_min_date: value?.alternative_min_date || "",
      alternative_max_date: value?.alternative_max_date || "",
      alternative_min_date_current: value?.alternative_min_date_current || false,
      alternative_max_date_current: value?.alternative_max_date_current || false,
    },
  })

  const criteriaType = watch("criteria_type")
  const condition = watch("criteria_condition") || ""
  const failureMessage = watch("failure_message") || ""
  const criteriaLabel = watch("criteria_label") || ""
  const autoFills = watch("auto_fills") || ""
  const items = watch("items") || []
  const minDate = watch("min_date") || ""
  const maxDate = watch("max_date") || ""
  const minDateCurrent = watch("min_date_current")
  const maxDateCurrent = watch("max_date_current")
  const alternativeActivationPrompt = watch("alternative_activation_prompt") || ""
  const alternativeCriteriaType = watch("alternative_criteria_type")
  const alternativeCriteriaLabel = watch("alternative_criteria_label") || ""
  const alternativeAutoFills = watch("alternative_auto_fills") || ""
  const alternativeCondition = watch("alternative_criteria_condition") || ""
  const alternativeItems = watch("alternative_items") || []
  const alternativeMinDate = watch("alternative_min_date") || ""
  const alternativeMaxDate = watch("alternative_max_date") || ""
  const alternativeMinDateCurrent = watch("alternative_min_date_current")
  const alternativeMaxDateCurrent = watch("alternative_max_date_current")
  const dateInputType = criteriaType === "datetime" ? "datetime-local" : "date"
  const usesOptions = criteriaType === "dropdown" || criteriaType === "yesno"
  const usesDates = criteriaType === "date" || criteriaType === "datetime"
  const alternativeDateInputType = alternativeCriteriaType === "datetime" ? "datetime-local" : "date"
  const alternativeUsesOptions = alternativeCriteriaType === "dropdown" || alternativeCriteriaType === "yesno"
  const alternativeUsesDates = alternativeCriteriaType === "date" || alternativeCriteriaType === "datetime"
  const currentPayload = useMemo(
    () =>
      normalizeCriteriaPayload(
        {
          criteria_type: criteriaType,
          criteria_label: criteriaLabel,
          auto_fills: autoFills,
          criteria_condition: condition,
          failure_message: failureMessage,
          items,
          min_date: minDate,
          max_date: maxDate,
          min_date_current: !!minDateCurrent,
          max_date_current: !!maxDateCurrent,
          alternative_activation_prompt: hasAlternative ? alternativeActivationPrompt : "",
          alternative_activation_condition: hasAlternative ? alternativeActivationCondition : "",
          alternative_criteria_type: hasAlternative ? alternativeCriteriaType : undefined,
          alternative_criteria_label: hasAlternative ? alternativeCriteriaLabel : "",
          alternative_auto_fills: hasAlternative ? alternativeAutoFills : "",
          alternative_criteria_condition: hasAlternative ? alternativeCondition : "",
          alternative_items: hasAlternative ? alternativeItems : [],
          alternative_min_date: hasAlternative ? alternativeMinDate : "",
          alternative_max_date: hasAlternative ? alternativeMaxDate : "",
          alternative_min_date_current: hasAlternative ? !!alternativeMinDateCurrent : false,
          alternative_max_date_current: hasAlternative ? !!alternativeMaxDateCurrent : false,
        },
        usesOptions,
        usesDates,
        hasAlternative,
        alternativeUsesOptions,
        alternativeUsesDates,
      ),
    [
      alternativeActivationPrompt,
      alternativeAutoFills,
      alternativeCondition,
      alternativeCriteriaLabel,
      alternativeCriteriaType,
      alternativeItems,
      alternativeMaxDate,
      alternativeMaxDateCurrent,
      alternativeMinDate,
      alternativeMinDateCurrent,
      alternativeUsesDates,
      alternativeUsesOptions,
      autoFills,
      condition,
      criteriaLabel,
      criteriaType,
      failureMessage,
      hasAlternative,
      items,
      maxDate,
      maxDateCurrent,
      minDate,
      minDateCurrent,
      usesDates,
      usesOptions,
    ],
  )
  const originalPayload = useMemo(
    () =>
      normalizeCriteriaPayload(
        value,
        isOptionsType(value?.criteria_type),
        isDateType(value?.criteria_type),
        !!(value?.feasibilityprompt || value?.alternative_criteria_condition),
        isOptionsType(value?.alternative_criteria_type),
        isDateType(value?.alternative_criteria_type),
      ),
    [value],
  )
  const hasRequiredFields =
    !!currentPayload.criteria_type &&
    !!currentPayload.criteria_label &&
    !!currentPayload.criteria_condition &&
    !!currentPayload.failure_message
  const hasRequiredAlternativeFields =
    !hasAlternative ||
    (!!currentPayload.feasibilityprompt?.criteria_label &&
      !!currentPayload.alternative_criteria_type &&
      !!currentPayload.alternative_criteria_label &&
      !!currentPayload.alternative_criteria_condition)
  const conditionKeys = useMemo<ConditionKey[]>(
    () => keyOptions.map((option) => ({ name: option.value, label: option.label, dataType: option.dataType })),
    [keyOptions],
  )
  const initialCriteriaCondition = value?.criteria_condition || ""
  const initialAlternativeCondition = value?.alternative_criteria_condition || ""
  const hasChanged = JSON.stringify(currentPayload) !== JSON.stringify(originalPayload)
  const saveDisabled =
    !hasRequiredFields ||
    !hasRequiredAlternativeFields ||
    conditionHasErrors ||
    (hasAlternative && alternativeConditionHasErrors) ||
    keysLoading ||
    (!!value && !hasChanged)

  const save = handleSubmit(async (data) => {
    try {
      return await onChange(
        normalizeCriteriaPayload(data, usesOptions, usesDates, hasAlternative, alternativeUsesOptions, alternativeUsesDates),
      )
    } catch (error: any) {
      alert({
        title: "Eligibility criteria could not be saved",
        message: error?.message || "Check the eligibility criteria fields and try again.",
        variant: "error",
      })
    }
  })

  return (
    <Sheet open modal onOpenChange={onClose}>
      <SheetContent hideCloseButton side="right" className="m-0 flex w-[560px] max-w-[92vw] flex-col p-0 sm:max-w-[560px]">
        <SheetHeader className="flex flex-row items-center border-b border-b-border px-4 py-2 text-left sm:text-left">
          <SheetTitle>Eligibility criteria</SheetTitle>
          <SheetDescription className="hidden" />
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
          <div>
            <Label htmlFor="criteria_type">Type *</Label>
            <Controller
              control={control}
              name="criteria_type"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onValueChange={(nextValue: EligibilityCriteria["criteria_type"]) => {
                    onChange(nextValue)
                    if (nextValue === "yesno" && !items.length) {
                      setValue("items", [
                        ...yesNoItems,
                      ], { shouldDirty: true })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {criteriaTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="criteria_label">Label *</Label>
            <Input
              id="criteria_label"
              {...register("criteria_label", { required: "Label is required." })}
              error={!!errors.criteria_label}
            />
            {!!errors.criteria_label && <p className="mt-1 text-xs text-destructive">{errors.criteria_label.message}</p>}
          </div>

          <div>
            <Label htmlFor="auto_fills">Auto fills</Label>
            {!!keyOptionsError && <p className="mb-2 text-xs text-destructive">{keyOptionsError}</p>}
            <ReactSelect
              isClearable
              isLoading={keysLoading}
              placeholder="Search script key to fill"
              options={keyOptions}
              value={keyOptions.find((option) => option.value === autoFills) || null}
              onChange={(option) => {
                const selected = option as KeyOption | null
                if (!selected) {
                  setValue("auto_fills", "", { shouldDirty: true })
                  return
                }

                const selectedType = getSupportedCriteriaType(selected.dataType)
                if (!selectedType) {
                  alert({
                    title: "Unsupported auto-fill key type",
                    message: `The selected key type "${selected.dataType || "unknown"}" is not yet supported for eligibility criteria.`,
                    variant: "info",
                  })
                  return
                }

                setValue("auto_fills", selected.value, { shouldDirty: true })
                setValue("criteria_type", selectedType, { shouldDirty: true })
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criteria_condition">Eligibility Criteria *</Label>
            <Controller
              control={control}
              name="criteria_condition"
              rules={{ required: "Eligibility criteria is required." }}
              render={({ field: { value, onChange } }) => (
                <ConditionEditor
                  id="criteria_condition"
                  rows={4}
                  value={value || ""}
                  onChange={(next) => onChange(next)}
                  keys={conditionKeys}
                  keysLoading={keysLoading}
                  allowSelf
                  selfDataType={criteriaType}
                  initialValue={initialCriteriaCondition}
                  onValidityChange={setConditionHasErrors}
                  placeholder="$self='Yes' or $key>78"
                />
              )}
            />
            {!!errors.criteria_condition && (
              <p className="text-xs text-destructive">{errors.criteria_condition.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="failure_message">Failure message *</Label>
            <Textarea
              id="failure_message"
              rows={3}
              placeholder="This patient does not meet the eligibility criteria for this script."
              {...register("failure_message", { required: "Failure message is required." })}
            />
            {!!errors.failure_message && <p className="mt-1 text-xs text-destructive">{errors.failure_message.message}</p>}
          </div>

          {usesOptions && (
            <Controller
              control={control}
              name="items"
              render={({ field: { value, onChange } }) => (
                <FieldItems
                  disabled={false}
                  items={value || []}
                  fieldType="dropdown"
                  allowCustomKey
                  hideManualEntry
                  onChange={onChange}
                />
              )}
            />
          )}

          {usesDates && (
            <div className="space-y-4">
              <DateLimit
                id="min_date"
                label="Min date"
                inputType={dateInputType}
                current={!!minDateCurrent}
                register={register}
                onToggle={(checked) => setValue("min_date_current", checked, { shouldDirty: true })}
              />
              <DateLimit
                id="max_date"
                label="Max date"
                inputType={dateInputType}
                current={!!maxDateCurrent}
                register={register}
                onToggle={(checked) => setValue("max_date_current", checked, { shouldDirty: true })}
              />
            </div>
          )}

          <div className="space-y-3 rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Alternative criteria</Label>
                <p className="text-xs text-muted-foreground">Use this when the original criteria cannot be assessed.</p>
              </div>
              <Switch
                checked={hasAlternative}
                onCheckedChange={(checked) => setHasAlternative(checked)}
              />
            </div>

            {hasAlternative && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alternative_activation_prompt">Feasibility prompt *</Label>
                  <Input
                    id="alternative_activation_prompt"
                    placeholder="Is date of birth known?"
                    {...register("alternative_activation_prompt", { required: "Feasibility prompt is required." })}
                    error={!!errors.alternative_activation_prompt}
                  />
                  {!!errors.alternative_activation_prompt && (
                    <p className="mt-1 text-xs text-destructive">{errors.alternative_activation_prompt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alternative_criteria_type">Alternative criteria type *</Label>
                  <Controller
                    control={control}
                    name="alternative_criteria_type"
                    render={({ field: { value, onChange } }) => (
                      <Select
                        value={value}
                        onValueChange={(nextValue: EligibilityCriteria["criteria_type"]) => {
                          onChange(nextValue)
                          if (nextValue === "yesno" && !alternativeItems.length) {
                            setValue("alternative_items", [
                              ...yesNoItems,
                            ], { shouldDirty: true })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {criteriaTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="alternative_criteria_label">Alternative label *</Label>
                  <Input
                    id="alternative_criteria_label"
                    {...register("alternative_criteria_label", { required: "Alternative label is required." })}
                    error={!!errors.alternative_criteria_label}
                  />
                  {!!errors.alternative_criteria_label && (
                    <p className="mt-1 text-xs text-destructive">{errors.alternative_criteria_label.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alternative_auto_fills">Alternative criteria auto fills</Label>
                  <ReactSelect
                    isClearable
                    isLoading={keysLoading}
                    placeholder="Search script key to fill"
                    options={keyOptions}
                    value={keyOptions.find((option) => option.value === alternativeAutoFills) || null}
                    onChange={(option) => {
                      const selected = option as KeyOption | null
                      if (!selected) {
                        setValue("alternative_auto_fills", "", { shouldDirty: true })
                        return
                      }

                      const selectedType = getSupportedCriteriaType(selected.dataType)
                      if (!selectedType) {
                        alert({
                          title: "Unsupported auto-fill key type",
                          message: `The selected key type "${selected.dataType || "unknown"}" is not yet supported for eligibility criteria.`,
                          variant: "info",
                        })
                        return
                      }

                      setValue("alternative_auto_fills", selected.value, { shouldDirty: true })
                      setValue("alternative_criteria_type", selectedType, { shouldDirty: true })
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="alternative_criteria_condition">Alternative eligibility criteria *</Label>
                  <Controller
                    control={control}
                    name="alternative_criteria_condition"
                    rules={{ required: "Alternative eligibility criteria is required." }}
                    render={({ field: { value, onChange } }) => (
                      <ConditionEditor
                        id="alternative_criteria_condition"
                        rows={3}
                        value={value || ""}
                        onChange={(next) => onChange(next)}
                        keys={conditionKeys}
                        keysLoading={keysLoading}
                        allowSelf
                        selfDataType={alternativeCriteriaType}
                        initialValue={initialAlternativeCondition}
                        onValidityChange={setAlternativeConditionHasErrors}
                        placeholder="$self>=30"
                      />
                    )}
                  />
                  {!!errors.alternative_criteria_condition && (
                    <p className="mt-1 text-xs text-destructive">{errors.alternative_criteria_condition.message}</p>
                  )}
                </div>

                {alternativeUsesOptions && (
                  <Controller
                    control={control}
                    name="alternative_items"
                    render={({ field: { value, onChange } }) => (
                      <FieldItems
                        disabled={false}
                        items={value || []}
                        fieldType="dropdown"
                        allowCustomKey
                        hideManualEntry
                        onChange={onChange}
                      />
                    )}
                  />
                )}

                {alternativeUsesDates && (
                  <div className="space-y-4">
                    <DateLimit
                      id="alternative_min_date"
                      label="Alternative min date"
                      inputType={alternativeDateInputType}
                      current={!!alternativeMinDateCurrent}
                      register={register}
                      onToggle={(checked) => setValue("alternative_min_date_current", checked, { shouldDirty: true })}
                    />
                    <DateLimit
                      id="alternative_max_date"
                      label="Alternative max date"
                      inputType={alternativeDateInputType}
                      current={!!alternativeMaxDateCurrent}
                      register={register}
                      onToggle={(checked) => setValue("alternative_max_date_current", checked, { shouldDirty: true })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-x-2 border-t border-t-border px-4 py-2">
          <i className="text-sm text-destructive">* Required</i>
          <div className="ml-auto" />
          <SheetClose asChild>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </SheetClose>
          <Button type="button" disabled={saveDisabled} onClick={() => save()}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DateLimit({
  id,
  label,
  inputType,
  current,
  register,
  onToggle,
}: {
  id: "min_date" | "max_date" | "alternative_min_date" | "alternative_max_date"
  label: string
  inputType: "date" | "datetime-local"
  current: boolean
  register: ReturnType<typeof useForm<EligibilityCriteria>>["register"]
  onToggle: (checked: boolean) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={inputType} disabled={current} {...register(id)} />
      <div className="flex items-center space-x-2">
        <Switch id={`${id}_current`} checked={current} onCheckedChange={onToggle} />
        <Label secondary htmlFor={`${id}_current`}>
          Current date at data entry
        </Label>
      </div>
    </div>
  )
}

function getKeyOptions(keys: unknown[]): KeyOption[] {
  const map = new Map<string, KeyOption>()

  keys.forEach((key: any) => {
    const value = `${key?.name || ""}`.trim()
    if (!value) return
    const label = `${value}${key?.label ? ` - ${key.label}` : ""}`
    map.set(value, { value, label, dataType: `${key?.dataType || ""}`.trim() })
  })

  return Array.from(map.values()).sort((a, b) => a.value.localeCompare(b.value))
}

function getSupportedCriteriaType(dataType: string): EligibilityCriteria["criteria_type"] | null {
  const normalized = dataType.toLowerCase().trim()

  if (normalized === "date") return "date"
  if (["datetime", "date_time"].includes(normalized)) return "datetime"
  if (normalized === "dropdown") return "dropdown"
  if (normalized === "yesno") return "yesno"

  return null
}

function isOptionsType(type?: EligibilityCriteria["criteria_type"]) {
  return type === "dropdown" || type === "yesno"
}

function isDateType(type?: EligibilityCriteria["criteria_type"]) {
  return type === "date" || type === "datetime"
}

function normalizeCriteriaPayload(
  data: EligibilityCriteria | null,
  usesOptions: boolean,
  usesDates: boolean,
  hasAlternative = false,
  alternativeUsesOptions = false,
  alternativeUsesDates = false,
): EligibilityCriteria {
  const payload: EligibilityCriteria = {
    criteria_type: data?.criteria_type || "date",
    criteria_label: data?.criteria_label?.trim() || "",
    auto_fills: data?.auto_fills?.trim() || "",
    criteria_condition: data?.criteria_condition?.trim() || "",
    failure_message: data?.failure_message?.trim() || "",
  }

  if (usesOptions) payload.items = data?.items || []
  if (usesDates) {
    payload.min_date = data?.min_date_current ? "" : data?.min_date || ""
    payload.max_date = data?.max_date_current ? "" : data?.max_date || ""
    payload.min_date_current = !!data?.min_date_current
    payload.max_date_current = !!data?.max_date_current
  }

  if (hasAlternative) {
    payload.feasibilityprompt = {
      criteria_type: "yesno",
      criteria_label: getFeasibilityPromptLabel(data),
      items: yesNoItems,
    }
    payload.alternative_activation_condition = alternativeActivationCondition
    payload.alternative_criteria_type = data?.alternative_criteria_type
    payload.alternative_criteria_label = data?.alternative_criteria_label?.trim() || ""
    payload.alternative_auto_fills = data?.alternative_auto_fills?.trim() || ""
    payload.alternative_criteria_condition = data?.alternative_criteria_condition?.trim() || ""

    if (alternativeUsesOptions) payload.alternative_items = data?.alternative_items || []
    if (alternativeUsesDates) {
      payload.alternative_min_date = data?.alternative_min_date_current ? "" : data?.alternative_min_date || ""
      payload.alternative_max_date = data?.alternative_max_date_current ? "" : data?.alternative_max_date || ""
      payload.alternative_min_date_current = !!data?.alternative_min_date_current
      payload.alternative_max_date_current = !!data?.alternative_max_date_current
    }
  }

  return payload
}

function getFeasibilityPromptLabel(data: EligibilityCriteria | null) {
  return (data?.feasibilityprompt?.criteria_label || data?.alternative_activation_prompt || "").trim()
}
