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
