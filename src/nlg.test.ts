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
  TEMPLATES,
  POETRY_TEMPLATES,
  analyzeCarrierText,
  calculateNGramScore,
  rankCandidates,
  getNounCategory,
  valToRank,
  rankToVal
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
      "the","a","this","some","any","no","one","its"
    ]);
    expect(PREPOSITIONS).not.toContain("acrossboard");
    expect(PREPOSITIONS).not.toContain("backwardsward");
    expect(CONJUNCTIONS).not.toContain("ability");
    expect(RELATIVES).not.toContain("aircraft");
    expect(TEMPLATES[0][3].list).not.toContain("rejected");
    expect(TEMPLATES[0][3].list).toContain("grew");
    expect(PRONOUNS).toContain("it");
    expect(PRONOUNS).toContain("they");
    expect(TEMPLATES[0][4]).toEqual({ type: "filler", list: ["in"], label: "p" });
    expect(TEMPLATES[1][0]).toEqual({ type: "filler", list: ["if"], label: "c" });
    expect(TEMPLATES[1][1].list).toEqual(["the","some","no","any"]);
    expect(TEMPLATES[1][2].list).toHaveLength(32);
    expect(TEMPLATES[1][3].list).toHaveLength(32);
    expect(TEMPLATES[1][3].punctuationAfter).toBe(",");
    expect(TEMPLATES[4][2]).toEqual({ type: "filler", list: ["which"], label: "c" });
    expect(TEMPLATES[3][0]).toEqual({ type: "filler", list: ["after"], label: "p" });
    expect(TEMPLATES[3][1].punctuationAfter).toBe(",");
    expect(TEMPLATES[3][1].list).toHaveLength(32);
    expect(TEMPLATES[3][2].punctuationAfter).toBe(",");
    expect(TEMPLATES[5]).toHaveLength(12);
    expect(TEMPLATES[0][2].list.every(noun => getNounCategory(noun) === "METRIC")).toBe(true);
    expect(TEMPLATES[9]).toHaveLength(18);
    expect(TEMPLATES[9][2]).toEqual({ type: "filler", list: ["including"], label: "c" });
    expect(TEMPLATES[9][9]).toEqual({ type: "filler", list: ["because"], label: "c" });
    expect(TEMPLATES[9][5].list).toContain("requested");
    expect(TEMPLATES[9][5].list).toHaveLength(16);
    expect(TEMPLATES[9][12].list).toContain("remained");
    expect(TEMPLATES[9][12].list).toHaveLength(8);
    expect(TEMPLATES[2].map(slot => slot.label)).toEqual([
      "d", "N", "VP", "d", "A", "N", "p", "NP"
    ]);
  });

  it("should use role-matched vocabularies in transitive and trend clauses", () => {
    expect(TEMPLATES[2][1].list).toContain("company");
    expect(TEMPLATES[2][1].list).not.toContain("match");
    expect(TEMPLATES[2][2].list).toContain("defended");
    expect(TEMPLATES[2][5].list).toContain("treaty");
    expect(TEMPLATES[1][2].list).toContain("drought");
    expect(TEMPLATES[1][3].list).toContain("persisted");
    expect(TEMPLATES[1][2].list.some(word => TEMPLATES[1][3].list.includes(word)))
      .toBe(false);
    expect(TEMPLATES[4][1].list).toContain("coalition");
    expect(TEMPLATES[4][3].list).toContain("officials");
    expect(TEMPLATES[5][5]).toEqual({ type: "filler", list: ["in"], label: "p" });
    expect(TEMPLATES[5][6].list.map(w => w.toLowerCase())).toContain("london");
    expect(TEMPLATES[7][9]).toEqual({ type: "filler", list: ["but"], label: "c" });
    expect(TEMPLATES[4][8].label).toBe("d");
    expect(TEMPLATES[3][2].list).toContain("however");
    expect(TEMPLATES[2][1].list).toHaveLength(64);
    expect(TEMPLATES[2][2].list).toHaveLength(32);
    expect(TEMPLATES[2][5].list).toHaveLength(64);
    expect(TEMPLATES[7].filter(slot => slot.type === "data").length).toBe(13);
    const longTemplateDataBits = TEMPLATES[7]
      .filter(slot => slot.type === "data")
      .reduce((bits, slot) => bits + Math.log2(slot.list.length), 0);
    expect(longTemplateDataBits).toBeGreaterThanOrEqual(45);
    const causalTemplate = TEMPLATES[5];
    expect(causalTemplate[7].list).toEqual(["because", "as", "since", "while"]);
    expect(causalTemplate[6].list).toHaveLength(64);
    expect(causalTemplate.filter(slot => slot.type === "data")
      .filter(slot => slot.list.some(word => ["therefore", "hence", "whereas"].includes(word))))
      .toHaveLength(0);
    expect(causalTemplate.map(slot => slot.list.length)).toEqual([
      16, 16, 32, 16, 16, 1, 64, 4, 8, 16, 32, 16
    ]);
    for (const slot of [TEMPLATES[0][2], TEMPLATES[5][2]]) {
      expect(slot.list.every(noun => getNounCategory(noun) === "METRIC")).toBe(true);
    }
    expect(TEMPLATES[2][1].list.every(noun => getNounCategory(noun) === "AGENT")).toBe(true);
    expect(TEMPLATES[1][2].list
      .filter(noun => !["EVENT","METRIC"].includes(getNounCategory(noun)))).toEqual([]);
    expect(TEMPLATES[4][1].list.every(noun => getNounCategory(noun) === "AGENT"))
      .toBe(true);
    expect(TEMPLATES[5][10].list
      .filter(noun => !["EVENT","METRIC"].includes(getNounCategory(noun)))).toEqual([]);
    expect(TEMPLATES[7][7].list).toEqual(["the","some","no","any"]);
    expect(TEMPLATES[7][13].list).toEqual(["the","some","no","any"]);
  });

  it("should contain valid templates with 100% data slots carrying bits", () => {
    expect(TEMPLATES.length).toBeGreaterThan(0);
    expect(new Set(TEMPLATES.map(template => template.length)).size).toBe(TEMPLATES.length);
    expect(TEMPLATES.map(template => template.length)).toEqual([6, 7, 8, 9, 10, 12, 14, 15, 17, 18]);
    for (const template of TEMPLATES) {
      expect(template.length).toBeGreaterThan(0);
      for (const slot of template) {
        if (slot.type === "data") {
          expect(Number.isInteger(Math.log2(slot.list.length))).toBe(true);
          expect(new Set(slot.list.map(word => word.toLowerCase())).size).toBe(slot.list.length);
        } else {
          expect(slot.list.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("should provide eight poetry templates with distinct sentence lengths and power-of-two slot lists", () => {
    expect(POETRY_TEMPLATES).toHaveLength(8);
    expect(new Set(POETRY_TEMPLATES.map(template => template.length)).size).toBe(8);
    for (const template of POETRY_TEMPLATES) {
      expect(template.every(slot => slot.type === "data" && slot.list.length >= 4)).toBe(true);
    }
  });

  it("should calculate 5-gram language model scores and rank candidates accordingly", () => {
    const context = ["stated", "tuesday", "in", "a"];
    const scorePublic = calculateNGramScore("public", context);
    const scoreRandom = calculateNGramScore("zebra", context);

    expect(scorePublic).toBeGreaterThan(scoreRandom);

    const candidates = ["zebra", "public", "apple"];
    const ranked = rankCandidates(candidates, context);
    expect(ranked[0]).toBe("public");
  });

  it("should classify nouns and score noun-verb affinity to prevent mismatched pairs", () => {
    expect(getNounCategory("president")).toBe("AGENT");
    expect(getNounCategory("report")).toBe("DOCUMENT");
    expect(getNounCategory("market")).toBe("METRIC");
    expect(getNounCategory("disease")).toBe("EVENT");
    expect(getNounCategory("database")).toBe("SYSTEM_OBJECT");

    // Event noun ("disease") should rank event/occurrence verbs above mismatched speech verbs ("warned")
    const diseaseContext = ["a", "disease"];
    const diseaseCandidates = ["warned", "spread", "struck", "worsened"];
    const rankedDisease = rankCandidates(diseaseCandidates, diseaseContext);
    expect(["spread", "struck", "worsened"]).toContain(rankedDisease[0]);
    expect(rankedDisease[rankedDisease.length - 1]).toBe("warned");

    // Metric noun ("market") should rank trend verbs ("rose", "fell") above speech verbs ("warned")
    const marketContext = ["the", "major", "market"];
    const marketCandidates = ["warned", "rose", "fell", "grew"];
    const rankedMarket = rankCandidates(marketCandidates, marketContext);
    expect(["rose", "fell", "grew"]).toContain(rankedMarket[0]);
    expect(rankedMarket[rankedMarket.length - 1]).toBe("warned");
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

  it("should match 5-gram candidates regardless of letter casing", () => {
    const context = ["stated", "on", "tuesday", "in"];
    const scoreLower = calculateNGramScore("washington", context);
    const scoreUpper = calculateNGramScore("Washington", context);
    expect(scoreLower).toBeGreaterThan(10000);
    expect(scoreUpper).toEqual(scoreLower);
  });

  it("should correctly identify subject noun by skipping objects of prepositional phrases", () => {
    // In "the president spoke about the crisis", "crisis" is object of preposition "about".
    // Subject noun is "president" (AGENT), so "announced" should receive AGENT boost (+30) not EVENT penalty (-200).
    const context = ["the", "president", "spoke", "about", "the", "crisis"];
    const scoreAnnounced = calculateNGramScore("announced", context);
    expect(scoreAnnounced).toBeGreaterThan(0);
  });

  it("should not penalize repeated structural/function words and pronouns in context", () => {
    const contextWithPronoun = ["she", "said", "that", "she"];
    const scorePronounRepetition = calculateNGramScore("she", contextWithPronoun);
    // Structural words like "she" should not suffer -500 penalty
    expect(scorePronounRepetition).toBeGreaterThan(-100);

    const contextWithNoun = ["the", "report", "showed", "the", "report"];
    const scoreNounRepetition = calculateNGramScore("report", contextWithNoun);
    // Non-function words like "report" repeat in context, triggering -500 penalty
    expect(scoreNounRepetition).toBeLessThan(-400);
  });

  it("should support poetic personification for expressive verbs and penalize formal journalistic verbs", () => {
    const context = ["the", "moon"];
    const scoreWhispered = calculateNGramScore("whispered", context);
    const scoreArgued = calculateNGramScore("argued", context);
    expect(scoreWhispered).toBeGreaterThan(0);
    expect(scoreArgued).toBeLessThan(0);
  });

  it("should skip prepositional objects with multi-word determiner and adjective modifier chains", () => {
    // "after the initial investigation" has preposition "after" at prev3 from "investigation".
    // Subject noun scan should skip "investigation" and select "president".
    const context = ["the", "president", "spoke", "after", "the", "initial", "investigation"];
    const scoreAnnounced = calculateNGramScore("announced", context);
    expect(scoreAnnounced).toBeGreaterThan(0);
  });

  it("should enforce bijective mapping, bounds checking, and handle bitCount <= 0", () => {
    expect(valToRank(200, 8, 256)).toBe(200);
    expect(rankToVal(200, 8, 256)).toBe(200);
    expect(valToRank(0, 0, 256)).toBe(0);
    expect(rankToVal(0, 0, 256)).toBe(0);

    expect(() => valToRank(3, 2, 3)).toThrow("less than bit capacity");
    expect(() => valToRank(4, 2, 256)).toThrow("out of bounds");
    expect(() => rankToVal(4, 2, 256)).toThrow("out of bounds");
  });
});
