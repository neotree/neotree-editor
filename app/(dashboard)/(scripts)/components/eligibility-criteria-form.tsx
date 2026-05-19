"use client"

import { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { PlusIcon, Wand2Icon } from "lucide-react"

import type { EligibilityCriteria } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ReactSelect } from "@/components/react-select"
import { useScriptsContext } from "@/contexts/scripts"
import { useAlertModal } from "@/hooks/use-alert-modal"
import { FieldItems } from "./screens/field-items"

type Props = {
  disabled: boolean
  scriptId?: string
  value?: EligibilityCriteria | null
  onChange: (value: EligibilityCriteria | null) => void
}

type KeyOption = {
  value: string
  label: string
  dataType: string
}

type ConditionToken = {
  token: string
  start: number
  end: number
}

const criteriaTypes: { value: EligibilityCriteria["criteria_type"]; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date and time" },
  { value: "dropdown", label: "Dropdown" },
  { value: "yesno", label: "Yes/No" },
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
    if (open && scriptId) loadKeys()
  }, [loadKeys, open, scriptId])

  return (
    <>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="bg-green-600 text-white hover:bg-green-700"
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
          onChange={(nextValue) => {
            onChange(nextValue)
            setOpen(false)
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
  onChange: (value: EligibilityCriteria) => void
}) {
  const { alert } = useAlertModal()
  const [conditionCursor, setConditionCursor] = useState((value?.criteria_condition || "").length)
  const [conditionError, setConditionError] = useState("")
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
      items: value?.items || [],
      min_date: value?.min_date || "",
      max_date: value?.max_date || "",
      min_date_current: value?.min_date_current || false,
      max_date_current: value?.max_date_current || false,
    },
  })

  const criteriaType = watch("criteria_type")
  const condition = watch("criteria_condition") || ""
  const criteriaLabel = watch("criteria_label") || ""
  const autoFills = watch("auto_fills") || ""
  const items = watch("items") || []
  const minDate = watch("min_date") || ""
  const maxDate = watch("max_date") || ""
  const minDateCurrent = watch("min_date_current")
  const maxDateCurrent = watch("max_date_current")
  const dateInputType = criteriaType === "datetime" ? "datetime-local" : "date"
  const usesOptions = criteriaType === "dropdown" || criteriaType === "yesno"
  const usesDates = criteriaType === "date" || criteriaType === "datetime"
  const currentPayload = useMemo(
    () =>
      normalizeCriteriaPayload(
        {
          criteria_type: criteriaType,
          criteria_label: criteriaLabel,
          auto_fills: autoFills,
          criteria_condition: condition,
          items,
          min_date: minDate,
          max_date: maxDate,
          min_date_current: !!minDateCurrent,
          max_date_current: !!maxDateCurrent,
        },
        usesOptions,
        usesDates,
      ),
    [autoFills, condition, criteriaLabel, criteriaType, items, maxDate, maxDateCurrent, minDate, minDateCurrent, usesDates, usesOptions],
  )
  const originalPayload = useMemo(
    () => normalizeCriteriaPayload(value, isOptionsType(value?.criteria_type), isDateType(value?.criteria_type)),
    [value],
  )
  const hasRequiredFields = !!currentPayload.criteria_type && !!currentPayload.criteria_label && !!currentPayload.criteria_condition
  const invalidConditionKeys = useMemo(
    () => getInvalidConditionKeys(condition, keyOptions),
    [condition, keyOptions],
  )
  const hasValidConditionKeys = !invalidConditionKeys.length
  const hasChanged = JSON.stringify(currentPayload) !== JSON.stringify(originalPayload)
  const saveDisabled = !hasRequiredFields || !hasValidConditionKeys || !!conditionError || (!!value && !hasChanged)

  const activeConditionToken = useMemo(() => {
    return getConditionTokenAtCursor(condition, conditionCursor)
  }, [condition, conditionCursor])
  const conditionMatches = useMemo(() => {
    if (!activeConditionToken) return []
    const token = activeConditionToken.token
    if (token.toLowerCase() === "self") return []
    if (keyOptions.some((option) => option.value.toLowerCase() === token.toLowerCase())) return []
    return sortKeyMatches(keyOptions, token).slice(0, 8)
  }, [activeConditionToken, keyOptions])
  const showNoConditionMatches = !!(
    activeConditionToken?.token &&
    activeConditionToken.token.toLowerCase() !== "self" &&
    !keyOptions.some((option) => option.value.toLowerCase() === activeConditionToken.token.toLowerCase()) &&
    !conditionMatches.length
  )

  const save = handleSubmit((data) => {
    try {
      onChange(normalizeCriteriaPayload(data, usesOptions, usesDates))
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
                        { itemId: "yes", value: "yes", label: "Yes" },
                        { itemId: "no", value: "no", label: "No" },
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
              render={({ field: { value, onChange, onBlur } }) => (
                <Textarea
                  id="criteria_condition"
                  rows={4}
                  value={value || ""}
                  onBlur={onBlur}
                  onChange={(event) => {
                    setConditionError("")
                    onChange(event.target.value)
                    setConditionCursor(event.target.selectionStart || event.target.value.length)
                  }}
                  onClick={(event) => setConditionCursor(event.currentTarget.selectionStart || 0)}
                  onKeyUp={(event) => setConditionCursor(event.currentTarget.selectionStart || 0)}
                  placeholder="$self='Yes' or $key>78"
                />
              )}
            />
            {!!errors.criteria_condition && (
              <p className="text-xs text-destructive">{errors.criteria_condition.message}</p>
            )}

            {!!conditionError && (
              <p className="text-xs text-destructive">{conditionError}</p>
            )}

            {!!invalidConditionKeys.length && (
              <p className="text-xs text-destructive">
                Unknown key{invalidConditionKeys.length === 1 ? "" : "s"}: {invalidConditionKeys.join(", ")}
              </p>
            )}

            {showNoConditionMatches && (
              <p className="text-xs text-muted-foreground">No matching script keys.</p>
            )}

            {!!conditionMatches.length && (
              <div className="rounded-md border border-border">
                {conditionMatches.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      try {
                        const next = insertConditionKeyAtCursor(condition, option.value, activeConditionToken)
                        setValue("criteria_condition", next.condition, { shouldDirty: true })
                        setConditionCursor(next.cursor)
                        setConditionError("")
                      } catch (error: any) {
                        setConditionError(error?.message || "Unable to insert the selected key.")
                      }
                    }}
                  >
                    <Wand2Icon className="mr-2 h-3.5 w-3.5 opacity-60" />
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {usesOptions && (
            <Controller
              control={control}
              name="items"
              render={({ field: { value, onChange } }) => (
                <FieldItems disabled={false} items={value || []} fieldType="dropdown" hideManualEntry onChange={onChange} />
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
  id: "min_date" | "max_date"
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

function getConditionTokenAtCursor(condition: string, cursor: number): ConditionToken | null {
  const safeCursor = Math.max(0, Math.min(cursor, condition.length))
  const beforeCursor = condition.slice(0, safeCursor)
  const tokenStart = beforeCursor.lastIndexOf("$")

  if (tokenStart < 0) return null

  const tokenText = beforeCursor.slice(tokenStart + 1)
  if (!/^[A-Za-z0-9_.-]*$/.test(tokenText)) return null

  let tokenEnd = safeCursor
  while (tokenEnd < condition.length && /[A-Za-z0-9_.-]/.test(condition[tokenEnd])) tokenEnd++

  return {
    token: condition.slice(tokenStart + 1, tokenEnd),
    start: tokenStart,
    end: tokenEnd,
  }
}

function insertConditionKeyAtCursor(condition: string, key: string, token: ConditionToken | null) {
  const replacement = `$${key}`

  if (!token) {
    const prefix = condition && !condition.endsWith(" ") ? `${condition} ` : condition
    return {
      condition: `${prefix}${replacement}`,
      cursor: `${prefix}${replacement}`.length,
    }
  }

  const nextCondition = `${condition.slice(0, token.start)}${replacement}${condition.slice(token.end)}`
  return {
    condition: nextCondition,
    cursor: token.start + replacement.length,
  }
}

function getInvalidConditionKeys(condition: string, keyOptions: KeyOption[]) {
  const validKeys = new Set(keyOptions.map((option) => option.value.toLowerCase()))
  const tokens = Array.from(condition.matchAll(/\$([A-Za-z0-9_.-]+)/g)).map((match) => match[1].trim())

  return tokens.filter((token) => {
    const normalized = token.toLowerCase()
    if (normalized === "self") return false
    return !validKeys.has(normalized)
  })
}

function sortKeyMatches(options: KeyOption[], token: string) {
  const normalizedToken = token.toLowerCase()
  const matches = options.filter((option) => {
    const value = option.value.toLowerCase()
    const label = option.label.toLowerCase()
    return (
      value.startsWith(normalizedToken) ||
      value.includes(normalizedToken) ||
      label.includes(normalizedToken) ||
      isSubsequence(normalizedToken, value)
    )
  })

  return matches.sort((a, b) => {
    const aValue = a.value.toLowerCase()
    const bValue = b.value.toLowerCase()
    const aStarts = aValue.startsWith(normalizedToken)
    const bStarts = bValue.startsWith(normalizedToken)
    if (aStarts !== bStarts) return aStarts ? -1 : 1
    return a.value.localeCompare(b.value)
  })
}

function isSubsequence(needle: string, value: string) {
  if (!needle) return true
  let index = 0
  for (const char of value) {
    if (char === needle[index]) index++
    if (index === needle.length) return true
  }
  return false
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
): EligibilityCriteria {
  const payload: EligibilityCriteria = {
    criteria_type: data?.criteria_type || "date",
    criteria_label: data?.criteria_label?.trim() || "",
    auto_fills: data?.auto_fills?.trim() || "",
    criteria_condition: data?.criteria_condition?.trim() || "",
  }

  if (usesOptions) payload.items = data?.items || []
  if (usesDates) {
    payload.min_date = data?.min_date_current ? "" : data?.min_date || ""
    payload.max_date = data?.max_date_current ? "" : data?.max_date || ""
    payload.min_date_current = !!data?.min_date_current
    payload.max_date_current = !!data?.max_date_current
  }

  return payload
}
