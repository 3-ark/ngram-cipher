import { describe, it, expect, beforeEach } from "vitest";
import { encode, decode } from "./ngram.js";
import {
  bytesToLlmText,
  llmTextToBytes,
  loadLlmModel,
  clearLlmModelCache,
  parseHfUrl,
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

  it("should parse direct Hugging Face ONNX file URLs correctly", () => {
    const url1 = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/resolve/main/onnx/model_fp16.onnx?download=true";
    const parsed1 = parseHfUrl(url1);
    expect(parsed1).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
      subfolder: "onnx",
      model_file_name: "model_fp16",
      quantized: false,
    });

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

    const repoOnly = "Xenova/gpt2";
    const parsedRepo = parseHfUrl(repoOnly);
    expect(parsedRepo).toEqual({
      modelId: "Xenova/gpt2",
      quantized: true,
    });

    const repoWithTree = "https://huggingface.co/onnx-community/Supra-Mini-v2-0.1M-ONNX/tree/main";
    const parsedTree = parseHfUrl(repoWithTree);
    expect(parsedTree).toEqual({
      modelId: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
      revision: "main",
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
    expect(carrierText.startsWith("word0 word1")).toBe(true);

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
});
