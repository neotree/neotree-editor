'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { arrayMoveImmutable } from "array-move";
import { useQueryState } from "nuqs";
import Link from "next/link";
import { Settings, Trash, MoreVertical, Edit2, Plus, ArrowUp, ArrowDown, ExternalLink, Library } from "lucide-react";

import { useNavigation } from "@/hooks/use-navigation-hook";
import {
    Sheet,
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useScriptForm } from "../hooks/use-script-form";
import { useNuidConfigIssues, type NuidFieldIssues } from "../hooks/use-nuid-config-issues";
import { ConditionalExpressionModal } from "@/components/conditional-expression-modal";
import { ConditionEditor, useConditionKeys } from "@/components/conditional-expression";
import { getPreScriptUnavailableOutcomeKeys, type ConditionKey } from "@/lib/conditional-expression";
import { SelectDataKey } from "@/components/select-data-key";
import { useDataKeysCtx, type DataKey } from "@/contexts/data-keys";
import { isNumericQueryValue } from "@/lib/query-state";
import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";
import {
    resolveNuidTemplate,
    buildNuidProvisionPayload,
    parseTemplateOptionValues,
    NUID_SEARCH_ROLES,
    NUID_FIELD_TYPE_LABELS,
    getNuidSearchRole,
    getNuidSearchRoleLabel,
    getCompatibleNuidSearchRoles,
    describeLegacyNuidSearchBehaviour,
    applyLibraryKeyToNuidField,
    indexDataKeysById,
    isNuidManagedDataKey,
    type NuidFieldSpec,
    type NuidConflict,
    type NuidLibraryKeyFull,
} from "@/lib/nuid-search";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

const preScriptUnavailableOutcomeKeys = getPreScriptUnavailableOutcomeKeys();

const sameFields = (a: ScriptField[], b: ScriptField[]) => JSON.stringify(a) === JSON.stringify(b);

function buildSpecFromFields(flds: ScriptField[]): NuidFieldSpec[] {
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
}

/**
 * Links unlinked fields to the library key of the same name and type, and brings
 * every linked field up to date with its key: the library owns the key, label,
 * options and confidentiality. A linked key of the wrong type is left as it is,
 * to be reported rather than silently overwritten.
 */
function syncWithLibrary(current: ScriptField[], allDataKeys: DataKey[]) {
    const resolution = resolveNuidTemplate(buildSpecFromFields(current.filter(f => !f.keyId)), allDataKeys);
    const linkedByKey = new Map(resolution.linked.map((l) => [l.key, l.keyId]));
    const index = indexDataKeysById(allDataKeys as NuidLibraryKeyFull[]);
    const getKey = (id: string) => index.get(id) as NuidLibraryKeyFull | undefined;

    const updated = current.map((f) => {
        const keyId = f.keyId || linkedByKey.get(`${f?.key || ""}`.trim());
        const libraryKey = keyId ? getKey(keyId) : undefined;
        if (!keyId || !libraryKey) return f;
        if (normalizeDataKeyCompatibilityType(libraryKey.dataType) !== normalizeDataKeyCompatibilityType(f.type)) return f;
        return applyLibraryKeyToNuidField({ ...f, keyId }, libraryKey, getKey);
    });

    return { updated, missing: resolution.missing, conflicts: resolution.conflicts };
}

function IssueCounts({ issues }: { issues?: NuidFieldIssues }) {
    const errors = issues ? [...issues.errors, ...issues.conditionErrors] : [];
    if (!issues || (!errors.length && !issues.warnings.length)) {
        return <span className="text-xs text-muted-foreground">-</span>;
    }
    return (
        <span
            className="inline-flex items-center gap-x-2 text-xs"
            title={[...errors, ...issues.warnings].join('\n')}
        >
            {!!errors.length && <span className="text-danger">{errors.length} error{errors.length === 1 ? '' : 's'}</span>}
            {!!issues.warnings.length && <span className="text-amber-600 dark:text-amber-400">{issues.warnings.length} warning{issues.warnings.length === 1 ? '' : 's'}</span>}
        </span>
    );
}

export function NuidSearchFieldsConfig({
    disabled,
    form: {
        watch,
        setValue,
    },
}: Props) {
    const { router, searchParams, } = useNavigation();

    const fields = watch('nuidSearchFields');
    const nuidSearchEnabled = watch('nuidSearchEnabled');

    const initialField = useMemo(() => {
        const index = Number(searchParams.nuidSearchField) >= 0 ? Number(searchParams.nuidSearchField) : -1;
        const field = fields[index];
        if (field) {
            return {
                field,
                index,
            };
        }
    }, [fields, searchParams]);

    const [selectedField, setSelectedField] = useState(initialField);
    const [_nuidSearchEnabled, _setNuidSearchEnabled] = useState(nuidSearchEnabled);
    const [selectedNewFieldType, setSelectedNewFieldType] = useState<typeof fields[0]['type']>();
    const [open, setOpen] = useState(!!initialField);

    // Edits in the sheet go to this copy. Save applies it to the script form,
    // Cancel throws it away.
    const [draft, setDraft] = useState<ScriptField[] | null>(null);
    const rows = draft ?? fields;

    useEffect(() => {
        if (open) setDraft(prev => prev ?? fields);
        else setDraft(null);
    }, [open, fields]);

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
    const { allDataKeys, saveDataKeys, loadingDataKeys } = useDataKeysCtx();

    const { nuidFieldKeys, issues, errorCount, conditionErrorCount, warningCount, checking } = useNuidConfigIssues(rows, nuidSearchEnabled);
    const {
        errorCount: savedStructuralErrorCount,
        conditionErrorCount: savedConditionErrorCount,
        warningCount: savedWarningCount,
    } = useNuidConfigIssues(fields, nuidSearchEnabled);
    const savedErrorCount = savedStructuralErrorCount + savedConditionErrorCount;

    const [provision, setProvision] = useState<{ missing: NuidFieldSpec[]; conflicts: NuidConflict[] } | null>(null);
    const [provisioning, setProvisioning] = useState(false);
    const [linkPending, setLinkPending] = useState(false);

    // When the script opens, fields are linked to library keys of the same name and
    // brought up to date with them, so edits made in the library show here. It is
    // not an edit: opening a script must not leave it with "unsaved changes". The
    // result is kept and saved with the next real save.
    useEffect(() => {
        if (loadingDataKeys || !allDataKeys.length || !fields?.length) return;
        const { updated } = syncWithLibrary(fields, allDataKeys);
        if (!sameFields(updated, fields)) setValue("nuidSearchFields", updated, { shouldDirty: false });
    }, [allDataKeys, loadingDataKeys, fields, setValue]);

    const unlinkedCount = useMemo(
        () => rows.filter(f => `${f?.key || ''}`.trim() && !f.keyId).length,
        [rows]
    );

    // Fields that are not in the library yet (e.g. the starter template) are
    // created there and linked.
    const onAddToLibrary = useCallback(() => {
        if (!draft) return;
        const { updated, missing, conflicts } = syncWithLibrary(draft, allDataKeys);
        if (!sameFields(updated, draft)) setDraft(updated);
        const unlinkedMissing = missing.filter(m => updated.some(f => `${f.key || ''}`.trim() === m.key && !f.keyId));
        if (unlinkedMissing.length || conflicts.length) setProvision({ missing: unlinkedMissing, conflicts });
    }, [draft, allDataKeys]);

    const onProvision = useCallback(async () => {
        if (!provision || !draft) return;
        setProvisioning(true);
        try {
            const { missing } = syncWithLibrary(draft, allDataKeys);
            const payload = buildNuidProvisionPayload(missing, allDataKeys);
            if (payload.length) {
                const res = await saveDataKeys(payload as any);
                if (res?.errors?.length) return;
                router.refresh();
            }
            setProvision(null);
            setLinkPending(true);
        } finally {
            setProvisioning(false);
        }
    }, [provision, draft, allDataKeys, saveDataKeys, router]);

    // After creating keys, link the draft once the library has reloaded with them.
    useEffect(() => {
        if (!linkPending || loadingDataKeys || !draft) return;
        const { updated } = syncWithLibrary(draft, allDataKeys);
        if (!sameFields(updated, draft)) setDraft(updated);
        setLinkPending(false);
    }, [linkPending, loadingDataKeys, allDataKeys, draft]);

    const updateDraft = useCallback((next: ScriptField[]) => setDraft(next), []);

    const onDelete = useCallback((index: number) => {
        confirm(() => updateDraft(rows.filter((_, i) => i !== index)), {
            danger: true,
            title: 'Delete field',
            message: 'Are you sure you want to delete field?',
            positiveLabel: 'Delete',
            negativeLabel: 'Cancel',
        });
    }, [rows, confirm, updateDraft]);

    const onReorder = useCallback((oldIndex: number, newIndex: number) => {
        if (disabled) return;
        if (oldIndex === newIndex) return;
        if ((newIndex < 0) || (newIndex > (rows.length - 1))) return;
        updateDraft(arrayMoveImmutable(rows, oldIndex, newIndex));
    }, [rows, disabled, updateDraft]);

    const hasDraftChanges = !!draft && !sameFields(draft, fields);

    const closeSheet = useCallback(() => {
        setOpen(false);
        setSelectedField(undefined);
        setSelectedNewFieldType(undefined);
    }, []);

    const onCancel = useCallback(() => {
        if (!hasDraftChanges) return closeSheet();
        confirm(closeSheet, {
            danger: true,
            title: 'Discard changes?',
            message: 'Your changes to the NUID Search page have not been applied.',
            positiveLabel: 'Discard',
            negativeLabel: 'Keep editing',
        });
    }, [hasDraftChanges, closeSheet, confirm]);

    const onSave = useCallback(() => {
        if (draft && hasDraftChanges) setValue('nuidSearchFields', draft, { shouldDirty: true, });
        closeSheet();
    }, [draft, hasDraftChanges, setValue, closeSheet]);

    const fieldsWithIssues = rows
        .map((f, i) => ({ f, i, issues: issues[i] }))
        .filter(({ issues }) => issues && (issues.errors.length || issues.conditionErrors.length || issues.warnings.length));

    return (
        <>
            {!!provision && (
                <Modal
                    title="Create the missing data keys"
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
                            Every NUID Search field is a Data Key library key. These fields aren&apos;t in the
                            library yet, so they will be created there and linked. Change their labels,
                            options and confidentiality in the library afterwards.
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
                                <div className="font-medium">Can&apos;t be created</div>
                                <p className="text-xs text-muted-foreground">
                                    The library already has a key with this name but a different type. Choose
                                    another data key in the field&apos;s settings.
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

            <Sheet
                open={open}
                onOpenChange={isOpen => {
                    if (!isOpen) onCancel();
                }}
            >
                {nuidSearchEnabled && (
                    <SheetTrigger asChild>
                        <a
                            href="#"
                            className="inline-flex items-center gap-x-2 text-muted-foreground hover:text-primary"
                            onClick={e => {
                                e.preventDefault();
                                setOpen(true);
                            }}
                        >
                            <Settings className="w-4 h-4 mr-1" />
                            {!!savedErrorCount && <span className="text-xs text-danger">{savedErrorCount} error{savedErrorCount === 1 ? '' : 's'}</span>}
                            {!!savedWarningCount && <span className="text-xs text-amber-600 dark:text-amber-400">{savedWarningCount} warning{savedWarningCount === 1 ? '' : 's'}</span>}
                        </a>
                    </SheetTrigger>
                )}

                <SheetContent
                    hideCloseButton
                    side="right"
                    className="p-0 m-0 flex flex-col w-full max-w-full sm:max-w-[80%] md:max-w-[80%] lg:max-w-[60%]"
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
                                    {!!unlinkedCount && !loadingDataKeys && (
                                        <Button
                                            variant="ghost"
                                            disabled={disabled}
                                            onClick={() => onAddToLibrary()}
                                        >
                                            <Library className="h-4 w-4 mr-2" />
                                            Create &amp; link {unlinkedCount} data key{unlinkedCount === 1 ? '' : 's'}
                                        </Button>
                                    )}

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
                                                {NUID_FIELD_TYPE_LABELS.dropdown} (dropdown)
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => setSelectedNewFieldType('text')}
                                            >
                                                {NUID_FIELD_TYPE_LABELS.text}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                            columns={[
                                {
                                    name: 'Type',
                                },
                                {
                                    name: 'Key',
                                    cellRenderer({ rowIndex }) {
                                        const f = rows[rowIndex];
                                        return (
                                            <span className="inline-flex flex-col">
                                                <span>{f?.key}</span>
                                                {!f?.keyId && <span className="text-xs text-danger">Not linked</span>}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    name: 'Label'
                                },
                                {
                                    name: 'Role',
                                    cellRenderer({ rowIndex }) {
                                        const f = rows[rowIndex];
                                        if (f?.type !== 'text') return <span className="text-xs text-muted-foreground">-</span>;
                                        const { role, inferred } = getNuidSearchRole(f);
                                        return (
                                            <span>
                                                {getNuidSearchRoleLabel(role)}
                                                {inferred && <span className="text-xs text-muted-foreground"> (not set)</span>}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    name: 'Condition'
                                },
                                {
                                    name: 'Required'
                                },
                                {
                                    name: 'Issues',
                                    cellRenderer({ rowIndex }) {
                                        return <IssueCounts issues={issues[rowIndex]} />;
                                    },
                                },
                                {
                                    name: 'Action',
                                    align: 'right',
                                    cellRenderer({ rowIndex }) {
                                        const f = rows[rowIndex];
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

                                                        {!!f.keyId && (
                                                            <DropdownMenuItem
                                                                asChild
                                                                className="focus:text-primary focus:bg-primary/20"
                                                            >
                                                                <Link target="_blank" href={`/data-keys/edit/${f.keyId}`}>
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    View data key
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}

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
                                                            disabled={disabled || (rowIndex === (rows.length - 1))}
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
                            data={rows.map(f => [
                                NUID_FIELD_TYPE_LABELS[f.type] || f.type,
                                f.key,
                                f.label,
                                '',
                                f.condition,
                                f.optional ? 'No' : 'Yes',
                                '',
                                '',
                            ])}
                        />

                        {!!fieldsWithIssues.length && (
                            <div className="px-4 flex flex-col gap-y-3 text-sm">
                                <div className="font-medium">Issues</div>
                                {fieldsWithIssues.map(({ f, i, issues }) => (
                                    <div key={`${f.fieldId || i}`} className="rounded-md border border-border px-3 py-2">
                                        <button
                                            type="button"
                                            className="font-medium hover:text-primary"
                                            onClick={() => setSelectedField({ index: i, field: f, })}
                                        >
                                            {f.label || f.key || `Field ${i + 1}`}
                                        </button>
                                        <ul className="mt-1 list-disc pl-5 text-xs">
                                            {issues!.errors.map(e => <li key={e} className="text-danger">{e}</li>)}
                                            {issues!.conditionErrors.map(e => <li key={e} className="text-danger">{e}</li>)}
                                            {issues!.warnings.map(w => <li key={w} className="text-amber-700 dark:text-amber-300">{w}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex items-center gap-x-2">
                        <span className="flex flex-col text-xs text-muted-foreground">
                            {checking && <span>Checking against the Data Key library…</span>}
                            {!!errorCount && (
                                <span className="text-danger">
                                    {errorCount} error{errorCount === 1 ? '' : 's'}: you can save, but publishing is blocked until {errorCount === 1 ? 'it is' : 'they are'} fixed.
                                </span>
                            )}
                            {!!conditionErrorCount && (
                                <span className="text-danger">
                                    {conditionErrorCount} condition error{conditionErrorCount === 1 ? '' : 's'}: the field may not show as expected on the app.
                                </span>
                            )}
                            {!checking && !errorCount && !conditionErrorCount && !!warningCount && (
                                <span>{warningCount} warning{warningCount === 1 ? '' : 's'}. Nothing is blocked.</span>
                            )}
                        </span>
                        <div className="ml-auto" />

                        <Button
                            variant="ghost"
                            onClick={() => onCancel()}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() => onSave()}
                            disabled={disabled}
                        >
                            {hasDraftChanges ? 'Apply changes' : 'Done'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {!!selectedField && (
                <Field
                    open
                    disabled={disabled}
                    field={selectedField?.field}
                    fieldType={selectedField?.field?.type!}
                    extraKeys={nuidFieldKeys}
                    otherKeys={rows.filter((_, i) => i !== selectedField.index).map(f => f.key)}
                    onClose={() => setSelectedField(undefined)}
                    onChange={field => {
                        // A deep link can open a field before the sheet's copy exists.
                        const base = draft ?? fields;
                        const next = base.map((f, i) => {
                            if (i === selectedField?.index) return { ...f, ...field, };
                            return f;
                        });
                        if (open) {
                            updateDraft(next);
                        } else {
                            setValue('nuidSearchFields', next, { shouldDirty: true, });
                        }
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
                    otherKeys={rows.map(f => f.key)}
                    onClose={() => setSelectedNewFieldType(undefined)}
                    onChange={field => {
                        updateDraft([...rows, {
                            ...field,
                            type: selectedNewFieldType,
                        }]);
                        setSelectedNewFieldType(undefined);
                    }}
                />
            )}
        </>
    );
}

export function Field({
    open,
    field,
    fieldType,
    disabled,
    extraKeys,
    otherKeys = [],
    onChange,
    onClose,
}: {
    open: boolean;
    field?: ScriptField;
    fieldType: ScriptField['type'];
    disabled?: boolean;
    extraKeys?: ConditionKey[];
    /** Keys of the page's other fields, which this one must not repeat. */
    otherKeys?: string[];
    onClose: () => void;
    onChange: (field: ScriptField) => void;
}) {
    const { extractDataKeys, allDataKeys } = useDataKeysCtx();

    const { getDefaultValues } = useField({
        ...field,
        type: fieldType,
    } as ScriptField);

    const isNew = !field;

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors, },
    } = useForm({
        defaultValues: {
            ...getDefaultValues(),
            // Existing fields keep "not set" until the author picks; new ones get a role once a key is chosen.
            searchRole: field?.searchRole || undefined,
        } as ScriptField,
    });

    const { conditionKeys, keysLoading, keysReady } = useConditionKeys();
    const [conditionHasErrors, setConditionHasErrors] = useState(false);

    const type = watch('type');
    const key = watch('key');
    const keyId = watch('keyId');
    const searchRole = watch('searchRole');

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
    const expectedTypeLabel = hasOptions ? 'dropdown' : (type || 'text');

    const getKey = useCallback((id: string) => (extractDataKeys([id])[0] || null) as NuidLibraryKeyFull | null, [extractDataKeys]);

    const dataKey = useMemo(() => {
        const [k] = !keyId ? [null] : extractDataKeys([keyId]);
        return k;
    }, [keyId, extractDataKeys]);

    const dataKeyTypeMismatch = !!dataKey && !isCompatibleDataKey(dataKey);

    // A legacy field that names a key without linking it: offer the library key of that name.
    const matchingLibraryKey = useMemo(() => {
        const name = `${key || ''}`.trim();
        if (!name || keyId) return null;
        return compatibleDataKeys.find(k => `${k.name || ''}`.trim() === name) || null;
    }, [key, keyId, compatibleDataKeys]);

    // What the app will show, straight from the library.
    const libraryOptions = useMemo(() => {
        const children = !dataKey?.options?.length ? [] : extractDataKeys(dataKey.options);
        return children.map(c => ({ value: `${c.name}`, label: `${c.label || c.name}`, }));
    }, [dataKey, extractDataKeys]);

    const chooseKey = useCallback((item: DataKey) => {
        setValue('keyId', item.uniqueKey, { shouldDirty: true, shouldValidate: true, });
        setValue('key', item.name, { shouldDirty: true, });
        if (type === 'text') {
            // Keep the role only if released app versions agree with it for this key.
            const compatible = getCompatibleNuidSearchRoles({ key: item.name, label: item.label || item.name, type });
            const current = watch('searchRole');
            const next = current && compatible.includes(current) ? current : (isNew ? compatible[0] : undefined);
            setValue('searchRole', next, { shouldDirty: true, shouldValidate: true, });
        }
    }, [setValue, type, watch, isNew]);

    // A key provisioned for NUID Search stays on its field, as before.
    const isKeyLocked = !!disabled || isNuidManagedDataKey(dataKey as any);

    const onSave = handleSubmit(data => {
        if (!dataKey) return;
        onChange({
            ...applyLibraryKeyToNuidField(data, dataKey as NuidLibraryKeyFull, getKey),
            searchRole: data.type === 'text' ? data.searchRole : undefined,
        });
    });

    // Released app versions ignore the role and go by key and label, so only roles that
    // mean exactly that are offered until every device has the update.
    const roleField = { key: dataKey?.name || key, label: dataKey?.label || dataKey?.name || '', type };
    const compatibleRoles = getCompatibleNuidSearchRoles(roleField);
    const { role: effectiveRole, inferred: roleInferred } = getNuidSearchRole({ ...roleField, searchRole });

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
                            disabled={disabled}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <div className="text-sm text-muted-foreground">
                        {NUID_FIELD_TYPE_LABELS[type] || type}
                    </div>

                    <div>
                        <Label error={!!errors.keyId} htmlFor="keyId">Data key *</Label>
                        <Controller
                            control={control}
                            name="keyId"
                            rules={{
                                validate: value => {
                                    const [k] = value ? extractDataKeys([value]) : [];
                                    if (!k) return 'Choose a data key from the library.';
                                    if (!isCompatibleDataKey(k)) return `Choose a ${expectedTypeLabel} data key.`;
                                    const lowered = `${k.name || ''}`.trim().toLowerCase();
                                    if (otherKeys.some(o => `${o || ''}`.trim().toLowerCase() === lowered)) {
                                        return 'Another field on this page already uses this data key.';
                                    }
                                    if (hasOptions && !k.options?.length) return 'This data key has no options. Add them in the Data Key library.';
                                    return true;
                                },
                            }}
                            render={() => (
                                <SelectDataKey
                                    modal
                                    value={`${dataKey?.name || key || ''}`}
                                    placeholder="Choose a data key"
                                    disabled={isKeyLocked}
                                    error={!!errors.keyId || dataKeyTypeMismatch}
                                    filterDataKeys={isCompatibleDataKey}
                                    onChange={([item]) => {
                                        if (item) chooseKey(item);
                                    }}
                                />
                            )}
                        />
                        {!!errors.keyId && <span className="block text-xs text-danger">{`${errors.keyId.message || ''}`}</span>}

                        {!keyId && !!key && (
                            <span className="block text-xs text-danger">
                                This field uses <b>{key}</b>, which isn&apos;t linked to the Data Key library.
                                {matchingLibraryKey ? (
                                    <>
                                        {' '}
                                        <button
                                            type="button"
                                            className="underline"
                                            disabled={disabled}
                                            onClick={() => chooseKey(matchingLibraryKey)}
                                        >
                                            Link the library key {matchingLibraryKey.name}
                                        </button>
                                    </>
                                ) : ' Choose its data key above, or create it in the library.'}
                            </span>
                        )}

                        {dataKeyTypeMismatch && (
                            <span className="block text-xs text-danger">
                                The linked key is a <b>{dataKey?.dataType || 'untyped'}</b> key, but this field needs
                                a <b>{expectedTypeLabel}</b> one. Choose another data key.
                            </span>
                        )}

                        {!compatibleDataKeys.length && (
                            <span className="block text-xs text-danger">
                                There are no {expectedTypeLabel} data keys in the library yet. Create one there first.
                            </span>
                        )}

                        <span className="block text-xs text-muted-foreground">
                            Referenced in conditions as <b>${`${dataKey?.name || key || 'Key'}`}</b>.
                        </span>
                    </div>

                    {!!dataKey && (
                        <div className="rounded-md border border-border p-3 flex flex-col gap-y-3 text-sm">
                            <div className="flex items-center gap-x-2">
                                <span className="font-medium">From the Data Key library</span>
                                <div className="flex-1" />
                                <Link
                                    href={`/data-keys/edit/${keyId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline"
                                >
                                    Edit in the Data Key library
                                </Link>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">Label shown on the app</div>
                                <div>{dataKey.label || <span className="text-danger">No label. Add one in the library.</span>}</div>
                            </div>

                            {hasOptions && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Options</div>
                                    {!libraryOptions.length ? (
                                        <div className="text-danger">No options. Add them in the library.</div>
                                    ) : (
                                        <div className="flex flex-col gap-y-1">
                                            {libraryOptions.map(o => (
                                                <div key={o.value} className="flex items-center gap-x-2">
                                                    <span className="text-muted-foreground text-xs">{o.value}</span>
                                                    <span>{o.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <div className="text-xs text-muted-foreground">Confidentiality</div>
                                <div>
                                    {dataKey.confidential
                                        ? 'Confidential'
                                        : (dataKey.confidentialLabelOnly ? 'Confidential (label only)' : 'Not confidential')}
                                </div>
                            </div>

                            <span className="text-xs text-muted-foreground">
                                Changes made in the library show here the next time this script is opened.
                            </span>
                        </div>
                    )}

                    {type === 'text' && (
                        <div>
                            <Label>What does this search do?</Label>
                            {roleInferred && !!compatibleRoles.length && (
                                <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                                    Not set yet. The app currently treats it as <b>{getNuidSearchRoleLabel(effectiveRole)}</b>,
                                    based on its key and label.
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground mb-2">
                                {(keyId || key)
                                    ? <>Released app versions decide this from the key and label, and treat this field as <b>{describeLegacyNuidSearchBehaviour(roleField)}</b>. Only a matching role can be chosen, so every app version does the same thing.</>
                                    : 'Choose the data key first.'}
                                {!!(keyId || key) && !compatibleRoles.length && ' No role matches this key, so leave the role unset.'}
                            </p>
                            {!!errors.searchRole && <span className="block text-xs text-danger mb-2">{`${errors.searchRole.message || ''}`}</span>}
                            <Controller
                                control={control}
                                name="searchRole"
                                rules={{
                                    validate: value => (
                                        !value || compatibleRoles.includes(value)
                                        || `Released app versions treat this key as ${describeLegacyNuidSearchBehaviour(roleField)}. Choose a matching role, or leave it unset.`
                                    ),
                                }}
                                render={({ field: { value, onChange: onRoleChange } }) => (
                                    <RadioGroup
                                        disabled={disabled}
                                        value={value || ''}
                                        onValueChange={onRoleChange}
                                        className="flex flex-col gap-y-3"
                                    >
                                        {NUID_SEARCH_ROLES.map(r => (
                                            <div key={r.value} className={`flex items-start space-x-2 ${compatibleRoles.includes(r.value) ? '' : 'opacity-50'}`}>
                                                <RadioGroupItem
                                                    value={r.value}
                                                    id={`searchRole-${r.value}`}
                                                    className="mt-1"
                                                    disabled={!compatibleRoles.includes(r.value)}
                                                />
                                                <Label secondary htmlFor={`searchRole-${r.value}`} className="flex flex-col">
                                                    <span>{r.label}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">{r.description}</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    )}

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
                                    keysReady={keysReady}
                                    unavailableKeys={preScriptUnavailableOutcomeKeys}
                                    disabled={disabled}
                                    initialValue={`${field?.condition || ''}`}
                                    onValidityChange={setConditionHasErrors}
                                />
                            )}
                        />
                        {conditionHasErrors && (
                            <span className="text-xs text-danger">
                                You can save this, but the field may not show as expected on the app until the condition is fixed.
                            </span>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                control={control}
                                name="optional"
                                render={({ field: { value, onChange: onOptionalChange } }) => (
                                    <Switch
                                        id="optional"
                                        disabled={disabled}
                                        checked={!!value}
                                        onCheckedChange={onOptionalChange}
                                    />
                                )}
                            />
                            <Label htmlFor="optional">Optional</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            When off, the session cannot be started until this question is answered.
                        </span>
                    </div>
                </div>
            </Modal>
        </>
    );
}
