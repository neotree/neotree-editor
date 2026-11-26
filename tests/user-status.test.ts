import assert from "assert";
import { DEACTIVATED_ACCOUNT_MESSAGE, isUserDeactivated } from "../lib/user-status";

assert.equal(isUserDeactivated(null), false);
assert.equal(isUserDeactivated(undefined), false);
assert.equal(isUserDeactivated({}), false);
assert.equal(isUserDeactivated({ deactivatedAt: null }), false);
assert.equal(isUserDeactivated({ deactivatedAt: new Date() }), true);
assert.equal(isUserDeactivated({ deactivatedAt: "2026-11-26T10:00:00Z" }), true);
assert.ok(DEACTIVATED_ACCOUNT_MESSAGE.length > 0);
console.log("user-status OK");
