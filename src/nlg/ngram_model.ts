/**
 * Dynamic 1-5 Gram Google Books N-Gram Language Model Candidate Builder
 * with Punctuation Integration
 */

import googleNGrams from "./google_books_ngrams.json" with { type: "json" };

interface GoogleBooksNGramData {
  unigrams: Record<string, number>;
  bigrams: Record<string, Record<string, number>>;
  trigrams: Record<string, Record<string, number>>;
  fourgrams: Record<string, Record<string, number>>;
  fivegrams: Record<string, Record<string, number>>;
}

const model: GoogleBooksNGramData = googleNGrams;

export const UNIGRAMS = model.unigrams;
export const BIGRAMS = model.bigrams;
export const TRIGRAMS = model.trigrams;
export const FOURGRAMS = model.fourgrams;
export const FIVEGRAMS = model.fivegrams;

// Natural English punctuation frequencies
export const PUNCTUATION_UNIGRAMS: Record<string, number> = {
  ".": 6000000000,
  ",": 5000000000,
  "?": 500000000,
  "!": 300000000,
  ";": 200000000,
  ":": 200000000
};

export const isWord = (token: string): boolean => /^[a-z0-9]+$/i.test(token);

export const isValidToken = (token: string): boolean =>
  isWord(token) || /^[.,!?;:"]$/.test(token);

export const TOP_UNIGRAMS: string[] = [
  ...Object.keys(UNIGRAMS),
  ...Object.keys(PUNCTUATION_UNIGRAMS)
]
  .filter(isValidToken)
  .sort((a, b) => {
    const countA = UNIGRAMS[a] ?? PUNCTUATION_UNIGRAMS[a] ?? 1;
    const countB = UNIGRAMS[b] ?? PUNCTUATION_UNIGRAMS[b] ?? 1;
    return countB - countA || a.localeCompare(b);
  });

/**
 * Dynamically builds N candidate continuations given prior context words using Google Books 1-5 Grams.
 */
export function getCandidates(context: string[], N: number = 256): string[] {
  if (!Number.isInteger(N) || N <= 0) return [];

  const tokens = context.slice(-4).map(word => word.toLowerCase());
  const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : "";
  const isAfterSentenceEnd = tokens.length === 0 || [".", "?", "!"].includes(lastToken);

  const candidateMaps: (Record<string, number> | undefined)[] = [];

  if (tokens.length >= 4) candidateMaps.push(FIVEGRAMS[tokens.slice(-4).join(" ")]);
  if (tokens.length >= 3) candidateMaps.push(FOURGRAMS[tokens.slice(-3).join(" ")]);
  if (tokens.length >= 2) candidateMaps.push(TRIGRAMS[tokens.slice(-2).join(" ")]);
  if (tokens.length >= 1) candidateMaps.push(BIGRAMS[tokens[tokens.length - 1]]);

  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidates = (frequencies: Record<string, number>): void => {
    const ranked = Object.entries(frequencies)
      .filter(([token]) => (isAfterSentenceEnd ? isWord(token) : isValidToken(token)))
      .sort(([tokenA, countA], [tokenB, countB]) => countB - countA || tokenA.localeCompare(tokenB));

    for (const [token] of ranked) {
      if (!seen.has(token)) {
        seen.add(token);
        candidates.push(token);
        if (candidates.length >= N) return;
      }
    }
  };

  for (const frequencies of candidateMaps) {
    if (frequencies) addCandidates(frequencies);
    if (candidates.length >= N) return candidates.slice(0, N);
  }

  const unigramList = isAfterSentenceEnd ? TOP_UNIGRAMS.filter(isWord) : TOP_UNIGRAMS;
  for (const token of unigramList) {
    if (!seen.has(token)) {
      seen.add(token);
      candidates.push(token);
      if (candidates.length >= N) break;
    }
  }

  return candidates.slice(0, N);
}

/**
 * Legacy support for candidate ranking
 */
export function calculateNGramScore(candidate: string, context: string[]): number {
  const candidates = getCandidates(context, 256);
  const idx = candidates.indexOf(candidate.toLowerCase());
  return idx !== -1 ? 256 - idx : 0;
}

export function rankCandidates(candidates: string[], context: string[]): string[] {
  const dynamic = getCandidates(context, Math.max(256, candidates.length));

  return [...candidates].sort((a, b) => {
    const idxA = dynamic.indexOf(a.toLowerCase());
    const idxB = dynamic.indexOf(b.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function valToRank(val: number, _bitCount: number, N: number): number {
  return val % N;
}

export function rankToVal(rank: number, _bitCount: number, N: number): number {
  return rank % N;
}
