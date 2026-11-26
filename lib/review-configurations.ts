// A script's "Screen review" list: entries { label, screen } that let the person on the tablet jump
// back to a screen from the review page. `screen` is the screen's id (its screenId, or the older
// oldScreenId that tablets match on). When a screen is deleted its entries must go with it, or the review
// page lists screens that no longer exist.
//
// Pure, so the same rules serve the deletion cleanup, the sync payload and the tests.

export interface ReviewEntryLike { label?: string; screen?: string | null }
export interface ScreenRefLike { screenId?: string | null; oldScreenId?: string | null }

const text = (v: unknown) => `${v ?? ""}`.trim();

/**
 * The entries as a list. Some rows hold them as JSON text inside a JSON string (an older save wrote them
 * that way), so text is parsed; anything that isn't a list is no entries.
 */
export function toReviewEntries<T extends ReviewEntryLike = ReviewEntryLike>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Every id a screen is known by: the one its review entries may hold. */
export function screenIdsOf(screens: ScreenRefLike[] | null | undefined): Set<string> {
  const ids = new Set<string>();
  for (const s of screens || []) {
    if (text(s.screenId)) ids.add(text(s.screenId));
    if (text(s.oldScreenId)) ids.add(text(s.oldScreenId));
  }
  return ids;
}

/**
 * Entries that point at a screen which exists. An entry with no screen chosen yet is kept: it is
 * unfinished, not stale.
 */
export function pruneReviewConfigurations<T extends ReviewEntryLike>(
  entries: T[] | string | null | undefined,
  screens: ScreenRefLike[] | null | undefined,
): T[] {
  const known = screenIdsOf(screens);
  return toReviewEntries<T>(entries).filter((e) => !text(e?.screen) || known.has(text(e.screen)));
}

/** Entries that point at one of the removed screens, dropped. `changed` says whether anything was. */
export function removeScreenReferences<T extends ReviewEntryLike>(
  entries: T[] | string | null | undefined,
  removedIds: Iterable<string>,
): { entries: T[]; changed: boolean } {
  const removed = new Set([...removedIds].map(text).filter(Boolean));
  const list = toReviewEntries<T>(entries);
  if (!removed.size) return { entries: list, changed: false };
  const kept = list.filter((e) => !removed.has(text(e?.screen)));
  return { entries: kept, changed: kept.length !== list.length };
}

/** Entries pointing at screens that no longer exist: what the editor offers to clear. */
export function findStaleReviewConfigurations<T extends ReviewEntryLike>(
  entries: T[] | string | null | undefined,
  screens: ScreenRefLike[] | null | undefined,
): T[] {
  const list = toReviewEntries<T>(entries);
  const live = new Set(pruneReviewConfigurations(list, screens));
  return list.filter((e) => !live.has(e));
}
