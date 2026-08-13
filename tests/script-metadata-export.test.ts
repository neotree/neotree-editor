import assert from "assert";

import { buildScriptScreenMetadataRows } from "../lib/scripts/metadata-export";

const script = {
    scriptId: "script-1",
    title: "Admission",
    hospitalName: "Test Hospital",
    diagnoses: [],
    problems: [],
    screens: [
        {
            screenId: "screen-1",
            type: "form",
            title: "Patient details",
            ref: "patient-details",
            fields: [
                {
                    key: "Sex",
                    label: "Sex",
                    type: "dropdown",
                    dataType: "dropdown",
                    optional: false,
                    confidential: false,
                    options: [
                        { value: "M", valueLabel: "Male" },
                        {
                            value: "F",
                            valueLabel: "Female",
                            disabledOtherOptionsIfSelected: true,
                            forbidWIth: ["U"],
                        },
                    ],
                },
                {
                    key: "BirthWeight",
                    label: "Birth weight",
                    type: "number",
                    dataType: "number",
                    value: 0,
                    valueLabel: "Zero",
                    optional: true,
                    confidential: false,
                },
            ],
        },
    ],
} as any;

const rows = buildScriptScreenMetadataRows(script);

assert.equal(rows.length, 3, "each selectable option gets its own row");
assert.deepEqual(
    rows.slice(0, 2).map((row) => [row.Value, row["Value Label"]]),
    [["M", "Male"], ["F", "Female"]],
    "option values and labels populate their dedicated columns",
);
assert.ok(rows[0]["Field Options"].includes('"value":"M"'), "the full options JSON remains available");
assert.equal(rows[1]["Disable other options if selected"], "Yes", "option exclusivity is exported");
assert.equal(rows[1]["Forbid With"], "U", "option incompatibilities are exported");
assert.equal(rows[2].Value, "0", "valid falsy scalar values are not blanked");
assert.equal(rows[2]["Value Label"], "Zero");

console.log("script metadata export tests passed");
