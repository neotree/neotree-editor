import { isNull } from 'drizzle-orm';

import db from '@/databases/pg/drizzle';
import { scripts as scriptsTable } from '@/databases/pg/schema';
import logger from '@/lib/logger';
import { recomputeScriptsConditionErrors } from '@/app/actions/scripts';

/**
 * Refreshes every script's CE report after a data key library change (save,
 * delete, merge, unlink or a revert of one of those).
 *
 * Scripts the operation already identified go first so the most likely affected
 * badges settle soonest; the rest follow. Failures are logged, never surfaced —
 * a library change must not fail because a badge could not be refreshed.
 *
 * Lives outside the 'use server' action files so it is not exposed as an action.
 */
let sweepInFlight: Promise<void> | null = null;
let queuedPriorities: Set<string> | null = null;

const toIds = (ids?: (string | null | undefined)[]) => Array.from(new Set((ids || []).map((id) => `${id || ''}`.trim()).filter(Boolean)));

export async function sweepAllScriptsConditionErrors(prioritised?: (string | null | undefined)[]): Promise<void> {
    // Bulk repairs call saveDataKeys many times in a row. Collapse overlapping
    // sweeps into one trailing pass instead of stacking a full pass per change,
    // keeping every caller's priorities for that pass.
    if (sweepInFlight) {
        queuedPriorities ||= new Set();
        toIds(prioritised).forEach((id) => queuedPriorities!.add(id));
        return sweepInFlight;
    }

    sweepInFlight = (async () => {
        try {
            let next: string[] | null = toIds(prioritised);
            while (next) {
                await runSweep(next);
                next = queuedPriorities ? Array.from(queuedPriorities) : null;
                queuedPriorities = null;
            }
        } finally {
            sweepInFlight = null;
        }
    })();

    return sweepInFlight;
}

async function runSweep(first: string[]): Promise<void> {
    try {
        if (first.length) await recomputeScriptsConditionErrors(first);

        const rows = await db
            .select({ scriptId: scriptsTable.scriptId })
            .from(scriptsTable)
            .where(isNull(scriptsTable.deletedAt));
        const done = new Set(first);
        const rest = rows
            .map((row) => `${row.scriptId || ''}`)
            .filter((id) => !!id && !done.has(id));
        if (rest.length) await recomputeScriptsConditionErrors(rest);
    } catch (e: any) {
        logger.error('sweepAllScriptsConditionErrors ERROR', e?.message);
    }
}

/** Script ids a recorded data key operation reported as changed. */
export function reportedScriptIds(res?: { preview?: { report?: { scripts?: { scriptId?: string }[] } } } | null) {
    return (res?.preview?.report?.scripts || []).map((script) => script.scriptId);
}
