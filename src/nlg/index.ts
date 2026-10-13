/**
 * Natural Language Generation Dictionaries, Templates, and Carrier-Text Analysis
 */

export * from "./ngram_model.js";

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

// -- NOUNS (256 clean, natural English nouns) ------------------------------
export const NOUNS: string[] = [
  "report","market","policy","program","system","country","government","president","election","campaign","economy","industry","community","company","security","council","budget","crisis","summit","treaty","border","conflict","reform","strategy","network","agency","coalition","alliance","foundation","commission","authority","parliament","court","trial","verdict","sentence","witness","evidence","justice","crime","police","investigation","arrest","charge","prison","penalty","defense","prosecution","school","student","teacher","education","research","university","science","technology","hospital","patient","doctor","treatment","vaccine","medicine","surgery","disease","team","player","coach","season","match","victory","championship","tournament","stadium","record","athlete","league","crowd","rival","title","score","family","children","mother","father","district","neighbor","household","generation","finance","trade","export","investment","growth","profit","revenue","stock","climate","energy","environment","pollution","forest","ocean","wildlife","resource","bridge","highway","airport","railway","station","tunnel","harbor","terminal","office","building","project","contract","worker","union","salary","benefit","media","journalist","broadcast","headline","coverage","statement","interview","press","artist","museum","gallery","festival","performance","concert","theater","culture","film","director","actor","audience","production","studio","scene","screenplay","author","novel","chapter","story","library","publisher","edition","volume","history","tradition","heritage","ceremony","monument","archive","legend","memorial","weather","storm","forecast","temperature","rainfall","drought","flood","disaster","mission","satellite","rocket","spacecraft","planet","orbit","astronaut","telescope","soldier","battalion","commander","regiment","weapon","missile","operation","deployment","citizen","resident","volunteer","activist","protest","petition","movement","demonstration","leader","minister","ambassador","diplomat","delegate","governor","senator","official","agreement","proposal","amendment","regulation","standard","guideline","framework","protocol","infrastructure","platform","software","database","server","algorithm","device","processor","signal","channel","frequency","spectrum","antenna","receiver","transmitter","module","researcher","scholar","graduate","professor","faculty","campus","lecture","seminar","debate","opinion","analysis","survey","finding","conclusion","outcome","assessment","supply","demand","shortage","surplus","warehouse","shipment","cargo","delivery","language","symbol","pattern","structure","method","concept","theory","principle"
];

// -- VERBS (256 clean base/present verbs) ----------------------------------
export const VERBS: string[] = [
  "says","reports","claims","argues","suggests","reveals","confirms","announces","shows","indicates","warns","notes","adds","explains","states","describes","plans","expects","seeks","calls","demands","urges","proposes","requests","supports","backs","endorses","promotes","defends","protects","maintains","upholds","leads","drives","guides","directs","manages","oversees","controls","monitors","creates","builds","develops","designs","launches","introduces","establishes","forms","increases","grows","expands","rises","improves","advances","strengthens","boosts","reduces","cuts","lowers","drops","declines","falls","shrinks","limits","faces","encounters","confronts","addresses","tackles","handles","regulates","resolves","joins","enters","participates","attends","gathers","assembles","meets","connects","opens","begins","starts","initiates","commences","triggers","activates","enables","closes","ends","stops","concludes","finishes","halts","terminates","suspends","moves","shifts","transfers","relocates","travels","crosses","reaches","approaches","remains","stays","continues","persists","endures","lasts","survives","holds","provides","offers","delivers","supplies","gives","grants","allocates","distributes","receives","gets","obtains","gains","earns","collects","accepts","acquires","requires","needs","compels","involves","includes","contains","covers","encompasses","allows","permits","empowers","lets","awards","authorizes","approves","sanctions","prevents","blocks","prohibits","restricts","bans","forbids","rejects","denies","changes","transforms","modifies","adjusts","adapts","alters","revises","updates","studies","examines","investigates","reviews","analyzes","evaluates","assesses","measures","produces","generates","manufactures","yields","outputs","furnishes","fabricates","constructs","tests","checks","inspects","verifies","validates","certifies","ratifies","audits","publishes","releases","issues","circulates","relays","broadcasts","airs","transmits","threatens","endangers","risks","challenges","undermines","destabilizes","disrupts","weakens","believes","considers","thinks","assumes","estimates","predicts","anticipates","speculates","works","operates","functions","performs","serves","contributes","assists","cooperates","raises","lifts","elevates","heightens","amplifies","escalates","intensifies","magnifies","wins","captures","secures","achieves","attains","retains","conquers","prevails","loses","misses","fails","forfeits","surrenders","concedes","withdraws","abandons","helps","aids","bolsters","facilitates","sustains","benefits","reinforces","rallies","teaches","trains","educates","instructs","mentors","coaches","steers","prepares"
];

// -- VERBS_PAST (256 clean past-tense verbs) --------------------------------
export const VERBS_PAST: string[] = [
  "said","reported","claimed","argued","suggested","revealed","confirmed","announced","showed","indicated","warned","noted","added","explained","stated","described","planned","expected","sought","called","demanded","urged","proposed","requested","supported","backed","endorsed","promoted","defended","protected","maintained","upheld","led","drove","guided","directed","managed","oversaw","controlled","monitored","created","built","developed","designed","launched","introduced","established","formed","increased","grew","expanded","rose","improved","advanced","strengthened","boosted","reduced","cut","lowered","dropped","declined","fell","shrank","limited","faced","encountered","confronted","addressed","tackled","handled","regulated","resolved","joined","entered","participated","attended","gathered","assembled","met","connected","opened","began","started","initiated","commenced","triggered","activated","enabled","closed","ended","stopped","concluded","finished","halted","terminated","suspended","moved","shifted","transferred","relocated","traveled","crossed","reached","approached","remained","stayed","continued","persisted","endured","lasted","survived","held","provided","offered","delivered","supplied","gave","granted","allocated","distributed","received","got","obtained","gained","earned","collected","accepted","acquired","required","needed","compelled","involved","included","contained","covered","encompassed","allowed","permitted","empowered","awarded","authorized","approved","sanctioned","prevented","blocked","prohibited","restricted","banned","forbade","rejected","denied","changed","transformed","modified","adjusted","adapted","altered","revised","updated","studied","examined","investigated","reviewed","analyzed","evaluated","assessed","measured","produced","generated","manufactured","yielded","extracted","furnished","fabricated","constructed","tested","checked","inspected","verified","validated","certified","ratified","audited","published","released","issued","circulated","relayed","broadcast","aired","transmitted","threatened","endangered","risked","challenged","undermined","destabilized","disrupted","weakened","believed","considered","thought","assumed","estimated","predicted","anticipated","speculated","worked","operated","functioned","performed","served","contributed","assisted","cooperated","raised","lifted","elevated","heightened","amplified","escalated","intensified","magnified","won","captured","secured","achieved","attained","retained","conquered","prevailed","lost","missed","failed","forfeited","surrendered","conceded","withdrew","abandoned","helped","aided","bolstered","facilitated","sustained","benefited","reinforced","rallied","taught","trained","educated","instructed","mentored","coached","steered","prepared","inspired"
];

// -- ADJECTIVES (256 clean, natural adjectives) -----------------------------
export const ADJECTIVES: string[] = [
  "new","major","local","national","public","political","economic","social","international","global","federal","regional","military","financial","legal","official","recent","current","former","senior","key","top","leading","primary","significant","critical","important","essential","serious","severe","growing","increasing","long","short","large","small","high","low","big","little","strong","weak","hard","soft","fast","slow","deep","broad","young","old","early","late","next","last","first","final","foreign","domestic","urban","rural","northern","southern","eastern","western","annual","daily","weekly","monthly","quarterly","ongoing","temporary","permanent","available","possible","likely","potential","expected","proposed","planned","scheduled","additional","further","continued","remaining","existing","established","traditional","conventional","independent","separate","distinct","unique","specific","particular","special","exclusive","medical","clinical","scientific","technical","digital","electronic","nuclear","chemical","environmental","sustainable","renewable","clean","green","natural","organic","raw","commercial","industrial","corporate","private","central","direct","strategic","operational","successful","effective","efficient","productive","competitive","innovative","creative","advanced","democratic","conservative","liberal","progressive","radical","moderate","popular","mainstream","violent","armed","dangerous","hostile","defensive","protective","secure","safe","ancient","historic","modern","contemporary","classic","fundamental","original","authentic","basic","standard","normal","regular","common","typical","ordinary","general","complex","difficult","challenging","controversial","sensitive","urgent","dramatic","unprecedented","positive","negative","neutral","mixed","balanced","fair","equal","diverse","open","closed","active","passive","busy","quiet","rapid","steady","rich","poor","expensive","cheap","free","joint","mutual","collective","clear","obvious","apparent","visible","transparent","known","familiar","recognized","fresh","warm","cold","dry","wet","bright","dark","sharp","deadly","massive","enormous","vast","widespread","comprehensive","extensive","sweeping","strict","tough","rigid","firm","flexible","loose","mild","gentle","rustic","coastal","inland","remote","focal","prime","capital","provincial","brief","lengthy","detailed","preliminary","initial","intermediate","secondary","alternate","concerned","worried","cautious","skeptical","optimistic","confident","determined","committed","capable","skilled","qualified","experienced","professional","expert","veteran","trained"
];

// -- ADVERBS (256 clean, natural single-word adverbs) ----------------------
export const ADVERBS: string[] = [
  "also","now","already","still","just","even","only","recently","currently","previously","initially","originally","finally","ultimately","immediately","promptly","often","usually","always","never","sometimes","rarely","frequently","occasionally","here","there","anywhere","everywhere","abroad","overseas","locally","nationally","very","quite","rather","fairly","extremely","highly","deeply","significantly","well","badly","carefully","quickly","slowly","steadily","rapidly","gradually","soon","early","late","again","once","twice","daily","annually","together","alone","apart","aside","ahead","behind","forward","backward","likely","possibly","probably","certainly","definitely","clearly","obviously","apparently","officially","formally","publicly","privately","openly","secretly","directly","indirectly","strongly","firmly","sharply","broadly","widely","largely","mostly","primarily","simply","merely","barely","hardly","nearly","almost","approximately","roughly","particularly","especially","specifically","notably","remarkably","increasingly","dramatically","substantially","successfully","effectively","efficiently","actively","consistently","continuously","repeatedly","persistently","separately","independently","collectively","jointly","mutually","simultaneously","respectively","accordingly","meanwhile","however","therefore","otherwise","nevertheless","furthermore","moreover","consequently","fortunately","unfortunately","surprisingly","interestingly","reportedly","allegedly","supposedly","presumably","typically","normally","generally","commonly","traditionally","historically","conventionally","routinely","relatively","comparatively","proportionally","marginally","slightly","moderately","considerably","tremendously","exactly","precisely","accurately","correctly","properly","appropriately","adequately","sufficiently","surely","absolutely","entirely","completely","totally","fully","wholly","thoroughly","partly","partially","somewhat","modestly","mildly","minimally","nominally","technically","naturally","automatically","systematically","strategically","deliberately","intentionally","voluntarily","willingly","temporarily","permanently","indefinitely","briefly","momentarily","periodically","intermittently","sporadically","safely","securely","peacefully","calmly","quietly","silently","gently","smoothly","urgently","desperately","critically","seriously","severely","gravely","acutely","intensely","enthusiastically","eagerly","passionately","vigorously","energetically","aggressively","boldly","bravely","cautiously","reluctantly","hesitantly","nervously","anxiously","wearily","skeptically","warily","freely","generously","graciously","warmly","kindly","favorably","positively","constructively","strictly","tightly","rigidly","harshly","sternly","bluntly","candidly","plainly","equally","similarly","likewise","correspondingly","identically","uniformly","evenly","symmetrically","outward","worldwide","globally","regionally","domestically","internally","externally","laterally"
];

// -- PROPER NOUNS (256 clean proper nouns) ----------------------------------
export const PROPER_NOUNS: string[] = [
  "washington","london","beijing","moscow","berlin","paris","tokyo","ottawa","brussels","geneva","vienna","madrid","rome","seoul","ankara","cairo","dublin","warsaw","prague","stockholm","oslo","helsinki","lisbon","athens","sydney","melbourne","toronto","vancouver","montreal","auckland","mumbai","delhi","shanghai","taipei","singapore","bangkok","jakarta","manila","hanoi","riyadh","tehran","baghdad","kabul","nairobi","lagos","pretoria","accra","addis","congress","parliament","pentagon","kremlin","downing","westminster","capitol","senate","bloomberg","reuters","guardian","chronicle","tribune","herald","observer","gazette","johnson","williams","thompson","anderson","mitchell","campbell","robinson","stewart","harrison","jackson","kennedy","morrison","sullivan","patterson","henderson","crawford","marshall","spencer","tucker","wallace","andrews","douglas","fleming","gardner","hamilton","lambert","maxwell","pearson","richards","sanders","warren","webster","stanford","harvard","oxford","cambridge","princeton","columbia","cornell","berkeley","amazon","microsoft","google","tesla","apple","samsung","intel","oracle","goldman","morgan","barclays","deutsche","citibank","nomura","fidelity","schwab","boeing","airbus","lockheed","raytheon","northrop","siemens","philips","hitachi","ferrari","porsche","honda","toyota","nissan","volvo","hyundai","renault","pfizer","moderna","novartis","merck","abbott","bristol","roche","sanofi","atlantic","pacific","arctic","mediterranean","caribbean","baltic","adriatic","caspian","sahara","congo","danube","thames","rhine","nile","ganges","yangtze","clinton","carter","nixon","reagan","lincoln","churchill","macron","trudeau","merkel","erdogan","netanyahu","kishida","albanese","starmer","scholz","sunak","africa","europe","america","australia","canada","mexico","brazil","argentina","colombia","chile","peru","ecuador","bolivia","uruguay","paraguay","venezuela","china","india","japan","korea","taiwan","thailand","vietnam","malaysia","indonesia","philippines","myanmar","pakistan","bangladesh","nepal","lanka","cambodia","germany","france","britain","spain","italy","poland","ukraine","romania","sweden","norway","denmark","finland","ireland","scotland","belgium","austria","egypt","turkey","iran","iraq","syria","jordan","lebanon","israel","nigeria","kenya","ghana","ethiopia","tanzania","uganda","rwanda","senegal","russia","georgia","belarus","armenia","serbia","croatia","bulgaria","hungary","nato","asean","opec","unesco","unicef","brics","interpol","europol"
];

// These function-word lists stay small and grammatical instead of adding
// unrelated words just to fill a 256-word, 8-bit slot.
export const DETERMINERS: string[] = [
  "the","some","any","no","our","your","their","its"
];

// -- PREPOSITIONS -----------------------------------------------------------
export const PREPOSITIONS: string[] = [
  "in","of","for","on","with","at","by","from","to","into","about","after","during","between","through","across",
  "over","under","before","since","against","around","among","within","toward","upon","along","beyond","without","despite","until","throughout"
];

// -- CONJUNCTIONS -----------------------------------------------------------
export const CONJUNCTIONS: string[] = [
  "and","but","while","as","or","yet","although","because","since","though","whereas","unless","whether","when","where","if"
];

// -- RELATIVES ---------------------------------------------------------------
export const RELATIVES: string[] = [
  "that","which","who","whom","whose","where","when","why","how","whatever","whichever","whoever","whomever","wherever","whenever","however"
];

export const PRONOUNS: string[] = [
  "they","we","he","she","it","I","you","one"
];

// Syllable-controlled Haiku word sub-lists for authentic poetic rhythm
export const HAIKU_NOUNS_1 = [
  "moon","wind","rain","snow","cloud","sky","sea","tree",
  "branch","leaf","bird","stone","shore","lake","stream","dawn",
  "dusk","night","star","flame","field","sun","frost","mist",
  "shade","hill","pond","peak","crest","wood","ice","spring"
];
export const HAIKU_NOUNS_2 = [
  "river","forest","ocean","flower","mountain","valley","meadow","shadow",
  "garden","silence","season","winter","autumn","summer","morning","twilight",
  "blossom","harbor","whisper","spirit","island","canyon","sunlight","moonlight",
  "starlight","tempest","feather","echo","willow","woodland","sandstone","songbird"
];

export const HAIKU_VERBS_1 = [
  "slept","glowed","danced","fell","rose","flowed","bloomed","called",
  "moved","turned","passed","breathed","stirred","broke","shone","swayed",
  "sang","dreamed","paused","dropped","cleared","dimmed","chilled","warmed",
  "gleamed","flared","burned","swept","crept","wove","spun","grew"
];
export const HAIKU_VERBS_2 = [
  "drifted","shimmered","rested","wandered","whispered","faded","gathered","waited",
  "lingered","trembled","appeared","vanished","echoed","opened","softened","brightened",
  "deepened","broadened","blackened","widened","quickened","darkened","stiffened","slackened",
  "lengthened","shortened","moistened","ripened","weakened","strengthened","lessened","heightened"
];

export const HAIKU_ADJECTIVES_1 = [
  "pale","soft","wild","dark","bright","still","cold","warm",
  "blue","green","red","white","faint","deep","new","calm",
  "clear","fresh","pure","chill","sharp","high","low","gray",
  "sweet","rare","swift","grand","dense","dim","rich","dry"
];
export const HAIKU_ADJECTIVES_2 = [
  "quiet","silver","gentle","distant","golden","autumn","winter","hollow",
  "lonely","misty","silent","shallow","sleeping","fallen","hidden","ancient",
  "morning","frozen","solemn","velvet","crystal","starlit","sunlit","secret",
  "endless","steady","noble","timeless","tranquil","verdant","azure","amber"
];

export const HAIKU_DETERMINERS_1 = [
  "the","a","this","that","some","one","my","your",
  "his","her","its","each","no","all","both","such"
];

export const HAIKU_PREPOSITIONS_1 = [
  "in","on","through","near","past","by","from","with",
  "off","down","up","till","for","to","at","round"
];
export const HAIKU_PREPOSITIONS_2 = [
  "above","below","beside","beyond","beneath","over","under","across",
  "around","among","within","behind","against","toward","upon","amid"
];

export const HAIKU_CONJUNCTIONS_1 = [
  "and","while","as","but","yet","though","where","when"
];

export const HAIKU_ADVERBS_2 = [
  "slowly","softly","gently","alone","away","brightly","faintly","deeply",
  "wildly","lightly","calmly","nearby","swiftly","truly","mildly","sweetly"
];

// Combined lists for backward compatibility and slot flexibility
export const HAIKU_NOUNS = [...HAIKU_NOUNS_1, ...HAIKU_NOUNS_2];
export const HAIKU_VERBS_PAST = [...HAIKU_VERBS_1, ...HAIKU_VERBS_2];
export const HAIKU_ADJECTIVES = [...HAIKU_ADJECTIVES_1, ...HAIKU_ADJECTIVES_2];
export const HAIKU_DETERMINERS = HAIKU_DETERMINERS_1;
export const HAIKU_PREPOSITIONS = [...HAIKU_PREPOSITIONS_1, ...HAIKU_PREPOSITIONS_2];
export const HAIKU_CONJUNCTIONS = HAIKU_CONJUNCTIONS_1;
export const HAIKU_ADVERBS = HAIKU_ADVERBS_2;

// POS Map including Haiku vocabulary lists
export const POS_LISTS: Record<string, string[]> = {
  N: NOUNS,
  V: VERBS,
  VP: VERBS_PAST,
  A: ADJECTIVES,
  R: ADVERBS,
  NP: PROPER_NOUNS,
  d: DETERMINERS,
  p: PREPOSITIONS,
  c: CONJUNCTIONS,
  r: RELATIVES,
  pronoun: PRONOUNS,
  haikuNouns1: HAIKU_NOUNS_1,
  haikuNouns2: HAIKU_NOUNS_2,
  haikuVerbs1: HAIKU_VERBS_1,
  haikuVerbs2: HAIKU_VERBS_2,
  haikuAdj1: HAIKU_ADJECTIVES_1,
  haikuAdj2: HAIKU_ADJECTIVES_2,
  haikuDet1: HAIKU_DETERMINERS_1,
  haikuPrep1: HAIKU_PREPOSITIONS_1,
  haikuPrep2: HAIKU_PREPOSITIONS_2,
  haikuConj1: HAIKU_CONJUNCTIONS_1,
  haikuAdv2: HAIKU_ADVERBS_2,
};

export const POS_SETS: Record<string, Set<string>> = {};
export const POS_WORD_TO_INDEX: Record<string, Map<string, number>> = {};
for (const [label, list] of Object.entries(POS_LISTS)) {
  const map = new Map<string, number>();
  const set = new Set<string>();
  for (let i = 0; i < list.length; i++) {
    const key = list[i].toLowerCase();
    set.add(key);
    if (!map.has(key)) {
      map.set(key, i);
    }
  }
  POS_WORD_TO_INDEX[label] = map;
  POS_SETS[label] = set;
}

export const VOCABULARY: string[] = (() => {
  const all = new Set<string>();
  for (const list of Object.values(POS_LISTS)) {
    for (const w of list) all.add(w.toLowerCase());
  }
  return Array.from(all);
})();

export const CARRIER_WORDS = VOCABULARY.slice(0, 2048);
export const CARRIER_WORD_TO_INDEX = new Map(
  CARRIER_WORDS.map((word, index) => [word, index])
);

const INTRANSITIVE_VERBS_PAST = [
  "grew","rose","fell","declined","expanded","remained","continued","endured",
  "lasted","survived","began","started","ended","stopped","persisted","improved"
];
const TRANSITIVE_VERBS_PAST = [
  "reported","announced","confirmed","revealed","supported","proposed","rejected","approved",
  "launched","introduced","created","developed","built","acquired","received","provided",
  "published","released","signed","passed","adopted","reviewed","examined","addressed",
  "changed","increased","reduced","strengthened","protected","defended","blocked","criticized"
];
const LOCATION_PREPOSITIONS = [
  "in","near","around","across","through","beyond","within","outside"
];
const NOUN_COMPLEMENT_PREPOSITIONS = [
  "in","on","for","with","from","near","around","beyond"
];
const SUBORDINATORS = [
  "after","while","when","before","since","though","because","if"
];
const RELATIVE_CLAUSE_MARKERS = ["that","which"];

// 8 Distinct Word-Length Grammatical News Templates for Natural Prose Matching
export const TEMPLATES: Slot[][] = [
  // 0: Length 3 (Determiner + Noun + Intransitive Verb Past)
  [D(DETERMINERS,"d"), D(NOUNS,"N"), D(INTRANSITIVE_VERBS_PAST,"VP")],

  // 1: Length 4 (Determiner + Adjective + Noun + Intransitive Verb Past)
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(INTRANSITIVE_VERBS_PAST,"VP")],

  // 2: Length 5 (Adverb + Pronoun + Transitive Verb + Object)
  [D(ADVERBS,"R"), D(PRONOUNS,"PR"), D(TRANSITIVE_VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 3: Length 6 (Determiner + Adjective + Noun + Verb Past + Preposition + Proper Noun) -> e.g. "The national council met in Paris"
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(INTRANSITIVE_VERBS_PAST,"VP"), D(LOCATION_PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP")],

  // 4: Length 7 (Determiner + Adjective + Noun + Verb Past + Determiner + Adjective + Noun) -> e.g. "The major company announced a new project"
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(TRANSITIVE_VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 5: Length 8 (Main clause followed by an adverbial subordinate clause)
  [D(DETERMINERS,"d"), D(NOUNS,"N"), D(INTRANSITIVE_VERBS_PAST,"VP"), D(SUBORDINATORS,"SC"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(INTRANSITIVE_VERBS_PAST,"VP")],

  // 6: Length 9 (Pronoun + Adverb + Transitive Verb + Object + Complement)
  [D(PRONOUNS,"PR"), D(ADVERBS,"R"), D(TRANSITIVE_VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(NOUN_COMPLEMENT_PREPOSITIONS,"p"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 7: Length 10 (Noun modified by a relative clause, then a main clause)
  [D(DETERMINERS,"d"), D(NOUNS,"N"), D(RELATIVE_CLAUSE_MARKERS,"REL"), D(DETERMINERS,"d"), D(NOUNS,"N"), D(TRANSITIVE_VERBS_PAST,"VP"), D(INTRANSITIVE_VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")]
];

// Syllable-structured Haiku sentence patterns; short lines strictly produce classic 5- and 7-syllable poetic rhythms.
export const HAIKU_TEMPLATES: Slot[][] = [
  // 0: Length 3 (5 Syllables: 1 + 2 + 2) -> "The river drifted"
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_NOUNS_2,"N"), D(HAIKU_VERBS_2,"VP")],

  // 1: Length 4 (5 Syllables: 1 + 1 + 1 + 2) -> "The pale moon drifted"
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_2,"VP")],

  // 2: Length 5 (7 Syllables: 1 + 1 + 1 + 2 + 2) -> "The pale moon slept above river"
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_PREPOSITIONS_2,"p"), D(HAIKU_NOUNS_2,"N")],

  // 3: Length 6 (7 Syllables: 1 + 1 + 1 + 1 + 2 + 1) -> "The pale moon slept above lake"
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_1,"VP"), D(HAIKU_PREPOSITIONS_2,"p"), D(HAIKU_NOUNS_1,"N")],

  // 4: Length 7 (7 Syllables: 1 + 1 + 1 + 1 + 1 + 1 + 1) -> "The soft rain fell and the sky"
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_1,"VP"), D(HAIKU_CONJUNCTIONS_1,"c"), D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_NOUNS_1,"N")],

  // 5: Length 8 (9 Syllables: 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1) -> "The soft rain fell in a quiet sky"
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_1,"VP"), D(HAIKU_PREPOSITIONS_1,"p"), D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_2,"A"), D(HAIKU_NOUNS_1,"N")],

  // 6: Length 9 (10 Syllables: 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2)
  [D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_1,"VP"), D(HAIKU_CONJUNCTIONS_1,"c"), D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_2,"VP")],

  // 7: Length 10 (12 Syllables: 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2)
  [D(HAIKU_ADVERBS_2,"R"), D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_1,"VP"), D(HAIKU_CONJUNCTIONS_1,"c"), D(HAIKU_DETERMINERS_1,"d"), D(HAIKU_ADJECTIVES_1,"A"), D(HAIKU_NOUNS_1,"N"), D(HAIKU_VERBS_2,"VP")]
];

/**
 * Deterministically identifies template index 0..7 from sentence word count.
 */
export function matchTemplate(tokens: string[], templates: Slot[][] = TEMPLATES): number {
  const len = tokens.length;
  const templateIdx = templates.findIndex(template => template.length === len);
  if (templateIdx !== -1) return templateIdx;
  if (len <= templates[0].length) return 0;
  return templates.length - 1;
}

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
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];

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

  const knownVocab = new Set(VOCABULARY);
  let recognizedCount = 0;
  for (const w of words) {
    if (knownVocab.has(w)) {
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
