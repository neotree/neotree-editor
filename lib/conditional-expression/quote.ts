// Quoting helpers for text values. The DSL has no escape sequences, so a value
// is quoted with the first delimiter it does not itself contain.

const DELIMITERS = ["'", '"', "`"] as const;

/**
 * Wraps a text value in the first delimiter it does not contain, or returns
 * undefined when the value contains all three (nothing can quote it verbatim).
 */
export function quoteTextValue(value: string): string | undefined {
  for (const quote of DELIMITERS) {
    if (!value.includes(quote)) return `${quote}${value}${quote}`;
  }
  return undefined;
}

/**
 * Like `quoteTextValue`, but always returns a usable literal: when the value
 * contains every delimiter, single quotes are stripped as a last resort.
 */
export function quoteValue(value: string): string {
  return quoteTextValue(value) ?? `'${value.replace(/'/g, "")}'`;
}
