import { describe, it, expect } from "vitest";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";
import { EncodingError } from "./config/index.js";
import { DETERMINERS, PRONOUNS } from "./nlg/index.js";

describe("Reversible Encoding and Decoding Module", () => {
  it("should round-trip byte arrays to English prose and back", () => {
    const testBytes = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
    const text = bytesToEnglishText(testBytes);

    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);

    const recoveredBytes = englishTextToBytes(text);
    expect(Array.from(recoveredBytes)).toEqual(Array.from(testBytes));
  });

  it("should round-trip byte arrays in Haiku-inspired style", () => {
    const testBytes = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
    const config = { style: "haiku" as const, sentenceEndingVariance: true };
    const text = bytesToEnglishText(testBytes, config);

    expect(text).toContain("\n");
    expect(Array.from(englishTextToBytes(text, config))).toEqual(Array.from(testBytes));
  });

  it("should round-trip multi-stanza Haiku text with punctuation variance and fixed period settings", () => {
    const testPayload = new Uint8Array([12, 34, 56, 78, 90, 123, 145, 167, 189, 201, 223, 245, 255, 0, 15, 30, 45, 60]);

    // Test with sentence ending variance (punctuation variance: . ! ? ...)
    const configVar = { style: "haiku" as const, sentenceEndingVariance: true };
    const haikuTextVar = bytesToEnglishText(testPayload, configVar);
    expect(haikuTextVar).toContain("\n");
    const stanzasVar = haikuTextVar.split("\n\n");
    expect(stanzasVar.length).toBeGreaterThanOrEqual(1);
    expect(Array.from(englishTextToBytes(haikuTextVar, configVar))).toEqual(Array.from(testPayload));

    // Test with fixed period ending setting
    const configFixed = { style: "haiku" as const, sentenceEndingVariance: false };
    const haikuTextFixed = bytesToEnglishText(testPayload, configFixed);
    expect(haikuTextFixed).toContain("\n");
    expect(Array.from(englishTextToBytes(haikuTextFixed, configFixed))).toEqual(Array.from(testPayload));
  });

  it("should support fixed period ending configuration", () => {
    const testBytes = new Uint8Array([10, 20, 30, 40, 50, 60]);
    const text = bytesToEnglishText(testBytes, { sentenceEndingVariance: false });

    const sentenceEnders = [...text.matchAll(/[!?\.]+/g)].map(m => m[0]);
    for (const ender of sentenceEnders) {
      expect(ender).toBe(".");
    }

    const recovered = englishTextToBytes(text, { sentenceEndingVariance: false });
    expect(Array.from(recovered)).toEqual(Array.from(testBytes));
  });

  it("should encode revised clause and pronoun templates without losing bits", () => {
    const config = { sentenceEndingVariance: false };
    const clauseBytes = new Uint8Array([0xa0, 0x12, 0x34, 0x56]);
    const clauseText = bytesToEnglishText(clauseBytes, config);
    const firstClause = clauseText.split(/[.!?]/)[0].split(/\s+/);

    expect(firstClause).toHaveLength(8);
    expect(DETERMINERS).toContain(firstClause[0].toLowerCase());
    expect(firstClause[3]).toMatch(/^(after|while|when|before|since|though|because|if)$/);
    expect(Array.from(englishTextToBytes(clauseText, config))).toEqual(Array.from(clauseBytes));

    const pronounBytes = new Uint8Array([0xc0, 0x12, 0x34, 0x56]);
    const pronounText = bytesToEnglishText(pronounBytes, config);

    expect(PRONOUNS.map(word => word.toLowerCase())).toContain(
      pronounText.split(/\s+/)[0].toLowerCase()
    );
    expect(Array.from(englishTextToBytes(pronounText, config))).toEqual(Array.from(pronounBytes));
  });

  it("should throw EncodingError on invalid token in cipher text", () => {
    const invalidText = "The major non-existent-xyz-word confirms the national policy.";
    expect(() => englishTextToBytes(invalidText)).toThrow(EncodingError);
  });

  it("should return empty Uint8Array for empty input text", () => {
    expect(Array.from(englishTextToBytes(""))).toEqual([]);
    expect(Array.from(englishTextToBytes("   "))).toEqual([]);
  });
});
