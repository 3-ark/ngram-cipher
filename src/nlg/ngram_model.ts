/**
 * Dynamic 1-5 Gram Google Books N-Gram Language Model Candidate Builder
 * with Natural Punctuation Flow & Clean Vocabulary Filtering
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

// Single-letter OCR noise / fragment blacklists
const NOISE_TOKENS = new Set([
  "b", "c", "d", "e", "f", "g", "h", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "et", "al"
]);

export const isCleanWord = (token: string): boolean => {
  if (!/^[a-z0-9]+$/i.test(token)) return false;
  const lower = token.toLowerCase();
  if (NOISE_TOKENS.has(lower)) return false;
  return true;
};

export const isPunctuation = (token: string): boolean => /^[.,!?;:"]$/.test(token);

export const isValidToken = (token: string): boolean => isCleanWord(token) || isPunctuation(token);

// Baseline English punctuation frequencies
export const PUNCTUATION_UNIGRAMS: Record<string, number> = {
  ".": 6000000000,
  ",": 5000000000,
  "?": 500000000,
  "!": 300000000,
  ";": 200000000,
  ":": 200000000
};

export const TOP_UNIGRAMS: string[] = [
  ...Object.keys(UNIGRAMS).filter(isCleanWord),
  ...Object.keys(PUNCTUATION_UNIGRAMS)
].sort((a, b) => {
  const countA = UNIGRAMS[a] ?? PUNCTUATION_UNIGRAMS[a] ?? 1;
  const countB = UNIGRAMS[b] ?? PUNCTUATION_UNIGRAMS[b] ?? 1;
  return countB - countA || a.localeCompare(b);
});

/**
 * Dynamically builds N candidate continuations given prior context words using Google Books 1-5 Grams.
 */
export function getCandidates(context: string[], N: number = 32): string[] {
  if (!Number.isInteger(N) || N <= 0) return [];

  const tokens = context.slice(-10).map(word => word.toLowerCase());
  const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : "";

  // Count consecutive words since last sentence boundary or start
  let wordsInSentence = 0;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (isPunctuation(tokens[i])) {
      if ([".", "?", "!"].includes(tokens[i])) break;
    } else {
      wordsInSentence++;
    }
  }

  const isAfterPunctuation = isPunctuation(lastToken);
  const allowPunctuation = !isAfterPunctuation && wordsInSentence >= 4;

  const candidateMaps: (Record<string, number> | undefined)[] = [];
  const searchTokens = tokens.filter(isCleanWord);

  if (searchTokens.length >= 4) candidateMaps.push(FIVEGRAMS[searchTokens.slice(-4).join(" ")]);
  if (searchTokens.length >= 3) candidateMaps.push(FOURGRAMS[searchTokens.slice(-3).join(" ")]);
  if (searchTokens.length >= 2) candidateMaps.push(TRIGRAMS[searchTokens.slice(-2).join(" ")]);
  if (searchTokens.length >= 1) candidateMaps.push(BIGRAMS[searchTokens[searchTokens.length - 1]]);

  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidates = (frequencies: Record<string, number>): void => {
    const ranked = Object.entries(frequencies)
      .filter(([token]) => (allowPunctuation ? isValidToken(token) : isCleanWord(token)))
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
    if (candidates.length >= N) break;
  }

  if (candidates.length < N) {
    const unigramList = allowPunctuation ? TOP_UNIGRAMS : TOP_UNIGRAMS.filter(isCleanWord);
    for (const token of unigramList) {
      if (!seen.has(token)) {
        seen.add(token);
        candidates.push(token);
        if (candidates.length >= N) break;
      }
    }
  }

  // Ensure punctuation marks are available when punctuation is allowed
  if (allowPunctuation) {
    const pMarks = [".", ",", "?", "!"];
    for (const p of pMarks) {
      if (!seen.has(p) && candidates.length > 0) {
        // Guarantee period and comma in candidate list by replacing tail candidates
        candidates[candidates.length - 1] = p;
        seen.add(p);

        // If length exceeds N after slicing, break
        if (candidates.length >= N) break;
      }
    }
  }

  return candidates.slice(0, N);
}

/**
 * Legacy support for candidate ranking
 */
export function calculateNGramScore(candidate: string, context: string[]): number {
  const candidates = getCandidates(context, 32);
  const idx = candidates.indexOf(candidate.toLowerCase());
  return idx !== -1 ? 32 - idx : 0;
}

export function rankCandidates(candidates: string[], context: string[]): string[] {
  const dynamic = getCandidates(context, Math.max(32, candidates.length));

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
