'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import queryString from "query-string";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import * as sitesActions from '@/app/actions/sites';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getSites } from "@/app/actions/sites";
import { Button } from "@/components/ui/button";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Modal } from "@/components/modal";
import { DialogClose, } from "@/components/ui/dialog";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { useAppContext } from "@/contexts/app";

type Props = typeof sitesActions & {
    sites: Awaited<ReturnType<typeof getSites>>['data'];
};

export function SiteForm({ sites, saveSites }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsObj= useMemo(() => queryString.parse(searchParams.toString() || ''), [searchParams]);

    const site = useMemo(() => sites.filter(s => s.siteId === searchParamsObj.editSiteId)[0], [sites, searchParamsObj.editSiteId]);

    const [saving, setSaving] = useState(false);
    const { viewOnly } = useAppContext();

    const {
        watch,
        register,
        setValue,
        handleSubmit,
    } = useForm({
        defaultValues: {
            id: site?.id || undefined,
            name: site?.name || '',
            link: site?.link || '',
            type: site?.type || 'webeditor',
            siteId: site?.siteId || uuidv4(),
            env: site?.env || 'stage',
            apiKey: site?.apiKey || '',
        },
    });

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const onCloseEditModal = useCallback(() => {
        router.push(`/settings?${queryString.stringify({
            ...searchParamsObj,
            editSiteId: undefined,
        })}`);
    }, [searchParamsObj, router.push]);

    const onSave = handleSubmit(async (data) => {
        if (viewOnly) return;

        try {
            setSaving(true);

            data.link = data.link || '';
            if (data.link[data.link.length - 1] === '') data.link = data.link.substring(0, data.link.length - 1);

            if (!data.link) throw new Error('Missing: link');

            const validate = await axios.post<{ linkIsValid: boolean; }>('/api/sites/validate-link', {
                link: data.link,
                apiKey: data.apiKey,
            });

            const linkIsValid = validate.data?.linkIsValid;

            if (!linkIsValid) throw new Error('Could not validate site link');

            // TODO: Replace with server action
            const res = await axios.post<Awaited<ReturnType<typeof saveSites>>>('/api/sites/save', [data]);
            const errors = res.data?.errors;

            // const res = await saveSites([data]);
            // const errors = res?.errors;

            if (errors?.length) throw new Error(errors.join(', '));
            
            router.refresh();

            alert({
                variant: 'success',
                message: 'Site was saved successfully!',
                onClose: onCloseEditModal,
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                variant: 'error',
                message: 'Failed to site: '+ e.message,
            });
        } finally {
            setSaving(false);
        }
    });

    useEffect(() => {
        if (searchParamsObj.editSiteId && !site) onCloseEditModal();
    }, [searchParamsObj.editSiteId, site, onCloseEditModal]);

    const type = watch('type');
    const env = watch('env');

    return (
        <>
            <Modal
                open={!!searchParamsObj.editSiteId}
                onOpenChange={open => {
                    if (!open) onCloseEditModal();
                }}
                title="Import script"
                actions={(
                    <>
                        <span className="text-xs text-danger">* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                        <Button
                            variant="ghost"
                            disabled={saving}
                                onClick={() => onCloseEditModal()}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        {!viewOnly && (
                            <Button
                                onClick={() => onSave()}
                                disabled={saving || viewOnly}
                            >
                                Save
                            </Button>
                        )}
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div className="flex [&>*]:flex-1 gap-x-2">
                        <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                value={type || ''}
                                disabled={saving || viewOnly}
                                name="type"
                                onValueChange={(v: typeof type) => {
                                    setValue('type', v);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="webeditor">webeditor</SelectItem>
                                    <SelectItem value="nodeapi">nodeapi</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="env">Environment *</Label>
                            <Select
                                value={env || ''}
                                disabled={saving || viewOnly}
                                name="env"
                                onValueChange={(v: typeof env) => {
                                    setValue('env', v);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select environment" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="production">production</SelectItem>
                                    <SelectItem value="stage">stage</SelectItem>
                                    <SelectItem value="development">development</SelectItem>
                                    <SelectItem value="demo">demo</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input 
                            {...register('name', { disabled: saving || viewOnly, required: true, })}
                            placeholder="Site name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="link">Link *</Label>
                        <Input 
                            {...register('link', { disabled: saving || viewOnly, required: true, })}
                            placeholder="Site link"
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
