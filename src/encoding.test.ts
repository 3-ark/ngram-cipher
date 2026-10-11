import { describe, it, expect } from "vitest";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";
import { EncodingError } from "./config/index.js";

describe("Reversible Encoding and Decoding Module", () => {
  it("should round-trip byte arrays to English prose and back", () => {
    const testBytes = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
    const text = bytesToEnglishText(testBytes);

    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);

    const recoveredBytes = englishTextToBytes(text);
    expect(Array.from(recoveredBytes)).toEqual(Array.from(testBytes));
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

  it("should throw EncodingError on invalid token in cipher text", () => {
    const invalidText = "The major non-existent-xyz-word confirms the national policy.";
    expect(() => englishTextToBytes(invalidText)).toThrow(EncodingError);
  });

  it("should return empty Uint8Array for empty input text", () => {
    expect(Array.from(englishTextToBytes(""))).toEqual([]);
    expect(Array.from(englishTextToBytes("   "))).toEqual([]);
  });
});
