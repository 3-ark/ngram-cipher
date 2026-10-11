/**
 * Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  TEMPLATES,
  POS_WORD_TO_INDEX,
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
 * Encodes a Uint8Array byte stream into natural English prose.
 */
export function bytesToEnglishText(
  bytes: Uint8Array,
  config: EncodingConfig = DEFAULT_CONFIG.encoding
): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }

  const reader = new BitStreamReader(bytes);
  const sentences: string[] = [];
  let sentenceIdx = 0;

  while (reader.hasBits) {
    const template = TEMPLATES[sentenceIdx % TEMPLATES.length];
    const words: string[] = [];

    for (const slot of template) {
      if (!reader.hasBits) {
        break;
      }

      const val = reader.readBits(8);
      const w = slot.list[val % slot.list.length];
      words.push(w);
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
 * Decodes English cipher prose back into the exact Uint8Array byte stream.
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

  const writer = new BitStreamWriter();

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const template = TEMPLATES[sentenceIdx % TEMPLATES.length];
    const { sentenceStr, endingStr } = rawSentences[sentenceIdx];

    const tokens = sentenceStr.split(/\s+/).filter(t => t.length > 0);
    let tokenIdx = 0;

    for (const slot of template) {
      if (tokenIdx >= tokens.length) break;

      const rawToken = tokens[tokenIdx];
      const cleanWord = rawToken.replace(/[.,!?;:]+$/g, "").replace(/[\u2013\u2014]/g, "").toLowerCase();

      const posMap = POS_WORD_TO_INDEX[slot.label];
      if (!posMap) {
        throw new EncodingError(`Unknown POS label "${slot.label}" in template.`);
      }

      const index = posMap.get(cleanWord);
      if (index === undefined) {
        throw new EncodingError(
          `Invalid or unrecognized token in cipher text: "${rawToken}" ` +
          `(expected POS: ${slot.label}, sentence ${sentenceIdx + 1})`
        );
      }

      writer.writeBits(index, 8);
      tokenIdx++;
    }

    if (config.sentenceEndingVariance && tokens.length === template.length) {
      const endingCode = ENDING_TO_CODE[endingStr] ?? 0;
      writer.writeBits(endingCode, 2);
    }
  }

  return writer.toBytes();
}
