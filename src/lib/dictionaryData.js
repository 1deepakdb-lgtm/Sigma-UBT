/**
 * EPS-TOPIK Multi-Language Dictionary Engine with Full Korean Batchim (받침) Phonology Rules
 * Supports:
 * - Korean Written (한글) + Spoken Hangul with Batchim rules + Clear Spoken Romanization
 * - Nepali Devanagari + Clear Romanized Nepali
 * - English Meanings & Pronunciations
 * - Bidirectional multi-lingual search
 */

const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const CHO_MAP = {};
CHOSEONG.forEach((c, i) => CHO_MAP[c] = i);
const JONG_MAP = {};
JONGSEONG.forEach((c, i) => JONG_MAP[c] = i);

const JONG_TO_7 = {
  'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ', 'ㅋ': 'ㄱ', 'ㄳ': 'ㄱ', 'ㄺ': 'ㄱ',
  'ㄴ': 'ㄴ', 'ㄵ': 'ㄴ', 'ㄶ': 'ㄴ',
  'ㄷ': 'ㄷ', 'ㅅ': 'ㄷ', 'ㅆ': 'ㄷ', 'ㅈ': 'ㄷ', 'ㅊ': 'ㄷ', 'ㅌ': 'ㄷ', 'ㅎ': 'ㄷ',
  'ㄹ': 'ㄹ', 'ㄼ': 'ㄹ', 'ㄽ': 'ㄹ', 'ㄾ': 'ㄹ', 'ㅀ': 'ㄹ',
  'ㅁ': 'ㅁ', 'ㄻ': 'ㅁ',
  'ㅂ': 'ㅂ', 'ㅍ': 'ㅂ', 'ㄿ': 'ㅂ', 'ㅄ': 'ㅂ',
  'ㅇ': 'ㅇ'
};

function decomposeHangul(char) {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null;
  const syl = code - 0xAC00;
  return {
    cho: Math.floor(syl / 588),
    jung: Math.floor((syl % 588) / 28),
    jong: syl % 28
  };
}

function composeHangul(cho, jung, jong = 0) {
  return String.fromCharCode(0xAC00 + (cho * 588) + (jung * 28) + jong);
}

/**
 * Standard Revised Romanization
 */
export function romanizeKorean(text) {
  if (!text) return '';
  const INITIALS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  const MEDIALS = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  const FINALS = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syl = code - 0xAC00;
      const ini = Math.floor(syl / 588);
      const med = Math.floor((syl % 588) / 28);
      const fin = syl % 28;
      result += (INITIALS[ini] || '') + (MEDIALS[med] || '') + (FINALS[fin] || '');
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Transforms written Korean text into accurate spoken Korean according to all Batchim (받침) phonological rules:
 * 1. Nasalization (비음화)
 * 2. Liaison / Linking (연음화)
 * 3. Tensification / Fortis (경음화 - 된소리)
 * 4. Aspiration (격음화)
 * 5. Liquidization (유음화)
 * 6. Palatalization (구개음화)
 * 7. 7 Representative Final Consonants (음절끝소리규칙)
 */
export function getKoreanPronunciationWithBatchim(text) {
  if (!text) return { written: '', spoken: '', spokenRomanized: '', batchimRule: '', hasRule: false };

  const chars = [];
  const rules = [];

  for (let i = 0; i < text.length; i++) {
    const d = decomposeHangul(text[i]);
    chars.push(d ? { ...d } : text[i]);
  }

  for (let i = 0; i < chars.length; i++) {
    if (typeof chars[i] === 'string') continue;
    const cur = chars[i];
    const next = (i + 1 < chars.length && typeof chars[i + 1] !== 'string') ? chars[i + 1] : null;
    const curJong = JONGSEONG[cur.jong];
    if (!curJong) continue;
    const nextCho = next ? CHOSEONG[next.cho] : null;

    // 1. Aspiration with ㅎ (격음화)
    if (next && nextCho === 'ㅎ') {
      if (['ㄱ', 'ㄺ', 'ㄳ'].includes(curJong)) {
        cur.jong = 0; next.cho = CHO_MAP['ㅋ'];
        rules.push('Aspiration: ㄱ + ㅎ → [ㅋ]');
        continue;
      }
      if (['ㄷ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ'].includes(curJong)) {
        cur.jong = 0; next.cho = CHO_MAP['ㅌ'];
        rules.push('Aspiration: ㄷ + ㅎ → [ㅌ]');
        continue;
      }
      if (['ㅂ', 'ㅍ', 'ㄼ', 'ㄿ'].includes(curJong)) {
        cur.jong = 0; next.cho = CHO_MAP['ㅍ'];
        rules.push('Aspiration: ㅂ + ㅎ → [ㅍ]');
        continue;
      }
      if (curJong === 'ㄹ') {
        cur.jong = 0; next.cho = CHO_MAP['ㄹ'];
        rules.push('Liaison: ㄹ + ㅎ → [ㄹ]');
        continue;
      }
    }
    if (curJong === 'ㅎ' && next) {
      if (nextCho === 'ㄱ') { cur.jong = 0; next.cho = CHO_MAP['ㅋ']; rules.push('Aspiration: ㅎ + ㄱ → [ㅋ]'); continue; }
      if (nextCho === 'ㄷ') { cur.jong = 0; next.cho = CHO_MAP['ㅌ']; rules.push('Aspiration: ㅎ + ㄷ → [ㅌ]'); continue; }
      if (nextCho === 'ㅈ') { cur.jong = 0; next.cho = CHO_MAP['ㅊ']; rules.push('Aspiration: ㅎ + ㅈ → [ㅊ]'); continue; }
      if (nextCho === 'ㅅ') { cur.jong = 0; next.cho = CHO_MAP['ㅆ']; rules.push('Tensification: ㅎ + ㅅ → [ㅆ]'); continue; }
      if (nextCho === 'ㅇ') { cur.jong = 0; rules.push('Silent ㅎ before vowel'); continue; }
    }

    // 2. Palatalization (구개음화) ㄷ, ㅌ + 이 -> [지, 치]
    if (next && nextCho === 'ㅇ' && next.jung === 20) { // ㅣ
      if (curJong === 'ㄷ') { cur.jong = 0; next.cho = CHO_MAP['ㅈ']; rules.push('Palatalization: ㄷ + 이 → [지]'); continue; }
      if (curJong === 'ㅌ') { cur.jong = 0; next.cho = CHO_MAP['ㅊ']; rules.push('Palatalization: ㅌ + 이 → [치]'); continue; }
    }

    // 3. Liaison (연음화) before ㅇ (vowel initial)
    if (next && nextCho === 'ㅇ') {
      if (['ㄳ', 'ㄵ', 'ㄶ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅄ'].includes(curJong)) {
        const doubleMap = {
          'ㄳ': ['ㄱ', 'ㅆ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅇ'],
          'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'],
          'ㄽ': ['ㄹ', 'ㅆ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'],
          'ㅀ': ['ㄹ', 'ㅇ'], 'ㅄ': ['ㅂ', 'ㅆ']
        };
        const [keep, move] = doubleMap[curJong];
        cur.jong = JONG_MAP[keep];
        next.cho = CHO_MAP[move];
        rules.push(`Double Batchim Liaison: ${curJong} → [${keep} · ${move}]`);
      } else if (curJong !== 'ㅇ') {
        cur.jong = 0;
        next.cho = CHO_MAP[curJong] !== undefined ? CHO_MAP[curJong] : next.cho;
        rules.push(`Liaison (연음화): Batchim ${curJong} links to vowel`);
      }
      continue;
    }

    // 4. Nasalization (비음화) before ㄴ or ㅁ
    if (next && ['ㄴ', 'ㅁ'].includes(nextCho)) {
      if (['ㅂ', 'ㅍ', 'ㄼ', 'ㄿ', 'ㅄ'].includes(curJong)) {
        cur.jong = JONG_MAP['ㅁ'];
        rules.push(`Nasalization (비음화): ㅂ + ${nextCho} → [ㅁ]`);
        continue;
      }
      if (['ㄱ', 'ㄲ', 'ㅋ', 'ㄳ', 'ㄺ'].includes(curJong)) {
        cur.jong = JONG_MAP['ㅇ'];
        rules.push(`Nasalization (비음화): ㄱ + ${nextCho} → [ㅇ]`);
        continue;
      }
      if (['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ'].includes(curJong)) {
        cur.jong = JONG_MAP['ㄴ'];
        rules.push(`Nasalization (비음화): ${curJong} + ${nextCho} → [ㄴ]`);
        continue;
      }
    }

    // 5. Liquidization (유음화) ㄴ + ㄹ or ㄹ + ㄴ
    if (next) {
      if (curJong === 'ㄴ' && nextCho === 'ㄹ') {
        cur.jong = JONG_MAP['ㄹ'];
        rules.push('Liquidization (유음화): ㄴ + ㄹ → [ㄹㄹ]');
        continue;
      }
      if (curJong === 'ㄹ' && nextCho === 'ㄴ') {
        next.cho = CHO_MAP['ㄹ'];
        rules.push('Liquidization (유음화): ㄹ + ㄴ → [ㄹㄹ]');
        continue;
      }
    }

    // 6. Tensification (경음화)
    if (next && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅅ', 'ㅈ'].includes(nextCho)) {
      const rep = JONG_TO_7[curJong];
      const tenseMap = { 'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅂ': 'ㅃ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ' };
      // After stops [ㄱ, ㄷ, ㅂ] or predicate dual batchims (ㄵ, ㄻ, ㄾ, ㄼ, ㅄ)
      if (['ㄱ', 'ㄷ', 'ㅂ'].includes(rep) || ['ㄵ', 'ㄻ', 'ㄾ', 'ㄼ', 'ㅄ'].includes(curJong)) {
        next.cho = CHO_MAP[tenseMap[nextCho]];
        cur.jong = JONG_MAP[rep];
        rules.push(`Tensification (경음화): ${curJong} + ${nextCho} → [${rep} · ${tenseMap[nextCho]}]`);
        continue;
      }
    }

    // 7. General Neutralization before consonants or at end of word
    const rep = JONG_TO_7[curJong];
    if (rep && rep !== curJong) {
      cur.jong = JONG_MAP[rep];
      rules.push(`Batchim Simplification (음절끝소리/겹받침): ${curJong} → [${rep}]`);
    }
  }

  let spoken = '';
  for (const c of chars) {
    if (typeof c === 'string') spoken += c;
    else spoken += composeHangul(c.cho, c.jung, c.jong);
  }

  const spokenRomanized = romanizeKorean(spoken);

  return {
    written: text,
    spoken,
    spokenRomanized,
    batchimRule: rules.join(', '),
    hasRule: spoken !== text
  };
}

export function romanizeNepali(text) {
  if (!text) return '';
  const vowels = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri', 'ॠ': 'ree',
    'अं': 'am', 'अः': 'ah'
  };

  const matras = {
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri', 'ॄ': 'ree',
    'ं': 'n', 'ँ': 'n', 'ः': 'h'
  };

  const consonants = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'nya',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gya'
  };

  const halant = '्';

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (vowels[char]) {
      result += vowels[char];
    } else if (consonants[char]) {
      const base = consonants[char];
      if (next === halant) {
        result += base;
        i++;
      } else if (matras[next]) {
        result += base + matras[next];
        i++;
      } else if (next && consonants[next]) {
        result += base + 'a';
      } else if (i === text.length - 1 || next === ' ' || next === '\n' || next === '?' || next === '!' || next === '.') {
        result += base;
      } else {
        result += base + 'a';
      }
    } else if (matras[char]) {
      result += matras[char];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Transliterates Korean Hangul (using spoken Batchim pronunciation) into authentic Nepali Romanized script (नेपाली लिपिमा कोरियन उच्चारण)
 */
export function koreanToNepaliRomanized(text) {
  if (!text) return '';
  const words = text.split(' ');
  return words.map(word => {
    let out = '';
    for (let i = 0; i < word.length; i++) {
      const code = word.charCodeAt(i);
      if (code < 0xAC00 || code > 0xD7A3) {
        out += word[i];
        continue;
      }
      const syl = code - 0xAC00;
      const choIdx = Math.floor(syl / 588);
      const jungIdx = Math.floor((syl % 588) / 28);
      const jongIdx = syl % 28;
      const isFirstSyllable = (i === 0);

      // Consonant mapping
      let cons = '';
      if (choIdx === 11) {
        cons = ''; // silent ㅇ
      } else if (choIdx === 0) cons = isFirstSyllable ? 'ख' : 'ग';
      else if (choIdx === 1) cons = 'क';
      else if (choIdx === 2) cons = 'न';
      else if (choIdx === 3) cons = isFirstSyllable ? 'थ' : 'द';
      else if (choIdx === 4) cons = 'त';
      else if (choIdx === 5) cons = 'र';
      else if (choIdx === 6) cons = 'म';
      else if (choIdx === 7) cons = isFirstSyllable ? 'फ' : 'ब';
      else if (choIdx === 8) cons = 'प';
      else if (choIdx === 9 || choIdx === 10) cons = 'स';
      else if (choIdx === 12) cons = isFirstSyllable ? 'छ' : 'ज';
      else if (choIdx === 13) cons = 'च';
      else if (choIdx === 14) cons = 'छ';
      else if (choIdx === 15) cons = 'ख';
      else if (choIdx === 16) cons = 'थ';
      else if (choIdx === 17) cons = 'फ';
      else if (choIdx === 18) cons = 'ह';

      // Vowel mapping
      const standalone = ['आ', 'ए', 'या', 'ये', 'अ', 'ए', 'यो', 'ये', 'ओ', 'वा', 'वे', 'वे', 'यो', 'उ', 'वो', 'वे', 'वि', 'यु', 'उ', 'उइ', 'इ'];
      const matra = ['ा', 'े', '्या', '्ये', '', 'े', '्यो', '्ये', 'ो', '्वा', '्वे', '्वे', '्यो', 'ु', '्वो', '्वे', '्वि', '्यु', 'ु', 'ुइ', 'ि'];

      const sylVowel = (choIdx === 11) ? standalone[jungIdx] : (cons + matra[jungIdx]);

      // Batchim mapping
      let batchim = '';
      if (jongIdx > 0) {
        const jChar = JONGSEONG[jongIdx];
        const hasNextSyllable = (i + 1 < word.length && word.charCodeAt(i + 1) >= 0xAC00 && word.charCodeAt(i + 1) <= 0xD7A3);
        const halant = hasNextSyllable ? '्' : '';

        if (jChar === 'ㅇ') batchim = 'ङ';
        else if (['ㄴ', 'ㄵ', 'ㄶ'].includes(jChar)) batchim = 'न' + halant;
        else if (['ㅁ', 'ㄻ'].includes(jChar)) batchim = 'म' + halant;
        else if (['ㄹ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㅀ'].includes(jChar)) batchim = 'ल' + halant;
        else if (['ㄱ', 'ㄲ', 'ㅋ', 'ㄳ', 'ㄺ'].includes(jChar)) batchim = 'क' + halant;
        else if (['ㅂ', 'ㅍ', 'ㄿ', 'ㅄ'].includes(jChar)) batchim = 'प' + halant;
        else if (['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ'].includes(jChar)) batchim = 'त' + halant;
      }

      out += sylVowel + batchim;
    }
    return out;
  }).join(' ');
}

export const VOCABULARY_LIST = [
  // 1. Greetings & Etiquette
  { korean: "안녕하세요", nepali: "नमस्ते / नमस्कार", english: "Hello / Good Day", category: "Greetings" },
  { korean: "감사합니다", nepali: "धन्यवाद", english: "Thank you", category: "Greetings" },
  { korean: "고맙습니다", nepali: "धेरै धन्यवाद", english: "Thank you very much", category: "Greetings" },
  { korean: "죄송합니다", nepali: "माफ गर्नुहोस्", english: "I am sorry", category: "Greetings" },
  { korean: "미안합니다", nepali: "माफ पाऊँ", english: "Sorry", category: "Greetings" },
  { korean: "안녕히 계세요", nepali: "राम्रोसँग बस्नुहोस्", english: "Goodbye (to stayer)", category: "Greetings" },
  { korean: "안녕히 가세요", nepali: "राम्रोसँग जानुहोस्", english: "Goodbye (to leaver)", category: "Greetings" },
  { korean: "처음 뵙겠습니다", nepali: "पहिलो पटक भेट्दा खुसी लाग्यो", english: "Pleased to meet you", category: "Greetings" },
  { korean: "반갑습니다", nepali: "भेटेर खुसी लाग्यो", english: "Nice to meet you", category: "Greetings" },
  { korean: "네", nepali: "हजुर / हो", english: "Yes", category: "Basics" },
  { korean: "아니요", nepali: "होइन / अहँ", english: "No", category: "Basics" },
  { korean: "괜찮아요", nepali: "ठीकै छ / केही छैन", english: "It is okay / fine", category: "Basics" },
  { korean: "축하합니다", nepali: "बधाई छ", english: "Congratulations", category: "Greetings" },

  // 2. Workplace & Industry (EPS-TOPIK Core)
  { korean: "공장", nepali: "कारखाना", english: "Factory / Plant", category: "Workplace" },
  { korean: "일하다", nepali: "काम गर्नु", english: "To work", category: "Workplace" },
  { korean: "작업", nepali: "काम / कार्य", english: "Work / Operation", category: "Workplace" },
  { korean: "출근하다", nepali: "काममा जानु", english: "To clock in / go to work", category: "Workplace" },
  { korean: "퇴근하다", nepali: "कामबाट छुट्टी हुनु", english: "To clock out / leave work", category: "Workplace" },
  { korean: "야근하다", nepali: "राती काम गर्नु", english: "Night shift work", category: "Workplace" },
  { korean: "잔업하다", nepali: "ओभरटाइम गर्नु", english: "Overtime work", category: "Workplace" },
  { korean: "월급", nepali: "मासिक तलब", english: "Monthly salary", category: "Workplace" },
  { korean: "급여명세서", nepali: "तलब विवरण पत्र", english: "Pay stub / Salary slip", category: "Workplace" },
  { korean: "사장님", nepali: "साहुजी / मालिक", english: "Boss / Company President", category: "Workplace" },
  { korean: "반장님", nepali: "क्याप्टेन / टोली प्रमुख", english: "Foreman / Shift Leader", category: "Workplace" },
  { korean: "동료", nepali: "सहकर्मी", english: "Colleague / Coworker", category: "Workplace" },
  { korean: "기계", nepali: "मेसिन", english: "Machine", category: "Workplace" },
  { korean: "작동하다", nepali: "मेसिन चलाउनु", english: "To operate / run", category: "Workplace" },
  { korean: "고장나다", nepali: "बिग्रनु", english: "To break down", category: "Workplace" },
  { korean: "수리하다", nepali: "मर्मत गर्नु", english: "To repair / fix", category: "Workplace" },
  { korean: "조심하다", nepali: "सावधानी अपनाउनु", english: "To be careful", category: "Safety" },
  { korean: "안전모", nepali: "सुरक्षा हेल्मेट", english: "Safety helmet", category: "Safety" },
  { korean: "안전화", nepali: "सुरक्षा जुत्ता", english: "Safety shoes", category: "Safety" },
  { korean: "안전장갑", nepali: "सुरक्षा पञ्जा", english: "Safety gloves", category: "Safety" },
  { korean: "보안경", nepali: "सुरक्षा चश्मा", english: "Safety goggles", category: "Safety" },
  { korean: "마스크", nepali: "मास्क", english: "Face mask", category: "Safety" },
  { korean: "위험하다", nepali: "खतरनाक हुनु", english: "Dangerous", category: "Safety" },
  { korean: "사고", nepali: "दुर्घटना", english: "Accident", category: "Safety" },
  { korean: "소화기", nepali: "आगो निभाउने यन्त्र", english: "Fire extinguisher", category: "Safety" },

  // 3. Tools & Equipment
  { korean: "공구", nepali: "औजार / हतियार", english: "Tools", category: "Tools" },
  { korean: "망치", nepali: "हथौडी", english: "Hammer", category: "Tools" },
  { korean: "드라이버", nepali: "पेचकस / स्क्रू ड्राइभर", english: "Screwdriver", category: "Tools" },
  { korean: "스패너", nepali: "रेन्च / स्प्यानर", english: "Wrench / Spanner", category: "Tools" },
  { korean: "니퍼", nepali: "तार काट्ने कटर", english: "Nippers / Wire cutter", category: "Tools" },
  { korean: "줄자", nepali: "नाप्ने टेप", english: "Measuring tape", category: "Tools" },
  { korean: "용접기", nepali: "वेल्डिङ मेसिन", english: "Welding machine", category: "Tools" },
  { korean: "사다리", nepali: "भर्याङ", english: "Ladder", category: "Tools" },
  { korean: "포장하다", nepali: "प्याकिङ गर्नु", english: "To pack", category: "Workplace" },
  { korean: "운반하다", nepali: "ओसार्नु / बोक्नु", english: "To transport / carry", category: "Workplace" },

  // 4. Daily Life, Places & Food
  { korean: "기숙사", nepali: "छात्रावास / होस्टल", english: "Dormitory", category: "Living" },
  { korean: "식당", nepali: "भोजनालय / रेस्टुरेन्ट", english: "Restaurant / Cafeteria", category: "Living" },
  { korean: "화장실", nepali: "शौचालय", english: "Restroom / Toilet", category: "Living" },
  { korean: "병원", nepali: "अस्पताल", english: "Hospital", category: "Health" },
  { korean: "약국", nepali: "औषधि पसल", english: "Pharmacy / Drugstore", category: "Health" },
  { korean: "은행", nepali: "बैंक", english: "Bank", category: "Places" },
  { korean: "우체국", nepali: "हुलाक कार्यालय", english: "Post office", category: "Places" },
  { korean: "마트", nepali: "सुपरमार्केट", english: "Supermarket / Mart", category: "Places" },
  { korean: "시장", nepali: "बजार", english: "Market", category: "Places" },
  { korean: "편의점", nepali: "चौबिसै घण्टा खुला पसल", english: "Convenience store", category: "Places" },
  { korean: "물", nepali: "पानी", english: "Water", category: "Food" },
  { korean: "밥", nepali: "भात / खाना", english: "Cooked rice / Meal", category: "Food" },
  { korean: "김치", nepali: "किम्छी", english: "Kimchi", category: "Food" },
  { korean: "고기", nepali: "मासु", english: "Meat", category: "Food" },
  { korean: "사과", nepali: "स्याउ", english: "Apple", category: "Food" },
  { korean: "빵", nepali: "पाउरोटी", english: "Bread", category: "Food" },
  { korean: "우유", nepali: "दूध", english: "Milk", category: "Food" },
  { korean: "라면", nepali: "चाउचाउ / रामेन", english: "Instant noodles / Ramen", category: "Food" },

  // 5. Transportation
  { korean: "버스", nepali: "बस", english: "Bus", category: "Transport" },
  { korean: "지하철", nepali: "भूमिगत रेल / मेट्रो", english: "Subway / Metro", category: "Transport" },
  { korean: "택시", nepali: "ट्याक्सी", english: "Taxi", category: "Transport" },
  { korean: "기차", nepali: "रेलगाडी", english: "Train", category: "Transport" },
  { korean: "비행기", nepali: "हवाईजहाज", english: "Airplane", category: "Transport" },
  { korean: "정류장", nepali: "बस बिसौनी", english: "Bus stop", category: "Transport" },
  { korean: "표", nepali: "टिकट", english: "Ticket", category: "Transport" },

  // 6. Health & Emergency
  { korean: "아프다", nepali: "दुख्नु / बिरामी पर्नु", english: "To hurt / be sick", category: "Health" },
  { korean: "감기", nepali: "रुघाखोकी", english: "Cold / Flu", category: "Health" },
  { korean: "열", nepali: "ज्वरो", english: "Fever", category: "Health" },
  { korean: "두통", nepali: "टाउको दुखाइ", english: "Headache", category: "Health" },
  { korean: "배탈", nepali: "पेट गडबडी", english: "Stomach upset", category: "Health" },
  { korean: "약", nepali: "औषधि", english: "Medicine", category: "Health" },
  { korean: "주사", nepali: "सुई", english: "Injection", category: "Health" },
  { korean: "도와주세요", nepali: "कृपया मद्दत गर्नुहोस्", english: "Please help me", category: "Emergency" },
  { korean: "살려주세요", nepali: "बचाउनुहोस्", english: "Save me", category: "Emergency" },

  // 7. Time & Calendar
  { korean: "오늘", nepali: "आज", english: "Today", category: "Time" },
  { korean: "내일", nepali: "भोलि", english: "Tomorrow", category: "Time" },
  { korean: "어제", nepali: "हिजो", english: "Yesterday", category: "Time" },
  { korean: "지금", nepali: "अहिले", english: "Now", category: "Time" },
  { korean: "아침", nepali: "बिहान", english: "Morning / Breakfast", category: "Time" },
  { korean: "점심", nepali: "दिउँसो / दिवाभोज", english: "Afternoon / Lunch", category: "Time" },
  { korean: "저녁", nepali: "साँझ / साँझको खाना", english: "Evening / Dinner", category: "Time" },
  { korean: "주말", nepali: "सप्ताहान्त", english: "Weekend", category: "Time" },
  { korean: "시간", nepali: "समय / घण्टा", english: "Time / Hour", category: "Time" },

  // 8. People & Basic Education
  { korean: "선생님", nepali: "शिक्षक / गुरु", english: "Teacher", category: "People" },
  { korean: "학생", nepali: "विद्यार्थी", english: "Student", category: "People" },
  { korean: "친구", nepali: "साथी", english: "Friend", category: "People" },
  { korean: "가족", nepali: "परिवार", english: "Family", category: "People" },
  { korean: "학교", nepali: "विद्यालय / स्कुल", english: "School", category: "Places" },
  { korean: "책", nepali: "किताब", english: "Book", category: "Study" },
  { korean: "공부하다", nepali: "अध्ययन गर्नु / पढ्नु", english: "To study", category: "Study" },
  { korean: "시험", nepali: "परीक्षा", english: "Exam / Test", category: "Study" },
  { korean: "돈", nepali: "पैसा", english: "Money", category: "Basics" },
  { korean: "얼마예요", nepali: "कति रुपैयाँ पर्यो?", english: "How much is it?", category: "Basics" },
  { korean: "꿈", nepali: "सपना", english: "Dream", category: "Basics" },
  { korean: "닭", nepali: "कुखुरा", english: "Chicken", category: "Food" },
  { korean: "값", nepali: "मूल्य / दाम", english: "Price / Value", category: "Basics" },
  { korean: "앉다", nepali: "बस्नु", english: "To sit", category: "Basics" },
  { korean: "삶", nepali: "जीवन", english: "Life", category: "Basics" },
  { korean: "여덟", nepali: "आठ", english: "Eight", category: "Basics" },
  { korean: "많다", nepali: "धेरै हुनु", english: "To be many / much", category: "Basics" },
  { korean: "싫다", nepali: "मन नपर्नु", english: "To dislike", category: "Basics" },
  { korean: "넓다", nepali: "फराकिलो हुनु", english: "To be wide", category: "Basics" },
  { korean: "읽다", nepali: "पढ्नु", english: "To read", category: "Study" },
  { korean: "없다", nepali: "नहुनु / छैन", english: "Not have / absent", category: "Basics" },
  { korean: "있다", nepali: "हुनु / छ", english: "To have / exist", category: "Basics" },
  { korean: "밟다", nepali: "कुल्चनु", english: "To step on", category: "Basics" },
  { korean: "몫", nepali: "भाग", english: "Share / Portion", category: "Basics" },
  { korean: "핥다", nepali: "चाट्नु", english: "To lick", category: "Basics" },
  { korean: "읊다", nepali: "पाठ गर्नु", english: "To recite", category: "Study" }
].map(item => {
  const batchimInfo = getKoreanPronunciationWithBatchim(item.korean);
  const spokenText = batchimInfo.spoken || item.korean;
  return {
    ...item,
    koreanWritten: item.korean,
    koreanSpoken: spokenText,
    koreanRomanized: batchimInfo.spokenRomanized,
    koreanNepaliRomanized: koreanToNepaliRomanized(spokenText),
    koreanBatchimRule: batchimInfo.batchimRule,
    hasBatchimRule: batchimInfo.hasRule,
    nepaliRomanized: romanizeNepali(item.nepali)
  };
});

/**
 * Mapping of common Romanized Nepali queries to standard Devanagari Nepali words
 */
const ROMAN_NEPALI_MAP = {
  'pani': 'पानी',
  'ghar': 'घर',
  'khana': 'खाना',
  'bhat': 'भात',
  'masu': 'मासु',
  'gadi': 'गाडी',
  'gaadi': 'गाडी',
  'sathi': 'साथी',
  'saathi': 'साथी',
  'kukur': 'कुकुर',
  'biralo': 'बिरालो',
  'biralu': 'बिरालो',
  'paisa': 'पैसा',
  'keta': 'केटा',
  'keti': 'केटी',
  'bachha': 'बच्चा',
  'kam': 'काम',
  'kaam': 'काम',
  'didi': 'दीदी',
  'dai': 'दाजु',
  'daju': 'दाजु',
  'bhai': 'भाइ',
  'bahini': 'बहिनी',
  'ramro': 'राम्रो',
  'naramro': 'नराम्रो',
  'thulo': 'ठूलो',
  'sano': 'सानो',
  'chhito': 'छिटो',
  'chito': 'छिटो',
  'dhilo': 'ढिलो',
  'kitab': 'किताब',
  'kalam': 'कलम',
  'aaja': 'आज',
  'bholi': 'भोलि',
  'hijo': 'हिजो',
  'nam': 'नाम',
  'naam': 'नाम',
  'bato': 'बाटो',
  'kotha': 'कोठा',
  'luga': 'लुगा',
  'jutta': 'जुत्ता',
  'jhola': 'झोला',
  'topi': 'टोपी',
  'sahuji': 'साहुजी',
  'malik': 'मालिक'
};

/**
 * Searches the vocabulary list with multi-lingual matching (Korean, Nepali, English, and Romanized versions)
 * Supports Romanized Nepali letters, English whole-token matches, and Korean script.
 */
export function searchDictionary(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const romanNepaliTarget = ROMAN_NEPALI_MAP[q];
  const scored = [];

  for (const item of VOCABULARY_LIST) {
    let score = 0;
    const ko = item.korean.toLowerCase();
    const en = item.english.toLowerCase();
    const ne = item.nepali.toLowerCase();

    // 1. Korean Exact / Prefix match
    if (ko === q) {
      score += 250;
    } else if (ko.startsWith(q)) {
      score += 150;
    } else if (ko.includes(q)) {
      score += 70;
    }

    // 2. English Token matching (Strict whole-token comparison)
    const enTokens = en.split(/[\s/,()]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    if (en === q) {
      score += 250;
    } else if (enTokens.includes(q)) {
      score += 200;
    } else if (q.length >= 3 && enTokens.some(t => t.startsWith(q))) {
      score += 90;
    }

    // 3. Nepali Token matching
    const neTokens = ne.split(/[\s/,()]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    if (ne === q) {
      score += 250;
    } else if (neTokens.includes(q)) {
      score += 200;
    } else if (neTokens.some(t => t.startsWith(q))) {
      score += 90;
    }

    // 4. Roman Nepali direct mapping match
    if (romanNepaliTarget) {
      if (ne === romanNepaliTarget || neTokens.includes(romanNepaliTarget)) {
        score += 220;
      } else if (ne.includes(romanNepaliTarget)) {
        score += 180;
      }
    }

    // 5. Romanized Korean exact / prefix match
    if (item.koreanRomanized) {
      const koRom = item.koreanRomanized.toLowerCase();
      if (koRom === q) score += 130;
      else if (koRom.startsWith(q) && q.length >= 3) score += 70;
    }
    if (item.koreanNepaliRomanized && item.koreanNepaliRomanized === q) {
      score += 130;
    }

    // 6. Direct word priority mappings
    if (q === 'boy' && item.korean === '남자') score += 120;
    if (q === 'girl' && item.korean === '여자') score += 120;
    if (q === 'child' && item.korean === '아이') score += 120;
    if (q === 'children' && item.korean === '어린이') score += 120;
    if (q === 'man' && item.korean === '남자') score += 120;
    if (q === 'woman' && item.korean === '여자') score += 120;

    if (score > 0) {
      scored.push({ item: { ...item, _searchScore: score }, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}
