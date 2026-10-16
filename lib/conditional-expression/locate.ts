import { hrefForConditionEntity, walkScriptConditions, type ScriptConditionVisit, type ScriptWithItems } from "./collect";
import { validateCondition } from "./index";

/**
 * Resolves conditional expressions that failed to evaluate on devices to where they
 * live in the scripts, what the failure does and how to fix it.
 *
 * The app reports the CE as authored for screens, diagnoses, problems, symptoms, drugs
 * and eligibility, so those resolve by exact text. A diagnosis/problem with symptoms but
 * no expression is reported as "()". Fields, options and NUID search fields are reported
 * only as patient-substituted text, so they are not resolved here.
 */

export type CeImpact = "high" | "medium" | "low";

export interface CeLocation {
  script: string;
  where: string;
  impact: CeImpact;
  consequence: string;
  href: string;
}

export interface CeResolution {
  /** Highest impact first, capped at MAX_MATCHES; `total` counts them all. */
  matches: CeLocation[];
  total: number;
  fix?: string;
}

const MAX_MATCHES = 25;
const IMPACT_ORDER: CeImpact[] = ["high", "medium", "low"];

// A CE that fails to evaluate is treated as false on the device; this is the effect.
const CONSEQUENCES: Record<string, [CeImpact, string]> = {
  "screen:condition": ["high", "Screen is skipped"],
  "screen:skipToCondition": ["low", "Skip-to jump is not taken"],
  "screen:field.condition": ["high", "Field is hidden, so its data is not captured"],
  "screen:item.condition": ["medium", "Option or item is hidden"],
  "diagnosis:expression": ["high", "Diagnosis is never suggested"],
  "diagnosis:symptom.expression": ["medium", "Symptom is not counted towards the diagnosis"],
  "problem:expression": ["high", "Problem is never suggested"],
  "problem:symptom.expression": ["medium", "Symptom is not counted towards the problem"],
  "drug:condition": ["high", "Drug/fluid is not recommended"],
  "drug:calculator_condition": ["high", "Drug/fluid calculator does not apply"],
  "nuid:condition": ["medium", "Search field is hidden"],
  "eligibility:criteria_condition": ["high", "Eligibility criteria evaluate as not met"],
  "eligibility:alternative_criteria_condition": ["high", "Alternative eligibility criteria evaluate as not met"],
  "eligibility:alternative_activation_condition": ["high", "Alternative eligibility criteria are not activated"],
};

// Faults that break on the device but pass the editor's validator.
const DEVICE_ONLY_FAULTS: Array<[RegExp, string]> = [
  [/\n\s*\n/, "Remove the blank line: the device treats every line as a condition, and an empty one always fails."],
  [/\)(?:and|or)\b|\b(?:and|or)\(/i, "Put a space on both sides of and/or where it touches a bracket."],
];

const EMPTY_OUTCOME = "()";

export function normalizeCe(text: string): string {
  return text.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").trim();
}

function explainFault(ce: string): string | undefined {
  if (ce === EMPTY_OUTCOME) return "Add an expression, or remove the symptoms: with symptoms and no expression it can never be suggested.";
  const error = validateCondition(ce, { keys: [], allowSelf: true, skipKeyResolution: true })
    .diagnostics.find((d) => d.severity === "error");
  if (error) return error.suggestion ? `${error.message} Suggested: ${error.suggestion}` : error.message;
  return DEVICE_ONLY_FAULTS.find(([pattern]) => pattern.test(ce))?.[1];
}

export function locateConditions(expressions: string[], scripts: ScriptWithItems[], baseUrl = ""): Record<string, CeResolution> {
  // Only the texts asked about are collected: the scripts hold far more CEs than a digest
  // reports, and a common one can repeat thousands of times.
  const wanted = new Map<string, { locations: CeLocation[]; seen: Set<string> }>();
  for (const ce of expressions) {
    const key = normalizeCe(ce);
    if (key && !wanted.has(key)) wanted.set(key, { locations: [], seen: new Set() });
  }

  for (const script of scripts) {
    const visit = (v: ScriptConditionVisit) => {
      const rule = CONSEQUENCES[`${v.entity.kind}:${v.field}`];
      if (!rule) return; // e.g. field.calculation is a formula, not a CE
      const text = normalizeCe(`${v.expression ?? ""}`);
      const keys = !text
        ? (v.field === "expression" && wanted.has(EMPTY_OUTCOME) && hasSymptoms(script, v.entity) ? [EMPTY_OUTCOME] : [])
        // The device also evaluates (and reports) a multi-line screen condition line by line.
        : v.entity.kind === "screen" && v.field === "condition" && text.includes("\n")
          ? [text, ...text.split("\n").map((l) => l.trim())]
          : [text];
      const hits = keys.filter((key) => wanted.has(key));
      if (!hits.length) return;

      const href = `${baseUrl}${hrefForConditionEntity(`${script.scriptId || ""}`, v.entity)}`;
      const location: CeLocation = {
        script: script.title || script.name || "Untitled script",
        where: v.location,
        impact: rule[0],
        consequence: rule[1],
        href,
      };
      for (const key of new Set(hits)) {
        const entry = wanted.get(key)!;
        const id = `${href}|${v.location}`;
        if (entry.seen.has(id)) continue;
        entry.seen.add(id);
        entry.locations.push(location);
      }
    };
    walkScriptConditions(script, visit);
    // The device also evaluates this one; the shared walker (and so the static checks) does not visit it yet.
    const activation = script.eligibilityCriteria?.alternative_activation_condition;
    if (activation) {
      visit({ expression: activation, field: "alternative_activation_condition", location: "Eligibility criteria (alternative activation)", entity: { kind: "eligibility" }, scope: "nuid" });
    }
  }

  return Object.fromEntries(expressions.map((ce) => {
    const key = normalizeCe(ce);
    const locations = (wanted.get(key)?.locations || [])
      .sort((a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact));
    return [ce, {
      matches: locations.slice(0, MAX_MATCHES),
      total: locations.length,
      fix: locations.length ? explainFault(key) : undefined,
    }];
  }));
}

export interface SiteLookup {
  /** The site id a tablet reported (old or new format), or null when it reported none. */
  site: string | null;
  expressions: string[];
}

export interface SiteResolution {
  name: string | null;
  /** False when the site is unknown, so all scripts were searched instead. */
  scoped: boolean;
  /** `elsewhere` counts the same text in other sites' scripts. */
  locations: Record<string, CeResolution & { elsewhere: number }>;
}

/**
 * Resolves each site's CEs against that site's scripts only, since a tablet syncs just its own
 * site's scripts (/sync-data filters by hospital). An unknown site is searched across all scripts
 * rather than treated as having none, so nothing broken is reported as gone.
 */
export function locateForSites(
  lookups: SiteLookup[],
  scripts: ScriptWithItems[],
  hospitals: Array<{ hospitalId: string; oldHospitalId?: string | null; name?: string | null }>,
  baseUrl = "",
): Record<string, SiteResolution> {
  const byId = new Map<string, (typeof hospitals)[number]>();
  for (const hospital of hospitals) {
    byId.set(hospital.hospitalId, hospital);
    if (hospital.oldHospitalId) byId.set(hospital.oldHospitalId, hospital);
  }
  const everywhere = locateConditions(lookups.flatMap((l) => l.expressions), scripts, baseUrl);

  return Object.fromEntries(lookups.map(({ site, expressions }) => {
    const hospital = site ? byId.get(site) : undefined;
    const own = hospital
      ? locateConditions(expressions, scripts.filter((s) => s.hospitalId === hospital.hospitalId), baseUrl)
      : everywhere;
    const locations = Object.fromEntries(expressions.map((ce) => [ce, { ...own[ce], elsewhere: everywhere[ce].total - own[ce].total }]));
    return [site || "", { name: hospital?.name ?? null, scoped: Boolean(hospital), locations }];
  }));
}

function hasSymptoms(script: ScriptWithItems, entity: { kind: string; diagnosisId?: string; problemId?: string }): boolean {
  const outcome = entity.kind === "diagnosis"
    ? (script.diagnoses || []).find((d: any) => d?.diagnosisId === entity.diagnosisId)
    : entity.kind === "problem"
      ? (script.problems || []).find((p: any) => p?.problemId === entity.problemId)
      : null;
  return Boolean(outcome?.symptoms?.length);
}
