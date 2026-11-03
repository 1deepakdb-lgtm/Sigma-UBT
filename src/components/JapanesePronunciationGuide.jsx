'use client';

import React, { useState } from 'react';

// ── 1. The 5 Core Japanese Vowels (母音 - A, I, U, E, O) ─────────────
export const JAPANESE_VOWELS = [
  {
    kana: "あ / ア",
    romaji: "a",
    nepali: "आ",
    description: "स्पष्ट र खुला 'आ' ध्वनि (छोटो स्वर)।",
    examples: [
      { written: "あさ", reading: "asa", nepali: "बिहान", english: "Morning" },
      { written: "あめ", reading: "ame", nepali: "पानी / वर्षा", english: "Rain" },
      { written: "ありがとう", reading: "arigatou", nepali: "धन्यवाद", english: "Thank you" }
    ]
  },
  {
    kana: "い / イ",
    romaji: "i",
    nepali: "इ",
    description: "ओठलाई दायाँबायाँ तन्काएर निकालिने 'इ' ध्वनि।",
    examples: [
      { written: "いぬ", reading: "inu", nepali: "कुकुर", english: "Dog" },
      { written: "いま", reading: "ima", nepali: "अहिले", english: "Now" },
      { written: "いく", reading: "iku", nepali: "जानु", english: "To go" }
    ]
  },
  {
    kana: "う / ウ",
    romaji: "u",
    nepali: "उ",
    description: "नेपाली 'उ' जस्तै तर ओठलाई धेरै गोलो नबनाई निकालिने ध्वनि।",
    examples: [
      { written: "うみ", reading: "umi", nepali: "समुन्द्र", english: "Sea / Ocean" },
      { written: "うた", reading: "uta", nepali: "गीत", english: "Song" },
      { written: "うえ", reading: "ue", nepali: "माथि", english: "Above / Up" }
    ]
  },
  {
    kana: "え / エ",
    romaji: "e",
    nepali: "ए",
    description: "स्पष्ट र छोटो 'ए' ध्वनि।",
    examples: [
      { written: "えき", reading: "eki", nepali: "रेल स्टेसन", english: "Train station" },
      { written: "えん", reading: "en", nepali: "येन (मुद्रा)", english: "Yen" },
      { written: "えんぴつ", reading: "enpitsu", nepali: "पेन्सिल", english: "Pencil" }
    ]
  },
  {
    kana: "お / オ",
    romaji: "o",
    nepali: "ओ",
    description: "ओठलाई हल्का गोलो बनाएर निकालिने छोटो 'ओ' ध्वनि।",
    examples: [
      { written: "おとこ", reading: "otoko", nepali: "पुरुष", english: "Man" },
      { written: "おちゃ", reading: "ocha", nepali: "चिया", english: "Tea" },
      { written: "お金", reading: "okane", nepali: "पैसा", english: "Money" }
    ]
  }
];

// ── 2. Dakuon & Handakuon (濁音・半濁音 - Voiced & Semi-Voiced) ──────
export const DAKUON_RULES = [
  {
    category: "か行 → が行 (K → G)",
    sign: "Dakuten (\")",
    explanation: "क-वर्गमा दुई थोप्ला (\") थप्दा ग-वर्ग बन्दछ: か(ka)→が(ga), き(ki)→ぎ(gi), く(ku)→ぐ(gu), け(ke)→げ(ge), こ(ko)→ご(go)",
    examples: [
      { written: "がくせい", reading: "gakusei", nepali: "विद्यार्थी", english: "Student" },
      { written: "ぎんこう", reading: "ginkou", nepali: "बैंक", english: "Bank" },
      { written: "ごはん", reading: "gohan", nepali: "भात / खाना", english: "Meal / Rice" }
    ]
  },
  {
    category: "さ行 → ざ行 (S → Z / J)",
    sign: "Dakuten (\")",
    explanation: "स-वर्गमा दुई थोप्ला (\") थप्दा ज/ज़ बन्दछ: さ(sa)→ざ(za), し(shi)→じ(ji), す(su)→ず(zu), せ(se)→ぜ(ze), そ(so)→ぞ(zo)",
    examples: [
      { written: "ざっし", reading: "zasshi", nepali: "पत्रिका", english: "Magazine" },
      { written: "じかん", reading: "jikan", nepali: "समय", english: "Time" },
      { written: "みず", reading: "mizu", nepali: "पानी", english: "Water" }
    ]
  },
  {
    category: "た行 → だ行 (T → D / J)",
    sign: "Dakuten (\")",
    explanation: "त-वर्गमा दुई थोप्ला (\") थप्दा द/ज बन्दछ: た(ta)→だ(da), ち(chi)→ぢ(ji), つ(tsu)→づ(zu), て(te)→で(de), と(to)→ど(do)",
    examples: [
      { written: "だいがく", reading: "daigaku", nepali: "विश्वविद्यालय", english: "University" },
      { written: "でんしゃ", reading: "densha", nepali: "रेल", english: "Electric Train" },
      { written: "どこ", reading: "doko", nepali: "कहाँ", english: "Where" }
    ]
  },
  {
    category: "は行 → ば行 (H → B)",
    sign: "Dakuten (\")",
    explanation: "ह-वर्गमा दुई थोप्ला (\") थप्दा ब-वर्ग बन्दछ: は(ha)→ば(ba), ひ(hi)→び(bi), ふ(fu)→ぶ(bu), へ(he)→べ(be), ほ(ho)→ぼ(bo)",
    examples: [
      { written: "ばんごう", reading: "bangou", nepali: "नम्बर", english: "Number" },
      { written: "びょういん", reading: "byouin", nepali: "अस्पताल", english: "Hospital" },
      { written: "ぶんか", reading: "bunka", nepali: "संस्कृति", english: "Culture" }
    ]
  },
  {
    category: "は行 → ぱ行 (H → P - Handakuon)",
    sign: "Handakuten (°)",
    explanation: "ह-वर्गमा सानो गोलो (°) थप्दा प-वर्ग बन्दछ: は(ha)→ぱ(pa), ひ(hi)→ぴ(pi), ふ(fu)→ぷ(pu), へ(he)→ぺ(pe), ほ(ho)→ぽ(po)",
    examples: [
      { written: "パン", reading: "pan", nepali: "पाउरोटी", english: "Bread" },
      { written: "きっぷ", reading: "kippu", nepali: "टिकट", english: "Ticket" },
      { written: "えんぴつ", reading: "enpitsu", nepali: "पेन्सिल", english: "Pencil" }
    ]
  }
];

// ── 3. Sokuon (促音 - Small 'tsu' っ Double Consonants & Pause) ─────
export const SOKUON_RULES = [
  {
    title: "っ (सानो tsu) उच्चारण नियम - १ मात्राको विश्राम",
    description: "सानो 'っ' (tsu) ले आफ्नै कुनै आवाज निकाल्दैन तर १ मात्रा (1 mora) बराबरको सास रोकेर पछिल्लो व्यञ्जनलाई दोहोरो (double consonant) उच्चारण गराउँछ।",
    nepaliRule: "नेपालीमा आधा अक्षर जस्तै (जस्तै: टिक् + कट = टिकट)। k, s, t, p अगाडि आउँदा रोकिन्छ।",
    examples: [
      { written: "ちょっと", spoken: "chotto", nepali: "अलिकति / एकछिन", english: "A little / A moment", note: "t अगाडि १ बिट रोकिने" },
      { written: "きっぷ", spoken: "kippu", nepali: "टिकट", english: "Ticket", note: "p अगाडि ओठ बन्द गरेर १ बिट रोकिने" },
      { written: "がっこう", spoken: "gakkou", nepali: "विद्यालय / स्कुल", english: "School", note: "k अगाडि घाँटीमा १ बिट रोकिने" },
      { written: "ざっし", spoken: "zasshi", nepali: "पत्रिका", english: "Magazine", note: "s अगाडि १ बिट लम्ब्याइने" },
      { written: "まって", spoken: "matte", nepali: "पर्खिनुहोस्", english: "Wait please", note: "t अगाडि १ बिट रोकिने" },
      { written: "けっこん", spoken: "kekkon", nepali: "विवाह", english: "Marriage", note: "k अगाडि १ बिट रोकिने" }
    ]
  }
];

// ── 4. Chōon (長音 - Long Vowels / लामो स्वर) ────────────────────────
export const CHOON_RULES = [
  {
    type: "A-Line Long Vowel (あ列長音)",
    rule: "あ पछाडि あ थपेर २ मात्रा लामो 'आー' बनाउने।",
    examples: [
      { written: "おかあさん", spoken: "okaasan", nepali: "आमा", english: "Mother" },
      { written: "おばあさん", spoken: "obaasan", nepali: "हजुरआमा", english: "Grandmother" }
    ]
  },
  {
    type: "I-Line Long Vowel (い列長音)",
    rule: "い पछाडि い थपेर २ मात्रा लामो 'ईー' बनाउने।",
    examples: [
      { written: "おにいさん", spoken: "oniisan", nepali: "दाजु", english: "Older brother" },
      { written: "おじいさん", spoken: "ojiisan", nepali: "हजुरबुबा", english: "Grandfather" }
    ]
  },
  {
    type: "U-Line Long Vowel (う列長音)",
    rule: "う पछाडि う थपेर २ मात्रा लामो 'ऊー' बनाउने।",
    examples: [
      { written: "くうき", spoken: "kuuki", nepali: "हावा / वायु", english: "Air" },
      { written: "ぎゅうにゅう", spoken: "gyuunyuu", nepali: "गाईको दूध", english: "Cow milk" }
    ]
  },
  {
    type: "E-Line Long Vowel (え列長音)",
    rule: "え पछाडि い वा え थपेर २ मात्रा लामो 'एー' बनाउने। (धेरैजसो 'え + い' लेखिन्छ तर उच्चारण 'एー' हुन्छ)।",
    examples: [
      { written: "せんせい", spoken: "sensee / sensei", nepali: "शिक्षक / सर", english: "Teacher" },
      { written: "えいが", spoken: "eega / eiga", nepali: "चलचित्र / फिल्म", english: "Movie" },
      { written: "おねえさん", spoken: "oneesan", nepali: "दिदी", english: "Older sister" }
    ]
  },
  {
    type: "O-Line Long Vowel (お列長音)",
    rule: "お पछाडि う थपेर २ मात्रा लामो 'ओー' बनाउने। (धेरैजसो 'お + う' लेखिन्छ तर उच्चारण लामो 'ओー' हुन्छ)।",
    examples: [
      { written: "おとうさん", spoken: "otousan / otōsan", nepali: "बुबा", english: "Father" },
      { written: "ありがとう", spoken: "arigatou / arigatō", nepali: "धन्यवाद", english: "Thank you" },
      { written: "とうきょう", spoken: "toukyou / Tōkyō", nepali: "टोकियो", english: "Tokyo" },
      { written: "おおきい", spoken: "ookii / ōkii", nepali: "ठूलो", english: "Big" }
    ]
  },
  {
    type: "Katakana Long Vowel (ー Chōonpu)",
    rule: "काताकाना शब्दहरूमा लामो स्वर देखाउन 'ー' चिन्ह प्रयोग गरिन्छ।",
    examples: [
      { written: "コーヒー", spoken: "koohii", nepali: "कफी", english: "Coffee" },
      { written: "タクシー", spoken: "takushii", nepali: "ट्याक्सी", english: "Taxi" },
      { written: "ビール", spoken: "biiru", nepali: "बियर", english: "Beer (cf. ビル biru = भवन)" }
    ]
  }
];

// ── 5. Special Japanese Particle Rules (助詞の発音規則) ──────────────
export const PARTICLE_RULES = [
  {
    particle: "は",
    standardReading: "ha (हा)",
    particleReading: "wa (वा)",
    ruleTitle: "विषय सूचक कण (Topic Particle) 'は' → [वा]",
    descriptionKo: "문장에서 조사(은/는)로 쓰일 때는 '하(ha)'가 아니라 반드시 '와(wa)'로 발음합니다.",
    descriptionNe: "जब 'は' वाक्यमा विषय बुझाउने कण (Particle) को रूपमा आउँछ, यसको उच्चारण 'हा' नभएर सधैँ 'वा' (wa) हुन्छ।",
    examples: [
      { sentence: "わたしは ネパールじんです。", reading: "watashi wa nepaaru-jin desu", nepali: "म नेपाली नागरिक हुँ।" },
      { sentence: "こんにちは。", reading: "konnichiwa", nepali: "नमस्ते (दिउँसोको अभिवादन)।" },
      { sentence: "こんばんは。", reading: "konbanwa", nepali: "शुभ सन्ध्या।" }
    ]
  },
  {
    particle: "を",
    standardReading: "wo (वो)",
    particleReading: "o (ओ)",
    ruleTitle: "कर्म सूचक कण (Object Particle) 'を' → [ओ]",
    descriptionKo: "목적격 조사(을/를)로 쓰이는 'を'는 현대 일본어에서 'wo'가 아닌 깔끔한 모음 [o]로 발음합니다.",
    descriptionNe: "वाक्यमा कर्म (Object) पछि आउने 'を' लाई आधुनिक जापानी भाषामा 'वो' नभएर स्पष्ट स्वर [ओ] (o) उच्चारण गरिन्छ।",
    examples: [
      { sentence: "ごはんを たべます。", reading: "gohan o tabemasu", nepali: "भात खान्छु।" },
      { sentence: "みずを のみます。", reading: "mizu o nomimasu", nepali: "पानी पिउँछु।" },
      { sentence: "にほんごを べんきょうします。", reading: "nihongo o benkyou shimasu", nepali: "जापानी भाषा अध्ययन गर्छु।" }
    ]
  },
  {
    particle: "へ",
    standardReading: "he (हे)",
    particleReading: "e (ए)",
    ruleTitle: "दिशा सूचक कण (Direction Particle) 'へ' → [ए]",
    descriptionKo: "방향을 나타내는 조사(~(으)로, ~에)로 쓰일 때는 '헤(he)'가 아닌 모음 [e]로 발음합니다.",
    descriptionNe: "गन्तव्य वा दिशा बुझाउने कण (तर्फ / तिर) को रूपमा आउँदा 'へ' को उच्चारण 'हे' नभएर स्वर [ए] (e) हुन्छ।",
    examples: [
      { sentence: "がっこうへ いきます。", reading: "gakkou e ikimasu", nepali: "विद्यालयतिर जान्छु।" },
      { sentence: "にほんへ きました。", reading: "nihon e kimashita", nepali: "जापान आएँ।" },
      { sentence: "うちへ かえります。", reading: "uchi e kaerimasu", nepali: "घर फर्किन्छु।" }
    ]
  }
];

// ── 6. Yōon (拗音 - Contracted Syllables with Small ゃ, ゅ, ょ) ────────
export const YOON_RULES = [
  {
    group: "か行 + ゃ/ゅ/ょ",
    items: [
      { kana: "きゃ", romaji: "kya", nepali: "क्या", word: "きゃく", reading: "kyaku", meaning: "पाहुना / ग्राहक" },
      { kana: "きゅ", romaji: "kyu", nepali: "क्यु", word: "きゅう", reading: "kyuu", meaning: "नौ (९)" },
      { kana: "きょ", romaji: "kyo", nepali: "क्यो", word: "きょう", reading: "kyou", meaning: "आज" }
    ]
  },
  {
    group: "さ行 + ゃ/ゅ/ょ",
    items: [
      { kana: "しゃ", romaji: "sha", nepali: "शा", word: "しゃしん", reading: "shashin", meaning: "तस्बिर / फोटो" },
      { kana: "しゅ", romaji: "shu", nepali: "शु", word: "しゅくだい", reading: "shukudai", meaning: "गृहकार्य" },
      { kana: "しょ", romaji: "sho", nepali: "शो", word: "しょくどう", reading: "shokudou", meaning: "क्यान्टिन / भोजन कक्ष" }
    ]
  },
  {
    group: "た行 + ゃ/ゅ/ょ",
    items: [
      { kana: "ちゃ", romaji: "cha", nepali: "चा", word: "おちゃ", reading: "ocha", meaning: "हरियो चिया" },
      { kana: "ちゅ", romaji: "chu", nepali: "चु", word: "ちゅうい", reading: "chuui", meaning: "सावधानी / ध्यान" },
      { kana: "ちょ", romaji: "cho", nepali: "चो", word: "ちょっと", reading: "chotto", meaning: "अलिकति / एकछिन" }
    ]
  },
  {
    group: "濁音 + ゃ/ゅ/ょ (ぎゃ, じゃ, びゃ)",
    items: [
      { kana: "じゃ", romaji: "ja", nepali: "जा", word: "じゃま", reading: "jama", meaning: "अवरोध / बाधा" },
      { kana: "じゅ", romaji: "ju", nepali: "जु", word: "じゅぎょう", reading: "jugyou", meaning: "कक्षा / पढाइ" },
      { kana: "じょ", romaji: "jo", nepali: "जो", word: "じょせい", reading: "josei", meaning: "महिला" }
    ]
  }
];

// ── 7. Devoiced Vowels (母音の無声化 - Silent i and u) ───────────────
export const DEVOICING_RULES = [
  {
    title: "です (desu) र ます (masu) को अन्तिम 'u' अघोषित हुनु",
    explanation: "वाक्यको अन्त्यमा आउने 'です' लाई 'देसु' नभनेर 'देस्' [des] र 'ます' लाई 'मासु' नभनेर 'मास्' [mas] उच्चारण गरिन्छ।",
    examples: [
      { written: "がくせいです", spoken: "gakusei des", nepali: "विद्यार्थी हुँ / हो।" },
      { written: "たべます", spoken: "tabemas", nepali: "खान्छु।" },
      { written: "いきます", spoken: "ikimas", nepali: "जान्छु।" }
    ]
  },
  {
    title: "'k, s, t, p, h' बीचका स्वर 'i' र 'u' मधुरो हुनु",
    explanation: "अघोष व्यञ्जनहरू बीचमा आउँदा स्वर 'i' वा 'u' सुनिने गरी बोलिँदैन (जस्तै: すき = ski, ひと = hto)।",
    examples: [
      { written: "すき (好き)", spoken: "s-ki", nepali: "मनपर्ने" },
      { written: "ひと (人)", spoken: "h-to", nepali: "मानिस" },
      { written: "くさ (草)", spoken: "k-sa", nepali: "घाँस" }
    ]
  }
];

export default function JapanesePronunciationGuide({ handlePlayAudio, playingAudioId }) {
  const [activeTab, setActiveTab] = useState('particles'); // 'particles' | 'sokuon' | 'choon' | 'dakuon' | 'yoon' | 'vowels' | 'devoice'
  const [copiedText, setCopiedText] = useState(null);

  function copyToClipboard(text) {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1800);
    } catch {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1800);
    }
  }

  function playSample(text, id) {
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=ja&gender=female&voice=ja-JP-NanamiNeural`;
    if (handlePlayAudio) {
      handlePlayAudio(url, id, text, 'ja', 'female');
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'ja-JP';
        window.speechSynthesis.speak(utt);
      } catch (e) {}
    }
  }

  return (
    <div
      style={{
        marginTop: "32px",
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
        overflow: "hidden"
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)",
          color: "#ffffff",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🇯🇵</span>
            <h3 style={{ margin: 0, fontSize: "21px", fontWeight: "800", letterSpacing: "-0.4px" }}>
              जापानी भाषा उच्चारण तथा काना नियमहरू (日本語の発音規則)
            </h3>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "14px", opacity: 0.94, lineHeight: "1.5" }}>
            कण (Particles: は=wa, を=o, へ=e), सानो っ (Sokuon), लामो स्वर (Chōon), 濁音 (Dakuon), र प्राकृतिक जापानी स्वर उच्चारण नियमहरू
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "16px", fontWeight: "700" }}>
            JLPT N5/N4 · JFT-Basic
          </span>
          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "16px", fontWeight: "700" }}>
            Native Tokyo Accent
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1.5px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          overflowX: "auto",
          padding: "6px 12px 0 12px",
          gap: "6px"
        }}
      >
        {[
          { id: 'particles', label: '⭐ कण नियम (は/を/へ)', count: 3 },
          { id: 'sokuon', label: 'っ सानो tsu (促音)', count: 6 },
          { id: 'choon', label: 'ー लामो स्वर (長音)', count: 6 },
          { id: 'dakuon', label: '濁音・半濁音 (が/ざ/だ/ば/ぱ)', count: 5 },
          { id: 'yoon', label: '拗音 (きゃ/しゃ/ちゃ)', count: 4 },
          { id: 'devoice', label: 'अघोषित स्वर (です/ます)', count: 2 },
          { id: 'vowels', label: '५ मूल स्वर (あいうえお)', count: 5 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#2563eb" : "#64748b",
                border: "none",
                borderBottom: isActive ? "3px solid #2563eb" : "3px solid transparent",
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: isActive ? "800" : "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderRadius: "8px 8px 0 0",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "#eff6ff" : "#e2e8f0",
                  color: isActive ? "#2563eb" : "#475569"
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div style={{ padding: "22px" }}>
        {/* TAB 1: PARTICLE RULES (は, を, へ) */}
        {activeTab === 'particles' && (
          <div>
            <div style={{ marginBottom: "16px", padding: "12px 16px", backgroundColor: "#faf5ff", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
              <div style={{ fontWeight: "800", color: "#6b21a8", fontSize: "15px" }}>
                🎯 जापानी भाषाका ३ विशेष कण उच्चारण नियमहरू (Top 3 Essential Particle Pronunciation Rules)
              </div>
              <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                जापानी भाषामा शब्दको भाग हुँदा र व्याकरणको कण (Particle) हुँदा अक्षरको उच्चारण परिवर्तन हुन्छ। तलका ३ नियमहरू जान्नु सबैभन्दा महत्वपूर्ण छ:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {PARTICLE_RULES.map((rule, idx) => {
                const audioId = `rule-part-${idx}`;
                const isPlaying = playingAudioId === audioId;
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1.5px solid #d8b4fe",
                      borderRadius: "12px",
                      padding: "16px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 8px rgba(147, 51, 234, 0.06)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      {/* Badge Row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontSize: "24px", fontWeight: "900", color: "#7e22ce", backgroundColor: "#f3e8ff", width: "42px", height: "42px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "10px" }}>
                          {rule.particle}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "11px", color: "#dc2626", textDecoration: "line-through", marginRight: "8px", fontWeight: "700" }}>
                            {rule.standardReading}
                          </span>
                          <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "800", backgroundColor: "#dcfce7", padding: "3px 8px", borderRadius: "6px" }}>
                            👉 {rule.particleReading}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px", marginBottom: "6px" }}>
                        {rule.ruleTitle}
                      </div>

                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", margin: "0 0 12px" }}>
                        {rule.descriptionNe}
                      </p>

                      {/* Examples */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px dashed #e9d5ff", paddingTop: "10px" }}>
                        {rule.examples.map((ex, exIdx) => {
                          const exAudioId = `part-ex-${idx}-${exIdx}`;
                          const isExPlaying = playingAudioId === exAudioId;
                          return (
                            <div
                              key={exIdx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: "#faf5ff",
                                padding: "8px 10px",
                                borderRadius: "8px"
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0, marginRight: "8px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e1b4b" }}>
                                  {ex.sentence}
                                </div>
                                <div style={{ fontSize: "12px", color: "#7e22ce", fontWeight: "600" }}>
                                  [{ex.reading}] · <span style={{ color: "#15803d" }}>{ex.nepali}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => playSample(ex.sentence, exAudioId)}
                                style={{
                                  backgroundColor: isExPlaying ? "#7e22ce" : "#ffffff",
                                  color: isExPlaying ? "#ffffff" : "#7e22ce",
                                  border: "1.5px solid #d8b4fe",
                                  borderRadius: "6px",
                                  padding: "5px 9px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <span>{isExPlaying ? "⏹" : "▶"}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SOKUON RULES (っ Small tsu) */}
        {activeTab === 'sokuon' && (
          <div>
            <div style={{ marginBottom: "16px", padding: "14px 18px", backgroundColor: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
              <div style={{ fontWeight: "800", color: "#166534", fontSize: "15px" }}>
                ⚡ सानो 'っ' (促音 - Sokuon) - सास रोक्ने र दोहोरो व्यञ्जन उच्चारण नियम
              </div>
              <p style={{ margin: "4px 0 0", color: "#15803d", fontSize: "13px", lineHeight: "1.5" }}>
                जापानी भाषामा सानो 'っ' (tsu) को आफ्नै कुनै ध्वनि हुँदैन। यसले १ मात्रा (1 mora) को सास रोक्छ। नेपालीमा आधा अक्षर जस्तै उच्चारण हुन्छ (जस्तै: k, s, t, p अगाडि आउँदा)।
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {SOKUON_RULES[0].examples.map((item, idx) => {
                const audioId = `sokuon-${idx}`;
                const isPlaying = playingAudioId === audioId;
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1.5px solid #bbf7d0",
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      padding: "14px",
                      boxShadow: "0 2px 6px rgba(22, 101, 52, 0.05)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a" }}>
                        {item.written}
                      </span>
                      <button
                        type="button"
                        onClick={() => playSample(item.written, audioId)}
                        style={{
                          backgroundColor: isPlaying ? "#16a34a" : "#f0fdf4",
                          color: isPlaying ? "#ffffff" : "#166534",
                          border: "1.5px solid #86efac",
                          borderRadius: "6px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <span>{isPlaying ? "⏹ Stop" : "▶ Pronounce"}</span>
                      </button>
                    </div>

                    <div style={{ fontSize: "13px", color: "#15803d", fontWeight: "700" }}>
                      Romaji: [{item.spoken}] · Nepali: [{item.nepali}]
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "3px" }}>
                      English: {item.english}
                    </div>
                    <div style={{ fontSize: "11px", color: "#92400e", backgroundColor: "#fef3c7", padding: "3px 7px", borderRadius: "4px", marginTop: "8px", fontWeight: "600" }}>
                      💡 {item.note}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CHŌON (長音 - Long Vowels) */}
        {activeTab === 'choon' && (
          <div>
            <div style={{ marginBottom: "16px", padding: "14px 18px", backgroundColor: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
              <div style={{ fontWeight: "800", color: "#1e40af", fontSize: "15px" }}>
                ⏳ लामो स्वर नियमहरू (長音 - Chōon Rules)
              </div>
              <p style={{ margin: "4px 0 0", color: "#1d4ed8", fontSize: "13px", lineHeight: "1.5" }}>
                जापानी भाषामा छोटो स्वर र लामो स्वरको अर्थ पूर्ण रूपमा भिन्न हुन्छ (जस्तै: おばさん obasan = काकी, おばあさん obaasan = हजुरआमा; ビル biru = भवन, ビール biiru = बियर)।
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
              {CHOON_RULES.map((ch, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1.5px solid #dbeafe",
                    borderRadius: "10px",
                    padding: "14px",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ fontWeight: "800", color: "#1e40af", fontSize: "14px", marginBottom: "4px" }}>
                    {ch.type}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", marginBottom: "10px", lineHeight: "1.4" }}>
                    {ch.rule}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {ch.examples.map((ex, exIdx) => {
                      const audioId = `choon-${idx}-${exIdx}`;
                      const isPlaying = playingAudioId === audioId;
                      return (
                        <div
                          key={exIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#f8fafc",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px", marginRight: "8px" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600" }}>
                              [{ex.spoken}]
                            </span>
                            <span style={{ fontSize: "12px", color: "#15803d", marginLeft: "6px" }}>
                              ({ex.nepali})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => playSample(ex.written, audioId)}
                            style={{
                              backgroundColor: isPlaying ? "#2563eb" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#2563eb",
                              border: "1px solid #bfdbfe",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {isPlaying ? "⏹" : "▶"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DAKUON & HANDAKUON */}
        {activeTab === 'dakuon' && (
          <div>
            <div style={{ marginBottom: "16px", padding: "14px 18px", backgroundColor: "#fff7ed", borderRadius: "10px", border: "1px solid #fed7aa" }}>
              <div style={{ fontWeight: "800", color: "#c2410c", fontSize: "15px" }}>
                🔔 濁音 (Dakuon) र 半濁音 (Handakuon) - दुई थोप्ला (") र सानो गोलो (°) को नियम
              </div>
              <p style={{ margin: "4px 0 0", color: "#ea580c", fontSize: "13px", lineHeight: "1.5" }}>
                खाना वर्णहरूमा थोप्ला थपेर कडा/घोष (Voiced) ध्वनि बनाउने विधि: K→G, S→Z, T→D, H→B र H→P
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
              {DAKUON_RULES.map((dak, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1.5px solid #fed7aa",
                    borderRadius: "10px",
                    padding: "14px",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "800", color: "#c2410c", fontSize: "15px" }}>
                      {dak.category}
                    </span>
                    <span style={{ fontSize: "11px", backgroundColor: "#ffedd5", color: "#9a3412", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                      {dak.sign}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.4", margin: "0 0 10px" }}>
                    {dak.explanation}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {dak.examples.map((ex, exIdx) => {
                      const audioId = `dak-${idx}-${exIdx}`;
                      const isPlaying = playingAudioId === audioId;
                      return (
                        <div
                          key={exIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#fffaf5",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #fed7aa"
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px", marginRight: "8px" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontSize: "12px", color: "#ea580c", fontWeight: "600" }}>
                              [{ex.reading}]
                            </span>
                            <span style={{ fontSize: "12px", color: "#15803d", marginLeft: "6px" }}>
                              · {ex.nepali}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => playSample(ex.written, audioId)}
                            style={{
                              backgroundColor: isPlaying ? "#ea580c" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#ea580c",
                              border: "1px solid #fdba74",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {isPlaying ? "⏹" : "▶"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: YOON (拗音) */}
        {activeTab === 'yoon' && (
          <div>
            <div style={{ marginBottom: "16px", padding: "14px 18px", backgroundColor: "#fdf4ff", borderRadius: "10px", border: "1px solid #f5d0fe" }}>
              <div style={{ fontWeight: "800", color: "#a21caf", fontSize: "15px" }}>
                🌸 拗音 (Yōon) - सानो ゃ (ya), ゅ (yu), ょ (yo) को संयुक्त ध्वनि
              </div>
              <p style={{ margin: "4px 0 0", color: "#c026d3", fontSize: "13px", lineHeight: "1.5" }}>
                'i' स्वर भएका अक्षरहरूमा सानो ゃ, ゅ, ょ जोडेर एकै मात्राको संयुक्त ध्वनि निकालिन्छ (जस्तै: き + ゃ = きゃ kya)।
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "12px" }}>
              {YOON_RULES.map((group, gIdx) => (
                <div
                  key={gIdx}
                  style={{
                    border: "1.5px solid #f5d0fe",
                    borderRadius: "10px",
                    padding: "14px",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ fontWeight: "800", color: "#a21caf", fontSize: "14px", marginBottom: "8px" }}>
                    {group.group}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {group.items.map((it, itIdx) => {
                      const audioId = `yoon-${gIdx}-${itIdx}`;
                      const isPlaying = playingAudioId === audioId;
                      return (
                        <div
                          key={itIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#fdf4ff",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #fae8ff"
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: "900", color: "#86198f", fontSize: "15px", marginRight: "6px" }}>
                              {it.kana}
                            </span>
                            <span style={{ fontSize: "12px", color: "#475569" }}>
                              [{it.romaji}] {it.nepali} · <strong style={{ color: "#0f172a" }}>{it.word}</strong> ({it.meaning})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => playSample(it.word, audioId)}
                            style={{
                              backgroundColor: isPlaying ? "#a21caf" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#a21caf",
                              border: "1px solid #f5d0fe",
                              borderRadius: "4px",
                              padding: "4px 7px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {isPlaying ? "⏹" : "▶"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DEVOICING */}
        {activeTab === 'devoice' && (
          <div>
            <div style={{ marginBottom: "16px", padding: "14px 18px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
              <div style={{ fontWeight: "800", color: "#334155", fontSize: "15px" }}>
                🔇 स्वरको अघोषीकरण (母音の無声化 - Silent or Devoiced Vowels)
              </div>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
                जापानीहरूले बोल्दा 'i' र 'u' स्वरहरूलाई कतिपय अवस्थामा सास मात्र फुकेर मधुरो (मौन प्राय:) बनाउँछन्। यसले गर्दा बोली प्राकृतिक सुनिन्छ।
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
              {DEVOICING_RULES.map((dev, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "14px", marginBottom: "6px" }}>
                    {dev.title}
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.4", margin: "0 0 10px" }}>
                    {dev.explanation}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {dev.examples.map((ex, exIdx) => {
                      const audioId = `dev-${idx}-${exIdx}`;
                      const isPlaying = playingAudioId === audioId;
                      return (
                        <div
                          key={exIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#f1f5f9",
                            padding: "6px 10px",
                            borderRadius: "6px"
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px", marginRight: "6px" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontSize: "12px", color: "#0284c7", fontWeight: "700" }}>
                              [{ex.spoken}]
                            </span>
                            <span style={{ fontSize: "12px", color: "#15803d", marginLeft: "6px" }}>
                              · {ex.nepali}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => playSample(ex.written, audioId)}
                            style={{
                              backgroundColor: isPlaying ? "#0284c7" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#0284c7",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {isPlaying ? "⏹" : "▶"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: 5 CORE VOWELS (あいうえお) */}
        {activeTab === 'vowels' && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
              {JAPANESE_VOWELS.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1.5px solid #e9d5ff",
                    borderRadius: "10px",
                    padding: "14px",
                    backgroundColor: "#ffffff",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#7e22ce" }}>
                    {v.kana}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#15803d", margin: "4px 0" }}>
                    Romaji: [{v.romaji}] · Nepali: [{v.nepali}]
                  </div>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 10px" }}>
                    {v.description}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                    {v.examples.map((ex, exIdx) => {
                      const audioId = `vow-${idx}-${exIdx}`;
                      const isPlaying = playingAudioId === audioId;
                      return (
                        <div
                          key={exIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#faf5ff",
                            padding: "4px 8px",
                            borderRadius: "4px"
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: "700" }}>
                            {ex.written} <span style={{ color: "#7e22ce" }}>({ex.reading})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => playSample(ex.written, audioId)}
                            style={{
                              backgroundColor: isPlaying ? "#7e22ce" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#7e22ce",
                              border: "1px solid #d8b4fe",
                              borderRadius: "4px",
                              padding: "2px 6px",
                              fontSize: "10px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            {isPlaying ? "⏹" : "▶"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
