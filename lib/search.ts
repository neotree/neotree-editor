const QUOTE_PAIRS: Record<string, string> = {
  '"': '"',
  "'": "'",
  "\u201C": "\u201D",
  "\u2018": "\u2019",
}

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

  const startQuote = trimmedValue[0]
  const endQuote = trimmedValue[trimmedValue.length - 1]
  const expectedEndQuote = QUOTE_PAIRS[startQuote]
  const wrappedInQuotes = trimmedValue.length > 1 && !!expectedEndQuote && expectedEndQuote === endQuote

  const unquotedValue = wrappedInQuotes ? trimmedValue.slice(1, -1) : trimmedValue

  return {
    normalizedValue: wrappedInQuotes ? unquotedValue.trim() : unquotedValue.trim().toLowerCase(),
    isExactMatch: wrappedInQuotes,
  }
}
