import assert from "node:assert/strict";

function normalizeLookupDataType(dataType?: string | null) {
  const normalized = `${dataType || ""}`.trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "option" || normalized.endsWith("_option")) return "option";
  return normalized;
}

function buildLegacyLookupKey(value: string, dataType?: string | null) {
  return `${normalizeLookupDataType(dataType)}::${value.trim()}`;
}

assert.equal(buildLegacyLookupKey("Sepsis", "option"), "option::Sepsis");
assert.equal(buildLegacyLookupKey("Sepsis", "dropdown_option"), "option::Sepsis");
assert.equal(buildLegacyLookupKey("Sepsis", "single_select_option"), "option::Sepsis");
assert.equal(buildLegacyLookupKey("Sepsis", "multi_select_option"), "option::Sepsis");
assert.equal(buildLegacyLookupKey("Sepsis", "zw_edliz_summary_table_option"), "option::Sepsis");
assert.equal(buildLegacyLookupKey("Sepsis", "diagnosis"), "diagnosis::Sepsis");

console.log("data-key option lookup normalization ok");
