/**
 * Natural Language Generation Dictionaries, Templates, and Carrier-Text Analysis
 */
import { ACTION_OBJECTS_RAW, ACTION_SUBJECTS_RAW, CAUSE_ADJECTIVES_RAW, CAUSE_NOUNS_RAW, CAUSE_VERBS_RAW, COMPLEMENT_ADJECTIVES_RAW, CONDITION_NOUNS_RAW, CONDITION_VERBS_RAW, CORE_TREND_NOUNS_RAW, CORE_TREND_VERBS_RAW, EFFECT_NOUNS_RAW, EFFECT_SCOPE_ADJECTIVES_RAW, EFFECT_TYPE_ADJECTIVES_RAW, EFFECT_VERBS_RAW, RELATIVE_ANTECEDENTS_RAW, REPORTING_SUBJECTS_PROPER_RAW } from "./dict";
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

// Helper to sanitize and enforce exact power-of-two (256) size with unique elements
function enforce256List(words: string[], fallbackWords: string[] = []): string[] {
  const set = new Set<string>();
  for (const w of words) {
    const clean = w.trim().toLowerCase();
    if (clean) set.add(clean);
  }
  for (const w of fallbackWords) {
    if (set.size >= 256) break;
    const clean = w.trim().toLowerCase();
    if (clean) set.add(clean);
  }
  const result = Array.from(set);
  if (result.length < 256) {
    throw new Error(`List size ${result.length} is less than required 256.`);
  }
  return result.slice(0, 256);
}

// -- NOUNS (256 clean, natural English nouns) ------------------------------
export const NOUNS: string[] = enforce256List([
  "report","market","policy","program","system","country","government","president","election","campaign","economy","industry","community","company","security","council","budget","crisis","summit","treaty","border","conflict","reform","strategy","network","agency","coalition","alliance","foundation","commission","authority","parliament","court","trial","verdict","sentence","witness","evidence","justice","crime","police","investigation","arrest","charge","prison","penalty","defense","prosecution","school","student","teacher","education","research","university","science","technology","hospital","patient","doctor","treatment","vaccine","medicine","surgery","disease","team","player","coach","season","match","victory","championship","tournament","stadium","record","athlete","league","crowd","rival","title","score","family","children","mother","father","district","neighbor","household","generation","finance","trade","export","investment","growth","profit","revenue","stock","climate","energy","environment","pollution","forest","ocean","wildlife","resource","bridge","highway","airport","railway","station","tunnel","harbor","terminal","office","building","project","contract","worker","union","salary","benefit","media","journalist","broadcast","headline","coverage","statement","interview","press","artist","museum","gallery","festival","performance","concert","theater","culture","film","director","actor","audience","production","studio","scene","screenplay","author","novel","chapter","story","library","publisher","edition","volume","history","tradition","heritage","ceremony","monument","archive","legend","memorial","weather","storm","forecast","temperature","rainfall","drought","flood","disaster","mission","satellite","rocket","spacecraft","planet","orbit","astronaut","telescope","soldier","battalion","commander","regiment","weapon","missile","operation","deployment","citizen","resident","volunteer","activist","protest","petition","movement","demonstration","leader","minister","ambassador","diplomat","delegate","governor","senator","official","agreement","proposal","amendment","regulation","standard","guideline","framework","protocol","infrastructure","platform","software","database","server","algorithm","device","processor","signal","channel","frequency","spectrum","antenna","receiver","transmitter","module","researcher","scholar","graduate","professor","faculty","campus","lecture","seminar","debate","opinion","analysis","survey","finding","conclusion","outcome","assessment","supply","demand","shortage","surplus","warehouse","shipment","cargo","delivery","language","symbol","pattern","structure","method","concept","theory","principle"
]);

// -- VERBS (256 clean base/present verbs) ----------------------------------
export const VERBS: string[] = enforce256List([
  "says","reports","claims","argues","suggests","reveals","confirms","announces","shows","indicates","warns","notes","adds","explains","states","describes","plans","expects","seeks","calls","demands","urges","proposes","requests","supports","backs","endorses","promotes","defends","protects","maintains","upholds","leads","drives","guides","directs","manages","oversees","controls","monitors","creates","builds","develops","designs","launches","introduces","establishes","forms","increases","grows","expands","rises","improves","advances","strengthens","boosts","reduces","cuts","lowers","drops","declines","falls","shrinks","limits","faces","encounters","confronts","addresses","tackles","handles","regulates","resolves","joins","enters","participates","attends","gathers","assembles","meets","connects","opens","begins","starts","initiates","commences","triggers","activates","enables","closes","ends","stops","concludes","finishes","halts","terminates","suspends","moves","shifts","transfers","relocates","travels","crosses","reaches","approaches","remains","stays","continues","persists","endures","lasts","survives","holds","provides","offers","delivers","supplies","gives","grants","allocates","distributes","receives","gets","obtains","gains","earns","collects","accepts","acquires","requires","needs","compels","involves","includes","contains","covers","encompasses","allows","permits","empowers","lets","awards","authorizes","approves","sanctions","prevents","blocks","prohibits","restricts","bans","forbids","rejects","denies","changes","transforms","modifies","adjusts","adapts","alters","revises","updates","studies","examines","investigates","reviews","analyzes","evaluates","assesses","measures","produces","generates","manufactures","yields","outputs","furnishes","fabricates","constructs","tests","checks","inspects","verifies","validates","certifies","ratifies","audits","publishes","releases","issues","circulates","relays","broadcasts","airs","transmits","threatens","endangers","risks","challenges","undermines","destabilizes","disrupts","weakens","believes","considers","thinks","assumes","estimates","predicts","anticipates","speculates","works","operates","functions","performs","serves","contributes","assists","cooperates","raises","lifts","elevates","heightens","amplifies","escalates","intensifies","magnifies","wins","captures","secures","achieves","attains","retains","conquers","prevails","loses","misses","fails","forfeits","surrenders","concedes","withdraws","abandons","helps","aids","bolsters","facilitates","sustains","benefits","reinforces","rallies","teaches","trains","educates","instructs","mentors","coaches","steers","prepares"
]);

// -- VERBS_PAST (256 clean past-tense verbs) --------------------------------
export const VERBS_PAST: string[] = enforce256List([
  "said","reported","claimed","argued","suggested","revealed","confirmed","announced","showed","indicated","warned","noted","added","explained","stated","described","planned","expected","sought","called","demanded","urged","proposed","requested","supported","backed","endorsed","promoted","defended","protected","maintained","upheld","led","drove","guided","directed","managed","oversaw","controlled","monitored","created","built","developed","designed","launched","introduced","established","formed","increased","grew","expanded","rose","improved","advanced","strengthened","boosted","reduced","cut","lowered","dropped","declined","fell","shrank","limited","faced","encountered","confronted","addressed","tackled","handled","regulated","resolved","joined","entered","participated","attended","gathered","assembled","met","connected","opened","began","started","initiated","commenced","triggered","activated","enabled","closed","ended","stopped","concluded","finished","halted","terminated","suspended","moved","shifted","transferred","relocated","traveled","crossed","reached","approached","remained","stayed","continued","persisted","endured","lasted","survived","held","provided","offered","delivered","supplied","gave","granted","allocated","distributed","received","got","obtained","gained","earned","collected","accepted","acquired","required","needed","compelled","involved","included","contained","covered","encompassed","allowed","permitted","empowered","awarded","authorized","approved","sanctioned","prevented","blocked","prohibited","restricted","banned","forbade","rejected","denied","changed","transformed","modified","adjusted","adapted","altered","revised","updated","studied","examined","investigated","reviewed","analyzed","evaluated","assessed","measured","produced","generated","manufactured","yielded","extracted","furnished","fabricated","constructed","tested","checked","inspected","verified","validated","certified","ratified","audited","published","released","issued","circulated","relayed","broadcast","aired","transmitted","threatened","endangered","risked","challenged","undermined","destabilized","disrupted","weakened","believed","considered","thought","assumed","estimated","predicted","anticipated","speculated","worked","operated","functioned","performed","served","contributed","assisted","cooperated","raised","lifted","elevated","heightened","amplified","escalated","intensified","magnified","won","captured","secured","achieved","attained","retained","conquered","prevailed","lost","missed","failed","forfeited","surrendered","conceded","withdrew","abandoned","helped","aided","bolstered","facilitated","sustained","benefited","reinforced","rallied","taught","trained","educated","instructed","mentored","coached","steered","prepared","inspired"
]);

// -- ADJECTIVES (256 clean, natural adjectives) -----------------------------
export const ADJECTIVES: string[] = enforce256List([
  "new","major","local","national","public","political","economic","social","international","global","federal","regional","military","financial","legal","official","recent","current","former","senior","key","top","leading","primary","significant","critical","important","essential","serious","severe","growing","increasing","long","short","large","small","high","low","big","little","strong","weak","hard","soft","fast","slow","deep","broad","young","old","early","late","next","last","first","final","foreign","domestic","urban","rural","northern","southern","eastern","western","annual","daily","weekly","monthly","quarterly","ongoing","temporary","permanent","available","possible","likely","potential","expected","proposed","planned","scheduled","additional","further","continued","remaining","existing","established","traditional","conventional","independent","separate","distinct","unique","specific","particular","special","exclusive","medical","clinical","scientific","technical","digital","electronic","nuclear","chemical","environmental","sustainable","renewable","clean","green","natural","organic","raw","commercial","industrial","corporate","private","central","direct","strategic","operational","successful","effective","efficient","productive","competitive","innovative","creative","advanced","democratic","conservative","liberal","progressive","radical","moderate","popular","mainstream","violent","armed","dangerous","hostile","defensive","protective","secure","safe","ancient","historic","modern","contemporary","classic","fundamental","original","authentic","basic","standard","normal","regular","common","typical","ordinary","general","complex","difficult","challenging","controversial","sensitive","urgent","dramatic","unprecedented","positive","negative","neutral","mixed","balanced","fair","equal","diverse","open","closed","active","passive","busy","quiet","rapid","steady","rich","poor","expensive","cheap","free","joint","mutual","collective","clear","obvious","apparent","visible","transparent","known","familiar","recognized","fresh","warm","cold","dry","wet","bright","dark","sharp","deadly","massive","enormous","vast","widespread","comprehensive","extensive","sweeping","strict","tough","rigid","firm","flexible","loose","mild","gentle","rustic","coastal","inland","remote","focal","prime","capital","provincial","brief","lengthy","detailed","preliminary","initial","intermediate","secondary","alternate","concerned","worried","cautious","skeptical","optimistic","confident","determined","committed","capable","skilled","qualified","experienced","professional","expert","veteran","trained"
]);

// -- ADVERBS (256 clean, natural single-word adverbs) ----------------------
const ADVERBS_RAW = [
  "also","now","already","still","just","even","only","recently","currently","previously","initially","originally","finally","ultimately","immediately","promptly","often","usually","always","never","sometimes","rarely","frequently","occasionally","here","there","anywhere","everywhere","abroad","overseas","locally","nationally","very","quite","rather","fairly","extremely","highly","deeply","significantly","well","badly","carefully","quickly","slowly","steadily","rapidly","gradually","soon","early","late","again","once","twice","daily","annually","together","alone","apart","aside","ahead","behind","forward","backward","likely","possibly","probably","certainly","definitely","clearly","obviously","apparently","officially","formally","publicly","privately","openly","secretly","directly","indirectly","strongly","firmly","sharply","broadly","widely","largely","mostly","primarily","simply","merely","barely","hardly","nearly","almost","approximately","roughly","particularly","especially","specifically","notably","remarkably","increasingly","dramatically","substantially","successfully","effectively","efficiently","actively","consistently","continuously","repeatedly","persistently","separately","independently","collectively","jointly","mutually","simultaneously","respectively","accordingly","meanwhile","however","nevertheless","furthermore","moreover","consequently","fortunately","unfortunately","surprisingly","interestingly","reportedly","allegedly","supposedly","presumably","typically","normally","generally","commonly","traditionally","historically","conventionally","routinely","relatively","comparatively","proportionally","marginally","slightly","moderately","considerably","tremendously","exactly","precisely","accurately","correctly","properly","appropriately","adequately","sufficiently","surely","absolutely","entirely","completely","totally","fully","wholly","thoroughly","partly","partially","somewhat","modestly","mildly","minimally","nominally","technically","naturally","automatically","systematically","strategically","deliberately","intentionally","voluntarily","willingly","temporarily","permanently","indefinitely","briefly","momentarily","periodically","intermittently","sporadically","safely","securely","peacefully","calmly","quietly","silently","gently","smoothly","urgently","desperately","critically","seriously","severely","gravely","acutely","intensely","enthusiastically","eagerly","passionately","vigorously","energetically","aggressively","boldly","bravely","cautiously","reluctantly","hesitantly","nervously","anxiously","wearily","skeptically","warily","freely","generously","graciously","warmly","kindly","favorably","positively","constructively","strictly","tightly","rigidly","harshly","sternly","bluntly","candidly","plainly","equally","similarly","likewise","correspondingly","identically","uniformly","evenly","symmetrically","outward","worldwide","globally","regionally","domestically","internally","externally","laterally","swiftly","decisively","steadfastly","fiercely","vastly","hugely","massively","profoundly","immeasurably","immensely","boundlessly","infinitely","markedly","noticeably","visibly","conspicuously","prominently","strikingly","spectacularly","dazzlingly","brilliantly","splendidly","superbly","excellently","wonderfully","marvelously","admirably","flawlessly","impeccably","perfectly","seamlessly","effortlessly","easily","readily","uninterruptedly","tirelessly","relentlessly","unwaveringly","resolutely","determinedly","robustly","soundly","solidly","sturdily","stiffly","stringently","rigorously","meticulously","exhaustively","comprehensively","extensively","sweepingly","pervasively","ubiquitously","nationwide","statewide","citywide","outwardly","inwardly","upwardly","downwardly","sideways","centrally","focally","predominantly","essentially","fundamentally","basically","inherently","intrinsically","spontaneously","instinctively","intuitively",
  "brightly","darkly","faintly","dimly","harshly","softly","loudly","quietly","calmly","wildly",
  "fiercely","gently","kindly","cruelly","boldly","meekly","proudly","humbly","eagerly","keenly",
  "fondly","warmly","coldly","coolly","hotly","neatly","loosely","tightly","firmly","slackly",
  "sharply","bluntly","dully","keenly","briskly","swiftly","slowly","rapidly","promptly","tardily",
  "early","late","before","after","instead","besides","otherwise","indeed","likewise","moreover"
];
export const ADVERBS: string[] = enforce256List(ADVERBS_RAW);

// -- PROPER NOUNS (256 clean proper nouns) ----------------------------------
export const PROPER_NOUNS: string[] = [
  "washington","london","beijing","moscow","berlin","paris","tokyo","ottawa","brussels","geneva","vienna","madrid","rome","seoul","ankara","cairo","dublin","warsaw","prague","stockholm","oslo","helsinki","lisbon","athens","sydney","melbourne","toronto","vancouver","montreal","auckland","mumbai","delhi","shanghai","taipei","singapore","bangkok","jakarta","manila","hanoi","riyadh","tehran","baghdad","kabul","nairobi","lagos","pretoria","accra","addis","congress","parliament","pentagon","kremlin","downing","westminster","capitol","senate","bloomberg","reuters","guardian","chronicle","tribune","herald","observer","gazette","johnson","williams","thompson","anderson","mitchell","campbell","robinson","stewart","harrison","jackson","kennedy","morrison","sullivan","patterson","henderson","crawford","marshall","spencer","tucker","wallace","andrews","douglas","fleming","gardner","hamilton","lambert","maxwell","pearson","richards","sanders","warren","webster","stanford","harvard","oxford","cambridge","princeton","columbia","cornell","berkeley","amazon","microsoft","google","tesla","apple","samsung","intel","oracle","goldman","morgan","barclays","deutsche","citibank","nomura","fidelity","schwab","boeing","airbus","lockheed","raytheon","northrop","siemens","philips","hitachi","ferrari","porsche","honda","toyota","nissan","volvo","hyundai","renault","pfizer","moderna","novartis","merck","abbott","bristol","roche","sanofi","atlantic","pacific","arctic","mediterranean","caribbean","baltic","adriatic","caspian","sahara","congo","danube","thames","rhine","nile","ganges","yangtze","clinton","carter","nixon","reagan","lincoln","churchill","macron","trudeau","merkel","erdogan","netanyahu","kishida","albanese","starmer","scholz","sunak","africa","europe","america","australia","canada","mexico","brazil","argentina","colombia","chile","peru","ecuador","bolivia","uruguay","paraguay","venezuela","china","india","japan","korea","taiwan","thailand","vietnam","malaysia","indonesia","philippines","myanmar","pakistan","bangladesh","nepal","lanka","cambodia","germany","france","britain","spain","italy","poland","ukraine","romania","sweden","norway","denmark","finland","ireland","scotland","belgium","austria","egypt","turkey","iran","iraq","syria","jordan","lebanon","israel","nigeria","kenya","ghana","ethiopia","tanzania","uganda","rwanda","senegal","russia","georgia","belarus","armenia","serbia","croatia","bulgaria","hungary","nato","asean","opec","unesco","unicef","brics","interpol","europol"
];

// -- PERCENTAGES (256 clean financial and news percentage / statistic figures) ----------
export const PERCENTAGES: string[] = Array.from(new Set([
  "0.1%","0.2%","0.25%","0.3%","0.4%","0.5%","0.6%","0.7%","0.75%","0.8%","0.9%","1.0%",
  "1.1%","1.2%","1.25%","1.3%","1.4%","1.5%","1.6%","1.7%","1.75%","1.8%","1.9%","2.0%",
  "2.1%","2.2%","2.25%","2.3%","2.4%","2.5%","2.6%","2.7%","2.75%","2.8%","2.9%","3.0%",
  "3.1%","3.2%","3.25%","3.3%","3.4%","3.5%","3.6%","3.7%","3.75%","3.8%","3.9%","4.0%",
  "4.1%","4.2%","4.25%","4.3%","4.4%","4.5%","4.6%","4.7%","4.75%","4.8%","4.9%","5.0%",
  "5.1%","5.2%","5.25%","5.3%","5.4%","5.5%","5.6%","5.7%","5.75%","5.8%","5.9%","6.0%",
  "6.1%","6.2%","6.25%","6.3%","6.4%","6.5%","6.6%","6.7%","6.75%","6.8%","6.9%","7.0%",
  "7.1%","7.2%","7.25%","7.3%","7.4%","7.5%","7.6%","7.7%","7.75%","7.8%","7.9%","8.0%",
  "8.1%","8.2%","8.25%","8.3%","8.4%","8.5%","8.6%","8.7%","8.75%","8.8%","8.9%","9.0%",
  "9.1%","9.2%","9.25%","9.3%","9.4%","9.5%","9.6%","9.7%","9.75%","9.8%","9.9%","10.0%",
  "10.1%","10.2%","10.25%","10.5%","10.8%","11.0%","11.2%","11.25%","11.5%","11.8%","12.0%",
  "12.1%","12.25%","12.5%","12.8%","13.0%","13.25%","13.5%","13.8%","14.0%","14.25%","14.5%",
  "14.8%","15.0%","15.2%","15.23%","15.25%","15.5%","15.8%","16.0%","16.25%","16.5%","16.8%",
  "17.0%","17.25%","17.5%","18.0%","18.25%","18.5%","19.0%","19.25%","19.5%","20.0%","20.25%",
  "20.5%","21.0%","21.5%","22.0%","22.5%","23.0%","23.5%","24.0%","24.5%","25.0%","25.5%",
  "26.0%","26.5%","27.0%","27.5%","28.0%","28.5%","29.0%","29.5%","30.0%","30.5%","31.0%",
  "31.5%","32.0%","32.5%","33.0%","33.5%","34.0%","34.5%","35.0%","35.5%","36.0%","36.5%",
  "37.0%","37.5%","38.0%","38.5%","39.0%","39.5%","40.0%","40.5%","41.0%","41.5%","42.0%",
  "42.5%","43.0%","43.5%","44.0%","44.5%","45.0%","45.5%","46.0%","46.5%","47.0%","47.5%",
  "48.0%","48.5%","49.0%","49.5%","50.0%","51.0%","52.0%","53.0%","54.0%","55.0%","56.0%",
  "57.0%","58.0%","59.0%","60.0%","62.0%","64.0%","65.0%","66.0%","68.0%","70.0%","72.0%",
  "75.0%","78.0%","80.0%","82.0%","85.0%","88.0%","90.0%","92.0%","95.0%","98.0%","100.0%",
  "101.0%","102.0%","105.0%","110.0%"
])).slice(0, 256);

// Function-word lists (exact fixed length for deterministic bits)
export const DETERMINERS: string[] = [
  "the","a","this","some","any","no","one","its"
];

export const PREPOSITIONS: string[] = [
  "in","of","for","on","with","at","by","from","to","into","about","after","during","between","through","across",
  "over","under","before","since","against","around","among","within","toward","upon","along","beyond","without","despite","until","throughout"
];

export const CONJUNCTIONS: string[] = [
  "and","but","while","as","or","yet","although","because","since","though","whereas","unless","whether","when","where","if"
];

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
  PCT: PERCENTAGES,
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

// ============================================================================
// SEMANTICAL NOUN & VERB PARTITIONED CATEGORIES (256 CLEAN UNIQUE WORDS EACH)
// ============================================================================

// 1. CORE_TREND_NOUNS: 256 clean metric, economic, financial, and trend indicator nouns

const CORE_TREND_NOUNS = enforce256List(CORE_TREND_NOUNS_RAW, NOUNS);

// 2. CORE_TREND_VERBS: 256 clean trend progression verbs (rose, fell, grew, declined, expanded...)
const CORE_TREND_VERBS = enforce256List(CORE_TREND_VERBS_RAW, VERBS_PAST);

// 3. METRIC_ACTION_VERBS: 256 clean transitive verbs acting on metrics (raised, lowered, increased...)
const METRIC_ACTION_VERBS_RAW = [
  "raised","lowered","increased","decreased","reduced","expanded","boosted","cut","gained","lost","adjusted","amplified","curbed","curtailed","slashed","trimmed","augmented","capped","doubled","elevated","enhanced","extended","halved","heightened","lifted","limited","maximized","minimized","moderated","modified","multiplied","narrowed","optimized","pushed","restrained","scaled","shortened","stabilized","stimulated","surpassed","sustained","tightened","tripled","upgraded","widened","yielded","balanced","checked","altered","varied","eased","slowed","stalled","bounced","retreated","leveled","fluctuated","shifted","plummeted","spiked","soared","slumped","tumbled","aligned","appreciated","broadened","collapsed","contracted","corrected","depreciated","diminished","dipped","diverged","drifted","escalated","flattened","floated","lessened","normalized","outpaced","rallied","receded","regressed","reset","resumed","reversed","revived","settled","softened","solidified","stagnated","steepened","subsided","swelled","tapered","unraveled","upticked","accumulated","bounded","consolidated","dampened","eclipsed","faltered","folded","hinged","lagged","lengthened","mounted","overtook","paced","paused","pivoted","poised","pressed","prospered","quickened","redefined","regained","relapsed","renewed","restabilized","restructured","retrenched","spurred","stiffened","swung","thrived","topped","trailed","transformed","transitioned","trended","turned","unfolded","unsettled","wavered","controlled","monitored","managed","regulated","directed","oversaw","administered","channeled","guided","steered","piloted","spearheaded","initiated","commenced","targeted","projected","estimated","calculated","budgeted","allocated","appropriated","assigned","designated","specified","secured","negotiated","finalized","approved","ratified","sanctioned","authorized","endorsed","supported","backed","promoted","championed","defended","protected","maintained","bolstered","reinforced","strengthened","upheld","preserved","retained","safeguarded","sheltered","shielded","fortified","anchored","tracked","recorded","registered","assessed","evaluated","audited","reviewed","analyzed","inspected","measured","quantified","valued","appraised","benchmarked","computed","determined","gauged","indexed","overhauled","recalculated","revaluated","scrutinized","surveyed","tallied","tested","weighted","abated","absorbed","accelerated","acclimated","accommodated","accrued","achieved","acquired","adapted","advanced","affected","aggregated","allotted","amended","annexed","anticipated","apportioned","approximated","arranged","assembled","assimilated","assumed","averaged","built","calibrated","canceled","captured","cataloged","classified","cleared","codified","collected","combined","commanded","commercialized","commissioned","committed","compacted","compared","compensated","compiled","completed","complicated","composed"
];
const METRIC_ACTION_VERBS = enforce256List(METRIC_ACTION_VERBS_RAW, VERBS_PAST);

// 4. ACTION_SUBJECTS_EXTENDED: 256 clean human, institutional, and organizational agent nouns

export const ACTION_SUBJECTS_EXTENDED = enforce256List(ACTION_SUBJECTS_RAW, NOUNS);

// 5. ACTION_OBJECTS_EXTENDED: 256 clean policy, program, report, and document object nouns
export const ACTION_OBJECTS_EXTENDED = enforce256List(ACTION_OBJECTS_RAW, NOUNS);

// 6. ACTION_VERBS_EXTENDED: 256 clean transitive action verbs performed by human/institutional agents
const ACTION_VERBS_RAW = [
  "announced","supported","proposed","rejected","approved","launched","created","developed","introduced","published","released","signed","adopted","defended","backed","changed","submitted","issued","authorized","sanctioned","passed","ratified","endorsed","promoted","reviewed","revised","updated","modified","expanded","drafted","enacted","implemented","accepted","considered","presented","delayed","withdrew","suspended","challenged","examined","evaluated","assessed","directed","managed","led","organized","established","formed","structured","secured","negotiated","finalized","requested","demanded","ordered","urged","favored","opposed","condemned","praised","welcomed","criticized","discussed","debated","surveyed","investigated","audited","inspected","verified","validated","certified","unveiled","revealed","disclosed","outlined","detailed","summarized","clarified","explained","reaffirmed","emphasized","highlighted","underlined","stressed","voiced","expressed","stated","declared","proclaimed","asserted","claimed","confirmed","acknowledged","admitted","conceded","denied","refused","dismissed","overruled","vetoed","repealed","rescinded","revoked","cancelled","postponed","deferred","rescheduled","extended","renewed","restructured","reorganized","transformed","reformed","overhauled","modernized","upgraded","strengthened","reinforced","bolstered","boosted","enhanced","improved","broadened","scaled","increased","reduced","cut","lowered","curbed","restricted","limited","capped","constrained","regulated","controlled","monitored","supervised","guided","steered","piloted","spearheaded","initiated","commenced","triggered","instigated","pioneered","founded","built","constructed","designed","engineered","crafted","framed","formulated","devised","conceived","planned","projected","estimated","calculated","budgeted","allocated","appropriated","assigned","designated","appointed","nominated","selected","chose","named","elected","installed","stationed","deployed","positioned","dispatched","sent","transferred","relocated","moved","shifted","redirected","channeled","diverted","routed","delivered","supplied","provided","furnished","offered","granted","awarded","conferred","bestowed","pledged","guaranteed","promised","committed","dedicated","devoted","applied","utilized","employed","executed","enforced","administered","handled","conducted","chaired","hosted","sponsored","coordinated","facilitated","assisted","aided","helped","championed","shielded","safeguarded","protected","upheld","maintained","preserved","retained","commissioned","promulgated","decreed","instituted","orchestrated","oversaw","governed","standardized","formalized","advocated","articulated","assembled","authored","balanced","benchmarked","briefed","cataloged","chartered","circulated","classified","communicated","compiled","composed","conceptualized","consolidated","consulted","said","reported","argued","suggested","showed","indicated"
];
export const ACTION_VERBS_EXTENDED = enforce256List(ACTION_VERBS_RAW, VERBS_PAST);

// 7. REPORTING_SUBJECTS_PROPER: 256 clean proper names / news agencies
export const REPORTING_SUBJECTS_PROPER: string[] = enforce256List(REPORTING_SUBJECTS_PROPER_RAW, PROPER_NOUNS);

// 8. LOCATION_PROPER_NOUNS: 256 clean proper location names
const GEOGRAPHIC_LOCATIONS_RAW = [
  "washington","london","beijing","moscow","berlin","paris","tokyo","ottawa","brussels","geneva","vienna","madrid","rome","seoul","ankara","cairo","dublin","warsaw","prague","stockholm","oslo","helsinki","lisbon","athens","sydney","melbourne","toronto","vancouver","montreal","auckland","mumbai","delhi","shanghai","taipei","singapore","bangkok","jakarta","manila","hanoi","riyadh","tehran","baghdad","kabul","nairobi","lagos","pretoria","accra","addis","chicago","houston","phoenix","dallas","boston","atlanta","miami","seattle","denver","detroit","minneapolis","amsterdam","budapest","bucharest","kiev","zurich","frankfurt","munich","milan","naples","barcelona","valencia","porto","edinburgh","belfast","lyon","marseille","copenhagen","riga","vilnius","tallinn","zagreb","belgrade","sofia","bratislava","ljubljana","sarajevo","skopje","tirana","yerevan","tbilisi","baku","tashkent","almaty","astana","doha","dubai","muscat","amman","beirut","damascus","jerusalem","jeddah","alexandria","tunis","algiers","rabat","casablanca","khartoum","kampala","kigali","lusaka","harare","maputo","luanda","kinshasa","dakar","abidjan","johannesburg","canberra","perth","brisbane","adelaide","hobart","christchurch","wellington","osaka","kyoto","nagoya","fukuoka","sapporo","busan","incheon","guangzhou","shenzhen","chengdu","wuhan","xian","tianjin","chongqing","kolkata","chennai","bengaluru","hyderabad","ahmedabad","pune","karachi","lahore","islamabad","dhaka","colombo","kathmandu","male","vientiane","yangon","florence","venice","seville","nice","antwerp","rotterdam","africa","europe","america","australia","asia","canada","mexico","brazil","argentina","colombia","chile","peru","ecuador","bolivia","uruguay","paraguay","venezuela","china","india","japan","korea","taiwan","thailand","vietnam","malaysia","indonesia","philippines","myanmar","pakistan","bangladesh","nepal","lanka","cambodia","germany","france","britain","spain","italy","poland","ukraine","romania","sweden","norway","denmark","finland","ireland","scotland","belgium","austria","egypt","turkey","iran","iraq","syria","jordan","lebanon","israel","nigeria","kenya","ghana","ethiopia","tanzania","uganda","rwanda","senegal","russia","georgia","belarus","armenia","serbia","croatia","bulgaria","hungary","greece","portugal","netherlands","switzerland","morocco","algeria","tunisia","sudan","zambia","zimbabwe","angola","congo","qatar","oman","yemen","kuwait","bahrain","fiji","samoa","iceland","malta","cyprus","california","texas"
];
export const LOCATION_PROPER_NOUNS: string[] = enforce256List(GEOGRAPHIC_LOCATIONS_RAW, PROPER_NOUNS);

// 9. REPORTING_CLAUSE_VERBS: 256 clean reporting/attribution verbs
const REPORTING_CLAUSE_VERBS_RAW = [
  "said","stated","reported","announced","confirmed","noted","argued","warned","explained","claimed","suggested","indicated","detailed","revealed","declared","acknowledged","disclosed","added","described","emphasized","highlighted","underlined","stressed","asserted","reaffirmed","insisted","recounted","maintained","observed","commented","remarked","pointed","specified","clarified","outlined","summarized","reiterated","contended","pledged","vowed","promised","guaranteed","voiced","expressed","conceded","admitted","denied","refused","dismissed","rejected","countered","responded","replied","retorted","testified","swore","affirmed","certified","verified","validated","attested","endorsed","backed","supported","defended","urged","called","demanded","requested","proposed","recommended","advised","cautioned","admonished","appealed","pleaded","floated","mooted","tabled","presented","submitted","filed","issued","released","published","broadcast","aired","transmitted","circulated","distributed","disseminated","publicized","promoted","heralded","proclaimed","decreed","ordered","directed","commanded","instructed","charged","tasked","assigned","authorized","sanctioned","approved","ratified","signed","enacted","passed","adopted","championed","spearheaded","introduced","launched","unveiled","averred","vouched","corroborated","substantiated","seconded","echoed","concurred","agreed","acquiesced","assented","consented","subscribed","favored","advocated","pushed","pressed","lobbied","campaigned","strove","labored","worked","bound","committed","dedicated","devoted","warranted","assured","reassured","satisfied","convinced","persuaded","swayed","influenced","moved","prompted","inspired","motivated","driven","led","guided","steered","piloted","channeled","conducted","managed","administered","handled","signaled","professed","elaborated","postulated","conjectured","adjudged","appraised","estimated","calculated","projected","surmised","hypothesized","communicated","relayed","notified","informed","briefed","apprised","manifested","insinuated","intimated","promulgated","enunciated","articulated","formulated","framed","ventilated","asseverated","adjudicated","alleged","amplified","analysed","annotated","appended","applauded","approbated","authenticated","avouched","broadcasted","chided","chronicled","cited","classified","commentated","showed","planned","expected","sought","protected","upheld","drove","oversaw","controlled","monitored","created","built","developed","designed","established","formed","increased","grew","expanded","rose","improved","advanced","strengthened","boosted","reduced","cut","lowered","dropped","declined","fell","shrank","limited","faced","encountered","confronted","addressed","tackled","regulated","resolved","joined","entered","participated","attended","gathered","assembled","met","connected","opened","began"
];
const REPORTING_CLAUSE_VERBS = enforce256List(REPORTING_CLAUSE_VERBS_RAW, VERBS_PAST);

// 10. CAUSE_ADJECTIVES: 256 clean cause/severity adjectives
const CAUSE_ADJECTIVES = enforce256List(CAUSE_ADJECTIVES_RAW, ADJECTIVES);

// 11. CAUSE_NOUNS: 256 clean crisis, shortage, conflict, disease, storm, event nouns
const CAUSE_NOUNS = enforce256List(CAUSE_NOUNS_RAW, NOUNS);

// 12. CAUSE_VERBS: 256 clean cause progression verbs
const CAUSE_VERBS = enforce256List(CAUSE_VERBS_RAW, VERBS_PAST);

// 13. APPOSITIVE_REQUEST_VERBS: 256 clean request/action verbs
const APPOSITIVE_REQUEST_VERBS_RAW = [
  "requested","demanded","proposed","approved","issued","submitted","offered","provided","released","published","adopted","presented","confirmed","announced","disclosed","rejected","sought","urged","called","drafted","authored","prepared","delivered","signed","passed","backed","supported","endorsed","promoted","tabled","floated","mooted","advanced","introduced","sponsored","recommended","advised","suggested","cautioned","appealed","pleaded","petitioned","solicited","requisitioned","ordered","directed","commanded","instructed","charged","tasked","assigned","authorized","sanctioned","ratified","enacted","promulgated","decreed","proclaimed","declared","stated","asserted","affirmed","maintained","contended","argued","insisted","emphasized","highlighted","underlined","stressed","accentuated","voiced","expressed","articulated","formulated","framed","devised","conceived","crafted","designed","engineered","constructed","built","established","founded","instituted","initiated","commenced","launched","spearheaded","piloted","pioneered","championed","pushed","advocated","lobbied","campaigned","strove","exerted","labored","worked","tried","endeavored","attempted","aimed","targeted","intended","planned","projected","estimated","calculated","budgeted","allocated","appropriated","designated","specified","secured","negotiated","finalized","arranged","coordinated","facilitated","assisted","aided","helped","shielded","safeguarded","protected","upheld","tendered","proffered","forwarded","transmitted","relayed","dispatched","communicated","implored","entreated","besought","importuned","exhortation","prompted","adjudicated","alleged","allotted","amended","applied","said","reported","claimed","revealed","showed","indicated","warned","noted","added","explained","described","expected","defended","led","drove","guided","managed","oversaw","controlled","monitored","created","developed","formed","increased","grew","expanded","rose","improved","strengthened","boosted","reduced","cut","lowered","dropped","declined","fell","shrank","limited","faced","encountered","confronted","addressed","tackled","handled","regulated","resolved","joined","entered","participated","attended","gathered","assembled","met","connected","opened","began","started","triggered","activated","enabled","closed","ended","stopped","concluded","finished","halted","terminated","suspended","moved","shifted","transferred","relocated","traveled","crossed","reached","approached","remained","stayed","continued","persisted","endured","lasted","survived","held","supplied","gave","granted","distributed","received","got","obtained","gained","earned","collected","accepted","acquired","required","needed","compelled","involved","included","contained","covered","encompassed","allowed","permitted","empowered","awarded","prevented"
];
const APPOSITIVE_REQUEST_VERBS = enforce256List(APPOSITIVE_REQUEST_VERBS_RAW, VERBS_PAST);

// 14. UNRESOLVED_COMPLEMENT_VERBS: 256 clean linking / copular verbs
const UNRESOLVED_COMPLEMENT_VERBS_RAW = [
  "remained","stayed","seemed","appeared","proved","became","ended","continued","felt","grew","turned","sounded","looked","stood","persisted","lingered","kept","ran","held","lay","sat","rested","evolved","showed","emerged","started","began","commenced","unfolded","transpired","happened","occurred","prevailed","existed","loomed","survived","endured","lasted","flourished","prospered","thrived","stagnated","stalled","halted","stopped","paused","wavered","hesitated","faltered","lagged","trailed","led","guided","soared","plummeted","slumped","rebounded","recovered","surged","slipped","dipped","dropped","rose","fell","declined","expanded","contracted","shrank","subsided","abated","moderated","eased","cooled","warmed","spiked","peaked","bottomed","bounced","advanced","gained","lost","eroded","decayed","depreciated","appreciated","escalated","leveled","flattened","accelerated","slowed","stiffened","softened","tightened","loosened","narrowed","broadened","deepened","heightened","intensified","weakened","strengthened","lengthened","shortened","stabilized","normalized","reset","resumed","reversed","revived","settled","solidified","swelled","tapered","unraveled","yielded","accumulated","balanced","consolidated","dampened","eclipsed","extended","folded","hinged","mounted","multiplied","paced","pivoted","poised","pressed","quickened","redefined","regained","relapsed","renewed","restabilized","restructured","retrenched","spurred","swung","topped","transformed","transitioned","trended","unsettled","widened","converged","diverged","drifted","floated","regressed","receded","rallied","upticked","diminished","corrected","amplified","altered","aligned","adjusted","tumbled","halved","tripled","doubled","shifted","fluctuated","varied","deteriorated","debased","degraded","devalued","dwindled","abided","acclimated","said","reported","claimed","argued","suggested","revealed","confirmed","announced","indicated","warned","noted","added","explained","stated","described","planned","expected","sought","called","demanded","urged","proposed","requested","supported","backed","endorsed","promoted","defended","protected","maintained","upheld","drove","directed","managed","oversaw","controlled","monitored","created","built","developed","designed","launched","introduced","established","formed","increased","improved","boosted","reduced","cut","lowered","limited","faced","encountered","confronted","addressed","tackled","handled","regulated","resolved","joined","entered","participated","attended","gathered","assembled","met","connected","opened","initiated","triggered","activated","enabled","closed","concluded","finished","terminated","suspended","moved","transferred","relocated","traveled","crossed"
];
const UNRESOLVED_COMPLEMENT_VERBS = enforce256List(UNRESOLVED_COMPLEMENT_VERBS_RAW, VERBS_PAST);

// 15. COMPLEMENT_ADJECTIVES: 256 clean predicate adjectives
const COMPLEMENT_ADJECTIVES = enforce256List(COMPLEMENT_ADJECTIVES_RAW, ADJECTIVES);

const CAUSE_LINKERS = ["because","as","since","while"];

// 17. ACTION_ADVERBS: 256 clean action modifiers
const ACTION_ADVERBS_RAW = [
  "recently","publicly","strongly","formally","widely","closely","openly","repeatedly","quietly","quickly","carefully","directly","officially","successfully","privately","eventually","promptly","immediately","eagerly","boldly","bravely","cautiously","hesitantly","nervously","wearily","skeptically","warily","freely","generously","graciously","warmly","kindly","favorably","positively","constructively","strictly","tightly","rigidly","harshly","sternly","bluntly","candidly","plainly","equally","similarly","likewise","correspondingly","identically","uniformly","evenly","symmetrically","outward","worldwide","globally","regionally","domestically","internally","externally","laterally","swiftly","decisively","enthusiastically","passionately","vigorously","energetically","aggressively","actively","consistently","continuously","persistently","separately","independently","collectively","jointly","mutually","simultaneously","respectively","accordingly","meanwhile","however","nevertheless","furthermore","moreover","consequently","fortunately","unfortunately","surprisingly","interestingly","reportedly","allegedly","supposedly","presumably","typically","normally","generally","commonly","traditionally","historically","conventionally","routinely","relatively","comparatively","proportionally","intently","earnestly","resolutely","steadfastly","unflinchingly","strenuously","zealously","adequately","admirably","agilely","alertly","ambitiously","analytically","ardently","artfully","also","now","already","still","just","even","only","currently","previously","initially","originally","finally","ultimately","often","usually","always","never","sometimes","rarely","frequently","occasionally","here","there","anywhere","everywhere","abroad","overseas","locally","nationally","very","quite","rather","fairly","extremely","highly","deeply","significantly","well","badly","slowly","steadily","rapidly","gradually","soon","early","late","again","once","twice","daily","annually","together","alone","apart","aside","ahead","behind","forward","backward","likely","possibly","probably","certainly","definitely","clearly","obviously","apparently","secretly","indirectly","firmly","sharply","broadly","largely","mostly","primarily","simply","merely","barely","hardly","nearly","almost","approximately","roughly","particularly","especially","specifically","notably","remarkably","increasingly","dramatically","substantially","effectively","efficiently","marginally","slightly","moderately","considerably","tremendously","exactly","precisely","accurately","correctly","properly","appropriately","sufficiently","surely","absolutely","entirely","completely","totally","fully","wholly","thoroughly","partly","partially","somewhat","modestly","mildly","minimally","nominally","technically","naturally","automatically","systematically","strategically","deliberately","intentionally","voluntarily","willingly","temporarily","permanently","indefinitely","briefly","momentarily","periodically","intermittently","sporadically","safely"
];
const ACTION_ADVERBS = enforce256List(ACTION_ADVERBS_RAW, ADVERBS);

// 18. DISCOURSE_ADVERBS: 256 clean discourse connectors
const DISCOURSE_ADVERBS_RAW = [
  "however","meanwhile","nevertheless","nonetheless","instead","also","indeed","similarly","furthermore","additionally","still","otherwise","rather","likewise","conversely","ultimately","consequently","accordingly","thus","therefore","hence","besides","moreover","then","further","finally","initially","originally","subsequently","thereafter","afterward","contrariwise","alternatively","notwithstanding","regardlessly","anyway","anyhow","equally","correspondingly","identically","uniformly","consistently","compatibly","harmoniously","eventually","undoubtedly","assuredly","certainly","definitely","plainly","clearly","evidently","manifestly","patently","unmistakably","decisively","conclusively","emphatically","resolutely","firmly","steadfastly","unwaveringly","firstly","secondly","thirdly","lastly","incidentally","parenthetically","tangentially","coincidentally","admittedly","concededly","doubtless","indubitably","indisputably","unquestionably","now","already","just","even","only","recently","currently","previously","immediately","promptly","often","usually","always","never","sometimes","rarely","frequently","occasionally","here","there","anywhere","everywhere","abroad","overseas","locally","nationally","very","quite","fairly","extremely","highly","deeply","significantly","well","badly","carefully","quickly","slowly","steadily","rapidly","gradually","soon","early","late","again","once","twice","daily","annually","together","alone","apart","aside","ahead","behind","forward","backward","likely","possibly","probably","obviously","apparently","officially","formally","publicly","privately","openly","secretly","directly","indirectly","strongly","sharply","broadly","widely","largely","mostly","primarily","simply","merely","barely","hardly","nearly","almost","approximately","roughly","particularly","especially","specifically","notably","remarkably","increasingly","dramatically","substantially","successfully","effectively","efficiently","actively","continuously","repeatedly","persistently","separately","independently","collectively","jointly","mutually","simultaneously","respectively","fortunately","unfortunately","surprisingly","interestingly","reportedly","allegedly","supposedly","presumably","typically","normally","generally","commonly","traditionally","historically","conventionally","routinely","relatively","comparatively","proportionally","marginally","slightly","moderately","considerably","tremendously","exactly","precisely","accurately","correctly","properly","appropriately","adequately","sufficiently","surely","absolutely","entirely","completely","totally","fully","wholly","thoroughly","partly","partially","somewhat","modestly","mildly","minimally","nominally","technically","naturally","automatically","systematically","strategically","deliberately","intentionally","voluntarily","willingly","temporarily","permanently","indefinitely","briefly","momentarily","periodically","intermittently","sporadically","safely","securely","peacefully","calmly","quietly","silently","gently","smoothly","urgently"
];
const DISCOURSE_ADVERBS = enforce256List(DISCOURSE_ADVERBS_RAW, ADVERBS);

// 19. EFFECT_ADVERBS: 256 clean rate/degree adverbs
const EFFECT_ADVERBS_RAW = [
  "sharply","steadily","rapidly","gradually","significantly","modestly","slightly","dramatically","quickly","slowly","noticeably","substantially","marginally","consistently","suddenly","further","steeply","precipitously","markedly","considerably","tremendously","immensely","drastically","severely","acutely","intensely","profoundly","deeply","greatly","hugely","massively","enormously","vastly","broadly","widely","largely","mostly","primarily","principally","chiefly","mainly","appreciably","perceptibly","visibly","clearly","manifestly","evidently","obviously","undoubtedly","certainly","definitely","decisively","conclusively","moderately","progressively","continuously","measureably","noticably","extensively","sweepingly","adaptively","adequately","aggressively","alarmingly","amplifiedly","astoundingly","also","now","already","still","just","even","only","recently","currently","previously","initially","originally","finally","ultimately","immediately","promptly","often","usually","always","never","sometimes","rarely","frequently","occasionally","here","there","anywhere","everywhere","abroad","overseas","locally","nationally","very","quite","rather","fairly","extremely","highly","well","badly","carefully","soon","early","late","again","once","twice","daily","annually","together","alone","apart","aside","ahead","behind","forward","backward","likely","possibly","probably","apparently","officially","formally","publicly","privately","openly","secretly","directly","indirectly","strongly","firmly","simply","merely","barely","hardly","nearly","almost","approximately","roughly","particularly","especially","specifically","notably","remarkably","increasingly","successfully","effectively","efficiently","actively","repeatedly","persistently","separately","independently","collectively","jointly","mutually","simultaneously","respectively","accordingly","meanwhile","however","nevertheless","furthermore","moreover","consequently","fortunately","unfortunately","surprisingly","interestingly","reportedly","allegedly","supposedly","presumably","typically","normally","generally","commonly","traditionally","historically","conventionally","routinely","relatively","comparatively","proportionally","exactly","precisely","accurately","correctly","properly","appropriately","sufficiently","surely","absolutely","entirely","completely","totally","fully","wholly","thoroughly","partly","partially","somewhat","mildly","minimally","nominally","technically","naturally","automatically","systematically","strategically","deliberately","intentionally","voluntarily","willingly","temporarily","permanently","indefinitely","briefly","momentarily","periodically","intermittently","sporadically","safely","securely","peacefully","calmly","quietly","silently","gently","smoothly","urgently","desperately","critically","seriously","gravely","enthusiastically","eagerly","passionately","vigorously","energetically","boldly","bravely","cautiously","reluctantly","hesitantly","nervously","anxiously","wearily","skeptically","warily"
];
const EFFECT_ADVERBS = enforce256List(EFFECT_ADVERBS_RAW, ADVERBS);

// 20. CONDITION_NOUNS: 256 clean condition/event nouns
const CONDITION_NOUNS = enforce256List(CONDITION_NOUNS_RAW, NOUNS);

// 21. CONDITION_VERBS: 256 clean condition progression verbs
const CONDITION_VERBS = enforce256List(CONDITION_VERBS_RAW, VERBS_PAST);

// 22. RELATIVE_ANTECEDENTS: 256 clean institutional/organizational nouns
export const RELATIVE_ANTECEDENTS = enforce256List(RELATIVE_ANTECEDENTS_RAW, NOUNS);

// 23. RELATIVE_SUBJECTS: 256 clean agent plural nouns
const RELATIVE_SUBJECTS_RAW = [
  "officials","lawmakers","regulators","voters","ministers","leaders","researchers","judges","members","delegates","senators","residents","workers","analysts","witnesses","representatives","officers","detectives","investigators","inspectors","auditors","examiners","specialists","experts","advisors","consultants","strategists","economists","scientists","biologists","chemists","physicists","engineers","technicians","developers","programmers","designers","architects","planners","coordinators","managers","supervisors","administrators","directors","founders","trustees","investors","shareholders","traders","brokers","financiers","bankers","lenders","creditors","borrowers","merchants","vendors","suppliers","contractors","operators","employers","employees","laborers","staff","crews","participants","attendees","cadres","ranks","troops","personnel","veterans","pioneers","donors","sponsors","supporters","advocates","critics","opponents","allies","partners","rivals","competitors","candidates","contenders","entrants","nominees","appointees","successors","predecessors","deputies","assistants","aides","associates","colleagues","peers","fellows","observers","spectators","bystanders","victims","survivors","inhabitants","dwellers","locals","natives","foreigner","immigrants","refugees","migrants","travelers","visitors","guests","hosts","organizers","creators","writers","reporters","editors","broadcasters","columnists","correspondents","producers","filmmakers","musicians","singers","performers","legislators","attorneys","lawyers","prosecutors","jurors","magistrates","chancellors","premiers","mayors","governors","ambassadors","diplomats","envoys","dignitaries","spokesmen","spokespersons","spokeswomen","chairpersons","chairmen","chairwomen","stewards","guardians","custodians","monitors","agents","emissaries","commissioners","chiefs","heads","commanders","captains","marshals","constables","wardens","sheriffs","operatives","scholars","professors","academics","authors","journalists","reviewers","evaluators","assessors","arbitrators","mediators","negotiators","statesmen","politicians","campaigners","activists","lobbyists","patrons","benefactors","accountants","report","market","policy","program","system","country","government","president","election","campaign","economy","industry","community","company","security","council","budget","crisis","summit","treaty","border","conflict","reform","strategy","network","agency","coalition","alliance","foundation","commission","authority","parliament","court","trial","verdict","sentence","witness","evidence","justice","crime","police","investigation","arrest","charge","prison","penalty","defense","prosecution","school","student","teacher","education","research","university","science","technology","hospital","patient","doctor","treatment","vaccine","medicine","surgery","disease","team","player","coach","season","match","victory","championship","tournament","stadium","record"
];
export const RELATIVE_SUBJECTS = enforce256List(RELATIVE_SUBJECTS_RAW, NOUNS);

// 24. RELATIVE_VERBS: 256 clean evaluation/action verbs inside relative clauses
const RELATIVE_VERBS_RAW = [
  "criticized","backed","rejected","approved","supported","opposed","questioned","challenged","examined","endorsed","investigated","defended","reviewed","signed","blocked","adopted","praised","welcomed","condemned","disputed","debated","discussed","evaluated","audited","inspected","verified","validated","scrutinized","analyzed","assessed","surveyed","monitored","supervised","controlled","regulated","modified","revised","updated","amended","expanded","restricted","limited","sanctioned","authorized","passed","ratified","drafted","enacted","implemented","executed","administered","managed","directed","guided","steered","spearheaded","initiated","launched","created","developed","established","formed","structured","secured","negotiated","finalized","requested","demanded","ordered","urged","favored","proposed","submitted","presented","delayed","suspended","postponed","cancelled","revoked","repealed","rescinded","vetoed","overruled","dismissed","refused","denied","conceded","admitted","acknowledged","confirmed","asserted","claimed","proclaimed","declared","stated","expressed","voiced","stressed","underlined","highlighted","emphasized","reaffirmed","clarified","explained","summarized","detailed","outlined","disclosed","revealed","unveiled","certified","corroborated","substantiated","seconded","echoed","concurred","agreed","acquiesced","assented","consented","subscribed","advocated","pushed","pressed","lobbied","campaigned","strove","labored","worked","bound","committed","dedicated","devoted","guaranteed","warranted","assured","reassured","satisfied","convinced","persuaded","swayed","influenced","moved","prompted","inspired","motivated","driven","piloted","channeled","conducted","handled","operated","ran","governed","ruled","headed","chaired","hosted","sponsored","coordinated","organized","arranged","instructed","charged","tasked","assigned","designated","appointed","nominated","selected","chose","named","installed","stationed","deployed","positioned","dispatched","sent","transferred","relocated","shifted","redirected","diverted","routed","delivered","supplied","provided","furnished","offered","granted","awarded","conferred","bestowed","pledged","shielded","safeguarded","protected","upheld","maintained","preserved","accentuated","acclaimed","accommodated","accredited","acquired","actuated","said","reported","argued","suggested","announced","showed","indicated","warned","noted","added","described","planned","expected","sought","called","promoted","led","drove","oversaw","built","designed","introduced","increased","grew","rose","improved","advanced","strengthened","boosted","reduced","cut","lowered","dropped","declined","fell","shrank","faced","encountered","confronted","addressed","tackled","resolved","joined","entered","participated","attended","gathered","assembled","met","connected"
];
export const RELATIVE_VERBS = enforce256List(RELATIVE_VERBS_RAW, VERBS_PAST);

// 25. EFFECT_SCOPE_ADJECTIVES: 256 clean scope adjectives
export const EFFECT_SCOPE_ADJECTIVES = enforce256List(EFFECT_SCOPE_ADJECTIVES_RAW, ADJECTIVES);

// 26. EFFECT_TYPE_ADJECTIVES: 256 clean sector adjectives
export const EFFECT_TYPE_ADJECTIVES = enforce256List(EFFECT_TYPE_ADJECTIVES_RAW, ADJECTIVES);

// 27. EFFECT_NOUNS: 256 clean output, metric, and economic result nouns
export const EFFECT_NOUNS = enforce256List(EFFECT_NOUNS_RAW, NOUNS);

// 28. EFFECT_VERBS: 256 clean effect progression verbs
export const EFFECT_VERBS = enforce256List(EFFECT_VERBS_RAW, VERBS_PAST);

// 29. AFTER_EVENTS: 256 clean event, meeting, and proceeding nouns
const AFTER_EVENTS_RAW = [
  "talks","negotiations","elections","hearings","discussions","debates","demonstrations","meetings","raids","clashes","investigations","consultations","interviews","strikes","trials","sessions","conferences","summits","audits","reviews","forums","panels","assemblies","polls","proceedings","deliberations","briefings","encounters","confrontations","conflicts","rallies","votes","ballots","referendums","primaries","conventions","symposia","caucuses","gatherings","summitry","dialogues","parleys","protests","walkouts","boycotts","stoppages","pickets","marches","processions","campaigns","drives","initiatives","operations","missions","maneuvers","exercises","drills","inspections","surveys","assessments","evaluations","inquiries","probes","inquests","examinations","screenings","tests","experiments","studies","workshops","keynotes","lectures","seminars","presentations","broadcasts","telecasts","podcasts","statements","addresses","speeches","discourses","exchanges","bargaining","arbitrations","mediations","conciliations","settlements","adjudications","rulings","verdicts","judgments","sentences","appeals","lawsuits","litigations","prosecutions","arraignments","indictments","depositions","affidavits","subpoenas","injunctions","decrees","directives","mandates","orders","resolutions","motions","petitions","amendments","reforms","revisions","overhauls","restructurings","reorganizations","transformations","transitions","shifts","developments","episodes","incidents","occurrences","events","affairs","scandals","crises","emergencies","disasters","tragedies","calamities","mishaps","accidents","collisions","skirmishes","battles","engagements","offensives","assaults","attacks","agreements","allegations","allocations","altercations","analyses","report","market","policy","program","system","country","government","president","election","campaign","economy","industry","community","company","security","council","budget","crisis","summit","treaty","border","conflict","reform","strategy","network","agency","coalition","alliance","foundation","commission","authority","parliament","court","trial","verdict","sentence","witness","evidence","justice","crime","police","investigation","arrest","charge","prison","penalty","defense","prosecution","school","student","teacher","education","research","university","science","technology","hospital","patient","doctor","treatment","vaccine","medicine","surgery","disease","team","player","coach","season","match","victory","championship","tournament","stadium","record","athlete","league","crowd","rival","title","score","family","children","mother","father","district","neighbor","household","generation","finance","trade","export","investment","growth","profit","revenue","stock","climate","energy","environment","pollution","forest","ocean","wildlife","resource","bridge","highway","airport","railway","station","tunnel","harbor","terminal"
];
const AFTER_EVENTS = enforce256List(AFTER_EVENTS_RAW, NOUNS);

const CONDITION_DETERMINERS = ["the","some","no","any"];
const OBJECT_DETERMINERS = ["the","some","no","any"];

// Distinct sentence word counts allow deterministic template identification.
export const TEMPLATES: Slot[][] = [
  // 0 / 6 words: The major market rose in London.
  [D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(CORE_TREND_NOUNS, "N"), D(CORE_TREND_VERBS, "VP"), F(["in"], "p"), D(LOCATION_PROPER_NOUNS, "NP")],

  // 1 / 8 words: The major market rose sharply 5.1% in London.
  [D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(CORE_TREND_NOUNS, "N"), D(CORE_TREND_VERBS, "VP"), D(EFFECT_ADVERBS, "R"), D(PERCENTAGES, "PCT"), F(["in"], "p"), D(LOCATION_PROPER_NOUNS, "NP")],

  // 2 / 7 words: If the drought worsened, prices rose 5.1%.
  [F(["if"], "c"), D(CONDITION_DETERMINERS, "d"), D(CONDITION_NOUNS, "N"), D(CONDITION_VERBS, "VP", ","), D(EFFECT_NOUNS, "N"), D(EFFECT_VERBS, "VP"), D(PERCENTAGES, "PCT")],

  // 3 / 9 words: After talks, however, the official recently raised the strategy.
  [F(["after"], "p"), D(AFTER_EVENTS, "N", ","), D(DISCOURSE_ADVERBS, "R", ","), D(DETERMINERS, "d"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_ADVERBS, "R"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 4 / 10 words: The coalition, which officials publicly criticized, eventually backed the reform.
  [D(DETERMINERS, "d"), D(RELATIVE_ANTECEDENTS, "N", ","), F(["which"], "c"), D(RELATIVE_SUBJECTS, "N"), D(ACTION_ADVERBS, "R"), D(RELATIVE_VERBS, "VP", ","), D(ACTION_ADVERBS, "R"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 5 / 12 words: Local food prices rose 5.1% in London as the severe shortage persisted.
  [D(EFFECT_SCOPE_ADJECTIVES, "A"), D(EFFECT_TYPE_ADJECTIVES, "A"), D(EFFECT_NOUNS, "N"), D(EFFECT_VERBS, "VP"), D(PERCENTAGES, "PCT"), F(["in"], "p"), D(LOCATION_PROPER_NOUNS, "NP"), D(CAUSE_LINKERS, "c"), D(DETERMINERS, "d"), D(CAUSE_ADJECTIVES, "A"), D(CAUSE_NOUNS, "N"), D(CAUSE_VERBS, "VP")],

  // 6 / 14 words: "The central bank raised interest rates 5.1%", Johnson announced recently in an interview in Washington.
  [D(DETERMINERS, "d", undefined, '"'), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(METRIC_ACTION_VERBS, "VP"), D(CORE_TREND_NOUNS, "N"), D(PERCENTAGES, "PCT", '",'), D(REPORTING_SUBJECTS_PROPER, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), D(ACTION_ADVERBS, "R"), F(["in"], "p"), F(["an"], "d"), F(["interview"], "N"), F(["in"], "p"), D(LOCATION_PROPER_NOUNS, "NP")],

  // 7 / 15 words: Johnson said that the central bank raised interest rates 5.1%, but the agency rejected the proposal.
  [D(REPORTING_SUBJECTS_PROPER, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["that"], "c"), D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(METRIC_ACTION_VERBS, "VP"), D(CORE_TREND_NOUNS, "N"), D(PERCENTAGES, "PCT", ","), F(["but"], "c"), D(DETERMINERS, "d"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N")],

  // 8 / 17 words: "The major company backed the proposal," Johnson said in London, "since the severe shortage persisted in Geneva."
  [D(DETERMINERS, "d", undefined, '"'), D(ADJECTIVES, "A"), D(ACTION_SUBJECTS_EXTENDED, "N"), D(ACTION_VERBS_EXTENDED, "VP"), D(OBJECT_DETERMINERS, "d"), D(ACTION_OBJECTS_EXTENDED, "N", '",'), D(REPORTING_SUBJECTS_PROPER, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["in"], "p"), D(LOCATION_PROPER_NOUNS, "NP", ","), D(CAUSE_LINKERS, "c", undefined, '"'), D(DETERMINERS, "d"), D(CAUSE_ADJECTIVES, "A"), D(CAUSE_NOUNS, "N"), D(CAUSE_VERBS, "VP"), F(["in"], "p"), D(LOCATION_PROPER_NOUNS, "NP", '"')],

  // 9 / 18 words: "The officials, including some delegates, requested a formal statement because the talks remained unresolved," Reuters reported on Friday.
  [D(OBJECT_DETERMINERS, "d"), D(RELATIVE_SUBJECTS, "N", ","), F(["including"], "c"), D(OBJECT_DETERMINERS, "d"), D(RELATIVE_SUBJECTS, "N", ","), D(APPOSITIVE_REQUEST_VERBS, "VP"), D(DETERMINERS, "d"), D(ADJECTIVES, "A"), D(ACTION_OBJECTS_EXTENDED, "N"), F(["because"], "c"), D(OBJECT_DETERMINERS, "d"), D(AFTER_EVENTS, "N"), D(UNRESOLVED_COMPLEMENT_VERBS, "VP"), D(COMPLEMENT_ADJECTIVES, "A", ","), D(REPORTING_SUBJECTS_PROPER, "NP"), D(REPORTING_CLAUSE_VERBS, "VPR"), F(["on"], "p"), F(["Friday"], "NP")]
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
const POETRY_COORDINATING_CONJUNCTIONS = [
  "and","yet","but","or"
];
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
  const sentences = text.split(/[.;?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const words = text.toLowerCase().match(/[a-z0-9.%]+/g) || [];

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
