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
import { encryptBytes, decryptBytes } from "./crypto/index.js";
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

async function transformBytes(
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream
): Promise<Uint8Array> {
  const input = new ReadableStream<BufferSource>({
    start(controller) {
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      controller.enqueue(buffer);
      controller.close();
    }
  });
  const output = input.pipeThrough(transform);
  return new Uint8Array(await new Response(output).arrayBuffer());
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
  if (typeof CompressionStream === "undefined") {
    throw new CryptoError("Compression Streams API is required to encode messages.");
  }
  const compressedBytes = await transformBytes(rawBytes, new CompressionStream("gzip"));
  const useCompression = compressedBytes.length < rawBytes.length;
  const dataToEncrypt = useCompression ? compressedBytes : rawBytes;
  const markedBytes = new Uint8Array(dataToEncrypt.length + 1);
  markedBytes[0] = useCompression ? 1 : 0;
  markedBytes.set(dataToEncrypt, 1);

  // 1. Compress when beneficial, then encrypt with AES-GCM.
  const encrypted = await encryptBytes(markedBytes, password, config.crypto);

  // 2. Pack encrypted ciphertext into binary frame envelope
  const framed = packFrame(encrypted, config.framing);

  // 3. Encode binary frame into English prose
  return bytesToEnglishText(framed, config.encoding);
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

  const config = mergeConfig(options);
  const bytes = englishTextToBytes(cipherText, config.encoding);
  const { payload } = unpackFrame(bytes, config.framing);

  // Decrypt payload
  const decryptedBytes = await decryptBytes(payload, password, config.crypto);
  if (decryptedBytes.length < 1 || decryptedBytes[0] > 1) {
    throw new CryptoError("Invalid decrypted payload format.");
  }

  let plaintextBytes = decryptedBytes.subarray(1);
  if (decryptedBytes[0] === 1) {
    if (typeof DecompressionStream === "undefined") {
      throw new CryptoError("Decompression Streams API is required to decode this message.");
    }
    plaintextBytes = await transformBytes(plaintextBytes, new DecompressionStream("gzip"));
  }
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(plaintextBytes);
}
