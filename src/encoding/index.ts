/**
 * Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  CARRIER_WORDS,
  CARRIER_WORD_TO_INDEX,
  TEMPLATES,
  rankCandidates,
  valToRank,
  rankToVal,
  matchTemplate,
} from "../nlg/index.js";
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
 * Encodes a Uint8Array byte stream into English-like carrier text.
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
  let sentenceIdx = 0;

  while (reader.hasBits) {
    const templateIdx = reader.hasBits ? reader.readBits(3) : 0;
    const template = TEMPLATES[templateIdx];

    const words: string[] = [];
    const context: string[] = [];

    for (const slot of template) {
      const list = slot.list && slot.list.length > 0 ? slot.list : CARRIER_WORDS;
      const bitCount = Math.floor(Math.log2(list.length)) || 8;
      const ranked = rankCandidates(list, context);

      const val = reader.hasBits ? reader.readBits(bitCount) : 0;
      const rank = valToRank(val, bitCount, list.length);
      const chosenWord = ranked[rank % ranked.length];

      words.push(chosenWord);
      context.push(chosenWord.toLowerCase());
    }

    if (words.length === 0) break;

    words[0] = capitalise(words[0]);

    let ending = ".";
    if (config.sentenceEndingVariance) {
      const endingCode = reader.hasBits ? reader.readBits(2) : 0;
      ending = SENTENCE_ENDINGS[endingCode % SENTENCE_ENDINGS.length];
    }

    const sentence = words.join(" ") + ending;
    sentences.push(sentence);
    sentenceIdx++;
  }

  return sentences.join(" ");
}

/**
 * Decodes carrier text back into the encoded Uint8Array byte stream.
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

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const { sentenceStr, endingStr } = rawSentences[sentenceIdx];
    const tokens = sentenceStr.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) continue;

    const templateIdx = matchTemplate(tokens);
    rawWriter.writeBits(templateIdx, 3);
    const template = TEMPLATES[templateIdx];

    let tokenIdx = 0;
    const context: string[] = [];

    for (const slot of template) {
      if (tokenIdx >= tokens.length) break;

      const rawToken = tokens[tokenIdx];
      const cleanWord = rawToken.replace(/[.,!?;:]+$/g, "").replace(/[\u2013\u2014]/g, "").toLowerCase();

      const list = slot.list && slot.list.length > 0 ? slot.list : CARRIER_WORDS;
      const bitCount = Math.floor(Math.log2(list.length)) || 8;
      const ranked = rankCandidates(list, context);

      const rank = ranked.findIndex(w => w.toLowerCase() === cleanWord);

      if (rank === -1) {
        throw new EncodingError(
          `Invalid or unrecognized token in cipher text: "${rawToken}" ` +
          `(not in carrier vocabulary, sentence ${sentenceIdx + 1})`
        );
      }

      const val = rankToVal(rank, bitCount, list.length);
      rawWriter.writeBits(val, bitCount);
      context.push(cleanWord);
      tokenIdx++;
    }

    if (config.sentenceEndingVariance) {
      const endingCode = ENDING_TO_CODE[endingStr] ?? 0;
      rawWriter.writeBits(endingCode, 2);
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
