/**
 * Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  CARRIER_WORDS,
  CARRIER_WORD_TO_INDEX,
  TEMPLATES,
  HAIKU_TEMPLATES,
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

  // Append payload length (16-bit uint16) to the END of fullPayload so bit 0 comes directly from bytes[0]!
  // This guarantees that bit 0 comes from whitened AES salt, making sentence 1 opening words 100% random and unique per run!
  const payloadLength = bytes.length;
  const lengthBytes = new Uint8Array(2);
  const view = new DataView(lengthBytes.buffer);
  view.setUint16(0, payloadLength, false);

  const fullPayload = new Uint8Array(bytes.length + 2);
  fullPayload.set(bytes, 0);
  fullPayload.set(lengthBytes, bytes.length);

  const reader = new BitStreamReader(fullPayload);
  const sentences: string[] = [];
  const templates = config.style === "haiku" ? HAIKU_TEMPLATES : TEMPLATES;
  let sentenceIdx = 0;

  while (reader.hasBits) {
    const templateIdx = reader.hasBits ? reader.readBits(3) : 0;
    const template = templates[templateIdx];

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

    for (let i = 0; i < words.length; i++) {
      const slotLabel = template[i]?.label;
      const w = words[i];
      if (i === 0 || slotLabel === "NP") {
        words[i] = capitalise(w);
      }
    }
    let ending = ".";
    if (config.sentenceEndingVariance) {
      const endingCode = reader.hasBits ? reader.readBits(2) : 0;
      ending = SENTENCE_ENDINGS[endingCode % SENTENCE_ENDINGS.length];
    }

    const sentence = words.join(" ") + ending;
    sentences.push(sentence);
    sentenceIdx++;
  }

  if (config.style === "haiku") {
    return sentences.map((sentence, index) => {
      const lineBreak = index === 0 ? "" : index % 3 === 0 ? "\n\n" : "\n";
      return `${lineBreak}${sentence}`;
    }).join("");
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
  const templates = config.style === "haiku" ? HAIKU_TEMPLATES : TEMPLATES;

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const { sentenceStr, endingStr } = rawSentences[sentenceIdx];
    const tokens = sentenceStr.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) continue;

    const templateIdx = matchTemplate(tokens, templates);
    rawWriter.writeBits(templateIdx, 3);
    const template = templates[templateIdx];

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

  const rawStream = rawWriter.toBytes();
  if (rawStream.length < 2) {
    return new Uint8Array(0);
  }

  let payloadLength = -1;
  // Scan rawStream backwards for payload length p where rawStream[p..p+1] === p
  for (let p = rawStream.length - 2; p >= 0; p--) {
    const len = (rawStream[p] << 8) | rawStream[p + 1];
    if (len === p) {
      payloadLength = len;
      break;
    }
  }

  if (payloadLength === -1) {
    return new Uint8Array(0);
  }

  return rawStream.subarray(0, payloadLength);
}
