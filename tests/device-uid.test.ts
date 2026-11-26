import assert from "assert";
import {
  DEFAULT_UID_COUNTER_MARGIN, generateUniqueDeviceHash, getUidCounterFloor, getUidCounterMargin, mergeDeviceDetails,
} from "../lib/device-uid";

// Counter never goes down; other details are kept
assert.deepEqual(mergeDeviceDetails({ scripts_count: 120 }, { scripts_count: 80 }), { scripts_count: 120 }, "stale upload ignored");
assert.deepEqual(mergeDeviceDetails({ scripts_count: 120 }, { scripts_count: 121 }), { scripts_count: 121 });
assert.deepEqual(mergeDeviceDetails({ scripts_count: 5, extra: "x" } as any, { scripts_count: 6 }), { scripts_count: 6, extra: "x" }, "other keys merged, not wiped");
assert.deepEqual(mergeDeviceDetails({}, { scripts_count: 3 }), { scripts_count: 3 });
assert.deepEqual(mergeDeviceDetails(null, undefined), { scripts_count: 0 });
assert.equal(mergeDeviceDetails<{ scripts_count: number }>({ scripts_count: 7 }, { scripts_count: "abc" as any }).scripts_count, 7, "garbage can't lower it");
assert.equal(mergeDeviceDetails<{ scripts_count: number }>({ scripts_count: 7 }, { scripts_count: -1 }).scripts_count, 7);

// Floor: resume after everything the server knows, plus the margin; new tablets start from the beginning
assert.equal(getUidCounterFloor(0), 0);
assert.equal(getUidCounterFloor(undefined), 0);
assert.equal(getUidCounterFloor(120, 500), 620);
assert.equal(getUidCounterFloor(120), 120 + DEFAULT_UID_COUNTER_MARGIN);
assert.equal(getUidCounterMargin("250"), 250);
assert.equal(getUidCounterMargin("nope"), DEFAULT_UID_COUNTER_MARGIN);
assert.equal(getUidCounterMargin("-5"), DEFAULT_UID_COUNTER_MARGIN);

(async () => {
  // Hash generation: hex only, skips taken and reserved hashes, retries until free
  const taken = new Set<string>();
  const made = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const h = await generateUniqueDeviceHash("1a2b3c4d5e6f7a8b", async (x) => taken.has(x));
    assert.match(h, /^[0-9A-F]{4}$/);
    assert.ok(!taken.has(h) && h !== "FB8E");
    taken.add(h); made.add(h);
  }
  assert.equal(made.size, 500, "500 distinct hashes, none repeated");

  // an id with few usable characters still works once its own characters run out
  const tiny = new Set<string>();
  for (let i = 0; i < 50; i++) tiny.add(await generateUniqueDeviceHash("aa", async (x) => tiny.has(x)));
  assert.equal(tiny.size, 50);

  // reserved fallback is never issued
  let calls = 0;
  const h = await generateUniqueDeviceHash("fb8e", async () => false, { random: () => (calls++ % 2 ? 0.99 : 0.5), attempts: 50 });
  assert.notEqual(h, "FB8E");

  // exhausted: throws instead of returning a taken hash
  await assert.rejects(generateUniqueDeviceHash("abcd", async () => true, { attempts: 10 }), /unique device hash/);
  console.log("device-uid: all assertions passed");
})();
