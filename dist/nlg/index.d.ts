export * from "./ngram_model.js";
export type SlotType = "data" | "filler";
export interface Slot {
    type: SlotType;
    list: string[];
    label: string;
    punctuationBefore?: string;
    punctuationAfter?: string;
}
export declare function D(list: string[], label: string, punctuationAfter?: string, punctuationBefore?: string): Slot;
export declare function F(list: string[], label: string, punctuationAfter?: string, punctuationBefore?: string): Slot;
export declare const NOUNS: string[];
export declare const VERBS: string[];
export declare const VERBS_PAST: string[];
export declare const ADJECTIVES: string[];
export declare const ADVERBS: string[];
export declare const PROPER_NOUNS: string[];
export declare const PERCENTAGES: string[];
export declare const DETERMINERS: string[];
export declare const PREPOSITIONS: string[];
export declare const CONJUNCTIONS: string[];
export declare const RELATIVES: string[];
export declare const PRONOUNS: string[];
export declare const POS_LISTS: Record<string, string[]>;
export declare const POS_SETS: Record<string, Set<string>>;
export declare const POS_WORD_TO_INDEX: Record<string, Map<string, number>>;
export declare const VOCABULARY: string[];
export declare const CARRIER_WORDS: string[];
export declare const CORE_TREND_NOUNS: string[];
export declare const CORE_TREND_VERBS: string[];
export declare const METRIC_ACTION_VERBS: string[];
export declare const ACTION_SUBJECTS_EXTENDED: string[];
export declare const ACTION_OBJECTS_EXTENDED: string[];
export declare const ACTION_VERBS_EXTENDED: string[];
export declare const REPORTING_SUBJECTS_PROPER: string[];
export declare const LOCATION_PROPER_NOUNS: string[];
export declare const REPORTING_CLAUSE_VERBS: string[];
export declare const CAUSE_ADJECTIVES: string[];
export declare const CAUSE_NOUNS: string[];
export declare const CAUSE_VERBS: string[];
export declare const APPOSITIVE_REQUEST_VERBS: string[];
export declare const UNRESOLVED_COMPLEMENT_VERBS: string[];
export declare const COMPLEMENT_ADJECTIVES: string[];
export declare const ACTION_ADVERBS: string[];
export declare const DISCOURSE_ADVERBS: string[];
export declare const EFFECT_ADVERBS: string[];
export declare const CONDITION_NOUNS: string[];
export declare const CONDITION_VERBS: string[];
export declare const RELATIVE_ANTECEDENTS: string[];
export declare const RELATIVE_SUBJECTS: string[];
export declare const RELATIVE_VERBS: string[];
export declare const EFFECT_SCOPE_ADJECTIVES: string[];
export declare const EFFECT_TYPE_ADJECTIVES: string[];
export declare const EFFECT_NOUNS: string[];
export declare const EFFECT_VERBS: string[];
export declare const AFTER_EVENTS: string[];
export declare const TEMPLATES: Slot[][];
export declare const POETRY_TEMPLATES: Slot[][];
/**
 * Deterministically identifies template index 0..7 from sentence word count.
 */
export declare function matchTemplate(tokens: string[], templates?: Slot[][]): number;
/**
 * Natural-Language Generation Carrier-Text Quality & N-Gram Statistical Analysis
 */
export interface CarrierAnalysis {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    vocabularyCoverage: number;
    bigramUniqueness: number;
    perplexityEstimate: number;
}
export declare function analyzeCarrierText(text: string): CarrierAnalysis;
