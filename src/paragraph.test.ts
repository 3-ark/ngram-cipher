import { describe, it, expect } from "vitest";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";

describe("Paragraph formatting and whitespace resilience", () => {
  it("should format news prose into paragraphs separated by double newlines", () => {
    const payload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    const carrierText = bytesToEnglishText(payload);
    expect(carrierText).toContain("\n\n");

    const paragraphs = carrierText.split("\n\n");
    expect(paragraphs.length).toBeGreaterThan(1);
  });

  it("should decode carrier text losslessly regardless of newline/paragraph removal or modification", () => {
    const payload = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
    const formattedCarrier = bytesToEnglishText(payload);

    // Test 1: Original text with \n\n
    const recovered1 = englishTextToBytes(formattedCarrier);
    expect(Array.from(recovered1)).toEqual(Array.from(payload));

    // Test 2: Text with all \n\n replaced by single spaces
    const singleLineCarrier = formattedCarrier.replace(/\n+/g, " ");
    const recovered2 = englishTextToBytes(singleLineCarrier);
    expect(Array.from(recovered2)).toEqual(Array.from(payload));

    // Test 3: Text with extra random newlines and tabs
    const noisyCarrier = formattedCarrier.split(" ").join("\n  ");
    const recovered3 = englishTextToBytes(noisyCarrier);
    expect(Array.from(recovered3)).toEqual(Array.from(payload));
  });
});
