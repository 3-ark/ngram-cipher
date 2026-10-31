/**
 * Cryptographic Operations and Key Derivation
 */
import { CryptoConfig } from "../config/index.js";
/**
 * Derives a 256-bit AES-GCM CryptoKey using PBKDF2 with SHA-256.
 */
export declare function deriveKey(password: string, salt: Uint8Array, config?: CryptoConfig): Promise<CryptoKey>;
/**
 * Encrypts raw plaintext bytes using AES-256-GCM.
 * Output layout: [Salt (saltByteLength)][IV (ivByteLength)][Ciphertext + AuthTag]
 */
export declare function encryptBytes(data: Uint8Array, password: string, config?: CryptoConfig): Promise<Uint8Array>;
/**
 * Decrypts AES-GCM payload formatted as [Salt (saltByteLength)][IV (ivByteLength)][Ciphertext + AuthTag].
 */
/**
 * XORs a data buffer with a keystream buffer in-place or returning a new buffer.
 */
/**
 * Compares two Uint8Arrays in constant time to prevent timing attacks.
 */
export declare function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean;
export declare function xorBytes(data: Uint8Array, keystream: Uint8Array): Uint8Array;
/**
 * Derives a keystream of specified length from a password and salt using Web Crypto SHA-256.
 */
export declare function deriveKeystream(password: string, salt: Uint8Array, length: number): Promise<Uint8Array>;
export declare function decryptBytes(payload: Uint8Array, password: string, config?: CryptoConfig): Promise<Uint8Array>;
