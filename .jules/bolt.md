# Bolt's Journal - Critical Learnings Only

This journal contains critical learnings on performance patterns, edge cases, and architectural bottlenecks.

## 2025-05-18 - Candidate Ranking Context Invariant Hoisting
**Learning:** During N-gram candidate ranking, evaluating context invariants (subject resolution, N-gram sub-map retrieval, lowercase context lookups) inside the candidate loop causes hundreds of thousands of redundant string concatenations, array slices, and set operations per message.
**Action:** Always pre-resolve context lookahead/lookback state once per slot outside candidate evaluation loops rather than re-evaluating context for each vocabulary candidate.
