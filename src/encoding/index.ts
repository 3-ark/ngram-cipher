/**
 * Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  CARRIER_WORDS,
  TEMPLATES,
  POETRY_TEMPLATES,
  rankCandidates,
  valToRank,
  rankToVal,
  matchTemplate,
} from "../nlg/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

export { BitStreamReader, BitStreamWriter };

// Keep all four 2-bit codes distinct for lossless decoding, but avoid question marks.
const NEWS_ENDINGS = [".", "!", "...", "…"];
const NEWS_ENDING_TO_CODE: Record<string, number> = {
  ".": 0,
  "!": 1,
  "...": 2,
  "…": 3,
};

const DETERMINER_CODES: Record<string, string> = {
  the: "0",
  some: "100",
  its: "101",
  no: "110",
  any: "1110",
  a: "11110",
  this: "111110",
  one: "111111",
};
const DETERMINER_CODE_TO_WORD: Record<string, string> = {
  "0": "the",
  "100": "some",
  "101": "its",
  "110": "no",
  "1110": "any",
  "11110": "a",
  "111110": "this",
  "111111": "one",
};

interface PrefixCodeNode {
  word?: string;
  weight: number;
  order: number;
  left?: PrefixCodeNode;
  right?: PrefixCodeNode;
}

function buildOpeningCodes(candidates: string[], recentOpeners: string[]): Map<string, string> {
  const excludedWord = recentOpeners.length === 2 &&
    recentOpeners[0] === recentOpeners[1]
    ? recentOpeners[0]
    : undefined;
  const eligible = candidates.filter(word => word.toLowerCase() !== excludedWord);
  const nodes = eligible.map((word, order) => ({
    word,
    weight: word.toLowerCase() === "the" ? 8 : 1,
    order,
  }));
  const queue: PrefixCodeNode[] = nodes;

  while (queue.length > 1) {
    queue.sort((a, b) => a.weight - b.weight || a.order - b.order);
    const left = queue.shift()!;
    const right = queue.shift()!;
    queue.push({
      weight: left.weight + right.weight,
      order: Math.min(left.order, right.order),
      left,
      right,
    });
  }

  const codes = new Map<string, string>();
  const visit = (node: PrefixCodeNode, prefix: string): void => {
    if (node.word !== undefined) {
      codes.set(node.word, prefix || "0");
      return;
    }
    if (node.left) visit(node.left, `${prefix}0`);
    if (node.right) visit(node.right, `${prefix}1`);
  };
  visit(queue[0], "");
  return codes;
}

// Poetic endings palette (4 distinct endings = 2 bits for lossless bijection):
// 0: "."  (full stop, closure)
// 1: " —" (em-dash pause)
// 2: "..." (fading silence)
// 3: ","  (soft caesura)
//
// In addition, "?" is accepted in decoding as an expressive poetic alternative for full stop.
const POETRY_ENDINGS = [".", " —", "...", ","];
const POETRY_ENDING_TO_CODE: Record<string, number> = {
  ".": 0,
  " —": 1,
  "...": 2,
  ",": 3,
  "?": 0, // Inquisitive variant maps to full stop
};

function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function startsWithVowelSound(word: string): boolean {
  return /^[aeiou]/i.test(word);
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

  const isPoetry = config.style === "poetry";

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
  const templates = isPoetry ? POETRY_TEMPLATES : TEMPLATES;
  const recentOpeners: string[] = [];
  let sentenceIdx = 0;

  const templateBits = Math.round(Math.log2(templates.length));

  while (reader.hasBits) {
    const templateIdx = reader.hasBits ? reader.readBits(templateBits) : 0;
    const template = templates[templateIdx];

    const words: string[] = [];
    const context: string[] = [];

    for (const slot of template) {
      const list = slot.list && slot.list.length > 0 ? slot.list : CARRIER_WORDS;
      const ranked = rankCandidates(list, context);

      if (slot.type === "filler") {
        const chosenWord = ranked[0];
        words.push(chosenWord);
        context.push(chosenWord.toLowerCase());
        continue;
      }

      let chosenWord: string;
      if (!isPoetry && words.length === 0) {
        const openingCodes = buildOpeningCodes(ranked, recentOpeners);
        const codeToWord = new Map(
          Array.from(openingCodes, ([word, code]) => [code, word] as const)
        );
        let code = "";
        let decodedWord: string | undefined;
        for (let i = 0; i < 16; i++) {
          code += reader.readBits(1).toString();
          decodedWord = codeToWord.get(code);
          if (decodedWord) break;
        }
        if (!decodedWord) {
          throw new EncodingError("Unable to decode sentence opening word.");
        }
        chosenWord = decodedWord;
      } else if (!isPoetry && slot.label === "d") {
        let code = "";
        let decodedWord: string | undefined;
        for (let i = 0; i < 6; i++) {
          code += reader.readBits(1).toString();
          decodedWord = DETERMINER_CODE_TO_WORD[code];
          if (decodedWord) {
            break;
          }
        }
        if (!decodedWord) {
          throw new EncodingError("Unable to decode determiner prefix code.");
        }
        chosenWord = decodedWord;
      } else {
        const bitCount = Math.floor(Math.log2(list.length)) || 8;
        const val = reader.hasBits ? reader.readBits(bitCount) : 0;
        const rank = valToRank(val, bitCount, list.length);
        chosenWord = ranked[rank % ranked.length];
      }

      words.push(chosenWord);
      context.push(chosenWord.toLowerCase());
    }

    if (words.length === 0) break;

    // Apply "a" -> "an" grammatical agreement before vowel sounds
    for (let i = 0; i < words.length; i++) {
      if (words[i].toLowerCase() === "a" && i + 1 < words.length && startsWithVowelSound(words[i + 1])) {
        words[i] = words[i] === "A" ? "An" : "an";
      }
    }

    for (let i = 0; i < words.length; i++) {
      const slotLabel = template[i]?.label;
      const w = words[i];
      if (i === 0 || slotLabel === "NP") {
        words[i] = capitalise(w);
      }
    }

    let ending = ".";
    if (config.sentenceEndingVariance) {
      if (isPoetry) {
        const endingCode = reader.hasBits ? reader.readBits(2) : 0;
        ending = POETRY_ENDINGS[endingCode % POETRY_ENDINGS.length];
      } else {
        const endingCode = reader.hasBits ? reader.readBits(2) : 0;
        ending = NEWS_ENDINGS[endingCode % NEWS_ENDINGS.length];
      }
    }

    const sentence = words.join(" ") + ending;
    sentences.push(sentence);
    if (!isPoetry) {
      const openingWord = words[0].toLowerCase();
      recentOpeners.push(openingWord === "an" ? "a" : openingWord);
      if (recentOpeners.length > 2) recentOpeners.shift();
    }
    sentenceIdx++;
  }

  if (isPoetry) {
    // Generate organic stanzas (alternating between 2-line couplets and 3-line tercets based on payload entropy)
    // Seeded deterministically by the first byte of payload
    const seed = bytes[0] || 42;
    let stanzaSize = (seed % 2 === 0) ? 3 : 2;
    let linesInCurrentStanza = 0;
    const lines: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      let line = sentences[i];

      // A poem should never terminate with a dangling comma on its final line
      if (i === sentences.length - 1 && line.endsWith(",")) {
        line = line.slice(0, -1) + ".";
      }

      if (i > 0 && linesInCurrentStanza === 0) {
        lines.push(""); // empty line between stanzas
      }
      lines.push(line);
      linesInCurrentStanza++;

      if (linesInCurrentStanza >= stanzaSize) {
        linesInCurrentStanza = 0;
        // Deterministically cycle stanza length (2 or 3 lines) using subsequent payload bytes
        const nextSeed = bytes[(i + 1) % bytes.length] || 1;
        stanzaSize = (nextSeed % 2 === 0) ? 3 : 2;
      }
    }
    return lines.join("\n");
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

  const isPoetry = config.style === "poetry";

  // Clean and split lines/sentences
  // Handle poetry punctuation: commas, em-dashes, ellipses, periods, question marks, exclamation marks
  const cleanText = text.replace(/[\r\n]+/g, "\n").trim();
  const rawSentences: { sentenceStr: string; endingStr: string }[] = [];

  if (isPoetry) {
    const lines = cleanText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    for (const line of lines) {
      let sentenceStr = line;
      let endingStr = ".";

      if (line.endsWith("...")) {
        endingStr = "...";
        sentenceStr = line.slice(0, -3).trim();
      } else if (line.endsWith(" —")) {
        endingStr = " —";
        sentenceStr = line.slice(0, -2).trim();
      } else if (line.endsWith("—")) {
        endingStr = " —";
        sentenceStr = line.slice(0, -1).trim();
      } else if (/[,.!?]$/.test(line)) {
        endingStr = line.slice(-1);
        sentenceStr = line.slice(0, -1).trim();
      }

      if (sentenceStr.length > 0) {
        rawSentences.push({ sentenceStr, endingStr });
      }
    }
  } else {
    const sentenceMatches = cleanText.replace(/\n+/g, " ").match(/.*?(?:\.\.\.|…|[.!?]+|$)/g) || [];
    for (const match of sentenceMatches) {
      const trimmed = match.trim();
      if (!trimmed) continue;

      let endingStr = ".";
      let sentenceStr = trimmed;

      if (trimmed.endsWith("...")) {
        endingStr = "...";
        sentenceStr = trimmed.slice(0, -3).trim();
      } else if (trimmed.endsWith("…")) {
        endingStr = "…";
        sentenceStr = trimmed.slice(0, -1).trim();
      } else if (/[.!?]$/.test(trimmed)) {
        endingStr = trimmed.slice(-1);
        sentenceStr = trimmed.slice(0, -1).trim();
      }

      if (sentenceStr.length > 0) {
        rawSentences.push({ sentenceStr, endingStr });
      }
    }
  }

  const rawWriter = new BitStreamWriter();
  const templates = isPoetry ? POETRY_TEMPLATES : TEMPLATES;
  const recentOpeners: string[] = [];

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const { sentenceStr, endingStr } = rawSentences[sentenceIdx];
    const tokens = sentenceStr.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) continue;

    const templateBits = Math.round(Math.log2(templates.length));
    const templateIdx = matchTemplate(tokens, templates);
    rawWriter.writeBits(templateIdx, templateBits);
    const template = templates[templateIdx];

    let tokenIdx = 0;
    const context: string[] = [];
    let sentenceOpener = "";

    for (const slot of template) {
      if (tokenIdx >= tokens.length) break;

      const rawToken = tokens[tokenIdx];
      let cleanWord = rawToken.replace(/[.,!?;:]+$/g, "").replace(/[\u2013\u2014]/g, "").toLowerCase();

      // Normalize grammatical "an" back to "a" for determiners
      if (cleanWord === "an" && slot.label === "d") {
        cleanWord = "a";
      }

      const list = slot.list && slot.list.length > 0 ? slot.list : CARRIER_WORDS;
      const ranked = rankCandidates(list, context);
      const openingCodes = !isPoetry && tokenIdx === 0
        ? buildOpeningCodes(ranked, recentOpeners)
        : undefined;

      const rank = ranked.findIndex(w => w.toLowerCase() === cleanWord);

      if (rank === -1) {
        throw new EncodingError(
          `Invalid or unrecognized token in cipher text: "${rawToken}" ` +
          `(not in carrier vocabulary, sentence ${sentenceIdx + 1})`
        );
      }

      if (slot.type === "data") {
        if (openingCodes) {
          const code = openingCodes.get(cleanWord);
          if (!code) {
            throw new EncodingError(
              `Invalid repeated sentence opening word: "${rawToken}" ` +
              `(sentence ${sentenceIdx + 1}, previous openers: ${recentOpeners.join(", ")})`
            );
          }
          for (const bit of code) {
            rawWriter.writeBits(Number(bit), 1);
          }
        } else if (!isPoetry && slot.label === "d") {
          const code = DETERMINER_CODES[cleanWord];
          if (!code) {
            throw new EncodingError(`No determiner code is defined for "${cleanWord}".`);
          }
          for (const bit of code) {
            rawWriter.writeBits(Number(bit), 1);
          }
        } else {
          const bitCount = Math.floor(Math.log2(list.length)) || 8;
          const val = rankToVal(rank, bitCount, list.length);
          rawWriter.writeBits(val, bitCount);
        }
      }
      if (tokenIdx === 0) sentenceOpener = cleanWord;
      context.push(cleanWord);
      tokenIdx++;
    }

    if (config.sentenceEndingVariance) {
      if (isPoetry) {
        const endingCode = POETRY_ENDING_TO_CODE[endingStr] ?? 0;
        rawWriter.writeBits(endingCode, 2);
      } else {
        const endingCode = NEWS_ENDING_TO_CODE[endingStr] ?? 0;
        rawWriter.writeBits(endingCode, 2);
      }
    }
    if (!isPoetry && sentenceOpener) {
      recentOpeners.push(sentenceOpener);
      if (recentOpeners.length > 2) recentOpeners.shift();
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
