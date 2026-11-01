/**
 * Natural English N-Gram Cipher (Lightweight Non-LLM)
 *
 * Encrypts data using AES-256-GCM and encodes ciphertext bits into natural English prose.
 */
import { encode, decode, encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes, VOCABULARY, analyzeCarrierText } from "./ngram.js";
export { encode, decode, encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes, VOCABULARY, analyzeCarrierText };
export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.js";
export * from "./nlg/index.js";
declare const ngramCipher: {
    encode: typeof encode;
    decode: typeof decode;
    encryptBytes: typeof encryptBytes;
    decryptBytes: typeof decryptBytes;
    bytesToEnglishText: typeof bytesToEnglishText;
    englishTextToBytes: typeof englishTextToBytes;
    VOCABULARY: string[];
    analyzeCarrierText: typeof analyzeCarrierText;
};
export default ngramCipher;
