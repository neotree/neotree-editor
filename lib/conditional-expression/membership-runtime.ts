/* AUTO-SYNCED COPY — DO NOT EDIT HERE.
 *
 * Everything below this banner is a verbatim copy of src/utils/membership.ts in the
 * mobile app, so the ops "test a conditional expression" page answers exactly
 * what a device would. Edit the mobile file and copy it over; the drift check
 * in tests/ops-condition-eval.test.ts fails if the two diverge.
 *
 * Nothing is restated here — the semantics are documented once, in the file
 * below, so the two copies cannot disagree about what the operators mean.
 */

/**
 * Membership operators (`includes` / `excludes`) for conditional expressions.
 *
 * These are resolved to a literal `true`/`false` before the surrounding
 * expression goes through key substitution and eval, so a membership can sit
 * alongside any other term on the same line.
 *
 * Semantics, matching the web editor's grammar:
 *
 *   $Key includes ('a','b')     the answer contains ANY of a or b
 *   $Key excludes ('a','b')     the answer contains NONE of a or b
 *
 * The two are exact inverses, which the editor relies on: its legacy-negation
 * rewrite turns `!($K includes (...))` straight into `$K excludes (...)`
 * (lib/conditional-expression/legacy.ts). Reading `includes` as "all of" would
 * break that identity, and would also make `excludes` over several values
 * useless — "not all of" is true for almost any single-valued key.
 *
 * `or_includes` / `or_excludes` are legacy and unknown to the editor grammar
 * (lib/conditional-expression/parser.ts). `or_includes` is now identical to
 * `includes`; `or_excludes` keeps its old "at least one is absent" meaning.
 * Both are accepted only for backwards compatibility and should be migrated.
 *
 * An unanswered key has an empty answer set. That makes `excludes` true and
 * `includes` false, which lines up with how an unsubstituted `$Key` behaves
 * under `=` / `!=` elsewhere in the runtime.
 *
 * This module is deliberately dependency-free so it can be unit tested without
 * standing up the script context.
 */

/** One answered value. Options carry {key,value}; plain fields carry a scalar. */
export interface MembershipValue {
    key?: string;
    value?: any;
    /** Manual-entry text, e.g. the "other, please specify" box. */
    value2?: any;
    /** Key that `value2` is additionally answerable under, when set. */
    key2?: string;
}

/** A screen entry, which may expose its values as `value` or `values`. */
export interface MembershipEntry {
    value?: MembershipValue[] | any;
    values?: MembershipValue[];
}

/**
 * Matches `$Key <op> (` only. The value list is scanned by hand from there,
 * because option values legitimately contain parentheses and commas
 * ("Amoxicillin (oral)", "Fever, high") and a regex that stops at the first
 * `)` or splits on every `,` mangles them.
 */
export const MEMBERSHIP_HEAD =
    /(\$[\w-]+)\s+(or_excludes|or_includes|excludes|includes)\s*\(/gi;

/**
 * Non-global twin of MEMBERSHIP_HEAD, used to bail out before allocating
 * anything. `.test()` on a non-global regex ignores lastIndex, so this is
 * stateless and safe to share; the global one is not.
 *
 * Almost no expression contains a membership, and this runs on every line of
 * every condition on every screen sweep, so the negative case has to be one
 * scan and zero allocations.
 */
const MEMBERSHIP_PROBE =
    /(\$[\w-]+)\s+(or_excludes|or_includes|excludes|includes)\s*\(/i;

export function hasMembership(condition: string): boolean {
    return MEMBERSHIP_PROBE.test(`${condition || ''}`);
}

function normalize(value: any): string {
    return `${value ?? ''}`.trim().toLowerCase();
}

const QUOTES = ['\'', '"', '`'];

/**
 * The index of the `)` closing the `(` at `openIndex`, or -1 if unbalanced.
 * Parentheses inside quotes do not count.
 */
export function findClosingParen(source: string, openIndex: number): number {
    let depth = 0;
    let quote: string | null = null;

    for (let i = openIndex; i < source.length; i++) {
        const char = source[i];
        if (quote) {
            if (char === quote) quote = null;
            continue;
        }
        if (QUOTES.includes(char)) { quote = char; continue; }
        if (char === '(') depth++;
        else if (char === ')') {
            depth--;
            if (depth === 0) return i;
        }
    }

    return -1;
}

/** Splits on commas that sit outside quotes, so `'Fever, high'` stays whole. */
function splitTopLevel(input: string): string[] {
    const parts: string[] = [];
    let current = '';
    let quote: string | null = null;

    for (const char of input) {
        if (quote) {
            current += char;
            if (char === quote) quote = null;
            continue;
        }
        if (QUOTES.includes(char)) { quote = char; current += char; continue; }
        if (char === ',') { parts.push(current); current = ''; continue; }
        current += char;
    }
    parts.push(current);

    return parts;
}

/** Splits `'a', 'b'` into ['a','b'], tolerating single, double and back quotes. */
export function parseValueList(rawValues: string): string[] {
    return splitTopLevel(`${rawValues || ''}`)
        .map(s => s.trim().replace(/^(['"`])([\s\S]*)\1$/, '$2'))
        .map(normalize)
        .filter(s => s);
}

/** Every value answered against `key`, lowercased. `key` includes the `$`. */
export function collectAnsweredValues(form: MembershipEntry[], key: string): Set<string> {
    const target = normalize(key);
    const answered = new Set<string>();

    const add = (item: any) => {
        // `value` is what the substitution pipeline compares against, so it is
        // what membership must compare against too — otherwise `$K = 'A'` and
        // `$K includes ('A')` would disagree. For a multi-select option `key`
        // is the internal item id, not the answer.
        const raw = (item && typeof item === 'object') ? (item.value ?? item.key) : item;
        if ((raw === null) || (raw === undefined)) return;
        const normalized = normalize(raw);
        if (normalized) answered.add(normalized);
    };

    for (const entry of (form || [])) {
        const entryValues = entry?.value || entry?.values || [];
        if (!Array.isArray(entryValues)) continue;

        for (const v of entryValues) {
            const matchesKey = `$${normalize(v?.key)}` === target;
            // The pipeline pushes {value: value2, key: key2} as its own value,
            // so manual-entry text is answerable under key2.
            const matchesKey2 = (v?.key2 !== undefined) && (`$${normalize(v?.key2)}` === target);
            if (!matchesKey && !matchesKey2) continue;

            if (matchesKey) {
                if (Array.isArray(v?.value)) {
                    for (const item of v.value) {
                        add(item);
                        // Manual entry on a multi-select option is cloned under
                        // the field's key by the pipeline, so conditions see it.
                        add(item?.value2);
                    }
                } else {
                    add(v?.value);
                }
            }

            // Manual entry on a plain field is NOT visible to conditions under
            // the field's own key: the pipeline substitutes the primary value
            // first, leaving no token for the clone. Only key2 exposes it.
            if (matchesKey2) add(v?.value2);
        }
    }

    return answered;
}

/**
 * Replaces every membership operator in `condition` with `true` or `false`.
 *
 * A list with no usable values is left untouched rather than given a verdict —
 * a malformed expression should surface as a parse failure, not quietly decide
 * whether a clinician sees a screen.
 */
export function resolveMemberships(condition: string, form: MembershipEntry[]): string {
    const source = `${condition || ''}`;
    // Fast path: almost nothing uses these operators, and this is on the hot
    // path for every screen sweep.
    if (!MEMBERSHIP_PROBE.test(source)) return source;

    const head = new RegExp(MEMBERSHIP_HEAD.source, 'gi');

    let out = '';
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = head.exec(source)) !== null) {
        const [text, rawKey, rawOp] = match;
        const openIndex = match.index + text.length - 1;
        const closeIndex = findClosingParen(source, openIndex);

        // Unbalanced parentheses: leave the text alone and let the expression
        // fail to parse rather than guessing where the list ended.
        if (closeIndex === -1) break;

        const wanted = parseValueList(source.slice(openIndex + 1, closeIndex));

        if (wanted.length) {
            const op = normalize(rawOp);
            const answered = collectAnsweredValues(form, rawKey);

            let met: boolean;
            switch (op) {
                case 'includes':
                    met = wanted.some(v => answered.has(v));
                    break;
                case 'excludes':
                    met = !wanted.some(v => answered.has(v));
                    break;
                // Legacy aliases. `or_includes` is now identical to `includes`;
                // `or_excludes` keeps its old "at least one is absent" meaning,
                // which is not the inverse of anything the editor can express.
                case 'or_includes':
                    met = wanted.some(v => answered.has(v));
                    break;
                default:
                    met = !wanted.every(v => answered.has(v));
                    break;
            }

            out += source.slice(cursor, match.index) + (met ? 'true' : 'false');
        } else {
            // An empty list asserts nothing; keep it verbatim so the expression
            // surfaces as malformed instead of quietly deciding a verdict.
            out += source.slice(cursor, closeIndex + 1);
        }

        cursor = closeIndex + 1;
        head.lastIndex = cursor;
    }

    return out + source.slice(cursor);
}
