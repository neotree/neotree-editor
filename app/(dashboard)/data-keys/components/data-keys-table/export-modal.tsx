'use client';

import { useState } from "react";
import { UploadIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSites } from "@/hooks/use-sites";
import { Loader } from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Dialog, 
    DialogClose, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger,
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
import { useDataKeysCtx } from "@/contexts/data-keys";

export function ExportModal({ uuids, }: {
    uuids: string[];
}) {
    const [open, setOpen] = useState(false);
    const { exporting, exportDataKeys } = useDataKeysCtx();

    const { 
        sites, 
        loading: sitesLoading, 
        loadSites,
    } = useSites({
        loadOnMount: false,
        onLoadSitesError: () => setOpen(false),
    });

    const {
        formState: { errors },
        reset: resetForm,
        watch,
        setValue,
        handleSubmit,
        setError,
    } = useForm({
        defaultValues: {
            siteId: '',
            overwriteExisting: false,
        },
    });

    const siteId = watch('siteId');
    const overwriteExisting = watch('overwriteExisting');

    const isLoading = exporting || sitesLoading;
    const canExport = !!siteId && !isLoading;

    const exportData = handleSubmit(async (formData) => {
        if (!formData.siteId) {
            setError('siteId', { message: 'Site is required', });
        } else {
            await exportDataKeys({
                ...formData,
                uuids,
            });
        }
    });

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={open => {
                    resetForm();
                    if (open) loadSites();
                    setOpen(open);
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        className="h-auto w-auto"
                    >
                        <UploadIcon className="h-4 w-4 mr-1" />
                        <span>{uuids.length > 1 ? `Export ${uuids.length}` : 'Export'}</span>
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Export</DialogTitle>
                        <DialogDescription className="hidden">{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-y-5">
                        <div>
                            <Label htmlFor="siteId">Site *</Label>
                            <Select
                                name="siteId"
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

                        <div className={cn("flex gap-x-2")}>
                            <Checkbox 
                                name="overwriteExisting"
                                id="overwriteExisting"
                                checked={overwriteExisting}
                                onCheckedChange={() => setValue('overwriteExisting', !overwriteExisting, { shouldDirty: true, })}
                            />
                            <Label secondary htmlFor="overwriteExisting">Overwrite existing</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>

                        <Button
                            onClick={exportData}
                            disabled={!canExport}
                        >
                            <UploadIcon className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isLoading && <Loader overlay />}
        </>
    );
}
