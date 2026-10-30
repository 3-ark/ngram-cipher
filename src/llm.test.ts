import { describe, it, expect, beforeEach } from "vitest";
import { encode, decode } from "./ngram.js";
import { EncodingError } from "./config/index.js";
import {
  bytesToLlmText,
  llmTextToBytes,
  loadLlmModel,
  clearLlmModelCache,
  parseHfUrl,
  resolveTokenizerCandidates,
  resolveModelRepoCandidates,
  resolveLlmDevice,
  getTopKReversibleTokenIds,
  normalizeModelName,
  type LlmModelPair
} from "./encoding/llm.js";

/**
 * Deterministic Mock Tokenizer & Causal Language Model
 * Simulates a vocabulary of 64 tokens with fixed logit distributions.
 */
function createMockLlmPair(): LlmModelPair {
  const vocabSize = 64;
  const wordList = Array.from({ length: vocabSize }, (_, i) => `word${i}`);

  const tokenizer = (text: string) => {
    const tokens = text.trim().split(/\s+/).filter(Boolean);
    const ids = tokens.map(t => {
      const idx = wordList.indexOf(t);
      return idx >= 0 ? idx : 0;
    });
    return {
      input_ids: {
        data: BigInt64Array.from(ids.map(id => BigInt(id)))
      }
    };
  };

  tokenizer.decode = (ids: number[] | BigInt64Array, _opts?: any) => {
    const array = Array.from(ids).map(Number);
    return array.map(id => wordList[id % vocabSize] ?? "word0").join(" ");
  };

  const model = async (inputs: { input_ids: any }) => {
    const ids = Array.from(inputs.input_ids.data).map(Number);
    const seqLen = ids.length;

    // Generate logits for each sequence position
    const logitsData = new Float32Array(seqLen * vocabSize);
    for (let pos = 0; pos < seqLen; pos++) {
      const prevToken = ids[pos];
      for (let v = 0; v < vocabSize; v++) {
        // Pseudo-random deterministic logit distribution based on position and prev token
        const score = Math.sin((pos + 1) * 1.5 + (prevToken + 1) * 0.7 + (v + 1) * 0.3) * 10;
        logitsData[pos * vocabSize + v] = score;
      }
    }

    return {
      logits: {
        dims: [1, seqLen, vocabSize],
        data: logitsData
      }
    };
  };

  return { model, tokenizer };
}

describe("Pluggable ONNX LLM Steganography Module", () => {
  beforeEach(() => {
    clearLlmModelCache();
  });

  it("should resolve device options strictly to CPU ('cpu' in Node, 'wasm' in Browser) to guarantee deterministic logit ranks", () => {
    // In Node.js environment, all requested devices map to 'cpu'
    expect(resolveLlmDevice("cpu", true)).toBe("cpu");
    expect(resolveLlmDevice("wasm", true)).toBe("cpu");
    expect(resolveLlmDevice("webgpu", true)).toBe("cpu");
    expect(resolveLlmDevice("auto", true)).toBe("cpu");
    expect(resolveLlmDevice(undefined, true)).toBe("cpu");

    // In Browser environment, all requested devices map to 'wasm' (ONNX Runtime Web CPU EP)
    expect(resolveLlmDevice("cpu", false)).toBe("wasm");
    expect(resolveLlmDevice("wasm", false)).toBe("wasm");
    expect(resolveLlmDevice("webgpu", false)).toBe("wasm");
    expect(resolveLlmDevice("auto", false)).toBe("wasm");
    expect(resolveLlmDevice(undefined, false)).toBe("wasm");
  });

  it("should resolve model repository candidates bi-directionally between SupraLabs and onnx-community", () => {
    const reposFromSupraLabs = resolveModelRepoCandidates("SupraLabs/Supra-Mini-v6-1M");
    expect(reposFromSupraLabs).toContain("SupraLabs/Supra-Mini-v6-1M");
    expect(reposFromSupraLabs).toContain("onnx-community/Supra-Mini-v6-1M-ONNX");

    const reposFromOnnxComm = resolveModelRepoCandidates("onnx-community/Supra-Mini-v6-1M-ONNX");
    expect(reposFromOnnxComm).toContain("onnx-community/Supra-Mini-v6-1M-ONNX");
    expect(reposFromOnnxComm).toContain("SupraLabs/Supra-Mini-v6-1M");
  });

  it("should generate correct tokenizer candidates for ONNX models across various organizational prefixes and edge cases", () => {
    const candidatesV6 = resolveTokenizerCandidates("onnx-community/Supra-Mini-v6-1M-ONNX");
    expect(candidatesV6).toContain("onnx-community/Supra-Mini-v6-1M-ONNX");
    expect(candidatesV6).toContain("SupraLabs/Supra-Mini-v6-1M");
    expect(candidatesV6).toContain("Xenova/gpt2");

    const candidatesSupraDirect = resolveTokenizerCandidates("SupraLabs/Supra-Mini-v6-1M");
    expect(candidatesSupraDirect).toContain("SupraLabs/Supra-Mini-v6-1M");
    expect(candidatesSupraDirect).toContain("onnx-community/Supra-Mini-v6-1M-ONNX");

    const candidatesV2 = resolveTokenizerCandidates("onnx-community/Supra-Mini-v2-0.1M-ONNX");
    expect(candidatesV2).toContain("SupraLabs/Supra-Mini-v2-0.1M");

    const candidatesLlama = resolveTokenizerCandidates("onnx-community/Llama-3.2-1B-Instruct-ONNX");
    expect(candidatesLlama).toContain("meta-llama/Llama-3.2-1B-Instruct");

    const candidatesQwen = resolveTokenizerCandidates("onnx-community/Qwen2.5-0.5B-Instruct-ONNX");
    expect(candidatesQwen).toContain("Qwen/Qwen2.5-0.5B-Instruct");

    const candidatesPhi = resolveTokenizerCandidates("onnx-community/Phi-3.5-mini-instruct-ONNX");
    expect(candidatesPhi).toContain("microsoft/Phi-3.5-mini-instruct");

    const candidatesGemma = resolveTokenizerCandidates("onnx-community/gemma-2-2b-it-ONNX");
    expect(candidatesGemma).toContain("google/gemma-2-2b-it");

    const candidatesCustom = resolveTokenizerCandidates("my-org/my-model-ONNX");
    expect(candidatesCustom).toContain("my-org/my-model");

    const candidatesSimple = resolveTokenizerCandidates("Xenova/gpt2");
    expect(candidatesSimple).toContain("Xenova/gpt2");

    const candidatesEmpty = resolveTokenizerCandidates("");
    expect(candidatesEmpty).toEqual(["Xenova/gpt2"]);

    const candidatesNull = resolveTokenizerCandidates(null as any);
    expect(candidatesNull).toEqual(["Xenova/gpt2"]);
  });

  it("should load model onnx-community/Supra-Mini-v6-1M-ONNX successfully without tokenizer errors", async () => {
    const config = {
      style: "llm" as const,
      llmModel: "onnx-community/Supra-Mini-v6-1M-ONNX",
      bitsPerToken: 3,
      llmPrompt: "In recent news,"
    };

    const loaded = await loadLlmModel(config);
    expect(loaded.model).toBeDefined();
    expect(loaded.tokenizer).toBeDefined();
  }, 30000);

  it("should parse direct Hugging Face ONNX file URLs correctly and normalize model names", () => {
    const url1 = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/onnx/model_fp16.onnx?download=true";
    const parsed1 = parseHfUrl(url1);
    expect(parsed1).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      subfolder: "onnx",
      model_file_name: "model_fp16",
      quantized: false,
    });
    expect(normalizeModelName(url1)).toBe("onnx-community/Supra-Mini-v2-0.1M-ONNX");

    const url2 = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/onnx/model_quantized.onnx";
    const parsed2 = parseHfUrl(url2);
    expect(parsed2).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      subfolder: "onnx",
      model_file_name: "model_quantized",
      quantized: false,
    });

    const url3 = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/config.json?download=true";
    const parsed3 = parseHfUrl(url3);
    expect(parsed3).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      subfolder: undefined,
      quantized: true,
    });

    const url4 = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/tree/main/onnx";
    const parsed4 = parseHfUrl(url4);
    expect(parsed4).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      subfolder: "onnx",
      quantized: true,
    });

    const urlRootFile = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/model.onnx#fragment";
    const parsedRoot = parseHfUrl(urlRootFile);
    expect(parsedRoot).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      subfolder: undefined,
      model_file_name: "model",
      quantized: false,
    });

    const repoOnly = "onnx-community/Supra-Mini-v2-0.1M-ONNX";
    const parsedRepo = parseHfUrl(repoOnly);
    expect(parsedRepo).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      quantized: true,
    });

    const repoWithTree = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/tree/main";
    const parsedTree = parseHfUrl(repoWithTree);
    expect(parsedTree).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      quantized: true,
    });

    const parsedEmpty = parseHfUrl("");
    expect(parsedEmpty).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      quantized: true,
    });
  });

  it("should load real HF repo onnx-community/Supra-Mini-v2-0.1M-ONNX with tree URL", async () => {
    const config = {
      style: "llm" as const,
      llmModel: "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/tree/main/onnx",
      bitsPerToken: 3,
      llmPrompt: "In recent news,"
    };

    const loaded = await loadLlmModel(config);
    expect(loaded.model).toBeDefined();
    expect(loaded.tokenizer).toBeDefined();
  }, 30000);

  it("should support custom pluggable models and tokenizers", async () => {
    const mockPair = createMockLlmPair();
    const config = {
      sentenceEndingVariance: true,
      style: "llm" as const,
      llmCustomModel: mockPair.model,
      llmCustomTokenizer: mockPair.tokenizer,
      bitsPerToken: 3,
      llmPrompt: "word0 word1"
    };

    const loaded = await loadLlmModel(config);
    expect(loaded.model).toBe(mockPair.model);
    expect(loaded.tokenizer).toBe(mockPair.tokenizer);
  });

  it("should encode and decode bytes losslessly using pluggable LLM mode", async () => {
    const mockPair = createMockLlmPair();
    const config = {
      sentenceEndingVariance: true,
      style: "llm" as const,
      llmCustomModel: mockPair.model,
      llmCustomTokenizer: mockPair.tokenizer,
      bitsPerToken: 3,
      llmPrompt: "word0 word1"
    };

    const originalBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x42]);
    const carrierText = await bytesToLlmText(originalBytes, config);

    expect(typeof carrierText).toBe("string");
    // Prompt is excluded from carrier text output; only generated tokens appear
    expect(carrierText.startsWith("word0 word1")).toBe(false);
    expect(carrierText.length).toBeGreaterThan(0);

    const recoveredBytes = await llmTextToBytes(carrierText, config);
    expect(recoveredBytes).toEqual(originalBytes);
  });

  it("should perform full encryption and stego round-trip with encode and decode API", async () => {
    const mockPair = createMockLlmPair();
    const secretText = "Top secret ONNX payload";
    const password = "correct-horse-battery-staple";

    const stegoOptions = {
      encoding: {
        style: "llm" as const,
        llmCustomModel: mockPair.model,
        llmCustomTokenizer: mockPair.tokenizer,
        bitsPerToken: 4,
        llmPrompt: "word0 word1"
      }
    };

    const carrierText = await encode(secretText, password, stegoOptions);
    expect(typeof carrierText).toBe("string");
    expect(carrierText.length).toBeGreaterThan(0);

    const decrypted = await decode(carrierText, password, stegoOptions);
    expect(decrypted).toBe(secretText);
  });

  it("should apply temperature, top-K, and top-P sampling deterministically in getTopKReversibleTokenIds", () => {
    const mockPair = createMockLlmPair();
    const logits = new Float32Array(64);
    for (let i = 0; i < 64; i++) {
      logits[i] = (i % 10) * 2;
    }

    const resStandard = getTopKReversibleTokenIds(logits, 4, [0], mockPair.tokenizer, {
      temperature: 1.0,
      topK: 50,
      topP: 0.95
    });

    expect(resStandard.length).toBe(4);

    const resHighTemp = getTopKReversibleTokenIds(logits, 4, [0], mockPair.tokenizer, {
      temperature: 2.0,
      topK: 20,
      topP: 0.8
    });

    expect(resHighTemp.length).toBe(4);
  });

  it("should enforce StepVerify subword reversibility and reject non-reversible fusing token candidates", () => {
    // Custom tokenizer with subword fusion behavior:
    // Token 0: "un", Token 1: "able", Token 2: "unable"
    // Decoding [0, 1] yields "un able" -> tokenized as [0, 1]
    // Decoding [0, 2] yields "un unable" -> tokenized as [0, 2]
    // But if candidate is token 3 ("able" without space) such that [0, 3] yields "unable" -> re-encodes as single token [2] (length 1 != 2), failing reversibility!
    const specialIds = [99];
    const mockTokenizer = (text: string) => {
      const trimmed = text.trim();
      if (trimmed === "un able") return { input_ids: [0, 1] };
      if (trimmed === "unable") return { input_ids: [2] }; // Fused token!
      if (trimmed === "un safe") return { input_ids: [0, 4] };
      return { input_ids: [0] };
    };

    mockTokenizer.all_special_ids = specialIds;
    mockTokenizer.decode = (ids: number[]) => {
      const idList = Array.from(ids);
      if (idList.length === 2 && idList[0] === 0 && idList[1] === 3) return "unable"; // fuses!
      if (idList.length === 2 && idList[0] === 0 && idList[1] === 1) return "un able";
      if (idList.length === 2 && idList[0] === 0 && idList[1] === 4) return "un safe";
      return "un";
    };

    const logits = new Float32Array(100);
    // Token 99: special token (should be excluded)
    logits[99] = 1000;
    // Token 3: score 100 (fuses into single token [2] when following 0, so NOT reversible)
    logits[3] = 100;
    // Token 1: score 50 (reversible)
    logits[1] = 50;
    // Token 4: score 40 (reversible)
    logits[4] = 40;

    // Ask for 2 reversible tokens starting with token [0]
    const selected = getTopKReversibleTokenIds(logits, 2, [0], mockTokenizer);

    // Should NOT contain special token 99
    expect(selected).not.toContain(99);
    // Should NOT contain fusing token 3
    expect(selected).not.toContain(3);
    // Should contain reversible tokens 1 and 4 in score order
    expect(selected).toEqual([1, 4]);
  });

  it("should throw EncodingError when StepVerify cannot find enough reversible tokens", () => {
    const mockTokenizer = (text: string) => ({ input_ids: [0, 1] });
    mockTokenizer.all_special_ids = [];
    mockTokenizer.decode = (ids: number[]) => "fused"; // always fuses to length 1

    const logits = new Float32Array(10);

    expect(() => {
      getTopKReversibleTokenIds(logits, 4, [0], mockTokenizer);
    }).toThrowError(EncodingError);
  });

  it("should throw EncodingError for decoding failures in llmTextToBytes on prompt or token corruption", async () => {
    const mockPair = createMockLlmPair();
    const config = {
      style: "llm" as const,
      llmCustomModel: mockPair.model,
      llmCustomTokenizer: mockPair.tokenizer,
      bitsPerToken: 3,
      llmPrompt: "word0 word1"
    };

    // 1. Empty carrier text (no payload tokens)
    await expect(llmTextToBytes("", config)).rejects.toThrowError(EncodingError);

    // 2. Carrier text with only whitespace (no tokens after tokenization)
    await expect(llmTextToBytes("   ", config)).rejects.toThrowError(EncodingError);

    // 3. Truncated carrier text where tokens are cut short before reading the full payload
    const originalBytes = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]);
    const carrierText = await bytesToLlmText(originalBytes, config);
    const words = carrierText.split(" ");
    const truncatedCarrier = words.slice(0, words.length - 2).join(" ");

    await expect(llmTextToBytes(truncatedCarrier, config)).rejects.toThrowError(EncodingError);
  });

  it("should clear LLM model cache when clearLlmModelCache is called", async () => {
    const mockPair = createMockLlmPair();
    const config = {
      style: "llm" as const,
      llmCustomModel: mockPair.model,
      llmCustomTokenizer: mockPair.tokenizer,
    };

    const loaded1 = await loadLlmModel(config);
    expect(loaded1).toBeDefined();

    clearLlmModelCache();

    const loaded2 = await loadLlmModel(config);
    expect(loaded2).toBeDefined();
  });

  it("should round-trip steganography with custom temperature, topK, topP, and llmDevice settings", async () => {
    const mockPair = createMockLlmPair();
    const secretText = "Custom sampling settings stego roundtrip";
    const password = "secure-passphrase";

    const stegoOptions = {
      encoding: {
        style: "llm" as const,
        llmCustomModel: mockPair.model,
        llmCustomTokenizer: mockPair.tokenizer,
        bitsPerToken: 3,
        llmPrompt: "word0 word1",
        llmDevice: "cpu" as const,
        llmTemperature: 0.7,
        llmTopK: 32,
        llmTopP: 0.9,
      }
    };

    const carrierText = await encode(secretText, password, stegoOptions);
    // Prompt is excluded from carrier text output
    expect(carrierText.startsWith("word0 word1")).toBe(false);
    expect(carrierText.length).toBeGreaterThan(0);

    const decrypted = await decode(carrierText, password, stegoOptions);
    expect(decrypted).toBe(secretText);
  });
});
