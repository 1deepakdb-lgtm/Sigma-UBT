import { NextResponse } from 'next/server';
import { VOCABULARY_LIST, searchDictionary, romanizeKorean, romanizeNepali, getKoreanPronunciationWithBatchim, koreanToNepaliRomanized } from '@/lib/dictionaryData';
import { JAPANESE_VOCABULARY, ALL_JAPANESE_DICTIONARY, JAPANESE_KANJI_LIST, searchJapaneseDictionary, romajiToNepaliPhonetic } from '@/lib/japaneseDictionaryData';

export const dynamic = 'force-dynamic';

function buildAudioLinks(item) {
  const koSlug = (item.koreanRomanized || 'korean').replace(/[^a-zA-Z0-9]/g, '_');
  const neSlug = (item.nepaliRomanized || 'nepali').replace(/[^a-zA-Z0-9]/g, '_');
  const enSlug = (item.english || 'english').replace(/[^a-zA-Z0-9]/g, '_');

  return {
    ...item,
    audio: {
      korean: {
        female: `/api/tts?text=${encodeURIComponent(item.korean)}&lang=ko&gender=female&voice=ko-KR-SunHiNeural`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(item.korean)}&lang=ko&gender=female&voice=ko-KR-SunHiNeural&download=true&filename=${koSlug}_ko_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(item.korean)}&lang=ko&gender=male&voice=ko-KR-InJoonNeural`,
        maleDownload: `/api/tts?text=${encodeURIComponent(item.korean)}&lang=ko&gender=male&voice=ko-KR-InJoonNeural&download=true&filename=${koSlug}_ko_male.mp3`,
      },
      nepali: {
        female: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=female&voice=ne-NP-HemkalaNeural`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=female&voice=ne-NP-HemkalaNeural&download=true&filename=${neSlug}_ne_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=male&voice=ne-NP-SagarNeural`,
        maleDownload: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=male&voice=ne-NP-SagarNeural&download=true&filename=${neSlug}_ne_male.mp3`,
      },
      english: {
        female: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=female&voice=en-US-JennyNeural`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=female&voice=en-US-JennyNeural&download=true&filename=${enSlug}_en_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=male&voice=en-US-ChristopherNeural`,
        maleDownload: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=male&voice=en-US-ChristopherNeural&download=true&filename=${enSlug}_en_male.mp3`,
      }
    }
  };
}

function buildJapaneseAudioLinks(item) {
  const jaWord = item.japaneseSpoken || item.japanese || '';
  const jaSlug = (item.japaneseRomanized || 'japanese').replace(/[^a-zA-Z0-9]/g, '_');
  const neSlug = (item.nepaliRomanized || 'nepali').replace(/[^a-zA-Z0-9]/g, '_');
  const enSlug = (item.english || 'english').replace(/[^a-zA-Z0-9]/g, '_');

  return {
    ...item,
    // Add backward-compatible korean fields so generic renderers can work without error if needed
    korean: item.japanese,
    koreanWritten: item.japaneseWritten || item.japanese,
    koreanSpoken: item.japaneseSpoken || item.japanese,
    koreanRomanized: item.japaneseRomanized,
    koreanNepaliRomanized: item.japaneseNepaliRomanized,
    audio: {
      japanese: {
        female: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=female&voice=ja-JP-NanamiNeural`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=female&voice=ja-JP-NanamiNeural&download=true&filename=${jaSlug}_ja_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=male&voice=ja-JP-KeitaNeural`,
        maleDownload: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=male&voice=ja-JP-KeitaNeural&download=true&filename=${jaSlug}_ja_male.mp3`,
      },
      korean: {
        female: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=female&voice=ja-JP-NanamiNeural`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=female&voice=ja-JP-NanamiNeural&download=true&filename=${jaSlug}_ja_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=male&voice=ja-JP-KeitaNeural`,
        maleDownload: `/api/tts?text=${encodeURIComponent(jaWord)}&lang=ja&gender=male&voice=ja-JP-KeitaNeural&download=true&filename=${jaSlug}_ja_male.mp3`,
      },
      nepali: {
        female: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=female`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=female&download=true&filename=${neSlug}_ne_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=male`,
        maleDownload: `/api/tts?text=${encodeURIComponent(item.nepali)}&lang=ne&gender=male&download=true&filename=${neSlug}_ne_male.mp3`,
      },
      english: {
        female: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=female`,
        femaleDownload: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=female&download=true&filename=${enSlug}_en_female.mp3`,
        male: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=male`,
        maleDownload: `/api/tts?text=${encodeURIComponent(item.english)}&lang=en&gender=male&download=true&filename=${enSlug}_en_male.mp3`,
      }
    }
  };
}

/**
 * Standard overrides to ensure 100% precision on primary vocabulary
 */
const CORE_OVERRIDES = {
  'boy': { ne: 'केटा / पुरुष', ko: '남자', en: 'Boy' },
  'girl': { ne: 'केटी / महिला', ko: '여자', en: 'Girl' },
  'child': { ne: 'बच्चा / शिशु', ko: '아이', en: 'Child' },
  'children': { ne: 'बालबालिका / बच्चाहरू', ko: '어린이', en: 'Children' },
  'man': { ne: 'पुरुष / केटा', ko: '남자', en: 'Man' },
  'woman': { ne: 'महिला / केटी', ko: '여자', en: 'Woman' },
  'keta': { ne: 'केटा', ko: '남자', en: 'Boy' },
  'keti': { ne: 'केटी', ko: '여자', en: 'Girl' },
  'bachha': { ne: 'बच्चा', ko: '아이', en: 'Child' },
  'pani': { ne: 'पानी', ko: '물', en: 'Water' },
  'ghar': { ne: 'घर', ko: '집', en: 'House' },
  'khana': { ne: 'खाना', ko: '음식', en: 'Food' },
  'bhat': { ne: 'भात', ko: '밥', en: 'Rice / Meal' },
  'gadi': { ne: 'गाडी', ko: '차 / 자동차', en: 'Car' },
  'sathi': { ne: 'साथी', ko: '친구', en: 'Friend' },
  'paisa': { ne: 'पैसा', ko: '돈', en: 'Money' },
  'kukur': { ne: 'कुकुर', ko: '개', en: 'Dog' },
  'biralo': { ne: 'बिरालो', ko: '고양이', en: 'Cat' },
  'ramro': { ne: 'राम्रो', ko: '좋다', en: 'Good' },
  'chhito': { ne: 'छिटो', ko: '빠르다', en: 'Fast' },
  'dhilo': { ne: 'ढिलो', ko: '느리다', en: 'Slow' },
};

/**
 * Google Translate background fetch (matching https://translate.google.com/?sl=auto&tl=ne&op=translate)
 */
async function fetchGoogleTranslate(text, sl = 'auto', tl = 'ne') {
  if (!text || !text.trim()) return '';
  const clean = text.trim();

  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(1800),
      next: { revalidate: 86400 }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0] && typeof data[0] === 'string') {
        return data[0].trim();
      }
    }
  } catch {}

  // Fallback to MyMemory if Google is unreachable
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${sl === 'auto' ? 'en' : sl}|${tl}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      const candidate = data?.responseData?.translatedText || '';
      if (candidate && !candidate.toLowerCase().includes('mymemory')) {
        return candidate.trim();
      }
    }
  } catch {}

  return '';
}

/**
 * Google Input Tools transliterator for Romanized Nepali input
 * Converts Roman letters (e.g. 'kukur', 'biralo', 'sathi') to Devanagari ('कुकुर', 'बिरालो', 'साथी')
 */
async function fetchRomanizedNepali(text) {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text.trim())}&itc=ne-t-i0-und&num=4`;
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      const list = data[1]?.[0]?.[1];
      if (Array.isArray(list) && list.length > 0) {
        return list[0].trim();
      }
    }
  } catch {}
  return '';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const langParam = searchParams.get('lang') || '';
  const filter = searchParams.get('filter') || 'all';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const cleanQuery = query.trim();
  const isJapaneseScript = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanQuery);
  const isJapaneseMode = langParam === 'ja' || (!langParam && isJapaneseScript);

  // ----------------------------------------------------
  // JAPANESE MODE (1,000+ Kanji & Vocabulary)
  // ----------------------------------------------------
  if (isJapaneseMode) {
    if (!cleanQuery) {
      const source = (filter === 'kanji' || /^n[1-5]$/i.test(filter) || filter.startsWith('jlpt-') || filter === 'vocab')
        ? searchJapaneseDictionary('', filter)
        : ALL_JAPANESE_DICTIONARY;
      const samples = source.slice(0, limit).map(buildJapaneseAudioLinks);
      return NextResponse.json({ success: true, count: samples.length, total: source.length, results: samples });
    }

    // 1. Search local Japanese dictionary (Vocabulary + 1,006 Kanji)
    const jaMatches = searchJapaneseDictionary(cleanQuery, filter);
    if (jaMatches.length > 0) {
      const results = jaMatches.slice(0, limit).map(buildJapaneseAudioLinks);
      return NextResponse.json({ success: true, count: results.length, results });
    }

    // 2. Dynamic Fetch / Translation for Japanese
    try {
      const lowerQuery = cleanQuery.toLowerCase();
      let jaText = '';
      let neText = '';
      let enText = '';

      if (isJapaneseScript) {
        jaText = cleanQuery;
        neText = await fetchGoogleTranslate(cleanQuery, 'ja', 'ne');
        enText = await fetchGoogleTranslate(cleanQuery, 'ja', 'en') || cleanQuery;
      } else if (/[\u0900-\u097F]/.test(cleanQuery)) {
        neText = cleanQuery;
        jaText = await fetchGoogleTranslate(cleanQuery, 'ne', 'ja');
        enText = await fetchGoogleTranslate(cleanQuery, 'ne', 'en') || cleanQuery;
      } else {
        // English or Romaji
        const nepaliCandidate = await fetchRomanizedNepali(cleanQuery);
        const neFromEn = await fetchGoogleTranslate(cleanQuery, 'en', 'ne');
        const jaFromEn = await fetchGoogleTranslate(cleanQuery, 'en', 'ja');

        if (nepaliCandidate && (!neFromEn || neFromEn.toLowerCase() === lowerQuery || neFromEn === nepaliCandidate)) {
          neText = nepaliCandidate;
          jaText = await fetchGoogleTranslate(nepaliCandidate, 'ne', 'ja') || jaFromEn;
          enText = await fetchGoogleTranslate(nepaliCandidate, 'ne', 'en') || cleanQuery;
        } else {
          enText = cleanQuery;
          neText = neFromEn || nepaliCandidate;
          jaText = jaFromEn || (neText ? await fetchGoogleTranslate(neText, 'ne', 'ja') : '');
        }
      }

      const finalJa = jaText || cleanQuery;
      const finalNe = neText || cleanQuery;
      const finalEn = enText || cleanQuery;

      const romajiGuess = lowerQuery.replace(/[^a-z0-9 ]/g, '');
      const nepaliPhonetic = romajiToNepaliPhonetic(romajiGuess) || finalNe;

      const dynamicJaEntry = {
        japanese: finalJa,
        japaneseWritten: finalJa,
        japaneseSpoken: finalJa,
        japaneseRomanized: romajiGuess,
        japaneseNepaliRomanized: nepaliPhonetic,
        pronunciationRule: "Standard Tokyo Accent",
        hasRule: false,
        nepali: finalNe,
        nepaliRomanized: romanizeNepali(finalNe),
        english: finalEn,
        category: 'General'
      };

      const finalResults = [buildJapaneseAudioLinks(dynamicJaEntry)];
      if (jaMatches.length > 0) {
        for (const m of jaMatches) {
          if (m.japanese !== dynamicJaEntry.japanese && finalResults.length < limit) {
            finalResults.push(buildJapaneseAudioLinks(m));
          }
        }
      }

      return NextResponse.json({
        success: true,
        count: finalResults.length,
        results: finalResults
      });
    } catch (err) {
      const fallbackEntry = {
        japanese: cleanQuery,
        japaneseWritten: cleanQuery,
        japaneseSpoken: cleanQuery,
        japaneseRomanized: cleanQuery,
        japaneseNepaliRomanized: romajiToNepaliPhonetic(cleanQuery) || cleanQuery,
        pronunciationRule: "Standard Tokyo Accent",
        hasRule: false,
        nepali: cleanQuery,
        nepaliRomanized: romanizeNepali(cleanQuery),
        english: cleanQuery,
        category: 'General'
      };
      return NextResponse.json({
        success: true,
        count: 1,
        results: [buildJapaneseAudioLinks(fallbackEntry)]
      });
    }
  }

  // ----------------------------------------------------
  // KOREAN MODE
  // ----------------------------------------------------
  if (!cleanQuery) {
    // Return standard popular vocabulary list
    const samples = VOCABULARY_LIST.slice(0, limit).map(buildAudioLinks);
    return NextResponse.json({ success: true, count: samples.length, results: samples });
  }

  // 1. Search local dictionary
  const matches = searchDictionary(cleanQuery);

  // If local matches exist, return them IMMEDIATELY (0ms instant response)
  if (matches.length > 0) {
    const results = matches.slice(0, limit).map(buildAudioLinks);
    return NextResponse.json({ success: true, count: results.length, results });
  }

  // 2. Google Translate Background Fetch (with Romanized Nepali support)
  try {
    const lowerQuery = cleanQuery.toLowerCase();

    let koText = '';
    let neText = '';
    let enText = '';

    // Check curated overrides first
    if (CORE_OVERRIDES[lowerQuery]) {
      koText = CORE_OVERRIDES[lowerQuery].ko;
      neText = CORE_OVERRIDES[lowerQuery].ne;
      enText = CORE_OVERRIDES[lowerQuery].en;
    } else {
      const isDevanagari = /[\u0900-\u097F]/.test(cleanQuery);
      const isHangul = /[\uAC00-\uD7AF]/.test(cleanQuery);

      if (isHangul) {
        koText = cleanQuery;
        neText = await fetchGoogleTranslate(cleanQuery, 'ko', 'ne');
        enText = await fetchGoogleTranslate(cleanQuery, 'ko', 'en') || cleanQuery;
      } else if (isDevanagari) {
        neText = cleanQuery;
        koText = await fetchGoogleTranslate(cleanQuery, 'ne', 'ko');
        enText = await fetchGoogleTranslate(cleanQuery, 'ne', 'en') || cleanQuery;
      } else {
        // English or Romanized Nepali
        const nepaliCandidate = await fetchRomanizedNepali(cleanQuery);
        const neFromEn = await fetchGoogleTranslate(cleanQuery, 'en', 'ne');
        const koFromEn = await fetchGoogleTranslate(cleanQuery, 'en', 'ko');

        // Check if query is Romanized Nepali
        if (nepaliCandidate && (!neFromEn || neFromEn.toLowerCase() === lowerQuery || neFromEn === nepaliCandidate)) {
          neText = nepaliCandidate;
          koText = await fetchGoogleTranslate(nepaliCandidate, 'ne', 'ko') || koFromEn;
          enText = await fetchGoogleTranslate(nepaliCandidate, 'ne', 'en') || cleanQuery;
        } else {
          // Standard English
          enText = cleanQuery;
          neText = neFromEn || nepaliCandidate;
          koText = koFromEn || (neText ? await fetchGoogleTranslate(neText, 'ne', 'ko') : '');
        }
      }
    }

    const finalKo = koText || cleanQuery;
    const finalNe = neText || cleanQuery;
    const finalEn = enText || cleanQuery;

    const batchimInfo = getKoreanPronunciationWithBatchim(finalKo);
    const spokenKo = batchimInfo.spoken || finalKo;

    const dynamicEntry = {
      korean: finalKo,
      koreanWritten: finalKo,
      koreanSpoken: spokenKo,
      koreanRomanized: batchimInfo.spokenRomanized,
      koreanNepaliRomanized: koreanToNepaliRomanized(spokenKo),
      koreanBatchimRule: batchimInfo.batchimRule,
      hasBatchimRule: batchimInfo.hasRule,
      nepali: finalNe,
      nepaliRomanized: romanizeNepali(finalNe),
      english: finalEn,
      category: 'General'
    };

    const finalResults = [buildAudioLinks(dynamicEntry)];

    // If there were lower-scored local matches, append non-duplicate ones
    if (matches.length > 0) {
      for (const m of matches) {
        if (m.korean !== dynamicEntry.korean && finalResults.length < limit) {
          finalResults.push(buildAudioLinks(m));
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: finalResults.length,
      results: finalResults
    });
  } catch (err) {
    const batchimInfo = getKoreanPronunciationWithBatchim(query);
    const spokenKo = batchimInfo.spoken || query;
    const fallbackEntry = {
      korean: query,
      koreanWritten: query,
      koreanSpoken: spokenKo,
      koreanRomanized: batchimInfo.spokenRomanized,
      koreanNepaliRomanized: koreanToNepaliRomanized(spokenKo),
      koreanBatchimRule: batchimInfo.batchimRule,
      hasBatchimRule: batchimInfo.hasRule,
      nepali: query,
      nepaliRomanized: romanizeNepali(query),
      english: query,
      category: 'General'
    };
    return NextResponse.json({
      success: true,
      count: 1,
      results: [buildAudioLinks(fallbackEntry)]
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query || body.word || body.text || '';
    const url = new URL(request.url);
    url.searchParams.set('q', query);
    return GET(new Request(url.toString(), { method: 'GET' }));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

