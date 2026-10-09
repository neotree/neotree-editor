import { defaultNuidSearchFields } from "@/constants/fields";
import type { NuidFieldSpec, NuidOptionSpec } from "./constants";

const DROPDOWN_TYPES = ["dropdown", "multi_select"];

/** Parse a template `values` string (`"Y,Yes\nN,No"`) into option specs. */
export function parseTemplateOptionValues(values?: string): NuidOptionSpec[] {
  return `${values || ""}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, ...rest] = line.split(",");
      const v = `${value || ""}`.trim();
      const label = rest.join(",").trim() || v;
      return { value: v, label };
    })
    .filter((o) => !!o.value);
}

/**
 * The canonical NUID Search field spec for a script type — which keys to
 * locate/create in the data-key library, their types, labels, conditions, and
 * (for dropdowns) the option children they require. Sourced from the existing
 * hardcoded template so behaviour stays identical; the difference is that these
 * are now resolved against the library rather than used verbatim.
 */
export function getNuidTemplate(scriptType?: string): NuidFieldSpec[] {
  const raw = (scriptType === "admission"
    ? defaultNuidSearchFields.admission
    : defaultNuidSearchFields.other) as any[];

  return raw
    .map((f) => {
      const type = `${f?.type || ""}`.trim();
      return {
        key: `${f?.key || ""}`.trim(),
        type,
        label: `${f?.label || ""}`.trim(),
        condition: f?.condition ? `${f.condition}` : undefined,
        options: DROPDOWN_TYPES.includes(type) ? parseTemplateOptionValues(f?.values) : undefined,
      } satisfies NuidFieldSpec;
    })
    .filter((f) => !!f.key);
}
