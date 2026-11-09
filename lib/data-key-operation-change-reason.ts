/**
 * Changelog wording for data key operations (merge, delete/replace, change in
 * selected scripts, unlink). The release's changelog entries for the scripts
 * and keys an operation changed carry this, so the changelog says *why* a
 * screen or key changed, not only that it did.
 */

export type DataKeyOperationKind = 'merge' | 'delete' | 'scripts' | 'unlink';

const KIND_LABELS: Record<DataKeyOperationKind, string> = {
    merge: 'Data key merge',
    delete: 'Data key delete/replace',
    scripts: 'Data key change in selected scripts',
    unlink: 'Data key unlink',
};

export function dataKeyOperationChangeReason(operation: { kind?: string | null; title?: string | null; survivorName?: string | null; }) {
    const label = KIND_LABELS[(operation.kind || 'merge') as DataKeyOperationKind] || KIND_LABELS.merge;
    const title = `${operation.title || ''}`.trim() || `Merge into “${operation.survivorName || ''}”`;
    return `${label}: ${title}`;
}

/**
 * Adds a reason to an entry's existing one instead of replacing it: the
 * existing text can matter (e.g. "Published via data key reference sync" keeps
 * a dependent entry from being rolled back on its own). Adding the same reason
 * twice is a no-op.
 */
export function appendChangeReason(existing: string | null | undefined, reason: string) {
    const current = `${existing || ''}`.trim();
    if (!current) return reason;
    if (current.split(' · ').includes(reason)) return current;
    return `${current} · ${reason}`;
}
