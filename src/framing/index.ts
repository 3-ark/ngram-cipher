/**
 * Binary Message Framing, Metadata, and Versioning
 */

import { FramingError, FramingConfig, DEFAULT_CONFIG } from "../config/index.js";

/**
 * Calculates CRC-32 checksum for a Uint8Array buffer.
 */
export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    let byte = data[i];
    for (let j = 0; j < 8; j++) {
      const bit = (byte ^ crc) & 1;
      crc >>>= 1;
      if (bit) {
        crc ^= 0xedb88320;
      }
      byte >>>= 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Frame Envelope Layout:
 * +----------------+---------------+----------------------+------------------+------------------+
 * | Magic (2 B)    | Version (1 B) | Payload Length (4 B) | Payload Bytes    | Checksum (4 B)   |
 * +----------------+---------------+----------------------+------------------+------------------+
 */
export interface FrameHeader {
  magic: Uint8Array;
  version: number;
  payloadLength: number;
  checksum: number;
}

export function packFrame(
  payload: Uint8Array,
  config: FramingConfig = DEFAULT_CONFIG.framing
): Uint8Array {
  const headerSize = 2 + 1 + 4; // Magic(2) + Version(1) + Length(4)
  const checksumSize = config.enableChecksum ? 4 : 0;
  const frameLength = headerSize + payload.length + checksumSize;

  const frame = new Uint8Array(frameLength);
  const view = new DataView(frame.buffer);

  // 1. Magic
  frame.set(config.magicHeader.subarray(0, 2), 0);

  // 2. Version
  frame[2] = config.version;

  // 3. Payload Length (uint32 big-endian)
  view.setUint32(3, payload.length, false);

  // 4. Payload Bytes
  frame.set(payload, headerSize);

  // 5. Checksum (uint32 big-endian)
  if (config.enableChecksum) {
    const checksum = crc32(payload);
    view.setUint32(headerSize + payload.length, checksum, false);
  }

  return frame;
}

export function unpackFrame(
  frame: Uint8Array,
  config: FramingConfig = DEFAULT_CONFIG.framing
): { header: FrameHeader; payload: Uint8Array } {
  const minHeaderSize = 2 + 1 + 4;
  const checksumSize = config.enableChecksum ? 4 : 0;
  const minSize = minHeaderSize + checksumSize;

  if (frame.length < minSize) {
    throw new FramingError(`Frame too short: ${frame.length} bytes (minimum ${minSize} bytes required).`);
  }

  // 1. Validate Magic Header
  const magic = frame.subarray(0, 2);
  if (magic[0] !== config.magicHeader[0] || magic[1] !== config.magicHeader[1]) {
    throw new FramingError(
      `Invalid frame magic header: expected [0x${config.magicHeader[0].toString(16)}, 0x${config.magicHeader[1].toString(16)}], got [0x${magic[0].toString(16)}, 0x${magic[1].toString(16)}].`
    );
  }

  // 2. Validate Version
  const version = frame[2];
  if (version !== config.version) {
    throw new FramingError(`Unsupported frame version ${version} (expected version ${config.version}).`);
  }

  // 3. Read Payload Length
  const view = new DataView(frame.buffer, frame.byteOffset, frame.byteLength);
  const payloadLength = view.getUint32(3, false);

  const expectedTotalLength = minHeaderSize + payloadLength + checksumSize;
  if (frame.length < expectedTotalLength) {
    throw new FramingError(
      `Truncated frame payload: expected ${payloadLength} bytes payload (total ${expectedTotalLength} bytes), but got ${frame.length} bytes total.`
    );
  }

  const payload = frame.subarray(minHeaderSize, minHeaderSize + payloadLength);

  // 4. Validate Checksum
  let checksum = 0;
  if (config.enableChecksum) {
    checksum = view.getUint32(minHeaderSize + payloadLength, false);
    const calculated = crc32(payload);
    if (checksum !== calculated) {
      throw new FramingError(
        `Frame payload checksum mismatch: computed 0x${calculated.toString(16)}, frame header contained 0x${checksum.toString(16)}.`
      );
    }
  }

  return {
    header: {
      magic,
      version,
      payloadLength,
      checksum,
    },
    payload,
  };
}
