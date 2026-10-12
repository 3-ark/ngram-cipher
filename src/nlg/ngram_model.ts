/**
 * 1-5 Gram Google Books N-Gram Language Model Calculation Engine
 */

import googleNGrams from "./google_books_ngrams.json" with { type: "json" };

const UNIGRAMS: Record<string, number> = (googleNGrams as any).unigrams || {};
const BIGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).bigrams || {};
const TRIGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).trigrams || {};
const FOURGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).fourgrams || {};
const FIVEGRAMS: Record<string, Record<string, number>> = (googleNGrams as any).fivegrams || {};

/**
 * Calculates 1-5 gram language model score for a candidate word given prior context words.
 */
export function calculateNGramScore(candidate: string, context: string[]): number {
  const w = candidate.toLowerCase();
  let score = 0;

  const len = context.length;
  const w1 = len >= 1 ? context[len - 1].toLowerCase() : "";
  const w2 = len >= 2 ? context[len - 2].toLowerCase() : "";
  const w3 = len >= 3 ? context[len - 3].toLowerCase() : "";
  const w4 = len >= 4 ? context[len - 4].toLowerCase() : "";

  // 1. 5-Gram Score
  if (w1 && w2 && w3 && w4) {
    const key5 = `${w4} ${w3} ${w2} ${w1}`;
    const map5 = FIVEGRAMS[key5];
    if (map5 && map5[w]) {
      score += 100000 * Math.log10(map5[w] + 1);
    }
  }

  // 2. 4-Gram Score
  if (w1 && w2 && w3) {
    const key4 = `${w3} ${w2} ${w1}`;
    const map4 = FOURGRAMS[key4];
    if (map4 && map4[w]) {
      score += 10000 * Math.log10(map4[w] + 1);
    }
  }

  // 3. 3-Gram Score
  if (w1 && w2) {
    const key3 = `${w2} ${w1}`;
    const map3 = TRIGRAMS[key3];
    if (map3 && map3[w]) {
      score += 1000 * Math.log10(map3[w] + 1);
    }
  }

  // 4. 2-Gram Score
  if (w1) {
    const map2 = BIGRAMS[w1];
    if (map2 && map2[w]) {
      score += 100 * Math.log10(map2[w] + 1);
    }
  }

  // 5. Unigram Frequency Score
  if (UNIGRAMS[w]) {
    score += Math.log10(UNIGRAMS[w] + 1);
  }

  return score;
}

/**
 * Deterministically ranks candidate words for a slot using 1-5 gram Google Books context scoring.
 * Words with higher N-gram scores appear first. Ties are broken deterministically by unigram frequency / original index.
 */
export function rankCandidates(candidates: string[], context: string[]): string[] {
  if (!candidates || candidates.length <= 1) {
    return candidates ? [...candidates] : [];
  }

  const scored = candidates.map((word, originalIndex) => ({
    word,
    originalIndex,
    score: calculateNGramScore(word, context),
    unigramFreq: UNIGRAMS[word.toLowerCase()] || 0
  }));

  // Sort descending by score; break ties by unigram frequency, then by originalIndex
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.unigramFreq !== a.unigramFreq) {
      return b.unigramFreq - a.unigramFreq;
    }
    return a.originalIndex - b.originalIndex;
  });

  return scored.map(item => item.word);
}

/**
 * 1-to-1 bijective mapping between bit val (0..N-1) and candidate rank (0..N-1).
 */
export function valToRank(val: number, _bitCount: number, N: number): number {
  return val % N;
}

export function rankToVal(rank: number, _bitCount: number, N: number): number {
  return rank % N;
}
