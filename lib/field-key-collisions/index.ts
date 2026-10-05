import {
  compareConditionSet,
  type ConditionComparison,
  type ConditionKey,
  type ExclusivityVerdict,
} from "@/lib/conditional-expression";
import {
  getFieldKeyCollisionRule,
  type FieldKeyCollisionKind,
  type FieldKeyCollisionSeverity,
} from "./rules";

export {
  FIELD_KEY_COLLISION_RULES,
  describeFieldKeyCollisionCounts,
  getFieldKeyCollisionRule,
  type FieldKeyCollisionKind,
  type FieldKeyCollisionRule,
  type FieldKeyCollisionSeverity,
} from "./rules";

/**
 * Finds fields that share a key, and says whether their conditions can put them
 * on screen together.
 *
 * The mobile runtime treats a field key as an identity in five places
 * (src/Home/Script/Screen/_TypeForm/index.tsx): the React child key at the field
 * list, `conditionMetByKey`, `valuesByKey`, `cachedValuesByKey` and
 * `setValueByKey`. Four of them collapse duplicates BEFORE any condition is
 * evaluated, which is why a same-screen duplicate is blocking even when the two
 * conditions are provably exclusive.
 *
 * The exception is a repeatable screen: Repeatable.tsx returns null before it
 * builds the component key, so an unmet condition never puts a key in the array.
 * There, provably exclusive fields render correctly and only share a storage slot.
 */

export interface CollisionOption {
  /** Field options identify themselves by `value`; screen items by `id`. */
  id?: string | null;
  value?: string | null;
  label?: string | null;
}

export interface CollisionField {
  fieldId?: string | null;
  key?: string | null;
  label?: string | null;
  type?: string | null;
  condition?: string | null;
  /** Loosely typed: callers pass the editor's richer option rows straight in. */
  items?: readonly any[] | null;
}

export interface CollisionScreen {
  screenId?: string | null;
  title?: string | null;
  label?: string | null;
  key?: string | null;
  position?: number | null;
  type?: string | null;
  repeatable?: boolean | null;
  fields?: CollisionField[] | null;
  /** A single/multi select screen carries its options here instead. */
  items?: readonly any[] | null;
}

export interface CollisionScript {
  scriptId?: string | null;
  title?: string | null;
  screens?: CollisionScreen[] | null;
  /** Key catalogue, used only to tell single-value keys from multi-select ones. */
  dataKeys?: ConditionKey[] | null;
}

export interface FieldKeyCollisionMember {
  screenId?: string;
  screenTitle: string;
  fieldId?: string;
  /**
   * The field's row index on the screen — what the editor highlights. For a
   * collision between two OPTIONS this is the index of the field that owns
   * them (every member shares it), never the option's own position: the
   * fields table looks warnings up by row, so an option index here lights up
   * whichever unrelated field happens to sit at that row.
   */
  fieldIndex: number;
  /** The option's position in its list, when the collision is between options. */
  optionIndex?: number;
  label: string;
  condition: string;
}

export interface FieldKeyCollision {
  kind: FieldKeyCollisionKind;
  /** Set when these fields are option lists for one question and can be merged. */
  remedy?: "merge_options";
  severity: FieldKeyCollisionSeverity;
  /** The key as the runtime sees it: trimmed and lowercased. */
  key: string;
  /** The key as the author typed it on the first colliding field. */
  displayKey: string;
  verdict: ExclusivityVerdict;
  location: string;
  screenId?: string;
  message: string;
  members: FieldKeyCollisionMember[];
}

/** Matches how the runtime looks up field keys — trimmed and lowercased. */
export function normalizeFieldKey(key: unknown): string {
  return `${key ?? ""}`.trim().toLowerCase();
}

function screenTitleOf(screen: CollisionScreen, index: number): string {
  const title = `${screen?.title || screen?.label || screen?.key || ""}`.trim();
  return title || `Screen ${(screen?.position ?? index + 1) || index + 1}`;
}

function fieldLabelOf(field: CollisionField, index: number): string {
  const label = `${field?.label || ""}`.trim();
  return label || `${field?.key || ""}`.trim() || `field ${index + 1}`;
}

function quoteLabels(members: FieldKeyCollisionMember[]): string {
  return members.map((member) => `"${member.label}"`).join(" and ");
}

function describeOverlap(comparison: ConditionComparison): string {
  if (comparison.verdict === "overlapping") {
    return comparison.witness
      ? ` They can be visible at the same time — for example when ${comparison.witness}.`
      : " They can be visible at the same time.";
  }
  if (comparison.verdict === "unknown") {
    return comparison.reason
      ? ` Their conditions could not be checked automatically (${comparison.reason}).`
      : " Their conditions could not be checked automatically.";
  }
  return "";
}

/**
 * A field's own type is the best description of its key, so the screen can
 * always describe itself. Callers that have the registry pass it in and win on
 * conflicts; without it the check still tells a multi-select from a dropdown.
 */
function keysForScreen(fields: CollisionField[], provided?: ConditionKey[] | null): ConditionKey[] {
  const keys = [...(provided || [])];
  const known = new Set(keys.map((key) => `${key?.name || ""}`.trim().toLowerCase()));

  for (const field of fields) {
    const name = `${field?.key || ""}`.trim();
    const normalized = normalizeFieldKey(name);
    if (!name || !field?.type || known.has(normalized)) continue;
    known.add(normalized);
    keys.push({ name, dataType: `${field.type}` });
  }

  return keys;
}

const MERGEABLE_OPTION_TYPES = new Set(["dropdown", "multi_select"]);

/**
 * True when the colliding fields are the same kind of option list — the shape
 * that becomes one field with conditioned options. Kept as a local check rather
 * than a call into the merge planner, which imports from here.
 */
function looksLikeOptionListVariants(fields: CollisionField[]): boolean {
  if (fields.length < 2) return false;
  const type = `${fields[0]?.type || ""}`.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!MERGEABLE_OPTION_TYPES.has(type)) return false;
  return fields.every((field) => {
    const fieldType = `${field?.type || ""}`.trim().toLowerCase().replace(/[\s-]+/g, "_");
    return fieldType === type && Array.isArray((field as any)?.items) && !!(field as any).items.length;
  });
}

function groupFieldsByKey(fields: CollisionField[]): Map<string, { field: CollisionField; index: number }[]> {
  const groups = new Map<string, { field: CollisionField; index: number }[]>();
  fields.forEach((field, index) => {
    const key = normalizeFieldKey(field?.key);
    if (!key) return;
    const existing = groups.get(key);
    if (existing) existing.push({ field, index });
    else groups.set(key, [{ field, index }]);
  });
  return groups;
}

/**
 * Collisions inside a single screen. Safe to call on unsaved editor form state —
 * it touches nothing but the fields it is given.
 */

/**
 * The answer an option actually stores. A field option carries it in `value`,
 * a screen-level option in `id` — the app saves that, never the label.
 */
function optionValueOf(option: CollisionOption): string {
  const raw = option?.value ?? option?.id;
  return `${raw ?? ""}`.trim();
}

function optionLabelOf(option: CollisionOption, index: number): string {
  const label = `${option?.label ?? ""}`.trim();
  return label || optionValueOf(option) || `option ${index + 1}`;
}

/**
 * Two options in one list whose stored values clash.
 *
 * Two distinct faults, deliberately reported apart because the consequences
 * differ and so does the fix:
 *
 *  - identical values: the app saves the value, not the label, so the two are
 *    one answer in the data and no later reader can separate them;
 *  - values differing only by case ("Pn" / "PN"): these stay distinct when
 *    saved and exported, but the runtime lowercases a condition before
 *    evaluating it, so no conditional expression can tell them apart.
 *
 * Neither stops the screen rendering, so both are warnings. Grouping them
 * together would mislabel genuinely different options — "Chewa" and
 * "Chinyanja", or "Pain" and "Pneumonia" — as the same answer.
 */
function findOptionValueCollisions(
  options: CollisionOption[],
  context: { location: string; screenId?: string; screenTitle: string; owner: string; ownerKey?: unknown; fieldId?: string; fieldIndex: number },
): FieldKeyCollision[] {
  const byExactValue = new Map<string, { option: CollisionOption; index: number }[]>();

  options.forEach((option, index) => {
    const value = optionValueOf(option);
    if (!value) return;
    const group = byExactValue.get(value) || [];
    group.push({ option, index });
    byExactValue.set(value, group);
  });

  const collisions: FieldKeyCollision[] = [];

  const toMembers = (group: { option: CollisionOption; index: number }[]) => group.map(({ option, index }) => ({
    screenId: context.screenId,
    screenTitle: context.screenTitle,
    fieldId: context.fieldId,
    fieldIndex: context.fieldIndex,
    optionIndex: index,
    label: optionLabelOf(option, index),
    condition: "",
  }));

  // Keyed by the field that owns the options, not by the option value: the
  // field editor looks collisions up by its own key, so an option value here
  // would both miss this field and match any unrelated field whose key happens
  // to equal that value.
  const ownerKey = normalizeFieldKey(context.ownerKey);

  // Identical values.
  byExactValue.forEach((group, value) => {
    if (group.length < 2) return;
    const members = toMembers(group);
    collisions.push({
      kind: "duplicate_option_value",
      severity: "warning",
      key: ownerKey,
      displayKey: value,
      verdict: "overlapping",
      location: context.location,
      screenId: context.screenId,
      message:
        `${context.owner} has ${group.length} options that all store "${value}" (${quoteLabels(members)}). ` +
        `The app saves the value, not the label, so these are one answer in the data and nothing can tell them apart afterwards.`,
      members,
    });
  });

  // Values that differ only by case. Reported once per set, and only when the
  // set holds more than one distinct spelling.
  const byFoldedValue = new Map<string, Map<string, { option: CollisionOption; index: number }[]>>();
  byExactValue.forEach((group, value) => {
    const folded = value.toLowerCase();
    const spellings = byFoldedValue.get(folded) || new Map();
    spellings.set(value, group);
    byFoldedValue.set(folded, spellings);
  });

  byFoldedValue.forEach((spellings, folded) => {
    if (spellings.size < 2) return;
    const members = [...spellings.values()].flatMap(toMembers);
    const written = [...spellings.keys()].map((v) => `"${v}"`).join(" and ");
    collisions.push({
      kind: "option_value_case_variant",
      severity: "warning",
      key: ownerKey,
      displayKey: [...spellings.keys()][0],
      verdict: "overlapping",
      location: context.location,
      screenId: context.screenId,
      message:
        `${context.owner} has options stored as ${written} (${quoteLabels(members)}). ` +
        `They stay separate in the saved data, but the app lowercases a condition before evaluating it, so no conditional expression can distinguish them.`,
      members,
    });
  });

  return collisions;
}

export function findScreenFieldKeyCollisions(
  screen: CollisionScreen,
  opts?: { keys?: ConditionKey[] | null; screenIndex?: number },
): FieldKeyCollision[] {
  const fields = (screen?.fields || []) as CollisionField[];

  const screenTitle = screenTitleOf(screen, opts?.screenIndex ?? 0);
  const screenId = `${screen?.screenId || ""}` || undefined;
  const repeatable = !!screen?.repeatable;
  const collisions: FieldKeyCollision[] = [];

  // Option lists are checked first and unconditionally: a single/multi select
  // screen keeps its options on the screen itself and may have no fields at
  // all, so this must run before the two-fields-or-more shortcut below.
  collisions.push(...findOptionValueCollisions((screen?.items || []) as CollisionOption[], {
    location: `Screen "${screenTitle}"`,
    screenId,
    screenTitle,
    owner: `Screen "${screenTitle}"`,
    ownerKey: screen?.key,
    fieldIndex: -1,
  }));

  fields.forEach((field, index) => {
    collisions.push(...findOptionValueCollisions((field?.items || []) as CollisionOption[], {
      location: `Screen "${screenTitle}" > field "${fieldLabelOf(field, index)}"`,
      screenId,
      screenTitle,
      owner: `Field "${fieldLabelOf(field, index)}"`,
      ownerKey: field?.key,
      fieldId: `${field?.fieldId || ""}` || undefined,
      fieldIndex: index,
    }));
  });

  if (fields.length < 2) return collisions;

  const keys = keysForScreen(fields, opts?.keys);

  groupFieldsByKey(fields).forEach((group, key) => {
    if (group.length < 2) return;

    const members: FieldKeyCollisionMember[] = group.map(({ field, index }) => ({
      screenId,
      screenTitle,
      fieldId: `${field?.fieldId || ""}` || undefined,
      fieldIndex: index,
      label: fieldLabelOf(field, index),
      condition: `${field?.condition || ""}`.trim(),
    }));

    const comparison = compareConditionSet(
      members.map((member) => member.condition),
      { keys, selfKey: key },
    );

    const displayKey = `${group[0].field?.key || key}`.trim();
    const exclusive = comparison.verdict === "exclusive";
    const kind: FieldKeyCollisionKind = repeatable ? "duplicate_key_repeatable" : "duplicate_key_same_screen";
    const severity: FieldKeyCollisionSeverity = repeatable && exclusive ? "warning" : "blocking";

    const message = repeatable
      ? exclusive
        ? `"${displayKey}" is used by ${group.length} fields on this collection screen. Only one can ever render, so the screen is safe — but they all write to the same slot in every entry.`
        : `"${displayKey}" is used by ${group.length} fields on this collection screen (${quoteLabels(members)}).${describeOverlap(comparison)} They share one slot in every entry.`
      : exclusive
        ? `"${displayKey}" is used by ${group.length} fields on this screen (${quoteLabels(members)}). Their conditions never overlap, but the app assigns the field key before it evaluates conditions, so one field is still dropped.`
        : `"${displayKey}" is used by ${group.length} fields on this screen (${quoteLabels(members)}).${describeOverlap(comparison)} The app will drop one and write both answers to the same key.`;

    const mergeable = looksLikeOptionListVariants(group.map(({ field }) => field));
    const remedy = mergeable
      ? " These are option lists for one question — combine them into a single field and give each option its own conditional expression."
      : "";

    collisions.push({
      kind,
      severity,
      remedy: mergeable ? "merge_options" : undefined,
      key,
      displayKey,
      verdict: comparison.verdict,
      location: `Screen "${screenTitle}"`,
      screenId,
      message: `${message}${remedy}`,
      members,
    });
  });

  return collisions;
}

/**
 * Every field-key collision in a script, worst first.
 *
 * Scoped to fields within one screen. A key reused on a different screen is a
 * separate concern and deliberately not reported here.
 */
export function findScriptFieldKeyCollisions(script: CollisionScript): FieldKeyCollision[] {
  const screens = (script?.screens || []) as CollisionScreen[];
  const keys = script?.dataKeys || undefined;

  const collisions: FieldKeyCollision[] = [];
  screens.forEach((screen, screenIndex) => {
    collisions.push(...findScreenFieldKeyCollisions(screen, { keys, screenIndex }));
  });

  return collisions.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "blocking" ? -1 : 1;
    return a.key.localeCompare(b.key);
  });
}

export function getBlockingFieldKeyCollisions(collisions: FieldKeyCollision[]): FieldKeyCollision[] {
  return (collisions || []).filter((collision) => collision.severity === "blocking");
}

/** Blocking-collision count for a script — drives badges and the publish gate. */
export function getScriptFieldKeyCollisionCount(script: CollisionScript): number {
  return getBlockingFieldKeyCollisions(findScriptFieldKeyCollisions(script)).length;
}

/** Short label for a collision, e.g. for a table badge tooltip. */
export function getFieldKeyCollisionLabel(collision: FieldKeyCollision): string {
  return getFieldKeyCollisionRule(collision.kind)?.label || "Duplicate field key";
}
