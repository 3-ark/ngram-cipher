/**
 * Natural Language Generation Dictionaries, Templates, and Carrier-Text Analysis
 */

export type SlotType = "data" | "filler";

export interface Slot {
  type: SlotType;
  list: string[];
  label: string;
}

export function D(list: string[], label: string): Slot {
  return { type: "data", list, label };
}

export function F(list: string[], label: string): Slot {
  return { type: "filler", list, label };
}

// -- NOUNS (256) -----------------------------------------------------------
export const NOUNS: string[] = [
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

// -- VERBS (256) -----------------------------------------------------------
export const VERBS: string[] = [
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

// -- VERBS_PAST (256) -------------------------------------------------------
export const VERBS_PAST: string[] = [
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
  "threatens","endangers","risks","challenges","undermines","destabilizes","disrupts","weakens",
  "believed","considered","thought","assumed","estimated","predicted","anticipated","speculated",
  "worked","operated","functioned","performed","served","contributed","assisted","cooperated",
  "raised","lifted","elevated","heightened","amplified","escalated","intensified","magnified",
  "won","captured","secured","achieved","attained","retained","conquered","prevailed",
  "lost","missed","failed","forfeited","surrendered","conceded","withdrew","abandoned",
  "helped","aided","bolstered","facilitated","sustained","benefited","reinforced","rallied",
  "taught","trained","educated","instructed","mentored","coached","steered","prepared"
];

// -- ADJECTIVES (256) -------------------------------------------------------
export const ADJECTIVES: string[] = [
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
export const ADVERBS: string[] = [
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

// -- PROPER NOUNS (256) -----------------------------------------------------
export const PROPER_NOUNS: string[] = [
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

// -- DETERMINERS ------------------------------------------------------------
export const DETERMINERS: string[] = [
  "the","a","an","this","that","these","those","every",
  "each","some","several","many","few","more","most","another"
];

// -- PREPOSITIONS -----------------------------------------------------------
export const PREPOSITIONS: string[] = [
  "in","of","for","on","with","at","by","from",
  "to","into","about","after","during","between","through","across",
  "over","under","before","since","against","around","among","within",
  "toward","upon","along","beyond","without","despite","until","throughout"
];

// -- CONJUNCTIONS -----------------------------------------------------------
export const CONJUNCTIONS: string[] = [
  "and","but","while","as","or","yet","although","because",
  "however","meanwhile","therefore","furthermore","moreover","nevertheless","since","though"
];

// POS Map
export const POS_LISTS: Record<string, string[]> = {
  N: NOUNS,
  V: VERBS,
  VP: VERBS_PAST,
  A: ADJECTIVES,
  R: ADVERBS,
  NP: PROPER_NOUNS,
};

export const POS_WORD_TO_INDEX: Record<string, Map<string, number>> = {};
for (const [label, list] of Object.entries(POS_LISTS)) {
  const map = new Map<string, number>();
  for (let i = 0; i < list.length; i++) {
    const key = list[i].toLowerCase();
    if (!map.has(key)) {
      map.set(key, i);
    }
  }
  POS_WORD_TO_INDEX[label] = map;
}

export const VOCABULARY: string[] = (() => {
  const all = new Set<string>();
  for (const list of Object.values(POS_LISTS)) {
    for (const w of list) all.add(w.toLowerCase());
  }
  return Array.from(all);
})();

// Templates
export const TEMPLATES: Slot[][] = [
  [F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],
  [D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],
  [D(NOUNS,"N"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V")],
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],
  [D(PROPER_NOUNS,"NP"), F(CONJUNCTIONS,"c"), D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(ADJECTIVES,"A"), D(NOUNS,"N")],
  [D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(["that"],"r"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V")],
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],
  [D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), D(ADJECTIVES,"A"), D(NOUNS,"N"), F(PREPOSITIONS,"p"), D(NOUNS,"N")],
  [F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(NOUNS,"N")],
  [D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(["that"],"r"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V"), D(ADVERBS,"R")],
  [D(NOUNS,"N"), F(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP"), D(VERBS_PAST,"VP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(NOUNS,"N")],
  [F(DETERMINERS,"d"), D(NOUNS,"N"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V"), F(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(NOUNS,"N")],
];

/**
 * Natural-Language Generation Carrier-Text Quality & N-Gram Statistical Analysis
 */
export interface CarrierAnalysis {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  vocabularyCoverage: number; // Ratio of unique words present in dictionary
  bigramUniqueness: number;  // Ratio of unique bigrams
  perplexityEstimate: number; // Log-likelihood based n-gram perplexity
}

export function analyzeCarrierText(text: string): CarrierAnalysis {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const words = text.toLowerCase().match(/[a-z]+/g) || [];

  if (words.length === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      vocabularyCoverage: 0,
      bigramUniqueness: 0,
      perplexityEstimate: Infinity,
    };
  }

  const uniqueWords = new Set(words);
  const knownVocab = new Set(VOCABULARY);
  let recognizedCount = 0;
  for (const w of words) {
    if (knownVocab.has(w) || DETERMINERS.includes(w) || PREPOSITIONS.includes(w) || CONJUNCTIONS.includes(w)) {
      recognizedCount++;
    }
  }

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const uniqueBigrams = new Set(bigrams);

  // Simple unigram/bigram entropy model for perplexity estimation
  let logSum = 0;
  for (const w of words) {
    const prob = knownVocab.has(w) ? 1 / 256 : 1 / 10000;
    logSum += Math.log2(prob);
  }
  const crossEntropy = -logSum / words.length;
  const perplexityEstimate = Math.pow(2, crossEntropy);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength: words.length / (sentences.length || 1),
    vocabularyCoverage: recognizedCount / words.length,
    bigramUniqueness: bigrams.length > 0 ? uniqueBigrams.size / bigrams.length : 0,
    perplexityEstimate,
  };
}
