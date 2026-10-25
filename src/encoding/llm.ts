/**
 * Modern ONNX Language Model Steganography Module
 * Powered by @huggingface/transformers (v3)
 */

import {
  env,
  AutoTokenizer,
  AutoModelForCausalLM,
  AutoConfig,
  Tensor,
} from "@huggingface/transformers";

// Disable local relative search so web dev-servers don't return HTML index pages on 404s
env.allowLocalModels = false;
env.allowRemoteModels = true;

import { EncodingConfig, EncodingError } from "../config/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

// Cache for loaded model and tokenizer instances
const modelCache = new Map<string, { model: any; tokenizer: any }>();

export interface LlmModelPair {
  model: any;
  tokenizer: any;
}

export interface ParsedModelTarget {
  modelId: string;
  revision?: string;
  subfolder?: string;
  dtype: "q4" | "q8" | "fp16" | "fp32" | "auto";
}

/**
 * Clears the browser's Transformers CacheStorage to prevent poisoned 404 responses.
 */
export async function clearTransformersBrowserCache(): Promise<void> {
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      await window.caches.delete("transformers-cache");
    } catch {
      // Ignore if cache API unavailable
    }
  }
}

/**
 * Normalizes user input (HF web URLs or repo IDs) into clean model IDs and dtypes.
 * Handles inputs like:
 * - "onnx-community/Supra-Mini-v2-0.1M-ONNX"
 * - "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/tree/main/onnx"
 * - "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/onnx/model_q4.onnx"
 */
export function parseHfUrl(input?: string): ParsedModelTarget {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return { modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX", dtype: "q4" };
  }

  const cleaned = input.trim().split("?")[0].split("#")[0];
  const urlPattern =
    /huggingface\.co\/([^\/]+)\/([^\/]+)(?:\/(resolve|blob|tree|raw)\/([^\/]+)(?:\/(.+))?)?/i;
  const match = cleaned.match(urlPattern);

  if (match) {
    const owner = match[1];
    const repo = match[2];
    const modelId = `${owner}/${repo}`;
    const revision = match[4] || "main";
    let rawPath = (match[5] || "").replace(/^\/+|\/+$/g, "");

    let dtype: "q4" | "q8" | "fp16" | "fp32" | "auto" = "q4";

    if (rawPath.toLowerCase().endsWith(".onnx")) {
      const fileName = rawPath.split("/").pop()!.toLowerCase();
      if (fileName.includes("q4")) dtype = "q4";
      else if (fileName.includes("fp16")) dtype = "fp16";
      else if (fileName.includes("quantized") || fileName.includes("int8") || fileName.includes("q8")) dtype = "q8";
      else dtype = "fp32";
      rawPath = rawPath.substring(0, rawPath.lastIndexOf("/"));
    }

    // Strip redundant leading "onnx" folder since Transformers.js handles ONNX directory structure
    const pathParts = rawPath ? rawPath.split("/") : [];
    if (pathParts[0]?.toLowerCase() === "onnx") {
      pathParts.shift();
    }
    const subfolder = pathParts.length > 0 ? pathParts.join("/") : undefined;

    return { modelId, revision, subfolder, dtype };
  }

  return { modelId: cleaned, dtype: "q4" };
}

export function normalizeModelName(input?: string): string {
  return parseHfUrl(input).modelId;
}

/**
 * Loads or retrieves a cached ONNX Causal Language Model and Tokenizer.
 */
export async function loadLlmModel(config: EncodingConfig): Promise<LlmModelPair> {
  if (config.llmCustomModel && config.llmCustomTokenizer) {
    return {
      model: config.llmCustomModel,
      tokenizer: config.llmCustomTokenizer,
    };
  }

  const parsed = parseHfUrl(config.llmModel);
  const cacheKey = `${parsed.modelId}:${parsed.dtype}:${config.llmCacheDir || "default"}`;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }

  if (config.llmCacheDir) {
    env.cacheDir = config.llmCacheDir;
  }

  try {
    // 1. Resolve Tokenizer
    // If the ONNX repository does not host tokenizer.json, resolve it from the parent repository
    let tokenizer: any;
    try {
      tokenizer = await AutoTokenizer.from_pretrained(parsed.modelId, {
        revision: parsed.revision ?? "main",
      });
    } catch {
      try {
        // Inspect config._name_or_path to find base model (e.g. SupraLabs/Supra-Mini-v2-0.1M)
        const modelConfig = await AutoConfig.from_pretrained(parsed.modelId, {
          revision: parsed.revision ?? "main",
        });
        const parentRepo = (modelConfig as any)?._name_or_path;
        if (parentRepo && parentRepo !== parsed.modelId) {
          tokenizer = await AutoTokenizer.from_pretrained(parentRepo);
        } else {
          tokenizer = await AutoTokenizer.from_pretrained("Xenova/gpt2");
        }
      } catch {
        tokenizer = await AutoTokenizer.from_pretrained("Xenova/gpt2");
      }
    }

    // 2. Load Causal LM with modern v3 configuration
    // Uses WebGPU if available, falling back to WASM automatically
    const model = await AutoModelForCausalLM.from_pretrained(parsed.modelId, {
      dtype: parsed.dtype,
      device: "webgpu", // switches to WASM if WebGPU is not supported by the browser
      revision: parsed.revision ?? "main",
    });

    const pair = { model, tokenizer };
    modelCache.set(cacheKey, pair);
    return pair;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If a corrupted HTML response was previously cached in the browser, evict it
    await clearTransformersBrowserCache();
    throw new EncodingError(
      `Failed to load ONNX model '${parsed.modelId}'. Error: ${msg}`
    );
  }
}

export function clearLlmModelCache(): void {
  modelCache.clear();
}
/**
 * Constructs required ONNX graph inputs: input_ids, attention_mask, and position_ids.
 * Universally compatible with Llama, Mistral, Gemma, and GPT-2 architectures.
 */
function buildModelInputs(tokenIds: number[]) {
  const seqLen = tokenIds.length;

  const input_ids = new Tensor(
    "int64",
    BigInt64Array.from(tokenIds.map((id) => BigInt(id))),
    [1, seqLen]
  );

  const attention_mask = new Tensor(
    "int64",
    new BigInt64Array(seqLen).fill(1n),
    [1, seqLen]
  );

  const position_ids = new Tensor(
    "int64",
    BigInt64Array.from({ length: seqLen }, (_, i) => BigInt(i)),
    [1, seqLen]
  );

  return { input_ids, attention_mask, position_ids };
}

/**
 * Deterministically sorts logits descending and breaks ties by token ID ascending.
 */
function getTopKTokenIds(logitsData: Float32Array | number[], k: number): number[] {
  const candidates: { id: number; score: number }[] = [];
  for (let id = 0; id < logitsData.length; id++) {
    candidates.push({ id, score: Number(logitsData[id]) });
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.id - b.id;
  });

  return candidates.slice(0, k).map((c) => c.id);
}

export async function bytesToLlmText(
  bytes: Uint8Array,
  config: EncodingConfig
): Promise<string> {
  const { model, tokenizer } = await loadLlmModel(config);

  const bitsPerToken = Math.max(1, Math.min(16, config.bitsPerToken ?? 4));
  const k = 1 << bitsPerToken;

  const header = new Uint8Array(4);
  const totalPayloadBits = bytes.length * 8;
  new DataView(header.buffer).setUint32(0, totalPayloadBits, false);

  const fullPayload = new Uint8Array(4 + bytes.length);
  fullPayload.set(header, 0);
  fullPayload.set(bytes, 4);

  const bitReader = new BitStreamReader(fullPayload);
  const prompt = config.llmPrompt ?? "In recent news,";

  const encodedPrompt = tokenizer(prompt);
  let currentTokenIds: number[] = Array.from(encodedPrompt.input_ids.data).map(Number);

  while (bitReader.hasBits) {
    // Generate inputs with input_ids, attention_mask, and position_ids
    const inputs = buildModelInputs(currentTokenIds);
    const outputs = await model(inputs);

    const logits = outputs.logits;
    const [, seqLen, vocabSize] = logits.dims;

    const lastTokenLogitsOffset = (seqLen - 1) * vocabSize;
    const lastLogitsData = logits.data.subarray(
      lastTokenLogitsOffset,
      lastTokenLogitsOffset + vocabSize
    );

    const topKTokenIds = getTopKTokenIds(lastLogitsData, k);
    const bitVal = bitReader.readBits(bitsPerToken);
    const chosenTokenId = topKTokenIds[bitVal % k];

    currentTokenIds.push(chosenTokenId);
  }

  return tokenizer.decode(currentTokenIds, { skip_special_tokens: true });
}

/**
 * Decodes LLM carrier text back into whitened binary bytes.
 */
export async function llmTextToBytes(
  carrierText: string,
  config: EncodingConfig
): Promise<Uint8Array> {
  const { model, tokenizer } = await loadLlmModel(config);

  const bitsPerToken = Math.max(1, Math.min(16, config.bitsPerToken ?? 4));
  const k = 1 << bitsPerToken;

  const prompt = config.llmPrompt ?? "In recent news,";
  const promptTokenIds: number[] = Array.from(tokenizer(prompt).input_ids.data).map(Number);
  const fullTokenIds: number[] = Array.from(tokenizer(carrierText).input_ids.data).map(Number);

  if (fullTokenIds.length <= promptTokenIds.length) {
    throw new EncodingError("Carrier text does not contain any generated LLM payload tokens.");
  }

  const bitWriter = new BitStreamWriter();
  let currentTokenIds: number[] = promptTokenIds.slice();
  const generatedTokens = fullTokenIds.slice(promptTokenIds.length);

  for (const actualTokenId of generatedTokens) {
    // Generate inputs with input_ids, attention_mask, and position_ids
    const inputs = buildModelInputs(currentTokenIds);
    const outputs = await model(inputs);

    const logits = outputs.logits;
    const [, seqLen, vocabSize] = logits.dims;

    const lastTokenLogitsOffset = (seqLen - 1) * vocabSize;
    const lastLogitsData = logits.data.subarray(
      lastTokenLogitsOffset,
      lastTokenLogitsOffset + vocabSize
    );

    const topKTokenIds = getTopKTokenIds(lastLogitsData, k);
    const rank = topKTokenIds.indexOf(actualTokenId);

    if (rank === -1) {
      throw new EncodingError(
        `Decoding failed: Token ID ${actualTokenId} was not in top ${k} candidate pool during reconstruction.`
      );
    }

    bitWriter.writeBits(rank, bitsPerToken);
    currentTokenIds.push(actualTokenId);
  }

  const rawBytes = bitWriter.toBytes();
  if (rawBytes.length < 4) {
    throw new EncodingError("Carrier text payload is too short to read length header.");
  }

  const totalPayloadBits = new DataView(rawBytes.buffer, rawBytes.byteOffset, 4).getUint32(0, false);
  const expectedPayloadBytes = Math.ceil(totalPayloadBits / 8);

  if (rawBytes.length < 4 + expectedPayloadBytes) {
    throw new EncodingError(
      `Truncated carrier text: Expected ${expectedPayloadBytes} payload bytes, but received ${rawBytes.length - 4}.`
    );
  }

  return rawBytes.subarray(4, 4 + expectedPayloadBytes);
}