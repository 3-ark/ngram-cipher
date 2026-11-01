/**
 * Reversible Encoding and Decoding Engine (Full LLM-enabled)
 */
import { EncodingConfig } from "../config/index.js";
import { BitStreamReader, BitStreamWriter } from "./index.js";
import { bytesToLlmText, llmTextToBytes, loadLlmModel, clearLlmModelCache, normalizeModelName } from "./llm.js";
export { BitStreamReader, BitStreamWriter, bytesToLlmText, llmTextToBytes, loadLlmModel, clearLlmModelCache, normalizeModelName, };
/**
 * Encodes a Uint8Array byte stream into English-like carrier text (supporting news, poetry, and LLM).
 */
export declare function bytesToEnglishText(bytes: Uint8Array, config?: EncodingConfig): string | Promise<string>;
/**
 * Decodes carrier text back into the encoded Uint8Array byte stream (supporting news, poetry, and LLM).
 */
export declare function englishTextToBytes(text: string, config?: EncodingConfig): Uint8Array | Promise<Uint8Array>;
