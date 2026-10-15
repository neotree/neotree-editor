import { inArray } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import { dataKeyMerges, users } from '@/databases/pg/schema';
import { _getDiagnoses, _getProblems, _getScreens } from '@/databases/queries/scripts';
import { buildMergeReport, type MergeReport } from '@/lib/data-key-merge-report';
import { captureMergeDraftRows, type MergeDraftRows, type MergeSnapshotScope } from './_merge-snapshot';

/**
 * Data key operations that change scripts — merge, delete/replace, replace or
 * remove in selected scripts, unlink options from a parent — all run through
 * here so they behave the same way:
 * - other users' unpublished changes in scope block the operation;
 * - a dry run executes everything and rolls back, returning exactly what would
 *   change in each script;
 * - a real run is recorded with the draft rows before and after it, so it can
 *   be reverted until it is published.
 */

export type DataKeyOperationKind = 'merge' | 'delete' | 'scripts' | 'unlink';

export type OperationConflict = {
    kind: 'data_key' | 'script';
    title: string;
    userName: string;
};

export type OperationPreview = {
    report: MergeReport;
    conflicts: OperationConflict[];
    scriptsChanged: number;
};

export type ScriptEntities = {
    screens: any[];
    diagnoses: any[];
    problems: any[];
};

export type OperationRecord = {
    kind: DataKeyOperationKind;
    title: string;
    scope: 'library' | 'scripts';
    /** The key the operation is about (the kept key for a merge). */
    subjectUniqueKey: string;
    subjectName: string;
    /** Keys the operation removed, replaced or unlinked. */
    affectedUniqueKeys: string[];
    scriptIds: string[];
    request: unknown;
    /** Extra report fields (e.g. deletedDataKeyIds). */
    reportExtras?: Record<string, unknown>;
};

const uniqueValues = (values: string[]) => Array.from(new Set(values.map((value) => `${value || ''}`.trim()).filter(Boolean)));

/** Thrown inside the transaction to roll a dry run back while keeping its result. */
class DryRunRollback<T> extends Error {
    constructor(public outcome: { preview: OperationPreview; result: T }) {
        super('dry run');
    }
}

export function conflictErrorMessage(conflicts: OperationConflict[]) {
    const first = conflicts[0];
    return `${first.userName} has unpublished changes to ${first.kind === 'script' ? 'the script' : 'the data key'} "${first.title}"` +
        `${conflicts.length > 1 ? ` (and ${conflicts.length - 1} more)` : ''}. ` +
        'Try again after those changes are published or discarded, so nobody’s work is overwritten.';
}

async function describeConflicts({
    client,
    rows,
    userId,
    scriptIds,
    dataKeyIds,
    titles,
}: {
    client: DbOrTransaction;
    rows: MergeDraftRows;
    userId?: string | null;
    scriptIds: Set<string>;
    dataKeyIds: Set<string>;
    titles: { script: (id: string) => string; dataKey: (id: string) => string };
}): Promise<OperationConflict[]> {
    const others = (row: Record<string, any>) => !!row.createdByUserId && row.createdByUserId !== userId;
    const found: { kind: OperationConflict['kind']; title: string; userId: string }[] = [];

    const scriptRows = [...rows.scriptsDrafts, ...rows.screensDrafts, ...rows.diagnosesDrafts, ...rows.problemsDrafts]
        .filter((row) => others(row) && (scriptIds.has(row.scriptId) || scriptIds.has(row.scriptDraftId)));
    const seenScripts = new Set<string>();
    for (const row of scriptRows) {
        const scriptId = scriptIds.has(row.scriptId) ? row.scriptId : row.scriptDraftId;
        const key = `${scriptId}:${row.createdByUserId}`;
        if (seenScripts.has(key)) continue;
        seenScripts.add(key);
        found.push({ kind: 'script', title: titles.script(scriptId), userId: row.createdByUserId });
    }

    for (const row of rows.dataKeysDrafts) {
        const keyId = row.dataKeyId || row.uuid;
        if (!others(row) || !dataKeyIds.has(keyId)) continue;
        found.push({ kind: 'data_key', title: titles.dataKey(keyId), userId: row.createdByUserId });
    }

    if (!found.length) return [];
    const people = await client
        .select({ userId: users.userId, displayName: users.displayName })
        .from(users)
        .where(inArray(users.userId, uniqueValues(found.map((item) => item.userId))));
    const nameOf = new Map(people.map((person) => [person.userId, person.displayName]));

    return found.map((item) => ({ kind: item.kind, title: item.title, userName: nameOf.get(item.userId) || 'another user' }));
}

/** "Name — Label [abcd1234]": duplicates share a name, so the short key tells them apart. */
export function reportKeyDescriber(byUniqueKey: Map<string, { name?: string | null; label?: string | null }>) {
    return (uniqueKey: string) => {
        const dataKey = byUniqueKey.get(uniqueKey);
        const name = dataKey ? `${dataKey.name || ''}${dataKey.label && dataKey.label !== dataKey.name ? ` — ${dataKey.label}` : ''}` : '';
        return name ? `${name} [${uniqueKey.slice(0, 8)}]` : uniqueKey;
    };
}

export async function runRecordedDataKeyOperation<T>({
    dryRun,
    userId,
    snapshotScope,
    titles,
    describeKey,
    run,
    record,
}: {
    dryRun?: boolean;
    userId?: string | null;
    /** Draft rows the operation may write; their scripts are also the report's scope. */
    snapshotScope: MergeSnapshotScope;
    titles: { script: (id: string) => string; dataKey: (id: string) => string };
    describeKey: (uniqueKey: string) => string;
    /** The operation itself, inside the transaction. `before` is the scripts' state before it. */
    run: (tx: DbOrTransaction, context: { before: ScriptEntities }) => Promise<T>;
    /** What to record for a real run. */
    record: (result: T, report: MergeReport) => OperationRecord;
}): Promise<{ preview: OperationPreview; result: T; operationId?: string }> {
    const scriptIds = uniqueValues(snapshotScope.scriptIds);
    let outcome: { preview: OperationPreview; result: T; operationId?: string } | undefined;

    try {
        await db.transaction(async (tx) => {
            const loadScripts = async (): Promise<ScriptEntities> => {
                if (!scriptIds.length) return { screens: [], diagnoses: [], problems: [] };
                const screens = await _getScreens({ scriptsIds: scriptIds, returnDraftsIfExist: true, client: tx });
                const diagnoses = await _getDiagnoses({ scriptsIds: scriptIds, returnDraftsIfExist: true, client: tx });
                const problems = await _getProblems({ scriptsIds: scriptIds, returnDraftsIfExist: true, client: tx });
                const errors = [...(screens.errors || []), ...(diagnoses.errors || []), ...(problems.errors || [])];
                if (errors.length) throw new Error(errors[0]);
                return { screens: screens.data, diagnoses: diagnoses.data, problems: problems.data };
            };

            const rowsBefore = await captureMergeDraftRows(tx, snapshotScope);
            const conflicts = await describeConflicts({
                client: tx,
                rows: rowsBefore,
                userId,
                scriptIds: new Set(scriptIds),
                dataKeyIds: new Set(snapshotScope.dataKeyIds),
                titles,
            });
            if (conflicts.length && !dryRun) throw new Error(conflictErrorMessage(conflicts));

            const before = await loadScripts();
            const result = await run(tx, { before });
            const after = await loadScripts();
            const report = buildMergeReport({ before, after, describeKey });
            const preview: OperationPreview = { report, conflicts, scriptsChanged: report.scripts.length };

            if (dryRun) throw new DryRunRollback({ preview, result });

            const rowsAfter = await captureMergeDraftRows(tx, snapshotScope);
            const entry = record(result, report);
            const [saved] = await tx.insert(dataKeyMerges).values({
                kind: entry.kind,
                title: entry.title,
                scope: entry.scope,
                survivorUniqueKey: entry.subjectUniqueKey,
                survivorName: entry.subjectName,
                mergedUniqueKeys: entry.affectedUniqueKeys,
                scriptIds: entry.scriptIds,
                request: entry.request,
                report: { ...report, ...(entry.reportExtras || {}) },
                snapshot: { scope: snapshotScope, before: rowsBefore, after: rowsAfter },
                createdByUserId: userId || null,
            }).returning({ mergeId: dataKeyMerges.mergeId });

            outcome = { preview, result, operationId: saved.mergeId };
        });
    } catch (e) {
        if (e instanceof DryRunRollback) return e.outcome as { preview: OperationPreview; result: T };
        throw e;
    }

    return outcome!;
}
