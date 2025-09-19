'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { DataKey } from '@/contexts/data-keys';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { useAlertModal } from '@/hooks/use-alert-modal';

export function DataKeyForm({
    dataKey,
    disabled,
    onClose,
}: {
    dataKey?: DataKey;
    disabled?: boolean;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const { confirm, } = useConfirmModal();
    const { alert, } = useAlertModal();

    const {
        handleSubmit,
    } = useForm({
        defaultValues: {
            name: dataKey?.name || '',
            dataType: dataKey?.dataType || '',
            label: dataKey?.label || '',
            children: dataKey?.children || [],
            defaults: dataKey?.defaults || {},
            version: dataKey?.version || 1,
            ...dataKey,
        },
    });

    const onSave = handleSubmit(async data => {
        try {
            setLoading(true);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'Failed to save data key: ' + e.message,
            });
        } finally {
            setLoading(false);
        }
    });

    return (
        <>
            <Sheet open>
                <SheetContent
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle>{dataKey ? 'Edit' : 'New'} data key</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">

                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex gap-x-2">
                        <div className="ml-auto" />

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                onClick={() => onClose()}
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <SheetClose asChild>
                            <Button
                                onClick={() => onSave()}
                                disabled={disabled}
                            >
                                Save
                            </Button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
