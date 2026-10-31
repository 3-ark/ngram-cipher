/**
 * Natural English N-Gram Cipher
 *
 * Facade uniting Cryptography, Binary Framing, Reversible Encoding,
 * and Natural-Language Generation.
 */
import { StegoOptions } from "./config/index.js";
import { encryptBytes, decryptBytes } from "./crypto/index.js";
import { bytesToEnglishText, englishTextToBytes, bytesToLlmText, llmTextToBytes, normalizeModelName } from "./encoding/index.js";
import { VOCABULARY, analyzeCarrierText, type CarrierAnalysis } from "./nlg/index.js";
export { encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes, bytesToLlmText, llmTextToBytes, normalizeModelName, VOCABULARY, analyzeCarrierText };
export type { CarrierAnalysis };
export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.js";
export * from "./nlg/index.js";
/**
 * Encrypts plain text with a password, packs into a framed binary packet,
 * and encodes it into English-like carrier text.
 */
export declare function encode(plaintext: string, password: string, options?: StegoOptions): Promise<string>;
/**
 * Decodes carrier text, verifies binary frame integrity,
 * and decrypts back to original plain text.
 */
export declare function decode(cipherText: string, password: string, options?: StegoOptions): Promise<string>;
