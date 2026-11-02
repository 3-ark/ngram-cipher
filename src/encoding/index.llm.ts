/**
 * Reversible Encoding and Decoding Engine (Full LLM-enabled)
 */

import { EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  bytesToEnglishText as lightBytesToEnglishText,
  englishTextToBytes as lightEnglishTextToBytes,
  BitStreamReader,
  BitStreamWriter,
} from "./index.js";
import {
  bytesToLlmText,
  llmTextToBytes,
  bytesToLlmEqualLengthText,
  llmEqualLengthTextToBytes,
  equalLengthEncode,
  equalLengthDecode,
  getTokenRanks,
  generateFromRanks,
  loadLlmModel,
  clearLlmModelCache,
  normalizeModelName,
} from "./llm.js";

export {
  BitStreamReader,
  BitStreamWriter,
  bytesToLlmText,
  llmTextToBytes,
  bytesToLlmEqualLengthText,
  llmEqualLengthTextToBytes,
  equalLengthEncode,
  equalLengthDecode,
  getTokenRanks,
  generateFromRanks,
  loadLlmModel,
  clearLlmModelCache,
  normalizeModelName,
};

/**
 * Encodes a Uint8Array byte stream into English-like carrier text (supporting news, poetry, LLM, and equal-length).
 */
export function bytesToEnglishText(
  bytes: Uint8Array,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): string | Promise<string> {
  if (config.style === "llm") {
    return bytesToLlmText(bytes, config);
  }
  if (config.style === "equal-length" || config.style === "equal_length") {
    return bytesToLlmEqualLengthText(bytes, config);
  }
  return lightBytesToEnglishText(bytes, config);
}

/**
 * Decodes carrier text back into the encoded Uint8Array byte stream (supporting news, poetry, LLM, and equal-length).
 */
export function englishTextToBytes(
  text: string,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): Uint8Array | Promise<Uint8Array> {
  if (config.style === "llm") {
    return llmTextToBytes(text, config);
  }
  if (config.style === "equal-length" || config.style === "equal_length") {
    return llmEqualLengthTextToBytes(text, config);
  }
  return lightEnglishTextToBytes(text, config);
}
