// Which kind of session ID a script uses. A script has exactly one: the NUID format it has always had
// (FB8E-1230042) or the MUID format (M0K7Q-000001R, see lib/muid.ts). The mobile app reads this to
// decide what ID to generate, and what format the NUID page accepts and checks.

export const SCRIPT_ID_TYPES = ["nuid", "muid"] as const;
export type ScriptIdType = (typeof SCRIPT_ID_TYPES)[number];
export const DEFAULT_SCRIPT_ID_TYPE: ScriptIdType = "nuid";

export const SCRIPT_ID_TYPE_OPTIONS: { value: ScriptIdType; label: string; description: string }[] = [
  { value: "nuid", label: "NUID", description: "The current format, e.g. FB8E-1230042 (4 characters, then 7 digits)." },
  { value: "muid", label: "MUID", description: "The new format with a check character, e.g. M0K7Q-000001R (tablet part, then session part). Mistyped IDs are caught." },
];

/** Anything that isn't a known type (missing, old drafts, bad input) is the default, so a script always has one. */
export function normaliseScriptIdType(value: unknown): ScriptIdType {
  return SCRIPT_ID_TYPES.includes(value as ScriptIdType) ? (value as ScriptIdType) : DEFAULT_SCRIPT_ID_TYPE;
}
