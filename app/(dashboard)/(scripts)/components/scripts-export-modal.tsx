'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { DialogClose, } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";
import { useScriptsContext } from "@/contexts/scripts";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal";

export function ScriptsExportModal({ open, scriptsIdsToExport, setScriptsIdsToExport, onOpenChange, }: {
    open: boolean;
    scriptsIdsToExport: string[];
    setScriptsIdsToExport: (ids: string[]) => void;
    onOpenChange: (open: boolean) => void;
}) {
    const { getSites } = useAppContext();
    const { copyScripts } = useScriptsContext();
    const { alert } = useAlertModal();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sites, setSites] = useState<Awaited<ReturnType<typeof getSites>>>({ data: [] });

    const {
        formState: { errors },
        setValue,
        reset: resetForm,
        handleSubmit,
    } = useForm({
        defaultValues: {
            siteId: '',
        },
    });

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

    const exportScripts = handleSubmit(async (data) => {
        try {
            if (!data.siteId) throw new Error('Please select a site!');

            setLoading(true);

            const res = await copyScripts({ 
                toRemoteSiteId: data.siteId, 
                scriptsIds: scriptsIdsToExport, 
                broadcastAction: true,
            });

            if (res.errors?.length) throw new Error(res.errors.join(', '));

            router.refresh();

            alert({
                variant: 'success',
                title: 'Success',
                message: 'Script exported successfully!',
                onClose: () => {
                    resetForm({ siteId: '', });
                    onOpenChange(false);
                },
            });
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: 'Failed to export script: ' + e.message,
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
                    if (!open) setScriptsIdsToExport([]);
                }}
                title="Export script"
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
                            onClick={() => exportScripts()}
                            disabled={disabled}
                        >
                            Export
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
                </div>
            </Modal>
        </>
    );
}
