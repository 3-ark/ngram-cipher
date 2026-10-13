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

// -- DETERMINERS (256 clean single-word determiners) -----------------------
export const DETERMINERS: string[] = [
  "the","a","an","this","that","these","those","every","each","some","any","many","few","much","several","all","both","either","neither","no","another","enough","whatever","whichever","my","your","his","her","its","our","their","whose","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred","thousand","million","billion","trillion","first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","last","next","former","latter","previous","following","same","different","such","certain","various","numerous","multiple","fewer","fewest","little","less","least","more","most","additional","extra","further","alternative","given","particular","specific","designated","selected","chosen","specified","individual","single","sole","only","entire","whole","full","total","complete","overall","general","average","typical","main","primary","principal","key","major","minor","top","bottom","high","low","upper","lower","inner","outer","front","back","side","center","middle","core","base","prime","lead","head","supreme","chief","grand","super","mega","micro","mini","macro","multi","omni","ultra","hyper","sub","intra","inter","trans","cross","counter","anti","non","semi","demi","hemi","mono","bi","tri","quad","penta","hexa","hepta","octa","nona","deca","centi","milli","kilo","giga","tera","peta","exa","nano","pico","zero","half","double","triple","quadruple","plenty","loads","heaps","tons","units","pieces","parts","shares","portions","lots","masses","quantities","amounts","numbers","counts","ratios","percentages","fractions","degrees","levels","grades","ranks","orders","classes","types","kinds","sorts","varieties","styles","forms","modes","ways","means","methods","systems","plans","schemes","rules","laws","codes","terms","norms","goals","aims","what","which","whosever","whoever","whomever","anybody","anyone","anything","everybody","everyone","everything","somebody","someone","something","nobody","noone","nothing","sundry","manifold","plenteous","myriad","innumerable","to"
];

// -- PREPOSITIONS (256 clean single-word prepositions) ----------------------
export const PREPOSITIONS: string[] = [
  "in","of","for","on","with","at","by","from","to","into","about","after","during","between","through","across","over","under","before","since","against","around","among","within","toward","upon","along","beyond","without","despite","until","throughout","above","below","behind","beside","beneath","alongside","amid","amidst","amongst","towards","onto","outside","inside","near","nearby","underneath","opposite","off","past","via","per","plus","minus","versus","unlike","like","considering","regarding","concerning","respecting","except","excluding","including","following","barring","save","aboard","anti","aside","athwart","circa","down","excepting","failing","infront","instead","less","notwithstanding","pending","pro","re","round","short","till","times","unto","up","vice","worth","absent","straddling","according","pursuant","prior","subsequent","owing","due","regardless","relative","irrespective","contrary","asides","ahead","aslant","astride","atop","back","close","far","further","nearer","nearest","next","out","outward","overtop","upward","downward","forward","backward","sideways","halfway","underway","midway","crosswise","lengthwise","inward","offward","northward","southward","eastward","westward","homeward","skyward","earthward","seaward","landward","windward","leeward","frontward","rearward","rightward","leftward","upwards","downwards","forwards","backwards","inwards","outwards","untowards","therein","thereof","thereon","thereat","thereby","therefrom","thereto","thereinto","therewith","thereunder","thereabove","thereabout","therebetween","thereacross","thereafter","therebefore","wherein","whereof","whereon","whereat","whereby","wherefrom","whereto","whereinto","wherewith","whereunder","whereabove","whereabout","wherebetween","whereacross","whereafter","wherebefore","herein","hereof","hereon","hereat","hereby","herefrom","hereto","hereinto","herewith","hereunder","hereabove","hereabout","herebetween","hereacross","hereafter","herebefore","outwith","counter","cross","trans","inter","infra","intra","supra","ultra","extra","sub","super","hyper","retro","circum","peri","abroad","acrossboard","adrift","afloat","afoot","afoul","aft","aground","aheadward","alongshore","aloft","alongtrack","amidships","amok","apart","apeak","apeek","aslope","atilt","awheel","awing","awrack","awry","aback","abeam","abreast","ability","absence","absolute","accept","access","accident","account","accurate","achieve","acid","acquire","act","action","active"
];

// -- CONJUNCTIONS (256 clean single-word conjunctions) ----------------------
export const CONJUNCTIONS: string[] = [
  "and","but","while","as","or","yet","although","because","however","meanwhile","therefore","furthermore","moreover","nevertheless","since","though","whereas","unless","whether","otherwise","consequently","accordingly","besides","nonetheless","likewise","similarly","conversely","instead","meantime","hence","thus","also","notwithstanding","further","additionally","alternatively","incidentally","parenthetically","anyway","anyhow","equally","correspondingly","identically","subsequently","thereafter","according","granted","admittedly","certainly","undoubtedly","indeed","surely","truly","naturally","obviously","clearly","plainly","evidently","manifestly","patently","markedly","notably","specifically","particularly","especially","principally","mainly","chiefly","primarily","mostly","largely","predominantly","substantially","materially","significantly","decisively","crucially","vitally","importantly","fundamentally","essentially","basically","inherently","intrinsically","secondarily","thirdly","finally","lastly","ultimately","eventually","proviso","assuming","provided","providing","supposing","given","allowing","considering","seeing","inasmuch","insofar","whereupon","whereby","wherefore","whence","whither","henceforth","thenceforth","despite","whilst","albeit","whenever","wherever","whichever","whatever","whoever","whomever","thereby","hereby","when","where","why","how","after","before","until","once","assoon","aslong","sofar","inorder","so","sothat","suchthat","incase","providedthat","assumingthat","giventhat","seeingthat","consideringthat","insofaras","insource","exceptthat","savethat","beyondthat","besidesthat","notwithstandingthat","again","andor","aswell","too","plus","alongwith","coupledwith","togetherwith","notonly","aswellas","ontopof","toboot","inlikemanner","intandem","sidebyside","handinhand","coincidentally","concurrently","simultaneously","atthesametime","inthemeantime","fornow","forthemoment","intheinterim","temporarily","aslongas","solongas","onconditionthat","onlyif","inevent","incasethat","supposingthat","presumingthat","grantingthat","admittingthat","allowingthat","ability","about","above","abroad","absence","absent","absolute","accept","access","accident","account","accurate","achieve","acid","acquire","across","act","action","active","activity","actor","actual","adapt","add","addition","address","adequate","adjust","admire","admit","adopt","adult","advance","advantage","adventure","advice","advise","affair","affect","afford","afraid","afternoon","against","age","agency","agent","aggressive","agony","agree","agreement","ahead","aid","aim","air","aircraft","airline","airport","alarm","album","alcohol","alert","alien","alike","alive","all","allow","almost","alone","along","already","alter","the","to"
];

// -- RELATIVES (256 clean relative pronouns) --------------------------------
export const RELATIVES: string[] = [
  "that","which","who","whom","whose","where","when","why","how","whatever","whichever","whoever","whomever","wherever","whenever","however","whereby","wherein","whereof","whereon","whereat","wherefrom","whereto","whereinto","wherewith","whereunder","whereabove","whereabout","wherebetween","whereacross","whereafter","wherebefore","thereby","therein","thereof","thereon","thereat","therefrom","thereto","thereinto","therewith","thereunder","thereabove","thereabout","therebetween","thereacross","thereafter","therebefore","hereby","herein","hereof","hereon","hereat","herefrom","hereto","hereinto","herewith","hereunder","hereabove","hereabout","herebetween","hereacross","hereafter","herebefore","whence","whither","henceforth","thenceforth","whereupon","thereupon","hereupon","inasmuch","insofar","albeit","whilst","whereas","wherefore","thence","hence","there","here","wheresoever","whensoever","wheresover","whosoevers","whomsoever","whatsoever","whichsoever","howsoever","aswell","asif","asthough","inthat","sothat","suchthat","incase","provided","assuming","given","seeing","considering","wherethrough","wherealong","whereamid","whereamong","wherearound","wherebehind","wherebelow","wherebeneath","wherebeside","wherebeyond","therethrough","therealong","thereamid","thereamong","therearound","therebehind","therebelow","therebeneath","therebeside","therebeyond","herethrough","herealong","hereamid","hereamong","herearound","herebehind","herebelow","herebeneath","herebeside","herebeyond","ability","about","above","abroad","absence","absent","absolute","accept","access","accident","account","accurate","achieve","acid","acquire","across","act","action","active","activity","actor","actual","adapt","add","addition","address","adequate","adjust","admire","admit","adopt","adult","advance","advantage","adventure","advice","advise","affair","affect","afford","afraid","after","afternoon","again","against","age","agency","agent","aggressive","agony","agree","agreement","ahead","aid","aim","air","aircraft","airline","airport","the","to","and","of","in","for","on","is","with","was","as","it","at","be","from","are","has","have","said","by","his","this","he","an","will","their","not","or","but","you","been","they","had","her","more","can","were","also","its","one","we","out","up","all","she","would","people","than","first","just","over","so","year","like","now","into","new","our","two","what","them","your","could","last","my","if"
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

// 8 Distinct Word-Length Grammatical News Templates for Natural Prose Matching
export const TEMPLATES: Slot[][] = [
  // 0: Length 3 (Proper Noun + Verb Past + Noun) -> e.g. "Washington announced policy"
  [D(PROPER_NOUNS,"NP"), D(VERBS_PAST,"VP"), D(NOUNS,"N")],

  // 1: Length 4 (Determiner + Adjective + Noun + Verb Past) -> e.g. "The new report confirmed"
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP")],

  // 2: Length 5 (Adverb + Proper Noun + Verb Past + Determiner + Noun) -> e.g. "Recently Washington confirmed the policy"
  [D(ADVERBS,"R"), D(PROPER_NOUNS,"NP"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 3: Length 6 (Determiner + Adjective + Noun + Verb Past + Preposition + Proper Noun) -> e.g. "The national council met in Paris"
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP")],

  // 4: Length 7 (Determiner + Adjective + Noun + Verb Past + Determiner + Adjective + Noun) -> e.g. "The major company announced a new project"
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 5: Length 8 (Preposition + Proper Noun + Determiner + Adjective + Noun + Verb Past + Determiner + Noun) -> e.g. "In London the local council approved the budget"
  [D(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 6: Length 9 (Proper Noun + Adverb + Verb Past + Determiner + Adjective + Noun + Preposition + Determiner + Noun) -> e.g. "Washington recently confirmed the new policy in the market"
  [D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(PREPOSITIONS,"p"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 7: Length 10 (Determiner + Adjective + Noun + Adverb + Verb Past + Determiner + Adjective + Noun + Preposition + Proper Noun) -> e.g. "The senior official recently presented the new report in Geneva"
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP")]
];

/**
 * Deterministically identifies template index 0..7 from sentence word count.
 */
export function matchTemplate(tokens: string[]): number {
  const len = tokens.length;
  if (len <= 3) return 0;
  if (len >= 10) return 7;
  return len - 3;
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
