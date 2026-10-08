const PACKAGE_NAME = "30 SET CHAPTER UBT";
const SET_NAME = "SET 1";

const opt = (a, b, c, d) => [
  { text: a, audio: "", image: "", video: "" },
  { text: b, audio: "", image: "", video: "" },
  { text: c, audio: "", image: "", video: "" },
  { text: d, audio: "", image: "", video: "" }
];

const q = (num, type, mainHeading, description, options, answer) => ({
  id: 900000 + num,
  package: PACKAGE_NAME,
  set: SET_NAME,
  type,
  mainHeading,
  questionHeading: String(num),
  description,
  image: "",
  audio: "",
  options,
  answer
});

const PIC = opt("①", "②", "③", "④");

export const SET1_META = { packageName: PACKAGE_NAME, setName: SET_NAME };

export const SET1_QUESTIONS = [
  q(1, "Reading", "[1~2] 다음 내용과 관계있는 그림을 고르십시오.", "병원입니다", PIC, 0),
  q(2, "Reading", "[1~2] 다음 내용과 관계있는 그림을 고르십시오.", "설거지를 하고 있습니다", PIC, 0),
  q(3, "Reading", "[3~4] 다음 질문에 답하십시오.", "다음 단어와 관계 있는 것은 무엇입니까?\n은행, 커피숍", opt("장소", "물건", "음식", "교통"), 0),
  q(4, "Reading", "[3~4] 다음 질문에 답하십시오.", "다음 단어의 비슷한 말은 무엇입니까?\n나이", opt("성별", "이름", "연세", "물건"), 2),
  q(5, "Reading", "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "가: 디안 씨, 이따 두 시에 전화하세요.\n나: 네, 반장님. _____.", opt("감사합니다", "죄송합니다", "아닙니다", "알겠습니다"), 3),
  q(6, "Reading", "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "머리가 너무 길어요. 그래서 미용실 _____ 머리를 자를 거예요.", opt("에서", "에", "을", "이"), 0),
  q(7, "Reading", "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "저는 축구를 좋아합니다. 마두 씨는 _____ 운동을 좋아해요?", opt("언제", "무엇", "무슨", "누구"), 2),
  q(8, "Reading", "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "_____은/는 10월 15일입니다. 오늘은 10월 16일입니다.", opt("어제", "내일", "모레", "주말"), 0),
  q(9, "Reading", "[9~12] 다음 질문에 답하십시오.", "다음 그림을 보고 알맞은 것을 고르십시오.", opt("악수를 하고 있습니다.", "전화를 하고 있습니다.", "영화를 보고 있습니다.", "물을 주고 있습니다."), 0),
  q(10, "Reading", "[9~12] 다음 질문에 답하십시오.", "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.", opt("토요일에 뭐 했어요?", "집에 오았어요.", "밥을 먹었어요.", "물을 마사요."), 0),
  q(11, "Reading", "[9~12] 다음 질문에 답하십시오.", "다음 글을 읽고 내용과 같은 것을 고르십시오.", opt("공원에 오고 있습니다.", "공원에 가고 있습니다.", "공원에 기다리고 있습니다.", "공원에 앉고 있습니다."), 1),
  q(12, "Reading", "[9~12] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "공 ○ 하다", opt("부", "긴", "푸", "먼"), 0),
  q(13, "Reading", "[13~14] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "어제 온라인 쇼핑몰에서 주문한 치마는 _____ 예뻐요.", opt("싸서", "싸고", "받아서", "받고"), 1),
  q(14, "Reading", "[13~14] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", "한국인들은 방이나 마루의 바닥에 앉아서 식사를 하거나 휴식을 취하는 좌식 문화를 _____ 있습니다.", opt("빌리고", "열리고", "가지고", "말리고"), 2),
  q(15, "Reading", "[15~16] 다음 글을 읽고 무엇에 대한 글인지 고르십시오.", "한국 사람들은 보통 인사를 할 때 \"안녕하세요?\", \"안녕히 가세요.\"와 같은 인사말을 하면서 머리를 숙입니다. 그리고 머리를 숙이면서 악수를 함께 하는 사람도 있습니다. 그런데 서양에서는 악수를 할 때 머리를 숙이지 않습니다.", opt("한국 사람의 취미", "한국 사람의 인사법", "한국 사람의 식사", "한국의 의상"), 1),
  q(16, "Reading", "[15~16] 다음 글을 읽고 무엇에 대한 글인지 고르십시오.", "대한민국의 수도이며, 정치, 경제, 문화의 중심지입니다. 한강이 흐르고, 경복궁, 남산타워 같은 유명한 관광지가 있습니다.", opt("부산", "인천", "서울", "대전"), 2),
  q(17, "Reading", "[17~18] 다음 글을 읽고 내용과 같은 것을 고르십시오.", "한국의 도시는 지역마다 분위기가 다릅니다. 서울은 지하철이 촘촘하고 한강공원에서 자전거를 빌려 타는 사람이 많습니다. 부산은 바다와 가까워 여름에 해운대와 광안리 해변으로 여행객이 모입니다. 전주는 한옥마을이 유명해서 주말이면 전통 한복을 빌려 입고 골목을 산책하는 사람들이 많습니다. 세 도시 모두 기차로 이동할 수 있고, 음식과 볼거리가 달라서 일정에 따라 도시를 나눠 방문하면 좋습니다.", opt("부산은 산이 많아 바닷가가 없습니다.", "전주에서는 대부분 사람들이 스키를 타러 겨울에만 방문합니다.", "서울에서는 한강공원에서 자전거를 빌려 탈 수 있습니다.", "세 도시는 비행기로만 갈 수 있고 버스로는 갈 수 없습니다."), 2),
  q(18, "Reading", "[17~18] 다음 글을 읽고 내용과 같은 것을 고르십시오.", "한국인들은 대부분 집안에서 신발을 벗고 생활하며 바닥에 앉아서 식사를 하거나 TV를 보기도 합니다. 이러한 좌식 문화는 바닥을 따뜻하게 하는 한국의 전통 난방 방식 때문에 생겨난 것으로 현대에도 지속되고 있습니다. 밖에서는 주로 소파나 의자에 앉아 생활하는 젊은 사람들도 집안에서는 자주 따뜻한 바닥에 앉아 TV를 보거나 쉬기도 합니다.", opt("좌식 문화는 한국의 전통 생활 방식입니다.", "한국인들은 집안에서 신발을 신고 생활합니다.", "한국인들은 바닥에 앉아서 식사하지 않습니다.", "젊은 사람들은 좌식 문화에 익숙하지 않습니다."), 0),
  q(19, "Reading", "[19~20] 무엇에 대한 설명입니까?", "회사나 공장에서 일하는 사람입니다.", opt("농부", "근로자", "요리사", "학생"), 1),
  q(20, "Reading", "[19~20] 무엇에 대한 설명입니까?", "바다나 강에서 물고기를 잡는 사람입니다.", opt("목수", "어부", "교사", "의사"), 1),
  q(21, "Listening", "[21~22] 다음을 듣고 빈칸에 알맞은 것을 고르십시오.", "○시", opt("도", "모", "보", "소"), 0),
  q(22, "Listening", "[21~22] 다음을 듣고 빈칸에 알맞은 것을 고르십시오.", "저는 _____에 가요.", opt("학교", "공원", "시장", "마트"), 0),
  q(23, "Listening", "[23~24] 들은 것을 고르십시오.", "", PIC, 0),
  q(24, "Listening", "[23~24] 들은 것을 고르십시오.", "", PIC, 0),
  q(25, "Listening", "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", "이것은 무엇입니까?", PIC, 0),
  q(26, "Listening", "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", "여기는 어디입니까?", PIC, 0),
  q(27, "Listening", "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", "이 사람은 무엇을 하고 있습니까?", PIC, 0),
  q(28, "Listening", "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", "얼마나 있습니까?", PIC, 0),
  q(29, "Listening", "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", "병원은 어디에 있습니까?", PIC, 0),
  q(30, "Listening", "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", "", PIC, 0),
  q(31, "Listening", "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", "", opt("오월 구일입니다.", "버스로 가요.", "매일 가요.", "두 시입니다."), 0),
  q(32, "Listening", "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", "", opt("영화를 봤어요.", "김치를 먹었어요.", "아침에 해요.", "요리하고 있어요."), 0),
  q(33, "Listening", "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", "", opt("아니요, 없어요.", "네, 없어요.", "아니요, 마시고 싶어요.", "아니요, 주스예요."), 0),
  q(34, "Listening", "[34~35] 다음을 듣고 이어지는 말을 고르십시오.", "", opt("라면 1개 주세요.", "케이크를 먹었어요.", "5월 20일이에요.", "인터넷에서 찾았어요."), 0),
  q(35, "Listening", "[34~35] 다음을 듣고 이어지는 말을 고르십시오.", "", opt("아니요, 닛차난 씨는 운동하고 있어요.", "아니요, 닛차난 씨는 올해 23살이에요.", "네, 저하고 같이 밥을 먹고 있어요.", "네, 친구를 만나고 있어요."), 0),
  q(36, "Listening", "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", "", opt("20000원", "10000원", "1000원", "2000원"), 0),
  q(37, "Listening", "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", "", opt("3월 8일", "4월 8일", "5월 8일", "6월 8일"), 0),
  q(38, "Listening", "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", "남자는 지금 어디에 있습니까?", opt("병원", "우체국", "편의점", "학교"), 0),
  q(39, "Listening", "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", "두 사람은 무엇에 대해 말하고 있습니까?", opt("가구", "집안일", "전자제품", "마트"), 0),
  q(40, "Listening", "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", "가방 안에 없는 물건은 무엇입니까?", opt("지갑", "열쇠", "사진", "여권"), 0)
];

const UBT_PACKAGE_NAME = "Full Set UBT";
const UBT_SET_NAME = "UBT SET 01";

const safeParse = (raw, fallback) => {
  try {
    if (!raw || raw === "undefined" || raw === "null") return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : (parsed || fallback);
  } catch (e) {
    return fallback;
  }
};

export function seedSet1Questions() {
  try {
    if (typeof window === "undefined" && typeof globalThis === "undefined") return;

    const seedKey = "set1QuestionsSeededV4";
    const packages = safeParse(localStorage.getItem("examPackages"), []);
    const sets = safeParse(localStorage.getItem("examSets"), []);
    const questions = safeParse(localStorage.getItem("questionBank"), []);

    let nextPackages = [...packages];
    if (!nextPackages.some((p) => p.name === PACKAGE_NAME)) {
      nextPackages.push({
        id: "pkg-chapter-30",
        name: PACKAGE_NAME,
        price: "Rs. 1,000",
        desc: "Complete chapterwise practice sets with audio."
      });
    }
    if (!nextPackages.some((p) => p.name === UBT_PACKAGE_NAME)) {
      nextPackages.push({
        id: "pkg-ubt-full",
        name: UBT_PACKAGE_NAME,
        price: "Rs. 2,000",
        desc: "Standard official EPS-TOPIK UBT practice sets (20 Reading + 20 Listening)."
      });
    }
    if (!nextPackages.some((p) => p.name === "100 UBT set")) {
      nextPackages.push({
        id: "pkg-ubt-100",
        name: "100 UBT set",
        price: "Rs. 3,500",
        desc: "100 Full length UBT practice sets with high score simulation."
      });
    }
    localStorage.setItem("examPackages", JSON.stringify(nextPackages));

    // Normalize sets to uppercase set names
    let nextSets = sets.map((s) => {
      const upperName = (s.name || "").trim().toUpperCase();
      const sType = s.setType || (upperName.includes("CHAPTER") ? "Chapterwise" : "UBT");
      return {
        ...s,
        name: upperName,
        setType: sType
      };
    });

    // Seed Chapter-wise set
    const hasChapterSet = nextSets.some((s) => (s.name || "").toUpperCase() === SET_NAME);
    if (!hasChapterSet) {
      nextSets.push({
        id: "set-chapter-01",
        name: SET_NAME,
        packageName: PACKAGE_NAME,
        setType: "Chapterwise",
        duration: 3000
      });
    }

    // Seed UBT set
    const hasUbtSet = nextSets.some((s) => (s.name || "").toUpperCase() === UBT_SET_NAME);
    if (!hasUbtSet) {
      nextSets.push({
        id: "set-ubt-01",
        name: UBT_SET_NAME,
        packageName: UBT_PACKAGE_NAME,
        setType: "UBT",
        duration: 3000
      });
    }
    localStorage.setItem("examSets", JSON.stringify(nextSets));

    // Normalize questions to uppercase set references
    let nextQuestions = questions.map((q) => ({
      ...q,
      set: (q.set || "").trim().toUpperCase()
    }));

    // Also seed questions for UBT SET 01 if needed
    const ubtQuestions = SET1_QUESTIONS.map((item) => ({
      ...item,
      id: 950000 + (Number(item.questionHeading) || 1),
      package: UBT_PACKAGE_NAME,
      set: UBT_SET_NAME
    }));

    const hasSet1 = nextQuestions.some((item) => (item.set || "").toUpperCase() === SET_NAME);
    const hasUbt1 = nextQuestions.some((item) => (item.set || "").toUpperCase() === UBT_SET_NAME);

    if (!hasSet1) {
      nextQuestions = [...nextQuestions, ...SET1_QUESTIONS];
    }
    if (!hasUbt1) {
      nextQuestions = [...nextQuestions, ...ubtQuestions];
    }

    localStorage.setItem("questionBank", JSON.stringify(nextQuestions));
    localStorage.setItem(seedKey, "1");
  } catch (err) {
    console.error("Failed to seed SET 1 and UBT questions", err);
  }
}

