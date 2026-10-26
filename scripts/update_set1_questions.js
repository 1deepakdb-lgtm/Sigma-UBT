import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SET1_READING_QUESTIONS = [
  {
    qIndex: 1,
    mainHeading: "[1~2] 그림을 보고 알맞은 단어나 문장을 고르십시오.",
    questionHeading: "1",
    description: "",
    options: ["키보드", "피아노", "컴퓨터", "사진기"],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 2,
    mainHeading: "[1~2] 그림을 보고 알맞은 단어나 문장을 고르십시오.",
    questionHeading: "2",
    description: "",
    options: ["이야기를 하고 있습니다.", "인사를 하고 있습니다.", "공부를 하고 있습니다.", "일을 하고 있습니다."],
    answer: 2 // 3 -> index 2
  },
  {
    qIndex: 3,
    mainHeading: "[3~6] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    questionHeading: "3",
    description: "",
    options: ["자", "권", "서", "관"],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 4,
    mainHeading: "[3~6] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    questionHeading: "4",
    description: "선생님이 온라인 쇼핑몰에서 알뜰 폰을 _________.",
    options: ["삽니다", "만납니다", "전화합니다", "부릅니다"],
    answer: 0 // 1 -> index 0
  },
  {
    qIndex: 5,
    mainHeading: "[3~6] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    questionHeading: "5",
    description: "가: 드르가 씨, 이건 드르가씨의 가방이에요?\n나: _______. 마두 씨의 가방이에요.",
    options: ["없어요", "있어요", "네", "아니요"],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 6,
    mainHeading: "[3~6] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.",
    questionHeading: "6",
    description: "가: 라으트 씨의 __________ 은/는 무엇입니까 ?\n나: 저는 학생입니다.",
    options: ["나라", "취미", "직업", "이름"],
    answer: 2 // 3 -> index 2
  },
  {
    qIndex: 7,
    mainHeading: "[7~12] 다음 질문에 답하십시오.",
    questionHeading: "7",
    description: "이 사람은 무엇을 합니까 ?",
    options: ["식사를 합니다.", "물건을 팝니다.", "운전을 합니다.", "요리를 합니다."],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 8,
    mainHeading: "[7~12] 다음 질문에 답하십시오.",
    questionHeading: "8",
    description: "이 사람의 성함은 무엇입니까 ?",
    options: ["외국인 사람입니다.", "카날 드르가입니다.", "연세는 23입니다.", "외국인 여자입니다."],
    answer: 1 // 2 -> index 1
  },
  {
    qIndex: 9,
    mainHeading: "[7~12] 다음 질문에 답하십시오.",
    questionHeading: "9",
    description: "다음 달력을 보고 내용과 같은 것을 고르십시오.",
    options: ["오늘은 삼일입니다.", "이번달은 시월입니다.", "내일은 이일입니다.", "어제는 십일입니다."],
    answer: 1 // 2 -> index 1
  },
  {
    qIndex: 10,
    mainHeading: "[7~12] 다음 질문에 답하십시오.",
    questionHeading: "10",
    description: "다음 그래프를 보고 가장 알맞은 것을 고르십시오.",
    options: ["가격은 모두 3만원입니다.", "물건을 비싸게 판매합니다.", "한대 알뜰 폰을 판매합니다.", "수량은 모두 30개입니다."],
    answer: 2 // 3 -> index 2
  },
  {
    qIndex: 11,
    mainHeading: "[7~12] 다음 질문에 답하십시오.",
    questionHeading: "11",
    description: "다음 작업을 순서대로 고르십시오.",
    options: ["c→a→b", "a→b→c", "b→a→c", "a→c→b"],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 12,
    mainHeading: "[7~12] 다음 질문에 답하십시오.",
    questionHeading: "12",
    description: "다음 그래프를 보고 가장 알맞은 것을 고르십시오.",
    options: ["캄보디아 사람은 제일 많습니다.", "인도네시아 사람은 제일 적습니다.", "베트남 사람은 전혀 없습니다.", "네팔 사람은 제일 많습니다."],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 13,
    mainHeading: "[13~14] 다음 글을 읽고 무엇에 대한 글인지 고르십시오.",
    questionHeading: "13",
    description: "저는 온라인 쇼핑몰을 자주 사용합니다. 온라인 쇼핑몰을 통해서 휴대전화를 싸게 구입했습니다. 왜냐하면 온라인 쇼핑몰에서는 정기적으로 할인 행사를 하거나 할인 쿠폰을 제공합니다. 사람들이 이를 활용하여 특정 상품을 싸게 사기도 합니다.",
    options: ["비싼 물건의 특정", "생필품의 사용법", "할인 쿠폰 판매", "온라인 쇼핑몰의 특정"],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 14,
    mainHeading: "[13~14] 다음 글을 읽고 무엇에 대한 글인지 고르십시오.",
    questionHeading: "14",
    description: "한국 사람들은 자신보다 나이가 많거나 지위가 높은 사람에게 인사할 때 허리를 굽혀 인사합니다. 자신보다 어리거나 친한 사람에게는 손을 흔들어 인사합니다. 공적인 상황에서는 주로 악수를 하며 인사합니다. 이때 자신보다 나이가 훨씬 많거나 지위가 높은 사람이라면 왼손으로 오른팔을 받치고 악수해야 합니다.",
    options: ["인사를 하는 방법", "허리를 굽히는 방법", "박수를 하는 방법", "높임말을 하는 방법"],
    answer: 0 // 1 -> index 0
  },
  {
    qIndex: 15,
    mainHeading: "[15~16] 다음 글을 읽고 내용과 같은 것을 고르십시오.",
    questionHeading: "15",
    description: "‘당근’이라는 모바일 앱이 아주 활용됩니다. 사람들이 ‘당근’이라는 중고 거래 플랫폼을 통해서 생필품을 싸게 구합니다. 다른 사람들이 더 이상 사용하지 않는 생활용품뿐만 아니라 가전제품, 전기제품, 가구와 같은 다양한 물건을 저렴하게 살 수 있습니다.",
    options: ["사용하지 않은 생활용품만 살 수 있습니다.", "중고 거래 플랫폼을 통해서 당근을 삽니다.", "모바일 앱을 통해서 물건을 저렴하게 삽니다.", "모바일 앱을 더 이상 사용하지 않습니다."],
    answer: 2 // 3 -> index 2
  },
  {
    qIndex: 16,
    mainHeading: "[15~16] 다음 글을 읽고 내용과 같은 것을 고르십시오.",
    questionHeading: "16",
    description: "한국에서는 상대에 따라 인사하는 방식이 다릅니다. 자신보다 나이가 많거나 지위가 높은 사람에게는 “안녕하세요?” 또는 “안녕하십니까?”라고 말하며 고개를 숙이거나 허리를 굽혀 인사합니다. 고개를 숙이거나 허리를 굽히는 것은 상대방에 대한 존경을 나타내는 제스처입니다.",
    options: ["상대에 따라 인사 방법은 같습니다.", "다양한 사람에게 다르게 인사를 합니다.", "지위가 낮은 사람에게 고개를 숙입니다.", "나이가 많은 사람에게 인사를 안 합니다."],
    answer: 1 // 2 -> index 1
  },
  {
    qIndex: 17,
    mainHeading: "[17~18] 다음 설명에 알맞은 어휘를 고르십시오.",
    questionHeading: "17",
    description: "이 물건은 잠을 잘 때 목을 편안하게 받쳐주기 위해 사용됩니다. 주로 침대에서 사용됩니다.",
    options: ["베개", "열쇠", "이불", "거울"],
    answer: 0 // 1 -> index 0
  },
  {
    qIndex: 18,
    mainHeading: "[17~18] 다음 설명에 알맞은 어휘를 고르십시오.",
    questionHeading: "18",
    description: "이 사람은 식당이나 호텔의 주방에서 다양한 음식을 만드는 일을 합니다. 메뉴를 계획하고 재료를 준비합니다.",
    options: ["기술자", "간호사", "점원", "요리사"],
    answer: 3 // 4 -> index 3
  },
  {
    qIndex: 19,
    mainHeading: "[19~20] 다음 질문에 답하십시오.",
    questionHeading: "19",
    description: "다음 단어와 관계있는 것은 무엇입니까 ?\n[우산, 휴지, 빗]",
    options: ["생활용품", "사무실 물건", "직업명", "직장생활"],
    answer: 0 // 1 -> index 0
  },
  {
    qIndex: 20,
    mainHeading: "[19~20] 다음 질문에 답하십시오.",
    questionHeading: "20",
    description: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.",
    options: ["칼는 많아요.", "휴대폰가 비싸요.", "안경 아니에요.", "지갑은 주머니에 있어요."],
    answer: 3 // 4 -> index 3
  }
];

async function updateSet1() {
  console.log("Updating Set 1 questions in Database...");

  const targetSetIds = ["ubt-100-set-001", "e74c15bd-ad03-4431-a2ee-fb9552237198"];

  // Fetch listening questions from ubt-100-set-001 (Q21 to Q40) if needed for e74c...
  const listeningQs = await prisma.question.findMany({
    where: { examSetId: "ubt-100-set-001", qIndex: { gte: 21, lte: 40 } },
    orderBy: { qIndex: 'asc' }
  });

  for (const setId of targetSetIds) {
    const examSet = await prisma.examSet.findUnique({ where: { id: setId } });
    if (!examSet) {
      console.log(`Set ${setId} not found, skipping.`);
      continue;
    }

    console.log(`Processing Set ${examSet.name} (${setId})...`);

    // Delete existing reading questions (1 to 20)
    await prisma.question.deleteMany({
      where: {
        examSetId: setId,
        qIndex: { lte: 20 }
      }
    });

    // Insert the 20 provided questions
    for (const q of SET1_READING_QUESTIONS) {
      await prisma.question.create({
        data: {
          examSetId: setId,
          qIndex: q.qIndex,
          type: "Reading",
          mainHeading: q.mainHeading,
          questionHeading: q.questionHeading,
          description: q.description,
          image: "",
          audio: "",
          optionsJson: JSON.stringify(q.options.map(t => ({ text: t, audio: "", image: "", video: "" }))),
          answer: q.answer
        }
      });
    }

    // If setId had 0 listening questions, copy from listeningQs
    const currentListeningCount = await prisma.question.count({
      where: { examSetId: setId, qIndex: { gte: 21 } }
    });

    if (currentListeningCount < 20 && listeningQs.length > 0) {
      for (const lq of listeningQs) {
        await prisma.question.create({
          data: {
            examSetId: setId,
            qIndex: lq.qIndex,
            type: lq.type,
            mainHeading: lq.mainHeading,
            questionHeading: lq.questionHeading,
            description: lq.description,
            image: lq.image || "",
            audio: lq.audio || "",
            optionsJson: lq.optionsJson,
            answer: lq.answer
          }
        });
      }
    }

    const totalQ = await prisma.question.count({ where: { examSetId: setId } });
    console.log(`✓ Set ${examSet.name} (${setId}) now has ${totalQ} questions.`);
  }

  console.log("🎉 Successfully updated Set 1 questions!");
}

updateSet1()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error updating Set 1:", err);
    process.exit(1);
  });
