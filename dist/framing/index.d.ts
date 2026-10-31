/**
 * Binary Message Framing, Metadata, and Versioning
 */
import { FramingConfig } from "../config/index.js";
/**
 * Calculates CRC-32 checksum for a Uint8Array buffer.
 */
export declare function crc32(data: Uint8Array): number;
/**
 * Frame Envelope Layout:
 * +----------------+---------------+----------------------+------------------+------------------+
 * | Magic (2 B)    | Version (1 B) | Payload Length (2 B) | Payload Bytes    | Checksum (4 B)   |
 * +----------------+---------------+----------------------+------------------+------------------+
 */
export interface FrameHeader {
    salt: Uint8Array;
    magic: Uint8Array;
    version: number;
    payloadLength: number;
    checksum: number;
}
export declare function packFrame(payload: Uint8Array, config?: FramingConfig): Uint8Array;
export declare function unpackFrame(frame: Uint8Array, config?: FramingConfig): {
    header: FrameHeader;
    payload: Uint8Array;
};
