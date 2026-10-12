/**
 * Google Books vocabulary and carrier-text analysis.
 */

export * from "./ngram_model.js";

import { UNIGRAMS } from "./ngram_model.js";

export const VOCABULARY = Object.keys(UNIGRAMS).filter(word => /^[a-z0-9]+$/i.test(word));

export interface CarrierAnalysis {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  vocabularyCoverage: number;
  bigramUniqueness: number;
  perplexityEstimate: number;
}

export function analyzeCarrierText(text: string): CarrierAnalysis {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];

  if (words.length === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      vocabularyCoverage: 0,
      bigramUniqueness: 0,
      perplexityEstimate: Infinity,
    };
  }

  const totalUnigramCount = Object.values(UNIGRAMS).reduce((total, count) => total + count, 0);
  let recognizedCount = 0;
  let logProbability = 0;

  for (const word of words) {
    const count = UNIGRAMS[word];
    if (count !== undefined) {
      recognizedCount++;
      logProbability += Math.log2(count / totalUnigramCount);
    } else {
      logProbability += Math.log2(1 / (totalUnigramCount * 1000));
    }
  }

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const uniqueBigrams = new Set(bigrams);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength: words.length / (sentences.length || 1),
    vocabularyCoverage: recognizedCount / words.length,
    bigramUniqueness: bigrams.length > 0 ? uniqueBigrams.size / bigrams.length : 0,
    perplexityEstimate: Math.pow(2, -logProbability / words.length),
  };
}
