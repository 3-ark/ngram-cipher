/**
 * 1-5 Gram N-Gram Language Model Calculation Engine
 */

export type NounCategory = "AGENT" | "DOCUMENT" | "METRIC" | "EVENT" | "SYSTEM_OBJECT";

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
  "retrenched","spurred","stiffened","swung","thrived","topped","trailed","trended","wavered"
]);

const POLICY_DOCUMENT_VERBS = new Set([
  "adopted","approved","amended","enacted","implemented","introduced","issued","passed","proposed",
  "ratified","rejected","revised","signed","upheld"
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

function findContextSubject(context: string[]): string {
  for (let index = context.length - 1; index >= 0; index--) {
    const word = context[index].toLowerCase();
    if (
      AGENT_NOUN_SET.has(word) ||
      DOCUMENT_NOUN_SET.has(word) ||
      METRIC_NOUN_SET.has(word) ||
      EVENT_NOUN_SET.has(word) ||
      SYSTEM_OBJECT_NOUN_SET.has(word) ||
      POETRY_NOUN_SET.has(word)
    ) {
      const previousWords = context.slice(Math.max(0, index - 4), index)
        .map(previous => previous.toLowerCase());
      if (previousWords.some(previous => PREPOSITION_SET.has(previous))) {
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
  const length = 2 ** Math.floor(Math.log2(candidates.length));
  return candidates.slice(0, length);
}

/**
 * Narrows data-slot vocabularies using local grammar while keeping their size
 * a power of two so the encoder and decoder consume the same number of bits.
 */
export function getCompatibleCandidates(
  candidates: string[],
  context: string[],
  slotLabel: string
): string[] {
  if (candidates.length < 2) return [...candidates];

  let compatible: string[] | undefined;

  if (slotLabel === "VP") {
    const subject = findContextSubject(context);
    if (subject) {
      const category = getNounCategory(subject);
      let allowedVerbs: Set<string> | undefined;
      if (category === "METRIC") {
        allowedVerbs = new Set([...METRIC_TREND_VERBS, ...METRIC_ACTION_VERBS]);
      } else if (category === "EVENT") {
        allowedVerbs = new Set([...EVENT_OCCURRENCE_VERBS, ...METRIC_TREND_VERBS]);
      } else if (category === "DOCUMENT") {
        allowedVerbs = new Set([
          ...INFORMATIONAL_VERBS,
          ...SPEECH_VERBS,
          ...POLICY_DOCUMENT_VERBS
        ]);
      } else if (category === "SYSTEM_OBJECT") {
        allowedVerbs = new Set([
          ...SYSTEM_OPERATIONAL_VERBS,
          ...METRIC_TREND_VERBS,
          ...EVENT_OCCURRENCE_VERBS
        ]);
      } else if (category === "AGENT") {
        compatible = candidates.filter(word => !METRIC_ONLY_VERBS.has(word.toLowerCase()));
      }

      if (allowedVerbs) {
        compatible = candidates.filter(word => allowedVerbs.has(word.toLowerCase()));
      }
    }
  } else if (slotLabel === "N") {
    const recentDeterminer = context.slice(-3).reverse()
      .find(word => SINGULAR_DETERMINERS.has(word.toLowerCase()));
    if (recentDeterminer) {
      compatible = candidates.filter(word =>
        !isPluralNoun(word) && !UNCOUNTABLE_NOUNS.has(word.toLowerCase())
      );
    }
  } else if (
    slotLabel === "R" &&
    METRIC_TREND_VERBS.has(context[context.length - 1]?.toLowerCase())
  ) {
    compatible = candidates.filter(word => EFFECT_RATE_ADVERBS.has(word.toLowerCase()));
  }

  if (!compatible || compatible.length < 2) return [...candidates];
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
  market: { rose: 10, fell: 10, grew: 10, declined: 10, expanded: 9, dropped: 9, surged: 9, recovered: 9 },
  economy: { grew: 10, expanded: 10, slowed: 9, recovered: 9, shrank: 8, declined: 8 },
  growth: { slowed: 10, accelerated: 10, continued: 9, remained: 8, dropped: 8 },
  president: { announced: 10, stated: 10, signed: 9, visited: 9, urged: 9, met: 8, warned: 8 },
  government: { announced: 10, approved: 10, confirmed: 9, proposed: 9, launched: 9, passed: 8 },
  police: { arrested: 10, investigated: 10, searched: 9, detained: 9, confirmed: 8, reported: 8 },
  court: { ruled: 10, decided: 10, rejected: 9, confirmed: 9, dismissed: 8, upheld: 8 },
  minister: { stated: 10, confirmed: 10, urged: 9, emphasized: 9, promised: 8, announced: 8 },
  company: { announced: 10, reported: 10, launched: 9, expanded: 9, acquired: 8, released: 8 },
  council: { approved: 10, adopted: 9, passed: 9, met: 8, reviewed: 8 },
  disease: { spread: 10, struck: 9, worsened: 9, affected: 8, persisted: 8 },
  storm: { struck: 10, approached: 9, caused: 9, damaged: 8, passed: 8 },
  crisis: { worsened: 10, deepened: 10, escalated: 9, continued: 9, began: 8 },
  survey: { showed: 10, revealed: 10, indicated: 9, found: 9, suggested: 8 },
  investigation: { revealed: 10, found: 10, continued: 9, focused: 8, concluded: 8 },
  policy: { changed: 10, required: 9, improved: 9, failed: 8 },
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
  shortage: { persisted: 10, worsened: 9, continued: 9, eased: 8 },
  talks: { remained: 10, continued: 9, resumed: 8, ended: 8 },
  proposal: { passed: 9, rejected: 10, approved: 10, accepted: 9 },
  reform: { backed: 10, approved: 9, passed: 9, proposed: 8 },
  rates: { rose: 10, fell: 10, increased: 9, dropped: 9 },
  agency: { approved: 10, rejected: 10, announced: 9, reported: 9 },
  coalition: { backed: 10, approved: 9, criticized: 8, formed: 8 },
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
  "the agency": { approved: 10, rejected: 10, announced: 9, reported: 9 },
  "the coalition": { backed: 10, approved: 9, criticized: 8, formed: 8 },
  "the central": { bank: 10 },
  "central bank": { raised: 10, lowered: 10, kept: 9, cut: 9 },
  "interest rates": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "energy output": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "food prices": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "consumer prices": { rose: 10, fell: 10, increased: 9, dropped: 9 },
  "severe shortage": { persisted: 10, worsened: 9, continued: 9 },
  "the talks": { remained: 10, continued: 9, ended: 8 },
  "remained unresolved": { as: 8, because: 8, while: 8 },
  "in a": { recent: 10, major: 9, statement: 8, report: 8, meeting: 8 },
  "according to": { reports: 10, officials: 9, sources: 9, experts: 8, data: 8 },
  "a new": { policy: 10, report: 9, study: 9, project: 9, initiative: 8, system: 8 },
  "a major": { step: 10, breakthrough: 10, agreement: 9, report: 9, summit: 8 },
  "announced a": { new: 10, major: 10, plan: 9, agreement: 9, policy: 8 },
  "confirmed the": { news: 10, report: 10, decision: 9, appointment: 8, agreement: 8 },
  "led to": { a: 10, widespread: 8, significant: 8, major: 8, increased: 7 },
  "focused on": { the: 10, economic: 8, national: 8, future: 8, building: 7 },
  "the moon": { slept: 10, glowed: 10, rose: 9, shone: 9, drifted: 8 },
  "the river": { flowed: 10, danced: 9, shimmered: 9, lingered: 8 },
  "a gentle": { breeze: 10, river: 10, rain: 9, whisper: 9 },
  "a quiet": { flame: 10, silence: 10, river: 9, night: 9 },
  "a disease": { spread: 10, struck: 10, worsened: 9, affected: 9 },
  "the disease": { spread: 10, struck: 10, worsened: 9, affected: 9 },
  "a storm": { struck: 10, damaged: 9, passed: 8, caused: 8 },
  "the storm": { struck: 10, damaged: 9, passed: 8, caused: 8 },
  "the crisis": { worsened: 10, deepened: 10, escalated: 9, continued: 8 },
  "a survey": { showed: 10, revealed: 10, indicated: 9, suggested: 8 },
  "the survey": { showed: 10, revealed: 10, indicated: 9, suggested: 8 },
  "the report": { showed: 10, indicated: 10, revealed: 9, confirmed: 9 },
  "the policy": { changed: 10, improved: 9, required: 9, failed: 8 },
  "the database": { expanded: 10, grew: 9, stored: 8 },
  "the article": { reported: 10, stated: 10, described: 9, highlighted: 9 },
  "the user": { saved: 10, created: 10, updated: 9, shared: 9 },
  "the note": { stated: 10, detailed: 10, showed: 9, explained: 9 },
  "the wind": { whispered: 10, blew: 10, rose: 9, howled: 8 }
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
  "an overnight military": { operation: 10, assault: 10, action: 9, strike: 9 }
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

/**
 * Calculates 1-5 gram language model score for a candidate word given prior context words.
 */
export function calculateNGramScore(candidate: string, context: string[]): number {
  const w = candidate.toLowerCase();
  let score = 0;

  const len = context.length;
  const w1 = len >= 1 ? context[len - 1].toLowerCase() : "";
  const w2 = len >= 2 ? context[len - 2].toLowerCase() : "";
  const w3 = len >= 3 ? context[len - 3].toLowerCase() : "";
  const w4 = len >= 4 ? context[len - 4].toLowerCase() : "";

  // 0. 5-Gram Score (weight = 10000)
  if (w1 && w2 && w3 && w4) {
    const key5 = `${w4} ${w3} ${w2} ${w1}`;
    const map5 = FIVEGRAM_MAP[key5];
    if (map5 && map5[w]) {
      score += 10000 * map5[w];
    }
  }

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
  }

  // 3. 2-Gram Score (weight = 10)
  if (w1) {
    const map2 = BIGRAM_MAP[w1];
    if (map2 && map2[w]) {
      score += 10 * map2[w];
    }
  }

  // 4. Unigram Naturalness Score (weight = 1)
  if (w.length >= 2 && w.length <= 12) {
    score += 1;
  }

  // 5. Noun-Verb Semantic Affinity Scoring:
  // Identify preceding subject noun in context and score verb candidate compatibility
  const subjectNoun = findContextSubject(context);

  if (subjectNoun) {
    const isPoeticNoun = POETRY_NOUN_SET.has(subjectNoun);
    const cat = getNounCategory(subjectNoun);
    if (isPoeticNoun) {
      if (POETIC_EXPRESSIVE_VERBS.has(w)) {
        score += 50;
      } else if (SPEECH_VERBS.has(w)) {
        score -= 200;
      }
    } else if (cat === "EVENT") {
      if (EVENT_OCCURRENCE_VERBS.has(w) || METRIC_TREND_VERBS.has(w)) {
        score += 50;
      } else if (SPEECH_VERBS.has(w)) {
        score -= 200;
      }
    } else if (cat === "METRIC") {
      if (METRIC_TREND_VERBS.has(w) || EVENT_OCCURRENCE_VERBS.has(w)) {
        score += 50;
      } else if (SPEECH_VERBS.has(w)) {
        score -= 200;
      }
    } else if (cat === "DOCUMENT") {
      if (INFORMATIONAL_VERBS.has(w) || SPEECH_VERBS.has(w)) {
        score += 50;
      }
    } else if (cat === "SYSTEM_OBJECT") {
      if (SYSTEM_OPERATIONAL_VERBS.has(w) || METRIC_TREND_VERBS.has(w) || EVENT_OCCURRENCE_VERBS.has(w)) {
        score += 50;
      } else if (SPEECH_VERBS.has(w)) {
        score -= 200;
      }
    } else if (cat === "AGENT") {
      if (SPEECH_VERBS.has(w) || INFORMATIONAL_VERBS.has(w) || SYSTEM_OPERATIONAL_VERBS.has(w)) {
        score += 30;
      }
    }
  }

  // 6. Repetition penalty: penalize repeating non-function words already present in sentence context
  if (context.some(c => c.toLowerCase() === w) && !FUNCTION_WORDS_SET.has(w)) {
    score -= 500;
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
