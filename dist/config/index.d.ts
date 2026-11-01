/**
 * Central Configuration, Schema Validation, and Custom Error Classes
 */
export declare class StegoError extends Error {
    constructor(message: string);
}
export declare class CryptoError extends StegoError {
    constructor(message: string);
}
export declare class FramingError extends StegoError {
    constructor(message: string);
}
export declare class EncodingError extends StegoError {
    constructor(message: string);
}
export declare class ValidationError extends StegoError {
    constructor(message: string);
}
export interface CryptoConfig {
    pbkdf2Iterations: number;
    saltByteLength: number;
    ivByteLength: number;
}
export interface FramingConfig {
    magicHeader: Uint8Array;
    version: number;
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
    llmDevice?: "cpu" | "wasm" | "auto";
    llmTemperature?: number;
    llmTopK?: number;
    llmTopP?: number;
    llmLogitPrecision?: number;
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
export declare const DEFAULT_CONFIG: StegoConfig;
export declare function mergeConfig(options?: StegoOptions): StegoConfig;
export declare function validatePassword(password: string): void;
export declare function validatePlaintext(plaintext: string): void;
