# Bolt's Journal - Critical Learnings Only

This journal contains critical learnings on performance patterns, edge cases, and architectural bottlenecks.

## 2025-05-18 - Candidate Ranking Context Invariant Hoisting
**Learning:** During N-gram candidate ranking, evaluating context invariants (subject resolution, N-gram sub-map retrieval, lowercase context lookups) inside the candidate loop causes hundreds of thousands of redundant string concatenations, array slices, and set operations per message.
**Action:** Always pre-resolve context lookahead/lookback state once per slot outside candidate evaluation loops rather than re-evaluating context for each vocabulary candidate.

## 2025-05-19 - CRC-32 Table Precomputation
**Learning:** Bit-by-bit CRC-32 checksum calculation in message framing loops 8 times per byte, leading to millions of redundant branch and shift operations on message envelopes during framing and unpacking.
**Action:** Use a precomputed 256-entry Uint32Array lookup table for IEEE 802.3 CRC-32 polynomial (0xedb88320) to compute checksums with a single lookup and shift per byte, yielding a ~15x-20x speedup with zero per-hash heap allocations.

## 2025-05-20 - Binary Min-Heap for Huffman Prefix Code Trees
**Learning:** Constructing prefix code trees in `buildOpeningCodes` using repeated array sorting (`queue.sort`) and head shifts (`queue.shift`) creates an $O(N^2 \log N)$ bottleneck that dominates V8 execution time when encoding/decoding templates with large opener vocabularies (e.g. 256 candidates).
**Action:** Use an in-memory binary min-heap priority queue with $O(\log N)$ push/pop and deterministic primary (`weight`) and secondary (`order`) tie-breaking to construct prefix code trees in $O(N \log N)$ time, yielding a ~7.3x speedup on tree building and ~36% faster end-to-end carrier text round-trips.

## 2025-05-21 - Semantic Affinity Hoisting & Fast Token Index Matching
**Learning:** Evaluating noun-verb semantic affinity inside the candidate loop evaluated a 6-branch category waterfall testing multiple individual `Set.has` calls per candidate (up to 3 lookups per candidate across 256 candidates), while `getCompatibleCandidates` dynamically allocated new `Set` instances with spread operators on every VP slot. Furthermore, carrier decoding in `englishTextToBytes` executed `findIndex(w => w.toLowerCase() === cleanWord)` for every decoded token, triggering linear closure allocations and redundant `toLowerCase()` calls on pre-lowercased vocabularies.
**Action:** Precompute static combined affinity Sets (`EVENT_OR_METRIC_TREND_VERBS`, `INFORMATIONAL_OR_SPEECH_VERBS`, etc.) and hoist affinity resolution into `prepareNGramContext` to collapse candidate evaluation down to a single Set check. In `englishTextToBytes`, fast-path candidate token matching using native `ranked.indexOf(cleanWord)` to bypass linear closure allocations and redundant lowercasing.

## 2025-05-22 - Template Bit Density Memoization
**Learning:** In `getTemplateCodes`, candidate sorting evaluated `estimateTemplateBitDensity(templates[b]) - estimateTemplateBitDensity(templates[a])` repeatedly inside the sort comparator on every sentence during carrier text encoding and decoding. Re-evaluating slot loops and `Math.log2` computations for static template configurations on every sentence comparison created needless CPU churn.
**Action:** Precompute and memoize template bit densities per template array using a `WeakMap<Slot[][], number[]>` so comparator sorting accesses densities via $O(1)$ array lookups, yielding a ~3.4x speedup on template code generation.

## 2025-05-23 - Single-Pass Bi-directional Prefix Code Tree Construction
**Learning:** In `bytesToEnglishText`, reversing prefix code maps using `new Map(Array.from(map, ([k, v]) => [v, k]))` on every sentence opener and template code lookup allocated hundreds of temporary 2-element tuples (`[word, code]`), an outer array, and a secondary Map for every sentence. In a 20-sentence message with 256 candidates, this created thousands of short-lived heap allocations and garbage collection pressure.
**Action:** Construct both forward (`wordToCode`) and reverse (`codeToWord`) mappings in a single pass during Huffman tree traversal (`visit`), and invert small maps via direct loop lookups (`for (const [k, v] of map) reverse.set(v, k)`), eliminating intermediate tuple allocations and cutting carrier text encoding time by ~15-20%.

## 2025-05-24 - Typed Index Sorting & Zero-Allocation Power-of-Two Candidate Passthrough
**Learning:** In `getCompatibleCandidates`, every slot that did not match active grammar filters repeatedly allocated two arrays: `[...candidates]` and `candidates.slice(0, 256)` on candidate pools already sized to powers of two. In `rankCandidates`, mapping candidates to `{ word, originalIndex, score }` wrapper objects created 256 heap objects per slot across 10+ slots per sentence (~70,000+ objects per message), adding GC churn and property access overhead during TimSort.
**Action:** Pass through candidate arrays directly when already a power of two without cloning or slicing. Replace `{ word, originalIndex, score }` wrapper objects in `rankCandidates` with an `Int32Array` indexed sort (`scores[b] - scores[a] || a - b`), completely eliminating per-slot wrapper object allocations while preserving deterministic tie-breaking.

## 2025-05-25 - Zero-Callback Native TypedArray Sorting
**Learning:** In V8, sorting typed arrays with a custom JavaScript comparator (`indices.sort((a, b) => scores[b] - scores[a] || a - b)`) invokes the JavaScript callback function for every comparison pair (~1,800 calls per slot, ~180,000 calls per message), consuming ~26.5% of total runtime in `TypedArrayMergeSort` and VM function call transitions. However, unlike `Array.prototype.sort()` which converts items to strings, `TypedArray.prototype.sort()` without arguments performs a pure native numerical sort in C++.
**Action:** Pack score and index into a single `Float64Array` (`packed[i] = -score * 65536 + i`), which fits safely within IEEE 754 safe integer limits without rounding error. Calling native `.sort()` with zero arguments executes in native C++ with no JS callback overhead, speeding up candidate sorting by ~2.37x and reducing carrier text roundtrip time by ~16.6%.
