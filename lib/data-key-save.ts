export function normalizeIncomingDataKeyPatch<T extends Record<string, unknown> & { name?: unknown; label?: unknown }>(item: T): T {
  const normalized = { ...item };

  if (normalized.name !== undefined && normalized.name !== null) {
    normalized.name = `${normalized.name}`.trim();
  }

  if (normalized.label !== undefined && normalized.label !== null) {
    normalized.label = `${normalized.label}`.trim();
  }

  return normalized;
}

/**
 * Apply a data-key form edit made against `base` (the options the form loaded) to `current` (what is
 * stored now). When nothing changed in between the edit is taken as is, order included; otherwise only
 * the edit's own additions and removals are applied, so changes made meanwhile (another user, an import)
 * are not undone by a stale form.
 */
export function rebaseDataKeyOptions({ incoming, base, current }: { incoming: string[]; base: string[]; current: string[] }) {
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((o, i) => o === b[i]);
  if (same(base, current)) return incoming;
  const added = incoming.filter(o => !base.includes(o));
  const removed = base.filter(o => !incoming.includes(o));
  const next = current.filter(o => !removed.includes(o));
  added.forEach(o => { if (!next.includes(o)) next.push(o); });
  return next;
}
