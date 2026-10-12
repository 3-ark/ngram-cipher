/**
 * Dynamic N-Gram Reversible Encoding and Decoding Engine
 */

import { EncodingError } from "../config/index.js";
import { getCandidates } from "../nlg/ngram_model.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

export { BitStreamReader, BitStreamWriter };

const BITS_PER_WORD = 8;
const WORD_OPTIONS = 1 << BITS_PER_WORD;
const WORDS_PER_SENTENCE = 12;

function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * Encodes a Uint8Array byte stream into English prose using dynamic Google Books N-Grams.
 */
export function bytesToEnglishText(
  bytes: Uint8Array
): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }

  const fullPayloadLength = Math.ceil((bytes.length + 4) / 3) * 3;
  const fullPayload = new Uint8Array(fullPayloadLength);
  fullPayload.set(bytes);
  new DataView(fullPayload.buffer).setUint32(fullPayloadLength - 4, bytes.length, false);

  const reader = new BitStreamReader(fullPayload);
  const words: string[] = [];
  const context: string[] = [];

  while (reader.hasBits) {
    const candidates = getCandidates(context, WORD_OPTIONS);
    if (candidates.length !== WORD_OPTIONS) {
      throw new EncodingError("Google Books N-gram model has too few word candidates.");
    }
    const chosenWord = candidates[reader.readBits(BITS_PER_WORD)];
    words.push(chosenWord);
    context.push(chosenWord);
  }

  const sentences: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_SENTENCE) {
    const sentenceWords = words.slice(i, i + WORDS_PER_SENTENCE);
    sentenceWords[0] = capitalise(sentenceWords[0]);
    sentences.push(`${sentenceWords.join(" ")}.`);
  }
  return sentences.join(" ");
}

/**
 * Decodes carrier text back into the original encoded Uint8Array byte stream.
 */
export function englishTextToBytes(
  text: string
): Uint8Array {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Uint8Array(0);
  }

  const cleanText = text.replace(/[\r\n]+/g, " ").trim();

  const tokens = cleanText.split(/\s+/).filter(token => token.length > 0);
  const rawWriter = new BitStreamWriter();
  const context: string[] = [];

  for (const rawToken of tokens) {
    const cleanWord = rawToken.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const candidates = getCandidates(context, WORD_OPTIONS);
    const rank = candidates.indexOf(cleanWord);

    if (rank === -1) {
      throw new EncodingError(
        `Invalid or unrecognized token in cipher text: "${rawToken}" ` +
        "(not in dynamic N-gram vocabulary)"
      );
    }

    rawWriter.writeBits(rank, BITS_PER_WORD);
    context.push(cleanWord);
  }

  const payloadStream = rawWriter.toBytes();
  if (payloadStream.length < 4) {
    throw new EncodingError("Cipher text is too short to contain a payload length.");
  }

  const view = new DataView(payloadStream.buffer, payloadStream.byteOffset, payloadStream.byteLength);
  const payloadLength = view.getUint32(payloadStream.length - 4, false);
  if (payloadLength > payloadStream.length - 4) {
    throw new EncodingError("Cipher text contains an invalid payload length.");
  }

  return payloadStream.subarray(0, payloadLength);
}
