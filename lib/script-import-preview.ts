/**
 * What an import from another editor would do, shown before anything is saved.
 * Shared by the server (app/actions/scripts.ts) and the import/export modals, so keep it dependency-free.
 */

export type ScriptImportEntityCounts = {
    added: number;
    updated: number;
    unchanged: number;
    removed: number;
    kept: number;
    /** Content unchanged, but the position changes (to follow the source's order). */
    moved: number;
};

export type ScriptImportChange = {
    kind:
        | 'added_from_source'
        | 'removed_by_source'
        | 'kept_target_only'
        | 'kept_target_removal'
        | 'conflict_source_wins'
        | 'conflict_kept_target'
        | 'replaced_without_history';
    path: string;
    label?: string;
    /** Properties concerned (replaced_without_history). */
    props?: string[];
};

export type ScriptImportPreview = {
    mode: 'merge' | 'new_copy';
    sourceScript: { scriptId: string; title: string };
    targetScript?: { scriptId: string; title: string } | null;
    /** No earlier import into this script is known, so nothing that only exists here is removed. */
    firstImport: boolean;
    /** The import would not change anything. */
    upToDate: boolean;
    /** Script-level settings that change (title, print sections, NUID search fields, ...). */
    scriptChanges?: string[];
    screens: ScriptImportEntityCounts;
    diagnoses: ScriptImportEntityCounts;
    problems: ScriptImportEntityCounts;
    options: {
        added: number;
        removedBySource: number;
        keptTargetOnly: number;
        conflicts: number;
    };
    /**
     * First import only: screens, fields and options here whose values differ from the source and take
     * the source's values (with no shared history it can't be told which side changed them).
     */
    replacedWithoutHistory?: number;
    removedEntities: { kind: 'screen' | 'diagnosis' | 'problem'; title: string; reason: string }[];
    keptEntities: { kind: 'screen' | 'diagnosis' | 'problem'; title: string }[];
    /** Option-level changes, capped (see changesTruncated). */
    changes: ScriptImportChange[];
    changesTruncated: number;
    dataKeys: {
        created: number;
        updated: number;
        optionsAdded: number;
        optionsRemoved: number;
        /** Per key: new, options added/removed, and properties (label, type...) that change. */
        details: { label: string; isNew: boolean; added: number; removed: number; changed?: string[] }[];
    };
    warnings: string[];
    /** The import needs an explicit confirmation before it can run. */
    requiresConfirmation?: {
        sourceMismatch?: string;
    } | null;
};

export const EMPTY_ENTITY_COUNTS: ScriptImportEntityCounts = { added: 0, updated: 0, unchanged: 0, removed: 0, kept: 0, moved: 0 };
