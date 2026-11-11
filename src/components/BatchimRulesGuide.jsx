'use client';

import React, { useState } from 'react';
import { koreanToNepaliRomanized } from '@/lib/dictionaryData';

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

  const filteredRules = ALL_BATCHIM_RULES.filter(rule => {
    const matchesCat = activeCategory === 'all' || rule.category === activeCategory || rule.id === activeCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rule.titleKo.toLowerCase().includes(q) ||
      rule.titleNe.toLowerCase().includes(q) ||
      rule.formula.toLowerCase().includes(q) ||
      rule.summaryKo.toLowerCase().includes(q) ||
      rule.summaryNe.toLowerCase().includes(q) ||
      rule.examples.some(ex =>
        ex.written.toLowerCase().includes(q) ||
        ex.spoken.toLowerCase().includes(q) ||
        ex.romanized.toLowerCase().includes(q) ||
        ex.nepali.toLowerCase().includes(q)
      )
    );
  });

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

      {/* SECTION HEADER - KOREAN & NEPALI (REPLACED ENGLISH BANNER) */}
      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>📚</span>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            한국어 받침 발음 법칙 & 11가지 겹받침
            <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: "700", marginLeft: "8px" }}>
              (कोरियन फात्छिम् उच्चारण नियम र ११ वटा संयुक्त फात्छिम्)
            </span>
          </h3>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
          한국어의 9가지 주요 음운 변화 법칙과 11가지 겹받침의 정확한 실제 발음을 한국어와 네팔어로 완벽하게 학습하세요.
          <br />
          <span style={{ color: "#475569", fontSize: "14px" }}>
            (कोरियन भाषाका ९ मुख्य ध्वनि परिवर्तनका नियमहरू र ११ वटा संयुक्त फात्छिमहरू कोरियन र नेपाली भाषामा सिक्नुहोस्।)
          </span>
        </p>
      </div>

      {/* FILTER DROPDOWN & SEARCH (Dropdown with arrow, button pills removed from mobile view per user request) */}
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
              { id: "all", label: "전체 규칙 (सबै नियमहरू)" },
              { id: "double_batchim", label: "11가지 겹받침 (११ संयुक्त फात्छिम्)" },
              { id: "7endings", label: "1. 음절 끝소리 (७ अन्त्य ध्वनि)" },
              { id: "nasalization", label: "2. 비음화 (नासिक्यीकरण)" },
              { id: "tensification", label: "3. 경음화 (द्वित्वीकरण)" },
              { id: "aspiration", label: "4. 격음화 (महाप्राणीकरण)" },
              { id: "liaison", label: "5. 연음화 (ध्वनि सञ्चार)" },
              { id: "liquidization", label: "6. 유음화 (तरलीकरण)" },
              { id: "palatalization", label: "7. 구개음화 (तालव्यीकरण)" },
              { id: "h_deletion", label: "8. ㅎ 탈락 (ㅎ लोप)" },
              { id: "n_addition", label: "9. ㄴ 첨가 (ㄴ थप)" }
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

      {/* DEDICATED ALL 11 DUAL BATCHIMS SHOWCASE */}
      {(activeCategory === 'all' || activeCategory === 'double_batchim') && (
        <div style={{ marginBottom: "36px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #bfdbfe", paddingBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#2563eb", color: "white", fontSize: "14px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                  겹받침 (संयुक्त फात्छिम्)
                </span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  11가지 겹받침 발음 규칙 (११ वटा संयुक्त फात्छिम्)
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

          {/* 11 Dual Batchim Full Width Clean Sections (Out from tables, out of boxes) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
            {DUAL_BATCHIM_11.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: "100%",
                  borderBottom: "2px solid #e2e8f0",
                  paddingBottom: "22px"
                }}
              >
                {/* Top Info Bar */}
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

                {/* Nepali Explanation - Clean, open, outside of any box */}
                <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "8px 0 14px" }}>
                  <strong style={{ color: "#15803d" }}>नेपाली व्याख्या:</strong> {item.summaryNe}
                </div>

                {/* Examples Header */}
                <div style={{ padding: "6px 4px", fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbd5e1" }}>
                  <span>보기 (उदाहरणहरू):</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{item.examples.length} examples</span>
                </div>

                {/* Three-Column Examples Rows */}
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  {item.examples.map((ex, exIdx) => {
                    const textToSpeak = ex.spoken || ex.written;
                    const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                    const audioId = `dual-${item.symbol}-${ex.written}`;
                    const isPlaying = playingAudioId === audioId;
                    return (
                      <div
                        key={exIdx}
                        className="batchim-word-row"
                        style={{
                          backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc"
                        }}
                      >
                        {/* LEFT PART: Written Word + Pronunciation Below */}
                        <div className="batchim-col-word">
                          <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>
                            {ex.written}
                          </span>
                          <span style={{
                            fontWeight: "700",
                            color: "#1e40af",
                            fontSize: "12.5px",
                            whiteSpace: "nowrap",
                            lineHeight: "1.2"
                          }}>
                            [{koreanToNepaliRomanized(ex.spoken)}]
                          </span>
                        </div>

                        {/* MIDDLE PART: Nepali Meaning */}
                        <div className="batchim-col-meaning">
                          <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>
                            {ex.nepali}
                          </span>
                        </div>

                        {/* RIGHT PART: Round Audio Button (Right side of meaning) */}
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
            ))}
          </div>
        </div>
      )}

      {/* ALL PHONOLOGICAL SOUND CHANGE RULES LIST (Full Width / Out of Tables) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "34px", width: "100%" }}>
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            style={{
              width: "100%",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "24px"
            }}
          >
            {/* Rule Header Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ backgroundColor: "#2563eb", color: "#ffffff", fontSize: "14px", fontWeight: "800", padding: "4px 12px", borderRadius: "6px" }}>
                  규칙 {rule.num}
                </span>
                <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                  {rule.titleKo}
                </span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#15803d" }}>
                  · {rule.titleNe}
                </span>
              </div>
            </div>

            {/* Formula Highlight - Clean, open, out of box */}
            <div style={{ margin: "6px 0 10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#1d4ed8" }}>
                공식 / नियम:
              </span>
              <code style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                {rule.formula}
              </code>
            </div>

            {/* Explanation in Nepali - Clean prose */}
            <div style={{ fontSize: "14px", color: "#166534", lineHeight: "1.6", margin: "6px 0 14px" }}>
              <strong style={{ color: "#15803d" }}>नेपाली व्याख्या:</strong> {rule.summaryNe}
            </div>

            {/* Representative Groups breakdown if exists (for Rule 1) */}
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

            {/* Rule Examples Header */}
            <div style={{ padding: "8px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", borderBottom: "1.5px solid #cbd5e1" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a" }}>
                EPS-TOPIK व्यावहारिक उदाहरणहरू (실전 연습 보기):
              </span>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                {rule.examples.length} examples
              </span>
            </div>

            {/* Three-Column Rule Examples List */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {rule.examples.map((ex, exIdx) => {
                const textToSpeak = ex.spoken || ex.written;
                const audioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=ko&voice=ko-KR-SunHiNeural&model=ko-female-1`;
                const audioId = `rule-${rule.id}-${ex.written}`;
                const isPlaying = playingAudioId === audioId;
                return (
                  <div
                    key={exIdx}
                    className="batchim-word-row"
                    style={{
                      backgroundColor: exIdx % 2 === 0 ? "#ffffff" : "#fcfcfc"
                    }}
                  >
                    {/* LEFT PART: Written Word + Pronunciation Below */}
                    <div className="batchim-col-word">
                      <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "16px", lineHeight: "1.2" }}>
                        {ex.written}
                      </span>
                      <span style={{
                        fontWeight: "700",
                        color: "#1e40af",
                        fontSize: "12.5px",
                        whiteSpace: "nowrap",
                        lineHeight: "1.2"
                      }}>
                        [{koreanToNepaliRomanized(ex.spoken)}]
                      </span>
                    </div>

                    {/* MIDDLE PART: Nepali Meaning */}
                    <div className="batchim-col-meaning">
                      <span style={{ color: "#15803d", fontWeight: "700", fontSize: "14.5px" }}>
                        {ex.nepali}
                      </span>
                    </div>

                    {/* RIGHT PART: Round Audio Button (Right side of meaning) */}
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
        ))}
      </div>

      {/* EPS-TOPIK EXAM STRATEGY CARD (Border-left accent, flat out of box) */}
      <div style={{ marginTop: "24px", backgroundColor: "#fefce8", borderLeft: "4px solid #eab308", borderTop: "none", borderRight: "none", borderBottom: "none", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "20px" }}>💡</span>
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#854d0e" }}>
            EPS-TOPIK 시험 핵심 전략 (EPS-TOPIK परीक्षा रणनीति)
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "#713f12", lineHeight: "1.6" }}>
          EPS-TOPIK 듣기(Listening) 시험에서는 글자 표기 그대로가 아닌 <b>받침 발음 법칙에 따라 변환된 소리</b>가 출제됩니다.
          <br />
          उदाहरणका लागि: <b>감사합니다</b> लेखिए पनि बोल्दा <b>[감사함니다]</b> उच्चारण हुन्छ; <b>한국어</b> लेख्दा <b>[한구거]</b> सुनिन्छ; <b>앉다</b> लेख्दा <b>[안따]</b>, <b>읽다</b> लेख्दा <b>[익따]</b> सुनिन्छ।
          <br />
          माथि दिइएका ९ वटा नियमहरू र ११ वटा संयुक्त फात्छिमहरू राम्रोसँग कण्ठ गरेमा सुन्ने (Listening) र पढ्ने (Reading) दुवै खण्डमा उत्कृष्ट अंक ल्याउन सकिन्छ!
        </p>
      </div>
    </div>
  );
}
