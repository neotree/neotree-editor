import assert from "assert";

import { parseImportedDataKeys } from "../lib/data-keys";
import { rebaseDataKeyOptions } from "../lib/data-key-save";
import { applyFieldItemPatches, toScreenData } from "../lib/search-replace-payload";
import { computeEntityRevision } from "../lib/entity-revision";
import { repairSingleDataKeyIntegrityReference, scanDataKeyIntegrity } from "../lib/data-key-integrity";

const dk = (uniqueKey: string, name: string, label: string, dataType: string, options: string[] = []) => ({
    id: 1,
    uuid: `uuid-${uniqueKey}`,
    uniqueKey,
    name,
    label,
    dataType,
    options,
    refId: null,
    confidential: false,
    confidentialLabelOnly: false,
    metadata: {},
    version: 1,
    publishDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isDraft: false,
    isDeleted: false,
}) as any;

const screenWithField = (fieldKeyId: string, items: { keyId: string; value: string; label: string }[], fieldLabel = "Plan") => ({
    screenId: "s1",
    scriptId: "script-1",
    type: "form",
    title: "Plan",
    fields: [{
        fieldId: "f1",
        key: "Plan",
        label: fieldLabel,
        type: "dropdown",
        keyId: fieldKeyId,
        items: items.map((i, n) => ({ itemId: `i${n}`, ...i })),
    }],
    items: [],
}) as any;

async function main() {
    // ── Links survive a label that differs between the editors ────────────────────────────────────
    {
        const live = [dk("P", "Plan", "Plan (LIVE wording)", "dropdown", ["A"]), dk("A", "a", "A", "option")];
        const dev = [dk("P", "Plan", "Plan", "dropdown", ["A", "B"]), dk("A", "a", "A", "option"), dk("B", "b", "B", "option")];
        const res = await parseImportedDataKeys({
            localDataKeys: live,
            importedDataKeys: dev,
            importedScrappedKeys: [],
            importedScreens: [screenWithField("P", [{ keyId: "A", value: "a", label: "A" }, { keyId: "B", value: "b", label: "B" }])],
        });
        const field = res.screens[0].fields[0];
        assert.equal(field.keyId, "P", "field keeps its key link although the labels differ (it used to become undefined)");
        assert.deepEqual(field.items.map((i: any) => i.keyId), ["A", "B"]);

        const plan = res.dataKeys.find(k => k.uniqueKey === "P")!;
        assert.equal(plan.canSave, true);
        assert.deepEqual(plan.options, ["A", "B"], "additive: the new DEV option is added to the LIVE key");
        assert.equal(plan.label, "Plan (LIVE wording)", "additive: LIVE wording is kept");
        assert.deepEqual(plan.removedOptions, []);
    }

    // ── LIVE-only options are kept; the source's removals apply only with a base ────────────────────
    {
        const live = [dk("P", "Plan", "Plan", "dropdown", ["A", "X", "L"]), dk("A", "a", "A", "option"), dk("X", "x", "X", "option"), dk("L", "l", "LIVE only", "option")];
        const dev = [dk("P", "Plan", "Plan", "dropdown", ["A"]), dk("A", "a", "A", "option"), dk("X", "x", "X", "option")];
        const screens = [screenWithField("P", [{ keyId: "A", value: "a", label: "A" }])];

        const noBase = await parseImportedDataKeys({ localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], importedScreens: screens, mode: "three_way" });
        assert.deepEqual(noBase.dataKeys.find(k => k.uniqueKey === "P")!.options, ["A", "X", "L"], "first import with overwrite on: nothing removed");

        const base = { P: { name: "Plan", label: "Plan", dataType: "dropdown", options: ["A", "X"] } };
        const withBase = await parseImportedDataKeys({ localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], importedScreens: screens, mode: "three_way", baseDataKeys: base });
        const plan = withBase.dataKeys.find(k => k.uniqueKey === "P")!;
        assert.deepEqual(plan.options, ["A", "L"], "DEV removed X since the last import: removed; LIVE-only L kept");
        assert.deepEqual(plan.removedOptions, ["X"]);

        const usedElsewhere = await parseImportedDataKeys({
            localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], importedScreens: screens, mode: "three_way", baseDataKeys: base,
            isOptionUsedOutsideImport: (_parent, option) => option === "X",
        });
        assert.deepEqual(usedElsewhere.dataKeys.find(k => k.uniqueKey === "P")!.options, ["A", "X", "L"], "kept because other scripts still use it");
        assert.ok(usedElsewhere.warnings.some(w => w.includes("other scripts still use")));
    }

    // ── Overwrite on: a relabel from the source is applied and reported ─────────────────────────────
    {
        const live = [dk("P", "Plan", "Plan", "dropdown", ["A"]), dk("A", "a", "A", "option")];
        const dev = [dk("P", "Plan", "Plan of care", "dropdown", ["A"]), dk("A", "a", "A", "option")];
        const res = await parseImportedDataKeys({
            localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], mode: "three_way",
            importedScreens: [screenWithField("P", [{ keyId: "A", value: "a", label: "A" }])],
        });
        const plan = res.dataKeys.find(k => k.uniqueKey === "P")!;
        assert.equal(plan.label, "Plan of care");
        assert.deepEqual(plan.changedProps, ["label"], "the preview can say which properties change");
    }

    // ── Overwrite on never lowers confidentiality ──────────────────────────────────────────────────
    {
        const live = [{ ...dk("P", "Plan", "Plan", "dropdown", ["A"]), confidential: true }, dk("A", "a", "A", "option")];
        const dev = [{ ...dk("P", "Plan", "Plan (DEV)", "dropdown", ["A"]), confidential: false }, dk("A", "a", "A", "option")];
        const res = await parseImportedDataKeys({
            localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], mode: "three_way",
            importedScreens: [screenWithField("P", [{ keyId: "A", value: "a", label: "A" }])],
        });
        const plan = res.dataKeys.find(k => k.uniqueKey === "P")!;
        assert.equal(plan.confidential, true, "stays confidential");
        assert.equal(plan.label, "Plan (DEV)", "other changes still apply");
        assert.ok(res.warnings.some(w => w.includes("kept it confidential")));
        const up = await parseImportedDataKeys({
            localDataKeys: [{ ...live[0], confidential: false }, live[1]], importedDataKeys: [{ ...dev[0], confidential: true }, dev[1]], importedScrappedKeys: [], mode: "three_way",
            importedScreens: [screenWithField("P", [{ keyId: "A", value: "a", label: "A" }])],
        });
        assert.equal(up.dataKeys.find(k => k.uniqueKey === "P")!.confidential, true, "can become confidential");
    }

    // ── Only keys the imported script uses are saved ───────────────────────────────────────────────
    {
        const live = [dk("Q", "Other", "Other", "dropdown", ["A"]), dk("A", "a", "A", "option")];
        const dev = [dk("Q", "Other", "Other", "dropdown", ["A", "Z"]), dk("A", "a", "A", "option"), dk("Z", "z", "Z", "option")];
        const res = await parseImportedDataKeys({ localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], importedScreens: [] });
        assert.equal(res.dataKeys.find(k => k.uniqueKey === "Q")!.canSave, false, "a shared key the script does not use is not rewritten");
    }

    // ── New keys: same-content LIVE key is reused; a uniqueKey taken by a deleted key is not reused ───
    {
        const live = [dk("LIVE-P", "Plan", "Plan", "dropdown", [])];
        const dev = [dk("DEV-P", "Plan", "Plan", "dropdown", []), dk("DEV-N", "New", "New", "text")];
        const screen = { ...screenWithField("DEV-P", []), fields: [
            { fieldId: "f1", key: "Plan", label: "Plan", type: "dropdown", keyId: "DEV-P", items: [] },
            { fieldId: "f2", key: "New", label: "New", type: "text", keyId: "DEV-N", items: [] },
        ] };
        const res = await parseImportedDataKeys({
            localDataKeys: live, importedDataKeys: dev, importedScrappedKeys: [], importedScreens: [screen],
            takenUniqueKeys: new Set(["DEV-N"]),
        });
        assert.equal(res.screens[0].fields[0].keyId, "LIVE-P", "exact name/label/type match links to the existing LIVE key");
        const created = res.dataKeys.find(k => k.sourceUniqueKey === "DEV-N")!;
        assert.equal(created.isNew, true);
        assert.notEqual(created.uniqueKey, "DEV-N", "a uniqueKey used by a deleted key here gets a fresh one");
        assert.equal(res.screens[0].fields[1].keyId, created.uniqueKey, "and the screen points at it");
    }

    // ── Rebasing a data-key form save onto the current option list ──────────────────────────────────
    {
        assert.deepEqual(rebaseDataKeyOptions({ incoming: ["b", "a"], base: ["a", "b"], current: ["a", "b"] }), ["b", "a"], "unchanged since load: the edit wins as is (order too)");
        assert.deepEqual(
            rebaseDataKeyOptions({ incoming: ["a", "c"], base: ["a", "b"], current: ["a", "b", "imported"] }),
            ["a", "imported", "c"],
            "someone added an option meanwhile: it survives this user's stale save",
        );
    }

    // ── Search & replace on an option label changes the option, not the question ──────────────────
    {
        const data = toScreenData([
            { field: "field_item_label", fieldIndex: 0, fieldItemIndex: 1, fieldValue: "Old", newValue: "New", exclude: false } as any,
        ]);
        assert.equal(data._fields.length, 0, "the field itself is not patched");
        const fields = applyFieldItemPatches([{ label: "Question", items: [{ label: "x" }, { label: "Old" }] }], data._fieldItems);
        assert.equal(fields[0].label, "Question");
        assert.equal(fields[0].items![1].label, "New");
    }

    // ── Revisions ignore row metadata but see content changes ─────────────────────────────────────
    {
        const a = { screenId: "s", title: "T", fields: [{ items: [{ value: "a" }] }], updatedAt: new Date(1), oldScreenId: null };
        const b = { title: "T", fields: [{ items: [{ value: "a" }] }], screenId: "s", updatedAt: new Date(2), isDraft: true, draftCreatedByUserId: "u" };
        assert.equal(computeEntityRevision(a), computeEntityRevision(b));
        const c = { ...b, fields: [{ items: [{ value: "a" }, { value: "b" }] }] };
        assert.notEqual(computeEntityRevision(a), computeEntityRevision(c));
    }

    // ── An integrity repair touches only the reference it was raised for ──────────────────────────
    {
        const dataKeys = [dk("P", "Plan", "Plan", "dropdown", ["A"]), dk("A", "a", "Alpha", "option")];
        const screen = {
            screenId: "s1", scriptId: "script-1", type: "form", title: "Screen", label: "", refId: "", keyId: "", key: "",
            items: [],
            fields: [
                { fieldId: "f1", key: "Plan", label: "Plan", type: "dropdown", keyId: "P", items: [{ itemId: "i1", value: "a", label: "Old", keyId: "A" }] },
                { fieldId: "f2", key: "Plan", label: "Plan", type: "dropdown", keyId: "P", items: [{ itemId: "i2", value: "a", label: "Old", keyId: "A" }] },
            ],
        } as any;
        const report = scanDataKeyIntegrity({ screens: [screen], dataKeys, onlyIssues: true });
        const entry = report.entries.find(e => e.kind === "field_item" && e.fieldId === "f1");
        assert.ok(entry, `expected an out-of-sync option entry, got: ${JSON.stringify(report.entries.map(e => [e.kind, e.fieldId, e.status]))}`);
        const repairs = repairSingleDataKeyIntegrityReference({ entry: entry!, screens: [screen], dataKeys });
        assert.equal(repairs.ambiguousMatches, 0);
        const repaired = repairs.screens[0] as any;
        assert.ok(repaired, "the reported option is repaired");
        assert.equal(repaired.fields[0].items[0].label, "Alpha", "the reported option gets the key's label");
        assert.equal(repaired.fields[1].items[0].label, "Old", "the other field with the same label is not touched");
    }

    console.log("import option loss fix tests passed");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
