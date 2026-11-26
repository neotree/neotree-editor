import assert from "assert";
import { findStaleReviewConfigurations, pruneReviewConfigurations, removeScreenReferences, screenIdsOf, toReviewEntries } from "../lib/review-configurations";

const screens = [{ screenId: "s-new-1", oldScreenId: "old-1" }, { screenId: "s-new-2", oldScreenId: null }, { screenId: "s-3" }];
const entries = [
  { label: "Demographics", screen: "old-1" },   // legacy id of screen 1
  { label: "Vitals", screen: "s-new-2" },
  { label: "Gone", screen: "s-deleted" },
  { label: "Not chosen yet", screen: "" },
  { label: "Also gone", screen: "old-deleted" },
];

// ids a screen is known by
assert.deepEqual([...screenIdsOf(screens)].sort(), ["old-1", "s-3", "s-new-1", "s-new-2"]);
assert.deepEqual([...screenIdsOf(null)], []);

// Pruning keeps entries for screens that exist (by either id), and unfinished ones
assert.deepEqual(pruneReviewConfigurations(entries, screens).map((e) => e.label), ["Demographics", "Vitals", "Not chosen yet"]);
assert.deepEqual(pruneReviewConfigurations([], screens), []);
assert.deepEqual(pruneReviewConfigurations(null, screens), []);
assert.deepEqual(pruneReviewConfigurations(undefined, undefined), [], "no screens at all: only unfinished entries could stay");
assert.deepEqual(pruneReviewConfigurations([{ label: "x", screen: "a" }], []), [], "a script with no screens has no review entries");
assert.equal(pruneReviewConfigurations(entries, screens)[0], entries[0], "the same entry objects are returned, not copies");

// A screen is deleted: every id it was known by is removed
{
  const r = removeScreenReferences(entries, ["s-new-1", "old-1"]);
  assert.equal(r.changed, true);
  assert.deepEqual(r.entries.map((e) => e.label), ["Vitals", "Gone", "Not chosen yet", "Also gone"]);
  const none = removeScreenReferences(entries, ["unrelated"]);
  assert.equal(none.changed, false);
  assert.equal(none.entries.length, entries.length);
  assert.equal(removeScreenReferences(entries, []).changed, false);
  assert.equal(removeScreenReferences(entries, [""]).changed, false, "a blank id removes nothing, not the unfinished entries");
  assert.deepEqual(removeScreenReferences(entries, ["s-new-2", "s-3"]).entries.map((e) => e.label), ["Demographics", "Gone", "Not chosen yet", "Also gone"]);
  assert.deepEqual(removeScreenReferences(null, ["a"]), { entries: [], changed: false });
  assert.deepEqual(removeScreenReferences("nope" as any, ["a"]), { entries: [], changed: false }, "bad data in the column doesn't throw");
  // removing the last one empties the list
  assert.deepEqual(removeScreenReferences([{ label: "a", screen: "x" }], ["x"]), { entries: [], changed: true });
}

// Finding the stale ones for the editor
assert.deepEqual(findStaleReviewConfigurations(entries, screens).map((e) => e.label), ["Gone", "Also gone"]);
assert.deepEqual(findStaleReviewConfigurations([], screens), []);
assert.deepEqual(findStaleReviewConfigurations(entries.slice(0, 2), screens), []);

// Some rows hold the list as JSON text inside a JSON string: it is read as the list it is
{
  const asText = JSON.stringify(entries);
  assert.equal(toReviewEntries(asText).length, entries.length);
  assert.deepEqual(toReviewEntries("[]"), []);
  assert.deepEqual(toReviewEntries("not json"), [], "unreadable text is no entries, not an error");
  assert.deepEqual(toReviewEntries('{"a":1}'), [], "JSON that isn't a list");
  assert.deepEqual(toReviewEntries(5), []);
  assert.deepEqual(toReviewEntries(null), []);
  assert.deepEqual(pruneReviewConfigurations(asText, screens).map((e) => e.label), ["Demographics", "Vitals", "Not chosen yet"]);
  const r = removeScreenReferences(asText, ["old-1"]);
  assert.ok(r.changed && Array.isArray(r.entries) && r.entries.length === entries.length - 1, "text-encoded list is cleaned and returned as a real list");
  assert.deepEqual(findStaleReviewConfigurations(asText, screens).map((e) => e.label), ["Gone", "Also gone"]);
}

console.log("review-configurations: all assertions passed");
