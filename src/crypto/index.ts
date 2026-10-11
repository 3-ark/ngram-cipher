/**
 * Cryptographic Operations and Key Derivation
 */

import { CryptoError, CryptoConfig, DEFAULT_CONFIG } from "../config/index.js";

const webCrypto = globalThis.crypto;

if (!webCrypto || !webCrypto.subtle) {
  throw new CryptoError("Web Crypto API is required but unavailable in this environment.");
}

function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(arr.byteLength);
  new Uint8Array(buf).set(arr);
  return buf;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey using PBKDF2 with SHA-256.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  config: CryptoConfig = DEFAULT_CONFIG.crypto
): Promise<CryptoKey> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await webCrypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return await webCrypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: toArrayBuffer(salt),
        iterations: config.pbkdf2Iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new CryptoError(`Key derivation failed: ${message}`);
  }
}

/**
 * Encrypts raw plaintext bytes using AES-256-GCM.
 * Output layout: [Salt (saltByteLength)][IV (ivByteLength)][Ciphertext + AuthTag]
 */
export async function encryptBytes(
  data: Uint8Array,
  password: string,
  config: CryptoConfig = DEFAULT_CONFIG.crypto
): Promise<Uint8Array> {
  try {
    const salt = webCrypto.getRandomValues(new Uint8Array(config.saltByteLength));
    const iv = webCrypto.getRandomValues(new Uint8Array(config.ivByteLength));
    const key = await deriveKey(password, salt, config);

    const ciphertextBuffer = await webCrypto.subtle.encrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(data)
    );

    const ciphertext = new Uint8Array(ciphertextBuffer);
    const result = new Uint8Array(salt.length + iv.length + ciphertext.length);

    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(ciphertext, salt.length + iv.length);

    return result;
  } catch (err: unknown) {
    if (err instanceof CryptoError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new CryptoError(`Encryption failed: ${message}`);
  }
}

/**
 * Decrypts AES-GCM payload formatted as [Salt (saltByteLength)][IV (ivByteLength)][Ciphertext + AuthTag].
 */
export async function decryptBytes(
  payload: Uint8Array,
  password: string,
  config: CryptoConfig = DEFAULT_CONFIG.crypto
): Promise<Uint8Array> {
  const headerLength = config.saltByteLength + config.ivByteLength;
  if (payload.length < headerLength + 16) {
    throw new CryptoError("Invalid payload length: payload too short or corrupted.");
  }

  const salt = payload.subarray(0, config.saltByteLength);
  const iv = payload.subarray(config.saltByteLength, headerLength);
  const ciphertext = payload.subarray(headerLength);

  try {
    const key = await deriveKey(password, salt, config);
    const decryptedBuffer = await webCrypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext)
    );
    return new Uint8Array(decryptedBuffer);
  } catch {
    throw new CryptoError("Decryption failed: Incorrect password or corrupted text.");
  }
}
