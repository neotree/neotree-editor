/**
 * Cache signature for a script's persisted conditional-expression report.
 *
 * The report used to be trusted on read whenever its Configuration-key
 * signature still matched, which left every other input to be invalidated by a
 * `recompute` call at the right write site. Anything those calls missed stayed
 * wrong forever — most visibly NUID search fields, whose validity depends on
 * the data key library and therefore changes with no edit to the script at all.
 *
 * So the signature now covers the inputs that belong to a single script:
 * Configuration keys, the script's own NUID/eligibility expressions, and its
 * screens, diagnoses and problems. A reader recomputes it and refreshes
 * anything that no longer matches, so one script's staleness costs one script's
 * recompute.
 *
 * The data key library is deliberately NOT a dimension here. It is global, so
 * folding it in would expire every script at once and make the next page load
 * pay for all of them (measured at ~18s for 19 scripts). Library changes are
 * handled where they happen instead: a data key save sweeps every script's
 * report in the background.
 */

export const CONDITION_REPORT_SIGNATURE_VERSION = "r2";

/**
 * Versions a stored report may still carry from an earlier deploy.
 *
 * Bump `CONDITION_REPORT_SIGNATURE_VERSION` and list the old value here
 * whenever a validation rule changes in a way that would alter existing
 * findings — reports written under the old rules are wrong, but nothing about
 * the scripts themselves changed.
 *
 * Such a report is deliberately NOT treated as stale. A stale report is
 * recomputed inline on the page load that needs it, so expiring every script at
 * once would put a whole library's recompute on one reader's page load (the
 * same ~18s cost that keeps the data key library out of the signature). Matching
 * one of these versions means the inputs are unchanged and only the rules moved,
 * so the old report is served immediately and refreshed in the background.
 *
 * r1 -> r2: case-variant keys (`$RESUS` / `$Resus`) stopped being reported as
 * wrong-casing errors with bogus unknown-option errors behind them.
 */
export const SUPERSEDED_CONDITION_REPORT_SIGNATURE_VERSIONS = ["r1"] as const;

/**
 * True when a stored signature is this exact signature from an earlier rule set —
 * same inputs, older rules.
 */
export function isSupersededConditionReportSignature(
  reportSignature: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!reportSignature || !expected) return false;
  const separator = expected.indexOf(":");
  if (separator < 0) return false;
  const digest = expected.slice(separator + 1);
  return SUPERSEDED_CONDITION_REPORT_SIGNATURE_VERSIONS.some(
    (version) => reportSignature === `${version}:${digest}`,
  );
}

/** FNV-1a: deterministic, dependency-free, and short enough to store inline. */
function hash(input: string): string {
  let value = 0x811c9dc5;
  for (const char of input) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 0x01000193);
  }
  return (value >>> 0).toString(36);
}

export interface ConditionReportSignatureParts {
  /** Runtime Configuration key names (see getConfigurationConditionKeySignature). */
  configuration: string;
  /** CE inputs stored on the script row itself (NUID fields, eligibility). */
  inputs: string;
  /** Screens, diagnoses and problems belonging to this script. */
  content: string;
}

export function buildConditionReportSignature(parts: ConditionReportSignatureParts): string {
  const source = [parts.configuration, parts.inputs, parts.content]
    .map((part) => `${part ?? ""}`)
    .join("|");
  return `${CONDITION_REPORT_SIGNATURE_VERSION}:${hash(source)}`;
}

/**
 * Stable stamp for the CE inputs carried on the script row.
 *
 * Hashes the fields that feed validation — a NUID field's key link, its
 * condition, and the eligibility expressions — and deliberately ignores
 * presentation (labels, ordering) so cosmetic edits do not expire every report.
 */
export function getScriptConditionInputsStamp(input: {
  nuidSearchFields?: any;
  eligibilityCriteria?: any;
}): string {
  const fields = Array.isArray(input?.nuidSearchFields) ? input.nuidSearchFields : [];
  const parts = fields
    .map((field: any) =>
      [
        `${field?.key ?? ""}`.trim().toLowerCase(),
        `${field?.keyId ?? ""}`.trim(),
        `${field?.type ?? ""}`.trim().toLowerCase(),
        `${field?.condition ?? ""}`.trim(),
      ].join(":"),
    )
    .sort((a: string, b: string) => a.localeCompare(b));

  const eligibility = input?.eligibilityCriteria || {};
  parts.push(`criteria:${`${eligibility?.criteria_condition ?? ""}`.trim()}`);
  parts.push(`alt:${`${eligibility?.alternative_criteria_condition ?? ""}`.trim()}`);

  return `${parts.length}:${hash(parts.join("\u0000"))}`;
}

/**
 * Whether a prefetched condition-key catalogue counts as authoritative.
 *
 * Key-dependent validation is skipped while this is false, so it has to
 * separate two empty states that mean opposite things:
 *
 * - `undefined` — no catalogue was fetched for this page (/new-script, or a
 *   failed prefetch). Nothing can be said about whether a key exists, so the
 *   checks are suppressed rather than flagging every key as unknown.
 * - `[]` or a catalogue with no keys — fetched, and the script genuinely has
 *   none. An unknown key IS an error here, so the checks must run.
 */
export function isConditionCatalogueReady(catalogue: unknown[] | undefined | null): boolean {
  return Array.isArray(catalogue);
}
