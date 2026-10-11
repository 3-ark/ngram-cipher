import { describe, it, expect } from "vitest";
import {
  NOUNS,
  VERBS,
  VERBS_PAST,
  ADJECTIVES,
  ADVERBS,
  PROPER_NOUNS,
  DETERMINERS,
  PREPOSITIONS,
  CONJUNCTIONS,
  RELATIVES,
  VOCABULARY,
  TEMPLATES,
  analyzeCarrierText
} from "./nlg/index.js";

describe("Natural Language Generation & Analysis Module", () => {
  it("should verify that each POS list contains 256 unique entries", () => {
    const posLists = [
      { name: "NOUNS", list: NOUNS },
      { name: "VERBS", list: VERBS },
      { name: "VERBS_PAST", list: VERBS_PAST },
      { name: "ADJECTIVES", list: ADJECTIVES },
      { name: "ADVERBS", list: ADVERBS },
      { name: "PROPER_NOUNS", list: PROPER_NOUNS },
      { name: "DETERMINERS", list: DETERMINERS },
      { name: "PREPOSITIONS", list: PREPOSITIONS },
      { name: "CONJUNCTIONS", list: CONJUNCTIONS },
      { name: "RELATIVES", list: RELATIVES },
    ];

    for (const { name, list } of posLists) {
      expect(list.length).toBe(256);
      const unique = new Set(list.map(w => w.toLowerCase()));
      expect(unique.size).toBe(256);
    }
  });

  it("should contain valid templates with 100% data slots carrying bits", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    for (const template of TEMPLATES) {
      expect(template.length).toBeGreaterThan(0);
      const dataSlots = template.filter(s => s.type === "data");
      expect(dataSlots.length).toBe(template.length);
    }
  });

  it("should perform carrier text statistical analysis and perplexity estimation", () => {
    const sampleText = "The major report confirms the national policy. Washington reportedly announced a significant agreement.";
    const analysis = analyzeCarrierText(sampleText);

    expect(analysis.wordCount).toBeGreaterThan(0);
    expect(analysis.sentenceCount).toBe(2);
    expect(analysis.avgSentenceLength).toBeGreaterThan(0);
    expect(analysis.vocabularyCoverage).toBeGreaterThan(0.8);
    expect(analysis.bigramUniqueness).toBeGreaterThan(0);
    expect(Number.isFinite(analysis.perplexityEstimate)).toBe(true);
    expect(analysis.perplexityEstimate).toBeGreaterThan(0);
  });

  it("should return default metrics for empty carrier text", () => {
    const analysis = analyzeCarrierText("");
    expect(analysis.wordCount).toBe(0);
    expect(analysis.sentenceCount).toBe(0);
    expect(analysis.perplexityEstimate).toBe(Infinity);
  });
});
