/**
 * Dynamic N-Gram Reversible Encoding and Decoding Engine
 * with Punctuation-Integrated Dynamic Candidates
 */

import { EncodingError } from "../config/index.js";
import { getCandidates } from "../nlg/ngram_model.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

export { BitStreamReader, BitStreamWriter };

const BITS_PER_TOKEN = 5;
const TOKEN_OPTIONS = 1 << BITS_PER_TOKEN; // 32
const TOKEN_REGEX = /[a-zA-Z0-9]+|[.,!?;:"]/g;
const LCM_BITS = 40; // LCM(5, 8) = 40 bits = 5 bytes = 8 tokens

function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * Encodes a Uint8Array byte stream into natural English prose using dynamic Google Books N-Grams and Punctuation Integration.
 */
export function bytesToEnglishText(
  bytes: Uint8Array
): string {
  if (!bytes || bytes.length === 0) {
    return "";
  }

  // Exact 40-bit (5-byte / 8-token) chunk alignment
  const minBitsNeeded = (bytes.length + 4) * 8;
  const totalBits = Math.ceil(minBitsNeeded / LCM_BITS) * LCM_BITS;
  const totalBytes = totalBits / 8;
  const tokenCount = totalBits / BITS_PER_TOKEN;

  const fullPayload = new Uint8Array(totalBytes);
  fullPayload.set(bytes, 0);
  new DataView(fullPayload.buffer).setUint32(totalBytes - 4, bytes.length, false);

  const reader = new BitStreamReader(fullPayload);
  const context: string[] = [];

  let formattedText = "";
  let isNewSentence = true;

  for (let i = 0; i < tokenCount; i++) {
    const candidates = getCandidates(context, TOKEN_OPTIONS);
    if (candidates.length !== TOKEN_OPTIONS) {
      throw new EncodingError("Google Books N-gram model produced too few candidate tokens.");
    }

    const rank = reader.readBits(BITS_PER_TOKEN);
    const token = candidates[rank];

    // Format token into natural English prose
    if (/^[.,!?;:"]$/.test(token)) {
      formattedText += token;
      if (token === "." || token === "?" || token === "!") {
        isNewSentence = true;
      }
    } else {
      const formattedWord = isNewSentence ? capitalise(token) : token;
      if (formattedText.length > 0 && !formattedText.endsWith(" ")) {
        formattedText += " " + formattedWord;
      } else {
        formattedText += formattedWord;
      }
      isNewSentence = false;
    }

    context.push(token.toLowerCase());
  }

  return formattedText;
}

/**
 * Decodes carrier text back into the original Uint8Array byte stream.
 */
export function englishTextToBytes(
  text: string
): Uint8Array {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Uint8Array(0);
  }

  const matches = text.match(TOKEN_REGEX);
  if (!matches || matches.length === 0) {
    return new Uint8Array(0);
  }

  const rawWriter = new BitStreamWriter();
  const context: string[] = [];

  for (const match of matches) {
    const normalizedToken = /^[a-zA-Z0-9]+$/.test(match) ? match.toLowerCase() : match;
    const candidates = getCandidates(context, TOKEN_OPTIONS);
    const rank = candidates.indexOf(normalizedToken);

    if (rank === -1) {
      throw new EncodingError(
        `Invalid or unrecognized token in cipher text: "${match}" ` +
        "(not found in dynamic N-gram vocabulary for current context)"
      );
    }

    rawWriter.writeBits(rank, BITS_PER_TOKEN);
    context.push(normalizedToken);
  }

  const payloadStream = rawWriter.toBytes();
  if (payloadStream.length < 4) {
    throw new EncodingError("Cipher text is too short to contain payload length header.");
  }

  const view = new DataView(payloadStream.buffer, payloadStream.byteOffset, payloadStream.byteLength);
  const payloadLength = view.getUint32(payloadStream.length - 4, false);

  if (payloadLength > payloadStream.length - 4) {
    throw new EncodingError("Cipher text contains an invalid payload length.");
  }

  return payloadStream.subarray(0, payloadLength);
}
