/**
 * Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  TEMPLATES,
  POS_WORD_TO_INDEX,
  Slot
} from "../nlg/index.js";

const SENTENCE_ENDINGS = [".", "!", "?", "..."];

function pickFiller(list: string[], sentenceIdx: number, slotIdx: number): string {
  return list[(sentenceIdx * 7 + slotIdx * 3) % list.length];
}

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
  const sentences: string[] = [];
  let byteIdx = 0;
  let sentenceIdx = 0;

  while (byteIdx < bytes.length) {
    const template = TEMPLATES[sentenceIdx % TEMPLATES.length];
    const words: string[] = [];
    let slotIdx = 0;

    for (const slot of template) {
      if (byteIdx >= bytes.length && slot.type === "data") {
        break;
      }

      if (slot.type === "filler") {
        const w = pickFiller(slot.list, sentenceIdx, slotIdx);
        words.push(w);
      } else {
        const byteVal = bytes[byteIdx];
        const w = slot.list[byteVal % slot.list.length];
        words.push(w);
        byteIdx++;
      }
      slotIdx++;
    }

    if (words.length === 0) break;

    words[0] = capitalise(words[0]);
    const ending = config.sentenceEndingVariance
      ? SENTENCE_ENDINGS[sentenceIdx % SENTENCE_ENDINGS.length]
      : ".";
    const sentence = words.join(" ") + ending;
    sentences.push(sentence);
    sentenceIdx++;
  }

  return sentences.join(" ");
}

/**
 * Decodes English cipher prose back into the exact Uint8Array byte stream.
 */
export function englishTextToBytes(text: string): Uint8Array {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Uint8Array(0);
  }

  const cleanText = text.replace(/[\r\n]+/g, " ").trim();

  const rawSentences = (cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.replace(/[.!?]+$/g, ""));

  const bytes: number[] = [];

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const template = TEMPLATES[sentenceIdx % TEMPLATES.length];
    const tokens = rawSentences[sentenceIdx].split(/\s+/).filter(t => t.length > 0);

    let tokenIdx = 0;

    for (const slot of template) {
      if (tokenIdx >= tokens.length) break;

      const rawToken = tokens[tokenIdx];
      const cleanWord = rawToken.replace(/[.,!?;:]+$/g, "").replace(/[\u2013\u2014]/g, "").toLowerCase();

      if (slot.type === "filler") {
        tokenIdx++;
        continue;
      }

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

      bytes.push(index);
      tokenIdx++;
    }
  }

  return new Uint8Array(bytes);
}
