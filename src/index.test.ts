import { describe, it, expect } from "vitest";
import { encode, decode, VOCABULARY } from "./index.js";
import { getCandidates } from "./nlg/ngram_model.js";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";

describe("English N-Gram Cipher Engine", () => {
  it("should expose the Google Books unigram vocabulary", () => {
    expect(VOCABULARY.length).toBeGreaterThan(500);
    const uniqueSet = new Set(VOCABULARY);
    expect(uniqueSet.size).toBe(VOCABULARY.length);
  });

  it("should encode eight data bits using 256 context-ranked n-gram continuations", () => {
    const bytes = new Uint8Array([0xff, 0xe0, 0x31]);
    const cipherText = bytesToEnglishText(bytes);

    const tokens = cipherText.toLowerCase().match(/[a-z0-9]+/g) || [];
    const paddedByteLength = Math.ceil((bytes.length + 4) / 3) * 3;
    const encodedTokenCount = paddedByteLength;
    let context: string[] = [];
    for (const token of tokens.slice(0, encodedTokenCount)) {
      expect(getCandidates(context, 256)).toContain(token);
      context = [...context, token].slice(-4);
    }
    expect(tokens).toHaveLength(encodedTokenCount);
    expect(tokens[0]).toBe(getCandidates([], 256)[bytes[0]]);
    expect(Array.from(englishTextToBytes(cipherText))).toEqual(Array.from(bytes));
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

  it("should produce model-backed sentences with stable punctuation", async () => {
    const plaintext = "Test message for natural language output";
    const password = "test-pass";

    const cipherText = await encode(plaintext, password);

    const sentences = cipherText.split(/\.\s*/).filter(s => s.length > 0);
    expect(sentences.length).toBeGreaterThan(0);

    for (const sentence of sentences) {
      expect(sentence[0]).toMatch(/[A-Z]/);
      expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(12);
    }

    expect(await decode(cipherText, password)).toBe(plaintext);
  });

  it("should round-trip with Google Books continuations", async () => {
    const text = "Hello world! This secret message will be encoded into natural English text.";
    const password = "test-shortness";

    const cipherText = await encode(text, password);
    const wordCount = cipherText.split(/\s+/).length;

    expect(wordCount).toBeGreaterThan(12);

    const decrypted = await decode(cipherText, password);
    expect(decrypted).toBe(text);
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

    expect(cipherText.split(/\s+/).length).toBeGreaterThan(12);
    expect(await decode(cipherText, "compression-test")).toBe(plaintext);
  });
});
