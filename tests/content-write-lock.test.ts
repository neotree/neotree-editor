import assert from "assert";

// the wait limits are read when the module loads: set them first, then load it
process.env.CONTENT_WRITE_WAIT_MS = "200";

type Lock = typeof import("../lib/server/content-write-lock");
type Errors = typeof import("../lib/server/db-errors");
type Jobs = typeof import("../lib/import-jobs");
let ContentWriteBusyError: Lock["ContentWriteBusyError"];
let getContentWriteHolder: Lock["getContentWriteHolder"];
let holdsContentWriteLock: Lock["holdsContentWriteLock"];
let queueContentWrite: Lock["queueContentWrite"];
let withContentWriteLock: Lock["withContentWriteLock"];
let describeDatabaseError: Errors["describeDatabaseError"];
let describeError: Errors["describeError"];
let describeRemoteError: Errors["describeRemoteError"];
let buildImportContentKey: Jobs["buildImportContentKey"];
let buildImportLogicalKey: Jobs["buildImportLogicalKey"];
let IMPORT_JOB_LOST_MESSAGE: Jobs["IMPORT_JOB_LOST_MESSAGE"];
let startOrJoinImportJob: Jobs["startOrJoinImportJob"];

async function load() {
    ({ ContentWriteBusyError, getContentWriteHolder, holdsContentWriteLock, queueContentWrite, withContentWriteLock } = await import("../lib/server/content-write-lock"));
    ({ describeDatabaseError, describeError, describeRemoteError } = await import("../lib/server/db-errors"));
    ({ buildImportContentKey, buildImportLogicalKey, IMPORT_JOB_LOST_MESSAGE, startOrJoinImportJob } = await import("../lib/import-jobs"));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * NEOAPP-1540: two imports (or an import and a data key save, a publish...) wrote the same draft rows at
 * once; the second waited on the first's transaction, then failed. Writers now take turns, wait a bounded
 * time, and every failure says what happened.
 */
async function lockTests() {
    // one writer at a time, in the order they asked
    const order: string[] = [];
    const writer = (name: string, ms: number) => withContentWriteLock({ label: name, maxWaitMs: 5000 }, async () => {
        order.push(`${name}:start`);
        assert.equal(getContentWriteHolder()?.label, name, "the holder is the one running");
        await sleep(ms);
        order.push(`${name}:end`);
    });
    await Promise.all([writer("A", 40), writer("B", 10), writer("C", 10)]);
    assert.deepEqual(order, ["A:start", "A:end", "B:start", "B:end", "C:start", "C:end"], "no overlap, first come first served");
    assert.equal(getContentWriteHolder(), null, "released at the end");

    // re-entrant: an import calling the data key save inside its own turn does not wait on itself
    await withContentWriteLock({ label: "an import", maxWaitMs: 100 }, async () => {
        assert.equal(holdsContentWriteLock(), true);
        const inner = await withContentWriteLock({ label: "a data key save", maxWaitMs: 50 }, async () => "ran");
        assert.equal(inner, "ran");
        assert.equal(await queueContentWrite("a screen save", { userId: null }, async () => "also ran"), "also ran");
    });
    assert.equal(holdsContentWriteLock(), false, "only inside the turn");

    // a bounded wait that names what is running
    let waitedFor = "";
    const long = withContentWriteLock({ label: "an import of “Neotree Admission” by Farai" }, () => sleep(400));
    await sleep(5);
    await assert.rejects(
        withContentWriteLock({ label: "a publish", maxWaitMs: 100, onWait: (h) => { waitedFor = h.label; } }, async () => "never"),
        (e: any) => e instanceof ContentWriteBusyError
            && /an import of “Neotree Admission” by Farai/.test(e.message)
            && /was not saved/.test(e.message),
    );
    assert.equal(waitedFor, "an import of “Neotree Admission” by Farai", "the waiter is told what it waits for");

    // a single save that runs out of time answers like a failed save, it does not throw
    const busy = await queueContentWrite("a screen save", { userId: null }, async () => ({ success: true }));
    assert.equal((busy as any).success, false);
    assert.match((busy as any).errors[0], /Another change is still being saved on this editor: an import of “Neotree Admission”/);

    // the one that gave up left the queue: the next writer still gets its turn after the holder
    const next = withContentWriteLock({ label: "a later save", maxWaitMs: 2000 }, async () => "later");
    await long;
    assert.equal(await next, "later");

    // inside a caller's transaction (client passed) a single save is not queued here
    const slow = withContentWriteLock({ label: "a slow writer" }, () => sleep(200));
    await sleep(5);
    assert.equal(await queueContentWrite("a screen save", { client: {} as any }, async () => "in tx"), "in tx");
    await slow;

    // a writer that fails still releases the lock
    await assert.rejects(withContentWriteLock({ label: "a failing save" }, async () => { throw new Error("boom"); }), /boom/);
    assert.equal(getContentWriteHolder(), null);
    assert.equal(await withContentWriteLock({ label: "after a failure", maxWaitMs: 50 }, async () => 1), 1);
}

function errorTests() {
    // drizzle wraps the database error; the reason is on `cause`
    const drizzle = (cause: any) => Object.assign(new Error('Failed query: insert into "nt_data_keys_drafts" ("id", "uuid") values (default, $1)\nparams: 16f2…'), { cause });
    assert.equal(
        describeDatabaseError(drizzle({ code: "23505", constraint_name: "nt_data_keys_drafts_uuid_unique", table_name: "nt_data_keys_drafts" })),
        "another change saved the same data key at the same time (nt_data_keys_drafts_uuid_unique)",
    );
    assert.equal(describeDatabaseError(drizzle({ code: "55P03" })), "another change kept the data key it needed locked for too long");
    assert.match(describeDatabaseError(drizzle({ code: "40P01" }))!, /collided with another change/);
    assert.match(describeDatabaseError(Object.assign(new Error('Failed query: update "nt_screens_drafts" ...'), { cause: { code: "23503", detail: 'Key (data_key_id)=(x) is not present' } }))!, /refers to a screen that no longer exists/);
    assert.equal(describeDatabaseError(new Error("write CONNECTION_CLOSED localhost:5432")), "the connection to the database was lost");
    assert.equal(describeDatabaseError(new Error("A data key named X already exists")), null, "not a database error");

    // calls to the other editor
    assert.match(describeRemoteError({ code: "ECONNREFUSED" }, "Zim LIVE")!, /Zim LIVE could not be reached/);
    assert.match(describeRemoteError({ code: "ECONNABORTED", message: "timeout of 300000ms exceeded" }, "Zim LIVE")!, /did not answer in time/);
    assert.match(describeRemoteError({ response: { status: 401 } }, "Zim LIVE")!, /refused this editor's API key/);
    assert.match(describeRemoteError({ response: { status: 500, data: { errors: ["boom"] } } }, "Zim LIVE")!, /HTTP 500\): boom/);
    assert.equal(describeRemoteError(new Error("plain")), null);

    assert.equal(describeError(new Error("plain")), "plain");
}

async function jobTests() {
    const params = { userId: "u1", fromRemoteSiteId: "s1", scriptsIds: ["a"], overWriteScriptWithId: "t", overwriteDataKeys: false, dryRun: false };
    assert.notEqual(buildImportContentKey({ ...params, requestKey: "r1" }), buildImportContentKey({ ...params, requestKey: "r2" }));
    assert.equal(buildImportLogicalKey({ ...params, requestKey: "r1" }), buildImportLogicalKey({ ...params, requestKey: "r2" }));

    let runs = 0;
    let finishRun: (v: any) => void = () => {};
    const run = () => { runs++; return new Promise<any>((resolve) => { finishRun = resolve; }); };

    // the same person starting the same import again (closed the dialog, retried) joins the running one
    const first = startOrJoinImportJob({ requestKey: "r1", contentKey: buildImportContentKey({ ...params, requestKey: "r1" }), logicalKey: buildImportLogicalKey(params), run });
    const again = startOrJoinImportJob({ requestKey: "r2", contentKey: buildImportContentKey({ ...params, requestKey: "r2" }), logicalKey: buildImportLogicalKey(params), run });
    assert.equal(first.status, "pending");
    assert.equal(again.status, "pending");
    assert.equal(runs, 1, "one import, not two");

    // a poll for a job this server knows: still running, never started again
    const poll = startOrJoinImportJob({ requestKey: "r2", contentKey: buildImportContentKey({ ...params, requestKey: "r2" }), logicalKey: buildImportLogicalKey(params), resume: true, run });
    assert.equal(poll.status, "pending");
    assert.equal(runs, 1);

    finishRun({ success: true });
    await sleep(5);
    const done = startOrJoinImportJob({ requestKey: "r2", contentKey: buildImportContentKey({ ...params, requestKey: "r2" }), logicalKey: buildImportLogicalKey(params), resume: true, run });
    assert.equal(done.status, "done", "the joined request gets the result");
    assert.deepEqual(done.result, { success: true });

    // a poll for a job this server has no record of (it was restarted): an answer, not a second import
    const lost = startOrJoinImportJob({ requestKey: "r9", contentKey: buildImportContentKey({ ...params, requestKey: "r9" }), logicalKey: buildImportLogicalKey(params), resume: true, run });
    assert.equal(lost.status, "error");
    assert.equal((lost.result as any).errors[0], IMPORT_JOB_LOST_MESSAGE);
    assert.equal(runs, 1);

    // another person's identical import is a separate job (it queues behind the first on the write lock)
    const other = startOrJoinImportJob({ requestKey: "r3", contentKey: buildImportContentKey({ ...params, userId: "u2", requestKey: "r3" }), logicalKey: buildImportLogicalKey({ ...params, userId: "u2" }), run });
    assert.equal(other.status, "pending");
    assert.equal(runs, 2);
    finishRun({ success: true });
}

async function main() {
    await load();
    await lockTests();
    errorTests();
    await jobTests();
    console.log("content write lock tests passed");
    process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
