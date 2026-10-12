/**
 * Dynamic N-Gram Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import { getCandidates } from "../nlg/ngram_model.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

export { BitStreamReader, BitStreamWriter };

const SENTENCE_ENDINGS = [".", "!", "?", "..."];
const ENDING_TO_CODE: Record<string, number> = {
  ".": 0,
  "!": 1,
  "?": 2,
  "...": 3,
};

function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * Encodes a Uint8Array byte stream into English prose using dynamic Google Books N-Grams.
 */
export function bytesToEnglishText(
  bytes: Uint8Array,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }

  // Prepend payload length (32 bits uint32) to the bitstream
  const payloadLength = bytes.length;
  const lengthBytes = new Uint8Array(4);
  const view = new DataView(lengthBytes.buffer);
  view.setUint32(0, payloadLength, false);

  const fullPayload = new Uint8Array(4 + bytes.length);
  fullPayload.set(lengthBytes, 0);
  fullPayload.set(bytes, 4);

  const reader = new BitStreamReader(fullPayload);
  const sentences: string[] = [];
  const context: string[] = [];

  while (reader.hasBits) {
    // 3 bits for sentence word count (3 to 10 words)
    const lenCode = reader.hasBits ? reader.readBits(3) : 0;
    const wordCount = 3 + lenCode;

    // 2 bits for sentence ending punctuation
    let endingCode = 0;
    if (config.sentenceEndingVariance && reader.hasBits) {
      endingCode = reader.readBits(2);
    }
    const ending = SENTENCE_ENDINGS[endingCode % SENTENCE_ENDINGS.length];

    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      const candidates = getCandidates(context, 256);
      const val = reader.hasBits ? reader.readBits(8) : 0;
      const chosenWord = candidates[val % candidates.length];

      words.push(chosenWord);
      context.push(chosenWord.toLowerCase());
    }

    if (words.length === 0) break;

    words[0] = capitalise(words[0]);
    const sentence = words.join(" ") + ending;
    sentences.push(sentence);
  }

  return sentences.join(" ");
}

/**
 * Decodes carrier text back into the original encoded Uint8Array byte stream.
 */
export function englishTextToBytes(
  text: string,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): Uint8Array {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Uint8Array(0);
  }

  const cleanText = text.replace(/[\r\n]+/g, " ").trim();

  // Match sentences along with their punctuation endings
  const sentenceMatches = cleanText.match(/.*?(?:\.\.\.|[.!?]+|$)/g) || [];

  const rawSentences: { sentenceStr: string; endingStr: string }[] = [];

  for (const match of sentenceMatches) {
    const trimmed = match.trim();
    if (!trimmed) continue;

    let endingStr = ".";
    let sentenceStr = trimmed;

    if (trimmed.endsWith("...")) {
      endingStr = "...";
      sentenceStr = trimmed.slice(0, -3).trim();
    } else if (/[.!?]$/.test(trimmed)) {
      endingStr = trimmed.slice(-1);
      sentenceStr = trimmed.slice(0, -1).trim();
    }

    if (sentenceStr.length > 0) {
      rawSentences.push({ sentenceStr, endingStr });
    }
  }

  const rawWriter = new BitStreamWriter();
  const context: string[] = [];

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const { sentenceStr, endingStr } = rawSentences[sentenceIdx];
    const tokens = sentenceStr.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) continue;

    const wordCount = tokens.length;
    const lenCode = Math.min(7, Math.max(0, wordCount - 3));
    rawWriter.writeBits(lenCode, 3);

    if (config.sentenceEndingVariance) {
      const endingCode = ENDING_TO_CODE[endingStr] ?? 0;
      rawWriter.writeBits(endingCode, 2);
    }

    for (let tokenIdx = 0; tokenIdx < tokens.length; tokenIdx++) {
      const rawToken = tokens[tokenIdx];
      const cleanWord = rawToken.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

      const candidates = getCandidates(context, 256);
      const rank = candidates.indexOf(cleanWord);

      if (rank === -1) {
        throw new EncodingError(
          `Invalid or unrecognized token in cipher text: "${rawToken}" ` +
          `(not in dynamic N-gram vocabulary for sentence ${sentenceIdx + 1})`
        );
      }

      rawWriter.writeBits(rank, 8);
      context.push(cleanWord);
    }
  }

  const payloadStream = rawWriter.toBytes();
  if (payloadStream.length < 4) {
    return new Uint8Array(0);
  }

  const view = new DataView(payloadStream.buffer, payloadStream.byteOffset, payloadStream.byteLength);
  const payloadLength = view.getUint32(0, false);

  return payloadStream.subarray(4, 4 + payloadLength);
}
