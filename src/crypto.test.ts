import { describe, it, expect } from "vitest";
import { encryptBytes, decryptBytes, deriveKey, timingSafeEqual } from "./crypto/index.js";
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

  it("should generate unique non-deterministic salts and IVs across encrypt calls", async () => {
    const data = new TextEncoder().encode("Identical Payload");
    const password = "pass";

    const enc1 = await encryptBytes(data, password);
    const enc2 = await encryptBytes(data, password);

    // Extract salts (first 16 bytes) and IVs (next 12 bytes)
    const salt1 = enc1.subarray(0, 16);
    const salt2 = enc2.subarray(0, 16);
    const iv1 = enc1.subarray(16, 28);
    const iv2 = enc2.subarray(16, 28);

    expect(timingSafeEqual(salt1, salt2)).toBe(false);
    expect(timingSafeEqual(iv1, iv2)).toBe(false);
  });

  it("should abort and throw CryptoError if AES-GCM ciphertext or auth tag is tampered with", async () => {
    const data = new TextEncoder().encode("Sensitive payload");
    const password = "password123";
    const encrypted = await encryptBytes(data, password);

    // Tamper with the last byte (part of AES-GCM auth tag)
    const tampered = new Uint8Array(encrypted);
    tampered[tampered.length - 1] ^= 0xff;

    await expect(decryptBytes(tampered, password)).rejects.toThrow(CryptoError);
  });

  it("should correctly compare arrays with timingSafeEqual", () => {
    const arr1 = new Uint8Array([1, 2, 3, 4, 5]);
    const arr2 = new Uint8Array([1, 2, 3, 4, 5]);
    const arr3 = new Uint8Array([1, 2, 3, 4, 6]);
    const arr4 = new Uint8Array([1, 2, 3, 4]);

    expect(timingSafeEqual(arr1, arr2)).toBe(true);
    expect(timingSafeEqual(arr1, arr3)).toBe(false);
    expect(timingSafeEqual(arr1, arr4)).toBe(false);
  });
});
