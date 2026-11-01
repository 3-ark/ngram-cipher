/**
 * Modern ONNX Language Model Steganography Module
 * Featuring Stepwise Tokenization Verification (StepVerify)
 * Powered by @huggingface/transformers (v3)
 */
import { EncodingConfig } from "../config/index.js";
export interface LlmModelPair {
    model: any;
    tokenizer: any;
}
export interface ParsedModelTarget {
    modelId: string;
    revision?: string;
    subfolder?: string;
    model_file_name?: string;
    quantized?: boolean;
    dtype?: "q4" | "q8" | "fp16" | "fp32" | "auto";
}
/**
 * Resolves requested device to CPU execution provider device strings ("cpu" in Node.js, "wasm" in Browser)
 * to prevent GPU floating-point non-determinism across platforms from corrupting steganographic logit ranks.
 */
export declare function resolveLlmDevice(requestedDevice?: string, isNodeEnvironment?: boolean): string;
export declare function resolveLlmCpuThreads(hardwareConcurrency?: number): number;
/**
 * Resolves candidate repository IDs for loading ONNX Causal Language Models
 * across original model hubs and converted ONNX community hubs.
 */
export declare function resolveModelRepoCandidates(modelId: string): string[];
/**
 * Resolves candidate repository IDs for loading tokenizers when ONNX models
 * omit tokenizer config files or are hosted under converted onnx-community repositories.
 */
export declare function resolveTokenizerCandidates(modelId: string): string[];
export declare function parseHfUrl(input?: string): ParsedModelTarget;
export declare function normalizeModelName(input?: string): string;
/**
 * Loads or retrieves a cached ONNX Causal Language Model and Tokenizer.
 */
export declare function loadLlmModel(config: EncodingConfig): Promise<LlmModelPair>;
export declare function clearLlmModelCache(): void;
/**
 * Selects top-K candidate tokens that are strictly reversible under tokenizer re-encoding.
 * Tokens whose decoded text contains paragraph-breaking characters (newlines, carriage returns)
 * are excluded to preserve the structural integrity of the carrier text.
 */
export declare function getTopKReversibleTokenIds(logitsData: Float32Array | number[], k: number, currentTokens: number[], tokenizer: any, options?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    precision?: number;
}): number[];
/**
 * Encodes binary payload into LLM-generated carrier text.
 */
export declare function bytesToLlmText(bytes: Uint8Array, config: EncodingConfig): Promise<string>;
/**
 * Decodes LLM carrier text back into binary bytes with dynamic boundary termination.
 */
export declare function llmTextToBytes(carrierText: string, config: EncodingConfig): Promise<Uint8Array>;
