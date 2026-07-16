"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import { EditIcon, ExternalLinkIcon, EyeIcon, MoreVertical, PlusIcon, TrashIcon } from 'lucide-react';
import { arrayMoveImmutable } from "array-move";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { type DataKeyFormData, useDataKeysCtx } from '@/contexts/data-keys';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from '@/components/data-table';
import { dataKeyTypes } from '@/constants';
import { Loader } from '@/components/loader';
import { SelectModal } from "@/components/select-modal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useIsLocked } from '@/hooks/use-is-locked';
import { useAppContext } from "@/contexts/app";
import { cn } from "@/lib/utils";
import type { SaveDataKeysResponse } from "@/databases/mutations/data-keys/_save";
import type { UpdateDataKeysRefsResponse } from "@/databases/mutations/data-keys/_update_data_keys_refs";
import type { DataKey } from '@/contexts/data-keys';
import { buildDataKeyParentIndex, getDataKeyParentTitle, wouldCreateDataKeyCycle } from '@/lib/data-key-children';
import { normalizeDataKeyType } from '@/lib/data-key-types';
import { fetchDataKeyUnlinkImpact, type DeleteImpactItem } from './delete-confirmation';
import { DataKeyDeleteReplacementDialog } from './delete-replacement-dialog';

type SaveRefsImpact = NonNullable<NonNullable<SaveDataKeysResponse['info']>['refs']>;

export function DataKeyForm(props: {
    disabled?: boolean;
}) {
    const { loadingDataKeys, } = useDataKeysCtx();
    
    if (loadingDataKeys) return <Loader overlay />;

    return <Form {...props} />;
}

function Form({
    disabled,
}: {
    disabled?: boolean;
}) {
    const { dataKeyId, } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { allDataKeys: dataKeys, loadingDataKeys, saving, saveDataKeys, } = useDataKeysCtx();
    const { confirm, } = useConfirmModal();
    const { alert } = useAlertModal();
    const { viewOnly } = useAppContext();

    const dataKey = useMemo(() => dataKeys.find(k => (
        (k.uuid === dataKeyId) ||
        (k.uniqueKey === dataKeyId)
    )), [dataKeys, dataKeyId]);
    const prefill = useMemo(() => ({
        name: searchParams.get('name') || '',
        label: searchParams.get('label') || '',
        dataType: searchParams.get('dataType') || '',
    }), [searchParams]);

    const isLocked = useIsLocked({
        isDraft: !!dataKey?.isDraft,
        userId: dataKey?.draftCreatedByUserId,
    });

    const isReadOnly = !!disabled || isLocked || viewOnly;

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
    } = useForm({
        defaultValues: {
            ...dataKey,
            name: dataKey?.name || prefill.name || '',
            refId: dataKey?.refId || '',
            dataType: dataKey?.dataType || prefill.dataType || '',
            confidential: dataKey ? !!dataKey.confidential : true,
            label: dataKey?.label || prefill.label || '',
            options: dataKey?.options || [],
            metadata: dataKey?.metadata || {},
            version: dataKey?.version || 1,
            deletedUniqueKeys: [] as string[],
            optionReplacements: {} as Record<string, string>,
        },
    });

    const dataType = watch('dataType');
    const uniqueKeyValue = watch('uniqueKey');
    const options = watch('options');
    const nameValue = watch('name');
    const labelValue = watch('label');
    const confidential = !!watch('confidential');
    const optionsSignature = useMemo(() => JSON.stringify(options || []), [options]);
    const savedOptionsSignature = useMemo(() => JSON.stringify(dataKey?.options || []), [dataKey?.options]);

    const [previewingImpact, setPreviewingImpact] = useState(false);
    const [impactPreview, setImpactPreview] = useState<UpdateDataKeysRefsResponse['affected']>();
    const [impactPreviewStats, setImpactPreviewStats] = useState<UpdateDataKeysRefsResponse['info']>();
    const [saveImpact, setSaveImpact] = useState<SaveRefsImpact>();
    const [preparingUnlink, setPreparingUnlink] = useState(false);
    const [unlinkDialog, setUnlinkDialog] = useState<null | {
        children: DataKey[];
        impact: DeleteImpactItem[];
    }>(null);

    const dataTypeInfo = dataKeyTypes.find(t => t.value === dataType);

    const buildPreviewPayload = useCallback(() => {
        const values = getValues();
        return [{
            uuid: (values as any)?.uuid || dataKey?.uuid || '',
            uniqueKey: (values as any)?.uniqueKey || dataKey?.uniqueKey || '',
            name: values.name || '',
            label: values.label || '',
            dataType: values.dataType || '',
            confidential: !!values.confidential,
            refId: values.refId || '',
            options: values.options || [],
            metadata: values.metadata || {},
            version: typeof values.version === 'string' ? Number(values.version) : values.version,
        }];
    }, [getValues, dataKey?.uuid, dataKey?.uniqueKey]);

    const loadImpactPreview = useCallback(async () => {
        if (!dataKey?.uuid && !dataKey?.uniqueKey) {
            setImpactPreview(undefined);
            setImpactPreviewStats(undefined);
            return;
        }

        try {
            setPreviewingImpact(true);
            const response = await axios.post<UpdateDataKeysRefsResponse>('/api/data-keys/refs-preview', {
                data: buildPreviewPayload(),
            });
            setImpactPreview(response.data.affected);
            setImpactPreviewStats(response.data.info);
        } catch (e: any) {
            setImpactPreview(undefined);
            setImpactPreviewStats(undefined);
        } finally {
            setPreviewingImpact(false);
        }
    }, [dataKey?.uuid, dataKey?.uniqueKey, buildPreviewPayload]);

    useEffect(() => {
        if (!dataKey) return;
        const changed = (
            `${nameValue || ''}` !== `${dataKey.name || ''}` ||
            `${labelValue || ''}` !== `${dataKey.label || ''}` ||
            `${uniqueKeyValue || ''}` !== `${dataKey.uniqueKey || ''}` ||
            `${dataType || ''}` !== `${dataKey.dataType || ''}` ||
            !!confidential !== !!dataKey.confidential ||
            optionsSignature !== savedOptionsSignature
        );
        if (!changed) {
            setImpactPreview(undefined);
            setImpactPreviewStats(undefined);
            return;
        }

        const timeout = setTimeout(() => {
            loadImpactPreview();
        }, 350);

        return () => clearTimeout(timeout);
    }, [
        dataKey,
        nameValue,
        labelValue,
        uniqueKeyValue,
        dataType,
        confidential,
        optionsSignature,
        savedOptionsSignature,
        loadImpactPreview,
    ]);

    const onSave = handleSubmit(async (data) => {
        if (isReadOnly) return;

        const uuid = (data as any)?.uuid || dataKey?.uuid || uuidv4();
        const uniqueKey = (data as any)?.uniqueKey ?? dataKey?.uniqueKey ?? null;
        const payload = {
            ...data,
            uuid,
            uniqueKey,
            version: typeof data.version === "string" ? Number(data.version) : data.version,
        } as DataKeyFormData & {
            uuid: string;
            uniqueKey?: string | null;
        };

        setValue("uuid" as any, uuid);
        if (uniqueKey) {
            setValue("uniqueKey" as any, uniqueKey);
        }

        const res = await saveDataKeys([{ ...(payload as unknown as DataKeyFormData) }]);
        if (res && 'info' in res) {
            setSaveImpact(res.info?.refs);
        }
        if (res && !res.errors?.length) {
            setValue('deletedUniqueKeys', []);
            setValue('optionReplacements', {});
        }
    });

    const isFormDisabled = isReadOnly || saving;

    const children = useMemo(() => {
        return options.map(o => dataKeys.find(k => k.uniqueKey === o)!).filter(k => k);
    }, [dataKeys, options]);

    // Parents that link this key as a child option — shown so users understand
    // why the key cannot be deleted from the library and where to unlink it.
    const linkedParents = useMemo(() => {
        if (!dataKey?.uniqueKey) return [];
        return buildDataKeyParentIndex(dataKeys).get(dataKey.uniqueKey) || [];
    }, [dataKeys, dataKey?.uniqueKey]);

    // Only keys that keep the option pool healthy are offered: no self-link, no
    // circular references, and — once the pool has a single type — only keys of
    // that same type, so every child always has valid replacement candidates.
    // The description tells users WHY a key they searched for may be missing.
    const { addableDataKeys, addableDescription } = useMemo(() => {
        const parentUniqueKey = `${dataKey?.uniqueKey || uniqueKeyValue || ''}`.trim();
        const childTypes = new Set(children.map(k => normalizeDataKeyType(k.dataType)).filter(Boolean));
        const requiredType = childTypes.size === 1 ? Array.from(childTypes)[0] : null;
        const requiredTypeLabel = requiredType ? (children[0]?.dataType || requiredType) : '';

        const filtered = dataKeys.filter(k => {
            if (!k.uniqueKey || options.includes(k.uniqueKey)) return false;
            if (parentUniqueKey && k.uniqueKey === parentUniqueKey) return false;
            if (requiredType && normalizeDataKeyType(k.dataType) !== requiredType) return false;
            if (parentUniqueKey && wouldCreateDataKeyCycle({
                dataKeys,
                parentUniqueKey,
                childUniqueKey: k.uniqueKey,
            })) return false;
            return true;
        });

        return {
            addableDataKeys: filtered,
            addableDescription: requiredType
                ? `Only ${requiredTypeLabel} data keys are listed, to match the existing options. Already-linked keys and keys that would create circular references are hidden.`
                : 'Already-linked keys and keys that would create circular references are hidden.',
        };
    }, [dataKeys, options, children, dataKey?.uniqueKey, uniqueKeyValue]);

    // Removing an option UNLINKS the child from this data key — the child stays
    // in the library. Only children that were part of the last-saved options are
    // recorded for server-side screen sync; unsaved additions are dropped locally.
    const unlinkOption = useCallback((child: DataKey, replacementUniqueKey?: string) => {
        const currentOptions = getValues('options') || [];
        setValue('options', currentOptions.filter(o => o !== child.uniqueKey));

        const isSavedOption = (dataKey?.options || []).includes(child.uniqueKey);
        if (!isSavedOption) return;

        const currentDeleted = getValues('deletedUniqueKeys') || [];
        setValue('deletedUniqueKeys', Array.from(new Set([...currentDeleted, child.uniqueKey])));

        if (replacementUniqueKey) {
            setValue('optionReplacements', {
                ...(getValues('optionReplacements') || {}),
                [child.uniqueKey]: replacementUniqueKey,
            });
        }
    }, [getValues, setValue, dataKey?.options]);

    const handleUnlinkOptions = useCallback(async (childrenToUnlink: DataKey[]) => {
        if (!childrenToUnlink.length) return;

        const savedChildren = childrenToUnlink.filter(child => (
            !!dataKey?.uniqueKey && (dataKey?.options || []).includes(child.uniqueKey)
        ));

        if (savedChildren.length) {
            try {
                setPreparingUnlink(true);
                const impact = await fetchDataKeyUnlinkImpact(
                    dataKey!.uniqueKey,
                    savedChildren.map(child => child.uniqueKey),
                );
                if (impact.some(item => item.scripts.length > 0)) {
                    setUnlinkDialog({ children: childrenToUnlink, impact });
                    return;
                }
            } catch (e: any) {
                alert({
                    title: 'Error',
                    message: `Failed to check option usage: ${e.message}`,
                    variant: 'error',
                });
                return;
            } finally {
                setPreparingUnlink(false);
            }
        }

        const titles = childrenToUnlink
            .map(child => `"${child.name || child.label || child.uniqueKey}"`)
            .join(', ');

        confirm(() => childrenToUnlink.forEach(child => unlinkOption(child)), {
            title: childrenToUnlink.length === 1 ? 'Unlink option' : `Unlink ${childrenToUnlink.length} options`,
            message: `${titles} will be unlinked from this data key. ${childrenToUnlink.length === 1 ? 'It' : 'They'} will NOT be deleted from the library.`,
            positiveLabel: 'Unlink',
            danger: true,
        });
    }, [dataKey, alert, confirm, unlinkOption]);

    // Queued unlinks are applied on save — this keeps them reviewable (and
    // undoable) instead of invisible between removal and save.
    const pendingUnlinkKeys = watch('deletedUniqueKeys');
    const pendingReplacementsMap = watch('optionReplacements');
    const pendingUnlinks = useMemo(() => {
        return (pendingUnlinkKeys || []).map(uniqueKey => {
            const child = dataKeys.find(k => k.uniqueKey === uniqueKey);
            const replacementKey = (pendingReplacementsMap || {})[uniqueKey] || '';
            const replacement = !replacementKey ? undefined : dataKeys.find(k => k.uniqueKey === replacementKey);
            return {
                uniqueKey,
                title: child?.name || child?.label || uniqueKey,
                replacementTitle: !replacementKey ? '' : (replacement?.name || replacement?.label || replacementKey),
            };
        });
    }, [pendingUnlinkKeys, pendingReplacementsMap, dataKeys]);

    const undoUnlink = useCallback((uniqueKey: string) => {
        setValue('deletedUniqueKeys', (getValues('deletedUniqueKeys') || []).filter(k => k !== uniqueKey));

        const replacementsLeft = { ...(getValues('optionReplacements') || {}) };
        delete replacementsLeft[uniqueKey];
        setValue('optionReplacements', replacementsLeft);

        const currentOptions = getValues('options') || [];
        if (!currentOptions.includes(uniqueKey)) {
            setValue('options', [...currentOptions, uniqueKey]);
        }
    }, [getValues, setValue]);

    const displayLoader = loadingDataKeys || saving || preparingUnlink;

    const renderAffectedTables = useCallback((affected?: UpdateDataKeysRefsResponse['affected']) => {
        if (!affected) return null;

        const getUsageLinkLabel = (usage: NonNullable<UpdateDataKeysRefsResponse['affected']>['usages'][number]) => {
            if (usage.kind === 'screen') return 'screen';
            if (usage.kind === 'screen_field') return 'field';
            if (usage.kind === 'screen_item') return 'item';
            if (usage.kind === 'screen_field_item') return 'field item';
            if (usage.kind === 'diagnosis') return 'diagnosis';
            if (usage.kind === 'diagnosis_symptom') return 'symptom';
            if (usage.kind === 'problem') return 'problem';
            return 'open';
        };

        const getUsageHref = (usage: NonNullable<UpdateDataKeysRefsResponse['affected']>['usages'][number]) => {
            if (usage.kind === 'screen_field' && usage.screenId && usage.id) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?field=${usage.id}`;
            }
            if (usage.kind === 'screen_field' && usage.screenId && Number.isFinite(usage.fieldIndex)) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?field=${usage.fieldIndex}`;
            }
            if (usage.kind === 'screen_item' && usage.screenId && usage.id) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?item=${usage.id}`;
            }
            if (usage.kind === 'screen_item' && usage.screenId && Number.isFinite(usage.screenItemIndex)) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?item=${usage.screenItemIndex}`;
            }
            if (
                usage.kind === 'screen_field_item'
                && usage.screenId
                && Number.isFinite(usage.fieldIndex)
                && usage.id
            ) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?field=${usage.fieldIndex}&fieldItem=${usage.id}`;
            }
            if (
                usage.kind === 'screen_field_item'
                && usage.screenId
                && Number.isFinite(usage.fieldIndex)
                && Number.isFinite(usage.fieldItemIndex)
            ) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?field=${usage.fieldIndex}&fieldItem=${usage.fieldItemIndex}`;
            }
            if (usage.kind === 'screen_field_item' && usage.screenId && Number.isFinite(usage.fieldIndex)) {
                return `/script/${usage.scriptId}/screen/${usage.screenId}?field=${usage.fieldIndex}`;
            }
            if (usage.kind === 'diagnosis_symptom' && usage.diagnosisId && usage.id) {
                return `/script/${usage.scriptId}/diagnosis/${usage.diagnosisId}?symptom=${usage.id}`;
            }
            if (usage.kind === 'diagnosis_symptom' && usage.diagnosisId && Number.isFinite(usage.diagnosisSymptomIndex)) {
                return `/script/${usage.scriptId}/diagnosis/${usage.diagnosisId}?symptom=${usage.diagnosisSymptomIndex}`;
            }
            if (usage.kind === 'diagnosis_symptom' && usage.diagnosisId) {
                return `/script/${usage.scriptId}/diagnosis/${usage.diagnosisId}`;
            }
            if (usage.problemId) return `/script/${usage.scriptId}/problem/${usage.problemId}`;
            if (usage.diagnosisId) return `/script/${usage.scriptId}/diagnosis/${usage.diagnosisId}`;
            if (usage.screenId) return `/script/${usage.scriptId}/screen/${usage.screenId}`;
            return `/script/${usage.scriptId}`;
        };

        const usageByScript = new Map<string, NonNullable<UpdateDataKeysRefsResponse['affected']>['usages']>();
        (affected.usages || []).forEach((usage) => {
            const current = usageByScript.get(usage.scriptId) || [];
            current.push(usage);
            usageByScript.set(usage.scriptId, current);
        });

        const scriptRows = (affected.scripts || []).map((script) => ({
            ...script,
            usages: usageByScript.get(script.scriptId) || [],
        }));

        return (
            <div className="space-y-3">
                <DataTable
                    title={`Affected scripts (${scriptRows.length})`}
                    rowRenderer={({ props, cells, rowIndex }) => {
                        const row = scriptRows[rowIndex];
                        if (!row) return null;

                        return (
                            <>
                                <TableRow {...props}>
                                    {cells}
                                </TableRow>

                                {!!row.usages.length && (
                                    <TableRow {...props} className={cn(props.className, 'bg-yellow-50 hover:bg-yellow-50 p-0')}>
                                        <TableCell colSpan={cells.length} className="p-0">
                                            <div className="flex flex-col gap-y-2">
                                                {row.usages.map((usage, index) => {
                                                    return (
                                                        <div key={`${usage.kind}-${usage.id}-${index}`} className="text-xs">
                                                            <div className="flex items-center gap-x-2 p-2 px-4">
                                                                <div className="font-medium">{usage.title}</div>
                                                                <div className="text-muted-foreground">{usage.location}</div>
                                                                <div className="ml-auto flex gap-x-2">
                                                                    <Link
                                                                        href={getUsageHref(usage)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-x-1"
                                                                    >
                                                                        {getUsageLinkLabel(usage)}
                                                                        <ExternalLinkIcon className="h-3 w-3" />
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                            {(index < row.usages.length - 1) && <Separator />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        );
                    }}
                    columns={[
                        { name: 'Script title' },
                        { name: 'Script ID' },
                        { name: 'Matches', align: 'right' },
                        {
                            name: 'Usage links',
                            cellClassName: 'min-w-[220px]',
                            cellRenderer({ rowIndex }) {
                                const script = scriptRows[rowIndex];
                                if (!script?.usages.length) {
                                    return <span className="text-xs text-muted-foreground">No direct usage links</span>;
                                }

                                const visibleUsages = script.usages.slice(0, 3);

                                return (
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {visibleUsages.map((usage, index) => (
                                            <Link
                                                key={`${usage.kind}-${usage.id}-${index}`}
                                                href={getUsageHref(usage)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-primary hover:bg-primary/10"
                                            >
                                                <span>{usage.title || getUsageLinkLabel(usage)}</span>
                                                <ExternalLinkIcon className="h-3 w-3" />
                                            </Link>
                                        ))}
                                        {script.usages.length > visibleUsages.length && (
                                            <span className="text-muted-foreground">
                                                +{script.usages.length - visibleUsages.length} more
                                            </span>
                                        )}
                                    </div>
                                );
                            },
                        },
                        {
                            name: '',
                            align: 'right',
                            cellClassName: 'w-12',
                            cellRenderer({ rowIndex }) {
                                const script = scriptRows[rowIndex];
                                if (!script?.scriptId) return null;

                                return (
                                    <Link
                                        href={`/script/${script.scriptId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open script"
                                    >
                                        <ExternalLinkIcon className="h-4 w-4 text-primary" />
                                    </Link>
                                );
                            },
                        },
                    ]}
                    data={scriptRows.map(s => [
                        s.scriptTitle || '',
                        s.scriptId || '',
                        `${s.usages.length}`,
                        '',
                        '',
                    ])}
                />
            </div>
        );
    }, []);


    return (
        <>
            {displayLoader && <Loader overlay />}

            <DataKeyDeleteReplacementDialog
                mode="unlink"
                open={!!unlinkDialog}
                impact={unlinkDialog?.impact || []}
                dataKeys={children.filter(k => !(unlinkDialog?.children || []).some(c => c.uniqueKey === k.uniqueKey))}
                title="Choose replacements before unlinking"
                onOpenChange={(open) => {
                    if (!open) setUnlinkDialog(null);
                }}
                onConfirm={(replacements) => {
                    (unlinkDialog?.children || []).forEach(child => {
                        const replacementUuid = replacements[child.uuid];
                        const replacement = dataKeys.find(k => k.uuid === replacementUuid);
                        unlinkOption(child, replacement?.uniqueKey);
                    });
                    setUnlinkDialog(null);
                }}
            />

            <Card>
                <CardContent>
                    <CardHeader>
                        <CardTitle>{!dataKey ? 'New' : 'Edit'} data key</CardTitle>
                        <CardDescription className="hidden">{''}</CardDescription>
                    </CardHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                        <Controller 
                            control={control}
                            name="dataType"
                            disabled={isFormDisabled}
                            rules={{ required: true, }}
                            render={({ field: { value, onChange, } }) => {
                                return (
                                    <>
                                        <div className="px-4">
                                            <Label htmlFor="name">Data type *</Label>
                                            <Select
                                                value={value}
                                                name="name"
                                                disabled={isFormDisabled}
                                                onValueChange={val => {
                                                    onChange(val);

                                                    const dataTypeInfo = dataKeyTypes.find(t => t.value === val);

                                                    setValue(
                                                        'options',
                                                        !dataTypeInfo?.hasChildren ? [] : (dataKey?.options || []),
                                                    );
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {dataKeyTypes.map((t) => (
                                                            <SelectItem key={t.value} value={t.value}>
                                                                {t.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                );
                            }}
                        />

                        <div className="px-4">
                            <Label htmlFor="name">Key *</Label>
                            <Input 
                                disabled={isFormDisabled}
                                {...register('name', {
                                    disabled: isFormDisabled,
                                    required: true,
                                })}
                            />
                        </div>

                        <div className="px-4">
                            <Label htmlFor="label">Label *</Label>
                            <Input 
                                disabled={isFormDisabled}
                                {...register('label', {
                                    disabled: isFormDisabled,
                                    required: true,
                                })}
                            />
                        </div>

                        <div className="px-4 hidden">
                            <Label htmlFor="refId">Ref ID</Label>
                            <Input 
                                disabled={isFormDisabled}
                                {...register('refId', {
                                    disabled: isFormDisabled,
                                    required: false,
                                })}
                            />
                        </div>

                        <div className="px-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="dataKeyConfidential"
                                    checked={confidential}
                                    disabled={isFormDisabled}
                                    onCheckedChange={checked => {
                                        if (!checked && confidential) {
                                            confirm(
                                                () => setValue('confidential', false, { shouldDirty: true }),
                                                {
                                                    title: 'Disable confidentiality?',
                                                    message: 'You are about to mark this Data Key as non-confidential. This can expose sensitive data in linked scripts. Only continue if you fully understand the impact.',
                                                    danger: true,
                                                },
                                            );
                                            return;
                                        }

                                        setValue('confidential', checked, { shouldDirty: true });
                                    }}
                                />
                                <Label htmlFor="dataKeyConfidential">Confidential</Label>
                            </div>
            
                        </div>

                        <Controller
                            control={control}
                            name="options"
                            disabled={isFormDisabled}
                            render={({ field: { value, onChange, }, }) => {
                                if (!dataTypeInfo?.hasChildren) return <></>;

                                return (
                                    <div className="mt-4 pt-4 border-t border-t-border">
                                        <DataTable 
                                            sortable={!isReadOnly}
                                            onSort={(oldIndex: number, newIndex: number) => {
                                                if (isReadOnly) return;
                                                const sorted = arrayMoveImmutable([...value], oldIndex, newIndex);
                                                onChange(sorted);
                                            }}
                                            search={{}}
                                            title="Options"
                                            headerActions={isReadOnly ? null : (
                                                <>
                                                    {children.length > 1 && (
                                                        <SelectModal
                                                            multiple
                                                            search={{
                                                                placeholder: 'Search options',
                                                            }}
                                                            description="Selected options will be unlinked from this data key — they stay in the library."
                                                            options={children.map(k => ({
                                                                value: k.uniqueKey,
                                                                label: k.name,
                                                                caption: k.dataType || '',
                                                                description: k.label,
                                                            }))}
                                                            trigger={(
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-auto h-auto text-destructive hover:text-destructive"
                                                                >
                                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                                    Unlink
                                                                </Button>
                                                            )}
                                                            onSelect={(selectedOptions) => {
                                                                const chosen = selectedOptions
                                                                    .map(o => children.find(k => k.uniqueKey === `${o.value}`)!)
                                                                    .filter(k => k);
                                                                if (chosen.length) setTimeout(() => handleUnlinkOptions(chosen), 0);
                                                            }}
                                                        />
                                                    )}

                                                    <SelectModal
                                                        multiple
                                                        search={{
                                                            placeholder: 'Search data keys',
                                                        }}
                                                        description={addableDescription}
                                                        options={addableDataKeys.map(k => ({
                                                            label: k.name,
                                                            value: k.uniqueKey,
                                                            caption: k.dataType || '',
                                                            description: k.label,
                                                        }))}
                                                        trigger={(
                                                            <Button 
                                                                variant="ghost"
                                                                className="w-auto h-auto"
                                                            >
                                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                                Add
                                                            </Button>
                                                        )}
                                                        onSelect={(keys) => {
                                                            const added = keys.map(k => `${k.value}`);
                                                            onChange([...value, ...added]);

                                                            // Re-adding a child cancels its pending unlink.
                                                            const addedSet = new Set(added);
                                                            const currentDeleted = getValues('deletedUniqueKeys') || [];
                                                            if (currentDeleted.some(k => addedSet.has(k))) {
                                                                setValue('deletedUniqueKeys', currentDeleted.filter(k => !addedSet.has(k)));
                                                                const currentReplacements = { ...(getValues('optionReplacements') || {}) };
                                                                added.forEach(k => delete currentReplacements[k]);
                                                                setValue('optionReplacements', currentReplacements);
                                                            }
                                                        }}
                                                    />
                                                </>
                                            )}
                                            noDataMessage={(
                                                <div className="mt-4 flex flex-col items-center justify-center gap-y-2">
                                                    <div>Data keys has no options</div>
                                                </div>
                                            )}
                                            columns={[
                                                {
                                                    name: 'Key',
                                                },
                                                {
                                                    name: 'Label',
                                                },
                                                {
                                                    name: 'Data type',
                                                },

                                                {
                                                    name: '',
                                                    align: 'right',
                                                    cellClassName: 'w-20',
                                                    cellRenderer({ rowIndex }) {
                                                        // Rows render from `children` (resolved keys), so index into
                                                        // that — indexing into `options` would drift when an option
                                                        // is missing from the library.
                                                        const child = children[rowIndex];

                                                        if (!child) return null;

                                                        return (
                                                            <>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger>
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </DropdownMenuTrigger>

                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link
                                                                                href={`/data-keys/edit/${child.uuid}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                {isReadOnly ? (
                                                                                    <>
                                                                                        <EyeIcon className="h-4 w-4 mr-2" /> View
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <EditIcon className="h-4 w-4 mr-2" /> Edit
                                                                                    </>
                                                                                )}
                                                                            </Link>
                                                                        </DropdownMenuItem>

                                                                        {!isReadOnly && (
                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onClick={() => setTimeout(() => handleUnlinkOptions([child]), 0)}
                                                                            >
                                                                                <TrashIcon className="h-4 w-4 mr-2" /> Unlink
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </>
                                                        );
                                                    },
                                                }
                                            ]}
                                            data={children.map(v => [
                                                v.name || '',
                                                v.label || '',
                                                v.dataType || '',
                                                '',
                                            ])}
                                        />
                                    </div>
                                );
                            }}  
                        />
                    </div>

                    <br />

                    <div className="px-4 space-y-4">
                        {!!pendingUnlinks.length && !isReadOnly && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-3">
                                <div className="font-medium text-amber-950">
                                    Pending unlinks ({pendingUnlinks.length})
                                </div>
                                <div className="text-sm text-amber-900">
                                    Applied when you save. Linked screens will be updated accordingly; cancelling discards these.
                                </div>
                                <div className="space-y-1">
                                    {pendingUnlinks.map(item => (
                                        <div
                                            key={item.uniqueKey}
                                            className="flex items-center justify-between gap-x-2 rounded border border-amber-200 bg-white px-2 py-1 text-sm"
                                        >
                                            <div className="min-w-0 truncate">
                                                <span className="font-medium">{item.title}</span>
                                                <span className="text-muted-foreground">
                                                    {item.replacementTitle
                                                        ? <> — replaced by <span className="font-medium text-foreground">{item.replacementTitle}</span></>
                                                        : ' — removed from linked screens'}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-auto w-auto px-2 py-1 text-xs"
                                                onClick={() => undoUnlink(item.uniqueKey)}
                                            >
                                                Undo
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!!linkedParents.length && (
                            <div className="rounded-md border border-border p-3 space-y-3">
                                <div className="font-medium">Linked parents ({linkedParents.length})</div>
                                <div className="text-sm text-muted-foreground">
                                    This data key is a child option of the data keys below. It cannot be deleted from the library while linked — unlink it from each parent first.
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {linkedParents.map(parent => (
                                        <Link
                                            key={parent.uniqueKey}
                                            href={`/data-keys/edit/${parent.uuid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-primary hover:bg-primary/10"
                                        >
                                            <span>{getDataKeyParentTitle(parent)}</span>
                                            <ExternalLinkIcon className="h-3 w-3" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!!dataKey || !!saveImpact?.affected) && (
                            <div className="rounded-md border border-border p-3 space-y-3">
                                <div className="flex items-center justify-between gap-x-2">
                                    <div className="font-medium">Affected entities</div>
                                    {!!dataKey && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={previewingImpact || isFormDisabled}
                                            onClick={() => loadImpactPreview()}
                                        >
                                            {previewingImpact ? 'Refreshing...' : 'Refresh Preview'}
                                        </Button>
                                    )}
                                </div>

                                {!!impactPreview && (
                                    <>
                                        <div className="text-sm">
                                            Before update: {(impactPreview.scripts?.length || 0)} scripts, {(impactPreview.screens?.length || 0)} screens, {(impactPreview.diagnoses?.length || 0)} diagnoses
                                        </div>
                                        {renderAffectedTables(impactPreview)}
                                    </>
                                )}
                                {!impactPreview && !!dataKey && !previewingImpact && (
                                    <div className="text-sm text-muted-foreground">
                                        No pending impact preview yet. Change key, label, type, or confidentiality to load preview.
                                    </div>
                                )}

                                {!!saveImpact?.affected && (
                                    <>
                                        <div className="text-sm">
                                            After update: {(saveImpact.affected.scripts?.length || 0)} scripts, {(saveImpact.affected.screens?.length || 0)} screens, {(saveImpact.affected.diagnoses?.length || 0)} diagnoses
                                        </div>
                                        {renderAffectedTables(saveImpact.affected)}
                                    </>
                                )}

                                {!!impactPreviewStats && (
                                    <div className="text-xs text-muted-foreground">
                                        Preview matching: {impactPreviewStats.matchedByUniqueKey} key-id, {impactPreviewStats.matchedByLegacyName} legacy-name, {impactPreviewStats.matchedByLegacyLabel} legacy-label, {impactPreviewStats.ambiguousLegacySkips} ambiguous skipped
                                    </div>
                                )}

                                {!!saveImpact?.info && (
                                    <div className="text-xs text-muted-foreground">
                                        Save matching: {saveImpact.info.matchedByUniqueKey} key-id, {saveImpact.info.matchedByLegacyName} legacy-name, {saveImpact.info.matchedByLegacyLabel} legacy-label, {saveImpact.info.ambiguousLegacySkips} ambiguous skipped
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <CardFooter className="gap-x-2 mt-4">
                        <div className="ml-auto" />

                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (pendingUnlinks.length && !isReadOnly) {
                                    confirm(() => router.push('/data-keys'), {
                                        title: 'Discard pending unlinks?',
                                        message: `You have ${pendingUnlinks.length} pending unlink${pendingUnlinks.length === 1 ? '' : 's'} that will be lost if you leave without saving.`,
                                        positiveLabel: 'Leave',
                                        danger: true,
                                    });
                                    return;
                                }
                                router.push('/data-keys');
                            }}
                        >
                            Cancel
                        </Button>

                        {!isReadOnly && (
                            <Button
                                onClick={() => onSave()}
                                disabled={isFormDisabled || previewingImpact}
                            >
                                Save
                            </Button>
                        )}
                    </CardFooter>
                </CardContent>
            </Card>
        </>
    );
}
