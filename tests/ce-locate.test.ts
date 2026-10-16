import assert from "assert";

import { locateConditions, locateForSites } from "../lib/conditional-expression/locate";

/**
 * Runtime CE failures as the deployed app reports them (expressions taken from production
 * app_errors.txt) must resolve to the script entity that holds them, with its effect and fix.
 */

const blankLineCondition = "$Gestation < 37 and ($MethodEstGest = 'LMP' or $MethodEstGest = 'USS')\n\n$RESUSOutcome != 'DetDied'";
const gluedAnd = "($JaunKr = '1' or $JaunKr = '2' )and $Age > 24";
const doubledQuotes = "$DangerSignBr = ''Strid''";

const scripts = [{
  scriptId: "s1",
  title: "Admission",
  screens: [
    { screenId: "sc1", title: "Resuscitation", condition: `${blankLineCondition}\r\n`, fields: [{ key: "Temp", condition: "$Temp > 37", calculation: doubledQuotes }] },
  ],
  diagnoses: [
    { diagnosisId: "d1", name: "Jaundice", expression: gluedAnd, symptoms: [{ name: "Stridor", expression: doubledQuotes }] },
    { diagnosisId: "d2", name: "Has symptoms, no expression", expression: "", symptoms: [{ name: "Any", expression: "$X = 'y'" }] },
    { diagnosisId: "d3", name: "No symptoms, no expression", expression: "" },
  ],
  problems: [{ problemId: "p1", name: "Sepsis", expression: "$A = 'b'", symptoms: [{ key: "rf", expression: doubledQuotes }] }],
}];

const result = locateConditions(
  [blankLineCondition, "$RESUSOutcome != 'DetDied'", gluedAnd, doubledQuotes, "()", "$Fixed = 'already'", "( ? == ''conv'')"],
  scripts,
  "https://editor.example",
);

// Screen condition: exact text (despite stored CRLF/trailing whitespace) and per line, as the device evaluates it.
for (const ce of [blankLineCondition, "$RESUSOutcome != 'DetDied'"]) {
  assert.deepEqual(result[ce].matches, [{
    script: "Admission",
    where: 'Screen "Resuscitation"',
    impact: "high",
    consequence: "Screen is skipped",
    href: "https://editor.example/script/s1/screen/sc1",
  }]);
}
assert.match(result[blankLineCondition].fix!, /blank line/, "device-only fault the validator misses");

assert.equal(result[gluedAnd].matches[0].consequence, "Diagnosis is never suggested");
assert.match(result[gluedAnd].fix!, /space on both sides of and\/or/);

// The same faulty text in several places resolves to all of them (all need fixing); a
// formula field that happens to contain it is not a CE.
assert.deepEqual(result[doubledQuotes].matches.map((m) => `${m.where} | ${m.impact}`), [
  'Diagnosis "Jaundice" > symptom "Stridor" | medium',
  'Problem "Sepsis" > symptom "rf" | medium',
]);
assert.match(result[doubledQuotes].fix!, /doubled quote marks.*Suggested: 'Strid'/);

// "()" is a diagnosis/problem the device evaluates with an empty expression: only one with symptoms.
assert.deepEqual(result["()"].matches.map((m) => m.where), ['Diagnosis "Has symptoms, no expression"']);
assert.equal(result["()"].matches[0].href, "https://editor.example/script/s1/diagnosis/d2");

// Not in the scripts (fixed since the device synced), or a value-free field shape: no match, no fix.
for (const ce of ["$Fixed = 'already'", "( ? == ''conv'')"]) assert.deepEqual(result[ce], { matches: [], total: 0, fix: undefined });

// Eligibility's alternative activation condition is evaluated on the device, so it must resolve too.
const activation = "$Age < 7 and $Born = ''Home''";
const eligible = locateConditions([activation], [{ scriptId: "s3", title: "Triage", eligibilityCriteria: { alternative_activation_condition: activation } }]);
assert.deepEqual(eligible[activation].matches.map((m) => [m.where, m.impact, m.consequence]), [
  ["Eligibility criteria (alternative activation)", "high", "Alternative eligibility criteria are not activated"],
]);

// A text repeated in many places: highest impact first, capped, with the full count.
const common = "$Sex = 'M'";
const many = locateConditions([common], [{
  scriptId: "s2",
  title: "Discharge",
  screens: Array.from({ length: 40 }, (_, i) => ({ screenId: `x${i}`, title: `S${i}`, skipToCondition: common, fields: i === 39 ? [{ key: "F", condition: common }] : [] })),
}]);
assert.equal(many[common].total, 41);
assert.equal(many[common].matches.length, 25);
assert.equal(many[common].matches[0].where, 'Screen "S39" > field "F"', "the high-impact field condition sorts first");
assert.ok(many[common].matches.slice(1).every((m) => m.impact === "low"));

// Per site: a tablet syncs only its own site's scripts, so each site is searched on its own.
const broken = "$Activity = ''Conv''";
const siteScripts = [
  { scriptId: "a1", hospitalId: "hosp-a", title: "Admission (Site A)", diagnoses: [{ diagnosisId: "da", name: "Sepsis", expression: "$x = 'y'", symptoms: [{ name: "Fits", expression: "$Activity = 'Conv'" }] }] },
  { scriptId: "b1", hospitalId: "hosp-b", title: "Admission (Site B)", diagnoses: [{ diagnosisId: "db", name: "Sepsis", expression: "$x = 'y'", symptoms: [{ name: "Fits", expression: broken }] }] },
];
const hospitals = [
  { hospitalId: "hosp-a", oldHospitalId: "-OldA", name: "Site A" },
  { hospitalId: "hosp-b", oldHospitalId: null, name: "Site B" },
];
const perSite = locateForSites([
  { site: "-OldA", expressions: [broken] },   // old-format id, fixed in Site A's copy
  { site: "hosp-b", expressions: [broken] },  // still broken in Site B's copy
  { site: "-Unknown", expressions: [broken] },
  { site: null, expressions: [broken] },
], siteScripts, hospitals);
assert.deepEqual([perSite["-OldA"].name, perSite["-OldA"].scoped, perSite["-OldA"].locations[broken].total, perSite["-OldA"].locations[broken].elsewhere], ["Site A", true, 0, 1]);
assert.deepEqual([perSite["hosp-b"].locations[broken].total, perSite["hosp-b"].locations[broken].elsewhere], [1, 0]);
assert.equal(perSite["hosp-b"].locations[broken].matches[0].script, "Admission (Site B)");
for (const key of ["-Unknown", ""]) {
  assert.deepEqual([perSite[key].scoped, perSite[key].locations[broken].total], [false, 1], `${key || "no site"}: searched all scripts`);
}

console.log("ce-locate: all assertions passed");
