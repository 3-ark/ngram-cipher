/**
 * Natural English N-Gram Cipher Engine
 * Encrypts data using AES-GCM and encodes ciphertext bits into natural English sentences.
 */

// Web Crypto helper for cross-platform support (Node / Browser)
const webCrypto = globalThis.crypto;

if (!webCrypto || !webCrypto.subtle) {
  throw new Error("Web Crypto API is required but unavailable in this environment.");
}

function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(arr.byteLength);
  new Uint8Array(buf).set(arr);
  return buf;
}

/**
 * Derives a 256-bit AES-GCM key from a password and salt using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await webCrypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return webCrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext bytes using AES-GCM (256-bit).
 * Output format: [16-byte Salt] [12-byte IV] [Ciphertext + AuthTag]
 */
export async function encryptBytes(data: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = webCrypto.getRandomValues(new Uint8Array(16));
  const iv = webCrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const ciphertextBuffer = await webCrypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(data)
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);
  const result = new Uint8Array(salt.length + iv.length + ciphertext.length);

  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(ciphertext, salt.length + iv.length);

  return result;
}

/**
 * Decrypts AES-GCM payload formatted as [16-byte Salt] [12-byte IV] [Ciphertext + AuthTag].
 */
export async function decryptBytes(payload: Uint8Array, password: string): Promise<Uint8Array> {
  if (payload.length < 28 + 16) {
    throw new Error("Invalid payload length: payload too short or corrupted.");
  }

  const salt = payload.subarray(0, 16);
  const iv = payload.subarray(16, 28);
  const ciphertext = payload.subarray(28);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await webCrypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext)
    );
    return new Uint8Array(decryptedBuffer);
  } catch {
    throw new Error("Decryption failed: Incorrect password or corrupted text.");
  }
}

/**
 * A compact, more natural English vocabulary tuned for readable output.
 * The list is generated from a curated set of meaningful roots so the output
 * feels calmer and more intentional while still remaining lossless.
 */
const CORE_WORDS = [
  "a", "act", "age", "air", "amber", "anchor", "angel", "any", "apex", "arch", "arm",
  "art", "ash", "ask", "at", "autumn", "back", "beacon", "beam", "bird", "blossom", "blue",
  "body", "book", "brave", "bright", "brook", "build", "calm", "care", "cast", "cause",
  "change", "charm", "city", "clear", "cloud", "coast", "code", "cold", "come", "compass",
  "corner", "country", "course", "craft", "crest", "dance", "dawn", "day", "deep", "dream",
  "drift", "earth", "echo", "ember", "end", "even", "ever", "face", "faith", "fall", "field",
  "fire", "first", "flame", "flow", "forest", "form", "frame", "friend", "garden", "gift",
  "glow", "gold", "good", "grain", "grass", "green", "ground", "guide", "hand", "harbor",
  "harmony", "heart", "help", "hill", "home", "hope", "hour", "house", "idea", "image",
  "island", "journey", "joy", "keep", "kind", "knight", "lake", "land", "learn", "light",
  "limit", "line", "listen", "live", "look", "love", "map", "meadow", "memory", "mind",
  "moment", "moon", "mountain", "music", "name", "nature", "need", "night", "north", "note",
  "ocean", "open", "orbit", "order", "origin", "paper", "path", "peace", "people", "petal",
  "phase", "picture", "place", "plan", "play", "point", "power", "quiet", "rain", "range",
  "reach", "record", "river", "road", "rock", "rose", "route", "rule", "safe", "sage",
  "science", "sea", "season", "shadow", "shore", "signal", "silence", "silver", "sky", "small",
  "soft", "song", "sound", "south", "space", "spark", "spring", "star", "state", "stone",
  "story", "storm", "street", "sun", "sway", "table", "take", "talk", "teach", "team", "temple",
  "thing", "thought", "time", "trail", "travel", "trust", "truth", "turn", "under", "unity",
  "value", "voice", "water", "wave", "way", "weather", "whisper", "white", "wind", "window",
  "winter", "wonder", "wood", "word", "world", "year", "young", "zen"
];

const VOCAB_SUFFIXES = ["", "s", "ed", "ing", "ly", "ful", "less", "er", "al", "ward"];

function createVocabulary(): string[] {
  const vocab = new Set<string>();

  for (const word of CORE_WORDS) {
    for (const suffix of VOCAB_SUFFIXES) {
      const candidate = `${word}${suffix}`.toLowerCase();
      if (!candidate) continue;
      if (candidate.length > 0 && candidate.length <= 12) {
        vocab.add(candidate);
      }
      if (vocab.size >= 256) {
        return Array.from(vocab).slice(0, 256);
      }
    }
  }

  const fallback = Array.from(vocab);
  if (fallback.length < 256) {
    throw new Error(`Vocabulary generation failed: expected 256 words, got ${fallback.length}`);
  }

  return fallback.slice(0, 256);
}

export const VOCABULARY = createVocabulary();
const WORD_TO_INDEX = new Map<string, number>();
VOCABULARY.forEach((word, index) => {
  WORD_TO_INDEX.set(word, index);
});

/**
 * Encodes a Uint8Array byte stream into natural English sentences.
 * Each byte (0-255) maps to a token in the 256-word vocabulary.
 */
export function bytesToEnglishText(bytes: Uint8Array): string {
  const words: string[] = [];
  let wordsInSentence = 0;
  let targetSentenceLength = 5;

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    let word = VOCABULARY[byte];

    if (wordsInSentence === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    wordsInSentence++;

    if (wordsInSentence >= targetSentenceLength || i === bytes.length - 1) {
      word += ".";
      wordsInSentence = 0;
      targetSentenceLength = 3 + (byte % 4); // Shorter, more readable prose (3-6 words)
    }

    words.push(word);
  }

  return words.join(" ");
}

/**
 * Decodes an English cipher text back into the exact Uint8Array byte stream.
 */
export function englishTextToBytes(text: string): Uint8Array {
  // Normalize text and extract individual word tokens
  const cleanText = text.replace(/[\r\n]+/g, " ").trim();
  const rawTokens = cleanText.split(/\s+/);
  const bytes: number[] = [];

  for (const rawToken of rawTokens) {
    if (!rawToken) continue;

    // Strip trailing punctuation and convert to lowercase
    const cleanWord = rawToken.replace(/[.,!?;:]+$/g, "").toLowerCase();

    const index = WORD_TO_INDEX.get(cleanWord);
    if (index === undefined) {
      throw new Error(`Invalid or unrecognized token in cipher text: "${rawToken}"`);
    }

    bytes.push(index);
  }

  return new Uint8Array(bytes);
}

/**
 * Main API: Encrypts plain text with a password and converts it into English n-gram cipher text.
 */
export async function encode(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(plaintext);
  const encrypted = await encryptBytes(rawBytes, password);
  return bytesToEnglishText(encrypted);
}

/**
 * Main API: Decodes English n-gram cipher text with a password back to original plain text.
 */
export async function decode(cipherText: string, password: string): Promise<string> {
  const encryptedBytes = englishTextToBytes(cipherText);
  const decryptedBytes = await decryptBytes(encryptedBytes, password);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(decryptedBytes);
}
