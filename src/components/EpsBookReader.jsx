'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  loadEps60Chapters,
  saveEps60Chapters,
  fetchServerEpsChapters,
  syncChapterToServer
} from "@/lib/epsBookData";
import {
  autoSaveChapterOffline,
  getCachedBlobSync,
  getCachedFileBlob,
  preloadAllCachedBlobs,
  getAllOfflineChaptersStatus,
  isChapterOfflineReadySync
} from "@/lib/offlineBookStorage";
import JapanesePronunciationGuide from "@/components/JapanesePronunciationGuide";
import { KANJI_1000_LIST } from "@/lib/kanji1000Data";
import JlptMockExamModal from "@/components/JlptMockExamModal";
import { JLPT_MOCK_SETS_META, getMockExamSetById } from "@/data/jlptMockTestData";
import KoreanMeaningBookView from "@/components/KoreanMeaningBookView";
import KoreanGrammarBookView from "@/components/KoreanGrammarBookView";

// In-memory thumbnail cache across renders
const pdfCoverMemoryCache = new Map();

/**
 * ChapterCover Component
 * Renders the uploaded chapter PDF's first page preview (or custom cover photo, or styled Korean textbook fallback)
 */
function ChapterCover({
  chapter,
  titleKo,
  titleNe,
  pdfUrl,
  coverImage,
  bookPart = 1,
  height = "195px",
  margin = "10px 0 12px 0",
  onClick
}) {
  const chStr = chapter < 10 ? `0${chapter}` : `${chapter}`;
  const defaultStaticCover = `/uploads/eps-chapters/covers/cover_${chStr}.jpg`;
  const initialThumb = coverImage || defaultStaticCover;

  const [thumbUrl, setThumbUrl] = useState(initialThumb);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (coverImage) {
      setThumbUrl(coverImage);
    } else {
      setThumbUrl(`/uploads/eps-chapters/covers/cover_${chStr}.jpg`);
    }
  }, [coverImage, chStr]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Open Chapter ${chapter}: ${titleKo}`}
      style={{
        margin: margin,
        height: height,
        backgroundColor: bookPart === 2 ? "#fffbeb" : "#f0f9ff",
        borderRadius: "10px",
        border: isHovered ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: isHovered ? "0 8px 20px rgba(2, 132, 199, 0.16)" : "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "none",
        userSelect: "none"
      }}
    >
      {/* 1. RENDERED FIRST PAGE THUMBNAIL (INSTANT IMAGE) - FULL BOX */}
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={`Chapter ${chapter} Cover`}
          loading="eager"
          decoding="async"
          onError={() => setThumbUrl(null)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
            transition: "transform 0.25s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }}
        />
      ) : (
        /* 2. ELEGANT TEXTBOOK BOOK COVER PLACEHOLDER (FULL BOX) */
        <div style={{
          width: "100%",
          height: "100%",
          background: bookPart === 2
            ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
            : "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "16px 14px",
          boxSizing: "border-box",
          position: "relative",
          textAlign: "center"
        }}>
          {/* Book Spine Line */}
          <div style={{
            position: "absolute",
            left: "10px",
            top: 0,
            bottom: 0,
            width: "3px",
            backgroundColor: bookPart === 2 ? "#d97706" : "#2563eb",
            opacity: 0.35
          }} />

          <div style={{ paddingLeft: "8px" }}>
            <div style={{
              fontSize: "10px",
              fontWeight: "900",
              color: bookPart === 2 ? "#b45309" : "#1d4ed8",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              EPS-TOPIK
            </div>
            <div style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#334155",
              marginTop: "2px"
            }}>
              Book {chapter <= 30 ? "1" : "2"}
            </div>
          </div>

          <div style={{ padding: "0 10px" }}>
            <span style={{ fontSize: "28px", display: "block", marginBottom: "4px" }}>📖</span>
            <div style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#0f172a",
              lineHeight: "1.3",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            }}>
              {titleKo}
            </div>
          </div>

          <div style={{ paddingLeft: "8px" }}>
            <span style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: bookPart === 2 ? "#92400e" : "#1e40af",
              backgroundColor: "rgba(255,255,255,0.7)",
              padding: "3px 10px",
              borderRadius: "12px",
              display: "inline-block"
            }}>
              제 {chapter} 과
            </span>
          </div>
        </div>
      )}

      {/* HOVER OVERLAY */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(1px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        color: "white",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.15s ease",
        zIndex: 3
      }}>
        <div style={{
          backgroundColor: "#0284c7",
          color: "white",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          ▶
        </div>
        <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.3px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          Full Screen मा हेर्नुहोस्
        </span>
      </div>
    </div>
  );
}

/**
 * JapaneseChapterCover Component
 * Renders an elegant Japanese textbook cover mockup matching the Korean ChapterCover visual language.
 */
function JapaneseChapterCover({
  lessonNumber,
  titleJp,
  titleNe,
  level = "N5",
  height = "195px",
  margin = "10px 0 12px 0",
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isN5 = level === "N5" || (typeof lessonNumber === "number" && lessonNumber <= 25);
  const lesStr = typeof lessonNumber === "number" && lessonNumber < 10 ? `0${lessonNumber}` : `${lessonNumber}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Open Lesson ${lesStr}: ${titleJp || ''}`}
      style={{
        margin: margin,
        height: height,
        borderRadius: "10px",
        border: isHovered ? (isN5 ? "1.5px solid #7c3aed" : "1.5px solid #e11d48") : "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: isHovered
          ? (isN5 ? "0 8px 20px rgba(124, 58, 237, 0.18)" : "0 8px 20px rgba(225, 29, 72, 0.18)")
          : "0 2px 6px rgba(0,0,0,0.03)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "none",
        userSelect: "none"
      }}
    >
      {/* ELEGANT TEXTBOOK BOOK COVER PLACEHOLDER */}
      <div style={{
        width: "100%",
        height: "100%",
        background: isN5
          ? "linear-gradient(135deg, #faf5ff 0%, #ede9fe 50%, #ddd6fe 100%)"
          : "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 14px",
        boxSizing: "border-box",
        position: "relative",
        textAlign: "center"
      }}>
        {/* Book Spine Line */}
        <div style={{
          position: "absolute",
          left: "10px",
          top: 0,
          bottom: 0,
          width: "3px",
          backgroundColor: isN5 ? "#7c3aed" : "#e11d48",
          opacity: 0.4
        }} />

        <div style={{ paddingLeft: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{
            fontSize: "10px",
            fontWeight: "900",
            color: isN5 ? "#6d28d9" : "#be123c",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            みんなの日本語
          </div>
          <span style={{
            fontSize: "10px",
            fontWeight: "800",
            color: isN5 ? "#5b21b6" : "#9f1239",
            backgroundColor: isN5 ? "rgba(124, 58, 237, 0.14)" : "rgba(225, 29, 72, 0.14)",
            padding: "2px 7px",
            borderRadius: "6px"
          }}>
            JLPT {isN5 ? "N5" : "N4"}
          </span>
        </div>

        <div style={{ padding: "0 10px" }}>
          <span style={{ fontSize: "28px", display: "block", marginBottom: "4px" }}>
            {isN5 ? "🌸" : "⛩️"}
          </span>
          <div style={{
            fontSize: "20px",
            fontWeight: "900",
            color: "#0f172a",
            letterSpacing: "0.5px"
          }}>
            第{lesStr}課
          </div>
          <div style={{
            fontSize: "12px",
            fontWeight: "700",
            color: isN5 ? "#6d28d9" : "#be123c",
            marginTop: "3px"
          }}>
            Lesson {lesStr}
          </div>
        </div>

        <div style={{ paddingLeft: "8px" }}>
          <div style={{
            fontSize: "12px",
            fontWeight: "800",
            color: "#1e293b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {titleJp || `Lesson ${lesStr}`}
          </div>
          {titleNe && (
            <div style={{
              fontSize: "11px",
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: "2px"
            }}>
              {titleNe}
            </div>
          )}
        </div>
      </div>

      {/* HOVER OVERLAY */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(1px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        color: "white",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.15s ease",
        zIndex: 3
      }}>
        <div style={{
          backgroundColor: isN5 ? "#7c3aed" : "#e11d48",
          color: "white",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          ▶
        </div>
        <span style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.3px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          Full Screen मा हेर्नुहोस्
        </span>
      </div>
    </div>
  );
}

// ── Japanese Study Materials Datasets ─────────────────────────────────────────
export const MINNA_NO_NIHONGO_LESSONS = [
  { lesson: 1, book: 1, titleJp: "わたしはマイク・ミラーです", titleEn: "Introduction & Self-Introduction", titleNe: "आत्म-परिचय र नाम", grammar: "N1 は N2 です / じゃありません / ですか", vocabCount: 35 },
  { lesson: 2, book: 1, titleJp: "これは本です", titleEn: "Demonstratives (This, That)", titleNe: "यो, त्यो, उ त्यो (वस्तुहरू)", grammar: "これ / それ / あれ / このN / そのN", vocabCount: 38 },
  { lesson: 3, book: 1, titleJp: "ここが教室です", titleEn: "Places & Directions", titleNe: "ठाउँहरू र दिशाहरू", grammar: "ここ / そこ / あそこ / どこ / こちら", vocabCount: 42 },
  { lesson: 4, book: 1, titleJp: "今、何時ですか", titleEn: "Time, Days & Daily Routine", titleNe: "समय, दिनहरू र दैनिक तालिका", grammar: "〜時〜分 / 〜から〜まで / Vます / Vました", vocabCount: 45 },
  { lesson: 5, book: 1, titleJp: "京都へ行きます", titleEn: "Transportation & Going Places", titleNe: "यात्रा र यातायातका साधन", grammar: "N(स्थान) へ 行きます/来ます/帰ります / N(साधन) で", vocabCount: 40 },
  { lesson: 6, book: 1, titleJp: "パンを食べます", titleEn: "Transitive Actions & Dining", titleNe: "खाना, पिउने र क्रियाकलापहरू", grammar: "N を Vます / N で Vます / 一緒に Vませんか", vocabCount: 44 },
  { lesson: 7, book: 1, titleJp: "スプーンで食べます", titleEn: "Tools, Giving & Receiving", titleNe: "उपकरणहरू र उपहार लेनदेन", grammar: "N(साधन) で V / N1 に N2 を あげます / もらいます", vocabCount: 42 },
  { lesson: 8, book: 1, titleJp: "富士山は高いです", titleEn: "Adjectives (い & な)", titleNe: "विशेषणहरू (राम्रो, अग्लो, सफा)", grammar: "い-विशेषण / な-विशेषण / とても / あまり", vocabCount: 46 },
  { lesson: 9, book: 1, titleJp: "日本語が分かります", titleEn: "Preferences, Skills & Abilities", titleNe: "मनपर्ने, सीप र क्षमता", grammar: "N が 好き/嫌い/上手/下手 / N が あります/分かります", vocabCount: 40 },
  { lesson: 10, book: 1, titleJp: "机の上に猫がいます", titleEn: "Existence of People & Things", titleNe: "मानिस र वस्तुको उपस्थिति", grammar: "N が あります (निर्जीव) / N が います (सजीव)", vocabCount: 45 },
  { lesson: 11, book: 1, titleJp: "リンゴを四つ買いました", titleEn: "Counters & Quantifiers", titleNe: "संख्या र गन्तीहरू", grammar: "ひとつ、ふたつ / 〜人 / 〜枚 / 〜台 / どのくらい", vocabCount: 48 },
  { lesson: 12, book: 1, titleJp: "京都は奈良より静かです", titleEn: "Comparisons & Superlatives", titleNe: "तुलना र उत्कृष्ट छनोट", grammar: "N1 は N2 より Adj / N1 と N2 と どちらが", vocabCount: 42 },
  { lesson: 13, book: 1, titleJp: "車が欲しいです", titleEn: "Desires & Purposes of Motion", titleNe: "इच्छा, चाहना र उद्देश्य", grammar: "N が 欲しいです / Vたいです / N(स्थान) へ Vに行きます", vocabCount: 40 },
  { lesson: 14, book: 1, titleJp: "ちょっと待ってください", titleEn: "Te-Form: Requests & Present Continuous", titleNe: "ते-फर्म: अनुरोध र हाल भइरहेको कार्य", grammar: "Vてください / Vましょうか / 今 Vています", vocabCount: 46 },
  { lesson: 15, book: 1, titleJp: "写真を撮ってもいいです", titleEn: "Permissions & Prohibitions", titleNe: "अनुमति र निषेध", grammar: "Vてもいいです / Vてはいけません / Vています", vocabCount: 44 },
  { lesson: 16, book: 1, titleJp: "朝起きて、ジョギングをします", titleEn: "Sequential Actions & Connecting Adj", titleNe: "क्रमबद्ध कार्यहरू", grammar: "Vて、Vて、〜 / い→くて / な→で / Vてから", vocabCount: 45 },
  { lesson: 17, book: 1, titleJp: "写真を撮らないでください", titleEn: "Nai-Form: Negative Requests & Obligations", titleNe: "नाइ-फर्म: नगर्नुहोस् र गर्नैपर्ने नियम", grammar: "Vないでください / Vなければなりません / Vなくてもいいです", vocabCount: 46 },
  { lesson: 18, book: 1, titleJp: "ピアノを弾くことができます", titleEn: "Dictionary Form: Hobbies & Capabilities", titleNe: "क्षमता र रुचि (हबी)", grammar: "V(辞書形) ことができます / 趣味は Vことです", vocabCount: 44 },
  { lesson: 19, book: 1, titleJp: "相撲を見たことがあります", titleEn: "Ta-Form: Past Experience & Alternating Actions", titleNe: "विगतको अनुभव", grammar: "Vたことがあります / Vたり、Vたりします / に なります", vocabCount: 42 },
  { lesson: 20, book: 1, titleJp: "一緒に行かない？", titleEn: "Casual Plain Speech (Conversational)", titleNe: "अनौपचारिक बोलीचाली (साधारण शैली)", grammar: "Plain Form (辞書形・ない形・た形) / うん・ううん", vocabCount: 40 },
  { lesson: 21, book: 1, titleJp: "明日は雨が降ると思います", titleEn: "Opinions, Predictions & Quotations", titleNe: "राय, विचार र भनाइहरू", grammar: "〜と 思います / 〜と 言いました / 〜でしょう", vocabCount: 44 },
  { lesson: 22, book: 1, titleJp: "眼鏡をかけている人", titleEn: "Noun Modification (Relative Clauses)", titleNe: "नाम संशोधन (वर्णनात्मक वाक्य)", grammar: "Clause(Plain Form) + Noun / 帽子を かぶる", vocabCount: 42 },
  { lesson: 23, book: 1, titleJp: "図書館へ行くとき、", titleEn: "Conditionals with と & Time with とき", titleNe: "समय (जब) र प्राकृतिक परिणाम", grammar: "V(辞書形/た形) とき / V(辞書形) と、〜", vocabCount: 42 },
  { lesson: 24, book: 1, titleJp: "父が時計をくれました", titleEn: "Favors: Giving & Receiving", titleNe: "सहयोग लेनदेन (मलाई दियो)", grammar: "くれます / Vてあげます / Vてもらいます / Vてくれます", vocabCount: 45 },
  { lesson: 25, book: 1, titleJp: "雨が降ったら、行きません", titleEn: "Conditionals with たら & ても", titleNe: "सर्त (यदि भयो भने / भए तापनि)", grammar: "〜たら (यदि/भने) / 〜ても (भए तापनि)", vocabCount: 46 },
  { lesson: 26, book: 2, titleJp: "どこで買ったんですか", titleEn: "Explanations with 〜んです", titleNe: "कारण र व्याख्या सोध्ने", grammar: "Plain Form + んです / んですが、〜てください", vocabCount: 42 },
  { lesson: 27, book: 2, titleJp: "日本語が話せます", titleEn: "Potential Form (Can Do)", titleNe: "सक्नु (क्षमता रूप)", grammar: "V(可能形) / 〜しか〜ない / が見えます・聞こえます", vocabCount: 45 },
  { lesson: 28, book: 2, titleJp: "音楽を聞きながら、勉強します", titleEn: "Simultaneous Actions (〜ながら) & Habitual", titleNe: "दुई काम एकसाथ गर्दा", grammar: "V1(ます形) ながら V2 / Vています / 〜し、〜し", vocabCount: 40 },
  { lesson: 29, book: 2, titleJp: "窓が開いています", titleEn: "Intransitive Verbs (Resulting State)", titleNe: "अकर्मक क्रिया (अवस्था)", grammar: "N が V(自動詞て形) います / Vてしまいました", vocabCount: 44 },
  { lesson: 30, book: 2, titleJp: "カレンダーが貼ってあります", titleEn: "Transitive State (〜てあります) & Preparation", titleNe: "उद्देश्यपूर्ण अवस्था र तयारी", grammar: "N が V(他動詞て形) あります / Vておきます (तयारी)", vocabCount: 42 },
  { lesson: 31, book: 2, titleJp: "料理を習おうと思っています", titleEn: "Volitional Form & Intentions", titleNe: "इच्छा र योजना", grammar: "V(意向形) / 〜と 思っています / 〜予定です", vocabCount: 40 },
  { lesson: 32, book: 2, titleJp: "運動したほうがいいです", titleEn: "Suggestions & Predictions (〜ほうがいい)", titleNe: "सुझाव र सम्भावना", grammar: "Vた/ない ほうがいいです / 〜でしょう / 〜かもしれません", vocabCount: 44 },
  { lesson: 33, book: 2, titleJp: "早く走れ！ (命令形・禁止形)", titleEn: "Imperative & Prohibitive Forms", titleNe: "आज्ञा र निषेध रूप", grammar: "V(命令形) / V(禁止形) / 〜という 意味です", vocabCount: 42 },
  { lesson: 34, book: 2, titleJp: "先生の言うとおりに、", titleEn: "Following Instructions & Sequential", titleNe: "सल्लाहअनुसार र पछि", grammar: "Vとおりに / Vた あとで / Vて/ないで", vocabCount: 40 },
  { lesson: 35, book: 2, titleJp: "ボタンを押せば、窓が開きます", titleEn: "Conditional Form (〜ば形)", titleNe: "बा-फर्म (सर्त)", grammar: "V(ば形) / なければ / 〜なら / 〜ば〜ほど", vocabCount: 42 },
  { lesson: 36, book: 2, titleJp: "早く起きるようにしています", titleEn: "Purposes & Effort (〜ように)", titleNe: "उद्देश्य र प्रयास", grammar: "Vように (उद्देश्य) / 〜ように なりました / ように しています", vocabCount: 44 },
  { lesson: 37, book: 2, titleJp: "犬に手をかまれました", titleEn: "Passive Form (〜られます)", titleNe: "कर्मवाच्य रूप (प्यासिभ)", grammar: "V(受身形) / N1 は N2 に Vられます / 被害受身", vocabCount: 45 },
  { lesson: 38, book: 2, titleJp: "本を読むのが好きです", titleEn: "Nominalization with の", titleNe: "क्रियालाई नाम बनाउने", grammar: "V(辞書形) のは Adj です / 〜のを 忘れました", vocabCount: 40 },
  { lesson: 39, book: 2, titleJp: "遅刻して、怒られました", titleEn: "Causes & Reasons (〜て/〜ので)", titleNe: "कारण र परिणाम", grammar: "Vて/なくて、〜 / N で (कारण) / 〜ので、〜", vocabCount: 42 },
  { lesson: 40, book: 2, titleJp: "試験に合格できるかどうか", titleEn: "Embedded Questions (〜かどうか)", titleNe: "गर्न सकिन्छ कि सकिँदैन", grammar: "Question word + か / 〜かどうか / Vてみます (प्रयास)", vocabCount: 42 },
  { lesson: 41, book: 2, titleJp: "息子にお菓子をやりました", titleEn: "Giving & Receiving (Respectful & Modest)", titleNe: "आदरार्थी लेनदेन", grammar: "やります / いただきます / くださいます / Vていただきます", vocabCount: 44 },
  { lesson: 42, book: 2, titleJp: "留学するために、貯金します", titleEn: "Purpose with ために & Uses", titleNe: "उद्देश्य (को लागि)", grammar: "V(辞書形) ために / N のために / 〜のに 使います", vocabCount: 42 },
  { lesson: 43, book: 2, titleJp: "雨が降りそうです", titleEn: "Apparent State (〜そうです)", titleNe: "हुने जस्तो देखिन्छ", grammar: "V(ます形) そうです / い/な そうです / Vて来ます", vocabCount: 40 },
  { lesson: 44, book: 2, titleJp: "食べすぎました", titleEn: "Excessive Actions (〜すぎます) & Ease/Difficulty", titleNe: "अत्यधिक र सजिलो/गाह्रो", grammar: "Vすぎます / Vやすい / Vにくい / 〜く/にします", vocabCount: 42 },
  { lesson: 45, book: 2, titleJp: "もし事故が起きた場合は、", titleEn: "Contingencies with 場合 & Concessives", titleNe: "यदि त्यस्तो अवस्था आएमा / गर्दा पनि", grammar: "〜場合は (अवस्थामा) / 〜のに (गरे तापनि)", vocabCount: 40 },
  { lesson: 46, book: 2, titleJp: "今、終わったところです", titleEn: "Aspect with ところ & Conviction with はず", titleNe: "भर्खरै सकियो / हुनैपर्छ", grammar: "Vところです / 〜た ばかりです / 〜はずです", vocabCount: 42 },
  { lesson: 47, book: 2, titleJp: "明日は雪が降るそうです", titleEn: "Hearsay with そうです & Conjectures", titleNe: "सुनेअनुसार र जस्तो छ", grammar: "Plain Form + そうです (सुनेअनुसार) / 〜ようです (अनुमान)", vocabCount: 42 },
  { lesson: 48, book: 2, titleJp: "息子に部屋を掃除させます", titleEn: "Causative Form (〜させます)", titleNe: "प्रेरणार्थक रूप (गराउनु)", grammar: "V(使役形 - させます) / 〜させて いただけませんか", vocabCount: 45 },
  { lesson: 49, book: 2, titleJp: "社長はお帰りになりました", titleEn: "Honorific Language (尊敬語 - Sonkeigo)", titleNe: "उच्च आदरार्थी भाषा (सोनकेइगो)", grammar: "お V(ます形) になります / 特別尊敬語", vocabCount: 46 },
  { lesson: 50, book: 2, titleJp: "私が参ります", titleEn: "Humble Language (謙譲語 - Kenjougo - Course Finale)", titleNe: "विनम्र आदरार्थी भाषा (केन्जौगो)", grammar: "お V(ます形) します / 特別謙譲語 (参ります、申します)", vocabCount: 48 }
];

export const JLPT_JFT_SETS = [
  { id: "jlpt-n5-01", level: "JLPT N5", title: "JLPT N5 Official Simulation Set 01", titleJp: "N5 実戦模擬試験 第1回", readingQs: 25, listeningQs: 20, timeMin: 50, desc: "Vocabulary, Grammar & Reading Comprehension with official exam scoring." },
  { id: "jlpt-n5-02", level: "JLPT N5", title: "JLPT N5 Official Simulation Set 02", titleJp: "N5 実戦模擬試験 第2回", readingQs: 25, listeningQs: 20, timeMin: 50, desc: "Full N5 practice set with authentic Tokyo audio listening section." },
  { id: "jlpt-n4-01", level: "JLPT N4", title: "JLPT N4 Comprehensive Simulation Set 01", titleJp: "N4 実戦模擬試験 第1回", readingQs: 28, listeningQs: 21, timeMin: 55, desc: "Intermediate Japanese grammar patterns, compound verbs & reading." },
  { id: "jlpt-n4-02", level: "JLPT N4", title: "JLPT N4 Comprehensive Simulation Set 02", titleJp: "N4 実戦模擬試験 第2回", readingQs: 28, listeningQs: 21, timeMin: 55, desc: "Full simulation covering daily Japanese dialogues and reading passages." },
  { id: "jlpt-n3-01", level: "JLPT N3", title: "JLPT N3 Bridge Exam Practice Set 01", titleJp: "N3 実戦模擬試験 第1回", readingQs: 30, listeningQs: 24, timeMin: 65, desc: "Advanced workplace Japanese, news headlines & rapid listening." },
  { id: "jft-basic-01", level: "JFT-Basic", title: "JFT-Basic Official CBT Simulation Set", titleJp: "国際交流基金 JFT-Basic 実戦模試", readingQs: 30, listeningQs: 25, timeMin: 60, desc: "Standard Japan Foundation Test for Specified Skilled Worker (SSW)." }
];

export const JAPANESE_FOLDERS = [
  {
    id: "jlpt-n5-n4",
    name: "JLPT N5・N4",
    subName: "Minna no Nihongo (50 Lessons)",
    badgeText: "N5 & N4",
    coverImage: "/images/books/jlpt-n5-n4-cover.jpg",
    description: "Minna no Nihongo 50 Lessons with Grammar & Audio (N5: Lessons 1–25, N4: Lessons 26–50)"
  },
  {
    id: "jlpt-n3-n2-n1",
    name: "JLPT N3・N2・N1",
    subName: "Soumatome N3 & Bridge Modules",
    badgeText: "N3, N2, N1",
    coverImage: "/images/books/jlpt-n3-n2-n1-cover.jpg",
    description: "JLPT N3 Soumatome Vocabulary & Choukai units, plus N2 & N1 Advanced Mastery"
  },
  {
    id: "kanji-meaning",
    name: "Kanji & Meaning",
    subName: "漢字マスター & Meaning",
    badgeText: "1,000 Kanji & Meaning",
    coverImage: "/images/books/kanji-meaning-cover.jpg",
    description: "1,000 Essential JLPT Kanji with Stroke Order, On/Kun Readings and Nepali & English Meanings"
  },
  {
    id: "jlpt-mock-test",
    name: "Mock Test",
    subName: "Mock Test",
    badgeText: "6 Exam Sets",
    coverImage: "/images/books/jlpt-mock-test-cover.jpg",
    description: "Full Simulated JLPT N5, N4, N3 & JFT-Basic CBT Exam Sets with Timers, Scoring & Audio"
  }
];

export const JAPANESE_FOLDER_THEMES = {
  "JLPT N5・N4": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  "JLPT N3・N2・N1": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  "Kanji & Meaning": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  "Mock Test": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  // Backward compatibility aliases
  "Minna no Nihongo": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  "Kanji Master 1000": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  "Japanese Grammar & Audio": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  },
  "JLPT & JFT Question Bank": {
    primary: "#7c3aed",
    activeBorder: "#8b5cf6",
    activeBg: "#faf5ff",
    activeShadow: "0 8px 24px rgba(124, 58, 237, 0.16)",
    titleActive: "#5b21b6",
    badgeActiveBg: "#7c3aed",
    badgeActiveColor: "#ffffff",
    badgeActiveBorder: "1px solid #7c3aed",
    badgeActiveShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
    badgeInactiveBg: "#f5f3ff",
    badgeInactiveColor: "#6d28d9",
    badgeInactiveBorder: "1px solid #ddd6fe",
    hoverBorder: "#c4b5fd"
  }
};

export const JLPT_N2_N1_MODULES = [
  {
    id: "n2-keigo",
    level: "N2",
    category: "Keigo Mastery (敬語)",
    titleJp: "実務敬語とビジネス会話",
    titleEn: "Business Keigo & Formal Conversation",
    titleNe: "व्यावसायिक आदरार्थी जापानी भाषा (केइगो)",
    desc: "Comprehensive guide to Sonkeigo (尊敬語), Kenjougo (謙譲語), and Teineigo (丁寧語) used in Japanese corporate workplaces.",
    grammar: "〜ていただく / 〜申し上げる / お・ご〜になる / お・ご〜する / 拝見する / 存じ上げる",
    itemsCount: "35 Expressions"
  },
  {
    id: "n2-grammar-core",
    level: "N2",
    category: "Core Grammar (文法)",
    titleJp: "N2 実戦重要文法パターン",
    titleEn: "Core JLPT N2 Grammar Patterns",
    titleNe: "N2 परीक्षाका मुख्य व्याकरण संरचनाहरू",
    desc: "Key intermediate grammar patterns essential for passing the JLPT N2 exam with natural nuance explanations.",
    grammar: "〜にともなって / 〜を契機に / 〜わりに(は) / 〜反面 / 〜げ / 〜つつある / 〜に基づいて",
    itemsCount: "48 Patterns"
  },
  {
    id: "n2-dokkai",
    level: "N2",
    category: "Reading Comprehension (読解)",
    titleJp: "論説文と中長文読解テクニック",
    titleEn: "Essay & Medium-Length Reading Passages",
    titleNe: "निबन्ध र मध्यम लामो पाठ पठन",
    desc: "Authentic N2 reading passages covering social topics, culture, technology, and workplace memos.",
    grammar: "筆者の主張 / 指示詞の指す内容 / 理由の把握 / 要約技術",
    itemsCount: "12 Passages"
  },
  {
    id: "n1-formal-discourse",
    level: "N1",
    category: "Formal Discourse (時事・論説)",
    titleJp: "時事日本語と論説文の構造",
    titleEn: "Current Affairs & Editorial Analysis",
    titleNe: "समसामयिक समाचार र सम्पादकीय विश्लेषण",
    desc: "Advanced Japanese newspaper editorials, academic discourse, and philosophical essays for JLPT N1.",
    grammar: "〜を皮切りに / 〜を余儀なくされる / 〜あっての / 〜が早いか / 〜や否や",
    itemsCount: "40 Topics"
  },
  {
    id: "n1-literary-expressions",
    level: "N1",
    category: "Classical & Literary (文語的表現)",
    titleJp: "最高峰文末表現と慣用連語",
    titleEn: "Archaic & Classical Nuance Patterns",
    titleNe: "उच्च स्तरका शास्त्रीय र साहित्यिक अभिव्यक्ति",
    desc: "Mastery of sophisticated literary forms, proverbs, and four-character idioms (四字熟語).",
    grammar: "〜まじき / 〜たるもの / 〜を禁じ得ない / 〜極まりない / 〜と相まって",
    itemsCount: "36 Patterns"
  },
  {
    id: "n1-executive-keigo",
    level: "N1",
    category: "Executive Business (最高級敬語)",
    titleJp: "最高級ビジネス交渉と公的対応",
    titleEn: "Executive Negotiation & Public Addressing",
    titleNe: "उच्चस्तरीय व्यापारिक वार्ता र औपचारिक सम्बोधन",
    desc: "Advanced protocol, press releases, client negotiations, and ceremonial Japanese.",
    grammar: "〜をお伝え申し上げます / ご高配を賜り / 恐縮の極み / 平素より格別の",
    itemsCount: "25 Protocols"
  }
];

export const JAPANESE_TOPIC_VOCABULARY = [
  {
    topic: "Greetings & Basics (あいさつ)",
    level: "N5",
    words: [
      { jp: "おはようございます", romaji: "ohayou gozaimasu", en: "Good morning (polite)", ne: "शुभ प्रभात (आदरार्थी)" },
      { jp: "こんにちは", romaji: "konnichiwa", en: "Hello / Good afternoon", ne: "नमस्ते / शुभ दिन" },
      { jp: "こんばんは", romaji: "konbanwa", en: "Good evening", ne: "शुभ सन्ध्या" },
      { jp: "ありがとうございます", romaji: "arigatou gozaimasu", en: "Thank you very much", ne: "धेरै धेरै धन्यवाद" },
      { jp: "すみません", romaji: "sumimasen", en: "Excuse me / I'm sorry", ne: "माफ गर्नुहोस् / सुन्नुहोस् त" },
      { jp: "さようなら", romaji: "sayounara", en: "Goodbye", ne: "बिदा / फेरि भेटौँला" },
      { jp: "はじめまして", romaji: "hajimemashite", en: "Nice to meet you", ne: "तपाईंलाई भेटेर खुसी लाग्यो" },
      { jp: "よろしくお願いします", romaji: "yoroshiku onegaishimasu", en: "Please treat me well", ne: "कृपया सहयोग गरिदिनुहोला" }
    ]
  },
  {
    topic: "Workplace & Safety (職場・安全作業)",
    level: "N4",
    words: [
      { jp: "作業 (さぎょう)", romaji: "sagyou", en: "Work / Operation", ne: "काम / सञ्चालन" },
      { jp: "安全 (あんぜん)", romaji: "anzen", en: "Safety / Secure", ne: "सुरक्षा / सुरक्षित" },
      { jp: "注意 (ちゅうい)", romaji: "chuui", en: "Caution / Warning", ne: "सावधानी / ध्यान" },
      { jp: "道具 (どうぐ)", romaji: "dougu", en: "Tools / Equipment", ne: "औजार / उपकरण" },
      { jp: "点検 (てんけん)", romaji: "tenken", en: "Inspection / Check", ne: "निरीक्षण / जाँच" },
      { jp: "故障 (こしょう)", romaji: "koshou", en: "Breakdown / Defect", ne: "बिग्रिएको / खराबी" },
      { jp: "指示 (しじ)", romaji: "shiji", en: "Instructions / Directions", ne: "निर्देशन / अह्राएको काम" },
      { jp: "報告 (ほうこく)", romaji: "houkoku", en: "Report (Hou-Ren-So)", ne: "प्रतिवेदन / जानकारी गराउनु" }
    ]
  },
  {
    topic: "Daily Life & Essentials (生活・買い物)",
    level: "N5",
    words: [
      { jp: "買い物 (かいもの)", romaji: "kaimono", en: "Shopping", ne: "किनमेल" },
      { jp: "値段 (ねだん)", romaji: "nedan", en: "Price / Cost", ne: "मूल्य / भाउ" },
      { jp: "店員 (てんいん)", romaji: "ten'in", en: "Store clerk", ne: "पसले / कर्मचारी" },
      { jp: "現金 (げんきん)", romaji: "genkin", en: "Cash", ne: "नगद पैसा" },
      { jp: "領収書 (りょうしゅうしょ)", romaji: "ryoushuusho", en: "Receipt", ne: "रसिद / बिल" },
      { jp: "割引 (わりびき)", romaji: "waribiki", en: "Discount", ne: "छुट (डिस्काउन्ट)" }
    ]
  },
  {
    topic: "Intermediate Business Terms (ビジネス用語)",
    level: "N3",
    words: [
      { jp: "担当 (たんとう)", romaji: "tantou", en: "Being in charge / Responsible", ne: "जिम्मेवारी / जिम्मा भएको" },
      { jp: "納期 (のうき)", romaji: "nouki", en: "Delivery date / Deadline", ne: "डेलिभरी मिति / म्याद" },
      { jp: "契約 (けいやく)", romaji: "keiyaku", en: "Contract / Agreement", ne: "सम्झौता / करार" },
      { jp: "打ち合わせ (うちあわせ)", romaji: "uchiawase", en: "Business meeting / Briefing", ne: "छलफल / पूर्व-बैठक" },
      { jp: "手配 (てはい)", romaji: "tehai", en: "Arrangement / Preparation", ne: "प्रबन्ध / व्यवस्था मिलाउनु" },
      { jp: "見積書 (みつもりしょ)", romaji: "mitsumorisho", en: "Estimate / Quotation", ne: "लागत अनुमान फारम (कोटेशन)" }
    ]
  }
];

export const JAPANESE_PARTICLES_GUIDE = [
  {
    particle: "は",
    romaji: "wa",
    meaningNe: "विषय सूचक (म / यो चाहिँ)",
    meaningEn: "Topic Marker (as for...)",
    usage: "वाक्यको मुख्य विषय (Topic) जनाउन नामपदको पछाडि प्रयोग गरिन्छ।",
    exampleJp: "わたしは ネパール人 です。",
    exampleRomaji: "Watashi wa Nepaaru-jin desu.",
    exampleNe: "म नेपाली हुँ।",
    exampleEn: "I am Nepali."
  },
  {
    particle: "が",
    romaji: "ga",
    meaningNe: "कर्ता / चाहना / सीप सूचक (लाई / ले)",
    meaningEn: "Subject / Ability / Preference Marker",
    usage: "विशेष कर्ता, सीप (上手/下手), मनपर्ने कुरा (好き/嫌い), वा उपस्थिति (あります/います) जनाउँछ।",
    exampleJp: "日本語が 分かります。",
    exampleRomaji: "Nihongo ga wakarimasu.",
    exampleNe: "म जापानी भाषा बुझ्छु।",
    exampleEn: "I understand Japanese."
  },
  {
    particle: "を",
    romaji: "o (wo)",
    meaningNe: "कर्म सूचक (लाई)",
    meaningEn: "Direct Object Marker",
    usage: "सकर्मक क्रिया (Transitive Verb) को प्रत्यक्ष कर्म (Object) पछाडि लाग्छ।",
    exampleJp: "ご飯を 食べます。",
    exampleRomaji: "Gohan o tabemasu.",
    exampleNe: "म खाना खान्छु।",
    exampleEn: "I eat meal / rice."
  },
  {
    particle: "に",
    romaji: "ni",
    meaningNe: "समय / गन्तव्य / भेट्ने व्यक्ति (मा / लाई)",
    meaningEn: "Specific Time / Destination / Indirect Object",
    usage: "तोकिएको समय (7時に), गन्तव्य (学校に), वा भेटिने व्यक्ति (友達に会います) जनाउँछ।",
    exampleJp: "毎朝 7時に 起きます。",
    exampleRomaji: "Maiasa shichi-ji ni okimasu.",
    exampleNe: "हरेक बिहान ७ बजे उठ्छु।",
    exampleEn: "I wake up at 7 o'clock every morning."
  },
  {
    particle: "で",
    romaji: "de",
    meaningNe: "स्थान (मा) / माध्यम वा साधन (ले / द्वारा)",
    meaningEn: "Place of Action / Means / By / With",
    usage: "कुनै काम गरिने ठाउँ (स्थान) वा यात्रा/खाना खाने साधन (बसले, चम्चाले) जनाउँछ।",
    exampleJp: "図書館で 勉強します。",
    exampleRomaji: "Toshokan de benkyou shimasu.",
    exampleNe: "पुस्तकालयमा पढ्छु।",
    exampleEn: "I study at the library."
  },
  {
    particle: "へ",
    romaji: "e (he)",
    meaningNe: "दिशा / तर्फ (तिर)",
    meaningEn: "Direction of Motion (towards)",
    usage: "चलमान क्रियाहरू (行きます, 来ます, 帰ります) सँग गन्तव्यको दिशा जनाउन प्रयोग गरिन्छ।",
    exampleJp: "来年 日本へ 行きます。",
    exampleRomaji: "Rainen Nihon e ikimasu.",
    exampleNe: "अर्को वर्ष जापान जान्छु।",
    exampleEn: "I will go to Japan next year."
  },
  {
    particle: "と",
    romaji: "to",
    meaningNe: "र (जोड्न) / सँग (साथीसँग)",
    meaningEn: "And (exhaustive) / Together With",
    usage: "दुई नामपदहरू जोड्न (A र B) वा कसैसँग मिलेर काम गर्दा लाग्छ।",
    exampleJp: "友達と 一緒に 映画を見ます。",
    exampleRomaji: "Tomodachi to issho ni eiga o mimasu.",
    exampleNe: "साथीसँग मिलेर चलचित्र हेर्छु।",
    exampleEn: "I watch a movie together with a friend."
  },
  {
    particle: "も",
    romaji: "mo",
    meaningNe: "पनि (समानता)",
    meaningEn: "Also / Too / As well",
    usage: "अघिल्लो कुरासँग समानता जनाउन 'は' वा 'を' को सट्टा 'も' प्रयोग गरिन्छ।",
    exampleJp: "わたしも 学生です。",
    exampleRomaji: "Watashi mo gakusei desu.",
    exampleNe: "म पनि विद्यार्थी हुँ।",
    exampleEn: "I am also a student."
  },
  {
    particle: "から",
    romaji: "kara",
    meaningNe: "बाट / देखि / किनभने",
    meaningEn: "From (time/place) / Because",
    usage: "सुरु हुने समय (९ बजेदेखि) वा स्थान जनाउन, अथवा वाक्यको कारण खुलाउन प्रयोग गरिन्छ।",
    exampleJp: "授業は 9時から 始まります。",
    exampleRomaji: "Jugyou wa kuji kara hajimarimasu.",
    exampleNe: "कक्षा ९ बजेदेखि सुरु हुन्छ।",
    exampleEn: "The class starts from 9 o'clock."
  },
  {
    particle: "まで",
    romaji: "made",
    meaningNe: "सम्म (अन्तिम सीमा)",
    meaningEn: "Until / Up to / As far as",
    usage: "अन्त्य हुने समय वा गन्तव्यको अन्तिम सीमा जनाउन प्रयोग गरिन्छ।",
    exampleJp: "会社は 5時まで です。",
    exampleRomaji: "Kaisha wa goji made desu.",
    exampleNe: "कम्पनी ५ बजेसम्म हो।",
    exampleEn: "Work is until 5 o'clock."
  }
];

export default function EpsBookReader({
  mode = "student",
  initialChapter = 1,
  studentPackage = "",
  purchasedPackages = [],
  onNavigateTab = null,
  instituteLanguage: propInstituteLanguage,
  initialFolder = null,
  onOpenEsewaModal = null,
  unlockedSets = [],
  pendingQueries = [],
  isPackageExpired = false,
  effectiveExpiryDate = null,
  activeStudentPackages = []
}) {
  const router = useRouter();
  const isInstitute = mode === "institute";
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null); // When set, enters Full-Screen View!
  const [bookFilter, setBookFilter] = useState("all"); // "all", "book1", "book2"
  const [searchQuery, setSearchQuery] = useState("");

  // Offline Auto-Save & Instant (0ms) PDF/Audio Open State
  const [offlineChaptersMap, setOfflineChaptersMap] = useState({});
  const [activePdfBlobUrl, setActivePdfBlobUrl] = useState("");
  const [cachedAudioUrls, setCachedAudioUrls] = useState({});
  const [isChapterSavingOffline, setIsChapterSavingOffline] = useState(false);

  // Full Screen Audio Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showTrackDropdown, setShowTrackDropdown] = useState(false);
  const [showBottomDropdown, setShowBottomDropdown] = useState(false);

  // Floating Popup Player State (Draggable, Minimizable, Removable)
  const [popupPos, setPopupPos] = useState({ x: 20, y: 20 });
  const [popupMode, setPopupMode] = useState("gesture"); // Default "gesture" (one-touch trigger) so chapter PDF opens in 100% clean full screen
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 20, initialY: 20, moved: false });
  const popupContainerRef = useRef(null);

  // Movable Mini Circular AUDIO Button State (Default below Back button: x: 14, y: 58)
  const [miniAudioPos, setMiniAudioPos] = useState({ x: 14, y: 58 });
  const [isMiniDragging, setIsMiniDragging] = useState(false);
  const miniDragRef = useRef({ startX: 0, startY: 0, initialX: 14, initialY: 58, moved: false });
  const miniAudioBtnRef = useRef(null);

  // Admin/Institute Upload & Edit Modal State
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadModalChapter, setUploadModalChapter] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackUrl, setNewTrackUrl] = useState("");

  // Admin Chapter Title Edit State
  const [editTitleKo, setEditTitleKo] = useState("");
  const [editTitleNe, setEditTitleNe] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingChapterInfo, setIsSavingChapterInfo] = useState(false);

  // Primary Language Track State: "both" | "korean" | "japanese"
  const effectiveIsAdmin = mode === "admin" || (typeof window !== "undefined" && window.location.pathname.startsWith('/admin'));
  const effectiveInstLang = (
    effectiveIsAdmin
      ? "both"
      : (
          propInstituteLanguage ||
          (typeof window !== "undefined" ? localStorage.getItem("instituteLanguage") : null) ||
          "both"
        )
  ).toLowerCase();

  const [studyLanguage, setStudyLanguage] = useState(() => {
    if (effectiveInstLang === "japanese") return "japanese";
    if (effectiveInstLang === "korean") return "korean";
    return "both";
  });

  useEffect(() => {
    if (effectiveInstLang === "japanese") {
      setStudyLanguage("japanese");
    } else if (effectiveInstLang === "korean") {
      setStudyLanguage("korean");
    } else if (effectiveInstLang === "both") {
      setStudyLanguage("both");
    }
  }, [effectiveInstLang]);

  const [activeJapaneseFolder, setActiveJapaneseFolder] = useState(() => {
    if (initialFolder) return initialFolder;
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get("folder");
      if (f && ["JLPT N5・N4", "Minna no Nihongo", "JLPT N3・N2・N1", "Kanji & Meaning", "Mock Test"].includes(f)) {
        return f;
      }
    }
    return "JLPT N5・N4";
  });

  useEffect(() => {
    if (initialFolder) {
      setStudyLanguage("japanese");
      setActiveJapaneseFolder(initialFolder);
    }
  }, [initialFolder]);
  const [isJapaneseFolderOpen, setIsJapaneseFolderOpen] = useState(() => {
    if (initialFolder) return true;
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get("folder");
      if (f && ["JLPT N5・N4", "Minna no Nihongo", "JLPT N3・N2・N1", "Kanji & Meaning", "Mock Test"].includes(f)) {
        return true;
      }
    }
    return false;
  });
  const [isKoreanFolderOpen, setIsKoreanFolderOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get("folder");
      if (f && ["EPS Book", "Meaning Book", "Model Question Bank", "Grammar Book"].includes(f)) {
        return true;
      }
    }
    return false;
  });
  const [minnaLessonFilter, setMinnaLessonFilter] = useState("all"); // "all", "n5", "n4", "full"
  const [minnaSearchQuery, setMinnaSearchQuery] = useState("");
  const [viewingMinnaLesson, setViewingMinnaLesson] = useState(null);
  const [n3LevelFilter, setN3LevelFilter] = useState("all"); // "all", "N3", "N2", "N1", "full"
  const [n3SearchQuery, setN3SearchQuery] = useState("");
  const [kanjiActiveTab, setKanjiActiveTab] = useState("kanji"); // "kanji", "particles", "meanings"
  const [kanjiSearchQuery, setKanjiSearchQuery] = useState("");
  const [kanjiLevelFilter, setKanjiLevelFilter] = useState("all");
  const [selectedKanjiDetail, setSelectedKanjiDetail] = useState(null);
  const [jlptLevelFilter, setJlptLevelFilter] = useState("all");
  const [activeJlptExamSet, setActiveJlptExamSet] = useState(null);
  const [jlptExamMode, setJlptExamMode] = useState(mode || "student");
  const [jlptSearchQuery, setJlptSearchQuery] = useState("");
  const [jlptPastResults, setJlptPastResults] = useState({});

  // Restore completed exam results from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("jlpt_past_results_map");
        if (saved) {
          setJlptPastResults(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("Failed to load jlpt_past_results_map:", e);
      }
    }
  }, []);

  const [playingJpAudioId, setPlayingJpAudioId] = useState(null);
  const jpAudioPlayerRef = useRef(null);
  const [kanjiVisibleLimit, setKanjiVisibleLimit] = useState(60);
  const [japaneseR2Data, setJapaneseR2Data] = useState(null);

  const handlePlayJpAudio = (arg1, arg2, arg3) => {
    if (typeof window === "undefined") return;
    let id = arg1;
    let text = arg2;
    if (typeof arg1 === 'string' && (arg1.startsWith('/api') || arg1.startsWith('http'))) {
      id = arg2;
      text = arg3;
      if (!text) {
        try {
          const parsed = new URL(arg1, 'http://localhost');
          text = parsed.searchParams.get('text') || '';
        } catch (e) { }
      }
    }
    if (!text) return;

    if (playingJpAudioId === id) {
      if (jpAudioPlayerRef.current) {
        jpAudioPlayerRef.current.pause();
        jpAudioPlayerRef.current = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingJpAudioId(null);
      return;
    }

    if (jpAudioPlayerRef.current) {
      jpAudioPlayerRef.current.pause();
      jpAudioPlayerRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    let cleanText = String(text).trim().replace(/[#*`_~]/g, '');
    setPlayingJpAudioId(id);

    // Instant client-side speech synthesis (< 5ms response)
    if ('speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = /[\uAC00-\uD7AF]/.test(cleanText) ? 'ko-KR' : 'ja-JP';
        utterance.rate = 0.95;
        window.__activeJpUtt = utterance;
        utterance.onend = () => {
          window.__activeJpUtt = null;
          setPlayingJpAudioId(null);
        };
        utterance.onerror = () => {
          window.__activeJpUtt = null;
          setPlayingJpAudioId(null);
        };
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) { }
    }

    try {
      const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=ja&voice=ja-JP-NanamiNeural&gender=female&model=ja-female-1`;
      const audio = new Audio(ttsUrl);
      jpAudioPlayerRef.current = audio;

      audio.onended = () => {
        setPlayingJpAudioId(null);
        jpAudioPlayerRef.current = null;
      };

      audio.onerror = () => {
        setPlayingJpAudioId(null);
      };

      audio.play().catch(() => {
        setPlayingJpAudioId(null);
      });
    } catch (err) {
      setPlayingJpAudioId(null);
    }
  };

  const filteredMinnaLessons = useMemo(() => {
    return MINNA_NO_NIHONGO_LESSONS.filter(l => {
      if ((minnaLessonFilter === "book1" || minnaLessonFilter === "n5") && l.lesson > 25) return false;
      if ((minnaLessonFilter === "book2" || minnaLessonFilter === "n4") && l.lesson <= 25) return false;
      if (minnaSearchQuery.trim()) {
        const q = minnaSearchQuery.toLowerCase();
        return (
          l.titleJp.toLowerCase().includes(q) ||
          l.titleEn.toLowerCase().includes(q) ||
          l.titleNe.toLowerCase().includes(q) ||
          l.grammar.toLowerCase().includes(q) ||
          `lesson ${l.lesson}`.includes(q) ||
          `ch ${l.lesson}`.includes(q)
        );
      }
      return true;
    });
  }, [minnaLessonFilter, minnaSearchQuery]);

  const allN3Units = useMemo(() => {
    if (japaneseR2Data?.n3Units && japaneseR2Data.n3Units.length > 0) {
      return japaneseR2Data.n3Units;
    }
    const units = [];
    for (let w = 1; w <= 6; w++) {
      for (let u = 1; u <= 6; u++) {
        const uNum = (w - 1) * 6 + u;
        units.push({
          level: 'N3',
          week: `Week ${w}`,
          unit: `Unit ${uNum}`,
          title: `Soumatome N3 Week ${w} Unit ${uNum}`,
          pdfUrl: `/api/r2/books/japanese/soumatome-n3/Week%20${w}/Unit%20${uNum}/Unit%20${uNum}.pdf`
        });
      }
    }
    return units;
  }, [japaneseR2Data]);

  const filteredN3Units = useMemo(() => {
    return allN3Units.filter(u => {
      if (n3SearchQuery.trim()) {
        const q = n3SearchQuery.trim().toLowerCase();
        return (
          u.title.toLowerCase().includes(q) ||
          u.week.toLowerCase().includes(q) ||
          u.unit.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allN3Units, n3SearchQuery]);

  const allN2Units = useMemo(() => {
    if (japaneseR2Data?.n2Units && japaneseR2Data.n2Units.length > 0) {
      return japaneseR2Data.n2Units;
    }
    const units = [
      { level: 'N2', chapter: 'Front Matter', title: 'JLPT N2 Front Matter & Introduction', pdfUrl: '/api/r2/books/japanese/n2/Front%20Matter/Front%20Matter.pdf' }
    ];
    for (let c = 1; c <= 18; c++) {
      units.push({
        level: 'N2',
        chapter: `Chapter ${c}`,
        title: `JLPT N2 Chapter ${c}`,
        pdfUrl: `/api/r2/books/japanese/n2/Chapter%20${c}/Chapter%20${c}.pdf`
      });
    }
    units.push({ level: 'N2', chapter: 'Back Matter', title: 'JLPT N2 Back Matter & Answer Keys', pdfUrl: '/api/r2/books/japanese/n2/Back%20Matter/Back%20Matter.pdf' });
    return units;
  }, [japaneseR2Data]);

  const filteredN2Units = useMemo(() => {
    return allN2Units.filter(u => {
      if (n3SearchQuery.trim()) {
        const q = n3SearchQuery.trim().toLowerCase();
        return u.title.toLowerCase().includes(q) || (u.chapter && u.chapter.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allN2Units, n3SearchQuery]);

  const allN1Units = useMemo(() => {
    if (japaneseR2Data?.n1Units && japaneseR2Data.n1Units.length > 0) {
      return japaneseR2Data.n1Units;
    }
    const topics = [
      { ch: 1, title: "時事日本語と論説文の構造", grammar: "〜を皮切りに / 〜を余儀なくされる" },
      { ch: 2, title: "高度敬語と公式スピーチ", grammar: "〜あっての / 〜申し上げる" },
      { ch: 3, title: "抽象概念と哲学・社会評論", grammar: "〜が早いか / 〜や否や" },
      { ch: 4, title: "ビジネス契約書・社内通達読解", grammar: "〜極まりない / 〜を限りに" },
      { ch: 5, title: "学術論文・データ分析表現", grammar: "〜といえども / 〜ならいざ知らず" },
      { ch: 6, title: "政治・経済ニュース総合読解", grammar: "〜にかこつけて / 〜をおいて" },
      { ch: 7, title: "古典的慣用表現と四字熟語", grammar: "〜まみれ / 〜ずくめ" },
      { ch: 8, title: "専門討論・ディベート表現", grammar: "〜ともなると / 〜にたえない" },
      { ch: 9, title: "随筆・近代文学講読", grammar: "〜ならではの / 〜にとどまらず" },
      { ch: 10, title: "N1 総合実戦演習と総復習", grammar: "N1 主要文法・語彙の総点検" }
    ];
    return topics.map(t => ({
      level: 'N1',
      chapter: `Chapter ${t.ch}`,
      title: `JLPT N1 Chapter ${t.ch}: ${t.title}`,
      grammar: t.grammar,
      pdfUrl: `/api/r2/books/japanese/full/Nihongo_Soumatome_N3_Goi.pdf`
    }));
  }, [japaneseR2Data]);

  const filteredN1Units = useMemo(() => {
    return allN1Units.filter(u => {
      if (n3SearchQuery.trim()) {
        const q = n3SearchQuery.trim().toLowerCase();
        return u.title.toLowerCase().includes(q) || (u.chapter && u.chapter.toLowerCase().includes(q)) || (u.grammar && u.grammar.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allN1Units, n3SearchQuery]);

  const getMinnaPdfUrl = (lessonNum) => {
    if (japaneseR2Data?.minnaLessons) {
      const found = japaneseR2Data.minnaLessons.find(l => l.lesson === lessonNum);
      if (found?.pdfUrl) return found.pdfUrl;
    }
    return `/api/r2/books/japanese/minna-nihongo/Chapter%20${lessonNum}/Chapter%20${lessonNum}.pdf`;
  };

  const filteredKanji = useMemo(() => {
    if (!Array.isArray(KANJI_1000_LIST)) return [];
    return KANJI_1000_LIST.filter(k => {
      if (kanjiLevelFilter !== "all") {
        const targetLevel = parseInt(kanjiLevelFilter.replace("N", ""), 10);
        if (k.jlpt !== targetLevel) return false;
      }
      if (kanjiSearchQuery.trim()) {
        const q = kanjiSearchQuery.trim().toLowerCase();
        return (
          (k.kanji && k.kanji.toLowerCase().includes(q)) ||
          (k.onyomi && k.onyomi.toLowerCase().includes(q)) ||
          (k.kunyomi && k.kunyomi.toLowerCase().includes(q)) ||
          (k.english && k.english.toLowerCase().includes(q)) ||
          (k.nepali && k.nepali.toLowerCase().includes(q)) ||
          (k.japaneseRomanized && k.japaneseRomanized.toLowerCase().includes(q)) ||
          (k.japaneseSpoken && k.japaneseSpoken.includes(q))
        );
      }
      return true;
    });
  }, [kanjiLevelFilter, kanjiSearchQuery]);

  // Multi-Folder Books Library State
  const DEFAULT_FOLDERS = [
    { id: "eps-book", name: "EPS Book", icon: "", coverImage: "/images/books/eps-book-cover.jpg", description: "Official 60-Chapter Korean EPS-TOPIK Textbook with Audio & PDFs" },
    { id: "meaning-book", name: "Meaning Book", icon: "", coverImage: "/images/books/meaning-book-cover.jpg", description: "Chapter-wise Korean Vocabulary & Word Meanings (Chapters 1 to 60)" },
    { id: "model-question-bank", name: "Model Question Bank", icon: "", coverImage: "/images/books/model-bank-cover.png", description: "UBT Exam Practice Question Sets (Reading 20 + Listening 20) with Time and Audio" },
    { id: "grammar-book", name: "Grammar Book", icon: "", coverImage: "/images/books/grammar-book-cover.png", description: "Comprehensive Korean Grammar Rules, Patterns & Examples" }
  ];

  const getFolderNewTabUrl = (lang, folderName) => {
    let base = "/admin/listening";
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p.includes("/student")) {
        base = "/student?tab=listening";
      } else if (p.includes("/institute")) {
        base = "/institute?tab=listening";
      } else if (p.includes("/admin")) {
        base = "/admin/listening";
      }
    }
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}lang=${encodeURIComponent(lang)}&folder=${encodeURIComponent(folderName)}`;
  };

  const getFolderCover = (folder) => {
    if (folder?.coverImage) return folder.coverImage;
    const name = (folder?.name || "").toLowerCase();
    if (name.includes("eps")) return "/images/books/eps-book-cover.jpg";
    if (name.includes("meaning")) return "/images/books/meaning-book-cover.jpg";
    if (name.includes("model") || name.includes("question") || name.includes("bank")) return "/images/books/model-bank-cover.png";
    if (name.includes("grammar")) return "/images/books/grammar-book-cover.png";
    return "/images/books/eps-book-cover.jpg";
  };

  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [activeFolder, setActiveFolder] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get("folder");
      if (f && ["EPS Book", "Meaning Book", "Model Question Bank", "Grammar Book"].includes(f)) {
        return f;
      }
    }
    return "EPS Book";
  });
  const [materials, setMaterials] = useState([]);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [r2Folders, setR2Folders] = useState([]);
  const [r2FullBooks, setR2FullBooks] = useState([]);

  // Read language and folder from URL search params on mount & popstate
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const sp = new URLSearchParams(window.location.search);
      const langParam = sp.get("lang");
      const folderParam = sp.get("folder");
      if (langParam === "korean" || langParam === "japanese" || langParam === "both") {
        setStudyLanguage(langParam);
      }
      if (folderParam) {
        if (["EPS Book", "Meaning Book", "Model Question Bank", "Grammar Book"].includes(folderParam)) {
          setActiveFolder(folderParam);
          setIsKoreanFolderOpen(true);
          setStudyLanguage("korean");
        } else if (["JLPT N5・N4", "Minna no Nihongo", "JLPT N3・N2・N1", "Kanji & Meaning", "Mock Test"].includes(folderParam)) {
          setActiveJapaneseFolder(folderParam);
          setIsJapaneseFolderOpen(true);
          setStudyLanguage("japanese");
        }
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Chapter-wise Meaning Book State (Chapters 1 to 60)
  const [meaningChapters, setMeaningChapters] = useState([]);
  const [viewingMeaningChapter, setViewingMeaningChapter] = useState(null);
  const [meaningSearchQuery, setMeaningSearchQuery] = useState("");
  const [meaningBookFilter, setMeaningBookFilter] = useState("all"); // "all", "book1", "book2"

  // Super Admin Edit Meaning Modal State
  const [editMeaningModalChapter, setEditMeaningModalChapter] = useState(null);
  const [editMeaningPdf, setEditMeaningPdf] = useState("");
  const [editMeaningAudio, setEditMeaningAudio] = useState("");
  const [editMeaningNotes, setEditMeaningNotes] = useState("");
  const [editMeaningTitleKo, setEditMeaningTitleKo] = useState("");
  const [editMeaningTitleNe, setEditMeaningTitleNe] = useState("");
  const [uploadingMeaningPdf, setUploadingMeaningPdf] = useState(false);
  const [uploadingMeaningAudio, setUploadingMeaningAudio] = useState(false);
  const [isSavingMeaning, setIsSavingMeaning] = useState(false);
  const meaningPdfInputRef = useRef(null);
  const meaningAudioInputRef = useRef(null);

  // Model Question Bank State (UBT Exam Sets, strictly no PDFs)
  const [ubtSets, setUbtSets] = useState([]);
  const [ubtSearchQuery, setUbtSearchQuery] = useState("");
  const [showInstituteBuyModal, setShowInstituteBuyModal] = useState(false);

  // Super Admin Upload Material State
  const [isUploadMaterialOpen, setIsUploadMaterialOpen] = useState(false);
  const [matFolder, setMatFolder] = useState("Grammar Book");
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matFile, setMatFile] = useState(null);
  const [matAudioFile, setMatAudioFile] = useState(null);
  const [isSubmittingMat, setIsSubmittingMat] = useState(false);

  // Super Admin Add Folder State
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderIcon, setNewFolderIcon] = useState("📚");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);

  const openUploadModal = (chapter) => {
    if (!chapter) return;
    setUploadModalChapter(chapter);
    setEditTitleKo(chapter.titleKo || "");
    setEditTitleNe(chapter.titleNe || "");
    setEditNotes(chapter.notes || "");
  };

  const handleUploadMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!matTitle.trim()) {
      alert("Please enter a material title.");
      return;
    }
    if (!matFile) {
      alert("Please select a document or PDF file to upload.");
      return;
    }

    setIsSubmittingMat(true);
    try {
      // 1. Upload main document
      const docForm = new FormData();
      docForm.append("file", matFile);
      const docRes = await fetch("/api/upload", { method: "POST", body: docForm });
      const docData = await docRes.json();
      if (!docRes.ok || !docData.url) {
        throw new Error(docData.error || "File upload failed");
      }

      // 2. Upload audio if provided
      let uploadedAudioUrl = null;
      if (matAudioFile) {
        const audioForm = new FormData();
        audioForm.append("file", matAudioFile);
        const audRes = await fetch("/api/upload", { method: "POST", body: audioForm });
        const audData = await audRes.json();
        if (audRes.ok && audData.url) {
          uploadedAudioUrl = audData.url;
        }
      }

      // 3. Save material in books library
      const fileSizeStr = (matFile.size / (1024 * 1024)).toFixed(1) + " MB";
      const ext = matFile.name.split('.').pop()?.toLowerCase() || 'pdf';

      const saveRes = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_material",
          folder: matFolder,
          title: matTitle.trim(),
          description: matDesc.trim(),
          fileUrl: docData.url,
          fileName: matFile.name,
          fileType: ext,
          fileSize: fileSizeStr,
          audioUrl: uploadedAudioUrl
        })
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        setMaterials(saveData.materials || []);
        setIsUploadMaterialOpen(false);
        setMatTitle("");
        setMatDesc("");
        setMatFile(null);
        setMatAudioFile(null);
        setActiveFolder(matFolder);
        alert(`Material "${matTitle.trim()}" successfully added to ${matFolder}!`);
      } else {
        alert("Failed to save material: " + (saveData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Material upload error:", err);
      alert("Upload error: " + err.message);
    } finally {
      setIsSubmittingMat(false);
    }
  };

  const handleDeleteMaterial = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_material", id })
      });
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials || []);
      }
    } catch (err) {
      alert("Failed to delete material: " + err.message);
    }
  };

  const handleCreateFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      alert("Please enter a folder name.");
      return;
    }
    setIsSubmittingFolder(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_folder",
          name: newFolderName.trim(),
          icon: newFolderIcon || "📁",
          description: newFolderDesc.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders || []);
        setActiveFolder(newFolderName.trim());
        setIsAddFolderOpen(false);
        setNewFolderName("");
        setNewFolderDesc("");
        alert(`Folder "${newFolderName.trim()}" created!`);
      }
    } catch (err) {
      alert("Failed to create folder: " + err.message);
    } finally {
      setIsSubmittingFolder(false);
    }
  };

  const handleUploadMeaningPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMeaningPdf(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditMeaningPdf(data.url);
      } else {
        alert("Failed to upload PDF: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("PDF Upload failed: " + err.message);
    } finally {
      setUploadingMeaningPdf(false);
    }
  };

  const handleUploadMeaningAudio = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMeaningAudio(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditMeaningAudio(data.url);
      } else {
        alert("Failed to upload audio: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Audio Upload failed: " + err.message);
    } finally {
      setUploadingMeaningAudio(false);
    }
  };

  const handleSaveMeaningChapter = async (e) => {
    if (e) e.preventDefault();
    if (!editMeaningModalChapter) return;
    setIsSavingMeaning(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_meaning_chapter",
          chapter: editMeaningModalChapter.chapter,
          meaningPdfUrl: editMeaningPdf,
          meaningAudioUrl: editMeaningAudio,
          notes: editMeaningNotes,
          titleKo: editMeaningTitleKo,
          titleNe: editMeaningTitleNe
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.meaningChapters)) {
        setMeaningChapters(data.meaningChapters);
        if (viewingMeaningChapter && viewingMeaningChapter.chapter === editMeaningModalChapter.chapter) {
          const updated = data.meaningChapters.find(c => c.chapter === editMeaningModalChapter.chapter);
          if (updated) setViewingMeaningChapter(updated);
        }
        setEditMeaningModalChapter(null);
        alert(`Chapter ${editMeaningModalChapter.chapter} Meaning updated successfully!`);
      } else {
        alert("Failed to save meaning: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error saving chapter meaning: " + err.message);
    } finally {
      setIsSavingMeaning(false);
    }
  };

  const isModelBankUnlocked = () => {
    // Only Super Admin ('admin') has automatic access.
    // Both Student AND Institute must purchase this product, otherwise no access!
    if (mode === "admin") return true;

    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. STUDENT VERIFICATION
    if (mode === "student") {
      let allowedList = purchasedPackages && purchasedPackages.length > 0 ? [...purchasedPackages] : [];

      if (typeof window !== "undefined") {
        let myPkg = studentPackage || localStorage.getItem("currentStudentPackage") || "";
        if (myPkg) allowedList.push(myPkg);

        const phone = localStorage.getItem("currentStudentPhone") || "";
        const cleanDigits = (p) => (p || "").toString().replace(/[^0-9]/g, "").slice(-10);
        const studentsList = JSON.parse(localStorage.getItem("studentsList") || "[]");
        const foundStudent = studentsList.find(s => s.phone && cleanDigits(s.phone) === cleanDigits(phone));
        if (foundStudent) {
          if (foundStudent.assignedPackage || foundStudent.package) {
            allowedList.push(foundStudent.assignedPackage || foundStudent.package);
          }
          if (foundStudent.assignedPackages && Array.isArray(foundStudent.assignedPackages)) {
            allowedList.push(...foundStudent.assignedPackages);
          }
        }
      }

      const normAllowed = allowedList.map(norm);
      return normAllowed.some(pkg =>
        pkg.includes("modelquestion") ||
        pkg.includes("modelbank") ||
        pkg === norm("Model Question Bank")
      );
    }

    // 2. INSTITUTE VERIFICATION (CRITICAL: Student and Institute must both buy this product, otherwise do not get to access)
    if (mode === "institute") {
      let instAllowedList = [];

      if (typeof window !== "undefined") {
        const currentInst = localStorage.getItem("currentInstitute") || "";
        const currentInstPkg = localStorage.getItem("currentInstitutePackage") || localStorage.getItem("instituteExamPackage") || "";
        if (currentInstPkg) instAllowedList.push(currentInstPkg);

        const institutes = JSON.parse(localStorage.getItem("institutes") || "[]");
        const foundInst = institutes.find(i =>
          (i.name && currentInst && i.name.toLowerCase() === currentInst.toLowerCase()) ||
          (i.username && currentInst && i.username.toLowerCase() === currentInst.toLowerCase())
        );
        if (foundInst) {
          if (foundInst.examPackage) instAllowedList.push(foundInst.examPackage);
          if (Array.isArray(foundInst.purchasedPackages)) instAllowedList.push(...foundInst.purchasedPackages);
          if (Array.isArray(foundInst.assignedPackages)) instAllowedList.push(...foundInst.assignedPackages);
        }

        const instPurchased = JSON.parse(localStorage.getItem(`institutePurchasedPackages_${currentInst}`) || "[]");
        if (Array.isArray(instPurchased)) instAllowedList.push(...instPurchased);

        const allInstPurchased = JSON.parse(localStorage.getItem("institutePurchasedPackages") || "[]");
        if (Array.isArray(allInstPurchased)) instAllowedList.push(...allInstPurchased);
      }

      const normAllowed = instAllowedList.map(norm);
      return normAllowed.some(pkg =>
        pkg.includes("modelquestion") ||
        pkg.includes("modelbank") ||
        pkg === norm("Model Question Bank")
      );
    }

    return false;
  };

  const isSetUnlocked = (set) => {
    // If set is inside Model Question Bank:
    const isModelBankSet =
      activeFolder === "Model Question Bank" ||
      set.folder === "Model Question Bank" ||
      set.source === "model_question_bank" ||
      (set.packageName && set.packageName.toLowerCase().includes("model")) ||
      (set.name && set.name.toLowerCase().includes("model"));

    if (isModelBankSet) {
      // Both student AND institute must buy this product, otherwise do not get to access!
      return isModelBankUnlocked();
    }

    // For other sets (outside Model Question Bank):
    if (mode === "admin" || mode === "institute") return true;

    let myPkg = studentPackage;
    let allowedList = purchasedPackages && purchasedPackages.length > 0 ? [...purchasedPackages] : [];

    if (typeof window !== "undefined") {
      if (!myPkg) myPkg = localStorage.getItem("currentStudentPackage") || "";
      const phone = localStorage.getItem("currentStudentPhone") || "";
      const cleanDigits = (p) => (p || "").toString().replace(/[^0-9]/g, "").slice(-10);
      const studentsList = JSON.parse(localStorage.getItem("studentsList") || "[]");
      const foundStudent = studentsList.find(s => s.phone && cleanDigits(s.phone) === cleanDigits(phone));
      if (foundStudent) {
        if (!myPkg && (foundStudent.assignedPackage || foundStudent.package)) {
          myPkg = foundStudent.assignedPackage || foundStudent.package;
        }
        if (foundStudent.assignedPackages && Array.isArray(foundStudent.assignedPackages)) {
          allowedList.push(...foundStudent.assignedPackages);
        }
      }
    }

    if (myPkg) allowedList.push(myPkg);
    if (allowedList.length === 0) allowedList.push("Full Set UBT");

    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normAllowed = allowedList.map(norm);
    const setPkgNorm = norm(set.packageName || set.package?.name || "Full Set UBT");

    if (normAllowed.includes(setPkgNorm)) return true;
    if (normAllowed.some(ap => ap.includes('full') || ap.includes('100') || ap.includes('ubt'))) return true;

    return false;
  };

  const handleStartUbtSet = (set) => {
    const unlocked = isSetUnlocked(set);
    if (!unlocked) {
      if (mode === "institute") {
        setShowInstituteBuyModal(true);
        return;
      }

      const msg = `Model Question Bank is not included in "${studentPackage || 'Full Set UBT'}" and must be purchased separately. Please go to Packages to unlock Model Question Bank.`;
      if (onNavigateTab) {
        if (confirm(`${msg}\n\nDo you want to go to Packages to enroll in Model Question Bank now?`)) {
          onNavigateTab("buyExam");
        }
      } else {
        alert(msg);
      }
      return;
    }

    if (mode === "institute") {
      router.push(`/institute/exam-preview/${set.id || encodeURIComponent(set.name)}`);
      return;
    }
    router.push(`/student/exam/${set.id || encodeURIComponent(set.name)}`);
  };

  const audioRef = useRef(null);
  const pdfInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 0. Preload offline stored blobs & chapter status for instant 0ms access
    preloadAllCachedBlobs();
    getAllOfflineChaptersStatus().then((statusMap) => {
      if (statusMap) setOfflineChaptersMap(statusMap);
    });

    // 1. Immediate local cache load for responsive UI
    const data = loadEps60Chapters();
    setChapters(data);

    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role") || "";
      const isAuth = !isInstitute && mode !== "student" && (mode === "admin" || storedRole === "admin");
      setIsAdmin(isAuth);

      try {
        let combinedMap = {};
        const mapSaved = localStorage.getItem("jlpt_past_results_map");
        if (mapSaved) {
          try {
            combinedMap = { ...JSON.parse(mapSaved) };
          } catch (e) { }
        }
        const savedJlptResults = JSON.parse(localStorage.getItem("jlptExamResults") || "[]");
        if (Array.isArray(savedJlptResults)) {
          savedJlptResults.forEach(r => {
            if (r.examId && (!combinedMap[r.examId] || new Date(r.completedAt || r.date) > new Date(combinedMap[r.examId].completedAt || combinedMap[r.examId].date))) {
              combinedMap[r.examId] = r;
            }
          });
        }
        if (Object.keys(combinedMap).length > 0) {
          setJlptPastResults(combinedMap);
        }
      } catch (e) { }
    }

    // 2. Fetch fresh persistent chapters from server so student, institute & admin are synchronized
    fetchServerEpsChapters().then((serverChapters) => {
      if (serverChapters && Array.isArray(serverChapters) && serverChapters.length > 0) {
        setChapters(serverChapters);
        setSelectedChapter((prev) => {
          if (!prev) return prev;
          const fresh = serverChapters.find((c) => c.chapter === prev.chapter);
          return fresh || prev;
        });
      }
    });

    // 3. Fetch books folders, materials, meaningChapters & ubtSets for everyone
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (Array.isArray(data.folders) && data.folders.length > 0) setFolders(data.folders);
          if (Array.isArray(data.materials)) setMaterials(data.materials);
          if (Array.isArray(data.meaningChapters)) setMeaningChapters(data.meaningChapters);
          if (Array.isArray(data.r2Books)) setR2Folders(data.r2Books);
          if (Array.isArray(data.r2FullBooks)) setR2FullBooks(data.r2FullBooks);
          if (Array.isArray(data.ubtSets)) {
            let combined = [...data.ubtSets];
            const localSets = JSON.parse(localStorage.getItem("examSets") || "[]");
            localSets.forEach(s => {
              const isChap = `${s.name || ''} ${s.packageName || ''}`.toLowerCase().includes('chapter');
              if (!isChap && !combined.some(ex => ex.name.toUpperCase().trim() === s.name.toUpperCase().trim())) {
                combined.push(s);
              }
            });
            setUbtSets(combined);
          }
        }
      })
      .catch((err) => console.warn("Books library fetch notice:", err));

    // 4. Fetch Japanese R2 Books & Chapters Manifest
    fetch("/api/books/japanese-r2")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setJapaneseR2Data(data);
        }
      })
      .catch((err) => console.warn("Japanese R2 books fetch notice:", err));
  }, [mode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideTop = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideTop) {
        setShowTrackDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTrack = selectedChapter?.audioTracks?.[currentTrackIndex] || null;

  // Drag & Drop Handler (Works smoothly anywhere on screen for mouse & touch)
  const handleDragStart = (e) => {
    // Only drag with left mouse button or touch
    if (e.type === "mousedown" && e.button !== 0) return;

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: popupPos.x,
      initialY: popupPos.y,
      moved: false,
    };
    setIsDragging(true);

    const onMove = (moveEvt) => {
      const curX = moveEvt.type === "touchmove" ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const curY = moveEvt.type === "touchmove" ? moveEvt.touches[0].clientY : moveEvt.clientY;
      const dx = curX - dragRef.current.startX;
      const dy = curY - dragRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }

      const elemWidth = popupContainerRef.current?.offsetWidth || 360;
      const elemHeight = popupContainerRef.current?.offsetHeight || 60;
      const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;

      const maxX = Math.max(0, winW - elemWidth);
      const maxY = Math.max(0, winH - elemHeight);

      const nextX = Math.max(8, Math.min(maxX - 8, dragRef.current.initialX + dx));
      const nextY = Math.max(8, Math.min(maxY - 8, dragRef.current.initialY + dy));

      setPopupPos({ x: nextX, y: nextY });
    };

    const onEnd = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  // Drag handler for Movable Circular AUDIO Button
  const handleMiniDragStart = (e) => {
    e.stopPropagation();
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    miniDragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: miniAudioPos.x,
      initialY: miniAudioPos.y,
      moved: false,
    };
    setIsMiniDragging(true);

    const onMove = (moveEvt) => {
      const curX = moveEvt.type === "touchmove" ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const curY = moveEvt.type === "touchmove" ? moveEvt.touches[0].clientY : moveEvt.clientY;
      const dx = curX - miniDragRef.current.startX;
      const dy = curY - miniDragRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        miniDragRef.current.moved = true;
      }

      const btnSize = 60;
      const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;

      const maxX = Math.max(0, winW - btnSize);
      const maxY = Math.max(0, winH - btnSize);

      const nextX = Math.max(6, Math.min(maxX - 6, miniDragRef.current.initialX + dx));
      const nextY = Math.max(6, Math.min(maxY - 6, miniDragRef.current.initialY + dy));

      setMiniAudioPos({ x: nextX, y: nextY });
    };

    const onEnd = () => {
      setIsMiniDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  };

  // Clean PDF URL without browser toolbar, page count or buttons - fit maximum screen universally
  const getCleanPdfUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.includes("drive.google.com")) {
      return trimmed;
    }
    return `/pdfviewer.html?url=${encodeURIComponent(trimmed)}`;
  };

  // Open Full-Screen View for a Chapter (Instant 0ms PDF opening & Universal Smartboard/Mobile Compatibility)
  const openChapterFullScreen = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowTrackDropdown(false);
    setPopupMode("gesture");

    const chId = chapter.chapter !== undefined ? chapter.chapter : (chapter.id || chapter.folder);
    const pdfTarget = chapter.pdfUrl || chapter.pdf?.url || "";

    // Set official streamable server PDF URL immediately for 100% universal loading on Smartboards & Mobile
    setActivePdfBlobUrl(pdfTarget);

    // Pre-check audio tracks in memory cache
    if (chapter.audioTracks && chapter.audioTracks.length > 0) {
      const audioBlobMap = {};
      chapter.audioTracks.forEach((tr) => {
        if (tr.url) {
          const aBlob = getCachedBlobSync(tr.url);
          if (aBlob) audioBlobMap[tr.url] = aBlob;
        }
      });
      if (Object.keys(audioBlobMap).length > 0) {
        setCachedAudioUrls((prev) => ({ ...prev, ...audioBlobMap }));
      }
    }

    // Background offline cache sync (keeps server URL active for flawless rendering)
    autoSaveChapterOffline(chapter, (progress) => {
      if (progress.type === "audio" && progress.blobUrl && progress.trackUrl) {
        setCachedAudioUrls((prev) => ({ ...prev, [progress.trackUrl]: progress.blobUrl }));
      }
      if (progress.type === "completed") {
        setOfflineChaptersMap((prev) => ({ ...prev, [chId]: true }));
      }
    });

    // Safely attempt fullscreen without throwing on unsupported devices (e.g. smartboard Android TV / iOS)
    if (typeof document !== "undefined" && !document.fullscreenElement && document.documentElement?.requestFullscreen) {
      try {
        document.documentElement.requestFullscreen().catch(() => {});
      } catch (e) {}
    }
  };

  // Close Full-Screen View and return to Chapter Grid
  const closeFullScreen = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    }
    setSelectedChapter(null);
    setActivePdfBlobUrl("");
    setIsPlaying(false);
    setCurrentTime(0);
    setShowTrackDropdown(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedChapter) {
        closeFullScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChapter]);

  // Playable audio URL (checks offline cached blob first, then direct URL or TTS fallback)
  const getPlayableAudioUrl = (track) => {
    if (!track) return "";
    const rawUrl = track.url?.trim() || "";
    if (rawUrl) {
      // 1. Check local blob URL first for instant zero-latency playback
      if (cachedAudioUrls[rawUrl]) {
        return cachedAudioUrls[rawUrl];
      }
      const syncAudio = getCachedBlobSync(rawUrl);
      if (syncAudio) {
        return syncAudio;
      }
      return rawUrl;
    }
    // High-quality Korean voice synthesis fallback
    if (track.textKo && track.textKo.trim()) {
      return `/api/tts?text=${encodeURIComponent(track.textKo.trim())}&lang=ko&voice=female`;
    }
    return "";
  };

  // Track auto-play trigger when track changes while playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Track change play error:", err);
      });
    }
  }, [currentTrackIndex]);

  // Auto-shrink audio player to gesture trigger button when clicking outside or when PDF iframe gains focus
  useEffect(() => {
    if (popupMode !== "full") return;

    const handleOutsideClick = (e) => {
      if (popupContainerRef.current && !popupContainerRef.current.contains(e.target)) {
        setPopupMode("gesture");
        setShowTrackDropdown(false);
      }
    };

    const handleBlur = () => {
      // When user clicks into the PDF iframe, window blurs
      setPopupMode("gesture");
      setShowTrackDropdown(false);
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("blur", handleBlur);
    };
  }, [popupMode]);

  // Direct Track Selection with Instant Auto-Play & Auto-Hide Dialog
  const handleSelectTrack = (idx) => {
    setCurrentTrackIndex(idx);
    setShowTrackDropdown(false);
    setIsPlaying(true);
    setCurrentTime(0);

    // Fast attempt & metadata fallback
    setTimeout(() => {
      setShowTrackDropdown(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setShowTrackDropdown(false);
        }).catch((err) => {
          console.warn("Auto-play trigger:", err);
        });
      }
    }, 60);
  };

  // Play / Pause toggle with 100% reliable hardware synchronization
  const togglePlayPause = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setShowTrackDropdown(false);
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio play issue:", err);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Speed change
  const cyclePlaybackRate = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const rates = [1.0, 1.25, 1.5, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Seek forward or backward by seconds
  const seekBy = (secs) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 0, audioRef.current.currentTime + secs));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Time format helper
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Combine all available chapters including Preliminary (0) and Appendix (61)
  const allAvailableChapters = useMemo(() => {
    const list = [...chapters];
    const prelim = r2Folders.find(f => f.folder === "Preliminary" || f.chapter === 0);
    const appendix = r2Folders.find(f => f.folder === "Appendix" || f.chapter === 61);
    if (prelim && !list.some(c => c.chapter === 0 || c.folder === "Preliminary")) {
      list.unshift({
        id: 0,
        chapter: 0,
        folder: "Preliminary",
        bookPart: 1,
        titleKo: "예비편 (한글과 인사말)",
        titleNe: "प्रारम्भिक पाठ (कोरियन वर्णमाला र अभिवादन)",
        titleEn: "Preliminary - Hangeul and Greetings",
        pdfUrl: prelim.pdfUrl,
        audioTracks: prelim.audioTracks || []
      });
    }
    if (appendix && !list.some(c => c.chapter === 61 || c.folder === "Appendix")) {
      list.push({
        id: 61,
        chapter: 61,
        folder: "Appendix",
        bookPart: 2,
        titleKo: "부록 (정답 및 색인)",
        titleNe: "परिशिष्ट (उत्तर तथा शब्दावली)",
        titleEn: "Appendix - Answers and Index",
        pdfUrl: appendix.pdfUrl,
        audioTracks: appendix.audioTracks || []
      });
    }
    return list;
  }, [chapters, r2Folders]);

  // Filter chapters for list view (Chapters 1 to 60; Preliminary is placed 1st and Appendix last)
  const filteredChapters = allAvailableChapters.filter((c) => {
    if (c.chapter === 0 || c.chapter === 61 || c.chapter === "Preliminary" || c.chapter === "Appendix") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.chapter.toString() === q || `ch ${c.chapter}` === q || `chapter ${c.chapter}` === q;
      const matchKo = c.titleKo?.toLowerCase().includes(q);
      const matchNe = c.titleNe?.toLowerCase().includes(q);
      const matchEn = c.titleEn?.toLowerCase().includes(q);
      return matchNum || matchKo || matchNe || matchEn;
    }
    return true;
  });

  // ========== DIRECT EDIT & UPLOAD HANDLERS (ADMIN/INSTITUTE) ==========

  // Save Chapter Title, Nepali Meaning, and Study Notes
  const handleSaveChapterInfo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!uploadModalChapter) return;

    if (!editTitleKo.trim()) {
      alert("⚠️ कृपया कोरियन शीर्षक (Korean Title) खाली नराख्नुहोस्।");
      return;
    }

    const chapterNum = uploadModalChapter.chapter;
    setIsSavingChapterInfo(true);

    try {
      const serverUpdated = await syncChapterToServer(chapterNum, {
        titleKo: editTitleKo.trim(),
        titleNe: editTitleNe.trim(),
        notes: editNotes.trim()
      });

      const updatedFields = {
        titleKo: editTitleKo.trim(),
        titleNe: editTitleNe.trim(),
        notes: editNotes.trim()
      };

      if (serverUpdated) {
        setChapters(serverUpdated);
      } else {
        const localUpdated = chapters.map((c) =>
          c.chapter === chapterNum ? { ...c, ...updatedFields } : c
        );
        setChapters(localUpdated);
        saveEps60Chapters(localUpdated);
      }

      setUploadModalChapter((prev) => (prev ? { ...prev, ...updatedFields } : prev));
      setSelectedChapter((prev) => (prev?.chapter === chapterNum ? { ...prev, ...updatedFields } : prev));

      alert(`✅ Chapter ${chapterNum} को नाम सफलतापूर्वक सेभ गरियो!\n• कोरियन: ${editTitleKo.trim()}\n• नेपाली: ${editTitleNe.trim()}`);
    } catch (err) {
      alert("⚠️ च्याप्टर नाम सेभ गर्दा त्रुटि भयो: " + err.message);
    } finally {
      setIsSavingChapterInfo(false);
    }
  };

  // Direct PDF File Upload
  const handleUploadPdfFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadModalChapter) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("⚠️ कृपया केवल PDF (.pdf) फाइल छान्नुहोस्।");
      return;
    }

    const chapterNum = uploadModalChapter.chapter;
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "x-user-role": "admin"
        }
      });
      const result = await res.json();

      if (result.success && result.url) {
        // Sync with persistent server storage so all students & institutes see it immediately
        const serverUpdated = await syncChapterToServer(chapterNum, { pdfUrl: result.url });

        if (serverUpdated) {
          setChapters(serverUpdated);
        } else {
          const localUpdated = chapters.map((c) => {
            if (c.chapter === chapterNum) {
              return { ...c, pdfUrl: result.url };
            }
            return c;
          });
          setChapters(localUpdated);
          saveEps60Chapters(localUpdated);
        }

        // Update modal & current selected chapter if open
        setUploadModalChapter((prev) => ({ ...prev, pdfUrl: result.url }));
        setSelectedChapter((prev) => {
          if (prev?.chapter === chapterNum) {
            return { ...prev, pdfUrl: result.url };
          }
          return prev;
        });

        alert(`✅ Chapter ${chapterNum} को PDF फाइल सफलतापूर्वक अपलोड भयो र सबै विद्यार्थी तथा इन्स्टिच्युटहरूका लागि सर्भरमा सुरक्षित भयो!`);
      } else {
        alert(`⚠️ Upload failed: ${result.message || result.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("⚠️ अपलोड गर्दा त्रुटि भयो: " + err.message);
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Direct Multiple Audio Files Upload
  const handleUploadAudioFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !uploadModalChapter) return;

    const chapterNum = uploadModalChapter.chapter;
    setUploadingAudio(true);
    try {
      const newTracks = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            "x-user-role": "admin"
          }
        });
        const result = await res.json();

        if (result.success && result.url) {
          const rawName = file.name.replace(/\.[^/.]+$/, "");
          const cleanName = rawName.replace(/^[0-9_-]+/, "").replace(/_/g, " ").trim();
          newTracks.push({
            id: `ch${chapterNum}-t${Date.now()}-${i}`,
            name: `Track ${(uploadModalChapter.audioTracks?.length || 0) + i + 1}: ${cleanName || "Listening Audio"}`,
            url: result.url,
            textKo: ""
          });
        }
      }

      if (newTracks.length > 0) {
        const currentTracks = uploadModalChapter.audioTracks || [];
        const combined = [...currentTracks, ...newTracks];

        // Sync with persistent server storage so all students & institutes get it
        const serverUpdated = await syncChapterToServer(chapterNum, { audioTracks: combined });

        if (serverUpdated) {
          setChapters(serverUpdated);
        } else {
          const localUpdated = chapters.map((c) => {
            if (c.chapter === chapterNum) {
              return { ...c, audioTracks: combined };
            }
            return c;
          });
          setChapters(localUpdated);
          saveEps60Chapters(localUpdated);
        }

        setUploadModalChapter((prev) => ({ ...prev, audioTracks: combined }));
        setSelectedChapter((prev) => {
          if (prev?.chapter === chapterNum) {
            return { ...prev, audioTracks: combined };
          }
          return prev;
        });

        alert(`✅ Chapter ${chapterNum} मा ${newTracks.length} वटा अडियो ट्र्याकहरू सर्भरमा सुरक्षित गरियो! अब विद्यार्थी र इन्स्टिच्युटहरूले तुरुन्त सुन्न सक्नेछन्।`);
      }
    } catch (err) {
      alert("⚠️ अडियो फाइल अपलोड त्रुटि: " + err.message);
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  // Remove audio track from chapter
  const handleRemoveAudioTrack = async (trackIndex) => {
    if (!uploadModalChapter) return;
    const chapterNum = uploadModalChapter.chapter;
    const filtered = uploadModalChapter.audioTracks.filter((_, i) => i !== trackIndex);

    // Sync with persistent server storage
    const serverUpdated = await syncChapterToServer(chapterNum, { audioTracks: filtered });

    if (serverUpdated) {
      setChapters(serverUpdated);
    } else {
      const localUpdated = chapters.map((c) => {
        if (c.chapter === chapterNum) {
          return { ...c, audioTracks: filtered };
        }
        return c;
      });
      setChapters(localUpdated);
      saveEps60Chapters(localUpdated);
    }

    setUploadModalChapter((prev) => ({ ...prev, audioTracks: filtered }));
    setSelectedChapter((prev) => {
      if (prev?.chapter === chapterNum) {
        return { ...prev, audioTracks: filtered };
      }
      return prev;
    });
  };

  // Direct Cover Image File Upload (Admin/Institute)
  const handleUploadCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadModalChapter) return;

    if (!file.type.startsWith("image/")) {
      alert("⚠️ कृपया फोटो फाइल (JPG, PNG, WebP) छान्नुहोस्।");
      return;
    }

    const chapterNum = uploadModalChapter.chapter;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: { "x-user-role": "admin" }
      });
      const result = await res.json();

      if (result.success && result.url) {
        const serverUpdated = await syncChapterToServer(chapterNum, { coverImage: result.url });
        if (serverUpdated) {
          setChapters(serverUpdated);
        } else {
          const localUpdated = chapters.map((c) =>
            c.chapter === chapterNum ? { ...c, coverImage: result.url } : c
          );
          setChapters(localUpdated);
          saveEps60Chapters(localUpdated);
        }

        setUploadModalChapter((prev) => ({ ...prev, coverImage: result.url }));
        setSelectedChapter((prev) => (prev?.chapter === chapterNum ? { ...prev, coverImage: result.url } : prev));
        alert(`✅ Chapter ${chapterNum} को कभर फोटो सफलतापूर्वक सेभ गरियो!`);
      } else {
        alert(`⚠️ Upload failed: ${result.message || result.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("⚠️ कभर फोटो अपलोड गर्दा त्रुटि: " + err.message);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Remove Cover Image (Reset to PDF 1st Page preview or default)
  const handleRemoveCoverImage = async () => {
    if (!uploadModalChapter) return;
    const chapterNum = uploadModalChapter.chapter;

    const serverUpdated = await syncChapterToServer(chapterNum, { coverImage: "" });
    if (serverUpdated) {
      setChapters(serverUpdated);
    } else {
      const localUpdated = chapters.map((c) =>
        c.chapter === chapterNum ? { ...c, coverImage: "" } : c
      );
      setChapters(localUpdated);
      saveEps60Chapters(localUpdated);
    }

    setUploadModalChapter((prev) => ({ ...prev, coverImage: "" }));
    setSelectedChapter((prev) => (prev?.chapter === chapterNum ? { ...prev, coverImage: "" } : prev));
  };

  // =========================================================================
  // 0. FULL-SCREEN DOCUMENT / MATERIAL READER VIEW
  // =========================================================================
  if (viewingMaterial) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            backgroundColor: "#1e3a8a",
            color: "#ffffff",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            flexWrap: "wrap",
            gap: "10px",
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setViewingMaterial(null)}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ← Back to Books
            </button>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800" }}>{viewingMaterial.title}</div>
              {viewingMaterial.folder && (
                <div style={{ fontSize: "12px", color: "#93c5fd" }}>
                  {viewingMaterial.folder}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setViewingMaterial(null)}
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px"
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div style={{ flex: 1, width: "100%", height: "calc(100vh - 60px)" }}>
          <iframe
            src={getCleanPdfUrl(viewingMaterial.fileUrl)}
            title={viewingMaterial.title}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 0.5. FULL-SCREEN CHAPTER MEANING BOOK READER VIEW
  // =========================================================================
  if (viewingMeaningChapter) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            backgroundColor: "#991b1b",
            color: "#ffffff",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            flexWrap: "wrap",
            gap: "10px",
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setViewingMeaningChapter(null)}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ← Back to Meaning Book
            </button>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800" }}>
                📕 Chapter {viewingMeaningChapter.chapter}: {viewingMeaningChapter.titleKo} ({viewingMeaningChapter.titleNe})
              </div>
              <div style={{ fontSize: "12px", color: "#fecaca" }}>
                {viewingMeaningChapter.titleEn || "Vocabulary & Meaning Guide"} • Book Part {viewingMeaningChapter.chapter <= 30 ? 1 : 2}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditMeaningModalChapter(viewingMeaningChapter);
                  setEditMeaningPdf(viewingMeaningChapter.meaningPdfUrl || "");
                  setEditMeaningAudio(viewingMeaningChapter.meaningAudioUrl || "");
                  setEditMeaningNotes(viewingMeaningChapter.notes || "");
                  setEditMeaningTitleKo(viewingMeaningChapter.titleKo || "");
                  setEditMeaningTitleNe(viewingMeaningChapter.titleNe || "");
                }}
                style={{
                  backgroundColor: "#f59e0b",
                  color: "#0f172a",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ✏️ Edit Chapter PDF
              </button>
            )}
            <button
              onClick={() => setViewingMeaningChapter(null)}
              style={{
                backgroundColor: "#7f1d1d",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px"
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* VIEWER AREA */}
        <div style={{ flex: 1, width: "100%", height: "calc(100vh - 60px)", overflowY: "auto", backgroundColor: "#f8fafc" }}>
          {viewingMeaningChapter.meaningPdfUrl ? (
            <iframe
              src={getCleanPdfUrl(viewingMeaningChapter.meaningPdfUrl)}
              title={`Meaning Chapter ${viewingMeaningChapter.chapter}`}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
          ) : (
            <div style={{
              maxWidth: "850px",
              margin: "40px auto",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <span style={{
                  backgroundColor: viewingMeaningChapter.chapter <= 30 ? "#fee2e2" : "#fef3c7",
                  color: viewingMeaningChapter.chapter <= 30 ? "#b91c1c" : "#b45309",
                  padding: "6px 20px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "800",
                  display: "inline-block",
                  marginBottom: "12px"
                }}>
                  Chapter {viewingMeaningChapter.chapter} (Book Part {viewingMeaningChapter.chapter <= 30 ? 1 : 2})
                </span>
                <h2 style={{ margin: "6px 0", fontSize: "28px", color: "#0f172a", fontWeight: "800" }}>
                  제{viewingMeaningChapter.chapter}과 {viewingMeaningChapter.titleKo}
                </h2>
                <h3 style={{ margin: "6px 0", fontSize: "20px", color: "#dc2626", fontWeight: "700" }}>
                  {viewingMeaningChapter.titleNe}
                </h3>
                {viewingMeaningChapter.titleEn && (
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#64748b" }}>
                    ({viewingMeaningChapter.titleEn})
                  </p>
                )}
              </div>

              {/* VOCABULARY OVERVIEW BOX */}
              <div style={{
                backgroundColor: "#fff1f2",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #fecdd3",
                marginBottom: "28px"
              }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#9f1239", fontWeight: "700" }}>
                  📖 Chapter Vocabulary & Meaning Overview (शब्दावली विवरण)
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#4c0519", lineHeight: "1.7" }}>
                  {viewingMeaningChapter.notes || `यस अध्यायमा EPS-TOPIK Korean 60 Book अन्तर्गत Chapter ${viewingMeaningChapter.chapter} (${viewingMeaningChapter.titleKo} - ${viewingMeaningChapter.titleNe}) का दैनिक जीवन तथा परीक्षामा आउने सम्पूर्ण महत्त्वपूर्ण शब्दहरू समावेश छन्।`}
                </p>
              </div>

              {/* ADMIN UPLOAD CALLOUT */}
              {isAdmin && (
                <div style={{
                  backgroundColor: "#f0fdf4",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "2px dashed #86efac",
                  textAlign: "center",
                  marginBottom: "24px"
                }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "17px", fontWeight: "800" }}>
                    📤 Super Admin: Attach Meaning Book PDF Document
                  </h4>
                  <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#15803d" }}>
                    Upload Chapter {viewingMeaningChapter.chapter} official meaning book PDF so students can study full-screen.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMeaningModalChapter(viewingMeaningChapter);
                      setEditMeaningPdf(viewingMeaningChapter.meaningPdfUrl || "");
                      setEditMeaningAudio(viewingMeaningChapter.meaningAudioUrl || "");
                      setEditMeaningNotes(viewingMeaningChapter.notes || "");
                      setEditMeaningTitleKo(viewingMeaningChapter.titleKo || "");
                      setEditMeaningTitleNe(viewingMeaningChapter.titleNe || "");
                    }}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "11px 24px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(22,163,74,0.3)"
                    }}
                  >
                    + Upload Chapter {viewingMeaningChapter.chapter} Meaning PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ATTACHED AUDIO BAR IF AVAILABLE */}
        {viewingMeaningChapter.meaningAudioUrl && (
          <div style={{
            backgroundColor: "#1e293b",
            borderTop: "1px solid #334155",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "bold" }}>
              🎧 Chapter Vocabulary Audio:
            </span>
            <audio controls src={viewingMeaningChapter.meaningAudioUrl} style={{ flex: 1, maxHeight: "36px" }} />
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 1. FULL-SCREEN WIPED DISPLAY VIEW (CLEAN, NO MENUS, DROPDOWN LISTENING)
  // =========================================================================
  if (selectedChapter) {
    const hasAudio = selectedChapter.audioTracks && selectedChapter.audioTracks.length > 0;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 99999,
          overflow: "hidden",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {/* ================= 0. TRANSPARENT BACKDROP TO SHRINK AUDIO PLAYER ON OUTSIDE CLICK ================= */}
        {popupMode === "full" && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setPopupMode("gesture");
              setShowTrackDropdown(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setPopupMode("gesture");
              setShowTrackDropdown(false);
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 100004,
              background: "transparent",
              cursor: "default"
            }}
          />
        )}

        {/* ================= 1. DRAGGABLE & RESPONSIVE FLOATING POPUP AUDIO PLAYER (FULL FORMAT) ================= */}
        {popupMode === "full" && (
          <div
            ref={popupContainerRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{
              position: "fixed",
              left: `${popupPos.x}px`,
              top: `${popupPos.y}px`,
              zIndex: 100005,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ffffff",
              border: "2px solid #2563eb",
              borderRadius: "16px",
              padding: "8px 12px",
              boxShadow: "0 10px 35px rgba(0, 0, 0, 0.25), 0 2px 10px rgba(37, 99, 235, 0.25)",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              maxWidth: "calc(100vw - 20px)",
              boxSizing: "border-box",
              flexWrap: "wrap"
            }}
          >
            {/* DRAG HANDLE */}
            <div
              title="Drag to move anywhere on screen"
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 2px",
                fontSize: "14px",
                userSelect: "none",
                flexShrink: 0
              }}
            >
              ⠿
            </div>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeFullScreen();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title="Return to Chapter List"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                color: "#ffffff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 8px rgba(29, 78, 216, 0.35)",
                flexShrink: 0
              }}
            >
              <span>⬅</span> Back
            </button>

            {/* CHAPTER TITLE & CRISP BADGE */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
                maxWidth: "220px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    whiteSpace: "nowrap"
                  }}
                >
                  Ch {selectedChapter.chapter}
                </span>
                <span
                  style={{
                    fontWeight: "800",
                    fontSize: "13px",
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {selectedChapter.titleKo}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#1d4ed8",
                  fontWeight: "600",
                  marginTop: "1px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {selectedChapter.titleNe}
              </div>
            </div>

            {/* AUDIO CONTROLS (PILL WITH PLAY + DROPDOWN, SEEKBAR, TIME, SPEED) */}
            {hasAudio && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                {/* UPPER: BLUE PILL (PLAY/PAUSE + TRACK DROPDOWN) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "1.5px solid #93c5fd",
                    borderRadius: "24px",
                    padding: "3px 8px 3px 4px",
                    boxShadow: "0 2px 10px rgba(29, 78, 216, 0.3)"
                  }}
                >
                  {/* PLAY / PAUSE BUTTON */}
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title={isPlaying ? "Click to Pause Audio" : "Click to Play Audio"}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      color: "#1d4ed8",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: isPlaying ? "12px" : "14px",
                      fontWeight: "900",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      flexShrink: 0,
                      transition: "transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>

                  {/* TRACK DROPDOWN */}
                  <div style={{ position: "relative" }} ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTrackDropdown(!showTrackDropdown);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      title="Select Audio Track"
                      style={{
                        background: "rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.35)",
                        borderRadius: "16px",
                        padding: "4px 9px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                      <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeTrack?.name || `Track ${currentTrackIndex + 1}`}
                      </span>
                      <span style={{ fontSize: "9px", color: "#bfdbfe" }}>{showTrackDropdown ? "▲" : "▼"}</span>
                    </button>

                    {/* DROPDOWN MENU */}
                    {showTrackDropdown && (
                      <>
                        {/* BACKDROP TO AUTO-HIDE ON OUTSIDE CLICK */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTrackDropdown(false);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setShowTrackDropdown(false);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            setShowTrackDropdown(false);
                          }}
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 100005,
                            background: "transparent"
                          }}
                        />
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            top: "34px",
                            right: 0,
                            width: "280px",
                            backgroundColor: "#ffffff",
                            border: "2px solid #2563eb",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                            zIndex: 100010,
                            overflow: "hidden"
                          }}
                        >
                          <div style={{
                            padding: "8px 12px",
                            background: "#eff6ff",
                            borderBottom: "1px solid #bfdbfe",
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "#1d4ed8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}>
                            <span>Chapter {selectedChapter.chapter} Audio Tracks:</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "10px", color: "#2563eb" }}>Auto-play</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowTrackDropdown(false);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#64748b",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  padding: "0 2px",
                                  lineHeight: 1
                                }}
                                title="Close"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                            {selectedChapter.audioTracks.map((track, idx) => {
                              const isCurrent = idx === currentTrackIndex;
                              return (
                                <div
                                  key={track.id || idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTrackDropdown(false);
                                    handleSelectTrack(idx);
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setShowTrackDropdown(false);
                                    handleSelectTrack(idx);
                                  }}
                                  style={{
                                    padding: "8px 10px",
                                    background: isCurrent ? "#dbeafe" : "transparent",
                                    color: isCurrent ? "#1d4ed8" : "#1e293b",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f1f5f9",
                                    borderLeft: isCurrent ? "3px solid #1d4ed8" : "3px solid transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    fontWeight: isCurrent ? "700" : "500"
                                  }}
                                >
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                                    {isCurrent ? "▶ " : ""}{track.name}
                                  </span>
                                  <span style={{
                                    fontSize: "10px",
                                    padding: "2px 5px",
                                    borderRadius: "4px",
                                    background: isCurrent ? "#1d4ed8" : "#f1f5f9",
                                    color: isCurrent ? "#ffffff" : "#64748b",
                                    fontWeight: "bold"
                                  }}>
                                    {isCurrent ? "Playing" : `Track ${idx + 1}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* LOWER: SEEKBAR + TIME + SKIP BUTTONS + SPEED */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = Number(e.target.value);
                      setCurrentTime(newTime);
                      if (audioRef.current) audioRef.current.currentTime = newTime;
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    style={{
                      width: "80px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                      height: "4px"
                    }}
                  />
                  <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace", minWidth: "30px", fontWeight: "600" }}>
                    {formatTime(currentTime)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekBy(-5);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Rewind 5s"
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "10px",
                      padding: "2px 5px",
                      color: "#475569",
                      fontWeight: "bold"
                    }}
                  >
                    ⏪
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekBy(5);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Forward 5s"
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "10px",
                      padding: "2px 5px",
                      color: "#475569",
                      fontWeight: "bold"
                    }}
                  >
                    ⏩
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cyclePlaybackRate(e);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Playback Speed"
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      border: "1px solid #bfdbfe",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {playbackRate}x
                  </button>
                </div>
              </div>
            )}

            {/* ADMIN / INSTITUTE UPLOAD BUTTON */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openUploadModal(selectedChapter);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="Upload Chapter Audio / PDF"
                style={{
                  backgroundColor: "#f59e0b",
                  color: "#0f172a",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                }}
              >
                📤 Upload
              </button>
            )}

            {/* WINDOW ACTIONS: MINIMIZE TO GESTURE TRIGGER & CLOSE/REMOVE */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, marginLeft: "4px" }}>
              {/* MINIMIZE TO GESTURE TRIGGER ("one gesture ko under ma rakhnu") */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupMode("gesture");
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="Minimize Audio Player to Gesture Trigger"
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ─
              </button>

              {/* CLOSE TO GESTURE TRIGGER */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupMode("gesture");
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                title="Close Player to Gesture Trigger"
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* CSS KEYFRAMES FOR AUDIO PULSING GLOW WHEN PLAYING */}
        <style>{`
          @keyframes pulseAudioGlow {
            0% {
              box-shadow: 0 0 14px rgba(16, 185, 129, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 28px rgba(16, 185, 129, 0.95), 0 6px 18px rgba(0, 0, 0, 0.4);
              transform: scale(1.05);
            }
            100% {
              box-shadow: 0 0 14px rgba(16, 185, 129, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3);
              transform: scale(1);
            }
          }
        `}</style>

        {/* ================= 2. MOVABLE CIRCULAR AUDIO BUTTON (DEFAULT BELOW BACK BUTTON) ================= */}
        {hasAudio && popupMode !== "full" && (
          <div
            ref={miniAudioBtnRef}
            onMouseDown={handleMiniDragStart}
            onTouchStart={handleMiniDragStart}
            onClick={(e) => {
              e.stopPropagation();
              if (!miniDragRef.current.moved) {
                const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
                const targetX = Math.min(Math.max(14, miniAudioPos.x), winW - 360);
                const targetY = Math.max(14, miniAudioPos.y < 200 ? miniAudioPos.y : miniAudioPos.y - 70);
                setPopupPos({ x: targetX, y: targetY });
                setPopupMode("full");
              }
            }}
            onTouchEnd={() => {
              if (!miniDragRef.current.moved) {
                const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
                const targetX = Math.min(Math.max(14, miniAudioPos.x), winW - 360);
                const targetY = Math.max(14, miniAudioPos.y < 200 ? miniAudioPos.y : miniAudioPos.y - 70);
                setPopupPos({ x: targetX, y: targetY });
                setPopupMode("full");
              }
            }}
            title={isPlaying ? "Audio is Playing (Click to Open Controls, Drag to Move)" : "Audio (Click to Open Player, Drag to Move)"}
            style={{
              position: "fixed",
              left: `${miniAudioPos.x}px`,
              top: `${miniAudioPos.y}px`,
              zIndex: 100015,
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: isPlaying
                ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" // Vibrant Emerald Green when playing!
                : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", // Crisp Royal Blue by default!
              color: "#ffffff",
              border: isPlaying ? "3px solid #6ee7b7" : "3px solid #93c5fd",
              boxShadow: isPlaying
                ? "0 0 24px rgba(16, 185, 129, 0.75), 0 6px 16px rgba(0, 0, 0, 0.4)"
                : "0 8px 24px rgba(37, 99, 235, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3)",
              cursor: isMiniDragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
              transition: isMiniDragging ? "none" : "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease",
              animation: isPlaying ? "pulseAudioGlow 2s infinite ease-in-out" : "none"
            }}
          >
            {/* Headphone SVG icon matching user mockup */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                transform: isPlaying ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.2s ease"
              }}
            >
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            {/* Text: AUDIO */}
            <span
              style={{
                fontSize: "10px",
                fontWeight: "900",
                letterSpacing: "0.8px",
                marginTop: "1px",
                lineHeight: 1,
                fontFamily: "system-ui, -apple-system, sans-serif",
                textShadow: "0 1px 2px rgba(0,0,0,0.4)"
              }}
            >
              AUDIO
            </span>
          </div>
        )}

        {/* ================= 3. FLOATING DISCRETE BACK BUTTON (TOP-LEFT) ================= */}
        <button
          type="button"
          onClick={closeFullScreen}
          title="Exit Fullscreen (Esc)"
          style={{
            position: "fixed",
            top: "14px",
            left: "14px",
            zIndex: 100010,
            background: "rgba(15, 23, 42, 0.85)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(8px)",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#0284c7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.85)"; }}
        >
          <span>⬅</span>
          <span>Back</span>
        </button>

        {/* ================= 4. PURE 100% FULL BROWSER PDF VIEW (NO BROWSER TOOLBAR, MAXIMUM FULLSCREEN FIT) ================= */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#0f172a",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          zIndex: 1
        }}>
          {(activePdfBlobUrl || selectedChapter.pdfUrl) ? (
            <div style={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              overflow: "hidden"
            }}>
              <iframe
                key={activePdfBlobUrl || selectedChapter.pdfUrl}
                src={getCleanPdfUrl(activePdfBlobUrl || selectedChapter.pdfUrl)}
                title={`EPS Book Chapter ${selectedChapter.chapter}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  border: "none",
                  margin: 0,
                  padding: 0,
                  display: "block",
                  backgroundColor: "#0f172a",
                  outline: "none"
                }}
              />
            </div>
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              color: "#0f172a",
              backgroundColor: "#ffffff",
              textAlign: "center"
            }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h2 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "22px" }}>
                Chapter {selectedChapter.chapter}: {selectedChapter.titleKo}
              </h2>
              <p style={{ margin: "0 0 20px 0", color: "#475569", fontSize: "15px", maxWidth: "500px" }}>
                {selectedChapter.titleNe}
              </p>

              <div style={{
                backgroundColor: "#f8fafc",
                border: "1.5px solid #ec4899",
                borderRadius: "12px",
                padding: "20px",
                maxWidth: "600px",
                width: "100%",
                textAlign: "left",
                marginBottom: "20px",
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.15)"
              }}>
                <div style={{ color: "#2563eb", fontWeight: "bold", fontSize: "13px", marginBottom: "8px" }}>
                  Study Notes & Key Vocabulary:
                </div>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "#334155", whiteSpace: "pre-line" }}>
                  {selectedChapter.notes || "No extra study notes entered."}
                </p>
              </div>

              {isAdmin && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={() => openUploadModal(selectedChapter)}
                    style={{
                      background: "linear-gradient(135deg, #ec4899 0%, #2563eb 100%)",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4), 0 0 20px rgba(37, 99, 235, 0.3)"
                    }}
                  >
                    📁 Upload PDF File for Chapter {selectedChapter.chapter}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIVE HTML5 AUDIO ENGINE WITH HARDWARE SYNC */}
        {activeTrack && (
          <audio
            ref={audioRef}
            src={getPlayableAudioUrl(activeTrack)}
            onPlay={() => {
              setIsPlaying(true);
              setShowTrackDropdown(false);
            }}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
                audioRef.current.playbackRate = playbackRate;
                if (isPlaying) {
                  audioRef.current.play().catch(() => { });
                }
              }
            }}
            onEnded={() => {
              // Do NOT continuously play all tracks automatically; play only selected track and stop when finished
              setIsPlaying(false);
              setCurrentTime(0);
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            onError={(e) => {
              console.warn("Audio playback error:", e);
              setIsPlaying(false);
            }}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN CLEAN 60 CHAPTERS GRID VIEW (BEFORE FULL-SCREEN)
  // =========================================================================
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#1e293b", width: "100%" }}>
      {/* GLOBAL BOOK LIBRARY TABS CSS - APPLIED TO BOTH KOREAN & JAPANESE STUDY MATERIALS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .book-tabs-container {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 18px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
          margin-bottom: 24px;
          width: 100%;
          box-sizing: border-box;
        }
        .book-tabs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .book-library-tab-card {
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease !important;
          box-sizing: border-box !important;
          width: 100% !important;
        }
        .book-library-tab-card:hover {
          transform: translateY(-2px) !important;
        }
        .book-library-tab-card:active {
          transform: translateY(0px) !important;
        }
        .book-library-tab-card:focus {
          outline: none !important;
        }

        /* ── RESPONSIVE ADAPTATIONS FOR ALL DEVICES ── */
        @media (max-width: 1200px) {
          .book-tabs-grid {
            gap: 12px !important;
          }
        }
        @media (max-width: 900px) {
          .book-tabs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .book-tabs-container {
            padding: 12px !important;
          }
        }
        @media (max-width: 600px) {
          .book-tabs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .book-tabs-container {
            padding: 10px !important;
            border-radius: 14px !important;
            margin-bottom: 16px !important;
          }
          .book-library-tab-card {
            padding: 10px 8px 14px 8px !important;
            border-radius: 12px !important;
          }
          .book-tab-title {
            font-size: 13px !important;
          }
          .book-tab-badge {
            font-size: 10px !important;
            padding: 3px 8px !important;
          }
        }
        @media (max-width: 380px) {
          .book-tabs-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      ` }} />
      {/* TOP LANGUAGE TRACK NAVIGATION BAR: Korean Study Materials & Japanese Study Materials */}
      {/* TOP LANGUAGE TRACK NAVIGATION BAR: Korean Study Materials & Japanese Study Materials */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        marginBottom: "24px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eff6ff 100%)",
        padding: "16px 20px",
        borderRadius: "20px",
        border: "1.5px solid #dbeafe",
        boxShadow: "0 4px 20px rgba(37, 99, 235, 0.06)",
        width: "100%",
        boxSizing: "border-box"
      }}>
        {/* Centered Toggle between Korean & Japanese */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "5px",
          borderRadius: "16px",
          gap: "6px",
          border: "1.5px solid #cbd5e1",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(0, 0, 0, 0.02)",
          margin: "0 auto",
          flexWrap: "wrap",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}>
          {/* KOREAN STUDY MATERIALS */}
          {(effectiveInstLang === "both" || effectiveInstLang === "korean") && (
            <button
              type="button"
              onClick={() => {
                if (effectiveInstLang === "both") {
                  setStudyLanguage(studyLanguage === "korean" ? "both" : "korean");
                } else {
                  setStudyLanguage("korean");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: studyLanguage === "korean" ? "#2563eb" : (studyLanguage === "both" ? "#eff6ff" : "transparent"),
                backgroundImage: studyLanguage === "korean" ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "none",
                color: studyLanguage === "korean" ? "#ffffff" : (studyLanguage === "both" ? "#1d4ed8" : "#475569"),
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                boxShadow: studyLanguage === "korean" ? "0 4px 14px rgba(37, 99, 235, 0.35)" : (studyLanguage === "both" ? "0 2px 8px rgba(37, 99, 235, 0.15)" : "none"),
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (studyLanguage !== "korean") {
                  e.currentTarget.style.backgroundColor = studyLanguage === "both" ? "#dbeafe" : "#f1f5f9";
                  e.currentTarget.style.color = "#0f172a";
                }
              }}
              onMouseLeave={(e) => {
                if (studyLanguage !== "korean") {
                  e.currentTarget.style.backgroundColor = studyLanguage === "both" ? "#eff6ff" : "transparent";
                  e.currentTarget.style.color = studyLanguage === "both" ? "#1d4ed8" : "#475569";
                }
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: "1" }}>🇰🇷</span>
              <span>Korean</span>
            </button>
          )}

          {/* JAPANESE STUDY MATERIALS */}
          {(effectiveInstLang === "both" || effectiveInstLang === "japanese") && (
            <button
              type="button"
              onClick={() => {
                if (effectiveInstLang === "both") {
                  setStudyLanguage(studyLanguage === "japanese" ? "both" : "japanese");
                } else {
                  setStudyLanguage("japanese");
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: studyLanguage === "japanese" ? "#9333ea" : (studyLanguage === "both" ? "#fdf4ff" : "transparent"),
                backgroundImage: studyLanguage === "japanese" ? "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)" : "none",
                color: studyLanguage === "japanese" ? "#ffffff" : (studyLanguage === "both" ? "#9333ea" : "#475569"),
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "all 0.18s ease-in-out",
                boxShadow: studyLanguage === "japanese" ? "0 4px 14px rgba(147, 51, 234, 0.35)" : (studyLanguage === "both" ? "0 2px 8px rgba(147, 51, 234, 0.15)" : "none"),
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (studyLanguage !== "japanese") {
                  e.currentTarget.style.backgroundColor = studyLanguage === "both" ? "#fae8ff" : "#f1f5f9";
                  e.currentTarget.style.color = "#0f172a";
                }
              }}
              onMouseLeave={(e) => {
                if (studyLanguage !== "japanese") {
                  e.currentTarget.style.backgroundColor = studyLanguage === "both" ? "#fdf4ff" : "transparent";
                  e.currentTarget.style.color = studyLanguage === "both" ? "#9333ea" : "#475569";
                }
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: "1" }}>🇯🇵</span>
              <span>Japanese</span>
            </button>
          )}
        </div>

        {/* Action Controls for Admin (Centered below) */}
        {isAdmin && (
          <div style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            paddingTop: "6px",
            borderTop: "1px dashed #e2e8f0",
            width: "100%"
          }}>
            <button
              type="button"
              onClick={() => {
                setMatFolder(
                  studyLanguage === "japanese"
                    ? activeJapaneseFolder
                    : (activeFolder !== "EPS Book" ? activeFolder : "Meaning Book")
                );
                setIsUploadMaterialOpen(true);
              }}
              style={{
                backgroundColor: "#16a34a",
                backgroundImage: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 3px 10px rgba(22, 163, 74, 0.35)",
                transition: "all 0.15s ease"
              }}
            >
              <span>➕</span>
              <span>Upload Material</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddFolderOpen(true)}
              style={{
                backgroundColor: "#ffffff",
                color: "#334155",
                border: "1.5px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
              }}
            >
              <span>📁</span>
              <span>New Folder</span>
            </button>

            {/* Edit Chapter if Admin on Korean EPS Book */}
            {(studyLanguage === "korean" || studyLanguage === "both") && activeFolder === "EPS Book" && (
              <button
                type="button"
                onClick={() => openUploadModal(chapters[0] || { chapter: 1 })}
                title="Edit PDF, Audio, Cover and Titles for any chapter"
                style={{
                  backgroundColor: "#10b981",
                  backgroundImage: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 3px 10px rgba(5, 150, 105, 0.35)",
                  transition: "all 0.15s ease"
                }}
              >
                <span>✏️</span>
                <span>Edit Chapter</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. KOREAN STUDY MATERIALS SECTION */}
      {/* ============================================================== */}
      {(studyLanguage === "korean" || studyLanguage === "both") && (
        <div style={{ marginBottom: studyLanguage === "both" ? "40px" : "0" }}>
          {studyLanguage === "both" && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              padding: "12px 18px",
              backgroundColor: "#eff6ff",
              borderRadius: "14px",
              border: "1.5px solid #bfdbfe",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.06)"
            }}>
              <span style={{ fontSize: "26px", lineHeight: "1" }}>🇰🇷</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#1e3a8a" }}>
                  Korean Study Materials
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  EPS-TOPIK Book 1 &amp; 2 (60 Chapters), Meaning Book, Question Bank, and Grammar Guide
                </span>
              </div>
            </div>
          )}

          {/* Korean Folder Selection Tabs (Shown when NO folder is entered) */}
          {!isKoreanFolderOpen && (
          <div
            className="book-tabs-container"
            style={{
              backgroundColor: "#ffffff",
              padding: "16px",
              borderRadius: "18px",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              marginBottom: "24px",
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            <div
              className="book-tabs-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
                width: "100%",
                boxSizing: "border-box"
              }}
            >
            {folders.map(folder => {
              let badgeText = "";

              if (folder.name === "EPS Book") {
                badgeText = "60 Chapters";
              } else if (folder.name === "Meaning Book") {
                badgeText = "60 Chapters";
              } else if (folder.name === "Model Question Bank") {
                const countSets = (ubtSets && ubtSets.length) || 6;
                badgeText = `${countSets} Sets`;
              } else if (folder.name === "Grammar Book") {
                badgeText = "Grammar Guide";
              } else {
                const count = materials.filter(m => m.folder === folder.name).length;
                badgeText = `${count} ${count === 1 ? 'Material' : 'Materials'}`;
              }

              const theme = {
                primary: "#2563eb",
                activeBorder: "#2563eb",
                activeBg: "#ffffff",
                activeShadow: "0 8px 22px rgba(37, 99, 235, 0.12)",
                titleActive: "#0f172a",
                badgeActiveBg: "#2563eb",
                badgeActiveColor: "#ffffff",
                badgeActiveBorder: "1px solid #2563eb",
                badgeActiveShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                badgeInactiveBg: "#f1f5f9",
                badgeInactiveColor: "#475569",
                badgeInactiveBorder: "1px solid #e2e8f0",
                hoverBorder: "#cbd5e1"
              };

              const isActive = activeFolder === folder.name;
              const coverImage = getFolderCover(folder);

              return (
                <button
                  key={folder.id || folder.name}
                  type="button"
                  className="book-library-tab-card"
                  onClick={() => {
                    setActiveFolder(folder.name);
                    setIsKoreanFolderOpen(true);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "14px 14px 18px 14px",
                    borderRadius: "16px",
                    border: "3px solid",
                    borderColor: isActive ? theme.activeBorder : "#e2e8f0",
                    background: isActive ? theme.activeBg : "#ffffff",
                    cursor: "pointer",
                    position: "relative",
                    outline: "none",
                    userSelect: "none",
                    boxSizing: "border-box",
                    width: "100%",
                    boxShadow: isActive ? theme.activeShadow : "0 2px 8px rgba(15, 23, 42, 0.04)",
                    flexShrink: 0
                  }}
                >
                  {/* BOOK COVER PHOTO CONTAINER - FULL IMAGE WITH UNCLIPPED BORDERS */}
                  <div style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    maxHeight: "260px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    padding: "6px",
                    boxSizing: "border-box",
                    position: "relative",
                    boxShadow: isActive ? theme.activeShadow : "0 4px 12px rgba(15, 23, 42, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <img
                      src={coverImage}
                      alt={folder.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        display: "block"
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/books/eps-book-cover.jpg";
                      }}
                    />
                  </div>

                  {/* TEXT BELOW COVERS */}
                  <div style={{
                    marginTop: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: "6px"
                  }}>
                    <span className="book-tab-title" style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: isActive ? theme.titleActive : "#0f172a",
                      lineHeight: "1.3"
                    }}>
                      {folder.name}
                    </span>

                    <span className="book-tab-badge" style={{
                      background: isActive ? theme.badgeActiveBg : theme.badgeInactiveBg,
                      color: isActive ? theme.badgeActiveColor : theme.badgeInactiveColor,
                      border: isActive ? theme.badgeActiveBorder : theme.badgeInactiveBorder,
                      boxShadow: isActive ? theme.badgeActiveShadow : "none",
                      fontSize: "12px",
                      padding: "4px 14px",
                      borderRadius: "16px",
                      fontWeight: "800",
                      letterSpacing: "0.2px",
                      whiteSpace: "nowrap",
                      display: "inline-block"
                    }}>
                      {badgeText}
                    </span>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
          )}

          {/* ACTIVE KOREAN BOOK TOP BAR (Visible when entered inside a specific book) */}
          {isKoreanFolderOpen && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 18px",
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1.5px solid #dbeafe",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.06)",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setIsKoreanFolderOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1.5px solid #bfdbfe",
                    borderRadius: "10px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.08)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dbeafe";
                    e.currentTarget.style.transform = "translateX(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#eff6ff";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "900" }}>←</span>
                  <span>Back to Study Materials</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🇰🇷</span>
                  <span style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
                    {activeFolder}
                  </span>
                  <span style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "2px 10px",
                    borderRadius: "12px"
                  }}>
                    Opened
                  </span>
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                Click &ldquo;Back to Study Materials&rdquo; to switch books
              </div>
            </div>
          )}

          {/* RENDER EPS BOOK SECTION IF ACTIVE AND OPEN */}
          {isKoreanFolderOpen && activeFolder === "EPS Book" && (
            <>
              {/* SEARCH BAR (CLEAN & SIMPLE) */}
              <div style={{
                backgroundColor: "white",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "12px", top: "11px", color: "#64748b" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search by chapter number or topic (e.g. 14, 비빔밥, खाना, नमस्ते)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 38px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8fafc"
                    }}
                  />
                </div>
              </div>

              {/* 60 CHAPTERS CLEAN GRID WITH PRELIMINARY FIRST & APPENDIX LAST */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                marginBottom: "40px"
              }}>
                {/* 🔰 PRELIMINARY (예비편) CARD - FIRST AS CHAPTER 1 */}
                {(!searchQuery || "preliminary 예비편 한글 인사말 0".includes(searchQuery.toLowerCase())) && (
                  <div
                    onClick={() => {
                      const prelim = r2Folders.find(f => f.folder === "Preliminary") || {
                        chapter: "Preliminary",
                        titleKo: "예비편 (한글과 인사말)",
                        titleNe: "प्रारम्भिक पाठ (कोरियन वर्णमाला र अभिवादन)",
                        titleEn: "Preliminary - Hangeul and Greetings",
                        pdfUrl: "/api/r2/books/EPS_TOPIK_Unit_Wise_Parts/Preliminary/Preliminary%20-%20Hangeul%20and%20Greetings.pdf",
                        audioTracks: []
                      };
                      openChapterFullScreen(prelim);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(16, 185, 129, 0.18)";
                      e.currentTarget.style.borderColor = "#10b981";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    title="Click to open Preliminary (예비편) in Full Screen"
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      border: "1.5px solid #d1fae5",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                          padding: "4px 14px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          display: "inline-block"
                        }}>
                          🔰 Preliminary (예비편)
                        </span>
                      </div>

                      <ChapterCover
                        chapter="0"
                        titleKo="예비편 (한글과 인사말)"
                        titleNe="प्रारम्भिक पाठ (कोरियन वर्णमाला र अभिवादन)"
                        coverImage="/uploads/eps-chapters/covers/cover_00.jpg"
                        pdfUrl="/api/r2/books/EPS_TOPIK_Unit_Wise_Parts/Preliminary/Preliminary%20-%20Hangeul%20and%20Greetings.pdf"
                        bookPart={1}
                        height="195px"
                        margin="10px 0 12px 0"
                        onClick={(e) => {
                          if (e && e.stopPropagation) e.stopPropagation();
                          const prelim = r2Folders.find(f => f.folder === "Preliminary") || {
                            chapter: "Preliminary",
                            titleKo: "예비편 (한글과 인사말)",
                            titleNe: "प्रारम्भिक पाठ (कोरियन वर्णमाला र अभिवादन)",
                            titleEn: "Preliminary - Hangeul and Greetings",
                            pdfUrl: "/api/r2/books/EPS_TOPIK_Unit_Wise_Parts/Preliminary/Preliminary%20-%20Hangeul%20and%20Greetings.pdf",
                            audioTracks: []
                          };
                          openChapterFullScreen(prelim);
                        }}
                      />

                      <div style={{ textAlign: "center", marginTop: "6px" }}>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "bold", color: "#0f172a" }}>
                          예비편 (한글과 인사말)
                        </h3>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.4" }}>
                          प्रारम्भिक पाठ (कोरियन वर्णमाला र अभिवादन)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {filteredChapters.map((c) => {
                  return (
                    <div
                      key={c.id || c.chapter}
                      onClick={() => openChapterFullScreen(c)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(2, 132, 199, 0.15)";
                        e.currentTarget.style.borderColor = "#38bdf8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                      title={`Click to open Chapter ${c.chapter} in Full Screen`}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        userSelect: "none"
                      }}
                    >
                      <div>
                        {/* CHAPTER HEADER: Centered for all roles, PDF and Audio badges removed */}
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{
                            backgroundColor: c.chapter <= 30 ? "#dbeafe" : "#fef3c7",
                            color: c.chapter <= 30 ? "#1d4ed8" : "#b45309",
                            padding: "5px 20px",
                            borderRadius: "16px",
                            fontSize: "13px",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            border: c.chapter <= 30 ? "1px solid #bfdbfe" : "1px solid #fde68a"
                          }}>
                            Chapter {c.chapter}
                          </span>
                        </div>

                        {/* CHAPTER COVER / FIRST PAGE PREVIEW */}
                        <ChapterCover
                          chapter={c.chapter}
                          titleKo={c.titleKo}
                          titleNe={c.titleNe}
                          pdfUrl={c.pdfUrl}
                          coverImage={c.coverImage}
                          bookPart={c.chapter <= 30 ? 1 : 2}
                          height="195px"
                          margin="10px 0 12px 0"
                          onClick={(e) => {
                            if (e && e.stopPropagation) e.stopPropagation();
                            openChapterFullScreen(c);
                          }}
                        />

                        <div style={{ textAlign: "center", marginTop: "6px" }}>
                          <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "bold", color: "#0f172a", textAlign: "center" }}>
                            {c.titleKo}
                          </h3>
                          <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.4", textAlign: "center" }}>
                            {c.titleNe}
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {/* 📑 APPENDIX (부록) CARD - LAST IN CHAPTER GRID */}
                {(!searchQuery || "appendix 부록 answers vocabulary index 정답 색인 61".includes(searchQuery.toLowerCase())) && (
                  <div
                    onClick={() => {
                      const appendix = r2Folders.find(f => f.folder === "Appendix") || {
                        chapter: "Appendix",
                        titleKo: "부록",
                        titleNe: "परिशिष्ट",
                        titleEn: "Appendix",
                        pdfUrl: "/api/r2/books/EPS_TOPIK_Unit_Wise_Parts/Appendix/Appendix%20-%20Answers%20and%20Index.pdf",
                        audioTracks: []
                      };
                      openChapterFullScreen(appendix);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(139, 92, 246, 0.18)";
                      e.currentTarget.style.borderColor = "#8b5cf6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    title="Click to open Appendix (부록) in Full Screen"
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      border: "1.5px solid #ede9fe",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{
                          backgroundColor: "#ede9fe",
                          color: "#5b21b6",
                          padding: "4px 14px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "800",
                          display: "inline-block"
                        }}>
                          Appendix
                        </span>
                      </div>

                      <ChapterCover
                        chapter="App"
                        titleKo="부록"
                        titleNe="परिशिष्ट"
                        coverImage="/uploads/eps-chapters/covers/cover_61.jpg"
                        pdfUrl="/api/r2/books/EPS_TOPIK_Unit_Wise_Parts/Appendix/Appendix%20-%20Answers%20and%20Index.pdf"
                        bookPart={2}
                        height="195px"
                        margin="10px 0 12px 0"
                        onClick={(e) => {
                          if (e && e.stopPropagation) e.stopPropagation();
                          const appendix = r2Folders.find(f => f.folder === "Appendix") || {
                            chapter: "Appendix",
                            titleKo: "부록",
                            titleNe: "परिशिष्ट",
                            titleEn: "Appendix",
                            pdfUrl: "/api/r2/books/EPS_TOPIK_Unit_Wise_Parts/Appendix/Appendix%20-%20Answers%20and%20Index.pdf",
                            audioTracks: []
                          };
                          openChapterFullScreen(appendix);
                        }}
                      />

                      <div style={{ textAlign: "center", marginTop: "6px" }}>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "bold", color: "#0f172a" }}>
                          부록
                        </h3>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.4" }}>
                          परिशिष्ट
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* 2. RENDER MEANING BOOK SECTION (CHAPTER 1 TO 60 CHAPTERWISE)   */}
          {/* ============================================================== */}
          {isKoreanFolderOpen && activeFolder === "Meaning Book" && (
            <KoreanMeaningBookView
              meaningChapters={meaningChapters}
              isAdmin={isAdmin}
              onOpenEditModal={(c) => {
                setEditMeaningModalChapter(c);
                setEditMeaningPdf(c.meaningPdfUrl || "");
                setEditMeaningAudio(c.meaningAudioUrl || "");
                setEditMeaningNotes(c.notes || "");
                setEditMeaningTitleKo(c.titleKo || "");
                setEditMeaningTitleNe(c.titleNe || "");
              }}
              getCleanPdfUrl={getCleanPdfUrl}
            />
          )}

          {/* ============================================================== */}
          {/* 3. RENDER MODEL QUESTION BANK SECTION      {/* ============================================================== */}
          {/* 3. RENDER MODEL QUESTION BANK SECTION (UBT SETS, NO PDFS)     */}
          {/* ============================================================== */}
          {isKoreanFolderOpen && activeFolder === "Model Question Bank" && (() => {
            // STRICTLY FILTER OUT CHAPTERWISE SETS
            const filteredUbtSets = ubtSets.filter((s) => {
              const combined = `${s.name || ''} ${s.packageName || ''}`.toLowerCase();
              if (combined.includes('chapter') || combined.includes('chapterwise')) return false;
              if (ubtSearchQuery.trim()) {
                const q = ubtSearchQuery.toLowerCase().trim();
                const matchName = (s.name || "").toLowerCase().includes(q);
                const matchPkg = (s.packageName || "").toLowerCase().includes(q);
                return matchName || matchPkg;
              }
              return true;
            });

            return (
              <div style={{ marginBottom: "40px" }}>
                {/* BANNER */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "24px 28px",
                  marginBottom: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "#fff7ed",
                      color: "#ea580c"
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>
                        Model Question Bank
                      </h3>
                      <span style={{
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #dbeafe",
                        fontSize: "12px",
                        fontWeight: "800",
                        padding: "3px 10px",
                        borderRadius: "12px"
                      }}>
                        {filteredUbtSets.length} Sets
                      </span>
                    </div>
                  </div>
                </div>

                {/* SEARCH BAR */}
                <div style={{
                  backgroundColor: "white",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px"
                }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search UBT sets (e.g. Set 01, Model Set 02, Full Set)..."
                      value={ubtSearchQuery}
                      onChange={(e) => setUbtSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px 9px 36px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "#f8fafc"
                      }}
                    />
                    <span style={{ position: "absolute", left: "12px", top: "10px", color: "#64748b" }}>🔍</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "bold", color: "#64748b" }}>
                    Total: {filteredUbtSets.length} Sets
                  </span>
                </div>

                {/* UBT SETS GRID (STRICTLY NO PDFS) */}
                {filteredUbtSets.length === 0 ? (
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "60px 20px",
                    textAlign: "center",
                    border: "2px dashed #fed7aa"
                  }}>
                    <div style={{ fontSize: "44px", marginBottom: "12px" }}>📙</div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
                      No UBT Model Sets Found
                    </h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                      Super Admin द्वारा सिर्जना गरिएका UBT Exam सेटहरू यहाँ प्रत्यक्ष देखिनेछन्।
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                    gap: "20px"
                  }}>
                    {filteredUbtSets.map((set, idx) => {
                      const unlocked = isSetUnlocked(set);

                      return (
                        <div
                          key={set.id || idx}
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            border: unlocked ? "1px solid #cbd5e1" : "1px solid #fed7aa",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            padding: "22px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div>
                            {/* Top Header Badge */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                              <span style={{
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "800",
                                textTransform: "uppercase"
                              }}>
                                UBT 40 Questions
                              </span>

                              {mode === "admin" ? (
                                <span style={{
                                  backgroundColor: "#f0fdf4",
                                  color: "#166534",
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "800"
                                }}>
                                  Admin Access
                                </span>
                              ) : unlocked ? (
                                <span style={{
                                  backgroundColor: "#dcfce7",
                                  color: "#15803d",
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  ✅ Unlocked
                                </span>
                              ) : (
                                <span style={{
                                  backgroundColor: "#fef3c7",
                                  color: "#b45309",
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  🔒 Locked
                                </span>
                              )}
                            </div>

                            {/* Icon & Title */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                              <div style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "10px",
                                backgroundColor: unlocked ? "#eff6ff" : "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "22px"
                              }}>
                                {unlocked ? "💻" : "🔒"}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                                  {set.name}
                                </h4>
                                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>
                                  Package: Model Question Bank (Separate Purchase)
                                </span>
                              </div>
                            </div>

                            {/* Set Specs */}
                            <div style={{
                              backgroundColor: "#f8fafc",
                              borderRadius: "10px",
                              padding: "12px",
                              marginBottom: "16px",
                              border: "1px solid #f1f5f9",
                              fontSize: "12px",
                              color: "#475569",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "6px"
                            }}>
                              <div>⏱️ <strong>50 Min</strong> Time</div>
                              <div>📝 <strong>20</strong> Reading</div>
                              <div>🎧 <strong>20</strong> Listening</div>
                              <div>🎯 <strong>40</strong> Total Qs</div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div>
                            {unlocked ? (
                              <button
                                type="button"
                                onClick={() => handleStartUbtSet(set)}
                                style={{
                                  width: "100%",
                                  backgroundColor: "#16a34a",
                                  backgroundImage: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "12px 18px",
                                  borderRadius: "10px",
                                  fontWeight: "800",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                {mode === "institute" ? "👁️ PREVIEW UBT EXAM" : "▶ START UBT EXAM"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartUbtSet(set)}
                                style={{
                                  width: "100%",
                                  backgroundColor: "#2563eb",
                                  backgroundImage: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "12px 18px",
                                  borderRadius: "10px",
                                  fontWeight: "800",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "8px"
                                }}
                              >
                                <span>🔒</span>
                                <span>{mode === "institute" ? "BUY PRODUCT TO UNLOCK" : "BUY MODEL QUESTION BANK TO UNLOCK"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ============================================================== */}
          {/* 4. RENDER GRAMMAR BOOK SECTION (BASIC TO ADV, CHAPTERWISE, ETC)*/}
          {/* ============================================================== */}
          {isKoreanFolderOpen && activeFolder === "Grammar Book" && (
            <KoreanGrammarBookView
              materials={materials}
              isAdmin={isAdmin}
              onUploadMaterial={(folderName) => {
                setMatFolder(folderName || "Grammar Book");
                setIsUploadMaterialOpen(true);
              }}
            />
          )}

          {/* ============================================================== */}
          {/* 5. RENDER OTHER MATERIAL FOLDERS (Custom Folders)              */}
          {/* ============================================================== */}
          {isKoreanFolderOpen && activeFolder && activeFolder !== "EPS Book" && activeFolder !== "Meaning Book" && activeFolder !== "Model Question Bank" && activeFolder !== "Grammar Book" && (() => {
            const currentFolderObj = folders.find(f => f.name === activeFolder) || { name: activeFolder, icon: "📁", description: "" };
            const folderMats = materials.filter(m => m.folder === activeFolder);

            return (
              <div style={{ marginBottom: "40px" }}>
                {/* FOLDER INFO BANNER */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "22px 26px",
                  marginBottom: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <img
                        src={getFolderCover(currentFolderObj)}
                        alt={currentFolderObj.name}
                        style={{
                          width: "38px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                          border: "1px solid rgba(0,0,0,0.06)"
                        }}
                      />
                      <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                        {currentFolderObj.name}
                      </h3>
                      <span style={{
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        fontSize: "12px",
                        fontWeight: "800",
                        padding: "3px 10px",
                        borderRadius: "12px"
                      }}>
                        {folderMats.length} Materials
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#64748b" }}>
                      {currentFolderObj.description || `Learning materials and study guides for ${currentFolderObj.name}`}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMatFolder(activeFolder);
                        setIsUploadMaterialOpen(true);
                      }}
                      style={{
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 6px rgba(22,163,74,0.2)"
                      }}
                    >
                      <span>+</span> Upload to {activeFolder}
                    </button>
                  )}
                </div>

                {/* MATERIALS GRID OR EMPTY STATE */}
                {folderMats.length === 0 ? (
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    padding: "60px 20px",
                    textAlign: "center",
                    border: "2px dashed #cbd5e1"
                  }}>
                    <div style={{ fontSize: "44px", marginBottom: "12px" }}>{currentFolderObj.icon || "📂"}</div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
                      No materials uploaded in {activeFolder} yet
                    </h4>
                    <p style={{ margin: "0 auto 20px auto", fontSize: "14px", color: "#64748b", maxWidth: "460px" }}>
                      Uploaded materials will automatically appear here for everyone.
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setMatFolder(activeFolder);
                          setIsUploadMaterialOpen(true);
                        }}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 22px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        + Upload First Material
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px"
                  }}>
                    {folderMats.map((mat) => (
                      <div
                        key={mat.id}
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          padding: "22px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px"
                            }}>
                              {mat.fileType ? `${mat.fileType.toUpperCase()} DOCUMENT` : "PDF DOCUMENT"}
                            </span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{mat.uploadedAt || "Recent"}</span>
                          </div>

                          <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>
                            {mat.title}
                          </h4>

                          {mat.description && (
                            <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                              {mat.description}
                            </p>
                          )}

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "#f8fafc",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "16px",
                            border: "1px solid #f1f5f9"
                          }}>
                            <span>📄</span>
                            <span style={{ fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                              {mat.fileName || "document.pdf"}
                            </span>
                            {mat.fileSize && <span>({mat.fileSize})</span>}
                          </div>

                          {mat.audioUrl && (
                            <div style={{ marginBottom: "16px" }}>
                              <div style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", marginBottom: "4px" }}>
                                🎵 Attached Audio:
                              </div>
                              <audio
                                controls
                                controlsList="nodownload"
                                src={mat.audioUrl}
                                style={{ width: "100%", height: "36px" }}
                              />
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                          {mat.fileUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingMaterial(mat)}
                              style={{
                                flex: 1,
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                padding: "9px 14px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                boxShadow: "0 2px 6px rgba(37,99,235,0.2)"
                              }}
                            >
                              <span>📖</span> View / Read
                            </button>
                          )}

                          {mode !== "student" && mat.fileUrl && (
                            <a
                              href={mat.fileUrl}
                              download={mat.fileName || "document.pdf"}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                backgroundColor: "#f1f5f9",
                                color: "#0f172a",
                                border: "1px solid #cbd5e1",
                                padding: "9px 14px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "13px",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px"
                              }}
                            >
                              <span>⬇️</span> Download
                            </a>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                              title="Delete material"
                              style={{
                                backgroundColor: "#fee2e2",
                                color: "#dc2626",
                                border: "none",
                                padding: "9px 12px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "13px",
                                cursor: "pointer"
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. JAPANESE STUDY MATERIALS SECTION */}
      {/* ============================================================== */}
      {(studyLanguage === "japanese" || studyLanguage === "both") && (
        <div style={{ marginTop: studyLanguage === "both" ? "40px" : "0" }}>
          {studyLanguage === "both" && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
              padding: "12px 18px",
              backgroundColor: "#fef2f2",
              borderRadius: "14px",
              border: "1.5px solid #fecaca",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.06)"
            }}>
              <span style={{ fontSize: "26px", lineHeight: "1" }}>🇯🇵</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#991b1b" }}>
                  Japanese Study Materials
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  JLPT N5・N4 (Minna no Nihongo), JLPT N3・N2・N1, Kanji &amp; Meaning, and Mock Tests
                </span>
              </div>
            </div>
          )}

          {/* Japanese Folder Selection Tabs (Shown when NO folder is entered) */}
          {!isJapaneseFolderOpen && (
          <div
            className="book-tabs-container"
            style={{
              backgroundColor: "#ffffff",
              padding: "16px",
              borderRadius: "18px",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              marginBottom: "24px",
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            <div
              className="book-tabs-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
                width: "100%",
                boxSizing: "border-box"
              }}
            >
            {JAPANESE_FOLDERS.map((folder) => {
              const isActive = activeJapaneseFolder === folder.name;
              const badgeText = folder.badgeText || "Learning Guide";

              return (
                <button
                  key={folder.id}
                  type="button"
                  className="book-library-tab-card"
                  onClick={() => {
                    setActiveJapaneseFolder(folder.name);
                    setIsJapaneseFolderOpen(true);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "14px 14px 18px 14px",
                    borderRadius: "16px",
                    border: "3px solid",
                    borderColor: isActive ? "#2563eb" : "#e2e8f0",
                    background: "#ffffff",
                    cursor: "pointer",
                    position: "relative",
                    outline: "none",
                    userSelect: "none",
                    boxSizing: "border-box",
                    width: "100%",
                    boxShadow: isActive ? "0 8px 22px rgba(37, 99, 235, 0.12)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
                    flexShrink: 0
                  }}
                >
                  {/* BOOK COVER PHOTO CONTAINER - FULL IMAGE WITH UNCLIPPED BORDERS */}
                  <div style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    maxHeight: "260px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    padding: "6px",
                    boxSizing: "border-box",
                    position: "relative",
                    boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.08)" : "0 4px 12px rgba(15, 23, 42, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <img
                      src={folder.coverImage}
                      alt={folder.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        display: "block"
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/books/jlpt-n5-n4-cover.jpg";
                      }}
                    />
                  </div>

                  {/* TEXT BELOW COVERS */}
                  <div style={{
                    marginTop: "14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: "6px"
                  }}>
                    <span className="book-tab-title" style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#0f172a",
                      lineHeight: "1.3"
                    }}>
                      {folder.name}
                    </span>

                    <span className="book-tab-badge" style={{
                      background: isActive ? "#2563eb" : "#f1f5f9",
                      color: isActive ? "#ffffff" : "#475569",
                      border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      boxShadow: isActive ? "0 2px 8px rgba(37, 99, 235, 0.25)" : "none",
                      fontSize: "12px",
                      padding: "4px 14px",
                      borderRadius: "16px",
                      fontWeight: "800",
                      letterSpacing: "0.2px",
                      whiteSpace: "nowrap",
                      display: "inline-block"
                    }}>
                      {badgeText}
                    </span>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
          )}

          {/* ACTIVE JAPANESE BOOK TOP BAR (Visible when entered inside a specific Japanese book) */}
          {isJapaneseFolderOpen && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 18px",
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              border: "1.5px solid #fecaca",
              boxShadow: "0 2px 10px rgba(220, 38, 38, 0.06)",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setIsJapaneseFolderOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "#fef2f2",
                    color: "#991b1b",
                    border: "1.5px solid #fecaca",
                    borderRadius: "10px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.08)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee2e2";
                    e.currentTarget.style.transform = "translateX(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "900" }}>←</span>
                  <span>Back to Study Materials</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🇯🇵</span>
                  <span style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
                    {activeJapaneseFolder}
                  </span>
                  <span style={{
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "2px 10px",
                    borderRadius: "12px"
                  }}>
                    Opened
                  </span>
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                Click &ldquo;Back to Study Materials&rdquo; to switch books
              </div>
            </div>
          )}

          {/* ACTIVE JAPANESE FOLDER CONTENT VIEWS - OPENED WHEN isJapaneseFolderOpen IS TRUE */}
          {isJapaneseFolderOpen && (() => {
            // ─────────────────────────────────────────────────────────
            // 1. JLPT N5 & N4 (Minna no Nihongo 50 Lessons)
            // ─────────────────────────────────────────────────────────
            if (activeJapaneseFolder === "JLPT N5・N4" || activeJapaneseFolder === "Minna no Nihongo") {
              const fullBooks = japaneseR2Data?.fullBooks?.filter(b => b.level === "N5" || b.level === "N4") || [
                {
                  title: "Minna no Nihongo I (Beginner) - Full Book",
                  level: "N5",
                  fileSize: "8.61 MB",
                  url: "/api/r2/books/japanese/full/Minna_no_Nihongo_I_Full.pdf"
                },
                {
                  title: "Minna no Nihongo II (Elementary) - Full Book",
                  level: "N4",
                  fileSize: "7.58 MB",
                  url: "/api/r2/books/japanese/full/Minna_no_Nihongo_II_Full.pdf"
                }
              ];

              return (
                <div>
                  {/* Minna no Nihongo Control Bar */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "18px 22px",
                    border: "1.5px solid #ddd6fe",
                    marginBottom: "22px",
                    boxShadow: "0 4px 16px rgba(124, 58, 237, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: "19px", fontWeight: "900", color: "#5b21b6" }}>
                          JLPT N5・N4 (みんなの日本語 - 50 Lessons)
                        </h2>
                      </div>

                      {/* Lesson Part Filter Buttons */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { id: "all", label: `All 50 Lessons (${MINNA_NO_NIHONGO_LESSONS.length})` },
                          { id: "n5", label: "JLPT N5 (Lessons 1–25)" },
                          { id: "n4", label: "JLPT N4 (Lessons 26–50)" },
                          { id: "full", label: `Full Textbooks (${fullBooks.length})` }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setMinnaLessonFilter(btn.id)}
                            style={{
                              padding: "7px 15px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              border: minnaLessonFilter === btn.id ? "1.5px solid #7c3aed" : "1px solid #e2e8f0",
                              backgroundColor: minnaLessonFilter === btn.id ? "#faf5ff" : "#f8fafc",
                              color: minnaLessonFilter === btn.id ? "#7c3aed" : "#475569",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Bar & Result Counter */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
                        <svg
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "16px",
                            height: "16px",
                            color: "#94a3b8"
                          }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={minnaSearchQuery}
                          onChange={(e) => setMinnaSearchQuery(e.target.value)}
                          placeholder="Search lesson topic, grammar pattern, or title (e.g. わたしは, Te-form, Passive)..."
                          style={{
                            width: "100%",
                            padding: "9px 12px 9px 38px",
                            borderRadius: "10px",
                            border: "1.5px solid #cbd5e1",
                            fontSize: "13px",
                            outline: "none"
                          }}
                        />
                      </div>
                      <div style={{
                        padding: "8px 14px",
                        backgroundColor: "#faf5ff",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#6d28d9",
                        border: "1px solid #ddd6fe"
                      }}>
                        {minnaLessonFilter === "full"
                          ? `Showing ${fullBooks.length} Full Textbooks`
                          : `Showing ${filteredMinnaLessons.length} of ${MINNA_NO_NIHONGO_LESSONS.length} Lessons`}
                      </div>
                    </div>
                  </div>

                  {/* FULL TEXTBOOKS VIEW */}
                  {minnaLessonFilter === "full" ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "16px",
                      marginBottom: "40px"
                    }}>
                      {fullBooks.map((book, idx) => {
                        const isN5 = book.level === "N5";
                        return (
                          <div
                            key={idx}
                            onClick={() => setViewingMaterial({ title: book.title, fileUrl: book.url })}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-3px)";
                              e.currentTarget.style.boxShadow = "0 10px 25px rgba(124, 58, 237, 0.16)";
                              e.currentTarget.style.borderColor = isN5 ? "#c4b5fd" : "#fca5a5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                            title={`Click to read ${book.title}`}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                              padding: "18px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              userSelect: "none"
                            }}
                          >
                            <div>
                              {/* Pill Badge */}
                              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{
                                  backgroundColor: isN5 ? "#faf5ff" : "#fff1f2",
                                  color: isN5 ? "#7c3aed" : "#be123c",
                                  padding: "5px 20px",
                                  borderRadius: "16px",
                                  fontSize: "13px",
                                  fontWeight: "800",
                                  border: isN5 ? "1px solid #ddd6fe" : "1px solid #fecdd3"
                                }}>
                                  Full Textbook · JLPT {book.level}
                                </span>
                              </div>

                              {/* Book Cover */}
                              <JapaneseChapterCover
                                lessonNumber={isN5 ? 1 : 2}
                                titleJp={book.title}
                                titleNe="पूर्ण जापानीज पाठ्यपुस्तक"
                                level={book.level}
                                height="195px"
                                margin="10px 0 12px 0"
                                onClick={(e) => {
                                  if (e && e.stopPropagation) e.stopPropagation();
                                  setViewingMaterial({ title: book.title, fileUrl: book.url });
                                }}
                              />

                              {/* Title */}
                              <div style={{ textAlign: "center", marginTop: "6px" }}>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold", color: "#0f172a", textAlign: "center" }}>
                                  {book.title}
                                </h3>
                                <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b", lineHeight: "1.4", textAlign: "center" }}>
                                  Complete full-edition textbook ({book.fileSize || "PDF"})
                                </p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                              <button
                                type="button"
                                onClick={() => setViewingMaterial({ title: book.title, fileUrl: book.url })}
                                style={{
                                  width: "100%",
                                  padding: "9px 14px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: isN5 ? "#7c3aed" : "#e11d48",
                                  backgroundImage: isN5 ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                                  color: "#ffffff",
                                  fontSize: "13px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  boxShadow: isN5 ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "0 2px 8px rgba(225, 29, 72, 0.25)"
                                }}
                              >
                                <span>📖</span>
                                <span>Read Full Book</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* LESSONS GRID */
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "16px",
                      marginBottom: "40px"
                    }}>
                      {filteredMinnaLessons.map((lesson) => {
                        const isPlaying = playingJpAudioId === `minna-${lesson.lesson}`;
                        const r2PdfUrl = getMinnaPdfUrl(lesson.lesson);
                        const isN5 = lesson.lesson <= 25;
                        const lesStr = lesson.lesson < 10 ? `0${lesson.lesson}` : `${lesson.lesson}`;

                        return (
                          <div
                            key={lesson.lesson}
                            onClick={() => setViewingMaterial({
                              title: `Minna no Nihongo Chapter ${lesson.lesson} (${isN5 ? 'N5' : 'N4'})`,
                              fileUrl: r2PdfUrl
                            })}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-3px)";
                              e.currentTarget.style.boxShadow = "0 10px 25px rgba(124, 58, 237, 0.16)";
                              e.currentTarget.style.borderColor = isN5 ? "#c4b5fd" : "#fca5a5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                            title={`Click to open Lesson ${lesStr} in Full Screen`}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                              padding: "18px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              userSelect: "none"
                            }}
                          >
                            <div>
                              {/* CHAPTER / LESSON HEADER BADGE (Centered matching Korean cards) */}
                              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{
                                  backgroundColor: isN5 ? "#faf5ff" : "#fff1f2",
                                  color: isN5 ? "#7c3aed" : "#be123c",
                                  padding: "5px 20px",
                                  borderRadius: "16px",
                                  fontSize: "13px",
                                  fontWeight: "800",
                                  letterSpacing: "0.5px",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                  border: isN5 ? "1px solid #ddd6fe" : "1px solid #fecdd3"
                                }}>
                                  Lesson {lesStr} · JLPT {isN5 ? "N5" : "N4"}
                                </span>
                              </div>

                              {/* JAPANESE LESSON COVER MOCKUP (ICON & BOOK ART) */}
                              <JapaneseChapterCover
                                lessonNumber={lesson.lesson}
                                titleJp={lesson.titleJp}
                                titleNe={lesson.titleNe}
                                level={isN5 ? "N5" : "N4"}
                                height="195px"
                                margin="10px 0 12px 0"
                                onClick={(e) => {
                                  if (e && e.stopPropagation) e.stopPropagation();
                                  setViewingMaterial({
                                    title: `Minna no Nihongo Chapter ${lesson.lesson} (${isN5 ? 'N5' : 'N4'})`,
                                    fileUrl: r2PdfUrl
                                  });
                                }}
                              />

                              {/* TITLES (Centered matching Korean style) */}
                              <div style={{ textAlign: "center", marginTop: "6px" }}>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "bold", color: "#0f172a", textAlign: "center" }}>
                                  {lesson.titleJp}
                                </h3>
                                <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.4", textAlign: "center" }}>
                                  {lesson.titleNe} ({lesson.titleEn})
                                </p>
                              </div>

                              {/* Key Grammar Rule */}
                              <div style={{
                                marginTop: "10px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                backgroundColor: isN5 ? "#faf5ff" : "#fff1f2",
                                border: isN5 ? "1px solid #ede9fe" : "1px solid #ffe4e6",
                                fontSize: "12px",
                                color: "#1e293b",
                                lineHeight: "1.4",
                                textAlign: "center"
                              }}>
                                <strong style={{ color: isN5 ? "#7c3aed" : "#be123c" }}>Grammar:</strong> {lesson.grammar}
                              </div>
                            </div>

                            {/* Bottom Action Buttons (Read Chapter & Audio) */}
                            <div
                              style={{
                                marginTop: "14px",
                                paddingTop: "12px",
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                borderTop: "1px solid #f1f5f9"
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setViewingMaterial({
                                  title: `Minna no Nihongo Chapter ${lesson.lesson} (${isN5 ? 'N5' : 'N4'})`,
                                  fileUrl: r2PdfUrl
                                })}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: isN5 ? "#7c3aed" : "#e11d48",
                                  backgroundImage: isN5 ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                                  color: "#ffffff",
                                  fontSize: "12.5px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  boxShadow: isN5 ? "0 2px 6px rgba(124, 58, 237, 0.25)" : "0 2px 6px rgba(225, 29, 72, 0.25)"
                                }}
                              >
                                <span>📖</span>
                                <span>Read Chapter</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePlayJpAudio(`minna-${lesson.lesson}`, lesson.titleJp)}
                                title="Listen to Japanese Audio"
                                style={{
                                  border: isPlaying ? "1px solid #7c3aed" : "1px solid #cbd5e1",
                                  backgroundColor: isPlaying ? "#7c3aed" : "#ffffff",
                                  color: isPlaying ? "#ffffff" : "#475569",
                                  borderRadius: "8px",
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px"
                                }}
                              >
                                <span>{isPlaying ? "⏹️ Stop" : "🔊 Audio"}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // ─────────────────────────────────────────────────────────
            // 2. JLPT N3・N2・N1 (Upper Intermediate & Advanced)
            // ─────────────────────────────────────────────────────────
            if (activeJapaneseFolder === "JLPT N3・N2・N1") {
              return (
                <div style={{ marginBottom: "36px" }}>
                  {/* Top Control Bar */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    border: "1.5px solid #e2e8f0",
                    marginBottom: "20px",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "14px"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#5b21b6" }}>
                            JLPT N3・N2・N1 Advanced Japanese
                          </h2>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "800",
                            backgroundColor: "#faf5ff",
                            color: "#7c3aed",
                            border: "1px solid #ddd6fe"
                          }}>
                            {filteredN3Units.length + filteredN2Units.length + filteredN1Units.length} Chapters
                          </span>
                        </div>
                      </div>

                      {/* Filter Buttons */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { id: "all", label: "All Levels" },
                          { id: "N3", label: `JLPT N3 (${filteredN3Units.length} Units)` },
                          { id: "N2", label: `JLPT N2 (${filteredN2Units.length} Chapters)` },
                          { id: "N1", label: `JLPT N1 (${filteredN1Units.length} Chapters)` }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setN3LevelFilter(f.id)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "10px",
                              border: n3LevelFilter === f.id ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                              backgroundColor: n3LevelFilter === f.id ? "#7c3aed" : "#f8fafc",
                              color: n3LevelFilter === f.id ? "#ffffff" : "#475569",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: n3LevelFilter === f.id ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "13px",
                        color: "#94a3b8"
                      }}>
                        Search
                      </span>
                      <input
                        type="text"
                        value={n3SearchQuery}
                        onChange={(e) => setN3SearchQuery(e.target.value)}
                        placeholder="Search chapter, unit, grammar rule, or topic..."
                        style={{
                          width: "100%",
                          padding: "10px 14px 10px 65px",
                          borderRadius: "10px",
                          border: "1.5px solid #cbd5e1",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  {/* 1. JLPT N3 Soumatome 36 Units Grid */}
                  {(n3LevelFilter === "all" || n3LevelFilter === "N3") && (
                    <div style={{ marginBottom: "28px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>Nihongo Soumatome N3 Units (Weeks 1 to 6)</span>
                          <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "600" }}>
                            ({filteredN3Units.length} Units)
                          </span>
                        </h3>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "14px"
                      }}>
                        {filteredN3Units.map((unit, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "14px",
                              border: "1.5px solid #e2e8f0",
                              padding: "16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                                backgroundColor: "#faf5ff",
                                color: "#7c3aed",
                                border: "1px solid #ddd6fe"
                              }}>
                                JLPT N3
                              </span>
                              <span style={{
                                padding: "2px 7px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "700",
                                backgroundColor: "#f1f5f9",
                                color: "#475569"
                              }}>
                                {unit.week}
                              </span>
                            </div>

                            <div>
                              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                                {unit.title}
                              </h4>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                {unit.unit} · Grammar & Vocabulary Drill
                              </div>
                            </div>

                            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                              <button
                                type="button"
                                onClick={() => setViewingMaterial({
                                  title: unit.title,
                                  fileUrl: unit.pdfUrl
                                })}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: "#7c3aed",
                                  backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                                  color: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)"
                                }}
                              >
                                <span>{String(unit.unit).startsWith("Unit") ? unit.unit : `Unit ${unit.unit}`}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. JLPT N2 Chapters Grid */}
                  {(n3LevelFilter === "all" || n3LevelFilter === "N2") && (
                    <div style={{ marginBottom: "28px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>JLPT N2 Official Chapter Folders (Chapters 1 to 18)</span>
                          <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "600" }}>
                            ({filteredN2Units.length} Chapters)
                          </span>
                        </h3>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "14px"
                      }}>
                        {filteredN2Units.map((unit, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "14px",
                              border: "1.5px solid #e2e8f0",
                              padding: "16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                                backgroundColor: "#faf5ff",
                                color: "#7c3aed",
                                border: "1px solid #ddd6fe"
                              }}>
                                JLPT N2
                              </span>
                              <span style={{
                                padding: "2px 7px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "700",
                                backgroundColor: "#f1f5f9",
                                color: "#475569"
                              }}>
                                {unit.chapter}
                              </span>
                            </div>

                            <div>
                              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                                {unit.title}
                              </h4>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                Advanced Intermediate Grammar & Reading Drill
                              </div>
                            </div>

                            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                              <button
                                type="button"
                                onClick={() => setViewingMaterial({
                                  title: unit.title,
                                  fileUrl: unit.pdfUrl
                                })}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: "#7c3aed",
                                  backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                                  color: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)"
                                }}
                              >
                                <span>{unit.chapter}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. JLPT N1 Mastery Chapters Grid */}
                  {(n3LevelFilter === "all" || n3LevelFilter === "N1") && (
                    <div style={{ marginBottom: "28px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>JLPT N1 Highest Mastery Chapters (Chapters 1 to 10)</span>
                          <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "600" }}>
                            ({filteredN1Units.length} Chapters)
                          </span>
                        </h3>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "14px"
                      }}>
                        {filteredN1Units.map((unit, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "14px",
                              border: "1.5px solid #e2e8f0",
                              padding: "16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                                backgroundColor: "#faf5ff",
                                color: "#7c3aed",
                                border: "1px solid #ddd6fe"
                              }}>
                                JLPT N1
                              </span>
                              <span style={{
                                padding: "2px 7px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "700",
                                backgroundColor: "#f1f5f9",
                                color: "#475569"
                              }}>
                                {unit.chapter}
                              </span>
                            </div>

                            <div>
                              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                                {unit.title}
                              </h4>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                Grammar: {unit.grammar}
                              </div>
                            </div>

                            <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                              <button
                                type="button"
                                onClick={() => setViewingMaterial({
                                  title: unit.title,
                                  fileUrl: unit.pdfUrl
                                })}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: "#7c3aed",
                                  backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                                  color: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)"
                                }}
                              >
                                <span>{unit.chapter}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ─────────────────────────────────────────────────────────
            // 3. KANJI & MEANING (1,000 Kanji, Particles, Topic Meanings)
            // ─────────────────────────────────────────────────────────
            if (activeJapaneseFolder === "Kanji & Meaning" || activeJapaneseFolder === "Kanji Master 1000" || activeJapaneseFolder === "Japanese Grammar & Audio") {
              const visibleKanji = filteredKanji.slice(0, kanjiVisibleLimit);

              return (
                <div style={{ marginBottom: "36px" }}>
                  {/* Top Control Bar with Sub-tabs */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    border: "1.5px solid #e2e8f0",
                    marginBottom: "20px",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "14px"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e293b" }}>
                            Kanji & Meaning (漢字・意味・語彙)
                          </h2>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "800",
                            backgroundColor: "#faf5ff",
                            color: "#7c3aed",
                            border: "1px solid #ddd6fe"
                          }}>
                            1,000+ Kanji & Meanings
                          </span>
                        </div>
                      </div>

                      {/* Sub-tabs Selection */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { id: "kanji", label: "1,000 Kanji Master", badge: "N5–N1" },
                          { id: "meanings", label: "Topic Meanings", badge: "Nepali" },
                          { id: "particles", label: "Particles Guide", badge: "10 Particles" },
                          { id: "phonetics", label: "Pronunciation", badge: "Audio" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setKanjiActiveTab(tab.id)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "10px",
                              border: kanjiActiveTab === tab.id ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                              backgroundColor: kanjiActiveTab === tab.id ? "#7c3aed" : "#f8fafc",
                              color: kanjiActiveTab === tab.id ? "#ffffff" : "#475569",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: kanjiActiveTab === tab.id ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <span>{tab.label}</span>
                            <span style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              backgroundColor: kanjiActiveTab === tab.id ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                              color: kanjiActiveTab === tab.id ? "#ffffff" : "#64748b",
                              fontWeight: "800"
                            }}>
                              {tab.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter & Search Bar for Kanji Tab */}
                    {kanjiActiveTab === "kanji" && (
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        {/* Level Filters */}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {[
                            { id: "all", label: "All Kanji" },
                            { id: "N5", label: "N5" },
                            { id: "N4", label: "N4" },
                            { id: "N3", label: "N3" },
                            { id: "N2", label: "N2" },
                            { id: "N1", label: "N1" }
                          ].map(lvl => (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => {
                                setKanjiLevelFilter(lvl.id);
                                setKanjiVisibleLimit(60);
                              }}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: kanjiLevelFilter === lvl.id ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                                backgroundColor: kanjiLevelFilter === lvl.id ? "#faf5ff" : "#ffffff",
                                color: kanjiLevelFilter === lvl.id ? "#7c3aed" : "#64748b",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer"
                              }}
                            >
                              {lvl.label}
                            </button>
                          ))}
                        </div>

                        {/* Search Input */}
                        <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
                          <svg
                            style={{
                              position: "absolute",
                              left: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "16px",
                              height: "16px",
                              color: "#94a3b8"
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            value={kanjiSearchQuery}
                            onChange={(e) => {
                              setKanjiSearchQuery(e.target.value);
                              setKanjiVisibleLimit(60);
                            }}
                            placeholder="Search Kanji, Onyomi, Kunyomi, English, or Nepali meaning..."
                            style={{
                              width: "100%",
                              padding: "9px 12px 9px 36px",
                              borderRadius: "10px",
                              border: "1.5px solid #cbd5e1",
                              fontSize: "13px",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>

                        <div style={{
                          padding: "8px 14px",
                          backgroundColor: "#faf5ff",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#7c3aed",
                          border: "1px solid #ede9fe"
                        }}>
                          Showing {Math.min(kanjiVisibleLimit, filteredKanji.length)} of {filteredKanji.length} Kanji
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ───────────────────────────────────────────── */}
                  {/* TAB 1: 1,000 KANJI MASTER GRID */}
                  {/* ───────────────────────────────────────────── */}
                  {kanjiActiveTab === "kanji" && (
                    <>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "12px"
                      }}>
                        {visibleKanji.map((k, idx) => (
                          <div
                            key={`${k.kanji}-${idx}`}
                            onClick={() => setSelectedKanjiDetail(k)}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              padding: "14px 12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              cursor: "pointer",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                              transition: "all 0.15s ease",
                              position: "relative"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "800",
                                backgroundColor: "#faf5ff",
                                color: "#7c3aed",
                                border: "1px solid #ede9fe"
                              }}>
                                JLPT N{k.jlpt}
                              </span>

                              <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: "700" }}>
                                {k.strokes} 画
                              </span>
                            </div>

                            {/* Big Character Display */}
                            <div style={{
                              fontSize: "42px",
                              fontWeight: "800",
                              color: "#0f172a",
                              textAlign: "center",
                              lineHeight: "1.1",
                              padding: "4px 0"
                            }}>
                              {k.kanji}
                            </div>

                            {/* Readings */}
                            <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.4" }}>
                              {k.onyomi && (
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <span style={{ color: "#64748b", fontWeight: "700" }}>音:</span>
                                  <strong style={{ color: "#1e293b", fontWeight: "700" }}>{k.onyomi}</strong>
                                </div>
                              )}
                              {k.kunyomi && (
                                <div style={{ display: "flex", gap: "6px", marginTop: "3px" }}>
                                  <span style={{ color: "#64748b", fontWeight: "700" }}>訓:</span>
                                  <span style={{ color: "#7c3aed", fontWeight: "700" }}>{k.kunyomi}</span>
                                </div>
                              )}
                            </div>

                            {/* Meanings */}
                            <div style={{
                              marginTop: "auto",
                              paddingTop: "8px",
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px"
                            }}>
                              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                                {k.english}
                              </div>
                              <div style={{ fontSize: "13px", color: "#7c3aed", fontWeight: "700" }}>
                                {k.nepali}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Load More Button */}
                      {filteredKanji.length > kanjiVisibleLimit && (
                        <div style={{ textAlign: "center", marginTop: "24px" }}>
                          <button
                            type="button"
                            onClick={() => setKanjiVisibleLimit((prev) => prev + 60)}
                            style={{
                              padding: "10px 28px",
                              borderRadius: "10px",
                              border: "1.5px solid #7c3aed",
                              backgroundColor: "#faf5ff",
                              color: "#7c3aed",
                              fontSize: "14px",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.15)"
                            }}
                          >
                            <span>Show More Kanji (+60)</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ───────────────────────────────────────────── */}
                  {/* TAB 2: TOPIC VOCABULARY MEANINGS (NEPALI & ENGLISH) */}
                  {/* ───────────────────────────────────────────── */}
                  {kanjiActiveTab === "meanings" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {JAPANESE_TOPIC_VOCABULARY.map((group, gIdx) => (
                        <div
                          key={gIdx}
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            border: "1.5px solid #e2e8f0",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>
                                {group.topic}
                              </h3>
                            </div>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "800",
                              backgroundColor: "#faf5ff",
                              color: "#7c3aed",
                              border: "1px solid #ddd6fe"
                            }}>
                              JLPT {group.level} · {group.words.length} Words
                            </span>
                          </div>

                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                            gap: "12px"
                          }}>
                            {group.words.map((w, wIdx) => {
                              const audioId = `vocab-${gIdx}-${wIdx}`;
                              const isPlaying = playingJpAudioId === audioId;

                              return (
                                <div
                                  key={wIdx}
                                  style={{
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                    padding: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px"
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                      <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                                        {w.jp}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                                        {w.romaji}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handlePlayJpAudio(audioId, w.jp)}
                                      style={{
                                        border: isPlaying ? "1px solid #7c3aed" : "1px solid #cbd5e1",
                                        backgroundColor: isPlaying ? "#7c3aed" : "#ffffff",
                                        color: isPlaying ? "#ffffff" : "#7c3aed",
                                        borderRadius: "20px",
                                        padding: "4px 10px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                    >
                                      <span>{isPlaying ? "Playing" : "Audio"}</span>
                                    </button>
                                  </div>

                                  <div style={{ marginTop: "auto", paddingTop: "6px", borderTop: "1px solid #e2e8f0", fontSize: "12px" }}>
                                    <div style={{ color: "#334155", fontWeight: "600" }}>
                                      {w.en}
                                    </div>
                                    <div style={{ color: "#7c3aed", fontWeight: "700", marginTop: "2px" }}>
                                      {w.ne}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ───────────────────────────────────────────── */}
                  {/* TAB 3: ESSENTIAL PARTICLES GUIDE (助詞) */}
                  {/* ───────────────────────────────────────────── */}
                  {kanjiActiveTab === "particles" && (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: "14px"
                    }}>
                      {JAPANESE_PARTICLES_GUIDE.map((p, idx) => {
                        const isPlaying = playingJpAudioId === `particle-${idx}`;

                        return (
                          <div
                            key={p.particle}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "14px",
                              border: "1.5px solid #e2e8f0",
                              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                              padding: "16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{
                                  fontSize: "24px",
                                  fontWeight: "900",
                                  color: "#7c3aed",
                                  padding: "3px 12px",
                                  borderRadius: "8px",
                                  backgroundColor: "#faf5ff",
                                  border: "1.5px solid #ddd6fe"
                                }}>
                                  {p.particle}
                                </span>
                                <div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>Romaji: {p.romaji}</div>
                                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b" }}>{p.meaningNe}</div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handlePlayJpAudio(`particle-${idx}`, p.exampleJp)}
                                style={{
                                  border: isPlaying ? "1px solid #7c3aed" : "1px solid #ddd6fe",
                                  backgroundColor: isPlaying ? "#7c3aed" : "#faf5ff",
                                  color: isPlaying ? "#ffffff" : "#7c3aed",
                                  borderRadius: "20px",
                                  padding: "4px 10px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                              >
                                <span>{isPlaying ? "Playing" : "Audio"}</span>
                              </button>
                            </div>

                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                              {p.usage}
                            </p>

                            <div style={{
                              padding: "10px 12px",
                              borderRadius: "8px",
                              backgroundColor: "#faf5ff",
                              border: "1px solid #ede9fe",
                              fontSize: "12px",
                              marginTop: "auto"
                            }}>
                              <div style={{ fontWeight: "800", color: "#5b21b6" }}>
                                {p.exampleJp}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                {p.exampleRomaji}
                              </div>
                              <div style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "700", marginTop: "2px" }}>
                                {p.exampleNe}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ───────────────────────────────────────────── */}
                  {/* TAB 4: PHONETICS & PRONUNCIATION */}
                  {/* ───────────────────────────────────────────── */}
                  {kanjiActiveTab === "phonetics" && (
                    <div>
                      <JapanesePronunciationGuide
                        handlePlayAudio={handlePlayJpAudio}
                        playingAudioId={playingJpAudioId}
                      />
                    </div>
                  )}
                </div>
              );
            }

            // ─────────────────────────────────────────────────────────
            // 4. MOCK TEST (JLPT & JFT QUESTION BANK - IN LAST POSITION)
            // ─────────────────────────────────────────────────────────
            if (activeJapaneseFolder === "Mock Test" || activeJapaneseFolder === "JLPT & JFT Question Bank") {
              const setsToRender = (JLPT_MOCK_SETS_META && JLPT_MOCK_SETS_META.length > 0) ? JLPT_MOCK_SETS_META : JLPT_JFT_SETS;
              const filteredJlptSets = setsToRender.filter(s => {
                if (jlptLevelFilter !== "all") {
                  if (jlptLevelFilter === "model") {
                    const matchModel = (s.title || "").toLowerCase().includes("simulation") ||
                      (s.title || "").toLowerCase().includes("model") ||
                      (s.desc || "").toLowerCase().includes("simulation") ||
                      (s.titleJp || "").includes("模試") ||
                      (s.titleJp || "").includes("模擬");
                    if (!matchModel) return false;
                  } else if (s.level !== jlptLevelFilter) {
                    return false;
                  }
                }
                if (jlptSearchQuery.trim()) {
                  const q = jlptSearchQuery.toLowerCase().trim();
                  const matchTitle = (s.title || "").toLowerCase().includes(q);
                  const matchTitleJp = (s.titleJp || "").toLowerCase().includes(q);
                  const matchDesc = (s.desc || "").toLowerCase().includes(q);
                  const matchLevel = (s.level || "").toLowerCase().includes(q);
                  return matchTitle || matchTitleJp || matchDesc || matchLevel;
                }
                return true;
              });

              return (
                <div style={{ marginBottom: "36px" }}>
                  {/* Header Bar */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    border: "1.5px solid #e2e8f0",
                    marginBottom: "20px",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "14px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#5b21b6" }}>
                          Japanese CBT Mock Test
                        </h2>
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab("buyExam")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              backgroundColor: "#7c3aed",
                              color: "#ffffff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)"
                            }}
                          >
                            <span>📦</span>
                            <span>View Mock Test Packages</span>
                          </button>
                        )}
                      </div>

                      {/* Level Filters for N5, N4, N3, N2, N1 & JFT */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { id: "all", label: `All Sets (${setsToRender.length})` },
                          { id: "model", label: `🎯 Model Exam (${setsToRender.filter(s => (s.title || "").toLowerCase().includes("simulation") || (s.title || "").toLowerCase().includes("model") || (s.desc || "").toLowerCase().includes("simulation") || (s.titleJp || "").includes("模試")).length} Sets)` },
                          { id: "JLPT N5", label: `JLPT N5 (${setsToRender.filter(s => s.level === "JLPT N5").length} Sets)` },
                          { id: "JLPT N4", label: `JLPT N4 (${setsToRender.filter(s => s.level === "JLPT N4").length} Sets)` },
                          { id: "JLPT N3", label: `JLPT N3 (${setsToRender.filter(s => s.level === "JLPT N3").length} Sets)` },
                          { id: "JLPT N2", label: `JLPT N2 (${setsToRender.filter(s => s.level === "JLPT N2").length} Sets)` },
                          { id: "JLPT N1", label: `JLPT N1 (${setsToRender.filter(s => s.level === "JLPT N1").length} Sets)` },
                          { id: "JFT-Basic", label: `JFT-Basic (${setsToRender.filter(s => s.level === "JFT-Basic").length} Sets)` }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setJlptLevelFilter(f.id)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "10px",
                              border: jlptLevelFilter === f.id ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                              backgroundColor: jlptLevelFilter === f.id ? "#7c3aed" : "#f8fafc",
                              color: jlptLevelFilter === f.id ? "#ffffff" : "#475569",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: jlptLevelFilter === f.id ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: "relative" }}>
                      <svg
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "16px",
                          height: "16px",
                          color: "#94a3b8"
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={jlptSearchQuery}
                        onChange={(e) => setJlptSearchQuery(e.target.value)}
                        placeholder="Search exam sets, level, Japanese title, or keywords..."
                        style={{
                          width: "100%",
                          padding: "10px 14px 10px 40px",
                          borderRadius: "10px",
                          border: "1.5px solid #cbd5e1",
                          fontSize: "13px",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  {/* Grid of Sets */}
                  {filteredJlptSets.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "40px",
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      border: "1px dashed #cbd5e1",
                      color: "#64748b"
                    }}>
                      No exam sets found matching your filter criteria.
                    </div>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "18px"
                    }}>
                      {filteredJlptSets.map((set) => {
                        const pastScore = jlptPastResults[set.id];
                        const isFree = Boolean(
                          set.isFree ||
                          set.setType === "FREE" ||
                          set.setNumber === 1 ||
                          (set.id && String(set.id).endsWith("-01")) ||
                          (set.title && set.title.toLowerCase().includes("free demo"))
                        );
                        const setId = set.id?.toString();
                        const setTitle = (set.title || set.name)?.toString();
                        const individuallyUnlocked = unlockedSets.some((id) => id?.toString() === setId || id?.toString() === setTitle);

                        const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                        const packageCovered = !isPackageExpired && (
                          activeStudentPackages.some((pkgName) => {
                            const pNorm = norm(pkgName);
                            if (pNorm.includes("full") || pNorm.includes("mock")) return true;
                            if (set.level && pNorm.includes(norm(set.level))) return true;
                            return false;
                          }) ||
                          purchasedPackages.some((pkgName) => {
                            const pNorm = norm(pkgName);
                            if (pNorm.includes("full") || pNorm.includes("mock")) return true;
                            if (set.level && pNorm.includes(norm(set.level))) return true;
                            return false;
                          }) ||
                          norm(studentPackage).includes("full") ||
                          norm(studentPackage).includes("mock") ||
                          (set.level && norm(studentPackage).includes(norm(set.level)))
                        );

                        const pending = pendingQueries.some((q) =>
                          (q.status === "Pending" || q.status === "PENDING") &&
                          q.itemType !== "package" &&
                          (
                            (q.itemId && q.itemId.toString() === setId) ||
                            (q.itemName && q.itemName.toString() === setTitle)
                          )
                        );

                        const unlocked = isFree || individuallyUnlocked || packageCovered;

                        return (
                          <div
                            key={set.id}
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              border: isFree ? "1.5px solid #6ee7b7" : "1.5px solid #e2e8f0",
                              padding: "20px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "14px",
                              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
                              transition: "transform 0.15s ease, box-shadow 0.15s ease"
                            }}
                          >
                            {/* Card Top: Level Badge, Status Badge & CBT Duration */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  backgroundColor: "#faf5ff",
                                  color: "#7c3aed",
                                  border: "1px solid #ddd6fe"
                                }}>
                                  {set.level}
                                </span>
                                {mode === "student" && (
                                  isFree ? (
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#065f46", backgroundColor: "#d1fae5", border: "1px solid #6ee7b7", padding: "2px 6px", borderRadius: "4px" }}>
                                      🎁 FREE DEMO
                                    </span>
                                  ) : individuallyUnlocked ? (
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#166534", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", padding: "2px 6px", borderRadius: "4px" }}>
                                      ✓ UNLOCKED (Rs. 40)
                                    </span>
                                  ) : packageCovered ? (
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#166534", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", padding: "2px 6px", borderRadius: "4px" }}>
                                      ✓ PACKAGE UNLOCKED
                                    </span>
                                  ) : pending ? (
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#0369a1", backgroundColor: "#e0f2fe", border: "1px solid #bae6fd", padding: "2px 6px", borderRadius: "4px" }}>
                                      ⏳ PENDING
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#b45309", backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "2px 6px", borderRadius: "4px" }}>
                                      🔒 LOCKED · Rs. 40
                                    </span>
                                  )
                                )}
                              </div>

                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                backgroundColor: "#f8fafc",
                                color: "#64748b",
                                border: "1px solid #e2e8f0"
                              }}>
                                {set.timeMin} Mins CBT
                              </span>
                            </div>

                            {/* Titles */}
                            <div>
                              <h3 style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>
                                {set.title}
                              </h3>
                              <div style={{ fontSize: "13px", color: "#7c3aed", fontWeight: "700", marginTop: "3px" }}>
                                {set.titleJp}
                              </div>
                            </div>

                            {/* Description */}
                            <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                              {set.desc}
                            </p>

                            {/* Exam Spec Pills */}
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px",
                              backgroundColor: "#faf5ff",
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: "1px solid #ede9fe",
                              fontSize: "12px"
                            }}>
                              <div>
                                <span style={{ color: "#64748b" }}>Reading: </span>
                                <strong style={{ color: "#0f172a" }}>{set.readingQs || 25} Qs</strong>
                              </div>
                              <div>
                                <span style={{ color: "#64748b" }}>Listening: </span>
                                <strong style={{ color: "#0f172a" }}>{set.listeningQs || 15} Qs</strong>
                              </div>
                              <div>
                                <span style={{ color: "#64748b" }}>Total Questions: </span>
                                <strong style={{ color: "#0f172a" }}>{set.totalQs || 40} Qs</strong>
                              </div>
                              <div>
                                <span style={{ color: "#64748b" }}>Duration: </span>
                                <strong style={{ color: "#0f172a" }}>{set.timeMin} Mins</strong>
                              </div>
                            </div>

                            {/* Past Result Badge if student took it before */}
                            {pastScore && (
                              <div style={{
                                backgroundColor: pastScore.isPassed ? "#f0fdf4" : "#fef2f2",
                                border: pastScore.isPassed ? "1px solid #bbf7d0" : "1px solid #fecaca",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                fontSize: "12px"
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{
                                    fontWeight: "800",
                                    color: pastScore.isPassed ? "#15803d" : "#b91c1c",
                                    fontSize: "11px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em"
                                  }}>
                                    {pastScore.isPassed ? "Passed Exam" : "Practice Needed"}
                                  </span>
                                  <span style={{
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    color: "#64748b"
                                  }}>
                                    Completed
                                  </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                                    {pastScore.totalScore} / {pastScore.maxScore || 180} Pts
                                  </strong>
                                  <span style={{
                                    fontSize: "12px",
                                    fontWeight: "800",
                                    color: pastScore.isPassed ? "#16a34a" : "#dc2626"
                                  }}>
                                    {pastScore.scorePercent != null ? `${pastScore.scorePercent}%` : `${Math.round(((pastScore.totalScore || 0) / (pastScore.maxScore || 180)) * 100)}%`}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                              {mode === "student" ? (
                                unlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isPackageExpired && !individuallyUnlocked && !isFree) {
                                        alert(`Your package expired on ${effectiveExpiryDate}. Please renew your package to take mock exam sets.`);
                                        return;
                                      }
                                      const fullSet = getMockExamSetById(set.id);
                                      setActiveJlptExamSet(fullSet);
                                      setJlptExamMode("student");
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "11px 16px",
                                      borderRadius: "10px",
                                      border: "none",
                                      backgroundColor: isFree ? "#059669" : "#16a34a",
                                      backgroundImage: isFree
                                        ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                                        : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                      color: "#ffffff",
                                      fontSize: "13px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "6px",
                                      boxShadow: isFree ? "0 4px 12px rgba(5, 150, 105, 0.28)" : "0 4px 12px rgba(22, 163, 74, 0.28)",
                                      transition: "all 0.15s ease"
                                    }}
                                  >
                                    <span>{pastScore ? "Retake CBT Mock Exam ▶" : isFree ? "Start Free Demo Exam ▶" : "Start CBT Mock Exam ▶"}</span>
                                  </button>
                                ) : pending ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`Your payment query for "${set.title}" (Rs. 40) is currently pending review by Admin.\n\nYour payment screenshot and transaction details were submitted. Once Admin verifies and confirms the payment, your set will unlock automatically.`);
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "11px 16px",
                                      borderRadius: "10px",
                                      border: "none",
                                      background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                                      color: "#ffffff",
                                      fontSize: "13px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "6px",
                                      boxShadow: "0 4px 12px rgba(2, 132, 199, 0.28)"
                                    }}
                                  >
                                    <span>⏳ PENDING CONFIRMATION</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onOpenEsewaModal) {
                                        onOpenEsewaModal({
                                          id: set.id,
                                          name: set.title || set.name,
                                          price: 40,
                                          type: "set",
                                          packageName: set.level || "Japanese Mock Test"
                                        });
                                      } else {
                                        alert("Please navigate to the Packages tab to purchase or unlock this Mock Test set.");
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "11px 16px",
                                      borderRadius: "10px",
                                      border: "none",
                                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                      color: "#ffffff",
                                      fontSize: "13px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "6px",
                                      boxShadow: "0 4px 12px rgba(217, 119, 6, 0.28)"
                                    }}
                                  >
                                    <span>🔒 BUY TO UNLOCK ▶ (Rs. 40)</span>
                                  </button>
                                )
                              ) : (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const fullSet = getMockExamSetById(set.id);
                                      setActiveJlptExamSet(fullSet);
                                      setJlptExamMode("institute");
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: "10px 12px",
                                      borderRadius: "10px",
                                      border: "1.5px solid #7c3aed",
                                      backgroundColor: "#faf5ff",
                                      color: "#7c3aed",
                                      fontSize: "12px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center"
                                    }}
                                  >
                                    <span>Preview Answers</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const fullSet = getMockExamSetById(set.id);
                                      setActiveJlptExamSet(fullSet);
                                      setJlptExamMode("student");
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: "10px 12px",
                                      borderRadius: "10px",
                                      border: "none",
                                      backgroundColor: "#7c3aed",
                                      backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)"
                                    }}
                                  >
                                    <span>Test CBT</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })()}

          {/* Interactive Minna no Nihongo Lesson Detail Modal */}
          {viewingMinnaLesson && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.65)",
              zIndex: 100005,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}>
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                border: "1.5px solid #e2e8f0",
                padding: "24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <div style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800",
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      marginBottom: "6px"
                    }}>
                      Minna no Nihongo · Lesson {viewingMinnaLesson.lesson} (Book {viewingMinnaLesson.book})
                    </div>
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e293b" }}>
                      {viewingMinnaLesson.titleJp}
                    </h3>
                    <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>
                      {viewingMinnaLesson.titleEn}
                    </div>
                    <div style={{ fontSize: "14px", color: "#2563eb", fontWeight: "700", marginTop: "2px" }}>
                      🇳🇵 {viewingMinnaLesson.titleNe}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingMinnaLesson(null)}
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Actions: Audio Button & Open R2 PDF Button */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
                  <button
                    type="button"
                    onClick={() => handlePlayJpAudio(`modal-minna-${viewingMinnaLesson.lesson}`, viewingMinnaLesson.titleJp)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#7c3aed",
                      backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)"
                    }}
                  >
                    <span>Listen to Title Pronunciation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const pdfUrl = getMinnaPdfUrl(viewingMinnaLesson.lesson);
                      setViewingMaterial({
                        title: `Minna no Nihongo Lesson ${viewingMinnaLesson.lesson} (${viewingMinnaLesson.lesson <= 25 ? 'N5' : 'N4'})`,
                        fileUrl: pdfUrl
                      });
                      setViewingMinnaLesson(null);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "1.5px solid #7c3aed",
                      backgroundColor: "#faf5ff",
                      color: "#7c3aed",
                      fontSize: "13px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>Open Chapter</span>
                  </button>
                </div>

                {/* Grammar Focus Breakdown */}
                <div style={{
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  marginBottom: "18px"
                }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "800", color: "#2563eb" }}>
                    Key Grammar Patterns
                  </h4>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", fontFamily: "monospace", lineHeight: "1.5" }}>
                    {viewingMinnaLesson.grammar}
                  </div>
                </div>

                {/* Lesson Description & Study Notes */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>
                    Study Guide & Tips (नेपालीमा सुझाव)
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    यस पाठमा जापानी भाषाका आधारभूत संरचनाहरू समावेश गरिएका छन्। शीर्षक र वाक्यहरू बारम्बार सुनेर दोहोर्‍याउने अभ्यास गर्नुहोस्। व्याकरणको संरचनालाई विभिन्न नामपद र क्रियाहरूसँग प्रयोग गरी आफ्नै नयाँ वाक्य बनाउने प्रयास गर्नुहोस्।
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setViewingMinnaLesson(null)}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#334155",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Close Lesson
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Kanji Detail Modal */}
          {selectedKanjiDetail && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.65)",
              zIndex: 100005,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}>
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                border: "1.5px solid #a7f3d0",
                padding: "24px",
                textAlign: "center"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "800",
                    backgroundColor: "#ecfdf5",
                    color: "#047857",
                    border: "1px solid #a7f3d0"
                  }}>
                    JLPT Level N{selectedKanjiDetail.jlpt} · {selectedKanjiDetail.strokes} Strokes (画)
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedKanjiDetail(null)}
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      fontSize: "14px",
                      cursor: "pointer",
                      color: "#475569"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Big Kanji Character */}
                <div style={{
                  fontSize: "80px",
                  fontWeight: "900",
                  color: "#0f172a",
                  lineHeight: "1",
                  margin: "10px 0"
                }}>
                  {selectedKanjiDetail.kanji}
                </div>

                {/* Audio Button */}
                <button
                  type="button"
                  onClick={() => handlePlayJpAudio(`detail-kanji-${selectedKanjiDetail.kanji}`, selectedKanjiDetail.japaneseSpoken || selectedKanjiDetail.kanji)}
                  style={{
                    marginBottom: "16px",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>Listen Pronunciation</span>
                </button>

                {/* Readings Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                  textAlign: "left"
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>ONYOMI (音読み)</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", marginTop: "2px" }}>
                      {selectedKanjiDetail.onyomi || "-"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>KUNYOMI (訓読み)</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#047857", marginTop: "2px" }}>
                      {selectedKanjiDetail.kunyomi || "-"}
                    </div>
                  </div>
                </div>

                {/* Meanings */}
                <div style={{
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  marginBottom: "18px"
                }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                    {selectedKanjiDetail.english}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#047857", marginTop: "4px" }}>
                    {selectedKanjiDetail.nepali}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedKanjiDetail(null)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#334155",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. UPLOAD & EDIT MODAL (POPUP FOR ADMIN / INSTITUTE)
         ========================================================================= */}
      {uploadModalChapter && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 100002,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", display: "inline-block", marginBottom: "4px" }}>
                  🔑 Admin Authenticated
                </span>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "17px" }}>
                  ✏️ Edit Chapter {uploadModalChapter.chapter}: {uploadModalChapter.titleKo}
                </h3>
              </div>
              <button
                onClick={() => setUploadModalChapter(null)}
                style={{ backgroundColor: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* CHAPTER SELECTOR (ONE MASTER MODAL FOR ALL CHAPTERS) */}
            <div style={{ backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
              <label style={{ fontWeight: "bold", fontSize: "13px", color: "#1e40af", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📚</span> Select Chapter to Edit (च्याप्टर छान्नुहोस्):
              </label>
              <select
                value={uploadModalChapter.chapter}
                onChange={(e) => {
                  const targetCh = chapters.find(ch => ch.chapter === Number(e.target.value));
                  if (targetCh) openUploadModal(targetCh);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1.5px solid #3b82f6",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#1e3a8a",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  minWidth: "220px"
                }}
              >
                {chapters.map(ch => (
                  <option key={ch.chapter} value={ch.chapter}>
                    Chapter {ch.chapter}: {ch.titleKo} ({ch.titleNe})
                  </option>
                ))}
              </select>
            </div>

            {/* 1. EDIT CHAPTER NAME & TITLES (ADMIN / INSTITUTE) */}
            <div style={{ backgroundColor: "#f0fdf4", padding: "16px", borderRadius: "10px", border: "1.5px solid #86efac", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#166534", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✏️</span> Chapter {uploadModalChapter.chapter} Name & Details (च्याप्टरको नाम):
                </label>
                <span style={{ fontSize: "11px", color: "#15803d", fontWeight: "bold", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
                  Admin Editable
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                    🇰🇷 Korean Title (कोरियन शीर्षक):
                  </label>
                  <input
                    type="text"
                    value={editTitleKo}
                    onChange={(e) => setEditTitleKo(e.target.value)}
                    placeholder="उदा. 한글 익히기 I"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1.5px solid #94a3b8",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                    🇳🇵 Nepali Meaning / Title (नेपाली अर्थ):
                  </label>
                  <input
                    type="text"
                    value={editTitleNe}
                    onChange={(e) => setEditTitleNe(e.target.value)}
                    placeholder="उदा. कोरियन वर्णमाला सिक्ने भाग १ (स्वर र व्यञ्जन)"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1.5px solid #94a3b8",
                      fontSize: "13px",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>
                    📝 Study Notes / Vocabulary Summary (अध्ययन टिप्पणी/नोट):
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="च्याप्टरको मुख्य अध्ययन नोट वा व्याख्या..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      backgroundColor: "#ffffff",
                      fontFamily: "Arial, sans-serif"
                    }}
                  />
                </div>

                <div style={{ textAlign: "right", marginTop: "2px" }}>
                  <button
                    type="button"
                    disabled={isSavingChapterInfo}
                    onClick={handleSaveChapterInfo}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "white",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: isSavingChapterInfo ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
                    }}
                  >
                    <span>💾</span> {isSavingChapterInfo ? "Saving..." : "Save Chapter Name"}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. CHAPTER COVER / 1ST PAGE PREVIEW & CUSTOM COVER PHOTO */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📸</span> Chapter {uploadModalChapter.chapter} Cover / पहिलो पेज (1st Page Preview):
                </label>
                {uploadModalChapter.coverImage && (
                  <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "bold", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
                    Custom Image
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: "120px", height: "155px", flexShrink: 0 }}>
                  <ChapterCover
                    chapter={uploadModalChapter.chapter}
                    titleKo={uploadModalChapter.titleKo}
                    titleNe={uploadModalChapter.titleNe}
                    pdfUrl={uploadModalChapter.pdfUrl}
                    coverImage={uploadModalChapter.coverImage}
                    bookPart={uploadModalChapter.chapter <= 30 ? 1 : 2}
                    height="155px"
                    margin="0"
                    onClick={() => { }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: "220px" }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                    {uploadModalChapter.pdfUrl
                      ? "यो च्याप्टरको अपलोड भएको PDF को पहिलो पेज (First Page) स्वतः कभर कार्डमा देखिन्छ। यदि तपाईं छुट्टै विशेष कभर फोटो राख्न चाहनुहुन्छ भने तलबाट फोटो अपलोड गर्न सक्नुहुन्छ।"
                      : "PDF अपलोड गरेपछि पहिलो पेज स्वतः कभर बन्नेछ, वा अहिले नै कुनै कभर फोटो छनौट गर्न सक्नुहुन्छ।"}
                  </p>

                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    onChange={handleUploadCoverFile}
                    style={{ display: "none" }}
                  />

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      style={{
                        backgroundColor: "#0284c7",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <span>🖼️</span> {uploadingCover ? "Uploading..." : "कभर फोटो अपलोड (Upload Custom Cover)"}
                    </button>

                    {uploadModalChapter.coverImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        style={{
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Remove Custom Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SEPARATE PDF UPLOAD */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#0f172a", marginBottom: "6px" }}>
                📄 Chapter {uploadModalChapter.chapter} PDF Document:
              </label>

              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf,application/pdf"
                onChange={handleUploadPdfFile}
                style={{ display: "none" }}
              />

              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <button
                  type="button"
                  disabled={uploadingPdf}
                  onClick={() => pdfInputRef.current?.click()}
                  style={{
                    backgroundColor: "#0284c7",
                    color: "white",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  {uploadingPdf ? "⏳ Uploading PDF..." : "📁 Pick & Upload PDF File"}
                </button>
                {uploadModalChapter.pdfUrl && (
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold" }}>
                    ✅ PDF Attached
                  </span>
                )}
              </div>

              {uploadModalChapter.pdfUrl && (
                <div style={{ fontSize: "12px", color: "#64748b", wordBreak: "break-all" }}>
                  URL: {uploadModalChapter.pdfUrl}
                </div>
              )}
            </div>

            {/* 2. SEPARATE MULTI-AUDIO UPLOAD */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#0f172a", marginBottom: "6px" }}>
                🎧 Chapter {uploadModalChapter.chapter} Multi-Listening Audio Files:
              </label>

              <input
                type="file"
                ref={audioInputRef}
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                multiple
                onChange={handleUploadAudioFiles}
                style={{ display: "none" }}
              />

              <button
                type="button"
                disabled={uploadingAudio}
                onClick={() => audioInputRef.current?.click()}
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  marginBottom: "12px"
                }}
              >
                {uploadingAudio ? "⏳ Uploading Audio..." : "🎵 Pick & Upload Audio Files (.mp3)"}
              </button>

              {/* LIST OF TRACKS */}
              <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "white", padding: "6px" }}>
                {uploadModalChapter.audioTracks?.length === 0 ? (
                  <p style={{ margin: 0, padding: "8px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
                    No audio tracks uploaded yet.
                  </p>
                ) : (
                  uploadModalChapter.audioTracks.map((tr, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderBottom: "1px solid #f1f5f9", fontSize: "12px" }}>
                      <span style={{ fontWeight: "bold", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "420px" }}>
                        {tr.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAudioTrack(idx)}
                        style={{ backgroundColor: "#fee2e2", color: "#ef4444", border: "none", padding: "2px 6px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setUploadModalChapter(null)}
                style={{
                  backgroundColor: "#0f172a",
                  color: "white",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN MODAL: UPLOAD NEW MATERIAL                         */}
      {/* ============================================================== */}
      {isUploadMaterialOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingMat) {
              setIsUploadMaterialOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              padding: "28px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                  📤 Upload Learning Material
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Material will be published for Super Admin, Institutes, and Students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadMaterialOpen(false)}
                disabled={isSubmittingMat}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadMaterialSubmit}>
              {/* Target Folder */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Select Folder / Category *
                </label>
                <select
                  value={matFolder}
                  onChange={(e) => setMatFolder(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    backgroundColor: "#f8fafc",
                    color: "#0f172a",
                    fontWeight: "600",
                    outline: "none"
                  }}
                >
                  {folders
                    .filter((f) => f.name !== "Model Question Bank" && f.name !== "EPS Book")
                    .map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.icon || "📁"} {f.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Title */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Material Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Vocabulary Guide 2026, Top 50 Grammar Rules..."
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Short Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief note or summary of what is included in this document..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Document / PDF File Input */}
              <div style={{ marginBottom: "16px", backgroundColor: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                  📄 Document / Book File (PDF, DOCX) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.epub,.txt,application/pdf"
                  required
                  onChange={(e) => setMatFile(e.target.files?.[0] || null)}
                  style={{ fontSize: "13px", color: "#475569", width: "100%" }}
                />
                {matFile && (
                  <div style={{ marginTop: "6px", fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                    Selected: {matFile.name} ({(matFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {/* Optional Audio File Input */}
              <div style={{ marginBottom: "24px", backgroundColor: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                  🎧 Accompanying Audio File (.mp3, .wav) (Optional)
                </label>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b" }}>
                  Upload an audio track for listening practice or audio explanations.
                </p>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={(e) => setMatAudioFile(e.target.files?.[0] || null)}
                  style={{ fontSize: "13px", color: "#475569", width: "100%" }}
                />
                {matAudioFile && (
                  <div style={{ marginTop: "6px", fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                    Selected: {matAudioFile.name}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={isSubmittingMat}
                  onClick={() => setIsUploadMaterialOpen(false)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMat}
                  style={{
                    backgroundColor: isSubmittingMat ? "#94a3b8" : "#16a34a",
                    backgroundImage: isSubmittingMat ? "none" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: isSubmittingMat ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
                  }}
                >
                  {isSubmittingMat ? "⏳ Uploading & Publishing..." : "Publish Material for Everyone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN MODAL: CREATE NEW FOLDER                           */}
      {/* ============================================================== */}
      {isAddFolderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingFolder) {
              setIsAddFolderOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              padding: "26px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>
                  📁 Create New Books Folder
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Add a new category folder in the Books menu for all users.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFolderOpen(false)}
                disabled={isSubmittingFolder}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit}>
              {/* Folder Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Folder / Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vocabulary Bank, Top 1000 Idioms, Mock Exam Audio..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Folder Icon */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Folder Icon
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {["📘", "📕", "📙", "📗", "📚", "📑", "📝", "🎯", "🎧", "💡"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewFolderIcon(emoji)}
                      style={{
                        fontSize: "20px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: newFolderIcon === emoji ? "2px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: newFolderIcon === emoji ? "#eff6ff" : "#ffffff",
                        cursor: "pointer"
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or custom emoji / text..."
                  value={newFolderIcon}
                  onChange={(e) => setNewFolderIcon(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Folder Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Important collection of UBT practice materials"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={isSubmittingFolder}
                  onClick={() => setIsAddFolderOpen(false)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFolder}
                  style={{
                    backgroundColor: isSubmittingFolder ? "#94a3b8" : "#2563eb",
                    backgroundImage: isSubmittingFolder ? "none" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: isSubmittingFolder ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  {isSubmittingFolder ? "⏳ Creating..." : "Create Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUPER ADMIN MODAL: EDIT / UPLOAD CHAPTER MEANING PDF          */}
      {/* ============================================================== */}
      {editMeaningModalChapter && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            padding: "20px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingMeaning) {
              setEditMeaningModalChapter(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              padding: "28px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>
                  📕 Chapter {editMeaningModalChapter.chapter} Meaning Book & Vocabulary
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Upload the official meaning PDF & audio for this chapter.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditMeaningModalChapter(null)}
                disabled={isSavingMeaning}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeaningChapter}>
              {/* Topic Korean & Nepali Titles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Korean Title (한국어)
                  </label>
                  <input
                    type="text"
                    value={editMeaningTitleKo}
                    onChange={(e) => setEditMeaningTitleKo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Nepali Meaning (नेपाली शीर्षक)
                  </label>
                  <input
                    type="text"
                    value={editMeaningTitleNe}
                    onChange={(e) => setEditMeaningTitleNe(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* PDF Document Upload */}
              <div style={{ backgroundColor: "#fef2f2", padding: "16px", borderRadius: "10px", border: "1px solid #fecaca", marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#991b1b", marginBottom: "6px" }}>
                  📄 Chapter {editMeaningModalChapter.chapter} Meaning PDF Document:
                </label>
                <input
                  type="file"
                  ref={meaningPdfInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleUploadMeaningPdf}
                  style={{ display: "none" }}
                />
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                  <button
                    type="button"
                    disabled={uploadingMeaningPdf}
                    onClick={() => meaningPdfInputRef.current?.click()}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    {uploadingMeaningPdf ? "⏳ Uploading PDF..." : "📁 Pick & Upload Meaning PDF"}
                  </button>
                  {editMeaningPdf && (
                    <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold" }}>
                      ✅ PDF Attached
                    </span>
                  )}
                  {editMeaningPdf && (
                    <button
                      type="button"
                      onClick={() => setEditMeaningPdf("")}
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {editMeaningPdf && (
                  <div style={{ fontSize: "11px", color: "#64748b", wordBreak: "break-all" }}>
                    URL: {editMeaningPdf}
                  </div>
                )}
              </div>

              {/* Audio Upload */}
              <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                  🎧 Chapter {editMeaningModalChapter.chapter} Vocabulary Audio File (Optional):
                </label>
                <input
                  type="file"
                  ref={meaningAudioInputRef}
                  accept="audio/*,.mp3,.wav,.m4a"
                  onChange={handleUploadMeaningAudio}
                  style={{ display: "none" }}
                />
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                  <button
                    type="button"
                    disabled={uploadingMeaningAudio}
                    onClick={() => meaningAudioInputRef.current?.click()}
                    style={{
                      backgroundColor: "#0284c7",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    {uploadingMeaningAudio ? "⏳ Uploading Audio..." : "🎵 Pick & Upload MP3 Audio"}
                  </button>
                  {editMeaningAudio && (
                    <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold" }}>
                      ✅ Audio Attached
                    </span>
                  )}
                  {editMeaningAudio && (
                    <button
                      type="button"
                      onClick={() => setEditMeaningAudio("")}
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Vocabulary Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Chapter Vocabulary Notes / Summary
                </label>
                <textarea
                  rows={3}
                  value={editMeaningNotes}
                  onChange={(e) => setEditMeaningNotes(e.target.value)}
                  placeholder="e.g. Greeting vocabulary, classroom expressions, important grammar endings..."
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  disabled={isSavingMeaning}
                  onClick={() => setEditMeaningModalChapter(null)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "9px 16px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeaning}
                  style={{
                    backgroundColor: isSavingMeaning ? "#94a3b8" : "#dc2626",
                    backgroundImage: isSavingMeaning ? "none" : "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    color: "white",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: isSavingMeaning ? "not-allowed" : "pointer"
                  }}
                >
                  {isSavingMeaning ? "⏳ Saving..." : "Save Chapter Meaning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTITUTE MODEL QUESTION BANK PURCHASE MODAL */}
      {showInstituteBuyModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            maxWidth: "520px",
            width: "100%",
            padding: "30px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            border: "2px solid #fed7aa"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "36px" }}>📙</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#9a3412" }}>
                  Purchase Model Question Bank
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Institute Center License & Test Series
                </span>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", marginBottom: "18px" }}>
              <strong>Model Question Bank</strong> is a separate premium product. To unlock these 40-question full UBT exam sets (Reading 20 + Listening 20) with audio for your institute, this product must be purchased.
            </p>

            <div style={{ backgroundColor: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#7c2d12" }}>Product License:</span>
                <span style={{ fontSize: "18px", fontWeight: "900", color: "#ea580c" }}>Rs. 2,500</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#9a3412", lineHeight: "1.6" }}>
                <li>Full 40-Question Real EPS-TOPIK UBT Sets</li>
                <li>Official Audio, 50 Min Time, Real-time Scoring</li>
                <li>Preview and Conduct Exams for all Institute Students</li>
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  const currentInst = typeof window !== "undefined" ? (localStorage.getItem("currentInstitute") || "Language Institute") : "Language Institute";
                  const instPurchased = JSON.parse(localStorage.getItem(`institutePurchasedPackages_${currentInst}`) || "[]");
                  if (!instPurchased.includes("Model Question Bank")) {
                    instPurchased.push("Model Question Bank");
                    localStorage.setItem(`institutePurchasedPackages_${currentInst}`, JSON.stringify(instPurchased));
                  }
                  const allInst = JSON.parse(localStorage.getItem("institutes") || "[]");
                  const matched = allInst.find(i => (i.name && i.name.toLowerCase() === currentInst.toLowerCase()) || (i.username && i.username.toLowerCase() === currentInst.toLowerCase()));
                  if (matched) {
                    matched.purchasedPackages = Array.from(new Set([...(matched.purchasedPackages || []), "Model Question Bank"]));
                    localStorage.setItem("institutes", JSON.stringify(allInst));
                  }
                  alert(`Success! "Model Question Bank" product has been activated for ${currentInst}.`);
                  setShowInstituteBuyModal(false);
                  window.location.reload();
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#16a34a",
                  backgroundImage: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
                }}
              >
                ⚡ Instant Activate License (Rs. 2,500)
              </button>

              <button
                type="button"
                onClick={() => {
                  const currentInst = typeof window !== "undefined" ? (localStorage.getItem("currentInstitute") || "Language Institute") : "Language Institute";
                  const reqs = JSON.parse(localStorage.getItem("institutePurchaseRequests") || "[]");
                  reqs.unshift({
                    id: Date.now(),
                    instituteName: currentInst,
                    product: "Model Question Bank",
                    price: "Rs. 2,500",
                    date: new Date().toLocaleDateString(),
                    status: "Pending"
                  });
                  localStorage.setItem("institutePurchaseRequests", JSON.stringify(reqs));
                  alert(`Purchase request submitted to Super Admin for ${currentInst}!`);
                  setShowInstituteBuyModal(false);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                📩 Send Purchase Request to Super Admin
              </button>

              <button
                type="button"
                onClick={() => setShowInstituteBuyModal(false)}
                style={{
                  width: "100%",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  marginTop: "4px"
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JLPT & JFT MOCK EXAM SIMULATION MODAL */}
      {activeJlptExamSet && (
        <JlptMockExamModal
          examSet={activeJlptExamSet}
          mode={jlptExamMode}
          onClose={() => setActiveJlptExamSet(null)}
          onComplete={(result) => {
            setJlptPastResults(prev => {
              const updated = { ...prev, [result.examId]: result };
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem("jlpt_past_results_map", JSON.stringify(updated));
                }
              } catch (e) {
                console.error("Failed to save jlpt results to localStorage", e);
              }
              return updated;
            });
          }}
        />
      )}
    </div>
  );
}
