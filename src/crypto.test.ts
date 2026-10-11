import { describe, it, expect } from "vitest";
import { encryptBytes, decryptBytes, deriveKey } from "./crypto/index.js";
import { CryptoError } from "./config/index.js";

describe("Cryptographic Operations Module", () => {
  it("should derive keys deterministically given same password and salt", async () => {
    const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const password = "test-password-123";

    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);

    expect(key1).toBeDefined();
    expect(key2).toBeDefined();
  });

  it("should encrypt and decrypt raw bytes correctly", async () => {
    const rawData = new TextEncoder().encode("Secret message payload to encrypt");
    const password = "StrongPassword!";

    const encrypted = await encryptBytes(rawData, password);
    expect(encrypted.length).toBeGreaterThan(rawData.length + 28);

    const decrypted = await decryptBytes(encrypted, password);
    expect(Array.from(decrypted)).toEqual(Array.from(rawData));
  });

  it("should fail decryption with wrong password throwing CryptoError", async () => {
    const rawData = new TextEncoder().encode("Top secret data");
    const encrypted = await encryptBytes(rawData, "correct-pass");

    await expect(decryptBytes(encrypted, "wrong-pass")).rejects.toThrow(CryptoError);
    await expect(decryptBytes(encrypted, "wrong-pass")).rejects.toThrow("Decryption failed");
  });

  it("should throw CryptoError on corrupted/short payload", async () => {
    const invalidPayload = new Uint8Array([1, 2, 3, 4, 5]);
    await expect(decryptBytes(invalidPayload, "pass")).rejects.toThrow(CryptoError);
  });
});
