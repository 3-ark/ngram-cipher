# ngram-cipher 🔏💬

> Natural English N-Gram Steganographic Cipher Encoder and Decoder for JavaScript & TypeScript.

`ngram-cipher` encrypts secret data using **AES-256-GCM** and hides the resulting ciphertext inside losslessly reversible, natural-sounding English prose (news reports or poetry).

Unlike classic steganography that hides bits in image pixels or audio noise, `ngram-cipher` converts encrypted bits directly into syntactically valid and semantically coherent natural text derived from dynamic 1–5 gram statistical language models (Google Books N-Gram data).

---

## Features

- **🔐 Robust Security**: PBKDF2 (100,000 iterations) key derivation, AES-256-GCM encryption, CRC32 binary framing, and payload whitening.
- **💬 Natural English Carrier Text**: Generates flowing prose following dynamic N-gram statistical models with subject-verb semantic matching and dynamic punctuation. News sentences contain at least six words, vary their structure, and avoid repeating a structure within the previous two sentences. Patterns include appositive details, causal explanations, and source attributions.
- **🎨 Multiple Carrier Styles**:
  - `news` (default): Realistic journalistic prose with attributions, clause variations, and natural sentence flows.
  - `poetry`: Stanza-formatted poetic verse with haiku-inspired rhythm, expressive vocabulary, and rich steganographic capacity.
- **🔄 100% Losslessly Reversible**: Bit allocation using power-of-two power ranks and deterministic context continuation guarantees bit-exact payload recovery.
- **🗜️ Automatic Compression**: Uses gzip or reversible common-word packing when smaller; dictionary-packed data is padded to 16-byte blocks to limit fine-grained compressed-length leakage.
- **📦 Universal ES Module & CommonJS Support**: Includes full TypeScript declarations (`.d.ts`), works seamlessly in Node.js, modern browsers, and bundlers.

---

## Installation

```bash
npm install ngram-cipher
```

---

## Quick Start

### ESM (TypeScript / Modern JavaScript)

```typescript
import { encode, decode } from "ngram-cipher";

const secretText = "Meet me at midnight behind the embassy.";
const password = "correct-horse-battery-staple";

// 1. Encode secret text into natural English carrier text
const carrierText = await encode(secretText, password);
console.log("Carrier Text:\n", carrierText);
/*
Example Output:
"Its major journalist produced the station! The penalty survived in Fidelity...
This critical judge introduced some budget..."
*/

// 2. Decode back to original secret text
const decrypted = await decode(carrierText, password);
console.log("Decrypted Secret:", decrypted);
// Output: "Meet me at midnight behind the embassy."
```

### CommonJS

```javascript
const { encode, decode } = require("ngram-cipher");

async function main() {
  const carrierText = await encode("Top secret data", "myPassword");
  const original = await decode(carrierText, "myPassword");
  console.log(original);
}

main();
```

---

## Carrier Styles

You can specify the carrier style using the `encoding.style` option in `StegoOptions`.

### News Style (`"news"` - Default)

Generates journalistic prose with varying sentence lengths, complex clauses, and natural punctuation.

```typescript
const newsText = await encode("Secret message", "password123", {
  encoding: { style: "news" }
});
```

### Poetry Style (`"poetry"`)

Generates structured stanzas with poetic rhythm, evocative vocabulary, and varied punctuation (`—`, `...`, `,`).

```typescript
const poemText = await encode("Secret message", "password123", {
  encoding: { style: "poetry" }
})
/*
Example Output:
Softly this pristine oasis mourned while that endless threshold murmured...
Every tide weaved though that flower descended,
This hushed embrace persisted yet its mellow serenade remained...

Our snowy mist reflected while any unspoken brook transformed...
*/
```

---

## API Reference

### `encode(plaintext: string, password: string, options?: StegoOptions): Promise<string>`

Encrypts `plaintext` with AES-256-GCM using `password`, packs it into a framed binary packet, whitens payload bytes, and encodes the stream into natural English text.

### `decode(carrierText: string, password: string, options?: StegoOptions): Promise<string>`

Decodes `carrierText`, un-whitens payload bytes, validates binary framing & CRC32 checksums, and decrypts the original plaintext. Throws a `CryptoError` if password is incorrect or carrier text has been corrupted.

### `analyzeCarrierText(text: string): CarrierAnalysis`

Analyzes any carrier text string and returns structural metrics:

```typescript
import { analyzeCarrierText } from "ngram-cipher";

const analysis = analyzeCarrierText(carrierText);
console.log(analysis);
/*
{
  totalWords: 42,
  totalSentences: 4,
  averageSentenceLength: 10.5,
  estimatedBits: 336
}
*/
```

---

## Configuration Options (`StegoOptions`)

`encode` and `decode` accept an optional `options` parameter to customize cryptographic, binary framing, and NLG behavior:

```typescript
import { encode, StegoOptions } from "ngram-cipher";

const options: StegoOptions = {
  crypto: {
    pbkdf2Iterations: 100000, // Number of PBKDF2 iterations
    saltByteLength: 16,        // Salt byte length
    ivByteLength: 12           // AES-GCM IV byte length
  },
  framing: {
    version: 1,                // Binary frame version
    enableChecksum: true       // Include CRC32 checksum
  },
  encoding: {
    style: "poetry",           // "news" | "poetry"
    sentenceEndingVariance: true
  }
};

const text = await encode("Secret message", "password", options);
```

---

## Lower-Level Modules

`ngram-cipher` exports its underlying building blocks for advanced custom integrations:

- **Crypto**: `encryptBytes(data, password, config)`, `decryptBytes(cipherData, password, config)`
- **Encoding**: `bytesToEnglishText(bytes, config)`, `englishTextToBytes(carrierText, config)`
- **Framing**: `packFrame(payload, config)`, `unpackFrame(frame, config)`
- **NLG Engine**: `VOCABULARY`, `calculateNGramScore(gram, category)`, `getNounCategory(noun)`, `getCompatibleCandidates(candidates, context, slotLabel)`

---

## Architecture & How It Works

1. **Gzip Compression**: Input text is checked for compressibility.
2. **AES-256-GCM Encryption**: Key derived via PBKDF2 with SHA-256 (100,000 rounds).
3. **Binary Framing & Checksum**: Header, versioning, payload length, and CRC32 checksum are added.
4. **Stego Whitening Layer**: XOR key-stream whitening scrambles binary pattern artifacts before word mapping.
5. **Dynamic Power-of-Two N-Gram Mapping**: Payload bits are encoded in the selected words' ranks within POS candidate pools ($2^n$ capacity slots), scored using N-gram continuation probabilities from Google Books datasets, and rendered into natural English sentences. News candidates are narrowed by local noun/verb roles and singular-count agreement before ranking; trend percentages use degree adverbs. News templates are selected to favor higher payload capacity per word while retaining varied, long-form sentence structures.

---

## Development & Testing

```bash
# Clone the repository
git clone https://github.com/user/ngram-cipher.git
cd ngram-cipher

# Install dependencies
npm install

# Run unit tests
npm test

# Type-check TypeScript
npm run typecheck

# Build ESM & CJS distribution bundles + types
npm run build
```

---

## License

[MIT](LICENSE.md)
