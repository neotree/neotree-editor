// Lightweight fuzzy suggestion used for "did you mean" hints.

function isSubsequence(needle: string, haystack: string): boolean {
  if (!needle) return true;
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Returns the closest candidate to `input`, or undefined when nothing is close
 * enough to be a useful suggestion.
 */
export function suggestClosest(input: string, candidates: string[]): string | undefined {
  const needle = input.toLowerCase();
  if (!needle) return undefined;

  let best: string | undefined;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const value = candidate.toLowerCase();
    if (value === needle) return candidate;

    let score = levenshtein(needle, value);
    if (value.startsWith(needle) || value.includes(needle) || isSubsequence(needle, value)) {
      score -= 1;
    }
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Only suggest when reasonably close (scaled to the longer word).
  const threshold = Math.max(2, Math.ceil(Math.max(needle.length, (best || "").length) * 0.5));
  return bestScore <= threshold ? best : undefined;
}
