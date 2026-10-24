/**
 * Natural English N-Gram Cipher
 *
 * Facade uniting Cryptography, Binary Framing, Reversible Encoding,
 * and Natural-Language Generation.
 */

import {
  CryptoError,
  mergeConfig,
  validatePassword,
  validatePlaintext,
  StegoOptions
} from "./config/index.js";
import { encryptBytes, decryptBytes, deriveKeystream, xorBytes } from "./crypto/index.js";
import { packFrame, unpackFrame } from "./framing/index.js";
import { bytesToEnglishText, englishTextToBytes } from "./encoding/index.js";
import { VOCABULARY, analyzeCarrierText, type CarrierAnalysis } from "./nlg/index.js";

export {
  encryptBytes,
  decryptBytes,
  bytesToEnglishText,
  englishTextToBytes,
  VOCABULARY,
  analyzeCarrierText
};

export type { CarrierAnalysis };

export * from "./config/index.js";
export * from "./crypto/index.js";
export * from "./framing/index.js";
export * from "./encoding/index.js";
export * from "./nlg/index.js";

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB limit to prevent zip bomb vulnerabilities
const WORD_PACKING_BLOCK_BYTES = 16;
const WORD_DICTIONARY = [
  "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with",
  "he","as","you","do","at","this","but","his","by","from","they","we","say","her","she",
  "or","an","will","my","one","all","would","there","their","what","so","up","out","if",
  "about","who","get","which","go","me","when","make","can","like","time","no","just","him",
  "know","take","people","into","year","your","good","some","could","them","see","other","than",
  "then","now","look","only","come","its","over","think","also","back","after","use","two",
  "how","our","work","first","well","way","even","new","want","because","any","these","give",
  "day","most","us","hello","world","secret","message","encoded","natural","english","text",
  "is","are","was","were","has","had","said","more","very","much","through","before","between",
  "under"
] as const;
const WORD_DICTIONARY_INDEX = new Map<string, number>(
  WORD_DICTIONARY.map((word, index) => [word, index])
);
const textEncoder = new TextEncoder();

function compressCommonWords(text: string, rawLength: number): Uint8Array | undefined {
  const output = new Uint8Array(rawLength);
  let outputLength = 0;
  const write = (value: Uint8Array): boolean => {
    if (outputLength + value.length >= rawLength) {
      return false;
    }
    output.set(value, outputLength);
    outputLength += value.length;
    return true;
  };

  let cursor = 0;
  const wordPattern = /[A-Za-z]+/g;
  for (const match of text.matchAll(wordPattern)) {
    const start = match.index;
    const word = match[0];
    if (!write(textEncoder.encode(text.slice(cursor, start)))) return undefined;

    const lowerWord = word.toLowerCase();
    const index = WORD_DICTIONARY_INDEX.get(lowerWord);
    const isLowerCase = word === lowerWord;
    const isTitleCase = word === lowerWord[0].toUpperCase() + lowerWord.slice(1);
    if (index !== undefined && (isLowerCase || isTitleCase)) {
      if (!write(Uint8Array.of(0xff, index | (isTitleCase ? 0x80 : 0)))) return undefined;
    } else {
      if (!write(textEncoder.encode(word))) return undefined;
    }
    cursor = start + word.length;
  }
  if (!write(textEncoder.encode(text.slice(cursor)))) return undefined;

  if (outputLength > 0xffff) return undefined;

  const packedLength = outputLength + 2;
  const paddedLength = Math.ceil(packedLength / WORD_PACKING_BLOCK_BYTES) * WORD_PACKING_BLOCK_BYTES;
  if (paddedLength >= rawLength) return undefined;

  const packed = new Uint8Array(paddedLength);
  new DataView(packed.buffer).setUint16(0, outputLength, false);
  packed.set(output.subarray(0, outputLength), 2);
  return packed;
}

function decompressCommonWords(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 2) {
    throw new CryptoError("Invalid dictionary-compressed payload.");
  }
  const dataLength = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(0, false);
  if (dataLength > bytes.length - 2 || dataLength > MAX_PAYLOAD_BYTES) {
    throw new CryptoError("Invalid dictionary-compressed payload.");
  }
  const packedData = bytes.subarray(2, 2 + dataLength);
  const output = new Uint8Array(MAX_PAYLOAD_BYTES);
  let outputLength = 0;
  const write = (value: Uint8Array): void => {
    if (outputLength + value.length > MAX_PAYLOAD_BYTES) {
      throw new CryptoError(`Decompression limit exceeded (maximum allowed output size is ${MAX_PAYLOAD_BYTES} bytes).`);
    }
    output.set(value, outputLength);
    outputLength += value.length;
  };

  for (let index = 0; index < packedData.length; index++) {
    if (packedData[index] !== 0xff) {
      const literalStart = index;
      while (index < packedData.length && packedData[index] !== 0xff) index++;
      write(packedData.subarray(literalStart, index));
      index--;
      continue;
    }

    if (index + 1 >= packedData.length) {
      throw new CryptoError("Invalid dictionary-compressed payload.");
    }
    const token = packedData[++index];
    const word = WORD_DICTIONARY[token & 0x7f];
    if (word === undefined) {
      throw new CryptoError("Invalid dictionary-compressed payload.");
    }
    const expandedWord = token & 0x80
      ? word[0].toUpperCase() + word.slice(1)
      : word;
    write(textEncoder.encode(expandedWord));
  }

  return output.slice(0, outputLength);
}

async function transformBytes(
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream
): Promise<Uint8Array> {
  const slice = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const stream = new Blob([slice]).stream().pipeThrough(transform);
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalLength += value.length;
      if (totalLength > MAX_PAYLOAD_BYTES) {
        reader.cancel();
        throw new CryptoError(`Decompression limit exceeded (maximum allowed output size is ${MAX_PAYLOAD_BYTES} bytes).`);
      }
      chunks.push(value);
    }
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Encrypts plain text with a password, packs into a framed binary packet,
 * and encodes it into English-like carrier text.
 */
export async function encode(
  plaintext: string,
  password: string,
  options?: StegoOptions
): Promise<string> {
  validatePassword(password);
  validatePlaintext(plaintext);

  const config = mergeConfig(options);
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(plaintext);
  if (rawBytes.length > MAX_PAYLOAD_BYTES) {
    throw new CryptoError(`Plaintext size exceeds maximum allowed limit of ${MAX_PAYLOAD_BYTES} bytes.`);
  }
  if (typeof CompressionStream === "undefined") {
    throw new CryptoError("Compression Streams API is required to encode messages.");
  }
  const compressedBytes = await transformBytes(rawBytes, new CompressionStream("gzip"));
  const dictionaryBytes = compressCommonWords(plaintext, rawBytes.length);
  let compressionType = 0;
  let dataToEncrypt: Uint8Array<ArrayBufferLike> = rawBytes;
  if (compressedBytes.length < dataToEncrypt.length) {
    compressionType = 1;
    dataToEncrypt = compressedBytes;
  }
  if (dictionaryBytes && dictionaryBytes.length < dataToEncrypt.length) {
    compressionType = 2;
    dataToEncrypt = dictionaryBytes;
  }
  const markedBytes = new Uint8Array(dataToEncrypt.length + 1);
  markedBytes[0] = compressionType;
  markedBytes.set(dataToEncrypt, 1);

  // 1. Compress when beneficial, then encrypt with AES-GCM.
  const encrypted = await encryptBytes(markedBytes, password, config.crypto);

  // 2. Pack encrypted ciphertext into binary frame envelope
  const framed = packFrame(encrypted, config.framing);

  // 3. Stego Whitening Layer:
  // Salt (16 B) is placed at offset 0 of framed envelope.
  // To whiten salt at offset 0..15: XOR with passwordKeystream = SHA256(password).
  // Since salt is pure random hardware entropy per message, (salt ^ SHA256(password)) is 100% random per run!
  // The remainder of the frame (offset 16..N) is whitened with keystream derived from (password + salt).
  const saltLength = config.crypto.saltByteLength;
  const salt = encrypted.subarray(0, saltLength);

  const passwordKeystream = await deriveKeystream(password, new Uint8Array(0), saltLength);
  const payloadKeystream = await deriveKeystream(password, salt, framed.length - saltLength);

  const whitenedFrame = new Uint8Array(framed.length);
  whitenedFrame.set(xorBytes(framed.subarray(0, saltLength), passwordKeystream), 0);
  whitenedFrame.set(xorBytes(framed.subarray(saltLength), payloadKeystream), saltLength);

  // 4. Encode whitened binary stream into English prose
  return await bytesToEnglishText(whitenedFrame, config.encoding);
}

/**
 * Decodes carrier text, verifies binary frame integrity,
 * and decrypts back to original plain text.
 */
export async function decode(
  cipherText: string,
  password: string,
  options?: StegoOptions
): Promise<string> {
  validatePassword(password);
  if (typeof cipherText !== "string" || cipherText.trim().length === 0) {
    throw new CryptoError("Carrier text must be a non-empty string.");
  }

  const config = mergeConfig(options);
  let whitenedBytes: Uint8Array;
  try {
    whitenedBytes = await englishTextToBytes(cipherText, config.encoding);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new CryptoError(`Invalid ciphertext: ${msg}`);
  }

  const saltLength = config.crypto.saltByteLength;
  if (whitenedBytes.length < saltLength) {
    throw new CryptoError("Invalid ciphertext: Payload too short.");
  }

  // Recover salt at offset 0 by un-whitening with passwordKeystream = SHA256(password)
  const passwordKeystream = await deriveKeystream(password, new Uint8Array(0), saltLength);
  const recoveredSalt = xorBytes(whitenedBytes.subarray(0, saltLength), passwordKeystream);

  // Un-whiten payload using keystream derived from (password + recoveredSalt)
  const payloadKeystream = await deriveKeystream(password, recoveredSalt, whitenedBytes.length - saltLength);
  const unwhitenedPayload = xorBytes(whitenedBytes.subarray(saltLength), payloadKeystream);

  const framedBytes = new Uint8Array(whitenedBytes.length);
  framedBytes.set(recoveredSalt, 0);
  framedBytes.set(unwhitenedPayload, saltLength);

  let payload: Uint8Array;
  try {
    const unpacked = unpackFrame(framedBytes, config.framing);
    payload = unpacked.payload;
  } catch {
    throw new CryptoError("Decryption failed: Incorrect password or corrupted text.");
  }

  // Decrypt payload
  const decryptedBytes = await decryptBytes(payload, password, config.crypto);
  if (decryptedBytes.length < 1 || decryptedBytes[0] > 2) {
    throw new CryptoError("Invalid decrypted payload format.");
  }

  let plaintextBytes: Uint8Array<ArrayBufferLike> = decryptedBytes.subarray(1);
  if (decryptedBytes[0] === 1) {
    if (typeof DecompressionStream === "undefined") {
      throw new CryptoError("Decompression Streams API is required to decode this message.");
    }
    plaintextBytes = await transformBytes(plaintextBytes, new DecompressionStream("gzip"));
  } else if (decryptedBytes[0] === 2) {
    plaintextBytes = decompressCommonWords(plaintextBytes);
  }
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(plaintextBytes);
}
