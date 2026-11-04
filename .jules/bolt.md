# Bolt's Journal - Critical Learnings Only

This journal contains critical learnings on performance patterns, edge cases, and architectural bottlenecks.

## 2025-05-18 - Candidate Ranking Context Invariant Hoisting
**Learning:** During N-gram candidate ranking, evaluating context invariants (subject resolution, N-gram sub-map retrieval, lowercase context lookups) inside the candidate loop causes hundreds of thousands of redundant string concatenations, array slices, and set operations per message.
**Action:** Always pre-resolve context lookahead/lookback state once per slot outside candidate evaluation loops rather than re-evaluating context for each vocabulary candidate.

## 2025-05-19 - CRC-32 Table Precomputation
**Learning:** Bit-by-bit CRC-32 checksum calculation in message framing loops 8 times per byte, leading to millions of redundant branch and shift operations on message envelopes during framing and unpacking.
**Action:** Use a precomputed 256-entry Uint32Array lookup table for IEEE 802.3 CRC-32 polynomial (0xedb88320) to compute checksums with a single lookup and shift per byte, yielding a ~15x-20x speedup with zero per-hash heap allocations.
