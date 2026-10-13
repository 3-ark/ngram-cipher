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
  PRONOUNS,
  VOCABULARY,
  TEMPLATES,
  POETRY_TEMPLATES,
  analyzeCarrierText
} from "./nlg/index.js";

describe("Natural Language Generation & Analysis Module", () => {
  it("should verify that POS lists contain unique words and power-of-two sizes", () => {
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
      { name: "PRONOUNS", list: PRONOUNS },
    ];

    for (const { name, list } of posLists) {
      expect(list.length, name).toBeGreaterThanOrEqual(8);
      expect(Number.isInteger(Math.log2(list.length)), name).toBe(true);
      const unique = new Set(list.map(w => w.toLowerCase()));
      expect(unique.size, name).toBe(list.length);
    }
  });

  it("should keep function-word dictionaries free of unrelated vocabulary", () => {
    expect(DETERMINERS).toEqual([
      "the","some","any","no","our","your","their","its"
    ]);
    expect(PREPOSITIONS).not.toContain("acrossboard");
    expect(PREPOSITIONS).not.toContain("backwardsward");
    expect(CONJUNCTIONS).not.toContain("ability");
    expect(RELATIVES).not.toContain("aircraft");
    expect(TEMPLATES[0][3].list).not.toContain("rejected");
    expect(TEMPLATES[1][2].list).toContain("rejected");
    expect(TEMPLATES[1][2].list).not.toContain("grew");
    expect(TEMPLATES[2][3].list).toContain("grew");
    expect(TEMPLATES[2][3].list).not.toContain("rejected");
    expect(TEMPLATES[6][6].list).not.toContain("despite");
    expect(PRONOUNS).toContain("it");
    expect(PRONOUNS).toContain("they");
    expect(TEMPLATES[1][0].list).toBe(PRONOUNS);
    expect(TEMPLATES[5][3].label).toBe("SC");
    expect(TEMPLATES[7][2].list).toEqual(["that","which"]);
  });

  it("should contain valid templates with 100% data slots carrying bits", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    for (const template of TEMPLATES) {
      expect(template.length).toBeGreaterThan(0);
      const dataSlots = template.filter(s => s.type === "data");
      expect(dataSlots.length).toBe(template.length);
    }
  });

  it("should provide eight poetry templates with distinct sentence lengths and power-of-two slot lists", () => {
    expect(POETRY_TEMPLATES).toHaveLength(8);
    expect(new Set(POETRY_TEMPLATES.map(template => template.length)).size).toBe(8);
    for (const template of POETRY_TEMPLATES) {
      expect(template.every(slot => slot.type === "data" && slot.list.length >= 4)).toBe(true);
    }
  });

  it("should perform carrier text statistical analysis and perplexity estimation", () => {
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

  it("should return default metrics for empty carrier text", () => {
    const analysis = analyzeCarrierText("");
    expect(analysis.wordCount).toBe(0);
    expect(analysis.sentenceCount).toBe(0);
    expect(analysis.perplexityEstimate).toBe(Infinity);
  });
});
