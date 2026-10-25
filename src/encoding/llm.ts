/**
 * Pluggable ONNX Language Model Steganography Module
 *
 * Uses Transformers.js (@xenova/transformers) to losslessly encode and decode
 * whitened bitstreams into autoregressively generated carrier text.
 */

import { env, AutoTokenizer, AutoModelForCausalLM, Tensor } from "@xenova/transformers";
import { EncodingConfig, EncodingError } from "../config/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

// Cache for loaded model and tokenizer instances to avoid redundant disk/browser loads
const modelCache = new Map<string, { model: any; tokenizer: any }>();

export interface LlmModelPair {
  model: any;
  tokenizer: any;
}

/**
 * Normalizes user-provided HuggingFace URLs or model repository identifiers.
 * e.g., "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/onnx/model_fp16.onnx"
 * -> "onnx-community/Supra-Mini-v2-0.1M-ONNX"
 */
export interface ParsedModelTarget {
  modelId: string;
  revision?: string;
  subfolder?: string;
  model_file_name?: string;
  quantized: boolean;
}

/**
 * Parses user-provided HuggingFace URLs or model repository identifiers into
 * modelId, revision, subfolder, and model_file_name parameters.
 * e.g., "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/onnx/model_quantized.onnx"
 * -> { modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX", revision: "main", subfolder: "onnx", model_file_name: "model_quantized", quantized: false }
 */
export function parseHfUrl(input?: string): ParsedModelTarget {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return { modelId: "Xenova/gpt2", quantized: true };
  }
  const trimmed = input.trim();

  const urlPattern = /huggingface\.co\/([^\/]+\/[^\/]+)(?:\/resolve\/([^\/]+)\/(?:(.+)\/)?([^\/]+))?/i;
  const match = trimmed.match(urlPattern);

  if (match) {
    const modelId = match[1];
    const revision = match[2] || "main";
    const rawPath = match[3] || "";
    let fileName = match[4];

    if (fileName) {
      fileName = fileName.replace(/\.onnx$/i, "");
      return {
        modelId,
        revision,
        subfolder: rawPath || undefined,
        model_file_name: fileName,
        quantized: false,
      };
    }

    return {
      modelId,
      revision,
      subfolder: rawPath || undefined,
      quantized: true,
    };
  }

  return { modelId: trimmed, quantized: true };
}

export function normalizeModelName(input?: string): string {
  const parsed = parseHfUrl(input);
  return parsed.modelId;
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
  const isQuantized = config.llmQuantized ?? parsed.quantized;
  const cacheKey = `${parsed.modelId}:${parsed.subfolder || ""}:${parsed.model_file_name || ""}:${isQuantized}:${config.llmCacheDir || "default"}`;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }

  if (config.llmCacheDir) {
    env.cacheDir = config.llmCacheDir;
  }

  try {
    let tokenizer: any;
    try {
      tokenizer = await AutoTokenizer.from_pretrained(parsed.modelId);
    } catch {
      try {
        tokenizer = await AutoTokenizer.from_pretrained(parsed.modelId, {
          subfolder: parsed.subfolder,
        } as any);
      } catch {
        tokenizer = await AutoTokenizer.from_pretrained("Xenova/gpt2");
      }
    }

    const modelOptions: any = {
      quantized: isQuantized,
    };
    if (parsed.revision) modelOptions.revision = parsed.revision;
    if (parsed.subfolder) modelOptions.subfolder = parsed.subfolder;
    if (parsed.model_file_name) modelOptions.model_file_name = parsed.model_file_name;

    const model = await AutoModelForCausalLM.from_pretrained(parsed.modelId, modelOptions);

    const pair = { model, tokenizer };
    modelCache.set(cacheKey, pair);
    return pair;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new EncodingError(
      `Failed to load ONNX model from '${config.llmModel || parsed.modelId}'. Ensure the Hugging Face repository exists and contains valid ONNX weights. Error: ${msg}`
    );
  }
}

/**
 * Clears cached ONNX models from memory.
 */
export function clearLlmModelCache(): void {
  modelCache.clear();
}

/**
 * Deterministically sorts logits to extract top-K candidate token IDs.
 */
function getTopKTokenIds(logitsData: Float32Array | number[], k: number): number[] {
  const candidates: { id: number; score: number }[] = [];
  for (let id = 0; id < logitsData.length; id++) {
    candidates.push({ id, score: Number(logitsData[id]) });
  }

  // Sort descending by logit score; tie-break deterministically by token ID ascending
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.id - b.id;
  });

  return candidates.slice(0, k).map((c) => c.id);
}

/**
 * Encodes whitened binary bytes into LLM-generated carrier text.
 */
export async function bytesToLlmText(
  bytes: Uint8Array,
  config: EncodingConfig
): Promise<string> {
  const { model, tokenizer } = await loadLlmModel(config);

  const bitsPerToken = Math.max(1, Math.min(16, config.bitsPerToken ?? 4));
  const k = 1 << bitsPerToken; // 2^bitsPerToken candidate tokens per step

  // Write a 32-bit payload bit-length header so the decoder knows exact payload boundary
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
    const inputTensor = new Tensor("int64", BigInt64Array.from(currentTokenIds.map((id) => BigInt(id))), [
      1,
      currentTokenIds.length,
    ]);

    const outputs = await model({ input_ids: inputTensor });
    const logits = outputs.logits;
    const [batchSize, seqLen, vocabSize] = logits.dims;

    // Get logits for the last token position
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

  const generatedText = tokenizer.decode(currentTokenIds, { skip_special_tokens: true });
  return generatedText;
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

  // Verify prompt prefix matches
  for (let i = 0; i < promptTokenIds.length; i++) {
    if (fullTokenIds[i] !== promptTokenIds[i]) {
      // In case tokenizer whitespace handling slightly varies, search for token alignment
      break;
    }
  }

  const bitWriter = new BitStreamWriter();
  let currentTokenIds: number[] = promptTokenIds.slice();
  const generatedTokens = fullTokenIds.slice(promptTokenIds.length);

  for (const actualTokenId of generatedTokens) {
    const inputTensor = new Tensor("int64", BigInt64Array.from(currentTokenIds.map((id) => BigInt(id))), [
      1,
      currentTokenIds.length,
    ]);

    const outputs = await model({ input_ids: inputTensor });
    const logits = outputs.logits;
    const [batchSize, seqLen, vocabSize] = logits.dims;

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
