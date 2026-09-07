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

export interface CollisionField {
  fieldId?: string | null;
  key?: string | null;
  label?: string | null;
  type?: string | null;
  condition?: string | null;
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
  fieldIndex: number;
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
export function findScreenFieldKeyCollisions(
  screen: CollisionScreen,
  opts?: { keys?: ConditionKey[] | null; screenIndex?: number },
): FieldKeyCollision[] {
  const fields = (screen?.fields || []) as CollisionField[];
  if (fields.length < 2) return [];

  const screenTitle = screenTitleOf(screen, opts?.screenIndex ?? 0);
  const screenId = `${screen?.screenId || ""}` || undefined;
  const repeatable = !!screen?.repeatable;
  const keys = keysForScreen(fields, opts?.keys);
  const collisions: FieldKeyCollision[] = [];

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
