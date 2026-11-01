/**
 * Natural English N-Gram Cipher (Full LLM-enabled)
 *
 * Encrypts data using AES-256-GCM and encodes ciphertext bits into natural English prose
 * or ONNX LLM steganographic tokens.
 */
import { encode, decode, encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes, bytesToLlmText, llmTextToBytes, loadLlmModel, clearLlmModelCache, normalizeModelName, VOCABULARY, analyzeCarrierText } from "./ngram.llm.js";
export { encode, decode, encryptBytes, decryptBytes, bytesToEnglishText, englishTextToBytes, bytesToLlmText, llmTextToBytes, loadLlmModel, clearLlmModelCache, normalizeModelName, VOCABULARY, analyzeCarrierText };
export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.llm.js";
export * from "./nlg/index.js";
declare const ngramCipher: {
    encode: typeof encode;
    decode: typeof decode;
    encryptBytes: typeof encryptBytes;
    decryptBytes: typeof decryptBytes;
    bytesToEnglishText: typeof bytesToEnglishText;
    englishTextToBytes: typeof englishTextToBytes;
    bytesToLlmText: typeof bytesToLlmText;
    llmTextToBytes: typeof llmTextToBytes;
    loadLlmModel: typeof loadLlmModel;
    clearLlmModelCache: typeof clearLlmModelCache;
    normalizeModelName: typeof normalizeModelName;
    VOCABULARY: string[];
    analyzeCarrierText: typeof analyzeCarrierText;
};
export default ngramCipher;
