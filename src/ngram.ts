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
  const useCompression = compressedBytes.length < rawBytes.length;
  const dataToEncrypt = useCompression ? compressedBytes : rawBytes;
  const markedBytes = new Uint8Array(dataToEncrypt.length + 1);
  markedBytes[0] = useCompression ? 1 : 0;
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
  return bytesToEnglishText(whitenedFrame, config.encoding);
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
    whitenedBytes = englishTextToBytes(cipherText, config.encoding);
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
