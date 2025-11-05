"use client"

import type React from "react"

import { useCallback, useMemo, useState } from "react"

import type { useScreenForm } from "../../../hooks/use-screen-form"
import type { DrugField } from "@/types"
import { DialogClose } from "@/components/ui/dialog"
import { Modal } from "@/components/modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GetDrugsLibraryItemsResults } from "@/databases/queries/drugs-library"
import { SelectDrug } from "../../../../components/drugs-library/select"
import { pendingChangesAPI } from "@/lib/indexed-db"

type Props = {
  children: React.ReactNode | ((params: { extraProps: any }) => React.ReactNode)
  disabled?: boolean
  form: ReturnType<typeof useScreenForm>
  types?: { value: string; label: string }[]
  subTypes?: { value: string; label: string }[]
  itemTypeInfo: {
    type: GetDrugsLibraryItemsResults["data"][0]["type"]
    formKey: "drugs" | "feeds" | "fluids"
    title: string
  }
  item?: {
    index: number
    data: DrugField
  }
}

export function Item<P = {}>({
  children,
  item: itemProp,
  itemTypeInfo: { formKey, type },
  form,
  disabled: disabledProp,
  types = [],
  subTypes = [],
  ...extraProps
}: Props & P) {
  const scriptId = form.getValues("scriptId")
  const screenId = form.getValues("screenId")

  const [selected, setSelected] = useState<null | DrugField>(null)
  const [open, setOpen] = useState(false)

  const disabled = useMemo(() => !!disabledProp, [disabledProp])

  const onSave = useCallback(async () => {
    if (selected) {
      const isNew = itemProp?.index === undefined
      const fieldPath = isNew ? `${formKey}[new]` : `${formKey}[${itemProp.index}]`
      const screenTitle =
        form.getValues("title") ||
        form.getValues("sectionTitle") ||
        form.getValues("label") ||
        form.getValues("previewTitle") ||
        "Screen"

      await pendingChangesAPI.addChange({
        entityType: "screen",
        entityId: screenId,
        entityTitle: screenTitle,
        action: isNew ? "create" : "update",
        fieldPath,
        fieldName: `${formKey}: ${selected.key}`,
        oldValue: itemProp?.data || null,
        newValue: selected,
      })


      if (isNew) {
        form.setValue(formKey, [...form.getValues(formKey), selected], { shouldDirty: true })
      } else {
        form.setValue(
          formKey,
          form.getValues(formKey).map((f, i) => ({
            ...f,
            ...(i !== itemProp.index
              ? null
              : {
                  ...selected,
                }),
          })),
        )
      }
    }
    setOpen(false)
  }, [selected, itemProp, formKey, screenId, form])

  return (
    <>
      <Modal
        open={open}
        title={`Select ${formKey}`}
        trigger={typeof children === "function" ? children({ extraProps }) : children}
        onOpenChange={(open) => {
          setSelected(itemProp?.data || null)
          setOpen(open)
        }}
        actions={
          <>
            <span className={cn("text-danger text-xs", disabled && "hidden")}>* Required</span>

            <div className="flex-1" />

            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button disabled={disabled || !selected} onClick={() => onSave()}>
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-5">
            <SelectDrug
              type={type}
              disabled={disabled}
              selected={selected?.key ? [selected.key] : []}
              unselectable={form
                .getValues(formKey)
                .map((item) => item.key)
                .filter((s) => s !== selected?.key!)}
              onChange={([key]) => {
                let position = form.getValues(formKey).length
                  ? 1
                  : Math.max(...form.getValues(formKey).map((s) => s.position)) + 1

                if (itemProp?.data) position = itemProp.data.position

                setSelected(
                  !key
                    ? null
                    : {
                        ...itemProp?.data,
                        key: key.key,
                        position,
                        keyId: key.keyId,
                      },
                )
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
