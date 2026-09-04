import { validateCondition } from "@/lib/conditional-expression";
import { normalizeFieldKey } from "./index";

/**
 * Plans the merge of duplicate-keyed option fields into one field whose options
 * carry the conditions the fields used to carry.
 *
 * The common shape this fixes: one question ("who signed?") split into N fields
 * sharing a key, each holding a different option list behind a different
 * condition. That is a duplicate key to the app — it drops all but one field.
 * As one field with conditioned options it is a single question again, with one
 * export value and no collision.
 *
 * Every plan is conservative: anything the planner cannot express exactly comes
 * back as a blocker for a human, never as a silently altered screen.
 */

export interface OptionMergeItem {
  itemId?: string;
  value?: string | number;
  label?: string | number;
  condition?: string;
  [key: string]: any;
}

export interface OptionMergeField {
  fieldId?: string;
  key?: string;
  label?: string;
  type?: string;
  condition?: string;
  keyId?: string;
  confidential?: boolean;
  optional?: boolean;
  items?: OptionMergeItem[];
  [key: string]: any;
}

export interface OptionMergeScreen {
  screenId?: string;
  title?: string;
  fields?: OptionMergeField[];
}

export interface OptionMergePlan {
  key: string;
  displayKey: string;
  /** Index of the field that survives; it keeps its fieldId and settings. */
  keptIndex: number;
  keptFieldId?: string;
  removedIndexes: number[];
  /** Condition for the surviving field — the disjunction of the originals. */
  mergedCondition: string;
  mergedItems: OptionMergeItem[];
  sourceFieldCount: number;
  /** Options that appeared in more than one source field. */
  sharedOptions: { value: string; sources: number }[];
}

export interface OptionMergeBlocker {
  key: string;
  displayKey: string;
  reason: string;
}

const MERGEABLE_TYPES = new Set(["dropdown", "multi_select"]);

function normalizeType(type: unknown): string {
  return `${type ?? ""}`.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function trim(value: unknown): string {
  return `${value ?? ""}`.trim();
}

/**
 * `includes`/`excludes` are evaluated over their whole enclosing line or `[ ]`
 * group, so they cannot be safely folded into a larger and/or expression by
 * string surgery. Groups containing one are left for a human.
 */
function hasMembership(condition: string): boolean {
  return /\s(includes|excludes|or_includes|or_excludes)\s/i.test(` ${condition} `);
}

/** ANDs two conditions using a newline — the one combinator that always isolates. */
function andConditions(a: string, b: string): string {
  const left = trim(a);
  const right = trim(b);
  if (!left) return right;
  if (!right) return left;
  if (left.toLowerCase() === right.toLowerCase()) return left;
  return `${left}\n${right}`;
}

/** ORs a set of conditions. An empty member means "always", which absorbs the rest. */
function orConditions(conditions: string[]): string {
  const parts: string[] = [];
  for (const condition of conditions) {
    const value = trim(condition);
    if (!value) return "";
    if (!parts.some((part) => part.toLowerCase() === value.toLowerCase())) parts.push(value);
  }
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  return parts.map((part) => `(${part})`).join(" or ");
}

function isValidExpression(condition: string): boolean {
  if (!trim(condition)) return true;
  return !validateCondition(condition, { keys: [], skipKeyResolution: true }).hasErrors;
}

function groupByKey(fields: OptionMergeField[]): Map<string, number[]> {
  const groups = new Map<string, number[]>();
  fields.forEach((field, index) => {
    const key = normalizeFieldKey(field?.key);
    if (!key) return;
    const existing = groups.get(key);
    if (existing) existing.push(index);
    else groups.set(key, [index]);
  });
  return groups;
}

/** Properties that must agree before two fields can become one. */
function describeMismatch(fields: OptionMergeField[]): string | null {
  const first = fields[0];
  for (const field of fields.slice(1)) {
    if (normalizeType(field.type) !== normalizeType(first.type)) return "the fields are not all the same type";
    if (trim(field.keyId) !== trim(first.keyId)) return "the fields link to different data keys";
    if (!!field.confidential !== !!first.confidential) return "the fields disagree on confidentiality";
    if (!!field.optional !== !!first.optional) return "the fields disagree on whether an answer is required";
  }
  return null;
}

export function planScreenOptionMerges(screen: OptionMergeScreen): {
  plans: OptionMergePlan[];
  blockers: OptionMergeBlocker[];
} {
  const fields = (screen?.fields || []) as OptionMergeField[];
  const plans: OptionMergePlan[] = [];
  const blockers: OptionMergeBlocker[] = [];

  groupByKey(fields).forEach((indexes, key) => {
    if (indexes.length < 2) return;

    const group = indexes.map((index) => fields[index]);
    const displayKey = trim(group[0].key) || key;
    const block = (reason: string) => blockers.push({ key, displayKey, reason });

    if (!MERGEABLE_TYPES.has(normalizeType(group[0].type))) {
      block(`only dropdown and multi-select fields can be merged into one option list (these are ${normalizeType(group[0].type) || "untyped"})`);
      return;
    }

    const mismatch = describeMismatch(group);
    if (mismatch) {
      block(mismatch);
      return;
    }

    if (group.some((field) => !(field.items || []).length)) {
      block("one of the fields has no options — merging would lose its values list");
      return;
    }

    const fieldConditions = group.map((field) => trim(field.condition));
    if (fieldConditions.some(hasMembership)) {
      block("a field condition uses includes/excludes, which cannot be combined automatically");
      return;
    }

    // Merge options in field order, ORing the conditions of any option that
    // appears under more than one field.
    const merged = new Map<string, { item: OptionMergeItem; conditions: string[]; sources: number }>();
    let itemBlocker: string | null = null;

    group.forEach((field, groupIndex) => {
      const fieldCondition = fieldConditions[groupIndex];
      for (const item of field.items || []) {
        const value = `${item?.value ?? ""}`.trim().toLowerCase();
        if (!value) {
          itemBlocker = "an option has no key";
          return;
        }
        const itemCondition = trim(item?.condition);
        if (hasMembership(itemCondition)) {
          itemBlocker = "an option condition uses includes/excludes, which cannot be combined automatically";
          return;
        }
        const effective = andConditions(fieldCondition, itemCondition);

        const existing = merged.get(value);
        if (existing) {
          existing.conditions.push(effective);
          existing.sources++;
        } else {
          merged.set(value, { item, conditions: [effective], sources: 1 });
        }
      }
    });

    if (itemBlocker) {
      block(itemBlocker);
      return;
    }

    const mergedItems: OptionMergeItem[] = [];
    for (const [, entry] of Array.from(merged.entries())) {
      const condition = orConditions(entry.conditions);
      if (!isValidExpression(condition)) {
        itemBlocker = `the combined condition for option "${entry.item.value}" is not a valid expression`;
        break;
      }
      mergedItems.push(condition ? { ...entry.item, condition } : { ...entry.item, condition: "" });
    }

    if (itemBlocker) {
      block(itemBlocker);
      return;
    }

    // The surviving field hides when none of the original conditions hold, so a
    // screen never shows an option list with nothing in it.
    const mergedCondition = orConditions(fieldConditions);
    if (!isValidExpression(mergedCondition)) {
      block("the combined field condition is not a valid expression");
      return;
    }

    const sharedOptions = Array.from(merged.entries())
      .filter(([, entry]) => entry.sources > 1)
      .map(([value, entry]) => ({ value, sources: entry.sources }));

    plans.push({
      key,
      displayKey,
      keptIndex: indexes[0],
      keptFieldId: trim(group[0].fieldId) || undefined,
      removedIndexes: indexes.slice(1),
      mergedCondition,
      mergedItems,
      sourceFieldCount: group.length,
      sharedOptions,
    });
  });

  return { plans, blockers };
}

/** Applies plans to a screen's fields, returning a new fields array. */
export function applyScreenOptionMerges(
  screen: OptionMergeScreen,
  plans: OptionMergePlan[],
): OptionMergeField[] {
  const fields = [...((screen?.fields || []) as OptionMergeField[])];
  const removed = new Set<number>();

  for (const plan of plans) {
    fields[plan.keptIndex] = {
      ...fields[plan.keptIndex],
      condition: plan.mergedCondition,
      items: plan.mergedItems,
    };
    plan.removedIndexes.forEach((index) => removed.add(index));
  }

  return fields.filter((_, index) => !removed.has(index));
}
