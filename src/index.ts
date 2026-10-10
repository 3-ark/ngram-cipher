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
  VOCABULARY
} from "./ngram.js";
