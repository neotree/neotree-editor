// MUID: a 12-character, typo-resistant session ID, stored in two parts like a NUID: M0K7Q-000001R.
//
//   M 0K7Q - 000001 R
//   │ │      │      └ check character (Luhn mod 32 over the 11 characters before it)
//   │ │      └ counter, 6 characters of Crockford base 32 (the tablet's session counter)
//   │ └ the tablet's 4-character ID (the same device hash NUIDs use)
//   └ always the letter M, so nothing reads the ID as a number, date or time
//
// The first part (M + tablet) says which tablet, the second says which session, and the hyphen between
// them is part of the stored ID. Typed or scanned IDs may leave the hyphen out or use any case: they are
// normalised first, and always come back in the form above. The alphabet is Crockford base 32 (0-9 and A-Z
// without I, L, O, U), so 0/O and 1/I/L can't be confused. Typed input is normalised (O->0, I/L->1)
// before it is checked.
//
// Pure and dependency-free. This file is kept IDENTICAL in neotree-editor (lib/muid.ts) and
// neotree-react-native-app (src/utils/muid.ts): change both, and run both muid tests.

export const MUID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const MUID_LETTER = "M";
export const MUID_TABLET_LENGTH = 4;
export const MUID_COUNTER_LENGTH = 6;
/** Characters in a MUID, not counting the hyphen. */
export const MUID_LENGTH = 1 + MUID_TABLET_LENGTH + MUID_COUNTER_LENGTH + 1;
/** The M and the tablet ID: everything before the hyphen. */
export const MUID_PREFIX_LENGTH = 1 + MUID_TABLET_LENGTH;
/** Characters in a MUID as stored and shown (with its hyphen). */
export const MUID_STORED_LENGTH = MUID_LENGTH + 1;
/** Highest counter that fits in 6 base-32 characters. */
export const MUID_MAX_COUNTER = 32 ** MUID_COUNTER_LENGTH - 1;

const N = MUID_ALPHABET.length;

/** Uppercases, drops the hyphen, spaces and anything else that isn't a letter or digit, and maps O->0, I/L->1. */
export function normaliseMuid(raw: unknown): string {
  return `${raw ?? ""}`.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
}

function luhnSum(s: string, firstFactor: 1 | 2): number {
  let factor: number = firstFactor;
  let sum = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const cp = MUID_ALPHABET.indexOf(s[i]);
    let addend = factor * cp;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / N) + (addend % N);
    sum += addend;
  }
  return sum;
}

/** The check character for the first 11 characters. */
export function muidCheckChar(body: string): string {
  if (body.length !== MUID_LENGTH - 1 || [...body].some((c) => !MUID_ALPHABET.includes(c))) throw new Error("A MUID body is 11 characters from 0-9 and A-Z (no I, L, O, U).");
  return MUID_ALPHABET[(N - (luhnSum(body, 2) % N)) % N];
}

export type MuidProblem = "empty" | "length" | "letter" | "characters" | "check";

export interface MuidValidation {
  isValid: boolean;
  /** The 12 characters without the hyphen, in capitals. */
  normalised: string;
  /** The ID as it is stored and shown, with its hyphen (M0K7Q-000001R); empty when not valid. */
  stored: string;
  problem: MuidProblem | null;
  /** A sentence a person can act on; empty when valid. */
  message: string;
}

export function validateMuid(raw: unknown): MuidValidation {
  const normalised = normaliseMuid(raw);
  const fail = (problem: MuidProblem, message: string): MuidValidation => ({ isValid: false, normalised, stored: "", problem, message });
  if (!normalised) return fail("empty", "Enter an ID.");
  if (normalised.length !== MUID_LENGTH) return fail("length", `An ID has ${MUID_LENGTH} characters; this has ${normalised.length}.`);
  if (normalised[0] !== MUID_LETTER) return fail("letter", `An ID starts with the letter ${MUID_LETTER}.`);
  const bad = [...normalised].find((c) => !MUID_ALPHABET.includes(c));
  if (bad) return fail("characters", `"${bad}" can't be used in an ID. Letters I, L, O and U aren't used.`);
  if (muidCheckChar(normalised.slice(0, -1)) !== normalised.slice(-1)) return fail("check", "The last character doesn't match the rest, so a character may be mistyped. Check the ID.");
  return { isValid: true, normalised, stored: formatMuid(normalised), problem: null, message: "" };
}

export function isValidMuid(raw: unknown): boolean {
  return validateMuid(raw).isValid;
}

/** M0K7Q000001R -> M0K7Q-000001R. A partial ID is cut at the same place (the hyphen only appears once there is something after it). */
export function formatMuid(raw: unknown): string {
  const chars = normaliseMuid(raw).slice(0, MUID_LENGTH);
  return chars.length > MUID_PREFIX_LENGTH ? `${chars.slice(0, MUID_PREFIX_LENGTH)}-${chars.slice(MUID_PREFIX_LENGTH)}` : chars;
}

/** A tablet ID as the 4 characters a MUID carries (normalised), or null if it can't be one. */
export function toMuidTabletId(raw: unknown): string | null {
  const id = normaliseMuid(raw);
  return id.length === MUID_TABLET_LENGTH && [...id].every((c) => MUID_ALPHABET.includes(c)) ? id : null;
}

export function encodeMuidCounter(counter: number): string {
  if (!Number.isInteger(counter) || counter < 0 || counter > MUID_MAX_COUNTER) throw new Error(`The counter must be a whole number from 0 to ${MUID_MAX_COUNTER}.`);
  let out = "";
  for (let n = counter; out.length < MUID_COUNTER_LENGTH; n = Math.floor(n / N)) out = MUID_ALPHABET[n % N] + out;
  return out;
}

/** Builds the stored MUID (with its hyphen, M0K7Q-000001R) for a tablet and counter value. */
export function generateMuid(tabletId: unknown, counter: number): string {
  const tablet = toMuidTabletId(tabletId);
  if (!tablet) throw new Error(`The tablet ID must be ${MUID_TABLET_LENGTH} characters from 0-9 and A-Z (no I, L, O, U).`);
  const body = `${MUID_LETTER}${tablet}${encodeMuidCounter(counter)}`;
  return formatMuid(body + muidCheckChar(body));
}

/**
 * Formats what a person is typing: normalises it, stops at 12 characters and inserts the hyphen after
 * the first five. `previous` (the value currently shown) lets a deletion remove a trailing hyphen
 * instead of putting it straight back.
 */
export function formatMuidInput(raw: unknown, previous = ""): string {
  const text = `${raw ?? ""}`;
  const chars = normaliseMuid(text).slice(0, MUID_LENGTH);
  let out = formatMuid(chars);
  const deleting = text.length < previous.length;
  if (!deleting && chars.length === MUID_PREFIX_LENGTH) out += "-";
  return out;
}
