/**
 * Dynamic 1-5 Gram Google Books N-Gram Language Model Candidate Builder
 */

import googleNGrams from "./google_books_ngrams.json" with { type: "json" };

export const UNIGRAMS: Record<string, number> = (googleNGrams as any).unigrams || {};
export const BIGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).bigrams || {};
export const TRIGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).trigrams || {};
export const FOURGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).fourgrams || {};
export const FIVEGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).fivegrams || {};

export const TOP_UNIGRAMS: string[] = Object.keys(UNIGRAMS).sort((a, b) => (UNIGRAMS[b] || 0) - (UNIGRAMS[a] || 0));

/**
 * Dynamically builds N candidate continuations given prior context words using Google Books 1-5 Grams.
 */
export function getCandidates(context: string[], N: number = 256): string[] {
  const candScores: Record<string, number> = {};
  const len = context.length;
  const w1 = len >= 1 ? context[len - 1].toLowerCase() : "";
  const w2 = len >= 2 ? context[len - 2].toLowerCase() : "";
  const w3 = len >= 3 ? context[len - 3].toLowerCase() : "";
  const w4 = len >= 4 ? context[len - 4].toLowerCase() : "";

  // 1. 5-gram continuations
  if (w1 && w2 && w3 && w4) {
    const key5 = `${w4} ${w3} ${w2} ${w1}`;
    const map5 = FIVEGRAMS[key5];
    if (map5) {
      for (const [w, freq] of Object.entries(map5)) {
        candScores[w] = (candScores[w] || 0) + 1000000 * Math.log10(freq + 1);
      }
    }
  }

  // 2. 4-gram continuations
  if (w1 && w2 && w3) {
    const key4 = `${w3} ${w2} ${w1}`;
    const map4 = FOURGRAMS[key4];
    if (map4) {
      for (const [w, freq] of Object.entries(map4)) {
        candScores[w] = (candScores[w] || 0) + 100000 * Math.log10(freq + 1);
      }
    }
  }

  // 3. 3-gram continuations
  if (w1 && w2) {
    const key3 = `${w2} ${w1}`;
    const map3 = TRIGRAMS[key3];
    if (map3) {
      for (const [w, freq] of Object.entries(map3)) {
        candScores[w] = (candScores[w] || 0) + 10000 * Math.log10(freq + 1);
      }
    }
  }

  // 4. 2-gram continuations
  if (w1) {
    const map2 = BIGRAMS[w1];
    if (map2) {
      for (const [w, freq] of Object.entries(map2)) {
        candScores[w] = (candScores[w] || 0) + 100 * Math.log10(freq + 1);
      }
    }
  }

  // Sort matched candidates by score
  const matched = Object.keys(candScores).sort((a, b) => {
    if (candScores[b] !== candScores[a]) return candScores[b] - candScores[a];
    const uA = UNIGRAMS[a] || 0;
    const uB = UNIGRAMS[b] || 0;
    if (uB !== uA) return uB - uA;
    return a.localeCompare(b);
  });

  const candidates: string[] = [];
  const set = new Set<string>();
  for (const c of matched) {
    if (!set.has(c)) {
      set.add(c);
      candidates.push(c);
      if (candidates.length >= N) break;
    }
  }

  // Fill remaining slots up to N with top unigrams
  if (candidates.length < N) {
    for (const u of TOP_UNIGRAMS) {
      if (!set.has(u)) {
        set.add(u);
        candidates.push(u);
        if (candidates.length >= N) break;
      }
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
