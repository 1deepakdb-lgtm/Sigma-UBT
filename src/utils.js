export const LOGO = "/sigma-logo.png";

export const EXAM_PACKAGES = [
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

export const SUBSCRIPTIONS = [
  { label: "1 Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 }
];

export function addMonths(dateString, months) {
  const d = new Date(dateString + "T00:00:00");
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value + "T00:00:00");
  return d.toLocaleDateString("en-GB");
}

export function instituteStatus(expireDate) {
  if (!expireDate) return "Active";
  return new Date(expireDate + "T23:59:59") >= new Date() ? "Active" : "Expired";
}

// Use consistent localStorage keys
const KEYS = {
  INSTITUTES: "sigmaInstitutes",
  STUDENTS: "sigmaStudents",
  RESULTS: "sigma_results",
  QUESTIONS: "sigma_questions",
  CURRENT_USER: "sigma_current_user",
};

export function getInstitutes() {
  return JSON.parse(localStorage.getItem(KEYS.INSTITUTES) || "[]");
}

export function saveInstitutes(data) {
  localStorage.setItem(KEYS.INSTITUTES, JSON.stringify(data));
}

export function getStudents() {
  return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
}

export function saveStudents(data) {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data));
}

export function getResults() {
  return JSON.parse(localStorage.getItem(KEYS.RESULTS) || "[]");
}

export function saveResults(data) {
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(data));
}

export function getQuestions() {
  return JSON.parse(localStorage.getItem(KEYS.QUESTIONS) || "[]");
}

export function saveQuestions(data) {
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(data));
}

export function currentUser() {
  return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || "null");
}

export function logout() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function seedDemoData() {
  if (!localStorage.getItem(KEYS.INSTITUTES)) {
    saveInstitutes([
      {
        id: crypto.randomUUID(),
        instituteName: "Sigma Demo Institute",
        name: "Sigma Demo Institute",
        username: "sigma",
        password: "1234",
        subscription: "1 Month",
        package: "1 Month",
        entryDate: today(),
        expireDate: addMonths(today(), 1),
        examPackage: "Full Set UBT",
        status: "Active"
      }
    ]);
  }
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    saveStudents([
      {
        id: crypto.randomUUID(),
        name: "Demo Student",
        username: "student",
        password: "1234",
        phone: "9800000000",
        batch: "Morning",
        status: "Active"
      }
    ]);
  }
  if (!localStorage.getItem(KEYS.RESULTS)) saveResults([]);
  if (!localStorage.getItem(KEYS.QUESTIONS)) {
    saveQuestions([
      {
        id: crypto.randomUUID(),
        type: "reading",
        question: "다음 단어의 뜻으로 맞는 것을 고르십시오.",
        image: "",
        options: ["학교", "책", "사과", "기차"],
        answer: 1
      },
      {
        id: crypto.randomUUID(),
        type: "reading",
        question: "빈칸에 들어갈 가장 알맞은 것을 고르십시오. 저는 ___에 갑니다.",
        image: "",
        options: ["학교", "사과", "책", "물"],
        answer: 0
      },
      {
        id: crypto.randomUUID(),
        type: "listening",
        question: "이것은 ______ 입니다.",
        image: "",
        audio: "",
        options: ["기차", "과자", "기자", "사과"],
        answer: 3
      }
    ]);
  }
}

export function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "institute") return "/institute";
  return "/student";
}