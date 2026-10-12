/**
 * Bit Stream Reader and Writer Helper Utilities for Reversible Encoding
 */

export class BitStreamReader {
  private bytes: Uint8Array;
  private byteIndex = 0;
  private bitIndex = 0;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  get remainingBits(): number {
    return Math.max(0, (this.bytes.length - this.byteIndex) * 8 - this.bitIndex);
  }

  get hasBits(): boolean {
    return this.remainingBits > 0;
  }

  readBits(count: number): number {
    let result = 0;
    for (let i = 0; i < count; i++) {
      if (this.byteIndex >= this.bytes.length) {
        result = result << 1;
      } else {
        const bit = (this.bytes[this.byteIndex] >> (7 - this.bitIndex)) & 1;
        result = (result << 1) | bit;
        this.bitIndex++;
        if (this.bitIndex === 8) {
          this.bitIndex = 0;
          this.byteIndex++;
        }
      }
    }
    return result >>> 0;
  }
}

export class BitStreamWriter {
  private bytes: number[] = [];
  private currentByte = 0;
  private bitCount = 0;
  public totalBitsWritten = 0;

  writeBits(value: number, count: number): void {
    for (let i = count - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      this.currentByte = (this.currentByte << 1) | bit;
      this.bitCount++;
      this.totalBitsWritten++;
      if (this.bitCount === 8) {
        this.bytes.push(this.currentByte);
        this.currentByte = 0;
        this.bitCount = 0;
      }
    }
  }

  toBytes(): Uint8Array {
    const resultBytes = [...this.bytes];
    if (this.bitCount > 0) {
      resultBytes.push((this.currentByte << (8 - this.bitCount)) & 0xff);
    }
    return new Uint8Array(resultBytes);
  }
}
