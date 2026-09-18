import assert from "assert";

import {
  dataKeyToJSON,
  indexDataKeysByJSON,
  mergeScrappedKeys,
  pickDataKey,
  removeDuplicateDataKeys,
} from "../lib/data-keys";

/**
 * Scrapping a script used to be quadratic in three places, each re-serialising
 * its candidates on every comparison: a 144-screen script against a 3000-key
 * library took 2.7s, which was the bulk of every CE report recompute. It is now
 * 13ms.
 *
 * These tests pin both halves of that: the results are unchanged, and the shape
 * stays linear so the quadratic cannot creep back in unnoticed.
 */

const key = (name: string, dataType = "text", label = name) => ({ name, dataType, label });

// ── Same results as the scans they replaced ──────────────────────────────────

const library = [
  { ...key("Sex", "dropdown"), uniqueKey: "dk-sex", uuid: "u-sex", options: [] },
  { ...key("Weight", "number"), uniqueKey: "dk-weight", uuid: "u-weight", options: [] },
  // A duplicate: the first must win, exactly as Array.find did.
  { ...key("Sex", "dropdown"), uniqueKey: "dk-sex-dupe", uuid: "u-sex-dupe", options: [] },
];

assert.equal(pickDataKey(library as any, key("Sex", "dropdown"))?.uniqueKey, "dk-sex", "first match wins");
assert.equal(pickDataKey(library as any, key("Weight", "number"))?.uniqueKey, "dk-weight");
assert.equal(pickDataKey(library as any, key("Sex", "number")), undefined, "dataType is part of identity");
assert.equal(pickDataKey(library as any, key("Missing")), undefined);
assert.equal(pickDataKey([] as any, key("Sex")), undefined, "an empty candidate list is not a match");

// Case-insensitive, matching dataKeyToJSON's normalisation.
assert.equal(pickDataKey(library as any, key("sex", "dropdown"))?.uniqueKey, "dk-sex");

// ── The index is cached per array, and invalidated when the array grows ──────

const growing = [{ ...key("A"), uniqueKey: "dk-a", uuid: "u-a", options: [] }];
assert.equal(indexDataKeysByJSON(growing as any).size, 1);
assert.equal(indexDataKeysByJSON(growing as any), indexDataKeysByJSON(growing as any), "same array, same index");

growing.push({ ...key("B"), uniqueKey: "dk-b", uuid: "u-b", options: [] });
assert.equal(indexDataKeysByJSON(growing as any).size, 2, "a grown array is re-indexed");
assert.equal(pickDataKey(growing as any, key("B"))?.uniqueKey, "dk-b");

// ── Dedupe keeps the first of each and preserves order ──────────────────────

const withDupes = [key("A"), key("B"), key("A"), key("C"), key("B")];
assert.deepEqual(
  removeDuplicateDataKeys(withDupes).map((k) => k.name),
  ["A", "B", "C"],
  "first of each, in order",
);
assert.equal(removeDuplicateDataKeys([]).length, 0);

// ── mergeScrappedKeys gathers options from every entry sharing an identity ──

const scrapped = [
  [
    {
      id: "s1",
      type: "screen",
      key: { ...key("Diagnosis", "dropdown"), children: [{ ...key("sepsis", "option"), children: [] }] },
    },
    {
      id: "s2",
      type: "screen",
      key: { ...key("Diagnosis", "dropdown"), children: [{ ...key("jaundice", "option"), children: [] }] },
    },
  ],
];

const merged = mergeScrappedKeys(...(scrapped as any));
const diagnosis = merged.filter((k) => `${k.name}`.toLowerCase() === "diagnosis");
assert.equal(diagnosis.length, 2, "one entry per occurrence, as before");
for (const entry of diagnosis) {
  assert.deepEqual(
    entry.options.map((o: any) => o.name).sort(),
    ["jaundice", "sepsis"],
    "both occurrences' children become the shared option pool",
  );
}
// Children are promoted to top-level keys too.
assert.ok(merged.some((k) => `${k.name}` === "sepsis"), "children are scrapped as their own keys");

// ── Shape check: cost must stay linear ──────────────────────────────────────

const buildLibrary = (size: number) =>
  Array.from({ length: size }, (_, i) => ({ ...key(`Key${i}`), uniqueKey: `dk-${i}`, uuid: `u-${i}`, options: [] }));

const timeLookups = (size: number) => {
  const candidates = buildLibrary(size);
  const probes = Array.from({ length: 2000 }, (_, i) => key(`Key${i % size}`));
  const start = process.hrtime.bigint();
  for (const probe of probes) pickDataKey(candidates as any, probe);
  return Number(process.hrtime.bigint() - start) / 1e6;
};

// Warm the JIT so the comparison measures the algorithm, not compilation.
timeLookups(200);
const small = timeLookups(500);
const large = timeLookups(8000);

// Linear lookups: a 16x larger candidate list costs about the same for a fixed
// number of probes (index build aside). Quadratic would be ~16x slower.
assert.ok(
  large < Math.max(small * 6, 40),
  `lookup cost must not scale with candidate count (500 keys: ${small.toFixed(1)}ms, 8000 keys: ${large.toFixed(1)}ms)`,
);

const timeDedupe = (size: number) => {
  const keys = Array.from({ length: size }, (_, i) => key(`Key${i % (size / 2)}`));
  const start = process.hrtime.bigint();
  removeDuplicateDataKeys(keys);
  return Number(process.hrtime.bigint() - start) / 1e6;
};

timeDedupe(500);
const dedupeSmall = timeDedupe(1000);
const dedupeLarge = timeDedupe(8000);
assert.ok(
  dedupeLarge < Math.max(dedupeSmall * 24, 40),
  `dedupe must stay linear (1k: ${dedupeSmall.toFixed(1)}ms, 8k: ${dedupeLarge.toFixed(1)}ms)`,
);

console.log(
  `data key scrap performance tests passed `
  + `(lookups 500→8000 keys: ${small.toFixed(1)}ms→${large.toFixed(1)}ms, `
  + `dedupe 1k→8k: ${dedupeSmall.toFixed(1)}ms→${dedupeLarge.toFixed(1)}ms)`,
);
