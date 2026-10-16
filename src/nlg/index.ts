/**
 * Natural Language Generation Dictionaries, Templates, and Carrier-Text Analysis
 */

export * from "./ngram_model.js";

export type SlotType = "data" | "filler";

export interface Slot {
  type: SlotType;
  list: string[];
  label: string;
  punctuationBefore?: string;
  punctuationAfter?: string;
}

export function D(
  list: string[],
  label: string,
  punctuationAfter?: string,
  punctuationBefore?: string
): Slot {
  const slot: Slot = { type: "data", list, label };
  if (punctuationAfter) slot.punctuationAfter = punctuationAfter;
  if (punctuationBefore) slot.punctuationBefore = punctuationBefore;
  return slot;
}

export function F(
  list: string[],
  label: string,
  punctuationAfter?: string,
  punctuationBefore?: string
): Slot {
  const slot: Slot = { type: "filler", list, label };
  if (punctuationAfter) slot.punctuationAfter = punctuationAfter;
  if (punctuationBefore) slot.punctuationBefore = punctuationBefore;
  return slot;
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
  "the","a","this","some","any","no","one","its"
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

// POS Map
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
const REPORTING_VERBS_PAST = [
  "said","stated","reported","announced","confirmed","noted","argued","warned",
  "explained","claimed","suggested","added","emphasized","reiterated","insisted","indicated",
  "detailed","revealed","reaffirmed","maintained","highlighted","conceded","observed","declared",
  "recounted","asserted","acknowledged","underlined","specified","disclosed","pledged","voiced"
];
const DAYS = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday","yesterday",
  "today","tonight","morning","afternoon","evening","overnight","recently","lately"
];
const AUXILIARIES = [
  "was","is","remained","proved","appeared","became","seemed","stayed",
  "felt","grew","turned","looked","sounded","stood","continued","kept"
];
const COMPLEMENT_ADJECTIVES = [
  "unprecedented","critical","significant","essential","crucial","vital","decisive","unclear",
  "vulnerable","unresolved","limited","substantial","urgent","promising","troubling","reassuring",
  "controversial","challenging","pivotal","strategic","paramount","insufficient","encouraging","concerning",
  "uncertain","favorable","unfavorable","precarious","unshakable","imperative","noteworthy","compelling"
];
const LOCATION_PREPOSITIONS = [
  "in","near","around","across","through","beyond","within","outside",
  "beside","along","over","under","throughout","upon","past","towards"
];
const NOUN_COMPLEMENT_PREPOSITIONS = [
  "in","on","for","with","from","near","around","beyond",
  "towards","into","through","across","against","upon","despite","without"
];
const SUBORDINATORS = [
  "after","while","when","before","since","though","because","if",
  "although","whereas","unless","until","as","once","provided","whenever"
];
const CLAUSE_CONJUNCTIONS = [
  "that","while","although","because","as","since","before","after",
  "if","unless","whereas","until","once","where","whenever","wherever"
];
function uniqueWords(words: string[], size: number): string[] {
  return Array.from(new Set(words.map(word => word.toLowerCase()))).slice(0, size);
}

const TREND_NOUNS_EXTENDED = uniqueWords([
  "market","economy","growth","profit","revenue","stock","climate","energy",
  "rainfall","pollution","resource","supply","demand","shortage","surplus","trade",
  "export","investment","production","outcome","finance","shipment","cargo","delivery",
  "budget","temperature","forecast","employment","inflation","output","sales","cost",
  "price","debt","income","spending","value","volume","rate","level",
  "activity","traffic","attendance","capacity","earnings","imports","exports","operations",
  "services","costs","prices","profits","performance","salary","benefit","record",
  "score","penalty","weather","harvest","crops","transport","coverage","yield",
  "assets","liabilities","dividends","shares","equities","bonds","funds","capital",
  "wealth","wages","payroll","rates","returns","losses","gains","balances",
  "reserves","deposits","loans","credit","expenditure","consumption","manufacturing","orders",
  "receipts","turnover","margin","margins","yields","productivity","efficiency","unemployment",
  "housing","rent","mortgages","construction","index","indices","exchange","currency",
  "dollar","euro","pound","oil","gas","coal","electricity","power",
  "water","food","wheat","grain","steel","copper","gold","silver",
  "cotton","timber","freight","shipping","passengers","inventory","inventories","stockpile"
], 128);
const TREND_VERBS = uniqueWords([
  "grew","rose","fell","declined","expanded","remained","continued","improved",
  "increased","dropped","shrank","survived","persisted","lasted","advanced","recovered",
  "surged","plunged","climbed","slipped","stabilized","fluctuated","rebounded","soared",
  "dwindled","weakened","strengthened","accelerated","moderated","peaked","bottomed","plateaued"
], 32);
const CORE_TREND_NOUNS = TREND_NOUNS_EXTENDED.slice(0, 64);
const CORE_TREND_VERBS = TREND_VERBS.slice(0, 16);
const ACTION_SUBJECTS = [
  "government","president","company","council","agency","coalition","commission","authority",
  "parliament","court","police","team","leader","minister","ambassador","official"
];
const ACTION_SUBJECTS_EXTENDED = uniqueWords([
  ...ACTION_SUBJECTS,
  "alliance","foundation","audience","prosecution","school","university","hospital","doctor",
  "coach","family","community","worker","union","journalist","artist","director",
  "author","publisher","faculty","commander","battalion","regiment","citizen","volunteer",
  "activist","movement","governor","senator","researcher","professor","delegate","athlete",
  "resident","witness","neighbor","student","teacher","patient","player","astronaut",
  "soldier","captain","operator","manager","owner","employee","spokesperson","judge"
], 64);
const ACTION_OBJECTS = [
  "policy","program","system","campaign","budget","strategy","network","foundation",
  "treaty","border","reform","investment","project","contract","benefit","statement",
  "agreement","proposal","amendment","regulation","standard","guideline","framework","protocol",
  "infrastructure","platform","software","database","device","operation","deployment","research"
];
const ACTION_OBJECTS_EXTENDED = uniqueWords([
  ...ACTION_OBJECTS,
  "election","security","crisis","summit","conflict","sentence","evidence","charge",
  "defense","education","technology","treatment","medicine","disease","season","match",
  "victory","championship","record","finance","trade","export","revenue","climate",
  "energy","environment","resource","bridge","airport","station","project","contract",
  "hospital","school","highway","tunnel","rocket","vaccine","weapon","building"
], 64);
const OBJECT_DETERMINERS = ["the","some","no","any"];
const CONDITION_DETERMINERS = ["the","some","no","any"];
const ACTION_VERBS = [
  "announced","supported","proposed","rejected","approved","launched","created","developed",
  "introduced","published","released","signed","adopted","defended","backed","changed"
];
const ACTION_VERBS_EXTENDED = uniqueWords([
  ...ACTION_VERBS,
  "built","acquired","provided","examined","addressed","increased","reduced","strengthened",
  "protected","blocked","criticized","produced","generated","established","formed","managed"
], 32);
const REPORTING_CLAUSE_VERBS = [
  "said","stated","reported","announced","confirmed","noted","argued","warned",
  "explained","claimed","suggested","indicated","detailed","revealed","declared","acknowledged"
];
const CAUSE_ADJECTIVES = [
  "severe","prolonged","sudden","widespread","intense","ongoing","regional","damaging",
  "persistent","major","extreme","deadly","powerful","heavy","sustained","serious"
];
const CAUSE_NOUNS = [
  "drought","storm","flood","conflict","crisis","disease","shortage","strike",
  "blockade","recession","disruption","protest","fire","outbreak","failure","decline",
  "collapse","delay","accident","attack","unrest","heat","rainfall","snowfall",
  "wind","violence","instability","epidemic","wildfire","earthquake","eruption","avalanche"
];
const CAUSE_VERBS = [
  "continued","persisted","worsened","intensified","escalated","deepened","spread","grew",
  "expanded","increased","emerged","erupted","lasted","struck","hit","developed"
];
const CAUSE_LINKERS = ["because","as","since","while"];
const EFFECT_LOCATIONS = [
  "London","Paris","Geneva","Brussels","Moscow","Berlin","Prague","Washington",
  "Tokyo","Beijing","Hanoi","Tehran","Nairobi","Lagos","Accra","Cairo",
  "Madrid","Rome","Seoul","Dublin","Ottawa","Canberra","Jakarta","Bangkok",
  "Vienna","Lisbon","Warsaw","Athens","Riyadh","Baghdad","Doha","Amman"
];
const ACTION_ADVERBS = [
  "recently","publicly","strongly","formally","widely","closely","openly","repeatedly",
  "quietly","quickly","carefully","directly","officially","successfully","privately","eventually"
];
const DISCOURSE_ADVERBS = [
  "however","meanwhile","nevertheless","nonetheless","instead","also","indeed","similarly",
  "furthermore","additionally","still","otherwise","rather","likewise","conversely","ultimately"
];
const EFFECT_ADVERBS = [
  "sharply","steadily","rapidly","gradually","significantly","modestly","slightly","dramatically",
  "quickly","slowly","noticeably","substantially","marginally","consistently","suddenly","further"
];
const CONDITION_VERBS = [
  "escalated","deepened","intensified","spread","persisted","continued","worsened","expanded",
  "increased","emerged","lasted","stabilized","accelerated","eased","declined","recovered"
];
const CONDITION_NOUNS = [
  "crisis","shortage","conflict","unrest","violence","disease","drought","flood",
  "rainfall","wildfire","epidemic","instability","supply","demand","output","trade"
];
const RELATIVE_ANTECEDENTS = [
  "government","company","council","agency","coalition","commission","authority","parliament",
  "court","union","university","hospital","school","foundation","alliance","community"
];
const RELATIVE_SUBJECTS = [
  "officials","lawmakers","regulators","voters","ministers","leaders","researchers","judges",
  "members","delegates","senators","residents","workers","analysts","witnesses","representatives"
];
const RELATIVE_VERBS = [
  "criticized","backed","rejected","approved","supported","opposed","questioned","challenged",
  "examined","endorsed","investigated","defended","reviewed","signed","blocked","adopted"
];
const EFFECT_SCOPE_ADJECTIVES = [
  "local","national","global","regional","domestic","public","private","rural",
  "urban","international","federal","provincial","coastal","northern","eastern","western"
];
const EFFECT_TYPE_ADJECTIVES = [
  "food","fuel","energy","consumer","industrial","agricultural","financial","trade",
  "export","market","retail","wholesale","farm","crop","oil","gas"
];
const EFFECT_NOUNS = [
  "supply","prices","output","production","growth","revenue","demand","trade",
  "exports","imports","employment","traffic","sales","stocks","services","access",
  "deliveries","operations","investment","income","costs","resources","harvest","crops",
  "transport","earnings","shortages","profits","capacity","activity","shipments","supplies"
];
const EFFECT_VERBS = [
  "rose","fell","declined","increased","dropped","shrank","improved","recovered",
  "worsened","intensified","weakened","stalled","surged","persisted","tightened","expanded"
];
const AFTER_EVENTS = [
  "protests","talks","negotiations","elections","hearings","discussions","debates","demonstrations",
  "meetings","raids","clashes","investigations","consultations","interviews","strikes","trials"
];
// Distinct sentence lengths let the decoder identify each news template without extra marker bits.
export const TEMPLATES: Slot[][] = [
  // 0 / 6 words: The major market rose in London.
  [D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(CORE_TREND_NOUNS, "N"), D(CORE_TREND_VERBS, "VP"), F(["in"], "p"), D(PROPER_NOUNS, "NP")],

  // 1 / 7 words: If the drought worsened, food prices rose.
  [F(["if"], "c"), D(CONDITION_DETERMINERS, "d"), D(CONDITION_NOUNS, "N"), D(CONDITION_VERBS, "VP", ","), D(EFFECT_TYPE_ADJECTIVES, "A"), D(EFFECT_NOUNS, "N"), D(EFFECT_VERBS, "VP")],

  // 2 / 8 words: The company expanded its public network in London.
  [D(DETERMINERS, "d"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(ACTION_OBJECTS_EXTENDED, "N"), F(["in"], "p"), D(PROPER_NOUNS, "NP")],

  // 3 / 9 words: After talks, however, the president recently changed its strategy.
  [F(["after"], "p"), D(AFTER_EVENTS, "N", ","), D(DISCOURSE_ADVERBS, "R", ","), D(DETERMINERS, "d"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_ADVERBS, "R"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 4 / 10 words: The coalition, which officials publicly criticized, eventually backed the reform.
  [D(DETERMINERS, "d"), D(RELATIVE_ANTECEDENTS, "N", ","), F(["which"], "c"), D(RELATIVE_SUBJECTS, "N"), D(ACTION_ADVERBS, "R"), D(RELATIVE_VERBS, "VP", ","), D(ACTION_ADVERBS, "R"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 5 / 12 words: Local food prices rose sharply in London since the severe drought persisted.
  [D(EFFECT_SCOPE_ADJECTIVES, "A"), D(EFFECT_TYPE_ADJECTIVES, "A"), D(EFFECT_NOUNS, "N"), D(EFFECT_VERBS, "VP"), D(EFFECT_ADVERBS, "R"), F(["in"], "p"), D(EFFECT_LOCATIONS, "NP"), D(CAUSE_LINKERS, "c"), D(DETERMINERS, "d"), D(CAUSE_ADJECTIVES, "A"), D(CAUSE_NOUNS, "N"), D(CAUSE_VERBS, "VP")],

  // 6 / 13 words: Asked about the crisis, Johnson noted that the major company backed the reform.
  [F(["asked"], "V"), F(["about"], "p"), D(DETERMINERS, "d"), D(CONDITION_NOUNS, "N", ","), D(PROPER_NOUNS, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["that"], "c"), D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 7 / 14 words: "The major company backed the proposal," Johnson said recently in an interview in London.
  [D(DETERMINERS, "d", undefined, '"'), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N", '",'), D(PROPER_NOUNS, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), D(ACTION_ADVERBS, "R"), F(["in"], "p"), F(["an"], "d"), F(["interview"], "N"), F(["in"], "p"), D(PROPER_NOUNS, "NP")],

  // 8 / 15 words: Johnson said that the major company backed some reform, but the agency rejected the proposal.
  [D(PROPER_NOUNS, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["that"], "c"), D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N", ","), F(["but"], "c"), D(DETERMINERS, "d"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 9 / 17 words: "The major company backed the proposal," Johnson said in London, "since the severe drought persisted in Geneva."
  [D(DETERMINERS, "d", undefined, '"'), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N", '",'), D(PROPER_NOUNS, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["in"], "p"), D(EFFECT_LOCATIONS, "NP", ","), D(CAUSE_LINKERS, "c", undefined, '"'), D(DETERMINERS, "d"), D(CAUSE_ADJECTIVES, "A"), D(CAUSE_NOUNS, "N"), D(CAUSE_VERBS, "VP"), F(["in"], "p"), D(EFFECT_LOCATIONS, "NP")],

  // 10 / 19 words: Johnson noted that "the major company backed the proposal," but the agency rejected the strategy after talks in London.
  [D(PROPER_NOUNS, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["that"], "c"), D(DETERMINERS, "d", undefined, '"'), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N", '",'), F(["but"], "c"), D(DETERMINERS, "d"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N"), F(["after"], "p"), D(AFTER_EVENTS, "N"), F(["in"], "p"), D(PROPER_NOUNS, "NP")],
];

const POETRY_NOUNS = [
  "moon","river","forest","ocean","wind","rain","snow","cloud",
  "sky","sea","tree","branch","leaf","flower","bird","stone",
  "mountain","valley","meadow","shore","lake","stream","shadow","dawn",
  "dusk","night","star","flame","garden","field","silence","season",
  "frost","ember","mist","sunlight","starlight","comet","desert","island",
  "pathway","horizon","reflection","echo","whisper","breeze","storm","twilight",
  "harbor","cavern","glade","summit","pine","willow","feather","shell",
  "tide","wave","spark","light","haven","clearing","canopy","solitude",
  "time","memory","dream","music","solace","wonder","heart","spirit",
  "sorrow","promise","presence","distance","passage","rhythm","secret","lullaby",
  "lantern","mirror","realm","temple","melody","reverie","slumber","breath",
  "pulse","aura","cradle","shelter","embrace","vision","phantom","chime",
  "veil","radiance","cascade","glen","threshold","hymn","murmur","trance",
  "eternity","moment","sanctuary","sigh","desire","warmth","grace","repose",
  "compass","oasis","thought","glance","yearning","citadel","fountain","brook",
  "throne","chalice","voyage","recompense","beacon","shroud","serenade","harmony"
];
const POETRY_VERBS_PAST = [
  "slept","glowed","drifted","shimmered","rested","wandered","whispered","faded",
  "gathered","danced","fell","rose","flowed","bloomed","called","waited",
  "lingered","trembled","moved","turned","passed","appeared","vanished","echoed",
  "breathed","stirred","broke","shone","swayed","sang","dreamed","opened",
  "soared","glided","awakened","softened","ignited","settled","floated","glimmered",
  "folded","kindled","surged","cleared","descended","ascended","parted","guided",
  "traveled","weaved","bounded","listened","welcomed","cherished","embraced","dissolved",
  "sparkled","flashed","calmed","haunted","realigned","illuminated","subsided","thawed",
  "recalled","treasured","sought","found","comforted","restored","soothed","rekindled",
  "beckoned","entwined","murmured","transcended","resounded","flowered","surrendered","hushed",
  "unfolded","enfolded","manifested","remained","perished","retreated","yielded","conveyed",
  "anchored","adorned","crowned","dazzled","delayed","departed","distilled","enveloped",
  "expanded","mourned","obscured","overspread","paused","persisted","pervaded","quieted",
  "quickened","reawakened","reconnected","reflected","released","remembered","resonated","returned",
  "revered","revived","rippled","scattered","slumbered","smoothed","traversed","vibrated",
  "slid","glanced","sojourned","transformed","encircled","sanctified","charmed","entranced"
];
const POETRY_ADJECTIVES = [
  "quiet","silver","pale","gentle","soft","wild","distant","dark",
  "bright","still","golden","autumn","winter","cold","warm","blue",
  "green","red","white","faint","hollow","lonely","misty","silent",
  "shallow","deep","sleeping","fallen","hidden","ancient","new","morning",
  "velvet","tender","amber","shadowy","serene","peaceful","endless","boundless",
  "radiant","crystal","luminous","subtle","sacred","tranquil","solitary","timeless",
  "fragile","graceful","mellow","vibrant","ethereal","pristine","dusky","snowy",
  "goldenrod","azure","emerald","crimson","calm","dormant","halcyon","fleeting",
  "hallowed","ephemeral","veiled","melodic","pensive","wistful","reverent","mystic",
  "hushed","blessed","lofty","sublime","haunting","glowing","spacious","immense",
  "infinite","unspoken","unbroken","crystalline","starry","verdant","celestial","unseen",
  "restless","everlasting","immortal","translucent","arcane","seraphic","resonant","reposeful",
  "quietistic","pure","pastoral","nocturnal","monumental","limpid","iridescent","incandescent",
  "immemorial","illusive","harmonious","flawless","festive","enchanted","elusive","divine",
  "cloudless","charmed","breezy","benign","astral","ageless","placid","stilly",
  "vernal","sylvan","solemn","wondrous","winsome","untamed","untold","peerless"
];
const POETRY_DETERMINERS = [
  "the","a","this","that","some","one","our","my",
  "your","his","her","its","each","every","another","any"
];
const POETRY_PREPOSITIONS = [
  "above","below","beside","beyond","beneath","near","through","over",
  "under","across","around","among","within","behind","against","toward"
];
// Coordinating conjunctions that can grammatically join two verb predicates ("sang and danced", "fell yet bloomed")
const POETRY_COORDINATING_CONJUNCTIONS = [
  "and","yet","but","or"
];
// Full conjunctions for joining full clauses (Subject + Verb + Conj + Subject + Verb)
const POETRY_CLAUSE_CONJUNCTIONS = [
  "and","while","as","but","yet","though","because","when"
];
const POETRY_ADVERBS = [
  "quietly","slowly","softly","gently","here","there","alone","away",
  "brightly","faintly","still","deeply","wildly","lightly","calmly","nearby",
  "tenderly","silently","swiftly","sweetly","gracefully","peacefully","smoothly","subtly",
  "radiantly","serenely","anew","forever","afar","solemnly","warmly","purely"
];

// 8 Distinct Word-Length Grammatical Poetry Templates (Lengths 3, 4, 5, 6, 7, 8, 9, 10)
export const POETRY_TEMPLATES: Slot[][] = [
  // 0: Length 3 (e.g. "The moon slept")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP")],

  // 1: Length 4 (e.g. "A gentle river flowed")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP")],

  // 2: Length 5 (Compound predicate with coordinating conjunction: "Our rain whispered and wandered")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP"), D(POETRY_COORDINATING_CONJUNCTIONS,"c"), D(POETRY_VERBS_PAST,"VP")],

  // 3: Length 6 (e.g. "The moon slept above the river")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP"), D(POETRY_PREPOSITIONS,"p"), D(POETRY_DETERMINERS,"d"), D(POETRY_NOUNS,"N")],

  // 4: Length 7 (Full clause + clause conjunction + full clause: "The dusk fell while a river danced")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP"), D(POETRY_CLAUSE_CONJUNCTIONS,"c"), D(POETRY_DETERMINERS,"d"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP")],

  // 5: Length 8 (e.g. "A quiet flame danced beside each dark shore")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP"), D(POETRY_PREPOSITIONS,"p"), D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N")],

  // 6: Length 9 (Adjective clause + clause conjunction + adjective clause: "A bright silence gathered while each autumn tree appeared")
  [D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP"), D(POETRY_CLAUSE_CONJUNCTIONS,"c"), D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP")],

  // 7: Length 10 (Adverb opener + full clause + clause conjunction + full clause)
  [D(POETRY_ADVERBS,"R"), D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP"), D(POETRY_CLAUSE_CONJUNCTIONS,"c"), D(POETRY_DETERMINERS,"d"), D(POETRY_ADJECTIVES,"A"), D(POETRY_NOUNS,"N"), D(POETRY_VERBS_PAST,"VP")]
];

/**
 * Deterministically identifies template index 0..7 from sentence word count.
 */
export function matchTemplate(tokens: string[], templates: Slot[][] = TEMPLATES): number {
  const len = tokens.length;
  const templateIdx = templates.findIndex(template => template.length === len);
  if (templateIdx === -1) {
    throw new Error(`No template matches sentence length ${len}.`);
  }
  return templateIdx;
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
