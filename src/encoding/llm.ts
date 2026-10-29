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

// Disable local relative search to prevent 404 HTML fallback issues in web/node environments
env.allowLocalModels = false;
env.allowRemoteModels = true;

import { EncodingConfig, EncodingError } from "../config/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

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

const modelCache = new Map<string, LlmModelPair>();

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

  if (/^onnx-community\/Supra-Mini-/i.test(trimmed)) {
    const baseName = trimmed.replace(/^onnx-community\//i, "").replace(/-ONNX$/i, "");
    candidates.push(`SupraLabs/${baseName}`);
  }

  if (/^onnx-community\//i.test(trimmed) || /-ONNX$/i.test(trimmed)) {
    const baseRepo = trimmed.replace(/-ONNX$/i, "");
    candidates.push(baseRepo);

    const noPrefix = baseRepo.replace(/^onnx-community\//i, "");
    candidates.push(noPrefix);

    const parts = noPrefix.split("/");
    const repoName = parts[parts.length - 1];
    const lowerRepoName = repoName.toLowerCase();
    const lowerNoPrefix = noPrefix.toLowerCase();

    if (lowerRepoName.startsWith("supra-mini") || lowerNoPrefix.startsWith("supra-mini")) {
      candidates.push(`SupraLabs/${repoName}`);
    } else if (lowerRepoName.startsWith("llama") || lowerNoPrefix.startsWith("llama")) {
      candidates.push(`meta-llama/${repoName}`);
    } else if (lowerRepoName.startsWith("qwen") || lowerNoPrefix.startsWith("qwen")) {
      candidates.push(`Qwen/${repoName}`);
    } else if (lowerRepoName.startsWith("phi") || lowerNoPrefix.startsWith("phi")) {
      candidates.push(`microsoft/${repoName}`);
    } else if (lowerRepoName.startsWith("gemma") || lowerNoPrefix.startsWith("gemma")) {
      candidates.push(`google/${repoName}`);
    }

    candidates.push(`Xenova/${repoName}`);
  }

  candidates.push("Xenova/gpt2");
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
      rawPath = rawPath.includes("/") ? rawPath.substring(0, rawPath.lastIndexOf("/")) : "";
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
  const selectedDtype = (config as any).llmDtype || parsed.dtype || "fp16";

  // Cache key includes complete model provenance to avoid cross-configuration pollution
  const cacheKey = [
    parsed.modelId,
    parsed.revision ?? "main",
    parsed.subfolder ?? "root",
    parsed.model_file_name ?? "default",
    selectedDtype,
    config.llmDevice ?? "cpu",
    config.llmCacheDir ?? "default",
  ].join("::");

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
    if (parsed.subfolder) modelOptsBase.subfolder = parsed.subfolder;
    if (parsed.model_file_name) modelOptsBase.file_name = parsed.model_file_name;

    const primaryDevice = config.llmDevice === "webgpu" ? ("webgpu" as const) : ("cpu" as const);
    const secondaryDevice = primaryDevice === "cpu" ? ("webgpu" as const) : ("cpu" as const);

    const modelAttempts = [
      { ...modelOptsBase, dtype: selectedDtype, device: primaryDevice, revision: parsed.revision ?? "main" },
      { ...modelOptsBase, dtype: selectedDtype, device: secondaryDevice, revision: parsed.revision ?? "main" },
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
    throw new EncodingError(`Failed to load ONNX model '${parsed.modelId}'. Error: ${msg}`);
  }
}

export function clearLlmModelCache(): void {
  modelCache.clear();
}

/**
 * Builds standard ONNX CausalLM inputs: input_ids and attention_mask.
 * Note: position_ids is omitted to prevent 'Invalid Feed Name' runtime errors on various ONNX models.
 */
function buildModelInputs(tokenIds: number[]): { input_ids: Tensor; attention_mask: Tensor } {
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

  return { input_ids, attention_mask };
}

/**
 * Stepwise Verification:
 * Strictly ensures candidateTokenId does not fuse with preceding subwords or alter the tokenization sequence.
 */
function isTokenReversible(
  currentTokens: number[],
  candidateTokenId: number,
  tokenizer: any
): boolean {
  if (candidateTokenId < 0) return false;

  const trialTokens = [...currentTokens, candidateTokenId];
  // Decode without dropping tokens
  const trialText = tokenizer.decode(trialTokens, { skip_special_tokens: false });
  
  // Re-encode WITHOUT injecting extra BOS tokens to prevent length mismatch false negatives
  const encoded = tokenizer(trialText, { add_special_tokens: false });
  const rawData = encoded?.input_ids?.data ?? encoded?.input_ids ?? encoded;
  const reencoded: number[] = Array.from(rawData ?? []).map(Number);

  if (reencoded.length !== trialTokens.length) {
    return false;
  }

  // Strict element-by-element verification of the entire token sequence
  for (let i = 0; i < trialTokens.length; i++) {
    if (reencoded[i] !== trialTokens[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Selects top-K candidate tokens that are strictly reversible under tokenizer re-encoding.
 * Tokens whose decoded text contains paragraph-breaking characters (newlines, carriage returns)
 * are excluded to preserve the structural integrity of the carrier text.
 */
export function getTopKReversibleTokenIds(
  logitsData: Float32Array | number[],
  k: number,
  currentTokens: number[],
  tokenizer: any,
  options?: {
    temperature?: number;
    topP?: number;
    topK?: number;
  }
): number[] {
  const temp = options?.temperature && options.temperature > 0 ? options.temperature : 1.0;
  // Maximum search horizon to identify k strictly reversible tokens
  const maxSearchLimit = Math.min(logitsData.length, Math.max(k * 20, 500));

  // 1. Exclude special tokens (EOS, BOS, PAD, etc.) from ever entering steganography pools
  const specialIds = new Set<number>(tokenizer.all_special_ids ?? []);

  let ranked: { id: number; score: number }[] = [];
  for (let id = 0; id < logitsData.length; id++) {
    if (specialIds.has(id)) continue;
    // Exclude tokens whose decoded text would introduce paragraph-breaking whitespace
    const decodedCandidate: string = tokenizer.decode([id], { skip_special_tokens: false });
    if (/[\r\n]/.test(decodedCandidate)) continue;
    const rawScore = Number(logitsData[id]);
    ranked.push({ id, score: temp !== 1.0 ? rawScore / temp : rawScore });
  }

  // Deterministic descending sort, ties broken by lower token ID
  ranked.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.id - b.id));

  // 2. Apply Top-K truncation if specified
  if (options?.topK && options.topK > 0) {
    const effectiveTopK = Math.max(options.topK, k);
    if (ranked.length > effectiveTopK) {
      ranked = ranked.slice(0, effectiveTopK);
    }
  }

  // 3. Apply Top-P nucleus sampling if specified
  if (options?.topP && options.topP > 0 && options.topP < 1.0) {
    const maxScore = ranked.length > 0 ? Math.max(...ranked.map((r) => r.score)) : 0;
    const exps = ranked.map((r) => Math.exp(r.score - maxScore));
    const sumExp = exps.reduce((a, b) => a + b, 0);

    if (sumExp > 0) {
      let cumProb = 0;
      let cutoffIndex = ranked.length;
      for (let i = 0; i < ranked.length; i++) {
        cumProb += exps[i] / sumExp;
        if (cumProb >= options.topP) {
          cutoffIndex = Math.max(i + 1, k);
          break;
        }
      }
      ranked = ranked.slice(0, cutoffIndex);
    }
  }

  // 4. Select ONLY reversible tokens up to capacity k
  const validTokens: number[] = [];
  const searchBound = Math.min(ranked.length, maxSearchLimit);

  for (let i = 0; i < searchBound; i++) {
    const candidateId = ranked[i].id;
    if (isTokenReversible(currentTokens, candidateId, tokenizer)) {
      validTokens.push(candidateId);
      if (validTokens.length === k) break;
    }
  }

  // 5. Strict verification: Never backfill unverified tokens!
  if (validTokens.length < k) {
    throw new EncodingError(
      `StepVerify failed: Insufficient reversible tokens (found ${validTokens.length}/${k}) ` +
      `within top ${searchBound} candidates. Aborting to prevent data corruption.`
    );
  }

  return validTokens;
}

/**
 * Encodes binary payload into LLM-generated carrier text.
 */
export async function bytesToLlmText(
  bytes: Uint8Array,
  config: EncodingConfig
): Promise<string> {
  const { model, tokenizer } = await loadLlmModel(config);

  const bitsPerToken = Math.max(1, Math.min(16, config.bitsPerToken ?? 4));
  const k = 1 << bitsPerToken;

  // Header: 32-bit Big-Endian payload length in bits
  const totalPayloadBits = bytes.length * 8;
  const header = new Uint8Array(4);
  new DataView(header.buffer).setUint32(0, totalPayloadBits, false);

  const fullPayload = new Uint8Array(4 + bytes.length);
  fullPayload.set(header, 0);
  fullPayload.set(bytes, 4);

  const bitReader = new BitStreamReader(fullPayload);

  // Normalize prompt with trailing space for clean word boundary tokenization
  let prompt = config.llmPrompt ?? "In recent news,";
  if (!prompt.endsWith(" ") && !prompt.endsWith("\n")) {
    prompt += " ";
  }

  const encodedPrompt = tokenizer(prompt, { add_special_tokens: false });
  const promptRaw = encodedPrompt?.input_ids?.data ?? encodedPrompt?.input_ids ?? encodedPrompt;
  const promptTokenIds: number[] = Array.from(promptRaw).map(Number);
  const currentTokenIds: number[] = promptTokenIds.slice();

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

    const topKTokenIds = getTopKReversibleTokenIds(
      lastLogitsData,
      k,
      currentTokenIds,
      tokenizer,
      {
        temperature: config.llmTemperature,
        topP: config.llmTopP,
        topK: config.llmTopK,
      }
    );

    // Read up to bitsPerToken (may read fewer bits at EOF)
    const bitsToRead = Math.min(bitsPerToken, bitReader.remainingBits ?? bitsPerToken);
    const bitVal = bitReader.readBits(bitsToRead);
    
    // Select token index deterministically
    const chosenTokenId = topKTokenIds[bitVal];
    currentTokenIds.push(chosenTokenId);
  }

  // Decode only the generated tokens, excluding the prompt prefix.
  // The prompt is used purely as LLM context and must not appear in the carrier text output.
  const generatedTokenIds = currentTokenIds.slice(promptTokenIds.length);
  return tokenizer.decode(generatedTokenIds, { skip_special_tokens: false });
}

/**
 * Decodes LLM carrier text back into binary bytes with dynamic boundary termination.
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

  const promptEncoded = tokenizer(prompt, { add_special_tokens: false });
  const promptRaw = promptEncoded?.input_ids?.data ?? promptEncoded?.input_ids ?? promptEncoded;
  const promptTokenIds: number[] = Array.from(promptRaw).map(Number);

  // Carrier text contains only the generated tokens (prompt is excluded from the output).
  // Re-tokenize the carrier text to recover the generated token IDs.
  const fullEncoded = tokenizer(carrierText, { add_special_tokens: false });
  const fullRaw = fullEncoded?.input_ids?.data ?? fullEncoded?.input_ids ?? fullEncoded;
  const generatedTokens: number[] = Array.from(fullRaw).map(Number);

  if (generatedTokens.length === 0) {
    throw new EncodingError("Carrier text does not contain any generated LLM payload tokens.");
  }

  const bitWriter = new BitStreamWriter();
  // Seed the context with the prompt tokens so the LLM conditioning is identical to encoding.
  const currentTokenIds: number[] = promptTokenIds.slice();

  let totalPayloadBits: number | null = null;
  let totalBitsRead = 0;

  for (const actualTokenId of generatedTokens) {
    // If we've already extracted the 32-bit header and all payload bits, stop immediately.
    // This prevents evaluating tokens outside the steganography sequence that would trigger rank === -1.
    if (totalPayloadBits !== null && totalBitsRead >= 32 + totalPayloadBits) {
      break;
    }

    const inputs = buildModelInputs(currentTokenIds);
    const outputs = await model(inputs);

    const logits = outputs.logits;
    const [, seqLen, vocabSize] = logits.dims;

    const lastTokenLogitsOffset = (seqLen - 1) * vocabSize;
    const lastLogitsData = logits.data.subarray(
      lastTokenLogitsOffset,
      lastTokenLogitsOffset + vocabSize
    );

    const topKTokenIds = getTopKReversibleTokenIds(
      lastLogitsData,
      k,
      currentTokenIds,
      tokenizer,
      {
        temperature: config.llmTemperature,
        topP: config.llmTopP,
        topK: config.llmTopK,
      }
    );

    const rank = topKTokenIds.indexOf(actualTokenId);
    if (rank === -1) {
      throw new EncodingError(
        `Decoding failed: Token ID ${actualTokenId} was not found in top ${k} candidate pool during reconstruction.`
      );
    }

    // Determine how many bits this token actually carries
    let bitsToExtract = bitsPerToken;
    if (totalPayloadBits !== null) {
      const remainingBitsNeeded = (32 + totalPayloadBits) - totalBitsRead;
      if (remainingBitsNeeded < bitsToExtract) {
        bitsToExtract = remainingBitsNeeded;
      }
    }

    bitWriter.writeBits(rank, bitsToExtract);
    totalBitsRead += bitsToExtract;
    currentTokenIds.push(actualTokenId);

    // Parse header length as soon as the first 32 bits are available
    if (totalPayloadBits === null && totalBitsRead >= 32) {
      const interimBytes = bitWriter.toBytes();
      totalPayloadBits = new DataView(
        interimBytes.buffer,
        interimBytes.byteOffset,
        4
      ).getUint32(0, false);
    }
  }

  const rawBytes = bitWriter.toBytes();
  if (rawBytes.length < 4) {
    throw new EncodingError("Carrier text payload is too short to read length header.");
  }

  if (totalPayloadBits === null) {
    totalPayloadBits = new DataView(rawBytes.buffer, rawBytes.byteOffset, 4).getUint32(0, false);
  }

  const requiredTotalBits = 32 + totalPayloadBits;
  if (totalBitsRead < requiredTotalBits) {
    throw new EncodingError(
      `Truncated carrier text: Expected ${totalPayloadBits} payload bits, but received only ${Math.max(0, totalBitsRead - 32)} payload bits.`
    );
  }

  const expectedPayloadBytes = Math.ceil(totalPayloadBits / 8);
  return rawBytes.subarray(4, 4 + expectedPayloadBytes);
}