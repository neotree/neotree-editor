'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { arrayMoveImmutable } from "array-move";
import { v4 as uuidv4 } from "uuid";
import { useQueryState } from "nuqs";
import Link from "next/link";
import { Settings, Trash, Edit2, Eye, Plus, ArrowUp, ArrowDown, ExternalLink, Library, Sparkles, MoreVertical, Wand2 } from "lucide-react";

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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogClose, } from "@/components/ui/dialog";
import { defaultNuidSearchFields } from "@/constants/fields";
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
import {
    resolveNuidTemplate,
    buildNuidProvisionPayload,
    parseTemplateOptionValues,
    NUID_SEARCH_ROLES,
    NUID_FIELD_TYPE_LABELS,
    NUID_SUPPORTED_KEYS_DESCRIPTION,
    getNuidFieldTypeForDataKey,
    isNuidSupportedDataKey,
    getNuidSearchRole,
    getNuidSearchRoleLabel,
    getCompatibleNuidSearchRoles,
    describeLegacyNuidSearchBehaviour,
    applyLibraryKeyToNuidField,
    indexDataKeysById,
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

type QuickFix = { label: string; run?: () => void; href?: string; };

/**
 * This library's key for a field that is unlinked, or linked to a key the library doesn't
 * have: the one key with the field's name that the NUID Search page can use, preferring the
 * field's current kind (choice or search). Ambiguous names are left for the author.
 */
function findMatchingLibraryKey(f: ScriptField, allDataKeys: NuidLibraryKeyFull[]) {
    const name = `${f?.key || ''}`.trim();
    if (!name) return null;
    const usable = allDataKeys.filter(k => `${k.name || ''}`.trim() === name && isNuidSupportedDataKey(k));
    const sameKind = usable.filter(k => getNuidFieldTypeForDataKey(k) === f.type);
    if (sameKind.length === 1) return sameKind[0];
    return usable.length === 1 ? usable[0] : null;
}

/** Copies of the fields, each with a stable fieldId (deep links and the draft review rely on it). */
const withFieldIds = (flds: ScriptField[]) => (flds || []).map(f => ({ ...f, fieldId: f.fieldId || uuidv4() }));

/** "BabyTwin (Does the baby have a twin?)": the key with its label, for buttons and messages. */
function describeKey(k?: { name?: string | null; label?: string | null } | null) {
    const name = `${k?.name || ''}`.trim();
    const label = `${k?.label || ''}`.trim();
    return label && label !== name ? `${name} (${label})` : name;
}

/** What the publish check compares: everything the library owns. */
function isOutOfDateWithLibrary(f: ScriptField, expected: ScriptField) {
    return (['key', 'label', 'type', 'values'] as const).some(p => `${expected[p] ?? ''}` !== `${f[p] ?? ''}`)
        || !!expected.confidential !== !!f.confidential
        || !!expected.confidentialLabelOnly !== !!f.confidentialLabelOnly;
}

/** Confirm messages render as HTML; keys and labels are user content. */
const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function buildSpecFromFields(flds: ScriptField[]): NuidFieldSpec[] {
    return (flds || [])
        .map((f) => {
            const type = `${f?.type || ""}`.trim();
            return {
                key: `${f?.key || ""}`.trim(),
                type,
                label: `${f?.label || ""}`.trim(),
                condition: f?.condition ? `${f.condition}` : undefined,
                options: type === "dropdown"
                    ? parseTemplateOptionValues(f?.values)
                    : undefined,
            } satisfies NuidFieldSpec;
        })
        .filter((s) => !!s.key);
}

/**
 * Links unlinked fields to the library key of the same name and kind, and brings
 * linked fields of the same kind up to date with their key (key, label, options,
 * confidentiality). Only run for an explicit action (Create & link, starter fields).
 * A field whose key is of another kind, or a kind the app can't show, is left as it
 * is, to be reported and fixed per field rather than silently changed.
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
        if (!isNuidSupportedDataKey(libraryKey)) return f;
        // Never changes a field's kind here (a choice becoming a search breaks the conditions
        // that rely on it): that stays an explicit per-field "Update from library".
        if (getNuidFieldTypeForDataKey(libraryKey) !== f.type) return f;
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
    const scriptType = watch('type');

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

    type SelectedField = { field: ScriptField; index: number; };
    const [selectedField, setSelectedField] = useState<SelectedField>();
    // A deep-linked field opens once the sheet is open. Opening both in the same render
    // left each modal marking the other aria-hidden, so the field form was invisible to
    // assistive technology.
    const [pendingField, setPendingField] = useState<SelectedField | undefined>(initialField);
    const [_nuidSearchEnabled, _setNuidSearchEnabled] = useState(nuidSearchEnabled);
    const [addingField, setAddingField] = useState(false);
    const [open, setOpen] = useState(!!initialField);

    // Set when the sheet's content has mounted (its open auto-focus), cleared when it closes.
    const [sheetReady, setSheetReady] = useState(false);
    useEffect(() => {
        if (!open) setSheetReady(false);
    }, [open]);

    useEffect(() => {
        if (!open || !sheetReady || !pendingField) return;
        setSelectedField(pendingField);
        setPendingField(undefined);
    }, [open, sheetReady, pendingField]);

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

    // Switching NUID Search on opens the page; standard fields it brought in are linked to the
    // library once it has loaded (below). That is the author's action, not a silent change.
    const [linkStarterFields, setLinkStarterFields] = useState(false);
    useEffect(() => {
        if (nuidSearchEnabled && !_nuidSearchEnabled) {
            setOpen(true);
            setLinkStarterFields(true);
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

        if (field) setPendingField({ index, field, });
        setDeepLinkedField('');
    }, [deepLinkedField, fields, setDeepLinkedField]);

    const { confirm } = useConfirmModal();
    const { allDataKeys, saveDataKeys, loadingDataKeys } = useDataKeysCtx();

    useEffect(() => {
        if (!linkStarterFields || loadingDataKeys) return;
        setLinkStarterFields(false);
        // Only fields that came in unlinked (the standard fields); a page with links is left alone.
        if (!fields?.length || fields.some(f => f.keyId)) return;
        const { updated } = syncWithLibrary(withFieldIds(fields), allDataKeys);
        setValue('nuidSearchFields', updated, { shouldDirty: true, });
        setDraft(updated);
    }, [linkStarterFields, loadingDataKeys, fields, allDataKeys, setValue]);

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

    // Opening a script never changes its fields. Linking unlinked fields and refreshing
    // fields from the library are offered in Issues (one by one, or "Fix automatically"),
    // so a saved draft only ever holds what the author chose. Changing them silently here
    // put changes to untouched fields into the next save's draft.

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
        const target = rows[index];
        if (!target) return;
        const name = escapeHtml(`${target.label || target.key || `Field ${index + 1}`}`);
        const key = escapeHtml(`${target.key || ''}`.trim());
        confirm(() => {
            // Remove by identity, not position: the rows may have changed while the dialog was open.
            setDraft(prev => {
                const base = prev ?? fields;
                const at = base.indexOf(target);
                return base.filter((_, i) => i !== (at >= 0 ? at : index));
            });
        }, {
            danger: true,
            title: 'Remove field?',
            message: [
                `<p><b>${name}</b> will be removed from this script's NUID Search page.</p>`,
                key ? `<p>The data key <b>${key}</b> stays in the Data Key library. Conditions that use <b>$${key}</b> will no longer find it.</p>` : '',
                '<p>Nothing is saved until you choose <b>Apply changes</b>.</p>',
            ].join(''),
            positiveLabel: 'Remove',
            negativeLabel: 'Cancel',
        });
    }, [rows, fields, confirm]);

    const onUseStarterFields = useCallback(() => {
        const starter = (scriptType === 'admission'
            ? defaultNuidSearchFields.admission
            : defaultNuidSearchFields.other) as unknown as ScriptField[];
        // Linked to existing library keys where they match; the rest are offered for creation.
        const { updated } = syncWithLibrary(withFieldIds(starter), allDataKeys);
        setDraft(updated);
    }, [scriptType, allDataKeys]);

    // ---- Quick fixes for the Issues panel -------------------------------------------

    const libraryIndex = useMemo(() => indexDataKeysById(allDataKeys as NuidLibraryKeyFull[]), [allDataKeys]);
    const getLibraryKey = useCallback(
        (id: string) => libraryIndex.get(id) as NuidLibraryKeyFull | undefined,
        [libraryIndex]
    );

    const replaceRow = useCallback((index: number, next: ScriptField) => {
        setDraft(prev => (prev ?? fields).map((f, i) => (i === index ? next : f)));
    }, [fields]);

    const getQuickFixes = useCallback((f: ScriptField, index: number): QuickFix[] => {
        if (disabled || loadingDataKeys || !f) return [];
        const fixes: QuickFix[] = [];
        const key = `${f.key || ''}`.trim();
        const libraryKey = f.keyId ? getLibraryKey(`${f.keyId}`) : undefined;

        if (!f.keyId || !libraryKey) {
            // Unlinked, or linked to a key this library doesn't have (e.g. an id from another
            // editor that came in with an import): link this library's key of the same name and type.
            const match = findMatchingLibraryKey(f, allDataKeys as NuidLibraryKeyFull[]);
            if (match) {
                const becomes = getNuidFieldTypeForDataKey(match);
                fixes.push({
                    label: `Link ${describeKey(match)}${becomes && becomes !== f.type ? `, becomes a ${NUID_FIELD_TYPE_LABELS[becomes]}` : ''}`,
                    run: () => replaceRow(index, applyLibraryKeyToNuidField({ ...f, keyId: match.uniqueKey || undefined }, match, getLibraryKey)),
                });
            } else if (key && !f.keyId) {
                fixes.push({ label: `Create ${key} in the library`, run: () => onAddToLibrary() });
            }
        } else if (isNuidSupportedDataKey(libraryKey)) {
            // The field follows its key in everything the key owns, its type included.
            const expected = applyLibraryKeyToNuidField(f, libraryKey, getLibraryKey);
            if (isOutOfDateWithLibrary(f, expected)) {
                fixes.push({
                    label: expected.type !== f.type
                        ? `Update from library, becomes a ${NUID_FIELD_TYPE_LABELS[expected.type] || expected.type}`
                        : 'Update from library',
                    run: () => replaceRow(index, expected),
                });
            }
            if ((expected.type === 'dropdown') && !libraryKey.options?.length) {
                fixes.push({ label: 'Add options in the library', href: `/data-keys/edit/${f.keyId}` });
            }
        }

        if ((f.type === 'text') && (f.keyId || key)) {
            const compatible = getCompatibleNuidSearchRoles(f);
            const role = f.searchRole;
            if (!role && compatible.length) {
                fixes.push({
                    label: `Set role to ${getNuidSearchRoleLabel(compatible[0])}`,
                    run: () => replaceRow(index, { ...f, searchRole: compatible[0] }),
                });
            } else if (role && !compatible.includes(role)) {
                fixes.push(compatible.length
                    ? { label: `Set role to ${getNuidSearchRoleLabel(compatible[0])}`, run: () => replaceRow(index, { ...f, searchRole: compatible[0] }) }
                    : { label: 'Clear role', run: () => replaceRow(index, { ...f, searchRole: undefined }) });
            }
        }

        return fixes;
    }, [disabled, loadingDataKeys, getLibraryKey, allDataKeys, replaceRow, onAddToLibrary]);

    // Fixes that change nothing about what the app does: linking this library's key of the
    // same name and type (for an unlinked field, or one linked to a key this library doesn't
    // have), refreshing from the library, and writing down the role the app already infers.
    // Type changes and role changes stay one at a time.
    const autoFixed = useMemo(() => {
        if (disabled || loadingDataKeys) return null;
        let count = 0;
        const next = rows.map((f) => {
            let value = f;
            const linkedKey = value.keyId ? getLibraryKey(`${value.keyId}`) : undefined;
            // Never a type change: a choice becoming a search (or the reverse) is the author's call.
            const sameKind = (k: NuidLibraryKeyFull) => getNuidFieldTypeForDataKey(k) === value.type;
            if (!linkedKey) {
                // Unlinked, or linked to a key this library doesn't have: same name and kind only.
                const match = findMatchingLibraryKey(value, allDataKeys as NuidLibraryKeyFull[]);
                if (match && sameKind(match)) value = applyLibraryKeyToNuidField({ ...value, keyId: match.uniqueKey || undefined }, match, getLibraryKey);
            } else if (sameKind(linkedKey)) {
                const expected = applyLibraryKeyToNuidField(value, linkedKey, getLibraryKey);
                if (isOutOfDateWithLibrary(value, expected)) value = expected;
            }
            if ((value.type === 'text') && !value.searchRole) {
                const [role] = getCompatibleNuidSearchRoles(value);
                if (role) value = { ...value, searchRole: role };
            }
            if (value !== f) count++;
            return value;
        });
        return count ? { next, count } : null;
    }, [disabled, loadingDataKeys, rows, allDataKeys, getLibraryKey]);

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
        setPendingField(undefined);
        setAddingField(false);
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
                                            <span className="font-medium">{m.label || m.key}</span>
                                            <span className="text-xs text-muted-foreground">{m.key}</span>
                                            <div className="flex-1" />
                                            <span className="text-xs text-muted-foreground">
                                                {m.options?.length ? NUID_FIELD_TYPE_LABELS.dropdown : NUID_FIELD_TYPE_LABELS.text}
                                            </span>
                                        </div>
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
                                    The library already has a key with this name, but of another kind, so it isn&apos;t
                                    used: the page&apos;s conditions rely on each field staying what it is. Choose
                                    another data key in the field&apos;s settings.
                                </p>
                                {provision.conflicts.map((c) => (
                                    <div key={c.key} className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2">
                                        <span className="font-medium">{c.label || c.key}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">{c.key}</span>
                                        <div className="text-xs text-danger">
                                            Needs a {NUID_FIELD_TYPE_LABELS[c.expectedType] || c.expectedType} ({c.expectedType === 'dropdown' ? 'dropdown or single select' : 'text'} key);
                                            the library&apos;s {c.foundLabel ? <>&ldquo;{c.foundLabel}&rdquo; </> : null}key is a <b>{c.foundType}</b> key.
                                        </div>
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
                        <button
                            type="button"
                            className="inline-flex items-center gap-x-2 text-sm text-muted-foreground hover:text-primary"
                            title="Configure the NUID Search page"
                            onClick={e => {
                                e.preventDefault();
                                setOpen(true);
                            }}
                        >
                            <Settings className="w-4 h-4" />
                            <span>
                                {fields.length
                                    ? `${fields.length} field${fields.length === 1 ? '' : 's'}`
                                    : 'No fields'}
                            </span>
                            {!!savedErrorCount && <span className="text-xs text-danger">{savedErrorCount} error{savedErrorCount === 1 ? '' : 's'}</span>}
                            {!!savedWarningCount && <span className="text-xs text-amber-600 dark:text-amber-400">{savedWarningCount} warning{savedWarningCount === 1 ? '' : 's'}</span>}
                        </button>
                    </SheetTrigger>
                )}

                <SheetContent
                    hideCloseButton
                    side="right"
                    onOpenAutoFocus={() => setSheetReady(true)}
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

                                    <Button
                                        variant="ghost"
                                        disabled={disabled}
                                        onClick={() => setAddingField(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add field
                                    </Button>
                                </>
                            )}
                            noDataMessage={(
                                <div className="flex flex-col items-center gap-y-3 py-6 text-sm">
                                    <span className="text-muted-foreground">
                                        No fields yet. Add the questions the app asks on its NUID Search page.
                                    </span>
                                    {!disabled && (
                                        <span className="flex flex-wrap justify-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => onUseStarterFields()}>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Start from the standard fields
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setAddingField(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add a field
                                            </Button>
                                        </span>
                                    )}
                                </div>
                            )}
                            columns={[
                                {
                                    name: 'Type',
                                    // From the linked key: a dropdown key is a choice, a text key a search.
                                    cellRenderer({ rowIndex }) {
                                        const f = rows[rowIndex];
                                        const k = f?.keyId ? getLibraryKey(`${f.keyId}`) : undefined;
                                        const fromKey = k ? getNuidFieldTypeForDataKey(k) : null;
                                        const stored = NUID_FIELD_TYPE_LABELS[f?.type] || f?.type || '-';
                                        // Until "Update from library", the app still gets the stored type.
                                        if (fromKey && fromKey !== f?.type) {
                                            return (
                                                <span className="inline-flex flex-col">
                                                    <span>{stored}</span>
                                                    <span className="text-xs text-amber-700 dark:text-amber-300">→ {NUID_FIELD_TYPE_LABELS[fromKey]} after update</span>
                                                </span>
                                            );
                                        }
                                        return <span>{stored}</span>;
                                    },
                                },
                                {
                                    name: 'Key',
                                    cellRenderer({ rowIndex }) {
                                        const f = rows[rowIndex];
                                        const k = f?.keyId ? getLibraryKey(`${f.keyId}`) : undefined;
                                        return (
                                            <span className="inline-flex flex-col">
                                                {/* What devices get now; the library's name once updated. */}
                                                <span>{f?.key || k?.name}</span>
                                                {!!k?.name && !!f?.key && k.name !== f.key && (
                                                    <span className="text-xs text-amber-700 dark:text-amber-300">→ {k.name} after update</span>
                                                )}
                                                {!f?.keyId && <span className="text-xs text-danger">Not linked</span>}
                                                {!!f?.keyId && !loadingDataKeys && !k && <span className="text-xs text-danger">Key not in this library</span>}
                                                {!!k && !isNuidSupportedDataKey(k) && <span className="text-xs text-danger">{k.dataType} key not supported</span>}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    name: 'Label',
                                    // What the app shows now, and the library's label when it differs.
                                    cellRenderer({ rowIndex }) {
                                        const f = rows[rowIndex];
                                        const k = f?.keyId ? getLibraryKey(`${f.keyId}`) : undefined;
                                        const stored = `${f?.label || ''}`.trim();
                                        const library = `${k?.label || ''}`.trim();
                                        return (
                                            <span className="inline-flex flex-col">
                                                {stored ? <span>{stored}</span> : <span className="text-xs text-danger">No label</span>}
                                                {!!library && library !== stored && (
                                                    <span className="text-xs text-amber-700 dark:text-amber-300">→ {library} after update</span>
                                                )}
                                            </span>
                                        );
                                    },
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
                                        const name = f?.label || f?.key || `field ${rowIndex + 1}`;
                                        return (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Actions for ${name}`}
                                                        className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="focus:text-primary focus:bg-primary/20"
                                                        onSelect={() => setSelectedField({ index: rowIndex, field: f, })}
                                                    >
                                                        {disabled ? <Eye className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}
                                                        {disabled ? 'View' : 'Edit'}
                                                    </DropdownMenuItem>

                                                    {!!f?.keyId && (
                                                        <DropdownMenuItem
                                                            asChild
                                                            className="focus:text-primary focus:bg-primary/20"
                                                        >
                                                            <Link target="_blank" rel="noopener noreferrer" href={`/data-keys/edit/${f.keyId}`}>
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                View data key
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem
                                                        className="focus:text-primary focus:bg-primary/20"
                                                        disabled={disabled || (rowIndex === 0)}
                                                        onSelect={() => onReorder(rowIndex, rowIndex - 1)}
                                                    >
                                                        <ArrowUp className="mr-2 h-4 w-4" />
                                                        Move up
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className="focus:text-primary focus:bg-primary/20"
                                                        disabled={disabled || (rowIndex === (rows.length - 1))}
                                                        onSelect={() => onReorder(rowIndex, rowIndex + 1)}
                                                    >
                                                        <ArrowDown className="mr-2 h-4 w-4" />
                                                        Move down
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        disabled={disabled}
                                                        onSelect={() => onDelete(rowIndex)}
                                                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Remove</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        );
                                    },
                                },
                            ]}
                            data={rows.map(f => [
                                '',
                                '',
                                '',
                                '',
                                f.condition,
                                f.optional ? 'No' : 'Yes',
                                '',
                                '',
                            ])}
                        />

                        {!!fieldsWithIssues.length && (
                            <div className="px-4 flex flex-col gap-y-3 text-sm">
                                <div className="flex items-center gap-x-2">
                                    <span className="font-medium">Issues</span>
                                    <div className="flex-1" />
                                    {!!autoFixed && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            title="Links keys of the same name, refreshes fields from the library, and records the role the app already uses."
                                            onClick={() => setDraft(autoFixed.next)}
                                        >
                                            <Wand2 className="h-4 w-4 mr-2" />
                                            Fix {autoFixed.count} field{autoFixed.count === 1 ? '' : 's'} automatically
                                        </Button>
                                    )}
                                </div>
                                {fieldsWithIssues.map(({ f, i, issues }) => {
                                    const fixes = getQuickFixes(f, i);
                                    return (
                                        <div key={`${f.fieldId || i}`} className="rounded-md border border-border px-3 py-2">
                                            <button
                                                type="button"
                                                className="font-medium hover:text-primary text-left"
                                                onClick={() => setSelectedField({ index: i, field: f, })}
                                            >
                                                {f.label || f.key || `Field ${i + 1}`}
                                                {!!f.label && !!f.key && f.label !== f.key && (
                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">{f.key}</span>
                                                )}
                                            </button>
                                            <ul className="mt-1 list-disc pl-5 text-xs">
                                                {issues!.errors.map(e => <li key={e} className="text-danger">{e}</li>)}
                                                {issues!.conditionErrors.map(e => <li key={e} className="text-danger">{e}</li>)}
                                                {issues!.warnings.map(w => <li key={w} className="text-amber-700 dark:text-amber-300">{w}</li>)}
                                            </ul>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {fixes.map(fix => fix.href ? (
                                                    <Button key={fix.label} asChild variant="outline" size="sm" className="h-7 text-xs">
                                                        <Link href={fix.href} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            {fix.label}
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button key={fix.label} variant="outline" size="sm" className="h-7 text-xs" onClick={fix.run}>
                                                        <Wand2 className="h-3 w-3 mr-1" />
                                                        {fix.label}
                                                    </Button>
                                                ))}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => setSelectedField({ index: i, field: f, })}
                                                >
                                                    <Edit2 className="h-3 w-3 mr-1" />
                                                    {disabled ? 'View field' : 'Edit field'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
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
                    extraKeys={nuidFieldKeys}
                    otherKeys={rows.filter((_, i) => i !== selectedField.index).map(f => f.key)}
                    onClose={() => setSelectedField(undefined)}
                    onChange={field => {
                        // A deep link can open a field before the sheet's copy exists.
                        const base = draft ?? fields;
                        const next = base.map((f, i) => {
                            // The form returns the whole field (built on this one), so props it drops stay dropped.
                            if (i === selectedField?.index) return field;
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

            {addingField && (
                <Field
                    open
                    disabled={disabled}
                    extraKeys={nuidFieldKeys}
                    otherKeys={rows.map(f => f.key)}
                    onClose={() => setAddingField(false)}
                    onChange={field => {
                        updateDraft([...rows, field]);
                        setAddingField(false);
                    }}
                />
            )}
        </>
    );
}

export function Field({
    open,
    field,
    disabled,
    extraKeys,
    otherKeys = [],
    onChange,
    onClose,
}: {
    open: boolean;
    field?: ScriptField;
    disabled?: boolean;
    extraKeys?: ConditionKey[];
    /** Keys of the page's other fields, which this one must not repeat. */
    otherKeys?: string[];
    onClose: () => void;
    onChange: (field: ScriptField) => void;
}) {
    const { extractDataKeys, allDataKeys } = useDataKeysCtx();

    const { getDefaultValues } = useField({ ...field } as ScriptField);

    const isNew = !field;

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors, isDirty, },
    } = useForm({
        defaultValues: {
            ...getDefaultValues(),
            // Existing fields keep "not set" until the author picks; new ones get a role once a key is chosen.
            searchRole: field?.searchRole || undefined,
        } as ScriptField,
    });

    const { conditionKeys, keysLoading, keysReady } = useConditionKeys();
    const [conditionHasErrors, setConditionHasErrors] = useState(false);
    const { confirm } = useConfirmModal();

    // Closing by Cancel, Escape or a click outside asks first when there are edits.
    const requestClose = useCallback(() => {
        if (disabled || !isDirty) return onClose();
        confirm(onClose, {
            danger: true,
            title: 'Discard changes?',
            message: `Your changes to this field have not been saved.`,
            positiveLabel: 'Discard',
            negativeLabel: 'Keep editing',
        });
    }, [disabled, isDirty, onClose, confirm]);

    const key = watch('key');
    const keyId = watch('keyId');
    const searchRole = watch('searchRole');

    const getKey = useCallback((id: string) => (extractDataKeys([id])[0] || null) as NuidLibraryKeyFull | null, [extractDataKeys]);

    const dataKey = useMemo(() => {
        const [k] = !keyId ? [null] : extractDataKeys([keyId]);
        return k;
    }, [keyId, extractDataKeys]);

    // The type comes from the data key: a dropdown key is a choice, a text key a search.
    const keyType = dataKey ? getNuidFieldTypeForDataKey(dataKey) : null;
    const type = keyType || field?.type || '';
    const hasOptions = type === 'dropdown';
    const unsupportedKey = !!dataKey && !keyType;
    const typeChanges = !isNew && !!keyType && keyType !== field?.type;

    // Only keys the mobile app can show on its NUID Search page are offered.
    const supportedDataKeys = useMemo(() => allDataKeys.filter(isNuidSupportedDataKey), [allDataKeys]);

    // A legacy field that names a key without linking it: offer the library key of that name.
    const matchingLibraryKey = useMemo(() => {
        if (!`${key || ''}`.trim() || keyId) return null;
        return findMatchingLibraryKey({ ...(field || {}), key } as ScriptField, supportedDataKeys as NuidLibraryKeyFull[]);
    }, [key, keyId, field, supportedDataKeys]);

    // What the app will show, straight from the library.
    const libraryOptions = useMemo(() => {
        const children = !dataKey?.options?.length ? [] : extractDataKeys(dataKey.options);
        return children.map(c => ({ value: `${c.name}`, label: `${c.label || c.name}`, }));
    }, [dataKey, extractDataKeys]);

    const chooseKey = useCallback((item: DataKey) => {
        setValue('keyId', item.uniqueKey, { shouldDirty: true, shouldValidate: true, });
        setValue('key', item.name, { shouldDirty: true, });
        const nextType = getNuidFieldTypeForDataKey(item);
        if (nextType === 'text') {
            // Keep the role only if released app versions agree with it for this key.
            const compatible = getCompatibleNuidSearchRoles({ key: item.name, label: item.label || item.name, type: nextType });
            const current = watch('searchRole');
            const next = current && compatible.includes(current) ? current : (isNew ? compatible[0] : undefined);
            setValue('searchRole', next, { shouldDirty: true, shouldValidate: true, });
        } else {
            setValue('searchRole', undefined, { shouldDirty: true, });
        }
    }, [setValue, watch, isNew]);

    // Any field can be pointed at another key, including keys created for NUID Search.
    const isKeyLocked = !!disabled;

    // Saves only what the NUID Search page owns (condition, required, role) on top of the
    // field as it was, then everything the key owns from the library. The form's own
    // defaults for screen fields (format, items, min/max…) never reach the script, and
    // values the author didn't change keep their stored form, so the draft shows only the edit.
    const onSave = handleSubmit(data => {
        if (!dataKey) return;
        const base: ScriptField = field ? { ...field } : ({ fieldId: data.fieldId } as ScriptField);
        const same = (a: unknown, b: unknown) => `${a ?? ''}` === `${b ?? ''}`;
        if (!same(data.condition, field?.condition)) base.condition = `${data.condition || ''}`;
        if (!!data.optional !== !!field?.optional) base.optional = !!data.optional;
        const next = applyLibraryKeyToNuidField({ ...base, keyId: dataKey.uniqueKey } as ScriptField, dataKey as NuidLibraryKeyFull, getKey);
        if (next.type === 'text') {
            if (!same(data.searchRole, field?.searchRole)) next.searchRole = data.searchRole || undefined;
        } else {
            delete next.searchRole;
        }
        if (next.searchRole === undefined) delete next.searchRole;
        onChange(next);
    });

    // Released app versions ignore the role and go by key and label, so only roles that
    // mean exactly that are offered until every device has the update.
    const roleField = { key: dataKey?.name || key, label: dataKey?.label || dataKey?.name || '', type };
    const compatibleRoles = getCompatibleNuidSearchRoles(roleField);
    const { role: effectiveRole, inferred: roleInferred } = getNuidSearchRole({ ...roleField, searchRole });

    return (
        <>
            <Modal
                title={field ? (disabled ? 'View field' : 'Edit field') : 'Add field'}
                open={open}
                onOpenChange={isOpen => {
                    if (!isOpen) requestClose();
                }}
                actions={(
                    <>
                        <span className="text-sm text-danger">* Required</span>

                        <div className="flex-1" />

                        <Button
                            variant="ghost"
                            onClick={() => requestClose()}
                        >
                            {disabled ? 'Close' : 'Cancel'}
                        </Button>

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
                    <div>
                        <Label error={!!errors.keyId} htmlFor="keyId">Data key *</Label>
                        <Controller
                            control={control}
                            name="keyId"
                            rules={{
                                validate: value => {
                                    const [k] = value ? extractDataKeys([value]) : [];
                                    if (!k) return 'Choose a data key from the library.';
                                    if (!isNuidSupportedDataKey(k)) return `The mobile app can't show a ${k.dataType || 'untyped'} key here. ${NUID_SUPPORTED_KEYS_DESCRIPTION}`;
                                    const lowered = `${k.name || ''}`.trim().toLowerCase();
                                    if (otherKeys.some(o => `${o || ''}`.trim().toLowerCase() === lowered)) {
                                        return 'Another field on this page already uses this data key.';
                                    }
                                    if ((getNuidFieldTypeForDataKey(k) === 'dropdown') && !k.options?.length) return 'This data key has no options. Add them in the Data Key library.';
                                    return true;
                                },
                            }}
                            render={() => (
                                <SelectDataKey
                                    modal
                                    value={dataKey ? describeKey(dataKey) : `${key || ''}`}
                                    placeholder="Choose a data key"
                                    disabled={isKeyLocked}
                                    error={!!errors.keyId || unsupportedKey}
                                    filterDataKeys={isNuidSupportedDataKey}
                                    onChange={([item]) => {
                                        if (item) chooseKey(item);
                                    }}
                                />
                            )}
                        />
                        {!!errors.keyId && <span className="block text-xs text-danger">{`${errors.keyId.message || ''}`}</span>}

                        <span className="block text-xs text-muted-foreground">
                            {NUID_SUPPORTED_KEYS_DESCRIPTION} The field type follows the key.
                        </span>

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
                                            onClick={() => chooseKey(matchingLibraryKey as DataKey)}
                                        >
                                            Link the library key {describeKey(matchingLibraryKey)}
                                        </button>
                                    </>
                                ) : ' Choose its data key above, or create it in the library.'}
                            </span>
                        )}

                        {unsupportedKey && (
                            <span className="block text-xs text-danger">
                                The linked key is a <b>{dataKey?.dataType || 'untyped'}</b> key, which the mobile app can&apos;t
                                show on the NUID Search page. Choose another data key.
                            </span>
                        )}

                        <span className="block text-xs text-muted-foreground">
                            Referenced in conditions as <b>${`${dataKey?.name || key || 'Key'}`}</b>.
                        </span>
                    </div>

                    {!!type && (
                        <div className="text-sm">
                            <div className="text-xs text-muted-foreground">Shown on the app as</div>
                            <div className="font-medium">
                                {NUID_FIELD_TYPE_LABELS[type] || type}
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    {type === 'dropdown' ? 'a question with the key\'s options' : 'a search for a record by its Neotree ID'}
                                </span>
                            </div>
                            {typeChanges && (
                                <span className="block mt-1 text-xs text-amber-700 dark:text-amber-300">
                                    This field was a {NUID_FIELD_TYPE_LABELS[field?.type || ''] || field?.type}. With this key it becomes
                                    a {NUID_FIELD_TYPE_LABELS[keyType!]}: check the conditions that use it.
                                </span>
                            )}
                        </div>
                    )}

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
                                            {/* Indexed: a key's options can repeat a value (the library allows it). */}
                                            {libraryOptions.map((o, i) => (
                                                <div key={`${o.value}:${i}`} className="flex items-center gap-x-2">
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
