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
/**
 * XORs a data buffer with a keystream buffer in-place or returning a new buffer.
 */
export function xorBytes(data: Uint8Array, keystream: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ (keystream[i % keystream.length] || 0);
  }
  return result;
}

/**
 * Derives a keystream of specified length from a password using Web Crypto SHA-256 HKDF/PBKDF2.
 */
export async function deriveKeystream(password: string, length: number): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const passwordBytes = enc.encode(password);
  const keystream = new Uint8Array(length);

  let counter = 0;
  let filled = 0;

  while (filled < length) {
    const blockInput = new Uint8Array(passwordBytes.length + 4);
    blockInput.set(passwordBytes, 0);
    const view = new DataView(blockInput.buffer);
    view.setUint32(passwordBytes.length, counter++, false);

    const hashBuffer = await webCrypto.subtle.digest("SHA-256", blockInput);
    const hashBytes = new Uint8Array(hashBuffer);

    const toCopy = Math.min(hashBytes.length, length - filled);
    keystream.set(hashBytes.subarray(0, toCopy), filled);
    filled += toCopy;
  }

  return keystream;
}

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
