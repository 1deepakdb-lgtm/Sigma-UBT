'use client';
import { playInstantAudio, prefetchBatch } from '@/lib/instantAudioEngine';

import React, { useState, useMemo, useRef, useEffect } from 'react';

// =============================================================================
// 1. SINGLE CONSONANTS (14 기본 단자음)
// =============================================================================
export const SINGLE_CONSONANTS = [
  {
    char: "ㄱ",
    nameKo: "기역",
    nameRoman: "Giyeok",
    english: "g / k",
    nepali: "क / ग / ख",
    soundSample: "가",
    initialSound: "ख (Kh) — शब्दको सुरुमा आउँदा",
    medialSound: "ग (G) — शब्दको बीचमा वा स्वर पछाडि आउँदा",
    finalSound: "क् (k) — फात्छिम (मुनि) आउँदा",
    descNe: "यो कोरियन भाषाको पहिलो व्यञ्जन हो। सुरुमा आउँदा हल्का 'ख', बीचमा 'ग' र मुनि आउँदा रोकिएको 'क्' उच्चारण हुन्छ।",
    examples: [
      { ko: "가방", ro: "gabang", ne: "झोला (सुरुमा: ख)", spoken: "가방" },
      { ko: "고기", ro: "gogi", ne: "मासु (सुरुमा: ख, बीचमा: ग)", spoken: "고기" },
      { ko: "수박", ro: "subak", ne: "खर्बुजा (मुनि: क्)", spoken: "수박" }
    ]
  },
  {
    char: "ㄴ",
    nameKo: "니은",
    nameRoman: "Nieun",
    english: "n",
    nepali: "न",
    soundSample: "나",
    initialSound: "न (N) — सुरुमा",
    medialSound: "न (N) — बीचमा",
    finalSound: "न् (N) — मुनि (फात्छिम)",
    descNe: "यो अक्षर सुरु, बीच र मुनि सबै स्थानमा एउटै स्वाभाविक 'न' उच्चारण हुन्छ।",
    examples: [
      { ko: "나무", ro: "namu", ne: "रूख", spoken: "나무" },
      { ko: "누나", ro: "nuna", ne: "दिदी", spoken: "누나" },
      { ko: "눈", ro: "nun", ne: "आँखा / हिउँ", spoken: "눈" }
    ]
  },
  {
    char: "ㄷ",
    nameKo: "디귿",
    nameRoman: "Digeut",
    english: "d / t",
    nepali: "त / द / थ",
    soundSample: "다",
    initialSound: "थ (Th) — शब्दको सुरुमा आउँदा",
    medialSound: "द (D) — शब्दको बीचमा वा स्वर पछाडि आउँदा",
    finalSound: "त् (T) — फात्छिम (मुनि) आउँदा",
    descNe: "सुरुमा आउँदा 'थ', बीचमा आउँदा 'द' र शब्दको मुनि (फात्छिम) आउँदा प्रतिनिधि ध्वनि 'त्' उच्चारण हुन्छ।",
    examples: [
      { ko: "다리", ro: "dari", ne: "खुट्टा / पुल (सुरुमा: थ)", spoken: "다리" },
      { ko: "어디", ro: "eodi", ne: "कहाँ (बीचमा: द)", spoken: "어디" },
      { ko: "곧", ro: "got", ne: "तुरुन्तै (मुनि: त्)", spoken: "곧" }
    ]
  },
  {
    char: "ㄹ",
    nameKo: "리을",
    nameRoman: "Rieul",
    english: "r / l",
    nepali: "र / ल",
    soundSample: "라",
    initialSound: "र (R) — सुरुमा",
    medialSound: "र (R) — स्वरको बीचमा",
    finalSound: "ल् (L) — मुनि फात्छिममा",
    descNe: "स्वर वर्णको अघि वा बीचमा आउँदा 'र' उच्चारण हुन्छ भने मुनि (फात्छिममा) वा दोहोरो ㄹㄹ आउँदा 'ल्' उच्चारण हुन्छ।",
    examples: [
      { ko: "라디오", ro: "radio", ne: "रेडियो (सुरुमा: र)", spoken: "라디오" },
      { ko: "우리", ro: "uri", ne: "हामी (बीचमा: र)", spoken: "우리" },
      { ko: "물", ro: "mul", ne: "पानी (मुनि: ल्)", spoken: "물" }
    ]
  },
  {
    char: "ㅁ",
    nameKo: "미음",
    nameRoman: "Mieum",
    english: "m",
    nepali: "म",
    soundSample: "마",
    initialSound: "म (M) — सुरुमा",
    medialSound: "म (M) — बीचमा",
    finalSound: "म् (M) — मुनि फात्छिममा",
    descNe: "दुवै ओठ जोडेर निकालिने ध्वनि हो। सबै स्थानमा 'म' नै उच्चारण हुन्छ।",
    examples: [
      { ko: "모자", ro: "moja", ne: "टोपी", spoken: "모자" },
      { ko: "어머니", ro: "eomeoni", ne: "आमा", spoken: "어머니" },
      { ko: "밤", ro: "bam", ne: "रात / कटुस", spoken: "밤" }
    ]
  },
  {
    char: "ㅂ",
    nameKo: "비읍",
    nameRoman: "Bieup",
    english: "b / p",
    nepali: "प / ब / फ",
    soundSample: "바",
    initialSound: "फ (Ph) — शब्दको सुरुमा आउँदा",
    medialSound: "ब (B) — शब्दको बीचमा वा स्वर पछाडि आउँदा",
    finalSound: "प् (P) — फात्छिम (मुनि) आउँदा",
    descNe: "सुरुमा आउँदा हल्का 'फ', शब्दको बीचमा 'ब' र मुनि आउँदा ओठ बन्द गरेर निकालिने 'प्' उच्चारण हुन्छ।",
    examples: [
      { ko: "바보", ro: "babo", ne: "मूर्ख (सुरुमा: फ, बीचमा: ब)", spoken: "바보" },
      { ko: "아버지", ro: "abeoji", ne: "बुबा (बीचमा: ब)", spoken: "아버지" },
      { ko: "밥", ro: "bap", ne: "भात (सुरुमा: फ, मुनि: प्)", spoken: "밥" }
    ]
  },
  {
    char: "ㅅ",
    nameKo: "시옷",
    nameRoman: "Siot",
    english: "s / sh",
    nepali: "स / श",
    soundSample: "사",
    initialSound: "स (S) — सामान्य स्वरसँग",
    medialSound: "श (Sh) — ㅣ, ㅑ, ㅕ, ㅛ, ㅠ, ㅖ सँग",
    finalSound: "त् (T) — फात्छिम (मुनि) आउँदा",
    descNe: "सामान्यतया 'स' उच्चारण हुन्छ तर 'ㅣ' वा 'y' ध्वनिका स्वरहरूसँग भेटिँदा 'श' बन्दछ। मुनि आउँदा 'त्' उच्चारण हुन्छ।",
    examples: [
      { ko: "사과", ro: "sagwa", ne: "स्याउ (स)", spoken: "사과" },
      { ko: "시간", ro: "sigan", ne: "समय (श)", spoken: "시간" },
      { ko: "옷", ro: "ot", ne: "लुगा (मुनि: त्)", spoken: "옷" }
    ]
  },
  {
    char: "ㅇ",
    nameKo: "이응",
    nameRoman: "Ieung",
    english: "ng / silent",
    nepali: "शून्य (स्वर) / ङ",
    soundSample: "아",
    initialSound: "मौन (Silent) — स्वर वर्णलाई आधार दिने",
    medialSound: "मौन (Silent) — स्वर वर्णसँग",
    finalSound: "ङ (Ng) — मुनि फात्छिममा आउँदा",
    descNe: "अक्षरको माथि वा सुरुमा आउँदा यसको आफ्नै ध्वनि हुँदैन (स्वरको ध्वनि आउँछ)। मुनि फात्छिममा आउँदा 'ङ' ध्वनि हुन्छ।",
    examples: [
      { ko: "아이", ro: "ai", ne: "बच्चा (शून्य ध्वनि)", spoken: "아이" },
      { ko: "우유", ro: "uyu", ne: "दूध (शून्य ध्वनि)", spoken: "우유" },
      { ko: "강", ro: "gang", ne: "नदी (मुनि: ङ)", spoken: "강" }
    ]
  },
  {
    char: "ㅈ",
    nameKo: "지읒",
    nameRoman: "Jieut",
    english: "j / ch",
    nepali: "च / ज / छ",
    soundSample: "자",
    initialSound: "छ (Chh) — शब्दको सुरुमा आउँदा",
    medialSound: "ज (J) — शब्दको बीचमा वा स्वर पछाडि आउँदा",
    finalSound: "त् (T) — फात्छिम (मुनि) आउँदा",
    descNe: "सुरुमा आउँदा 'छ', बीचमा आउँदा 'ज' र मुनि फात्छिममा आउँदा 'त्' उच्चारण हुन्छ।",
    examples: [
      { ko: "지도", ro: "jido", ne: "नक्सा (सुरुमा: छ)", spoken: "지도" },
      { ko: "모자", ro: "moja", ne: "टोपी (बीचमा: ज)", spoken: "모자" },
      { ko: "낮", ro: "nat", ne: "दिउँसो (मुनि: त्)", spoken: "낮" }
    ]
  },
  {
    char: "ㅊ",
    nameKo: "치읓",
    nameRoman: "Chieut",
    english: "ch' (Aspirated)",
    nepali: "छ (कडा)",
    soundSample: "차",
    initialSound: "छ (कडा हावा फाल्ने)",
    medialSound: "छ (Aspirated)",
    finalSound: "त् (T) — मुनि फात्छिममा",
    descNe: "मुखबाट जोडले हावा फालेर निकालिने कडा 'छ' ध्वनि हो। मुनि आउँदा 'त्' उच्चारण हुन्छ।",
    examples: [
      { ko: "차", ro: "cha", ne: "चिया / गाडी", spoken: "차" },
      { ko: "치마", ro: "chima", ne: "स्कर्ट", spoken: "치마" },
      { ko: "꽃", ro: "kkot", ne: "फूल (मुनि: त्)", spoken: "꽃" }
    ]
  },
  {
    char: "ㅋ",
    nameKo: "키읔",
    nameRoman: "Kieuk",
    english: "k' (Aspirated)",
    nepali: "ख (कडा)",
    soundSample: "카",
    initialSound: "ख (हावा फाल्ने कडा ध्वनि)",
    medialSound: "ख (Aspirated K)",
    finalSound: "क् (K) — मुनि फात्छिममा",
    descNe: "जोडले हावा फालेर निकालिने कडा 'ख' ध्वनि हो। मुनि फात्छिममा आउँदा 'क्' हुन्छ।",
    examples: [
      { ko: "카메라", ro: "kamera", ne: "क्यामेरा", spoken: "카메라" },
      { ko: "코", ro: "ko", ne: "नाक", spoken: "코" },
      { ko: "부엌", ro: "bueok", ne: "भान्सा (मुनि: क्)", spoken: "부엌" }
    ]
  },
  {
    char: "ㅌ",
    nameKo: "티읕",
    nameRoman: "Tieut",
    english: "t' (Aspirated)",
    nepali: "थ (कडा)",
    soundSample: "타",
    initialSound: "थ (हावा फाल्ने कडा ध्वनि)",
    medialSound: "थ (Aspirated T)",
    finalSound: "त् (T) — मुनि फात्छिममा",
    descNe: "जोडले हावा फालेर निकालिने कडा 'थ' ध्वनि हो। मुनि फात्छिममा आउँदा 'त्' हुन्छ।",
    examples: [
      { ko: "타다", ro: "tada", ne: "चढ्नु / जल्नु", spoken: "타다" },
      { ko: "토마토", ro: "tomato", ne: "गोलभेँडा", spoken: "토마토" },
      { ko: "끝", ro: "kkeut", ne: "अन्त्य (मुनि: त्)", spoken: "끝" }
    ]
  },
  {
    char: "ㅍ",
    nameKo: "피읖",
    nameRoman: "Pieup",
    english: "p' (Aspirated)",
    nepali: "फ (कडा)",
    soundSample: "파",
    initialSound: "फ (ओठबाट हावा फाल्ने)",
    medialSound: "फ (Aspirated P)",
    finalSound: "प् (P) — मुनि फात्छिममा",
    descNe: "दुवै ओठ जोडेर एकैपटक जोडले हावा फाल्दै निकालिने कडा 'फ' ध्वनि हो। मुनि आउँदा 'प्' हुन्छ।",
    examples: [
      { ko: "파", ro: "pa", ne: "हरियो प्याज", spoken: "파" },
      { ko: "포도", ro: "podo", ne: "अङ्गुर", spoken: "포도" },
      { ko: "앞", ro: "ap", ne: "अगाडि (मुनि: प्)", spoken: "앞" }
    ]
  },
  {
    char: "ㅎ",
    nameKo: "히읗",
    nameRoman: "Hieut",
    english: "h",
    nepali: "ह",
    soundSample: "하",
    initialSound: "ह (H) — कण्ठबाट",
    medialSound: "ह (स्वरको बीचमा हल्का वा मौन)",
    finalSound: "त् (T) — मुनि फात्छिममा",
    descNe: "घाँटीको भित्री भाग (कण्ठ) बाट निकालिने 'ह' ध्वनि हो। स्वर अगाडि आउँदा कहिलेकाहीँ मौन (silent) बन्दछ।",
    examples: [
      { ko: "하늘", ro: "haneul", ne: "आकाश", spoken: "하늘" },
      { ko: "하루", ro: "haru", ne: "एक दिन", spoken: "하루" },
      { ko: "좋다", ro: "jota", ne: "राम्रो हुनु (ㅎ+ㄷ=थ)", spoken: "좋다" }
    ]
  }
];

// =============================================================================
// 2. DUAL / DOUBLE CONSONANTS (5 쌍자음)
// =============================================================================
export const DUAL_CONSONANTS = [
  {
    char: "ㄲ",
    nameKo: "쌍기역",
    nameRoman: "Ssang-giyeok",
    english: "kk (Tensed G/K)",
    nepali: "क (कडा / घाँटी च्यापेर)",
    soundSample: "까",
    initialSound: "क (कडा)",
    medialSound: "क (कडा)",
    finalSound: "क् (K) — मुनि फात्छिममा",
    descNe: "घाँटीको नली हल्का च्यापेर बिना हावा निकालिने कडा 'क' ध्वनि हो। यसलाई नेपालीको 'क्क' जस्तै उच्चारण गरिन्छ।",
    examples: [
      { ko: "까치", ro: "kkachi", ne: "रूखको चरा (म्यागपाई)", spoken: "까치" },
      { ko: "꼬리", ro: "kkori", ne: "पुच्छर", spoken: "꼬리" },
      { ko: "밖", ro: "bak", ne: "बाहिर (मुनि: क्)", spoken: "밖" }
    ]
  },
  {
    char: "ㄸ",
    nameKo: "쌍디귿",
    nameRoman: "Ssang-digeut",
    english: "tt (Tensed D/T)",
    nepali: "त (कडा / च्यापेर)",
    soundSample: "따",
    initialSound: "त (कडा)",
    medialSound: "त (कडा)",
    finalSound: "प्रयोग हुँदैन (फात्छिममा आउँदैन)",
    descNe: "जिब्रो माथिल्लो दाँतमा कडासँग च्यापेर निकालिने 'त' ध्वनि हो। नेपालीको 'त्त' जस्तै कडा सुनिन्छ।",
    examples: [
      { ko: "딸기", ro: "ttalgi", ne: "स्ट्रबेरी", spoken: "딸기" },
      { ko: "뜨겁다", ro: "tteugeopda", ne: "तातो हुनु", spoken: "뜨겁다" },
      { ko: "또", ro: "tto", ne: "फेरि / अझै", spoken: "또" }
    ]
  },
  {
    char: "ㅃ",
    nameKo: "쌍비읍",
    nameRoman: "Ssang-bieup",
    english: "pp (Tensed B/P)",
    nepali: "प (कडा / ओठ च्यापेर)",
    soundSample: "빠",
    initialSound: "प (कडा)",
    medialSound: "प (कडा)",
    finalSound: "प्रयोग हुँदैन (फात्छिममा आउँदैन)",
    descNe: "दुवै ओठ कडासँग थिचेर बिना हावा बाहिर निकाल्दै बोलिने कडा 'प' ध्वनि हो। नेपालीको 'प्प' जस्तै।",
    examples: [
      { ko: "빵", ro: "ppang", ne: "पाउरोटी / ब्रेड", spoken: "빵" },
      { ko: "뽀뽀", ro: "ppoppo", ne: "म्वाई / चुम्बन", spoken: "뽀뽀" },
      { ko: "빨리", ro: "ppalli", ne: "छिटो", spoken: "빨리" }
    ]
  },
  {
    char: "ㅆ",
    nameKo: "쌍시옷",
    nameRoman: "Ssang-siot",
    english: "ss (Tensed S)",
    nepali: "स (कडा / तिखो)",
    soundSample: "싸",
    initialSound: "स (कडा तिखो)",
    medialSound: "स (कडा)",
    finalSound: "त् (T) — मुनि फात्छिममा आउँदा",
    descNe: "दाँत हल्का जोडेर तीव्र आवाजसहित निकालिने कडा 'स' ध्वनि हो। मुनि फात्छिममा आउँदा यसको उच्चारण 'त्' हुन्छ।",
    examples: [
      { ko: "싸다", ro: "ssada", ne: "सस्तो हुनु / प्याक गर्नु", spoken: "싸다" },
      { ko: "쓰다", ro: "sseuda", ne: "लेख्नु / प्रयोग गर्नु / तीतो हुनु", spoken: "쓰다" },
      { ko: "있다", ro: "it-tta", ne: "हुनु (मुनि: त्)", spoken: "있다" }
    ]
  },
  {
    char: "ㅉ",
    nameKo: "쌍지읒",
    nameRoman: "Ssang-jieut",
    english: "jj (Tensed J/CH)",
    nepali: "च (कडा / च्यापेर)",
    soundSample: "짜",
    initialSound: "च (कडा)",
    medialSound: "च (कडा)",
    finalSound: "प्रयोग हुँदैन (फात्छिममा आउँदैन)",
    descNe: "जिब्रोको बीच भाग तालुमा च्यापेर निकालिने कडा 'च' ध्वनि हो। नेपालीको 'च्च' जस्तै।",
    examples: [
      { ko: "짜다", ro: "jjada", ne: "नुनिलो हुनु", spoken: "짜다" },
      { ko: "찌개", ro: "jjigae", ne: "कोरियन सुप / ग्रेभी तरकारी", spoken: "찌개" },
      { ko: "진짜", ro: "jinjja", ne: "साँच्चै", spoken: "진짜" }
    ]
  }
];

// =============================================================================
// 3. SINGLE / BASIC VOWELS (10 기본 단모음)
// =============================================================================
export const SINGLE_VOWELS = [
  {
    char: "ㅏ",
    nameRoman: "a",
    nepali: "आ",
    spokenChar: "아",
    shapeDesc: "ओठ पूरै खुला पारेर",
    descNe: "मुख ठूलो खोलेर जिब्रो तल राख्दै 'आ' उच्चारण गरिन्छ।",
    exampleWord: { ko: "아이", ro: "ai", ne: "बच्चा", spoken: "아이" }
  },
  {
    char: "ㅑ",
    nameRoman: "ya",
    nepali: "या",
    spokenChar: "야",
    shapeDesc: "'इ' बाट सुरु गरी छिटो 'आ'",
    descNe: "सुरुमा छोटो 'इ' को ध्वनि उच्चारण गरी तुरुन्तै 'आ' मा पुग्दा 'या' बन्दछ।",
    exampleWord: { ko: "야구", ro: "yagu", ne: "बेसबल खेल", spoken: "야구" }
  },
  {
    char: "ㅓ",
    nameRoman: "eo",
    nepali: "अ (गहिरो खुला)",
    spokenChar: "어",
    shapeDesc: "बङ्गारा हल्का तल झारेर",
    descNe: "नेपालीको 'अ' भन्दा मुख अलिकति बढी खोलेर घाँटीको भित्री भागबाट निकालिने खुला 'अ' हो।",
    exampleWord: { ko: "어머니", ro: "eomeoni", ne: "आमा", spoken: "어머니" }
  },
  {
    char: "ㅕ",
    nameRoman: "yeo",
    nepali: "य",
    spokenChar: "여",
    shapeDesc: "'इ' बाट सुरु गरी छिटो 'अ'",
    descNe: "छोटो 'इ' ध्वनिबाट सुरु गरेर 'ㅓ (अ)' मा जाँदा 'य' ध्वनि बन्दछ।",
    exampleWord: { ko: "여자", ro: "yeoja", ne: "महिला", spoken: "여자" }
  },
  {
    char: "ㅗ",
    nameRoman: "o",
    nepali: "ओ",
    spokenChar: "오",
    shapeDesc: "ओठ गोलो पारेर",
    descNe: "ओठलाई पूरै गोलो बनाएर अगाडि तन्काउँदै निकालिने शुद्ध 'ओ' ध्वनि हो।",
    exampleWord: { ko: "오이", ro: "oi", ne: "काँक्रो", spoken: "오이" }
  },
  {
    char: "ㅛ",
    nameRoman: "yo",
    nepali: "यो",
    spokenChar: "요",
    shapeDesc: "'इ' बाट सुरु गरी छिटो 'ओ'",
    descNe: "छोटो 'इ' बाट सुरु गरी ओठ गोलो पार्दै 'यो' उच्चारण गरिन्छ।",
    exampleWord: { ko: "요리", ro: "yori", ne: "खाना पकाउने काम", spoken: "요리" }
  },
  {
    char: "ㅜ",
    nameRoman: "u",
    nepali: "ऊ",
    spokenChar: "우",
    shapeDesc: "ओठ अगाडि चुच्चो पारेर",
    descNe: "ओठलाई अगाडि धकेलेर सानो प्वाल जस्तो चुच्चो बनाउँदै 'ऊ' निकालिन्छ।",
    exampleWord: { ko: "우유", ro: "uyu", ne: "दूध", spoken: "우유" }
  },
  {
    char: "ㅠ",
    nameRoman: "yu",
    nepali: "यू",
    spokenChar: "유",
    shapeDesc: "'इ' बाट सुरु गरी छिटो 'ऊ'",
    descNe: "छोटो 'इ' बाट सुरु गरी ओठ चुच्चो पार्दै 'यू' उच्चारण गरिन्छ।",
    exampleWord: { ko: "유리", ro: "yuri", ne: "सिसा / ग्लास", spoken: "유리" }
  },
  {
    char: "ㅡ",
    nameRoman: "eu",
    nepali: "उ (ओठ नगोला पारी)",
    spokenChar: "으",
    shapeDesc: "ओठ फ्ल्याट/तेर्सो तन्काएर",
    descNe: "ओठलाई गोलो नबनाई दाँत हल्का देखाएर मुस्कुराए जस्तै तेर्सो तन्काउँदै निकालिने 'उ' ध्वनि हो।",
    exampleWord: { ko: "음악", ro: "eumak", ne: "संगीत", spoken: "음악" }
  },
  {
    char: "ㅣ",
    nameRoman: "i",
    nepali: "ई",
    spokenChar: "이",
    shapeDesc: "ओठ दायाँ-बायाँ तन्काएर",
    descNe: "मुख मुस्कुराए जस्तै पूरै दायाँ-बायाँ तन्काएर जिब्रो माथि उठाउँदै 'ई' उच्चारण गरिन्छ।",
    exampleWord: { ko: "이마", ro: "ima", ne: "निधार", spoken: "이마" }
  }
];

// =============================================================================
// 4. DUAL / COMPOUND VOWELS (11 이중/복합 모음)
// =============================================================================
export const DUAL_VOWELS = [
  {
    char: "ㅐ",
    nameRoman: "ae",
    nepali: "ए (ㅏ + ㅣ)",
    spokenChar: "애",
    formula: "ㅏ + ㅣ = ㅐ",
    descNe: "मुख अलिकति ठूलो खोलेर निकालिने 'ए' ध्वनि हो।",
    exampleWord: { ko: "애기", ro: "aegi", ne: "सानो बच्चा", spoken: "애기" }
  },
  {
    char: "ㅒ",
    nameRoman: "yae",
    nepali: "ये (ㅑ + ㅣ)",
    spokenChar: "얘",
    formula: "ㅑ + ㅣ = ㅒ",
    descNe: "'इ' बाट सुरु गरी 'ए' मा जोड्दा 'ये' बन्दछ।",
    exampleWord: { ko: "얘기", ro: "yaegi", ne: "कुराकानी / कथा", spoken: "얘기" }
  },
  {
    char: "ㅔ",
    nameRoman: "e",
    nepali: "ए (ㅓ + ㅣ)",
    spokenChar: "에",
    formula: "ㅓ + ㅣ = ㅔ",
    descNe: "मुख सामान्य खोलेर निकालिने स्वाभाविक 'ए' ध्वनि हो। आधुनिक कोरियनमा ㅐ र ㅔ उस्तै सुनिन्छ।",
    exampleWord: { ko: "에어컨", ro: "eeokeon", ne: "एयर कन्डिसनर", spoken: "에어컨" }
  },
  {
    char: "ㅖ",
    nameRoman: "ye",
    nepali: "ये (ㅕ + ㅣ)",
    spokenChar: "예",
    formula: "ㅕ + ㅣ = ㅖ",
    descNe: "छोटो 'इ' बाट सुरु गरी 'ए' उच्चारण गर्दा 'ये' बन्दछ।",
    exampleWord: { ko: "예술", ro: "yesul", ne: "कला", spoken: "예술" }
  },
  {
    char: "ㅘ",
    nameRoman: "wa",
    nepali: "वा (ㅗ + ㅏ)",
    spokenChar: "와",
    formula: "ㅗ + ㅏ = ㅘ",
    descNe: "ओठ गोलो 'ओ' बाट छिट्टै 'आ' मा लैजाँदा 'वा' बन्दछ।",
    exampleWord: { ko: "와인", ro: "wain", ne: "रक्सी (वाइन)", spoken: "와인" }
  },
  {
    char: "ㅙ",
    nameRoman: "wae",
    nepali: "वै / वे (ㅗ + ㅐ)",
    spokenChar: "왜",
    formula: "ㅗ + ㅐ = ㅙ",
    descNe: "'ओ' बाट सुरु गरेर 'ए' मा जोड्दा 'वै / वे' ध्वनि बन्दछ।",
    exampleWord: { ko: "왜", ro: "wae", ne: "किन?", spoken: "왜" }
  },
  {
    char: "ㅚ",
    nameRoman: "oe",
    nepali: "वे (ㅗ + ㅣ)",
    spokenChar: "외",
    formula: "ㅗ + ㅣ = ㅚ",
    descNe: "यसलाई आधुनिक कोरियनमा 'वे' (We) जस्तै उच्चारण गरिन्छ।",
    exampleWord: { ko: "외국", ro: "oeguk", ne: "विदेश", spoken: "외국" }
  },
  {
    char: "ㅝ",
    nameRoman: "wo",
    nepali: "व / वो (ㅜ + ㅓ)",
    spokenChar: "워",
    formula: "ㅜ + ㅓ = ㅝ",
    descNe: "'उ' बाट सुरु गरेर 'अ' मा लैजाँदा 'व' ध्वनि बन्दछ।",
    exampleWord: { ko: "월요일", ro: "woryoil", ne: "सोमबार", spoken: "월요일" }
  },
  {
    char: "ㅞ",
    nameRoman: "we",
    nepali: "वे (ㅜ + ㅔ)",
    spokenChar: "웨",
    formula: "ㅜ + ㅔ = ㅞ",
    descNe: "'उ' बाट सुरु गरेर 'ए' मा लैजाँदा 'वे' बन्दछ।",
    exampleWord: { ko: "웨딩", ro: "weding", ne: "विवाह", spoken: "웨딩" }
  },
  {
    char: "ㅟ",
    nameRoman: "wi",
    nepali: "वी (ㅜ + ㅣ)",
    spokenChar: "위",
    formula: "ㅜ + ㅣ = ㅟ",
    descNe: "'उ' बाट सुरु गरेर 'ई' मा जोड्दा 'वी' बन्दछ।",
    exampleWord: { ko: "위치", ro: "wichi", ne: "स्थान / लोकेसन", spoken: "위치" }
  },
  {
    char: "ㅢ",
    nameRoman: "ui",
    nepali: "उई (ㅡ + ㅣ)",
    spokenChar: "의",
    formula: "ㅡ + ㅣ = ㅢ",
    descNe: "'ㅡ (उ)' र 'ㅣ (ई)' को संयुक्त ध्वनि हो। शब्दको सुरुमा 'उई', बीचमा 'ई' र सम्बन्ध जनाउँदा 'ए' उच्चारण हुन्छ।",
    exampleWord: { ko: "의사", ro: "uisa", ne: "डाक्टर", spoken: "의사" }
  }
];

// =============================================================================
// 5. COMBINATION MATRIX MAPPINGS
// =============================================================================
// Base Vowel list for the primary 10-column table
export const MATRIX_VOWELS = [
  { v: "ㅏ", ro: "a", ne: "आ" },
  { v: "ㅑ", ro: "ya", ne: "या" },
  { v: "ㅓ", ro: "eo", ne: "अ" },
  { v: "ㅕ", ro: "yeo", ne: "य" },
  { v: "ㅗ", ro: "o", ne: "ओ" },
  { v: "ㅛ", ro: "yo", ne: "यो" },
  { v: "ㅜ", ro: "u", ne: "उ" },
  { v: "ㅠ", ro: "yu", ne: "यु" },
  { v: "ㅡ", ro: "eu", ne: "उ" },
  { v: "ㅣ", ro: "i", ne: "इ" }
];

// All 11 Compound Vowels for secondary matrix
export const COMPOUND_MATRIX_VOWELS = [
  { v: "ㅐ", ro: "ae", ne: "ए" },
  { v: "ㅒ", ro: "yae", ne: "ये" },
  { v: "ㅔ", ro: "e", ne: "ए" },
  { v: "ㅖ", ro: "ye", ne: "ये" },
  { v: "ㅘ", ro: "wa", ne: "वा" },
  { v: "ㅙ", ro: "wae", ne: "वै" },
  { v: "ㅚ", ro: "oe", ne: "वे" },
  { v: "ㅝ", ro: "wo", ne: "व" },
  { v: "ㅞ", ro: "we", ne: "वे" },
  { v: "ㅟ", ro: "wi", ne: "वी" },
  { v: "ㅢ", ro: "ui", ne: "उइ" }
];

// Unicode offset helper to compose Korean Syllable: (cho * 21 + jung) * 28 + jong + 0xAC00
const CHOSUNG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNGSUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];

export function composeHangul(c, v) {
  const cIndex = CHOSUNG.indexOf(c);
  const vIndex = JUNGSUNG.indexOf(v);
  if (cIndex === -1 || vIndex === -1) return c + v;
  const code = 0xAC00 + (cIndex * 21 * 28) + (vIndex * 28);
  return String.fromCharCode(code);
}

// Convert any standalone vowel or consonant into a complete natural Korean syllable
export function getSpokenKoreanText(text) {
  if (!text) return "";
  const t = String(text).trim();
  const VOWEL_TO_SYLLABLE = {
    "ㅏ": "아", "ㅑ": "야", "ㅓ": "어", "ㅕ": "여", "ㅗ": "오",
    "ㅛ": "요", "ㅜ": "우", "ㅠ": "유", "ㅡ": "으", "ㅣ": "이",
    "ㅐ": "애", "ㅒ": "얘", "ㅔ": "에", "ㅖ": "예", "ㅘ": "와",
    "ㅙ": "왜", "ㅚ": "외", "ㅝ": "워", "ㅞ": "웨", "ㅟ": "위",
    "ㅢ": "의"
  };
  if (VOWEL_TO_SYLLABLE[t]) return VOWEL_TO_SYLLABLE[t];

  const CONSONANT_TO_SYLLABLE = {
    "ㄱ": "가", "ㄴ": "나", "ㄷ": "다", "ㄹ": "라", "ㅁ": "마",
    "ㅂ": "바", "ㅅ": "사", "ㅇ": "아", "ㅈ": "자", "ㅊ": "차",
    "ㅋ": "카", "ㅌ": "타", "ㅍ": "파", "ㅎ": "하",
    "ㄲ": "까", "ㄸ": "따", "ㅃ": "빠", "ㅆ": "싸", "ㅉ": "짜"
  };
  if (CONSONANT_TO_SYLLABLE[t]) return CONSONANT_TO_SYLLABLE[t];

  return t;
}

// Crisp, universally visible SVG Speaker Icon for buttons
function SpeakerIcon({ isPlaying = false, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        display: "block",
        flexShrink: 0,
        transition: "transform 0.15s ease",
        transform: isPlaying ? "scale(1.15)" : "scale(1)"
      }}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

// Approximate Nepali and Roman pronunciation for common consonant + vowel combos
const SYLLABLE_PRON_MAP = {
  // ㄱ (गा/खा)
  "가": { ne: "खा / गा", ro: "ga / ka" },
  "갸": { ne: "ख्या / ग्या", ro: "gya" },
  "거": { ne: "ख / ग", ro: "geo" },
  "겨": { ne: "ख्यो / ग्यो", ro: "gyeo" },
  "고": { ne: "खो / गो", ro: "go" },
  "교": { ne: "ख्यो / ग्यो", ro: "gyo" },
  "구": { ne: "खु / गु", ro: "gu" },
  "규": { ne: "ख्यु / ग्यु", ro: "gyu" },
  "그": { ne: "ख / ग", ro: "geu" },
  "기": { ne: "खि / गि", ro: "gi" },
  // ㄴ (न)
  "나": { ne: "ना", ro: "na" },
  "냐": { ne: "न्या", ro: "nya" },
  "너": { ne: "न", ro: "neo" },
  "녀": { ne: "न्य", ro: "nyeo" },
  "노": { ne: "नो", ro: "no" },
  "뇨": { ne: "न्यो", ro: "nyo" },
  "누": { ne: "नु", ro: "nu" },
  "뉴": { ne: "न्यु", ro: "nyu" },
  "느": { ne: "न", ro: "neu" },
  "니": { ne: "नि", ro: "ni" },
  // ㄷ (दा/था)
  "다": { ne: "था / दा", ro: "da / ta" },
  "댜": { ne: "थ्या / द्या", ro: "dya" },
  "더": { ne: "थ / द", ro: "deo" },
  "뎌": { ne: "थ्यो / द्यो", ro: "dyeo" },
  "도": { ne: "थो / दो", ro: "do" },
  "됴": { ne: "थ्यो / द्यो", ro: "dyo" },
  "두": { ne: "थु / दु", ro: "du" },
  "ड्यू": { ne: "थ्यु / द्यु", ro: "dyu" },
  "드": { ne: "थ / द", ro: "deu" },
  "디": { ne: "थि / दि", ro: "di" },
  // ㄲ (का)
  "까": { ne: "का (कडा)", ro: "kka" },
  "꺄": { ne: "क्या", ro: "kkya" },
  "꺼": { ne: "क", ro: "kkeo" },
  "껴": { ne: "क्य", ro: "kkyeo" },
  "꼬": { ne: "को", ro: "kko" },
  "꾜": { ne: "क्यो", ro: "kkyo" },
  "꾸": { ne: "कु", ro: "kku" },
  "뀨": { ne: "क्यु", ro: "kkyu" },
  "끄": { ne: "क", ro: "kkeu" },
  "끼": { ne: "कि", ro: "kki" }
};

export default function HangeulAlphabetGuide({ handlePlayAudio, playingAudioId }) {
  const [activeSubTab, setActiveSubTab] = useState("all"); // "all" | "single_c" | "dual_c" | "single_v" | "dual_v" | "matrix" | "builder"
  const [selectedBuilderC, setSelectedBuilderC] = useState("ㄱ");
  const [selectedBuilderV, setSelectedBuilderV] = useState("ㅏ");
  const [matrixFilterType, setMatrixFilterType] = useState("single"); // "single" | "dual"
  const [matrixVowelGroup, setMatrixVowelGroup] = useState("basic"); // "basic" | "compound"
  const [searchLetter, setSearchLetter] = useState("");
  const [localPlayingId, setLocalPlayingId] = useState(null);

  const audioCacheRef = useRef(new Map());
  const activeAudioRef = useRef(null);
  const lastPlayTimeRef = useRef(0);
  const cachedKoVoiceRef = useRef(null);

  // Studio-Quality Neural Audio Engine & Local Cache
  useEffect(() => {
    // 1. Cache speech synthesis voice if available for offline fallback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoice = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          const koVoice = voices.find(v => (v.lang === "ko-KR" || v.lang.startsWith("ko") || v.lang.includes("KR")));
          if (koVoice) cachedKoVoiceRef.current = koVoice;
        } catch (e) {}
      };
      loadVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoice;
      }
    }

    // 2. Pre-warm Neural Audio Cache using instantAudioEngine for 0ms touch response
    const coreWarmList = [
      "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하",
      "까", "따", "빠", "싸", "짜",
      "기역", "니은", "디귿", "리을", "미음", "비읍", "시옷", "이응", "지읒", "치읓", "키읔", "티읕", "피읖", "히읗",
      "쌍기역", "쌍디귿", "쌍비읍", "쌍시옷", "쌍지읒",
      "아", "야", "어", "여", "오", "요", "우", "유", "으", "이",
      "애", "얘", "에", "예", "와", "왜", "외", "워", "웨", "위", "의"
    ];
    try {
      prefetchBatch(coreWarmList, "ko", "female");
    } catch (e) {}
  }, []);

  // Studio-Quality Authentic Korean Pronunciation Engine
  const onPlay = (text, id = null) => {
    if (!text || typeof window === 'undefined') return;
    const now = Date.now();
    if (now - lastPlayTimeRef.current < 30) return;
    lastPlayTimeRef.current = now;

    let cleanText = String(text).trim();
    cleanText = cleanText.replace(/^[~\-\s]+/, '').replace(/[~\-\s]+$/, '');
    cleanText = cleanText.replace(/\(으\)/g, '으').replace(/\//g, ', ').replace(/[#*`_~]/g, '');
    if (!cleanText) cleanText = text;

    const spokenKorean = getSpokenKoreanText(cleanText);
    const playKey = id || text;

    let staticAudioUrl = null;
    if (spokenKorean.length === 1) {
      const code = spokenKorean.charCodeAt(0);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        const hex = code.toString(16).toLowerCase();
        staticAudioUrl = '/audio/hangeul/syl_' + hex + '.mp3';
      }
    }

    playInstantAudio({
      url: staticAudioUrl,
      text: spokenKorean,
      lang: 'ko',
      gender: 'female',
      id: playKey,
      voice: 'ko-KR-SunHiNeural',
      model: 'female-1',
      onStart: () => setLocalPlayingId(playKey),
      onEnd: () => setLocalPlayingId(null),
      onError: () => setLocalPlayingId(null)
    });
  };

  const isAudioPlaying = (id) => (localPlayingId === id || playingAudioId === id);

  const composedBuilderSyllable = useMemo(() => {
    return composeHangul(selectedBuilderC, selectedBuilderV);
  }, [selectedBuilderC, selectedBuilderV]);

  // Consonant list for matrix based on single/dual filter
  const matrixConsonants = matrixFilterType === "single" ? SINGLE_CONSONANTS : DUAL_CONSONANTS;
  const currentMatrixVowels = matrixVowelGroup === "basic" ? MATRIX_VOWELS : COMPOUND_MATRIX_VOWELS;

  return (
    <div style={{ width: "100%", marginBottom: "36px" }}>
      {/* ── HEADER BANNER ──────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "1.5px solid #bfdbfe",
        borderRadius: "14px",
        padding: "20px 22px",
        marginBottom: "20px",
        background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
        boxShadow: "0 4px 16px rgba(37,99,235,0.06)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "900",
                letterSpacing: "0.5px"
              }}>
                HANGEUL FOUNDATION
              </span>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e3a8a" }}>
                कोरियन वर्णमाला: स्वर, व्यञ्जन र संयोजन ध्वनि (한글 자모음 및 결합)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: "1.6" }}>
              कोरियन भाषा (한글) मा जम्मा <strong>४० वर्णहरू</strong> हुन्छन्: <strong>१९ व्यञ्जन (१४ एकल + ५ दोहोरो)</strong> र <strong>२१ स्वर (१० एकल + ११ दोहोरो)</strong>। तल सबै वर्णहरूको नेपाली र अङ्ग्रेजी उच्चारण, बनावट, ध्वनि र संयोजन तालिका (Matrix) दिइएको छ।
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", fontWeight: "800" }}>
              १४ एकल व्यञ्जन
            </span>
            <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", fontWeight: "800" }}>
              ५ दोहोरो व्यञ्जन
            </span>
            <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", fontWeight: "800" }}>
              १० एकल स्वर
            </span>
            <span style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", fontWeight: "800" }}>
              ११ दोहोरो स्वर
            </span>
          </div>
        </div>

        {/* ── SUB-TABS NAVIGATION ───────────────────────────────────────── */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid #e2e8f0",
          flexWrap: "wrap"
        }}>
          {[
            { id: "all", label: "सबै (All)", icon: "📚" },
            { id: "builder", label: "१. अक्षर संयोजन अभ्यास (Syllable Builder)", icon: "🧩" },
            { id: "single_c", label: "२. एकल व्यञ्जन (14 Single Consonants)", icon: "ㄱ" },
            { id: "dual_c", label: "३. दोहोरो व्यञ्जन (5 Dual Consonants)", icon: "ㄲ" },
            { id: "single_v", label: "४. एकल स्वर (10 Single Vowels)", icon: "ㅏ" },
            { id: "dual_v", label: "५. दोहोरो स्वर (11 Compound Vowels)", icon: "ㅐ" },
            { id: "matrix", label: "६. संयोजन तालिका (Sound Matrix Table)", icon: "🔠" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                backgroundColor: activeSubTab === tab.id ? "#2563eb" : "#ffffff",
                color: activeSubTab === tab.id ? "#ffffff" : "#334155",
                border: activeSubTab === tab.id ? "1.5px solid #1d4ed8" : "1.5px solid #cbd5e1",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "12.5px",
                fontWeight: "800",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: activeSubTab === tab.id ? "0 2px 8px rgba(37,99,235,0.2)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 0. FIRST: INTERACTIVE SYLLABLE BUILDER (अक्षर निर्माण अभ्यास) ──── */}
      {(activeSubTab === "all" || activeSubTab === "builder") && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "2.5px solid #2563eb",
          borderRadius: "14px",
          padding: "22px 24px",
          boxShadow: "0 6px 22px rgba(37,99,235,0.12)",
          marginBottom: "28px"
        }}>
          <div style={{ marginBottom: "16px", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🧩</span>
                <span>अक्षर निर्माण अभ्यास (Interactive Korean Syllable Builder)</span>
              </h4>
              <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", border: "1px solid #bfdbfe" }}>
                पहिलो अभ्यास (Interactive Practice)
              </span>
            </div>
            <p style={{ margin: "6px 0 0 0", fontSize: "13.5px", color: "#475569" }}>
              कुनै पनि व्यञ्जन (Consonant) र स्वर (Vowel) छानेर नयाँ अक्षर बनाउनुहोस् र त्यसको बनावट, नेपाली तथा अंग्रेजी उच्चारण हेर्नुहोस् र तुरुन्तै आवाज सुन्नुहोस्।
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            {/* 1. Pick Consonant */}
            <div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "8px", textTransform: "uppercase" }}>
                1. व्यञ्जन छान्नुहोस् (Choose Consonant):
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[...SINGLE_CONSONANTS, ...DUAL_CONSONANTS].map(c => (
                  <button
                    key={c.char}
                    type="button"
                    onClick={() => setSelectedBuilderC(c.char)}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "8px",
                      border: selectedBuilderC === c.char ? "2.5px solid #2563eb" : "1.5px solid #cbd5e1",
                      backgroundColor: selectedBuilderC === c.char ? "#eff6ff" : "#ffffff",
                      color: selectedBuilderC === c.char ? "#1e40af" : "#0f172a",
                      fontSize: "18px",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: selectedBuilderC === c.char ? "0 2px 6px rgba(37,99,235,0.2)" : "none"
                    }}
                  >
                    {c.char}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pick Vowel */}
            <div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#166534", marginBottom: "8px", textTransform: "uppercase" }}>
                2. स्वर छान्नुहोस् (Choose Vowel):
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[...SINGLE_VOWELS, ...DUAL_VOWELS].map(v => (
                  <button
                    key={v.char}
                    type="button"
                    onClick={() => setSelectedBuilderV(v.char)}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "8px",
                      border: selectedBuilderV === v.char ? "2.5px solid #16a34a" : "1.5px solid #cbd5e1",
                      backgroundColor: selectedBuilderV === v.char ? "#f0fdf4" : "#ffffff",
                      color: selectedBuilderV === v.char ? "#15803d" : "#0f172a",
                      fontSize: "18px",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: selectedBuilderV === v.char ? "0 2px 6px rgba(22,163,74,0.2)" : "none"
                    }}
                  >
                    {v.char}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Combined Result Card */}
          <div style={{
            backgroundColor: "#f8fafc",
            border: "2px dashed #93c5fd",
            borderRadius: "12px",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                fontSize: "56px",
                fontWeight: "900",
                color: "#1e3a8a",
                backgroundColor: "#ffffff",
                border: "2.5px solid #2563eb",
                borderRadius: "14px",
                width: "90px",
                height: "90px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(37,99,235,0.15)"
              }}>
                {composedBuilderSyllable}
              </div>

              <div>
                <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "bold", marginBottom: "4px" }}>
                  संयोजन सूत्र: <span style={{ color: "#2563eb", fontSize: "16px" }}>{selectedBuilderC}</span> (व्यञ्जन) + <span style={{ color: "#16a34a", fontSize: "16px" }}>{selectedBuilderV}</span> (स्वर) = <strong style={{ color: "#0f172a", fontSize: "18px" }}>{composedBuilderSyllable}</strong>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
                  ध्वनि / उच्चारण: {SYLLABLE_PRON_MAP[composedBuilderSyllable]?.ne || `${composedBuilderSyllable} (कोरियन संयुक्त ध्वनि)`}
                </div>
                <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Roman: {SYLLABLE_PRON_MAP[composedBuilderSyllable]?.ro || "Korean Syllable"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onMouseEnter={() => prefetchBatch([composedBuilderSyllable], 'ko', 'female')} onTouchStart={() => prefetchBatch([composedBuilderSyllable], 'ko', 'female')} onClick={() => onPlay(composedBuilderSyllable, `builder_${composedBuilderSyllable}`)}
              style={{
                backgroundColor: isAudioPlaying(`builder_${composedBuilderSyllable}`) ? "#1d4ed8" : "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "900",
                fontSize: "15px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                touchAction: "manipulation"
              }}
            >
              <span>🔊</span>
              <span>उच्चारण सुन्नुहोस् (Listen Pronounce)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 1. SINGLE CONSONANTS (14 기본 단자음) ─────────────────────────── */}
      {(activeSubTab === "all" || activeSubTab === "single_c") && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #93c5fd", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "900", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" }}>Part 1</span>
              <span>१४ एकल व्यञ्जन (14 Single Consonants - 단자음)</span>
            </h4>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>
              स्पीकर चिन्हमा थिचेर शुद्ध कोरियन उच्चारण सुन्नुहोस् 🔊
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "12px"
          }}>
            {SINGLE_CONSONANTS.map((c) => (
              <div
                key={c.char}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        fontSize: "30px",
                        fontWeight: "900",
                        color: "#1e3a8a",
                        backgroundColor: "#eff6ff",
                        width: "50px",
                        height: "50px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #bfdbfe"
                      }}>
                        {c.char}
                      </span>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                          {c.nameKo} <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>({c.nameRoman})</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a" }}>
                          नेपाली: {c.nepali}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onMouseEnter={() => prefetchBatch([c.nameKo], 'ko', 'female')} onTouchStart={() => prefetchBatch([c.nameKo], 'ko', 'female')} onClick={() => onPlay(c.nameKo, `single_c_${c.char}`)}
                      title={`${c.nameKo} उच्चारण सुन्नुहोस्`}
                      style={{
                        backgroundColor: isAudioPlaying(`single_c_${c.char}`) ? "#2563eb" : "#f1f5f9",
                        color: isAudioPlaying(`single_c_${c.char}`) ? "#ffffff" : "#1e40af",
                        border: "1.5px solid #cbd5e1",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        touchAction: "manipulation"
                      }}
                    >
                      <SpeakerIcon isPlaying={isAudioPlaying(`single_c_${c.char}`)} size={18} />
                    </button>
                  </div>

                  <div style={{ fontSize: "12px", color: "#334155", marginBottom: "8px", lineHeight: "1.5", backgroundColor: "#f8fafc", padding: "6px 10px", borderRadius: "6px" }}>
                    <span style={{ fontWeight: "bold", color: "#0f172a" }}>English:</span> {c.english} &nbsp;|&nbsp;
                    <span style={{ fontWeight: "bold", color: "#0f172a" }}>स्थान ध्वनि:</span> {c.initialSound}
                  </div>

                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                    {c.descNe}
                  </p>
                </div>

                {/* Example Words */}
                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                    उदाहरण शब्दहरू (Click to listen):
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {c.examples.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseEnter={() => prefetchBatch([ex.spoken], 'ko', 'female')} onTouchStart={() => prefetchBatch([ex.spoken], 'ko', 'female')} onClick={() => onPlay(ex.spoken, `ex_${c.char}_${idx}`)}
                        style={{
                          backgroundColor: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11.5px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          textAlign: "left"
                        }}
                      >
                        <strong style={{ color: "#1e40af" }}>{ex.ko}</strong>
                        <span style={{ color: "#64748b" }}>({ex.ne})</span>
                        <span style={{ fontSize: "10px" }}>🔊</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. DUAL CONSONANTS (5 쌍자음) ─────────────────────────────────── */}
      {(activeSubTab === "all" || activeSubTab === "dual_c") && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #fde68a", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "900", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ backgroundColor: "#d97706", color: "#ffffff", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" }}>Part 2</span>
              <span>५ दोहोरो / कडा व्यञ्जन (5 Dual / Tensed Consonants - 쌍자음)</span>
            </h4>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>
              घाँटी च्यापेर निकालिने कडा ध्वनि (Tensed Glottalized Sounds)
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "12px"
          }}>
            {DUAL_CONSONANTS.map((c) => (
              <div
                key={c.char}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #fef3c7",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        fontSize: "30px",
                        fontWeight: "900",
                        color: "#b45309",
                        backgroundColor: "#fffbeb",
                        width: "50px",
                        height: "50px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #fde68a"
                      }}>
                        {c.char}
                      </span>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                          {c.nameKo} <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>({c.nameRoman})</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#d97706" }}>
                          नेपाली: {c.nepali}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onMouseEnter={() => prefetchBatch([c.nameKo], 'ko', 'female')} onTouchStart={() => prefetchBatch([c.nameKo], 'ko', 'female')} onClick={() => onPlay(c.nameKo, `dual_c_${c.char}`)}
                      title={`${c.nameKo} उच्चारण सुन्नुहोस्`}
                      style={{
                        backgroundColor: isAudioPlaying(`dual_c_${c.char}`) ? "#d97706" : "#fef3c7",
                        color: isAudioPlaying(`dual_c_${c.char}`) ? "#ffffff" : "#92400e",
                        border: "1.5px solid #fde68a",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        touchAction: "manipulation"
                      }}
                    >
                      <SpeakerIcon isPlaying={isAudioPlaying(`dual_c_${c.char}`)} size={18} />
                    </button>
                  </div>

                  <div style={{ fontSize: "12px", color: "#78350f", marginBottom: "8px", lineHeight: "1.5", backgroundColor: "#fffbeb", padding: "6px 10px", borderRadius: "6px" }}>
                    <span style={{ fontWeight: "bold" }}>English:</span> {c.english} &nbsp;|&nbsp;
                    <span style={{ fontWeight: "bold" }}>उच्चारण प्रकृति:</span> कडा बिना हावा
                  </div>

                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                    {c.descNe}
                  </p>
                </div>

                {/* Example Words */}
                <div style={{ borderTop: "1px dashed #fde68a", paddingTop: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", textTransform: "uppercase", marginBottom: "4px" }}>
                    उदाहरण शब्दहरू:
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {c.examples.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseEnter={() => prefetchBatch([ex.spoken], 'ko', 'female')} onTouchStart={() => prefetchBatch([ex.spoken], 'ko', 'female')} onClick={() => onPlay(ex.spoken, `ex_dual_${c.char}_${idx}`)}
                        style={{
                          backgroundColor: "#fef3c7",
                          border: "1px solid #fde68a",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11.5px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          textAlign: "left"
                        }}
                      >
                        <strong style={{ color: "#92400e" }}>{ex.ko}</strong>
                        <span style={{ color: "#78350f" }}>({ex.ne})</span>
                        <span style={{ fontSize: "10px" }}>🔊</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. SINGLE VOWELS (10 기본 단모음) ────────────────────────────── */}
      {(activeSubTab === "all" || activeSubTab === "single_v") && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #86efac", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "900", color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ backgroundColor: "#16a34a", color: "#ffffff", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" }}>Part 3</span>
              <span>१० एकल स्वर वर्ण (10 Single / Basic Vowels - 기본 모음)</span>
            </h4>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>
              आकाश (•), पृथ्वी (ㅡ), र मानिस (ㅣ) को सिद्धान्तमा आधारित
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px"
          }}>
            {SINGLE_VOWELS.map((v) => (
              <div
                key={v.char}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #dcfce7",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{
                    fontSize: "32px",
                    fontWeight: "900",
                    color: "#15803d",
                    backgroundColor: "#f0fdf4",
                    width: "52px",
                    height: "52px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #bbf7d0"
                  }}>
                    {v.char}
                  </span>

                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
                      {v.nepali} <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>({v.nameRoman})</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: "bold" }}>
                      ओठको आकार: {v.shapeDesc}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                      उदाहरण: <strong>{v.exampleWord.ko}</strong> ({v.exampleWord.ne})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onMouseEnter={() => prefetchBatch([v.spokenChar], 'ko', 'female')} onTouchStart={() => prefetchBatch([v.spokenChar], 'ko', 'female')} onClick={() => onPlay(v.spokenChar, `single_v_${v.char}`)}
                  title={`${v.spokenChar} उच्चारण सुन्नुहोस्`}
                  style={{
                    backgroundColor: isAudioPlaying(`single_v_${v.char}`) ? "#16a34a" : "#f0fdf4",
                    color: isAudioPlaying(`single_v_${v.char}`) ? "#ffffff" : "#15803d",
                    border: "1.5px solid #bbf7d0",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    touchAction: "manipulation"
                  }}
                >
                  <SpeakerIcon isPlaying={isAudioPlaying(`single_v_${v.char}`)} size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. DUAL / COMPOUND VOWELS (11 이중 모음) ───────────────────────── */}
      {(activeSubTab === "all" || activeSubTab === "dual_v") && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #d8b4fe", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "900", color: "#6b21a8", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ backgroundColor: "#9333ea", color: "#ffffff", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" }}>Part 4</span>
              <span>११ दोहोरो / संयुक्त स्वर वर्ण (11 Dual / Compound Vowels - 이중모음)</span>
            </h4>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>
              दुईवटा एकल स्वरहरू मिलेर बनेका संयुक्त स्वरहरू
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px"
          }}>
            {DUAL_VOWELS.map((v) => (
              <div
                key={v.char}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #f3e8ff",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{
                    fontSize: "32px",
                    fontWeight: "900",
                    color: "#7e22ce",
                    backgroundColor: "#faf5ff",
                    width: "52px",
                    height: "52px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e9d5ff"
                  }}>
                    {v.char}
                  </span>

                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
                      {v.nepali} <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>({v.nameRoman})</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#7e22ce", fontWeight: "bold", backgroundColor: "#faf5ff", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "2px" }}>
                      बनावट: {v.formula}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                      उदाहरण: <strong>{v.exampleWord.ko}</strong> ({v.exampleWord.ne})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onMouseEnter={() => prefetchBatch([v.spokenChar], 'ko', 'female')} onTouchStart={() => prefetchBatch([v.spokenChar], 'ko', 'female')} onClick={() => onPlay(v.spokenChar, `dual_v_${v.char}`)}
                  title={`${v.spokenChar} उच्चारण सुन्नुहोस्`}
                  style={{
                    backgroundColor: isAudioPlaying(`dual_v_${v.char}`) ? "#9333ea" : "#faf5ff",
                    color: isAudioPlaying(`dual_v_${v.char}`) ? "#ffffff" : "#7e22ce",
                    border: "1.5px solid #e9d5ff",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    touchAction: "manipulation"
                  }}
                >
                  <SpeakerIcon isPlaying={isAudioPlaying(`dual_v_${v.char}`)} size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. COMBINATION SOUND MATRIX TABLE ───────────────────────────── */}
      {(activeSubTab === "all" || activeSubTab === "matrix") && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "2px solid #bfdbfe", paddingBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "900", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" }}>Part 5</span>
                <span>स्वर र व्यञ्जनको संयोजन तालिका (Consonant + Vowel Sound Matrix)</span>
              </h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#475569" }}>
                तलका कुनै पनि अक्षरमा क्लिक गरेर त्यसको प्राकृतिक उच्चारण (Sound), नेपाली तथा अङ्ग्रेजी ध्वनि सुन्नुहोस्।
              </p>
            </div>

            {/* Matrix Filters */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "2px" }}>
                <button
                  type="button"
                  onClick={() => setMatrixFilterType("single")}
                  style={{
                    backgroundColor: matrixFilterType === "single" ? "#2563eb" : "transparent",
                    color: matrixFilterType === "single" ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  १४ एकल व्यञ्जन (Single)
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixFilterType("dual")}
                  style={{
                    backgroundColor: matrixFilterType === "dual" ? "#d97706" : "transparent",
                    color: matrixFilterType === "dual" ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  ५ दोहोरो व्यञ्जन (Dual)
                </button>
              </div>

              <div style={{ display: "flex", backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "2px" }}>
                <button
                  type="button"
                  onClick={() => setMatrixVowelGroup("basic")}
                  style={{
                    backgroundColor: matrixVowelGroup === "basic" ? "#16a34a" : "transparent",
                    color: matrixVowelGroup === "basic" ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  १० आधारभूत स्वर (Basic)
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixVowelGroup("compound")}
                  style={{
                    backgroundColor: matrixVowelGroup === "compound" ? "#9333ea" : "transparent",
                    color: matrixVowelGroup === "compound" ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  ११ संयुक्त स्वर (Compound)
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Scrollable Container */}
          <div style={{
            overflowX: "auto",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#0f2b66", borderBottom: "2px solid #081a40" }}>
                  <th style={{
                    padding: "12px 10px",
                    fontWeight: "900",
                    backgroundColor: "#081a40",
                    color: "#ffffff",
                    minWidth: "105px",
                    borderRight: "1.5px solid rgba(255,255,255,0.25)",
                    userSelect: "none"
                  }}>
                    <div style={{ fontSize: "15px", fontWeight: "900", color: "#ffffff", letterSpacing: "0.5px" }}>
                      자음 / 모음
                    </div>
                    <div style={{ fontSize: "11px", color: "#ffffff", fontWeight: "700", marginTop: "3px", opacity: 0.95 }}>
                      व्यञ्जन / स्वर
                    </div>
                  </th>
                  {currentMatrixVowels.map(v => {
                    const spokenVowel = getSpokenKoreanText(v.v);
                    const isHeaderPlaying = isAudioPlaying(`header_v_${v.v}`);
                    return (
                      <th
                        key={v.v}
                        onMouseEnter={() => prefetchBatch([spokenVowel], 'ko', 'female')} onTouchStart={() => prefetchBatch([spokenVowel], 'ko', 'female')} onClick={() => onPlay(spokenVowel, `header_v_${v.v}`)}
                        style={{
                          padding: "10px 4px",
                          minWidth: "60px",
                          backgroundColor: isHeaderPlaying ? "#2563eb" : "#0f2b66",
                          color: "#ffffff",
                          borderRight: "1px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          userSelect: "none",
                          touchAction: "manipulation",
                          transition: "background-color 0.12s ease"
                        }}
                        title={`Click to hear ${v.v} (${v.ne})`}
                      >
                        <div style={{
                          fontSize: "22px",
                          fontWeight: "900",
                          color: "#ffffff",
                          lineHeight: 1.1,
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)"
                        }}>
                          {v.v}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: "#ffffff",
                          fontWeight: "800",
                          marginTop: "3px",
                          textShadow: "0 1px 2px rgba(0,0,0,0.4)"
                        }}>
                          {v.ne}
                        </div>
                        <div style={{
                          fontSize: "11px",
                          color: "#ffffff",
                          opacity: 0.92,
                          fontWeight: "700",
                          marginTop: "1px"
                        }}>
                          {v.ro}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {matrixConsonants.map((con, rIdx) => (
                  <tr
                    key={con.char}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: rIdx % 2 === 0 ? "#ffffff" : "#fbfcfe"
                    }}
                  >
                    {/* Consonant Header Cell */}
                    <td
                      onMouseEnter={() => prefetchBatch([con.soundSample || con.char], 'ko', 'female')} onTouchStart={() => prefetchBatch([con.soundSample || con.char], 'ko', 'female')} onClick={() => onPlay(con.soundSample || con.char, `matrix_c_${con.char}`)}
                      style={{
                        padding: "8px 10px",
                        fontWeight: "900",
                        borderRight: "1.5px solid #cbd5e1",
                        backgroundColor: isAudioPlaying(`matrix_c_${con.char}`) ? "#dbeafe" : (matrixFilterType === "single" ? "#eff6ff" : "#fffbeb"),
                        cursor: "pointer",
                        transition: "background-color 0.1s ease"
                      }}
                      title={`Click to hear ${con.char} (${con.nameKo})`}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                        <span style={{ fontSize: "20px", color: matrixFilterType === "single" ? "#1e40af" : "#b45309" }}>
                          {con.char}
                        </span>
                        <div style={{ textAlign: "right", fontSize: "11px", lineHeight: "1.2" }}>
                          <div style={{ fontWeight: "bold", color: "#0f172a" }}>{con.nameKo}</div>
                          <div style={{ color: "#64748b" }}>{con.nepali}</div>
                        </div>
                      </div>
                    </td>

                    {/* Syllable Cells */}
                    {currentMatrixVowels.map(v => {
                      const syl = composeHangul(con.char, v.v);
                      const isPlaying = isAudioPlaying(`matrix_${syl}`);
                      return (
                        <td
                          key={v.v}
                          onMouseEnter={() => prefetchBatch([syl], 'ko', 'female')} onTouchStart={() => prefetchBatch([syl], 'ko', 'female')} onClick={() => onPlay(syl, `matrix_${syl}`)}
                          style={{
                            padding: "8px 4px",
                            cursor: "pointer",
                            borderRight: "1px solid #f1f5f9",
                            backgroundColor: isPlaying ? "#dbeafe" : "transparent",
                            touchAction: "manipulation",
                            userSelect: "none",
                            WebkitTapHighlightColor: "transparent",
                            transition: "background-color 0.08s ease"
                          }}
                          title={`Click or touch to hear ${syl}`}
                        >
                          <div style={{
                            fontSize: "17px",
                            fontWeight: "900",
                            color: isPlaying ? "#2563eb" : "#0f172a",
                            transform: isPlaying ? "scale(1.18)" : "scale(1)",
                            transition: "transform 0.08s ease"
                          }}>
                            {syl}
                          </div>
                          <div style={{ fontSize: "10px", color: isPlaying ? "#2563eb" : "#64748b", marginTop: "1px" }}>
                            {isPlaying ? "🔊" : "🔈"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── END OF GUIDE ── */}
    </div>
  );
}
