'use client';

import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import * as dialog from '@/components/ui/dialog';
import { DataKey } from "@/databases/queries/data-keys";
import { v4 } from 'uuid';

type Props = {
    open: boolean;
    item?: {
        dataKey: DataKey;
        index: number
    };
    onOpenChange: (open: boolean) => void;
};

export function DataKeyForm(props: Props) {
    return (
        <>
            <dialog.Dialog
                open={props.open}
                onOpenChange={props.onOpenChange}
            >
                <dialog.DialogContent
                    hideCloseButton
                    className="flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl"
                >
                    <dialog.DialogHeader className="border-b border-b-border px-4 py-4">
                        <dialog.DialogTitle>
                            {props.item?.dataKey ? 'Edit data key' : 'Add data key'}
                        </dialog.DialogTitle>
                        <dialog.DialogDescription className="hidden">{''}</dialog.DialogDescription>
                    </dialog.DialogHeader>

                    {props.open && <Form {...props} />}
                </dialog.DialogContent>
            </dialog.Dialog>
        </>
    );
}

function Form({ item, onOpenChange }: Props) {
    const { dataKey } = { ...item };

    const {
        control,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            uuid: dataKey?.uuid || v4(),
            name: dataKey?.name || '',
            label: dataKey?.label || '',
            dataType: dataKey?.dataType || null,
            parentKeys: dataKey?.parentKeys || [],
        } satisfies DataKey,
    });

    const onSave = handleSubmit(async data => {
        try {
            onOpenChange(false);
        } catch(e: any) {

        }
    });

    return (
        <>
            <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2">

            </div>

            <dialog.DialogFooter className="border-t border-t-border px-4 py-2 items-center w-full">
                <dialog.DialogClose asChild>
                    <Button
                        variant="ghost"
                    >
                        Cancel
                    </Button>
                </dialog.DialogClose>

                <Button
                    onClick={onSave}
                >
                    Save
                </Button>
            </dialog.DialogFooter>
        </>
    );
}
