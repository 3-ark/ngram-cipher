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
    const payload = new Uint8Array([10, 20, 30, 40, 50]);
    const frame = packFrame(payload);

    // Frame size: Magic(2) + Version(1) + Length(4) + Payload(5) + Checksum(4) = 16 bytes
    expect(frame.length).toBe(16);
    expect(frame[0]).toBe(0x4e); // 'N'
    expect(frame[1]).toBe(0x47); // 'G'
    expect(frame[2]).toBe(1);    // Version 1

    const unpacked = unpackFrame(frame);
    expect(unpacked.header.version).toBe(1);
    expect(unpacked.header.payloadLength).toBe(5);
    expect(Array.from(unpacked.payload)).toEqual(Array.from(payload));
  });

  it("should throw FramingError on invalid magic header", () => {
    const payload = new Uint8Array([1, 2, 3]);
    const frame = packFrame(payload);

    // Corrupt magic header
    frame[0] = 0x58; // 'X'

    expect(() => unpackFrame(frame)).toThrow(FramingError);
    expect(() => unpackFrame(frame)).toThrow("Invalid frame magic header");
  });

  it("should throw FramingError on unsupported frame version", () => {
    const payload = new Uint8Array([1, 2, 3]);
    const frame = packFrame(payload);

    // Corrupt version
    frame[2] = 99;

    expect(() => unpackFrame(frame)).toThrow(FramingError);
    expect(() => unpackFrame(frame)).toThrow("Unsupported frame version");
  });

  it("should throw FramingError on corrupted payload checksum", () => {
    const payload = new Uint8Array([1, 2, 3, 4, 5]);
    const frame = packFrame(payload);

    // Corrupt payload byte
    frame[8] ^= 0xff;

    expect(() => unpackFrame(frame)).toThrow(FramingError);
    expect(() => unpackFrame(frame)).toThrow("checksum mismatch");
  });

  it("should handle checksum disabled configuration", () => {
    const config = { ...DEFAULT_CONFIG.framing, enableChecksum: false };
    const payload = new Uint8Array([100, 200]);
    const frame = packFrame(payload, config);

    expect(frame.length).toBe(2 + 1 + 4 + 2); // Header(7) + Payload(2) = 9
    const unpacked = unpackFrame(frame, config);
    expect(Array.from(unpacked.payload)).toEqual([100, 200]);
  });
});
