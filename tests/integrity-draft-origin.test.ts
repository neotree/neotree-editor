import assert from "assert"

import {
  getStableIntegrityDraftValue,
  isAutoSyncDraftOrigin,
  isLegacyAutoSyncDraft,
} from "../lib/integrity-draft-origin"

const previewEntity = {
  screenId: "screen-1",
  title: "Presenting complaint",
  fields: [
    { keyId: "dk-1", label: "Field A", items: [{ keyId: "opt-1", label: "Option A" }] },
  ],
  items: [],
}

const sameShapeDifferentOrder = {
  items: [],
  title: "Presenting complaint",
  fields: [
    { label: "Field A", items: [{ label: "Option A", keyId: "opt-1" }], keyId: "dk-1" },
  ],
  screenId: "screen-1",
}

assert.equal(
  getStableIntegrityDraftValue(previewEntity),
  getStableIntegrityDraftValue(sameShapeDifferentOrder),
  "stable draft comparison should ignore object key ordering"
)

assert.equal(isAutoSyncDraftOrigin("data_key_sync"), true)
assert.equal(isAutoSyncDraftOrigin("editor"), false)
assert.equal(isAutoSyncDraftOrigin("import"), false)
assert.equal(isAutoSyncDraftOrigin("other"), false)

assert.equal(
  isLegacyAutoSyncDraft({
    draftOrigin: "data_key_sync",
    data: previewEntity,
  }),
  true,
  "explicit data_key_sync drafts should always be treated as auto-sync"
)

assert.equal(
  isLegacyAutoSyncDraft({
    draftOrigin: "editor",
    data: sameShapeDifferentOrder,
  }, previewEntity),
  true,
  "legacy editor-tagged propagated drafts should be recognized from normalized preview equality"
)

assert.equal(
  isLegacyAutoSyncDraft({
    draftOrigin: "editor",
    data: {
      ...previewEntity,
      title: "User changed this screen title",
    },
  }, previewEntity),
  false,
  "real user edits must not be reclassified as auto-sync drafts"
)

assert.equal(
  isLegacyAutoSyncDraft({
    draftOrigin: "import",
    data: previewEntity,
  }, previewEntity),
  false,
  "import drafts should not be ignored by integrity policy unless explicitly supported"
)

assert.equal(
  isLegacyAutoSyncDraft({
    draftOrigin: "editor",
    data: sameShapeDifferentOrder,
  }, undefined, {
    publishedEntity: previewEntity,
    isAffectedByCurrentDataKeyChange: true,
  }),
  true,
  "legacy editor-tagged propagated drafts should also be recognized when a data key change only affects validity and the draft still matches published state"
)

console.log("integrity draft origin tests passed")
