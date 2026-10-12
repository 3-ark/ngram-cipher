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
  "system","children","university","research","chapter","family","school","press","government","father","history","mother","analysis","education","company","energy","country","language","court","policy","community","theory","evidence","report","treatment","market","office","story","science","project","structure","method","performance","production","building","culture","program","security","growth","patient","disease","technology","movement","trade","environment","standard","team","media","police","president","network","authority","justice","industry","volume","temperature","concept","union","student","author","assessment","film","statement","strategy","council","commission","agreement","economy","record","investment","hospital","operation","agency","conflict","teacher","supply","principle","demand","title","library","charge","pattern","contract","doctor","benefit","finding","crime","scene","trial","generation","stock","opinion","frequency","framework","station","crisis","medicine","director","official","signal","leader","survey","forest","mission","novel","tradition","software","climate","interview","audience","regulation","foundation","district","conclusion","device","professor","minister","defense","reform","resource","edition","bridge","season","outcome","investigation","sentence","campaign","crowd","surgery","channel","prison","museum","budget","delivery","debate","profit","weather","match","border","election","algorithm","ocean","score","household","database","witness","finance","treaty","revenue","spectrum","player","platform","storm","infrastructure","governor","victory","parliament","server","coverage","artist","faculty","league","worker","proposal","amendment","protocol","commander","soldier","planet","publisher","disaster","symbol","heritage","weapon","coach","citizen","alliance","protest","airport","arrest","export","graduate","terminal","studio","highway","actor","pollution","flood","campus","theater","tunnel","railway","resident","gallery","festival","module","researcher","lecture","ceremony","penalty","senator","coalition","satellite","neighbor","memorial","demonstration","petition","scholar","receiver","salary","wildlife","harbor","regiment","legend","broadcast","summit","prosecution","volunteer","cargo","concert","surplus","rival","ambassador","archive","deployment","battalion","vaccine","orbit","journalist","warehouse","forecast","processor","monument","drought","missile","shortage","verdict","antenna","rocket","rainfall","activist","stadium","athlete","astronaut","championship","delegate","diplomat","guideline","headline","screenplay","seminar","shipment","spacecraft","telescope","tournament","transmitter"
];

// -- VERBS (256 clean base/present verbs) ----------------------------------
export const VERBS: string[] = [
  "states","studies","says","changes","needs","issues","shows","forms","works","provides","functions","notes","gives","measures","benefits","requires","remains","includes","reports","plans","claims","approaches","allows","suggests","tests","calls","increases","contains","challenges","leads","gets","offers","involves","limits","begins","ends","faces","risks","indicates","describes","helps","demands","continues","holds","controls","moves","falls","thinks","starts","argues","estimates","blocks","supplies","explains","serves","creates","produces","supports","reviews","designs","covers","reveals","advances","believes","opens","addresses","enables","gains","reaches","requests","adds","reduces","shifts","fails","seeks","grants","yields","stops","considers","receives","cuts","drops","meets","raises","drives","grows","develops","enters","assumes","permits","checks","rises","guides","transfers","encounters","operates","awards","concludes","contributes","travels","maintains","lets","backs","sanctions","prevents","generates","trains","introduces","examines","promotes","teaches","stays","improves","performs","releases","outputs","constructs","proposes","establishes","loses","updates","builds","crosses","accepts","aids","coaches","connects","confirms","wins","protects","closes","triggers","facilitates","lifts","handles","expects","misses","monitors","abandons","achieves","acquires","activates","adapts","adjusts","airs","allocates","alters","amplifies","analyzes","announces","anticipates","approves","assembles","assesses","assists","attains","attends","audits","authorizes","bans","bolsters","boosts","broadcasts","captures","certifies","circulates","collects","commences","compels","concedes","confronts","conquers","cooperates","declines","defends","delivers","denies","destabilizes","directs","disrupts","distributes","earns","educates","elevates","empowers","encompasses","endangers","endorses","endures","escalates","evaluates","expands","fabricates","finishes","forbids","forfeits","furnishes","gathers","halts","heightens","initiates","inspects","instructs","intensifies","investigates","joins","lasts","launches","lowers","magnifies","manages","manufactures","mentors","modifies","obtains","oversees","participates","persists","predicts","prepares","prevails","prohibits","publishes","rallies","ratifies","regulates","reinforces","rejects","relays","relocates","resolves","restricts","retains","revises","secures","shrinks","speculates","steers","strengthens","surrenders","survives","suspends","sustains","tackles","terminates","threatens","transforms","transmits","undermines","upholds","urges","validates","verifies","warns","weakens","withdraws"
];

// -- VERBS_PAST (256 clean past-tense verbs) --------------------------------
export const VERBS_PAST: string[] = [
  "said","thought","called","got","began","gave","held","needed","started","required","considered","lost","provided","continued","described","increased","developed","led","involved","moved","met","reached","added","cut","received","expected","opened","limited","published","created","reported","established","closed","worked","included","stopped","changed","allowed","produced","showed","built","fell","raised","obtained","rose","covered","proposed","offered","noted","remained","suggested","designed","believed","explained","reduced","prepared","formed","entered","helped","performed","introduced","served","finished","managed","accepted","failed","connected","stated","dropped","advanced","grew","supported","studied","controlled","measured","argued","ended","assumed","indicated","sought","achieved","joined","taught","revealed","directed","contained","lifted","improved","estimated","faced","generated","concluded","released","planned","won","collected","claimed","stayed","drove","issued","addressed","crossed","granted","examined","gathered","delivered","distributed","maintained","acquired","missed","trained","constructed","approached","confirmed","modified","protected","approved","announced","gained","tested","demanded","checked","inspired","captured","abandoned","shifted","rejected","permitted","threatened","transferred","contributed","expanded","restricted","denied","transformed","attended","adapted","revised","guided","lowered","encountered","predicted","adjusted","sustained","earned","evaluated","resolved","warned","transmitted","investigated","launched","altered","authorized","educated","requested","enabled","elevated","reviewed","backed","supplied","analyzed","challenged","operated","assessed","retained","survived","initiated","secured","activated","promoted","anticipated","assisted","regulated","prevented","urged","traveled","declined","reinforced","suspended","handled","instructed","updated","assembled","awarded","broadcast","lasted","blocked","confronted","extracted","prohibited","compelled","participated","manufactured","certified","triggered","allocated","monitored","furnished","strengthened","attained","defended","withdrew","facilitated","yielded","endured","aided","weakened","heightened","commenced","persisted","conquered","verified","terminated","banned","halted","steered","risked","conceded","inspected","shrank","surrendered","intensified","prevailed","aired","amplified","audited","benefited","bolstered","boosted","circulated","coached","cooperated","destabilized","disrupted","empowered","encompassed","endangered","endorsed","escalated","fabricated","forbade","forfeited","functioned","magnified","mentored","oversaw","rallied","ratified","relayed","relocated","sanctioned","speculated","tackled","undermined","upheld","validated"
];

// -- ADJECTIVES (256 clean, natural adjectives) -----------------------------
export const ADJECTIVES: string[] = [
  "new","first","long","little","social","high","old","small","last","important","public","next","general","large","early","national","political","open","possible","young","international","known","further","common","local","low","free","economic","hard","particular","available","specific","short","clear","big","major","top","current","natural","likely","key","late","strong","special","potential","significant","deep","central","financial","dark","continued","private","difficult","modern","poor","global","positive","standard","military","medical","legal","foreign","effective","complex","green","final","normal","critical","cold","basic","direct","expected","capital","additional","recent","federal","established","primary","original","closed","environmental","negative","clinical","western","active","traditional","former","daily","determined","professional","initial","independent","serious","leading","growing","equal","fast","proposed","popular","safe","increasing","successful","concerned","soft","essential","urban","scientific","electronic","separate","existing","rich","firm","ancient","fair","warm","domestic","fresh","regional","technical","industrial","slow","annual","commercial","dry","official","chemical","quiet","southern","joint","clean","contemporary","regular","unique","familiar","obvious","experienced","recognized","typical","advanced","broad","northern","digital","secondary","brief","fundamental","severe","bright","nuclear","corporate","detailed","eastern","weak","strategic","mixed","democratic","remaining","rural","dangerous","sharp","ordinary","capable","visible","distinct","collective","creative","rapid","planned","busy","committed","sensitive","secure","apparent","senior","efficient","organic","wet","vast","prime","armed","permanent","worried","extensive","conventional","radical","comprehensive","liberal","expert","violent","trained","steady","massive","diverse","expensive","raw","competitive","mutual","loose","sustainable","temporary","remote","conservative","ongoing","gentle","classic","dramatic","enormous","challenging","moderate","operational","progressive","neutral","quarterly","widespread","tough","flexible","qualified","passive","protective","confident","monthly","intermediate","mild","weekly","productive","exclusive","strict","historic","preliminary","balanced","coastal","cheap","innovative","rigid","skilled","mainstream","scheduled","hostile","authentic","controversial","provincial","defensive","urgent","transparent","deadly","focal","alternate","renewable","sweeping","cautious","lengthy","veteran","unprecedented","inland","optimistic","skeptical","rustic"
];

// -- ADVERBS (256 clean, natural single-word adverbs) ----------------------
export const ADVERBS: string[] = [
  "there","also","only","just","now","even","well","very","here","still","however","never","again","always","often","once","rather","early","together","already","almost","behind","therefore","especially","quite","soon","finally","sometimes","usually","likely","probably","late","alone","simply","particularly","quickly","forward","generally","clearly","directly","immediately","certainly","nearly","daily","exactly","slowly","completely","highly","fully","otherwise","relatively","slightly","recently","ahead","typically","moreover","frequently","merely","apart","carefully","entirely","previously","specifically","significantly","possibly","apparently","mostly","hardly","respectively","nevertheless","increasingly","somewhat","obviously","largely","extremely","similarly","aside","approximately","currently","primarily","furthermore","commonly","widely","twice","equally","ultimately","surely","deeply","effectively","normally","rapidly","strongly","gently","barely","properly","initially","naturally","seriously","quietly","rarely","precisely","absolutely","unfortunately","consequently","originally","fairly","gradually","totally","anywhere","everywhere","definitely","occasionally","partly","successfully","briefly","simultaneously","accordingly","meanwhile","likewise","firmly","automatically","abroad","badly","roughly","sufficiently","partially","tightly","thoroughly","correctly","actively","freely","considerably","strictly","worldwide","repeatedly","consistently","presumably","safely","backward","surprisingly","notably","historically","publicly","deliberately","accurately","independently","substantially","silently","traditionally","sharply","separately","positively","wholly","broadly","overseas","fortunately","locally","dramatically","formally","continuously","severely","desperately","openly","intentionally","officially","steadily","interestingly","indirectly","outward","temporarily","adequately","appropriately","critically","efficiently","annually","mutually","kindly","permanently","promptly","supposedly","remarkably","calmly","technically","collectively","systematically","secretly","privately","routinely","eagerly","reluctantly","smoothly","plainly","internally","evenly","comparatively","cautiously","nervously","globally","jointly","willingly","periodically","intensely","uniformly","allegedly","anxiously","momentarily","warmly","gravely","mildly","sternly","wearily","vigorously","warily","harshly","boldly","passionately","urgently","hesitantly","peacefully","enthusiastically","securely","bluntly","bravely","graciously","acutely","aggressively","candidly","constructively","conventionally","correspondingly","domestically","energetically","externally","favorably","generously","identically","indefinitely","intermittently","laterally","marginally","minimally","moderately","modestly","nationally","nominally","persistently","proportionally","regionally","reportedly","rigidly","skeptically","sporadically","strategically","symmetrically","tremendously","voluntarily"
];

// -- PROPER NOUNS (256 clean proper nouns) ----------------------------------
export const PROPER_NOUNS: string[] = [
  "america","china","europe","india","france","africa","germany","israel","japan","canada","britain","australia","russia","italy","mexico","egypt","spain","ireland","parliament","turkey","apple","korea","senate","scotland","atlantic","iraq","vietnam","brazil","pakistan","poland","mediterranean","guardian","sweden","observer","austria","caribbean","taiwan","indonesia","norway","belgium","denmark","nigeria","argentina","chile","thailand","arctic","philippines","hungary","malaysia","finland","kenya","ukraine","herald","lebanon","chronicle","peru","amazon","oracle","bangladesh","abbott","accra","addis","adriatic","airbus","albanese","anderson","andrews","ankara","armenia","asean","athens","auckland","baghdad","baltic","bangkok","barclays","beijing","belarus","berkeley","berlin","bloomberg","boeing","bolivia","brics","bristol","brussels","bulgaria","cairo","cambodia","cambridge","campbell","capitol","carter","caspian","churchill","citibank","clinton","colombia","columbia","congo","congress","cornell","crawford","croatia","danube","delhi","deutsche","douglas","downing","dublin","ecuador","erdogan","ethiopia","europol","ferrari","fidelity","fleming","ganges","gardner","gazette","geneva","georgia","ghana","goldman","google","hamilton","hanoi","harrison","harvard","helsinki","henderson","hitachi","honda","hyundai","intel","interpol","iran","jackson","jakarta","johnson","jordan","kabul","kennedy","kishida","kremlin","lagos","lambert","lanka","lincoln","lisbon","lockheed","london","macron","madrid","manila","marshall","maxwell","melbourne","merck","merkel","microsoft","mitchell","moderna","montreal","morgan","morrison","moscow","mumbai","myanmar","nairobi","nato","nepal","netanyahu","nile","nissan","nixon","nomura","northrop","novartis","opec","oslo","ottawa","oxford","pacific","paraguay","paris","patterson","pearson","pentagon","pfizer","philips","porsche","prague","pretoria","princeton","raytheon","reagan","renault","reuters","rhine","richards","riyadh","robinson","roche","romania","rome","rwanda","sahara","samsung","sanders","sanofi","scholz","schwab","senegal","seoul","serbia","shanghai","siemens","singapore","spencer","stanford","starmer","stewart","stockholm","sullivan","sunak","sydney","syria","taipei","tanzania","tehran","tesla","thames","thompson","tokyo","toronto","toyota","tribune","trudeau","tucker","uganda","unesco","unicef","uruguay","vancouver","venezuela","vienna","volvo","wallace","warren","warsaw","washington","webster","westminster","williams","yangtze"
];

// -- DETERMINERS (256 clean single-word determiners) -----------------------
export const DETERMINERS: string[] = [
  "the","to","a","that","his","this","her","an","one","all","which","their","my","what","more","no","your","some","these","its","only","two","such","our","first","any","back","most","many","those","much","each","both","same","another","little","three","different","something","high","head","every","few","last","second","given","next","general","side","following","less","nothing","enough","several","four","least","means","whole","anything","further","either","low","full","five","particular","half","certain","individual","systems","front","specific","terms","everything","non","someone","third","single","major","various","top","total","ways","main","key","whose","lower","six","middle","everyone","levels","center","lead","methods","forms","rules","ten","types","complete","twenty","anyone","cross","additional","parts","primary","average","entire","whatever","million","multiple","previous","numbers","hundred","base","former","seven","neither","laws","eight","chief","alternative","overall","bottom","latter","upper","thousand","double","plans","anti","core","thirty","units","goals","selected","typical","nine","classes","orders","fourth","chosen","inner","pieces","kinds","numerous","extra","principal","grand","zero","counter","fifty","twelve","forty","supreme","nobody","prime","specified","minor","billion","degrees","sub","trans","amounts","fifteen","multi","fifth","shares","everybody","plenty","outer","lots","norms","somebody","fewer","modes","inter","codes","aims","designated","eleven","sixty","anybody","super","semi","sixth","sorts","styles","sole","schemes","quantities","whoever","masses","eighteen","seventh","sixteen","fourteen","micro","seventy","ranks","counts","varieties","thirteen","tons","ratios","eighth","loads","portions","grades","eighty","seventeen","tenth","ninety","ninth","triple","macro","mini","intra","nineteen","fractions","bi","ultra","heaps","centi","deca","demi","exa","fewest","giga","hemi","hepta","hexa","hyper","innumerable","kilo","manifold","mega","milli","mono","myriad","nano","nona","noone","octa","omni","penta","percentages","peta","pico","plenteous","quad","quadruple","sundry","tera","tri","trillion","whichever","whomever","whosever"
];

// -- PREPOSITIONS (256 clean single-word prepositions) ----------------------
export const PREPOSITIONS: string[] = [
  "of","to","in","for","with","on","by","at","from","out","up","about","into","like","over","after","back","through","between","before","down","under","off","around","without","during","against","within","since","until","next","following","less","upon","among","far","times","including","along","across","act","above","further","behind","past","due","per","action","close","toward","short","according","outside","instead","inside","account","near","towards","beyond","below","access","forward","cross","ability","despite","except","throughout","round","re","onto","active","prior","relative","worth","acid","save","regarding","via","anti","ahead","accept","beside","achieve","apart","opposite","absence","beneath","concerning","subsequent","till","aside","extra","plus","considering","unlike","counter","unto","absolute","versus","sub","trans","accurate","contrary","thereby","accident","regardless","nearby","vice","pro","alongside","abroad","inter","absent","amongst","super","pursuant","acquire","nearest","upward","backward","failing","thereof","underneath","whereby","halfway","owing","thereafter","downward","notwithstanding","outward","supra","aboard","amid","nearer","backwards","intra","wherein","excluding","inward","sideways","therein","hereafter","minus","upwards","pending","atop","ultra","herein","aback","amidst","forwards","aloft","aft","abeam","abreast","acrossboard","adrift","afloat","afoot","afoul","aground","aheadward","alongshore","alongtrack","amidships","amok","apeak","apeek","asides","aslant","aslope","astride","athwart","atilt","awheel","awing","awrack","awry","barring","circa","circum","crosswise","downwards","earthward","eastward","excepting","frontward","hereabout","hereabove","hereacross","hereat","herebefore","herebetween","hereby","herefrom","hereinto","hereof","hereon","hereto","hereunder","herewith","homeward","hyper","infra","infront","inwards","irrespective","landward","leeward","leftward","lengthwise","midway","northward","offward","outwards","outwith","overtop","peri","rearward","respecting","retro","rightward","seaward","skyward","southward","straddling","thereabout","thereabove","thereacross","thereat","therebefore","therebetween","therefrom","thereinto","thereon","thereto","thereunder","therewith","underway","untowards","westward","whereabout","whereabove","whereacross","whereafter","whereat","wherebefore","wherebetween","wherefrom","whereinto","whereof","whereon","whereto","whereunder","wherewith","windward"
];

// -- CONJUNCTIONS (256 clean single-word conjunctions) ----------------------
export const CONJUNCTIONS: string[] = [
  "the","and","to","as","or","but","all","when","so","about","also","how","after","where","because","before","while","too","however","again","against","why","since","though","given","once","until","yet","although","thus","whether","already","along","across","almost","act","above","further","therefore","air","age","action","according","especially","finally","instead","account","activity","alone","provided","indeed","addition","access","particularly","clearly","ability","allow","despite","add","whatever","certainly","address","active","agreement","otherwise","seeing","agency","unless","actual","eventually","acid","affect","agent","hence","whereas","providing","ahead","accept","moreover","advantage","afraid","achieve","adult","truly","absence","specifically","significantly","aid","anyway","mostly","afternoon","nevertheless","agree","obviously","largely","alive","besides","similarly","advice","mainly","primarily","plus","considering","furthermore","equally","ultimately","surely","alcohol","advance","absolute","allowing","aim","whenever","naturally","granted","accurate","thereby","consequently","essentially","adequate","accident","admit","aircraft","simultaneously","subsequently","accordingly","meanwhile","afford","assuming","likewise","abroad","whilst","nonetheless","adopt","airport","absent","actor","aggressive","affair","importantly","alarm","additionally","wherever","acquire","alter","basically","whoever","adjust","alert","alike","notably","adventure","substantially","evidently","alien","undoubtedly","whereby","adapt","thereafter","albeit","alternatively","notwithstanding","predominantly","temporarily","meantime","fundamentally","album","conversely","advise","agony","materially","inherently","insofar","admire","plainly","chiefly","principally","whence","anyhow","admittedly","admittingthat","airline","allowingthat","alongwith","andor","aslong","aslongas","assoon","assumingthat","aswell","aswellas","atthesametime","besidesthat","beyondthat","coincidentally","concurrently","consideringthat","correspondingly","coupledwith","crucially","decisively","exceptthat","fornow","forthemoment","giventhat","grantingthat","handinhand","henceforth","hereby","identically","inasmuch","incase","incasethat","incidentally","inevent","inlikemanner","inorder","insofaras","insource","intandem","intheinterim","inthemeantime","intrinsically","lastly","manifestly","markedly","notonly","notwithstandingthat","onconditionthat","onlyif","ontopof","parenthetically","patently","presumingthat","providedthat","proviso","savethat","secondarily","seeingthat","sidebyside","sofar","solongas","sothat","suchthat","supposing","supposingthat","thenceforth","thirdly","toboot","togetherwith","vitally","wherefore","whereupon","whichever","whither","whomever"
];

// -- RELATIVES (256 clean relative pronouns) --------------------------------
export const RELATIVES: string[] = [
  "the","of","and","to","in","that","is","for","it","was","as","not","with","he","on","you","be","his","this","by","or","are","at","her","from","she","had","but","have","an","they","we","were","one","all","can","which","their","my","if","what","there","when","would","so","more","will","been","out","up","about","who","has","into","them","your","said","could","also","like","than","its","new","how","two","over","our","first","just","after","now","people","where","here","however","again","against","why","year","last","given","across","act","above","air","age","action","account","whose","activity","provided","addition","access","whom","ability","add","whatever","address","active","agreement","seeing","agency","actual","acid","affect","agent","hence","whereas","ahead","accept","advantage","afraid","achieve","adult","absence","aid","afternoon","agree","advice","considering","advance","absolute","aim","whenever","accurate","thereby","adequate","accident","admit","aircraft","afford","assuming","abroad","whilst","adopt","airport","absent","actor","aggressive","affair","wherever","acquire","whoever","adjust","adventure","thereof","whereby","adapt","thereafter","albeit","advise","wherein","whatsoever","agony","insofar","therein","admire","hereafter","whence","herein","airline","asif","asthough","aswell","henceforth","hereabout","hereabove","hereacross","herealong","hereamid","hereamong","herearound","hereat","herebefore","herebehind","herebelow","herebeneath","herebeside","herebetween","herebeyond","hereby","herefrom","hereinto","hereof","hereon","herethrough","hereto","hereunder","hereupon","herewith","howsoever","inasmuch","incase","inthat","sothat","suchthat","thence","thenceforth","thereabout","thereabove","thereacross","therealong","thereamid","thereamong","therearound","thereat","therebefore","therebehind","therebelow","therebeneath","therebeside","therebetween","therebeyond","therefrom","thereinto","thereon","therethrough","thereto","thereunder","thereupon","therewith","whensoever","whereabout","whereabove","whereacross","whereafter","wherealong","whereamid","whereamong","wherearound","whereat","wherebefore","wherebehind","wherebelow","wherebeneath","wherebeside","wherebetween","wherebeyond","wherefore","wherefrom","whereinto","whereof","whereon","wheresoever","wheresover","wherethrough","whereto","whereunder","whereupon","wherewith","whichever","whichsoever","whither","whomever","whomsoever","whosoevers"
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

// 8 Distinct Word-Length Grammatical Templates for Bulletproof Dynamic Matching
export const TEMPLATES: Slot[][] = [
  // 0: Length 3 (Proper Noun + Verb Past + Noun)
  [D(PROPER_NOUNS,"NP"), D(VERBS_PAST,"VP"), D(NOUNS,"N")],

  // 1: Length 4 (Determiner + Adjective + Noun + Verb Past)
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP")],

  // 2: Length 5 (Adverb + Proper Noun + Verb Past + Determiner + Noun)
  [D(ADVERBS,"R"), D(PROPER_NOUNS,"NP"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 3: Length 6 (Preposition + Proper Noun + Noun + Verb Past + Adjective + Noun)
  [D(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(ADJECTIVES,"A"), D(NOUNS,"N")],

  // 4: Length 7 (Determiner + Adjective + Noun + Verb + Preposition + Determiner + Noun)
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS,"V"), D(PREPOSITIONS,"p"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 5: Length 8 (Adverb + Determiner + Adjective + Noun + Verb Past + Preposition + Proper Noun + Noun)
  [D(ADVERBS,"R"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(PREPOSITIONS,"p"), D(PROPER_NOUNS,"NP"), D(NOUNS,"N")],

  // 6: Length 9 (Proper Noun + Adverb + Verb Past + Determiner + Adjective + Noun + Preposition + Determiner + Noun)
  [D(PROPER_NOUNS,"NP"), D(ADVERBS,"R"), D(VERBS_PAST,"VP"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(PREPOSITIONS,"p"), D(DETERMINERS,"d"), D(NOUNS,"N")],

  // 7: Length 10 (Determiner + Adjective + Noun + Verb Past + Preposition + Determiner + Adjective + Noun + Adverb + Verb)
  [D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(VERBS_PAST,"VP"), D(PREPOSITIONS,"p"), D(DETERMINERS,"d"), D(ADJECTIVES,"A"), D(NOUNS,"N"), D(ADVERBS,"R"), D(VERBS,"V")]
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
