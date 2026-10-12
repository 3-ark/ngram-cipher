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

  it("should support punctuation-integrated natural sentence structure", () => {
    const testBytes = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    const text = bytesToEnglishText(testBytes);

    expect(text).toMatch(/[A-Za-z]/);
    const recovered = englishTextToBytes(text);
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

  it("should correctly handle various byte patterns lossless roundtrip", () => {
    const payloads = [
      new Uint8Array([0, 0, 0, 0]),
      new Uint8Array([255, 255, 255, 255]),
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
    ];

    for (const payload of payloads) {
      const text = bytesToEnglishText(payload);
      const decoded = englishTextToBytes(text);
      expect(Array.from(decoded)).toEqual(Array.from(payload));
    }
  });
});
