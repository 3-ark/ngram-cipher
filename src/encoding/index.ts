/**
 * Reversible Encoding and Decoding Engine
 */

import { EncodingError, EncodingConfig, DEFAULT_CONFIG } from "../config/index.js";
import {
  CARRIER_WORDS,
  DETERMINERS,
  TEMPLATES,
  POETRY_TEMPLATES,
  rankCandidates,
  valToRank,
  rankToVal,
  matchTemplate,
  type Slot,
} from "../nlg/index.js";
import { BitStreamReader, BitStreamWriter } from "./bitstream.js";

export { BitStreamReader, BitStreamWriter };

// 4 distinct 2-bit codes for lossless decoding without exclamation marks
const NEWS_ENDINGS = [".", ";", "...", "…"];
const NEWS_ENDING_TO_CODE: Record<string, number> = {
  ".": 0,
  ";": 1,
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

const TEMPLATE_CODES_BY_COUNT: Record<number, string[]> = {
  7: ["00", "01", "100", "101", "110", "1110", "1111"],
};
for (let count = 8; count <= TEMPLATES.length; count++) {
  TEMPLATE_CODES_BY_COUNT[count] = [
    "0",
    ...TEMPLATE_CODES_BY_COUNT[count - 1].map(code => `1${code}`),
  ];
}
const LESS_COMMON_TEMPLATE_INDEX = 3;

function estimateTemplateBitDensity(template: Slot[]): number {
  let bits = 0;
  for (let index = 0; index < template.length; index++) {
    const slot = template[index];
    if (slot.type !== "data") continue;
    if (index === 0) {
      bits += slot.label === "d" ? 2.5 : Math.log2(slot.list.length);
    } else if (slot.label === "d") {
      bits += slot.list.length < DETERMINERS.length
        ? Math.log2(slot.list.length)
        : 2.5;
    } else {
      bits += Math.log2(slot.list.length);
    }
  }
  return (bits + 4) / template.length;
}

function getTemplateCodes(
  templates: Slot[][],
  recentTemplateIndices: number[],
  enforceRepetitionRule = true
): Map<number, string> {
  const candidates = Array.from({ length: templates.length }, (_, index) => index);
  if (enforceRepetitionRule) {
    for (const recentIndex of recentTemplateIndices) {
      const candidateIndex = candidates.indexOf(recentIndex);
      if (candidateIndex !== -1) candidates.splice(candidateIndex, 1);
    }
  }
  const codes = new Map<number, string>();
  if (!enforceRepetitionRule) {
    candidates.forEach((index, rank) => codes.set(index, rank.toString(2).padStart(3, "0")));
    return codes;
  }
  const availableCodes = TEMPLATE_CODES_BY_COUNT[candidates.length];
  if (!availableCodes) {
    throw new EncodingError("Template count does not support the recent-template repetition rule.");
  }

  const codesByLength = [...availableCodes].sort((a, b) => a.length - b.length);
  const lessCommonCode = candidates.includes(LESS_COMMON_TEMPLATE_INDEX)
    ? codesByLength.pop()
    : undefined;
  const rankedCandidates = candidates
    .filter(index => index !== LESS_COMMON_TEMPLATE_INDEX || lessCommonCode === undefined)
    .sort((a, b) =>
      estimateTemplateBitDensity(templates[b]) - estimateTemplateBitDensity(templates[a]) || a - b
    );
  rankedCandidates.forEach((index, rank) => codes.set(index, codesByLength[rank]));
  if (lessCommonCode !== undefined) {
    codes.set(LESS_COMMON_TEMPLATE_INDEX, lessCommonCode);
  }
  return codes;
}

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

const POETRY_ENDINGS = [".", " —", "...", ","];
const POETRY_ENDING_TO_CODE: Record<string, number> = {
  ".": 0,
  " —": 1,
  "...": 2,
  ",": 3,
  "?": 0,
};

function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function startsWithVowelSound(word: string): boolean {
  const normalized = word.toLowerCase();
  if (/^(?:ewe|eul|euro|one|once|uni(?:corn|form|fy|on|t|vers|que)|use|usual|user|utility|utopia)/.test(normalized)) {
    return false;
  }
  if (/^(?:hour|honest|honor|heir)/.test(normalized)) {
    return true;
  }
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
  const recentTemplateIndices: number[] = [];
  let sentenceIdx = 0;

  while (reader.hasBits) {
    const templateCodes = getTemplateCodes(
      templates,
      recentTemplateIndices,
      !isPoetry
    );
    const codeToTemplate = new Map(
      Array.from(templateCodes, ([index, code]) => [code, index] as const)
    );
    let templateCode = "";
    let templateIdx: number | undefined;
    for (let bitIndex = 0; bitIndex < 16; bitIndex++) {
      templateCode += reader.readBits(1).toString();
      templateIdx = codeToTemplate.get(templateCode);
      if (templateIdx !== undefined) break;
    }
    if (templateIdx === undefined) {
      throw new EncodingError("Unable to decode sentence template.");
    }
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
      } else if (!isPoetry && slot.label === "d" && list.length < DETERMINERS.length) {
        const bitCount = Math.floor(Math.log2(list.length));
        const val = reader.hasBits ? reader.readBits(bitCount) : 0;
        const rank = valToRank(val, bitCount, list.length);
        chosenWord = ranked[rank % ranked.length];
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

    const sentenceWords = words.map((word, index) => {
      const pBefore = template[index].punctuationBefore ?? "";
      const pAfter = template[index].punctuationAfter ?? "";
      return `${pBefore}${word}${pAfter}`;
    });

    let sentence: string;
    const lastWord = sentenceWords[sentenceWords.length - 1];
    if (lastWord.endsWith('"')) {
      sentenceWords[sentenceWords.length - 1] = lastWord.slice(0, -1) + ending + '"';
      sentence = sentenceWords.join(" ");
    } else {
      sentence = sentenceWords.join(" ") + ending;
    }
    sentences.push(sentence);
    if (!isPoetry) {
      recentTemplateIndices.push(templateIdx);
      if (recentTemplateIndices.length > 2) recentTemplateIndices.shift();
    }
    if (!isPoetry) {
      const openingWord = words[0].toLowerCase();
      recentOpeners.push(openingWord === "an" ? "a" : openingWord);
      if (recentOpeners.length > 2) recentOpeners.shift();
    }
    sentenceIdx++;
  }

  if (isPoetry) {
    const seed = bytes[0] || 42;
    let stanzaSize = (seed % 2 === 0) ? 3 : 2;
    let linesInCurrentStanza = 0;
    const lines: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      let line = sentences[i];

      if (i === sentences.length - 1 && line.endsWith(",")) {
        line = line.slice(0, -1) + ".";
      }

      if (i > 0 && linesInCurrentStanza === 0) {
        lines.push("");
      }
      lines.push(line);
      linesInCurrentStanza++;

      if (linesInCurrentStanza >= stanzaSize) {
        linesInCurrentStanza = 0;
        const nextSeed = bytes[(i + 1) % bytes.length] || 1;
        stanzaSize = (nextSeed % 2 === 0) ? 3 : 2;
      }
    }
    return lines.join("\n");
  }

  // Format news prose into realistic paragraphs (2 sentences per paragraph)
  const paragraphs: string[] = [];
  const sentencesPerParagraph = 2;
  for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
    const chunk = sentences.slice(i, i + sentencesPerParagraph);
    paragraphs.push(chunk.join(" "));
  }
  return paragraphs.join("\n\n");
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
    const flatText = cleanText.replace(/\n+/g, " ");
    // Match sentences without splitting on decimal dots inside percentage numbers (e.g. 5.1% or 15.23%)
    const sentenceRegex = /.*?(?:\.\.\.|…|;(?![\w])|!(?![\w])|\?(?![\w])|\.(?!\d))["'”’]*/g;
    const matches = flatText.match(sentenceRegex) || [];

    for (const match of matches) {
      const trimmed = match.trim();
      if (!trimmed) continue;

      let endingStr = ".";
      let sentenceStr = trimmed;

      if (trimmed.endsWith('..."') || trimmed.endsWith("...")) {
        endingStr = "...";
        sentenceStr = trimmed.replace(/\.\.\.["'”’]*$/, "").trim();
      } else if (trimmed.endsWith('…"') || trimmed.endsWith("…")) {
        endingStr = "…";
        sentenceStr = trimmed.replace(/…["'”’]*$/, "").trim();
      } else if (/[.!;?]["'”’]*$/.test(trimmed)) {
        endingStr = trimmed.match(/[.!;?]/)?.[0] ?? ".";
        sentenceStr = trimmed.replace(/[.!;?]["'”’]*$/, "").trim();
      }

      if (sentenceStr.length > 0) {
        rawSentences.push({ sentenceStr, endingStr });
      }
    }
  }

  const rawWriter = new BitStreamWriter();
  const templates = isPoetry ? POETRY_TEMPLATES : TEMPLATES;
  const recentOpeners: string[] = [];
  const recentTemplateIndices: number[] = [];

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const { sentenceStr, endingStr } = rawSentences[sentenceIdx];
    const tokens = sentenceStr.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) continue;

    const templateIdx = matchTemplate(tokens, templates);
    const templateCode = getTemplateCodes(
      templates,
      recentTemplateIndices,
      !isPoetry
    ).get(templateIdx);
    if (!templateCode) {
      throw new EncodingError(
        `Sentence template repeats within the previous two sentences at sentence ${sentenceIdx + 1}.`
      );
    }
    for (const bit of templateCode) {
      rawWriter.writeBits(Number(bit), 1);
    }
    const template = templates[templateIdx];

    let tokenIdx = 0;
    const context: string[] = [];
    let sentenceOpener = "";

    for (const slot of template) {
      if (tokenIdx >= tokens.length) break;

      const rawToken = tokens[tokenIdx];
      let cleanWord = rawToken
        .replace(/^[ "'“‘]+/g, "")
        .replace(/[ "'”’.,!?;:]+$/g, "")
        .replace(/[\u2013\u2014]/g, "")
        .toLowerCase();

      if (slot.type === "data" && cleanWord === "an" && slot.label === "d") {
        cleanWord = "a";
      }

      const list = slot.list && slot.list.length > 0 ? slot.list : CARRIER_WORDS;
      const ranked = rankCandidates(list, context);
      const openingCodes = !isPoetry && tokenIdx === 0 && slot.type === "data"
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
        } else if (!isPoetry && slot.label === "d" && list.length < DETERMINERS.length) {
          const bitCount = Math.floor(Math.log2(list.length));
          const val = rankToVal(rank, bitCount, list.length);
          rawWriter.writeBits(val, bitCount);
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
    if (!isPoetry) {
      recentTemplateIndices.push(templateIdx);
      if (recentTemplateIndices.length > 2) recentTemplateIndices.shift();
    }
  }

  const rawStream = rawWriter.toBytes();
  if (rawStream.length < 2) {
    return new Uint8Array(0);
  }

  let payloadLength = -1;
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
