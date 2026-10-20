/**
 * Phonetic Naturalizer for Korean and Japanese Speech Synthesis
 * Supports Language-Specific Speech Patterns, Speech Modes, and Emotional Delivery.
 */

export function naturalizeKoreanText(text, speechMode = 'natural_conversation', emotion = 'reassuring') {
  if (!text) return '';

  let t = text.trim();

  // 1. Remove bracketed transliterations and parenthetical pronunciation hints
  t = t.replace(/\([A-Za-z0-9_\u0900-\u097F\s\.,\-~]+\)/g, '');
  t = t.replace(/\[[^\]]+\]/g, '');

  // 2. Expand common currency, percentages & numbers
  t = t.replace(/(\d+),(\d+)/g, '$1$2');
  t = t.replace(/%/g, ' 퍼센트');
  t = t.replace(/₩|원/g, '원');
  t = t.replace(/\$/g, ' 달러');
  t = t.replace(/~/g, ' 에서 ');

  // 3. Speech Mode Pacing & Honorific Adjustments
  if (speechMode === 'news_announcer') {
    // Crisp formal broadcast cadence
    t = t.replace(/([가-힣])(\s*)(습니다|습니까|입니다|합니다)([^\.\?!,~\s]*)$/g, '$1$2$3. ');
  } else if (speechMode === 'workplace_dialogue') {
    // Workplace politeness & clean clause boundaries
    t = t.replace(/,\s*/g, ', ');
  } else if (speechMode === 'slow_learning') {
    // Syllable drill spacing
    t = t.replace(/([가-힣]+)(을|를|이|가|은|는|에|에서|으로|로|의|과|와)\s*/g, '$1$2, ');
  } else if (speechMode === 'teacher') {
    // Gentle instructional pacing
    t = t.replace(/(해\s*보겠습니다|배워보겠습니다|알아보겠습니다)/g, '$1. ');
  }

  // 4. Emotional Prosody Adjustments
  if (emotion === 'happy' || emotion === 'excited') {
    t = t.replace(/\.\s*$/g, '! ');
  } else if (emotion === 'surprised') {
    t = t.replace(/[\.\?!]+\s*$/g, '?! ');
  } else if (emotion === 'sad') {
    t = t.replace(/[\.\?!]+\s*$/g, '... ');
  }

  // 5. Clean up redundant spaces
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

export function naturalizeJapaneseText(text, speechMode = 'natural_conversation', emotion = 'reassuring') {
  if (!text) return '';

  let t = text.trim();

  // 1. Remove bracketed romaji, nepali, or english readings
  t = t.replace(/\([A-Za-z0-9_\u0900-\u097F\s\.,\-~]+\)/g, '');
  t = t.replace(/\[[^\]]+\]/g, '');

  // 2. Expand numbers, currency, and symbols
  t = t.replace(/(\d+),(\d+)/g, '$1$2');
  t = t.replace(/¥(\d+)/g, '$1円');
  t = t.replace(/(\d+)%/g, '$1パーセント');
  t = t.replace(/~/g, 'から');

  // 3. Speech Mode Pacing Adjustments
  if (speechMode === 'news_announcer') {
    t = t.replace(/。+/g, '。 ');
  } else if (speechMode === 'slow_learning') {
    // Slower phonemic spacing on particles (は, を, が, に, で)
    t = t.replace(/([一-龯ぁ-んァ-ヶ]+)(は|を|が|に|で|へ|と)\s*/g, '$1$2、');
  } else if (speechMode === 'teacher') {
    t = t.replace(/(ましょう|ください|勉強しましょう)/g, '$1。');
  }

  // 4. Emotional Prosody Adjustments
  if (emotion === 'happy' || emotion === 'excited') {
    t = t.replace(/。+\s*$/g, '！ ');
  } else if (emotion === 'surprised') {
    t = t.replace(/[。！？]+\s*$/g, '！？ ');
  } else if (emotion === 'sad') {
    t = t.replace(/[。！？]+\s*$/g, '… ');
  }

  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

/**
 * Universal Naturalizer supporting Speech Modes and Emotions
 */
export function naturalizeText(text, lang = 'ko', speechMode = 'natural_conversation', emotion = 'reassuring') {
  if (lang === 'ja' || /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
    return naturalizeJapaneseText(text, speechMode, emotion);
  }
  return naturalizeKoreanText(text, speechMode, emotion);
}
