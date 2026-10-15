import { getTableColumns, inArray, or } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import db from '@/databases/pg/drizzle';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import {
    dataKeysDrafts,
    diagnosesDrafts,
    pendingDeletion,
    problemsDrafts,
    screensDrafts,
    scriptsDrafts,
} from '@/databases/pg/schema';

/**
 * Everything a merge may write is a DRAFT row (or a pending-deletion row), so
 * a merge can be undone before publish by putting those rows back. The scope is
 * the scripts the merge can touch and the data keys it involves.
 */
export type MergeSnapshotScope = {
    scriptIds: string[];
    dataKeyIds: string[];
    dataKeyUniqueKeys: string[];
};

type AnyRecord = Record<string, any>;

export type MergeDraftRows = {
    scriptsDrafts: AnyRecord[];
    screensDrafts: AnyRecord[];
    diagnosesDrafts: AnyRecord[];
    problemsDrafts: AnyRecord[];
    dataKeysDrafts: AnyRecord[];
    pendingDeletion: AnyRecord[];
};

const TABLES = {
    scriptsDrafts,
    screensDrafts,
    diagnosesDrafts,
    problemsDrafts,
    dataKeysDrafts,
    pendingDeletion,
} satisfies Record<keyof MergeDraftRows, PgTable>;

const sortById = (rows: AnyRecord[]) => [...rows].sort((a, b) => Number(a.id) - Number(b.id));

// Rows go through JSON (jsonb column), so compare and restore in JSON form.
const toJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export async function captureMergeDraftRows(client: DbOrTransaction, scope: MergeSnapshotScope): Promise<MergeDraftRows> {
    const scriptIds = Array.from(new Set(scope.scriptIds.filter(Boolean)));
    const keyIds = Array.from(new Set(scope.dataKeyIds.filter(Boolean)));
    const uniqueKeys = Array.from(new Set(scope.dataKeyUniqueKeys.filter(Boolean)));

    const byScript = async (table: typeof scriptsDrafts | typeof screensDrafts | typeof diagnosesDrafts | typeof problemsDrafts) => (
        !scriptIds.length ? [] : await client.select().from(table).where(or(
            inArray(table.scriptId, scriptIds),
            inArray(table.scriptDraftId, scriptIds),
        ))
    );

    const rows: MergeDraftRows = {
        scriptsDrafts: await byScript(scriptsDrafts),
        screensDrafts: await byScript(screensDrafts),
        diagnosesDrafts: await byScript(diagnosesDrafts),
        problemsDrafts: await byScript(problemsDrafts),
        dataKeysDrafts: (!keyIds.length && !uniqueKeys.length) ? [] : await client.select().from(dataKeysDrafts).where(or(
            keyIds.length ? inArray(dataKeysDrafts.uuid, keyIds) : undefined,
            keyIds.length ? inArray(dataKeysDrafts.dataKeyId, keyIds) : undefined,
            uniqueKeys.length ? inArray(dataKeysDrafts.uniqueKey, uniqueKeys) : undefined,
        )),
        pendingDeletion: !keyIds.length ? [] : await client.select().from(pendingDeletion).where(or(
            inArray(pendingDeletion.dataKeyId, keyIds),
            inArray(pendingDeletion.dataKeyDraftId, keyIds),
        )),
    };

    return toJson(Object.fromEntries(Object.entries(rows).map(([name, list]) => [name, sortById(list)])) as MergeDraftRows);
}

// Key order is not meaningful: jsonb re-sorts object keys when the snapshot is
// stored, while drafts written as JSON strings (older drizzle versions) keep
// theirs. Compare content with keys sorted at every level.
function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value as AnyRecord).sort().map((key) => [key, canonical((value as AnyRecord)[key])]));
    }
    return value;
}

/** True when both captures hold the same rows (same content, whatever the key order). */
export function sameMergeDraftRows(a: MergeDraftRows, b: MergeDraftRows) {
    return (Object.keys(TABLES) as (keyof MergeDraftRows)[])
        .every((name) => JSON.stringify(canonical(sortById(a[name] || []))) === JSON.stringify(canonical(sortById(b[name] || []))));
}

// JSON turned timestamps into strings; give date columns their Date back.
function reviveRow(table: PgTable, row: AnyRecord) {
    const columns = getTableColumns(table) as Record<string, { dataType: string }>;
    const revived: AnyRecord = { ...row };
    for (const [key, column] of Object.entries(columns)) {
        if (column.dataType === 'date' && typeof revived[key] === 'string') revived[key] = new Date(revived[key]);
    }
    return revived;
}

/**
 * Replaces the rows currently in scope (`current`) with `target`. Rows are
 * matched by primary key, so untouched rows are rewritten identically.
 */
export async function restoreMergeDraftRows(client: DbOrTransaction, current: MergeDraftRows, target: MergeDraftRows) {
    for (const name of Object.keys(TABLES) as (keyof MergeDraftRows)[]) {
        const table = TABLES[name] as PgTable & { id: any };
        const currentIds = (current[name] || []).map((row) => row.id);
        if (currentIds.length) await client.delete(table).where(inArray(table.id, currentIds));
    }
    for (const name of Object.keys(TABLES) as (keyof MergeDraftRows)[]) {
        const table = TABLES[name];
        const rows = (target[name] || []).map((row) => reviveRow(table, row));
        if (rows.length) await client.insert(table).values(rows as any);
    }
}

export type MergeSnapshot = {
    scope: MergeSnapshotScope;
    before: MergeDraftRows;
    after: MergeDraftRows;
};

/**
 * A merge can be reverted while its drafts are exactly as it left them. Once
 * they are published, discarded or edited, putting the old rows back would
 * lose someone's work, so it is refused.
 *
 * Lives here (not with the revert mutation) so read paths can use it without
 * importing the socket client.
 */
export async function isMergeRevertible(snapshot: MergeSnapshot | null | undefined) {
    if (!snapshot?.scope || !snapshot.after || !snapshot.before) return false;
    const current = await captureMergeDraftRows(db, snapshot.scope);
    return sameMergeDraftRows(current, snapshot.after);
}
