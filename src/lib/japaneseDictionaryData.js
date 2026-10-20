/**
 * Comprehensive Japanese Multi-Language Dictionary Engine with Phonology & Kana Rules
 * Supports:
 * - Japanese Written (Kanji / Kana) + Hiragana Spoken Reading + Romaji + Nepali Devanagari Pronunciation
 * - Nepali Translation + English Translation
 * - Japanese Phonological Rules (Dakuten, Handakuten, Sokuon, Chōon, Yōon, Particles は=wa, を=o, へ=e)
 * - Multi-lingual search (Japanese, Romaji, Nepali, English)
 */

export const JAPANESE_FEMALE_VOICES = [
  { id: 'female-1', name: 'Female 1', persona: 'Korean · Natural Korean teaching voice', voice: 'ko-KR-SunHiNeural', lang: 'ko', gender: 'female', pitch: '+0Hz', rate: '-4%', tag: 'Korean Teaching' },
  { id: 'female-2', name: 'Female 2', persona: 'Korean · Clear EPS-TOPIK listening voice', voice: 'ko-KR-SunHiNeural', lang: 'ko', gender: 'female', pitch: '+2Hz', rate: '-6%', tag: 'EPS-TOPIK Listening' },
  { id: 'female-3', name: 'Female 3', persona: 'Japanese · Natural Japanese teaching voice', voice: 'ja-JP-NanamiNeural', lang: 'ja', gender: 'female', pitch: '+0Hz', rate: '-4%', tag: 'Japanese Teaching' },
  { id: 'female-4', name: 'Female 4', persona: 'Japanese · Soft, clear pronunciation voice', voice: 'ja-JP-NanamiNeural', lang: 'ja', gender: 'female', pitch: '+3Hz', rate: '-8%', tag: 'Soft Pronunciation' },
  { id: 'female-5', name: 'Female 5', persona: 'Korean & Japanese · Multilingual conversation voice', voice: 'ja-JP-NanamiNeural', lang: 'multilingual', gender: 'female', pitch: '+2Hz', rate: '+0%', tag: 'Multilingual' },
  { id: 'female-6', name: 'Female 6', persona: 'Japanese · Polite news announcer', voice: 'ja-JP-NanamiNeural', lang: 'ja', gender: 'female', pitch: '+1Hz', rate: '-2%', tag: 'News Announcer' },
  { id: 'female-7', name: 'Female 7', persona: 'Japanese · Lively campus student', voice: 'ja-JP-NanamiNeural', lang: 'ja', gender: 'female', pitch: '+5Hz', rate: '+2%', tag: 'Campus Student' },
  { id: 'female-8', name: 'Female 8', persona: 'Japanese · Warm calming mentor', voice: 'ja-JP-NanamiNeural', lang: 'ja', gender: 'female', pitch: '-1Hz', rate: '-6%', tag: 'Calm Mentor' },
];

export const JAPANESE_MALE_VOICES = [
  { id: 'male-1', name: 'Male 1', persona: 'Korean · Standard Korean pronunciation', voice: 'ko-KR-InJoonNeural', lang: 'ko', gender: 'male', pitch: '+0Hz', rate: '-4%', tag: 'Standard Korean' },
  { id: 'male-2', name: 'Male 2', persona: 'Korean · Deep, clear teaching voice', voice: 'ko-KR-InJoonNeural', lang: 'ko', gender: 'male', pitch: '-6Hz', rate: '-8%', tag: 'Deep Teaching' },
  { id: 'male-3', name: 'Male 3', persona: 'Japanese · Natural Japanese pronunciation', voice: 'ja-JP-KeitaNeural', lang: 'ja', gender: 'male', pitch: '+0Hz', rate: '-4%', tag: 'Natural Japanese' },
  { id: 'male-4', name: 'Male 4', persona: 'Japanese · Calm listening-practice voice', voice: 'ja-JP-KeitaNeural', lang: 'ja', gender: 'male', pitch: '-3Hz', rate: '-10%', tag: 'Calm Listening' },
  { id: 'male-5', name: 'Male 5', persona: 'Korean & Japanese · Multilingual conversation voice', voice: 'ko-KR-HyunsuMultilingualNeural', lang: 'multilingual', gender: 'male', pitch: '+1Hz', rate: '+0%', tag: 'Multilingual' },
  { id: 'male-6', name: 'Male 6', persona: 'Japanese · Energetic workplace professional', voice: 'ja-JP-KeitaNeural', lang: 'ja', gender: 'male', pitch: '+2Hz', rate: '-2%', tag: 'Business Keigo' },
  { id: 'male-7', name: 'Male 7', persona: 'Japanese · Deep resonant narrator', voice: 'ja-JP-KeitaNeural', lang: 'ja', gender: 'male', pitch: '-6Hz', rate: '-6%', tag: 'Deep Narrator' },
  { id: 'male-8', name: 'Male 8', persona: 'Japanese · Friendly everyday companion', voice: 'ja-JP-KeitaNeural', lang: 'ja', gender: 'male', pitch: '+3Hz', rate: '+0%', tag: 'Casual Companion' },
];

// Romaji to Nepali Devanagari Pronunciation Map
const ROMAJI_TO_NEPALI = {
  a: 'आ', i: 'इ', u: 'उ', e: 'ए', o: 'ओ',
  ka: 'का', ki: 'कि', ku: 'कु', ke: 'के', ko: 'को',
  sa: 'सा', shi: 'शि', su: 'सु', se: 'से', so: 'सो', si: 'शि',
  ta: 'ता', chi: 'चि', tsu: 'चु', te: 'ते', to: 'तो', ti: 'चि', tu: 'चु',
  na: 'ना', ni: 'नि', nu: 'नु', ne: 'ने', no: 'नो',
  ha: 'हा', hi: 'हि', fu: 'फु', hu: 'हु', he: 'हे', ho: 'हो',
  ma: 'मा', mi: 'मि', mu: 'मु', me: 'मे', mo: 'मो',
  ya: 'या', yu: 'यु', yo: 'यो',
  ra: 'रा', ri: 'रि', ru: 'रु', re: 'रे', ro: 'रो',
  wa: 'वा', wo: 'ओ', n: 'न्',
  ga: 'गा', gi: 'गि', gu: 'गु', ge: 'गे', go: 'गो',
  za: 'जा', ji: 'जि', zu: 'जु', ze: 'जे', zo: 'जो',
  da: 'दा', de: 'दे', do: 'दो',
  ba: 'बा', bi: 'बि', bu: 'बु', be: 'बे', bo: 'बो',
  pa: 'पा', pi: 'पि', pu: 'पु', pe: 'पे', po: 'पो',
  kya: 'क्या', kyu: 'क्यु', kyo: 'क्यो',
  sha: 'शा', shu: 'शु', sho: 'शो',
  cha: 'चा', chu: 'चु', cho: 'चो',
  nya: 'न्या', nyu: 'न्यु', nyo: 'न्यो',
  hya: 'ह्या', hyu: 'ह्यु', hyo: 'ह्यो',
  mya: 'म्या', myu: 'म्यु', myo: 'म्यो',
  rya: 'र्या', ryu: 'र्यु', ryo: 'र्यो',
  gya: 'ग्या', gyu: 'ग्यु', gyo: 'ग्यो',
  ja: 'जा', ju: 'जु', jo: 'जो',
  bya: 'ब्या', byu: 'ब्यु', byo: 'ब्यो',
  pya: 'प्या', pyu: 'प्यु', pyo: 'प्यो'
};

export function romajiToNepaliPhonetic(romaji) {
  if (!romaji) return '';
  let str = romaji.toLowerCase().trim();
  let result = '';
  let i = 0;

  while (i < str.length) {
    if (i + 1 < str.length && str[i] === str[i + 1] && !'aiueon'.includes(str[i])) {
      result += 'त्';
      i++;
      continue;
    }
    const three = str.slice(i, i + 3);
    const two = str.slice(i, i + 2);
    const one = str.slice(i, i + 1);

    if (ROMAJI_TO_NEPALI[three]) {
      result += ROMAJI_TO_NEPALI[three];
      i += 3;
    } else if (ROMAJI_TO_NEPALI[two]) {
      result += ROMAJI_TO_NEPALI[two];
      i += 2;
    } else if (ROMAJI_TO_NEPALI[one]) {
      result += ROMAJI_TO_NEPALI[one];
      i += 1;
    } else {
      result += str[i];
      i += 1;
    }
  }
  return result;
}

/**
 * 120+ Curated Core Japanese Vocabulary for JLPT N5/N4, JFT-Basic & Daily Work/Life
 */
export const JAPANESE_VOCABULARY = [
  // ── 1. Greetings & Etiquette (挨拶 · अभिवादन) ─────────────────────
  {
    japanese: "こんにちは",
    japaneseWritten: "こんにちは",
    japaneseSpoken: "こんにちは",
    japaneseRomanized: "konnichiwa",
    japaneseNepaliRomanized: "कोन्निचिवा",
    nepali: "नमस्ते / नमस्कार",
    nepaliRomanized: "namaste",
    english: "Hello / Good afternoon",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Particle rule: 'は' at the end is pronounced 'wa' (not 'ha').",
    hasRule: true
  },
  {
    japanese: "ありがとう",
    japaneseWritten: "ありがとう",
    japaneseSpoken: "ありがとう",
    japaneseRomanized: "arigatou",
    japaneseNepaliRomanized: "आरिगातोउ",
    nepali: "धन्यवाद",
    nepaliRomanized: "dhanyabad",
    english: "Thank you",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Long vowel rule: 'とう' is pronounced with prolonged 'ō'.",
    hasRule: true
  },
  {
    japanese: "ありがとうございます",
    japaneseWritten: "ありがとうございます",
    japaneseSpoken: "ありがとうございます",
    japaneseRomanized: "arigatou gozaimasu",
    japaneseNepaliRomanized: "आरिगातोउ गोजाइमासु",
    nepali: "धेरै धेरै धन्यवाद (सादर)",
    nepaliRomanized: "dherai dherai dhanyabad",
    english: "Thank you very much (polite)",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Voiced sound (Dakuten): 'ご (go)', 'ざ (za)'. Final 'す (su)' often has a soft devoiced 's'.",
    hasRule: true
  },
  {
    japanese: "すみません",
    japaneseWritten: "すみません",
    japaneseSpoken: "すみません",
    japaneseRomanized: "sumimasen",
    japaneseNepaliRomanized: "सुमिमासेन",
    nepali: "माफ गर्नुहोस् / सुन्नुहोस् त",
    nepaliRomanized: "maaf garnuhos",
    english: "Excuse me / I'm sorry",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Multi-purpose polite courtesy expression.",
    hasRule: false
  },
  {
    japanese: "おはようございます",
    japaneseWritten: "おはようございます",
    japaneseSpoken: "おはようございます",
    japaneseRomanized: "ohayou gozaimasu",
    japaneseNepaliRomanized: "ओहायोउ गोजाइमासु",
    nepali: "शुभ प्रभात / नमस्कार",
    nepaliRomanized: "shubha prabhat",
    english: "Good morning (polite)",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Long vowel rule: 'よう' is prolonged 'yō'.",
    hasRule: true
  },
  {
    japanese: "こんばんは",
    japaneseWritten: "こんばんは",
    japaneseSpoken: "こんばんは",
    japaneseRomanized: "konbanwa",
    japaneseNepaliRomanized: "कोन्बान्वा",
    nepali: "शुभ सन्ध्या",
    nepaliRomanized: "shubha sandhya",
    english: "Good evening",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Particle rule: 'は' pronounced 'wa'. Nasal 'ん' before 'b' assimilates to 'm'/'n'.",
    hasRule: true
  },
  {
    japanese: "おやすみなさい",
    japaneseWritten: "おやすみなさい",
    japaneseSpoken: "おやすみなさい",
    japaneseRomanized: "oyasuminasai",
    japaneseNepaliRomanized: "ओयासुमिनासाइ",
    nepali: "शुभ रात्री",
    nepaliRomanized: "shubha ratri",
    english: "Good night",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Polite night greeting before sleeping.",
    hasRule: false
  },
  {
    japanese: "さようなら",
    japaneseWritten: "さようなら",
    japaneseSpoken: "さようなら",
    japaneseRomanized: "sayounara",
    japaneseNepaliRomanized: "सायौउणारा",
    nepali: "बिदा / फेरि भेटौँला",
    nepaliRomanized: "bida",
    english: "Goodbye / Farewell",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Long vowel 'よう' = 'yō'.",
    hasRule: true
  },
  {
    japanese: "はじめまして",
    japaneseWritten: "はじめまして",
    japaneseSpoken: "はじめまして",
    japaneseRomanized: "hajimemashite",
    japaneseNepaliRomanized: "हाजिमेमाशिते",
    nepali: "तपाईंलाई भेटेर खुसी लाग्यो (पहिलो भेट)",
    nepaliRomanized: "tapailai bheter khusi lagyo",
    english: "Nice to meet you (for the first time)",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Devoiced vowel: 'し (shi)' has a crisp pronunciation.",
    hasRule: true
  },
  {
    japanese: "よろしくお願いします",
    japaneseWritten: "よろしくお願いします",
    japaneseSpoken: "よろしくおねがいします",
    japaneseRomanized: "yoroshiku onegaishimasu",
    japaneseNepaliRomanized: "योर Oshiku ओनेगाइशिमासु",
    nepali: "कृपया मलाई सहयोग गरिदिनुहोस् / राम्रो सम्बन्ध रहोस्",
    nepaliRomanized: "kripaya sahayog garnuhos",
    english: "Please treat me well / Nice to work with you",
    category: "Greetings / अभिवादन",
    pronunciationRule: "Essential Japanese business & workplace greeting.",
    hasRule: false
  },
  {
    japanese: "はい",
    japaneseWritten: "はい",
    japaneseSpoken: "はい",
    japaneseRomanized: "hai",
    japaneseNepaliRomanized: "हाइ",
    nepali: "हजुर / हो",
    nepaliRomanized: "hajur / ho",
    english: "Yes",
    category: "Basic / आधारभूत",
    pronunciationRule: "Clear, crisp, polite affirmation.",
    hasRule: false
  },
  {
    japanese: "いいえ",
    japaneseWritten: "いいえ",
    japaneseSpoken: "いいえ",
    japaneseRomanized: "iie",
    japaneseNepaliRomanized: "इइए",
    nepali: "होइन / अहँ",
    nepaliRomanized: "hoina",
    english: "No",
    category: "Basic / आधारभूत",
    pronunciationRule: "Double 'い (i)' pronounced as prolonged 'ī-e'.",
    hasRule: true
  },
  {
    japanese: "お疲れ様です",
    japaneseWritten: "お疲れ様です",
    japaneseSpoken: "おつかれさまです",
    japaneseRomanized: "otsukaresama desu",
    japaneseNepaliRomanized: "ओचुकारेसामा देसु",
    nepali: "कामको कडा मेहनतको लागि धन्यवाद (कार्यस्थल अभिवादन)",
    nepaliRomanized: "otsukaresama",
    english: "Thank you for your hard work (workplace greeting)",
    category: "Workplace / कार्यस्थल",
    pronunciationRule: "Essential Japanese company phrase. Final 'す (su)' devoiced.",
    hasRule: true
  },

  // ── 2. People & Family (人 · परिवार र मानिस) ─────────────────────
  {
    japanese: "私",
    japaneseWritten: "私",
    japaneseSpoken: "わたし",
    japaneseRomanized: "watashi",
    japaneseNepaliRomanized: "वाताशि",
    nepali: "म",
    nepaliRomanized: "ma",
    english: "I / Me",
    category: "Pronouns / सर्वनाम",
    pronunciationRule: "Standard polite first-person pronoun.",
    hasRule: false
  },
  {
    japanese: "あなた",
    japaneseWritten: "あなた",
    japaneseSpoken: "あなた",
    japaneseRomanized: "anata",
    japaneseNepaliRomanized: "आनाता",
    nepali: "तपाईं",
    nepaliRomanized: "tapai",
    english: "You",
    category: "Pronouns / सर्वनाम",
    pronunciationRule: "Polite second-person pronoun.",
    hasRule: false
  },
  {
    japanese: "先生",
    japaneseWritten: "先生",
    japaneseSpoken: "せんせい",
    japaneseRomanized: "sensei",
    japaneseNepaliRomanized: "सेन्सेइ",
    nepali: "शिक्षक / गुरु",
    nepaliRomanized: "shikshak",
    english: "Teacher / Professor / Doctor",
    category: "People / मानिसहरू",
    pronunciationRule: "Long vowel 'えい' blends smoothly into 'ē'.",
    hasRule: true
  },
  {
    japanese: "学生",
    japaneseWritten: "学生",
    japaneseSpoken: "がくせい",
    japaneseRomanized: "gakusei",
    japaneseNepaliRomanized: "गाकुसेइ",
    nepali: "विद्यार्थी",
    nepaliRomanized: "vidyarthi",
    english: "Student",
    category: "People / मानिसहरू",
    pronunciationRule: "Dakuten: 'が (ga)', Long vowel 'せい (sei)'.",
    hasRule: true
  },
  {
    japanese: "友達",
    japaneseWritten: "友達",
    japaneseSpoken: "ともだち",
    japaneseRomanized: "tomodachi",
    japaneseNepaliRomanized: "तोमोदाचि",
    nepali: "साथी",
    nepaliRomanized: "sathi",
    english: "Friend",
    category: "People / मानिसहरू",
    pronunciationRule: "Dakuten: 'だ (da)'. Clear 'ち (chi)'.",
    hasRule: true
  },
  {
    japanese: "人",
    japaneseWritten: "人",
    japaneseSpoken: "ひと",
    japaneseRomanized: "hito",
    japaneseNepaliRomanized: "हितो",
    nepali: "मानिस",
    nepaliRomanized: "manis",
    english: "Person",
    category: "People / मानिसहरू",
    pronunciationRule: "Kun-reading: 'ひと (hito)'. On-reading: 'じん (jin)' or 'にん (nin)'.",
    hasRule: true
  },
  {
    japanese: "男",
    japaneseWritten: "男",
    japaneseSpoken: "おとこ",
    japaneseRomanized: "otoko",
    japaneseNepaliRomanized: "ओतोको",
    nepali: "पुरुष / केटा",
    nepaliRomanized: "purush / keta",
    english: "Man / Male",
    category: "People / मानिसहरू",
    pronunciationRule: "Pure vowel transitions: o-to-ko.",
    hasRule: false
  },
  {
    japanese: "女",
    japaneseWritten: "女",
    japaneseSpoken: "おんな",
    japaneseRomanized: "onna",
    japaneseNepaliRomanized: "ओन्ना",
    nepali: "महिला / केटी",
    nepaliRomanized: "mahila / keti",
    english: "Woman / Female",
    category: "People / मानिसहरू",
    pronunciationRule: "Double 'nn' nasal consonant: 'おんな (onna)'.",
    hasRule: true
  },
  {
    japanese: "子供",
    japaneseWritten: "子供",
    japaneseSpoken: "こども",
    japaneseRomanized: "kodomo",
    japaneseNepaliRomanized: "कोदोमो",
    nepali: "बच्चा / बालबालिका",
    nepaliRomanized: "bachha",
    english: "Child / Children",
    category: "People / मानिसहरू",
    pronunciationRule: "Dakuten: 'ど (do)'.",
    hasRule: true
  },
  {
    japanese: "家族",
    japaneseWritten: "家族",
    japaneseSpoken: "かぞく",
    japaneseRomanized: "kazoku",
    japaneseNepaliRomanized: "काजोकु",
    nepali: "परिवार",
    nepaliRomanized: "pariwar",
    english: "Family",
    category: "Family / परिवार",
    pronunciationRule: "Dakuten: 'ぞ (zo)'.",
    hasRule: true
  },
  {
    japanese: "父",
    japaneseWritten: "父",
    japaneseSpoken: "ちち",
    japaneseRomanized: "chichi",
    japaneseNepaliRomanized: "चिचि",
    nepali: "बुबा (मेरो)",
    nepaliRomanized: "buba",
    english: "Father (my)",
    category: "Family / परिवार",
    pronunciationRule: "Humbler form for one's own father.",
    hasRule: false
  },
  {
    japanese: "母",
    japaneseWritten: "母",
    japaneseSpoken: "はは",
    japaneseRomanized: "haha",
    japaneseNepaliRomanized: "हाहा",
    nepali: "आमा (मेरो)",
    nepaliRomanized: "aama",
    english: "Mother (my)",
    category: "Family / परिवार",
    pronunciationRule: "Humbler form for one's own mother.",
    hasRule: false
  },
  {
    japanese: "お父さん",
    japaneseWritten: "お父さん",
    japaneseSpoken: "おとうさん",
    japaneseRomanized: "otousan",
    japaneseNepaliRomanized: "ओतोउसान",
    nepali: "बुबा (अरूको / आदरणीय)",
    nepaliRomanized: "buba",
    english: "Father (respectful)",
    category: "Family / परिवार",
    pronunciationRule: "Honorific prefix 'お (o)' + long vowel 'とう (tō)'.",
    hasRule: true
  },
  {
    japanese: "お母さん",
    japaneseWritten: "お母さん",
    japaneseSpoken: "おかあさん",
    japaneseRomanized: "okaasan",
    japaneseNepaliRomanized: "ओकाआसान",
    nepali: "आमा (अरूको / आदरणीय)",
    nepaliRomanized: "aama",
    english: "Mother (respectful)",
    category: "Family / परिवार",
    pronunciationRule: "Honorific prefix 'お (o)' + long vowel 'かあ (kā)'.",
    hasRule: true
  },

  // ── 3. Food, Drinks & Dining (食べ物 · खाना र पेय) ────────────────
  {
    japanese: "水",
    japaneseWritten: "水",
    japaneseSpoken: "みず",
    japaneseRomanized: "mizu",
    japaneseNepaliRomanized: "मिजु",
    nepali: "पानी",
    nepaliRomanized: "pani",
    english: "Water",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Dakuten: 'ず (zu)'.",
    hasRule: true
  },
  {
    japanese: "ご飯",
    japaneseWritten: "ご飯",
    japaneseSpoken: "ごはん",
    japaneseRomanized: "gohan",
    japaneseNepaliRomanized: "गोहान",
    nepali: "भात / खाना",
    nepaliRomanized: "bhat / khana",
    english: "Cooked rice / Meal",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Dakuten: 'ご (go)'.",
    hasRule: true
  },
  {
    japanese: "パン",
    japaneseWritten: "パン",
    japaneseSpoken: "パン",
    japaneseRomanized: "pan",
    japaneseNepaliRomanized: "पान",
    nepali: "पाउरोटी / रोटी",
    nepaliRomanized: "pauroti",
    english: "Bread",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Katakana loanword with Handakuten 'パ (pa)'.",
    hasRule: true
  },
  {
    japanese: "肉",
    japaneseWritten: "肉",
    japaneseSpoken: "にく",
    japaneseRomanized: "niku",
    japaneseNepaliRomanized: "निकु",
    nepali: "मासु",
    nepaliRomanized: "masu",
    english: "Meat",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Clear syllables: ni-ku.",
    hasRule: false
  },
  {
    japanese: "魚",
    japaneseWritten: "魚",
    japaneseSpoken: "さかな",
    japaneseRomanized: "sakana",
    japaneseNepaliRomanized: "साकाना",
    nepali: "माछा",
    nepaliRomanized: "machha",
    english: "Fish",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Standard three-mora word: sa-ka-na.",
    hasRule: false
  },
  {
    japanese: "野菜",
    japaneseWritten: "野菜",
    japaneseSpoken: "やさい",
    japaneseRomanized: "yasai",
    japaneseNepaliRomanized: "यासाइ",
    nepali: "तरकारी",
    nepaliRomanized: "tarkari",
    english: "Vegetable",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Smooth diphthong: ya-sa-i.",
    hasRule: false
  },
  {
    japanese: "果物",
    japaneseWritten: "果物",
    japaneseSpoken: "くだもの",
    japaneseRomanized: "kudamono",
    japaneseNepaliRomanized: "कुदामोनो",
    nepali: "फलफूल",
    nepaliRomanized: "phalphul",
    english: "Fruit",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Dakuten: 'だ (da)'.",
    hasRule: true
  },
  {
    japanese: "お茶",
    japaneseWritten: "お茶",
    japaneseSpoken: "おちゃ",
    japaneseRomanized: "ocha",
    japaneseNepaliRomanized: "ओचा",
    nepali: "चिया (विशेष गरी हरियो चिया)",
    nepaliRomanized: "chiya",
    english: "Tea (especially green tea)",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Contracted sound (Yōon): 'ちゃ (cha)'.",
    hasRule: true
  },
  {
    japanese: "牛乳",
    japaneseWritten: "牛乳",
    japaneseSpoken: "ぎゅうにゅう",
    japaneseRomanized: "gyuunyuu",
    japaneseNepaliRomanized: "ग्युउन्युउ",
    nepali: "दूध",
    nepaliRomanized: "dudh",
    english: "Milk",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Double Yōon + Long vowels: 'ぎゅう (gyū)' and 'にゅう (nyū)'.",
    hasRule: true
  },
  {
    japanese: "卵",
    japaneseWritten: "卵",
    japaneseSpoken: "たまご",
    japaneseRomanized: "tamago",
    japaneseNepaliRomanized: "तामागो",
    nepali: "अन्डा",
    nepaliRomanized: "anda",
    english: "Egg",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Dakuten: 'ご (go)'.",
    hasRule: true
  },
  {
    japanese: "朝ご飯",
    japaneseWritten: "朝ご飯",
    japaneseSpoken: "あさごはん",
    japaneseRomanized: "asagohan",
    japaneseNepaliRomanized: "आसागोहान",
    nepali: "बिहानको खाजा / खाना",
    nepaliRomanized: "bihan ko khaja",
    english: "Breakfast",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Compound: 朝 (asa - morning) + ご飯 (gohan - meal).",
    hasRule: false
  },
  {
    japanese: "昼ご飯",
    japaneseWritten: "昼ご飯",
    japaneseSpoken: "ひるごはん",
    japaneseRomanized: "hirugohan",
    japaneseNepaliRomanized: "हिरुगोहान",
    nepali: "दिउँसोको खाना",
    nepaliRomanized: "diunso ko khana",
    english: "Lunch",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Compound: 昼 (hiru - noon) + ご飯 (gohan).",
    hasRule: false
  },
  {
    japanese: "晩ご飯",
    japaneseWritten: "晩ご飯",
    japaneseSpoken: "ばんごはん",
    japaneseRomanized: "bangohan",
    japaneseNepaliRomanized: "बान्गोहान",
    nepali: "बेलुकीको खाना",
    nepaliRomanized: "beluki ko khana",
    english: "Dinner / Supper",
    category: "Food & Drinks / खाना",
    pronunciationRule: "Compound: 晩 (ban - evening) + ご飯 (gohan).",
    hasRule: false
  },
  {
    japanese: "いただきます",
    japaneseWritten: "いただきます",
    japaneseSpoken: "いただきます",
    japaneseRomanized: "itadakimasu",
    japaneseNepaliRomanized: "इतादाकिमासु",
    nepali: "खाना खानु अगाडि कृतज्ञता व्यक्त गर्ने शब्द (खाना सुरु गरौँ)",
    nepaliRomanized: "itadakimasu",
    english: "Thank you for the food (said before eating)",
    category: "Etiquette / शिष्टाचार",
    pronunciationRule: "Cultural etiquette phrase before meals.",
    hasRule: false
  },
  {
    japanese: "ごちそうさまでした",
    japaneseWritten: "ごちそうさまでした",
    japaneseSpoken: "ごちそうさまでした",
    japaneseRomanized: "gochisousama deshita",
    japaneseNepaliRomanized: "गोचिसोउसामा देशिता",
    nepali: "खाना खाइसकेपछि धन्यवाद (मिठो खानाको लागि धन्यवाद)",
    nepaliRomanized: "gochisousama",
    english: "Thank you for the delicious meal (said after eating)",
    category: "Etiquette / शिष्टाचार",
    pronunciationRule: "Cultural phrase after finishing meals.",
    hasRule: false
  },

  // ── 4. Core Verbs (動詞 · मुख्य क्रियाहरू) ────────────────────────
  {
    japanese: "食べる",
    japaneseWritten: "食べる",
    japaneseSpoken: "たべる",
    japaneseRomanized: "taberu",
    japaneseNepaliRomanized: "ताबेरु",
    nepali: "खानु",
    nepaliRomanized: "khanu",
    english: "To eat",
    category: "Verbs / क्रिया",
    pronunciationRule: "Ichidan verb (一段動詞). Polite: 食べます (tabemasu).",
    hasRule: true
  },
  {
    japanese: "飲む",
    japaneseWritten: "飲む",
    japaneseSpoken: "のむ",
    japaneseRomanized: "nomu",
    japaneseNepaliRomanized: "नोमु",
    nepali: "पिउनु",
    nepaliRomanized: "piunu",
    english: "To drink",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb (五段動詞). Polite: 飲みます (nomimasu).",
    hasRule: true
  },
  {
    japanese: "行く",
    japaneseWritten: "行く",
    japaneseSpoken: "いく",
    japaneseRomanized: "iku",
    japaneseNepaliRomanized: "इकु",
    nepali: "जानु",
    nepaliRomanized: "janu",
    english: "To go",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 行きます (ikimasu). Te-form: 行って (itte - Sokuon っ).",
    hasRule: true
  },
  {
    japanese: "来る",
    japaneseWritten: "来る",
    japaneseSpoken: "くる",
    japaneseRomanized: "kuru",
    japaneseNepaliRomanized: "कुरु",
    nepali: "आउनु",
    nepaliRomanized: "aaunu",
    english: "To come",
    category: "Verbs / क्रिया",
    pronunciationRule: "Irregular verb (カ変動詞). Polite: 来ます (kimasu).",
    hasRule: true
  },
  {
    japanese: "見る",
    japaneseWritten: "見る",
    japaneseSpoken: "みる",
    japaneseRomanized: "miru",
    japaneseNepaliRomanized: "मिरु",
    nepali: "हेर्नु",
    nepaliRomanized: "hernu",
    english: "To see / watch / look",
    category: "Verbs / क्रिया",
    pronunciationRule: "Ichidan verb. Polite: 見ます (mimasu).",
    hasRule: true
  },
  {
    japanese: "聞く",
    japaneseWritten: "聞く",
    japaneseSpoken: "きく",
    japaneseRomanized: "kiku",
    japaneseNepaliRomanized: "किकु",
    nepali: "सुन्नु / सोध्नु",
    nepaliRomanized: "sundnu",
    english: "To listen / hear / ask",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 聞きます (kikimasu).",
    hasRule: true
  },
  {
    japanese: "話す",
    japaneseWritten: "話す",
    japaneseSpoken: "はなす",
    japaneseRomanized: "hanasu",
    japaneseNepaliRomanized: "हानासु",
    nepali: "बोल्नु / कुरा गर्नु",
    nepaliRomanized: "bolnu",
    english: "To speak / talk",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 話します (hanashimasu).",
    hasRule: true
  },
  {
    japanese: "読む",
    japaneseWritten: "読む",
    japaneseSpoken: "よむ",
    japaneseRomanized: "yomu",
    japaneseNepaliRomanized: "योमु",
    nepali: "पढ्नु",
    nepaliRomanized: "padhnu",
    english: "To read",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 読みます (yomimasu).",
    hasRule: true
  },
  {
    japanese: "書く",
    japaneseWritten: "書く",
    japaneseSpoken: "かく",
    japaneseRomanized: "kaku",
    japaneseNepaliRomanized: "काकु",
    nepali: "लेख्नु",
    nepaliRomanized: "lekhnu",
    english: "To write",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 書きます (kakimasu).",
    hasRule: true
  },
  {
    japanese: "買う",
    japaneseWritten: "買う",
    japaneseSpoken: "かう",
    japaneseRomanized: "kau",
    japaneseNepaliRomanized: "काउ",
    nepali: "किन्नु",
    nepaliRomanized: "kinnu",
    english: "To buy",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 買います (kaimasu). Te-form: 買って (katte - Sokuon っ).",
    hasRule: true
  },
  {
    japanese: "寝る",
    japaneseWritten: "寝る",
    japaneseSpoken: "ねる",
    japaneseRomanized: "neru",
    japaneseNepaliRomanized: "नेरु",
    nepali: "सुत्नु",
    nepaliRomanized: "sutnu",
    english: "To sleep",
    category: "Verbs / क्रिया",
    pronunciationRule: "Ichidan verb. Polite: 寝ます (nemasu).",
    hasRule: true
  },
  {
    japanese: "起きる",
    japaneseWritten: "起きる",
    japaneseSpoken: "おきる",
    japaneseRomanized: "okiru",
    japaneseNepaliRomanized: "ओकिरु",
    nepali: "उठ्नु",
    nepaliRomanized: "uthnu",
    english: "To wake up / get up",
    category: "Verbs / क्रिया",
    pronunciationRule: "Ichidan verb. Polite: 起きます (okimasu).",
    hasRule: true
  },
  {
    japanese: "働く",
    japaneseWritten: "働く",
    japaneseSpoken: "はたらく",
    japaneseRomanized: "hataraku",
    japaneseNepaliRomanized: "हात्ताराकु",
    nepali: "काम गर्नु",
    nepaliRomanized: "kaam garnu",
    english: "To work",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 働きます (hatarakimasu). Essential for SSW/Trainees.",
    hasRule: true
  },
  {
    japanese: "勉強する",
    japaneseWritten: "勉強する",
    japaneseSpoken: "べんきょうする",
    japaneseRomanized: "benkyou suru",
    japaneseNepaliRomanized: "बेन्क्योउ सुरु",
    nepali: "अध्ययन गर्नु / पढ्नु",
    nepaliRomanized: "adhyayan garnu",
    english: "To study",
    category: "Verbs / क्रिया",
    pronunciationRule: "Suru compound verb. Yōon + Long vowel: 'きょう (kyō)'.",
    hasRule: true
  },
  {
    japanese: "待つ",
    japaneseWritten: "待つ",
    japaneseSpoken: "まつ",
    japaneseRomanized: "matsu",
    japaneseNepaliRomanized: "माचु",
    nepali: "पर्खनु",
    nepaliRomanized: "parkhanu",
    english: "To wait",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 待ちます (machimasu). Te-form: 待って (matte - Sokuon っ).",
    hasRule: true
  },
  {
    japanese: "会う",
    japaneseWritten: "会う",
    japaneseSpoken: "あう",
    japaneseRomanized: "au",
    japaneseNepaliRomanized: "आउ",
    nepali: "भेट्नु",
    nepaliRomanized: "bhetnu",
    english: "To meet",
    category: "Verbs / क्रिया",
    pronunciationRule: "Godan verb. Polite: 会います (aimasu). Particle 'に' with person.",
    hasRule: true
  },

  // ── 5. Adjectives (形容詞 · विशेषणहरू) ───────────────────────────
  {
    japanese: "良い",
    japaneseWritten: "良い",
    japaneseSpoken: "いい",
    japaneseRomanized: "ii",
    japaneseNepaliRomanized: "इइ",
    nepali: "राम्रो / असल",
    nepaliRomanized: "ramro",
    english: "Good",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective. Often pronounced 'いい (ii)', conjugated as よい (yoi).",
    hasRule: true
  },
  {
    japanese: "悪い",
    japaneseWritten: "悪い",
    japaneseSpoken: "わるい",
    japaneseRomanized: "warui",
    japaneseNepaliRomanized: "वारुइ",
    nepali: "नराम्रो / खराब",
    nepaliRomanized: "naramro",
    english: "Bad",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective.",
    hasRule: false
  },
  {
    japanese: "大きい",
    japaneseWritten: "大きい",
    japaneseSpoken: "おおきい",
    japaneseRomanized: "ookii",
    japaneseNepaliRomanized: "ओओकिइ",
    nepali: "ठूलो",
    nepaliRomanized: "thulo",
    english: "Big / Large",
    category: "Adjectives / विशेषण",
    pronunciationRule: "Double long vowel: 'おお (ō)' and 'きい (kī)'.",
    hasRule: true
  },
  {
    japanese: "小さい",
    japaneseWritten: "小さい",
    japaneseSpoken: "ちいさい",
    japaneseRomanized: "chiisai",
    japaneseNepaliRomanized: "चिइसाइ",
    nepali: "सानो",
    nepaliRomanized: "sano",
    english: "Small / Little",
    category: "Adjectives / विशेषण",
    pronunciationRule: "Long vowel 'ちい (chī)'.",
    hasRule: true
  },
  {
    japanese: "高い",
    japaneseWritten: "高い",
    japaneseSpoken: "たかい",
    japaneseRomanized: "takai",
    japaneseNepaliRomanized: "ताकाइ",
    nepali: "महँगो / अग्लो",
    nepaliRomanized: "mahango / agglo",
    english: "Expensive / High / Tall",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective.",
    hasRule: false
  },
  {
    japanese: "安い",
    japaneseWritten: "安い",
    japaneseSpoken: "やすい",
    japaneseRomanized: "yasui",
    japaneseNepaliRomanized: "यासुइ",
    nepali: "सस्तो",
    nepaliRomanized: "sasto",
    english: "Cheap / Inexpensive",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective.",
    hasRule: false
  },
  {
    japanese: "美味しい",
    japaneseWritten: "美味しい",
    japaneseSpoken: "おいしい",
    japaneseRomanized: "oishii",
    japaneseNepaliRomanized: "ओइशिइ",
    nepali: "स्वादिष्ट / मिठो",
    nepaliRomanized: "mitho",
    english: "Delicious / Tasty",
    category: "Adjectives / विशेषण",
    pronunciationRule: "Long vowel 'しい (shī)'.",
    hasRule: true
  },
  {
    japanese: "新しい",
    japaneseWritten: "新しい",
    japaneseSpoken: "あたらしい",
    japaneseRomanized: "atarashii",
    japaneseNepaliRomanized: "आतारराशिइ",
    nepali: "नयाँ",
    nepaliRomanized: "naya",
    english: "New",
    category: "Adjectives / विशेषण",
    pronunciationRule: "Long vowel 'しい (shī)'.",
    hasRule: true
  },
  {
    japanese: "古い",
    japaneseWritten: "古い",
    japaneseSpoken: "ふるい",
    japaneseRomanized: "furui",
    japaneseNepaliRomanized: "फुरुइ",
    nepali: "पुरानो",
    nepaliRomanized: "purano",
    english: "Old (for things)",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective (used for objects, not people).",
    hasRule: false
  },
  {
    japanese: "暑い",
    japaneseWritten: "暑い",
    japaneseSpoken: "あつい",
    japaneseRomanized: "atsui",
    japaneseNepaliRomanized: "आचुइ",
    nepali: "तातो / गर्मी (मौसम)",
    nepaliRomanized: "garmi",
    english: "Hot (weather)",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective.",
    hasRule: false
  },
  {
    japanese: "寒い",
    japaneseWritten: "寒い",
    japaneseSpoken: "さむい",
    japaneseRomanized: "samui",
    japaneseNepaliRomanized: "सामुइ",
    nepali: "चिसो / जाडो (मौसम)",
    nepaliRomanized: "chiso",
    english: "Cold (weather)",
    category: "Adjectives / विशेषण",
    pronunciationRule: "I-adjective.",
    hasRule: false
  },
  {
    japanese: "元気な",
    japaneseWritten: "元気な",
    japaneseSpoken: "げんきな",
    japaneseRomanized: "genki na",
    japaneseNepaliRomanized: "गेन्कि ना",
    nepali: "स्वस्थ / फुर्तिलो / सन्चै",
    nepaliRomanized: "swastha / sanchai",
    english: "Healthy / Energetic / Well",
    category: "Adjectives / विशेषण",
    pronunciationRule: "Na-adjective (な形容詞). 'お元気ですか' (Are you well?).",
    hasRule: true
  },
  {
    japanese: "親切な",
    japaneseWritten: "親切な",
    japaneseSpoken: "しんせつな",
    japaneseRomanized: "shinsetsu na",
    japaneseNepaliRomanized: "शिन्सेचु ना",
    nepali: "दयालु / सहयोगी",
    nepaliRomanized: "dayalu",
    english: "Kind / Helpful",
    category: "Adjectives / विशेषण",
    pronunciationRule: "Na-adjective.",
    hasRule: false
  },

  // ── 6. Places, Work & City (場所 · काम र ठाउँ) ───────────────────
  {
    japanese: "会社",
    japaneseWritten: "会社",
    japaneseSpoken: "かいしゃ",
    japaneseRomanized: "kaisha",
    japaneseNepaliRomanized: "काइशा",
    nepali: "कम्पनी / कार्यालय",
    nepaliRomanized: "company",
    english: "Company / Corporation",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Contracted Yōon: 'しゃ (sha)'.",
    hasRule: true
  },
  {
    japanese: "学校",
    japaneseWritten: "学校",
    japaneseSpoken: "がっこう",
    japaneseRomanized: "gakkou",
    japaneseNepaliRomanized: "गाक्कोउ",
    nepali: "विद्यालय / स्कुल",
    nepaliRomanized: "vidyalaya",
    english: "School",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Sokuon (っ) double consonant + Long vowel: gak-kō.",
    hasRule: true
  },
  {
    japanese: "病院",
    japaneseWritten: "病院",
    japaneseSpoken: "びょういん",
    japaneseRomanized: "byouin",
    japaneseNepaliRomanized: "ब्योउइन",
    nepali: "अस्पताल",
    nepaliRomanized: "aspatal",
    english: "Hospital",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Yōon + Long vowel: 'びょう (byō)'.",
    hasRule: true
  },
  {
    japanese: "駅",
    japaneseWritten: "駅",
    japaneseSpoken: "えき",
    japaneseRomanized: "eki",
    japaneseNepaliRomanized: "एकि",
    nepali: "रेलवे स्टेसन / स्टेसन",
    nepaliRomanized: "station",
    english: "Train station",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Short two-mora word: e-ki.",
    hasRule: false
  },
  {
    japanese: "空港",
    japaneseWritten: "空港",
    japaneseSpoken: "くうこう",
    japaneseRomanized: "kuukou",
    japaneseNepaliRomanized: "कुउकोउ",
    nepali: "विमानस्थल / एयरपोर्ट",
    nepaliRomanized: "airport",
    english: "Airport",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Double long vowels: 'くう (kū)' and 'こう (kō)'.",
    hasRule: true
  },
  {
    japanese: "家",
    japaneseWritten: "家",
    japaneseSpoken: "いえ",
    japaneseRomanized: "ie",
    japaneseNepaliRomanized: "इए",
    nepali: "घर",
    nepaliRomanized: "ghar",
    english: "House / Home",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Pronounced i-e. Also: うち (uchi).",
    hasRule: false
  },
  {
    japanese: "部屋",
    japaneseWritten: "部屋",
    japaneseSpoken: "へや",
    japaneseRomanized: "heya",
    japaneseNepaliRomanized: "हेया",
    nepali: "कोठा",
    nepaliRomanized: "kotha",
    english: "Room",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Two moras: he-ya.",
    hasRule: false
  },
  {
    japanese: "トイレ",
    japaneseWritten: "トイレ",
    japaneseSpoken: "トイレ",
    japaneseRomanized: "toire",
    japaneseNepaliRomanized: "तोइरे",
    nepali: "शौचालय / ट्वाइलेट",
    nepaliRomanized: "shauchalaya",
    english: "Toilet / Restroom",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Katakana loanword from English 'toilet'. Also: お手洗い (otearai).",
    hasRule: false
  },
  {
    japanese: "日本",
    japaneseWritten: "日本",
    japaneseSpoken: "にほん",
    japaneseRomanized: "nihon",
    japaneseNepaliRomanized: "निहोन",
    nepali: "जापान",
    nepaliRomanized: "japan",
    english: "Japan",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Pronounced 'nihon' or 'nippon' (Sokuon っ).",
    hasRule: true
  },
  {
    japanese: "ネパール",
    japaneseWritten: "ネパール",
    japaneseSpoken: "ネパール",
    japaneseRomanized: "nepaaru",
    japaneseNepaliRomanized: "नेपाल",
    nepali: "नेपाल",
    nepaliRomanized: "nepal",
    english: "Nepal",
    category: "Places / ठाउँहरू",
    pronunciationRule: "Katakana with long vowel dash 'ー': nepāru.",
    hasRule: true
  },
  {
    japanese: "工場",
    japaneseWritten: "工場",
    japaneseSpoken: "こうじょう",
    japaneseRomanized: "koujou",
    japaneseNepaliRomanized: "कोउजोउ",
    nepali: "कारखाना / फ्याक्ट्री",
    nepaliRomanized: "karkhana",
    english: "Factory / Plant",
    category: "Workplace / कार्यस्थल",
    pronunciationRule: "Long vowels + Dakuten: kō-jō. Vital for manufacturing trainees.",
    hasRule: true
  },

  // ── 7. Daily Objects & Travel (日常 · दैनिक वस्तुहरू) ─────────────
  {
    japanese: "本",
    japaneseWritten: "本",
    japaneseSpoken: "ほん",
    japaneseRomanized: "hon",
    japaneseNepaliRomanized: "होन",
    nepali: "किताब / पुस्तक",
    nepaliRomanized: "kitab",
    english: "Book",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Nasal final: 'ん (n)'.",
    hasRule: true
  },
  {
    japanese: "お金",
    japaneseWritten: "お金",
    japaneseSpoken: "おかね",
    japaneseRomanized: "okane",
    japaneseNepaliRomanized: "ओकाने",
    nepali: "पैसा / रुपैयाँ",
    nepaliRomanized: "paisa",
    english: "Money",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Polite prefix 'お (o)' + kane (money).",
    hasRule: false
  },
  {
    japanese: "車",
    japaneseWritten: "車",
    japaneseSpoken: "くるま",
    japaneseRomanized: "kuruma",
    japaneseNepaliRomanized: "कुरुमा",
    nepali: "गाडी / कार",
    nepaliRomanized: "gadi",
    english: "Car / Vehicle",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Three moras: ku-ru-ma.",
    hasRule: false
  },
  {
    japanese: "電話",
    japaneseWritten: "電話",
    japaneseSpoken: "でんわ",
    japaneseRomanized: "denwa",
    japaneseNepaliRomanized: "देन्वा",
    nepali: "टेलिफोन / फोन",
    nepaliRomanized: "phone",
    english: "Telephone / Phone call",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Dakuten: 'で (de)' + nasal 'ん' + 'わ (wa)'.",
    hasRule: true
  },
  {
    japanese: "時計",
    japaneseWritten: "時計",
    japaneseSpoken: "とけい",
    japaneseRomanized: "tokei",
    japaneseNepaliRomanized: "तोकेइ",
    nepali: "घडी",
    nepaliRomanized: "ghadi",
    english: "Clock / Watch",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Long vowel: 'けい' = 'kē'.",
    hasRule: true
  },
  {
    japanese: "机",
    japaneseWritten: "机",
    japaneseSpoken: "つくえ",
    japaneseRomanized: "tsukue",
    japaneseNepaliRomanized: "चुक्वे",
    nepali: "टेबुल / डेस्क",
    nepaliRomanized: "table",
    english: "Desk / Table",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Three moras: tsu-ku-e.",
    hasRule: false
  },
  {
    japanese: "椅子",
    japaneseWritten: "椅子",
    japaneseSpoken: "いす",
    japaneseRomanized: "isu",
    japaneseNepaliRomanized: "इसु",
    nepali: "कुर्सी",
    nepaliRomanized: "kursi",
    english: "Chair",
    category: "Objects / वस्तुहरू",
    pronunciationRule: "Two moras: i-su.",
    hasRule: false
  },
  {
    japanese: "犬",
    japaneseWritten: "犬",
    japaneseSpoken: "いぬ",
    japaneseRomanized: "inu",
    japaneseNepaliRomanized: "इनु",
    nepali: "कुकुर",
    nepaliRomanized: "kukur",
    english: "Dog",
    category: "Animals / जनावरहरू",
    pronunciationRule: "Two moras: i-nu.",
    hasRule: false
  },
  {
    japanese: "猫",
    japaneseWritten: "猫",
    japaneseSpoken: "ねこ",
    japaneseRomanized: "neko",
    japaneseNepaliRomanized: "नेको",
    nepali: "बिरालो",
    nepaliRomanized: "biralo",
    english: "Cat",
    category: "Animals / जनावरहरू",
    pronunciationRule: "Two moras: ne-ko.",
    hasRule: false
  },

  // ── 8. Time & Numbers (時間 · समय र सङ्ख्या) ────────────────────────
  {
    japanese: "今",
    japaneseWritten: "今",
    japaneseSpoken: "いま",
    japaneseRomanized: "ima",
    japaneseNepaliRomanized: "इमा",
    nepali: "अहिले",
    nepaliRomanized: "ahile",
    english: "Now",
    category: "Time / समय",
    pronunciationRule: "Two moras: i-ma.",
    hasRule: false
  },
  {
    japanese: "今日",
    japaneseWritten: "今日",
    japaneseSpoken: "きょう",
    japaneseRomanized: "kyou",
    japaneseNepaliRomanized: "क्योउ",
    nepali: "आज",
    nepaliRomanized: "aaja",
    english: "Today",
    category: "Time / समय",
    pronunciationRule: "Yōon + Long vowel: 'きょう' = 'kyō'.",
    hasRule: true
  },
  {
    japanese: "明日",
    japaneseWritten: "明日",
    japaneseSpoken: "あした",
    japaneseRomanized: "ashita",
    japaneseNepaliRomanized: "आशिता",
    nepali: "भोलि",
    nepaliRomanized: "bholi",
    english: "Tomorrow",
    category: "Time / समय",
    pronunciationRule: "Three moras: a-shi-ta. Also: みょうにち (myounichi).",
    hasRule: false
  },
  {
    japanese: "昨日",
    japaneseWritten: "昨日",
    japaneseSpoken: "きのう",
    japaneseRomanized: "kinou",
    japaneseNepaliRomanized: "किनोउ",
    nepali: "हिजो",
    nepaliRomanized: "hijo",
    english: "Yesterday",
    category: "Time / समय",
    pronunciationRule: "Long vowel: 'のう' = 'nō'.",
    hasRule: true
  },
  {
    japanese: "時",
    japaneseWritten: "時",
    japaneseSpoken: "じ",
    japaneseRomanized: "ji",
    japaneseNepaliRomanized: "जि",
    nepali: "बजे / घण्टा",
    nepaliRomanized: "baje",
    english: "O'clock / Hour",
    category: "Time / समय",
    pronunciationRule: "Dakuten: 'じ (ji)'. Example: 1時 (ichiji - 1 o'clock).",
    hasRule: true
  },
  {
    japanese: "分",
    japaneseWritten: "分",
    japaneseSpoken: "ふん / ぷん",
    japaneseRomanized: "fun / pun",
    japaneseNepaliRomanized: "फुन / पुन",
    nepali: "मिनेट",
    nepaliRomanized: "minute",
    english: "Minute",
    category: "Time / समय",
    pronunciationRule: "Handakuten rule: 1分 (ippun), 2分 (nifun), 3分 (sanpun), etc.",
    hasRule: true
  },
  {
    japanese: "月曜日",
    japaneseWritten: "月曜日",
    japaneseSpoken: "げつようび",
    japaneseRomanized: "getsuyoubi",
    japaneseNepaliRomanized: "गेचुयोउबि",
    nepali: "सोमबार",
    nepaliRomanized: "sombar",
    english: "Monday",
    category: "Days / बारहरू",
    pronunciationRule: "Dakuten 'げ (ge)' + 'び (bi)'.",
    hasRule: true
  },
  {
    japanese: "日曜日",
    japaneseWritten: "日曜日",
    japaneseSpoken: "にちようび",
    japaneseRomanized: "nichiyoubi",
    japaneseNepaliRomanized: "निचियोउबि",
    nepali: "आइतबार",
    nepaliRomanized: "aaitabar",
    english: "Sunday",
    category: "Days / बारहरू",
    pronunciationRule: "Long vowel: 'よう' = 'yō'.",
    hasRule: true
  },
  {
    japanese: "一",
    japaneseWritten: "一",
    japaneseSpoken: "いち",
    japaneseRomanized: "ichi",
    japaneseNepaliRomanized: "इचि",
    nepali: "एक (१)",
    nepaliRomanized: "ek",
    english: "One (1)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Two moras: i-chi.",
    hasRule: false
  },
  {
    japanese: "二",
    japaneseWritten: "二",
    japaneseSpoken: "に",
    japaneseRomanized: "ni",
    japaneseNepaliRomanized: "नि",
    nepali: "दुई (२)",
    nepaliRomanized: "dui",
    english: "Two (2)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Single mora: ni.",
    hasRule: false
  },
  {
    japanese: "三",
    japaneseWritten: "三",
    japaneseSpoken: "さん",
    japaneseRomanized: "san",
    japaneseNepaliRomanized: "सान",
    nepali: "तीन (३)",
    nepaliRomanized: "teen",
    english: "Three (3)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Two moras: sa-n.",
    hasRule: false
  },
  {
    japanese: "四",
    japaneseWritten: "四",
    japaneseSpoken: "よん / し",
    japaneseRomanized: "yon / shi",
    japaneseNepaliRomanized: "योन / शि",
    nepali: "चार (४)",
    nepaliRomanized: "chaar",
    english: "Four (4)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Usually pronounced 'yon' in counting.",
    hasRule: false
  },
  {
    japanese: "五",
    japaneseWritten: "五",
    japaneseSpoken: "ご",
    japaneseRomanized: "go",
    japaneseNepaliRomanized: "गो",
    nepali: "पाँच (५)",
    nepaliRomanized: "paanch",
    english: "Five (5)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Dakuten: go.",
    hasRule: true
  },
  {
    japanese: "六",
    japaneseWritten: "六",
    japaneseSpoken: "ろく",
    japaneseRomanized: "roku",
    japaneseNepaliRomanized: "रोकु",
    nepali: "छ (६)",
    nepaliRomanized: "chha",
    english: "Six (6)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Two moras: ro-ku.",
    hasRule: false
  },
  {
    japanese: "七",
    japaneseWritten: "七",
    japaneseSpoken: "なな / しち",
    japaneseRomanized: "nana / shichi",
    japaneseNepaliRomanized: "नाना / शिचि",
    nepali: "सात (७)",
    nepaliRomanized: "saat",
    english: "Seven (7)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Usually pronounced 'nana' to avoid confusion.",
    hasRule: false
  },
  {
    japanese: "八",
    japaneseWritten: "八",
    japaneseSpoken: "はち",
    japaneseRomanized: "hachi",
    japaneseNepaliRomanized: "हाचि",
    nepali: "आठ (८)",
    nepaliRomanized: "aath",
    english: "Eight (8)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Two moras: ha-chi.",
    hasRule: false
  },
  {
    japanese: "九",
    japaneseWritten: "九",
    japaneseSpoken: "きゅう / く",
    japaneseRomanized: "kyuu / ku",
    japaneseNepaliRomanized: "क्युउ / कु",
    nepali: "नौ (९)",
    nepaliRomanized: "nau",
    english: "Nine (9)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Long vowel Yōon: kyū.",
    hasRule: true
  },
  {
    japanese: "十",
    japaneseWritten: "十",
    japaneseSpoken: "じゅう",
    japaneseRomanized: "juu",
    japaneseNepaliRomanized: "जुउ",
    nepali: "दश (१०)",
    nepaliRomanized: "dash",
    english: "Ten (10)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Dakuten Yōon + Long vowel: jū.",
    hasRule: true
  },
  {
    japanese: "百",
    japaneseWritten: "百",
    japaneseSpoken: "ひゃく",
    japaneseRomanized: "hyaku",
    japaneseNepaliRomanized: "ह्याकु",
    nepali: "सय (१००)",
    nepaliRomanized: "saya",
    english: "Hundred (100)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Yōon: hya-ku.",
    hasRule: true
  },
  {
    japanese: "千",
    japaneseWritten: "千",
    japaneseSpoken: "せん",
    japaneseRomanized: "sen",
    japaneseNepaliRomanized: "सेन",
    nepali: "हजार (१,०००)",
    nepaliRomanized: "hajar",
    english: "Thousand (1,000)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Two moras: se-n.",
    hasRule: false
  },
  {
    japanese: "万",
    japaneseWritten: "万",
    japaneseSpoken: "まん",
    japaneseRomanized: "man",
    japaneseNepaliRomanized: "मान",
    nepali: "दश हजार (१०,०००)",
    nepaliRomanized: "dash hajar",
    english: "Ten thousand (10,000)",
    category: "Numbers / सङ्ख्याहरू",
    pronunciationRule: "Standard Japanese counting unit: 1万 = 10,000.",
    hasRule: false
  }
];

import { KANJI_1000_LIST } from './kanji1000Data.js';

export const JAPANESE_KANJI_LIST = KANJI_1000_LIST;

export const ALL_JAPANESE_DICTIONARY = [
  ...JAPANESE_VOCABULARY,
  ...KANJI_1000_LIST
];

/**
 * Searches Japanese Vocabulary & 1000 Kanji Database by Kanji, Kana, Romaji, Nepali, or English
 */
export function searchJapaneseDictionary(query, filter = 'all') {
  let source = ALL_JAPANESE_DICTIONARY;
  if (filter === 'kanji') {
    source = KANJI_1000_LIST;
  } else if (filter === 'vocab') {
    source = JAPANESE_VOCABULARY;
  } else if (filter && /^n[1-5]$/i.test(filter)) {
    const targetJlpt = parseInt(filter.replace(/^n/i, ''), 10);
    source = KANJI_1000_LIST.filter(k => k.jlpt === targetJlpt);
  } else if (filter?.startsWith('jlpt-')) {
    const targetJlpt = parseInt(filter.replace('jlpt-', ''), 10);
    source = KANJI_1000_LIST.filter(k => k.jlpt === targetJlpt);
  }

  if (!query || !query.trim()) return source;

  const q = query.trim().toLowerCase();
  const scored = [];

  for (const item of source) {
    let score = 0;
    const ja = item.japanese.toLowerCase();
    const spoken = (item.japaneseSpoken || '').toLowerCase();
    const romaji = (item.japaneseRomanized || '').toLowerCase();
    const neRoman = (item.japaneseNepaliRomanized || '').toLowerCase();
    const ne = item.nepali.toLowerCase();
    const en = item.english.toLowerCase();
    const on = (item.onyomi || '').toLowerCase();
    const kun = (item.kunyomi || '').toLowerCase();

    // Exact kanji match gets highest priority
    if (item.isKanji && item.kanji === q) {
      score += 350;
    } else if (ja === q || spoken === q || romaji === q) {
      score += 250;
    } else if (en === q || ne === q) {
      score += 200;
    } else if (on.split(/[\s,]+/).includes(q) || kun.split(/[\s,]+/).includes(q)) {
      score += 180;
    }
    // Prefix matches
    else if (ja.startsWith(q) || spoken.startsWith(q) || romaji.startsWith(q)) {
      score += 100;
    } else if (en.startsWith(q) || ne.startsWith(q)) {
      score += 90;
    }
    // Substring matches
    else if (ja.includes(q) || spoken.includes(q) || romaji.includes(q)) {
      score += 70;
    } else if (en.includes(q) || ne.includes(q) || neRoman.includes(q) || on.includes(q) || kun.includes(q)) {
      score += 50;
    }

    if (score > 0) {
      scored.push({ ...item, _searchScore: score });
    }
  }

  scored.sort((a, b) => b._searchScore - a._searchScore);
  return scored;
}

