// Identical in neotree-editor (tests/muid.test.ts) and neotree-react-native-app (scripts/tests/muid.test.ts),
// except for the import path on the next line.
import assert from "assert";
import {
  MUID_ALPHABET, MUID_MAX_COUNTER, MUID_STORED_LENGTH, encodeMuidCounter, formatMuid, formatMuidInput, generateMuid, isValidMuid, muidCheckChar,
  normaliseMuid, toMuidTabletId, validateMuid,
} from "../lib/muid";

// Known-good vectors (check characters worked out by hand from the Luhn mod 32 definition)
assert.equal(muidCheckChar("M0K7Q000001"), "R");
for (const id of ["M0K7Q-000001R", "M0K7Q000001R", "m0k7q-000001r", " M0K7 Q000 001R ", "M0K7-Q000-001R"]) assert.ok(isValidMuid(id), `valid, hyphen or not: ${id}`);
assert.equal(validateMuid("m0k7q000001r").stored, "M0K7Q-000001R", "always comes back in the stored form");
assert.equal(validateMuid("M0K7-Q000-001R").stored, "M0K7Q-000001R");
assert.equal(validateMuid("M0K7Q000001R").normalised, "M0K7Q000001R");
assert.equal(validateMuid("M0K7Q000002R").stored, "", "nothing is stored for an invalid ID");

// Typos people really make
assert.ok(isValidMuid("MOK7Q000001R"), "O typed for 0 is understood");
assert.ok(isValidMuid("M0K7QOOOOO1R"), "O's typed for 0's");
assert.equal(normaliseMuid("MOK7-QI00-LO1R"), "M0K7Q100101R");

const v = (s: string) => validateMuid(s);
assert.equal(v("").problem, "empty");
assert.equal(v("M0K7Q000001").problem, "length", "too short");
assert.equal(v("M0K7Q000001RR").problem, "length", "too long");
assert.equal(v("X0K7Q000001R").problem, "letter");
assert.equal(v("M0K7Q00U001R").problem, "characters", "U is not in the alphabet");
assert.equal(v("M0K7Q000002R").problem, "check", "wrong digit");
assert.equal(v("M0K7Q000001S").problem, "check", "wrong check character");
assert.ok(v("M0K7Q000002R").message.length > 0 && v("M0K7Q000001R").message === "");

// Check character: every single-character error is caught; adjacent swaps nearly always
{
  let seed = 12345;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  let swaps = 0, swapMiss = 0;
  for (let t = 0; t < 3000; t++) {
    const id = generateMuid(Array.from({ length: 4 }, () => MUID_ALPHABET[Math.floor(rnd() * 32)]).join(""), Math.floor(rnd() * 1e6)).replace("-", ""); // the 12 characters, so positions are the same as in the ID
    assert.ok(isValidMuid(id), `generated is valid: ${id}`);
    for (let i = 0; i < 12; i++) {
      for (const c of MUID_ALPHABET) {
        if (c === id[i]) continue;
        const m = id.slice(0, i) + c + id.slice(i + 1);
        if (i === 0 && c !== "M") continue; // letter rule reports these, not the check
        assert.ok(!isValidMuid(m), `single-character change must fail: ${id} -> ${m}`);
      }
    }
    for (let i = 1; i < 11; i++) if (id[i] !== id[i + 1]) { swaps++; const m = id.slice(0, i) + id[i + 1] + id[i] + id.slice(i + 2); if (isValidMuid(m)) swapMiss++; }
  }
  assert.ok(swapMiss / swaps < 0.005, `adjacent swaps caught: ${swapMiss}/${swaps}`);
}

// Generating
assert.equal(generateMuid("0K7Q", 1), "M0K7Q-000001R");
assert.equal(generateMuid("0k7q", 1), "M0K7Q-000001R", "tablet id is normalised");
assert.equal(generateMuid("0K7Q", 1).length, MUID_STORED_LENGTH);
assert.equal(encodeMuidCounter(0), "000000");
assert.equal(encodeMuidCounter(31), "00000Z");
assert.equal(encodeMuidCounter(32), "000010");
assert.equal(encodeMuidCounter(MUID_MAX_COUNTER), "ZZZZZZ");
assert.ok(isValidMuid(generateMuid("1A2B", MUID_MAX_COUNTER)));
assert.throws(() => encodeMuidCounter(MUID_MAX_COUNTER + 1), /counter/);
assert.throws(() => encodeMuidCounter(-1), /counter/);
assert.throws(() => encodeMuidCounter(1.5), /counter/);
assert.throws(() => generateMuid("0K7", 1), /tablet ID/);
assert.throws(() => generateMuid("0K7U", 1), /tablet ID/);
assert.equal(toMuidTabletId("FB8E"), "FB8E", "existing hex device hashes are valid tablet IDs");
assert.equal(toMuidTabletId("0K7U"), null);
// every counter value gives a distinct ID for one tablet
{
  const seen = new Set<string>();
  for (let n = 0; n < 5000; n++) seen.add(generateMuid("0K7Q", n));
  assert.equal(seen.size, 5000);
}
// different tablets never produce the same ID for the same counter
assert.notEqual(generateMuid("0K7Q", 5), generateMuid("0K7R", 5));
assert.throws(() => muidCheckChar("short"), /11 characters/);

// Display and typing: one hyphen, after the M and the tablet ID
assert.equal(formatMuid("M0K7Q000001R"), "M0K7Q-000001R");
assert.equal(formatMuid("M0K7Q-000001R"), "M0K7Q-000001R", "already in the stored form");
assert.equal(formatMuid("M0K7Q"), "M0K7Q", "no hyphen until something follows it");
assert.equal(formatMuid("M0K7Q0"), "M0K7Q-0");
assert.equal(formatMuidInput("m0k7"), "M0K7");
assert.equal(formatMuidInput("m0k7q"), "M0K7Q-", "hyphen goes in once the tablet ID is complete");
assert.equal(formatMuidInput("M0K7Q-00"), "M0K7Q-00");
assert.equal(formatMuidInput("M0K7Q000"), "M0K7Q-000", "typed without the hyphen");
assert.equal(formatMuidInput("M0K7Q-000001R"), "M0K7Q-000001R", "no trailing hyphen");
assert.equal(formatMuidInput("M0K7Q-000001RXYZ"), "M0K7Q-000001R", "capped at 12 characters");
assert.equal(formatMuidInput("M0K7Q", "M0K7Q-"), "M0K7Q", "deleting the hyphen is allowed");
assert.equal(formatMuidInput("MOK7Q"), "M0K7Q-", "O becomes 0 as typed");
assert.equal(formatMuidInput(""), "");

console.log("muid: all assertions passed");
