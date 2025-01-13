import { useCallback, useMemo, useState } from "react";

import { useScreenForm } from "../../../hooks/use-screen-form";
import { DrugField, ScriptItem as ItemType } from "@/types";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SelectDrug } from '../../../../components/drugs-library/select';

type Props = {
    children: React.ReactNode | ((params: { extraProps: any }) => React.ReactNode);
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
    types?: { value: string; label: string; }[];
    subTypes?: { value: string; label: string; }[];
    itemType?: string;
    item?: {
        index: number;
        data: DrugField,
    };
};

export function Item<P = {}>({
    children,
    item: itemProp,
    itemType,
    form,
    disabled: disabledProp,
    types = [],
    subTypes = [],
    ...extraProps
}: Props & P) {
    const scriptId = form.getValues('scriptId');

    const [selected, setSelected] = useState<null | DrugField>(null);
    const [open, setOpen] = useState(false);

    const disabled = useMemo(() => !!disabledProp, [disabledProp]);

    const onSave = useCallback(() => {
        if (selected) {
            if (itemProp?.index === undefined) {
                form.setValue('drugs', [...form.getValues('drugs'), selected], { shouldDirty: true, })
            } else {
                form.setValue('drugs', form.getValues('drugs').map((f, i) => ({
                    ...f,
                    ...(i !== itemProp.index ? null : {
                        ...selected,
                    }),
                })));
            }
        }
        setOpen(false);
    }, [selected, itemProp]);

    return (
        <>
            <Modal
                open={open}
                title="Select drug"
                trigger={typeof children === 'function' ? children({ extraProps }) : children}
                onOpenChange={open => {
                    setSelected(itemProp?.data || null);
                    setOpen(open);
                }}
                actions={(
                    <>
                        <span className={cn('text-danger text-xs', disabled && 'hidden')}>* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            disabled={disabled || !selected}
                            onClick={() => onSave()}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div className="flex flex-col gap-y-5">
                        <SelectDrug 
                            disabled={disabled}
                            selected={selected?.key ? [selected.key] : []}
                            unselectable={form.getValues('drugs').map(item => item.key).filter(s => s !== selected?.key!)}
                            onChange={([key]) => {
                                let position = form.getValues('drugs').length ? 
                                    1 
                                    : 
                                    (Math.max(...form.getValues('drugs').map(s => s.position)) + 1);

                                if (itemProp?.data) position = itemProp.data.position;

                                setSelected(!key ? null : {
                                    ...itemProp?.data,
                                    key,
                                    position,
                                })
                            }}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
