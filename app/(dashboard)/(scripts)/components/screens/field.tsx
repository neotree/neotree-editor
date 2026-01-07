"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import axios from "axios"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataKeysCtx } from "@/contexts/data-keys"
import type { getLeanAlias } from "@/app/actions/aliases"
import { SelectDataKey } from "@/components/select-data-key"
import { CONDITIONAL_EXP_EXAMPLE } from "@/constants"
import type { ScriptField as FieldType } from "@/types"
import { DialogClose } from "@/components/ui/dialog"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FieldTypes, nuidSearchOptions, PERIOD_FIELD_FORMATS } from "@/constants/fields"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DateTimePicker } from "@/components/datetime-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { validateDropdownValues } from "@/lib/validate-dropdown-values"
import { cn } from "@/lib/utils"
import { isEmpty } from "@/lib/isEmpty"
import { Title } from "../title"
import type { useScreenForm } from "../../hooks/use-screen-form"
import { useField } from "../../hooks/use-field"
import { FieldItems } from "./field-items"

type Props = {
  open: boolean
  disabled?: boolean
  field?: {
    index: number
    data: FieldType
  }
  form: ReturnType<typeof useScreenForm>
  onClose: () => void
  scriptId: any
}

export function Field<P = {}>({ open, field: fieldProp, form, scriptId, disabled: disabledProp, onClose }: Props & P) {
  const { extractDataKeys } = useDataKeysCtx()

  const { data: field, index: fieldIndex } = { ...fieldProp }

  const [showForm, setShowForm] = useState(!!field)

  const { getDefaultValues } = useField(
    !field
      ? undefined
      : {
          ...field,
        },
  )

  const listStyle = form.watch("listStyle")
  const screenKeyId = form.getValues("keyId")
  const screenRefIdDataKey = form.getValues("refIdDataKey")

  const screenDataKey = useMemo(() => {
    const keyId = screenKeyId || screenRefIdDataKey
    const [key] = !keyId ? [null] : extractDataKeys([keyId])
    return key
  }, [screenKeyId, screenRefIdDataKey, extractDataKeys])

  const {
    control,
    reset: resetForm,
    register,
    getValues,
    watch,
    setValue,
    handleSubmit,
  } = useForm({
    defaultValues: getDefaultValues(),
  })
  const [alias, setAlias] = useState("")

  const type = watch("type")
  const format = watch("format")
  const key = watch("key")
  const keyId = watch("keyId")
  const label = watch("label")
  const optional = watch("optional")
  const printable = watch("printable")
  const confidential = watch("confidential")
  const maxDate = watch("maxDate")
  const minDate = watch("minDate")
  const maxTime = watch("maxTime")
  const minTime = watch("minTime")
  const prePopulate = watch("prePopulate")
  const defaultValue = watch("defaultValue")
  const values = watch("values")
  const items = watch("items")
  const valuesOptions = watch("valuesOptions")
  const editable = watch("editable")

  const valuesErrors = useMemo(() => validateDropdownValues(values), [values])

  const isDateField = useMemo(() => type === "date" || type === "datetime", [type])
  const isTimeField = useMemo(() => type === "time", [type])
  const isTextField = useMemo(() => type === "text", [type])
  const isPeriodField = useMemo(() => type === "period", [type])
  const isNumberField = useMemo(() => type === "number", [type])
  const isDropdownField = useMemo(() => type === "dropdown", [type])
  const isMultiSelectField = useMemo(() => type === "multi_select", [type])

  const getAlias = useCallback(async (name: string) => {
    if (!name) return
    try {
      const res = await axios.get<Awaited<ReturnType<typeof getLeanAlias>>>(
        "/api/aliases/lean?data=" + JSON.stringify({ script: scriptId, name: name }),
      )
      setAlias(res?.data?.alias || "")
    } catch (err) {
      setAlias("")
    }
  }, [])

  useEffect(() => {
    getAlias(key)
  }, [getAlias, key])

  const disabled = useMemo(() => !!disabledProp, [disabledProp])

  const onSave = handleSubmit(async (data) => {
    if (form.changeTracker) {
      const currentFields = form.getValues("fields")
      const updatedFields =
        !isEmpty(fieldIndex) && field
          ? currentFields.map((f, i) => ({
              ...f,
              ...(i === fieldIndex ? data : null),
            }))
          : [...currentFields, data]

      await form.changeTracker.trackChanges(
        { ...form.getValues(), fields: updatedFields },
        `Field "${data.label}" ${field ? "updated" : "added"}`,
      )
    }

    if (!isEmpty(fieldIndex) && field) {
      form.setValue(
        "fields",
        form.getValues("fields").map((f, i) => ({
          ...f,
          ...(i === fieldIndex ? data : null),
        })),
      )
    } else {
      form.setValue("fields", [...form.getValues("fields"), data], { shouldDirty: true })
    }
    onClose()
  })

  const valuesParsed = useMemo(() => {
    return (values || "")
      .split("\n")
      .map((v = "") => v.trim())
      .map((value) => {
        const valueSplit = value.split(",")
        return { value: valueSplit[0], label: valueSplit[1] }
      })
      .filter((o) => o.value && o.label)
  }, [values])

  const dataKey = useMemo(() => {
    const [key] = !keyId ? [null] : extractDataKeys([keyId])
    return key
  }, [keyId, extractDataKeys])

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(open) => {
          if (!open) onClose()
          resetForm(getDefaultValues())
          setShowForm(!!field)
        }}
        title={field ? "New field" : "Edit field"}
        actions={
          <>
            <span className={cn("text-danger text-xs", disabled && "hidden")}>* Required</span>

            <div className="flex-1" />

            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button
              disabled={disabled || !type}
              onClick={() => {
                if (!showForm) {
                  setShowForm(true)
                  resetForm({
                    ...getDefaultValues(),
                    type,
                  })
                } else {
                  setValue(
                    "valuesOptions",
                    valuesOptions.filter((o) => o.optionLabel && o.key),
                    { shouldDirty: true },
                  )
                  onSave()
                }
              }}
            >
              {showForm ? "Save" : "Continue"}
            </Button>
          </>
        }
      >
        {!showForm ? (
          <RadioGroup
            defaultValue={type}
            onValueChange={(value) => setValue("type", value, { shouldDirty: true })}
            className="flex flex-col gap-y-4"
          >
            {FieldTypes.map((t) => (
              <div key={t.name} className="flex items-center space-x-2">
                <RadioGroupItem value={t.name} id={t.name} />
                <Label htmlFor={t.name}>{t.label}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="flex flex-col gap-y-5">
            <>
              <Title>Field type</Title>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={type}
                  required
                  name="type"
                  disabled
                  onValueChange={(value) => {
                    setValue("type", value as typeof type, { shouldDirty: true })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>User role</SelectLabel>
                      {FieldTypes.map((t) => (
                        <SelectItem key={t.name} value={t.name}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </>

            <>
              <Title>Flow control</Title>
              <div>
                <Label htmlFor="condition">Conditional expression</Label>
                <Textarea {...register("condition", { disabled })} name="condition" noRing={false} rows={5} />
                <span className="text-xs text-muted-foreground">Example: {CONDITIONAL_EXP_EXAMPLE}</span>
              </div>
            </>

            <>
              <Title>Properties</Title>

              <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                <div>
                  <Label error={!disabled && !key} htmlFor="key">
                    Key *
                  </Label>
                  <SelectDataKey
                    modal
                    value={key}
                    disabled={disabled}
                    type={type}
                    filterDataKeys={(k) => {
                      const opts = screenDataKey?.options || []
                      if (!screenDataKey) return true
                      return opts.includes(k.uniqueKey)
                    }}
                    onChange={([item]) => {
                      setValue("key", item?.name, { shouldDirty: true })
                      setValue("keyId", item?.uniqueKey, { shouldDirty: true })
                      setValue("label", item?.label, { shouldDirty: true })
                    }}
                  />
                </div>

                <div className="flex-1">
                  <Label error={!disabled && !label} htmlFor="label">
                    Label *
                  </Label>
                  <Input {...register("label", { disabled })} name="label" error={!disabled && !label} />
                </div>
              </div>

              <div>
                <Label htmlFor="refKey">Reference Key</Label>
                <Controller
                  control={control}
                  name="refKey"
                  render={({ field: { value, onChange } }) => {
                    return (
                      <SelectDataKey
                        value={`${value || ""}`}
                        disabled={false}
                        onChange={([item]) => {
                          onChange(item.name)
                          setValue("refKeyId", item?.uniqueKey, { shouldDirty: true })
                        }}
                      />
                    )
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  Link this field to <b>another field with this key</b>
                </span>
              </div>

              <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                <div className="flex-1 flex items-center space-x-2">
                  <Switch
                    id="confidential"
                    disabled={disabled}
                    checked={confidential}
                    onCheckedChange={(checked) => setValue("confidential", checked, { shouldDirty: true })}
                  />
                  <Label htmlFor="confidential">Confidential</Label>
                </div>

                <div className="flex-1 flex items-center space-x-2">
                  <Switch
                    id="optional"
                    disabled={disabled}
                    checked={optional}
                    onCheckedChange={(checked) => setValue("optional", checked, { shouldDirty: true })}
                  />
                  <Label htmlFor="optional">Optional</Label>
                </div>
              </div>

              {(isDropdownField || isMultiSelectField) && (
                <>
                  {!!isMultiSelectField && (
                    <div>
                      <Label secondary htmlFor="listStyle">
                        List style
                      </Label>
                      <Select
                        value={listStyle}
                        name="listStyle"
                        onValueChange={(val: typeof listStyle) => {
                          form.setValue("listStyle", val || "none")
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="bullet">Bullet</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Controller
                    control={control}
                    name="items"
                    render={({ field: { value, onChange } }) => {
                      return (
                        <FieldItems
                          disabled={disabled}
                          items={value}
                          fieldType={type}
                          onChange={onChange}
                          dataKey={dataKey}
                        />
                      )
                    }}
                  />
                </>
              )}

              {(isPeriodField || isNumberField) && (
                <>
                  <div>
                    <Label htmlFor="calculation">Reference expression</Label>
                    <Input {...register("calculation", { disabled })} name="calculation" noRing={false} />
                    <span className="text-xs text-muted-foreground">
                      Example: $key or SUM($key1,$key2...) or DIVIDE($key1,$key2...) or MULTIPLY($key1,$key2...) or
                      SUBTRACT($key1,$key2...)
                    </span>
                  </div>
                </>
              )}

              {isPeriodField && (
                <div>
                  <Label htmlFor="periodFormart">Format</Label>
                  <Select
                    value={format}
                    required
                    name="format"
                    onValueChange={(value) => {
                      setValue("format", value || "days_hours", { shouldDirty: true })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Formats</SelectLabel>
                        {PERIOD_FIELD_FORMATS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isNumberField && (
                <>
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                      <div className="sm:flex-1">
                        <Label htmlFor="minValue">Min value</Label>
                        <Input {...register("minValue", { disabled })} name="minValue" noRing={false} />
                      </div>

                      <div className="sm:flex-1">
                        <Label htmlFor="maxValue">Max value</Label>
                        <Input {...register("maxValue", { disabled })} name="maxValue" noRing={false} />
                      </div>

                      <div className="sm:flex-1">
                        <Label htmlFor="format">Format</Label>
                        <Input {...register("format", { disabled })} name="format" noRing={false} />
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      Format: Add as many # as the number of decimal digits or leave empty
                    </span>
                  </div>
                </>
              )}

              {isDateField && (
                <>
                  <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                    <div className="flex-1 flex flex-col gap-y-5">
                      <div>
                        <Label>Min date</Label>
                        <DateTimePicker
                          disabled={disabled || minDate === "date_now"}
                          type="datetime"
                          value={minDate}
                          onChange={({ date }) => {
                            let _minDate = date?.toISOString?.() || ""
                            if (minDate === "date_now") _minDate = minDate
                            setValue("minDate", _minDate, { shouldDirty: true })
                          }}
                        />
                      </div>

                      <div className="flex-1 flex items-center space-x-2">
                        <Checkbox
                          id="minDateCurrent"
                          disabled={disabled}
                          checked={minDate === "date_now"}
                          onCheckedChange={(checked) =>
                            setValue("minDate", checked ? "date_now" : "", { shouldDirty: true })
                          }
                        />
                        <Label htmlFor="minDateCurrent">Current date</Label>
                      </div>

                      <div>
                        <Label htmlFor="minDateKey">Min Date Key e.g $DateOfBirth</Label>
                        <Controller
                          control={control}
                          name="minDateKey"
                          render={({ field: { value, onChange } }) => {
                            return (
                              <SelectDataKey
                                value={`${value || ""}`}
                                disabled={false}
                                onChange={([item]) => {
                                  onChange(item.name)
                                  setValue("minDateKeyId", item?.uniqueKey, { shouldDirty: true })
                                }}
                              />
                            )
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-y-5">
                      <div>
                        <Label>Max date</Label>
                        <DateTimePicker
                          disabled={disabled || maxDate === "date_now"}
                          type="datetime"
                          value={maxDate}
                          onChange={({ date }) => {
                            let _maxDate = date?.toISOString?.() || ""
                            if (maxDate === "date_now") _maxDate = maxDate
                            setValue("maxDate", _maxDate, { shouldDirty: true })
                          }}
                        />
                      </div>

                      <div className="flex-1 flex items-center space-x-2">
                        <Checkbox
                          id="maxDateCurrent"
                          disabled={disabled}
                          checked={maxDate === "date_now"}
                          onCheckedChange={(checked) =>
                            setValue("maxDate", checked ? "date_now" : "", { shouldDirty: true })
                          }
                        />
                        <Label htmlFor="maxDateCurrent">Current date</Label>
                      </div>

                      <div>
                        <Label htmlFor="maxDateKey">Max Date Key e.g $DateOfBirth</Label>
                        <Controller
                          control={control}
                          name="maxDateKey"
                          render={({ field: { value, onChange } }) => {
                            return (
                              <SelectDataKey
                                value={`${value || ""}`}
                                disabled={false}
                                onChange={([item]) => {
                                  onChange(item.name)
                                  setValue("maxDateKeyId", item?.uniqueKey, { shouldDirty: true })
                                }}
                              />
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Title>Default</Title>

                  <RadioGroup
                    disabled={disabled}
                    defaultValue={defaultValue || "empty"}
                    onValueChange={(value) =>
                      setValue("defaultValue", (value === "empty" ? "" : value) || "", { shouldDirty: true })
                    }
                    className="flex flex-col gap-y-4"
                  >
                    {[
                      { label: "Empty", name: "empty" },
                      { label: "Current time", name: "date_now" },
                      { label: "Today at noon", name: "date_noon" },
                      { label: "Today at midnight", name: "date_midnight" },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center space-x-2">
                        <RadioGroupItem value={t.name} id={t.name} />
                        <Label htmlFor={t.name}>{t.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              )}

              {isTimeField && (
                <>
                  <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                    <div className="flex-1 flex flex-col gap-y-5">
                      <div>
                        <Label>Min time</Label>
                        {minTime === "time_now" ? (
                          <Input disabled type="time" />
                        ) : (
                          <DateTimePicker
                            disabled={disabled}
                            type="time"
                            value={minTime}
                            onChange={({ time }) => setValue("minTime", time || "", { shouldDirty: true })}
                          />
                        )}
                      </div>

                      <div className="flex-1 flex items-center space-x-2">
                        <Checkbox
                          id="minTime"
                          disabled={disabled}
                          checked={minTime === "time_now"}
                          onCheckedChange={(checked) =>
                            setValue("minTime", checked ? "time_now" : "", { shouldDirty: true })
                          }
                        />
                        <Label htmlFor="minTime">Current time</Label>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-y-5">
                      <div>
                        <Label>Max time</Label>
                        {maxTime === "time_now" ? (
                          <Input disabled type="time" />
                        ) : (
                          <DateTimePicker
                            disabled={disabled}
                            type="time"
                            value={maxTime}
                            onChange={({ time }) => setValue("maxTime", time || "", { shouldDirty: true })}
                          />
                        )}
                      </div>

                      <div className="flex-1 flex items-center space-x-2">
                        <Checkbox
                          id="maxTime"
                          disabled={disabled}
                          checked={maxTime === "time_now"}
                          onCheckedChange={(checked) =>
                            setValue("maxTime", checked ? "time_now" : "", { shouldDirty: true })
                          }
                        />
                        <Label htmlFor="maxTime">Current time</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>

            {isTextField && (
              <>
                <Title>Default</Title>

                <RadioGroup
                  disabled={disabled}
                  defaultValue={defaultValue || "empty"}
                  onValueChange={(value) =>
                    setValue("defaultValue", (value === "empty" ? "" : value) || "", { shouldDirty: true })
                  }
                  className="flex flex-col gap-y-4"
                >
                  {[
                    { label: "Empty", name: "empty" },
                    { label: "Generated ID", name: "uid" },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center space-x-2">
                      <RadioGroupItem value={t.name} id={t.name} />
                      <Label htmlFor={t.name}>{t.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </>
            )}

            <>
              <Title>Neotree ID Search</Title>
              <div className="flex flex-col gap-y-4">
                {nuidSearchOptions.map((o) => {
                  const id = `prePopulate_${o.value}`
                  const all = nuidSearchOptions
                    .filter((o) => o.value !== nuidSearchOptions[0].value)
                    .map((o) => o.value)
                  const checked = prePopulate.includes(o.value) || prePopulate.length === all.length

                  return (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                          let data: string[] = []
                          if (checked) {
                            data = [...prePopulate, o.value]
                            if (o.value === nuidSearchOptions[0].value) {
                              data = all
                            }
                          } else {
                            data = prePopulate.filter((s) => s !== o.value)
                            if (o.value === nuidSearchOptions[0].value) data = []
                          }
                          setValue("prePopulate", data, { shouldDirty: true })
                        }}
                      />
                      <Label htmlFor={id}>{o.label}</Label>
                    </div>
                  )
                })}
              </div>
              {prePopulate?.length > 0 && (
                <div className="max-w-64">
                  <Label secondary htmlFor="alias">
                    ALIAS
                  </Label>
                  <Input value={alias} disabled={true} name="alias" placeholder="" noRing={false} />
                </div>
              )}
            </>

            <>
              <Title>Print</Title>
              <div>
                <div className="flex-1 flex items-center space-x-2">
                  <Checkbox
                    id="printable"
                    disabled={disabled}
                    checked={printable}
                    onCheckedChange={() => setValue("printable", !printable, { shouldDirty: true })}
                  />
                  <Label htmlFor="printable">Print</Label>
                </div>

                <span className="text-muted-foreground text-xs">
                  If not checked, data will not be display on the session summary and the printout.
                </span>
              </div>
            </>
            <>
              <Title>Editable</Title>
              <div>
                <div className="flex-1 flex items-center space-x-2">
                  <Checkbox
                    id="editable"
                    disabled={disabled}
                    checked={editable}
                    onCheckedChange={() => setValue("editable", !editable, { shouldDirty: true })}
                  />
                  <Label htmlFor="editable">Editable</Label>
                </div>

                <span className="text-muted-foreground text-xs">
                  If not checked,values on a form field,if auto populated will be read only.
                </span>
              </div>
            </>
          </div>
        )}
      </Modal>
    </>
  )
}
