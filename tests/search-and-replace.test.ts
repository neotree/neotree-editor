import assert from "assert";

import { filterScriptsSearchResults, parseScriptsSearchResults } from "../lib/scripts-search";
import {
  applyIndexedPatches,
  buildSavePayload,
  getReplaceItems,
  unprefixMatchField,
} from "../lib/search-replace-payload";

const base = { scriptId: "sc1", scriptTitle: "Admission", scriptPosition: 0, position: 1, isDraft: false };

const outcome = (over: Record<string, any>) => ({
  ...base,
  name: "", description: "", key: "", expression: "", expressionMeaning: "",
  text1: "", text2: "", text3: "", symptoms: [],
  ...over,
});

/** Fill in every replacement, the way the modal does once "Replace with" is typed. */
const withReplacements = (items: ReturnType<typeof getReplaceItems>, from: string, to: string) =>
  items.map((item) => ({
    ...item,
    matches: item.matches.map((m) => ({
      ...m,
      newValue: m.fieldValue.replace(new RegExp(from, "gi"), to),
    })),
  }));

const search = (searchValue: string, over: Record<string, any>) =>
  parseScriptsSearchResults({ searchValue, scripts: [], screens: [], diagnoses: [], problems: [], ...over } as any);

// ── Problems reach the replace payload at all ────────────────────────────────
// The problems feature shipped with search and the server save wired up, but
// never the modal in between: matches were found and then dropped on the floor.

const problems = [outcome({ problemId: "p1", name: "Jaundice", description: "Jaundice notes", key: "JAUN" })];
const problemItems = getReplaceItems(search("Jaundice", { problems }));

assert.equal(problemItems.length, 1, "a matching problem is replaceable");
assert.equal(problemItems[0].type, "problem", "and is typed as a problem");
assert.equal(problemItems[0].id, "p1");

const problemPayload = buildSavePayload(withReplacements(problemItems, "Jaundice", "Icterus"));
assert.equal(problemPayload.problems.length, 1, "the problem reaches /api/save");
assert.equal(problemPayload.problems[0].problemId, "p1");
assert.equal(problemPayload.problems[0].data.name, "Icterus");
assert.equal(problemPayload.problems[0].data.description, "Icterus notes");

// ── A key is an identity, never replaced ─────────────────────────────────────

assert.equal(
  problemItems[0].matches.some((m) => m.field === "key"),
  false,
  "a record key is never offered for replacement",
);

const keyedSymptom = [outcome({
  diagnosisId: "d0",
  name: "Sepsis",
  symptoms: [{ key: "Sepsis_KEY", name: "unrelated", expression: "", type: "sign" }],
})];
assert.equal(
  getReplaceItems(search("Sepsis", { diagnoses: keyedSymptom }))[0]
    .matches.some((m) => m.field === "diagnosis_symptom_key"),
  false,
  "a symptom key is excluded too — renaming one breaks conditions that reference it",
);

// ── Symptom replacements are addressed correctly ─────────────────────────────
// Two bugs lived here: the list prefix was left on the property name, and a
// second match on the same symptom nested the first one inside itself.

assert.equal(unprefixMatchField("diagnosis_symptom_name"), "name");
assert.equal(unprefixMatchField("problem_symptom_expression"), "expression");
assert.equal(unprefixMatchField("field_item_label"), "label");
assert.equal(unprefixMatchField("field_label"), "label");
assert.equal(unprefixMatchField("name"), "name", "an unprefixed field is left alone");

const diagnoses = [outcome({
  diagnosisId: "d1",
  name: "Sepsis",
  symptoms: [
    { key: "S1", name: "Sepsis sign", expression: "$Sepsis = 'Yes'", type: "sign" },
    { key: "S2", name: "unrelated", expression: "", type: "sign" },
  ],
})];
const diagnosisPayload = buildSavePayload(
  withReplacements(getReplaceItems(search("Sepsis", { diagnoses })), "Sepsis", "Infection"),
);

assert.equal(diagnosisPayload.diagnoses.length, 1, "the diagnosis reaches /api/save");
const data = diagnosisPayload.diagnoses[0].data;
assert.equal(data.name, "Infection", "top-level columns are sent flat");
assert.equal(data._symptoms.length, 1, "both matches on one symptom merge into a single patch");
assert.equal(data._symptoms[0].index, 0, "the patch is addressed at the symptom's position");
assert.deepEqual(
  data._symptoms[0].data,
  { name: "Infection sign", expression: "$Infection = 'Yes'" },
  "properties are unprefixed and side by side, not nested inside each other",
);

// ── The server applies what the client sends ─────────────────────────────────
// Round-trip: the payload must actually change the stored symptoms.

const stored = [
  { key: "S1", name: "Sepsis sign", expression: "$Sepsis = 'Yes'", type: "sign" },
  { key: "S2", name: "unrelated", expression: "", type: "sign" },
];
const applied = applyIndexedPatches(stored, data._symptoms);

assert.deepEqual(
  applied[0],
  { key: "S1", name: "Infection sign", expression: "$Infection = 'Yes'", type: "sign" },
  "the replacement lands, and untouched properties survive",
);
assert.deepEqual(applied[1], stored[1], "an unmatched symptom is untouched");
assert.notEqual(applied, stored, "the stored row is not written through");
assert.equal(stored[0].name, "Sepsis sign", "the original array is left alone");

assert.equal(applyIndexedPatches(stored, []), stored, "no patches is a no-op");
assert.deepEqual(
  applyIndexedPatches(stored, [{ index: 9, data: { name: "x" } }]),
  stored,
  "a patch for an index that no longer exists is skipped, not appended",
);

// ── Screens keep working, and get the same merge fix ─────────────────────────

const screens = [{
  ...base,
  screenId: "sc-1",
  title: "Sepsis screen",
  type: "form",
  fields: [{ key: "F1", label: "Sepsis label", type: "text" }],
  items: [],
}];
const screenPayload = buildSavePayload(
  withReplacements(getReplaceItems(search("Sepsis", { screens })), "Sepsis", "Infection"),
);
const screenItem = screenPayload.screens[0];
assert.ok(screenItem, "the screen reaches /api/save");
assert.equal(
  screenItem.data._fields.every((f: any) => !("data" in f.data)),
  true,
  "a field patch is never nested inside itself",
);

// ── Filters keep symptom matches ─────────────────────────────────────────────
// Symptom fields carry a list prefix. Unmapped, they matched no filter, so
// picking anything other than "All matches" silently dropped them.

const symptomResults = search("Sepsis", {
  diagnoses: [outcome({
    diagnosisId: "d2",
    name: "unrelated",
    symptoms: [{ key: "S1", name: "Sepsis sign", expression: "$Sepsis = 'Yes'", type: "sign" }],
  })],
  problems: [outcome({
    problemId: "p2",
    name: "unrelated",
    symptoms: [{ key: "S2", name: "Sepsis sign", expression: "$Sepsis = 'Yes'", type: "sign" }],
  })],
});

const keptUnder = (filter: string) => {
  const [result] = filterScriptsSearchResults({ searchValue: "Sepsis", filter: filter as any, results: symptomResults });
  return [...(result?.diagnoses || []), ...(result?.problems || [])]
    .flatMap((entry) => entry.matches.map((m) => m.field));
};

assert.deepEqual(
  keptUnder("label").sort(),
  ["diagnosis_symptom_name", "problem_symptom_name"],
  "a symptom name survives the Label filter",
);
assert.deepEqual(
  keptUnder("expression").sort(),
  ["diagnosis_symptom_expression", "problem_symptom_expression"],
  "a symptom expression survives the Expression filter",
);
assert.equal(keptUnder("title").length, 0, "and is excluded from a filter it does not belong to");

// ── Problems are searched like diagnoses ─────────────────────────────────────
// The two records carry identical columns; searching only part of a problem
// made replace look broken on fields it could never reach.

const wideProblem = [outcome({
  problemId: "p3",
  name: "x", description: "Target desc", text1: "Target t1", text2: "Target t2",
  text3: "Target t3", expression: "$Target = 'y'", expressionMeaning: "Target meaning",
  symptoms: [{ key: "S1", name: "Target sign", expression: "", type: "sign" }],
})];
const wideDiagnosis = [outcome({
  diagnosisId: "d3",
  name: "x", description: "Target desc", text1: "Target t1", text2: "Target t2",
  text3: "Target t3", expression: "$Target = 'y'", expressionMeaning: "Target meaning",
  symptoms: [{ key: "S1", name: "Target sign", expression: "", type: "sign" }],
})];

const problemFields = search("Target", { problems: wideProblem })[0].problems[0].matches
  .map((m) => m.field.replace("problem_symptom_", "")).sort();
const diagnosisFields = search("Target", { diagnoses: wideDiagnosis })[0].diagnoses[0].matches
  .map((m) => m.field.replace("diagnosis_symptom_", "")).sort();

assert.deepEqual(problemFields, diagnosisFields, "a problem is searched on the same fields as a diagnosis");
assert.ok(problemFields.includes("description"), "including description");
assert.ok(problemFields.includes("expressionMeaning"), "and expressionMeaning");

console.log("search and replace tests passed");
