/**
 * Dynamic 1-5 Gram Google Books N-Gram Language Model Candidate Builder
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

const isWord = (word: string): boolean => /^[a-z0-9]+$/i.test(word);

export const TOP_UNIGRAMS: string[] = Object.keys(UNIGRAMS)
  .filter(isWord)
  .sort((a, b) => UNIGRAMS[b] - UNIGRAMS[a] || a.localeCompare(b));

/**
 * Dynamically builds N candidate continuations given prior context words using Google Books 1-5 Grams.
 */
export function getCandidates(context: string[], N: number = 256): string[] {
  if (!Number.isInteger(N) || N <= 0) return [];

  const words = context.slice(-4).map(word => word.toLowerCase());
  const candidateMaps: (Record<string, number> | undefined)[] = [];

  if (words.length >= 4) candidateMaps.push(FIVEGRAMS[words.slice(-4).join(" ")]);
  if (words.length >= 3) candidateMaps.push(FOURGRAMS[words.slice(-3).join(" ")]);
  if (words.length >= 2) candidateMaps.push(TRIGRAMS[words.slice(-2).join(" ")]);
  if (words.length >= 1) candidateMaps.push(BIGRAMS[words[words.length - 1]]);

  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidates = (frequencies: Record<string, number>): void => {
    const ranked = Object.entries(frequencies)
      .filter(([word]) => isWord(word))
      .sort(([wordA, countA], [wordB, countB]) => countB - countA || wordA.localeCompare(wordB));

    for (const [word] of ranked) {
      if (!seen.has(word)) {
        seen.add(word);
        candidates.push(word);
        if (candidates.length >= N) return;
      }
    }
  };

  for (const frequencies of candidateMaps) {
    if (frequencies) addCandidates(frequencies);
    if (candidates.length >= N) return candidates;
  }

  for (const word of TOP_UNIGRAMS) {
    if (!seen.has(word)) {
      seen.add(word);
      candidates.push(word);
      if (candidates.length >= N) break;
    }
  }

  return candidates;
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
