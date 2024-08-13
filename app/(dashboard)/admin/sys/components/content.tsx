'use client';

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { updateSys } from "@/app/actions/sys";
import { useAppContext } from "@/contexts/app";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { useConfirmModal } from "@/hooks/use-confirm-modal";

type Props = {
    _updateSys: typeof updateSys;
};

export function Content({ _updateSys }: Props) {
    const { sys, updateSys } = useAppContext();

    const [form, setForm] = useState(sys.data);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();
    
    const onSave = useCallback(async () => {
        try {
            setLoading(true);

            const { errors, } = await updateSys(form, { broadcastAction: true, });
            
            if (errors?.length) {
                alert({
                    title: 'Error',
                    message: 'Failed to load logs: ' + (errors.join(', ')),
                    variant: 'error',
                });
            } else {
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'System saved successfully!',
                    variant: 'success',
                });
            }
        } finally {
            setLoading(false);
        }
    }, [updateSys, alert, router, form]);

    const isDirty = useMemo(() => JSON.stringify(sys) !== JSON.stringify(form), [sys, form]);

    return (
        <>
            {loading && <Loader overlay />}

            <div className="px-4 flex flex-col gap-y-4">
                {Object.keys(form).map(key => {
                    const value = form[key];

                    const checked = value === 'yes';

                    return (
                        <div
                            key={key}
                            className="flex items-center space-x-2"
                        >
                            <Switch
                                id={key}
                                checked={checked}
                                onCheckedChange={checked => setForm(prev => ({
                                    ...prev,
                                    [key]: checked ? 'yes' : 'no',
                                }))}
                            />

                            <Label htmlFor={key}>{key}</Label>
                        </div>
                    );
                })}

                <div className="flex gap-x-4">
                    <div className="flex-1" />

                    <Button
                        disabled={!isDirty}
                        onClick={() => confirm(onSave, {
                            title: 'Update system',
                            message: 'Are you sure? These changes will affect everyone!',
                            danger: true,
                            positiveLabel: 'Save',
                        })}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </>
    )
}
