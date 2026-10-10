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
 * Categorized 256 unique English dictionary words for 8-bit token encoding.
 * Each candidate list contains exactly 256 unique English words (2^8 = 256).
 */
const ENGLISH_256_WORDS = [
  "the", "a", "this", "that", "my", "your", "his", "her", "our", "their", "every", "some",
  "any", "no", "one", "each", "another", "such", "what", "which", "many", "few", "all", "both",
  "time", "person", "year", "way", "day", "thing", "man", "world", "life", "hand", "part", "child",
  "eye", "woman", "place", "work", "week", "case", "point", "government", "company", "number", "group", "problem",
  "idea", "water", "money", "story", "fact", "month", "lot", "right", "study", "book", "cloud",
  "job", "word", "business", "issue", "side", "kind", "head", "house", "service", "friend", "father", "power",
  "hour", "game", "line", "end", "member", "law", "car", "city", "community", "name", "president", "team",
  "minute", "kid", "body", "information", "back", "parent", "face", "others", "level", "office", "door",
  "health", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl",
  "guy", "moment", "air", "teacher", "force", "education", "foot", "boy", "age", "policy", "music", "market",
  "sense", "nation", "plan", "college", "interest", "death", "experience", "effect", "use", "class", "control", "care",
  "field", "development", "role", "effort", "rate", "heart", "drug", "show", "leader", "light", "voice", "wife",
  "whole", "police", "mind", "final", "report", "decision", "son", "view", "relationship", "town", "road", "arm",
  "difference", "thank", "value", "building", "action", "full", "model", "season", "society", "tax", "director", "position",
  "player", "record", "paper", "space", "ground", "form", "event", "official", "matter", "center", "couple", "site",
  "project", "activity", "star", "table", "need", "court", "american", "oil", "situation", "cost", "industry", "figure",
  "street", "image", "data", "phone", "cover", "source", "author", "picture", "trade", "term", "degree", "stage",
  "land", "type", "south", "north", "east", "west", "surface", "truth", "network", "range", "past", "future",
  "movement", "nature", "quality", "memory", "unit", "science", "sound", "peace", "river", "tree", "plant",
  "window", "winter", "summer", "spring", "autumn", "letter", "claim", "choice", "corner", "valley", "island",
  "stone", "shadow", "flight", "beauty", "sign", "signal", "garden", "forest", "harbor", "journey", "ocean",
  "bridge", "silence", "horizon", "breeze", "whisper", "stream", "mountain", "feather", "meadow", "blossom", "shelter",
  "harvest", "wonder", "compass", "passage", "echo", "flame", "silver", "golden", "crystal", "starlight", "sunshine",
  "miracle", "fountain", "twilight", "orchard", "beacon", "voyage", "solitude", "harmony", "symphony", "treasure", "tapestry",
  "rhythm", "serenity", "zenith", "velvet", "amber", "emerald", "sapphire", "autumnal", "celestial", "tranquil", "radiant",
  "vibrant", "endless", "graceful", "timeless", "precious", "splendid", "sublime", "peaceful", "infinite", "majestic", "glorious"
];

function createVocabulary(): string[] {
  const vocabSet = new Set<string>();
  for (const w of ENGLISH_256_WORDS) {
    vocabSet.add(w.toLowerCase());
  }
  const result = Array.from(vocabSet);
  if (result.length < 256) {
    throw new Error(`ENGLISH_256_WORDS needs 256 unique items, but has ${result.length}`);
  }
  return result.slice(0, 256);
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
  let targetSentenceLength = 8;

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    let word = VOCABULARY[byte];

    // Sentence structure formatting
    if (wordsInSentence === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    wordsInSentence++;

    if (wordsInSentence >= targetSentenceLength || i === bytes.length - 1) {
      word += ".";
      wordsInSentence = 0;
      targetSentenceLength = 6 + (byte % 5); // Vary sentence lengths naturally (6-10 words)
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
