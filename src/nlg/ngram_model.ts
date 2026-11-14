/**
 * 1-5 Gram N-Gram Language Model Calculation Engine
 */

export type NounCategory = "AGENT" | "DOCUMENT" | "METRIC" | "EVENT" | "SYSTEM_OBJECT";
export type DomainTopic = "finance" | "governance" | "diplomacy" | "crisis";

export const DOMAIN_TOPICS: DomainTopic[] = ["finance", "governance", "diplomacy", "crisis"];

const FINANCE_WORDS = new Set([
  "market","economy","budget","finance","trade","export","investment","growth","profit",
  "revenue","stock","salary","benefit","rate","rates","value","cost","price","capital",
  "assets","liabilities","dividends","shares","equities","bonds","funds","credit","income",
  "earnings","yield","yields","tax","tariff","currency","dollar","euro","pound","oil","gas",
  "gold","silver","bank","brokerage","inflation","output","sales","debt","spending","turnover",
  "margin","margins","valuation","portfolio","rose","grew","fell","declined","expanded","surged",
  "dropped","shrank","recovered","stabilized","boosted","lowered","cut","gained","lost","plunged"
]);

const GOVERNANCE_WORDS = new Set([
  "government","president","council","agency","coalition","commission","authority","parliament",
  "court","police","official","leader","minister","governor","senator","policy","program",
  "reform","strategy","verdict","sentence","evidence","contract","statement","proposal",
  "amendment","regulation","standard","guideline","framework","protocol","bill","act","measure",
  "accord","resolution","mandate","decree","directive","statute","law","code","announced",
  "approved","passed","signed","adopted","ratified","enacted","rejected","vetoed","repealed"
]);

const DIPLOMACY_WORDS = new Set([
  "summit","treaty","alliance","foundation","ambassador","diplomat","delegate","envoy",
  "representatives","dignitary","emissary","talks","negotiations","discussions","debates",
  "meetings","sessions","conferences","briefings","dialogues","proceedings","agreements",
  "settlements","reconciliations","compromises","pacts","charters","covenants","washington",
  "london","beijing","moscow","berlin","paris","tokyo","brussels","geneva","vienna","madrid",
  "rome","seoul","cairo","warsaw","prague","stockholm","helsinki","reuters","bloomberg","guardian",
  "stated","reported","confirmed","noted","argued","explained","revealed","declared","reaffirmed"
]);

const CRISIS_WORDS = new Set([
  "drought","storm","flood","conflict","crisis","shortage","strike","blockade","recession",
  "disruption","protest","fire","outbreak","failure","collapse","delay","dispute","war",
  "epidemic","unrest","violence","wildfire","instability","pressure","tension","friction",
  "embargo","sanction","disaster","snowfall","heat","cyclone","hurricane","earthquake",
  "damage","threat","hazard","danger","downturn","hardship","struggle","calamity","upheaval",
  "escalated","deepened","intensified","spread","persisted","worsened","erupted","struck","hit"
]);

const TOPIC_WORD_SETS: Record<DomainTopic, Set<string>> = {
  finance: FINANCE_WORDS,
  governance: GOVERNANCE_WORDS,
  diplomacy: DIPLOMACY_WORDS,
  crisis: CRISIS_WORDS,
};

const AGENT_NOUN_SET = new Set([
  "government","president","council","agency","coalition","alliance","foundation","commission",
  "authority","parliament","court","police","school","student","teacher","university","hospital",
  "patient","doctor","team","player","coach","athlete","league","crowd","rival","family","children",
  "mother","father","neighbor","household","generation","worker","union","media","journalist",
  "press","artist","director","actor","audience","author","publisher","soldier","battalion",
  "commander","regiment","astronaut","citizen","resident","volunteer","activist","leader",
  "minister","ambassador","diplomat","delegate","governor","senator","official","researcher",
  "scholar","graduate","professor","faculty","company","industry","community","prosecution",
  "defense","witness","movement"
]);

const DOCUMENT_NOUN_SET = new Set([
  "report","policy","program","treaty","reform","strategy","verdict","sentence","evidence",
  "contract","broadcast","headline","coverage","statement","interview","film","production",
  "scene","screenplay","novel","chapter","story","edition","volume","archive","legend","memorial",
  "forecast","petition","agreement","proposal","amendment","regulation","standard","guideline",
  "framework","protocol","lecture","seminar","debate","opinion","analysis","survey","finding",
  "conclusion","outcome","assessment","concept","theory","principle"
]);

const METRIC_NOUN_SET = new Set([
  "market","economy","budget","finance","trade","export","investment","growth","profit",
  "revenue","stock","salary","benefit","temperature","rainfall","supply","demand","shortage",
  "surplus","score","penalty","value","cost","price","rate","climate","energy","pollution",
  "resource","production","outcome","shipment","cargo","delivery","forecast","employment",
  "inflation","output","sales","debt","income","spending","volume","level","activity","traffic",
  "attendance","capacity","earnings","imports","exports","operations","services","costs","prices",
  "profits","performance","record","weather","harvest","crops","transport","coverage","yield",
  "stocks","access","resources","deliveries","shortages","shipments","supplies",
  "assets","liabilities","dividends","shares","equities","bonds","funds","capital",
  "wealth","wages","payroll","rates","returns","losses","gains","balances",
  "reserves","deposits","loans","credit","expenditure","consumption","manufacturing","orders",
  "receipts","turnover","margin","margins","yields","productivity","efficiency","unemployment",
  "housing","rent","mortgages","construction","index","indices","exchange","currency",
  "dollar","euro","pound","oil","gas","coal","electricity","power",
  "water","food","wheat","grain","steel","copper","gold","silver",
  "cotton","timber","freight","shipping","passengers","inventory","inventories","stockpile"
]);

const EVENT_NOUN_SET = new Set([
  "election","campaign","crisis","summit","border","conflict","trial","crime","investigation",
  "arrest","charge","prison","justice","education","research","science","technology","treatment",
  "vaccine","medicine","surgery","disease","season","match","victory","championship","tournament",
  "protest","movement","demonstration","operation","deployment","mission","weather","storm",
  "drought","flood","disaster","history","tradition","heritage","ceremony","performance","concert",
  "festival","unrest","violence","wildfire","instability","epidemic","strike","blockade",
  "recession","disruption","fire","outbreak","failure","decline","collapse","delay","accident",
  "attack","heat","snowfall","wind","earthquake","eruption","avalanche"
]);

const SYSTEM_OBJECT_NOUN_SET = new Set([
  "system","country","district","network","stadium","climate","energy","environment","pollution",
  "forest","ocean","wildlife","resource","bridge","highway","airport","railway","station",
  "tunnel","harbor","terminal","office","building","project","museum","gallery","theater",
  "culture","studio","library","monument","planet","orbit","rocket","spacecraft","telescope",
  "weapon","missile","infrastructure","platform","software","database","server","algorithm",
  "device","processor","signal","channel","frequency","spectrum","antenna","receiver","transmitter",
  "module","campus","warehouse","shipment","cargo","delivery","language","symbol","pattern",
  "structure","method"
]);

/**
 * Returns the semantic category of a given noun.
 */
export function getNounCategory(noun: string): NounCategory {
  const w = noun.toLowerCase();
  if (AGENT_NOUN_SET.has(w)) return "AGENT";
  if (METRIC_NOUN_SET.has(w)) return "METRIC";
  if (DOCUMENT_NOUN_SET.has(w)) return "DOCUMENT";
  if (EVENT_NOUN_SET.has(w)) return "EVENT";
  if (SYSTEM_OBJECT_NOUN_SET.has(w)) return "SYSTEM_OBJECT";

  // Default fallback: proper nouns and unspecified entity nouns act as AGENT
  return "AGENT";
}

// Verb Category Affinity Sets for Semantic Match Scoring
const SPEECH_VERBS = new Set([
  "said","stated","reported","claimed","argued","suggested","warned","noted","added",
  "explained","described","demanded","urged","proposed","requested","recounted","asserted",
  "acknowledged","disclosed","pledged","voiced","insisted","reaffirmed","highlighted",
  "underlined","specified"
]);

const INFORMATIONAL_VERBS = new Set([
  "showed","indicated","revealed","confirmed","noted","explained","detailed","outlined",
  "highlighted","focused","addressed","covered","included","contained","published","released",
  "issued","presented","announced","approved","suggested"
]);

const METRIC_TREND_VERBS = new Set([
  "grew","rose","fell","declined","expanded","shrank","dropped","increased","reduced",
  "surged","recovered","stabilized","fluctuated","boosted","lowered","cut","gained","lost",
  "changed","varied","remained","continued","plunged","climbed","slipped","rebounded","soared",
  "dwindled","weakened","strengthened","accelerated","moderated","peaked","bottomed","plateaued"
]);

const EVENT_OCCURRENCE_VERBS = new Set([
  "began","started","ended","concluded","continued","persisted","escalated","unfolded",
  "occurred","loomed","spread","intensified","worsened","disrupted","affected","struck",
  "hit","halted","triggered","followed","threatened","caused"
]);

const SYSTEM_OPERATIONAL_VERBS = new Set([
  "operated","functioned","performed","worked","failed","expanded","improved","started",
  "connected","ran","processed","transmitted","generated","changed"
]);

const METRIC_ACTION_VERBS = new Set([
  "raised","lowered","increased","decreased","reduced","expanded","boosted","cut","gained",
  "lost","adjusted","amplified","curbed","curtailed","slashed","trimmed","augmented","capped",
  "doubled","elevated","enhanced","extended","halved","heightened","lifted","limited",
  "maximized","minimized","moderated","modified","multiplied","narrowed","optimized","restrained",
  "scaled","shortened","stabilized","stimulated","surpassed","tightened","tripled","widened",
  "yielded","balanced","eased","slowed","stalled","bounced","leveled","fluctuated","shifted",
  "plummeted","spiked","soared","slumped","tumbled","appreciated","broadened","collapsed",
  "contracted","corrected","depreciated","diminished","dipped","drifted","flattened","floated",
  "lessened","normalized","outpaced","rallied","receded","regressed","reset","resumed","reversed",
  "revived","settled","softened","stagnated","steepened","subsided","swelled","tapered",
  "accumulated","bounded","consolidated","dampened","faltered","lagged","lengthened","mounted",
  "overtook","paced","pivoted","poised","prospered","quickened","regained","relapsed","renewed",
  "retrenched","spurred","stiffened","swung","thrived","topped","trailed","trended","wavered",
  "faced","weathered","confronted","endured","experienced","sustained"
]);

const POLICY_DOCUMENT_VERBS = new Set([
  "adopted","approved","amended","enacted","implemented","introduced","issued","passed","proposed",
  "ratified","rejected","revised","signed","upheld","remained","required"
]);

const EFFECT_RATE_ADVERBS = new Set([
  "sharply","steadily","rapidly","gradually","significantly","modestly","slightly","dramatically",
  "quickly","slowly","noticeably","substantially","marginally","suddenly","steeply","precipitously",
  "markedly","considerably","tremendously","immensely","drastically","severely","acutely","intensely",
  "profoundly","deeply","greatly","hugely","massively","enormously","vastly","appreciably",
  "perceptibly","visibly","moderately","progressively","continuously","extensively","alarmingly"
]);

const METRIC_ONLY_VERBS = new Set([
  ...METRIC_ACTION_VERBS,
  "fell","grew","rose","declined","shrank","dropped","surged","recovered","fluctuated","plunged",
  "climbed","slipped","rebounded","soared","dwindled","weakened","strengthened","accelerated",
  "moderated","peaked","bottomed","plateaued"
]);

// Precomputed Static Combined Sets for Zero-Allocation Semantic Affinity and Candidate Filtering
const METRIC_ALLOWED_VERBS = new Set([...METRIC_TREND_VERBS, ...METRIC_ACTION_VERBS]);
const EVENT_ALLOWED_VERBS = new Set([...EVENT_OCCURRENCE_VERBS, ...METRIC_TREND_VERBS]);
const DOCUMENT_ALLOWED_VERBS = new Set([
  ...INFORMATIONAL_VERBS,
  ...SPEECH_VERBS,
  ...POLICY_DOCUMENT_VERBS
]);
const SYSTEM_OBJECT_ALLOWED_VERBS = new Set([
  ...SYSTEM_OPERATIONAL_VERBS,
  ...METRIC_TREND_VERBS,
  ...EVENT_OCCURRENCE_VERBS
]);

const INFORMATIONAL_OR_SPEECH_VERBS = new Set([...INFORMATIONAL_VERBS, ...SPEECH_VERBS]);
const AGENT_AFFINITY_VERBS = new Set([
  ...SPEECH_VERBS,
  ...INFORMATIONAL_VERBS,
  ...SYSTEM_OPERATIONAL_VERBS
]);

// Triggers that indicate the "R" slot is in a discourse-connector position (not a degree/rate position).
// When the preceding token is one of these, only genuine discourse markers are permitted.
const DISCOURSE_CONNECTOR_TRIGGERS = new Set([
  "after", "before", "during", "since", "while", "once", "until",
  "talks,", "negotiations,", "meetings,", "hearings,", "elections,", "discussions,"
]);

// Genuine discourse connectors — words that sensibly follow a subordinate clause comma.
const DISCOURSE_CONNECTOR_SET = new Set([
  "however", "meanwhile", "nevertheless", "nonetheless", "still", "instead",
  "also", "indeed", "similarly", "furthermore", "additionally", "otherwise",
  "rather", "likewise", "conversely", "ultimately", "consequently", "accordingly",
  "thus", "therefore", "hence", "besides", "moreover", "then", "further",
  "finally", "initially", "subsequently", "thereafter", "afterward",
  "alternatively", "eventually", "undoubtedly", "certainly", "decisively",
  "firstly", "secondly", "thirdly", "lastly", "incidentally", "admittedly"
]);

const SINGULAR_DETERMINERS = new Set([
  "a","an","another","each","every","its","one","this"
]);

const UNCOUNTABLE_NOUNS = new Set([
  "access","advice","assistance","baggage","behavior","clothing","damage","education","evidence",
  "equipment","finance","furniture","growth","hardware","homework","information","justice",
  "knowledge","laughter","machinery","music","news","pollution","rainfall","research","software",
  "traffic","transport","weather","work"
]);

const IRREGULAR_PLURAL_NOUNS = new Set([
  "children","men","people","police","women"
]);

const SINGULAR_NOUNS_ENDING_IN_S = new Set([
  "analysis","basis","business","campus","consensus","crisis","gas","glass","headquarters",
  "means","news","series","species","status"
]);

// Fast subject lookback scanning: checks prepositions without array allocations (.slice / .map)
// Capped at 10 tokens to avoid cross-clause contamination in long sentences.
function findContextSubject(context: string[]): string {
  const lookbackStart = Math.max(0, context.length - 10);
  for (let index = context.length - 1; index >= lookbackStart; index--) {
    const word = context[index].toLowerCase();
    if (
      AGENT_NOUN_SET.has(word) ||
      DOCUMENT_NOUN_SET.has(word) ||
      METRIC_NOUN_SET.has(word) ||
      EVENT_NOUN_SET.has(word) ||
      SYSTEM_OBJECT_NOUN_SET.has(word) ||
      POETRY_NOUN_SET.has(word)
    ) {
      let hasPrep = false;
      const start = Math.max(0, index - 4);
      for (let p = start; p < index; p++) {
        if (PREPOSITION_SET.has(context[p].toLowerCase())) {
          hasPrep = true;
          break;
        }
      }
      if (hasPrep) {
        continue;
      }
      return word;
    }
  }
  return "";
}

function isPluralNoun(noun: string): boolean {
  const word = noun.toLowerCase();
  if (IRREGULAR_PLURAL_NOUNS.has(word)) return true;
  if (SINGULAR_NOUNS_ENDING_IN_S.has(word)) return false;
  return /(?:s|ies|ves)$/.test(word) && !/(?:ss|us|is)$/.test(word);
}

function largestPowerOfTwoSubset(candidates: string[]): string[] {
  const len = candidates.length;
  // If already a power of two (e.g. 256), avoid redundant array slicing.
  if ((len & (len - 1)) === 0) return candidates;
  const length = 1 << (31 - Math.clz32(len));
  return candidates.slice(0, length);
}

/**
 * Narrows data-slot vocabularies using local grammar while keeping their size
 * a power of two so the encoder and decoder consume the same number of bits.
 */
export function getCompatibleCandidates(
  candidates: string[],
  context: string[],
  slotLabel: string,
  topic?: DomainTopic
): string[] {
  if (candidates.length < 2) return candidates;

  let compatible: string[] | undefined;

  if (slotLabel === "VP") {
    const subject = findContextSubject(context);
    if (subject) {
      const category = getNounCategory(subject);
      let allowedVerbs: Set<string> | undefined;
      if (category === "METRIC") {
        allowedVerbs = METRIC_ALLOWED_VERBS;
      } else if (category === "EVENT") {
        allowedVerbs = EVENT_ALLOWED_VERBS;
      } else if (category === "DOCUMENT") {
        allowedVerbs = DOCUMENT_ALLOWED_VERBS;
      } else if (category === "SYSTEM_OBJECT") {
        allowedVerbs = SYSTEM_OBJECT_ALLOWED_VERBS;
      } else if (category === "AGENT") {
        compatible = candidates.filter(word => !METRIC_ONLY_VERBS.has(word.toLowerCase()));
      }

      if (allowedVerbs) {
        compatible = candidates.filter(word => allowedVerbs.has(word.toLowerCase()));
      }
    }
  } else if (slotLabel === "N") {
    // Scan backward across the last 3 context words without slice(), reverse(), or closure allocations
    let hasSingularDeterminer = false;
    const start = Math.max(0, context.length - 3);
    for (let i = context.length - 1; i >= start; i--) {
      if (SINGULAR_DETERMINERS.has(context[i].toLowerCase())) {
        hasSingularDeterminer = true;
        break;
      }
    }
    if (hasSingularDeterminer) {
      compatible = candidates.filter(word =>
        !isPluralNoun(word) && !UNCOUNTABLE_NOUNS.has(word.toLowerCase())
      );
    }
  } else if (
    slotLabel === "R" &&
    METRIC_TREND_VERBS.has(context[context.length - 1]?.toLowerCase())
  ) {
    compatible = candidates.filter(word => EFFECT_RATE_ADVERBS.has(word.toLowerCase()));
  } else if (slotLabel === "R") {
    // When the immediately preceding token is a temporal/introductory preposition (after, before,
    // during, since) or a comma following such a clause, steer toward genuine discourse connectors
    // only. This prevents degree/location adverbs ("very", "here", "abroad") from appearing in the
    // discourse-marker position of Template 3: "After talks, [adv], the official...".
    const prevWord = context[context.length - 1]?.toLowerCase();
    if (DISCOURSE_CONNECTOR_TRIGGERS.has(prevWord)) {
      const discourseFiltered = candidates.filter(word => DISCOURSE_CONNECTOR_SET.has(word.toLowerCase()));
      if (discourseFiltered.length >= 2) {
        compatible = discourseFiltered;
      }
    }
  }

  // Performance optimization: When no grammar filtering applies, return candidates directly
  // if already a power of two, completely bypassing array spreads and slice allocations.
  if (!compatible) {
    return largestPowerOfTwoSubset(candidates);
  }

  if (compatible.length < 2) return largestPowerOfTwoSubset(candidates);
  return largestPowerOfTwoSubset(compatible);
}

const PREPOSITION_SET = new Set([
  "about", "above", "across", "after", "against", "along", "among", "around", "at",
  "before", "behind", "below", "beneath", "beside", "between", "beyond", "by",
  "despite", "during", "for", "from", "in", "into", "near", "of", "off", "on",
  "onto", "over", "past", "since", "through", "throughout", "to", "toward",
  "towards", "under", "until", "upon", "with", "within", "without"
]);

const POETRY_NOUN_SET = new Set([
  "moon", "river", "forest", "ocean", "wind", "rain", "snow", "cloud",
  "sky", "sea", "tree", "branch", "leaf", "flower", "bird", "stone",
  "mountain", "valley", "meadow", "shore", "lake", "stream", "shadow", "dawn",
  "dusk", "night", "star", "flame", "garden", "field", "silence", "season",
  "frost", "ember", "mist", "sunlight", "starlight", "comet", "desert", "island",
  "pathway", "horizon", "reflection", "echo", "whisper", "breeze", "storm", "twilight",
  "harbor", "cavern", "glade", "summit", "pine", "willow", "feather", "shell",
  "tide", "wave", "spark", "light", "haven", "clearing", "canopy", "solitude",
  "time", "memory", "dream", "music", "solace", "wonder", "heart", "spirit",
  "sorrow", "promise", "presence", "distance", "passage", "rhythm", "secret", "lullaby"
]);

const POETIC_EXPRESSIVE_VERBS = new Set([
  "whispered", "murmured", "spoke", "called", "sang", "echoed", "breathed", "waited",
  "faded", "flowed", "danced", "lingered", "glowed", "drifted", "shimmered", "shone",
  "rose", "fell", "awakened", "slumbered", "wandered", "slept", "rested", "bloomed"
]);

const FUNCTION_WORDS_SET = new Set([
  "the", "a", "an", "this", "that", "these", "those", "some", "any", "no", "one", "its", "each", "every", "another",
  "my", "our", "his", "her", "your", "their",
  "in", "of", "to", "for", "on", "with", "at", "by", "from", "into", "about", "after", "during", "between", "through",
  "across", "over", "under", "before", "since", "against", "around", "among", "within", "toward", "towards", "upon",
  "along", "beyond", "without", "despite", "until", "throughout", "above", "below", "beside", "beneath", "near",
  "and", "or", "but", "while", "as", "yet", "although", "because", "though", "whereas", "unless", "whether", "when",
  "where", "if",
  "it", "they", "them", "we", "us", "he", "him", "she", "i", "me", "you", "which", "who", "whom", "whose",
  "is", "was", "are", "were", "be", "been", "being", "has", "have", "had", "do", "does", "did", "can", "could", "will",
  "would", "shall", "should", "may", "might", "must", "became", "seemed", "appeared"
]);

// Common English Bigram Transitions (w1 -> Set/Map of w2 -> weight)
const BIGRAM_MAP: Record<string, Record<string, number>> = {
  report: { showed: 10, indicated: 10, revealed: 10, confirmed: 10, suggested: 9, detailed: 9, published: 8, released: 8 },
  market: { rose: 10, fell: 10, grew: 10, declined: 10, expanded: 9, dropped: 9, surged: 9, recovered: 9, faced: 8, weathered: 8 },
  nearly: { double: 10, triple: 10, twofold: 10, threefold: 9, fourfold: 8, tenfold: 8 },
  almost: { double: 10, triple: 9, twofold: 9, threefold: 8, half: 8 },
  rates: { rose: 10, fell: 10, increased: 9, dropped: 9, "50bps": 10, "100bps": 10, "25bps": 9, "75bps": 9, "200bps": 9, "500bps": 8, "250": 8, "500": 8 },
  faced: { pressure: 10, shortages: 9, opposition: 8, challenges: 8 },
  persistent: { pressure: 10, shortages: 9, concerns: 8, weakness: 8 },
  drafted: { guidelines: 10, proposal: 9, policy: 8, framework: 8 },
  approved: { crucial: 10, key: 9, major: 8 },
  crucial: { measures: 10, reforms: 9, guidelines: 8 },
  remained: { unresolved: 10, uncertain: 9, unclear: 8 },
  revised: { guidelines: 10, framework: 9, policy: 8 },
  economy: { grew: 10, expanded: 10, slowed: 9, recovered: 9, shrank: 8, declined: 8 },
  growth: { slowed: 10, accelerated: 10, continued: 9, remained: 8, dropped: 8 },
  // Agent nouns — each has a distinct primary verb set reflecting their real-world role
  president: { announced: 10, signed: 10, stated: 9, visited: 9, urged: 9, met: 8, warned: 8, addressed: 8 },
  government: { announced: 10, approved: 10, proposed: 9, launched: 9, confirmed: 8, passed: 8, adopted: 8 },
  police: { arrested: 10, detained: 10, investigated: 9, searched: 9, charged: 9, confirmed: 8, deployed: 8 },
  court: { ruled: 10, decided: 10, upheld: 9, dismissed: 9, rejected: 9, sentenced: 8, ordered: 8 },
  minister: { stated: 10, urged: 10, emphasized: 9, pledged: 9, confirmed: 8, promised: 8, defended: 8 },
  company: { launched: 10, acquired: 10, expanded: 9, reported: 9, announced: 9, released: 8, restructured: 8 },
  council: { approved: 10, adopted: 10, voted: 9, passed: 9, rejected: 9, met: 8, reviewed: 8 },
  parliament: { passed: 10, debated: 10, approved: 9, rejected: 9, voted: 9, convened: 8, adjourned: 8 },
  agency: { approved: 10, rejected: 10, issued: 9, investigated: 9, announced: 8, reported: 8, suspended: 8 },
  coalition: { backed: 10, supported: 10, approved: 9, criticized: 9, formed: 8, collapsed: 8, withdrew: 8 },
  ambassador: { met: 10, discussed: 10, confirmed: 9, stated: 9, departed: 8, presented: 8 },
  governor: { signed: 10, announced: 10, ordered: 9, proposed: 9, vetoed: 8, declared: 8 },
  senator: { proposed: 10, voted: 10, backed: 9, opposed: 9, introduced: 8, criticized: 8 },
  official: { confirmed: 10, stated: 10, announced: 9, denied: 9, revealed: 8, warned: 8 },
  leader: { met: 10, announced: 10, pledged: 9, urged: 9, confirmed: 8, signed: 8 },
  disease: { spread: 10, struck: 9, worsened: 9, affected: 8, persisted: 8 },
  storm: { struck: 10, approached: 9, caused: 9, damaged: 8, passed: 8 },
  drought: { worsened: 10, persisted: 10, spread: 9, affected: 9, intensified: 8 },
  conflict: { escalated: 10, intensified: 9, continued: 9, spread: 8, erupted: 8 },
  crisis: { worsened: 10, deepened: 10, escalated: 9, continued: 9, began: 8 },
  shortage: { persisted: 10, worsened: 9, continued: 9, eased: 8, deepened: 8 },
  election: { concluded: 10, took: 9, resulted: 9, began: 8, remained: 8 },
  trial: { concluded: 10, began: 10, resumed: 9, continued: 9, ended: 8 },
  survey: { showed: 10, revealed: 10, indicated: 9, found: 9, suggested: 8 },
  investigation: { revealed: 10, found: 10, concluded: 9, continued: 9, focused: 8 },
  policy: { changed: 10, required: 9, improved: 9, failed: 8, addressed: 8 },
  system: { failed: 10, operated: 9, improved: 9, expanded: 8, changed: 8 },
  database: { expanded: 10, updated: 9, stored: 8, grew: 8 },
  user: { created: 10, updated: 10, saved: 9, shared: 9, deleted: 8 },
  data: { showed: 10, indicated: 10, suggested: 9, revealed: 9 },
  article: { reported: 10, described: 10, highlighted: 9, discussed: 9 },
  note: { stated: 10, detailed: 10, included: 9, summarized: 9 },
  page: { contained: 10, displayed: 10, showed: 9, featured: 9 },
  wind: { blew: 10, whispered: 10, rose: 9, carried: 9, howled: 8 },
  star: { shone: 10, glowed: 10, sparkled: 9, faded: 8 },
  shadow: { fell: 10, lengthened: 10, danced: 9, vanished: 8 },
  rain: { fell: 10, washed: 9, poured: 9, stopped: 8 },
  sunlight: { warmed: 10, streamed: 10, filled: 9, faded: 8 },
  energy: { output: 10, prices: 10, supply: 9, demand: 9, market: 8, crisis: 8 },
  food: { prices: 10, supply: 10, production: 9, shortages: 9, market: 8 },
  consumer: { prices: 10, spending: 10, demand: 9, confidence: 9, goods: 8 },
  interest: { rates: 10, rate: 10 },
  central: { bank: 10, government: 8 },
  trade: { deficit: 10, surplus: 10, agreement: 9, policy: 9, volume: 8 },
  severe: { shortage: 10, drought: 10, crisis: 9, storm: 9, impact: 8 },
  talks: { stalled: 10, collapsed: 10, resumed: 9, continued: 9, remained: 9, ended: 8, concluded: 8 },
  negotiations: { stalled: 10, collapsed: 10, resumed: 9, continued: 9, broke: 8, concluded: 8 },
  proposal: { passed: 9, rejected: 10, approved: 10, accepted: 9 },
  reform: { backed: 10, approved: 9, passed: 9, proposed: 8 },
  hearings: { concluded: 10, began: 9, resumed: 9, continued: 8, ended: 8 },
  discussions: { stalled: 10, resumed: 9, continued: 9, concluded: 8 },
  meetings: { concluded: 10, began: 9, continued: 9, resumed: 8 },
  the: {
    major: 10, global: 10, national: 10, public: 10, new: 10, economic: 9,
    government: 10, president: 10, market: 10, company: 9, report: 9,
    court: 8, council: 8, economy: 9, system: 8, country: 9, election: 8,
    minister: 8, official: 8, leader: 8, conference: 8, committee: 8,
    agency: 9, coalition: 9, energy: 9, food: 9, central: 9,
    moon: 10, river: 10, silent: 9, quiet: 9, ancient: 9, luminous: 9,
    endless: 9, golden: 9, sacred: 9, gentle: 9, starlight: 9, twilight: 9
  },
  a: {
    new: 10, major: 10, significant: 9, key: 9, recent: 8, large: 8,
    statement: 9, report: 9, decision: 9, meeting: 8, agreement: 9,
    plan: 8, proposal: 8, campaign: 8, strategy: 8, solution: 8,
    gentle: 10, quiet: 10, luminous: 9, soft: 9, fragile: 9, silent: 9,
    solitary: 9, distant: 9, radiant: 9, serene: 9
  },
  // Filler-word bigrams: guide the first scored slot that follows fixed template words
  after: { talks: 10, negotiations: 10, meetings: 9, elections: 9, hearings: 9, the: 8, discussions: 8 },
  if: { the: 10, a: 9, some: 8, no: 8 },
  including: { some: 10, several: 9, a: 8, the: 8 },
  because: { the: 10, a: 9, some: 8, no: 8 },
  but: { the: 10, a: 9, some: 8, no: 8 },
  since: { the: 10, a: 9, talks: 8, negotiations: 8 },
  while: { the: 10, a: 9, some: 8, talks: 8 },
  as: { the: 10, a: 9, talks: 8, tensions: 8, prices: 8 },
  above: { the: 10, a: 9, each: 8, every: 8, her: 8, my: 8, our: 8, his: 8 },
  beside: { the: 10, a: 9, each: 8, every: 8, her: 8, my: 8, our: 8, his: 8 },
  beyond: { the: 10, a: 9, each: 8, every: 8, her: 8, my: 8, our: 8, his: 8 },
  beneath: { the: 10, a: 9, each: 8, every: 8, her: 8, my: 8, our: 8, his: 8 },
  through: { the: 10, a: 9, each: 8, every: 8, her: 8, my: 8, our: 8, his: 8 },
  within: { the: 10, a: 9, each: 8, every: 8, her: 8, my: 8, our: 8, his: 8 },
  quiet: {
    river: 10, flame: 10, solitude: 10, night: 9, stream: 9, breeze: 9,
    silence: 9, garden: 9, harbor: 8
  },
  silent: {
    night: 10, river: 10, shadow: 9, forest: 9, echo: 9, sky: 8
  },
  gentle: {
    breeze: 10, rain: 10, river: 10, whisper: 9, stream: 9, warmth: 9
  },
  luminous: {
    sky: 10, moon: 10, star: 9, radiance: 9, night: 9
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
  // Action adverbs preceding verbs in template 3 and 4
  strongly: { backed: 10, supported: 9, opposed: 9, criticized: 8, condemned: 8 },
  formally: { announced: 10, confirmed: 10, submitted: 9, approved: 9, adopted: 8 },
  quietly: { backed: 10, supported: 9, dropped: 9, shelved: 8, revised: 8 },
  openly: { criticized: 10, backed: 9, supported: 9, opposed: 8, condemned: 8 },
  eventually: { backed: 10, approved: 9, confirmed: 9, agreed: 8, withdrew: 8 },
  unanimously: { approved: 10, adopted: 10, backed: 9, rejected: 9, voted: 8 },
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
  // --- Institutional subject + verb ---
  "the government": { announced: 10, approved: 10, confirmed: 9, proposed: 9, launched: 8 },
  "the president": { announced: 10, stated: 9, signed: 9, visited: 8, met: 8 },
  "the court": { ruled: 10, decided: 10, upheld: 9, dismissed: 9, rejected: 8 },
  "the minister": { stated: 10, urged: 10, pledged: 9, confirmed: 9, emphasized: 8 },
  "the company": { launched: 10, acquired: 10, reported: 9, expanded: 9, announced: 8 },
  "the council": { approved: 10, adopted: 10, voted: 9, passed: 9, rejected: 8 },
  "the parliament": { passed: 10, debated: 10, approved: 9, rejected: 9, voted: 8 },
  "the agency": { approved: 10, rejected: 10, issued: 9, investigated: 9, announced: 8 },
  "the coalition": { backed: 10, supported: 10, approved: 9, criticized: 8, collapsed: 8 },
  "the police": { arrested: 10, detained: 10, investigated: 9, confirmed: 8, deployed: 8 },
  "the governor": { signed: 10, announced: 10, ordered: 9, proposed: 9, vetoed: 8 },
  "the senator": { proposed: 10, voted: 10, backed: 9, opposed: 9, introduced: 8 },
  "the official": { confirmed: 10, stated: 10, denied: 9, revealed: 9, warned: 8 },
  "the leader": { met: 10, announced: 10, pledged: 9, urged: 9, confirmed: 8 },
  "the ambassador": { met: 10, discussed: 10, confirmed: 9, presented: 8, departed: 8 },
  "the central": { bank: 10 },
  "central bank": { raised: 10, lowered: 10, kept: 9, cut: 9 },
  // --- Economic/metric subjects ---
  "interest rates": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "energy output": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "food prices": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "consumer prices": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "trade deficit": { widened: 10, narrowed: 10, grew: 9, shrank: 8 },
  "trade surplus": { narrowed: 10, widened: 9, grew: 9, shrank: 8 },
  // --- Crisis / event subjects ---
  "severe shortage": { persisted: 10, worsened: 9, continued: 9 },
  "the drought": { worsened: 10, persisted: 9, spread: 9, intensified: 8, affected: 8 },
  "the conflict": { escalated: 10, intensified: 10, continued: 9, spread: 8, erupted: 8 },
  "the crisis": { worsened: 10, deepened: 10, escalated: 9, continued: 8 },
  "a disease": { spread: 10, struck: 10, worsened: 9, affected: 9 },
  "the disease": { spread: 10, struck: 10, worsened: 9, affected: 9 },
  "a storm": { struck: 10, damaged: 9, passed: 8, caused: 8 },
  "the storm": { struck: 10, damaged: 9, passed: 8, caused: 8 },
  "the election": { concluded: 10, resulted: 9, began: 8, remained: 8 },
  "the trial": { concluded: 10, began: 10, resumed: 9, ended: 8 },
  // --- Talks / negotiation subjects (template 3, 9) ---
  "the talks": { stalled: 10, collapsed: 10, resumed: 9, continued: 9, remained: 9, ended: 8 },
  "after talks": { however: 10, nevertheless: 9, still: 8, meanwhile: 8 },
  "after negotiations": { however: 10, nevertheless: 9, still: 8, meanwhile: 8 },
  "after meetings": { however: 10, the: 9, officials: 8, leaders: 8 },
  "after hearings": { however: 10, the: 9, officials: 8, lawmakers: 8 },
  "after elections": { however: 10, the: 9, officials: 8, meanwhile: 8 },
  "talks remained": { unresolved: 10, deadlocked: 10, stalled: 9, tense: 8, inconclusive: 8 },
  "negotiations remained": { unresolved: 10, deadlocked: 10, stalled: 9, tense: 8 },
  "discussions remained": { unresolved: 10, deadlocked: 9, stalled: 9, ongoing: 8 },
  // --- Complement adjective trigrams (template 9: "X remained [adj]") ---
  "crisis remained": { unresolved: 10, acute: 9, severe: 9, critical: 8, ongoing: 8 },
  "conflict remained": { unresolved: 10, deadlocked: 9, ongoing: 9, severe: 8 },
  "situation remained": { unresolved: 10, tense: 10, uncertain: 9, critical: 8, fragile: 8 },
  "election remained": { contested: 10, undecided: 9, disputed: 8, uncertain: 8 },
  "remained unresolved": { as: 8, because: 8, while: 8 },
  // --- Document / report subjects ---
  "a survey": { showed: 10, revealed: 10, indicated: 9, suggested: 8 },
  "the survey": { showed: 10, revealed: 10, indicated: 9, suggested: 8 },
  "the report": { showed: 10, indicated: 10, revealed: 9, confirmed: 9 },
  "the policy": { changed: 10, improved: 9, required: 9, failed: 8, addressed: 8 },
  "the database": { expanded: 10, grew: 9, stored: 8 },
  "the article": { reported: 10, stated: 10, described: 9, highlighted: 9 },
  "the user": { saved: 10, created: 10, updated: 9, shared: 9 },
  "the note": { stated: 10, detailed: 10, showed: 9, explained: 9 },
  // --- Relative clause patterns (template 4: "which officials [adv] [verb]") ---
  "which officials": { publicly: 10, strongly: 9, openly: 9, recently: 8, formally: 8 },
  "which lawmakers": { publicly: 10, strongly: 9, recently: 9, formally: 8 },
  "which regulators": { formally: 10, publicly: 9, recently: 9, strongly: 8 },
  // --- Discourse adverb after introductory clause (template 3: "after X, [adv],") ---
  "talks however": { the: 10, officials: 9, both: 8, analysts: 8 },
  "negotiations however": { the: 10, officials: 9, both: 8, analysts: 8 },
  // --- Common prep + determiner patterns ---
  "in a": { recent: 10, major: 9, statement: 8, report: 8, meeting: 8 },
  "according to": { reports: 10, officials: 9, sources: 9, experts: 8, data: 8 },
  "a new": { policy: 10, report: 9, study: 9, project: 9, initiative: 8, system: 8 },
  "a major": { step: 10, breakthrough: 10, agreement: 9, report: 9, summit: 8 },
  "announced a": { new: 10, major: 10, plan: 9, agreement: 9, policy: 8 },
  "confirmed the": { news: 10, report: 10, decision: 9, appointment: 8, agreement: 8 },
  "led to": { a: 10, widespread: 8, significant: 8, major: 8, increased: 7 },
  "focused on": { the: 10, economic: 8, national: 8, future: 8, building: 7 },
  // --- Poetry subjects ---
  "the moon": { slept: 10, glowed: 10, rose: 9, shone: 9, drifted: 8 },
  "the river": { flowed: 10, danced: 9, shimmered: 9, lingered: 8 },
  "a gentle": { breeze: 10, river: 10, rain: 9, whisper: 9 },
  "a quiet": { flame: 10, silence: 10, river: 9, night: 9 },
  "the wind": { whispered: 10, blew: 10, rose: 9, howled: 8 },
};

// Common English 4-Gram Transitions ("w1 w2 w3" -> Record<w4, weight>)
const FOURGRAM_MAP: Record<string, Record<string, number>> = {
  "the prime minister": { announced: 10, confirmed: 10, stated: 9, visited: 8 },
  "the secretary of": { state: 10, defense: 10, treasury: 9, energy: 8 },
  "according to the": { report: 10, official: 9, minister: 8, president: 8 },
  "a spokesman for": { the: 10, government: 9, company: 8, president: 8 },
  "in a recent": { report: 10, statement: 10, interview: 9, speech: 8 },
  "the united states": { announced: 10, signed: 9, warned: 8, supported: 8 },
  "in a public": { statement: 10, report: 10, interview: 9, speech: 9 },
  "an overnight military": { operation: 10, assault: 10, action: 9, strike: 9 },
  // Template 3: "after [event], [adv], the [subject] ..."
  "after talks however": { the: 10, officials: 9, analysts: 8, both: 8 },
  "after negotiations however": { the: 10, officials: 9, analysts: 8 },
  "after meetings however": { the: 10, officials: 9, leaders: 8 },
  // Template 4: "the [antecedent], which [subjects] [adv] [verb], ..."
  "which officials publicly": { criticized: 10, supported: 9, backed: 9, endorsed: 8 },
  "which officials strongly": { backed: 10, opposed: 9, criticized: 9, supported: 8 },
  "which officials formally": { approved: 10, rejected: 9, endorsed: 9, submitted: 8 },
  "which lawmakers publicly": { criticized: 10, backed: 9, supported: 9, opposed: 8 },
  "which regulators formally": { approved: 10, rejected: 9, endorsed: 8, adopted: 8 },
  // Template 7: "Johnson said that the [adj] [subject] ..."
  "said that the": { central: 10, major: 9, national: 9, new: 8, economic: 8 },
  "confirmed that the": { central: 10, major: 9, national: 9, new: 8, economic: 8 },
  // Template 9: "the [subjects], including some [subjects], ..."
  "including some delegates": { requested: 10, proposed: 9, submitted: 9, demanded: 8 },
  "including some officials": { requested: 10, proposed: 9, confirmed: 8, submitted: 8 },
  "including some lawmakers": { backed: 10, opposed: 9, proposed: 9, voted: 8 },
  // Complement adjective in "... because the [event] remained [adj]"
  "because the talks": { remained: 10, stalled: 9, collapsed: 8, broke: 8 },
  "because the crisis": { worsened: 10, deepened: 9, persisted: 9, escalated: 8 },
  "because the conflict": { escalated: 10, intensified: 9, persisted: 8, continued: 8 },
  "because the election": { remained: 10, concluded: 8, resulted: 8 },
  "the talks remained": { unresolved: 10, deadlocked: 10, stalled: 9, tense: 8 },
  "the crisis remained": { unresolved: 10, acute: 9, severe: 9, critical: 8 },
  "the conflict remained": { unresolved: 10, deadlocked: 9, ongoing: 9, severe: 8 },
  "the election remained": { contested: 10, undecided: 9, disputed: 9, uncertain: 8 },
  "the situation remained": { uncertain: 10, tense: 10, fragile: 9, unresolved: 9 },
};

// Common English 5-Gram Transitions ("w1 w2 w3 w4" -> Record<w5, weight>)
const FIVEGRAM_MAP: Record<string, Record<string, number>> = {
  "stated tuesday in a": { public: 10, recent: 10, official: 9, brief: 8 },
  "stated on tuesday in": { a: 10, washington: 8 },
  "tuesday in a public": { statement: 10, report: 10, interview: 9 },
  "overnight military assault on": { the: 10 },
  "was shared ahead of": { time: 10 },
  "no intelligence was shared": { ahead: 10, before: 9 }
};

interface NGramContextState {
  map5?: Record<string, number>;
  map4?: Record<string, number>;
  map3?: Record<string, number>;
  map2?: Record<string, number>;
  affinityBoostSet?: Set<string>;
  affinityBoostScore: number;
  penalizeSpeechVerbs: boolean;
  topicWordSet?: Set<string>;
  nonFunctionContextSet?: Set<string>;
}

// Pre-resolves invariant context properties (N-gram lookup sub-maps, semantic affinity targets,
// topic word sets, and non-function context words) once per slot evaluation.
function prepareNGramContext(context: string[], topic?: DomainTopic): NGramContextState {
  const len = context.length;
  const w1 = len >= 1 ? context[len - 1].toLowerCase() : "";
  const w2 = len >= 2 ? context[len - 2].toLowerCase() : "";
  const w3 = len >= 3 ? context[len - 3].toLowerCase() : "";
  const w4 = len >= 4 ? context[len - 4].toLowerCase() : "";

  const map5 = (w1 && w2 && w3 && w4) ? FIVEGRAM_MAP[`${w4} ${w3} ${w2} ${w1}`] : undefined;
  const map4 = (w1 && w2 && w3) ? FOURGRAM_MAP[`${w3} ${w2} ${w1}`] : undefined;
  const map3 = (w1 && w2) ? TRIGRAM_MAP[`${w2} ${w1}`] : undefined;
  const map2 = w1 ? BIGRAM_MAP[w1] : undefined;

  const subjectNoun = findContextSubject(context);
  let affinityBoostSet: Set<string> | undefined;
  let affinityBoostScore = 0;
  let penalizeSpeechVerbs = false;

  if (subjectNoun) {
    if (POETRY_NOUN_SET.has(subjectNoun)) {
      affinityBoostSet = POETIC_EXPRESSIVE_VERBS;
      affinityBoostScore = 50;
      penalizeSpeechVerbs = true;
    } else {
      const subjectCat = getNounCategory(subjectNoun);
      if (subjectCat === "EVENT" || subjectCat === "METRIC") {
        affinityBoostSet = EVENT_ALLOWED_VERBS;
        affinityBoostScore = 50;
        penalizeSpeechVerbs = true;
      } else if (subjectCat === "DOCUMENT") {
        affinityBoostSet = INFORMATIONAL_OR_SPEECH_VERBS;
        affinityBoostScore = 50;
      } else if (subjectCat === "SYSTEM_OBJECT") {
        affinityBoostSet = SYSTEM_OBJECT_ALLOWED_VERBS;
        affinityBoostScore = 50;
        penalizeSpeechVerbs = true;
      } else if (subjectCat === "AGENT") {
        affinityBoostSet = AGENT_AFFINITY_VERBS;
        affinityBoostScore = 30;
      }
    }
  }

  const topicWordSet = (topic && TOPIC_WORD_SETS[topic]) ? TOPIC_WORD_SETS[topic] : undefined;

  // Filter context for non-function words upfront once per slot rather than running
  // FUNCTION_WORDS_SET.has lookups across hundreds of candidate words inside the inner loop.
  let nonFunctionContextSet: Set<string> | undefined;
  for (let i = 0; i < len; i++) {
    const word = context[i].toLowerCase();
    if (!FUNCTION_WORDS_SET.has(word)) {
      if (!nonFunctionContextSet) nonFunctionContextSet = new Set<string>();
      nonFunctionContextSet.add(word);
    }
  }

  return {
    map5,
    map4,
    map3,
    map2,
    affinityBoostSet,
    affinityBoostScore,
    penalizeSpeechVerbs,
    topicWordSet,
    nonFunctionContextSet
  };
}

// Fast scoring of a normalized candidate using pre-resolved context lookups
function scoreCandidateWithContext(w: string, ctx: NGramContextState): number {
  let score = 0;

  // 0. 5-Gram Score (weight = 10000)
  if (ctx.map5 && ctx.map5[w]) {
    score += 10000 * ctx.map5[w];
  }

  // 1. 4-Gram Score (weight = 1000)
  if (ctx.map4 && ctx.map4[w]) {
    score += 1000 * ctx.map4[w];
  }

  // 2. 3-Gram Score (weight = 100)
  if (ctx.map3 && ctx.map3[w]) {
    score += 100 * ctx.map3[w];
  }

  // 3. 2-Gram Score (weight = 10)
  if (ctx.map2 && ctx.map2[w]) {
    score += 10 * ctx.map2[w];
  }

  // 4. Unigram Naturalness Score (weight = 1)
  if (w.length >= 2 && w.length <= 12) {
    score += 1;
  }

  // 5. Pre-resolved Noun-Verb Semantic Affinity Scoring
  // Eliminates 6-branch category cascading and multi-Set testing per candidate.
  if (ctx.affinityBoostSet && ctx.affinityBoostSet.has(w)) {
    score += ctx.affinityBoostScore;
  } else if (ctx.penalizeSpeechVerbs && SPEECH_VERBS.has(w)) {
    score -= 200;
  }

  // 6. Topic Domain Score Boost
  if (ctx.topicWordSet && ctx.topicWordSet.has(w)) {
    score += 100;
  }

  // 7. Repetition penalty: non-function words are pre-filtered into nonFunctionContextSet,
  // bypassing secondary FUNCTION_WORDS_SET lookups for all candidates.
  // Topic-relevant words receive a softer penalty (-150) since they are contextually appropriate
  // even when they recur; non-topic repeated content words take the full penalty (-500).
  if (ctx.nonFunctionContextSet && ctx.nonFunctionContextSet.has(w)) {
    const isTopicWord = ctx.topicWordSet && ctx.topicWordSet.has(w);
    score -= isTopicWord ? 150 : 500;
  }

  return score;
}

/**
 * Calculates 1-5 gram language model score for a candidate word given prior context words.
 */
export function calculateNGramScore(candidate: string, context: string[], topic?: DomainTopic): number {
  const ctx = prepareNGramContext(context, topic);
  return scoreCandidateWithContext(candidate.toLowerCase(), ctx);
}

/**
 * Deterministically ranks candidate words for a slot using 1-4 gram context scoring.
 * Words with higher N-gram scores appear first. Ties are broken by original index / alphabetical order.
 *
 * Performance optimization: Context invariants (N-gram sub-maps, subject noun category, topic set,
 * and context word set) are resolved once per slot rather than re-computed for all candidates.
 */
export function rankCandidates(candidates: string[], context: string[], topic?: DomainTopic): string[] {
  if (!candidates || candidates.length <= 1) {
    return candidates ? [...candidates] : [];
  }

  const ctx = prepareNGramContext(context, topic);
  const len = candidates.length;

  // Performance optimization: Pack negated score and original index into a single Float64Array
  // and sort with native TypedArray.prototype.sort() WITHOUT a JavaScript comparator callback.
  //
  // Why this is faster:
  // 1. Invoking a JS comparator callback in TypedArrayMergeSort triggers ~1,800 function calls per slot
  //    (~180,000 function calls per message), accounting for ~26.5% of total V8 execution time.
  // 2. Calling `packed.sort()` without arguments runs entirely in native C++ with zero JS callback overhead.
  // 3. For score range [-1000, 120000] and index [0, 65535], packed value (-score * 65536 + i) has magnitude
  //    <= 7.8e9, which fits with exact precision in IEEE 754 Float64 (exact up to 9.007e15).
  // 4. Higher scores produce smaller (more negative) values, sorting first in ascending order.
  //    Tied scores resolve by original index i (smaller index sorts first), guaranteeing identical deterministic tie-breaking.
  // 5. Consolidates 2 separate Int32Array allocations (scores + indices) into 1 Float64Array and removes 1 loop.
  const packed = new Float64Array(len);
  for (let i = 0; i < len; i++) {
    const score = scoreCandidateWithContext(candidates[i].toLowerCase(), ctx);
    packed[i] = -score * 65536 + i;
  }

  // Pure native numerical sort in C++ without JavaScript comparator callback overhead
  packed.sort();

  const result = new Array<string>(len);
  for (let i = 0; i < len; i++) {
    const origIndex = ((packed[i] % 65536) + 65536) % 65536;
    result[i] = candidates[origIndex];
  }

  return result;
}

/**
 * 1-to-1 bijective mapping between bit val (0..2^bitCount - 1) and candidate rank (0..2^bitCount - 1).
 * Guarantees zero bit collisions by enforcing candidate set size N >= 2^bitCount.
 */
export function valToRank(val: number, bitCount: number, N: number): number {
  if (bitCount <= 0) return 0;
  const maxCapacity = 1 << bitCount;
  if (N < maxCapacity) {
    throw new Error(`Candidate count N (${N}) is less than bit capacity 2^bitCount (${maxCapacity}).`);
  }
  if (val < 0 || val >= maxCapacity) {
    throw new Error(`Value ${val} out of bounds for bitCount ${bitCount} (valid range: 0..${maxCapacity - 1}).`);
  }
  return val;
}

export function rankToVal(rank: number, bitCount: number, N: number): number {
  if (bitCount <= 0) return 0;
  const maxCapacity = 1 << bitCount;
  if (N < maxCapacity) {
    throw new Error(`Candidate count N (${N}) is less than bit capacity 2^bitCount (${maxCapacity}).`);
  }
  if (rank < 0 || rank >= maxCapacity) {
    throw new Error(`Rank ${rank} out of bounds for bitCount ${bitCount} (valid range: 0..${maxCapacity - 1}).`);
  }
  return rank;
}
