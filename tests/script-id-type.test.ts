import assert from "assert";
import { DEFAULT_SCRIPT_ID_TYPE, SCRIPT_ID_TYPES, SCRIPT_ID_TYPE_OPTIONS, normaliseScriptIdType } from "../lib/script-id-type";
import { mapNewScriptToOld } from "../lib/map-old-and-new";

assert.deepEqual([...SCRIPT_ID_TYPES], ["nuid", "muid"]);
assert.equal(DEFAULT_SCRIPT_ID_TYPE, "nuid", "scripts keep today's IDs unless someone chooses MUID");
assert.equal(normaliseScriptIdType("muid"), "muid");
assert.equal(normaliseScriptIdType("nuid"), "nuid");
for (const bad of [undefined, null, "", "MUID", "uid", 1, {}, "muid "]) assert.equal(normaliseScriptIdType(bad), "nuid", `bad value falls back: ${JSON.stringify(bad)}`);
assert.deepEqual(SCRIPT_ID_TYPE_OPTIONS.map((o) => o.value), [...SCRIPT_ID_TYPES], "one dropdown option per type");

// The app receives the type with the script; an old row without one is a NUID script
const base = { id: 1, scriptId: "s", oldScriptId: null, position: 1, title: "T", printTitle: "", description: "", type: "admission", exportable: true, hospitalId: null, nuidSearchEnabled: false, nuidSearchFields: [], eligibilityCriteria: null, reviewable: false, reviewConfigurations: [], preferences: {}, printSections: [], printConfig: {}, createdAt: new Date(), updatedAt: new Date(), deletedAt: null } as any;
assert.equal(mapNewScriptToOld({ ...base, idType: "muid" }).data.idType, "muid");
assert.equal(mapNewScriptToOld({ ...base, idType: "nuid" }).data.idType, "nuid");
assert.equal(mapNewScriptToOld(base).data.idType, "nuid");
assert.equal(mapNewScriptToOld({ ...base, idType: "weird" }).data.idType, "nuid");
console.log("script-id-type: all assertions passed");
