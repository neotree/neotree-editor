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
