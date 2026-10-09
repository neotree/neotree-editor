import assert from "assert";

import { requestScoped } from "../lib/server/condition-key-registry";

/**
 * The registry read is shared per request so a script page loads the data key
 * library once instead of twice (~113ms saved per page load).
 *
 * React only exports `cache` under its server condition, which Next's App
 * Router supplies and the tsx CLI does not. These pin both branches of that
 * guard: dedupe where the primitive exists, and a working straight-through call
 * where it does not — a missing export must never crash a CLI script.
 */

let calls = 0;
const loader = async () => {
  calls++;
  return { data: [{ uniqueKey: "dk-1" }] } as any;
};

// A stand-in for React.cache: memoises the wrapped function.
const fakeCache = (fn: () => Promise<any>) => {
  let promise: Promise<any> | null = null;
  return () => (promise ??= fn());
};

async function main() {
  calls = 0;
  const shared = requestScoped(loader, fakeCache as any);
  const [a, b] = await Promise.all([shared(), shared()]);
  assert.equal(calls, 1, "two callers in one request must share a single registry read");
  assert.deepEqual(a, b, "both callers see the same result");

  calls = 0;
  const direct = requestScoped(loader, undefined);
  await direct();
  await direct();
  assert.equal(calls, 2, "without the primitive it calls straight through rather than throwing");

  const result: any = await direct();
  assert.equal(result.data[0].uniqueKey, "dk-1", "the fallback still returns the registry");

  console.log("condition key registry tests passed");
}

main().catch((e) => { console.error(e); process.exit(1); });
