import assert from "assert";

import {
    rebuildFieldItemsFromDataKeyOptions,
    rebuildScreenItemsFromDataKeyOptions,
} from "../databases/mutations/data-keys/_update_data_keys_refs.helpers";

const optionA = {
    uniqueKey: "option-a",
    name: "alpha",
    label: "Alpha",
    confidential: true,
    dataType: "option",
};

const optionB = {
    uniqueKey: "option-b",
    name: "beta",
    label: "Beta",
    confidential: false,
    dataType: "option",
};

const optionC = {
    uniqueKey: "option-c",
    name: "gamma",
    label: "Gamma",
    confidential: true,
    dataType: "option",
};

const rebuiltFieldItems = rebuildFieldItemsFromDataKeyOptions({
    currentItems: [
        {
            itemId: "field-item-b",
            keyId: "option-b",
            value: "old-beta",
            label: "Old Beta",
            exclusive: true,
        },
        {
            itemId: "field-item-a",
            keyId: "option-a",
            value: "old-alpha",
            label: "Old Alpha",
            enterValueManually: true,
        },
    ],
    optionDataKeys: [optionB, optionC, optionA],
});

assert.deepEqual(
    rebuiltFieldItems.map((item) => ({
        keyId: item.keyId,
        value: item.value,
        label: item.label,
    })),
    [
        { keyId: "option-b", value: "beta", label: "Beta" },
        { keyId: "option-c", value: "gamma", label: "Gamma" },
        { keyId: "option-a", value: "alpha", label: "Alpha" },
    ],
    "field items should be rebuilt in the parent data-key option order",
);
assert.equal(rebuiltFieldItems[0].itemId, "field-item-b", "existing field item ids should be preserved");
assert.equal(rebuiltFieldItems[0].exclusive, true, "existing field item settings should be preserved");
assert.equal(rebuiltFieldItems[1].itemId ? true : false, true, "new field items should receive an item id");
assert.equal(rebuiltFieldItems[2].enterValueManually, true, "existing field item flags should survive reorder");

const rebuiltScreenItems = rebuildScreenItemsFromDataKeyOptions({
    screenType: "single_select",
    currentItems: [
        {
            itemId: "screen-item-b",
            keyId: "option-b",
            id: "old-beta",
            key: "old-beta",
            label: "Old Beta",
            exclusive: true,
            checked: true,
            score: 7,
            printDisplayColumns: 1,
        },
    ],
    optionDataKeys: [optionB, optionA],
});

assert.deepEqual(
    rebuiltScreenItems.map((item) => ({
        keyId: item.keyId,
        id: item.id,
        key: item.key,
        label: item.label,
        position: item.position,
    })),
    [
        { keyId: "option-b", id: "beta", key: "beta", label: "Beta", position: 1 },
        { keyId: "option-a", id: "alpha", key: "alpha", label: "Alpha", position: 2 },
    ],
    "screen items should be rebuilt from parent options and re-positioned",
);
assert.equal(rebuiltScreenItems[0].itemId, "screen-item-b", "existing screen item ids should be preserved");
assert.equal(rebuiltScreenItems[0].exclusive, true, "existing screen item flags should be preserved");
assert.equal(rebuiltScreenItems[0].checked, true, "existing screen item checked state should be preserved");
assert.equal(rebuiltScreenItems[0].score, 7, "existing screen item score should be preserved");
assert.equal(rebuiltScreenItems[1].dataType, "id", "new single-select screen items should infer the screen data type");
assert.equal(rebuiltScreenItems[1].confidential, true, "new screen items should inherit child data-key confidentiality");

console.log("data key option sync helper test passed");
