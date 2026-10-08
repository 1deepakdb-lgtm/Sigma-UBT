const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function decompose(char) {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null;
  const syl = code - 0xAC00;
  return {
    cho: Math.floor(syl / 588),
    jung: Math.floor((syl % 588) / 28),
    jong: syl % 28
  };
}

function compose(cho, jung, jong = 0) {
  return String.fromCharCode(0xAC00 + (cho * 588) + (jung * 28) + jong);
}

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

function getKoreanPronunciationWithBatchim(text) {
  if (!text) return { written: '', spoken: '', batchimRule: '', hasRule: false };

  const chars = [];
  const rules = [];

  for (let i = 0; i < text.length; i++) {
    const d = decompose(text[i]);
    chars.push(d ? { ...d } : text[i]);
  }

  for (let i = 0; i < chars.length; i++) {
    if (typeof chars[i] === 'string') continue;
    const cur = chars[i];
    const next = (i + 1 < chars.length && typeof chars[i + 1] !== 'string') ? chars[i + 1] : null;
    const curJong = JONGSEONG[cur.jong];
    if (!curJong) continue;
    const nextCho = next ? CHOSEONG[next.cho] : null;

    // 1. Aspiration with ㅎ
    if (next && nextCho === 'ㅎ') {
      if (['ㄱ', 'ㄺ', 'ㄳ'].includes(curJong)) {
        cur.jong = 0; next.cho = CHO_MAP['ㅋ'];
        rules.push('Aspiration (격음화): ㄱ + ㅎ → [ㅋ]');
        continue;
      }
      if (['ㄷ', 'ㅅ', 'ㅈ', 'ㅊ', 'ㅌ'].includes(curJong)) {
        cur.jong = 0; next.cho = CHO_MAP['ㅌ'];
        rules.push('Aspiration (격음화): ㄷ + ㅎ → [ㅌ]');
        continue;
      }
      if (['ㅂ', 'ㅍ', 'ㄼ', 'ㄿ'].includes(curJong)) {
        cur.jong = 0; next.cho = CHO_MAP['ㅍ'];
        rules.push('Aspiration (격음화): ㅂ + ㅎ → [ㅍ]');
        continue;
      }
      if (curJong === 'ㄹ') {
        cur.jong = 0; next.cho = CHO_MAP['ㄹ'];
        rules.push('Liaison (연음화): ㄹ + ㅎ → [ㄹ]');
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

    // 2. Palatalization (구개음화) ㄷ, ㅌ + 이 -> ㅈ, ㅊ
    if (next && nextCho === 'ㅇ' && next.jung === 20) { // ㅣ
      if (curJong === 'ㄷ') { cur.jong = 0; next.cho = CHO_MAP['ㅈ']; rules.push('Palatalization (구개음화): ㄷ + 이 → [지]'); continue; }
      if (curJong === 'ㅌ') { cur.jong = 0; next.cho = CHO_MAP['ㅊ']; rules.push('Palatalization (구개음화): ㅌ + 이 → [치]'); continue; }
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
        rules.push(`Double Batchim Liaison: ${curJong} → [${keep} + ${move}]`);
      } else if (curJong !== 'ㅇ') {
        cur.jong = 0;
        next.cho = CHO_MAP[curJong] !== undefined ? CHO_MAP[curJong] : next.cho;
        rules.push(`Liaison (연음화): Batchim ${curJong} shifts to next vowel`);
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

    // 5. Liquidization (유음화)
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

    // 6. Tensification (경음화) after stops ㄱ, ㄷ, ㅂ
    if (next && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅅ', 'ㅈ'].includes(nextCho)) {
      const rep = JONG_TO_7[curJong];
      if (['ㄱ', 'ㄷ', 'ㅂ'].includes(rep)) {
        const tenseMap = { 'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅂ': 'ㅃ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ' };
        next.cho = CHO_MAP[tenseMap[nextCho]];
        cur.jong = JONG_MAP[rep];
        rules.push(`Tensification (경음화): ${rep} + ${nextCho} → [${tenseMap[nextCho]}]`);
        continue;
      }
    }

    // 7. Neutralization at end of word or before other consonants
    if (!next || typeof chars[i + 1] === 'string' || chars[i + 1] === ' ') {
      const rep = JONG_TO_7[curJong];
      if (rep && rep !== curJong) {
        cur.jong = JONG_MAP[rep];
        rules.push(`Final Neutralization (음절끝소리): ${curJong} → [${rep}]`);
      }
    }
  }

  let spoken = '';
  for (const c of chars) {
    if (typeof c === 'string') spoken += c;
    else spoken += compose(c.cho, c.jung, c.jong);
  }

  return {
    written: text,
    spoken,
    batchimRule: rules.join(', '),
    hasRule: spoken !== text
  };
}

const words = ['감사합니다', '축하합니다', '한국어', '학교', '식당', '약국', '일하다', '같이', '신라', '옷', '꽃', '안녕하세요', '사과'];
for (const w of words) {
  const r = getKoreanPronunciationWithBatchim(w);
  console.log(`${w} -> Spoken: [${r.spoken}] | Rule: ${r.batchimRule || 'Standard'}`);
}
