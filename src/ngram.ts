/**
 * Natural English N-Gram Cipher
 *
 * Facade uniting Cryptography, Binary Framing, Reversible Encoding,
 * and Natural-Language Generation.
 */

import {
  mergeConfig,
  validatePassword,
  validatePlaintext,
  StegoOptions,
  StegoError
} from "./config/index.js";
import { encryptBytes, decryptBytes } from "./crypto/index.js";
import { packFrame, unpackFrame } from "./framing/index.js";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";
import { VOCABULARY, analyzeCarrierText, CarrierAnalysis } from "./nlg/index.js";

export {
  encryptBytes,
  decryptBytes,
  bytesToEnglishText,
  englishTextToBytes,
  VOCABULARY,
  analyzeCarrierText,
  CarrierAnalysis
};

export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.js";
export * from "./nlg/index.js";

/**
 * Encrypts plain text with a password, packs into a framed binary packet,
 * and encodes it into natural English prose.
 */
export async function encode(
  plaintext: string,
  password: string,
  options?: StegoOptions
): Promise<string> {
  validatePassword(password);
  validatePlaintext(plaintext);

  const config = mergeConfig(options);
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(plaintext);

  // 1. Encrypt raw bytes using AES-GCM
  const encrypted = await encryptBytes(rawBytes, password, config.crypto);

  // 2. Pack encrypted ciphertext into binary frame envelope
  const framed = packFrame(encrypted, config.framing);

  // 3. Encode binary frame into English prose
  return bytesToEnglishText(framed, config.encoding);
}

/**
 * Decodes English news cipher text, verifies binary frame integrity,
 * and decrypts back to original plain text.
 */
export async function decode(
  cipherText: string,
  password: string,
  options?: StegoOptions
): Promise<string> {
  validatePassword(password);

  const config = mergeConfig(options);
  const bytes = englishTextToBytes(cipherText);

  let payloadToDecrypt = bytes;

  // Try to unpack binary frame envelope
  try {
    const unpacked = unpackFrame(bytes, config.framing);
    payloadToDecrypt = unpacked.payload;
  } catch (err) {
    // If unpacking fails, check if fallback to legacy/unframed payload is viable
    // Otherwise throw framing error
    if (bytes.length < 28 + 16) {
      throw err;
    }
  }

  // Decrypt payload
  const decryptedBytes = await decryptBytes(payloadToDecrypt, password, config.crypto);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(decryptedBytes);
}
