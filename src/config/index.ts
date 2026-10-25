/**
 * Central Configuration, Schema Validation, and Custom Error Classes
 */

export class StegoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StegoError";
  }
}

export class CryptoError extends StegoError {
  constructor(message: string) {
    super(message);
    this.name = "CryptoError";
  }
}

export class FramingError extends StegoError {
  constructor(message: string) {
    super(message);
    this.name = "FramingError";
  }
}

export class EncodingError extends StegoError {
  constructor(message: string) {
    super(message);
    this.name = "EncodingError";
  }
}

export class ValidationError extends StegoError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export interface CryptoConfig {
  pbkdf2Iterations: number;
  saltByteLength: number;
  ivByteLength: number;
}

export interface FramingConfig {
  magicHeader: Uint8Array; // 2 bytes e.g. 'NG'
  version: number;         // e.g. 1
  enableChecksum: boolean;
}

export interface EncodingConfig {
  sentenceEndingVariance: boolean;
  style?: "news" | "poetry" | "llm";
  llmModel?: string;
  llmPrompt?: string;
  bitsPerToken?: number;
  llmCustomModel?: any;
  llmCustomTokenizer?: any;
  llmQuantized?: boolean;
  llmCacheDir?: string;
}

export interface StegoConfig {
  crypto: CryptoConfig;
  framing: FramingConfig;
  encoding: EncodingConfig;
}

export interface StegoOptions {
  crypto?: Partial<CryptoConfig>;
  framing?: Partial<FramingConfig>;
  encoding?: Partial<EncodingConfig>;
}

export const DEFAULT_CONFIG: StegoConfig = {
  crypto: {
    pbkdf2Iterations: 100000,
    saltByteLength: 16,
    ivByteLength: 12,
  },
  framing: {
    magicHeader: new Uint8Array([0x4e, 0x47]), // ASCII "NG"
    version: 1,
    enableChecksum: true,
  },
  encoding: {
    sentenceEndingVariance: true,
    style: "news",
    llmModel: "Xenova/gpt2",
    llmPrompt: "In recent news,",
    bitsPerToken: 4,
    llmQuantized: true,
  },
};

export function mergeConfig(options?: StegoOptions): StegoConfig {
  return {
    crypto: { ...DEFAULT_CONFIG.crypto, ...options?.crypto },
    framing: { ...DEFAULT_CONFIG.framing, ...options?.framing },
    encoding: { ...DEFAULT_CONFIG.encoding, ...options?.encoding },
  };
}

export function validatePassword(password: string): void {
  if (!password || typeof password !== "string" || password.trim().length === 0) {
    throw new ValidationError("Password must be a non-empty string.");
  }
}

export function validatePlaintext(plaintext: string): void {
  if (typeof plaintext !== "string") {
    throw new ValidationError("Plaintext must be a string.");
  }
}
