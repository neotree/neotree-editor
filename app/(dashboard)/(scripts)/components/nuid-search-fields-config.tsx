'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { arrayMoveImmutable } from "array-move";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, Trash, MoreVertical, Edit2, Plus, ArrowUp, ArrowDown } from "lucide-react";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { ScriptField } from "@/types";
import { DataTable } from "@/components/data-table";
import { useField } from "../hooks/use-field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useScriptForm } from "../hooks/use-script-form";
import { useNuidConfigIssues } from "../hooks/use-nuid-config-issues";
import { ConditionalExpressionModal } from "@/components/conditional-expression-modal";
import { ConditionEditor, ConditionErrorBadge, useConditionKeys } from "@/components/conditional-expression";
import { type ConditionKey } from "@/lib/conditional-expression";
import { SelectDataKey } from "@/components/select-data-key";
import { useDataKeysCtx, type DataKey } from "@/contexts/data-keys";
import { isNumericQueryValue } from "@/lib/query-state";
import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";
import {
    resolveNuidTemplate,
    buildNuidProvisionPayload,
    parseTemplateOptionValues,
    type NuidFieldSpec,
    type NuidConflict,
} from "@/lib/nuid-search";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

export function NuidSearchFieldsConfig({ 
    disabled,
    form: {
        watch,
        setValue,
        getDefaultNuidSearchFields,
    },
}: Props) {
    const fields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');
    
    const [selectedField, setSelectedField] = useState<{ index: number; field: ScriptField; }>();
    const [_nuidSearchEnabled, _setNuidSearchEnabled] = useState(nuidSearchEnabled);
    const [selectedNewFieldType, setSelectedNewFieldType] = useState<typeof fields[0]['type']>();
    const [open, setOpen] = useState(false);

    // The data key registry links here with ?nuidSearchField=<fieldId|index> when a NUID
    // reference needs attention, so open the sheet on that field.
    const [deepLinkedField, setDeepLinkedField] = useQueryState('nuidSearchField', {
        defaultValue: '',
        clearOnDefault: true,
    });

    useEffect(() => {
        if (nuidSearchEnabled && !_nuidSearchEnabled) {
            setOpen(true);
        }
        _setNuidSearchEnabled(nuidSearchEnabled);
    }, [_nuidSearchEnabled, nuidSearchEnabled]);

    useEffect(() => {
        if (!deepLinkedField) return;

        setOpen(true);

        const indexById = fields.findIndex(f => f.fieldId && (f.fieldId === deepLinkedField));
        const index = indexById >= 0
            ? indexById
            : (isNumericQueryValue(deepLinkedField) ? Number(deepLinkedField) : -1);
        const field = fields[index];

        if (field) setSelectedField({ index, field, });
        setDeepLinkedField('');
    }, [deepLinkedField, fields, setDeepLinkedField]);

    const { confirm } = useConfirmModal();
    const router = useRouter();
    const { extractDataKeys, allDataKeys, saveDataKeys, loadingDataKeys } = useDataKeysCtx();

    const { conditionKeys, keysReady, nuidFieldKeys, hasIssues } = useNuidConfigIssues(fields, nuidSearchEnabled);

    const [provision, setProvision] = useState<{ missing: NuidFieldSpec[]; conflicts: NuidConflict[] } | null>(null);
    const [provisioning, setProvisioning] = useState(false);
    const [resolvePending, setResolvePending] = useState<null | "prompt" | "link">(null);

    const buildSpecFromFields = useCallback((flds: typeof fields): NuidFieldSpec[] => {
        return (flds || [])
            .map((f) => {
                const type = `${f?.type || ""}`.trim();
                return {
                    key: `${f?.key || ""}`.trim(),
                    type,
                    label: `${f?.label || ""}`.trim(),
                    condition: f?.condition ? `${f.condition}` : undefined,
                    options: ["dropdown", "multi_select"].includes(type)
                        ? parseTemplateOptionValues(f?.values)
                        : undefined,
                } satisfies NuidFieldSpec;
            })
            .filter((s) => !!s.key);
    }, []);

    // Resolve current fields against the library, auto-link matches by key, and
    // (when prompting) surface anything missing/conflicting for provisioning.
    const runResolve = useCallback((opts?: { prompt?: boolean }) => {
        const current = watch("nuidSearchFields");
        if (!current?.length) return;

        const { linked, missing, conflicts } = resolveNuidTemplate(buildSpecFromFields(current), allDataKeys);
        const linkedByKey = new Map(linked.map((l) => [l.key, l.keyId]));

        const updated = current.map((f) => {
            const keyId = linkedByKey.get(`${f?.key || ""}`.trim());
            return keyId && keyId !== f.keyId ? { ...f, keyId } : f;
        });
        const changed = updated.some((f, i) => f !== current[i]);
        if (changed) setValue("nuidSearchFields", updated, { shouldDirty: true });

        if (opts?.prompt && (missing.length || conflicts.length)) {
            setProvision({ missing, conflicts });
        }
    }, [watch, allDataKeys, buildSpecFromFields, setValue]);

    useEffect(() => {
        if (!resolvePending || loadingDataKeys) return;
        runResolve({ prompt: resolvePending === "prompt" });
        setResolvePending(null);
    }, [resolvePending, loadingDataKeys, runResolve]);

    useEffect(() => {
        if (open && nuidSearchEnabled) setResolvePending("prompt");
    }, [open, nuidSearchEnabled]);

    const onProvision = useCallback(async () => {
        if (!provision) return;
        setProvisioning(true);
        try {
            const payload = buildNuidProvisionPayload(provision.missing, allDataKeys);
            if (payload.length) {
                const res = await saveDataKeys(payload as any);
                if (res?.errors?.length) return; 
                router.refresh();
            }
            setProvision(null);
            setResolvePending("link");
        } finally {
            setProvisioning(false);
        }
    }, [provision, allDataKeys, saveDataKeys]);

    const onDelete = useCallback((index: number) => {
        confirm(() => setValue('nuidSearchFields', fields.filter((_, i) => i !== index), { shouldDirty: true, }), {
            danger: true,
            title: 'Delete field',
            message: 'Are you sure you want to delete field?',
            positiveLabel: 'Delete',
            negativeLabel: 'Cancel',
        });
    }, [fields, confirm, setValue]);

    const onReorder = useCallback((oldIndex: number, newIndex: number) => {
        if (disabled) return;
        if (oldIndex === newIndex) return;
        if ((newIndex < 0) || (newIndex > (fields.length - 1))) return;
        setValue('nuidSearchFields', arrayMoveImmutable(fields, oldIndex, newIndex), { shouldDirty: true, });
    }, [fields, disabled, setValue]);

    const onSave = useCallback(() => {

    }, []);

    return (
        <>
            {!!provision && (
                <Modal
                    title="Set up NUID Search data keys"
                    open
                    onOpenChange={isOpen => { if (!isOpen && !provisioning) setProvision(null); }}
                    actions={(
                        <>
                            <div className="flex-1" />
                            <DialogClose asChild>
                                <Button variant="ghost" disabled={provisioning}>Cancel</Button>
                            </DialogClose>
                            {!!provision.missing.length && (
                                <Button onClick={() => onProvision()} disabled={provisioning}>
                                    {provisioning ? 'Creating…' : 'Create & link'}
                                </Button>
                            )}
                        </>
                    )}
                >
                    <div className="flex flex-col gap-y-4 text-sm">
                        <p className="text-muted-foreground">
                            NUID Search uses data keys from the Data Key library. These are matched by key —
                            create the missing ones to finish setting up the search page.
                        </p>

                        {!!provision.missing.length && (
                            <div className="flex flex-col gap-y-2">
                                <div className="font-medium">Will be created &amp; linked</div>
                                {provision.missing.map((m) => (
                                    <div key={m.key} className="rounded-md border border-border px-3 py-2">
                                        <div className="flex items-center gap-x-2">
                                            <span className="font-medium">{m.key}</span>
                                            <span className="text-xs text-muted-foreground">{m.type}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{m.label}</div>
                                        {!!m.options?.length && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Options: {m.options.map((o) => `${o.value} (${o.label})`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!!provision.conflicts.length && (
                            <div className="flex flex-col gap-y-2">
                                <div className="font-medium text-danger">Needs attention</div>
                                <p className="text-xs text-muted-foreground">
                                    A data key with this name already exists but is the wrong type. Rename or
                                    relink it in the Data Key library before using it here.
                                </p>
                                {provision.conflicts.map((c) => (
                                    <div key={c.key} className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2">
                                        <span className="font-medium">{c.key}</span>
                                        <span className="ml-2 text-xs text-danger">
                                            expected <b>{c.expectedType}</b>, found <b>{c.foundType}</b>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {!!selectedField && (
                <Field
                    open
                    disabled={disabled}
                    field={selectedField?.field}
                    fieldType={selectedField?.field?.type!}
                    extraKeys={nuidFieldKeys}
                    onClose={() => setSelectedField(undefined)}
                    onChange={field => {
                        setValue(
                            'nuidSearchFields',
                            fields.map((f, i) => {
                                if (i === selectedField?.index) return { ...f, ...field, };
                                return f;
                            }),
                            { shouldDirty: true, }
                        );
                        setSelectedField(undefined);
                    }}
                />
            )}

            {!!selectedNewFieldType && (
                <Field
                    open
                    disabled={disabled}
                    fieldType={selectedNewFieldType}
                    extraKeys={nuidFieldKeys}
                    onClose={() => setSelectedNewFieldType(undefined)}
                    onChange={field => {
                        setValue(
                            'nuidSearchFields',
                            [...fields, {
                                ...field,
                                type: selectedNewFieldType,
                            }],
                            { shouldDirty: true, }
                        );
                        setSelectedNewFieldType(undefined);
                    }}
                />
            )}

            <Sheet
                open={open}
                onOpenChange={open => {
                    if (!open) setOpen(false);
                }}
            >
                {nuidSearchEnabled && (
                    <SheetTrigger asChild>
                        <a
                            href="#"
                            className="text-muted-foreground hover:text-primary"
                            onClick={e => {
                                e.preventDefault();
                                setOpen(true);
                            }}
                        >
                            <Settings className="w-4 h-4 mr-1" />
                        </a>
                    </SheetTrigger>
                )}

                <SheetContent
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%]"
                >
                    <SheetHeader className="flex flex-row items-center py-2 px-4 border-b border-b-border text-left sm:text-left">
                        <SheetTitle>Configure NUID Search page</SheetTitle>
                        <SheetDescription className="hidden"></SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-0 gap-y-4 overflow-y-auto">
                        <DataTable
                            title="Fields"
                            sortable={!disabled}
                            onSort={(oldIndex, newIndex) => onReorder(oldIndex, newIndex)}
                            headerActions={(
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                disabled={disabled}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add field
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent>
                                            <DropdownMenuItem 
                                                className="focus:text-primary focus:bg-primary/20"
                                                onClick={() => setSelectedNewFieldType('dropdown')}
                                            >
                                                Yes/No
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => setSelectedNewFieldType('text')}
                                            >
                                                NUID Search
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                            columns={[
                                {
                                    name: 'Type'
                                },
                                {
                                    name: 'Key'
                                },
                                {
                                    name: 'Label'
                                },
                                {
                                    name: 'Condition',
                                    cellRenderer({ rowIndex }) {
                                        const f = fields[rowIndex];
                                        return (
                                            <span className="inline-flex items-center gap-x-2">
                                                <span>{f?.condition}</span>
                                                {!!f && (
                                                    <ConditionErrorBadge
                                                        keys={conditionKeys}
                                                        extraKeys={nuidFieldKeys}
                                                        keysReady={keysReady}
                                                        expressions={[{ value: f.condition, label: 'Condition' }]}
                                                    />
                                                )}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    name: 'Required'
                                },
                                {
                                    name: 'Action',
                                    align: 'right',
                                    cellRenderer({ rowIndex }) {
                                        const f = fields[rowIndex];
                                        return (
                                            <>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem 
                                                            className="focus:text-primary focus:bg-primary/20"
                                                            onClick={() => setSelectedField({ index: rowIndex, field: f, })}
                                                        >
                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className="focus:text-primary focus:bg-primary/20"
                                                            disabled={disabled || (rowIndex === 0)}
                                                            onClick={() => onReorder(rowIndex, rowIndex - 1)}
                                                        >
                                                            <ArrowUp className="mr-2 h-4 w-4" />
                                                            Move up
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className="focus:text-primary focus:bg-primary/20"
                                                            disabled={disabled || (rowIndex === (fields.length - 1))}
                                                            onClick={() => onReorder(rowIndex, rowIndex + 1)}
                                                        >
                                                            <ArrowDown className="mr-2 h-4 w-4" />
                                                            Move down
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            disabled={disabled}
                                                            onClick={() => onDelete(rowIndex)}
                                                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        );
                                    },
                                },
                            ]}
                            data={fields.map(f => [
                                f.type,
                                f.key,
                                f.label,
                                f.condition,
                                f.optional ? 'No' : 'Yes',
                                '',
                            ])}
                        />
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex items-center gap-x-2">
                        {hasIssues && (
                            <span className="text-xs text-danger">
                                Resolve the data key / condition issues to save.
                            </span>
                        )}
                        <div className="ml-auto" />

                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                onClick={() => {}}
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        {hasIssues ? (
                            <Button disabled>Save</Button>
                        ) : (
                            <SheetClose asChild>
                                <Button
                                    onClick={() => onSave()}
                                    disabled={disabled}
                                >
                                    Save
                                </Button>
                            </SheetClose>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

export function Field({
    open,
    field,
    fieldType,
    disabled,
    extraKeys,
    onChange,
    onClose,
}: {
    open: boolean;
    field?: ScriptField;
    fieldType: ScriptField['type'];
    disabled?: boolean;
    extraKeys?: ConditionKey[];
    onClose: () => void;
    onChange: (field: ScriptField) => void;
}) {
    const { extractDataKeys, allDataKeys } = useDataKeysCtx();

    const { getDefaultValues } = useField({
        ...field,
        type: fieldType,
    } as ScriptField);

    const {
        control,
        watch,
        register,
        setValue,
        handleSubmit,
        formState: { errors, },
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const { conditionKeys, keysLoading } = useConditionKeys();
    const [conditionHasErrors, setConditionHasErrors] = useState(false);

    const type = watch('type');
    const key = watch('key');
    const keyId = watch('keyId');
    const label = watch('label');
    const values = watch('values');
    const optional = watch('optional');
    const confidential = watch('confidential');

    const hasOptions = useMemo(() => ['dropdown', 'multi_select'].includes(type), [type]);

    const expectedType = useMemo(() => normalizeDataKeyCompatibilityType(type), [type]);
    const isCompatibleDataKey = useCallback(
        (candidate: DataKey) => normalizeDataKeyCompatibilityType(candidate.dataType) === expectedType,
        [expectedType]
    );
    const compatibleDataKeys = useMemo(
        () => allDataKeys.filter(isCompatibleDataKey),
        [allDataKeys, isCompatibleDataKey]
    );
    const expectedTypeLabel = useMemo(() => hasOptions ? 'dropdown' : (type || 'text'), [hasOptions, type]);
    const fieldTypeLabel = useMemo(() => hasOptions ? 'Yes/No' : 'NUID search', [hasOptions]);

    const dataKey = useMemo(() => {
        const [k] = !keyId ? [null] : extractDataKeys([keyId]);
        return k;
    }, [keyId, extractDataKeys]);

    // Legacy fields can point at a key of the wrong type - say so rather than silently
    // dropping it from the picker.
    const dataKeyTypeMismatch = useMemo(
        () => !!dataKey && !isCompatibleDataKey(dataKey),
        [dataKey, isCompatibleDataKey]
    );

    // Options are the data key's child keys - they aren't edited here
    const dataKeyOptions = useMemo(() => {
        const children = !dataKey?.options?.length ? [] : extractDataKeys(dataKey.options);
        return children.map(c => ({ value: c.name, label: c.label || c.name, }));
    }, [dataKey, extractDataKeys]);

    const derivedValues = useMemo(
        () => dataKeyOptions.map(o => `${o.value},${o.label}`).join('\n'),
        [dataKeyOptions]
    );

    useEffect(() => {
        if (!hasOptions || !keyId || !dataKey) return;
        if (derivedValues === values) return;
        setValue('values', derivedValues, { shouldDirty: true, });
    }, [hasOptions, keyId, dataKey, derivedValues, values, setValue]);

    const storedOptions = useMemo(() => {
        return `${values || ''}`
            .split('\n')
            .map(v => v.trim())
            .filter(v => v)
            .map(v => {
                const [value, ...rest] = v.split(',');
                return { value, label: rest.join(',') || value, };
            });
    }, [values]);

    const options = dataKeyOptions.length ? dataKeyOptions : storedOptions;

    const inheritedConfidential = useMemo(() => !!dataKey?.confidential, [dataKey?.confidential]);

    useEffect(() => {
        if (confidential !== inheritedConfidential) {
            setValue('confidential', inheritedConfidential, { shouldDirty: true, });
        }
    }, [confidential, inheritedConfidential, setValue]);

    const isKeyDisabled = !!disabled;

    const onSave = handleSubmit(onChange);

    // A dropdown with no options renders an unanswerable question on the app
    const missingOptions = useMemo(() => hasOptions && !options.length, [hasOptions, options]);

    return (
        <>
            <Modal
                title={field ? 'Edit field' : 'Add field'}
                open={open}
                onOpenChange={isOpen => {
                    if (!isOpen) onClose();
                }}
                actions={(
                    <>
                        <span className="text-sm text-danger">* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            onClick={() => onSave()}
                            disabled={disabled || conditionHasErrors || missingOptions || dataKeyTypeMismatch}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div>
                        <Label error={!disabled && !key} htmlFor="key">Key *</Label>
                        <Controller
                            control={control}
                            name="key"
                            rules={{ required: 'Select a data key.', }}
                            render={({ field: { value, onChange, }, }) => (
                                <SelectDataKey
                                    modal
                                    value={`${value || ''}`}
                                    disabled={isKeyDisabled}
                                    error={!!errors.key || dataKeyTypeMismatch}
                                    filterDataKeys={isCompatibleDataKey}
                                    onChange={([item]) => {
                                        if (!item) return;
                                        onChange(item.name);
                                        setValue('keyId', item.uniqueKey, { shouldDirty: true, });
                                        setValue('label', item.label || item.name, { shouldDirty: true, });
                                        setValue('confidential', !!item.confidential, { shouldDirty: true, });
                                    }}
                                />
                            )}
                        />
                        {!!errors.key && <span className="block text-xs text-danger">{`${errors.key.message || ''}`}</span>}

                        {dataKeyTypeMismatch && (
                            <span className="block text-xs text-danger">
                                This field is linked to a <b>{dataKey?.dataType || 'untyped'}</b> data key,
                                but a {fieldTypeLabel} field needs a <b>{expectedTypeLabel}</b> one. Pick a
                                replacement above.
                            </span>
                        )}

                        {!compatibleDataKeys.length && (
                            <span className="block text-xs text-danger">
                                There are no {expectedTypeLabel} data keys in the library yet. Create one
                                before adding this field.
                            </span>
                        )}

                        <span className="text-xs text-muted-foreground">
                            Only <b>{expectedTypeLabel}</b> keys from the <b>Data Key library</b> can be used here.
                            {!!keyId && (
                                <>
                                    {' '}
                                    <Link
                                        href={`/data-keys/edit/${keyId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        Open data key
                                    </Link>
                                </>
                            )}
                            {!keyId && !!key && ' This field is not linked to a data key yet - pick one above to link it.'}
                        </span>
                    </div>

                    <div>
                        <Label error={!disabled && !label} htmlFor="label">Label *</Label>
                        <Input
                            {...register('label', { required: true, disabled, })}
                            error={!disabled && !label}
                        />
                        <span className="text-xs text-muted-foreground">
                            Prefilled from the data key. Edit it to change the wording shown on the app.
                        </span>
                    </div>

                    <div>
                        <Label htmlFor="condition">Condition <ConditionalExpressionModal /></Label>
                        <Controller
                            control={control}
                            name="condition"
                            render={({ field: { value, onChange } }) => (
                                <ConditionEditor
                                    id="condition"
                                    rows={5}
                                    value={`${value || ''}`}
                                    onChange={onChange}
                                    keys={conditionKeys}
                                    extraKeys={extraKeys}
                                    keysLoading={keysLoading}
                                    disabled={disabled}
                                    initialValue={`${field?.condition || ''}`}
                                    onValidityChange={setConditionHasErrors}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="optional"
                                disabled={disabled}
                                checked={optional}
                                onCheckedChange={checked => setValue('optional', checked, { shouldDirty: true, })}
                            />
                            <Label htmlFor="optional">Optional</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            When off, the session cannot be started until this question is answered.
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="confidential"
                                disabled
                                checked={inheritedConfidential}
                            />
                            <Label htmlFor="confidential">Confidential</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Inherited from the data key. Change it in the Data Key library.
                        </span>
                    </div>

                    {hasOptions && (
                        <div>
                            <Label htmlFor="values">Options</Label>

                            {!options.length ? (
                                <span className="block text-xs text-danger">
                                    {!keyId ?
                                        'Pick a data key above to bring in its options.'
                                        :
                                        'This data key has no options. Add them to the data key, then reopen this field.'}
                                </span>
                            ) : (
                                <div className="flex flex-col gap-y-1 rounded-md border border-border p-2">
                                    {options.map(o => (
                                        <div key={o.value} className="flex items-center gap-x-2 text-sm">
                                            <span className="text-muted-foreground text-xs">{o.value}</span>
                                            <span>{o.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <span className="text-xs text-muted-foreground">
                                Options come from the data key&apos;s child keys.
                                {!!keyId && (
                                    <>
                                        {' '}
                                        <Link
                                            href={`/data-keys/edit/${keyId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline"
                                        >
                                            Edit them in the Data Key library
                                        </Link>
                                    </>
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
