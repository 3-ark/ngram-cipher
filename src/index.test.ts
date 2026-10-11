import { describe, it, expect } from "vitest";
import { encode, decode, VOCABULARY, encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes } from "./index.js";

describe("English N-Gram Cipher Engine", () => {
  it("should have a vocabulary of data words", () => {
    // All POS lists contribute to VOCABULARY
    expect(VOCABULARY.length).toBeGreaterThan(200);
    // All words should be unique within the exported set
    const uniqueSet = new Set(VOCABULARY);
    expect(uniqueSet.size).toBe(VOCABULARY.length);
  });

  it("should encrypt and encode text into English sentences, then decode and decrypt back", async () => {
    const plaintext = "Hello, world! This is a secret message encoded as English prose.";
    const password = "SuperSecretPassword123!";

    const cipherText = await encode(plaintext, password);
    expect(typeof cipherText).toBe("string");
    expect(cipherText.length).toBeGreaterThan(0);

    // Output should contain periods (sentence boundaries) and letters
    expect(cipherText).toMatch(/[A-Za-z]/);
    expect(cipherText).toContain(".");

    // Should look like sentences: starts with uppercase, has periods
    const sentences = cipherText.split(/\.\s*/).filter(s => s.length > 0);
    expect(sentences.length).toBeGreaterThan(0);
    for (const s of sentences) {
      // Each sentence starts with a capital letter
      expect(s[0]).toMatch(/[A-Z]/);
    }

    const decrypted = await decode(cipherText, password);
    expect(decrypted).toBe(plaintext);
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

  it("should produce output that reads like news sentences", async () => {
    const plaintext = "Test message for natural language output";
    const password = "test-pass";

    const cipherText = await encode(plaintext, password);

    // Check sentence structure: multiple sentences separated by periods
    const sentences = cipherText.split(/\.\s*/).filter(s => s.length > 0);
    expect(sentences.length).toBeGreaterThan(1);

    // Each sentence should have multiple words (not just single-word sentences)
    for (const s of sentences) {
      const wordCount = s.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(4);
    }

    // Log output for manual inspection
    console.log("=== Encoded output sample ===");
    console.log(cipherText);
    console.log("============================");
  });

  it("should round-trip bytesToEnglishText and englishTextToBytes", () => {
    // Test with known bytes
    const testBytes = new Uint8Array([0, 1, 2, 3, 4, 5, 100, 200, 255, 128, 64, 32]);
    const text = bytesToEnglishText(testBytes);
    const recovered = englishTextToBytes(text);

    expect(Array.from(recovered)).toEqual(Array.from(testBytes));
  });

  it("should vary sentence endings instead of forcing periods", async () => {
    const plaintext = "Sentence punctuation should feel natural.";
    const cipherText = await encode(plaintext, "punctuation-test");
    const sentenceEnders = [...cipherText.matchAll(/[!?\.]{1,3}/g)].map(m => m[0]);

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
});
