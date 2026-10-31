/**
 * Bit Stream Reader and Writer Helper Utilities for Reversible Encoding
 */
export declare class BitStreamReader {
    private bytes;
    private byteIndex;
    private bitIndex;
    constructor(bytes: Uint8Array);
    get remainingBits(): number;
    get hasBits(): boolean;
    readBits(count: number): number;
}
export declare class BitStreamWriter {
    private bytes;
    private currentByte;
    private bitCount;
    totalBitsWritten: number;
    writeBits(value: number, count: number): void;
    toBytes(): Uint8Array;
}
