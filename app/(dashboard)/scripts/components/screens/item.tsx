import { useCallback, useMemo, useState } from "react";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";

import { useScreenForm } from "@/hooks/scripts/use-screen-form";
import { ScriptItem as ItemType } from "@/types";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { isEmpty } from "@/lib/isEmpty";
import { cn } from "@/lib/utils";

type Props = {
    children: React.ReactNode | ((params: { extraProps: any }) => React.ReactNode);
    disabled?: boolean;
    item?: {
        index: number;
        data: ItemType,
    };
    form: ReturnType<typeof useScreenForm>;
};

export function Item<P = {}>({
    children,
    item: itemProp,
    form,
    disabled: disabledProp,
    ...extraProps
}: Props & P) {
    const { data: item, index: itemIndex, } = { ...itemProp, };

    const [open, setOpen] = useState(false);

    const getDefaultValues = useCallback(() => {
        return {
            itemId: item?.itemId || v4(),
            id: item?.id || '',
            label: item?.label || '',
            position: item?.position || 1,
            ...item
        } satisfies ItemType;
    }, [item]);

    const {
        reset: resetForm,
        watch,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const id = watch('id');
    const label = watch('label');

    const disabled = useMemo(() => !!disabledProp, [disabledProp]);

    const onSave = handleSubmit(data => {
        if (!isEmpty(itemIndex) && item) {
            form.setValue('items', form.getValues('items').map((f, i) => ({
                ...f,
                ...(i === itemIndex ? data : null),
            })));
        } else {
            form.setValue('items', [...form.getValues('items'), data], { shouldDirty: true, })
        }
        setOpen(false);
    });

    return (
        <>
            <Modal
                open={open}
                title={item ? 'New item' : 'Edit item'}
                trigger={typeof children === 'function' ? children({ extraProps }) : children}
                onOpenChange={open => {
                    setOpen(open);
                    resetForm(getDefaultValues());
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
                            disabled={disabled}
                            onClick={() => onSave()}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                        <div>
                            <Label error={!disabled && !id} htmlFor="id">ID *</Label>
                            <Input
                                {...register('id', { disabled, required: true, })}
                                name="id"
                                error={!disabled && !id}
                            />
                        </div>

                        <div className="flex-1">
                            <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                            <Input
                                {...register('label', { disabled, required: true, })}
                                name="label"
                                error={!disabled && !label}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
