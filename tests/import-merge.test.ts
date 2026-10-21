import assert from "assert";

import {
  assignMergedPositions,
  invertImportSnapshot,
  contentChanged,
  createMergeReport,
  mergeList,
  mergeOptionKeys,
  orderMergedEntities,
  planEntityMerge,
  FIELD_SPEC,
  SCREEN_ITEM_SPEC,
} from "../lib/import-merge";

const opt = (value: string, label = value, extra: Record<string, any> = {}) => ({ itemId: `i-${value}`, value, label, ...extra });
const values = (items: any[]) => items.map((i) => i.value ?? i.id);

// ── Options that only exist on the target survive an import ─────────────────────────────────────
// First import (no base): nothing the target has on its own is removed.
{
  const report = createMergeReport();
  const source = [opt("a"), opt("b"), opt("dev-new")];
  const target = [opt("a"), opt("live-only"), opt("b")];
  const merged = mergeList(source, target, null, FIELD_SPEC.children!.items, "field", report);
  assert.deepEqual(values(merged), ["a", "live-only", "b", "dev-new"], "first import keeps target-only options next to their neighbours and adds source options");
  assert.ok(report.events.some((e) => e.kind === "kept_target_only" && e.identity === "i-live-only"));
}

// With a base: an option the source removed since the last import is removed on the target too.
{
  const report = createMergeReport();
  const base = [opt("a"), opt("b"), opt("c")];
  const source = [opt("a"), opt("c")];
  const target = [opt("a"), opt("b"), opt("c"), opt("live-only")];
  const merged = mergeList(source, target, base, FIELD_SPEC.children!.items, "field", report);
  assert.deepEqual(values(merged), ["a", "c", "live-only"], "source removal applied, target addition kept");
  assert.ok(report.events.some((e) => e.kind === "removed_by_source" && e.identity === "i-b"));
}

// The target removed an option since the last import and the source did not change it: keep the removal.
{
  const report = createMergeReport();
  const base = [opt("a"), opt("b")];
  const source = [opt("a"), opt("b")];
  const target = [opt("a")];
  const merged = mergeList(source, target, base, FIELD_SPEC.children!.items, "field", report);
  assert.deepEqual(values(merged), ["a"], "target removal is respected");
}

// The target relabelled an option, the source did not: keep the target's wording.
// Both relabelled: the source wins and a conflict is reported.
{
  const report = createMergeReport();
  const base = [opt("a", "Alert"), opt("b", "Lethargic")];
  const source = [opt("a", "Alert"), opt("b", "Lethargic (DEV)")];
  const target = [opt("a", "Alert (LIVE wording)"), opt("b", "Lethargic (LIVE)")];
  const merged = mergeList(source, target, base, FIELD_SPEC.children!.items, "field", report);
  assert.equal(merged[0].label, "Alert (LIVE wording)", "target-only relabel kept");
  assert.equal(merged[1].label, "Lethargic (DEV)", "both changed: source wins");
  assert.ok(report.events.some((e) => e.kind === "conflict_source_wins"));
}

// Target ids are kept for matched options and selection rules are remapped to them.
{
  const report = createMergeReport();
  const source = [
    { itemId: "dev-1", value: "a", label: "A" },
    { itemId: "dev-2", value: "b", label: "B", forbidWith: ["dev-1"] },
  ];
  const target = [
    { itemId: "live-1", value: "a", label: "A" },
    { itemId: "live-2", value: "b", label: "B" },
  ];
  const merged = mergeList(source, target, null, FIELD_SPEC.children!.items, "field", report);
  assert.deepEqual(merged.map((i) => i.itemId), ["live-1", "live-2"], "target item ids are kept");
  assert.deepEqual(merged[1].forbidWith, ["live-1"], "forbidWith is remapped to the kept id");
}

// Repeated values are matched in order rather than collapsed.
{
  const report = createMergeReport();
  const source = [{ value: "SSS", label: "One" }, { value: "SSS", label: "Two" }];
  const target = [{ value: "SSS", label: "One" }, { value: "SSS", label: "Two" }, { value: "X", label: "X" }];
  const merged = mergeList(source, target, null, FIELD_SPEC.children!.items, "field", report);
  assert.deepEqual(merged.map((i) => i.label), ["One", "Two", "X"]);
}

// Screen items (single/multi-select) behave the same way.
{
  const report = createMergeReport();
  const source = [{ itemId: "1", id: "NotBr", label: "Not breathing" }];
  const target = [{ itemId: "1", id: "NotBr", label: "Not breathing" }, { itemId: "9", id: "LiveOnly", label: "LIVE only" }];
  const merged = mergeList(source, target, null, SCREEN_ITEM_SPEC, "screen", report);
  assert.deepEqual(merged.map((i) => i.id), ["NotBr", "LiveOnly"]);
}

// ── Whole screens: stable ids, deletions and target-only screens ─────────────────────────────────
{
  let n = 0;
  const newId = () => `new-${++n}`;
  const report = createMergeReport();
  const source = [
    { screenId: "dev-s1", type: "form", refId: "R1", title: "One", fields: [{ fieldId: "f1", key: "K", type: "dropdown", items: [opt("a"), opt("dev-new")] }] },
    { screenId: "dev-s2", type: "form", refId: "R2", title: "Two", fields: [] },
  ];
  const target = [
    { screenId: "live-s1", position: 1, type: "form", refId: "R1", title: "One", fields: [{ fieldId: "f1", key: "K", type: "dropdown", items: [opt("a"), opt("live-only")] }] },
    { screenId: "live-x", position: 2, type: "form", refId: "RX", title: "LIVE only screen", fields: [] },
  ];

  // First import, keeping target-only screens.
  const plan = planEntityMerge({ kind: "screens", source, target, base: null, storedIdMap: {}, keepTargetOnly: true, newId, report });
  assert.equal(plan.save[0].targetId, "live-s1", "matched by type/ref/title and the LIVE id is reused");
  assert.deepEqual(values(plan.save[0].entity.fields[0].items), ["a", "live-only", "dev-new"], "LIVE-only option kept, DEV option added");
  assert.equal(plan.save[1].isNew, true, "DEV-only screen is created");
  assert.equal(plan.keep[0].targetId, "live-x", "LIVE-only screen kept");
  assert.equal(plan.remove.length, 0);
  const ordered = orderMergedEntities("screens", plan, target);
  assert.deepEqual(ordered.map((o) => o.entity.title), ["One", "LIVE only screen", "Two"], "kept screen stays after its LIVE neighbour");

  // First import without keeping target-only screens (today's behaviour, but shown in the preview).
  const plan2 = planEntityMerge({ kind: "screens", source, target, base: null, storedIdMap: {}, keepTargetOnly: false, newId, report: createMergeReport() });
  assert.deepEqual(plan2.remove.map((r) => r.targetId), ["live-x"]);

  // Second import: the source deleted screen two and the base says it came from the source.
  const base = source;
  const storedIdMap = { "dev-s1": "live-s1", "dev-s2": "live-s2" };
  const target3 = [...target, { screenId: "live-s2", position: 3, type: "form", refId: "R2", title: "Two", fields: [] }];
  const plan3 = planEntityMerge({ kind: "screens", source: [source[0]], target: target3, base, storedIdMap, keepTargetOnly: false, newId, report: createMergeReport() });
  assert.deepEqual(plan3.remove.map((r) => r.targetId), ["live-s2"], "screen removed on the source is removed");
  assert.deepEqual(plan3.keep.map((k) => k.targetId), ["live-x"], "screen created on LIVE is kept on later imports");
}

// ── Data-key option lists ─────────────────────────────────────────────────────────────────────────
{
  const additive = mergeOptionKeys({ source: ["a", "b", "new"], target: ["a", "live", "b"], base: null, additiveOnly: true });
  assert.deepEqual(additive.options, ["a", "live", "b", "new"], "additive merge appends source additions only");
  assert.deepEqual(additive.removed, []);

  const threeWay = mergeOptionKeys({ source: ["a", "new"], target: ["a", "b", "live"], base: ["a", "b"], additiveOnly: false });
  assert.deepEqual(threeWay.options, ["a", "live", "new"], "source removal (b) applied, LIVE-only option kept next to its LIVE neighbour");
  assert.deepEqual(threeWay.removed, ["b"]);

  const noBase = mergeOptionKeys({ source: ["a"], target: ["a", "b"], base: null, additiveOnly: false });
  assert.deepEqual(noBase.options, ["a", "b"], "without a base nothing is removed");
}

// ── Positions ────────────────────────────────────────────────────────────────────────────────────
{
  const kept = assignMergedPositions([{ id: "a", currentPosition: 10 }, { id: "new", currentPosition: null }, { id: "b", currentPosition: 20 }], 500);
  assert.equal(kept.renumbered, false);
  assert.deepEqual(kept.positions, { a: 10, new: 11, b: 20 }, "new screen fits in the gap");

  const appended = assignMergedPositions([{ id: "a", currentPosition: 10 }, { id: "new", currentPosition: null }], 500);
  assert.deepEqual(appended.positions, { a: 10, new: 500 }, "appended screens come after every existing position");

  const noGap = assignMergedPositions([{ id: "a", currentPosition: 10 }, { id: "new", currentPosition: null }, { id: "b", currentPosition: 11 }], 500);
  assert.equal(noGap.renumbered, true);
  assert.deepEqual(noGap.positions, { a: 500, new: 501, b: 502 });

  const reordered = assignMergedPositions([{ id: "b", currentPosition: 20 }, { id: "a", currentPosition: 10 }], 500);
  assert.equal(reordered.renumbered, true);
}

// Screen items are renumbered in merged order.
{
  const merged = mergeList(
    [{ itemId: "1", id: "A", position: 1 }, { itemId: "2", id: "B", position: 2 }],
    [{ itemId: "1", id: "A", position: 1 }, { itemId: "9", id: "L", position: 2 }],
    null,
    SCREEN_ITEM_SPEC,
    "screen",
    createMergeReport(),
  );
  assert.deepEqual(merged.map((i) => [i.id, i.position]), [["A", 1], ["L", 2], ["B", 3]]);
}

// The same image is referenced through different URLs on each editor: not a change, and the target's
// reference is kept.
{
  const report = createMergeReport();
  const source = [{ screenId: "s", type: "form", refId: "R", title: "T", image1: { fileId: "file-1", data: "http://dev/files/file-1" }, fields: [] }];
  const target = [{ screenId: "s", position: 1, type: "form", refId: "R", title: "T", image1: { fileId: "file-1", data: "http://live/files/file-1" }, fields: [] }];
  const plan = planEntityMerge({ kind: "screens", source, target, base: null, storedIdMap: {}, keepTargetOnly: true, newId: () => "x", report });
  assert.equal(plan.save[0].entity.image1.data, "http://live/files/file-1");
  assert.equal(contentChanged(plan.save[0].entity, target[0]), false, "same file is not a content change");
}

// A back-port uses the other editor's import record with ids turned around.
{
  const snapshot = {
    sourceScriptId: "dev-script",
    script: { title: "T", printSections: [{ screensIds: ["dev-s1"] }], reviewConfigurations: [{ screen: "dev-s1" }] },
    screens: [{ screenId: "dev-s1", skipToScreenId: "dev-s2" }, { screenId: "dev-s2" }],
    diagnoses: [{ diagnosisId: "dev-d1" }],
    problems: [],
    idMap: { screens: { "dev-s1": "live-s1", "dev-s2": "live-s2" }, diagnoses: { "dev-d1": "live-d1" }, problems: {} },
  };
  const inverted = invertImportSnapshot(snapshot, "live-script");
  assert.equal(inverted.sourceScriptId, "live-script");
  assert.deepEqual(inverted.screens.map((s: any) => [s.screenId, s.skipToScreenId]), [["live-s1", "live-s2"], ["live-s2", undefined]]);
  assert.deepEqual(inverted.script.printSections[0].screensIds, ["live-s1"]);
  assert.equal(inverted.script.reviewConfigurations[0].screen, "live-s1");
  assert.deepEqual(inverted.idMap.screens, { "live-s1": "dev-s1", "live-s2": "dev-s2" });
  assert.deepEqual(inverted.idMap.diagnoses, { "live-d1": "dev-d1" });
}

console.log("import-merge tests passed");
