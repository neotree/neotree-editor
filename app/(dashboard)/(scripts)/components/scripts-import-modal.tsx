'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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
import { Checkbox } from "@/components/ui/checkbox";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";

export function ScriptsImportModal({ 
    open, 
    overWriteScriptWithId,
    onOpenChange, 
    onImportSuccess,
}: {
    open: boolean;
    overWriteScriptWithId?: string;
    onOpenChange: (open: boolean) => void;
    onImportSuccess?: () => void;
}) {
    const router = useRouter();
    const routeParams = useParams();

    const { getSites } = useAppContext();
    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [sites, setSites] = useState<Awaited<ReturnType<typeof getSites>>>({ data: [] });

    const {
        formState: { errors },
        reset: resetForm,
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            siteId: '',
            scriptId: '',
            confirmed: false,
        },
    });

    const confirmed = watch('confirmed');

    const disabled = useMemo(() => loading, [loading]);

    const loadSites = useCallback(async () => {
        try {
            const res = await getSites({ types: ['webeditor'], });
            if (res.errors?.length) throw new Error(res.errors.join(', '));
            setSites(res);
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
    }, [getSites, alert, onOpenChange]);

    const importScripts = handleSubmit(async (data) => {
        try {
            if (!data.siteId) throw new Error('Please select a site!');
            if (!data.scriptId) throw new Error('Please provide a script ID!');
            if (!data.confirmed) throw new Error('Please confirm that you want to override this script!');

            setLoading(true);

            const res = await copyScripts({ 
                fromRemoteSiteId: data.siteId, 
                scriptsIds: [data.scriptId], 
                overWriteScriptWithId: overWriteScriptWithId || routeParams.scriptId as string,
                broadcastAction: true,
            });

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            router.refresh();

            alert({
                variant: 'success',
                title: 'Success',
                message: 'Script imported successfully!',
                onClose: () => {
                    onImportSuccess?.();
                    resetForm({ siteId: '', scriptId: '', confirmed: false, });
                    onOpenChange(false);
                },
            });
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to import script: ' + e.message,
            });
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => { if(open) { loadSites();  } }, [open, loadSites]);

    return (
        <>
            {loading && <Loader overlay />}

            <Modal
                open={open}
                onOpenChange={() => {
                    onOpenChange(false);
                }}
                title="Import script"
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
                            onClick={() => importScripts()}
                            disabled={disabled}
                        >
                            Import
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div>
                        <Label htmlFor="siteId">Site *</Label>
                        <Select
                            name="siteId"
                            disabled={disabled}
                            onValueChange={value => setValue('siteId', value, { shouldDirty: true, })}
                        >
                            <SelectTrigger >
                                <SelectValue placeholder="Select site" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sites</SelectLabel>
                                    {sites.data.map(({ siteId, name }) => (
                                        <SelectItem key={siteId} value={siteId}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {!!errors.siteId?.message && <div className="text-xs text-danger mt-1">{errors.siteId.message}</div>}
                    </div>

                    <div>
                        <Label htmlFor="scriptId">Script ID *</Label>
                        <Input
                            {...register('scriptId', { disabled, required: true, })}
                            name="scriptId"
                        />
                        {!!errors.scriptId?.message && <div className="text-xs text-danger mt-1">{errors.scriptId.message}</div>}
                    </div>

                    <div className="flex gap-x-2">
                        <Checkbox 
                            name="confirmed"
                            id="confirmed"
                            disabled={disabled}
                            checked={confirmed}
                            onCheckedChange={() => setValue('confirmed', !confirmed, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="exportable">Confirm that you want to override this script</Label>
                    </div>
                </div>
            </Modal>
        </>
    );
}
