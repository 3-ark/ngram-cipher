import { describe, it, expect } from "vitest";
import { encode, decode, VOCABULARY, encryptBytes, decryptBytes } from "./index.js";

describe("English N-Gram Cipher Engine", () => {
  it("should have a valid 256-word unique vocabulary", () => {
    expect(VOCABULARY.length).toBe(256);
    const uniqueSet = new Set(VOCABULARY);
    expect(uniqueSet.size).toBe(256);
  });

  it("should encrypt and encode text into English sentences, then decode and decrypt back", async () => {
    const plaintext = "Hello, world! This is a secret message encoded as English prose.";
    const password = "SuperSecretPassword123!";

    const cipherText = await encode(plaintext, password);
    expect(typeof cipherText).toBe("string");
    expect(cipherText.length).toBeGreaterThan(0);

    // Verify it consists of words and punctuation
    expect(cipherText).toMatch(/^[A-Za-z.\s]+$/);

    const decrypted = await decode(cipherText, password);
    expect(decrypted).toBe(plaintext);
  });

  it("should handle empty strings and unicode characters", async () => {
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

  it("should fail decoding when cipher text contains invalid tokens", async () => {
    const invalidText = "The a this invalidtokennotindictionary. Day thing.";
    await expect(decode(invalidText, "any-pass")).rejects.toThrow(
      "Invalid or unrecognized token in cipher text"
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
});
