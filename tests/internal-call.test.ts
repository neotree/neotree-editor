import assert from "assert";

import { isInternalCall, runAsInternalCall, trustedDraftOrigin } from "../lib/server/internal-call";

// A non-editor draftOrigin is only trusted when this server runs the operation itself, or for another
// editor calling with an API key. A browser calling a server action can't claim to be an import.
async function main() {
    assert.equal(isInternalCall(), false);
    assert.equal(trustedDraftOrigin("import"), "editor", "a caller can't claim to be an import");
    assert.equal(trustedDraftOrigin("data_key_sync", { viaApiKey: false }), "editor");
    assert.equal(trustedDraftOrigin("import", { viaApiKey: true }), "import", "another editor (API key) is trusted");
    assert.equal(trustedDraftOrigin("editor"), "editor");
    assert.equal(trustedDraftOrigin(undefined), undefined);

    await runAsInternalCall(async () => {
        await Promise.resolve();
        assert.equal(isInternalCall(), true);
        assert.equal(trustedDraftOrigin("import"), "import", "inside an import run by this server");
        // survives awaits and timers
        await new Promise((resolve) => setTimeout(resolve, 5));
        assert.equal(trustedDraftOrigin("data_key_sync"), "data_key_sync");
    });
    assert.equal(isInternalCall(), false, "only for the duration of the call");

    console.log("internal call tests passed");
}

main().catch((e) => { console.error(e); process.exit(1); });
