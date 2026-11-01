/**
 * Reversible Encoding and Decoding Engine (Lightweight non-LLM)
 */
import { EncodingConfig } from "../config/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";
export { BitStreamReader, BitStreamWriter };
/**
 * Encodes a Uint8Array byte stream into English-like carrier text (lightweight non-LLM).
 */
export declare function bytesToEnglishText(bytes: Uint8Array, config?: EncodingConfig): string;
/**
 * Decodes carrier text back into the encoded Uint8Array byte stream (lightweight non-LLM).
 */
export declare function englishTextToBytes(text: string, config?: EncodingConfig): Uint8Array;
