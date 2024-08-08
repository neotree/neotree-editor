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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function ScriptsImportModal({ open, overWriteExistingScriptWithId, onOpenChange, }: {
    open: boolean;
    overWriteExistingScriptWithId?: string;
    onOpenChange: (open: boolean) => void;
}) {
    const { _getSites } = useAppContext();
    const { _importRemoteScripts } = useScriptsContext();
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
            scriptId: '',
            confirmed: false,
        },
    });

    const confirmed = watch('confirmed');
    const siteIdValue = watch('siteId');
    const scriptIdValue = watch('scriptId');

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

            const res = await _importRemoteScripts({ 
                siteId: data.siteId, 
                scriptsIds: [{ scriptId: data.scriptId, overWriteExistingScriptWithId }], 
            }, { broadcastAction: true, });

            res.errors?.forEach(e => errors.push(e));

            if (res.success) {
                router.refresh();
                alert({
                    variant: 'success',
                    title: 'Success',
                    message: 'Scripts imported successfully!',
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
                    message: 'Failed to import scripts: ' + errors.join('\n'),
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

                }}
            >
                <DialogContent 
                    hideCloseButton
                    className="flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl"
                >
                    <DialogHeader className="border-b border-b-border px-4 py-4">
                        <DialogTitle>Import scripts</DialogTitle>
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

                        <div>
                            <Label htmlFor="scriptId" error={!!errors.scriptId?.message || !scriptIdValue}>Script ID *</Label>
                            <Input
                                {...register('scriptId', { disabled, required: true, })}
                                name="scriptId"
                                error={!!errors.scriptId?.message || !scriptIdValue}
                            />
                        </div>

                        {!!overWriteExistingScriptWithId && (
                            <div>
                                <div className="flex gap-x-2">
                                    <Checkbox 
                                        name="confirmed"
                                        id="confirmed"
                                        disabled={disabled}
                                        checked={confirmed}
                                        onCheckedChange={() => setValue('confirmed', !confirmed, { shouldDirty: true, })}
                                    />
                                    <Label secondary htmlFor="confirmed">Confirm that you&apos;d like to override this script with the imported script</Label>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="border-t border-t-border px-4 py-2">
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
                            disabled={disabled || !siteIdValue || !scriptIdValue || !confirmed}
                        >
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
