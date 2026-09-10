'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DialogClose, } from "@/components/ui/dialog";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";

export function CopyDiagnosesModal({ 
    open, 
    diagnosesIds,
    onOpenChange, 
}: {
    open: boolean;
    diagnosesIds: string[];
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const routeParams = useParams();

    const { copyDiagnoses, getScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState<Awaited<ReturnType<typeof getScripts>>>({ data: [] });

    const {
        formState: { errors },
        reset: resetForm,
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            scriptId: '',
        },
    });

    const disabled = useMemo(() => loading, [loading]);

    const loadScripts = useCallback(async () => {
        try {
            // const res = await getScripts({ returnDraftsIfExist: true, });

            // TODO: Replace this with server action
            const response = await axios.get('/api/scripts?data='+JSON.stringify({ returnDraftsIfExist: true, }));
            const res = response.data as Awaited<ReturnType<typeof getScripts>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            setScripts(res);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'Failed to load sites: ' + e.message,
                variant: 'error',
                onClose: () => onOpenChange(false),
            });
        } finally {
            setLoading(false);
        }
    }, [getScripts, alert, onOpenChange]);

    const onCopyDiagnoses = handleSubmit(async (data) => {
        try {
            if (!data.scriptId) throw new Error('Please select a script!');

            setLoading(true);

            // const res = await copyDiagnoses({ 
            //     diagnosesIds,
            //     toScriptsIds: [data.scriptId], 
            //     broadcastAction: true,
            // });

            // TODO: Replace this with server action
            const response = await axios.post('/api/diagnoses/copy', { 
                diagnosesIds,
                toScriptsIds: [data.scriptId], 
                broadcastAction: true,
            });
            const res = response.data as Awaited<ReturnType<typeof copyDiagnoses>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            alert({
                variant: 'success',
                title: 'Success',
                message: 'Diagnosis copied successfully!',
                onClose: () => {
                    resetForm({ scriptId: '', });
                    onOpenChange(false);
                },
            });
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to copy diagnosis: ' + e.message,
            });
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => { if(open) { loadScripts();  } }, [open, loadScripts]);

    return (
        <>
            {loading && <Loader overlay />}

            <Modal
                open={open}
                onOpenChange={() => {
                    onOpenChange(false);
                }}
                title="Copy diagnoses"
                actions={(
                    <>
                        <span className="text-xs text-danger">* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                disabled={disabled}
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            onClick={() => onCopyDiagnoses()}
                            disabled={disabled}
                        >
                            Copy
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div>
                        <Label htmlFor="scriptId">Script *</Label>
                        <Select
                            name="scriptId"
                            disabled={disabled}
                            onValueChange={value => setValue('scriptId', value, { shouldDirty: true, })}
                        >
                            <SelectTrigger >
                                <SelectValue placeholder="Select script" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Scripts</SelectLabel>
                                    {scripts.data.map(({ scriptId, title }) => (
                                        <SelectItem key={scriptId} value={scriptId}>
                                            {title}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {!!errors.scriptId?.message && <div className="text-xs text-danger mt-1">{errors.scriptId.message}</div>}
                    </div>
                </div>
            </Modal>
        </>
    );
}
