import { describe, it, expect } from "vitest";
import { packFrame, unpackFrame, crc32 } from "./framing/index.js";
import { FramingError, DEFAULT_CONFIG } from "./config/index.js";

describe("Binary Message Framing and Metadata Module", () => {
  it("should calculate correct CRC32 checksum", () => {
    const data = new TextEncoder().encode("123456789");
    const checksum = crc32(data);
    expect(checksum).toBe(0xcbf43926);
  });

  it("should pack payload with header, version, length, and CRC32 checksum", () => {
    // Payload starts with 16 B salt offset
    const payload = new Uint8Array(20);
    payload.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 0);
    payload.set([10, 20, 30, 40], 16);

    const frame = packFrame(payload);

    // Frame size: Salt(16) + Magic(2) + Version(1) + Length(4) + EncryptedBytes(4) + Checksum(4) = 31 bytes
    expect(frame.length).toBe(31);
    expect(frame[16]).toBe(0x4e); // 'N' at offset 16
    expect(frame[17]).toBe(0x47); // 'G'
    expect(frame[18]).toBe(1);    // Version 1

    const unpacked = unpackFrame(frame);
    expect(unpacked.header.version).toBe(1);
    expect(unpacked.header.payloadLength).toBe(4);
    expect(Array.from(unpacked.payload)).toEqual(Array.from(payload));
  });

  it("should throw FramingError on invalid magic header", () => {
    const payload = new Uint8Array(20);
    const frame = packFrame(payload);

    // Corrupt magic header at offset 16
    frame[16] = 0x58; // 'X'

    expect(() => unpackFrame(frame)).toThrow(FramingError);
    expect(() => unpackFrame(frame)).toThrow("Invalid frame magic header");
  });

  it("should throw FramingError on unsupported frame version", () => {
    const payload = new Uint8Array(20);
    const frame = packFrame(payload);

    // Corrupt version at offset 18
    frame[18] = 99;

    expect(() => unpackFrame(frame)).toThrow(FramingError);
    expect(() => unpackFrame(frame)).toThrow("Unsupported frame version");
  });

  it("should throw FramingError on corrupted payload checksum", () => {
    const payload = new Uint8Array(20);
    const frame = packFrame(payload);

    // Corrupt encrypted payload byte at offset 24
    frame[24] ^= 0xff;

    expect(() => unpackFrame(frame)).toThrow(FramingError);
    expect(() => unpackFrame(frame)).toThrow("checksum mismatch");
  });

  it("should handle checksum disabled configuration", () => {
    const config = { ...DEFAULT_CONFIG.framing, enableChecksum: false };
    const payload = new Uint8Array(18); // 16 salt + 2 payload
    const frame = packFrame(payload, config);

    expect(frame.length).toBe(16 + 2 + 1 + 4 + 2); // Salt(16) + Header(7) + EncryptedPayload(2) = 25
    const unpacked = unpackFrame(frame, config);
    expect(Array.from(unpacked.payload)).toEqual(Array.from(payload));
  });
});
