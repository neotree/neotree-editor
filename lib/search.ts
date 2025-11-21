const START_QUOTE_CHARS = ['"', '\u201C']
const END_QUOTE_CHARS = ['"', '\u201D']

/** Escape user input for safe literal use in RegExp constructors. */
export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function normalizeSearchTerm(rawValue: string) {
  const trimmedValue = `${rawValue ?? ""}`.trim()

  if (!trimmedValue) {
    return {
      normalizedValue: "",
      isExactMatch: false,
    }
  }

  const startsWithQuote = START_QUOTE_CHARS.includes(trimmedValue[0])
  const endsWithQuote = END_QUOTE_CHARS.includes(trimmedValue[trimmedValue.length - 1])
  const wrappedInQuotes = trimmedValue.length > 1 && startsWithQuote && endsWithQuote

  const unquotedValue = wrappedInQuotes ? trimmedValue.slice(1, -1) : trimmedValue

  return {
    normalizedValue: unquotedValue.trim().toLowerCase(),
    isExactMatch: wrappedInQuotes,
  }
}
