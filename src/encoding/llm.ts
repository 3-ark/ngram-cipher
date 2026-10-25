/**
 * Modern ONNX Language Model Steganography Module
 * Featuring Stepwise Tokenization Verification (StepVerify)
 * Powered by @huggingface/transformers (v3)
 */

import {
  env,
  AutoTokenizer,
  AutoModelForCausalLM,
  Tensor,
} from "@huggingface/transformers";

// Disable local relative search to prevent 404 HTML fallback issues
env.allowLocalModels = false;
env.allowRemoteModels = true;

import { EncodingConfig, EncodingError } from "../config/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

const modelCache = new Map<string, { model: any; tokenizer: any }>();

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
 * Resolves candidate repository IDs for loading tokenizers when ONNX models
 * omit tokenizer config files or are hosted under converted onnx-community repositories.
 */
export function resolveTokenizerCandidates(modelId: string): string[] {
  const candidates: string[] = [];

  if (!modelId || typeof modelId !== "string" || modelId.trim().length === 0) {
    return ["Xenova/gpt2"];
  }

  const trimmed = modelId.trim();
  candidates.push(trimmed);

  // 1. Direct Supra-Mini base repository mapping:
  // e.g. onnx-community/Supra-Mini-v6-1M-ONNX -> SupraLabs/Supra-Mini-v6-1M
  if (/^onnx-community\/Supra-Mini-/i.test(trimmed)) {
    const baseName = trimmed.replace(/^onnx-community\//i, "").replace(/-ONNX$/i, "");
    candidates.push(`SupraLabs/${baseName}`);
  }

  // 2. Generic onnx-community or -ONNX suffix pattern
  if (/^onnx-community\//i.test(trimmed) || /-ONNX$/i.test(trimmed)) {
    const baseRepo = trimmed.replace(/-ONNX$/i, "");
    candidates.push(baseRepo);

    const noPrefix = baseRepo.replace(/^onnx-community\//i, "");
    candidates.push(noPrefix);

    if (noPrefix.toLowerCase().startsWith("supra-mini")) {
      candidates.push(`SupraLabs/${noPrefix}`);
    } else if (noPrefix.toLowerCase().startsWith("llama")) {
      candidates.push(`meta-llama/${noPrefix}`);
    } else if (noPrefix.toLowerCase().startsWith("qwen")) {
      candidates.push(`Qwen/${noPrefix}`);
    } else if (noPrefix.toLowerCase().startsWith("phi")) {
      candidates.push(`microsoft/${noPrefix}`);
    } else if (noPrefix.toLowerCase().startsWith("gemma")) {
      candidates.push(`google/${noPrefix}`);
    }

    candidates.push(`Xenova/${noPrefix}`);
  }

  // 3. Ultimate fallback tokenizer repository
  candidates.push("Xenova/gpt2");

  // Deduplicate while preserving priority order
  return Array.from(new Set(candidates));
}

export function parseHfUrl(input?: string): ParsedModelTarget {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return { modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX", quantized: true };
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

    let model_file_name: string | undefined;
    let quantized = true;

    if (rawPath.toLowerCase().endsWith(".onnx")) {
      quantized = false;
      const fileNameWithExt = rawPath.split("/").pop()!;
      model_file_name = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf("."));
      rawPath = rawPath.substring(0, rawPath.lastIndexOf("/"));
    }

    const subfolder = rawPath && rawPath !== "config.json" ? rawPath : undefined;

    return { modelId, revision, subfolder, model_file_name, quantized };
  }

  return { modelId: cleaned, quantized: true };
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
  // Allow manual override via config if needed, otherwise use parsed/default fp16
  const selectedDtype = (config as any).llmDtype || parsed.dtype || "fp16";

  const cacheKey = `${parsed.modelId}:${selectedDtype}:${config.llmCacheDir || "default"}`;

  if (modelCache.has(cacheKey)) {
    return modelCache.get(cacheKey)!;
  }

  if (config.llmCacheDir) {
    env.cacheDir = config.llmCacheDir;
  }

  try {
    const tokenizerCandidates = resolveTokenizerCandidates(parsed.modelId);
    let tokenizer: any;
    let lastTokenizerError: unknown;

    for (const candidate of tokenizerCandidates) {
      try {
        tokenizer = await AutoTokenizer.from_pretrained(candidate, {
          revision: parsed.revision ?? "main",
        });
        if (tokenizer) break;
      } catch (err) {
        lastTokenizerError = err;
        try {
          tokenizer = await AutoTokenizer.from_pretrained(candidate);
          if (tokenizer) break;
        } catch (err2) {
          lastTokenizerError = err2;
        }
      }
    }

    if (!tokenizer) {
      const msg = lastTokenizerError instanceof Error ? lastTokenizerError.message : String(lastTokenizerError);
      throw new Error(`Failed to load tokenizer for '${parsed.modelId}'. ${msg}`);
    }

    let model: any;
    let lastModelError: unknown;

    const modelOptsBase: Record<string, any> = {};
    if (parsed.subfolder) {
      modelOptsBase.subfolder = parsed.subfolder;
    }
    if (parsed.model_file_name) {
      modelOptsBase.file_name = parsed.model_file_name;
    }

    const modelAttempts = [
      { ...modelOptsBase, dtype: selectedDtype, device: "webgpu" as const, revision: parsed.revision ?? "main" },
      { ...modelOptsBase, dtype: selectedDtype, device: "cpu" as const, revision: parsed.revision ?? "main" },
      { dtype: selectedDtype, device: "cpu" as const, revision: parsed.revision ?? "main" },
      { dtype: selectedDtype, device: "cpu" as const },
      { device: "cpu" as const },
    ];

    for (const opts of modelAttempts) {
      try {
        model = await AutoModelForCausalLM.from_pretrained(parsed.modelId, opts);
        if (model) break;
      } catch (err) {
        lastModelError = err;
      }
    }

    if (!model) {
      const msg = lastModelError instanceof Error ? lastModelError.message : String(lastModelError);
      throw new Error(msg);
    }

    const pair = { model, tokenizer };
    modelCache.set(cacheKey, pair);
    return pair;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
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
 * Stepwise Verification:
 * Validates that candidateTokenId does not cause BPE subword fusion when decoded to text.
 */
function isTokenReversible(
  currentTokens: number[],
  candidateTokenId: number,
  tokenizer: any
): boolean {
  if (candidateTokenId < 0) return false;

  const trialTokens = [...currentTokens, candidateTokenId];
  const trialText = tokenizer.decode(trialTokens, { skip_special_tokens: false });
  const reencoded = Array.from(tokenizer(trialText).input_ids.data).map(Number);

  if (reencoded.length !== trialTokens.length) return false;
  return reencoded[reencoded.length - 1] === candidateTokenId;
}

/**
 * Selects top-K candidate tokens that are strictly reversible under BPE.
 */
function getTopKReversibleTokenIds(
  logitsData: Float32Array | number[],
  k: number,
  currentTokens: number[],
  tokenizer: any
): number[] {
  const ranked: { id: number; score: number }[] = [];
  for (let id = 0; id < logitsData.length; id++) {
    ranked.push({ id, score: Number(logitsData[id]) });
  }

  // Sort descending by logit score
  ranked.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.id - b.id));

  const validTokens: number[] = [];
  for (const item of ranked) {
    if (isTokenReversible(currentTokens, item.id, tokenizer)) {
      validTokens.push(item.id);
      if (validTokens.length === k) break;
    }
  }

  // If strict reversibility yielded fewer than k due to high vocabulary restriction,
  // backfill with raw top logits
  if (validTokens.length < k) {
    for (const item of ranked) {
      if (!validTokens.includes(item.id)) {
        validTokens.push(item.id);
        if (validTokens.length === k) break;
      }
    }
  }

  return validTokens.slice(0, k);
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
  const k = 1 << bitsPerToken;

  const header = new Uint8Array(4);
  const totalPayloadBits = bytes.length * 8;
  new DataView(header.buffer).setUint32(0, totalPayloadBits, false);

  const fullPayload = new Uint8Array(4 + bytes.length);
  fullPayload.set(header, 0);
  fullPayload.set(bytes, 4);

  const bitReader = new BitStreamReader(fullPayload);

  // Normalize prompt to end with a space to establish clean word boundaries
  let prompt = config.llmPrompt ?? "In recent news,";
  if (!prompt.endsWith(" ") && !prompt.endsWith("\n")) {
    prompt += " ";
  }

  const encodedPrompt = tokenizer(prompt);
  let currentTokenIds: number[] = Array.from(encodedPrompt.input_ids.data).map(Number);

  while (bitReader.hasBits) {
    const inputs = buildModelInputs(currentTokenIds);
    const outputs = await model(inputs);

    const logits = outputs.logits;
    const [, seqLen, vocabSize] = logits.dims;

    const lastTokenLogitsOffset = (seqLen - 1) * vocabSize;
    const lastLogitsData = logits.data.subarray(
      lastTokenLogitsOffset,
      lastTokenLogitsOffset + vocabSize
    );

    // Get the top-K tokens verified not to cause BPE merge desynchronization
    const topKTokenIds = getTopKReversibleTokenIds(
      lastLogitsData,
      k,
      currentTokenIds,
      tokenizer
    );

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

  let prompt = config.llmPrompt ?? "In recent news,";
  if (!prompt.endsWith(" ") && !prompt.endsWith("\n")) {
    prompt += " ";
  }

  const promptTokenIds: number[] = Array.from(tokenizer(prompt).input_ids.data).map(Number);
  const fullTokenIds: number[] = Array.from(tokenizer(carrierText).input_ids.data).map(Number);

  if (fullTokenIds.length <= promptTokenIds.length) {
    throw new EncodingError("Carrier text does not contain any generated LLM payload tokens.");
  }

  const bitWriter = new BitStreamWriter();
  let currentTokenIds: number[] = promptTokenIds.slice();
  const generatedTokens = fullTokenIds.slice(promptTokenIds.length);

  for (const actualTokenId of generatedTokens) {
    const inputs = buildModelInputs(currentTokenIds);
    const outputs = await model(inputs);

    const logits = outputs.logits;
    const [, seqLen, vocabSize] = logits.dims;

    const lastTokenLogitsOffset = (seqLen - 1) * vocabSize;
    const lastLogitsData = logits.data.subarray(
      lastTokenLogitsOffset,
      lastTokenLogitsOffset + vocabSize
    );

    // Filter using the exact same step-verification logic
    const topKTokenIds = getTopKReversibleTokenIds(
      lastLogitsData,
      k,
      currentTokenIds,
      tokenizer
    );

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