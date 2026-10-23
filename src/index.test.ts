import { describe, it, expect } from "vitest";
import ngramCipher, { encode, decode, CARRIER_WORDS, VOCABULARY, CryptoError } from "./index.js";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";

describe("English N-Gram Cipher Engine", () => {
  it("should export a default object with encode and decode methods", async () => {
    expect(ngramCipher).toBeDefined();
    expect(typeof ngramCipher.encode).toBe("function");
    expect(typeof ngramCipher.decode).toBe("function");

    const plaintext = "Testing default export functionality.";
    const password = "default-export-pass";

    const cipherText = await ngramCipher.encode(plaintext, password);
    const decrypted = await ngramCipher.decode(cipherText, password);

    expect(decrypted).toBe(plaintext);
  });

  it("should have a vocabulary of data words", () => {
    // All POS lists contribute to VOCABULARY
    expect(VOCABULARY.length).toBeGreaterThan(500);
    // All words should be unique within the exported set
    const uniqueSet = new Set(VOCABULARY);
    expect(uniqueSet.size).toBe(VOCABULARY.length);
  });

  it("should use carrier vocabulary and POS slots without losing index values", () => {
    expect(CARRIER_WORDS.length).toBeGreaterThanOrEqual(1024);
    expect(new Set(CARRIER_WORDS).size).toBe(CARRIER_WORDS.length);

    const bytes = new Uint8Array([0xff, 0xe0]);
    const cipherText = bytesToEnglishText(bytes, { sentenceEndingVariance: false });

    expect(cipherText.length).toBeGreaterThan(0);
    expect(Array.from(englishTextToBytes(cipherText, { sentenceEndingVariance: false })))
      .toEqual(Array.from(bytes));
  });

  it("should encrypt and encode text into English sentences, then decode and decrypt back", async () => {
    const plaintext = "Hello, world! This is a secret message encoded as English prose.";
    const password = "SuperSecretPassword123!";

    const cipherText = await encode(plaintext, password);
    expect(typeof cipherText).toBe("string");
    expect(cipherText.length).toBeGreaterThan(0);

    // Output should contain sentence boundaries and letters
    expect(cipherText).toMatch(/[A-Za-z]/);
    expect(cipherText).toContain(".");
    expect(cipherText).not.toContain("!");

    // Should look like sentences: starts with uppercase, has periods
    const sentences = cipherText.split(/\.\s*/).filter(s => s.length > 0);
    expect(sentences.length).toBeGreaterThan(0);
    for (const s of sentences) {
      // Each sentence starts with a capital letter (ignoring leading quotes if any)
      const trimmedStr = s.trim().replace(/^["'“‘”’]+/, "").trim();
      if (trimmedStr.length > 0 && /[a-zA-Z]/.test(trimmedStr[0])) {
        expect(trimmedStr[0]).toMatch(/[A-Z]/);
      }
    }

    const decrypted = await decode(cipherText, password);
    expect(decrypted).toBe(plaintext);
  });

  it("should round-trip messages with the poetry writing style", async () => {
    const plaintext = "The moon watches the river.";
    const options = { encoding: { style: "poetry" as const } };
    const ciphertext = await encode(plaintext, "poetry-style-test", options);

    console.log("=== FULL POETRY ENCRYPTED CIPHERTEXT ===");
    console.log(ciphertext);
    console.log("=========================================");

    expect(ciphertext).toContain("\n");
    expect(await decode(ciphertext, "poetry-style-test", options)).toBe(plaintext);
  });

  it("should handle unicode characters", async () => {
    const plaintext = "🚀 Unicode Test: 秘密消息 12345! @#$%";
    const password = "my-password";

    const cipherText = await encode(plaintext, password);
    const decrypted = await decode(cipherText, password);

    expect(decrypted).toBe(plaintext);
  });

  it("should fail decryption when given an incorrect password", async () => {
    const plaintext = "Confidential document";
    const cipherText = await encode(plaintext, "correct-password");

    await expect(decode(cipherText, "wrong-password")).rejects.toThrow(
      "Decryption failed: Incorrect password or corrupted text."
    );
  });

  it("should produce different ciphertexts for the same plaintext due to random IV/salt", async () => {
    const plaintext = "Identical message";
    const password = "same-password";

    const cipher1 = await encode(plaintext, password);
    const cipher2 = await encode(plaintext, password);

    expect(cipher1).not.toBe(cipher2);

    expect(await decode(cipher1, password)).toBe(plaintext);
    expect(await decode(cipher2, password)).toBe(plaintext);
  });

  it("should produce concise and structured natural sentence output in paragraphs", async () => {
    const plaintext = "Test message for natural language output with paragraphs and realistic statistics";
    const password = "test-pass";

    const cipherText = await encode(plaintext, password);

    // Check sentence structure: multiple sentences separated by periods or punctuation
    const sentences = cipherText.split(/[.;…\n]+\s*/).filter(s => s.length > 0);
    expect(sentences.length).toBeGreaterThan(0);

    // Should not contain exclamation marks
    expect(cipherText).not.toContain("!");

    // Check paragraphs if multiple sentences exist
    if (sentences.length >= 2) {
      expect(cipherText).toContain("\n\n");
    }

    // Log output for manual inspection
    console.log("=== Encoded output sample ===");
    console.log(cipherText);
    console.log("============================");
  });

  it("should keep carrier text compact with 8-bit vocabulary slots", async () => {
    const text = "Hello world! This secret message will be encoded into natural English text.";
    const password = "test-shortness";

    const cipherText = await encode(text, password);
    const wordCount = cipherText.split(/\s+/).length;

    // 8-bit slot density reduces word count significantly
    expect(wordCount).toBeLessThan(160);

    const decrypted = await decode(cipherText, password);
    expect(decrypted).toBe(text);
  });

  it("should vary sentence endings without exclamation marks", async () => {
    const plaintext = "Sentence punctuation should feel natural and varied.";
    const cipherText = await encode(plaintext, "punctuation-test");
    expect(cipherText).not.toContain("!");
    const sentenceEnders = [...cipherText.matchAll(/[;\.]{1,3}|…/g)].map(m => m[0]);

    expect(sentenceEnders.length).toBeGreaterThan(0);
    expect(new Set(sentenceEnders).size).toBeGreaterThan(1);
  });

  it("should handle large messages without data loss", async () => {
    // Generate a longer message
    const plaintext = "The quick brown fox jumps over the lazy dog. ".repeat(10);
    const password = "long-message-test";

    const cipherText = await encode(plaintext, password);
    const decrypted = await decode(cipherText, password);

    expect(decrypted).toBe(plaintext);
  });

  it("should compress repetitive text before encryption to reduce ciphertext length", async () => {
    const plaintext = "The quick brown fox jumps over the lazy dog. ".repeat(100);
    const cipherText = await encode(plaintext, "compression-test");
    const wordCount = cipherText.split(/\s+/).length;

    expect(wordCount).toBeLessThanOrEqual(250);
    expect(await decode(cipherText, "compression-test")).toBe(plaintext);
  });

  it("should encode and decode messages into realistic news sentences with percentage statistics", async () => {
    const plaintext = "Breaking News: Global economic summit concludes with interest rate adjustments.";
    const password = "news-complex-structure-key";

    const ciphertext = await encode(plaintext, password);
    expect(ciphertext).toBeTruthy();
    expect(ciphertext).not.toContain("!");

    const decrypted = await decode(ciphertext, password);
    expect(decrypted).toBe(plaintext);
  });

  it("should throw CryptoError on non-string or empty carrier text in decode", async () => {
    // @ts-expect-error testing invalid input type
    await expect(decode(null, "password")).rejects.toThrow(CryptoError);
    await expect(decode("", "password")).rejects.toThrow(CryptoError);
    await expect(decode("   ", "password")).rejects.toThrow(CryptoError);
  });

  it("should reject corrupted or completely non-carrier strings in decode", async () => {
    const invalidCarrier = "This is random garbage text that does not follow the steganographic template format.";
    await expect(decode(invalidCarrier, "password")).rejects.toThrow(CryptoError);
  });

  it("should throw CryptoError if plaintext exceeds safety size limit", async () => {
    // Plaintext over 10MB
    const oversizedPlaintext = "A".repeat(10 * 1024 * 1024 + 100);
    await expect(encode(oversizedPlaintext, "pass")).rejects.toThrow(CryptoError);
  });
});
