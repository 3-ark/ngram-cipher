/**
 * Natural English N-Gram Cipher
 *
 * Encrypts data using AES-256-GCM and encodes ciphertext bits into natural English prose.
 */

export {
  encode,
  decode,
  encryptBytes,
  decryptBytes,
  bytesToEnglishText,
  englishTextToBytes,
  VOCABULARY,
  analyzeCarrierText
} from "./ngram.js";

export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.js";
export * from "./nlg/index.js";
