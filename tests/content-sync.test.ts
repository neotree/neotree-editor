import assert from "assert";

import {
    computeContentSyncPairs,
    diffScriptEntities,
    getContentLockReason,
    isOutOfSync,
    normalizeContentSyncSettings,
    type ContentSyncState,
} from "../lib/content-sync";
import { computeEntityFingerprints, computeScriptFingerprint } from "../lib/content-sync-fingerprint";

// ── Settings ─────────────────────────────────────────────────────────────────────────────────────
{
    const off = normalizeContentSyncSettings(null);
    assert.equal(off.role, "off", "no settings = off (today's behaviour)");
    const target = normalizeContentSyncSettings({ role: "target", linkedSiteId: " site-1 ", lock: { scripts: true } as any });
    assert.equal(target.linkedSiteId, "site-1");
    assert.equal(target.lock.dataKeys, true, "missing values fall back to the defaults");
    assert.equal(normalizeContentSyncSettings({ role: "bogus" as any }).role, "off");
}

// ── Editing lock ─────────────────────────────────────────────────────────────────────────────────
{
    const target = normalizeContentSyncSettings({ role: "target", linkedSiteId: "s" });
    assert.equal(getContentLockReason({ settings: normalizeContentSyncSettings(null), area: "scripts", scriptIds: ["a"] }), null, "off: never locked");
    assert.equal(getContentLockReason({ settings: normalizeContentSyncSettings({ role: "source", linkedSiteId: "s" }), area: "scripts" }), null, "source: never locked");
    assert.ok(getContentLockReason({ settings: target, area: "scripts", scriptIds: ["a"] }), "target: scripts locked");
    assert.ok(getContentLockReason({ settings: target, area: "scripts", scriptIds: [] }), "target: creating a script is locked");
    assert.equal(getContentLockReason({ settings: target, area: "scripts", scriptIds: ["a"], hotfixes: [{ scriptId: "a" }] }), null, "an open hotfix unlocks that script");
    assert.ok(getContentLockReason({ settings: target, area: "scripts", scriptIds: ["a", "b"], hotfixes: [{ scriptId: "a" }] }), "but not other scripts in the same change");
    assert.ok(getContentLockReason({ settings: target, area: "dataKeys", hotfixes: [{ scriptId: "a" }], userRole: "user" }), "library edits during a hotfix need an admin");
    assert.equal(getContentLockReason({ settings: target, area: "dataKeys", hotfixes: [{ scriptId: "a" }], userRole: "admin" }), null);
    assert.ok(getContentLockReason({ settings: target, area: "dataKeys", userRole: "super_user" }), "no hotfix open: data keys locked even for super users");
    const noLibLock = normalizeContentSyncSettings({ role: "target", linkedSiteId: "s", lock: { scripts: true, dataKeys: false, drugsLibrary: false } });
    assert.equal(getContentLockReason({ settings: noLibLock, area: "dataKeys" }), null, "each area can be left unlocked");
    const noHotfixes = normalizeContentSyncSettings({ role: "target", linkedSiteId: "s", hotfixes: { enabled: false, allowLibraryEdits: true } });
    assert.ok(getContentLockReason({ settings: noHotfixes, area: "scripts", scriptIds: ["a"], hotfixes: [{ scriptId: "a" }] }), "hotfixes can be turned off");
}

// ── Fingerprints (comparable between editors) ───────────────────────────────────────────────────
{
    const script = { scriptId: "s", title: "T", hospitalId: "h-dev", conditionErrorReport: { x: 1 }, updatedAt: new Date(), printSections: [{ sectionId: "p1", screensIds: ["a"] }] };
    const screens = [
        { screenId: "b", position: 20, title: "B", skipToScreenId: "a" },
        { screenId: "a", position: 10, title: "A", image1: { fileId: "f", data: "http://dev/f" }, items: [{ itemId: "i1", id: "x" }, { itemId: "i2", id: "y", forbidWith: ["i1"] }] },
    ];
    const fp = computeScriptFingerprint({ script, screens });
    // the same content on the other editor: other ids, hospital, positions, caches and file URLs
    const sameElsewhere = computeScriptFingerprint({
        script: { scriptId: "s2", title: "T", hospitalId: "h-live", updatedAt: new Date(0), printSections: [{ sectionId: "p9", screensIds: ["A2"] }] },
        screens: [
            { screenId: "A2", position: 500, title: "A", image1: { fileId: "f", data: "http://live/f" }, items: [{ itemId: "j1", id: "x" }, { itemId: "j2", id: "y", forbidWith: ["j1"] }] },
            { screenId: "B2", position: 501, title: "B", skipToScreenId: "A2" },
        ],
    });
    assert.equal(fp, sameElsewhere, "ids, hospital, caches, positions and file URLs do not count; references are compared by position");
    assert.notEqual(fp, computeScriptFingerprint({ script, screens: [screens[1], { ...screens[0], position: 5 }] }), "order counts");
    assert.notEqual(fp, computeScriptFingerprint({ script, screens: [{ ...screens[0], title: "B2" }, screens[1]] }), "content counts");
    assert.notEqual(fp, computeScriptFingerprint({ script, screens: [{ ...screens[0], skipToScreenId: null }, screens[1]] }), "skip-to target counts");
    // defaults filled in by a save (empty lists, false flags) are not differences
    const withDefaults = computeScriptFingerprint({ script, screens: [screens[0], { ...screens[1], items: [{ itemId: "i1", id: "x", forbidWith: [], exclusive: false }, { itemId: "i2", id: "y", forbidWith: ["i1"] }] }] });
    assert.equal(fp, withDefaults, "forbidWith: [] and false flags read as not set");
}

// ── Status ───────────────────────────────────────────────────────────────────────────────────────
const state = (role: ContentSyncState["role"], scripts: [string, string, string][], records: ContentSyncState["records"] = [], hotfixes: ContentSyncState["hotfixes"] = []): ContentSyncState => ({
    role,
    scripts: scripts.map(([scriptId, title, fingerprint]) => ({ scriptId, title, fingerprint, hasDrafts: false })),
    records,
    hotfixes,
});
const at = (minutes: number) => new Date(Date.UTC(2026, 9, 21, 10, minutes)).toISOString();
const rec = (targetScriptId: string, sourceScriptId: string, sourceFingerprint: string, targetFingerprint: string, minutes = 1, pending = false) =>
    ({ targetScriptId, sourceScriptId, sourceFingerprint, targetFingerprint, syncedAt: at(minutes), pending });
const pairOf = (pairs: ReturnType<typeof computeContentSyncPairs>, title: string) => pairs.find(p => (p.sourceTitle || p.targetTitle) === title)!;

{
    const source = state("source", [["d1", "Admission", "v2"], ["d2", "Discharge", "x"], ["d3", "New on DEV", "n"], ["d4", "Hotfixed", "h1"], ["d5", "Both", "b2"], ["d6", "Kept", "k1"]]);
    const target = state("target", [["l1", "Admission", "v1"], ["l2", "Discharge", "x"], ["l4", "Hotfixed", "h2"], ["l5", "Both", "b3"], ["l6", "Kept", "k2"], ["l9", "LIVE only", "z"]], [
        rec("l1", "d1", "v1", "v1"),
        rec("l2", "d2", "x", "x"),
        rec("l4", "d4", "h1", "h1"),
        rec("l5", "d5", "b1", "b1"),
        // the import kept options only LIVE had: right after it, LIVE already differed from DEV
        rec("l6", "d6", "k1", "k2"),
    ], [{ scriptId: "l4", reason: "dose fix" }]);
    const pairs = computeContentSyncPairs({ source, target });

    assert.equal(pairOf(pairs, "Admission").status, "source_ahead", "DEV published since the import");
    assert.equal(pairOf(pairs, "Discharge").status, "in_sync", "same content on both");
    assert.equal(pairOf(pairs, "New on DEV").status, "only_on_source");
    assert.equal(pairOf(pairs, "Hotfixed").status, "target_ahead", "LIVE changed since the import");
    assert.equal(pairOf(pairs, "Hotfixed").hotfix?.reason, "dose fix");
    assert.equal(pairOf(pairs, "Both").status, "diverged");
    assert.equal(pairOf(pairs, "Kept").status, "target_ahead", "content LIVE kept for itself is drift, on LIVE's side");
    assert.equal(pairOf(pairs, "LIVE only").status, "only_on_target");
    assert.equal(pairs[0].status, "diverged", "most urgent first");
    assert.ok(isOutOfSync("target_ahead") && !isOutOfSync("in_sync"));
}

// Back-ports (DEV imported from LIVE) are newer sync points than LIVE's import.
{
    const target = state("target", [["l4", "Hotfixed", "h2"], ["l7", "Unreleased", "u-live"]], [
        rec("l4", "d4", "h1", "h1", 1),
        rec("l7", "d7", "u1", "u1", 1),
    ]);
    const source = state("source", [["d4", "Hotfixed", "h2"], ["d7", "Unreleased", "u-dev"]], [
        // back-port made DEV equal to LIVE
        rec("d4", "l4", "h2", "h2", 30),
        // back-port kept an unreleased DEV change: DEV now has something LIVE does not
        rec("d7", "l7", "u-live", "u-dev", 30),
    ]);
    const pairs = computeContentSyncPairs({ source, target });
    assert.equal(pairOf(pairs, "Hotfixed").status, "in_sync", "after the back-port both editors have the same content");
    assert.equal(pairOf(pairs, "Unreleased").status, "source_ahead", "DEV kept its own change: it still has to go to LIVE");
}

// Per script: changes to other scripts never affect a script's status.
{
    const target = state("target", [["l1", "A", "a1"], ["l2", "B", "b1"]], [rec("l1", "d1", "a1", "a1"), rec("l2", "d2", "b1", "b1")]);
    const before = computeContentSyncPairs({ source: state("source", [["d1", "A", "a1"], ["d2", "B", "b1"]]), target });
    const after = computeContentSyncPairs({ source: state("source", [["d1", "A", "a1"], ["d2", "B", "b9"]]), target });
    assert.equal(pairOf(before, "A").status, "in_sync");
    assert.equal(pairOf(after, "A").status, "in_sync", "B changing on DEV does not touch A");
    assert.equal(pairOf(after, "B").status, "source_ahead");
}

// A sync point recorded with another fingerprint version is not compared.
{
    const source = state("source", [["d1", "A", "v2:aaa"]]);
    const target = state("target", [["l1", "A", "v2:bbb"]], [rec("l1", "d1", "v1:aaa", "v1:bbb")]);
    assert.equal(computeContentSyncPairs({ source, target })[0].status, "never_synced", "old sync points are not compared with new fingerprints");
}

// An import saved as drafts but not published yet.
{
    const source = state("source", [["d1", "A", "v2"]]);
    const target = state("target", [["l1", "A", "v1"]], [rec("l1", "d1", "v1", "v1", 1, true)]);
    const pair = computeContentSyncPairs({ source, target })[0];
    assert.equal(pair.status, "pending");
    assert.equal(pair.pendingOn, "target");
}

// Never imported: linked by identical id, else by a unique identical title; equal content is in sync.
{
    const source = state("source", [["same", "Admission", "x"], ["d2", "Discharge", "y"], ["d3", "Twin", "z"], ["d8", "Identical", "q"]]);
    const target = state("target", [["same", "Admission", "x2"], ["l2", "discharge ", "y2"], ["l3", "Twin", "z1"], ["l4", "Twin", "z2"], ["l8", "Identical", "q"]]);
    const pairs = computeContentSyncPairs({ source, target });
    assert.equal(pairOf(pairs, "Admission").linkedBy, "same_id");
    assert.equal(pairOf(pairs, "Admission").status, "never_synced");
    assert.equal(pairs.find(p => p.sourceScriptId === "d2")!.targetScriptId, "l2", "title match ignores case and spaces");
    assert.equal(pairs.find(p => p.sourceScriptId === "d3")!.status, "only_on_source", "an ambiguous title is not guessed");
    assert.equal(pairOf(pairs, "Identical").status, "in_sync", "equal content needs no import");
}

// ── A script linked to two counterparts: the newest link wins ──────────────────────────────────────
// (the records come back from the database in no particular order)
{
    const source = state("source", [["d1", "Old source", "a"], ["d7", "New source", "b"]]);
    const target = state("target", [["l1", "Imported", "b"]], [
        rec("l1", "d1", "a", "a", 1),
        rec("l1", "d7", "b", "b", 5),
    ]);
    const pairs = computeContentSyncPairs({ source, target });
    const l1 = pairs.find(p => p.targetScriptId === "l1")!;
    assert.equal(l1.sourceScriptId, "d7", "the most recent import decides the counterpart");
    assert.equal(l1.status, "in_sync");

    // an import still in drafts is newer than any published one
    const pendingFirst = computeContentSyncPairs({
        source,
        target: state("target", [["l1", "Imported", "b"]], [
            rec("l1", "d7", "b", "b", 5),
            { ...rec("l1", "d1", "a", "a", 0, true), syncedAt: null },
        ]),
    });
    assert.equal(pendingFirst.find(p => p.targetScriptId === "l1")!.sourceScriptId, "d1");
    assert.equal(pendingFirst.find(p => p.targetScriptId === "l1")!.status, "pending");
}

// ── Which screens differ: pairing and comparison ────────────────────────────────────────────────────
{
    const screen = (screenId: string, title: string, position: number, items: string[], extra: Record<string, any> = {}) => ({
        screenId, title, position, type: "single_select", refId: title,
        items: items.map((v, i) => ({ itemId: `${screenId}-i${i}`, value: v, label: v })), ...extra,
    });
    // DEV (source) and LIVE (target) copies of a script with different ids; LIVE recorded the import id map
    const dev = { scriptId: "dev-s", ...computeEntityFingerprints({ screens: [
        screen("d1", "Birth", 1, ["A", "B"]),
        screen("d2", "Vitals", 2, ["X", "Y", "Z"]),   // DEV added Z
        screen("d3", "New on DEV", 3, ["Q"]),
    ] }), importIdMap: null };
    const live = { scriptId: "live-s", ...computeEntityFingerprints({ screens: [
        screen("l2", "Vitals", 1, ["X", "Y"]),         // reordered: position alone is not a difference
        screen("l1", "Birth", 2, ["A", "B"]),
        screen("l9", "LIVE only", 3, ["W"]),
    ] }), importIdMap: { sourceScriptId: "dev-s", screens: { d1: "l1", d2: "l2" }, diagnoses: {}, problems: {} } };

    const onLive = diffScriptEntities({ local: live, remote: dev });
    assert.deepEqual(onLive.screens.changed, ["l2"], "only the screen whose content differs is flagged; a reorder is not");
    assert.deepEqual(onLive.screens.onlyHere, ["l9"]);
    assert.deepEqual(onLive.screens.onlyThere, ["New on DEV"]);
    assert.equal(onLive.total, 2);

    // from DEV's side the same pairing comes from LIVE's record (inverted)
    const onDev = diffScriptEntities({ local: dev, remote: live });
    assert.deepEqual(onDev.screens.changed, ["d2"]);
    assert.deepEqual(onDev.screens.onlyHere, ["d3"]);
    assert.deepEqual(onDev.screens.onlyThere, ["LIVE only"]);

    // no import record: same ids pair, then an unambiguous type/ref/title
    const a = { scriptId: "a", ...computeEntityFingerprints({ screens: [screen("s1", "Same id", 1, ["A"]), screen("x1", "By title", 2, ["B"])] }), importIdMap: null };
    const b = { scriptId: "b", ...computeEntityFingerprints({ screens: [screen("s1", "Same id", 1, ["A"]), screen("y7", "By title", 2, ["B", "C"])] }), importIdMap: null };
    const ab = diffScriptEntities({ local: a, remote: b });
    assert.deepEqual(ab.screens.changed, ["x1"], "paired by title, and its options differ");
    assert.deepEqual(ab.screens.onlyHere, []);
    assert.equal(diffScriptEntities({ local: a, remote: a }).total, 0, "identical content: nothing to shade");
}

// ── Images copied by an import are the same image (new id, id-prefixed name, size as text) ─────────
{
    const here = { image1: { fileId: "11111111-1111-4111-8111-111111111111", data: "http://0.0.0.0:8500/files/1111", url: "http://0.0.0.0:8500/files/1111",
        filename: "11111111-1111-4111-8111-111111111111__HBB action plan.jpg?w=588&h=1076", size: 84101, contentType: "image/jpeg" } };
    const there = { image1: { fileId: "22222222-2222-4222-8222-222222222222", data: "https://demo/files/2222?height=1076&width=588",
        filename: "HBB action plan.jpg", size: "84101", type: "application/octet-stream" } };
    const fp = (img: any) => computeScriptFingerprint({ script: { title: "S" }, screens: [{ screenId: "a", position: 1, title: "T", ...img }] });
    assert.equal(fp(here), fp(there), "the same file on both editors is not a difference");
    assert.notEqual(fp(here), fp({ image1: { ...there.image1, size: "90000" } }), "a different image still is");
    // the other editor may store a generated name: size and dimensions still identify the file
    assert.equal(fp(here), fp({ image1: { ...there.image1, filename: "448c90df-47b3-4ca6-9c6c-262024419e4d.jpeg" } }));
    assert.notEqual(fp(here), fp({ image1: { ...there.image1, data: "https://demo/files/2222?height=10&width=20" } }), "same size, other dimensions: a different image");
    assert.ok(fp(here).startsWith("v2:"));
}

// ── Editors that fingerprint differently can't be compared: no false "out of sync" ─────────────────
{
    const source = state("source", [["s1", "Same", "v1:abc"]]);
    const target = state("target", [["s1", "Same", "v2:def"]]);
    const pairs = computeContentSyncPairs({ source, target });
    assert.equal(pairs[0].status, "cannot_compare");
    assert.ok(!isOutOfSync(pairs[0].status), "and it is not shaded as out of sync");
}

console.log("content sync tests passed");
