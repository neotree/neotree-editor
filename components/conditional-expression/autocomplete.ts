import type { ConditionKey } from "@/lib/conditional-expression";

export interface ConditionToken {
  token: string;
  start: number;
  end: number;
}

export interface ValueContext {
  /** The key whose value is being typed (name without "$"). */
  keyName: string;
  /** The partial value typed so far. */
  partial: string;
  /** Range to replace when a suggestion is inserted (includes quotes). */
  insertStart: number;
  insertEnd: number;
}

export interface ConditionValueMatch {
  value: string;
  label?: string;
}

/** Filters a key's values by either their machine value or display label. */
export function getConditionValueMatches(key: ConditionKey | undefined, partial: string): ConditionValueMatch[] {
  if (!key?.options?.length) return [];
  const normalized = partial.trim().toLowerCase();
  const matches = key.options
    .map((option, index) => {
      const label = key.optionLabels?.[option];
      const valueSearch = option.toLowerCase();
      const labelSearch = (label || "").toLowerCase();
      const rank = !normalized
        ? 0
        : valueSearch.startsWith(normalized)
          ? 0
          : labelSearch.startsWith(normalized)
            ? 1
            : valueSearch.includes(normalized)
              ? 2
              : labelSearch.includes(normalized)
                ? 3
                : Number.MAX_SAFE_INTEGER;
      return { value: option, label, index, rank, exact: valueSearch === normalized };
    })
    .filter((option) => option.rank !== Number.MAX_SAFE_INTEGER);

  if (!normalized) {
    return matches.map(({ value, label }) => ({ value, label }));
  }

  // Typing an option that is also the prefix of other options must not close
  // autocomplete. Hide only the already-complete value and keep its remaining
  // continuations visible. A unique exact match still closes naturally.
  const alternatives = matches.filter((option) => !option.exact);
  if (!alternatives.length && matches.some((option) => option.exact)) return [];

  return alternatives
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ value, label }) => ({ value, label }));
}

/**
 * Detects when the caret is in a *value* position — the right side of a
 * comparison or an item inside includes/excludes(...) — and returns the
 * governing key so its child options can be suggested. Returns null when the
 * caret is not in a value position.
 */
export function getValueContextAtCursor(condition: string, cursor: number): ValueContext | null {
  const safe = Math.max(0, Math.min(cursor, condition.length));
  const before = condition.slice(0, safe);

  // Are we inside a quoted string literal?
  let quote = "";
  let quoteStart = -1;
  for (let i = 0; i < before.length; i++) {
    const c = before[i];
    if (quote) {
      if (c === quote) {
        quote = "";
        quoteStart = -1;
      }
    } else if (c === "'" || c === '"' || c === "`") {
      quote = c;
      quoteStart = i;
    }
  }

  let partial: string;
  let insertStart: number;
  let insertEnd: number;
  let scopeEnd: number;

  if (quote) {
    partial = condition.slice(quoteStart + 1, safe);
    insertStart = quoteStart;
    scopeEnd = quoteStart;
    // Include a closing quote (on the same line) in the replaced range.
    let close = -1;
    for (let i = safe; i < condition.length; i++) {
      if (condition[i] === "\n") break;
      if (condition[i] === quote) {
        close = i;
        break;
      }
    }
    insertEnd = close >= 0 ? close + 1 : safe;
  } else {
    const word = before.match(/([A-Za-z0-9_]*)$/);
    partial = word ? word[1] : "";
    insertStart = safe - partial.length;
    insertEnd = safe;
    scopeEnd = insertStart;
    // Only a value position if it follows a comparison operator, "(" or ",".
    const preceding = before.slice(0, insertStart).trimEnd();
    if (!/[=(,<>!]$/.test(preceding)) return null;
  }

  // Governing key = the nearest $key before the value.
  const keyMatches = Array.from(condition.slice(0, scopeEnd).matchAll(/\$([A-Za-z0-9_.-]+)/g));
  const keyName = keyMatches.length ? keyMatches[keyMatches.length - 1][1] : "";
  if (!keyName) return null;

  return { keyName, partial, insertStart, insertEnd };
}

/**
 * Quotes a value with a delimiter it does not itself contain (the DSL has no
 * escape syntax), so values like `Mother's` don't produce broken syntax.
 */
export function quoteValue(value: string): string {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  if (!value.includes("`")) return `\`${value}\``;
  // Contains every delimiter — strip single quotes as a last resort.
  return `'${value.replace(/'/g, "")}'`;
}

/** Inserts a value at the value context, returning the new text + caret. */
export function insertValueAtContext(
  condition: string,
  value: string,
  context: ValueContext,
  opts?: { quote?: boolean },
) {
  const before = condition.slice(0, context.insertStart);
  const after = condition.slice(context.insertEnd);
  const inserted = opts?.quote === false ? value : quoteValue(value);
  return { condition: `${before}${inserted}${after}`, cursor: before.length + inserted.length };
}

/** Finds the "$..." token under the caret, for key autocomplete. */
export function getTokenAtCursor(condition: string, cursor: number): ConditionToken | null {
  const safeCursor = Math.max(0, Math.min(cursor, condition.length));
  const beforeCursor = condition.slice(0, safeCursor);
  const tokenStart = beforeCursor.lastIndexOf("$");

  if (tokenStart < 0) return null;

  const tokenText = beforeCursor.slice(tokenStart + 1);
  if (!/^[A-Za-z0-9_.-]*$/.test(tokenText)) return null;

  let tokenEnd = safeCursor;
  while (tokenEnd < condition.length && /[A-Za-z0-9_.-]/.test(condition[tokenEnd])) tokenEnd++;

  return {
    token: condition.slice(tokenStart + 1, tokenEnd),
    start: tokenStart,
    end: tokenEnd,
  };
}

/** Inserts a chosen key at the caret, replacing the active "$..." token. */
export function insertKeyAtCursor(condition: string, key: string, token: ConditionToken | null) {
  const replacement = `$${key}`;

  if (!token) {
    const prefix = condition && !condition.endsWith(" ") ? `${condition} ` : condition;
    const next = `${prefix}${replacement}`;
    return { condition: next, cursor: next.length };
  }

  const next = `${condition.slice(0, token.start)}${replacement}${condition.slice(token.end)}`;
  return { condition: next, cursor: token.start + replacement.length };
}

function isSubsequence(needle: string, value: string): boolean {
  if (!needle) return true;
  let index = 0;
  for (const char of value) {
    if (char === needle[index]) index++;
    if (index === needle.length) return true;
  }
  return false;
}

/** Ranks keys for the autocomplete dropdown given the partial token text. */
export function sortKeyMatches(keys: ConditionKey[], token: string): ConditionKey[] {
  const normalized = token.toLowerCase();

  const matches = keys.filter((key) => {
    const name = key.name.toLowerCase();
    const label = (key.label || "").toLowerCase();
    return (
      name.startsWith(normalized) ||
      name.includes(normalized) ||
      label.includes(normalized) ||
      isSubsequence(normalized, name)
    );
  });

  const sorted = matches.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStarts = aName.startsWith(normalized);
    const bStarts = bName.startsWith(normalized);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  // As with option values, an exact key can also be a prefix of another key.
  // Hide only the already-complete key and retain its remaining matches.
  const hasExactMatch = !!normalized && sorted.some((key) => key.name.toLowerCase() === normalized);
  return hasExactMatch
    ? sorted.filter((key) => key.name.toLowerCase() !== normalized)
    : sorted;
}
