import { createHash } from "crypto";

/**
 * A content fingerprint of a screen / diagnosis / problem as the editor loads it. The editor sends it
 * back when saving; if the stored entity's fingerprint differs, somebody (another user, an import, a data
 * key update) changed it in the meantime and saving the whole form would overwrite that change.
 *
 * Row metadata and display-only fields are left out, as are empty values, so the published row and a
 * draft built from it fingerprint the same when their content is the same.
 */
const IGNORED_KEYS = new Set([
    'id',
    'createdAt',
    'updatedAt',
    'publishDate',
    'deletedAt',
    'isDraft',
    'isDeleted',
    'draftCreatedByUserId',
    'scriptTitle',
    'hospitalName',
    'draft',
    'revision',
    'baseRevision',
    'version',
    // computed by the scripts queries / background jobs, not edited content
    'conditionErrorReport',
    'hasChangedItems',
    'hasDeletedItems',
    'hasDraftedScreens',
    'hasDraftedDiagnoses',
    'hasDraftedProblems',
    'itemsChangedByUserId',
    'itemsDeletedByUserId',
    'screensDraftsCreatedByUserId',
    'diagnosesDraftsCreatedByUserId',
    'problemsDraftsCreatedByUserId',
]);

function canonical(value: unknown, topLevel: boolean): string {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Date) return JSON.stringify(value.toISOString());
    if (Array.isArray(value)) return `[${value.map(v => canonical(v, false)).join(',')}]`;
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj)
            .filter(k => obj[k] !== null && obj[k] !== undefined)
            .filter(k => !(topLevel && IGNORED_KEYS.has(k)))
            .sort();
        return `{${keys.map(k => `${JSON.stringify(k)}:${canonical(obj[k], false)}`).join(',')}}`;
    }
    return JSON.stringify(value);
}

export function computeEntityRevision(entity: Record<string, unknown> | null | undefined) {
    if (!entity) return '';
    return createHash('sha1').update(canonical(entity, true)).digest('hex');
}
