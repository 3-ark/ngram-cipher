/**
 * 1-5 Gram N-Gram Language Model Calculation Engine
 */
export type NounCategory = "AGENT" | "DOCUMENT" | "METRIC" | "EVENT" | "SYSTEM_OBJECT";
export type DomainTopic = "finance" | "governance" | "diplomacy" | "crisis";
export declare const DOMAIN_TOPICS: DomainTopic[];
/**
 * Returns the semantic category of a given noun.
 */
export declare function getNounCategory(noun: string): NounCategory;
/**
 * Narrows data-slot vocabularies using local grammar while keeping their size
 * a power of two so the encoder and decoder consume the same number of bits.
 */
export declare function getCompatibleCandidates(candidates: string[], context: string[], slotLabel: string, topic?: DomainTopic): string[];
/**
 * Calculates 1-5 gram language model score for a candidate word given prior context words.
 */
export declare function calculateNGramScore(candidate: string, context: string[], topic?: DomainTopic): number;
/**
 * Deterministically ranks candidate words for a slot using 1-4 gram context scoring.
 * Words with higher N-gram scores appear first. Ties are broken by original index / alphabetical order.
 */
export declare function rankCandidates(candidates: string[], context: string[], topic?: DomainTopic): string[];
/**
 * 1-to-1 bijective mapping between bit val (0..2^bitCount - 1) and candidate rank (0..2^bitCount - 1).
 * Guarantees zero bit collisions by enforcing candidate set size N >= 2^bitCount.
 */
export declare function valToRank(val: number, bitCount: number, N: number): number;
export declare function rankToVal(rank: number, bitCount: number, N: number): number;
