import { NUID_MANAGED } from "./constants";

export function isNuidManagedDataKey(
  dataKey?: { metadata?: Record<string, any> | null } | null,
): boolean {
  return `${dataKey?.metadata?.managed || ""}` === NUID_MANAGED;
}

/**
 * Authoritative guard applied when saving over an existing data key. For a
 * managed NUID key, `name` (key) and `dataType` are immutable and the managed
 * flag is preserved; every other field (label, options, confidential…) passes
 * through. No-op when there is no existing key or it isn't managed.
 *
 * Server-side safety net behind the disabled form inputs — keeps drafts,
 * imports and data-key sync from silently mutating a locked key.
 */
export function lockManagedDataKeyPatch<
  T extends { name?: any; dataType?: any; metadata?: any },
>(
  incoming: T,
  existing?: { name?: string | null; dataType?: string | null; metadata?: Record<string, any> | null } | null,
): T {
  if (!isNuidManagedDataKey(existing)) return incoming;
  return {
    ...incoming,
    name: existing?.name ?? incoming.name,
    dataType: existing?.dataType ?? incoming.dataType,
    metadata: { ...(incoming.metadata || {}), managed: NUID_MANAGED },
  };
}
