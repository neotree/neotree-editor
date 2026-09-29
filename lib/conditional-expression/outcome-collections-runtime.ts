/* AUTO-SYNCED COPY — DO NOT EDIT HERE.
 *
 * Everything below this banner is a verbatim copy of src/utils/outcome-collections.ts in the
 * mobile app, so the ops "test a conditional expression" page answers exactly
 * what a device would. Edit the mobile file and copy it over; the drift check
 * in tests/ops-condition-eval.test.ts fails if the two diverge.
 *
 * Nothing is restated here — the semantics are documented once, in the file
 * below, so the two copies cannot disagree about what the operators mean.
 */

/**
 * `$Diagnoses` and `$Problems` — the outcome collections.
 *
 * A script can ask about the outcomes the clinician just confirmed:
 *
 *   ($DangerSigns = 'Grun' or $Diagnoses = 'RDN') and $NobCPAP = false
 *
 * These are the only two keys whose value is produced by a screen rather than
 * typed into one. The web editor already models them: `Diagnoses` comes from a
 * screen of type `diagnosis`, `Problems` from type `problems`, and a condition
 * may only use them at a position after that screen
 * (lib/conditional-expression/script-outcomes.ts).
 *
 * They resolve to the CONFIRMED outcomes, read from the entry that screen
 * already committed — never recomputed. That matters for two reasons:
 *
 *  - Suggested diagnoses are derived by evaluating diagnosis expressions, which
 *    themselves go through parseCondition. Resolving `$Diagnoses` by computing
 *    them would let a diagnosis expression that references `$Problems` recurse
 *    into the evaluator that is already running. Reading committed entries
 *    cannot recurse.
 *  - The clinician can reject a suggestion. A rejected outcome stays in the
 *    entry with `how_agree === 'No'`, and must not count as present.
 *
 * Outcomes are emitted as a `multi_select`-shaped entry so the existing
 * chunking in parseCondition makes `$Diagnoses = 'RDN'` true when ANY confirmed
 * outcome is RDN — the same way a multi-select answer already behaves.
 */

/** Screen type -> the key its outcomes answer under. */
const OUTCOME_SCREEN_TYPES: readonly (readonly [string, string])[] = [
    ['diagnosis', 'Diagnoses'],
    ['problems', 'Problems'],
];

/**
 * Non-global, so `.test()` is stateless and safe to share. Conditions are
 * probed on every line of every sweep, and almost none reference these keys.
 */
const OUTCOME_PROBE = /\$(Diagnoses|Problems)\b/i;

/**
 * Shared empty result, so neither this module nor its callers allocate on the
 * path taken by almost every condition.
 */
export const NO_OUTCOME_ENTRIES: readonly any[] = [];
const NONE = NO_OUTCOME_ENTRIES as any[];

export function referencesOutcomeCollection(condition: string): boolean {
    return OUTCOME_PROBE.test(`${condition || ''}`);
}

/** A rejected suggestion is recorded but was not confirmed. */
function isConfirmed(value: any): boolean {
    const outcome = value?.diagnosis ?? value?.problem;
    if (!outcome) return true;
    return `${outcome.how_agree ?? ''}` !== 'No';
}

/**
 * Builds the synthetic entries that make `$Diagnoses` / `$Problems` resolvable.
 *
 * Call this once per change to `entries` and reuse the result: it walks every
 * entry, which is far too much work to repeat for each condition on a screen.
 */
export function buildOutcomeEntries(entries: any[]): any[] {
    if (!Array.isArray(entries) || !entries.length) return NONE;

    let built: any[] | null = null;

    for (const [screenType, key] of OUTCOME_SCREEN_TYPES) {
        let values: any[] | null = null;

        for (const entry of entries) {
            if (`${entry?.screen?.type ?? ''}`.toLowerCase() !== screenType) continue;

            for (const value of (entry?.values || entry?.value || [])) {
                if (!isConfirmed(value)) continue;

                // `key` is the outcome's own identifier; `value` can carry a
                // clinician-typed custom name, so fall back to it.
                const name = value?.key ?? value?.value;
                if ((name === null) || (name === undefined)) continue;
                const normalized = `${name}`.trim();
                if (!normalized) continue;

                (values ||= []).push({ key, value: normalized, type: 'text', dataType: 'text' });
            }
        }

        // A multi_select screen shape drives the existing per-value chunking,
        // which is what makes `= 'RDN'` match any one of several outcomes.
        if (values) (built ||= []).push({ screen: { type: 'multi_select' }, values });
    }

    return built || NONE;
}
