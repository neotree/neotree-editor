import { NUID_MANAGED } from "./constants";

/**
 * Whether a data key was created for NUID Search (see buildNuidProvisionPayload).
 * Informational only: such keys behave like every other key and can be renamed,
 * retyped, given other options, merged or deleted. NUID Search fields follow
 * their linked key through those changes, and report what needs attention.
 */
export function isNuidManagedDataKey(
  dataKey?: { metadata?: Record<string, any> | null } | null,
): boolean {
  return `${dataKey?.metadata?.managed || ""}` === NUID_MANAGED;
}
