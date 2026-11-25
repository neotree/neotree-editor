import assert from "assert";

import {
    TABLE_SCREEN_TYPE,
    canScreenBeTable,
    getDisplayedScreenType,
    getTableColumnHeading,
    isTableScreen,
    normalizeScreenTableConfig,
    tableCollectionName,
    tableLegacyCollectionLabel,
    validateTableCollectionName,
    validateScreenTable,
    validateScreenTableConfig,
} from "../lib/screen-table-config";
import {
    getFractionLabels,
    getFractionStorageKeys,
    isFractionDataType,
    validateFractionDataKey,
    validateFractionStorageKeyClashes,
} from "../lib/fraction-data-keys";
import { toConditionKeys, validateCondition } from "../lib/conditional-expression";
import { syncFieldReference } from "../databases/mutations/data-keys/_update_data_keys_refs.helpers";
import { dataKeyTypes, screenTypePickerOptions, screenTypes } from "../constants";
import { FieldTypes } from "../constants/fields";
import { computeScriptFingerprint } from "../lib/content-sync-fingerprint";
import { dataKeyTypeFamily, normalizeDataKeyCompatibilityType } from "../lib/data-key-types";
import { scrapDataKeys } from "../lib/data-keys";
import { scanDataKeyIntegrity } from "../lib/data-key-integrity";
import { mapNewScreenToOld } from "../lib/map-old-and-new";

/**
 * NEOAPP-1575: a table is a repeatable form shown as a grid (fields = columns, collection
 * entries = rows), and a fraction is a data key type carrying the labels of its two numbers.
 */

(async () => {
    let n = 0;
    const makeRowId = () => `row-${++n}`;

    // ── Only a repeatable form can be a table ────────────────────────────────────────────────

    assert.equal(canScreenBeTable({ type: "form", repeatable: true }), true);
    assert.equal(canScreenBeTable({ type: "form", repeatable: false }), false);
    assert.equal(canScreenBeTable({ type: "checklist", repeatable: true }), false);

    const tableConfig = { title: " Previous pregnancies ", rowMode: "dynamic" as const, rowsHeading: "x", rows: [{ rowId: "", label: "x" }], minRows: 1, maxRows: 10 };

    assert.equal(normalizeScreenTableConfig({ type: "form", repeatable: false, tableConfig }, makeRowId), null, "not repeatable: not a table");
    assert.equal(normalizeScreenTableConfig({ type: "form", repeatable: true, tableConfig: null }, makeRowId), null, "switched off");

    // ── Stored settings: trimmed, and without the other row mode's leftovers ──────────────────

    assert.deepEqual(
        normalizeScreenTableConfig({ type: "form", repeatable: true, tableConfig }, makeRowId),
        { title: "Previous pregnancies", rowMode: "dynamic", rowsHeading: "", rows: [], minRows: 1, maxRows: 10 },
        "dynamic rows keep the limits and drop the fixed-row settings",
    );

    const fixed = normalizeScreenTableConfig({
        type: "form",
        repeatable: true,
        tableConfig: {
            title: "Antenatal visits",
            rowMode: "fixed",
            rowsHeading: " Visit ",
            rows: [{ rowId: "kept", label: " First " }, { rowId: "", label: "Second" }],
            minRows: 2,
            maxRows: 3,
        },
    }, makeRowId);
    assert.deepEqual(fixed, {
        title: "Antenatal visits",
        rowMode: "fixed",
        rowsHeading: "Visit",
        rows: [{ rowId: "kept", label: "First" }, { rowId: "row-1", label: "Second" }],
        minRows: null,
        maxRows: null,
    }, "fixed rows keep their ids, get one when missing, and drop the limits");

    // ── Validation ───────────────────────────────────────────────────────────────────────────

    assert.deepEqual(validateScreenTableConfig(null), [], "no table, nothing to check");
    assert.deepEqual(validateScreenTableConfig(fixed), []);
    assert.equal(validateScreenTableConfig({ ...fixed!, rows: [] }).length, 1, "fixed rows need at least one row");
    assert.match(
        validateScreenTableConfig({ ...fixed!, rows: [{ rowId: "a", label: "First" }, { rowId: "b", label: "first" }] })[0],
        /must be different/,
        "row headings are compared without case",
    );
    assert.match(validateScreenTableConfig({ ...fixed!, rows: [{ rowId: "a", label: "" }] })[0], /needs a heading/);

    const dynamic = { title: "Previous pregnancies", rowMode: "dynamic" as const, rowsHeading: "", rows: [], minRows: null, maxRows: null };
    assert.match(validateScreenTableConfig({ ...dynamic, title: " " })[0], /give the table a name/, "a table must be named");
    assert.deepEqual(validateScreenTableConfig(dynamic), [], "limits are optional");
    assert.match(validateScreenTableConfig({ ...dynamic, minRows: 5, maxRows: 2 })[0], /cannot be greater/);
    assert.match(validateScreenTableConfig({ ...dynamic, maxRows: 0 })[0], /at least 1/);
    assert.match(validateScreenTableConfig({ ...dynamic, minRows: 1.5 })[0], /whole number/);
    assert.match(validateScreenTableConfig({ ...dynamic, maxRows: NaN })[0], /whole number/);
    assert.match(
        validateScreenTable({ type: "form", repeatable: true, tableConfig: { ...fixed!, rows: [] } }, "History")[0],
        /^Screen "History" table:/,
        "save errors name the screen",
    );

    // ── "Table" is a way of creating and showing a form, never a stored type ──────────────────

    const tableScreen = { type: "form", repeatable: true, tableConfig: dynamic };
    assert.equal(isTableScreen(tableScreen), true);
    assert.equal(isTableScreen({ ...tableScreen, tableConfig: null }), false, "a repeatable form without table settings is a form");
    assert.equal(isTableScreen({ ...tableScreen, repeatable: false }), false);
    assert.equal(isTableScreen(null), false);
    assert.equal(getDisplayedScreenType(tableScreen), TABLE_SCREEN_TYPE);
    assert.equal(getDisplayedScreenType({ ...tableScreen, tableConfig: null }), "form");
    assert.equal(getDisplayedScreenType({ type: "checklist" }), "checklist");
    assert.equal(screenTypes.some(t => `${t.value}` === TABLE_SCREEN_TYPE), false, "table is not a stored screen type");
    assert.deepEqual(
        screenTypePickerOptions.map(t => t.value).slice(screenTypePickerOptions.findIndex(t => t.value === "form")).slice(0, 2),
        ["form", TABLE_SCREEN_TYPE],
        "the picker offers Table next to Form",
    );

    // ── The collection is named after the table, and unique within the script ────────────────

    assert.equal(tableCollectionName("  Previous   pregnancies "), "Previous pregnancies");
    assert.equal(tableCollectionName(null), "");
    assert.deepEqual(validateTableCollectionName("Previous pregnancies", ["Medication", "", null]), []);
    assert.match(validateTableCollectionName("", [])[0], /give the table a name/);
    assert.match(
        validateTableCollectionName("previous  pregnancies", ["Previous pregnancies"])[0],
        /already stores its rows as/,
        "compared without case or extra spaces",
    );

    // ── Column headings: the field's own heading, else its label ─────────────────────────────

    assert.equal(getTableColumnHeading({ tableHeading: " Year ", label: "Year of previous delivery", key: "PrevYear" }), "Year");
    assert.equal(getTableColumnHeading({ tableHeading: "", label: "Year of previous delivery", key: "PrevYear" }), "Year of previous delivery");
    assert.equal(getTableColumnHeading({ label: "", key: "PrevYear" }), "PrevYear");
    assert.equal(getTableColumnHeading(null), "");

    // ── Fraction: a data key type that carries the labels of its two numbers ─────────────────

    assert.equal(dataKeyTypes.some(t => t.value === "fraction" && !t.hasChildren), true, "fraction is a data key type without options");
    assert.equal(FieldTypes.some(t => t.name === "fraction"), true, "and a field type");
    assert.equal(dataKeyTypeFamily("fraction"), "fraction", "the key picker offers only fraction keys to a fraction field");
    assert.equal(normalizeDataKeyCompatibilityType("fraction"), "fraction", "a number key is not a fraction key");

    const bpKey = {
        uuid: "u-bp",
        uniqueKey: "dk-bp",
        name: "BP",
        label: "Blood pressure",
        dataType: "fraction",
        options: [],
        confidential: false,
        confidentialLabelOnly: false,
        metadata: { numeratorLabel: " Systolic ", denominatorLabel: "Diastolic" },
    };

    assert.equal(isFractionDataType("Fraction "), true);
    assert.equal(isFractionDataType("number"), false);
    assert.deepEqual(getFractionLabels(bpKey.metadata), { numeratorLabel: "Systolic", denominatorLabel: "Diastolic" });
    assert.deepEqual(getFractionLabels(null), { numeratorLabel: "", denominatorLabel: "" });

    assert.deepEqual(validateFractionDataKey(bpKey), []);
    assert.deepEqual(validateFractionDataKey({ name: "Weight", dataType: "number", metadata: {} }), [], "only fraction keys are checked");
    assert.equal(validateFractionDataKey({ name: "BP", dataType: "fraction", metadata: {} }).length, 2, "both labels are required");
    assert.match(validateFractionDataKey({ name: "BP", dataType: "fraction", metadata: { numeratorLabel: "Systolic" } })[0], /needs a denominator label/);
    assert.match(
        validateFractionDataKey({ name: "BP", dataType: "fraction", metadata: { numeratorLabel: "Value", denominatorLabel: "value" } })[0],
        /different numerator and denominator labels/,
    );

    // A field follows its fraction key's labels; fields of other keys gain nothing.
    const bpField = { fieldId: "f-bp", type: "fraction", key: "BP", keyId: "dk-bp", label: "Blood pressure", numeratorLabel: "Old", denominatorLabel: "" };
    const syncedBp = syncFieldReference(bpField as any, bpKey as any);
    assert.equal(syncedBp.changed, true);
    assert.equal(syncedBp.value.numeratorLabel, "Systolic", "a relabelled key relabels its fields");
    assert.equal(syncedBp.value.denominatorLabel, "Diastolic");
    assert.equal(syncFieldReference(syncedBp.value, bpKey as any).changed, false, "an up to date field is left alone");

    const weightKey = { ...bpKey, uuid: "u-w", uniqueKey: "dk-weight", name: "Weight", label: "Weight", dataType: "number", metadata: {} };
    const weightField = { fieldId: "f-w", type: "number", key: "Weight", keyId: "dk-weight", label: "Weight", confidential: false, confidentialLabelOnly: false, optional: false };
    const syncedWeight = syncFieldReference(weightField as any, weightKey as any);
    assert.equal(syncedWeight.changed, false, "syncing a non-fraction field does not touch it");
    assert.equal("numeratorLabel" in syncedWeight.value, false);

    // One key per fraction field: scraped and checked like any other field key.
    const screen = {
        scriptId: "script-1",
        screenId: "screen-1",
        type: "form",
        title: "Vitals",
        key: "",
        keyId: "",
        label: "",
        items: [],
        fields: [syncedBp.value, weightField],
    };

    const scrapped = await scrapDataKeys({ screens: [screen] as any, dataKeys: [], linkScrappedToDataKeys: false });
    assert.equal(new Map(scrapped.map(k => [k.name, k.dataType])).get("BP"), "fraction", "a fraction field is scraped as a fraction key");

    const healthy = scanDataKeyIntegrity({ screens: [screen] as any, dataKeys: [bpKey, weightKey] as any, onlyIssues: true });
    assert.equal(healthy.entries.length, 0, "a fraction field on a fraction key is healthy");

    const wrongType = scanDataKeyIntegrity({
        screens: [screen] as any,
        dataKeys: [{ ...bpKey, dataType: "number" }, weightKey] as any,
        onlyIssues: true,
    });
    assert.equal(
        wrongType.entries.some(e => e.kind === "field" && e.status === "conflict"),
        true,
        "a fraction field on a number key is reported",
    );

    // ── A captured fraction is stored as two numbers, each under a key of its own ─────────────

    assert.deepEqual(getFractionStorageKeys("BP"), { numeratorKey: "BP_numerator", denominatorKey: "BP_denominator" });
    assert.deepEqual(getFractionStorageKeys(" BP "), getFractionStorageKeys("BP"), "names are trimmed");

    assert.deepEqual(validateFractionStorageKeyClashes(bpKey, [weightKey]), [], "no clash");
    assert.match(
        validateFractionStorageKeyClashes(bpKey, [{ name: "bp_numerator", dataType: "number" }])[0],
        /stores a number under "BP_numerator"/,
        "a fraction key cannot store into a key that already exists (any casing)",
    );
    assert.match(
        validateFractionStorageKeyClashes({ name: "BP_denominator", dataType: "number" }, [bpKey])[0],
        /fraction data key "BP" stores one of its numbers/,
        "a new key cannot take a fraction's storage name",
    );
    assert.deepEqual(
        validateFractionStorageKeyClashes({ name: "BP_numerator", dataType: "number" }, [{ ...bpKey, dataType: "number" }]),
        [],
        "only fraction keys reserve storage names",
    );
    assert.deepEqual(validateFractionStorageKeyClashes(bpKey, [bpKey]), [], "a key never clashes with itself");

    // Conditions compare the stored numbers, never the fraction key itself.
    const conditionKeys = toConditionKeys([bpKey, weightKey]);
    const numerator = conditionKeys.find(k => k.name === "BP_numerator");
    assert.equal(numerator?.dataType, "number", "the numerator is offered to conditions as a number key");
    assert.match(`${numerator?.label}`, /Systolic/, "labelled with the key's numerator label");
    assert.equal(conditionKeys.find(k => k.name === "BP_denominator")?.dataType, "number");
    assert.equal(conditionKeys.filter(k => /_numerator$/.test(k.name)).length, 1, "only fraction keys add storage keys");
    assert.equal(
        toConditionKeys([bpKey, { name: "BP_numerator", dataType: "text" }]).filter(k => k.name === "BP_numerator").length,
        1,
        "a real data key with the same name wins",
    );

    const conditionErrors = (input: string) =>
        validateCondition(input, { keys: conditionKeys }).diagnostics.filter(d => d.severity === "error");
    assert.deepEqual(conditionErrors("$BP_numerator > 140 or $BP_denominator > 90"), [], "the stored numbers can be compared");
    const onFraction = conditionErrors("$BP > 140");
    assert.equal(onFraction[0]?.code, "FRACTION_COMPARISON", "comparing the fraction key itself is an error");
    assert.equal(onFraction[0]?.suggestion, "$BP_numerator");

    // ── Content sync: unset table settings and row ids are not differences ───────────────────

    const script = { scriptId: "s", title: "A" };
    const base = { screenId: "a", type: "form", title: "T", position: 1, repeatable: true, fields: [], items: [] };
    const fp = computeScriptFingerprint({ script, screens: [base] });

    assert.equal(fp, computeScriptFingerprint({ script, screens: [{ ...base, tableConfig: null }] }), "an unset table is not content");
    assert.equal(
        computeScriptFingerprint({ script, screens: [{ ...base, tableConfig: { ...fixed!, rows: [{ rowId: "x", label: "First" }] } }] }),
        computeScriptFingerprint({ script, screens: [{ ...base, tableConfig: { ...fixed!, rows: [{ rowId: "y", label: "First" }] } }] }),
        "row ids differ between editors and are not compared",
    );
    assert.notEqual(
        fp,
        computeScriptFingerprint({ script, screens: [{ ...base, tableConfig: fixed }] }),
        "table settings are content",
    );

    // ── Sent to the app with the screen ──────────────────────────────────────────────────────

    const row = { ...base, id: 1, repeatable: true, tableConfig: fixed, collectionName: "visits", collectionLabel: "" } as any;
    assert.deepEqual(mapNewScreenToOld(row).data.metadata.tableConfig, fixed, "the app receives the table settings");
    assert.equal(
        mapNewScreenToOld({ ...row, repeatable: false }).data.metadata.tableConfig,
        null,
        "a screen that is no longer repeatable is never sent as a table",
    );

    // ── Older apps: a table names its entries after a column ─────────────────────────────────
    assert.equal(tableLegacyCollectionLabel([
        { key: "BP", type: "fraction" },
        { key: "Note", type: "text", optional: true },
        { key: "Age", type: "number" },
    ]), "Age", "the first required column, never a fraction");
    assert.equal(tableLegacyCollectionLabel([{ key: "Note", type: "text", optional: true }]), "Note", "else the first column");
    assert.equal(tableLegacyCollectionLabel([{ key: "BP", type: "fraction" }]), "", "no usable column");
    assert.equal(tableLegacyCollectionLabel(null), "");
    assert.equal(
        mapNewScreenToOld({ ...row, collectionLabel: "", fields: [{ key: "Age", type: "number" }] }).data.metadata.collectionLabel,
        "Age",
        "a table saved without a collection label still gets one on the app",
    );
    assert.equal(
        mapNewScreenToOld({ ...row, collectionLabel: "Visit", fields: [{ key: "Age", type: "number" }] }).data.metadata.collectionLabel,
        "Visit",
        "a set collection label is kept",
    );

    console.log("screen-table-config: ok");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
