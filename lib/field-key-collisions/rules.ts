export type FieldKeyCollisionKind =
  | "duplicate_key_same_screen"
  | "duplicate_key_repeatable";

export type FieldKeyCollisionSeverity = "blocking" | "warning";

export type FieldKeyCollisionRule = {
  id: FieldKeyCollisionKind;
  label: string;
  /** Counted phrase for the publish summary, e.g. "1 duplicate field key". */
  publishLabel: string;
  /** Spelled out rather than derived: no suffix rule turns "field key spelled
   *  two ways" into "field keys spelled two ways". */
  publishLabelPlural: string;
  appliesTo: string;
  detectedWhen: string;
  whyItMatters: string;
  howToFix: string;
};

// One catalogue behind the editor badges, the scan CLI and the publish gate, so
// the same collision is never described three different ways.
export const FIELD_KEY_COLLISION_RULES = [
  {
    id: "duplicate_key_same_screen",
    label: "Duplicate field key",
    publishLabel: "duplicate field key",
    publishLabelPlural: "duplicate field keys",
    appliesTo: "Two or more fields on one screen",
    detectedWhen: "Two fields on the same screen use the same key (compared without case).",
    whyItMatters:
      "The app assigns the field key before it evaluates conditions, so one field is dropped from the screen, both fields share one condition result, and typing in one writes the other's answer.",
    howToFix:
      "If the fields are option lists for one question, merge them into a single field and give each option its own conditional expression. Otherwise give each field its own key.",
  },
  {
    id: "duplicate_key_repeatable",
    label: "Shared key in a collection",
    publishLabel: "shared field key in a collection",
    publishLabelPlural: "shared field keys in a collection",
    appliesTo: "Two or more fields on one repeatable screen",
    detectedWhen: "Two fields on a repeatable screen use the same key.",
    whyItMatters:
      "A repeatable screen skips a field before it assigns a key, so mutually exclusive fields render correctly — but both still write to the same slot in every collection entry.",
    howToFix:
      "Keep the shared key only when one shared answer per entry is intended; otherwise give each field its own key.",
  },
] as const satisfies readonly FieldKeyCollisionRule[];

const rulesById = new Map<string, FieldKeyCollisionRule>(
  (FIELD_KEY_COLLISION_RULES as readonly FieldKeyCollisionRule[]).map((rule) => [rule.id, rule]),
);

export function getFieldKeyCollisionRule(kind: FieldKeyCollisionKind): FieldKeyCollisionRule | undefined {
  return rulesById.get(kind);
}

/**
 * "2 duplicate field keys, 1 field key spelled two ways" — one phrase per kind
 * that actually occurred, in catalogue order (worst first), so the publish
 * summary names what it found instead of lumping every non-blocking kind
 * together as a "shared key".
 */
export function describeFieldKeyCollisionCounts(
  counts: Partial<Record<FieldKeyCollisionKind, number>> | null | undefined,
): string[] {
  const phrases: string[] = [];
  for (const rule of FIELD_KEY_COLLISION_RULES as readonly FieldKeyCollisionRule[]) {
    const count = counts?.[rule.id] || 0;
    if (!count) continue;
    phrases.push(`${count} ${count === 1 ? rule.publishLabel : rule.publishLabelPlural}`);
  }
  return phrases;
}
