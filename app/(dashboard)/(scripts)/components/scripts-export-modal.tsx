'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert } from "@/components/alert";
import { Label } from "@/components/ui/label";

export function ScriptsExportModal({ open, scriptsIdsToExport, setScriptsIdsToExport, onOpenChange, }: {
    open: boolean;
    scriptsIdsToExport: string[];
    setScriptsIdsToExport: (ids: string[]) => void;
    onOpenChange: (open: boolean) => void;
}) {
    const { _getSites } = useAppContext();
    const { importRemoteScripts } = useScriptsContext();
    const { alert } = useAlertModal();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [sites, setSites] = useState<Awaited<ReturnType<typeof _getSites>>>({ data: [] });

    const {
        formState: { errors },
        watch,
        setValue,
        reset: resetForm,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            siteId: '',
        },
    });

    const siteIdValue = watch('siteId');

    const disabled = useMemo(() => loading || importing, [loading, importing]);

    const loadSites = useCallback(() => {
        setLoading(true);
        _getSites({ types: ['webeditor'], })
            .then(setSites)
            .catch((e: any) => setSites({ data: [], errors: [e.message], }))
            .finally(() => {
                setLoading(false);
            });
    }, [_getSites]);

    const importScripts = handleSubmit(async (data) => {
        const errors: string[] = [];
        try {
            setImporting(true);

            const res = await importRemoteScripts({ 
                siteId: data.siteId, 
                scripts: scriptsIdsToExport.map(scriptId => ({ scriptId, })), 
                broadcastAction: true,
            });

            res.errors?.forEach(e => errors.push(e));

            if (res.success) {
                router.refresh();
                alert({
                    variant: 'success',
                    title: 'Success',
                    message: 'Scripts exported successfully!',
                    onClose: () => {
                        resetForm();
                        onOpenChange(false);
                    },
                });
            }
        } catch(e: any) {
            errors.push(e.message);
        } finally {
            setImporting(false);
            if (errors.length) {
                alert({
                    variant: 'error',
                    title: 'Error',
                    message: 'Failed to export scripts: ' + errors.join('\n'),
                });
            }
        }
    });

    useEffect(() => { if(open) { loadSites();  } }, [open, loadSites]);

    if (loading) return <Loader overlay />;

    if (sites.errors) {
        <Alert 
            variant="error"
            title="Error"
            message={"Failed to load sites: " + sites.errors.join('\n')}
            onClose={() => onOpenChange(false)}
        />
    }

    return (
        <>
            {importing && <Loader overlay />}

            <Dialog
                open={open}
                onOpenChange={() => {
                    onOpenChange(false);
                    if (!open) setScriptsIdsToExport([]);
                }}
            >
                <DialogContent 
                    hideCloseButton
                    className="flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl"
                >
                    <DialogHeader className="border-b border-b-border px-4 py-4">
                        <DialogTitle>Export scripts</DialogTitle>
                        <DialogDescription className="hidden"></DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col gap-y-5 overflow-y-auto px-4 py-2">
                        <div>
                            <Label htmlFor="siteId" error={!!errors.siteId?.message || !siteIdValue}>Site *</Label>
                            <Select
                                name="siteId"
                                disabled={disabled}
                                onValueChange={value => setValue('siteId', value, { shouldDirty: true, })}
                            >
                                <SelectTrigger
                                    error={!!errors.siteId?.message || !siteIdValue}
                                >
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
                    
                    <DialogFooter className="border-t border-t-border px-4 py-2">
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
