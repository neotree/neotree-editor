export type FieldKeyCollisionKind =
  | "duplicate_key_same_screen"
  | "duplicate_key_repeatable";

export type FieldKeyCollisionSeverity = "blocking" | "warning";

export type FieldKeyCollisionRule = {
  id: FieldKeyCollisionKind;
  label: string;
  publishLabel: string;
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
