import { and, eq, isNull, or, sql, type SQL } from 'drizzle-orm';

import logger from '@/lib/logger';
import type { DbOrTransaction } from '@/databases/pg/db-client';
import {
    diagnoses,
    diagnosesDrafts,
    pendingDeletion,
    problems,
    problemsDrafts,
    screens,
    screensDrafts,
} from '@/databases/pg/schema';

/**
 * JSON keys that hold data key references in screens/diagnoses/problems. The
 * fence only inspects these, so ordinary text (labels, conditions) that happens
 * to contain a key never blocks a release.
 */
const REFERENCE_JSON_KEYS = new Set([
    'keyId',
    'refKeyId',
    'minDateKeyId',
    'maxDateKeyId',
    'minTimeKeyId',
    'maxTimeKeyId',
    'refIdDataKey',
]);

function escapeLikePattern(value: string) {
    return value.replace(/[\\%_]/g, '\\$&');
}

function collectDataKeyReferences(node: unknown, uniqueKeys: Set<string>, found: Set<string>) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
        node.forEach((item) => collectDataKeyReferences(item, uniqueKeys, found));
        return;
    }

    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (typeof value === 'string') {
            if (REFERENCE_JSON_KEYS.has(key) && uniqueKeys.has(value.trim())) {
                found.add(value.trim());
            }
        } else if (value && typeof value === 'object') {
            collectDataKeyReferences(value, uniqueKeys, found);
        }
    }
}

/**
 * Release fence: after every entity type has published inside the release
 * transaction, verify that no surviving published entity — and no remaining
 * draft, which would re-introduce the reference on a later publish — still
 * references the data keys deleted in this release. Entities queued in
 * pendingDeletion are ignored; they are removed within the same release.
 */
export async function _assertDataKeyRefsCleared({
    uniqueKeys,
    client,
}: {
    uniqueKeys: string[];
    client: DbOrTransaction;
}): Promise<{ success: boolean; errors?: string[] }> {
    try {
        const keys = Array.from(new Set(uniqueKeys.map((key) => `${key || ''}`.trim()).filter(Boolean)));
        if (!keys.length) return { success: true };

        const keySet = new Set(keys);
        const likeClauses = (column: SQL) => or(
            ...keys.map((key) => sql`${column}::text like ${`%${escapeLikePattern(key)}%`}`),
        );

        const blockers: string[] = [];
        const describeRefs = (found: Set<string>) => Array.from(found).map((key) => `"${key}"`).join(', ');

        // -------- published entities (excluding rows queued for deletion) --------
        const screenRows = await client
            .select({
                screenId: screens.screenId,
                scriptId: screens.scriptId,
                keyId: screens.keyId,
                refIdDataKey: screens.refIdDataKey,
                fields: screens.fields,
                items: screens.items,
                pendingDeletionId: pendingDeletion.id,
            })
            .from(screens)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
            .where(and(
                isNull(screens.deletedAt),
                or(
                    likeClauses(sql`${screens.keyId}`),
                    likeClauses(sql`${screens.refIdDataKey}`),
                    likeClauses(sql`${screens.fields}`),
                    likeClauses(sql`${screens.items}`),
                ),
            ));

        for (const row of screenRows) {
            if (row.pendingDeletionId) continue;
            const found = new Set<string>();
            collectDataKeyReferences({
                keyId: row.keyId,
                refIdDataKey: row.refIdDataKey,
                fields: row.fields,
                items: row.items,
            }, keySet, found);
            if (found.size) {
                blockers.push(`Screen ${row.screenId} (script ${row.scriptId}) still references ${describeRefs(found)}.`);
            }
        }

        const diagnosisRows = await client
            .select({
                diagnosisId: diagnoses.diagnosisId,
                scriptId: diagnoses.scriptId,
                keyId: diagnoses.keyId,
                symptoms: diagnoses.symptoms,
                pendingDeletionId: pendingDeletion.id,
            })
            .from(diagnoses)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
            .where(and(
                isNull(diagnoses.deletedAt),
                or(
                    likeClauses(sql`${diagnoses.keyId}`),
                    likeClauses(sql`${diagnoses.symptoms}`),
                ),
            ));

        for (const row of diagnosisRows) {
            if (row.pendingDeletionId) continue;
            const found = new Set<string>();
            collectDataKeyReferences({ keyId: row.keyId, symptoms: row.symptoms }, keySet, found);
            if (found.size) {
                blockers.push(`Diagnosis ${row.diagnosisId} (script ${row.scriptId}) still references ${describeRefs(found)}.`);
            }
        }

        const problemRows = await client
            .select({
                problemId: problems.problemId,
                scriptId: problems.scriptId,
                keyId: problems.keyId,
                symptoms: problems.symptoms,
                pendingDeletionId: pendingDeletion.id,
            })
            .from(problems)
            .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
            .where(and(
                isNull(problems.deletedAt),
                or(
                    likeClauses(sql`${problems.keyId}`),
                    likeClauses(sql`${problems.symptoms}`),
                ),
            ));

        for (const row of problemRows) {
            if (row.pendingDeletionId) continue;
            const found = new Set<string>();
            collectDataKeyReferences({ keyId: row.keyId, symptoms: row.symptoms }, keySet, found);
            if (found.size) {
                blockers.push(`Problem ${row.problemId} (script ${row.scriptId}) still references ${describeRefs(found)}.`);
            }
        }

        // -------- remaining drafts (would republish the dangling reference) --------
        const screenDraftRows = await client
            .select({
                screenDraftId: screensDrafts.screenDraftId,
                scriptId: screensDrafts.scriptId,
                data: screensDrafts.data,
                pendingDeletionId: pendingDeletion.id,
            })
            .from(screensDrafts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.screenDraftId, screensDrafts.screenDraftId))
            .where(likeClauses(sql`${screensDrafts.data}`));

        for (const row of screenDraftRows) {
            if (row.pendingDeletionId) continue;
            const found = new Set<string>();
            collectDataKeyReferences(row.data, keySet, found);
            if (found.size) {
                blockers.push(`Screen draft ${row.screenDraftId} still references ${describeRefs(found)}.`);
            }
        }

        const diagnosisDraftRows = await client
            .select({
                diagnosisDraftId: diagnosesDrafts.diagnosisDraftId,
                data: diagnosesDrafts.data,
                pendingDeletionId: pendingDeletion.id,
            })
            .from(diagnosesDrafts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisDraftId, diagnosesDrafts.diagnosisDraftId))
            .where(likeClauses(sql`${diagnosesDrafts.data}`));

        for (const row of diagnosisDraftRows) {
            if (row.pendingDeletionId) continue;
            const found = new Set<string>();
            collectDataKeyReferences(row.data, keySet, found);
            if (found.size) {
                blockers.push(`Diagnosis draft ${row.diagnosisDraftId} still references ${describeRefs(found)}.`);
            }
        }

        const problemDraftRows = await client
            .select({
                problemDraftId: problemsDrafts.problemDraftId,
                data: problemsDrafts.data,
                pendingDeletionId: pendingDeletion.id,
            })
            .from(problemsDrafts)
            .leftJoin(pendingDeletion, eq(pendingDeletion.problemDraftId, problemsDrafts.problemDraftId))
            .where(likeClauses(sql`${problemsDrafts.data}`));

        for (const row of problemDraftRows) {
            if (row.pendingDeletionId) continue;
            const found = new Set<string>();
            collectDataKeyReferences(row.data, keySet, found);
            if (found.size) {
                blockers.push(`Problem draft ${row.problemDraftId} still references ${describeRefs(found)}.`);
            }
        }

        if (blockers.length) {
            return {
                success: false,
                errors: [
                    'Cannot publish: data keys queued for deletion are still referenced. ' +
                    'Restore the replacement drafts (or remove the references) and publish again. ' +
                    blockers.slice(0, 10).join(' ') +
                    (blockers.length > 10 ? ` (+${blockers.length - 10} more)` : ''),
                ],
            };
        }

        return { success: true };
    } catch (e: any) {
        logger.error('_assertDataKeyRefsCleared ERROR', e.message);
        return { success: false, errors: [e.message] };
    }
}
