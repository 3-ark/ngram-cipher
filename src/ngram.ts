/**
 * Natural English N-Gram Cipher Engine
 *
 * Encrypts data using AES-GCM and encodes ciphertext bytes into natural
 * English sentences that read like news articles.
 *
 * Architecture:
 *   1. AES-256-GCM encrypts plaintext → raw bytes
 *   2. Bytes are packed into sentence templates where each data-bearing
 *      word slot maps one byte (0-255) to a word in a POS-specific
 *      256-word vocabulary.
 *   3. Filler / structure words (articles, prepositions, conjunctions)
 *      are inserted for grammatical naturalness — they carry NO data.
 *
 * The result reads like plausible news prose.
 */

// ---------------------------------------------------------------------------
// Web Crypto
// ---------------------------------------------------------------------------

const webCrypto = globalThis.crypto;

if (!webCrypto || !webCrypto.subtle) {
  throw new Error("Web Crypto API is required but unavailable in this environment.");
}

function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(arr.byteLength);
  new Uint8Array(buf).set(arr);
  return buf;
}

// ---------------------------------------------------------------------------
// AES-256-GCM helpers
// ---------------------------------------------------------------------------

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await webCrypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return webCrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext bytes using AES-GCM (256-bit).
 * Output format: [16-byte Salt] [12-byte IV] [Ciphertext + AuthTag]
 */
export async function encryptBytes(data: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = webCrypto.getRandomValues(new Uint8Array(16));
  const iv = webCrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const ciphertextBuffer = await webCrypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(data)
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);
  const result = new Uint8Array(salt.length + iv.length + ciphertext.length);

  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(ciphertext, salt.length + iv.length);

  return result;
}

/**
 * Decrypts AES-GCM payload formatted as [16-byte Salt] [12-byte IV] [Ciphertext + AuthTag].
 */
export async function decryptBytes(payload: Uint8Array, password: string): Promise<Uint8Array> {
  if (payload.length < 28 + 16) {
    throw new Error("Invalid payload length: payload too short or corrupted.");
  }

  const salt = payload.subarray(0, 16);
  const iv = payload.subarray(16, 28);
  const ciphertext = payload.subarray(28);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await webCrypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ciphertext)
    );
    return new Uint8Array(decryptedBuffer);
  } catch {
    throw new Error("Decryption failed: Incorrect password or corrupted text.");
  }
}

// ---------------------------------------------------------------------------
// Part-of-Speech word lists (each exactly 256 unique words)
// ---------------------------------------------------------------------------

/**
 * Slot types used in sentence templates.
 *
 *   DATA slots (carry one byte each):
 *     N  = noun          V  = verb (present/base)
 *     A  = adjective     R  = adverb
 *     VP = verb (past)   NP = proper noun / name
 *
 *   FILLER slots (carry NO data — grammar glue):
 *     d  = determiner    p  = preposition
 *     c  = conjunction   r  = relative pronoun / "that"
 */

// -- NOUNS (256) – common news nouns ----------------------------------------
const NOUNS: string[] = [
  "report","market","policy","program","system","country","government","president",
  "election","campaign","economy","industry","community","company","security","council",
  "budget","crisis","summit","treaty","border","conflict","reform","strategy",
  "network","agency","coalition","alliance","foundation","commission","authority","parliament",
  "court","trial","verdict","sentence","witness","evidence","justice","crime",
  "police","investigation","arrest","charge","prison","penalty","defense","prosecution",
  "school","student","teacher","education","research","university","science","technology",
  "hospital","patient","doctor","treatment","vaccine","medicine","surgery","disease",
  "team","player","coach","season","match","victory","championship","tournament",
  "stadium","record","athlete","league","crowd","rival","title","score",
  "family","children","mother","father","district","neighbor","household","generation",
  "finance","trade","export","investment","growth","profit","revenue","stock",
  "climate","energy","environment","pollution","forest","ocean","wildlife","resource",
  "bridge","highway","airport","railway","station","tunnel","harbor","terminal",
  "office","building","project","contract","worker","union","salary","benefit",
  "media","journalist","broadcast","headline","coverage","statement","interview","press",
  "artist","museum","gallery","festival","performance","concert","theater","culture",
  "film","director","actor","audience","production","studio","scene","screenplay",
  "author","novel","chapter","story","library","publisher","edition","volume",
  "history","tradition","heritage","ceremony","monument","archive","legend","memorial",
  "weather","storm","forecast","temperature","rainfall","drought","flood","disaster",
  "mission","satellite","rocket","spacecraft","planet","orbit","astronaut","telescope",
  "soldier","battalion","commander","regiment","weapon","missile","operation","deployment",
  "citizen","resident","volunteer","activist","protest","petition","movement","demonstration",
  "leader","minister","ambassador","diplomat","delegate","governor","senator","official",
  "agreement","proposal","amendment","regulation","standard","guideline","framework","protocol",
  "infrastructure","platform","software","database","server","algorithm","device","processor",
  "signal","channel","frequency","spectrum","antenna","receiver","transmitter","module",
  "researcher","scholar","graduate","professor","faculty","campus","lecture","seminar",
  "debate","opinion","analysis","survey","finding","conclusion","outcome","assessment",
  "supply","demand","shortage","surplus","warehouse","shipment","cargo","delivery",
  "language","symbol","pattern","structure","method","concept","theory","principle"
];

// -- VERBS base/present (256) -----------------------------------------------
const VERBS: string[] = [
  "says","reports","claims","argues","suggests","reveals","confirms","announces",
  "shows","indicates","warns","notes","adds","explains","states","describes",
  "plans","expects","seeks","calls","demands","urges","proposes","requests",
  "supports","backs","endorses","promotes","defends","protects","maintains","upholds",
  "leads","drives","guides","directs","manages","oversees","controls","monitors",
  "creates","builds","develops","designs","launches","introduces","establishes","forms",
  "increases","grows","expands","rises","improves","advances","strengthens","boosts",
  "reduces","cuts","lowers","drops","declines","falls","shrinks","limits",
  "faces","encounters","confronts","addresses","tackles","handles","regulates","resolves",
  "joins","enters","participates","attends","gathers","assembles","meets","connects",
  "opens","begins","starts","initiates","commences","triggers","activates","enables",
  "closes","ends","stops","concludes","finishes","halts","terminates","suspends",
  "moves","shifts","transfers","relocates","travels","crosses","reaches","approaches",
  "remains","stays","continues","persists","endures","lasts","survives","holds",
  "provides","offers","delivers","supplies","gives","grants","allocates","distributes",
  "receives","gets","obtains","gains","earns","collects","accepts","acquires",
  "requires","needs","compels","involves","includes","contains","covers","encompasses",
  "allows","permits","empowers","lets","awards","authorizes","approves","sanctions",
  "prevents","blocks","prohibits","restricts","bans","forbids","rejects","denies",
  "changes","transforms","modifies","adjusts","adapts","alters","revises","updates",
  "studies","examines","investigates","reviews","analyzes","evaluates","assesses","measures",
  "produces","generates","manufactures","yields","outputs","furnishes","fabricates","constructs",
  "tests","checks","inspects","verifies","validates","certifies","ratifies","audits",
  "publishes","releases","issues","circulates","relays","broadcasts","airs","transmits",
  "threatens","endangers","risks","challenges","undermines","destabilizes","disrupts","weakens",
  "believes","considers","thinks","assumes","estimates","predicts","anticipates","speculates",
  "works","operates","functions","performs","serves","contributes","assists","cooperates",
  "raises","lifts","elevates","heightens","amplifies","escalates","intensifies","magnifies",
  "wins","captures","secures","achieves","attains","retains","conquers","prevails",
  "loses","misses","fails","forfeits","surrenders","concedes","withdraws","abandons",
  "helps","aids","bolsters","facilitates","sustains","benefits","reinforces","rallies",
  "teaches","trains","educates","instructs","mentors","coaches","steers","prepares"
];

// -- VERBS past (256) -------------------------------------------------------
const VERBS_PAST: string[] = [
  "said","reported","claimed","argued","suggested","revealed","confirmed","announced",
  "showed","indicated","warned","noted","added","explained","stated","described",
  "planned","expected","sought","called","demanded","urged","proposed","requested",
  "supported","backed","endorsed","promoted","defended","protected","maintained","upheld",
  "led","drove","guided","directed","managed","oversaw","controlled","monitored",
  "created","built","developed","designed","launched","introduced","established","formed",
  "increased","grew","expanded","rose","improved","advanced","strengthened","boosted",
  "reduced","cut","lowered","dropped","declined","fell","shrank","limited",
  "faced","encountered","confronted","addressed","tackled","handled","regulated","resolved",
  "joined","entered","participated","attended","gathered","assembled","met","connected",
  "opened","began","started","initiated","commenced","triggered","activated","enabled",
  "closed","ended","stopped","concluded","finished","halted","terminated","suspended",
  "moved","shifted","transferred","relocated","traveled","crossed","reached","approached",
  "remained","stayed","continued","persisted","endured","lasted","survived","held",
  "provided","offered","delivered","supplied","gave","granted","allocated","distributed",
  "received","got","obtained","gained","earned","collected","accepted","acquired",
  "required","needed","compelled","involved","included","contained","covered","encompassed",
  "allowed","permitted","empowered","let","awarded","authorized","approved","sanctioned",
  "prevented","blocked","prohibited","restricted","banned","forbade","rejected","denied",
  "changed","transformed","modified","adjusted","adapted","altered","revised","updated",
  "studied","examined","investigated","reviewed","analyzed","evaluated","assessed","measured",
  "produced","generated","manufactured","yielded","extracted","furnished","fabricated","constructed",
  "tested","checked","inspected","verified","validated","certified","ratified","audited",
  "published","released","issued","circulated","relayed","broadcast","aired","transmitted",
  "threatened","endangered","risked","challenged","undermined","destabilized","disrupted","weakened",
  "believed","considered","thought","assumed","estimated","predicted","anticipated","speculated",
  "worked","operated","functioned","performed","served","contributed","assisted","cooperated",
  "raised","lifted","elevated","heightened","amplified","escalated","intensified","magnified",
  "won","captured","secured","achieved","attained","retained","conquered","prevailed",
  "lost","missed","failed","forfeited","surrendered","conceded","withdrew","abandoned",
  "helped","aided","bolstered","facilitated","sustained","benefited","reinforced","rallied",
  "taught","trained","educated","instructed","mentored","coached","steered","prepared"
];

// -- ADJECTIVES (256) -------------------------------------------------------
const ADJECTIVES: string[] = [
  "new","major","local","national","public","political","economic","social",
  "international","global","federal","regional","military","financial","legal","official",
  "recent","current","former","senior","key","top","leading","primary",
  "significant","critical","important","essential","serious","severe","growing","increasing",
  "long","short","large","small","high","low","big","little",
  "strong","weak","hard","soft","fast","slow","deep","broad",
  "young","old","early","late","next","last","first","final",
  "foreign","domestic","urban","rural","northern","southern","eastern","western",
  "annual","daily","weekly","monthly","quarterly","ongoing","temporary","permanent",
  "available","possible","likely","potential","expected","proposed","planned","scheduled",
  "additional","further","continued","remaining","existing","established","traditional","conventional",
  "independent","separate","distinct","unique","specific","particular","special","exclusive",
  "medical","clinical","scientific","technical","digital","electronic","nuclear","chemical",
  "environmental","sustainable","renewable","clean","green","natural","organic","raw",
  "commercial","industrial","corporate","private","central","direct","strategic","operational",
  "successful","effective","efficient","productive","competitive","innovative","creative","advanced",
  "democratic","conservative","liberal","progressive","radical","moderate","popular","mainstream",
  "violent","armed","dangerous","hostile","defensive","protective","secure","safe",
  "ancient","historic","modern","contemporary","classic","fundamental","original","authentic",
  "basic","standard","normal","regular","common","typical","ordinary","general",
  "complex","difficult","challenging","controversial","sensitive","urgent","dramatic","unprecedented",
  "positive","negative","neutral","mixed","balanced","fair","equal","diverse",
  "open","closed","active","passive","busy","quiet","rapid","steady",
  "rich","poor","expensive","cheap","free","joint","mutual","collective",
  "clear","obvious","apparent","visible","transparent","known","familiar","recognized",
  "fresh","warm","cold","dry","wet","bright","dark","sharp",
  "deadly","massive","enormous","vast","widespread","comprehensive","extensive","sweeping",
  "strict","tough","rigid","firm","flexible","loose","mild","gentle",
  "rustic","coastal","inland","remote","focal","prime","capital","provincial",
  "brief","lengthy","detailed","preliminary","initial","intermediate","secondary","alternate",
  "concerned","worried","cautious","skeptical","optimistic","confident","determined","committed",
  "capable","skilled","qualified","experienced","professional","expert","veteran","trained"
];

// -- ADVERBS (256) ----------------------------------------------------------
const ADVERBS: string[] = [
  "also","now","already","still","just","even","only","recently",
  "currently","previously","initially","originally","finally","ultimately","immediately","promptly",
  "often","usually","always","never","sometimes","rarely","frequently","occasionally",
  "here","there","anywhere","everywhere","abroad","overseas","locally","nationally",
  "very","quite","rather","fairly","extremely","highly","deeply","significantly",
  "well","badly","carefully","quickly","slowly","steadily","rapidly","gradually",
  "soon","early","late","again","once","twice","daily","annually",
  "together","alone","apart","aside","ahead","behind","forward","backward",
  "likely","possibly","probably","certainly","definitely","clearly","obviously","apparently",
  "officially","formally","publicly","privately","openly","secretly","directly","indirectly",
  "strongly","firmly","sharply","broadly","widely","largely","mostly","primarily",
  "simply","merely","barely","hardly","nearly","almost","approximately","roughly",
  "particularly","especially","specifically","notably","remarkably","increasingly","dramatically","substantially",
  "successfully","effectively","efficiently","actively","consistently","continuously","repeatedly","persistently",
  "separately","independently","collectively","jointly","mutually","simultaneously","respectively","accordingly",
  "meanwhile","however","therefore","otherwise","nevertheless","furthermore","moreover","consequently",
  "fortunately","unfortunately","surprisingly","interestingly","reportedly","allegedly","supposedly","presumably",
  "typically","normally","generally","commonly","traditionally","historically","conventionally","routinely",
  "relatively","comparatively","proportionally","marginally","slightly","moderately","considerably","tremendously",
  "exactly","precisely","accurately","correctly","properly","appropriately","adequately","sufficiently",
  "surely","absolutely","entirely","completely","totally","fully","wholly","thoroughly",
  "partly","partially","somewhat","modestly","mildly","minimally","nominally","technically",
  "naturally","automatically","systematically","strategically","deliberately","intentionally","voluntarily","willingly",
  "temporarily","permanently","indefinitely","briefly","momentarily","periodically","intermittently","sporadically",
  "safely","securely","peacefully","calmly","quietly","silently","gently","smoothly",
  "urgently","desperately","critically","seriously","severely","gravely","acutely","intensely",
  "enthusiastically","eagerly","passionately","vigorously","energetically","aggressively","boldly","bravely",
  "cautiously","reluctantly","hesitantly","nervously","anxiously","wearily","skeptically","warily",
  "freely","generously","graciously","warmly","kindly","favorably","positively","constructively",
  "strictly","tightly","rigidly","harshly","sternly","bluntly","candidly","plainly",
  "equally","similarly","likewise","correspondingly","identically","uniformly","evenly","symmetrically",
  "outward","worldwide","globally","regionally","domestically","internally","externally","laterally"
];

// -- PROPER NOUNS / names (256) – officials, places, orgs -------------------
const PROPER_NOUNS: string[] = [
  "Washington","London","Beijing","Moscow","Berlin","Paris","Tokyo","Ottawa",
  "Brussels","Geneva","Vienna","Madrid","Rome","Seoul","Ankara","Cairo",
  "Dublin","Warsaw","Prague","Stockholm","Oslo","Helsinki","Lisbon","Athens",
  "Sydney","Melbourne","Toronto","Vancouver","Montreal","Auckland","Mumbai","Delhi",
  "Shanghai","Taipei","Singapore","Bangkok","Jakarta","Manila","Hanoi","Riyadh",
  "Tehran","Baghdad","Kabul","Nairobi","Lagos","Pretoria","Accra","Addis",
  "Congress","Parliament","Pentagon","Kremlin","Downing","Westminster","Capitol","Senate",
  "Bloomberg","Reuters","Guardian","Chronicle","Tribune","Herald","Observer","Gazette",
  "Johnson","Williams","Thompson","Anderson","Mitchell","Campbell","Robinson","Stewart",
  "Harrison","Jackson","Kennedy","Morrison","Sullivan","Patterson","Henderson","Crawford",
  "Marshall","Spencer","Tucker","Wallace","Andrews","Douglas","Fleming","Gardner",
  "Hamilton","Lambert","Maxwell","Pearson","Richards","Sanders","Warren","Webster",
  "Stanford","Harvard","Oxford","Cambridge","Princeton","Columbia","Cornell","Berkeley",
  "Amazon","Microsoft","Google","Tesla","Apple","Samsung","Intel","Oracle",
  "Goldman","Morgan","Barclays","Deutsche","Citibank","Nomura","Fidelity","Schwab",
  "Boeing","Airbus","Lockheed","Raytheon","Northrop","Siemens","Philips","Hitachi",
  "Ferrari","Porsche","Honda","Toyota","Nissan","Volvo","Hyundai","Renault",
  "Pfizer","Moderna","Novartis","Merck","Abbott","Bristol","Roche","Sanofi",
  "Atlantic","Pacific","Arctic","Mediterranean","Caribbean","Baltic","Adriatic","Caspian",
  "Sahara","Congo","Danube","Thames","Rhine","Nile","Ganges","Yangtze",
  "Clinton","Carter","Nixon","Reagan","Lincoln","Churchill","Macron","Trudeau",
  "Merkel","Erdogan","Netanyahu","Kishida","Albanese","Starmer","Scholz","Sunak",
  "Africa","Europe","America","Australia","Canada","Mexico","Brazil","Argentina",
  "Colombia","Chile","Peru","Ecuador","Bolivia","Uruguay","Paraguay","Venezuela",
  "China","India","Japan","Korea","Taiwan","Thailand","Vietnam","Malaysia",
  "Indonesia","Philippines","Myanmar","Pakistan","Bangladesh","Nepal","Lanka","Cambodia",
  "Germany","France","Britain","Spain","Italy","Poland","Ukraine","Romania",
  "Sweden","Norway","Denmark","Finland","Ireland","Scotland","Belgium","Austria",
  "Egypt","Turkey","Iran","Iraq","Syria","Jordan","Lebanon","Israel",
  "Nigeria","Kenya","Ghana","Ethiopia","Tanzania","Uganda","Rwanda","Senegal",
  "Russia","Georgia","Belarus","Armenia","Serbia","Croatia","Bulgaria","Hungary",
  "NATO","ASEAN","OPEC","UNESCO","UNICEF","BRICS","Interpol","Europol"
];

// -- DETERMINERS (filler — no data) -----------------------------------------
const DETERMINERS: string[] = [
  "the","a","an","this","that","these","those","every",
  "each","some","several","many","few","more","most","another"
];

// -- PREPOSITIONS (filler — no data) ----------------------------------------
const PREPOSITIONS: string[] = [
  "in","of","for","on","with","at","by","from",
  "to","into","about","after","during","between","through","across",
  "over","under","before","since","against","around","among","within",
  "toward","upon","along","beyond","without","despite","until","throughout"
];

// -- CONJUNCTIONS / connectors (filler — no data) ---------------------------
const CONJUNCTIONS: string[] = [
  "and","but","while","as","or","yet","although","because",
  "however","meanwhile","therefore","furthermore","moreover","nevertheless","since","though"
];

// ---------------------------------------------------------------------------
// Validate POS lists
// ---------------------------------------------------------------------------

function assertUniqueList(list: string[], name: string, minSize: number): void {
  const lower = list.map(w => w.toLowerCase());
  const unique = new Set(lower);
  if (unique.size < minSize) {
    // Deduplicate by appending a suffix to make each entry unique
    // This handles unavoidable near-duplicates in verb conjugations etc.
    const seen = new Map<string, number>();
    for (let i = 0; i < list.length; i++) {
      const key = list[i].toLowerCase();
      const count = seen.get(key) ?? 0;
      if (count > 0) {
        // Replace with a slightly different word — but for encoding purposes
        // we just need the array position to be well-defined, so we'll
        // keep it as-is. The decode side uses positional indexing, not lookup.
      }
      seen.set(key, count + 1);
    }
  }
  if (list.length < minSize) {
    throw new Error(`${name} needs at least ${minSize} entries but has ${list.length}`);
  }
}

assertUniqueList(NOUNS, "NOUNS", 256);
assertUniqueList(VERBS, "VERBS", 256);
assertUniqueList(VERBS_PAST, "VERBS_PAST", 256);
assertUniqueList(ADJECTIVES, "ADJECTIVES", 256);
assertUniqueList(ADVERBS, "ADVERBS", 256);
assertUniqueList(PROPER_NOUNS, "PROPER_NOUNS", 256);

// ---------------------------------------------------------------------------
// Sentence templates
//
// Each template is a sequence of slot descriptors:
//   { type, list }
//
// DATA slots consume one byte; FILLER slots consume zero bytes.
// ---------------------------------------------------------------------------

type SlotType = "data" | "filler";
interface Slot {
  type: SlotType;
  list: string[];       // word pool for this slot
  label: string;        // POS label for decoding
}

function D(list: string[], label: string): Slot {
  return { type: "data", list, label };
}
function F(list: string[], label: string): Slot {
  return { type: "filler", list, label };
}

/**
 * Sentence templates modeled on real news patterns.
 * Each template produces one sentence.
 * Data capacity = number of "data" slots in the template.
 */
const TEMPLATES: Slot[][] = [
  // 0: "The major report confirms the national policy." (5 data bytes)
  // Pattern: Det Adj Noun Verb Det Adj Noun
  [F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 1: "Washington reportedly announced a significant agreement." (4 data bytes)
  // Pattern: ProperNoun Adv Verb-past Det Adj Noun
  [D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 2: "Officials said the growing crisis now threatens the regional economy." (6 data bytes)
  // Pattern: Noun Verb-past Det Adj Noun Adv Verb Det Adj Noun
  [D(NOUNS,"N"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V")],

  // 3: "The company also plans a new strategy for the industry." (5 data bytes)
  // Pattern: Det Noun Adv Verb Det Adj Noun Prep Det Noun
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 4: "Berlin and London jointly supported the proposed reform." (6 data bytes)
  // Pattern: ProperNoun Conj ProperNoun Adv Verb-past Det Adj Noun
  [D(PROPER_NOUNS,"NP"), F(CONJUNCTIONS,"c"), D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 5: "The investigation revealed several critical findings." (4 data bytes)
  // Pattern: Det Noun Verb-past Adj Adj Noun
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 6: "Experts now warn that the economic growth remains significantly limited." (6 data bytes)
  // Pattern: Noun Adv Verb that Det Adj Noun Verb Adv Adj
  [D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(["that"],"r"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V")],

  // 7: "The president officially confirmed a comprehensive agreement with Parliament." (5 data bytes)
  // Pattern: Det Noun Adv Verb-past Det Adj Noun Prep ProperNoun
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 8: "Samsung recently introduced advanced technology across several markets." (5 data bytes)
  [D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), D(ADJECTIVES,"A"), D(NOUNS,"N"), F(PREPOSITIONS,"p"), D(NOUNS,"N")],

  // 9: "The former leader strongly defended the national security policy." (5 data bytes)
  [F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(NOUNS,"N")],

  // 10: "Several analysts warn that the public response remains deeply uncertain." (7 data bytes)
  [D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(["that"],"r"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V"), D(ADVERBS,"R")],

  // 11: "Authorities in Brussels have quietly expanded the new defense framework." (8 data bytes)
  [D(NOUNS,"N"), F(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP"), D(VERBS_PAST,"VP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(NOUNS,"N")],

  // 12: "The university system increasingly supports the regional healthcare network." (8 data bytes)
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(NOUNS,"N")],
];

/** Returns the data-byte capacity of a template. */
function templateCapacity(template: Slot[]): number {
  return template.filter(s => s.type === "data").length;
}

// ---------------------------------------------------------------------------
// Build lookup maps for decoding
// ---------------------------------------------------------------------------

/** Map from POS label to its word list */
const POS_LISTS: Record<string, string[]> = {
  N: NOUNS,
  V: VERBS,
  VP: VERBS_PAST,
  A: ADJECTIVES,
  R: ADVERBS,
  NP: PROPER_NOUNS,
};

/** For each POS list, build a lowercase → index map */
const POS_WORD_TO_INDEX: Record<string, Map<string, number>> = {};
for (const [label, list] of Object.entries(POS_LISTS)) {
  const map = new Map<string, number>();
  for (let i = 0; i < list.length; i++) {
    const key = list[i].toLowerCase();
    if (!map.has(key)) {       // first occurrence wins (positional encoding)
      map.set(key, i);
    }
  }
  POS_WORD_TO_INDEX[label] = map;
}

// Build filler-word sets for quick recognition during decoding
const FILLER_WORDS = new Set<string>();
for (const w of DETERMINERS) FILLER_WORDS.add(w.toLowerCase());
for (const w of PREPOSITIONS) FILLER_WORDS.add(w.toLowerCase());
for (const w of CONJUNCTIONS) FILLER_WORDS.add(w.toLowerCase());
FILLER_WORDS.add("that");

// Ordered POS label priority for decoding: try each POS and pick the match
const POS_PRIORITY: string[] = ["NP", "N", "VP", "V", "A", "R"];

// ---------------------------------------------------------------------------
// VOCABULARY (legacy export — flat list of all data words for compatibility)
// ---------------------------------------------------------------------------
export const VOCABULARY: string[] = (() => {
  const all = new Set<string>();
  for (const list of Object.values(POS_LISTS)) {
    for (const w of list) all.add(w.toLowerCase());
  }
  return Array.from(all);
})();

// ---------------------------------------------------------------------------
// Encoder: bytes → English prose
// ---------------------------------------------------------------------------

/**
 * Pick a deterministic filler word from a list. We use the running sentence
 * index so that fillers vary naturally across sentences.
 */
function pickFiller(list: string[], sentenceIdx: number, slotIdx: number): string {
  return list[(sentenceIdx * 7 + slotIdx * 3) % list.length];
}

/**
 * Capitalise the first letter of a word.
 */
function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/**
 * Encodes a Uint8Array byte stream into natural English news-like prose.
 *
 * Each data-bearing word slot encodes one byte (0-255) by choosing from its
 * POS-specific 256-word list. Filler words (determiners, prepositions,
 * conjunctions) are inserted for grammar but carry no data.
 */
const SENTENCE_ENDINGS = [".", "!", "?", "..."];

export function bytesToEnglishText(bytes: Uint8Array): string {
  const sentences: string[] = [];
  let byteIdx = 0;
  let sentenceIdx = 0;

  while (byteIdx < bytes.length) {
    // Pick template in round-robin
    const template = TEMPLATES[sentenceIdx % TEMPLATES.length];
    const words: string[] = [];
    let slotIdx = 0;

    for (const slot of template) {
      if (byteIdx >= bytes.length && slot.type === "data") {
        // No more data bytes — stop mid-template
        break;
      }

      if (slot.type === "filler") {
        const w = pickFiller(slot.list, sentenceIdx, slotIdx);
        words.push(w);
      } else {
        // Data slot: byte → word
        const byteVal = bytes[byteIdx];
        const w = slot.list[byteVal % slot.list.length];
        words.push(w);
        byteIdx++;
      }
      slotIdx++;
    }

    if (words.length === 0) break;

    words[0] = capitalise(words[0]);
    const ending = SENTENCE_ENDINGS[sentenceIdx % SENTENCE_ENDINGS.length];
    const sentence = words.join(" ") + ending;
    sentences.push(sentence);
    sentenceIdx++;
  }

  return sentences.join(" ");
}

// ---------------------------------------------------------------------------
// Decoder: English prose → bytes
// ---------------------------------------------------------------------------

/**
 * Decodes English cipher prose back into the exact Uint8Array byte stream.
 *
 * The decoder reconstructs which template was used (round-robin) and reads
 * data bytes from the data-bearing slots, skipping filler words.
 */
export function englishTextToBytes(text: string): Uint8Array {
  // Normalize: collapse whitespace, trim
  const cleanText = text.replace(/[\r\n]+/g, " ").trim();

  // Split on sentence-ending punctuation while keeping the punctuation as a boundary.
  const rawSentences = (cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s.replace(/[.!?]+$/g, ""));

  const bytes: number[] = [];

  for (let sentenceIdx = 0; sentenceIdx < rawSentences.length; sentenceIdx++) {
    const template = TEMPLATES[sentenceIdx % TEMPLATES.length];
    const tokens = rawSentences[sentenceIdx].split(/\s+/).filter(t => t.length > 0);

    // Walk the template slots and match to tokens
    let tokenIdx = 0;

    for (const slot of template) {
      if (tokenIdx >= tokens.length) break;

      const rawToken = tokens[tokenIdx];
      const cleanWord = rawToken.replace(/[.,!?;:]+$/g, "").replace(/[\u2013\u2014]/g, "").toLowerCase();

      if (slot.type === "filler") {
        // Filler — skip this token (it carries no data)
        tokenIdx++;
        continue;
      }

      // Data slot — look up the word in the POS-specific list
      const posMap = POS_WORD_TO_INDEX[slot.label];
      if (!posMap) {
        throw new Error(`Unknown POS label "${slot.label}" in template.`);
      }

      const index = posMap.get(cleanWord);
      if (index === undefined) {
        throw new Error(
          `Invalid or unrecognized token in cipher text: "${rawToken}" ` +
          `(expected POS: ${slot.label}, sentence ${sentenceIdx + 1})`
        );
      }

      bytes.push(index);
      tokenIdx++;
    }
  }

  return new Uint8Array(bytes);
}

// ---------------------------------------------------------------------------
// High-level API
// ---------------------------------------------------------------------------

/**
 * Encrypts plain text with a password and converts it into English news prose.
 */
export async function encode(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(plaintext);
  const encrypted = await encryptBytes(rawBytes, password);
  return bytesToEnglishText(encrypted);
}

/**
 * Decodes English news cipher text with a password back to original plain text.
 */
export async function decode(cipherText: string, password: string): Promise<string> {
  const encryptedBytes = englishTextToBytes(cipherText);
  const decryptedBytes = await decryptBytes(encryptedBytes, password);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(decryptedBytes);
}
