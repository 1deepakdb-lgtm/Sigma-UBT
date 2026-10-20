import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PACKAGE_NAMES = [
  "10 Set UBT",
  "20 Set UBT",
  "30 Set UBT",
  "50 Set UBT",
  "80 Set UBT",
  "100 Set UBT",
  "150 Set UBT",
  "200 Set UBT",
  "30 Set Chapter UBT",
  "60 Set Chapter Final Set UBT",
  "Full Set UBT"
];

const opt = (a, b, c, d) => JSON.stringify([
  { text: a, audio: "", image: "", video: "" },
  { text: b, audio: "", image: "", video: "" },
  { text: c, audio: "", image: "", video: "" },
  { text: d, audio: "", image: "", video: "" }
]);

const PIC = JSON.stringify([
  { text: "①", audio: "", image: "", video: "" },
  { text: "②", audio: "", image: "", video: "" },
  { text: "③", audio: "", image: "", video: "" },
  { text: "④", audio: "", image: "", video: "" }
]);

async function main() {
  console.log('Seeding Sigma UBT database...');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPassword },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      name: 'Sigma Super Admin',
      status: 'Active'
    }
  });
  console.log('Created admin:', admin.username);

  // 2. Create Demo Institute
  const instPassword = await bcrypt.hash('1234', 10);
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const entryDate = today.toISOString().slice(0, 10);
  const expireDate = nextMonth.toISOString().slice(0, 10);

  const institute = await prisma.institute.upsert({
    where: { username: 'sigma' },
    update: { status: 'Active', expireDate },
    create: {
      name: 'Sigma Demo Institute',
      username: 'sigma',
      subscription: '1 Month',
      entryDate,
      expireDate,
      examPackage: 'Full Set UBT',
      status: 'Active',
      logoUrl: '/sigma-logo.png'
    }
  });

  const instUser = await prisma.user.upsert({
    where: { username: 'sigma' },
    update: { passwordHash: instPassword, instituteId: institute.id },
    create: {
      username: 'sigma',
      passwordHash: instPassword,
      role: 'institute',
      name: 'Sigma Demo Institute',
      instituteId: institute.id,
      status: 'Active'
    }
  });
  console.log('Created institute user:', instUser.username);

  // 3. Create Demo Student
  const studentPassword = await bcrypt.hash('1234', 10);
  const student = await prisma.user.upsert({
    where: { username: 'student' },
    update: { passwordHash: studentPassword, instituteId: institute.id },
    create: {
      username: 'student',
      passwordHash: studentPassword,
      role: 'student',
      name: 'Demo Student',
      phone: '9800000000',
      batch: 'Full Set UBT',
      status: 'Active',
      instituteId: institute.id
    }
  });
  console.log('Created student:', student.username);

  // 4. Seed Exam Packages
  let chapterPackage = null;
  for (const name of PACKAGE_NAMES) {
    const pkg = await prisma.examPackage.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} practice and real exam simulation.` }
    });
    if (name === "30 Set Chapter UBT") chapterPackage = pkg;
  }

  // 5. Create Exam Set 1
  const examSet = await prisma.examSet.upsert({
    where: { id: 'set-1-demo' },
    update: {},
    create: {
      id: 'set-1-demo',
      name: 'SET 1',
      packageName: '30 Set Chapter UBT',
      packageId: chapterPackage?.id,
      duration: 3000
    }
  });

  // Assign set to demo institute
  await prisma.instituteExamSet.upsert({
    where: {
      instituteId_examSetId: {
        instituteId: institute.id,
        examSetId: examSet.id
      }
    },
    update: {},
    create: {
      instituteId: institute.id,
      examSetId: examSet.id
    }
  });

  // 6. Seed 40 Questions (20 Reading + 20 Listening)
  const existingQuestions = await prisma.question.count({ where: { examSetId: examSet.id } });
  if (existingQuestions === 0) {
    const questionsData = [
      // Reading 1-20
      { qIndex: 1, type: "Reading", mainHeading: "[1~2] 다음 내용과 관계있는 그림을 고르십시오.", description: "병원입니다", optionsJson: PIC, answer: 0 },
      { qIndex: 2, type: "Reading", mainHeading: "[1~2] 다음 내용과 관계있는 그림을 고르십시오.", description: "설거지를 하고 있습니다", optionsJson: PIC, answer: 0 },
      { qIndex: 3, type: "Reading", mainHeading: "[3~4] 다음 질문에 답하십시오.", description: "다음 단어와 관계 있는 것은 무엇입니까?\n은행, 커피숍", optionsJson: opt("장소", "물건", "음식", "교통"), answer: 0 },
      { qIndex: 4, type: "Reading", mainHeading: "[3~4] 다음 질문에 답하십시오.", description: "다음 단어의 비슷한 말은 무엇입니까?\n나이", optionsJson: opt("성별", "이름", "연세", "물건"), answer: 2 },
      { qIndex: 5, type: "Reading", mainHeading: "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "가: 디안 씨, 이따 두 시에 전화하세요.\n나: 네, 반장님. _____.", optionsJson: opt("감사합니다", "죄송합니다", "아닙니다", "알겠습니다"), answer: 3 },
      { qIndex: 6, type: "Reading", mainHeading: "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "머리가 너무 길어요. 그래서 미용실 _____ 머리를 자를 거예요.", optionsJson: opt("에서", "에", "을", "이"), answer: 0 },
      { qIndex: 7, type: "Reading", mainHeading: "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "저는 축구를 좋아합니다. 마두 씨는 _____ 운동을 좋아해요?", optionsJson: opt("언제", "무엇", "무슨", "누구"), answer: 2 },
      { qIndex: 8, type: "Reading", mainHeading: "[5~8] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "_____은/는 10월 15일입니다. 오늘은 10월 16일입니다.", optionsJson: opt("어제", "내일", "모레", "주말"), answer: 0 },
      { qIndex: 9, type: "Reading", mainHeading: "[9~12] 다음 질문에 답하십시오.", description: "다음 그림을 보고 알맞은 것을 고르십시오.", optionsJson: opt("악수를 하고 있습니다.", "전화를 하고 있습니다.", "영화를 보고 있습니다.", "물을 주고 있습니다."), answer: 0 },
      { qIndex: 10, type: "Reading", mainHeading: "[9~12] 다음 질문에 답하십시오.", description: "다음 중 밑줄 친 부분이 맞는 문장을 고르십시오.", optionsJson: opt("토요일에 뭐 했어요?", "집에 오았어요.", "밥을 먹었어요.", "물을 마사요."), answer: 0 },
      { qIndex: 11, type: "Reading", mainHeading: "[9~12] 다음 질문에 답하십시오.", description: "다음 글을 읽고 내용과 같은 것을 고르십시오.", optionsJson: opt("공원에 오고 있습니다.", "공원에 가고 있습니다.", "공원에 기다리고 있습니다.", "공원에 앉고 있습니다."), answer: 1 },
      { qIndex: 12, type: "Reading", mainHeading: "[9~12] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "공 ○ 하다", optionsJson: opt("부", "긴", "푸", "먼"), answer: 0 },
      { qIndex: 13, type: "Reading", mainHeading: "[13~14] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "어제 온라인 쇼핑몰에서 주문한 치마는 _____ 예뻐요.", optionsJson: opt("싸서", "싸고", "받아서", "받고"), answer: 1 },
      { qIndex: 14, type: "Reading", mainHeading: "[13~14] 빈칸에 들어갈 가장 알맞은 것을 고르십시오.", description: "한국인들은 방이나 마루의 바닥에 앉아서 식사를 하거나 휴식을 취하는 좌식 문화를 _____ 있습니다.", optionsJson: opt("빌리고", "열리고", "가지고", "말리고"), answer: 2 },
      { qIndex: 15, type: "Reading", mainHeading: "[15~16] 다음 글을 읽고 무엇에 대한 글인지 고르십시오.", description: "한국 사람들은 보통 인사를 할 때 \"안녕하세요?\", \"안녕히 가세요.\"와 같은 인사말을 하면서 머리를 숙입니다.", optionsJson: opt("한국 사람의 취미", "한국 사람의 인사법", "한국 사람의 식사", "한국의 의상"), answer: 1 },
      { qIndex: 16, type: "Reading", mainHeading: "[15~16] 다음 글을 읽고 무엇에 대한 글인지 고르십시오.", description: "대한민국의 수도이며, 정치, 경제, 문화의 중심지입니다. 한강이 흐르고, 경복궁, 남산타워 같은 유명한 관광지가 있습니다.", optionsJson: opt("부산", "인천", "서울", "대전"), answer: 2 },
      { qIndex: 17, type: "Reading", mainHeading: "[17~18] 다음 글을 읽고 내용과 같은 것을 고르십시오.", description: "한국의 도시는 지역마다 분위기가 다릅니다. 서울은 지하철이 촘촘하고 한강공원에서 자전거를 빌려 타는 사람이 많습니다.", optionsJson: opt("부산은 산이 많아 바닷가가 없습니다.", "전주에서는 대부분 사람들이 스키를 타러 겨울에만 방문합니다.", "서울에서는 한강공원에서 자전거를 빌려 탈 수 있습니다.", "세 도시는 비행기로만 갈 수 있고 버스로는 갈 수 없습니다."), answer: 2 },
      { qIndex: 18, type: "Reading", mainHeading: "[17~18] 다음 글을 읽고 내용과 같은 것을 고르십시오.", description: "한국인들은 대부분 집안에서 신발을 벗고 생활하며 바닥에 앉아서 식사를 하거나 TV를 보기도 합니다.", optionsJson: opt("좌식 문화는 한국의 전통 생활 방식입니다.", "한국인들은 집안에서 신발을 신고 생활합니다.", "한국인들은 바닥에 앉아서 식사하지 않습니다.", "젊은 사람들은 좌식 문화에 익숙하지 않습니다."), answer: 0 },
      { qIndex: 19, type: "Reading", mainHeading: "[19~20] 무엇에 대한 설명입니까?", description: "회사나 공장에서 일하는 사람입니다.", optionsJson: opt("농부", "근로자", "요리사", "학생"), answer: 1 },
      { qIndex: 20, type: "Reading", mainHeading: "[19~20] 무엇에 대한 설명입니까?", description: "바다나 강에서 물고기를 잡는 사람입니다.", optionsJson: opt("목수", "어부", "교사", "의사"), answer: 1 },

      // Listening 21-40
      { qIndex: 21, type: "Listening", mainHeading: "[21~22] 다음을 듣고 빈칸에 알맞은 것을 고르십시오.", description: "○시", optionsJson: opt("도", "모", "보", "소"), answer: 0 },
      { qIndex: 22, type: "Listening", mainHeading: "[21~22] 다음을 듣고 빈칸에 알맞은 것을 고르십시오.", description: "저는 _____에 가요.", optionsJson: opt("학교", "공원", "시장", "마트"), answer: 0 },
      { qIndex: 23, type: "Listening", mainHeading: "[23~24] 들은 것을 고르십시오.", description: "", optionsJson: PIC, answer: 0 },
      { qIndex: 24, type: "Listening", mainHeading: "[23~24] 들은 것을 고르십시오.", description: "", optionsJson: PIC, answer: 0 },
      { qIndex: 25, type: "Listening", mainHeading: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", description: "이것은 무엇입니까?", optionsJson: PIC, answer: 0 },
      { qIndex: 26, type: "Listening", mainHeading: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", description: "여기는 어디입니까?", optionsJson: PIC, answer: 0 },
      { qIndex: 27, type: "Listening", mainHeading: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", description: "이 사람은 무엇을 하고 있습니까?", optionsJson: PIC, answer: 0 },
      { qIndex: 28, type: "Listening", mainHeading: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", description: "얼마나 있습니까?", optionsJson: PIC, answer: 0 },
      { qIndex: 29, type: "Listening", mainHeading: "[25~29] 다음을 듣고 그림에 알맞은 답을 고르십시오.", description: "병원은 어디에 있습니까?", optionsJson: PIC, answer: 0 },
      { qIndex: 30, type: "Listening", mainHeading: "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", description: "", optionsJson: PIC, answer: 0 },
      { qIndex: 31, type: "Listening", mainHeading: "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", description: "", optionsJson: opt("오월 구일입니다.", "버스로 가요.", "매일 가요.", "두 시입니다."), answer: 0 },
      { qIndex: 32, type: "Listening", mainHeading: "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", description: "", optionsJson: opt("영화를 봤어요.", "김치를 먹었어요.", "아침에 해요.", "요리하고 있어요."), answer: 0 },
      { qIndex: 33, type: "Listening", mainHeading: "[30~33] 다음을 듣고 물음에 알맞은 대답을 고르십시오.", description: "", optionsJson: opt("아니요, 없어요.", "네, 없어요.", "아니요, 마시고 싶어요.", "아니요, 주스예요."), answer: 0 },
      { qIndex: 34, type: "Listening", mainHeading: "[34~35] 다음을 듣고 이어지는 말을 고르십시오.", description: "", optionsJson: opt("라면 1개 주세요.", "케이크를 먹었어요.", "5월 20일이에요.", "인터넷에서 찾았어요."), answer: 0 },
      { qIndex: 35, type: "Listening", mainHeading: "[34~35] 다음을 듣고 이어지는 말을 고르십시오.", description: "", optionsJson: opt("아니요, 닛차난 씨는 운동하고 있어요.", "아니요, 닛차난 씨는 올해 23살이에요.", "네, 저하고 같이 밥을 먹고 있어요.", "네, 친구를 만나고 있어요."), answer: 0 },
      { qIndex: 36, type: "Listening", mainHeading: "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", description: "", optionsJson: opt("20000원", "10000원", "1000원", "2000원"), answer: 0 },
      { qIndex: 37, type: "Listening", mainHeading: "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", description: "", optionsJson: opt("3월 8일", "4월 8일", "5월 8일", "6월 8일"), answer: 0 },
      { qIndex: 38, type: "Listening", mainHeading: "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", description: "남자는 지금 어디에 있습니까?", optionsJson: opt("병원", "우체국", "편의점", "학교"), answer: 0 },
      { qIndex: 39, type: "Listening", mainHeading: "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", description: "두 사람은 무엇에 대해 말하고 있습니까?", optionsJson: opt("가구", "집안일", "전자제품", "마트"), answer: 0 },
      { qIndex: 40, type: "Listening", mainHeading: "[36~40] 다음을 듣고 알맞은 것을 고르십시오.", description: "가방 안에 없는 물건은 무엇입니까?", optionsJson: opt("지갑", "열쇠", "사진", "여권"), answer: 0 }
    ];

    for (const qData of questionsData) {
      await prisma.question.create({
        data: {
          examSetId: examSet.id,
          qIndex: qData.qIndex,
          type: qData.type,
          mainHeading: qData.mainHeading,
          questionHeading: String(qData.qIndex),
          description: qData.description,
          optionsJson: qData.optionsJson,
          answer: qData.answer
        }
      });
    }
    console.log('Seeded 40 EPS-TOPIK questions for SET 1.');
  }

  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
