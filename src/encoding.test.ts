import { describe, it, expect } from "vitest";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";
import { EncodingError } from "./config/index.js";
import { DETERMINERS } from "./nlg/index.js";

describe("Reversible Encoding and Decoding Module", () => {
  it("should round-trip byte arrays to English prose and back", () => {
    const testBytes = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
    const text = bytesToEnglishText(testBytes);

    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);

    const recoveredBytes = englishTextToBytes(text);
    expect(Array.from(recoveredBytes)).toEqual(Array.from(testBytes));
  });

  it("should preserve larger payloads across multiple revised news templates", () => {
    for (const length of [16, 24, 32, 64, 129, 256, 512]) {
      const payload = Uint8Array.from({ length }, (_, index) => (index * 73 + length) & 0xff);
      const text = bytesToEnglishText(payload);

      expect(Array.from(englishTextToBytes(text)), `payload length ${length}`).toEqual(Array.from(payload));
    }
  });

  it("should avoid reusing a news sentence structure within the previous two sentences", () => {
    const payload = Uint8Array.from(
      { length: 1024 },
      (_, index) => (index * 73 + 19) & 0xff
    );
    const text = bytesToEnglishText(payload);
    const sentenceLengths = text
      .split(/(?<=[.!?…]["'”’]*)\s+/)
      .filter(sentence => sentence.length > 0)
      .map(sentence => sentence.replace(/^[ "'“‘]+|[ "'”’.,!?;:]+$/g, "").split(/\s+/).length);

    expect(sentenceLengths.length).toBeGreaterThan(10);
    expect(sentenceLengths).toContain(8);
    for (let index = 1; index < sentenceLengths.length; index++) {
      expect(sentenceLengths[index]).not.toBe(sentenceLengths[index - 1]);
      if (index >= 2) {
        expect(sentenceLengths[index]).not.toBe(sentenceLengths[index - 2]);
      }
    }
    expect(Array.from(englishTextToBytes(text))).toEqual(Array.from(payload));
  });

  it("should use the after/discourse template less often while preserving round trips", () => {
    let afterDiscourseCount = 0;
    let sentenceCount = 0;

    for (let seed = 0; seed < 32; seed++) {
      let state = seed + 1;
      const payload = Uint8Array.from({ length: 256 }, () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return state & 0xff;
      });
      const text = bytesToEnglishText(payload);
      const sentences = text.match(/[^.!?…]+[.!?…]+/g) ?? [];

      afterDiscourseCount += (text.match(/\bAfter [a-z]+, [a-z]+,/g) ?? []).length;
      sentenceCount += sentences.length;
      expect(Array.from(englishTextToBytes(text))).toEqual(Array.from(payload));
    }

    expect(afterDiscourseCount / sentenceCount).toBeLessThan(0.1);
  });

  it("should use restrained causal syntax and round-trip the payload", () => {
    let causalCount = 0;
    let sentenceCount = 0;
    for (let seed = 0; seed < 16; seed++) {
      const payload = Uint8Array.from(
        { length: 128 },
        (_, index) => (seed * 37 + index * 73 + 11) & 0xff
      );
      const text = bytesToEnglishText(payload);
      const sentences = text.match(/[^.!?…]+[.!?…]+/g) ?? [];
      causalCount += (text.match(/\b(?:because|as|since|while)\b/gi) ?? []).length;
      sentenceCount += sentences.length;
      expect(text).not.toMatch(/\b(?:therefore|hence|whereas)\b/i);
      expect(Array.from(englishTextToBytes(text))).toEqual(Array.from(payload));
    }
    expect(causalCount).toBeGreaterThan(0);
    expect(causalCount / sentenceCount).toBeLessThanOrEqual(0.35);
  });

  it("should generate both conditional and relative-clause patterns", () => {
    let sawConditional = false;
    let sawRelativeClause = false;
    let sawHowever = false;
    for (let seed = 0; seed < 32; seed++) {
      const payload = Uint8Array.from(
        { length: 256 },
        (_, index) => (seed * 53 + index * 97 + 7) & 0xff
      );
      const text = bytesToEnglishText(payload);
      sawConditional ||= /\bIf\b[^.!?…]*,\s/i.test(text);
      sawRelativeClause ||= /,\swhich\b[^.!?…]*,\s/i.test(text);
      sawHowever ||= /,\s*(?:however|meanwhile|nevertheless|nonetheless|instead|also),\s*/i.test(text);
      expect(Array.from(englishTextToBytes(text))).toEqual(Array.from(payload));
    }
    expect(sawConditional).toBe(true);
    expect(sawRelativeClause).toBe(true);
    expect(sawHowever).toBe(true);
  });

  it("should favor common determiners while preserving the encoded bits", () => {
    let state = 0x12345678;
    const payload = Uint8Array.from({ length: 1024 }, () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return state & 0xff;
    });
    const text = bytesToEnglishText(payload);
    const words = text.toLowerCase().match(/[a-z]+/g) || [];
    const determinerWords = words.filter(word => DETERMINERS.includes(word));

    expect(determinerWords.filter(word => word === "the").length / determinerWords.length)
      .toBeGreaterThan(0.35);
    expect(Array.from(englishTextToBytes(text))).toEqual(Array.from(payload));

    const openers = text
      .split(/(?<=[.!?…])\s+/)
      .map(sentence => {
        const opener = sentence.match(/^[A-Z][a-z]*/)?.[0].toLowerCase();
        return opener === "an" ? "a" : opener;
      })
      .filter((word): word is string => word !== undefined);
    for (let index = 2; index < openers.length; index++) {
      if (openers[index - 1] === openers[index - 2]) {
        expect(openers[index]).not.toBe(openers[index - 1]);
      }
    }
  });

  it("should use a before consonant-sounding vowel onsets such as unique", () => {
    let sawUnique = false;
    for (let value = 0; value < 256; value++) {
      const payload = Uint8Array.from(
        { length: 32 },
        (_, index) => (value + index * 73) & 0xff
      );
      const text = bytesToEnglishText(payload);
      if (/\bunique\b/i.test(text)) {
        sawUnique = true;
        expect(text).not.toMatch(/\ban unique\b/i);
      }
    }
    expect(sawUnique).toBe(true);
  });

  it("should use a varied introductory clause instead of a fixed attribution", () => {
    const introductoryEvents = new Set<string>();
    for (let seed = 0; seed < 64; seed++) {
      const payload = Uint8Array.from(
        { length: 48 },
        (_, index) => (seed * 37 + index * 73) & 0xff
      );
      const text = bytesToEnglishText(payload);
      expect(text).not.toMatch(/\bAccording to\b/);
      for (const match of text.matchAll(/\bAfter ([a-z]+),/g)) {
        introductoryEvents.add(match[1].toLowerCase());
      }
      expect(Array.from(englishTextToBytes(text))).toEqual(Array.from(payload));
    }
    expect(introductoryEvents.size).toBeGreaterThan(1);
  });

  it("should round-trip byte arrays in poetry style with varied stanzas and poetic punctuation", () => {
    const testBytes = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
    const config = { style: "poetry" as const, sentenceEndingVariance: true };
    const text = bytesToEnglishText(testBytes, config);

    console.log("=== GENERATED POEM SAMPLE ===");
    console.log(text);
    console.log("=============================");

    expect(text).toContain("\n");
    expect(Array.from(englishTextToBytes(text, config))).toEqual(Array.from(testBytes));
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

  it("should encode revised clause and determiner templates without losing bits", () => {
    const config = { sentenceEndingVariance: false };
    const clauseBytes = new Uint8Array([0xa0, 0x12, 0x34, 0x56]);
    const clauseText = bytesToEnglishText(clauseBytes, config);
    const firstClause = clauseText.split(/[.!?]/)[0].split(/\s+/);

    expect(firstClause.length).toBeGreaterThanOrEqual(3);
    expect(Array.from(englishTextToBytes(clauseText, config))).toEqual(Array.from(clauseBytes));

    const pronounBytes = new Uint8Array([0x80, 0x12, 0x34, 0x56]);
    const pronounText = bytesToEnglishText(pronounBytes, config);

    expect(DETERMINERS.map(word => word.toLowerCase())).toContain(
      pronounText.split(/\s+/)[0].replace(/^["'“‘]/, "").toLowerCase()
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

  it("should correctly encode and decode long complex news sentence structures", () => {
    const payload = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
    const encoded = bytesToEnglishText(payload);
    expect(encoded).toBeTruthy();

    const decoded = englishTextToBytes(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(payload));
  });
});
