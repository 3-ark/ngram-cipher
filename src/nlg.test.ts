import { describe, it, expect } from "vitest";
import {
  VOCABULARY,
  UNIGRAMS,
  analyzeCarrierText,
  getCandidates
} from "./nlg/index.js";

describe("Google Books N-gram language model", () => {
  it("builds candidate lists from Google Books counts with n-gram backoff", () => {
    const candidatesStart = getCandidates([], 4);
    expect(candidatesStart).toHaveLength(4);
    expect(candidatesStart[0]).toBe("the");

    const candidatesAfterThe = getCandidates(["the"], 2);
    expect(candidatesAfterThe).toHaveLength(2);
    expect(candidatesAfterThe).toContain("same");

    const candidatesInThe = getCandidates(["in", "the"], 4);
    expect(candidatesInThe).toHaveLength(4);
    expect(candidatesInThe).toContain("united");
  });

  it("derives its vocabulary from the Google Books unigram model", () => {
    expect(VOCABULARY.length).toBeGreaterThan(500);
    expect(new Set(VOCABULARY).size).toBe(VOCABULARY.length);
    expect(VOCABULARY).toContain("the");
    expect(VOCABULARY).toContain("united");
    expect(VOCABULARY).toHaveLength(Object.keys(UNIGRAMS).filter(word => /^[a-z0-9]+$/i.test(word)).length);
  });

  it("analyzes carrier text using the model vocabulary and unigram frequencies", () => {
    const sampleText = "The major report confirms the national policy. Washington reportedly announced a significant agreement.";
    const analysis = analyzeCarrierText(sampleText);

    expect(analysis.wordCount).toBeGreaterThan(0);
    expect(analysis.sentenceCount).toBe(2);
    expect(analysis.avgSentenceLength).toBeGreaterThan(0);
    expect(analysis.vocabularyCoverage).toBeGreaterThan(0.7);
    expect(analysis.bigramUniqueness).toBeGreaterThan(0);
    expect(Number.isFinite(analysis.perplexityEstimate)).toBe(true);
    expect(analysis.perplexityEstimate).toBeGreaterThan(0);
  });

  it("returns default metrics for empty carrier text", () => {
    const analysis = analyzeCarrierText("");
    expect(analysis.wordCount).toBe(0);
    expect(analysis.sentenceCount).toBe(0);
    expect(analysis.perplexityEstimate).toBe(Infinity);
  });
});
