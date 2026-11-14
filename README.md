# ngram-cipher 🔏💬

**Still working in progress, not usable!!!**

> Natural English N-Gram Steganographic Cipher Encoder and Decoder for JavaScript & TypeScript.

`ngram-cipher` encrypts secret data using **AES-256-GCM** and hides the resulting ciphertext inside losslessly reversible, natural-sounding English prose (news reports or poetry).

Unlike classic steganography that hides bits in image pixels or audio noise, `ngram-cipher` converts encrypted bits directly into syntactically valid and semantically coherent natural text derived from dynamic 1–5 gram statistical language models (Google Books N-Gram data).

---

## Features

- **🔐 Robust Security**: PBKDF2 (100,000 iterations) key derivation, AES-256-GCM encryption, CRC32 binary framing, and payload whitening.
- **💬 Natural English Carrier Text**: Generates flowing prose following dynamic N-gram statistical models with subject-verb semantic matching and dynamic punctuation. News sentences contain at least five words, vary their structure, and avoid repeating a structure within the previous two sentences. Patterns include concise trend reports, appositive details, causal explanations, and source attributions.
- **🎨 Multiple Carrier Styles**:
  - `news` (default): Realistic journalistic prose with attributions, clause variations, and natural sentence flows.
  - `poetry`: Stanza-formatted poetic verse with haiku-inspired rhythm, expressive vocabulary, and rich steganographic capacity.
- **🔄 100% Losslessly Reversible**: Bit allocation using power-of-two power ranks and deterministic context continuation guarantees bit-exact payload recovery.
- **🗜️ Automatic Compression**: Uses gzip or reversible common-word packing when smaller; dictionary-packed data is padded to 16-byte blocks to limit fine-grained compressed-length leakage.
- **📦 Universal ES Module & CommonJS Support**: Includes full TypeScript declarations (`.d.ts`), works seamlessly in Node.js, modern browsers, and bundlers.
- **🪶 Lightweight Non-LLM Build**: Dedicated ultra-light build without heavy ONNX Runtime or Transformers.js dependencies (~7 KB minified, 0 WASM binaries), ideal for size-sensitive environments like Chrome Extensions. Full LLM version is available separately under `ngram-cipher/llm`.

---

## Installation

```bash
npm install ngram-cipher
```

---

## Light vs Full (LLM) Builds

`ngram-cipher` provides two separate builds to accommodate different performance and size constraints:

| Package Import | Built Bundle | Bundle Size | Heavy Dependencies | Description |
|---|---|---|---|---|
| `ngram-cipher` (default) | `ngram-cipher.js` / `.cjs` | **~7 KB** | None (0 MB WASM) | **Lightweight version**. Fast, stable, statistical N-gram continuation (`news`, `poetry`). Ideal for Chrome extensions, embedded scripts, and serverless. |
| `ngram-cipher/llm` | `ngram-cipher-llm.js` / `.cjs` | ~21 KB | `@huggingface/transformers` (~26 MB WASM/ONNX) | **Full version**. Includes experimental ONNX LLM steganography mode (`style: "llm"`) alongside standard styles. |

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

News templates cover sentence lengths from 5 to 19 words. Three of the fifteen structures use
quantitative language (multipliers, percentages, or numeric metrics); the others focus on market,
policy, and diplomatic developments.
Role-specific news vocabularies use 8, 16, or 32 choices instead of broad 256-word pools. This
reduces per-sentence capacity in exchange for more contextually plausible word choices, so a
payload may require more carrier sentences.

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

### LLM Mode (`"llm"` - Experimental)

Embeds secret payload bits directly into causal language model token selections using Hugging Face Transformers (`@huggingface/transformers`) and ONNX Runtime. Note that this requires importing from `ngram-cipher/llm`:

```typescript
import { encode } from "ngram-cipher/llm";

const llmText = await encode("Secret message", "password123", {
  encoding: {
    style: "llm",
    llmModel: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
    llmPrompt: "In recent news,",
    bitsPerToken: 4
  }
});
```

### Equal-Length Cipher LLM Mode (`"equal-length"` - Experimental)

Hides secret text or binary payload inside natural cover text of the exact same token length, based on the Equal-Length Cipher method (Norelli & Bronstein, 2025). The algorithm maps secret text tokens to their logit ranks conditioned on a public/secret prompt, then reconstructs cover text using those ranks conditioned on a key prompt:

```typescript
import { encode, decode } from "ngram-cipher/llm";

const carrierText = await encode("Secret message", "password123", {
  encoding: {
    style: "equal-length",
    llmModel: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
    equalLengthKeyPrompt: "Here is an interesting observation:",
    equalLengthPlaintextPrompt: "A text:"
  }
});

const decrypted = await decode(carrierText, "password123", {
  encoding: {
    style: "equal-length",
    llmModel: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
    equalLengthKeyPrompt: "Here is an interesting observation:",
    equalLengthPlaintextPrompt: "A text:"
  }
});
```

> ⚠️ **CRITICAL WARNING: LLM steganography methods are experimental and require identical runtime hardware and models for robust decoding.**
>
> Steganographic decoding in both Top-K reversible token mode (`style: "llm"`) and the Equal-Length Cipher (`style: "equal-length"`) relies on computing exact, bit-identical token logit rankings across vocabulary distributions between the encoding and decoding passes.
>
> **Users must be warned that this method has to use the same runtime hardware and the exact same model to make sure that the decoding is robust.**
>
> Even a minor floating-point difference of $10^{-7}$ in a single logit can swap adjacent token ranks, cascading into total payload corruption or unrecoverable decoding errors. The following components **must match identically** between encoding and decoding:
>
> - **Runtime Hardware & Execution Provider**: You must use the **same runtime hardware** (e.g. CPU architecture, instruction set extensions such as AVX2, AVX-512, or ARM NEON). Cross-hardware execution (e.g., encoding on x86_64 and decoding on Apple Silicon / ARM64, or running with differing SIMD implementations) can introduce subtle floating-point non-determinism in matrix multiplications that shifts token ranks.
> - **Exact Model & Precision**: You must use the **exact same model checkpoint, revision, and weight quantization** (e.g. `fp32`, `fp16`, `q4`, `q8`). Changing models or using differently quantized variants between sender and receiver alters logit outputs and breaks decoding completely.
> - **Runtime Library & Dependency Versions**: Different versions of `@huggingface/transformers`, `onnxruntime-web`, or `onnxruntime-node` may employ different graph optimization passes, math kernels, or tokenizer implementations.
> - **Prompt & Algorithm Parameters**: All prompt contexts (`llmPrompt`, `equalLengthKeyPrompt`, `equalLengthPlaintextPrompt`), rank reversal flags (`equalLengthReverseRanks`), and sampling parameters (`llmTemperature`, `llmTopK`, `llmTopP`, `bitsPerToken`) must be identical on encode and decode.
>
> Unless you have full control over ensuring that **both parties run the same runtime hardware and model**, **use `"news"` or `"poetry"` styles for reliable and stable production steganography**.

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
    style: "poetry",           // "news" | "poetry" | "llm" (experimental)
    sentenceEndingVariance: true,
    // Optional LLM mode parameters (requires identical values on decode):
    // llmModel: "onnx-community/Supra-Mini-v2-0.1M-ONNX",
    // llmPrompt: "In recent news,",
    // bitsPerToken: 4,
    // llmTemperature: 1.0,
    // llmTopK: 50,
    // llmTopP: 0.95,
    // llmLogitPrecision: 100
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
5. **Dynamic Power-of-Two N-Gram Mapping**: Payload bits are encoded in the selected words' ranks within POS candidate pools ($2^n$ capacity slots), scored using N-gram continuation probabilities from Google Books datasets, and rendered into natural English sentences. News templates use curated, role-specific dictionaries of 8, 16, or 32 choices, with noun/verb agreement and context-aware ranking. This deliberately trades per-sentence capacity for more plausible word choices and can require more carrier sentences. Template selection balances capacity with varied sentence lengths and journalistic structures.

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
