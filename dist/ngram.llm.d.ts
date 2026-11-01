/**
 * Natural English N-Gram Cipher (Full LLM-enabled)
 *
 * Facade uniting Cryptography, Binary Framing, Reversible Encoding,
 * Natural-Language Generation, and ONNX LLM Steganography.
 */
import { StegoOptions } from "./config/index.js";
import { encryptBytes, decryptBytes } from "./crypto/index.js";
import { bytesToEnglishText, englishTextToBytes, bytesToLlmText, llmTextToBytes, loadLlmModel, clearLlmModelCache, normalizeModelName } from "./encoding/index.llm.js";
import { VOCABULARY, analyzeCarrierText, type CarrierAnalysis } from "./nlg/index.js";
export { encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes, bytesToLlmText, llmTextToBytes, loadLlmModel, clearLlmModelCache, normalizeModelName, VOCABULARY, analyzeCarrierText };
export type { CarrierAnalysis };
export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.llm.js";
export * from "./nlg/index.js";
/**
 * Encrypts plain text with a password, packs into a framed binary packet,
 * and encodes it into English-like carrier text (supporting news, poetry, and LLM).
 */
export declare function encode(plaintext: string, password: string, options?: StegoOptions): Promise<string>;
/**
 * Decodes carrier text, verifies binary frame integrity,
 * and decrypts back to original plain text (supporting news, poetry, and LLM).
 */
export declare function decode(cipherText: string, password: string, options?: StegoOptions): Promise<string>;
