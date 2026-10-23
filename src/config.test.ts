import { describe, it, expect } from "vitest";
import {
  StegoError,
  CryptoError,
  FramingError,
  EncodingError,
  ValidationError,
  DEFAULT_CONFIG,
  mergeConfig,
  validatePassword,
  validatePlaintext
} from "./config/index.js";

describe("Configuration and Validation Module", () => {
  it("should maintain proper inheritance in custom error hierarchy", () => {
    const cryptoErr = new CryptoError("crypto failure");
    const framingErr = new FramingError("framing failure");
    const encodingErr = new EncodingError("encoding failure");
    const validationErr = new ValidationError("validation failure");

    expect(cryptoErr).toBeInstanceOf(StegoError);
    expect(framingErr).toBeInstanceOf(StegoError);
    expect(encodingErr).toBeInstanceOf(StegoError);
    expect(validationErr).toBeInstanceOf(StegoError);

    expect(cryptoErr.name).toBe("CryptoError");
    expect(framingErr.name).toBe("FramingError");
    expect(encodingErr.name).toBe("EncodingError");
    expect(validationErr.name).toBe("ValidationError");
  });

  it("should merge custom options with default configuration", () => {
    const merged = mergeConfig({
      crypto: { pbkdf2Iterations: 50000 },
      framing: { enableChecksum: false },
    });

    expect(merged.crypto.pbkdf2Iterations).toBe(50000);
    expect(merged.crypto.saltByteLength).toBe(DEFAULT_CONFIG.crypto.saltByteLength);
    expect(merged.framing.enableChecksum).toBe(false);
    expect(merged.encoding.sentenceEndingVariance).toBe(true);
    expect(merged.encoding.style).toBe("news");
  });

  it("should validate passwords correctly", () => {
    expect(() => validatePassword("")).toThrow(ValidationError);
    expect(() => validatePassword("   ")).toThrow(ValidationError);
    expect(() => validatePassword("validPassword123")).not.toThrow();
  });

  it("should validate plaintext inputs correctly", () => {
    // @ts-expect-error testing invalid input type
    expect(() => validatePlaintext(12345)).toThrow(ValidationError);
    expect(() => validatePlaintext("Valid string")).not.toThrow();
  });
});
