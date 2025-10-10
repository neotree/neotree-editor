'use client';

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSites } from "@/hooks/use-sites";
import { ErrorCard } from "@/components/error-card";

const getDefaultFormFields = (overWriteScriptWithId?: string) => ({
    siteId: '',
    scriptId: '',
    confirmed: overWriteScriptWithId ? false : true,
    overwriteDataKeys: true,
    overwriteDrugsLibraryItems: true,
});

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

    overWriteScriptWithId = overWriteScriptWithId || (routeParams.scriptId as string);

    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const { sites, loading: sitesLoading, } = useSites({
        onLoadSitesError: () => onOpenChange(false),
    });

    const isLoading = sitesLoading || loading;
    const disabled = isLoading;

    const {
        formState: { errors },
        reset: resetForm,
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: getDefaultFormFields(overWriteScriptWithId),
    });

    const confirmed = watch('confirmed');
    const overwriteDataKeys = watch('overwriteDataKeys');
    const overwriteDrugsLibraryItems = watch('overwriteDrugsLibraryItems');

    const importScripts = handleSubmit(async (data) => {
        try {
            if (!data.siteId) throw new Error('Please select a site!');
            if (!data.scriptId) throw new Error('Please provide a script ID!');
            if (overWriteScriptWithId && !data.confirmed) throw new Error('Please confirm that you want to overwrite this script!');

            setLoading(true);

            // const res = await copyScripts({ 
            //     fromRemoteSiteId: data.siteId, 
            //     scriptsIds: [data.scriptId], 
            //     overWriteScriptWithId: overWriteScriptWithId,
            //     broadcastAction: true,
            // });

            // TODO: Replace this with server action
            const response = await axios.post('/api/scripts/copy', { 
                fromRemoteSiteId: data.siteId, 
                overwriteDrugsLibraryItems: data.overwriteDrugsLibraryItems, 
                overwriteDataKeys: data.overwriteDataKeys, 
                scriptsIds: [data.scriptId], 
                overWriteScriptWithId: overWriteScriptWithId,
                broadcastAction: true,
            });
            const res = response.data as Awaited<ReturnType<typeof copyScripts>>;

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            router.refresh();

            alert({
                variant: 'success',
                title: 'Success',
                message: 'Script imported successfully!',
                onClose: () => {
                    onImportSuccess?.();
                    resetForm(getDefaultFormFields(overWriteScriptWithId));
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

    return (
        <>
            {isLoading && <Loader overlay />}

            <Modal
                open={open}
                onOpenChange={() => {
                    onOpenChange(false);
                    resetForm(getDefaultFormFields(overWriteScriptWithId));
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
                    <ErrorCard>
                        <div className="p-2 text-sm">
                            New data keys, drugs, feeds & fluids <b>will be appended</b> to the library
                        </div>
                    </ErrorCard>

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
                                    {sites.map(({ siteId, name }) => (
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

                    <div className={cn("flex gap-x-2")}>
                        <Checkbox 
                            name="overwriteDataKeys"
                            id="overwriteDataKeys"
                            disabled={disabled}
                            checked={overwriteDataKeys}
                            onCheckedChange={() => setValue('overwriteDataKeys', !overwriteDataKeys, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="overwriteDataKeys">Overwrite datakeys</Label>
                    </div>

                    <div className={cn("flex gap-x-2")}>
                        <Checkbox 
                            name="overwriteDrugsLibraryItems"
                            id="overwriteDrugsLibraryItems"
                            disabled={disabled}
                            checked={overwriteDrugsLibraryItems}
                            onCheckedChange={() => setValue('overwriteDrugsLibraryItems', !overwriteDrugsLibraryItems, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="overwriteDrugsLibraryItems">Overwrite drugs, fluids & feeds</Label>
                    </div>

                    <div className={cn("flex gap-x-2", !overWriteScriptWithId && 'hidden')}>
                        <Checkbox 
                            name="confirmed"
                            id="confirmed"
                            disabled={disabled}
                            checked={confirmed}
                            onCheckedChange={() => setValue('confirmed', !confirmed, { shouldDirty: true, })}
                        />
                        <Label secondary htmlFor="confirmed">Confirm that you want to overwrite this script</Label>
                    </div>
                </div>
            </Modal>
        </>
    );
}
