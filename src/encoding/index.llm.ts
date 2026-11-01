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
  loadLlmModel,
  clearLlmModelCache,
  normalizeModelName,
} from "./llm.js";

export {
  BitStreamReader,
  BitStreamWriter,
  bytesToLlmText,
  llmTextToBytes,
  loadLlmModel,
  clearLlmModelCache,
  normalizeModelName,
};

/**
 * Encodes a Uint8Array byte stream into English-like carrier text (supporting news, poetry, and LLM).
 */
export function bytesToEnglishText(
  bytes: Uint8Array,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): string | Promise<string> {
  if (config.style === "llm") {
    return bytesToLlmText(bytes, config);
  }
  return lightBytesToEnglishText(bytes, config);
}

/**
 * Decodes carrier text back into the encoded Uint8Array byte stream (supporting news, poetry, and LLM).
 */
export function englishTextToBytes(
  text: string,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): Uint8Array | Promise<Uint8Array> {
  if (config.style === "llm") {
    return llmTextToBytes(text, config);
  }
  return lightEnglishTextToBytes(text, config);
}
