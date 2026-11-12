'use client';

import React, { useState, useMemo } from 'react';
import { koreanToNepaliRomanized } from '@/lib/dictionaryData';

// =============================================================================
// 1. ㄱ, ㄷ, ㅂ, ㅈ 발음 규칙 (G, D, B, J Consonant Pronunciation Rules)
// =============================================================================
export const GDBJ_RULES = [
  {
    id: "gdbj_initial",
    symbol: "अगाडि (Initial)",
    titleKo: "1. 단어 첫머리(초성)에서의 발음: ㄱ[ㅋ/ख], ㄷ[ㅌ/थ], ㅂ[ㅍ/फ], ㅈ[ㅊ/छ]",
    titleNe: "१. शब्दको सुरुमा ㄱ, ㄷ, ㅂ, ㅈ आउँदाको उच्चारण नियम (초성 발음 규칙)",
    formula: "ㄱ → ख | ㄷ → थ | ㅂ → फ | ㅈ → छ",
    formulaBullets: ["ㄱ → ख", "ㄷ → थ", "ㅂ → फ", "ㅈ → छ"],
    summaryKo: "한국어의 'ㄱ, ㄷ, ㅂ, ㅈ'이 단어의 첫머리(초성)에 올 때는 각각 'ㅋ(ख)', 'ㅌ(थ)', 'ㅍ(फ)', 'ㅊ(छ)'에 가깝게 발음됩니다.",
    summaryNe: "कुनै पनि कोरियन शब्दको सुरुमा ㄱ, ㄷ, ㅂ, ㅈ आएमा क्रमशः ख, थ, फ, छ उच्चारण गरिन्छ।",
    examples: [
      { written: "가방", spoken: "가방", romanized: "gabang", nepali: "झोला (ㄱ अगाडि: ख)" },
      { written: "고기", spoken: "고기", romanized: "gogi", nepali: "मासु (पहिलो ㄱ: ख, दोस्रो ㄱ: ग)" },
      { written: "김치", spoken: "김치", romanized: "gimchi", nepali: "किम्ची (ㄱ अगाडि: ख)" },
      { written: "길", spoken: "길", romanized: "gil", nepali: "बाटो (ㄱ अगाडि: ख)" },
      { written: "다리", spoken: "다리", romanized: "dari", nepali: "खुट्टा / पुल (ㄷ अगाडि: थ)" },
      { written: "도시", spoken: "도시", romanized: "dosi", nepali: "सहर (ㄷ अगाडि: थ)" },
      { written: "돈", spoken: "돈", romanized: "don", nepali: "पैसा (ㄷ अगाडि: थ)" },
      { written: "바보", spoken: "바보", romanized: "babo", nepali: "मूर्ख (पहिलो ㅂ: फ, दोस्रो ㅂ: ब)" },
      { written: "방", spoken: "방", romanized: "bang", nepali: "कोठा (ㅂ अगाडि: फ)" },
      { written: "밥", spoken: "밥", romanized: "bap", nepali: "भात (पहिलो ㅂ: फ, मुनिको ㅂ: प्)" },
      { written: "지도", spoken: "지도", romanized: "jido", nepali: "नक्सा (ㅈ अगाडि: छ, ㄷ बीचमा: द)" },
      { written: "집", spoken: "집", romanized: "jip", nepali: "घर (ㅈ अगाडि: छ, मुनिको ㅂ: प्)" }
    ]
  },
  {
    id: "gdbj_medial",
    symbol: "बीचमा (Medial)",
    titleKo: "2. 모음 사이 및 유성음(ㄴ,ㄹ,ㅁ,ㅇ) 뒤에서의 발음: ㄱ[g/ग], ㄷ[d/द], ㅂ[b/ब], ㅈ[j/ज]",
    titleNe: "२. शब्दको बीचमा वा स्वर वर्ण पछाडि आउँदाको उच्चारण नियम",
    formula: "स्वर वर्ण वा ㄴ,ㄹ,ㅁ,ㅇ पछि ㄱ → [g], ㄷ → [d], ㅂ → [b], ㅈ → [j]",
    summaryKo: "모음과 모음 사이 또는 울림소리(ㄴ, ㄹ, ㅁ, ㅇ) 뒤에 'ㄱ, ㄷ, ㅂ, ㅈ'이 올 때는 부드러운 유성음 [g, d, b, j]로 발음됩니다.",
    summaryNe: "जब 'ㄱ, ㄷ, ㅂ, ㅈ' शब्दको बीचमा दुई स्वर वर्णको बीचमा वा गुञ्जिने व्यञ्जन (ㄴ, ㄹ, ㅁ, ㅇ) पछि आउँछन्, तिनीहरूको उच्चारण स्पष्ट रूपमा 'ग', 'द', 'ब', 'ज' हुन्छ।",
    examples: [
      { written: "아기", spoken: "아기", romanized: "agi", nepali: "बच्चा (ㄱ बीचमा: ग)" },
      { written: "안경", spoken: "안경", romanized: "angyeong", nepali: "चश्मा (ㄴ पछाडि ㄱ: ग)" },
      { written: "어디", spoken: "어디", romanized: "eodi", nepali: "कहाँ (ㄷ बीचमा: द)" },
      { written: "바다", spoken: "바다", romanized: "bada", nepali: "समुद्र (ㅂ अगाडि: फ, ㄷ बीचमा: द)" },
      { written: "구두", spoken: "구두", romanized: "gudu", nepali: "छालाको जुत्ता (ㄱ अगाडि: ख, ㄷ बीचमा: द)" },
      { written: "갈비", spoken: "갈비", romanized: "galbi", nepali: "करङको मासु (ㄹ पछाडि ㅂ: ब)" },
      { written: "아버지", spoken: "아버지", romanized: "abeoji", nepali: "बुबा (ㅂ बीचमा: ब, ㅈ बीचमा: ज)" },
      { written: "모자", spoken: "모자", romanized: "moja", nepali: "टोपी (ㅈ बीचमा: ज)" },
      { written: "의자", spoken: "의자", romanized: "uija", nepali: "कुर्सी (ㅈ बीचमा: ज)" },
      { written: "남자", spoken: "남자", romanized: "namja", nepali: "पुरुष / केटा (ㅁ पछाडि ㅈ: ज)" }
    ]
  },
  {
    id: "gdbj_final",
    symbol: "मुनि (Batchim)",
    titleKo: "3. 받침(어말/자음 앞)에서의 발음: ㄱ[k/क्], ㄷ[t/त्], ㅂ[p/प्], ㅈ[t/त्]",
    titleNe: "३. शब्दको अन्त्यमा वा मुनि (फात्छिम) आउँदाको उच्चारण नियम",
    formula: "फात्छिममा ㄱ → [k], ㄷ → [t], ㅂ → [p], ㅈ → [t]",
    summaryKo: "어말이나 다른 자음 앞에서 받침으로 쓰일 때 'ㄱ'은 [k], 'ㄷ'과 'ㅈ'은 대표음 [t], 'ㅂ'은 [p]로 입을 닫으며 막는 소리가 납니다.",
    summaryNe: "जब यी वर्णहरू मुनि (फात्छिममा) वा शब्दको अन्त्यमा आउँछन्, ㄱ ले 'क्', ㄷ ले 'त्', ㅂ ले 'प्' र ㅈ ले पनि प्रतिनिधि ध्वनि 'त्' उच्चारण दिन्छ।",
    examples: [
      { written: "한국", spoken: "한국", romanized: "hanguk", nepali: "कोरिया (मुनि ㄱ: क्)" },
      { written: "수박", spoken: "수박", romanized: "subak", nepali: "खर्बुजा (मुनि ㄱ: क्)" },
      { written: "약", spoken: "약", romanized: "yak", nepali: "औषधि (मुनि ㄱ: क्)" },
      { written: "곧", spoken: "곧", romanized: "got", nepali: "तुरुन्तै (मुनि ㄷ: त्)" },
      { written: "믿다", spoken: "믿따", romanized: "mit-tta", nepali: "विश्वास गर्नु (मुनि ㄷ: त्)" },
      { written: "닫다", spoken: "닫따", romanized: "dat-tta", nepali: "बन्द गर्नु (मुनि ㄷ: त्)" },
      { written: "집", spoken: "집", romanized: "jip", nepali: "घर (मुनि ㅂ: प्)" },
      { written: "밥", spoken: "밥", romanized: "bap", nepali: "भात (मुनि ㅂ: प्)" },
      { written: "입", spoken: "입", romanized: "ip", nepali: "मुख (मुनि ㅂ: प्)" },
      { written: "낮", spoken: "낟", romanized: "nat", nepali: "दिउँसो (मुनि ㅈ: त्)" },
      { written: "맞다", spoken: "맏따", romanized: "mat-tta", nepali: "मिल्नु / सही हुनु (मुनि ㅈ: त्)" },
      { written: "늦다", spoken: "늗따", romanized: "neut-tta", nepali: "ढिलो हुनु (मुनि ㅈ: त्)" }
    ]
  }
];

// =============================================================================
// 2. 홑받침 7개 대표음 규칙 (Single Batchim - 7 Representative Endings)
// =============================================================================
export const SINGLE_BATCHIM_7 = [
  {
    rep: "[ㄱ]",
    consonants: "ㄱ, ㄲ, ㅋ",
    soundNe: "क् (k)",
    summaryNe: "फात्छिममा 'ㄱ', 'ㄲ' वा 'ㅋ' आएमा तीनै वटाको उच्चारण प्रतिनिधि ध्वनि 'क्' [ㄱ] हुन्छ।",
    examples: [
      { written: "수박", spoken: "수박", romanized: "subak", nepali: "खर्बुजा" },
      { written: "밖", spoken: "박", romanized: "bak", nepali: "बाहिर" },
      { written: "부엌", spoken: "부억", romanized: "bueok", nepali: "भान्सा" },
      { written: "깎다", spoken: "깍따", romanized: "kkak-tta", nepali: "काट्नु / घटाउनु" },
      { written: "낚시", spoken: "낙씨", romanized: "nak-ssi", nepali: "माछा मार्ने कार्य" }
    ]
  },
  {
    rep: "[ㄴ]",
    consonants: "ㄴ",
    soundNe: "न् (n)",
    summaryNe: "फात्छिममा 'ㄴ' आउँदा यसको स्वाभाविक ध्वनि 'न्' [ㄴ] नै उच्चारण हुन्छ।",
    examples: [
      { written: "눈", spoken: "눈", romanized: "nun", nepali: "आँखा / हिउँ" },
      { written: "산", spoken: "산", romanized: "san", nepali: "पहाड" },
      { written: "문", spoken: "문", romanized: "mun", nepali: "ढोका" },
      { written: "돈", spoken: "돈", romanized: "don", nepali: "पैसा" },
      { written: "신발", spoken: "신발", romanized: "sinbal", nepali: "जुत्ता" }
    ]
  },
  {
    rep: "[ㄷ]",
    consonants: "ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ",
    soundNe: "त् (t)",
    summaryNe: "यी ७ वटा फरक व्यञ्जनहरू फात्छिममा आउँदा सबैको उच्चारण एउटै प्रतिनिधि ध्वनि 'त्' [ㄷ] मा खुम्चिन्छ।",
    examples: [
      { written: "곧", spoken: "곧", romanized: "got", nepali: "तुरुन्तै (ㄷ → त्)" },
      { written: "옷", spoken: "옫", romanized: "ot", nepali: "लुगा (ㅅ → त्)" },
      { written: "있다", spoken: "읻따", romanized: "it-tta", nepali: "हुनु (ㅆ → त्)" },
      { written: "낮", spoken: "낟", romanized: "nat", nepali: "दिउँसो (ㅈ → त्)" },
      { written: "꽃", spoken: "꼳", romanized: "kkot", nepali: "फूल (ㅊ → त्)" },
      { written: "끝", spoken: "끋", romanized: "kkeut", nepali: "अन्त्य (ㅌ → त्)" },
      { written: "히읗", spoken: "히읃", romanized: "hieut", nepali: "ㅎ वर्णको नाम (ㅎ → त्)" }
    ]
  },
  {
    rep: "[ㄹ]",
    consonants: "ㄹ",
    soundNe: "ल् (l)",
    summaryNe: "फात्छिममा 'ㄹ' आउँदा जिब्रो तालुमा अडिएर 'ल्' [l] ध्वनि निस्कन्छ।",
    examples: [
      { written: "달", spoken: "달", romanized: "dal", nepali: "चन्द्रमा / महिना" },
      { written: "물", spoken: "물", romanized: "mul", nepali: "पानी" },
      { written: "길", spoken: "길", romanized: "gil", nepali: "बाटो" },
      { written: "말", spoken: "말", romanized: "mal", nepali: "कुरा / घोडा" },
      { written: "일", spoken: "일", romanized: "il", nepali: "काम / दिन / एक" }
    ]
  },
  {
    rep: "[ㅁ]",
    consonants: "ㅁ",
    soundNe: "म् (m)",
    summaryNe: "फात्छिममा 'ㅁ' आउँदा दुवै ओठ जोडेर 'म्' [ㅁ] ध्वनि उच्चारण हुन्छ।",
    examples: [
      { written: "밤", spoken: "밤", romanized: "bam", nepali: "रात / कटुस" },
      { written: "마음", spoken: "마음", romanized: "maeum", nepali: "मन / हृदय" },
      { written: "사람", spoken: "사람", romanized: "saram", nepali: "मानिस" },
      { written: "봄", spoken: "봄", romanized: "bom", nepali: "वसन्त ऋतु" },
      { written: "몸", spoken: "몸", romanized: "mom", nepali: "शरीर" }
    ]
  },
  {
    rep: "[ㅂ]",
    consonants: "ㅂ, ㅍ",
    soundNe: "प् (p)",
    summaryNe: "फात्छिममा 'ㅂ' वा 'ㅍ' आउँदा दुवैको उच्चारण प्रतिनिधि ध्वनि 'प्' [ㅂ] हुन्छ।",
    examples: [
      { written: "밥", spoken: "밥", romanized: "bap", nepali: "भात" },
      { written: "집", spoken: "집", romanized: "jip", nepali: "घर" },
      { written: "잎", spoken: "입", romanized: "ip", nepali: "पात (ㅍ → प्)" },
      { written: "앞", spoken: "압", romanized: "ap", nepali: "अगाडि (ㅍ → प्)" },
      { written: "숲", spoken: "숩", romanized: "sup", nepali: "जङ्गल (ㅍ → प्)" }
    ]
  },
  {
    rep: "[ㅇ]",
    consonants: "ㅇ",
    soundNe: "ङ् (ng)",
    summaryNe: "फात्छिममा 'ㅇ' आउँदा नाकबाट गुञ्जिने नासिक्य ध्वनि 'ङ्' [ng] उच्चारण हुन्छ। (नोट: अक्षरको सुरुमा आउँदा यो मौन हुन्छ)।",
    examples: [
      { written: "강", spoken: "강", romanized: "gang", nepali: "नदी" },
      { written: "방", spoken: "방", romanized: "bang", nepali: "कोठा" },
      { written: "공항", spoken: "공항", romanized: "gonghang", nepali: "विमानस्थल" },
      { written: "가방", spoken: "가방", romanized: "gabang", nepali: "झोला" },
      { written: "식당", spoken: "식땅", romanized: "sik-ttang", nepali: "रेस्टुरेन्ट" }
    ]
  }
];

// =============================================================================
// 3. 11가지 겹받침 (11 Dual/Double Batchim Rules)
// =============================================================================
export const DUAL_BATCHIM_11 = [
  {
    symbol: "ㄳ",
    components: "ㄱ + ㅅ",
    consonantSound: "[ㄱ]",
    vowelSound: "[ㄱㅆ]",
    ruleType: "첫째 자음 발음 (पहिलो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 첫째 자음 'ㄱ'만 발음되고 'ㅅ'은 탈락합니다. 뒤에 모음(ㅇ)이 오면 'ㄱ'은 받침에 남고 'ㅅ'이 [ㅆ]으로 연음됩니다.",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा 'ㄱ' मात्र उच्चारण हुन्छ ('ㅅ' मौन रहन्छ)। स्वर वर्ण (ㅇ) पछि आउँदा 'ㄱ' फात्छिममै रहन्छ र 'ㅅ' अर्को अक्षरमा सरेर कडा [ㅆ] उच्चारण हुन्छ।",
    examples: [
      { written: "몫", spoken: "목", romanized: "mok", nepali: "भाग / हिस्सा" },
      { written: "몫이", spoken: "목씨", romanized: "mokssi", nepali: "भाग चाहिँ" },
      { written: "넋", spoken: "넉", romanized: "neok", nepali: "आत्मा / होस" },
      { written: "넋을", spoken: "넉쓸", romanized: "neoksseul", nepali: "आत्मालाई" }
    ]
  },
  {
    symbol: "ㄵ",
    components: "ㄴ + ㅈ",
    consonantSound: "[ㄴ]",
    vowelSound: "[ㄴㅈ]",
    ruleType: "첫째 자음 발음 (पहिलो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 첫째 자음 'ㄴ'만 발음되고 뒤의 예사소리는 된소리가 됩니다. 뒤에 모음(ㅇ)이 오면 'ㅈ'이 다음 음절의 첫소리로 연음됩니다.",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा 'ㄴ' मात्र उच्चारण हुन्छ ('ㅈ' मौन हुन्छ र पछिल्लो व्यञ्जनलाई कडा बनाउँछ)। स्वर वर्ण (ㅇ) अगाडि आउँदा 'ㅈ' अर्को अक्षरमा सरेर [ㅈ] उच्चारण हुन्छ।",
    examples: [
      { written: "앉다", spoken: "안따", romanized: "anta", nepali: "बस्नु" },
      { written: "앉아", spoken: "안자", romanized: "anja", nepali: "बस्नुहोस्" },
      { written: "앉으면", spoken: "안즈면", romanized: "anjeumyeon", nepali: "बस्यो भने" },
      { written: "얹다", spoken: "언따", romanized: "eonta", nepali: "माथि राख्नु" }
    ]
  },
  {
    symbol: "ㄶ",
    components: "ㄴ + ㅎ",
    consonantSound: "[ㄴ] / [ㅋ, ㅌ, ㅊ]",
    vowelSound: "[ㄴ] (ㅎ 탈락)",
    ruleType: "거센소리 축약 / 모음 앞 ㅎ 탈락",
    summaryKo: "뒤에 'ㄱ, ㄷ, ㅈ'이 오면 'ㅎ'과 합쳐져 거센소리 [ㅋ, ㅌ, ㅊ]로 소리 납니다. 뒤에 모음(ㅇ)이 오면 'ㅎ'이 탈락하여 소리 나지 않고 'ㄴ'이 연음됩니다.",
    summaryNe: "पछाडि 'ㄱ, ㄷ, ㅈ' आउँदा 'ㅎ' सँग मिलेर महाप्राण ध्वनि [ㅋ, ㅌ, ㅊ] बन्दछ। तर स्वर वर्ण (ㅇ) पछि आउँदा 'ㅎ' पूरै मौन (लोप) हुन्छ र 'ㄴ' अर्को अक्षरमा सर्छ।",
    examples: [
      { written: "많다", spoken: "만타", romanized: "manta", nepali: "धेरै हुनु" },
      { written: "많아", spoken: "마나", romanized: "mana", nepali: "धेरै छ" },
      { written: "않다", spoken: "안타", romanized: "anta", nepali: "नगर्नु" },
      { written: "않아", spoken: "아나", romanized: "ana", nepali: "गर्दैन" },
      { written: "많고", spoken: "만코", romanized: "manko", nepali: "धेरै र" }
    ]
  },
  {
    symbol: "ㄺ",
    components: "ㄹ + ㄱ",
    consonantSound: "[ㄱ] (용언 어간 ㄱ 앞: [ㄹ])",
    vowelSound: "[ㄹㄱ]",
    ruleType: "둘째 자음 발음 (दोस्रो अक्षर उच्चारण हुने)",
    summaryKo: "원칙적으로 어말이나 자음 앞에서는 둘째 자음 'ㄱ'이 발음됩니다 (닭 → [닥], 읽다 → [익따]). 예외로 용언 어간 끝 'ㄺ' 뒤에 'ㄱ'으로 시작하는 어미가 오면 'ㄹ'로 발음됩니다 (읽고 → [일꼬]). 모음 앞에서는 'ㄱ'이 연음됩니다 (읽어 → [일거]).",
    summaryNe: "सामान्यतया शब्दको अन्त्य वा व्यञ्जन अगाडि दोस्रो अक्षर 'ㄱ' उच्चारण हुन्छ ('ㄹ' मौन, जस्तै 닭 → [닥], 읽다 → [익따])। तर क्रिया पदको धातुमा पछाडि 'ㄱ' आएमा पहिलो अक्षर 'ㄹ' उच्चारण हुन्छ (जस्तै 읽고 → [일꼬])। स्वर वर्ण अगाडि 'ㄱ' अर्को अक्षरमा सर्छ (읽어 → [일거])।",
    examples: [
      { written: "닭", spoken: "닥", romanized: "dak", nepali: "कुखुरा" },
      { written: "닭이", spoken: "달기", romanized: "dalgi", nepali: "कुखुरा (कर्ता)" },
      { written: "읽다", spoken: "익따", romanized: "ik-tta", nepali: "पढ्नु" },
      { written: "읽어", spoken: "일거", romanized: "ilgeo", nepali: "पढ्नुहोस्" },
      { written: "읽고", spoken: "일꼬", romanized: "il-kko", nepali: "पढेर (अपवाद नियम)" },
      { written: "흙", spoken: "흑", romanized: "heuk", nepali: "माटो" },
      { written: "밝다", spoken: "박따", romanized: "bak-tta", nepali: "उज्यालो हुनु" }
    ]
  },
  {
    symbol: "ㄻ",
    components: "ㄹ + ㅁ",
    consonantSound: "[ㅁ]",
    vowelSound: "[ㄹㅁ]",
    ruleType: "둘째 자음 발음 (दोस्रो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 둘째 자음 'ㅁ'만 발음되고 'ㄹ'은 소리 나지 않습니다. 모음 앞에서는 'ㄹ'은 받침에 남고 'ㅁ'이 다음 음절로 연음됩니다.",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा दोस्रो अक्षर 'ㅁ' मात्र उच्चारण हुन्छ ('ㄹ' मौन)। स्वर वर्ण (ㅇ) अगाडि आउँदा 'ㄹ' फात्छिममै रहन्छ र 'ㅁ' अर्को अक्षरमा सर्छ।",
    examples: [
      { written: "삶", spoken: "삼", romanized: "sam", nepali: "जीवन" },
      { written: "삶이", spoken: "살미", romanized: "salmi", nepali: "जीवन चाहिँ" },
      { written: "젊다", spoken: "점따", romanized: "jeom-tta", nepali: "जवान हुनु" },
      { written: "젊어", spoken: "절머", romanized: "jeolmeo", nepali: "जवान छ" },
      { written: "옮다", spoken: "옴따", romanized: "om-tta", nepali: "सर्नु / सार्नु" },
      { written: "닮다", spoken: "담따", romanized: "dam-tta", nepali: "अनुहार मिल्नु" }
    ]
  },
  {
    symbol: "ㄼ",
    components: "ㄹ + ㅂ",
    consonantSound: "[ㄹ] (예외: 밟- → [ㅂ])",
    vowelSound: "[ㄹㅂ]",
    ruleType: "첫째 자음 발음 (पहिलो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 원칙적으로 첫째 자음 'ㄹ'로 발음됩니다 (여덟 → [여덜], 넓다 → [널따]). 예외: '밟다'는 자음 앞에서 [밥따]로 발음되고, '넓죽하다/넓둥글다'는 [넙-]으로 발음됩니다. 모음 앞에서는 'ㅂ'이 연음됩니다 (넓어 → [널보]).",
    summaryNe: "सामान्यतया पहिलो अक्षर 'ㄹ' उच्चारण हुन्छ ('ㅂ' मौन, जस्तै 여덟 → [여덜], 넓다 → [널따])। तर '밟다' (कुल्चनु) क्रियापदमा [밥따] र '넓죽하다' मा अपवाद स्वरूप 'ㅂ' उच्चारण हुन्छ। स्वर वर्ण अगाडि 'ㅂ' अर्को अक्षरमा सर्छ।",
    examples: [
      { written: "여덟", spoken: "여덜", romanized: "yeodeol", nepali: "आठ" },
      { written: "여덟이", spoken: "여덜비", romanized: "yeodeolbi", nepali: "आठवटा" },
      { written: "넓다", spoken: "널따", romanized: "neol-tta", nepali: "फराकिलो हुनु" },
      { written: "넓어", spoken: "널보", romanized: "neolbeo", nepali: "फराकिलो छ" },
      { written: "밟다", spoken: "밥따", romanized: "bap-tta", nepali: "कुल्चनु (अपवाद)" },
      { written: "짧다", spoken: "짤따", romanized: "jjal-tta", nepali: "छोटो हुनु" }
    ]
  },
  {
    symbol: "ㄽ",
    components: "ㄹ + ㅅ",
    consonantSound: "[ㄹ]",
    vowelSound: "[ㄹㅆ]",
    ruleType: "첫째 자음 발음 (पहिलो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 첫째 자음 'ㄹ'만 발음됩니다. 뒤에 모음(ㅇ)이 오면 'ㄹ'은 받침에 남고 'ㅅ'이 된소리 [ㅆ]으로 연음됩니다.",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा पहिलो अक्षर 'ㄹ' मात्र उच्चारण हुन्छ ('ㅅ' मौन)। स्वर वर्ण (ㅇ) अगाडि आउँदा 'ㄹ' फात्छिममै रहन्छ र 'ㅅ' अर्को अक्षरमा सरेर कडा [ㅆ] उच्चारण हुन्छ।",
    examples: [
      { written: "외곬", spoken: "외골", romanized: "oegol", nepali: "एकोहोरो बाटो" },
      { written: "외곬으로", spoken: "외골쓰로", romanized: "oegolsseuro", nepali: "एकोहोरो रूपमा" }
    ]
  },
  {
    symbol: "ㄾ",
    components: "ㄹ + ㅌ",
    consonantSound: "[ㄹ]",
    vowelSound: "[ㄹㅌ]",
    ruleType: "첫째 자음 발음 (पहिलो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 첫째 자음 'ㄹ'만 발음되고 뒤의 예사소리는 된소리가 됩니다 (핥다 → [할따]). 모음(ㅇ) 앞에서는 'ㅌ'이 연음되어 제소리로 납니다 (핥아 → [할타]).",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा पहिलो अक्षर 'ㄹ' मात्र उच्चारण हुन्छ ('ㅌ' मौन, 핥다 → [할따])। स्वर वर्ण (ㅇ) अगाडि आउँदा 'ㅌ' अर्को अक्षरमा सर्छ (핥아 → [할타])।",
    examples: [
      { written: "핥다", spoken: "할따", romanized: "hal-tta", nepali: "चाट्नु" },
      { written: "핥아", spoken: "할타", romanized: "halta", nepali: "चाट्नुहोस्" },
      { written: "훑다", spoken: "훌따", romanized: "hul-tta", nepali: "केलाउनु / स्क्यान गर्नु" },
      { written: "훑어", spoken: "훌터", romanized: "hulteo", nepali: "केलाउनुहोस्" }
    ]
  },
  {
    symbol: "ㄿ",
    components: "ㄹ + ㅍ",
    consonantSound: "[ㅂ]",
    vowelSound: "[ㄹㅍ]",
    ruleType: "둘째 자음 발음 (दोस्रो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 둘째 자음 'ㅍ'이 대표음 [ㅂ]으로 바뀌어 소리 납니다 (읊다 → [읍따]). 모음(ㅇ) 앞에서는 'ㄹ'은 남고 'ㅍ'이 다음 음절로 연음됩니다 (읊어 → [을퍼]).",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा दोस्रो अक्षर 'ㅍ' प्रतिनिधि ध्वनि [ㅂ] मा घटेर उच्चारण हुन्छ (읊다 → [읍따])। स्वर वर्ण (ㅇ) अगाडि आउँदा 'ㄹ' फात्छिममै रहन्छ र 'ㅍ' अर्को अक्षरमा सर्छ (읊어 → [을퍼])।",
    examples: [
      { written: "읊다", spoken: "읍따", romanized: "eup-tta", nepali: "कविता पाठ गर्नु" },
      { written: "읊어", spoken: "을퍼", romanized: "eulpeo", nepali: "पाठ गर्नुहोस्" },
      { written: "읊고", spoken: "읍꼬", romanized: "eup-kko", nepali: "पाठ गरेर" }
    ]
  },
  {
    symbol: "ㅀ",
    components: "ㄹ + ㅎ",
    consonantSound: "[ㄹ] / [ㅋ, ㅌ, ㅊ]",
    vowelSound: "[ㄹ] (ㅎ 탈락)",
    ruleType: "거센소리 축약 / 모음 앞 ㅎ 탈락",
    summaryKo: "뒤에 'ㄱ, ㄷ, ㅈ'이 오면 'ㅎ'과 합쳐져 거센소리 [ㅋ, ㅌ, ㅊ]로 발음됩니다 (싫다 → [실타]). 모음(ㅇ) 앞에서는 'ㅎ'이 탈락하고 'ㄹ'이 연음됩니다 (싫어 → [시러]).",
    summaryNe: "पछाडि 'ㄱ, ㄷ, ㅈ' आउँदा 'ㅎ' सँग मिलेर महाप्राण ध्वनि [ㅋ, ㅌ, ㅊ] बन्दछ (싫다 → [실타])। स्वर वर्ण (ㅇ) पछि आउँदा 'ㅎ' पूरै मौन (लोप) हुन्छ र 'ㄹ' अर्को अक्षरमा सर्छ (싫어 → [시러])।",
    examples: [
      { written: "싫다", spoken: "실타", romanized: "silta", nepali: "मन नपर्नु" },
      { written: "싫어", spoken: "시러", romanized: "sireo", nepali: "मन पर्दैन" },
      { written: "잃다", spoken: "일타", romanized: "ilta", nepali: "हराउनु" },
      { written: "잃어버리다", spoken: "이러버리다", romanized: "ireobeorida", nepali: "हराइदिनु" },
      { written: "닳다", spoken: "달타", romanized: "dalta", nepali: "खिइनु" }
    ]
  },
  {
    symbol: "ㅄ",
    components: "ㅂ + ㅅ",
    consonantSound: "[ㅂ]",
    vowelSound: "[ㅂㅆ]",
    ruleType: "첫째 자음 발음 (पहिलो अक्षर उच्चारण हुने)",
    summaryKo: "어말이나 자음 앞에서는 첫째 자음 'ㅂ'만 발음됩니다 (값 → [갑], 없다 → [업따]). 뒤에 모음(ㅇ)이 오면 'ㅂ'은 남고 'ㅅ'이 된소리 [ㅆ]으로 연음됩니다 (값이 → [갑씨], 없어 → [업써]).",
    summaryNe: "व्यञ्जन वर्ण वा शब्दको अन्त्यमा आउँदा पहिलो अक्षर 'ㅂ' मात्र उच्चारण हुन्छ ('ㅅ' मौन, 값 → [갑], 없다 → [업따])। स्वर वर्ण (ㅇ) पछि आउँदा 'ㅂ' फात्छिममै रहन्छ र 'ㅅ' अर्को अक्षरमा सरेर कडा [ㅆ] उच्चारण हुन्छ (값이 → [갑씨], 없어 → [업써])।",
    examples: [
      { written: "값", spoken: "갑", romanized: "gap", nepali: "मूल्य / दाम" },
      { written: "값이", spoken: "갑씨", romanized: "gapssi", nepali: "मूल्य चाहिँ" },
      { written: "없다", spoken: "업따", romanized: "eop-tta", nepali: "छैन / नहुनु" },
      { written: "없어", spoken: "업써", romanized: "eopsseo", nepali: "छैन" },
      { written: "값으로", spoken: "갑스로", romanized: "gapseuro", nepali: "मूल्य अनुसार" }
    ]
  }
];

// =============================================================================
// 4. 음운 변화 9가지 주요 법칙 (9 Phonological Sound Change Rules)
// =============================================================================
export const ALL_BATCHIM_RULES = [
  {
    id: "7endings",
    num: 1,
    titleKo: "1. 음절의 끝소리 규칙 (7종성법)",
    titleNe: "१. 음절 끝소리 규칙 (७ वटा प्रतिनिधि अन्त्य ध्वनि नियम)",
    formula: "ㄱ, ㄲ, ㅋ, ㄳ, ㄺ → [ㄱ] | ㄴ, ㄵ, ㄶ → [ㄴ] | ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ → [ㄷ] | ㄹ, ㄼ, ㄽ, ㄾ, ㅀ → [ㄹ] | ㅁ, ㄻ → [ㅁ] | ㅂ, ㅍ, ㄿ, ㅄ → [ㅂ] | ㅇ → [ㅇ]",
    category: "sound_change",
    summaryKo: "한국어의 모든 받침(27개)은 어말이나 자음 앞에서 오직 7개의 대표 자음 [ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ] 중 하나로만 발음됩니다.",
    summaryNe: "कोरियन भाषाका सबै २७ वटा फात्छिमहरू शब्दको अन्त्यमा वा व्यञ्जन अगाडि आउँदा केवल ७ वटा प्रतिनिधि ध्वनिहरू [ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ] मा खुम्चिएर उच्चारण हुन्छन्।",
    groups: [
      { rep: "[ㄱ]", letters: "ㄱ, ㄲ, ㅋ, ㄳ, ㄺ", exampleKo: "수박, 부엌, 밖, 닭", exampleSpoken: "[수박], [부억], [박], [닥]" },
      { rep: "[ㄴ]", letters: "ㄴ, ㄵ, ㄶ", exampleKo: "눈, 앉다, 많다", exampleSpoken: "[눈], [안따], [만타]" },
      { rep: "[ㄷ]", letters: "ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ", exampleKo: "옷, 낮, 꽃, 끝, 있다", exampleSpoken: "[옫], [낟], [꼳], [끋], [읻따]" },
      { rep: "[ㄹ]", letters: "ㄹ, ㄼ, ㄽ, ㄾ, ㅀ", exampleKo: "달, 물, 여덟", exampleSpoken: "[달], [물], [여덜]" },
      { rep: "[ㅁ]", letters: "ㅁ, ㄻ", exampleKo: "밤, 마음, 삶", exampleSpoken: "[밤], [마음], [삼]" },
      { rep: "[ㅂ]", letters: "ㅂ, ㅍ, ㄿ, ㅄ", exampleKo: "집, 잎, 앞, 값", exampleSpoken: "[집], [입], [압], [갑]" },
      { rep: "[ㅇ]", letters: "ㅇ", exampleKo: "강, 방, 공항", exampleSpoken: "[강], [방], [공항]" }
    ],
    examples: [
      { written: "수박", spoken: "수박", romanized: "subak", nepali: "खर्बुजा" },
      { written: "부엌", spoken: "부억", romanized: "bueok", nepali: "भान्सा" },
      { written: "밖", spoken: "박", romanized: "bak", nepali: "बाहिर" },
      { written: "옷", spoken: "옫", romanized: "ot", nepali: "लुगा" },
      { written: "꽃", spoken: "꼳", romanized: "kkot", nepali: "फूल" },
      { written: "낮", spoken: "낟", romanized: "nat", nepali: "दिउँसो" },
      { written: "잎", spoken: "입", romanized: "ip", nepali: "पात" },
      { written: "앞", spoken: "압", romanized: "ap", nepali: "अगाडि" }
    ]
  },
  {
    id: "nasalization",
    num: 2,
    titleKo: "2. 비음화 (콧소리 되기)",
    titleNe: "२. 비음화 (नासिक्यीकरण नियम - नाकबाट आउने ध्वनि)",
    formula: "ㅂ, ㅍ → [ㅁ] | ㄱ, ㅋ, ㄲ → [ㅇ] | ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ → [ㄴ] (before ㄴ, ㅁ)",
    category: "sound_change",
    summaryKo: "받침 [ㅂ, ㄱ, ㄷ] 뒤에 비음(콧소리) 'ㄴ, ㅁ'이 오면, 받침이 각각 비음인 [ㅁ, ㅇ, ㄴ]으로 바뀌어 부드럽게 발음됩니다.",
    summaryNe: "जब रोकिने व्यञ्जन फात्छिम् (ㅂ, ㄱ, ㄷ समूह) पछि नासिक्य ध्वनि 'ㄴ' वा 'ㅁ' आउँछ, तब फात्छिम् स्वतः क्रमशः 'ㅁ', 'ㅇ', 'ㄴ' ध्वनिमा रूपान्तरण हुन्छ।",
    examples: [
      { written: "감사합니다", spoken: "감사함니다", romanized: "gamsahamnida", nepali: "धन्यवाद" },
      { written: "십년", spoken: "심년", romanized: "simnyeon", nepali: "१० वर्ष" },
      { written: "밥물", spoken: "밤물", romanized: "bammul", nepali: "भातको माड" },
      { written: "한국말", spoken: "한궁말", romanized: "hangungmal", nepali: "कोरियन भाषा" },
      { written: "작년", spoken: "장년", romanized: "jangnyeon", nepali: "गत वर्ष" },
      { written: "국물", spoken: "궁물", romanized: "gungmul", nepali: "झोल / सुप" },
      { written: "있는", spoken: "인는", romanized: "inneun", nepali: "भएको" },
      { written: "맞는", spoken: "만는", romanized: "manneun", nepali: "मिल्ने / सही" },
      { written: "끝내다", spoken: "끈내다", romanized: "kkeunnaeda", nepali: "सकाउनु" }
    ]
  },
  {
    id: "tensification",
    num: 3,
    titleKo: "3. 경음화 (된소리 되기)",
    titleNe: "३. 경음화 (कडा ध्वनि नियम / द्वित्वीकरण)",
    formula: "[ㄱ, ㄷ, ㅂ] + ㄱ, ㄷ, ㅂ, ㅅ, ㅈ → [ㄲ, ㄸ, ㅃ, ㅆ, ㅉ]",
    category: "sound_change",
    summaryKo: "받침 [ㄱ, ㄷ, ㅂ] 뒤에 평음(예사소리) 'ㄱ, ㄷ, ㅂ, ㅅ, ㅈ'이 오면 된소리인 [ㄲ, ㄸ, ㅃ, ㅆ, ㅉ]으로 강하게 발음됩니다.",
    summaryNe: "जब फात्छिम् [ㄱ, ㄷ, ㅂ] पछि सामान्य व्यञ्जन वर्णहरू 'ㄱ, ㄷ, ㅂ, ㅅ, ㅈ' आउँछन्, तिनीहरूको उच्चारण कडा (된소리) भएर 'ㄲ, ㄸ, ㅃ, ㅆ, ㅉ' बन्दछ।",
    examples: [
      { written: "학교", spoken: "학꾜", romanized: "hak-kkyo", nepali: "विद्यालय" },
      { written: "식당", spoken: "식땅", romanized: "sik-ttang", nepali: "रेस्टुरेन्ट" },
      { written: "약국", spoken: "약꾹", romanized: "yak-kkuk", nepali: "औषधि पसल" },
      { written: "학생", spoken: "학쌩", romanized: "hak-ssaeng", nepali: "विद्यार्थी" },
      { written: "고맙습니다", spoken: "고맙씀니다", romanized: "gomap-sseumnida", nepali: "धन्यवाद" },
      { written: "잡지", spoken: "잡찌", romanized: "jap-jji", nepali: "पत्रिका" },
      { written: "듣다", spoken: "듣따", romanized: "deut-tta", nepali: "सुन्नु" }
    ]
  },
  {
    id: "aspiration",
    num: 4,
    titleKo: "4. 격음화 (거센소리 되기 / ㅎ 축약)",
    titleNe: "४. 격음화 (महाप्राणीकरण नियम - कडा हावा मिसिने ध्वनि)",
    formula: "ㄱ, ㄷ, ㅂ, ㅈ + ㅎ (or ㅎ + ㄱ, ㄷ, ㅂ, ㅈ) → [ㅋ, ㅌ, ㅍ, ㅊ]",
    category: "sound_change",
    summaryKo: "예사소리 'ㄱ, ㄷ, ㅂ, ㅈ'과 'ㅎ'이 앞뒤로 만나면 결합하여 거센소리인 [ㅋ, ㅌ, ㅍ, ㅊ]로 축약되어 소리 납니다.",
    summaryNe: "जब सामान्य रोकिने व्यञ्जन वर्णहरू (ㄱ, ㄷ, ㅂ, ㅈ) 'ㅎ' सँग भेटिन्छन् (अगाडि वा पछाडि), दुवै मिलेर कडा हावा फाल्ने महाप्राण ध्वनि [ㅋ, ㅌ, ㅍ, ㅊ] मा परिणत हुन्छन्।",
    examples: [
      { written: "축하합니다", spoken: "추카함니다", romanized: "chukahamnida", nepali: "बधाई छ" },
      { written: "좋다", spoken: "조타", romanized: "jota", nepali: "राम्रो हुनु" },
      { written: "입학", spoken: "이팍", romanized: "ipak", nepali: "भर्ना हुनु" },
      { written: "어떻게", spoken: "어떠케", romanized: "eotteoke", nepali: "कसरी" },
      { written: "맞히다", spoken: "마치다", romanized: "machida", nepali: "मिलाउनु / अनुमान गर्नु" },
      { written: "생각하다", spoken: "생가카다", romanized: "saenggakhada", nepali: "सोच्नु" }
    ]
  },
  {
    id: "liaison",
    num: 5,
    titleKo: "5. 연음화 (이어 부르기)",
    titleNe: "५. 연음화 (ध्वनि सञ्चार - स्वर वर्णमा सर्ने नियम)",
    formula: "받침 + 초성 ㅇ(모음) → 받침 자음이 다음 음절 초성으로 이동",
    category: "sound_change",
    summaryKo: "받침 뒤에 모음(첫소리 ㅇ)으로 시작하는 음절이 오면, 받침 자음이 다음 음절의 첫소리로 넘어가서 소리 납니다.",
    summaryNe: "जब कुनै शब्दको फात्छिम लगत्तै स्वर वर्ण 'ㅇ' बाट सुरु हुने अक्षर आउँछ, तब फात्छिम् 'ㅇ' को स्थानमा सरेर उच्चारण गरिन्छ।",
    examples: [
      { written: "한국어", spoken: "한구거", romanized: "hangugeo", nepali: "कोरियन भाषा" },
      { written: "음악", spoken: "으막", romanized: "eumak", nepali: "संगीत" },
      { written: "일하다", spoken: "이라다", romanized: "irhada", nepali: "काम गर्नु" },
      { written: "집에", spoken: "지베", romanized: "jibe", nepali: "घरमा" },
      { written: "옷이", spoken: "오시", romanized: "osi", nepali: "लुगा" },
      { written: "앉아", spoken: "안자", romanized: "anja", nepali: "बस्नुहोस्" }
    ]
  },
  {
    id: "liquidization",
    num: 6,
    titleKo: "6. 유음화 (흐름소리 되기)",
    titleNe: "६. 유음화 (तरलीकरण नियम - ㄴ + ㄹ → [ㄹㄹ])",
    formula: "ㄴ + ㄹ → [ㄹㄹ]  |  ㄹ + ㄴ → [ㄹㄹ]",
    category: "sound_change",
    summaryKo: "'ㄴ'과 'ㄹ'이 앞뒤로 만나면 'ㄴ'이 'ㄹ'로 바뀌어 부드러운 흐름소리 [ㄹㄹ]로 발음됩니다.",
    summaryNe: "जब 'ㄴ' र 'ㄹ' वर्णहरू एकअर्काको अघि वा पछि आउँछन्, तब 'ㄴ' ध्वनि 'ㄹ' मा परिवर्तन भएर दोहोरो [ㄹㄹ] (L) ध्वनि बन्दछ।",
    examples: [
      { written: "신라", spoken: "실라", romanized: "silla", nepali: "सिल्ला राज्य" },
      { written: "난로", spoken: "날로", romanized: "nallo", nepali: "हिटर" },
      { written: "설날", spoken: "설랄", romanized: "seollal", nepali: "नयाँ वर्ष" },
      { written: "칼날", spoken: "칼랄", romanized: "kallal", nepali: "चक्कुको धार" },
      { written: "연락", spoken: "열락", romanized: "yeollak", nepali: "सम्पर्क" },
      { written: "편리", spoken: "펼리", romanized: "pyeolli", nepali: "सुविधाजनक" }
    ]
  },
  {
    id: "palatalization",
    num: 7,
    titleKo: "7. 구개음화 (입천장소리 되기)",
    titleNe: "७. 구개음화 (तालव्य ध्वनि नियम - ㄷ/ㅌ + 이 → [지/치])",
    formula: "ㄷ + 이 → [지]  |  ㅌ + 이 → [치]",
    category: "sound_change",
    summaryKo: "받침 'ㄷ, ㅌ' 뒤에 모음 '이'(또는 반모음 'ㅣ')로 시작하는 문법적 형태소가 오면 혀가 센입천장에 닿아 각각 [지, 치]로 바뀌어 발음됩니다.",
    summaryNe: "जब फात्छिम् 'ㄷ' वा 'ㅌ' पछि व्याकरणिक प्रत्यय '이' आउँछ, तब तिनीहरूको उच्चारण जिब्रो तालुमा ठोक्किएर क्रमशः [지] र [치] बन्दछ।",
    examples: [
      { written: "같이", spoken: "가치", romanized: "gachi", nepali: "सँगै" },
      { written: "굳이", spoken: "구지", romanized: "guji", nepali: "जिद्दी गरेर" },
      { written: "밭이", spoken: "바치", romanized: "bachi", nepali: "बारी" },
      { written: "붙이다", spoken: "부치다", romanized: "buchida", nepali: "टाँस्नु" },
      { written: "해돋이", spoken: "해도지", romanized: "haedoji", nepali: "सूर्योदय" }
    ]
  },
  {
    id: "h_deletion",
    num: 8,
    titleKo: "8. ㅎ 탈락 및 약화 규칙",
    titleNe: "८. ㅎ 탈락 (ㅎ ध्वनि हराउने नियम - मौन 'ㅎ')",
    formula: "ㅎ, ㄶ, ㅀ + 초성 ㅇ(모음) → 'ㅎ' 무음 (탈락)",
    category: "sound_change",
    summaryKo: "받침 'ㅎ'이나 겹받침 'ㄶ, ㅀ' 뒤에 모음(ㅇ)이 오면 'ㅎ'은 소리 나지 않고 완전히 탈락합니다.",
    summaryNe: "जब फात्छिम् 'ㅎ' वा 'ㅎ' जोडिएका संयुक्त फात्छिम् (ㄶ, ㅀ) पछि स्वर वर्ण 'ㅇ' आउँछ, तब 'ㅎ' को उच्चारण पूरै लोप हुन्छ (मौन बस्छ)।",
    examples: [
      { written: "좋아", spoken: "조아", romanized: "joa", nepali: "मन पर्छ / राम्रो छ" },
      { written: "많아", spoken: "마나", romanized: "mana", nepali: "धेरै छ" },
      { written: "싫어", spoken: "시러", romanized: "sireo", nepali: "मन पर्दैन" },
      { written: "놓아요", spoken: "노아요", romanized: "noayo", nepali: "राख्नुहोस्" },
      { written: "괜찮아요", spoken: "괜차나요", romanized: "gwaenchannayo", nepali: "ठीकै छ" }
    ]
  },
  {
    id: "n_addition",
    num: 9,
    titleKo: "9. ㄴ 첨가 규칙 (ㄴ 소리 덧나기)",
    titleNe: "९. ㄴ 첨가 (ㄴ थपिने नियम - संयुक्त शब्दमा)",
    formula: "자음 끝 단어 + 이, 야, 여, 요, 유 → [니, 냐, 녀, 뇨, 뉴]",
    category: "sound_change",
    summaryKo: "합성어나 파생어에서 앞 단어가 자음(받침)으로 끝나고 뒤 단어가 '이, 야, 여, 요, 유'로 시작할 때 사이에 'ㄴ' 소리가 덧붙어 발음됩니다.",
    summaryNe: "दुई शब्द मिलेर बनेका संयुक्त शब्दहरूमा पहिलो शब्द फात्छिममा सकिएर दोस्रो शब्द '이, 야, 여, 요, 유' बाट सुरु भएमा बीचमा 'ㄴ' ध्वनि थपिएर उच्चारण हुन्छ।",
    examples: [
      { written: "맨입", spoken: "맨닙", romanized: "maennip", nepali: "खाली मुख" },
      { written: "솜이불", spoken: "솜니불", romanized: "somnibul", nepali: "कपासको सिरक" },
      { written: "색연필", spoken: "생년필", romanized: "saengnyeonpil", nepali: "रङ्गीन सिसाकलम" },
      { written: "꽃잎", spoken: "꼰닙", romanized: "kkonnip", nepali: "फूलको पात" },
      { written: "깻잎", spoken: "깬닙", romanized: "kkaennip", nepali: "तिलको पात" }
    ]
  }
];

// =============================================================================
// 5. कोरियन संख्याहरू र गन्ती नियम (Sino-Korean & Native Korean Numbers & Units)
// =============================================================================
export const KOREAN_NUMBERS_DATA = {
  sino: {
    titleKo: "한자어 수사 (Sino-Korean Numbers / सिनो कोरियन संख्या)",
    titleNe: "चिनियाँ मूलका कोरियन संख्याहरू (일, 이, 삼, 사...)",
    usageNe: "मिति (साल, महिना, गते), समय (मिनेट, सेकेन्ड), मूल्य/पैसा (원), फोन नम्बर, तल्ला (층), कोठा नम्बर (호), बस नम्बर (번), नाप/तौल (kg, m) आदिमा प्रयोग हुन्छ।",
    digits: [
      { written: "일", spoken: "일", num: "1", nepali: "एक (१)" },
      { written: "이", spoken: "이", num: "2", nepali: "दुई (२)" },
      { written: "삼", spoken: "삼", num: "3", nepali: "तीन (३)" },
      { written: "사", spoken: "사", num: "4", nepali: "चार (४)" },
      { written: "오", spoken: "오", num: "5", nepali: "पाँच (५)" },
      { written: "육", spoken: "육", num: "6", nepali: "छ (६)" },
      { written: "칠", spoken: "칠", num: "7", nepali: "सात (७)" },
      { written: "팔", spoken: "팔", num: "8", nepali: "आठ (८)" },
      { written: "구", spoken: "구", num: "9", nepali: "नौ (९)" },
      { written: "십", spoken: "십", num: "10", nepali: "दश (१०)" },
      { written: "이십", spoken: "이십", num: "20", nepali: "बीस (२०)" },
      { written: "삼십", spoken: "삼십", num: "30", nepali: "तीस (३०)" },
      { written: "오십", spoken: "오십", num: "50", nepali: "पचास (५०)" },
      { written: "백", spoken: "백", num: "100", nepali: "एक सय (१००)" },
      { written: "천", spoken: "천", num: "1,000", nepali: "एक हजार (१,०००)" },
      { written: "만", spoken: "만", num: "10,000", nepali: "दश हजार (१०,००० / १ मान)" },
      { written: "십만", spoken: "심만", num: "100,000", nepali: "एक लाख (१,००,००० / १० मान)" },
      { written: "백만", spoken: "뱅만", num: "1,000,000", nepali: "दश लाख (१०,००,००० / १०० मान)" },
      { written: "억", spoken: "억", num: "100,000,000", nepali: "दश करोड (१०,००,००,००० / १ अक)" }
    ],
    examples: [
      { written: "삼월 이십일", spoken: "사몰 이시빌", nepali: "मार्च २० तारिख (महिना र गते)" },
      { written: "십오 분", spoken: "시보 분", nepali: "१५ मिनेट (समयको मिनेट)" },
      { written: "오천 원", spoken: "ओछन वन", nepali: "५,००० वन (पैसा/रकम)" },
      { written: "삼 층", spoken: "삼 층", nepali: "तेस्रो तल्ला (तल्ला / Floor)" },
      { written: "공일공-일이삼사", spoken: "공일공-일이삼사", nepali: "०१०-१२३४ (फोन नम्बर)" },
      { written: "육십삼 번", spoken: "육십삼 번", nepali: "६३ नम्बर बस / रुट" }
    ]
  },
  native: {
    titleKo: "고유어 수사 (Native Korean Numbers / नेटिभ कोरियन संख्या)",
    titleNe: "शुद्ध कोरियन संख्याहरू (하나, 둘, 셋, 넷...)",
    usageNe: "घण्टा (시), मानिस (명/분), वस्तु/फलफूल (개), जनावर (마리), बोतल (병), कप (잔), किताब (권), गाडी (대), उमेर (살), पटक (번) आदि गन्ती गर्दा प्रयोग हुन्छ।",
    ruleNote: "अति महत्त्वपूर्ण नियम: गन्ती एकाइ (Counter) को अगाडि 하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네, 스물 → 스무 मा रूपान्तरण हुन्छन्!",
    digits: [
      { written: "하나 (한)", spoken: "하나", num: "1", nepali: "एक (गन्तीमा: 한)" },
      { written: "둘 (두)", spoken: "둘", num: "2", nepali: "दुई (गन्तीमा: 두)" },
      { written: "셋 (세)", spoken: "셋", num: "3", nepali: "तीन (गन्तीमा: 세)" },
      { written: "넷 (네)", spoken: "넷", num: "4", nepali: "चार (गन्तीमा: 네)" },
      { written: "다섯", spoken: "다섯", num: "5", nepali: "पाँच (५)" },
      { written: "여섯", spoken: "여섯", num: "6", nepali: "छ (६)" },
      { written: "일곱", spoken: "일곱", num: "7", nepali: "सात (७)" },
      { written: "여덟", spoken: "여덜", num: "8", nepali: "आठ (८)" },
      { written: "아홉", spoken: "아홉", num: "9", nepali: "नौ (९)" },
      { written: "열", spoken: "열", num: "10", nepali: "दश (१०)" },
      { written: "열하나 (열한)", spoken: "열하나", num: "11", nepali: "एघार (११)" },
      { written: "스물 (스무)", spoken: "스물", num: "20", nepali: "बीस (गन्तीमा: 스무)" },
      { written: "서른", spoken: "서른", num: "30", nepali: "तीस (३०)" },
      { written: "마흔", spoken: "마흔", num: "40", nepali: "चालीस (४०)" },
      { written: "쉰", spoken: "쉰", num: "50", nepali: "पचास (५०)" },
      { written: "예순", spoken: "예순", num: "60", nepali: "साठी (६०)" },
      { written: "일흔", spoken: "일흔", num: "70", nepali: "सत्तरी (७०)" },
      { written: "여든", spoken: "여든", num: "80", nepali: "अस्सी (८०)" },
      { written: "아흔", spoken: "아흔", num: "90", nepali: "नब्बे (९०)" }
    ],
    examples: [
      { written: "한 시", spoken: "한 시", nepali: "१ बजे (घण्टा - 시)" },
      { written: "세 명", spoken: "세 명", nepali: "३ जना (मानिस गन्ती - 명)" },
      { written: "사과 다섯 개", spoken: "사과 다섯 개", nepali: "५ वटा स्याउ (वस्तु गन्ती - 개)" },
      { written: "고양이 두 마리", spoken: "고양이 두 마리", nepali: "२ वटा बिरालो (जनावर गन्ती - 마리)" },
      { written: "물 세 병", spoken: "물 세 병", nepali: "३ बोतल पानी (बोतल - 병)" },
      { written: "커피 두 잔", spoken: "커피 두 잔", nepali: "२ कप कफी (कप/गिलास - 잔)" },
      { written: "책 네 권", spoken: "책 네 권", nepali: "४ वटा किताब (किताब/कापी - 권)" },
      { written: "차 한 대", spoken: "차 한 대", nepali: "१ वटा गाडी (गाडी/मेसिन - 대)" },
      { written: "옷 두 벌", spoken: "옷 두 벌", nepali: "२ जोर लुगा (कपडाको सेट - 벌)" },
      { written: "신발 한 켤레", spoken: "신발 한 켤레", nepali: "१ जोडी जुत्ता (जुत्ता/मोजाको जोडी - 켤레)" },
      { written: "스무 살", spoken: "스무 살", nepali: "२० वर्ष उमेर (उमेर - 살)" },
      { written: "두 번", spoken: "두 번", nepali: "२ पटक / दुई चोटी (पटक - 번)" }
    ]
  }
};

// =============================================================================
// 6. 동사, VST, 조사 & 시제 (Verbs, VST, Particles & Tenses / Grammar)
// =============================================================================
export const GRAMMAR_VERBS_DATA = {
  vst: {
    titleKo: "동사 어간 (VST - Verb Stem) 개념",
    titleNe: "क्रियाको धातु (VST) को परिचय र नियम",
    summaryNe: "कोरियन भाषाका सबै क्रियापदहरूको मूल रूप '다' मा अन्त्य हुन्छ (जस्तै: 가다, 먹다, 보다)। '다' लाई हटाउँदा बाँकी रहने मुख्य भागलाई VST (Verb Stem / धातु) भनिन्छ। कोरियन भाषाका सबै काल र व्याकरणका सूत्रहरू यसै VST मा जोडिन्छन्।",
    examples: [
      { written: "가다 → 가-", spoken: "가다", nepali: "जानु → धातु '가-' (फात्छिम नभएको VST)" },
      { written: "먹다 → 먹-", spoken: "먹다", nepali: "खानु → धातु '먹-' (फात्छिम भएको VST)" },
      { written: "보다 → 보-", spoken: "보다", nepali: "हेर्नु → धातु '보-' (ㅏ/ㅗ स्वर भएको VST)" },
      { written: "마시다 → 마시-", spoken: "마시다", nepali: "पिउनु → धातु '마시-' (ㅣ स्वर भएको VST)" },
      { written: "공부하다 → 공부하-", spoken: "공부하다", nepali: "अध्ययन गर्नु → धातु '공부하-' (하다 VST)" },
      { written: "만들다 → 만들-", spoken: "만들다", nepali: "बनाउनु → धातु '만들-' (ㄹ फात्छिम भएको VST)" }
    ]
  },
  particles: [
    {
      name: "은 / 는 (Topic Particle)",
      meaning: "चाहिँ / को बारेमा कुरा गर्दा",
      rule: "अक्षरको अन्त्यमा फात्छिम हुँदा '은', फात्छिम नहुँदा '는' जोडिन्छ।",
      examples: [
        { written: "저는 학생입니다", spoken: "저는 학생임니다", nepali: "म चाहिँ विद्यार्थी हुँ। (저 + 는)" },
        { written: "책은 재미있어요", spoken: "채근 재미इ써요", nepali: "किताब चाहिँ रमाइलो छ। (책 + 은)" },
        { written: "오늘은 날씨가 좋아요", spoken: "오느른 날씨가 조아요", nepali: "आज चाहिँ मौसम राम्रो छ। (오늘 + 은)" }
      ]
    },
    {
      name: "이 / 가 (Subject Particle)",
      meaning: "ले / कर्ता जनाउने विभक्ति",
      rule: "अक्षरको अन्त्यमा फात्छिम हुँदा '이', फात्छिम नहुँदा '가' जोडिन्छ।",
      examples: [
        { written: "비가 와요", spoken: "비가 와요", nepali: "पानी परिरहेको छ। (비 + 가)" },
        { written: "동생이 밥을 먹어요", spoken: "동생이 바블 머거요", nepali: "भाइले भात खान्छ। (동생 + 이)" },
        { written: "시간이 없어요", spoken: "시가니 업써요", nepali: "समय छैन। (시간 + 이)" }
      ]
    },
    {
      name: "을 / 를 (Object Particle)",
      meaning: "लाई / कर्म (Object) जनाउने विभक्ति",
      rule: "अक्षरको अन्त्यमा फात्छिम हुँदा '을', फात्छिम नहुँदा '를' जोडिन्छ।",
      examples: [
        { written: "밥을 먹어요", spoken: "바블 머거요", nepali: "भात खान्छु। (밥 + 을)" },
        { written: "사과를 사요", spoken: "사과를 사요", nepali: "स्याउ किन्छु। (사과 + 를)" },
        { written: "한국어를 배워요", spoken: "한구거를 배워요", nepali: "कोरियन भाषा सिक्छु। (한국어 + 를)" },
        { written: "물을 마셔요", spoken: "무를 마셔요", nepali: "पानी पिउँछु। (물 + 을)" }
      ]
    },
    {
      name: "에 / 에서 (Location & Time)",
      meaning: "에 = मा, तिर (समय/गन्तव्य) | 에서 = मा, बाट (कार्य हुनु/उद्गम)",
      rule: "समय वा गन्तव्यमा '에', कुनै स्थानमा कार्य गर्दा वा बाट आउँदा '에서' जोडिन्छ।",
      examples: [
        { written: "학교에 가요", spoken: "학꾜에 가요", nepali: "विद्यालय जान्छु। (गन्तव्य: 학교 + 에)" },
        { written: "3시에 만나요", spoken: "세 시에 만나요", nepali: "३ बजे भेट्छु। (समय: 3시 + 에)" },
        { written: "식당에서 밥을 먹어요", spoken: "식땅에서 바블 머거요", nepali: "रेस्टुरेन्टमा भात खान्छु। (कार्य: 식당 + 에서)" },
        { written: "네팔에서 왔어요", spoken: "네파레서 와써요", nepali: "नेपालबाट आएको हुँ। (उद्गम: 네팔 + 에서)" }
      ]
    },
    {
      name: "와/과, 하고, (이)랑 & 의, 도",
      meaning: "와/과/하고/(이)랑 = र, सँग | 의 = को | 도 = पनि",
      rule: "과(फात्छिम)/와(स्वर) = औपचारिक र/सँग। 하고, (이)랑 = बोलचालमा र/सँग। 의 = सम्बन्ध 'को'। 도 = 'पनि'।",
      examples: [
        { written: "친구와 영화를 봐요", spoken: "친구와 영화를 봐요", nepali: "साथीसँग चलचित्र हेर्छु। (와 = सँग)" },
        { written: "빵하고 우유를 샀어요", spoken: "빵하고 우유를 사써요", nepali: "पाउरोटी र दूध किनें। (하고 = र)" },
        { written: "선생님의 책", spoken: "선생니메 책", nepali: "शिक्षकको किताब (의 = को)" },
        { written: "저도 가고 싶어요", spoken: "저도 가고 시퍼요", nepali: "म पनि जान चाहन्छु। (도 = पनि)" }
      ]
    }
  ],
  tenses: [
    {
      name: "वर्तमान काल (Present Tense) - ~ㅂ/습니다 & ~아/어요",
      meaning: "गर्छु / खान्छु / जान्छु / गर्दछ",
      rule: "औपचारिक: VST मा फात्छिम नहुँदा ~ㅂ니다, हुँदा ~습니다। अनौपचारिक: VST को अन्तिम स्वर ㅏ/ㅗ भए ~아요, अन्य भए ~어요, 하다 भए ~해요।",
      examples: [
        { written: "가다 → 갑니다 / 가요", spoken: "감니다 / 가요", nepali: "जान्छु (가- + ㅂ니다 / 가- + 아요)" },
        { written: "먹다 → 먹습니다 / 먹어요", spoken: "먹씀니다 / 머거요", nepali: "खान्छु (먹- + 습니다 / 먹- + 어요)" },
        { written: "공부하다 → 공부합니다 / 공부해요", spoken: "공부함니다 / 공부해요", nepali: "अध्ययन गर्छु (하다 → 해요)" },
        { written: "보다 → 봅니다 / 봐요", spoken: "봄니다 / 봐요", nepali: "हेर्छु (보- + 아요 → 봐요)" },
        { written: "마시다 → 마십니다 / 마셔요", spoken: "마심니다 / 마셔요", nepali: "पिउँछु (마시- + 어요 → 마셔요)" }
      ]
    },
    {
      name: "भूतकाल (Past Tense) - ~았/었어요 & ~았/었습니다",
      meaning: "गरेँ / खाएँ / गएँ / भयो",
      rule: "VST को अन्तिम स्वर ㅏ/ㅗ भएमा ~았어요, अन्य स्वर भएमा ~었어요, 하다 भएमा ~했어요 जोडिन्छ।",
      examples: [
        { written: "가다 → 갔어요 / 갔습니다", spoken: "가써요 / 가씀니다", nepali: "गएँ (가- + 았어요 → 갔어요)" },
        { written: "먹다 → 먹었어요 / 먹었습니다", spoken: "머거써요 / 머거씀니다", nepali: "खाएँ (먹- + 었어요 → 먹었어요)" },
        { written: "공부하다 → 공부했어요", spoken: "공부해써요", nepali: "अध्ययन गरेँ (하다 → 했어요)" },
        { written: "보다 → 봤어요", spoken: "봐써요", nepali: "हेरें (보- + 았어요 → 봤어요)" },
        { written: "만나다 → 만났어요", spoken: "만나써요", nepali: "भेटें (만나- + 았어요 → 만났어요)" }
      ]
    },
    {
      name: "भविष्यत् काल (Future Tense) - ~(으)ㄹ 거예요 & ~겠어요",
      meaning: "गर्नेछु / खानेछु / जानेछु",
      rule: "योजना/सम्भावना: VST मा फात्छिम नहुँदा ~ㄹ 거예요, हुँदा ~을 거예요। इच्छा/प्रतिबद्धता: ~겠어요 / ~겠습니다।",
      examples: [
        { written: "가다 → 갈 거예요", spoken: "갈 꺼예요", nepali: "जानेछु (가- + ㄹ 거예요)" },
        { written: "먹다 → 먹을 거예요", spoken: "머गल 꺼예요", nepali: "खानेछु (먹- + 을 거예요)" },
        { written: "열심히 하겠습니다", spoken: "열씨미 하겜씀니다", nepali: "मिहिनेत साथ गर्नेछु (~겠습니다)" },
        { written: "내일 비가 올 거예요", spoken: "내일 비가 올 꺼예요", nepali: "भोलि पानी पर्नेछ (~ㄹ 거예요)" }
      ]
    },
    {
      name: "निरन्तर काल (Continuous) & नकारात्मक रूप (Negation)",
      meaning: "गर्दै हुनु (~고 있다) & नगर्नु (안 / ~지 않다 / 못 / ~지 못하다)",
      rule: "~고 있어요 = गर्दै छु। 안 + Verb = सामान्य नहुनु/नगर्नु। 못 + Verb = क्षमता नहुनु/गर्न नसक्नु।",
      examples: [
        { written: "밥을 먹고 있어요", spoken: "바블 먹꼬 이써요", nepali: "भात खाँदै छु (~고 있다)" },
        { written: "한국어를 공부하고 있어요", spoken: "한구거를 공부하고 이써요", nepali: "कोरियन भाषा पढ्दै छु (~고 있다)" },
        { written: "안 가요 / 가지 않아요", spoken: "안 가요 / 가지 아나요", nepali: "जाँदिन (इच्छाले नगर्नु: 안/~지 않다)" },
        { written: "못 가요 / 가지 못해요", spoken: "몯 가요 / 가지 모태요", nepali: "जान सक्दिन (असमर्थता: 못/~지 못하다)" }
      ]
    }
  ]
};

// =============================================================================
// MAIN COMPONENT EXPORT
// =============================================================================
export default function BatchimRulesGuide({ handlePlayAudio, playingAudioId }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const onPlayClick = (audioUrl, audioId, spokenText, writtenText, gender = 'female') => {
    const textToSpeak = spokenText || writtenText;
    if (handlePlayAudio) {
      handlePlayAudio(audioUrl, audioId, textToSpeak, 'ko', gender);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        const utt = new SpeechSynthesisUtterance(textToSpeak);
        utt.lang = 'ko-KR';
        if (gender === 'male') {
          utt.pitch = 0.82;
          utt.rate = 0.95;
        } else {
          utt.pitch = 1.15;
          utt.rate = 1.0;
        }
        window.speechSynthesis.speak(utt);
      } catch (e) {}
    }
  };

  const matchesSearch = (text) => {
    if (!searchQuery.trim()) return true;
    return (text || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div
      onContextMenu={(e) => e.stopPropagation()}
      style={{
        marginTop: "16px",
        padding: "0",
        border: "none",
        width: "100%",
        maxWidth: "100%",
        userSelect: "text",
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        msUserSelect: "text"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .batchim-word-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.15s ease;
          width: 100%;
          box-sizing: border-box;
          gap: 12px;
        }
        .batchim-word-row:hover {
          background-color: #f8fafc;
        }
        .batchim-col-word {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          min-width: 90px;
          flex-shrink: 0;
        }
        .batchim-col-meaning {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          gap: 6px;
          flex-wrap: wrap;
        }
        .batchim-audio-circle-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
          background-color: #ffffff;
          color: #2563eb;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          padding: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.15s ease;
          margin-left: auto;
        }
        .batchim-audio-circle-btn:hover {
          transform: scale(1.08);
          border-color: #93c5fd;
        }
        @media (max-width: 768px) {
          .batchim-word-row {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            padding: 9px 4px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            white-space: normal !important;
          }
          .batchim-col-word {
            min-width: 70px !important;
            flex-shrink: 0 !important;
            gap: 2px !important;
          }
          .batchim-col-meaning {
            flex: 1 !important;
            min-width: 0 !important;
          }
          .batchim-audio-circle-btn {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
            font-size: 12px !important;
            flex-shrink: 0 !important;
            margin-left: auto !important;
          }
        }
      ` }} />

      {/* SECTION HEADER - KOREAN & NEPALI COMPREHENSIVE BANNER */}
      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>📚</span>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            한국어 발음, 숫자 & 문법 마스터 가이드
            <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: "700", marginLeft: "8px" }}>
              (कोरियन उच्चारण, संख्या र व्याकरण कम्प्लिट गाइड)
            </span>
          </h3>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
          १. ㄱㄷㅂㅈ उच्चारण नियम, २. एकल फात्छिम, ३. ११ संयुक्त फात्छिम, ४. संयुक्त उच्चारणका ९ नियमहरू, ५. सिनो र नेटिभ संख्या र ६. क्रिया, VST, विभक्ति र कालहरू कोरियन र नेपालीमा सिक्नुहोस्।
        </p>
      </div>

      {/* FILTER DROPDOWN & SEARCH INPUT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "22px" }}>
        {/* Dropdown with arrow ▼ for choosing rules */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              width: "100%",
              padding: "10px 38px 10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #2563eb",
              backgroundColor: "#eff6ff",
              color: "#1e40af",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 1px 4px rgba(37,99,235,0.12)"
            }}
          >
            {[
              { id: "all", label: "전체 마스터 가이드 (सबै नियम र व्याकरण)" },
              { id: "gdbj", label: "1. ㄱ, ㄷ, ㅂ, ㅈ उच्चारण नियमहरू" },
              { id: "single_batchim", label: "2. एकल फात्छिम (홑받침 7개 대표음)" },
              { id: "double_batchim", label: "3. संयुक्त फात्छिम (11가지 겹받침)" },
              { id: "sound_change", label: "4. संयुक्त उच्चारणका ९ नियमहरू (음운 변화)" },
              { id: "korean_numbers", label: "5. कोरियन नम्बरहरू (Sino & Native) र गन्ती" },
              { id: "grammar_verbs", label: "6. क्रिया, VST, विभक्ति (은/는, 이/가, 을/를) र काल" }
            ].map(tab => (
              <option key={tab.id} value={tab.id} style={{ color: "#0f172a", backgroundColor: "#ffffff", fontWeight: "700" }}>
                {tab.label}
              </option>
            ))}
          </select>
          <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#1e40af", fontSize: "12px", fontWeight: "900" }}>
            ▼
          </span>
        </div>

        {/* Search Input */}
        <div style={{ minWidth: "220px", flex: "1 1 240px" }}>
          <input
            type="text"
            placeholder="규칙 또는 단어 검색 (नियम वा शब्द खोज्नुहोस्)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              backgroundColor: "#f8fafc"
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ㄱ, ㄷ, ㅂ, ㅈ उच्चारण नियम (G, D, B, J Consonant Pronunciation Rules) */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'gdbj') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#2563eb", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  १. ㄱ, ㄷ, ㅂ, ㅈ नियम
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  ㄱ, ㄷ, ㅂ, ㅈ 발음 규칙 (स्थान अनुसार फरक हुने उच्चारण नियम)
                </h3>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                शब्दको सुरुमा, बीचमा वा मुनि (फात्छिममा) आउँदा हुने स्पष्ट ध्वनि परिवर्तन र उदाहरणहरू।
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid #bfdbfe" }}>
                सुरुमा: ख / थ / फ / छ
              </span>
              <span style={{ backgroundColor: "#f0fdf4", color: "#15803d", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid #bbf7d0" }}>
                बीचमा: ग / द / ब / ज
              </span>
              <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid #fde68a" }}>
                मुनि: क् / त् / प् / त्
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "26px", width: "100%" }}>
            {GDBJ_RULES.map((rule, idx) => {
              const filteredEx = rule.examples.filter(ex =>
                matchesSearch(ex.written) || matchesSearch(ex.spoken) || matchesSearch(ex.nepali) || matchesSearch(rule.titleKo) || matchesSearch(rule.titleNe)
              );
              if (filteredEx.length === 0 && searchQuery.trim()) return null;

              return (
                <div key={idx} style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "900", color: "#1e3a8a", backgroundColor: "#eff6ff", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #bfdbfe" }}>
                      {rule.symbol}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                      {rule.titleKo}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                      · {rule.titleNe}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 10px" }}>
                    <strong style={{ color: "#15803d" }}>नियम:</strong> {rule.summaryNe}
                  </div>

                  {rule.formulaBullets ? (
                    <div style={{ margin: "6px 0 12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: "#1d4ed8" }}>नियम सूत्र:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                        {rule.formulaBullets.map((bullet, bIdx) => (
                          <span key={bIdx} style={{ fontSize: "13.5px", fontWeight: "800", color: "#1e3a8a", backgroundColor: "#eff6ff", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #bfdbfe" }}>
                            - {bullet}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ margin: "6px 0 10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: "#1d4ed8" }}>नियम सूत्र:</span>
                      <code style={{ fontSize: "13.5px", fontWeight: "800", color: "#1e3a8a", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                        {rule.formula}
                      </code>
                    </div>
                  )}

                  {/* Examples Header */}
                  <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbd5e1" }}>
                    <span>उदाहरणहरू (보기):</span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{filteredEx.length} words</span>
                  </div>

                  {/* Examples Rows */}
                  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    {filteredEx.map((ex, exIdx) => {
                      const textToSpeak = ex.spoken || ex.written;
                      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                      const audioId = `gdbj-${rule.id}-${ex.written}`;
                      const isPlaying = playingAudioId === audioId;

                      return (
                        <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                          <div className="batchim-col-word">
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", whiteSpace: "nowrap", lineHeight: "1.2" }}>
                              [{koreanToNepaliRomanized(ex.spoken)}]
                            </span>
                          </div>

                          <div className="batchim-col-meaning">
                            <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>
                              {ex.nepali}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                            title="उच्चारण सुन्नुहोस्"
                            className="batchim-audio-circle-btn"
                            style={{
                              backgroundColor: isPlaying ? "#2563eb" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#2563eb",
                              borderColor: isPlaying ? "#1d4ed8" : "#cbd5e1",
                              boxShadow: isPlaying ? "0 0 0 3px rgba(37,99,235,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                              marginLeft: "auto",
                              flexShrink: 0
                            }}
                          >
                            {isPlaying ? "⏹" : "🔊"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. एकल फात्छिमको नियम (홑받침 7개 대표음 규칙 - Single Batchim 7 Sounds) */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'single_batchim') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#0284c7", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  २. एकल फात्छिम
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  홑받침 7개 대표음 규칙 (एकल फात्छिमका ७ वटा प्रतिनिधि ध्वनिहरू)
                </h3>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                कोरियन वर्णमालाका १६ एकल व्यञ्जनहरू मुनि आउँदा केवल ७ प्रतिनिधि ध्वनिहरू [ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ] मा उच्चारण हुन्छन्।
              </p>
            </div>
            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid #bae6fd" }}>
              ७ प्रतिनिधि ध्वनि: [ㄱ], [ㄴ], [ㄷ], [ㄹ], [ㅁ], [ㅂ], [ㅇ]
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            {SINGLE_BATCHIM_7.map((item, idx) => {
              const filteredEx = item.examples.filter(ex =>
                matchesSearch(ex.written) || matchesSearch(ex.spoken) || matchesSearch(ex.nepali) || matchesSearch(item.rep) || matchesSearch(item.consonants)
              );
              if (filteredEx.length === 0 && searchQuery.trim()) return null;

              return (
                <div key={idx} style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "22px", fontWeight: "900", color: "#0284c7", backgroundColor: "#f0f9ff", padding: "2px 14px", borderRadius: "8px", border: "1.5px solid #bae6fd" }}>
                        {item.rep}
                      </span>
                      <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                        वर्णहरू: <span style={{ color: "#2563eb" }}>{item.consonants}</span>
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                        (उच्चारण ध्वनि: <strong>{item.soundNe}</strong>)
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 12px" }}>
                    <strong style={{ color: "#15803d" }}>नेपाली व्याख्या:</strong> {item.summaryNe}
                  </div>

                  {/* Examples Header */}
                  <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbd5e1" }}>
                    <span>उदाहरणहरू (보기):</span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{filteredEx.length} words</span>
                  </div>

                  {/* Examples Rows */}
                  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    {filteredEx.map((ex, exIdx) => {
                      const textToSpeak = ex.spoken || ex.written;
                      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                      const audioId = `single-${item.rep}-${ex.written}`;
                      const isPlaying = playingAudioId === audioId;

                      return (
                        <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                          <div className="batchim-col-word">
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", whiteSpace: "nowrap", lineHeight: "1.2" }}>
                              [{koreanToNepaliRomanized(ex.spoken)}]
                            </span>
                          </div>

                          <div className="batchim-col-meaning">
                            <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>
                              {ex.nepali}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                            title="उच्चारण सुन्नुहोस्"
                            className="batchim-audio-circle-btn"
                            style={{
                              backgroundColor: isPlaying ? "#2563eb" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#2563eb",
                              borderColor: isPlaying ? "#1d4ed8" : "#cbd5e1",
                              boxShadow: isPlaying ? "0 0 0 3px rgba(37,99,235,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                              marginLeft: "auto",
                              flexShrink: 0
                            }}
                          >
                            {isPlaying ? "⏹" : "🔊"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. संयुक्त फात्छिमको नियम (11가지 겹받침 발음 규칙 - 11 Double Batchims) */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'double_batchim') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#2563eb", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  ३. संयुक्त फात्छिम
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  11가지 겹받침 발음 규칙 (११ वटा संयुक्त फात्छिमहरूको उच्चारण नियम)
                </h3>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                자음 앞, 어말, 모음(ㅇ) 앞에서의 정확한 발음 규칙 (व्यञ्जन अगाडि, शब्दको अन्त्यमा र स्वर वर्ण अगाडिको उच्चारण नियम)
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid #bfdbfe" }}>
                पहिलो अक्षर उच्चारण (८): ㄳ, ㄵ, ㄶ, ㄼ, ㄽ, ㄾ, ㅀ, ㅄ
              </span>
              <span style={{ backgroundColor: "#f0fdf4", color: "#15803d", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", border: "1px solid #bbf7d0" }}>
                दोस्रो अक्षर उच्चारण (३): ㄺ, ㄻ, ㄿ
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%" }}>
            {DUAL_BATCHIM_11.map((item, idx) => {
              const filteredEx = item.examples.filter(ex =>
                matchesSearch(ex.written) || matchesSearch(ex.spoken) || matchesSearch(ex.nepali) || matchesSearch(item.symbol) || matchesSearch(item.components)
              );
              if (filteredEx.length === 0 && searchQuery.trim()) return null;

              return (
                <div key={idx} style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "22px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "24px", fontWeight: "900", color: "#1e3a8a", backgroundColor: "#eff6ff", padding: "3px 14px", borderRadius: "8px", border: "1.5px solid #bfdbfe" }}>
                        {item.symbol}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#475569" }}>
                          <strong>구성 (बनावट):</strong> {item.components}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                          <strong>대표음 (मुख्य ध्वनि):</strong> <span style={{ color: "#2563eb" }}>{item.consonantSound}</span>
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                        व्यञ्जन अगाडि / अन्त्यमा: <strong>{item.consonantSound}</strong>
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#15803d", backgroundColor: "#f0fdf4", padding: "3px 10px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                        स्वर (ㅇ) अगाडि: <strong>{item.vowelSound}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "8px 0 14px" }}>
                    <strong style={{ color: "#15803d" }}>नेपाली व्याख्या:</strong> {item.summaryNe}
                  </div>

                  <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbd5e1" }}>
                    <span>보기 (उदाहरणहरू):</span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{filteredEx.length} examples</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    {filteredEx.map((ex, exIdx) => {
                      const textToSpeak = ex.spoken || ex.written;
                      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                      const audioId = `dual-${item.symbol}-${ex.written}`;
                      const isPlaying = playingAudioId === audioId;

                      return (
                        <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                          <div className="batchim-col-word">
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", whiteSpace: "nowrap", lineHeight: "1.2" }}>
                              [{koreanToNepaliRomanized(ex.spoken)}]
                            </span>
                          </div>

                          <div className="batchim-col-meaning">
                            <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>
                              {ex.nepali}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                            title="उच्चारण सुन्नुहोस्"
                            className="batchim-audio-circle-btn"
                            style={{
                              backgroundColor: isPlaying ? "#2563eb" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#2563eb",
                              borderColor: isPlaying ? "#1d4ed8" : "#cbd5e1",
                              boxShadow: isPlaying ? "0 0 0 3px rgba(37,99,235,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                              marginLeft: "auto",
                              flexShrink: 0
                            }}
                          >
                            {isPlaying ? "⏹" : "🔊"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. संयुक्त उच्चारणका ९ नियमहरू (9 Phonological Sound Change Rules)        */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'sound_change') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#7c3aed", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  ४. संयुक्त उच्चारण नियम
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  9가지 주요 음운 변화 법칙 (९ प्रमुख ध्वनि परिवर्तन नियमहरू)
                </h3>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                नासिक्यीकरण, द्वित्वीकरण, महाप्राणीकरण, ध्वनि सञ्चार, तरलीकरण लगायत परीक्षाका मुख्य ९ नियमहरू।
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
            {ALL_BATCHIM_RULES.map((rule) => {
              const filteredEx = rule.examples.filter(ex =>
                matchesSearch(ex.written) || matchesSearch(ex.spoken) || matchesSearch(ex.nepali) || matchesSearch(rule.titleKo) || matchesSearch(rule.titleNe)
              );
              if (filteredEx.length === 0 && searchQuery.trim()) return null;

              return (
                <div key={rule.id} style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <span style={{ backgroundColor: "#2563eb", color: "#ffffff", fontSize: "14px", fontWeight: "800", padding: "4px 12px", borderRadius: "6px" }}>
                      नियम {rule.num}
                    </span>
                    <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                      {rule.titleKo}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#15803d" }}>
                      · {rule.titleNe}
                    </span>
                  </div>

                  <div style={{ margin: "6px 0 10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#1d4ed8" }}>공식 / नियम:</span>
                    <code style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                      {rule.formula}
                    </code>
                  </div>

                  <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 14px" }}>
                    <strong style={{ color: "#15803d" }}>नेपाली व्याख्या:</strong> {rule.summaryNe}
                  </div>

                  {rule.groups && (
                    <div style={{ margin: "10px 0 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                        음운 분류 / ध्वनि वर्गीकरण:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                        {rule.groups.map((grp, gIdx) => (
                          <div key={gIdx} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                              <span style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb" }}>{grp.rep}</span>
                              <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>← {grp.letters}</span>
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>
                              {grp.exampleKo} → <b style={{ color: "#0f172a" }}>{grp.exampleSpoken}</b>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "8px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", borderBottom: "1.5px solid #cbd5e1" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a" }}>
                      EPS-TOPIK व्यावहारिक उदाहरणहरू (실전 연습 보기):
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{filteredEx.length} examples</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    {filteredEx.map((ex, exIdx) => {
                      const textToSpeak = ex.spoken || ex.written;
                      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                      const audioId = `rule-${rule.id}-${ex.written}`;
                      const isPlaying = playingAudioId === audioId;

                      return (
                        <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                          <div className="batchim-col-word">
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>
                              {ex.written}
                            </span>
                            <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", whiteSpace: "nowrap", lineHeight: "1.2" }}>
                              [{koreanToNepaliRomanized(ex.spoken)}]
                            </span>
                          </div>

                          <div className="batchim-col-meaning">
                            <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>
                              {ex.nepali}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                            title="उच्चारण सुन्नुहोस्"
                            className="batchim-audio-circle-btn"
                            style={{
                              backgroundColor: isPlaying ? "#2563eb" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "#2563eb",
                              borderColor: isPlaying ? "#1d4ed8" : "#cbd5e1",
                              boxShadow: isPlaying ? "0 0 0 3px rgba(37,99,235,0.25)" : "0 1px 3px rgba(0,0,0,0.06)",
                              marginLeft: "auto",
                              flexShrink: 0
                            }}
                          >
                            {isPlaying ? "⏹" : "🔊"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. कोरियन नम्बरहरू (Sino & Native Korean Numbers & Units)                  */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'korean_numbers') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#059669", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  ५. कोरियन संख्या र गन्ती
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  한국어 숫자 & 단위명사 (Sino-Korean & Native Korean Numbers)
                </h3>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                सिनो कोरियन (일, 이, 삼...) र नेटिभ कोरियन (하나, 둘, 셋...) संख्याहरूको सही प्रयोग र गन्ती एकाइहरू।
              </p>
            </div>
          </div>

          {/* SINO KOREAN NUMBERS SECTION */}
          <div style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "24px", marginBottom: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#065f46", backgroundColor: "#ecfdf5", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #a7f3d0" }}>
                भाग क: सिनो कोरियन
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                {KOREAN_NUMBERS_DATA.sino.titleKo}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                · {KOREAN_NUMBERS_DATA.sino.titleNe}
              </span>
            </div>

            <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 14px" }}>
              <strong style={{ color: "#15803d" }}>प्रयोग हुने क्षेत्रहरू:</strong> {KOREAN_NUMBERS_DATA.sino.usageNe}
            </div>

            {/* Sino Digits Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px", marginBottom: "16px" }}>
              {KOREAN_NUMBERS_DATA.sino.digits.map((item, dIdx) => {
                const audioUrl = `/api/tts?text=${encodeURIComponent(item.spoken)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                const audioId = `sino-${item.num}-${item.written}`;
                const isPlaying = playingAudioId === audioId;

                return (
                  <div key={dIdx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>{item.written} ({item.num})</div>
                      <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "700" }}>{item.nepali}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayClick(audioUrl, audioId, item.spoken, item.written)}
                      title="सुन्नुहोस्"
                      className="batchim-audio-circle-btn"
                      style={{ width: "28px", height: "28px", minWidth: "28px", fontSize: "11px" }}
                    >
                      {isPlaying ? "⏹" : "🔊"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sino Practical Examples */}
            <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbd5e1" }}>
              <span>सिनो संख्याका व्यावहारिक उदाहरणहरू (실전 예문):</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {KOREAN_NUMBERS_DATA.sino.examples.map((ex, exIdx) => {
                const textToSpeak = ex.spoken || ex.written;
                const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                const audioId = `sino-ex-${ex.written}`;
                const isPlaying = playingAudioId === audioId;

                return (
                  <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                    <div className="batchim-col-word">
                      <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>{ex.written}</span>
                      <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", lineHeight: "1.2" }}>[{koreanToNepaliRomanized(ex.spoken)}]</span>
                    </div>
                    <div className="batchim-col-meaning">
                      <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>{ex.nepali}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                      title="उच्चारण सुन्नुहोस्"
                      className="batchim-audio-circle-btn"
                    >
                      {isPlaying ? "⏹" : "🔊"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NATIVE KOREAN NUMBERS SECTION */}
          <div style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#15803d", backgroundColor: "#f0fdf4", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #bbf7d0" }}>
                भाग ख: नेटिभ कोरियन
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                {KOREAN_NUMBERS_DATA.native.titleKo}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                · {KOREAN_NUMBERS_DATA.native.titleNe}
              </span>
            </div>

            <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 8px" }}>
              <strong style={{ color: "#15803d" }}>प्रयोग हुने क्षेत्रहरू:</strong> {KOREAN_NUMBERS_DATA.native.usageNe}
            </div>

            <div style={{ fontSize: "13.5px", color: "#b45309", backgroundColor: "#fef3c7", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fde68a", margin: "6px 0 14px", fontWeight: "700" }}>
              ⚠️ {KOREAN_NUMBERS_DATA.native.ruleNote}
            </div>

            {/* Native Digits Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px", marginBottom: "16px" }}>
              {KOREAN_NUMBERS_DATA.native.digits.map((item, dIdx) => {
                const audioUrl = `/api/tts?text=${encodeURIComponent(item.spoken)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                const audioId = `native-${item.num}-${item.written}`;
                const isPlaying = playingAudioId === audioId;

                return (
                  <div key={dIdx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>{item.written}</div>
                      <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "700" }}>{item.nepali}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayClick(audioUrl, audioId, item.spoken, item.written)}
                      title="सुन्नुहोस्"
                      className="batchim-audio-circle-btn"
                      style={{ width: "28px", height: "28px", minWidth: "28px", fontSize: "11px" }}
                    >
                      {isPlaying ? "⏹" : "🔊"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Native Counters & Practical Examples */}
            <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbd5e1" }}>
              <span>गन्ती एकाइ (Counters) सहितका व्यावहारिक उदाहरणहरू (실전 예문):</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {KOREAN_NUMBERS_DATA.native.examples.map((ex, exIdx) => {
                const textToSpeak = ex.spoken || ex.written;
                const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                const audioId = `native-ex-${ex.written}`;
                const isPlaying = playingAudioId === audioId;

                return (
                  <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                    <div className="batchim-col-word">
                      <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>{ex.written}</span>
                      <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", lineHeight: "1.2" }}>[{koreanToNepaliRomanized(ex.spoken)}]</span>
                    </div>
                    <div className="batchim-col-meaning">
                      <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>{ex.nepali}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                      title="उच्चारण सुन्नुहोस्"
                      className="batchim-audio-circle-btn"
                    >
                      {isPlaying ? "⏹" : "🔊"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. क्रिया, VST, विभक्ति (은/는, 이/가, 을/를) र कालहरू (Grammar & Tenses)    */}
      {/* ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'grammar_verbs') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#db2777", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  ६. क्रिया, VST, विभक्ति र काल
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  동사 어간(VST), 핵심 조사(은/는, 이/가, 을/를) 및 주요 시제
                </h3>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                क्रियापदको धातु (VST), प्रमुख विभक्तिहरू र वर्तमान, भूत तथा भविष्यत् कालका वाक्य संरचनाहरू।
              </p>
            </div>
          </div>

          {/* PART A: VST (VERB STEM) EXPLANATION */}
          <div style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "24px", marginBottom: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#9d174d", backgroundColor: "#fdf2f8", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #fbcfe8" }}>
                भाग क: VST धातु
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                {GRAMMAR_VERBS_DATA.vst.titleKo}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                · {GRAMMAR_VERBS_DATA.vst.titleNe}
              </span>
            </div>

            <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 14px" }}>
              <strong style={{ color: "#15803d" }}>नेपाली व्याख्या:</strong> {GRAMMAR_VERBS_DATA.vst.summaryNe}
            </div>

            <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", borderBottom: "1.5px solid #cbd5e1" }}>
              <span>क्रियाबाट VST बनाउने उदाहरणहरू (기본형 → 어간 VST):</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {GRAMMAR_VERBS_DATA.vst.examples.map((ex, exIdx) => {
                const textToSpeak = ex.spoken || ex.written;
                const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                const audioId = `vst-${ex.written}`;
                const isPlaying = playingAudioId === audioId;

                return (
                  <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                    <div className="batchim-col-word">
                      <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>{ex.written}</span>
                      <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12.5px", lineHeight: "1.2" }}>[{koreanToNepaliRomanized(ex.spoken)}]</span>
                    </div>
                    <div className="batchim-col-meaning">
                      <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>{ex.nepali}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                      title="उच्चारण सुन्नुहोस्"
                      className="batchim-audio-circle-btn"
                    >
                      {isPlaying ? "⏹" : "🔊"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PART B: KEY PARTICLES (은/는, 이/가, 을/를, 에, 에서...) */}
          <div style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "24px", marginBottom: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#9d174d", backgroundColor: "#fdf2f8", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #fbcfe8" }}>
                भाग ख: प्रमुख विभक्तिहरू
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                핵심 한국어 조사 (은/는, 이/가, 을/를, 에/에서, 의, 도)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {GRAMMAR_VERBS_DATA.particles.map((pt, pIdx) => (
                <div key={pIdx} style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "900", color: "#1e40af", backgroundColor: "#eff6ff", padding: "3px 12px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                      {pt.name}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                      अर्थ: {pt.meaning}
                    </span>
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#475569", marginBottom: "10px", lineHeight: "1.5" }}>
                    <strong>नियम:</strong> {pt.rule}
                  </div>

                  {/* Particle Examples */}
                  <div style={{ display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    {pt.examples.map((ex, exIdx) => {
                      const textToSpeak = ex.spoken || ex.written;
                      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                      const audioId = `particle-${pIdx}-${ex.written}`;
                      const isPlaying = playingAudioId === audioId;

                      return (
                        <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                          <div className="batchim-col-word">
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px", lineHeight: "1.2" }}>{ex.written}</span>
                            <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12px", lineHeight: "1.2" }}>[{koreanToNepaliRomanized(ex.spoken)}]</span>
                          </div>
                          <div className="batchim-col-meaning">
                            <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14px" }}>{ex.nepali}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                            title="उच्चारण सुन्नुहोस्"
                            className="batchim-audio-circle-btn"
                          >
                            {isPlaying ? "⏹" : "🔊"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PART C: TENSES AND SENTENCE PATTERNS */}
          <div style={{ width: "100%", borderBottom: "2px solid #e2e8f0", paddingBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px", fontWeight: "900", color: "#9d174d", backgroundColor: "#fdf2f8", padding: "3px 12px", borderRadius: "6px", border: "1.5px solid #fbcfe8" }}>
                भाग ग: काल र वाक्य संरचना
              </span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                한국어 주요 시제 (현재, 과거, 미래, 진행형 및 부정형)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {GRAMMAR_VERBS_DATA.tenses.map((ts, tIdx) => (
                <div key={tIdx} style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "900", color: "#7c3aed", backgroundColor: "#f5f3ff", padding: "3px 12px", borderRadius: "6px", border: "1px solid #ddd6fe" }}>
                      {ts.name}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                      भाव: {ts.meaning}
                    </span>
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#475569", marginBottom: "10px", lineHeight: "1.5" }}>
                    <strong>नियम:</strong> {ts.rule}
                  </div>

                  {/* Tense Examples */}
                  <div style={{ display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    {ts.examples.map((ex, exIdx) => {
                      const textToSpeak = ex.spoken || ex.written;
                      const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                      const audioId = `tense-${tIdx}-${ex.written}`;
                      const isPlaying = playingAudioId === audioId;

                      return (
                        <div key={exIdx} className="batchim-word-row" style={{ backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                          <div className="batchim-col-word">
                            <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px", lineHeight: "1.2" }}>{ex.written}</span>
                            <span style={{ fontWeight: "700", color: "#1e40af", fontSize: "12px", lineHeight: "1.2" }}>[{koreanToNepaliRomanized(ex.spoken)}]</span>
                          </div>
                          <div className="batchim-col-meaning">
                            <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14px" }}>{ex.nepali}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onPlayClick(audioUrl, audioId, ex.spoken, ex.written)}
                            title="उच्चारण सुन्नुहोस्"
                            className="batchim-audio-circle-btn"
                          >
                            {isPlaying ? "⏹" : "🔊"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EPS-TOPIK EXAM STRATEGY CARD (Border-left accent, flat out of box) */}
      <div style={{ marginTop: "24px", backgroundColor: "#fefce8", borderLeft: "4px solid #eab308", borderTop: "none", borderRight: "none", borderBottom: "none", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "20px" }}>💡</span>
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#854d0e" }}>
            EPS-TOPIK 시험 핵심 전략 (EPS-TOPIK परीक्षा रणनीति)
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "#713f12", lineHeight: "1.6" }}>
          EPS-TOPIK 듣기(Listening) र 읽기(Reading) दुवै परीक्षामा यी ६ वटा आधारभूत क्षेत्रहरूबाट प्रायः धेरै प्रश्नहरू सोधिन्छन्:
          <br />
          <b>१. ㄱ, ㄷ, ㅂ, ㅈ उच्चारण:</b> शब्दको सुरुमा, बीचमा र फात्छिममा हुने आवाजको भिन्नता चिन्नुहोस्।
          <br />
          <b>२. एकल र संयुक्त फात्छिम:</b> फात्छिम पछि स्वर (ㅇ) आउँदा सर्ने नियम (연음) कण्ठ पार्नुहोस्।
          <br />
          <b>३. संयुक्त उच्चारण नियम:</b> 감사함니다 [감사함니다], 한국어 [한구거], 같이 [가치] जस्ता नियमहरूले लिसनिङमा ठूलो मद्दत पुर्‍याउँछन्।
          <br />
          <b>४. संख्या र एकाइ:</b> समयमा 시 (घण्टा) मा नेटिभ नम्बर र 분 (मिनेट) मा सिनो नम्बर प्रयोग हुन्छ (जस्तै: 3시 30분 = 세 시 삼십 분)।
          <br />
          <b>५. विभक्ति र काल:</b> 은/는 (विषय), 이/가 (कर्ता), 을/를 (कर्म), 에/에서 (स्थान/समय) तथा वर्तमान, भूत र भविष्यत् कालका रूपहरूलाई राम्रोसँग अभ्यास गर्नुहोस्।
        </p>
      </div>
    </div>
  );
}
