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

const KEYS = {
  INSTITUTES: "sigmaInstitutes",
  STUDENTS: "sigmaStudents",
  RESULTS: "sigma_results",
  QUESTIONS: "sigma_questions",
  CURRENT_USER: "sigma_current_user",
};

export function getInstitutes() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEYS.INSTITUTES) || "[]");
}

export function saveInstitutes(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.INSTITUTES, JSON.stringify(data));
}

export function getStudents() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || "[]");
}

export function saveStudents(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data));
}

export function getResults() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEYS.RESULTS) || "[]");
}

export function saveResults(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(data));
}

export function getQuestions() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEYS.QUESTIONS) || "[]");
}

export function saveQuestions(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(data));
}

export function currentUser() {
  if (typeof window === "undefined") return null;
  return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || "null");
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) {}

  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "sigma_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;";
    } catch (e) {}
    window.location.replace("/");
  }
}

export function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "institute") return "/institute";
  return "/student";
}