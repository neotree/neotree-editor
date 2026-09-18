import assert from "assert";

import {
  isConditionCatalogueReady,
  validateCondition,
  type ConditionKey,
} from "../lib/conditional-expression";

/**
 * The catalogue-readiness contract.
 *
 * `keysReady` decides `skipKeyResolution`, so getting it wrong fails loudly in
 * one direction and silently in the other:
 *
 * - Ready when the catalogue was never fetched → every key in every expression
 *   is reported as unknown. That is what a hardcoded `true` produced on
 *   /new-script.
 * - Not ready when it was fetched → unknown keys and options go unreported, and
 *   nothing on screen says the checks were skipped.
 *
 * These tests pin both halves, and the validator behaviour each one produces.
 */

const keys: ConditionKey[] = [
  { name: "Sex", dataType: "dropdown", options: ["M", "F"] },
  { name: "Gestation", dataType: "number" },
];

const condition = "$Sex = 'M' and $Gestation > 37";
const errorsFor = (ctxKeys: ConditionKey[], keysReady: boolean) =>
  validateCondition(condition, { keys: ctxKeys, allowSelf: true, skipKeyResolution: !keysReady })
    .diagnostics.filter((d) => d.severity === "error");

// ── The rule ────────────────────────────────────────────────────────────────

assert.equal(
  isConditionCatalogueReady(undefined),
  false,
  "no catalogue was prefetched (/new-script, or a failed prefetch) — nothing is known about keys",
);
assert.equal(isConditionCatalogueReady(null), false, "a null catalogue is not a fetched one");
assert.equal(
  isConditionCatalogueReady([]),
  true,
  "fetched and empty is authoritative: the script genuinely has no keys",
);
assert.equal(isConditionCatalogueReady([{ scriptId: "s1" }]), true);

// ── What each state does to validation ──────────────────────────────────────

// Not fetched: suppressed, so a page that cannot know its keys stays quiet.
assert.equal(
  errorsFor([], isConditionCatalogueReady(undefined)).length,
  0,
  "an unfetched catalogue must not flag every key as unknown",
);

// Fetched but empty, on a saved script: an unknown key really is unknown.
const emptyButFetched = errorsFor([], isConditionCatalogueReady([]));
assert.equal(emptyButFetched.length, 2, "a fetched empty catalogue reports unknown keys");
assert.ok(
  emptyButFetched.every((d) => d.code === "UNKNOWN_KEY"),
  `expected UNKNOWN_KEY diagnostics, got ${emptyButFetched.map((d) => d.code).join(", ")}`,
);

// Fetched with keys: normal validation, nothing flagged.
assert.equal(errorsFor(keys, isConditionCatalogueReady([{ scriptId: "s1" }])).length, 0);

// And the regression this replaces: ready-but-empty is exactly the noisy state,
// which is why readiness must not be a constant.
assert.equal(
  errorsFor([], true).length,
  2,
  "declaring an empty catalogue ready is what produced a false error on every key",
);

console.log("condition keys readiness tests passed");
