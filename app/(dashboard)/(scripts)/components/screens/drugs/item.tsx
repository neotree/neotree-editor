import { useCallback, useMemo, useState } from "react";

import { useScreenForm } from "../../../hooks/use-screen-form";
import { DrugField, ScriptItem as ItemType } from "@/types";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SelectDrug } from '../../drugs-library/select';

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
        
        setOpen(false);
    }, [selected]);

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
                            scriptId={scriptId}
                            disabled={disabled}
                            onChange={([id]) => setSelected(!id ? null : {
                                id,
                            })}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
