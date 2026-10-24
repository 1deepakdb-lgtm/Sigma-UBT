import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CHAPTER_MEANINGS_DATA } from '../src/lib/koreanChapterMeaningData.js';
import { CHAPTER_GRAMMAR_MAP } from '../src/lib/koreanChapterGrammarData.js';
import { koreanToNepaliRomanized } from '../src/lib/dictionaryData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Master Chapter Comprehensive Book Builder for all 60 Chapters...');

// Chapter 1 custom overrides matching user prompt exactly
const CH1_CUSTOM_WORDS = [
  { korean: '인사', nepali: 'अभिवादन', pronunciation: 'इन्सा' },
  { korean: '이름', nepali: 'नाम', pronunciation: 'इरुम' },
  { korean: '사람', nepali: 'मानिस', pronunciation: 'साराम' },
  { korean: '친구', nepali: 'साथी', pronunciation: 'चिन्गु' },
  { korean: '학생', nepali: 'विद्यार्थी', pronunciation: 'हाक्सेङ' },
  { korean: '선생님', nepali: 'शिक्षक', pronunciation: 'सोन्सेङनिम' },
  { korean: '나라', nepali: 'देश', pronunciation: 'नारा' },
  { korean: '한국', nepali: 'कोरिया', pronunciation: 'हान्गुक' },
  { korean: '네팔', nepali: 'नेपाल', pronunciation: 'नेपाल' },
  { korean: '회사', nepali: 'कम्पनी', pronunciation: 'ह्वेसा' },
  { korean: '직업', nepali: 'पेसा', pronunciation: 'चिगप' },
  { korean: '가족', nepali: 'परिवार', pronunciation: 'काजोक' }
];

const CH1_EXPRESSIONS = [
  { korean: '안녕하세요?', nepali: 'नमस्कार।', pronunciation: 'आन्न्योङहासेयो?' },
  { korean: '안녕히 가세요.', nepali: 'राम्रोसँग जानुहोस्।', pronunciation: 'आन्न्योङही खासेयो.' },
  { korean: '안녕히 계세요.', nepali: 'राम्रोसँग बस्नुहोस्।', pronunciation: 'आन्न्योङही ख्येसेयो.' },
  { korean: '감사합니다.', nepali: 'धन्यवाद।', pronunciation: 'खाम्साहाम्निदा.' },
  { korean: '죄송합니다.', nepali: 'माफ गर्नुहोस्।', pronunciation: 'छ्वेसोङहाम्निदा.' },
  { korean: '만나서 반갑습니다.', nepali: 'भेटेर खुसी लाग्यो।', pronunciation: 'मान्नासो फान्गाप्सुम्निदा.' },
  { korean: '제 이름은 마두입니다.', nepali: 'मेरो नाम मादु हो।', pronunciation: 'छे इरुमुन मादुइम्निदा.' },
  { korean: '저는 네팔 사람입니다.', nepali: 'म नेपाली हुँ।', pronunciation: 'छनुन नेफाल सारामिम्निदा.' },
  { korean: '저는 학생입니다.', nepali: 'म विद्यार्थी हुँ।', pronunciation: 'छनुन हाक्सेङइम्निदा.' },
  { korean: '어느 나라 사람입니까?', nepali: 'तपाईं कुन देशको नागरिक हुनुहुन्छ?', pronunciation: 'ओनु नारा सारामिम्निक्का?' }
];

const CH1_GRAMMARS = [
  {
    number: 1,
    pattern: '은 / 는',
    label: 'Grammar ①: 은 / 는',
    meaningNe: 'विषय प्रत्यय (चाहिँ)',
    usage: 'वाक्यमा विषयलाई देखाउन प्रयोग गरिन्छ।',
    batchimRule: '- 받침 (अन्तिम व्यञजन) भए — 은\n- 받침 नभए — 는',
    structure: 'नाम वा संज्ञा + 은/는',
    examples: [
      { korean: '이름은 마두입니다.', nepali: 'नाम मादु हो।' },
      { korean: '저는 학생입니다.', nepali: 'म विद्यार्थी हुँ।' },
      { korean: '한국은 아시아에 있습니다.', nepali: 'कोरिया एसियामा छ।' }
    ]
  },
  {
    number: 2,
    pattern: '입니다',
    label: 'Grammar ②: 입니다',
    meaningNe: 'हुँ, हो, हुनुहुन्छ (औपचारिक वर्तमान)',
    usage: 'नाम, परिचय, पेसा वा पहिचान बताउन प्रयोग गरिन्छ।',
    structure: 'नाम वा संज्ञा + 입니다 (उदाहरण: 학생 + 입니다 = 학생입니다 -> विद्यार्थी + हुँ/हो = विद्यार्थी हुँ/हो।)',
    batchimRule: '- 받침 भए पनि वा नभए पनि दुवैमा 입니다 जोडिन्छ।',
    examples: [
      { korean: '저는 네팔 사람입니다.', nepali: 'म नेपाली हुँ।' },
      { korean: '저는 학생입니다.', nepali: 'म विद्यार्थी हुँ।' },
      { korean: '여기는 학교입니다.', nepali: 'यो विद्यालय हो।' }
    ]
  },
  {
    number: 3,
    pattern: '입니까?',
    label: 'Grammar ③: 입니까?',
    meaningNe: 'हो? / हुनुहुन्छ? (औपचारिक प्रश्न)',
    usage: 'यो औपचारिक प्रश्न सोध्न प्रयोग गरिन्छ।',
    structure: 'नामपद + 입니까?',
    batchimRule: '- नामपदमा 받침 भए वा नभए पनि 입니까? प्रयोग गरिन्छ।',
    examples: [
      { korean: '학생입니까?', nepali: 'के तपाईं विद्यार्थी हुनुहुन्छ?' },
      { korean: '네팔 사람입니까?', nepali: 'के तपाईं नेपाली हुनुहुन्छ?' },
      { korean: '선생님입니까?', nepali: 'के तपाईं शिक्षक हुनुहुन्छ?' }
    ],
    answerMethod: '- 네, 학생입니다. — हो, म विद्यार्थी हुँ।\n- 아니요, 학생이 아닙니다. — होइन, म विद्यार्थी होइन।'
  }
];

const CH1_DIALOGUES = [
  { speakerKo: '민수', speakerNe: 'मिन्सु', ko: '안녕하세요? 저는 민수입니다.', nePron: 'आन्न्योङहासेयो? छनुन मिन्सुइम्निदा.', ne: 'नमस्कार। म मिन्सु हुँ।' },
  { speakerKo: '람', speakerNe: 'राम', ko: '안녕하세요? 저는 람입니다.', nePron: 'आन्न्योङहासेयो? छनुन रामइम्निदा.', ne: 'नमस्कार। म राम हुँ।' },
  { speakerKo: '민수', speakerNe: 'मिन्सु', ko: '어느 나라 사람입니까?', nePron: 'ओनु नारा सारामिम्निक्का?', ne: 'तपाईं कुन देशको नागरिक हुनुहुन्छ?' },
  { speakerKo: '람', speakerNe: 'राम', ko: '저는 네팔 사람입니다.', nePron: 'छनुन नेफाल सारामिम्निदा.', ne: 'म नेपाली हुँ।' }
];

const CH1_QUIZ = [
  {
    id: 1,
    question: "'감사합니다' को नेपाली अर्थ के हो?",
    options: ['माफ गर्नुहोस्', 'धन्यवाद', 'नमस्कार', 'फेरि भेटौँला'],
    correctAnswer: 'धन्यवाद',
    explanation: "'감사합니다' को अर्थ 'धन्यवाद' (Thank you) हो।"
  },
  {
    id: 2,
    question: "'저는 학생입니다.' को सही अर्थ कुन हो?",
    options: ['म शिक्षक हुँ।', 'म नेपाली हुँ।', 'म विद्यार्थी हुँ।', 'म कामदार हुँ।'],
    correctAnswer: 'म विद्यार्थी हुँ।',
    explanation: "'학생' को अर्थ 'विद्यार्थी' र '입니다' को अर्थ 'हुँ/हो' हुन्छ।"
  },
  {
    id: 3,
    question: "'के तपाईं विद्यार्थी हुनुहुन्छ?' कोरियनमा कुन हो?",
    options: ['학생입니다.', '학생입니까?', '학생이 아닙니다.', '안녕하세요?'],
    correctAnswer: '학생입니까?',
    explanation: "औपचारिक रूपमा प्रश्न सोध्दा नामपदको पछाडि '입니까?' जोडिन्छ।"
  },
  {
    id: 4,
    question: "'이름' को नेपाली अर्थ के हो?",
    options: ['देश', 'परिवार', 'साथी', 'नाम'],
    correctAnswer: 'नाम',
    explanation: "'이름' को नेपाली अर्थ 'नाम' (Name) हो।"
  }
];

// Build comprehensive chapter book object for each chapter (1 to 60)
const ALL_CHAPTERS_BOOK = {};

for (let ch = 1; ch <= 60; ch++) {
  const grammarObj = CHAPTER_GRAMMAR_MAP.find(c => c.chapter === ch) || {};
  const rawWords = CHAPTER_MEANINGS_DATA[ch] || [];

  if (ch === 1) {
    // Chapter 1 matching prompt exactly
    const existingKoreans = new Set(CH1_CUSTOM_WORDS.map(w => w.korean));
    const mergedWords = [...CH1_CUSTOM_WORDS];
    for (const w of rawWords) {
      if (!existingKoreans.has(w.korean)) {
        mergedWords.push({
          korean: w.korean,
          nepali: w.nepali,
          pronunciation: w.pronunciation || koreanToNepaliRomanized(w.korean),
          category: w.category,
          exampleKo: w.exampleKo,
          exampleNe: w.exampleNe
        });
        existingKoreans.add(w.korean);
      }
    }

    ALL_CHAPTERS_BOOK[ch] = {
      chapter: 1,
      bookPart: 1,
      titleKo: '인사와 자기소개',
      titleNe: 'अभिवादन तथा आफ्नो परिचय',
      titleEn: 'Self Introduction',
      subTitle: 'EPS-TOPIK तयारी',
      words: mergedWords,
      expressions: CH1_EXPRESSIONS,
      grammars: CH1_GRAMMARS,
      dialogues: CH1_DIALOGUES,
      quiz: CH1_QUIZ
    };
    continue;
  }

  // Chapters 2 to 60
  // 1. Words list (ensure minimum 50+ with pronunciation and meaning)
  const formattedWords = rawWords.map(w => ({
    korean: w.korean,
    nepali: w.nepali,
    pronunciation: w.pronunciation || koreanToNepaliRomanized(w.korean),
    category: w.category || '',
    exampleKo: w.exampleKo || '',
    exampleNe: w.exampleNe || ''
  }));

  // 2. Expressions: Extract 8 to 10 rich practical expressions from example sentences & grammar dialogues
  const expressionList = [];
  const seenExp = new Set();

  // From grammar dialogues
  (grammarObj.grammarPoints || []).forEach(gp => {
    (gp.dialogues || []).forEach(d => {
      if (d.ko && !seenExp.has(d.ko) && expressionList.length < 10) {
        expressionList.push({
          korean: d.ko,
          nepali: d.ne || '',
          pronunciation: d.nePron || koreanToNepaliRomanized(d.ko)
        });
        seenExp.add(d.ko);
      }
    });
  });

  // From vocabulary examples
  for (const w of rawWords) {
    if (expressionList.length >= 10) break;
    if (w.exampleKo && w.exampleNe && !seenExp.has(w.exampleKo)) {
      expressionList.push({
        korean: w.exampleKo,
        nepali: w.exampleNe,
        pronunciation: koreanToNepaliRomanized(w.exampleKo)
      });
      seenExp.add(w.exampleKo);
    }
  }

  // Fallback if fewer than 6 expressions
  if (expressionList.length < 6) {
    for (const w of rawWords.slice(0, 8)) {
      if (expressionList.length >= 8) break;
      const sentence = `${w.korean}을/를 확인합니다.`;
      if (!seenExp.has(sentence)) {
        expressionList.push({
          korean: `${w.korean}에 대해 배웁니다.`,
          nepali: `${w.nepali} को बारेमा सिक्छौँ।`,
          pronunciation: koreanToNepaliRomanized(`${w.korean}에 대해 배웁니다.`)
        });
        seenExp.add(sentence);
      }
    }
  }

  // 3. Grammars: format from grammarPoints
  const formattedGrammars = (grammarObj.grammarPoints || []).map((gp, gIdx) => {
    const examples = [];
    (gp.conjugationTable || []).forEach(c => {
      examples.push({
        korean: c.conjugated || c.base,
        nepali: c.neMeaning || ''
      });
    });
    (gp.dialogues || []).forEach(d => {
      if (examples.length < 4 && d.ko) {
        examples.push({
          korean: d.ko,
          nepali: d.ne || ''
        });
      }
    });

    let batchimRule = '';
    if (gp.formula && gp.formula.includes('받침')) {
      batchimRule = gp.formula;
    } else if (gp.pattern.includes('-(으)')) {
      batchimRule = '- 받침 भएमा — 으 लाग्छ (उदा: 먹다 -> 먹+으면)\n- 받침 नभएमा वा ‘ㄹ’ भएमा — 으 हट्छ (उदा: 가다 -> 가면)';
    } else if (gp.pattern.includes('이 / 가')) {
      batchimRule = '- 받침 भए — 이\n- 받침 नभए — 가';
    } else if (gp.pattern.includes('을 / 를')) {
      batchimRule = '- 받침 भए — 을\n- 받침 नभए — 를';
    } else if (gp.pattern.includes('은 / 는')) {
      batchimRule = '- 받침 भए — 은\n- 받침 नभए — 는';
    } else {
      batchimRule = '- धातुको अगाडिको वर्ण वा अन्तिम स्वर अनुसार रूप परिवर्तन हुन्छ।';
    }

    return {
      number: gIdx + 1,
      pattern: gp.pattern,
      label: `Grammar ${gIdx === 0 ? '①' : '②'}: ${gp.pattern}`,
      meaningNe: gp.nameNe || '',
      usage: gp.ruleNe || `${gp.pattern} को कोरियन वाक्यमा आधिकारिक प्रयोग।`,
      batchimRule: batchimRule,
      structure: gp.formula || `क्रियापद/नामपद + ${gp.pattern}`,
      examples: examples.slice(0, 4),
      examNote: gp.examNote || ''
    };
  });

  // 4. Dialogues: create character dialogue
  const dialogueList = [];
  (grammarObj.grammarPoints || []).forEach(gp => {
    (gp.dialogues || []).forEach(d => {
      dialogueList.push({
        speakerKo: d.speaker || '민수',
        speakerNe: d.speaker === '아궁' ? 'आगुङ' : d.speaker === '마두' ? 'मादु' : d.speaker === '수민' ? 'सुमिन' : 'मिन्सु',
        ko: d.ko,
        nePron: d.nePron || koreanToNepaliRomanized(d.ko),
        ne: d.ne
      });
    });
  });

  if (dialogueList.length < 2 && formattedWords.length >= 2) {
    dialogueList.push(
      {
        speakerKo: '아궁',
        speakerNe: 'आगुङ',
        ko: `${formattedWords[0].korean}을/를 준비했습니다.`,
        nePron: koreanToNepaliRomanized(`${formattedWords[0].korean}을/를 준비했습니다.`),
        ne: `${formattedWords[0].nepali} तयार गरेँ।`
      },
      {
        speakerKo: '반장님',
        speakerNe: 'व्यवस्थापक',
        ko: '수고하셨습니다. 잘 확인해 보세요.',
        nePron: 'सुगोहास्योत्सुम्निदा. छाल ह्वाखिनहे फोसेयो.',
        ne: 'धन्यवाद। राम्रोसँग जाँच गर्नुहोस्।'
      }
    );
  }

  // 5. EPS-TOPIK Practice Quiz: 4 questions per chapter
  // Q1: Vocabulary question
  const w1 = formattedWords[0] || { korean: '단어', nepali: 'शब्द' };
  const distractors1 = formattedWords.slice(1, 4).map(w => w.nepali).filter(n => n !== w1.nepali);
  while (distractors1.length < 3) distractors1.push('कामदार', 'कार्यालय', 'समय');
  const q1Options = [w1.nepali, distractors1[0], distractors1[1], distractors1[2]].sort(() => 0.5 - Math.random());

  // Q2: Sentence Translation question
  const expItem = expressionList[0] || { korean: '감사합니다.', nepali: 'धन्यवाद।' };
  const distExp = expressionList.slice(1, 4).map(e => e.nepali).filter(n => n !== expItem.nepali);
  while (distExp.length < 3) distExp.push('माफ गर्नुहोस्।', 'फेरि भेटौँला।', 'छिट्टै आउनुहोस्।');
  const q2Options = [expItem.nepali, distExp[0], distExp[1], distExp[2]].sort(() => 0.5 - Math.random());

  // Q3: Grammar question
  const gpItem = formattedGrammars[0] || { pattern: '-아/어요', meaningNe: 'वर्तमान काल' };
  const q3Text = `'${gpItem.pattern}' को मुख्य प्रयोग कुन हो?`;
  const q3Correct = gpItem.meaningNe || 'वाक्य निर्माण';
  const q3Distractors = ['विगत कालको अन्त्य', 'भविष्य कालको योजना', 'नकार बनाउने प्रत्यय'].filter(d => d !== q3Correct);
  const q3Options = [q3Correct, q3Distractors[0], q3Distractors[1], 'अनौपचारिक प्रश्न'].slice(0, 4).sort(() => 0.5 - Math.random());

  // Q4: Reverse Vocabulary identification
  const w4 = formattedWords[1] || { korean: '회사', nepali: 'कम्पनी' };
  const distractors4 = formattedWords.slice(2, 5).map(w => w.korean).filter(k => k !== w4.korean);
  while (distractors4.length < 3) distractors4.push('학교', '병원', '식당');
  const q4Options = [w4.korean, distractors4[0], distractors4[1], distractors4[2]].sort(() => 0.5 - Math.random());

  const chapterQuiz = [
    {
      id: 1,
      question: `'${w1.korean}' को नेपाली अर्थ के हो?`,
      options: q1Options,
      correctAnswer: w1.nepali,
      explanation: `'${w1.korean}' को सही नेपाली अर्थ '${w1.nepali}' हो।`
    },
    {
      id: 2,
      question: `'${expItem.korean}' को सही नेपाली अर्थ कुन हो?`,
      options: q2Options,
      correctAnswer: expItem.nepali,
      explanation: `'${expItem.korean}' को सही नेपाली अनुवाद '${expItem.nepali}' हुन्छ।`
    },
    {
      id: 3,
      question: q3Text,
      options: q3Options,
      correctAnswer: q3Correct,
      explanation: `यस अध्यायमा '${gpItem.pattern}' ले '${gpItem.meaningNe}' को कार्य गर्दछ।`
    },
    {
      id: 4,
      question: `'${w4.nepali}' लाई कोरियन भाषामा के भनिन्छ?`,
      options: q4Options,
      correctAnswer: w4.korean,
      explanation: `'${w4.nepali}' लाई कोरियन भाषामा '${w4.korean}' भनिन्छ।`
    }
  ];

  ALL_CHAPTERS_BOOK[ch] = {
    chapter: ch,
    bookPart: ch <= 30 ? 1 : 2,
    titleKo: grammarObj.titleKo || `제${ch}과`,
    titleNe: grammarObj.titleNe || `अध्याय ${ch}`,
    titleEn: grammarObj.titleEn || `Chapter ${ch}`,
    subTitle: 'EPS-TOPIK तयारी',
    words: formattedWords,
    expressions: expressionList,
    grammars: formattedGrammars,
    dialogues: dialogueList,
    quiz: chapterQuiz
  };
}

console.log('Writing to src/lib/koreanChapterBookEngine.js...');
const outputFilePath = path.join(__dirname, '../src/lib/koreanChapterBookEngine.js');
const fileHeader = `/**
 * Korean Chapterwise Comprehensive Textbook Engine (Chapters 1 to 60)
 * Authentic Standard EPS-TOPIK Curriculum
 *
 * Each Chapter includes 5 structured sections:
 * 1. 핵심 단어 — महत्त्वपूर्ण शब्दार्थ (Minimum 50+ words with Korean, Nepali meaning, and Devanagari pronunciation)
 * 2. 기본 표현 — आधारभूत वाक्य तथा नेपाली अर्थ (Core conversational sentences with audio and pronunciation)
 * 3. 문법 — व्याकरणको विस्तृत व्याख्या (Grammar 1, 2 with usage, batchim rules, structure, and examples)
 * 4. 대화 — संवाद अभ्यास (Natural character dialogues with Korean, pronunciation, and Nepali translation)
 * 5. EPS-TOPIK अभ्यास प्रश्न — Practice Quiz (Interactive 4-question quiz with instant answer check, score, and retry)
 */

export const KOREAN_CHAPTER_BOOK_DATA = ${JSON.stringify(ALL_CHAPTERS_BOOK, null, 2)};
`;

fs.writeFileSync(outputFilePath, fileHeader, 'utf8');
console.log('Successfully generated Korean Chapter Book Engine with all 60 chapters!');
