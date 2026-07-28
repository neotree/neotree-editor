import type { ConditionKey } from "@/lib/conditional-expression";

export interface ConditionToken {
  token: string;
  start: number;
  end: number;
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

  return matches.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStarts = aName.startsWith(normalized);
    const bStarts = bName.startsWith(normalized);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
