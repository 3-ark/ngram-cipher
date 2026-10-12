/**
 * 1-4 Gram N-Gram Language Model Calculation Engine
 */

// Common English Bigram Transitions (w1 -> Set/Map of w2 -> weight)
const BIGRAM_MAP: Record<string, Record<string, number>> = {
  the: {
    major: 10, global: 10, national: 10, public: 10, new: 10, economic: 9,
    government: 10, president: 10, market: 10, company: 9, report: 9,
    court: 8, council: 8, economy: 9, system: 8, country: 9, election: 8,
    minister: 8, official: 8, leader: 8, conference: 8, committee: 8
  },
  a: {
    new: 10, major: 10, significant: 9, key: 9, recent: 8, large: 8,
    statement: 9, report: 9, decision: 9, meeting: 8, agreement: 9,
    plan: 8, proposal: 8, campaign: 8, strategy: 8, solution: 8
  },
  an: {
    international: 10, official: 9, important: 9, annual: 9, early: 8,
    urgent: 8, extensive: 8, active: 8, economic: 8, immediate: 8
  },
  in: {
    washington: 10, london: 10, paris: 9, beijing: 9, europe: 9, america: 9,
    the: 10, a: 8, recent: 8, major: 8, public: 8, global: 8
  },
  on: {
    monday: 10, tuesday: 10, wednesday: 10, thursday: 10, friday: 10,
    the: 10, a: 8, policy: 9, trade: 9, security: 9, climate: 9
  },
  for: {
    the: 10, a: 8, national: 8, public: 8, economic: 8, global: 8,
    peace: 9, growth: 9, security: 9, reform: 9
  },
  with: {
    the: 10, a: 8, key: 8, senior: 8, international: 8, local: 8,
    support: 9, confidence: 8, enthusiasm: 8
  },
  at: {
    the: 10, a: 8, home: 9, present: 8, least: 8, night: 8,
    stanford: 8, harvard: 8, oxford: 8
  },
  by: {
    the: 10, a: 8, local: 8, federal: 8, official: 8, police: 9
  },
  from: {
    the: 10, a: 8, washington: 8, london: 8, china: 8, japan: 8
  },
  to: {
    the: 10, a: 8, support: 9, protect: 9, build: 9, expand: 9,
    improve: 9, address: 9, develop: 9, promote: 9
  },
  recently: {
    announced: 10, reported: 10, confirmed: 10, revealed: 9,
    approved: 9, launched: 9, published: 9, introduced: 9
  },
  officially: {
    announced: 10, confirmed: 10, launched: 9, approved: 9,
    opened: 9, started: 9, endorsed: 8
  },
  publicly: {
    supported: 10, defended: 9, stated: 9, criticized: 8,
    endorsed: 9, backed: 9, called: 8
  },
  major: {
    report: 10, policy: 10, summit: 10, agreement: 10, market: 9,
    reform: 9, crisis: 9, breakthrough: 9, project: 9, investment: 9
  },
  global: {
    market: 10, economy: 10, trade: 9, community: 9, network: 9,
    growth: 9, alliance: 8, crisis: 8, summit: 8
  },
  national: {
    security: 10, policy: 10, economy: 9, election: 9, council: 9,
    guard: 8, interest: 8, assembly: 8
  },
  economic: {
    growth: 10, policy: 10, reform: 9, crisis: 9, development: 9,
    recovery: 8, impact: 8, instability: 8
  },
  international: {
    community: 10, trade: 9, treaty: 9, summit: 9, alliance: 8,
    court: 8, law: 8, cooperation: 8
  },
  has: {
    announced: 10, confirmed: 10, launched: 9, approved: 9,
    revealed: 9, expanded: 8, increased: 8, signed: 8
  },
  have: {
    announced: 10, confirmed: 10, agreed: 9, reached: 9,
    demanded: 8, called: 8, supported: 8
  },
  was: {
    announced: 10, reported: 10, launched: 9, approved: 9,
    formed: 8, signed: 8, held: 8, completed: 8
  },
  were: {
    reported: 10, announced: 9, discovered: 8, arrested: 8,
    released: 8, held: 8, modified: 7
  },
};

// Common English Trigram Transitions ("w1 w2" -> Record<w3, weight>)
const TRIGRAM_MAP: Record<string, Record<string, number>> = {
  "the government": { announced: 10, approved: 10, confirmed: 9, proposed: 9, launched: 8 },
  "the president": { announced: 10, stated: 9, visited: 8, met: 8, signed: 8 },
  "the court": { ruled: 10, decided: 9, rejected: 8, confirmed: 8, dismissed: 8 },
  "the minister": { stated: 10, confirmed: 9, urged: 8, emphasized: 8, promised: 8 },
  "the company": { announced: 10, reported: 10, launched: 9, expanded: 8, acquired: 8 },
  "the council": { approved: 10, adopted: 9, passed: 9, met: 8, reviewed: 8 },
  "in a": { recent: 10, major: 9, statement: 8, report: 8, meeting: 8 },
  "according to": { reports: 10, officials: 9, sources: 9, experts: 8, data: 8 },
  "a new": { policy: 10, report: 9, study: 9, project: 9, initiative: 8, system: 8 },
  "a major": { step: 10, breakthrough: 10, agreement: 9, report: 9, summit: 8 },
  "announced a": { new: 10, major: 10, plan: 9, agreement: 9, policy: 8 },
  "confirmed the": { news: 10, report: 10, decision: 9, appointment: 8, agreement: 8 },
  "led to": { a: 10, widespread: 8, significant: 8, major: 8, increased: 7 },
  "focused on": { the: 10, economic: 8, national: 8, future: 8, building: 7 }
};

// Common English 4-Gram Transitions ("w1 w2 w3" -> Record<w4, weight>)
const FOURGRAM_MAP: Record<string, Record<string, number>> = {
  "the prime minister": { announced: 10, confirmed: 10, stated: 9, visited: 8 },
  "the secretary of": { state: 10, defense: 10, treasury: 9, energy: 8 },
  "according to the": { report: 10, official: 9, minister: 8, president: 8 },
  "a spokesman for": { the: 10, government: 9, company: 8, president: 8 },
  "in a recent": { report: 10, statement: 10, interview: 9, speech: 8 },
  "the United States": { announced: 10, signed: 9, warned: 8, supported: 8 }
};

import newsNGrams from "./news_ngrams.json" with { type: "json" };

const CORPUS_BIGRAMS: Record<string, Record<string, number>> = (newsNGrams as any).bigrams || {};
const CORPUS_TRIGRAMS: Record<string, Record<string, number>> = (newsNGrams as any).trigrams || {};

/**
 * Calculates 1-4 gram language model score for a candidate word given prior context words.
 */
export function calculateNGramScore(candidate: string, context: string[]): number {
  const w = candidate.toLowerCase();
  let score = 0;

  const len = context.length;
  const w1 = len >= 1 ? context[len - 1].toLowerCase() : "";
  const w2 = len >= 2 ? context[len - 2].toLowerCase() : "";
  const w3 = len >= 3 ? context[len - 3].toLowerCase() : "";

  // 1. 4-Gram Score (weight = 1000)
  if (w1 && w2 && w3) {
    const key4 = `${w3} ${w2} ${w1}`;
    const map4 = FOURGRAM_MAP[key4];
    if (map4 && map4[w]) {
      score += 1000 * map4[w];
    }
  }

  // 2. 3-Gram Score (weight = 100)
  if (w1 && w2) {
    const key3 = `${w2} ${w1}`;
    const map3 = TRIGRAM_MAP[key3];
    if (map3 && map3[w]) {
      score += 100 * map3[w];
    }
    const corpusTrigram = CORPUS_TRIGRAMS[key3];
    if (corpusTrigram && corpusTrigram[w]) {
      score += 100 * corpusTrigram[w];
    }
  }

  // 3. 2-Gram Score (weight = 10)
  if (w1) {
    const map2 = BIGRAM_MAP[w1];
    if (map2 && map2[w]) {
      score += 10 * map2[w];
    }
    const corpusBigram = CORPUS_BIGRAMS[w1];
    if (corpusBigram && corpusBigram[w]) {
      score += 10 * corpusBigram[w];
    }
  }

  // 4. Unigram Naturalness Score (weight = 1)
  if (w.length >= 2 && w.length <= 12) {
    score += 1;
  }

  return score;
}

/**
 * Deterministically ranks candidate words for a slot using 1-4 gram context scoring.
 * Words with higher N-gram scores appear first. Ties are broken by original index / alphabetical order.
 */
export function rankCandidates(candidates: string[], context: string[]): string[] {
  if (!candidates || candidates.length <= 1) {
    return candidates ? [...candidates] : [];
  }

  const scored = candidates.map((word, originalIndex) => ({
    word,
    originalIndex,
    score: calculateNGramScore(word, context)
  }));

  // Sort descending by score; tie-break by originalIndex to guarantee deterministic order
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.originalIndex - b.originalIndex;
  });

  return scored.map(item => item.word);
}

/**
 * 1-to-1 bijective mapping between bit val (0..N-1) and candidate rank (0..N-1).
 */
export function valToRank(val: number, _bitCount: number, N: number): number {
  return val % N;
}

export function rankToVal(rank: number, _bitCount: number, N: number): number {
  return rank % N;
}
