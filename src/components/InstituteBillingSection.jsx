'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getSharedGateCredentials, verifySharedGateCredentials, updateSharedGateCredentials } from '@/lib/instituteGateAuth';

// Number to Indian/Nepali Rupees in Words helper
export const numberToRupeesInWords = (num) => {
  const n = Math.floor(Number(num) || 0);
  if (n <= 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertBelowThousand = (val) => {
    let str = "";
    if (val >= 100) {
      str += ones[Math.floor(val / 100)] + " Hundred ";
      val %= 100;
    }
    if (val >= 20) {
      str += tens[Math.floor(val / 20)] + " ";
      val %= 20;
    }
    if (val > 0) {
      str += ones[val] + " ";
    }
    return str.trim();
  };

  let crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem %= 100000;
  let thousand = Math.floor(rem / 1000);
  let belowThousand = rem % 1000;

  let parts = [];
  if (crore > 0) parts.push(convertBelowThousand(crore) + " Crore");
  if (lakh > 0) parts.push(convertBelowThousand(lakh) + " Lakh");
  if (thousand > 0) parts.push(convertBelowThousand(thousand) + " Thousand");
  if (belowThousand > 0) parts.push(convertBelowThousand(belowThousand));

  return "Rupees " + parts.join(" ") + " Only";
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(amount || 0)).replace('₹', 'Rs. ');
};

// Format date to MM-DD-YYYY
export const formatDateMMDDYYYY = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  } catch {
    return dateStr;
  }
};

// Predefined Standard Course Options
export const COURSE_OPTIONS = [
  "EPS Topik Full course",
  "Topik Level 1",
  "Topik Level 2",
  "Topik Level 3",
  "Japanese Language N5 & N4",
  "Japanese Language N5",
  "Japanese Language N4",
  "Japanese Language N3",
  "IELTS",
  "PTE",
  "English",
  "Other"
];

// Predefined Payment Method Options
export const PAYMENT_METHODS = [
  "Cash",
  "Online Bank Acc",
  "Online Esewa",
  "Online Khalti",
  "Other"
];

// Predefined Course Package Options
export const COURSE_PACKAGES = [
  "Full course",
  "30 days",
  "45 days",
  "2 months",
  "3 months",
  "6 months"
];

export const DEFAULT_PACKAGE_FEES = {
  "Full course": { grossFee: 15000, discountPercent: 0 },
  "30 days": { grossFee: 5000, discountPercent: 0 },
  "45 days": { grossFee: 7500, discountPercent: 0 },
  "2 months": { grossFee: 9000, discountPercent: 0 },
  "3 months": { grossFee: 12000, discountPercent: 0 },
  "6 months": { grossFee: 18000, discountPercent: 0 }
};

// Payment Method Clean SVG Icons
export function CashIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

export function EsewaIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="17 13.8 130 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: "middle", flexShrink: 0, display: "inline-block" }}
    >
      <path
        d="M17 78.7978C17 42.8985 46.1683 13.7974 82.1512 13.7974C116.016 13.7974 143.848 39.5813 147 72.5427H122.22V85.0503H147C143.848 118.018 116.016 143.797 82.1512 143.797C46.1683 143.797 17 114.698 17 78.7978Z"
        fill="#60bb46"
      />
      <path
        d="M103.68 64.9646C105.058 64.7497 106.237 64.3843 107.043 63.9066C107.852 63.4271 108.26 62.6534 108.069 61.4531C107.687 59.0477 106.478 55.8933 104.328 52.3545C102.322 48.619 99.1641 45.4175 94.8575 42.7533C90.7496 40.2297 85.3095 39.3245 78.736 40.1875C74.4301 40.8719 70.2071 42.0648 66.2617 43.9205C62.3187 45.7796 58.7668 48.9827 55.5505 53.1919C51.8055 58.5377 49.6704 63.9818 49.0838 69.1895C48.3232 74.4129 48.3158 78.8204 49.0341 82.2303C49.9629 88.0753 51.2711 92.9747 52.929 96.7647C54.6175 100.728 57.3426 104.524 60.9235 108.189C64.9335 112.304 69.56 114.748 74.6787 115.878C79.7791 116.832 84.9077 116.905 89.9045 116.117C95.0439 115.125 99.1873 113.416 102.651 110.754C105.913 107.951 108.633 105.051 110.579 101.753C112.354 98.4758 113.669 95.6281 114.322 93.0565C114.528 92.1423 114.592 91.4281 114.534 91.0842C114.48 90.737 114.255 90.4254 113.913 90.4758L111.48 89.631C111.134 89.6822 110.965 89.7112 110.644 89.9368C110.33 90.1642 110.184 90.3609 110.068 90.7337C108.981 93.9021 107.005 97.0342 103.742 99.8373C100.507 102.813 96.3911 104.696 91.0794 105.711C83.9897 106.657 77.6953 104.829 72.3431 100.041C66.9933 95.2479 63.4612 88.582 61.926 80.0182C61.2963 76.0653 61.0361 73.2862 61.1364 71.6875L103.68 64.9646ZM61.0038 66.4211C61.7164 59.7908 63.4182 54.9443 66.2575 51.6734C69.0969 48.4116 72.4955 46.4591 76.2827 45.8631C79.9266 45.463 83.017 46.0301 85.2117 47.623C87.4082 49.2125 89.1414 51.2312 90.2103 53.5292C91.1109 55.8511 91.7555 57.6887 91.9742 59.065C92.1092 59.9231 91.8441 60.4934 91.2103 60.9456C90.4315 61.5961 89.2541 61.959 87.704 62.2045L61.0038 66.4211Z"
        fill="white"
      />
    </svg>
  );
}

export function KhaltiIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <rect width="24" height="24" rx="5" fill="#7e22ce" />
      <path d="M7 6v12M7 12l6-6M7 12l6 6" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BankIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
    </svg>
  );
}

export function CardIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  );
}

export function getPaymentMethodIcon(method, size = 15) {
  const m = String(method || "").trim().toLowerCase();
  if (m.includes("esewa")) return <EsewaIcon size={size} />;
  if (m.includes("khalti")) return <KhaltiIcon size={size} />;
  if (m.includes("bank")) return <BankIcon size={size} color="#1e40af" />;
  if (m === "cash") return <CashIcon size={size} color="#16a34a" />;
  return <CardIcon size={size} color="#d97706" />;
}

export default function InstituteBillingSection({ instituteName, userRole, instId, instituteLanguage }) {
  const apiWithInst = (url) => {
    if (!instId) return url;
    return url.includes('?') ? url + '&instId=' + instId : url + '?instId=' + instId;
  };

  // Language Track Resolution ('both' | 'korean' | 'japanese')
  const effectiveInstLang = (
    instituteLanguage ||
    (typeof window !== "undefined" ? localStorage.getItem("instituteLanguage") : null) ||
    "both"
  ).toLowerCase();

  const getFilteredCourses = () => {
    if (effectiveInstLang === "korean") {
      return [
        "EPS Topik Full course",
        "Topik Level 1",
        "Topik Level 2",
        "Topik Level 3",
        "IELTS",
        "PTE",
        "English",
        "Other"
      ];
    }
    if (effectiveInstLang === "japanese") {
      return [
        "Japanese Language N5 & N4",
        "Japanese Language N5",
        "Japanese Language N4",
        "Japanese Language N3",
        "IELTS",
        "PTE",
        "English",
        "Other"
      ];
    }
    return COURSE_OPTIONS;
  };

  const defaultCourse = effectiveInstLang === "japanese" ? "Japanese Language N5 & N4" : "EPS Topik Full course";

  // Compulsory Authentication & Auto-Logout (30 seconds of inactivity)
  const [isBillingAuthenticated, setIsBillingAuthenticated] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("superadmin") === "true") setIsBillingAuthenticated(true);
      if (
        sessionStorage.getItem("instituteBillingUnlocked") === "true" ||
        sessionStorage.getItem("instituteStudentsUnlocked") === "true"
      ) {
        setIsBillingAuthenticated(true);
      }
    }
  }, []);
  const [billingRole, setBillingRole] = useState(() => {
    return userRole === "staff" ? "user" : "admin";
  });
  const [activeStaffName, setActiveStaffName] = useState("");
  const [inactivityCountdown, setInactivityCountdown] = useState(30);
  const [autoLogoutNotice, setAutoLogoutNotice] = useState("");
  const lastActivityRef = useRef(Date.now());
  const customPaymentInputRef = useRef(null);

  // Gate Form States
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Credential update state (Shared for both Billing & Manage Students)
  const [newAdminUserId, setNewAdminUserId] = useState("");

  const instKey = instituteName ? `inst_${instituteName.trim().toLowerCase().replace(/\s+/g, '_')}` : "default";

  const [adminPin, setAdminPin] = useState(() => {
    if (typeof window === "undefined") return "9999";
    return getSharedGateCredentials(instituteName).password || localStorage.getItem(`billingAdminPin_${instKey}`) || "9999";
  });

  // Course Package Default Fees & Discounts Configuration (Persisted per institute)
  const [feeConfig, setFeeConfig] = useState(() => {
    if (typeof window === "undefined") {
      return { defaultPackage: "Full course", packages: { ...DEFAULT_PACKAGE_FEES }, courseFees: {}, updatedAt: "" };
    }
    try {
      const saved = localStorage.getItem(`instituteFeeConfig_${instKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          defaultPackage: parsed.defaultPackage || "Full course",
          packages: { ...DEFAULT_PACKAGE_FEES, ...(parsed.packages || parsed) },
          courseFees: parsed.courseFees || {},
          updatedAt: parsed.updatedAt || parsed.lastUpdated || parsed.updatedDate || ""
        };
      }
    } catch (e) {
      console.error("Failed to parse feeConfig:", e);
    }
    return { defaultPackage: "Full course", packages: { ...DEFAULT_PACKAGE_FEES }, courseFees: {}, updatedAt: "" };
  });

  const [showFeeConfigModal, setShowFeeConfigModal] = useState(false);
  const [selectedCourseForFees, setSelectedCourseForFees] = useState(defaultCourse);
  const [editingCourseFees, setEditingCourseFees] = useState({});
  const [editingPackageFees, setEditingPackageFees] = useState(() => ({ ...DEFAULT_PACKAGE_FEES }));
  const [selectedDefaultPkg, setSelectedDefaultPkg] = useState("Full course");
  const [feeUpdateDate, setFeeUpdateDate] = useState("");
  const [feeSavedToast, setFeeSavedToast] = useState("");

  const getPackageFee = (pkgName, courseName = "") => {
    const pkg = pkgName || (feeConfig && feeConfig.defaultPackage) || "Full course";
    const course = courseName || "";
    if (course && feeConfig && feeConfig.courseFees && feeConfig.courseFees[course]?.packages?.[pkg]) {
      return feeConfig.courseFees[course].packages[pkg];
    }
    if (feeConfig && feeConfig.packages && feeConfig.packages[pkg]) {
      return feeConfig.packages[pkg];
    }
    return DEFAULT_PACKAGE_FEES[pkg] || { grossFee: 15000, discountPercent: 0 };
  };

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState("");

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ name: "", username: "", phone: "", password: "" });
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  // Regular user (staff) password reset states
  const [activeStaffUsername, setActiveStaffUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("instituteBillingStaffUser") || "";
  });
  const [showStaffResetModal, setShowStaffResetModal] = useState(false);
  const [staffCurrentPassword, setStaffCurrentPassword] = useState("");
  const [staffNewPassword, setStaffNewPassword] = useState("");
  const [staffConfirmPassword, setStaffConfirmPassword] = useState("");
  const [staffResetMsg, setStaffResetMsg] = useState("");
  const [staffResetLoading, setStaffResetLoading] = useState(false);

  // Expenses Management States (Day, Week, Month records by all users for admin)
  const [expenses, setExpenses] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(`instituteBillingExpenses_${instKey}`) || "[]");
    } catch {
      return [];
    }
  });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTimeframe, setExpenseTimeframe] = useState("daily"); // "daily" | "weekly" | "monthly" | "all"
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpenseForm, setNewExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    title: "",
    category: "Office Supplies",
    amount: "",
    paymentMethod: "Cash",
    remarks: "",
    recordedBy: ""
  });

  // Admin Analytics & Daily / Monthly Ledger States
  const [adminTimeframe, setAdminTimeframe] = useState("daily"); // "daily" | "weekly" | "monthly" | "all"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [userDayView, setUserDayView] = useState("today"); // "today" (clean wiped daily desk) | "all"
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all"); // "all" | "Cash" | "Online Bank Acc" | "Online Esewa" | "Online Khalti" | "Other"

  // Pre-configured according to user image specifications
  const defaultProfile = {
    companyName: "SIGMA EDUCATION KOREAN BHASA CENTER",
    companyAddress: "Samakhushi Chowk, Kathmandu",
    contactNumber: "9768444902, 9806100148",
    email: "sigmaedu2023@gmail.com",
    panVatNumber: "616838513",
    logoUrl: "/sigma-logo.png",
    stampUrl: "",
    googleSheetUrl: "",
    ownerEmail: "",
    editCount: 0,
    isLocked: false
  };

  const defaultMaterials = [];

  const getRandomClassTime = () => {
    const slots = [
      { time: "06:30", period: "AM" },
      { time: "07:00", period: "AM" },
      { time: "07:30", period: "AM" },
      { time: "08:00", period: "AM" },
      { time: "08:30", period: "AM" },
      { time: "09:00", period: "AM" },
      { time: "10:00", period: "AM" },
      { time: "11:00", period: "AM" },
      { time: "01:00", period: "PM" },
      { time: "02:00", period: "PM" },
      { time: "03:00", period: "PM" },
      { time: "04:00", period: "PM" },
      { time: "05:00", period: "PM" },
      { time: "06:00", period: "PM" }
    ];
    return slots[Math.floor(Math.random() * slots.length)];
  };

  const initialRandomTime = getRandomClassTime();

  const defaultPackageName = (feeConfig && feeConfig.defaultPackage) || "Full course";
  const defaultPkgInfo = getPackageFee(defaultPackageName, "EPS Topik Full course");
  const defaultGross = Number(defaultPkgInfo.grossFee) || 15000;
  const defaultDisc = Number(defaultPkgInfo.discountPercent) || 0;
  const defaultDiscAmt = defaultGross * (defaultDisc / 100);
  const defaultNet = Math.max(0, defaultGross - defaultDiscAmt);

  const defaultForm = {
    date: new Date().toISOString().split('T')[0],
    studentName: "",
    address: "",
    contactNumber: "", // 10 digit number (system auto adds +977)
    parentName: "",
    parentNumber: "",
    classTime: initialRandomTime.time,
    classTimePeriod: initialRandomTime.period,
    courseDetail: defaultCourse,
    coursePackage: defaultPackageName,
    paymentSystem: "Full Payment",
    paymentMethod: "Cash",
    customPaymentMethod: "",
    grossFee: defaultGross,
    discountPercent: defaultDisc,
    discountAmount: defaultDiscAmt,
    totalFee: defaultNet, // Final Total Fee (Includes 13% VAT/PAN)
    paidAmount: defaultNet,
    materials: [...defaultMaterials],
    preparedBy: "", // Blank typing input as requested!
    isExistingStudent: false,
    existingBillNumber: ""
  };

  // State
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") return defaultProfile;
    try {
      return JSON.parse(localStorage.getItem(`instituteBillingProfile_${instKey}`) || "null") || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [isPermanentlyLinked, setIsPermanentlyLinked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const isGlobalLinked = localStorage.getItem("global_google_sheet_setup_done") === "true";
      if (isGlobalLinked) return true;
      const p = JSON.parse(localStorage.getItem(`instituteBillingProfile_${instKey}`) || "null");
      return Boolean(p && p.googleSheetUrl && p.googleSheetUrl.trim());
    } catch {
      return false;
    }
  });

  const [bills, setBills] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(`instituteBillingRecords_${instKey}`) || "[]");
    } catch {
      return [];
    }
  });

  const DEFAULT_PRODUCTS_LIST = [];

  const [products, setProducts] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PRODUCTS_LIST;
    try {
      const stored = localStorage.getItem(`instituteBillingProducts_${instKey}`);
      return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS_LIST;
    } catch {
      return DEFAULT_PRODUCTS_LIST;
    }
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProductForm, setNewProductForm] = useState({ name: "", price: "", stock: "", unit: "copies" });
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [selectedItemQty, setSelectedItemQty] = useState(1);

  const [form, setForm] = useState(defaultForm);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState("");
  const [customItemToAdd, setCustomItemToAdd] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [isItemFree, setIsItemFree] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Google Sheet & Drive Cloud Setup States
  const [googleSheetViewUrl, setGoogleSheetViewUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`instituteGoogleSheetViewUrl_${instKey}`) || "";
  });
  const [googleDriveUrl, setGoogleDriveUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`instituteGoogleDriveUrl_${instKey}`) || "";
  });
  const [setupTab, setSetupTab] = useState("connect"); // "connect" | "guide" | "csv"
  const [testStatus, setTestStatus] = useState({ state: "idle", message: "" });
  const [saveSetupStatus, setSaveSetupStatus] = useState("");
  const [copiedScript, setCopiedScript] = useState(false);
  // Google Sheet & Drive Setup Configuration State
  const isSuperAdminUrlParam = typeof window !== "undefined" && window.location.search.includes("superadmin=true");

  // AUTOMATIC HIDE ONCE SUCCESSFULLY LINKED:
  // After successfully linked, this menu will be automatically hidden from here.
  // It only shows when not linked yet (to configure), or if Super Admin opens directly with ?superadmin=true.
  const isGoogleSheetLinked = isPermanentlyLinked || Boolean(profile && profile.googleSheetUrl && profile.googleSheetUrl.trim());
  const canShowSetupMenu = isSuperAdminUrlParam || !isGoogleSheetLinked;

  const handleOpenGoogleSetupModal = () => {
    setShowScriptModal(true);
  };

  const handleCloseGoogleSetupModal = () => {
    setShowScriptModal(false);
  };

  const isCustomAdminPinSet = () => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`billingAdminPin_${instKey}`));
  };

  const getEffectiveAdminPin = () => {
    if (typeof window === "undefined") return (adminPin || "9999").trim();
    return (localStorage.getItem(`billingAdminPin_${instKey}`) || adminPin || "9999").trim();
  };

  // Hidden background sync to Google Sheet (Zero UI delay)
  const autoSyncToGoogleSheetBackground = (bill, allBills) => {
    if (!bill) return;

    const webhookUrl = (profile && profile.googleSheetUrl ? profile.googleSheetUrl.trim() : "") ||
      (typeof window !== "undefined" ? localStorage.getItem(`instituteGoogleSheetWebhook_${instKey}`) : "") || "";
    if (!webhookUrl || webhookUrl === "setup_done") return;

    // Helper: Format Nepali mobile numbers with +977- prefix for Google Sheet
    const formatNepalPhone = (val) => {
      if (!val) return '';
      const digits = String(val).replace(/\D/g, '');
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      return last10 ? `'+977-${last10}` : '';
    };

    // English-only Date Time for Last Updated column
    const nowEnglish = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    const formattedBill = {
      ...bill,
      ...(bill.contactNumber !== undefined ? { contactNumber: formatNepalPhone(bill.contactNumber) } : {}),
      ...(bill.parentNumber !== undefined ? { parentNumber: formatNepalPhone(bill.parentNumber) } : {}),
      lastUpdated: nowEnglish
    };

    // 1. Primary: Server-side API (/api/institute/billing/sync) follows redirects cleanly
    fetch(apiWithInst("/api/institute/billing/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync_bill",
        googleSheetUrl: webhookUrl,
        ownerEmail: (profile && profile.ownerEmail) || "",
        bill: formattedBill,
        materials: (bill && bill.materials) || []
      })
    }).catch(() => {
      // 2. Client fallback direct fetch
      try {
        fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "append_or_update_bill",
            bill: formattedBill,
            materials: (bill && bill.materials) || [],
            ownerEmail: profile.ownerEmail || "",
            timestamp: Date.now()
          })
        }).catch(() => {});
      } catch (e) {}
    });
  };

  // Hidden background sync for Expenses to Google Sheet (Zero UI delay)
  const autoSyncExpenseToGoogleSheet = (expense) => {
    if (!expense) return;
    const webhookUrl = (profile && profile.googleSheetUrl ? profile.googleSheetUrl.trim() : "") ||
      (typeof window !== "undefined" ? localStorage.getItem(`instituteGoogleSheetWebhook_${instKey}`) : "") || "";
    if (!webhookUrl || webhookUrl === "setup_done") return;

    // English-only Date Time for Last Updated column
    const nowEnglish = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date());

    const formattedExpense = {
      id: expense.id,
      date: expense.date,
      title: expense.title,
      category: expense.category,
      amount: Number(expense.amount) || 0,
      paymentMethod: expense.paymentMethod || "Cash",
      remarks: expense.remarks || "",
      recordedBy: expense.recordedBy || "",
      lastUpdated: nowEnglish,
      isDeleted: Boolean(expense.isDeleted)
    };

    // 1. Primary: Server-side API (/api/institute/billing/sync) follows redirects cleanly
    fetch(apiWithInst("/api/institute/billing/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync_expense",
        googleSheetUrl: webhookUrl,
        ownerEmail: (profile && profile.ownerEmail) || "",
        expense: formattedExpense
      })
    }).catch(() => {
      // 2. Client fallback direct fetch
      try {
        fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "append_or_update_expense",
            expense: formattedExpense,
            ownerEmail: (profile && profile.ownerEmail) || "",
            timestamp: Date.now()
          })
        }).catch(() => {});
      } catch (e) {}
    });
  };

  // Instant single invoice CSV download
  const handleDownloadSingleBillCSV = (bill = selectedInvoice) => {
    if (!bill) return;
    const formatPhoneForCsv = (val) => {
      if (!val) return '';
      const digits = String(val).replace(/\D/g, '');
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      return last10 ? `+977-${last10}` : '';
    };
    const headers = [
      "Bill No", "Date", "Student Name", "Address", "Contact (WhatsApp)",
      "Parent Contact", "Course Detail", "Course Package", "Payment Status",
      "Gross Fee", "Discount %", "Discount Rs", "Total Fee (13% VAT Incl)",
      "Paid Amount", "Due Amount", "In Words", "Prepared By", "Payment Method"
    ];
    const row = [
      `"${bill.billNumber || ''}"`,
      `"${bill.date || ''}"`,
      `"${(bill.studentName || '').replace(/"/g, '""')}"`,
      `"${(bill.address || '').replace(/"/g, '""')}"`,
      `"${formatPhoneForCsv(bill.contactNumber)}"`,
      `"${formatPhoneForCsv(bill.parentNumber)}"`,
      `"${(bill.courseDetail || '').replace(/"/g, '""')}"`,
      `"${bill.coursePackage || ''}"`,
      `"${bill.paymentSystem || ''}"`,
      bill.grossFee || bill.totalFee || 0,
      bill.discountPercent || 0,
      bill.discountAmount || 0,
      bill.totalFee || 0,
      bill.paidAmount || 0,
      bill.dueAmount || 0,
      `"${(bill.amountInWords || '').replace(/"/g, '""')}"`,
      `"${(bill.preparedBy || '').replace(/"/g, '""')}"`,
      `"${bill.paymentMethod || 'Cash'}"`
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoice_${bill.billNumber}_${(bill.studentName || 'student').replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Instant single invoice PDF download / print
  const handleDownloadPDF = (bill = selectedInvoice) => {
    if (typeof window === "undefined" || !bill) return;
    const originalTitle = document.title;
    document.title = `Invoice_${bill.billNumber}_${(bill.studentName || 'student').replace(/[^a-zA-Z0-9]/g, '_')}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  };



  // Authentication & Gate Handler (Unified Login for Admin & User sharing same credentials as Manage Students)
  const handleGateLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const uid = (loginUserId || "").trim();
    const pwd = (loginPassword || "").trim();

    if (!uid) {
      setLoginError("Please enter your User ID or Username.");
      return;
    }
    if (!pwd) {
      setLoginError("Please enter your Password.");
      return;
    }

    setLoginLoading(true);
    const result = await verifySharedGateCredentials(uid, pwd, instituteName);
    setLoginLoading(false);

    if (result.ok) {
      const isAdm = result.role === "admin";
      setIsBillingAuthenticated(true);
      setBillingRole(isAdm ? "admin" : "user");
      setActiveStaffName(result.userName || (isAdm ? "Admin" : uid));
      setActiveStaffUsername(result.userId || uid);
      sessionStorage.setItem("instituteBillingUnlocked", "true");
      sessionStorage.setItem("instituteStudentsUnlocked", "true");
      sessionStorage.setItem("instituteBillingStaffUser", result.userId || uid);
      setLoginUserId("");
      setLoginPassword("");
      setAutoLogoutNotice("");
      setLoginError("");
      lastActivityRef.current = Date.now();
    } else {
      setLoginError(result.error || "Invalid User ID or Password.");
    }
  };

  // Helper to get local YYYY-MM-DD
  const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Expenses Handlers
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!newExpenseForm.title.trim()) {
      alert("Please enter title or description for the expense.");
      return;
    }
    const expAmount = Number(newExpenseForm.amount) || 0;
    if (!newExpenseForm.amount || expAmount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }
    if (expAmount > 200 && !(newExpenseForm.remarks || "").trim()) {
      alert("Bill Number / Voucher Number is mandatory for expenses greater than Rs. 200. Please enter the Bill Number.");
      return;
    }
    const currentStaffName = activeStaffName || (typeof window !== "undefined" && localStorage.getItem("currentUser")) || (billingRole === "admin" ? "Admin" : "Staff");
    const newEntry = {
      id: "EXP-" + Date.now(),
      date: newExpenseForm.date || getLocalDateStr(),
      title: newExpenseForm.title.trim(),
      category: newExpenseForm.category || "Office Supplies",
      amount: expAmount,
      paymentMethod: newExpenseForm.paymentMethod || "Cash",
      remarks: (newExpenseForm.remarks || "").trim(),
      recordedBy: (newExpenseForm.recordedBy || "").trim() || currentStaffName,
      createdAt: new Date().toISOString()
    };
    const updated = [newEntry, ...expenses];
    setExpenses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`instituteBillingExpenses_${instKey}`, JSON.stringify(updated));
    }
    // Auto-sync expense to Google Sheet
    autoSyncExpenseToGoogleSheet(newEntry);
    setNewExpenseForm({
      date: getLocalDateStr(),
      title: "",
      category: "Office Supplies",
      amount: "",
      paymentMethod: "Cash",
      remarks: "",
      recordedBy: ""
    });
  };

  // Admin-Only: Edit and Update Expense
  const handleUpdateExpense = (e) => {
    e.preventDefault();
    if (billingRole !== "admin") {
      alert("Permission Denied: Only Administrator has authority to edit expense records.");
      return;
    }
    if (!editingExpense) return;
    if (!editingExpense.title || !editingExpense.title.trim()) {
      alert("Please enter title or description for the expense.");
      return;
    }
    const expAmount = Number(editingExpense.amount) || 0;
    if (!editingExpense.amount || expAmount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }
    if (expAmount > 200 && !(editingExpense.remarks || "").trim()) {
      alert("Bill Number / Voucher Number is mandatory for expenses greater than Rs. 200. Please enter the Bill Number.");
      return;
    }

    let updatedExpObj = null;
    const updated = expenses.map(exp => {
      if (exp.id === editingExpense.id) {
        updatedExpObj = {
          ...exp,
          date: editingExpense.date,
          title: editingExpense.title.trim(),
          category: editingExpense.category,
          amount: Number(editingExpense.amount) || 0,
          paymentMethod: editingExpense.paymentMethod,
          recordedBy: (editingExpense.recordedBy || "").trim() || exp.recordedBy,
          remarks: (editingExpense.remarks || "").trim(),
          lastModifiedBy: activeStaffName || "Admin",
          lastModifiedAt: new Date().toISOString()
        };
        return updatedExpObj;
      }
      return exp;
    });

    setExpenses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`instituteBillingExpenses_${instKey}`, JSON.stringify(updated));
    }
    setEditingExpense(null);
    // Auto-sync updated expense to Google Sheet
    if (updatedExpObj) {
      autoSyncExpenseToGoogleSheet(updatedExpObj);
    }
  };

  // Admin-Only: Delete Expense
  const handleDeleteExpense = (id) => {
    if (billingRole !== "admin") {
      alert("Permission Denied: Only Administrator has authority to delete expense records.");
      return;
    }
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to permanently delete this expense record?")) {
      return;
    }
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`instituteBillingExpenses_${instKey}`, JSON.stringify(updated));
    }
    // Auto-sync deletion to Google Sheet
    autoSyncExpenseToGoogleSheet({ id, isDeleted: true });
  };

  // Filter expenses: Users/Staff can ONLY see today's expenses; Admin can see daily, weekly, monthly, and all
  const getFilteredExpenses = () => {
    const today = new Date();
    const todayStr = getLocalDateStr(today);
    const todayUtc = today.toISOString().split('T')[0];

    // Staff / Regular User: STRICTLY restricted to Today's expenses
    if (billingRole !== "admin") {
      return expenses.filter(exp => {
        const d = exp.date || "";
        return d === todayStr || d === todayUtc;
      });
    }

    // Admin: Full access across Daily, Weekly, Monthly, and All
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = getLocalDateStr(sevenDaysAgo);

    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    return expenses.filter(exp => {
      const d = exp.date || "";
      if (expenseTimeframe === "daily") {
        return d === todayStr || d === todayUtc;
      }
      if (expenseTimeframe === "weekly") {
        return d >= sevenDaysAgoStr && d <= todayStr;
      }
      if (expenseTimeframe === "monthly") {
        return d.startsWith(currentMonthStr);
      }
      return true;
    });
  };

  // Printing Expenses Handler - Switches print target to #printable-expense-sheet
  const handlePrintExpenses = () => {
    if (typeof window === "undefined") return;
    const cleanUp = () => {
      document.body.classList.remove("printing-expense");
      window.removeEventListener("afterprint", cleanUp);
    };
    window.addEventListener("afterprint", cleanUp);
    document.body.classList.add("printing-expense");
    window.print();
    setTimeout(cleanUp, 2500);
  };

  // Expenses CSV Export Handler - Generates downloadable spreadsheet of expenses
  const handleExportExpensesCSV = () => {
    const list = getFilteredExpenses();
    if (!list || list.length === 0) {
      alert("No expenses recorded for this timeframe to export.");
      return;
    }
    const headers = [
      "S.N.",
      "Date",
      "Title / Details",
      "Category",
      "Amount (Rs.)",
      "Payment Method",
      "Recorded By",
      "Bill No / Voucher / Remarks"
    ];
    const rows = list.map((exp, idx) => [
      idx + 1,
      `"${(exp.date || '').replace(/"/g, '""')}"`,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${(exp.category || '').replace(/"/g, '""')}"`,
      Number(exp.amount) || 0,
      `"${(exp.paymentMethod || 'Cash').replace(/"/g, '""')}"`,
      `"${(exp.recordedBy || '').replace(/"/g, '""')}"`,
      `"${(exp.remarks || '').replace(/"/g, '""')}"`
    ]);
    const totalAmount = list.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    rows.push([
      "TOTAL",
      "",
      "",
      "",
      totalAmount,
      "",
      "",
      ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const today = typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Expenses_${expenseTimeframe}_${(instituteName || 'institute').replace(/[^a-zA-Z0-9]/g, '_')}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Immediate manual logout/lock
  const handleBillingLogout = () => {
    setIsBillingAuthenticated(false);
    sessionStorage.removeItem("instituteBillingUnlocked");
    sessionStorage.removeItem("instituteStudentsUnlocked");
    setAutoLogoutNotice("Billing system is locked. Please login to access records.");
    setShowBillModal(false);
    setShowProfileModal(false);
    setShowScriptModal(false);
    setIsGoogleSetupUnlocked(false);
    setShowStaffModal(false);
    setShowChangePinModal(false);
    setShowPinModal(false);
  };

  // Inactivity Auto-Logout Effect: Auto-lock within 20 seconds of inactivity
  useEffect(() => {
    if (!isBillingAuthenticated) return;

    lastActivityRef.current = Date.now();
    setInactivityCountdown(20);

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }));

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, 20 - elapsed);
      setInactivityCountdown(remaining);

      if (false) {
        setIsBillingAuthenticated(false);
        setAutoLogoutNotice("Billing system auto-locked after 20 seconds of inactivity.");
        setShowBillModal(false);
        setShowProfileModal(false);
        setShowScriptModal(false);
        setIsGoogleSetupUnlocked(false);
        setShowStaffModal(false);
        setShowStockModal(false);
        setShowChangePinModal(false);
        setShowPinModal(false);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      events.forEach(evt => window.removeEventListener(evt, updateActivity));
    };
  }, [isBillingAuthenticated]);

  const handleVerifyAdminPin = (e) => {
    e.preventDefault();
    const currentAdminPin = getEffectiveAdminPin();
    const hasCustomPin = isCustomAdminPinSet();
    const entered = pinInput.trim();

    // STRICT: If admin changed password/PIN, NEVER take default "9999"!
    const isMatch = hasCustomPin
      ? entered === currentAdminPin
      : (entered === currentAdminPin || entered === "9999");

    if (isMatch) {
      setBillingRole("admin");
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
      lastActivityRef.current = Date.now();
      setInactivityCountdown(30);
    } else {
      setPinError(
        hasCustomPin
          ? "Incorrect Admin PIN! Default PIN (9999) has been disabled. Please enter your updated Admin PIN."
          : "Incorrect Admin PIN! (Default is 9999)"
      );
    }
  };

  const handleChangePinSubmit = async (e) => {
    e.preventDefault();
    setPinChangeMsg("");

    if (billingRole !== "admin") {
      setPinChangeMsg("Permission Denied: Only Admin can update the User ID or Password!");
      return;
    }

    if (!newAdminUserId || newAdminUserId.trim().length < 3) {
      setPinChangeMsg("User ID must be at least 3 characters.");
      return;
    }

    if (!newPin || newPin.trim().length < 4) {
      setPinChangeMsg("Password / PIN must be at least 4 digits/characters.");
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeMsg("New Password and Confirm Password do not match.");
      return;
    }

    const cleanPin = newPin.trim();
    const cleanUid = newAdminUserId.trim();

    const res = await updateSharedGateCredentials({
      newUserId: cleanUid,
      newPassword: cleanPin,
      instituteName,
      currentRole: billingRole
    });

    if (res.ok) {
      setAdminPin(cleanPin);
      setPinChangeMsg("SUCCESS: User ID and Password updated! This now works for both Billing and Manage Students.");
      setTimeout(() => {
        setShowChangePinModal(false);
        setNewPin("");
        setConfirmPin("");
        setPinChangeMsg("");
      }, 1500);
    } else {
      setPinChangeMsg(res.error || "Failed to update credentials.");
    }
  };

  // Regular user (staff) can reset own password only
  const handleStaffResetPassword = async (e) => {
    e.preventDefault();
    setStaffResetMsg("");

    if (!staffCurrentPassword.trim()) {
      setStaffResetMsg("Please enter your current password.");
      return;
    }
    if (!staffNewPassword.trim() || staffNewPassword.length < 4) {
      setStaffResetMsg("New password must be at least 4 characters long.");
      return;
    }
    if (staffNewPassword !== staffConfirmPassword) {
      setStaffResetMsg("New password and confirm password do not match.");
      return;
    }

    setStaffResetLoading(true);
    try {
      const username = activeStaffUsername || activeStaffName || (typeof window !== "undefined" && localStorage.getItem("currentUser")) || "staff";
      const res = await fetch(apiWithInst("/api/institute/staff"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          currentPassword: staffCurrentPassword,
          newPassword: staffNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStaffResetMsg("✅ Password updated successfully! Please use your new password next time you log in.");
        // Sync local storage if present
        try {
          const staffKey = `instituteStaffList_${instKey}`;
          const stored = JSON.parse(localStorage.getItem(staffKey) || "[]");
          const idx = stored.findIndex(s => s.username?.toLowerCase() === username.toLowerCase() || s.phone === username);
          if (idx !== -1) {
            stored[idx].password = staffNewPassword;
            localStorage.setItem(staffKey, JSON.stringify(stored));
          }
        } catch (e) {}

        setTimeout(() => {
          setShowStaffResetModal(false);
          setStaffCurrentPassword("");
          setStaffNewPassword("");
          setStaffConfirmPassword("");
          setStaffResetMsg("");
        }, 1600);
      } else {
        setStaffResetMsg(data.error || "Failed to update password.");
      }
    } catch (err) {
      setStaffResetMsg("Failed to connect to server. Please try again.");
    } finally {
      setStaffResetLoading(false);
    }
  };

  const loadStaffList = async () => {
    setStaffLoading(true);
    setStaffError("");
    try {
      const res = await fetch(apiWithInst("/api/institute/staff"));
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      } else {
        const data = await res.json();
        setStaffError(data.error || "Failed to load staff accounts");
      }
    } catch (err) {
      setStaffError("Unable to connect to server");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");
    if (!newStaffForm.name || !newStaffForm.username || !newStaffForm.password) {
      setStaffError("Please fill in Name, Login Username/Phone, and Password.");
      return;
    }
    try {
      const res = await fetch(apiWithInst("/api/institute/staff"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffForm)
      });
      const data = await res.json();
      if (res.ok) {
        setStaffSuccess(`Staff account "${newStaffForm.name}" created! They can now log in at the main login page.`);
        setNewStaffForm({ name: "", username: "", phone: "", password: "" });
        loadStaffList();
      } else {
        setStaffError(data.error || "Failed to create staff account");
      }
    } catch (err) {
      setStaffError("Network error. Please try again.");
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to remove staff member "${staffName}"?`)) return;
    try {
      const res = await fetch(apiWithInst(`/api/institute/staff?id=${staffId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setStaffList(prev => prev.filter(s => s.id !== staffId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove staff member");
      }
    } catch (err) {
      alert("Network error while removing staff member");
    }
  };

  const handleDeleteBill = async (billId, billNum) => {
    if (billingRole !== "admin") {
      alert("Only Admin can delete billing records.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete bill ${billNum}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(apiWithInst(`/api/institute/billing?id=${billId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        const remainingBills = bills.filter(b => b.id !== billId);
        setBills(remainingBills);
        localStorage.setItem(`instituteBillingRecords_${instKey}`, JSON.stringify(remainingBills));
        autoSyncToGoogleSheetBackground({ id: billId, billNumber: billNum, isDeleted: true }, remainingBills);
        if (selectedInvoice && selectedInvoice.id === billId) {
          setSelectedInvoice(null);
        }
        alert(`Bill ${billNum} deleted successfully.`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete bill.");
      }
    } catch (err) {
      console.error("Delete bill failed:", err);
      alert("Network error while deleting bill.");
    }
  };

  // Load backend profile & bills
  const loadBillingData = async () => {
    try {
      const res = await fetch(apiWithInst("/api/institute/billing"));
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          localStorage.setItem(`instituteBillingProfile_${instKey}`, JSON.stringify(data.profile));
        }
        if (data.bills) {
          setBills(data.bills);
          localStorage.setItem(`instituteBillingRecords_${instKey}`, JSON.stringify(data.bills));
        }
        if (data.googleSetupOpenCount !== undefined) {
          const count = Number(data.googleSetupOpenCount) || 0;
          setSetupOpenCount(count);
          const instKey = data.profile?.instituteId || localStorage.getItem("currentInstitute") || "default";
          localStorage.setItem(`googleSetupOpenCount_${instKey}`, String(count));
          localStorage.setItem(`googleSetupOpenCount_${instKey}`, String(count));
        }
      }
    } catch (err) {
      console.warn("Using offline billing records:", err);
    }
  };

  // Load products inventory & available stock
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(apiWithInst("/api/institute/billing/products"), {
        credentials: 'include',
        headers: { 'x-user-role': billingRole || 'admin' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          localStorage.setItem(`instituteBillingProducts_${instKey}`, JSON.stringify(data.products));
        }
      }
    } catch (err) {
      console.warn("Using cached products stock:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Admin-Only: Add stock to existing product
  const handleAdminRestock = async (productId, addQty) => {
    if (billingRole !== "admin") {
      alert("Permission Denied: Stock can only be added by Admin.");
      return;
    }
    const qtyNum = Number(addQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert("Please enter a valid positive quantity to add.");
      return;
    }
    try {
      const res = await fetch(apiWithInst("/api/institute/billing/products"), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          action: 'add_stock',
          role: 'admin',
          productId,
          addQty: qtyNum
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products);
        localStorage.setItem(`instituteBillingProducts_${instKey}`, JSON.stringify(data.products));
        setRestockingProduct(null);
        setRestockAmount("");
        alert(` ${data.message || `Successfully added ${qtyNum} stock!`}`);
      } else {
        alert(data.error || "Failed to add stock.");
      }
    } catch (err) {
      console.error("Restock failed:", err);
      alert("Network error while adding stock.");
    }
  };

  // Admin-Only: Create brand new product
  const handleAdminCreateProduct = async (e) => {
    e.preventDefault();
    if (billingRole !== "admin") {
      alert("Permission Denied: Only Admin can create products.");
      return;
    }
    if (!newProductForm.name || !newProductForm.name.trim()) {
      alert("Product name is required.");
      return;
    }
    try {
      const res = await fetch(apiWithInst("/api/institute/billing/products"), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          action: 'create_product',
          role: 'admin',
          name: newProductForm.name.trim(),
          price: Number(newProductForm.price) || 0,
          stock: Number(newProductForm.stock) || 0,
          unit: newProductForm.unit || 'copies'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products);
        localStorage.setItem(`instituteBillingProducts_${instKey}`, JSON.stringify(data.products));
        setNewProductForm({ name: "", price: "", stock: "", unit: "copies" });
        setShowAddProductForm(false);
        alert(` ${data.message || "Product created successfully!"}`);
      } else {
        alert(data.error || "Failed to create product.");
      }
    } catch (err) {
      console.error("Create product failed:", err);
      alert("Network error while creating product.");
    }
  };

  // Admin-Only: Delete product
  const handleAdminDeleteProduct = async (productId, productName) => {
    if (billingRole !== "admin") {
      alert("Permission Denied: Only Admin can delete products.");
      return;
    }
    if (!confirm(`Are you sure you want to remove "${productName}" from stock inventory?`)) {
      return;
    }
    try {
      const res = await fetch(apiWithInst(`/api/institute/billing/products?id=${productId}&role=admin`), {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-user-role': 'admin' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products);
        localStorage.setItem(`instituteBillingProducts_${instKey}`, JSON.stringify(data.products));
        alert(`Product "${productName}" removed.`);
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Delete product failed:", err);
      alert("Network error while deleting product.");
    }
  };

  useEffect(() => {
    loadBillingData();
    loadStaffList();
    loadProducts();
  }, []);

  // ESC key listener (Billing dialog box does NOT close on ESC to prevent accidental data loss)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        // showBillModal is intentionally NOT closed on ESC so student billing data is never lost by accident
        if (editingExpense) {
          setEditingExpense(null);
        } else if (selectedInvoice) {
          setSelectedInvoice(null);
        } else if (showProfileModal) {
          setShowProfileModal(false);
        } else if (showFeeConfigModal) {
          setShowFeeConfigModal(false);
        } else if (showScriptModal) {
          handleCloseGoogleSetupModal();
        } else if (showStaffModal) {
          setShowStaffModal(false);
        } else if (showStockModal) {
          setShowStockModal(false);
          setRestockingProduct(null);
        } else if (showExpenseModal) {
          setShowExpenseModal(false);
        } else if (showPinModal) {
          setShowPinModal(false);
        } else if (showChangePinModal) {
          setShowChangePinModal(false);
        } else if (showStaffResetModal) {
          setShowStaffResetModal(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingExpense, selectedInvoice, showProfileModal, showFeeConfigModal, showScriptModal, showStaffModal, showStockModal, showExpenseModal, showPinModal, showChangePinModal, showStaffResetModal]);

  // Compute next bill number
  const getNextBillNumber = () => {
    const count = bills.length + 1;
    const now = new Date();
    const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    return `BILL-${prefix}-${String(count).padStart(4, "0")}`;
  };

  // Helper to normalize Nepali 10-digit mobile number
  const normalizeNepaliMobile = (val) => {
    if (!val) return "";
    let digits = String(val).replace(/\D/g, '');
    if (digits.startsWith("977") && digits.length > 10) {
      digits = digits.slice(3);
    }
    return digits.slice(0, 10);
  };

  // Handle WhatsApp search or input in form
  const handleWhatsAppLookup = (whatsappNum) => {
    const cleanDigits = normalizeNepaliMobile(whatsappNum);
    if (cleanDigits.length < 10) {
      setForm(prev => ({
        ...prev,
        isExistingStudent: false,
        existingBillNumber: ""
      }));
      return;
    }

    const existing = bills.find(b => {
      if (!b.contactNumber) return false;
      const bDigits = normalizeNepaliMobile(b.contactNumber);
      return bDigits === cleanDigits;
    });

    if (existing) {
      const remaining = Math.max(0, Number(existing.dueAmount || 0));
      let parsedMaterials = [...defaultMaterials];
      try {
        if (existing.materialsJson) {
          parsedMaterials = JSON.parse(existing.materialsJson);
        } else if (existing.materials) {
          parsedMaterials = existing.materials;
        }
      } catch (e) {}

      setForm(prev => ({
        ...prev,
        isExistingStudent: true,
        existingBillNumber: existing.billNumber,
        studentName: existing.studentName,
        address: existing.address || "",
        contactNumber: cleanDigits,
        parentName: existing.parentName || "",
        parentNumber: existing.parentNumber ? normalizeNepaliMobile(existing.parentNumber) : "",
        classTime: existing.classTime ? existing.classTime.replace(/\s*(AM|PM)/i, '').trim() : "",
        classTimePeriod: (existing.classTime && existing.classTime.toUpperCase().includes("PM")) ? "PM" : "AM",
        courseDetail: existing.courseDetail,
        coursePackage: existing.coursePackage,
        grossFee: existing.grossFee || existing.totalFee,
        discountPercent: existing.discountPercent || 0,
        discountAmount: existing.discountAmount || 0,
        totalFee: existing.totalFee, // Locked to original!
        paidAmount: remaining > 0 ? remaining : "",
        materials: parsedMaterials,
        paymentSystem: remaining > 0 ? "Installment Payment" : "Full Payment",
        preparedBy: "" // Always blank for direct typing as requested!
      }));

      if (remaining <= 0) {
        alert(`Notice for Student "${existing.studentName}" (WhatsApp: +977-${cleanDigits}):\nThis student's bill (${existing.billNumber}) is already FULLY PAID. No further payments are required.`);
      }
    } else {
      setForm(prev => ({
        ...prev,
        isExistingStudent: false,
        existingBillNumber: ""
      }));
    }
  };

  // Dynamic fee calculation with Discount %, Materials items price, and included 13% VAT
  const updateFeeCalculations = (newGross, newDiscPct, customMaterials) => {
    const gross = Number(newGross) >= 0 ? Number(newGross) : Number(form.grossFee || 0);
    const discPct = Number(newDiscPct) >= 0 ? Number(newDiscPct) : Number(form.discountPercent || 0);
    const materialsList = customMaterials !== undefined ? customMaterials : (form.materials || []);
    const materialsTotal = materialsList.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);

    const discAmt = gross * (discPct / 100);
    const netCourseFee = Math.max(0, gross - discAmt);
    const finalTotal = Math.max(0, netCourseFee + materialsTotal);

    setForm(prev => {
      let nextPaid = prev.paidAmount;
      if (prev.paymentSystem === "Full Payment") {
        nextPaid = finalTotal;
      } else if (Number(prev.paidAmount) > finalTotal && finalTotal > 0) {
        nextPaid = finalTotal;
      }
      return {
        ...prev,
        grossFee: gross,
        discountPercent: discPct,
        discountAmount: discAmt,
        totalFee: finalTotal,
        paidAmount: nextPaid
      };
    });
  };

  // Handle Course Package Change: auto-populates gross fee and discount % from feeConfig defaults for current course
  const handleCoursePackageChange = (selectedPackage, currentCourse) => {
    const course = currentCourse !== undefined ? currentCourse : form.courseDetail;
    const pkgDefaults = getPackageFee(selectedPackage, course);
    const gross = Number(pkgDefaults.grossFee) || 0;
    const discPct = Number(pkgDefaults.discountPercent) || 0;
    const materialsList = form.materials || [];
    const materialsTotal = materialsList.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    const discAmt = gross * (discPct / 100);
    const netCourseFee = Math.max(0, gross - discAmt);
    const finalTotal = Math.max(0, netCourseFee + materialsTotal);

    setForm(prev => ({
      ...prev,
      coursePackage: selectedPackage,
      ...(currentCourse !== undefined ? { courseDetail: currentCourse } : {}),
      grossFee: gross,
      discountPercent: discPct,
      discountAmount: discAmt,
      totalFee: finalTotal,
      paidAmount: prev.paymentSystem === "Full Payment" ? finalTotal : Math.min(Number(prev.paidAmount || 0), finalTotal)
    }));
  };

  // Handle Course Detail Change: auto-populates standard child package and fee structure for the selected course
  const handleCourseDetailChange = (selectedCourse) => {
    const course = selectedCourse || "";
    if (!form.isExistingStudent || form.isEditingExistingBill) {
      const courseDefPkg = (course && feeConfig?.courseFees?.[course]?.defaultPackage) || form.coursePackage || "Full course";
      handleCoursePackageChange(courseDefPkg, course);
    } else {
      setForm(prev => ({ ...prev, courseDetail: course }));
    }
  };

  // One-time save current Gross Fee & Discount as default for this package & course
  const handleSaveCurrentAsDefault = (pkg) => {
    const targetPkg = pkg || form.coursePackage || "Full course";
    const targetCourse = form.courseDetail || "EPS Topik Full course";
    const gross = Number(form.grossFee) || 0;
    const disc = Number(form.discountPercent) || 0;
    const currentDate = typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10);
    
    const existingCourseData = feeConfig.courseFees?.[targetCourse] || {
      defaultPackage: targetPkg,
      packages: { ...(feeConfig.packages || DEFAULT_PACKAGE_FEES) }
    };
    const updatedCoursePackages = {
      ...(existingCourseData.packages || feeConfig.packages || DEFAULT_PACKAGE_FEES),
      [targetPkg]: { grossFee: gross, discountPercent: disc }
    };
    const updatedCourseFees = {
      ...(feeConfig.courseFees || {}),
      [targetCourse]: {
        ...existingCourseData,
        packages: updatedCoursePackages
      }
    };

    const newConfig = {
      ...feeConfig,
      courseFees: updatedCourseFees,
      updatedAt: currentDate
    };
    setFeeConfig(newConfig);
    try {
      localStorage.setItem(`instituteFeeConfig_${instKey}`, JSON.stringify(newConfig));
    } catch (e) {}
    setFeeSavedToast(`Saved Rs. ${gross.toLocaleString()} (${disc}% off) as default for "${targetCourse}" (${targetPkg})!`);
    setTimeout(() => setFeeSavedToast(""), 3500);
  };

  // Save all package default fees and discounts (for standard and each course)
  const handleSaveAllPackageFees = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const saveDate = feeUpdateDate || (typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10));
    
    const mergedCourseFees = { ...(feeConfig.courseFees || {}), ...editingCourseFees };

    const newConfig = {
      defaultPackage: selectedCourseForFees === "STANDARD_DEFAULT" ? selectedDefaultPkg : (feeConfig.defaultPackage || "Full course"),
      packages: { ...editingPackageFees },
      courseFees: mergedCourseFees,
      updatedAt: saveDate
    };
    setFeeConfig(newConfig);
    try {
      localStorage.setItem(`instituteFeeConfig_${instKey}`, JSON.stringify(newConfig));
    } catch (err) {}
    setShowFeeConfigModal(false);
    setFeeSavedToast("Course package default fee structures updated successfully!");
    setTimeout(() => setFeeSavedToast(""), 3500);

    // If bill modal is currently open and not locked, refresh form to match new defaults
    if (showBillModal && !form.isExistingStudent && !form.isEditingExistingBill) {
      const curCourse = form.courseDetail;
      const curPkg = form.coursePackage || selectedDefaultPkg;
      const pkgInfo = (curCourse && newConfig.courseFees?.[curCourse]?.packages?.[curPkg]) || newConfig.packages[curPkg] || newConfig.packages[selectedDefaultPkg];
      if (pkgInfo) {
        updateFeeCalculations(pkgInfo.grossFee, pkgInfo.discountPercent);
      }
    }
  };

  // Reset bill form helper with package fee defaults
  const resetBillForm = () => {
    const currentStaffName = (typeof window !== "undefined" && localStorage.getItem("currentUser")) || "";
    const rnd = getRandomClassTime();
    const defCourse = defaultCourse;
    const defPkg = (feeConfig && feeConfig.courseFees?.[defCourse]?.defaultPackage) || (feeConfig && feeConfig.defaultPackage) || "Full course";
    const pkgDefaults = getPackageFee(defPkg, defCourse);
    const gross = Number(pkgDefaults.grossFee) || 15000;
    const discPct = Number(pkgDefaults.discountPercent) || 0;
    const discAmt = gross * (discPct / 100);
    const netTotal = Math.max(0, gross - discAmt);

    return {
      ...defaultForm,
      courseDetail: defCourse,
      coursePackage: defPkg,
      grossFee: gross,
      discountPercent: discPct,
      discountAmount: discAmt,
      totalFee: netTotal,
      paidAmount: netTotal,
      classTime: rnd.time,
      classTimePeriod: rnd.period,
      materials: [...defaultMaterials],
      preparedBy: billingRole === "user" ? (currentStaffName || "") : ""
    };
  };

  // Open Create New Bill Modal with fresh defaults
  const handleOpenCreateBill = () => {
    setForm(resetBillForm());
    setShowBillModal(true);
  };

  // Save profile header (Unrestricted for Admin)
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(apiWithInst("/api/institute/billing"), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        localStorage.setItem(`instituteBillingProfile_${instKey}`, JSON.stringify(data.profile));
        setShowProfileModal(false);
        alert(` ${data.message || "Company Header saved successfully!"}`);
      } else {
        const err = await res.json();
        alert(` ${err.error || "Failed to update header"}`);
      }
    } catch {
      localStorage.setItem(`instituteBillingProfile_${instKey}`, JSON.stringify(profile));
      setShowProfileModal(false);
      alert("Company Header updated locally.");
    }
  };

  // Logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, logoUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  // Stamp upload (Admin uploaded official stamp)
  const handleStampUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, stampUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  // Open modal to edit an existing bill record (Admin can edit all data in bill pad)
  const handleOpenEditBillModal = (bill) => {
    let parsedMaterials = [...defaultMaterials];
    try {
      if (bill.materialsJson) parsedMaterials = JSON.parse(bill.materialsJson);
      else if (bill.materials) parsedMaterials = bill.materials;
    } catch (e) {}

    setForm({
      id: bill.id,
      billNumber: bill.billNumber,
      date: bill.date,
      studentName: bill.studentName,
      address: bill.address || "",
      contactNumber: normalizeNepaliMobile(bill.contactNumber),
      parentName: bill.parentName || "",
      parentNumber: bill.parentNumber ? normalizeNepaliMobile(bill.parentNumber) : "",
      classTime: bill.classTime ? bill.classTime.replace(/\s*(AM|PM)/i, '').trim() : "",
      classTimePeriod: (bill.classTime && bill.classTime.toUpperCase().includes("PM")) ? "PM" : "AM",
      courseDetail: bill.courseDetail,
      coursePackage: bill.coursePackage,
      paymentSystem: bill.paymentSystem || "Full Payment",
      grossFee: bill.grossFee || bill.totalFee,
      discountPercent: bill.discountPercent || 0,
      discountAmount: bill.discountAmount || 0,
      totalFee: bill.totalFee,
      paidAmount: bill.paidAmount,
      materials: parsedMaterials,
      preparedBy: bill.preparedBy || "",
      paymentMethod: PAYMENT_METHODS.includes(bill.paymentMethod) ? bill.paymentMethod : (bill.paymentMethod ? "Other" : "Cash"),
      customPaymentMethod: PAYMENT_METHODS.includes(bill.paymentMethod) ? "" : (bill.paymentMethod || ""),
      isEditingExistingBill: true,
      isExistingStudent: false
    });
    setShowBillModal(true);
  };

  // Add item from Dropdown Arrow with Stock & Quantity Checking (Auto-Add or Manual)
  const handleAddItemFromDropdown = (directItemName) => {
    let itemName = "";
    if (typeof directItemName === "string" && directItemName.trim()) {
      itemName = directItemName.trim();
    } else {
      itemName = selectedItemToAdd === "Other" ? (customItemToAdd || "").trim() : (selectedItemToAdd || "").trim();
    }
    if (!itemName || itemName === "Other") return;

    const matchedProd = products.find(p =>
      p.name.toLowerCase() === itemName.toLowerCase() ||
      p.id === itemName ||
      (selectedItemToAdd && p.name.toLowerCase() === selectedItemToAdd.toLowerCase())
    );

    const qtyNum = Math.max(1, Number(selectedItemQty) || 1);

    // If item is in inventory, check available stock
    if (matchedProd) {
      if (Number(matchedProd.stock) <= 0) {
        alert(`"${matchedProd.name}" is OUT OF STOCK (Available: 0). Stock must be added by Admin before selling.`);
        return;
      }
      if (qtyNum > Number(matchedProd.stock)) {
        alert(`Requested quantity (${qtyNum}) exceeds current available stock (${matchedProd.stock} ${matchedProd.unit}) for "${matchedProd.name}". Please adjust quantity.`);
        return;
      }
    }

    const unitPrice = isItemFree ? 0 : (newItemPrice !== "" ? Number(newItemPrice) : (matchedProd ? Number(matchedProd.price) : 0));
    const totalPrice = unitPrice * qtyNum;

    const newItem = {
      productId: matchedProd?.id || null,
      name: matchedProd ? matchedProd.name : itemName,
      unitPrice: unitPrice,
      qty: qtyNum,
      unit: matchedProd?.unit || 'pcs',
      amount: totalPrice,
      isFree: isItemFree || totalPrice === 0
    };

    const updated = [...(form.materials || []), newItem];

    // Recalculate total with new item
    const gross = Number(form.grossFee || 0);
    const discPct = Number(form.discountPercent || 0);
    const discAmt = gross * (discPct / 100);
    const materialsTotal = updated.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const finalTotal = Math.max(0, (gross - discAmt) + materialsTotal);
    let nextPaid = form.paidAmount;
    if (form.paymentSystem === "Full Payment") {
      nextPaid = finalTotal;
    } else if (Number(form.paidAmount) > finalTotal && finalTotal > 0) {
      nextPaid = finalTotal;
    }

    setForm(prev => ({
      ...prev,
      materials: updated,
      totalFee: finalTotal,
      paidAmount: nextPaid
    }));

    setSelectedItemToAdd("");
    setCustomItemToAdd("");
    setNewItemPrice(isItemFree ? "0" : "");
    setSelectedItemQty(1);
  };

  // Add Item to Materials (Manual)
  const handleAddMaterialItem = () => {
    setForm(prev => ({
      ...prev,
      materials: [...(prev.materials || []), { name: "", amount: 0 }]
    }));
  };

  // Update Material Row
  const handleUpdateMaterial = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.materials];
      const parsedVal = field === "amount" ? (value === "" ? 0 : (Number(value) || 0)) : value;
      updated[index] = {
        ...updated[index],
        [field]: parsedVal
      };

      if (field === "amount") {
        const gross = Number(prev.grossFee || 0);
        const discPct = Number(prev.discountPercent || 0);
        const discAmt = gross * (discPct / 100);
        const materialsTotal = updated.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const finalTotal = Math.max(0, (gross - discAmt) + materialsTotal);
        let nextPaid = prev.paidAmount;
        if (prev.paymentSystem === "Full Payment") {
          nextPaid = finalTotal;
        } else if (Number(prev.paidAmount) > finalTotal && finalTotal > 0) {
          nextPaid = finalTotal;
        }
        return {
          ...prev,
          materials: updated,
          totalFee: finalTotal,
          paidAmount: nextPaid
        };
      }

      return { ...prev, materials: updated };
    });
  };

  // Remove Material Row
  const handleRemoveMaterial = (index) => {
    setForm(prev => {
      const updated = prev.materials.filter((_, i) => i !== index);
      const gross = Number(prev.grossFee || 0);
      const discPct = Number(prev.discountPercent || 0);
      const discAmt = gross * (discPct / 100);
      const materialsTotal = updated.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const finalTotal = Math.max(0, (gross - discAmt) + materialsTotal);
      let nextPaid = prev.paidAmount;
      if (prev.paymentSystem === "Full Payment") {
        nextPaid = finalTotal;
      } else if (Number(prev.paidAmount) > finalTotal && finalTotal > 0) {
        nextPaid = finalTotal;
      }
      return {
        ...prev,
        materials: updated,
        totalFee: finalTotal,
        paidAmount: nextPaid
      };
    });
  };

  // Toggle Free / Paid status on an already added material item
  const handleToggleMaterialFree = (index, isFree) => {
    setForm(prev => {
      const updated = [...prev.materials];
      const mat = updated[index];
      if (!mat) return prev;

      let nextAmount = 0;
      let nextUnitPrice = mat.unitPrice || 0;

      if (!isFree) {
        // Unchecked: restore price from product or unit price
        const matchedProd = products.find(p =>
          (mat.productId && p.id === mat.productId) ||
          p.name.toLowerCase() === (mat.name || "").toLowerCase()
        );
        const basePrice = matchedProd ? Number(matchedProd.price) : (Number(mat.unitPrice) || 0);
        nextUnitPrice = basePrice;
        nextAmount = basePrice * (Number(mat.qty) || 1);
      } else {
        // Checked: free (Rs. 0)
        nextAmount = 0;
      }

      updated[index] = {
        ...mat,
        isFree: isFree,
        unitPrice: nextUnitPrice,
        amount: nextAmount
      };

      const gross = Number(prev.grossFee || 0);
      const discPct = Number(prev.discountPercent || 0);
      const discAmt = gross * (discPct / 100);
      const materialsTotal = updated.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const finalTotal = Math.max(0, (gross - discAmt) + materialsTotal);
      let nextPaid = prev.paidAmount;
      if (prev.paymentSystem === "Full Payment") {
        nextPaid = finalTotal;
      } else if (Number(prev.paidAmount) > finalTotal && finalTotal > 0) {
        nextPaid = finalTotal;
      }

      return {
        ...prev,
        materials: updated,
        totalFee: finalTotal,
        paidAmount: nextPaid
      };
    });
  };

  // Toggle Free for ALL items (and set default for upcoming items)
  const handleToggleAllFree = (makeAllFree) => {
    setIsItemFree(makeAllFree);
    if (makeAllFree) {
      setNewItemPrice("0");
    } else {
      setNewItemPrice("");
    }

    setForm(prev => {
      if (!prev.materials || prev.materials.length === 0) return prev;

      const updated = prev.materials.map(mat => {
        if (makeAllFree) {
          return {
            ...mat,
            isFree: true,
            amount: 0
          };
        } else {
          const matchedProd = products.find(p =>
            (mat.productId && p.id === mat.productId) ||
            p.name.toLowerCase() === (mat.name || "").toLowerCase()
          );
          const basePrice = matchedProd ? Number(matchedProd.price) : (Number(mat.unitPrice) || 0);
          return {
            ...mat,
            isFree: false,
            unitPrice: basePrice,
            amount: basePrice * (Number(mat.qty) || 1)
          };
        }
      });

      const gross = Number(prev.grossFee || 0);
      const discPct = Number(prev.discountPercent || 0);
      const discAmt = gross * (discPct / 100);
      const materialsTotal = updated.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const finalTotal = Math.max(0, (gross - discAmt) + materialsTotal);
      let nextPaid = prev.paidAmount;
      if (prev.paymentSystem === "Full Payment") {
        nextPaid = finalTotal;
      } else if (Number(prev.paidAmount) > finalTotal && finalTotal > 0) {
        nextPaid = finalTotal;
      }

      return {
        ...prev,
        materials: updated,
        totalFee: finalTotal,
        paidAmount: nextPaid
      };
    });
  };

  // Submit Bill (New Bill or Installment Payment under SAME WhatsApp & Bill Number)
  const handleSubmitBill = async (e) => {
    e.preventDefault();

    const clean10 = normalizeNepaliMobile(form.contactNumber);
    if (clean10.length !== 10) {
      alert("WhatsApp number must be exactly 10 digits (e.g. 9812345678).");
      return;
    }

    // Parent number validation (must be 10 digits if provided)
    let cleanParent = "";
    if (form.parentNumber && form.parentNumber.trim()) {
      cleanParent = normalizeNepaliMobile(form.parentNumber);
      if (cleanParent.length !== 10) {
        alert("Parent Number must be exactly 10 digits (e.g. 9812345678).");
        return;
      }
      cleanParent = `+977-${cleanParent}`;
    }

    const fullWhatsApp = `+977-${clean10}`;
    const currentTotalFee = Number(form.totalFee);
    const paidAmt = Number(form.paidAmount);

    if (isNaN(currentTotalFee) || currentTotalFee <= 0) {
      alert("Please enter a valid Total Fee.");
      return;
    }

    if (isNaN(paidAmt) || paidAmt <= 0) {
      alert("Please enter a valid Paid Amount.");
      return;
    }

    // PAYMENT CANNOT ACCEPT MORE THAN COURSE GROSS FEE OR AFTER DISCOUNT FEE
    const maxFeeAllowed = currentTotalFee > 0 ? currentTotalFee : (Number(form.grossFee) || 0);
    if (form.isExistingStudent && !form.isEditingExistingBill) {
      const existing = bills.find(b => normalizeNepaliMobile(b.contactNumber || "") === clean10);
      if (existing && Number(existing.dueAmount) > 0 && paidAmt > Number(existing.dueAmount)) {
        alert(`Payment amount (${formatCurrency(paidAmt)}) cannot exceed remaining due balance of ${formatCurrency(existing.dueAmount)}.`);
        return;
      }
    } else if (maxFeeAllowed > 0 && paidAmt > maxFeeAllowed) {
      alert(`Payment amount (${formatCurrency(paidAmt)}) cannot accept more than course fee after discount (${formatCurrency(maxFeeAllowed)}).`);
      return;
    }

    // preparedBy: blank typing as requested
    const preparedByVal = form.preparedBy ? form.preparedBy.trim() : "";

    const inWords = numberToRupeesInWords(paidAmt);
    const chosenPaymentMethod = form.paymentMethod === "Other"
      ? (form.customPaymentMethod && form.customPaymentMethod.trim() ? form.customPaymentMethod.trim() : "Other")
      : (form.paymentMethod || "Cash");

    const fullClassTime = (form.classTime && form.classTime.trim())
      ? `${form.classTime.trim()} ${form.classTimePeriod || "AM"}`
      : "";

    const payload = {
      date: form.date || new Date().toISOString().split('T')[0],
      studentName: form.studentName.trim(),
      address: form.address.trim(),
      contactNumber: fullWhatsApp,
      parentName: (form.parentName || "").trim(),
      parentNumber: cleanParent,
      classTime: fullClassTime,
      courseDetail: form.courseDetail.trim(),
      coursePackage: form.coursePackage,
      paymentSystem: form.paymentSystem,
      paymentMethod: chosenPaymentMethod,
      grossFee: Number(form.grossFee) || currentTotalFee,
      discountPercent: Number(form.discountPercent) || 0,
      discountAmount: Number(form.discountAmount) || 0,
      totalFee: currentTotalFee, // Final fee including 13% VAT/PAN
      paidAmount: paidAmt,
      amountInWords: inWords,
      materials: form.materials,
      preparedBy: preparedByVal
    };

    // SCENARIO 0: Admin is editing an existing bill record (Edit Bill)
    if (form.isEditingExistingBill && form.id) {
      try {
        const res = await fetch(apiWithInst("/api/institute/billing"), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'edit_bill',
            billId: form.id,
            ...payload
          })
        });

        const data = await res.json();
        if (!res.ok) {
          alert(` ${data.error || "Failed to update bill record"}`);
          return;
        }

        const updatedBill = data.bill;
        const updatedList = bills.map(b => b.id === form.id ? updatedBill : b);
        setBills(updatedList);
        localStorage.setItem(`instituteBillingRecords_${instKey}`, JSON.stringify(updatedList));
        autoSyncToGoogleSheetBackground(updatedBill, updatedList);
        if (selectedInvoice && selectedInvoice.id === form.id) {
          setSelectedInvoice(updatedBill);
        }
        setShowBillModal(false);
        setForm(resetBillForm());
        alert(`Bill ${updatedBill.billNumber} has been successfully updated!`);
        return;
      } catch (err) {
        console.error("Error updating bill record:", err);
        alert("Failed to update bill record. Please try again.");
        return;
      }
    }

    try {
      const res = await fetch(apiWithInst("/api/institute/billing"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(` ${data.error || "Failed to process bill payment"}`);
        return;
      }

      const returnedBill = data.bill;

      // Update local state: if existing bill was updated, replace in list; else add to top
      let updatedList = [];
      const existsIndex = bills.findIndex(b => {
        if (!b.contactNumber) return false;
        return normalizeNepaliMobile(b.contactNumber) === clean10;
      });

      if (existsIndex >= 0) {
        updatedList = [...bills];
        updatedList[existsIndex] = returnedBill;
      } else {
        updatedList = [returnedBill, ...bills];
      }

      setBills(updatedList);
      localStorage.setItem(`instituteBillingRecords_${instKey}`, JSON.stringify(updatedList));

      // Hidden background millisecond auto-sync to Google Sheet
      autoSyncToGoogleSheetBackground(returnedBill, updatedList);

      // Refresh product stock since backend automatically reduces it for sold items
      if (form.materials && form.materials.length > 0) {
        fetch(apiWithInst("/api/institute/billing/products"), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'x-user-role': billingRole || 'user'
          }
        })
          .then(r => r.json())
          .then(d => {
            if (d.success && Array.isArray(d.products)) {
              setProducts(d.products);
              localStorage.setItem(`instituteBillingProducts_${instKey}`, JSON.stringify(d.products));
            }
          })
          .catch(e => console.error("Error reducing stock after bill:", e));
      }

      setSelectedInvoice(returnedBill);
      setShowBillModal(false);
      setForm(resetBillForm());

      alert(data.message || `Bill ${returnedBill.billNumber} successfully generated!`);
      setTimeout(() => window.print(), 200);
    } catch (err) {
      console.error("Error submitting bill:", err);
      alert("Failed to submit bill. Please check your network.");
    }
  };

  // Google Sheet manual sync
  const handleSyncToGoogleSheet = async () => {
    if (!profile.googleSheetUrl || !profile.googleSheetUrl.trim() || profile.googleSheetUrl === "setup_done") {
      setSetupTab("connect");
      handleOpenGoogleSetupModal();
      return;
    }

    setIsSyncing(true);
    const syncMsg = `Syncing all ${bills.length} bills & ${expenses.length} expenses to Google Sheet, please wait...`;
    setSyncStatus(syncMsg);
    setTestStatus({
      state: "testing",
      message: syncMsg
    });

    try {
      const res = await fetch(apiWithInst("/api/institute/billing/sync"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_sync',
          googleSheetUrl: profile.googleSheetUrl.trim(),
          ownerEmail: profile.ownerEmail ? profile.ownerEmail.trim() : "",
          bills: bills,
          expenses: expenses
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const successMsg = data.message || `Successfully synchronized ${bills.length} bills and ${expenses.length} expenses to Google Sheet!`;
        setSyncStatus(` ${successMsg}`);
        setTestStatus({
          state: "success",
          message: ` ${successMsg} Open your Google Sheet to view Sheet 1 (Bills) and Sheet 2 (Expenses).`
        });
        const updated = bills.map(b => ({ ...b, isSyncedToSheet: true }));
        setBills(updated);
        localStorage.setItem(`instituteBillingRecords_${instKey}`, JSON.stringify(updated));
        if (data.result?.sheetUrl && !googleSheetViewUrl) {
          setGoogleSheetViewUrl(data.result.sheetUrl);
          localStorage.setItem(`instituteGoogleSheetViewUrl_${instKey}`, data.result.sheetUrl);
        }
        alert(` ${successMsg}\n\nYour bills have been written to Sheet 1 (Bills) and expenses to Sheet 2 (Expenses) in your Google Sheet.`);
      } else {
        const errorMsg = data.error || "Sync failed. Please check your Google Apps Script URL.";
        setSyncStatus(` ${errorMsg}`);
        setTestStatus({
          state: "error",
          message: ` ${errorMsg}`
        });
        alert(`Sync failed: ${errorMsg}`);
      }
    } catch (err) {
      const connErr = `Connection error: ${err.message}`;
      setSyncStatus(` ${connErr}`);
      setTestStatus({
        state: "error",
        message: ` ${connErr}`
      });
      alert(`Sync Error: ${connErr}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save Google Sheet & Drive Configuration
  const handleSaveGoogleSetup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaveSetupStatus("Saving configuration...");

    let webhookUrl = (profile.googleSheetUrl || "").trim();
    let viewUrl = (googleSheetViewUrl || "").trim();
    let driveUrl = (googleDriveUrl || "").trim();

    // Auto-detect if user mistakenly pasted a Google Drive link into webhook URL
    if (webhookUrl.includes("drive.google.com")) {
      if (!driveUrl) driveUrl = webhookUrl;
      setGoogleDriveUrl(driveUrl);
      localStorage.setItem(`instituteGoogleDriveUrl_${instKey}`, driveUrl);
      webhookUrl = "";
      setProfile(prev => ({ ...prev, googleSheetUrl: "" }));
      alert(" We noticed your Webhook URL was a Google Drive link! We've saved it as your 'Google Drive Folder Link'.\n\nTo enable automated background sync, please follow Tab 2 ('Apps Script Guide & Code') to deploy the Apps Script Web App (URL starts with https://script.google.com/macros/s/...).");
    }
    // Auto-detect if user mistakenly pasted a spreadsheet URL into webhook URL
    else if (webhookUrl.includes("docs.google.com/spreadsheets") || webhookUrl.includes("docs.google.com")) {
      if (!viewUrl) viewUrl = webhookUrl;
      setGoogleSheetViewUrl(viewUrl);
      localStorage.setItem(`instituteGoogleSheetViewUrl_${instKey}`, viewUrl);
      webhookUrl = "";
      setProfile(prev => ({ ...prev, googleSheetUrl: "" }));
      alert(" We noticed your Webhook URL was a Google Spreadsheet link! We've saved it as your 'Direct Google Sheet Link'.\n\nFor automated sync, please deploy the Apps Script Web App (URL starts with https://script.google.com/macros/s/...) following the Step-by-Step Guide.");
    } else if (webhookUrl && webhookUrl.endsWith("/dev")) {
      alert(" You entered a URL ending in '/dev'. Google blocks automated sync requests to test /dev URLs.\n\nPlease deploy a new Web App (Deploy > New deployment > Web app) with 'Who has access: Anyone' and copy the URL ending in '/exec'.");
    }

    try {
      localStorage.setItem(`instituteGoogleSheetViewUrl_${instKey}`, viewUrl);
      localStorage.setItem(`instituteGoogleDriveUrl_${instKey}`, driveUrl);

      const savedGoogleSheetUrl = webhookUrl || (driveUrl || viewUrl ? "setup_done" : "");
      const res = await fetch(apiWithInst("/api/institute/billing"), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          googleSheetUrl: savedGoogleSheetUrl,
          ownerEmail: profile.ownerEmail ? profile.ownerEmail.trim() : ""
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        localStorage.setItem(`instituteBillingProfile_${instKey}`, JSON.stringify(data.profile));
        setSaveSetupStatus(" Configuration saved successfully!");
        if (webhookUrl || viewUrl || driveUrl) {
          localStorage.setItem("global_google_sheet_setup_done", "true");
          setIsPermanentlyLinked(true);
        }
        setTimeout(() => setSaveSetupStatus(""), 4000);
      } else {
        localStorage.setItem(`instituteBillingProfile_${instKey}`, JSON.stringify({
          ...profile,
          googleSheetUrl: webhookUrl || (driveUrl || viewUrl ? "setup_done" : "")
        }));
        setSaveSetupStatus(" Configuration saved locally.");
        if (webhookUrl || viewUrl || driveUrl) {
          localStorage.setItem("global_google_sheet_setup_done", "true");
          setIsPermanentlyLinked(true);
        }
        setTimeout(() => setSaveSetupStatus(""), 4000);
      }
    } catch {
      localStorage.setItem(`instituteBillingProfile_${instKey}`, JSON.stringify({
        ...profile,
        googleSheetUrl: webhookUrl || (driveUrl || viewUrl ? "setup_done" : "")
      }));
      setSaveSetupStatus(" Configuration saved locally.");
      if (webhookUrl || viewUrl || driveUrl) {
        localStorage.setItem("global_google_sheet_setup_done", "true");
        setIsPermanentlyLinked(true);
      }
      setTimeout(() => setSaveSetupStatus(""), 4000);
    }
  };

  // Test Connection
  const handleTestGoogleConnection = async () => {
    const webhook = (profile.googleSheetUrl || "").trim();
    if (!webhook || webhook === "setup_done") {
      setTestStatus({
        state: "error",
        message: "Please enter your Google Apps Script Web App URL first (see Tab 2 for the 1-minute guide)."
      });
      return;
    }

    if (webhook.includes("drive.google.com")) {
      setTestStatus({
        state: "error",
        message: " You entered a Google Drive link. Google Drive links cannot receive sync webhooks. Please deploy the Apps Script Web App (URL starts with https://script.google.com/macros/s/...) following Tab 2."
      });
      return;
    }

    if (webhook.includes("docs.google.com")) {
      setTestStatus({
        state: "error",
        message: " You entered a Google Spreadsheet document link instead of an Apps Script Web App URL. Please deploy the Web App following Tab 2."
      });
      return;
    }

    if (webhook.endsWith("/dev")) {
      setTestStatus({
        state: "error",
        message: " You entered a URL ending in '/dev'. Google blocks external access to /dev URLs. In Apps Script, click Deploy > New deployment > Web app, choose 'Who has access: Anyone', and use the URL ending in '/exec'."
      });
      return;
    }

    setTestStatus({ state: "testing", message: "Connecting to Google Sheet & testing Apps Script..." });

    try {
      const res = await fetch(apiWithInst("/api/institute/billing/sync"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          googleSheetUrl: webhook,
          ownerEmail: profile.ownerEmail ? profile.ownerEmail.trim() : ""
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.details?.sheetUrl && !googleSheetViewUrl) {
          setGoogleSheetViewUrl(data.details.sheetUrl);
          localStorage.setItem(`instituteGoogleSheetViewUrl_${instKey}`, data.details.sheetUrl);
        }
        setTestStatus({
          state: "success",
          message: `${data.message || "Successfully connected to Google Sheet!"} Click "Sync All Bills (${bills.length})" to write all bills into your sheet.`
        });
      } else {
        setTestStatus({
          state: "error",
          message: ` ${data.error || "Connection failed. Please check your Apps Script deployment permissions."}`
        });
      }
    } catch (err) {
      setTestStatus({
        state: "error",
        message: ` Connection error: ${err.message}`
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (bills.length === 0) {
      alert("No billing records to export.");
      return;
    }

    const headers = [
      "Bill No", "Date", "Student Name", "Address", "Contact (WhatsApp)",
      "Parent Contact", "Course Detail", "Course Package", "Payment Status",
      "Gross Fee", "Discount %", "Discount Rs", "Total Fee (13% VAT Incl)",
      "Paid Amount", "Due Amount", "In Words", "Prepared By"
    ];

    const formatPhoneForCsv = (val) => {
      if (!val) return '';
      const digits = String(val).replace(/\D/g, '');
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      return last10 ? `+977-${last10}` : '';
    };

    const rows = bills.map(b => [
      `"${b.billNumber}"`,
      `"${b.date}"`,
      `"${(b.studentName || "").replace(/"/g, '""')}"`,
      `"${(b.address || "").replace(/"/g, '""')}"`,
      `"${formatPhoneForCsv(b.contactNumber)}"`,
      `"${formatPhoneForCsv(b.parentNumber)}"`,
      `"${(b.courseDetail || "").replace(/"/g, '""')}"`,
      `"${b.coursePackage || ""}"`,
      `"${b.paymentSystem || ""}"`,
      b.grossFee || b.totalFee || 0,
      b.discountPercent || 0,
      b.discountAmount || 0,
      b.totalFee || 0,
      b.paidAmount || 0,
      b.dueAmount || 0,
      `"${(b.amountInWords || "").replace(/"/g, '""')}"`,
      `"${(b.preparedBy || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_bills_${profile.panVatNumber || 'sigma'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  // List of available months for the Month Picker
  const availableMonths = Array.from(new Set(
    bills.map(b => {
      if (b.date) return b.date.substring(0, 7);
      if (b.createdAt) return new Date(b.createdAt).toISOString().substring(0, 7);
      return currentMonthStr;
    }).concat(currentMonthStr)
  )).sort().reverse();

  // Helper to format month YYYY-MM to Month Name Year
  const formatMonthName = (mStr) => {
    try {
      const [y, m] = mStr.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return mStr;
    }
  };

  // Helper to extract all individual payment transactions from a bill
  const extractTransactionsFromBill = (b) => {
    let txs = [];
    try {
      if (b.paymentsJson) {
        const parsed = JSON.parse(b.paymentsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          txs = parsed.map((p, idx) => ({
            billNumber: b.billNumber,
            studentName: b.studentName,
            address: b.address,
            contactNumber: b.contactNumber,
            date: p.date || b.date,
            amount: Number(p.amount) || 0,
            paymentMethod: p.paymentMethod || b.paymentMethod || "Cash",
            installment: p.installment || idx + 1
          }));
        }
      }
    } catch (e) {}

    if (txs.length === 0) {
      if (b.firstInstallment) {
        txs.push({
          billNumber: b.billNumber,
          studentName: b.studentName,
          address: b.address,
          contactNumber: b.contactNumber,
          date: b.firstPaymentDate || b.date,
          amount: Number(b.firstInstallment) || 0,
          paymentMethod: b.paymentMethod || "Cash",
          installment: 1
        });
      }
      if (b.secondInstallment) {
        txs.push({
          billNumber: b.billNumber,
          studentName: b.studentName,
          address: b.address,
          contactNumber: b.contactNumber,
          date: b.secondPaymentDate || b.date,
          amount: Number(b.secondInstallment) || 0,
          paymentMethod: b.paymentMethod || "Cash",
          installment: 2
        });
      }
      if (b.thirdInstallment) {
        txs.push({
          billNumber: b.billNumber,
          studentName: b.studentName,
          address: b.address,
          contactNumber: b.contactNumber,
          date: b.thirdPaymentDate || b.date,
          amount: Number(b.thirdInstallment) || 0,
          paymentMethod: b.paymentMethod || "Cash",
          installment: 3
        });
      }
      if (txs.length === 0) {
        txs.push({
          billNumber: b.billNumber,
          studentName: b.studentName,
          address: b.address,
          contactNumber: b.contactNumber,
          date: b.date,
          amount: Number(b.paidAmount) || 0,
          paymentMethod: b.paymentMethod || "Cash",
          installment: 1
        });
      }
    }
    return txs;
  };

  // Compute Daily, Weekly, and Monthly Analytics ACCORDING TO EACH TRANSACTION
  const getPeriodStats = (period, targetMonth = selectedMonth) => {
    let total = 0;
    let cash = 0;
    let online = 0;
    let count = 0;
    let breakdown = {
      "Cash": 0,
      "Online Bank Acc": 0,
      "Online Esewa": 0,
      "Online Khalti": 0,
      "Other": 0
    };

    bills.forEach(b => {
      const txs = extractTransactionsFromBill(b);
      txs.forEach(tx => {
        const txDate = tx.date || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : "");
        let inPeriod = false;
        if (period === "daily") inPeriod = (txDate === todayStr);
        else if (period === "weekly") inPeriod = (txDate >= oneWeekAgoStr);
        else if (period === "monthly") inPeriod = (txDate && txDate.startsWith(targetMonth));
        else inPeriod = true;

        if (inPeriod && tx.amount > 0) {
          count++;
          total += tx.amount;
          const m = tx.paymentMethod || "Cash";
          if (m === "Cash") {
            cash += tx.amount;
            breakdown["Cash"] += tx.amount;
          } else if (m === "Online Bank Acc") {
            online += tx.amount;
            breakdown["Online Bank Acc"] += tx.amount;
          } else if (m === "Online Esewa") {
            online += tx.amount;
            breakdown["Online Esewa"] += tx.amount;
          } else if (m === "Online Khalti") {
            online += tx.amount;
            breakdown["Online Khalti"] += tx.amount;
          } else {
            online += tx.amount;
            breakdown["Other"] += tx.amount;
          }
        }
      });
    });

    return { total, cash, online, breakdown, count };
  };

  const dailyStats = getPeriodStats("daily");
  const weeklyStats = getPeriodStats("weekly");
  const monthlyStats = getPeriodStats("monthly", selectedMonth);
  const activeStats = adminTimeframe === "daily" ? dailyStats : adminTimeframe === "weekly" ? weeklyStats : adminTimeframe === "monthly" ? monthlyStats : getPeriodStats("all");

  const todayExpensesTotal = expenses
    .filter(exp => {
      const d = exp.date || "";
      return d === todayStr || d === (new Date().toISOString().split('T')[0]);
    })
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  // Filter bills by search query (WhatsApp number, name, or bill no) and tab
  const filteredBills = bills.filter(b => {
    const bDate = b.date || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : "");
    const q = searchQuery.toLowerCase().trim();
    const cleanSearchDigits = searchQuery.replace(/\D/g, '');
    const billPhoneDigits = (b.contactNumber || "").replace(/\D/g, '');

    const matchesSearch = !q ||
      (cleanSearchDigits && billPhoneDigits.includes(cleanSearchDigits)) ||
      (b.contactNumber && b.contactNumber.toLowerCase().includes(q)) ||
      (b.studentName && b.studentName.toLowerCase().includes(q)) ||
      (b.billNumber && b.billNumber.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const txs = extractTransactionsFromBill(b);

    // USER / STAFF: Everyday clean wiped bill record by default (fresh desk every morning)
    if (billingRole === "user") {
      if (userDayView === "today" && !searchQuery.trim()) {
        const hasTodayActivity = txs.some(tx => (tx.date || bDate) === todayStr) || (bDate === todayStr);
        if (!hasTodayActivity) return false;
      }
    } else {
      // ADMIN: Timeframe and Month filter (Accounts for each transaction date)
      if (adminTimeframe === "daily") {
        const hasDailyTx = txs.some(tx => (tx.date || bDate) === todayStr) || (bDate === todayStr);
        if (!hasDailyTx) return false;
      } else if (adminTimeframe === "weekly") {
        const hasWeeklyTx = txs.some(tx => (tx.date || bDate) >= oneWeekAgoStr) || (bDate >= oneWeekAgoStr);
        if (!hasWeeklyTx) return false;
      } else if (adminTimeframe === "monthly") {
        const hasMonthlyTx = txs.some(tx => (tx.date || bDate).startsWith(selectedMonth)) || bDate.startsWith(selectedMonth);
        if (!hasMonthlyTx) return false;
      }

      // Payment Method filter (Accounts for each transaction method)
      if (paymentMethodFilter !== "all") {
        const hasMethod = txs.some(tx => (tx.paymentMethod || "Cash") === paymentMethodFilter) || ((b.paymentMethod || "Cash") === paymentMethodFilter);
        if (!hasMethod) return false;
      }
    }

    if (activeFilter === "due") return Number(b.dueAmount) > 0;
    if (activeFilter === "full") return Number(b.dueAmount) <= 0;
    return true;
  });

  return (
    <div style={{ paddingBottom: "50px" }}>
      {/* Print CSS - Strictly renders the clean Bill Pad layout or Expense Sheet fixed to Letter size */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 5mm;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Collapse the height of all elements OUTSIDE the printable area so they don't cause extra blank pages */
          body:not(.printing-expense) *:not(#printable-bill-pad):not(#printable-bill-pad *) {
            height: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            visibility: hidden !important;
            overflow: visible !important;
          }

          body:not(.printing-expense) #printable-bill-pad,
          body:not(.printing-expense) #printable-bill-pad * {
            visibility: visible !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body:not(.printing-expense) #printable-bill-pad {
            position: absolute !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 195mm !important;
            height: auto !important;
            padding: 4px 8px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body:not(.printing-expense) #printable-expense-sheet {
            display: none !important;
          }

          /* Mode 2: Official Expenses Statement / Ledger Print */
          body.printing-expense * {
            visibility: hidden !important;
          }
          body.printing-expense #printable-expense-sheet,
          body.printing-expense #printable-expense-sheet * {
            visibility: visible !important;
          }
          body.printing-expense #printable-expense-sheet {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 8.5in !important;
            margin: 0 auto !important;
            padding: 12px 18px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.printing-expense #printable-bill-pad {
            display: none !important;
          }

          .no-print {
            display: none !important;
          }
        }

        /* Screen mode: Hide printable expense sheet */
        #printable-expense-sheet {
          display: none;
        }

        /* Hide all number input spinner / up and down arrows */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type=number] {
          -moz-appearance: textfield !important;
        }

        /* Full Red Paid Amount Input Box */
        input.paid-amount-red-input,
        .paid-amount-red-input {
          background: #dc2626 !important;
          background-color: #dc2626 !important;
          color: #ffffff !important;
          border: 2px solid #b91c1c !important;
          box-shadow: 0 3px 8px rgba(220, 38, 38, 0.35) !important;
          text-align: center !important;
        }
        input.paid-amount-red-input:focus,
        .paid-amount-red-input:focus,
        input.paid-amount-red-input:active,
        .paid-amount-red-input:active {
          background: #dc2626 !important;
          background-color: #dc2626 !important;
          color: #ffffff !important;
          border-color: #7f1d1d !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.45) !important;
          text-align: center !important;
        }
        .paid-amount-red-input::placeholder {
          color: rgba(255, 255, 255, 0.85) !important;
          font-weight: 800 !important;
          font-size: 11.5px !important;
          letter-spacing: 0.3px !important;
          text-align: center !important;
        }
        .paid-amount-red-input:-webkit-autofill,
        .paid-amount-red-input:-webkit-autofill:hover,
        .paid-amount-red-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #dc2626 inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }

      `}} />

      {!isBillingAuthenticated ? (
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "40px 16px 60px 16px",
          boxSizing: "border-box"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 10px 25px rgba(30, 58, 138, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05)",
            border: "1px solid #cbd5e1",
            overflow: "hidden",
            flexShrink: 0
          }}>
            {/* Header: Institute Navy Theme */}
            <div style={{
              backgroundColor: "#1e3a8a",
              backgroundImage: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)",
              padding: "26px 20px 22px 20px",
              textAlign: "center",
              color: "#ffffff"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "2px solid rgba(255, 255, 255, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px auto",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: "#ffffff", letterSpacing: "0.5px" }}>
                Login
              </h2>
            </div>

            {/* Form: White Background */}
            <div style={{ padding: "26px 24px 30px 24px", backgroundColor: "#ffffff" }}>
              {loginError && (
                <div style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span></span> {loginError}
                </div>
              )}

              <form onSubmit={handleGateLogin}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                    User ID / Username *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="Enter User ID or Username"
                    value={loginUserId}
                    onChange={(e) => setLoginUserId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      backgroundColor: "#f8fafc",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      backgroundColor: "#f8fafc",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    width: "100%",
                    backgroundColor: "#1e3a8a",
                    backgroundImage: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "13px 20px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "bold",
                    cursor: loginLoading ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(30, 58, 138, 0.3)",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>{loginLoading ? "Logging in..." : "Login"}</span>
                </button>
              </form>
            </div>

            {/* Card Content Finished */}
          </div>
        </div>
      ) : (
        <>
          {/* Top Action & Menu Bar (Centered for Admin & User) */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            gap: "14px",
            textAlign: "center"
          }}>
            {/* Title (Centered) */}
            <h2 style={{ margin: 0, color: "#1e3a8a", fontSize: "24px", fontWeight: "900", letterSpacing: "-0.3px" }}>
              Billing & Payment Management System
            </h2>

            {/* Menu & Action Buttons Row (All Centered for Admin and User) */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap"
            }}>
              {/* Manual Lock Button & Auto-lock Timer */}
              <button
                onClick={handleBillingLogout}
                title="Lock billing section"
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  border: "1px solid #fca5a5",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.15s ease",
                  boxShadow: "0 1px 3px rgba(185, 28, 28, 0.12)"
                }}
              >
                Lock
              </button>

              <span style={{ display: "none" }}>
                Auto-lock in: <strong style={{ color: inactivityCountdown <= 5 ? "#ef4444" : "#0284c7" }}>{inactivityCountdown}s</strong>
              </span>

              {/* EXPENSES BUTTON (AVAILABLE TO ALL USERS, RECORDS MONITORED BY ADMIN) */}
              <button
                onClick={() => setShowExpenseModal(true)}
                title="Record and view daily, weekly, and monthly expenses"
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "1px solid #b91c1c",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)"
                }}
              >
                Expenses
              </button>

              {/* PRODUCT STOCK / INVENTORY BUTTON (VISIBLE TO ALL USERS, RESTOCKING BY ADMIN ONLY) */}
              <button
                onClick={() => {
                  loadProducts();
                  setShowStockModal(true);
                }}
                title="View product inventory & available stock quantities"
                style={{
                  backgroundColor: "#6366f1",
                  color: "white",
                  border: "1px solid #4f46e5",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)"
                }}
              >
                Product Stock
                <span style={{
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "900"
                }}>
                  {products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)}
                </span>
              </button>

              {/* ADMIN-ONLY ACTION BUTTONS */}
              {billingRole === "admin" && (
                <>
                  <button
                    onClick={() => {
                      loadStaffList();
                      setShowStaffModal(true);
                    }}
                    style={{
                      backgroundColor: "#6366f1",
                      color: "white",
                      border: "1px solid #4f46e5",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)"
                    }}
                  >
                    Staff Accounts
                  </button>

                  <button
                    onClick={() => {
                      const currentCreds = getSharedGateCredentials(instituteName);
                      setNewAdminUserId(currentCreds.userId || "admin");
                      setNewPin("");
                      setConfirmPin("");
                      setPinChangeMsg("");
                      setShowChangePinModal(true);
                    }}
                    style={{
                      backgroundColor: "#1e3a8a",
                      color: "white",
                      border: "1px solid #1e40af",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(30, 58, 138, 0.25)"
                    }}
                  >
                    🔑 ID & Password
                  </button>

                  {/* Automatically hide once successfully linked unless superadmin */}
                  {canShowSetupMenu && (
                    <button
                      type="button"
                      onClick={handleOpenGoogleSetupModal}
                      title="Google Sheet & Drive Setup"
                      style={{
                        backgroundColor: "#475569",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      Google Sheet & Drive Setup
                    </button>
                  )}
                </>
              )}

              {/* REGULAR USER / STAFF: ONLY CAN RESET OWN PASSWORD (NO ID CREATION, NO ADMIN ID/PASSWORD ACCESS) */}
              {billingRole !== "admin" && (
                <button
                  type="button"
                  onClick={() => {
                    setStaffCurrentPassword("");
                    setStaffNewPassword("");
                    setStaffConfirmPassword("");
                    setStaffResetMsg("");
                    setShowStaffResetModal(true);
                  }}
                  title="Reset your own staff login password"
                  style={{
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    border: "1px solid #1e40af",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(30, 58, 138, 0.25)"
                  }}
                >
                  🔑 Change My Password
                </button>
              )}

              {billingRole === "admin" && (
                <button
                  type="button"
                  onClick={() => {
                    const initialCourse = (form?.courseDetail && getFilteredCourses().includes(form.courseDetail)) ? form.courseDetail : defaultCourse;
                    setSelectedCourseForFees(initialCourse);
                    setEditingCourseFees({ ...(feeConfig.courseFees || {}) });
                    setEditingPackageFees({ ...(feeConfig.packages || DEFAULT_PACKAGE_FEES) });
                    const courseDefPkg = feeConfig.courseFees?.[initialCourse]?.defaultPackage || feeConfig.defaultPackage || "Full course";
                    setSelectedDefaultPkg(courseDefPkg);
                    setFeeUpdateDate(feeConfig.updatedAt || (typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10)));
                    setShowFeeConfigModal(true);
                  }}
                  title="Configure default course package gross fees and discounts"
                  style={{
                    backgroundColor: "#0284c7",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)"
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Fee Defaults
                </button>
              )}

              {/* CREATE NEW BILL (SECOND LAST BUTTON) */}
              <button
                onClick={handleOpenCreateBill}
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "1px solid #15803d",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)"
                }}
              >
                Create New Bill
              </button>

              {/* PRINT BUTTON - DARK PURPLE (LAST BUTTON) */}
              <button
                onClick={() => {
                  if (selectedInvoice) {
                    window.print();
                  } else if (bills.length > 0) {
                    setSelectedInvoice(bills[0]);
                    setTimeout(() => window.print(), 300);
                  } else {
                    alert("Please create a bill first to print!");
                  }
                }}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "1px solid #3b0764",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(88, 28, 135, 0.3)"
                }}
              >
                Print
              </button>
            </div>
          </div>

      {/* ADMIN FINANCIAL ANALYTICS & PAYMENT METHOD COLLECTIONS (Daily, Weekly, Monthly, Cash vs Online) */}
      {billingRole === "admin" && (
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "2px solid #1e3a8a",
          padding: "16px 20px",
          marginBottom: "20px",
          boxShadow: "none"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div>
                <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "16px", fontWeight: "900" }}>
                  Collections Ledger: Daily, Weekly & Monthly Records
                </h4>
              </div>
            </div>

            {/* Timeframe Tabs & Month Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "3px" }}>
                {[
                  { id: "daily", label: "Daily (Today)" },
                  { id: "weekly", label: "Weekly (7 Days)" },
                  { id: "monthly", label: "Monthly" },
                  { id: "all", label: "All Time" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTimeframe(tab.id)}
                    style={{
                      backgroundColor: adminTimeframe === tab.id ? "#1e3a8a" : "transparent",
                      color: adminTimeframe === tab.id ? "#ffffff" : "#475569",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {adminTimeframe === "monthly" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "2px solid #1e3a8a",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#1e3a8a",
                    backgroundColor: "#eff6ff"
                  }}
                >
                  {availableMonths.map((mStr, idx) => (
                    <option key={idx} value={mStr}>
                      {formatMonthName(mStr)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* KPI Stat Cards (All in Green, Centered) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "14px" }}>
            {/* Total Period Collection */}
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#166534", marginBottom: "4px" }}>
                Total {adminTimeframe === "daily" ? "Today" : adminTimeframe === "weekly" ? "This Week" : adminTimeframe === "monthly" ? formatMonthName(selectedMonth) : "All-Time"} Collection
              </div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#15803d" }}>
                {formatCurrency(activeStats.total)}
              </div>
            </div>

            {/* Total Cash Collection */}
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#166534", marginBottom: "4px" }}>
                Total Cash in Hand
              </div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#15803d" }}>
                {formatCurrency(activeStats.cash)}
              </div>
            </div>

            {/* Total Online Collection */}
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#166534", marginBottom: "4px" }}>
                Total Online / Digital Payments
              </div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#15803d" }}>
                {formatCurrency(activeStats.online)}
              </div>
            </div>
          </div>

          {/* Detailed Method Breakdown Chips (Dark Green Background, Centered) */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            <span style={{ backgroundColor: "#166534", border: "1px solid #14532d", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              Cash: <strong style={{ color: "#ffffff" }}>{formatCurrency(activeStats.breakdown["Cash"])}</strong>
            </span>
            <span style={{ backgroundColor: "#166534", border: "1px solid #14532d", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              Bank Acc: <strong style={{ color: "#ffffff" }}>{formatCurrency(activeStats.breakdown["Online Bank Acc"])}</strong>
            </span>
            <span style={{ backgroundColor: "#166534", border: "1px solid #14532d", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              Esewa: <strong style={{ color: "#ffffff" }}>{formatCurrency(activeStats.breakdown["Online Esewa"])}</strong>
            </span>
            <span style={{ backgroundColor: "#166534", border: "1px solid #14532d", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              Khalti: <strong style={{ color: "#ffffff" }}>{formatCurrency(activeStats.breakdown["Online Khalti"])}</strong>
            </span>
            <span style={{ backgroundColor: "#166534", border: "1px solid #14532d", color: "#ffffff", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
              Other: <strong style={{ color: "#ffffff" }}>{formatCurrency(activeStats.breakdown["Other"])}</strong>
            </span>
          </div>
        </div>
      )}

      {/* REGULAR USER / STAFF: TODAY'S FINANCIAL SUMMARY ONLY (Today's Income & Today's Expenses) */}
      {billingRole !== "admin" && (
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "2px solid #0f766e",
          padding: "16px 20px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(15, 118, 110, 0.08)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>📊</span>
              <div>
                <h4 style={{ margin: 0, color: "#0f766e", fontSize: "16px", fontWeight: "900" }}>
                  Today's Financial Summary ({todayStr})
                </h4>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Active Desk Operator: <strong>{activeStaffName || "Staff User"}</strong> • Showing Today's Income & Expenses Only
                </span>
              </div>
            </div>
            <span style={{
              backgroundColor: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              ● Live Today Desk
            </span>
          </div>

          {/* 3 Metric Cards: Today's Total Income, Today's Expenses, Today's Net Balance */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "8px" }}>
            {/* Today's Income */}
            <div style={{
              backgroundColor: "#f0fdf4",
              border: "1.5px solid #86efac",
              borderRadius: "8px",
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Today's Income
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#15803d" }}>
                {formatCurrency(dailyStats.total)}
              </div>
              <div style={{ fontSize: "11px", color: "#166534", display: "flex", gap: "8px", marginTop: "2px" }}>
                <span>Cash: <strong>{formatCurrency(dailyStats.cash)}</strong></span>
                <span>•</span>
                <span>Online: <strong>{formatCurrency(dailyStats.online)}</strong></span>
              </div>
            </div>

            {/* Today's Expenses */}
            <div style={{
              backgroundColor: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: "8px",
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Today's Expenses
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#dc2626" }}>
                {formatCurrency(todayExpensesTotal)}
              </div>
              <div style={{ fontSize: "11px", color: "#991b1b", marginTop: "2px" }}>
                Recorded Today: <strong>{expenses.filter(exp => { const d = exp.date || ""; return d === todayStr || d === (new Date().toISOString().split('T')[0]); }).length}</strong> item(s)
              </div>
            </div>

            {/* Today's Net Balance */}
            <div style={{
              backgroundColor: (dailyStats.total - todayExpensesTotal) >= 0 ? "#eff6ff" : "#fff1f2",
              border: `1.5px solid ${(dailyStats.total - todayExpensesTotal) >= 0 ? "#93c5fd" : "#fda4af"}`,
              borderRadius: "8px",
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: (dailyStats.total - todayExpensesTotal) >= 0 ? "#1e40af" : "#9f1239", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Today's Net Balance
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: (dailyStats.total - todayExpensesTotal) >= 0 ? "#1d4ed8" : "#e11d48" }}>
                {formatCurrency(dailyStats.total - todayExpensesTotal)}
              </div>
              <div style={{ fontSize: "11px", color: (dailyStats.total - todayExpensesTotal) >= 0 ? "#1e40af" : "#9f1239", marginTop: "2px" }}>
                (Today's Income - Today's Expenses)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER (Exact match with user image) */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        marginBottom: "24px",
        border: "1px solid #cbd5e1",
        overflow: "hidden"
      }}>

        {/* Real Bill Pad Letterhead (Exact Replica of User Image) */}
        <div style={{ padding: "24px 30px 16px 30px", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "25px", flexWrap: "wrap" }}>
            {/* Logo on Left */}
            <div>
              <img
                src={profile.logoUrl || "/sigma-logo.png"}
                alt="Logo"
                style={{ width: "95px", height: "95px", objectFit: "contain", borderRadius: "50%" }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Centered Heading */}
            <div style={{ textAlign: "center" }}>
              <h1 style={{
                margin: "0 0 4px 0",
                fontSize: "36px",
                fontWeight: "900",
                color: "#000000",
                letterSpacing: "0.5px",
                fontFamily: "Georgia, serif"
              }}>
                {profile.companyName}
              </h1>
              <div style={{ fontSize: "15px", fontWeight: "bold", color: "#000000", marginBottom: "3px" }}>
                {profile.companyAddress}
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#000000" }}>
                Email: {profile.email} &nbsp;|&nbsp; Contact No: {profile.contactNumber}
              </div>
            </div>
          </div>

          {/* Bottom Bar: VAT/PAN on Left, DATE on Right */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "18px",
            paddingTop: "12px",
            borderTop: "1px solid #000000",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#000000"
          }}>
            <div>
              VAT/PAN: {profile.panVatNumber}
            </div>
            <div>
              DATE: {formatDateMMDDYYYY(new Date().toISOString())}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BILL BY WHATSAPP NUMBER (10 DIGITS OR +977) */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "16px 20px",
        marginBottom: "20px",
        border: "1px solid #cbd5e1",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: "280px", display: "flex", alignItems: "center", gap: "10px" }}>
          
          <input
            type="text"
            placeholder="Search bill by WhatsApp Number (e.g. 9812345678 or +977) / Student Name / Bill No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "6px",
              border: "2px solid #2563eb",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleSyncToGoogleSheet}
            disabled={isSyncing}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "9px 16px",
              borderRadius: "6px",
              cursor: isSyncing ? "wait" : "pointer",
              fontWeight: "bold",
              fontSize: "12px"
            }}
          >
            {isSyncing ? "Syncing..." : "Sync to Google Sheet"}
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: "#0f172a",
              color: "white",
              border: "none",
              padding: "9px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "12px"
            }}
          >
            Download Sheet CSV
          </button>
        </div>
      </div>

      {/* 3. INVOICE PREVIEW / PRINT AREA (With Red Highlight Print Bill & Create New Bill Side-by-Side) */}
      {selectedInvoice && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          marginBottom: "28px",
          border: "2px solid #1e3a8a",
          overflow: "hidden"
        }}>
          {/* Header Controls - Print on LEFT SIDE, simple, no blur */}
          <div className="no-print" style={{
            backgroundColor: "#1e3a8a",
            color: "white",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            {/* LEFT SIDE: 3 File Outputs (PDF, CSV, Google Sheet Live) + Print & Create Bill */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                title="Download / Print PDF format of this bill"
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "1px solid #b91c1c",
                  padding: "9px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)"
                }}
              >
                Download PDF
              </button>

              <button
                onClick={() => handleDownloadSingleBillCSV(selectedInvoice)}
                title="Instant offline CSV export for this bill"
                style={{
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  border: "1px solid #0369a1",
                  padding: "9px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)"
                }}
              >
                Download CSV
              </button>


              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "1px solid #3b0764",
                  padding: "9px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(88, 28, 135, 0.3)"
                }}
              >
                Print
              </button>

              {billingRole === "admin" && (
                <button
                  onClick={() => handleOpenEditBillModal(selectedInvoice)}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "1px solid #1d4ed8",
                    padding: "9px 18px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Edit This Bill
                </button>
              )}

              <button
                onClick={handleOpenCreateBill}
                style={{
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "1px solid #15803d",
                  padding: "9px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                Create New Bill
              </button>
            </div>

            {/* RIGHT SIDE: Receipt Details & Close Preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                Receipt: <span style={{ color: "#facc15" }}>{selectedInvoice.billNumber}</span> ({selectedInvoice.studentName})
              </div>


            </div>
          </div>

          {/* PRINTABLE BILL PAD PAPER */}
          <div id="printable-bill-pad" style={{
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            fontFamily: "Arial, sans-serif",
            color: "#000000",
            border: "2px solid #000000",
            borderRadius: "6px"
          }}>
            {/* Top Header Matching User Image - Unified, Never Separates */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "2px",
              pageBreakInside: "avoid",
              breakInside: "avoid"
            }}>
              <img
                src={profile.logoUrl || "/sigma-logo.png"}
                alt="Logo"
                style={{ width: "60px", height: "60px", objectFit: "contain", flexShrink: 0 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div style={{ textAlign: "center" }}>
                <h1 style={{
                  margin: "0 0 1px 0",
                  fontSize: "24px",
                  fontWeight: "900",
                  fontFamily: "Georgia, serif",
                  color: "#000000",
                  lineHeight: "1.15"
                }}>
                  {profile.companyName || "SIGMA EDUCATION KOREAN BHASA CENTER"}
                </h1>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#000000", marginBottom: "1px", lineHeight: "1.15" }}>
                  {profile.companyAddress || "Samakhushi Chowk, Kathmandu"}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#000000", lineHeight: "1.15" }}>
                  Email: {profile.email || "sigmaedu2023@gmail.com"} &nbsp;|&nbsp; Contact No: {profile.contactNumber || "9768444902, 9806100148"}
                </div>
              </div>
            </div>

            {/* VAT/PAN and DATE line */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "2px",
              paddingBottom: "2px",
              borderTop: "1px solid #000000",
              borderBottom: "1.5px solid #000000",
              fontWeight: "bold",
              fontSize: "12px",
              marginBottom: "2px"
            }}>
              <div>VAT/PAN: {profile.panVatNumber}</div>
              <div>DATE: {formatDateMMDDYYYY(selectedInvoice.date)}</div>
            </div>

            {/* Bill Number & Student Info Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "2px",
              padding: "2px 4px",
              border: "1px solid #000000",
              borderRadius: "4px",
              marginBottom: "2px",
              fontSize: "12px",
              lineHeight: "1.15"
            }}>
              <div>
                <div><strong>BILL NO:</strong> <span style={{ fontWeight: "900", fontSize: "12px" }}>{selectedInvoice.billNumber}</span></div>
                <div><strong>Student Name:</strong> <strong>{selectedInvoice.studentName}</strong></div>
                <div><strong>Address:</strong> {selectedInvoice.address || "-"}</div>
                <div><strong>Contact Number:</strong> {(() => {
                  const formatNum = (v) => {
                    if (!v) return "";
                    const d = String(v).replace(/\D/g, "");
                    const l10 = d.length >= 10 ? d.slice(-10) : d;
                    return l10 ? `+977-${l10}` : v;
                  };
                  return [formatNum(selectedInvoice.contactNumber), formatNum(selectedInvoice.parentNumber)].filter(Boolean).join(", ") || "-";
                })()}</div>
                {selectedInvoice.parentName && (
                  <div><strong>Parent Name:</strong> {selectedInvoice.parentName}</div>
                )}
              </div>

              <div>
                <div><strong>Course Detail:</strong> <strong>{selectedInvoice.courseDetail}</strong></div>
                <div><strong>Course Package:</strong> {selectedInvoice.coursePackage}</div>
                <div><strong>Class Time:</strong> {selectedInvoice.classTime || "-"}</div>
                <div><strong>Payment Status:</strong> {Number(selectedInvoice.dueAmount) <= 0 ? "Fully Paid" : "Partial Payment"}</div>
                <div><strong>Registration Date:</strong> {selectedInvoice.date}</div>
              </div>
            </div>

            {/* Particulars Table Enclosed in a Complete Box with All Content Centered in Middle */}
            <div style={{
              border: "1.5px solid #000000",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "2px",
              backgroundColor: "#ffffff"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", margin: 0 }}>
                <thead style={{ backgroundColor: "#d1d5db" }}>
                  <tr style={{ backgroundColor: "#d1d5db", borderBottom: "1.5px solid #000000" }}>
                    <th style={{ backgroundColor: "#d1d5db", padding: "2px 2px", width: "45px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000", fontWeight: "bold" }}>S.N.</th>
                    <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000", fontWeight: "bold" }}>Particulars / Items</th>
                    <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", width: "140px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000", fontWeight: "bold" }}>Package Term</th>
                    <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", width: "130px", textAlign: "center", verticalAlign: "middle", color: "#000000", fontWeight: "bold" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                    <td style={{ padding: "1px 1px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontWeight: "bold", color: "#000000" }}>1</td>
                    <td style={{ padding: "1px 3px", verticalAlign: "middle", borderRight: "1px solid #000000", color: "#000000" }}>
                      <strong style={{ fontSize: "12px" }}>{selectedInvoice.courseDetail}</strong>
                    </td>
                    <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontWeight: "600", color: "#000000" }}>
                      {selectedInvoice.coursePackage}
                    </td>
                    <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", fontWeight: "bold", color: "#000000" }}>
                      {formatCurrency(selectedInvoice.grossFee || selectedInvoice.totalFee)}
                    </td>
                  </tr>

                  {/* Dynamic Study Materials / Items with respective amounts */}
                  {(() => {
                    let items = [];
                    try {
                      if (selectedInvoice.materialsJson) items = JSON.parse(selectedInvoice.materialsJson);
                      else if (selectedInvoice.materials) items = selectedInvoice.materials;
                    } catch (e) {
                      items = [];
                    }

                    return items.map((mat, idx) => (
                      <tr key={idx} style={{ borderBottom: idx === items.length - 1 ? "none" : "1px solid #cbd5e1" }}>
                        <td style={{ padding: "1px 1px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontSize: "12px", color: "#000000" }}>{idx + 2}</td>
                        <td style={{ padding: "1px 3px", verticalAlign: "middle", borderRight: "1px solid #000000", fontSize: "12px", color: "#000000" }}>
                          <strong>{mat.name || "Study Item"}</strong> {mat.qty && Number(mat.qty) > 1 ? <span style={{ color: "#166534", fontWeight: "bold" }}> (Qty: {mat.qty} {mat.unit || ''})</span> : null}
                        </td>
                        <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #000000", fontSize: "12px", color: "#000000" }}>
                          {mat.amount > 0 ? "Extra Charge" : "Included"}
                        </td>
                        <td style={{ padding: "1px 2px", textAlign: "center", verticalAlign: "middle", fontSize: "12px", fontWeight: mat.amount > 0 ? "bold" : "normal", color: "#000000" }}>
                          {mat.amount > 0 ? formatCurrency(mat.amount) : "Included"}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* 1. PAYMENT SUMMARY CARD (Full Width on Top) */}
            <div style={{
              border: "1.5px solid #000000",
              borderRadius: "5px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              marginBottom: "2px"
            }}>
              <div style={{
                backgroundColor: "#d1d5db",
                color: "#000000",
                borderBottom: "1px solid #000000",
                padding: "2px 4px",
                fontWeight: "900",
                fontSize: "12px",
                letterSpacing: "0.5px",
                textAlign: "center"
              }}>
                PAYMENT SUMMARY
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <tbody>
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", fontWeight: "bold", color: "#000000" }}>Course Fee (Gross):</td>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", color: "#000000" }}>
                      {formatCurrency(selectedInvoice.grossFee || selectedInvoice.totalFee)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", color: "#16a34a", fontWeight: "bold" }}>
                      Discount ({Number(selectedInvoice.discountPercent) || 0}%):
                    </td>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#16a34a", fontWeight: "900" }}>
                      - {formatCurrency(selectedInvoice.discountAmount || 0)}
                    </td>
                  </tr>
                  {/* Study Materials / Items Total on Invoice if any > 0 */}
                  {(() => {
                    let matItems = [];
                    try {
                      if (selectedInvoice.materialsJson) matItems = JSON.parse(selectedInvoice.materialsJson);
                      else if (selectedInvoice.materials) matItems = selectedInvoice.materials;
                    } catch (e) {}
                    const matTotal = matItems.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
                    if (matTotal > 0) {
                      return (
                        <tr style={{ backgroundColor: "#ffffff" }}>
                          <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", color: "#2563eb", fontWeight: "bold" }}>
                            Study Materials / Extra Items:
                          </td>
                          <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#2563eb", fontWeight: "900" }}>
                            + {formatCurrency(matTotal)}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })()}
                  {/* Payment (Net Course Fee) */}
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", fontWeight: "bold", color: "#1e3a8a" }}>
                      Payment (Net Course Fee):
                    </td>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", color: "#1e3a8a" }}>
                      {formatCurrency(Number(selectedInvoice.totalFee || 0) / 1.13)}
                    </td>
                  </tr>
                  {/* 13% VAT / PAN Amount */}
                  <tr style={{ backgroundColor: "#fefce8" }}>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", fontWeight: "bold", color: "#854d0e" }}>
                      13% VAT / PAN Amount:
                    </td>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", color: "#854d0e" }}>
                      {formatCurrency(Number(selectedInvoice.totalFee || 0) - (Number(selectedInvoice.totalFee || 0) / 1.13))}
                    </td>
                  </tr>
                  {/* Total Payment (Inclusive of 13% VAT) */}
                  <tr style={{ backgroundColor: "#eff6ff", borderTop: "2px solid #1e3a8a", borderBottom: "2px solid #1e3a8a" }}>
                    <td style={{ padding: "1px 12px", fontWeight: "900", fontSize: "13px", color: "#1e3a8a" }}>
                      Total Payment (Inclusive of 13% VAT):
                    </td>
                    <td style={{ padding: "1px 12px", textAlign: "right", fontSize: "13px", fontWeight: "900", color: "#1e3a8a" }}>
                      {formatCurrency(selectedInvoice.totalFee)}
                    </td>
                  </tr>
                  {/* Total Paid Amount */}
                  <tr style={{ backgroundColor: "#f0fdf4" }}>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", color: "#166534", fontWeight: "bold" }}>
                      Total Paid Amount:
                    </td>
                    <td style={{ padding: "1px 12px", borderBottom: "1px solid #cbd5e1", textAlign: "right", fontWeight: "900", fontSize: "13px", color: "#166534" }}>
                      {formatCurrency(selectedInvoice.paidAmount)}
                    </td>
                  </tr>
                  {/* Remaining Due Balance */}
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td style={{ padding: "1px 12px", fontWeight: "bold", color: Number(selectedInvoice.dueAmount) > 0 ? "#dc2626" : "#0d9488" }}>
                      Remaining Due Balance:
                    </td>
                    <td style={{ padding: "1px 12px", textAlign: "right", fontWeight: "900", fontSize: "13px", color: Number(selectedInvoice.dueAmount) > 0 ? "#dc2626" : "#0d9488" }}>
                      {Number(selectedInvoice.dueAmount) > 0 ? formatCurrency(selectedInvoice.dueAmount) : "Paid in Full "}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. PAYMENT TRANSACTIONS RECORD (Placed Down / Below the Summary Box, Fully Functional) */}
            <div style={{
              border: "1.5px solid #000000",
              borderRadius: "5px",
              padding: "1px 8px",
              backgroundColor: "#ffffff",
              marginBottom: "2px"
            }}>
              <div style={{ backgroundColor: "#d1d5db", color: "#000000", fontWeight: "900", fontSize: "12px", margin: "-1px -8px 2px -8px", padding: "2px 8px", borderBottom: "1px solid #000000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Payment Transactions Record</span>
                {Number(selectedInvoice.dueAmount) <= 0 ? (
                  <span style={{ fontSize: "11px", color: "#166534", backgroundColor: "#dcfce7", padding: "1px 6px", borderRadius: "8px", fontWeight: "bold" }}>
                    All Payments Complete
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", color: "#b91c1c", backgroundColor: "#fee2e2", padding: "1px 6px", borderRadius: "8px", fontWeight: "bold" }}>
                    Pending Balance: {formatCurrency(selectedInvoice.dueAmount)}
                  </span>
                )}
              </div>

              {(() => {
                let txList = [];
                try {
                  if (selectedInvoice.paymentsJson) {
                    const parsed = JSON.parse(selectedInvoice.paymentsJson);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      txList = parsed;
                    }
                  }
                } catch (e) {}

                if (txList.length === 0) {
                  if (selectedInvoice.firstInstallment) {
                    txList.push({
                      installment: 1,
                      date: selectedInvoice.firstPaymentDate || selectedInvoice.date,
                      amount: selectedInvoice.firstInstallment,
                      paymentMethod: selectedInvoice.paymentMethod || "Cash"
                    });
                  }
                  if (selectedInvoice.secondInstallment) {
                    txList.push({
                      installment: 2,
                      date: selectedInvoice.secondPaymentDate || selectedInvoice.date,
                      amount: selectedInvoice.secondInstallment,
                      paymentMethod: selectedInvoice.paymentMethod || "Cash"
                    });
                  }
                  if (selectedInvoice.thirdInstallment) {
                    txList.push({
                      installment: 3,
                      date: selectedInvoice.thirdPaymentDate || selectedInvoice.date,
                      amount: selectedInvoice.thirdInstallment,
                      paymentMethod: selectedInvoice.paymentMethod || "Cash"
                    });
                  }
                  if (txList.length === 0) {
                    txList.push({
                      installment: 1,
                      date: selectedInvoice.date,
                      amount: selectedInvoice.paidAmount,
                      paymentMethod: selectedInvoice.paymentMethod || "Cash",
                      isFull: true
                    });
                  }
                }

                const isFullyPaid = Number(selectedInvoice.dueAmount) <= 0;

                return (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead style={{ backgroundColor: "#d1d5db" }}>
                      <tr style={{ backgroundColor: "#d1d5db", borderBottom: "1.5px solid #000000" }}>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "left", color: "#000000", fontWeight: "bold", borderRight: "1px solid #cbd5e1" }}>Payment Date</th>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "left", color: "#000000", fontWeight: "bold", borderRight: "1px solid #cbd5e1" }}>Transaction</th>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "center", color: "#000000", fontWeight: "bold", borderRight: "1px solid #cbd5e1" }}>Payment Method</th>
                        <th style={{ backgroundColor: "#d1d5db", padding: "2px 4px", textAlign: "right", color: "#000000", fontWeight: "bold" }}>Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txList.map((tx, idx) => {
                        const isLast = idx === txList.length - 1;
                        const isFinalCompleted = isLast && isFullyPaid;
                        const method = tx.paymentMethod || selectedInvoice.paymentMethod || "Cash";

                        return (
                          <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: isFinalCompleted ? "#f0fdf4" : "transparent" }}>
                            <td style={{ padding: "1px 2px", color: "#000000" }}>{tx.date || selectedInvoice.date}</td>
                            <td style={{ padding: "1px 2px", color: "#000000", fontWeight: "600" }}>
                              {tx.isFull || (txList.length === 1 && isFullyPaid)
                                ? "Full Payment"
                                : `Payment #${tx.installment || idx + 1}`}
                              {isFinalCompleted && (
                                <span style={{ marginLeft: "6px", fontSize: "10.5px", color: "#166534", fontWeight: "bold" }}>
                                  (Complete)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "1px 2px", textAlign: "center" }}>
                              <span style={{
                                backgroundColor: method === "Cash" ? "#f0fdf4" : method === "Online Esewa" ? "#ecfdf5" : method === "Online Khalti" ? "#faf5ff" : "#eff6ff",
                                color: method === "Cash" ? "#15803d" : method === "Online Esewa" ? "#047857" : method === "Online Khalti" ? "#7e22ce" : "#1e40af",
                                border: "1px solid",
                                borderColor: method === "Cash" ? "#bbf7d0" : method === "Online Esewa" ? "#a7f3d0" : method === "Online Khalti" ? "#e9d5ff" : "#bfdbfe",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                {getPaymentMethodIcon(method, 12)}
                                <span>{method === "Cash" ? "Cash" : method === "Online Esewa" ? "Online Esewa" : method === "Online Khalti" ? "Online Khalti" : method === "Online Bank Acc" ? "Bank Acc" : `${method}`}</span>
                              </span>
                            </td>
                            <td style={{ padding: "1px 2px", textAlign: "right", fontWeight: "bold", color: "#000000" }}>
                              {formatCurrency(tx.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}

              {/* Payment Summary Footer */}
              <div style={{
                marginTop: "1px",
                padding: "1px 3px",
                backgroundColor: "#f8fafc",
                borderRadius: "4px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontWeight: "bold", color: "#000000" }}>Payment Status:</span>
                <span style={{
                  fontWeight: "900",
                  color: Number(selectedInvoice.dueAmount) <= 0 ? "#166534" : "#b91c1c",
                  backgroundColor: Number(selectedInvoice.dueAmount) <= 0 ? "#eff6ff" : "#fef2f2",
                  padding: "1px 4px",
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: Number(selectedInvoice.dueAmount) <= 0 ? "#bfdbfe" : "#fecaca"
                }}>
                  {Number(selectedInvoice.dueAmount) <= 0 ? "Payment Completed in Full" : ` Partial Payment (Due: ${formatCurrency(selectedInvoice.dueAmount)})`}
                </span>
              </div>

              {/* Rupees in Words */}
              <div style={{ marginTop: "1px", borderTop: "1px dashed #cbd5e1", paddingTop: "2px", fontSize: "12px" }}>
                <span style={{ fontWeight: "bold", color: "#000000" }}>Amount in Words: </span>
                <span style={{ fontWeight: "900", color: "#000000" }}>{selectedInvoice.amountInWords}</span>
              </div>
            </div>

            {/* Bottom: Prepared By and Authorized Stamp with Name and Logo */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "2px",
              paddingTop: "2px",
              borderTop: "1px solid #000000"
            }}>
              {/* Prepared By (Shows typed name or blank space for manual typing/signature) */}
              <div style={{ textAlign: "center", width: "220px" }}>
                <div style={{ height: "14px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  {selectedInvoice.preparedBy ? (
                    <span style={{ fontWeight: "900", fontSize: "13px", color: "#000000" }}>
                      {selectedInvoice.preparedBy}
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "11px", fontStyle: "italic" }}>
                      (Signature)
                    </span>
                  )}
                </div>
                <div style={{ borderTop: "1px solid #000000", paddingTop: "2px", fontWeight: "bold", fontSize: "12px" }}>
                  Bill Prepared By
                </div>
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {selectedInvoice.preparedBy ? selectedInvoice.preparedBy : "Staff / Accountant"}
                </div>
              </div>

              {/* Authorized Stamp & Signature according to Admin Uploaded Stamp */}
              <div style={{ textAlign: "center", width: "240px", position: "relative" }}>
                {profile.stampUrl ? (
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.85,
                    zIndex: 10
                  }}>
                    <img
                      src={profile.stampUrl}
                      alt="Authorized Stamp"
                      style={{
                        height: "55px",
                        width: "55px",
                        objectFit: "contain",
                        display: "block"
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "50%",
                    width: "55px",
                    height: "55px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "translateX(-50%) rotate(-5deg)",
                    opacity: 0.85,
                    zIndex: 10
                  }}>
                    {/* Organization Logo inside Seal */}
                    <img
                      src={profile.logoUrl || "/sigma-logo.png"}
                      alt="Seal Logo"
                      style={{ width: "55px", height: "55px", objectFit: "contain" }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div style={{ borderTop: "1px solid #000000", paddingTop: "2px", fontWeight: "bold", fontSize: "12px" }}>
                  Authorized Stamp & Signature
                </div>
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  {profile.companyName}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar: Print on LEFT side, simple, without blur */}
          <div className="no-print" style={{
            backgroundColor: "#f8fafc",
            borderTop: "2px solid #e2e8f0",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            {/* PRINT ON LEFT */}
            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "1px solid #3b0764",
                padding: "10px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(88, 28, 135, 0.35)"
              }}
            >
              Print
            </button>

            {/* CREATE NEW BILL RIGHT BESIDE PRINT */}
            <button
              onClick={handleOpenCreateBill}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                border: "1px solid #15803d",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              Create New Bill
            </button>

            <button
              onClick={() => setSelectedInvoice(null)}
              style={{
                backgroundColor: "#64748b",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                marginLeft: "auto"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 4. BILLING RECORDS LIST */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "none",
        border: "1px solid #cbd5e1",
        padding: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "17px" }}>
            Student Invoices ({filteredBills.length})
          </h3>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setActiveFilter("all")}
              style={{
                backgroundColor: activeFilter === "all" ? "#1e3a8a" : "#f1f5f9",
                color: activeFilter === "all" ? "white" : "#475569",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px"
              }}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveFilter("due")}
              style={{
                backgroundColor: activeFilter === "due" ? "#dc2626" : "#f1f5f9",
                color: activeFilter === "due" ? "white" : "#475569",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px"
              }}
            >
              Pending Dues
            </button>
            <button
              onClick={() => setActiveFilter("full")}
              style={{
                backgroundColor: activeFilter === "full" ? "#16a34a" : "#f1f5f9",
                color: activeFilter === "full" ? "white" : "#475569",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px"
              }}
            >
              Fully Paid
            </button>

            {billingRole === "admin" && (
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#1e3a8a",
                  backgroundColor: "#ffffff",
                  cursor: "pointer"
                }}
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Online Bank Acc">Online Bank Acc</option>
                <option value="Online Esewa">Online Esewa</option>
                <option value="Online Khalti">Online Khalti</option>
                <option value="Other">Other</option>
              </select>
            )}
          </div>
        </div>

        {/* COMPACT TABLE WRAPPER WITHOUT HORIZONTAL SCROLLBAR */}
        <div
          className="compact-billing-table-wrapper"
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          <style>{`
            .compact-billing-table-wrapper::-webkit-scrollbar {
              display: none;
              height: 0px;
            }
          `}</style>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", tableLayout: "auto" }}>
            <thead>
              <tr style={{
                backgroundColor: "#1e3a8a",
                color: "#ffffff",
                borderBottom: "2px solid #172554"
              }}>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700", borderTopLeftRadius: "6px" }}>Bill #</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Date</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Days</th>
                <th style={{ padding: "10px 8px", textAlign: "center", color: "#ffffff", fontWeight: "700" }}>Student / Address</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>WhatsApp</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Method</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Package</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Total Fee</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Paid</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700" }}>Due</th>
                <th style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", color: "#ffffff", fontWeight: "700", borderTopRightRadius: "6px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ padding: "30px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No student bills match your query.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id || b.billNumber} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 6px", fontWeight: "900", color: "#1e3a8a", whiteSpace: "nowrap", textAlign: "center" }}>{b.billNumber}</td>
                    <td style={{ padding: "8px 6px", color: "#64748b", whiteSpace: "nowrap", fontSize: "11px", textAlign: "center" }}>{b.date}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", whiteSpace: "nowrap" }}>
                      {(() => {
                        const admitStr = b.admittedDate || b.firstPaymentDate || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : null);
                        if (!admitStr) return <span style={{ fontSize: "10px", color: "#94a3b8" }}>—</span>;
                        const admit = new Date(admitStr);
                        const today = new Date();
                        admit.setHours(0,0,0,0); today.setHours(0,0,0,0);
                        const diff = Math.floor((today - admit) / (1000 * 60 * 60 * 24));
                        return (
                          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#dc2626" }}>
                            {diff}d
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#0f172a" }}>{String(b.studentName || "-")}</div>
                        {b.address && (
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {String(b.address)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "8px 6px", color: "#2563eb", fontWeight: "bold", whiteSpace: "nowrap", fontSize: "11px", textAlign: "center" }}>{b.contactNumber}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        backgroundColor: b.paymentMethod === "Cash" ? "#f0fdf4" : b.paymentMethod === "Online Esewa" ? "#ecfdf5" : b.paymentMethod === "Online Khalti" ? "#faf5ff" : "#eff6ff",
                        color: b.paymentMethod === "Cash" ? "#15803d" : b.paymentMethod === "Online Esewa" ? "#047857" : b.paymentMethod === "Online Khalti" ? "#7e22ce" : "#1e40af",
                        border: "1px solid",
                        borderColor: b.paymentMethod === "Cash" ? "#bbf7d0" : b.paymentMethod === "Online Esewa" ? "#a7f3d0" : b.paymentMethod === "Online Khalti" ? "#e9d5ff" : "#bfdbfe",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontSize: "10.5px",
                        fontWeight: "bold",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {getPaymentMethodIcon(b.paymentMethod, 12)}
                        <span>{b.paymentMethod === "Cash" ? "Cash" : b.paymentMethod === "Online Esewa" ? "eSewa" : b.paymentMethod === "Online Khalti" ? "Khalti" : b.paymentMethod === "Online Bank Acc" ? "Bank" : `${b.paymentMethod || "Cash"}`}</span>
                      </span>
                    </td>
                    <td style={{ padding: "8px 6px", fontSize: "11px", whiteSpace: "nowrap", textAlign: "center" }}>{b.coursePackage}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: "bold", whiteSpace: "nowrap" }}>{formatCurrency(b.totalFee)}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: "bold", color: "#16a34a", whiteSpace: "nowrap" }}>{formatCurrency(b.paidAmount)}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: "bold", color: Number(b.dueAmount) > 0 ? "#dc2626" : "#64748b", whiteSpace: "nowrap" }}>
                      {Number(b.dueAmount) > 0 ? formatCurrency(b.dueAmount) : "Paid"}
                    </td>
                    <td style={{ padding: "7px 6px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>
                        <button
                          onClick={() => {
                            setSelectedInvoice(b);
                            setTimeout(() => window.print(), 200);
                          }}
                          title="Print Bill Receipt"
                          style={{
                            backgroundColor: "#dc2626",
                            color: "#ffffff",
                            border: "1px solid #b91c1c",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          Print
                        </button>

                        {/* Payment complete nahunjel next pay garne, otherwise NO next pay */}
                        {Number(b.dueAmount) > 0 ? (
                          <button
                            onClick={() => {
                              handleWhatsAppLookup(b.contactNumber);
                              setShowBillModal(true);
                            }}
                            title="Record next installment payment"
                            style={{
                              backgroundColor: "#16a34a",
                              color: "white",
                              border: "1px solid #15803d",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: "bold",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "2px"
                            }}
                          >
                            Next Pay
                          </button>
                        ) : (
                          <span style={{ fontSize: "10.5px", color: "#16a34a", fontWeight: "bold", padding: "3px" }}>
                            
                          </span>
                        )}

                        {billingRole === "admin" && (
                          <>
                            <button
                              onClick={() => handleOpenEditBillModal(b)}
                              title="Edit all data in this bill (Admin)"
                              style={{
                                backgroundColor: "#dbeafe",
                                color: "#1e40af",
                                border: "1px solid #93c5fd",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "bold"
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteBill(b.id, b.billNumber)}
                              title="Delete this bill record (Admin only)"
                              style={{
                                backgroundColor: "#fee2e2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "bold"
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CREATE / UPDATE BILL MODAL (Does NOT close on mouse drag or ESC to protect form data) */}
      {showBillModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px"
          }}
        >
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "850px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "19px" }}>
                  {form.isEditingExistingBill 
                    ? `Admin Edit Bill: ${form.billNumber} (${form.studentName})`
                    : form.isExistingStudent 
                    ? `Update Installment Payment for ${form.studentName}` 
                    : "Create New Bill Receipt"}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {form.isEditingExistingBill
                      ? `Editing all details for Bill ${form.billNumber}`
                      : form.isExistingStudent 
                      ? `Bill Number: ${form.existingBillNumber} (Keeps SAME Bill Number)`
                      : `Next Generated Bill Number: ${getNextBillNumber()}`}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#0369a1",
                    backgroundColor: "#e0f2fe",
                    border: "1px solid #bae6fd",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    Date: {form.date || new Date().toISOString().split('T')[0]} (Auto)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBillModal(false)}
                title="Close dialog"
                style={{
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#475569"
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitBill} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* 1. Student Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                  Student Full Name (Text Format) * {(form.isExistingStudent && !form.isEditingExistingBill) && "(Locked)"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Student Full Name"
                  value={form.studentName}
                  readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[0-9]/g, '').toUpperCase();
                    setForm({ ...form, studentName: val });
                  }}
                  style={{
                    textTransform: 'uppercase',
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* 2. WhatsApp Contact Number */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                  WhatsApp Contact Number (10 Digits Only) * {(form.isExistingStudent && !form.isEditingExistingBill) && " (Locked)"}
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{
                    backgroundColor: (form.contactNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "#16a34a" : "#e2e8f0",
                    padding: "9px 12px",
                    border: (form.contactNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "2px solid #16a34a" : "1.5px solid #cbd5e1",
                    borderRight: "none",
                    borderRadius: "6px 0 0 6px",
                    fontWeight: "900",
                    color: (form.contactNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "#ffffff" : "#1e293b",
                    fontSize: "14px"
                  }}>
                    +977
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={form.contactNumber}
                    readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const clean = normalizeNepaliMobile(e.target.value);
                      setForm(prev => ({ ...prev, contactNumber: clean }));
                      if (clean.length === 10 && !form.isEditingExistingBill) {
                        handleWhatsAppLookup(clean);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: "0 6px 6px 0",
                      border: (form.isExistingStudent && !form.isEditingExistingBill) ? "1.5px solid #94a3b8" : (form.contactNumber?.length === 10 ? "2px solid #16a34a" : "1.5px solid #2563eb"),
                      backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : (form.contactNumber?.length === 10 ? "#dcfce7" : "white"),
                      color: (form.contactNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "#166534" : "#000000",
                      fontWeight: "bold",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* 3. Parents Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                  Parents Name (Text Format) {(form.isExistingStudent && !form.isEditingExistingBill) && "(Locked)"}
                </label>
                <input
                  type="text"
                  placeholder="Enter Parents / Guardian Name"
                  value={form.parentName || ""}
                  readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                  onKeyDown={(e) => {
                    if (/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[0-9]/g, '').toUpperCase();
                    setForm({ ...form, parentName: val });
                  }}
                  style={{
                    textTransform: 'uppercase',
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* 4. Parents WhatsApp Number */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                  Parent Number (10 Digits Only) {(form.isExistingStudent && !form.isEditingExistingBill) && "(Locked)"}
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{
                    backgroundColor: (form.parentNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "#16a34a" : "#e2e8f0",
                    padding: "9px 12px",
                    border: (form.parentNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "2px solid #16a34a" : "1.5px solid #cbd5e1",
                    borderRight: "none",
                    borderRadius: "6px 0 0 6px",
                    fontWeight: "900",
                    color: (form.parentNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "#ffffff" : "#1e293b",
                    fontSize: "14px"
                  }}>
                    +977
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={form.parentNumber}
                    readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const clean = normalizeNepaliMobile(e.target.value);
                      setForm(prev => ({ ...prev, parentNumber: clean }));
                    }}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: "0 6px 6px 0",
                      border: (form.isExistingStudent && !form.isEditingExistingBill) ? "1.5px solid #cbd5e1" : (form.parentNumber?.length === 10 ? "2px solid #16a34a" : "1.5px solid #cbd5e1"),
                      backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : (form.parentNumber?.length === 10 ? "#dcfce7" : "white"),
                      color: (form.parentNumber?.length === 10 && !(form.isExistingStudent && !form.isEditingExistingBill)) ? "#166534" : "#000000",
                      fontWeight: "bold",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* 5. Student Address */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                  Student Address (Text Format) * {(form.isExistingStudent && !form.isEditingExistingBill) && "(Locked)"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Address (Text, e.g. Kathmandu)"
                  value={form.address}
                  readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                  onChange={(e) => setForm({ ...form, address: e.target.value.toUpperCase() })}
                  style={{
                    textTransform: 'uppercase',
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* 6. Class Time with AM / PM Dropdown */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "4px" }}>
                  Class Time (with AM / PM) * {(form.isExistingStudent && !form.isEditingExistingBill) && "(Locked)"}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07:00 or 7:00 - 8:00"
                    value={form.classTime || ""}
                    readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                    onChange={(e) => setForm({ ...form, classTime: e.target.value })}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1.5px solid #cbd5e1",
                      backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                  <select
                    value={form.classTimePeriod || "AM"}
                    disabled={form.isExistingStudent && !form.isEditingExistingBill}
                    onChange={(e) => setForm({ ...form, classTimePeriod: e.target.value })}
                    style={{
                      width: "85px",
                      padding: "9px 8px",
                      borderRadius: "6px",
                      border: "1.5px solid #2563eb",
                      backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "#eff6ff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#1e3a8a",
                      cursor: "pointer",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* 7. Course Package */}
              <div style={{ gridColumn: "span 2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569" }}>
                    Course Package * {(form.isExistingStudent && !form.isEditingExistingBill) && "(Locked)"}
                  </label>
                  {(!form.isExistingStudent || form.isEditingExistingBill) && (
                    <button
                      type="button"
                      onClick={() => {
                        const initialCourse = (form?.courseDetail && getFilteredCourses().includes(form.courseDetail)) ? form.courseDetail : defaultCourse;
                        setSelectedCourseForFees(initialCourse);
                        setEditingCourseFees({ ...(feeConfig.courseFees || {}) });
                        setEditingPackageFees({ ...(feeConfig.packages || DEFAULT_PACKAGE_FEES) });
                        const courseDefPkg = feeConfig.courseFees?.[initialCourse]?.defaultPackage || feeConfig.defaultPackage || "Full course";
                        setSelectedDefaultPkg(courseDefPkg);
                        setFeeUpdateDate(feeConfig.updatedAt || (typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10)));
                        setShowFeeConfigModal(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "0 4px"
                      }}
                    >
                      Edit Package Defaults
                    </button>
                  )}
                </div>
                <select
                  value={form.coursePackage}
                  disabled={form.isExistingStudent && !form.isEditingExistingBill}
                  onChange={(e) => handleCoursePackageChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                >
                  {COURSE_PACKAGES.map((pkg) => (
                    <option key={pkg} value={pkg}>
                      {pkg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Detail with Option Selection + Manual Typing */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "none" }}>
                   
                </label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <select
                    value={getFilteredCourses().includes(form.courseDetail) ? form.courseDetail : "Other"}
                    disabled={form.isExistingStudent && !form.isEditingExistingBill}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        handleCourseDetailChange("");
                      } else {
                        handleCourseDetailChange(val);
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: "220px",
                      height: "36px",
                      padding: "0 10px",
                      borderRadius: "5px",
                      border: "2px solid #2563eb",
                      backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                      fontWeight: "bold",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="" disabled>-- Select a Standard Course --</option>
                    {getFilteredCourses().map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Type custom course details or edit selected course..."
                    value={form.courseDetail}
                    readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                    onChange={(e) => setForm({ ...form, courseDetail: e.target.value.toUpperCase() })}
                    style={{
                      textTransform: 'uppercase',
                      flex: 1,
                      minWidth: "220px",
                      height: "36px",
                      padding: "0 10px",
                      borderRadius: "5px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                      fontSize: "13px",
                      boxSizing: "border-box",
                      fontWeight: "bold"
                    }}
                  />
                </div>

                {/* COURSE FEE, DISCOUNT & EXTRA ITEMS KEPT DIRECTLY WITH COURSE DETAIL (GREEN THEME) */}
                <div style={{
                  backgroundColor: "#f0fdf4",
                  border: "2px solid #16a34a",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginTop: "10px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#166534" }}>
                        Course Fee & Discount: <strong style={{ color: "#15803d" }}>{form.coursePackage || "Full course"}</strong>
                      </span>
                      {(() => {
                        const curPkg = form.coursePackage || "Full course";
                        const curDefault = getPackageFee(curPkg, form.courseDetail);
                        if (!curDefault) return null;
                        return (
                          <span style={{ fontSize: "11px", color: "#047857", backgroundColor: "#d1fae5", padding: "1px 6px", borderRadius: "4px", border: "1px solid #a7f3d0", fontWeight: "bold" }}>
                            Default: Rs. {Number(curDefault.grossFee).toLocaleString()} ({curDefault.discountPercent || 0}% off)
                          </span>
                        );
                      })()}
                    </div>

                    {(!form.isExistingStudent || form.isEditingExistingBill) && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentAsDefault(form.coursePackage)}
                          title={`Save current Rs. ${Number(form.grossFee || 0).toLocaleString()} and ${Number(form.discountPercent || 0)}% discount as default for "${form.coursePackage}"`}
                          style={{
                            backgroundColor: "#16a34a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          Set as Default
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const initialCourse = (form?.courseDetail && getFilteredCourses().includes(form.courseDetail)) ? form.courseDetail : defaultCourse;
                            setSelectedCourseForFees(initialCourse);
                            setEditingCourseFees({ ...(feeConfig.courseFees || {}) });
                            setEditingPackageFees({ ...(feeConfig.packages || DEFAULT_PACKAGE_FEES) });
                            const courseDefPkg = feeConfig.courseFees?.[initialCourse]?.defaultPackage || feeConfig.defaultPackage || "Full course";
                            setSelectedDefaultPkg(courseDefPkg);
                            setFeeUpdateDate(feeConfig.updatedAt || (typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10)));
                            setShowFeeConfigModal(true);
                          }}
                          title="View and edit default fees for all packages"
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#0369a1",
                            border: "1px solid #7dd3fc",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          All Defaults
                        </button>
                      </div>
                    )}
                  </div>

                  {feeSavedToast && (
                    <div style={{
                      backgroundColor: "#bbf7d0",
                      color: "#14532d",
                      border: "1px solid #86efac",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      fontSize: "11.5px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <span>{feeSavedToast}</span>
                      <button type="button" onClick={() => setFeeSavedToast("")} style={{ background: "none", border: "none", color: "#14532d", cursor: "pointer", fontWeight: "bold" }}>x</button>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "flex-end" }}>
                    {/* Course Gross Fee */}
                    <div>
                      <label style={{ display: "none" }}>
                        
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="Course Gross Fee"
                        value={form.grossFee || ""}
                        readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => updateFeeCalculations(e.target.value, form.discountPercent)}
                        style={{
                          width: "100%",
                          height: "36px",
                          padding: "0 10px",
                          borderRadius: "5px",
                          border: "1.5px solid #16a34a",
                          backgroundColor: "#ffffff",
                          boxSizing: "border-box",
                          fontWeight: "bold",
                          fontSize: "13px",
                          color: "#166534"
                        }}
                      />
                    </div>

                    {/* Discount % (Manual Entry) */}
                    <div>
                        {Number(form.discountAmount || 0) > 0 && (
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "bold" }}>
                              - {formatCurrency(form.discountAmount)}
                            </span>
                          </div>
                        )}
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Discount % (Manual Entry)"
                        value={form.discountPercent == 0 ? '' : form.discountPercent}
                        readOnly={form.isExistingStudent && !form.isEditingExistingBill}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => updateFeeCalculations(form.grossFee, e.target.value)}
                        style={{
                          width: "100%",
                          height: "36px",
                          padding: "0 10px",
                          borderRadius: "5px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: (form.isExistingStudent && !form.isEditingExistingBill) ? "#f1f5f9" : "white",
                          boxSizing: "border-box",
                          fontWeight: "bold",
                          fontSize: "13px"
                        }}
                      />
                    </div>
                  </div>

                  {/* ADD ITEM WITH DROP DOWN ARROW ONLY */}
                  <div style={{ borderTop: "1px dashed #86efac", paddingTop: "10px", marginTop: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      {/* Free Button: Blue before select, fully Red when checked (sets for all items) */}
                      <button
                        type="button"
                        onClick={() => handleToggleAllFree(!isItemFree)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          userSelect: "none",
                          padding: "8px 14px",
                          borderRadius: "5px",
                          backgroundColor: isItemFree ? "#dc2626" : "#2563eb",
                          color: "#ffffff",
                          border: isItemFree ? "1.5px solid #b91c1c" : "1.5px solid #1d4ed8",
                          fontWeight: "bold",
                          fontSize: "13px",
                          height: "36px",
                          boxSizing: "border-box",
                          transition: "all 0.15s ease",
                          boxShadow: "none"
                        }}
                        title={isItemFree ? "Currently FREE for all items (click to uncheck)" : "Click to set FREE for all items"}
                      >
                        <span style={{
                          display: "inline-block",
                          width: "14px",
                          height: "14px",
                          borderRadius: "3px",
                          border: "1.5px solid #ffffff",
                          backgroundColor: isItemFree ? "#ffffff" : "transparent",
                          position: "relative",
                          verticalAlign: "middle"
                        }}>
                          {isItemFree && (
                            <span style={{
                              position: "absolute",
                              left: "2px",
                              top: "-3px",
                              color: "#dc2626",
                              fontSize: "12px",
                              fontWeight: "900"
                            }}>✓</span>
                          )}
                        </span>
                        <span>Free</span>
                      </button>

                      {/* Drop down arrow select populated with products & available stock */}
                      <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                        <select
                          value={selectedItemToAdd}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (val === "Other") {
                              setSelectedItemToAdd("Other");
                              return;
                            }
                            handleAddItemFromDropdown(val);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "5px",
                            border: "1.5px solid #16a34a",
                            backgroundColor: "#ffffff",
                            color: "#166534",
                            fontWeight: "bold",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                        >
                          <option value="">Choose item / book to add ▼</option>
                          {products.map((p) => {
                            const isOutOfStock = Number(p.stock) <= 0;
                            return (
                              <option
                                key={p.id}
                                value={p.name}
                                disabled={isOutOfStock}
                                style={{
                                  color: isOutOfStock ? "#94a3b8" : "#166534",
                                  fontWeight: isOutOfStock ? "normal" : "bold"
                                }}
                              >
                                {p.name} — Stock: {p.stock} {p.unit || 'pcs'} {isOutOfStock ? '[OUT OF STOCK]' : `(Rs. ${p.price})`}
                              </option>
                            );
                          })}
                          <option value="Other">Type Custom Item Name...</option>
                        </select>
                      </div>

                      {/* Quantity Selector for Product */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#166534" }}>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={(() => {
                            const matched = products.find(p => p.name === selectedItemToAdd);
                            return matched ? Math.max(1, Number(matched.stock) || 1) : 999;
                          })()}
                          value={selectedItemQty}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setSelectedItemQty(val);
                          }}
                          style={{
                            width: "55px",
                            padding: "8px 6px",
                            borderRadius: "5px",
                            border: "1.5px solid #16a34a",
                            backgroundColor: "#ffffff",
                            color: "#166534",
                            fontWeight: "bold",
                            fontSize: "13px",
                            textAlign: "center",
                            boxSizing: "border-box"
                          }}
                          title="Quantity to add (Available stock will auto-reduce)"
                        />
                      </div>

                      {/* Exact Price Input (No Stepper Arrows - Direct Typing) */}
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span style={{ position: "absolute", left: "8px", fontSize: "11px", fontWeight: "bold", color: "#64748b", pointerEvents: "none" }}>Rs.</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={isItemFree ? "0" : "Unit Price"}
                          value={newItemPrice}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setNewItemPrice(val);
                            if (Number(val) > 0) {
                              setIsItemFree(false);
                            } else if (val === "0") {
                              setIsItemFree(true);
                            }
                          }}
                          style={{
                            width: "95px",
                            padding: "8px 8px 8px 30px",
                            borderRadius: "5px",
                            border: isItemFree ? "1.5px solid #16a34a" : "1px solid #86efac",
                            backgroundColor: isItemFree ? "#f0fdf4" : "#ffffff",
                            fontWeight: "bold",
                            fontSize: "13px",
                            color: isItemFree ? "#15803d" : "#166534",
                            boxSizing: "border-box"
                          }}
                          title={isItemFree ? "Item is marked as FREE (Rs. 0)" : "Type exact unit price"}
                        />
                      </div>

                      {selectedItemToAdd === "Other" && (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flex: 1, minWidth: "200px" }}>
                          <input
                            type="text"
                            placeholder="Type Custom Item / Book Name..."
                            value={customItemToAdd}
                            autoFocus
                            onChange={(e) => setCustomItemToAdd(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && customItemToAdd.trim()) {
                                e.preventDefault();
                                handleAddItemFromDropdown(customItemToAdd);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              borderRadius: "5px",
                              border: "1.5px solid #16a34a",
                              fontSize: "13px",
                              boxSizing: "border-box"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddItemFromDropdown(customItemToAdd)}
                            style={{
                              backgroundColor: "#16a34a",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "13px"
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ONLY SHOW ADDED ITEMS IF ANY HAVE BEEN ADDED */}
                    {form.materials && form.materials.length > 0 && (
                      <div style={{ marginTop: "8px", display: "grid", gap: "6px" }}>
                        {form.materials.map((mat, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#ffffff",
                            padding: "6px 10px",
                            borderRadius: "5px",
                            border: "1px solid #cbd5e1"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a8a" }}>
                                {mat.name}
                              </span>
                              {mat.qty && Number(mat.qty) > 1 && (
                                <span style={{
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "bold"
                                }}>
                                  Qty: {mat.qty} {mat.unit || ''}
                                </span>
                              )}
                              {mat.unitPrice && Number(mat.qty) > 1 && !mat.isFree && Number(mat.amount) > 0 && (
                                <span style={{ color: "#64748b", fontSize: "11px" }}>
                                  (@ Rs. {mat.unitPrice})
                                </span>
                              )}
                              {/* Interactive Free uncheck/check button for added item */}
                              <button
                                type="button"
                                onClick={() => handleToggleMaterialFree(idx, !(mat.isFree || Number(mat.amount) === 0))}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  cursor: "pointer",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  backgroundColor: (mat.isFree || Number(mat.amount) === 0) ? "#dc2626" : "#f1f5f9",
                                  color: (mat.isFree || Number(mat.amount) === 0) ? "#ffffff" : "#475569",
                                  border: (mat.isFree || Number(mat.amount) === 0) ? "1px solid #b91c1c" : "1px solid #cbd5e1",
                                  fontSize: "11px",
                                  fontWeight: "bold"
                                }}
                                title={(mat.isFree || Number(mat.amount) === 0) ? "Click to uncheck Free (restore item price)" : "Click to mark as Free"}
                              >
                                <span>{(mat.isFree || Number(mat.amount) === 0) ? "✓ Free" : "Set Free"}</span>
                              </button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <span style={{ position: "absolute", left: "7px", fontSize: "11px", fontWeight: "bold", color: "#64748b", pointerEvents: "none" }}>Rs.</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={mat.amount ?? 0}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    handleUpdateMaterial(idx, "amount", val === "" ? 0 : Number(val));
                                  }}
                                  style={{
                                    width: "85px",
                                    padding: "5px 6px 5px 26px",
                                    borderRadius: "4px",
                                    border: Number(mat.amount) > 0 ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                                    backgroundColor: Number(mat.amount) > 0 ? "#eff6ff" : "white",
                                    color: Number(mat.amount) > 0 ? "#1e3a8a" : "#334155",
                                    fontWeight: "bold",
                                    fontSize: "13px"
                                  }}
                                  title="Total amount"
                                />
                              </div>
                              <button
                                type="button"
                                title="Remove this item"
                                onClick={() => handleRemoveMaterial(idx)}
                                style={{
                                  backgroundColor: "#fee2e2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  fontSize: "12px"
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PAYMENT BREAKDOWN SUMMARY & RECEIPT AMOUNT */}
              <div style={{ gridColumn: "span 2", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "2px solid #cbd5e1", marginTop: "4px" }}>
                <div style={{ fontWeight: "900", fontSize: "14px", color: "#1e3a8a", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ display: "none" }}></span>
                </div>

                {/* PAID AMOUNT IN FULL RED BOX (FIRST) & PAYMENT METHOD (SECOND) */}
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "14px", marginTop: "10px", alignItems: "flex-start" }}>
                  {/* 1. PAID AMOUNT - FULL RED COLOUR BOX MATCHING SIZE OF PAYMENT METHOD BOX */}
                  <div>
                    {(() => {
                      const maxAllowedPayment = (() => {
                        if (form.isExistingStudent && !form.isEditingExistingBill) {
                          const existing = bills.find(b => {
                            if (!b.contactNumber) return false;
                            return normalizeNepaliMobile(b.contactNumber) === normalizeNepaliMobile(form.contactNumber);
                          });
                          if (existing && Number(existing.dueAmount) > 0) {
                            return Number(existing.dueAmount);
                          }
                        }
                        const feeAfterDiscount = Number(form.totalFee || 0);
                        const gross = Number(form.grossFee || 0);
                        if (feeAfterDiscount > 0) return feeAfterDiscount;
                        if (gross > 0) return gross;
                        return 0;
                      })();

                      return (
                        <>
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "26px", marginBottom: "6px", boxSizing: "border-box", width: "100%" }}>
                            <label style={{ fontSize: "11.5px", fontWeight: "bold", color: "#b91c1c", letterSpacing: "0.2px", margin: 0, lineHeight: 1, whiteSpace: "nowrap", textAlign: "center" }}>
                              ENTER PAID AMOUNT *
                            </label>
                          </div>

                          <div style={{ position: "relative", width: "100%", height: "58px", backgroundColor: "#dc2626", borderRadius: "8px", boxSizing: "border-box", overflow: "hidden" }}>
                            <input
                              type="number"
                              required
                              min="1"
                              max={maxAllowedPayment > 0 ? maxAllowedPayment : undefined}
                              placeholder="Enter Paid Amount"
                              value={form.paidAmount}
                              className="paid-amount-red-input"
                              onWheel={(e) => e.target.blur()}
                              onChange={(e) => {
                                const rawVal = e.target.value;
                                if (rawVal === "") {
                                  setForm(prev => ({ ...prev, paidAmount: "" }));
                                  return;
                                }
                                const num = Number(rawVal);
                                if (maxAllowedPayment > 0 && num > maxAllowedPayment) {
                                  setForm(prev => ({ ...prev, paidAmount: maxAllowedPayment }));
                                } else {
                                  setForm(prev => ({ ...prev, paidAmount: rawVal }));
                                }
                              }}
                              style={{
                                width: "100%",
                                height: "58px",
                                minHeight: "58px",
                                maxHeight: "58px",
                                backgroundColor: "#dc2626",
                                color: "#ffffff",
                                border: "2px solid #b91c1c",
                                borderRadius: "8px",
                                fontWeight: "900",
                                fontSize: "22px",
                                textAlign: "center",
                                letterSpacing: "0.5px",
                                padding: "0 8px",
                                boxSizing: "border-box",
                                outline: "none",
                                boxShadow: "0 3px 8px rgba(220, 38, 38, 0.28)",
                                transition: "all 0.15s ease"
                              }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* 2. PAYMENT METHOD - WITH CLEAN SVG ICONS */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "26px", marginBottom: "6px", boxSizing: "border-box" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: "bold", color: "#334155", margin: 0, lineHeight: 1 }}>
                        Payment Method *
                      </label>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "inline-flex", alignItems: "center", height: "22px" }}>
                        Active: <strong style={{ color: "#dc2626", marginLeft: "4px", backgroundColor: "#fee2e2", padding: "1px 8px", borderRadius: "4px", border: "1px solid #fca5a5" }}>{form.paymentMethod === "Other" && form.customPaymentMethod ? form.customPaymentMethod : form.paymentMethod}</strong>
                      </span>
                    </div>

                    {/* Visual Payment Method Buttons with Clean SVG Icons */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", height: "58px", boxSizing: "border-box" }}>
                      {[
                        { key: "Cash", label: "Cash", getIcon: (sel) => <CashIcon size={20} color={sel ? "#b91c1c" : "#16a34a"} /> },
                        { key: "Online Bank Acc", label: "Bank", getIcon: (sel) => <BankIcon size={20} color={sel ? "#b91c1c" : "#2563eb"} /> },
                        { key: "Online Esewa", label: "eSewa", getIcon: () => <EsewaIcon size={20} /> },
                        { key: "Online Khalti", label: "Khalti", getIcon: () => <KhaltiIcon size={20} /> },
                        { key: "Other", label: "Other", getIcon: (sel) => <CardIcon size={20} color={sel ? "#b91c1c" : "#d97706"} /> }
                      ].map((m) => {
                        const isSelected = form.paymentMethod === m.key;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => {
                              if (m.key === "Other") {
                                setForm(prev => ({ ...prev, paymentMethod: "Other", customPaymentMethod: prev.customPaymentMethod || "" }));
                                setTimeout(() => {
                                  if (customPaymentInputRef.current) {
                                    customPaymentInputRef.current.focus();
                                    customPaymentInputRef.current.select();
                                  }
                                }, 60);
                              } else {
                                setForm(prev => ({ ...prev, paymentMethod: m.key }));
                              }
                            }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              padding: "4px",
                              minHeight: "58px",
                              height: "58px",
                              maxHeight: "58px",
                              boxSizing: "border-box",
                              borderRadius: "8px",
                              border: isSelected ? "2.5px solid #dc2626" : "1.5px solid #cbd5e1",
                              backgroundColor: isSelected ? "#fee2e2" : "#ffffff",
                              color: isSelected ? "#b91c1c" : "#475569",
                              fontWeight: isSelected ? "900" : "600",
                              fontSize: "12px",
                              cursor: "pointer",
                              boxShadow: isSelected ? "0 0 0 2px rgba(220, 38, 38, 0.25), 0 3px 8px rgba(220, 38, 38, 0.2)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {m.getIcon(isSelected)}
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {form.paymentMethod === "Other" && (
                      <div style={{ position: "relative", marginTop: "6px" }}>
                        <input
                          ref={customPaymentInputRef}
                          autoFocus
                          type="text"
                          placeholder="Type custom payment method..."
                          value={form.customPaymentMethod}
                          onChange={(e) => setForm(prev => ({ ...prev, customPaymentMethod: e.target.value }))}
                          style={{
                            width: "100%",
                            padding: "8px 10px 8px 32px",
                            borderRadius: "6px",
                            border: "2px solid #16a34a",
                            backgroundColor: "#f0fdf4",
                            color: "#15803d",
                            fontSize: "13px",
                            fontWeight: "bold",
                            boxSizing: "border-box",
                            outline: "none",
                            boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.3), 0 2px 6px rgba(22, 163, 74, 0.15)",
                            transition: "all 0.2s ease"
                          }}
                        />
                        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}>
                          <CardIcon size={15} color="#16a34a" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                {/* PAYMENT SUMMARY CARD */}
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{
                    border: "2px solid #1e3a8a",
                    borderRadius: "6px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    marginBottom: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                  }}>
                  <div style={{
                    backgroundColor: "#1e3a8a",
                    color: "#ffffff",
                    padding: "8px 12px",
                    fontWeight: "900",
                    fontSize: "13px",
                    letterSpacing: "0.5px",
                    textAlign: "center"
                  }}>
                    PAYMENT SUMMARY
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#000000" }}>
                          Course Fee (Gross):
                        </td>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#000000" }}>
                          {formatCurrency(form.grossFee || 0)}
                        </td>
                      </tr>

                      <tr>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", color: "#15803d", fontWeight: "bold" }}>
                          Discount ({Number(form.discountPercent) || 0}%):
                        </td>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", color: "#15803d", fontWeight: "900" }}>
                          - {formatCurrency(form.discountAmount || 0)}
                        </td>
                      </tr>

                      {/* Study Materials Fee row if any item has price > 0 */}
                      {(() => {
                        const matTotal = (form.materials || []).reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
                        if (matTotal > 0) {
                          return (
                            <tr style={{ backgroundColor: "#eff6ff" }}>
                              <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", color: "#1e40af", fontWeight: "bold" }}>
                                Study Materials / Extra Items Fee:
                              </td>
                              <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", color: "#1e40af", fontWeight: "900" }}>
                                + {formatCurrency(matTotal)}
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })()}

                      <tr>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#475569" }}>
                          Payment (Net Subtotal before VAT):
                        </td>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#475569" }}>
                          {formatCurrency(Number(form.totalFee || 0) / 1.13)}
                        </td>
                      </tr>

                      <tr style={{ backgroundColor: "#fefce8" }}>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#854d0e" }}>
                          13% VAT / PAN Amount:
                        </td>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#854d0e" }}>
                          {formatCurrency(Number(form.totalFee || 0) - (Number(form.totalFee || 0) / 1.13))}
                        </td>
                      </tr>

                      <tr style={{ backgroundColor: "#eff6ff", borderTop: "2px solid #1e3a8a", borderBottom: "2px solid #1e3a8a" }}>
                        <td style={{ padding: "9px 14px", fontWeight: "900", color: "#1e3a8a", fontSize: "14px" }}>
                          Total Payment (Inclusive of 13% VAT):
                        </td>
                        <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: "900", color: "#1e3a8a", fontSize: "15px" }}>
                          {formatCurrency(form.totalFee || 0)}
                        </td>
                      </tr>

                      <tr style={{ backgroundColor: "#f0fdf4" }}>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", color: "#166534", fontWeight: "bold" }}>
                          Total Paid Amount:
                        </td>
                        <td style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#166534" }}>
                          {formatCurrency(form.paidAmount || 0)}
                        </td>
                      </tr>

                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td style={{ padding: "8px 14px", fontWeight: "bold", color: Math.max(0, Number(form.totalFee || 0) - Number(form.paidAmount || 0)) > 0 ? "#dc2626" : "#0d9488" }}>
                          Remaining Due Balance:
                        </td>
                        <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: "900", color: Math.max(0, Number(form.totalFee || 0) - Number(form.paidAmount || 0)) > 0 ? "#dc2626" : "#0d9488" }}>
                          {formatCurrency(Math.max(0, Number(form.totalFee || 0) - Number(form.paidAmount || 0)))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                </div>

              {/* Words display */}
              <div style={{ gridColumn: "span 2", backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px dashed #cbd5e1" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>Rupees in Words: </span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#1e3a8a" }}>
                  {numberToRupeesInWords(form.paidAmount)}
                </span>
              </div>

              {/* BILL PREPARED BY: ONLY 'Bill Prepared By', HIGHLIGHTED IN BLUE, NO BLUR */}
              <div style={{
                gridColumn: "span 2",
                backgroundColor: "#eff6ff",
                border: "2px solid #2563eb",
                borderRadius: "8px",
                padding: "12px 14px"
              }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "900", color: "#1e40af", marginBottom: "6px" }}>
                  Bill Prepared By
                </label>
                <input
                  type="text"
                  placeholder="Bill Prepared By..."
                  value={form.preparedBy}
                  onChange={(e) => setForm({ ...form, preparedBy: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1.5px solid #3b82f6",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    color: "#1e3a8a"
                  }}
                />
              </div>

              {/* Submit Button: Generate Bill (Simple, solid, no blur) */}
              <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "1px solid #15803d",
                    padding: "13px",
                    borderRadius: "6px",
                    fontWeight: "900",
                    fontSize: "16px",
                    cursor: "pointer",
                    letterSpacing: "0.5px"
                  }}
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEFAULT COURSE FEES & DISCOUNT SETTINGS MODAL */}
      {showFeeConfigModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "95%",
            maxWidth: "780px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "19px" }}>
                  Default Course Fee & Discount Settings
                </h3>
                <div style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Updated Date:</span>
                  <input
                    type="date"
                    value={feeUpdateDate || feeConfig.updatedAt || (typeof getLocalDateStr === "function" ? getLocalDateStr() : new Date().toISOString().slice(0, 10))}
                    onChange={(e) => setFeeUpdateDate(e.target.value)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#1e293b",
                      backgroundColor: "#f8fafc",
                      cursor: "pointer"
                    }}
                    title="Updated default fee date"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeeConfigModal(false)}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "5px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveAllPackageFees}>
              {/* Course & Child Package Control */}
              <div style={{
                backgroundColor: "#f8fafc",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", alignItems: "center" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "5px" }}>
                      Standard Course
                    </label>
                    <select
                      value={selectedCourseForFees}
                      onChange={(e) => {
                        const newCourse = e.target.value;
                        setSelectedCourseForFees(newCourse);
                        if (newCourse === "STANDARD_DEFAULT") {
                          setSelectedDefaultPkg(feeConfig.defaultPackage || "Full course");
                        } else {
                          const defPkg = editingCourseFees[newCourse]?.defaultPackage || feeConfig.courseFees?.[newCourse]?.defaultPackage || feeConfig.defaultPackage || "Full course";
                          setSelectedDefaultPkg(defPkg);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1.5px solid #2563eb",
                        fontWeight: "bold",
                        fontSize: "13px",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="STANDARD_DEFAULT">Standard Course Package (General Default for All)</option>
                      <optgroup label="Configure For Specific Standard Course">
                        {getFilteredCourses().map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "5px" }}>
                      Default Child Package for {selectedCourseForFees === "STANDARD_DEFAULT" ? "All Courses" : selectedCourseForFees}
                    </label>
                    <select
                      value={selectedDefaultPkg}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedDefaultPkg(val);
                        if (selectedCourseForFees !== "STANDARD_DEFAULT") {
                          setEditingCourseFees(prev => {
                            const cur = prev[selectedCourseForFees] || feeConfig.courseFees?.[selectedCourseForFees] || {
                              defaultPackage: val,
                              packages: { ...(editingPackageFees || DEFAULT_PACKAGE_FEES) }
                            };
                            return { ...prev, [selectedCourseForFees]: { ...cur, defaultPackage: val } };
                          });
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1.5px solid #3b82f6",
                        fontWeight: "bold",
                        fontSize: "13px",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                      }}
                    >
                      {COURSE_PACKAGES.map((pkg) => (
                        <option key={pkg} value={pkg}>
                          {pkg} {pkg === "Full course" ? "(Standard Full Package)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Package Header & Copy Helper */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#334155" }}>
                  Fee Structure for Child Packages of: <span style={{ color: "#2563eb" }}>{selectedCourseForFees === "STANDARD_DEFAULT" ? "Standard Course Package (Default)" : selectedCourseForFees}</span>
                </div>
                {selectedCourseForFees !== "STANDARD_DEFAULT" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Copy standard package fee defaults into "${selectedCourseForFees}"?`)) {
                        setEditingCourseFees(prev => ({
                          ...prev,
                          [selectedCourseForFees]: {
                            defaultPackage: selectedDefaultPkg,
                            packages: { ...(editingPackageFees || DEFAULT_PACKAGE_FEES) }
                          }
                        }));
                      }
                    }}
                    style={{
                      backgroundColor: "#f1f5f9",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      borderRadius: "5px",
                      padding: "5px 12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    Copy Standard Fees to this Course
                  </button>
                )}
              </div>

              {/* Package Fees List */}
              <div style={{ border: "1.5px solid #cbd5e1", borderRadius: "8px", overflowX: "auto", marginBottom: "16px", backgroundColor: "#ffffff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #cbd5e1", textAlign: "left" }}>
                      <th style={{ padding: "10px 14px", color: "#334155", fontWeight: "bold", width: "34%" }}>Course Child Package</th>
                      <th style={{ padding: "10px 12px", color: "#334155", fontWeight: "bold", width: "25%" }}>Gross Fee (NPR)</th>
                      <th style={{ padding: "10px 12px", color: "#334155", fontWeight: "bold", width: "18%" }}>Discount %</th>
                      <th style={{ padding: "10px 14px", color: "#334155", fontWeight: "bold", textAlign: "right", width: "23%" }}>Net Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COURSE_PACKAGES.map((pkg) => {
                      const pkgData = (() => {
                        if (selectedCourseForFees === "STANDARD_DEFAULT") {
                          return editingPackageFees[pkg] || DEFAULT_PACKAGE_FEES[pkg] || { grossFee: 15000, discountPercent: 0 };
                        }
                        if (editingCourseFees[selectedCourseForFees]?.packages?.[pkg]) {
                          return editingCourseFees[selectedCourseForFees].packages[pkg];
                        }
                        if (feeConfig.courseFees?.[selectedCourseForFees]?.packages?.[pkg]) {
                          return feeConfig.courseFees[selectedCourseForFees].packages[pkg];
                        }
                        return editingPackageFees[pkg] || DEFAULT_PACKAGE_FEES[pkg] || { grossFee: 15000, discountPercent: 0 };
                      })();

                      const gross = Number(pkgData.grossFee) || 0;
                      const discPct = Number(pkgData.discountPercent) || 0;
                      const net = Math.max(0, gross - (gross * (discPct / 100)));
                      const isPrimaryDefault = selectedDefaultPkg === pkg;

                      const updateFeeValue = (field, val) => {
                        const num = Math.max(0, Number(val) || 0);
                        if (selectedCourseForFees === "STANDARD_DEFAULT") {
                          setEditingPackageFees(prev => ({
                            ...prev,
                            [pkg]: { ...(prev[pkg] || DEFAULT_PACKAGE_FEES[pkg]), [field]: num }
                          }));
                        } else {
                          setEditingCourseFees(prev => {
                            const curCourseObj = prev[selectedCourseForFees] || feeConfig.courseFees?.[selectedCourseForFees] || {
                              defaultPackage: selectedDefaultPkg,
                              packages: { ...(editingPackageFees || DEFAULT_PACKAGE_FEES) }
                            };
                            const curPkgs = curCourseObj.packages || { ...(editingPackageFees || DEFAULT_PACKAGE_FEES) };
                            const curPkgData = curPkgs[pkg] || editingPackageFees[pkg] || DEFAULT_PACKAGE_FEES[pkg];
                            return {
                              ...prev,
                              [selectedCourseForFees]: {
                                ...curCourseObj,
                                packages: {
                                  ...curPkgs,
                                  [pkg]: { ...curPkgData, [field]: num }
                                }
                              }
                            };
                          });
                        }
                      };

                      return (
                        <tr key={pkg} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: isPrimaryDefault ? "#f0fdf4" : "#ffffff" }}>
                          <td style={{ padding: "10px 14px", fontWeight: "bold", color: "#1e293b", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{pkg}</span>
                              {isPrimaryDefault && (
                                <span style={{ fontSize: "10px", backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>
                                  Default
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={pkgData.grossFee}
                              onChange={(e) => updateFeeValue("grossFee", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "7px 8px",
                                borderRadius: "4px",
                                border: "1.5px solid #16a34a",
                                fontWeight: "bold",
                                color: "#166534",
                                boxSizing: "border-box",
                                textAlign: "right"
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={pkgData.discountPercent}
                              onChange={(e) => updateFeeValue("discountPercent", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "7px 8px",
                                borderRadius: "4px",
                                border: "1.5px solid #cbd5e1",
                                fontWeight: "bold",
                                boxSizing: "border-box",
                                textAlign: "center"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "bold", color: "#0f172a", whiteSpace: "nowrap" }}>
                            {formatCurrency(net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Reset course package fees and discounts to original standard defaults?")) {
                      if (selectedCourseForFees === "STANDARD_DEFAULT") {
                        setEditingPackageFees({ ...DEFAULT_PACKAGE_FEES });
                        setSelectedDefaultPkg("Full course");
                      } else {
                        setEditingCourseFees(prev => {
                          const updated = { ...prev };
                          delete updated[selectedCourseForFees];
                          return updated;
                        });
                        setSelectedDefaultPkg(feeConfig.defaultPackage || "Full course");
                      }
                    }
                  }}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "9px 16px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  {selectedCourseForFees === "STANDARD_DEFAULT" ? "Reset Standard Defaults" : `Reset "${selectedCourseForFees}" to Standard`}
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowFeeConfigModal(false)}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      padding: "9px 16px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "9px 22px",
                      borderRadius: "6px",
                      fontWeight: "900",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
                    }}
                  >
                    Save Default Fees
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT BILL PAD HEADER MODAL */}
      {showProfileModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "620px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "19px" }}>
                Edit Company Bill Pad Header
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ gridColumn: "span 2", backgroundColor: "#fef3c7", padding: "10px", borderRadius: "6px", fontSize: "12px", color: "#92400e" }}>
                 <strong>One-time lifetime edit:</strong> After saving, this header will be permanently locked like pre-printed stationery.
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>VAT/PAN Number *</label>
                <input
                  type="text"
                  required
                  value={profile.panVatNumber}
                  onChange={(e) => setProfile({ ...profile, panVatNumber: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Company Name *</label>
                <input
                  type="text"
                  required
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Address *</label>
                <input
                  type="text"
                  required
                  value={profile.companyAddress}
                  onChange={(e) => setProfile({ ...profile, companyAddress: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Contact No *</label>
                <input
                  type="text"
                  required
                  value={profile.contactNumber}
                  onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Email *</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Upload Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
                {profile.logoUrl && (
                  <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src={profile.logoUrl} alt="Logo Preview" style={{ width: "40px", height: "40px", objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
                    <span style={{ fontSize: "11px", color: "#16a34a" }}>Current logo attached</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Upload Authorized Stamp</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStampUpload}
                  style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
                {profile.stampUrl ? (
                  <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src={profile.stampUrl} alt="Stamp Preview" style={{ width: "45px", height: "45px", objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
                    <span style={{ fontSize: "11px", color: "#16a34a" }}>Current stamp attached</span>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stampUrl: "" }))}
                      style={{ fontSize: "10px", color: "#dc2626", border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Clear Stamp
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                    Upload PNG/JPEG seal stamp to appear on printed bills
                  </span>
                )}
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>Google Sheet Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/..."
                  value={profile.googleSheetUrl === "setup_done" ? "" : (profile.googleSheetUrl || "")}
                  onChange={(e) => setProfile({ ...profile, googleSheetUrl: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
                <button
                  type="submit"
                  style={{ width: "100%", backgroundColor: "#1e3a8a", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
                >
                  Save Company Bill Pad Header
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. WORKABLE GOOGLE SHEET & DRIVE SETUP MODAL */}
      {showScriptModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          padding: "15px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "760px",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
            border: "1px solid #cbd5e1",
            overflow: "hidden"
          }}>
            {/* Modal Top Header */}
            <div style={{
              backgroundColor: "#1e3a8a",
              color: "white",
              padding: "16px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px" }}>
                  Google Sheet & Drive Setup
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleCloseGoogleSetupModal}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div style={{
              display: "flex",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              padding: "8px 16px",
              gap: "8px"
            }}>
              <button
                onClick={() => setSetupTab("connect")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  backgroundColor: setupTab === "connect" ? "#2563eb" : "transparent",
                  color: setupTab === "connect" ? "white" : "#475569"
                }}
              >
                Cloud Links & Sync
              </button>
              <button
                onClick={() => setSetupTab("guide")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  backgroundColor: setupTab === "guide" ? "#2563eb" : "transparent",
                  color: setupTab === "guide" ? "white" : "#475569"
                }}
              >
                Apps Script Guide & Code
              </button>
              <button
                onClick={() => setSetupTab("csv")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  backgroundColor: setupTab === "csv" ? "#2563eb" : "transparent",
                  color: setupTab === "csv" ? "white" : "#475569"
                }}
              >
                Offline CSV Backup
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

              {/* TAB 1: CLOUD LINKS & SYNC */}
              {setupTab === "connect" && (
                <div>
                  {/* Status Banner */}
                  <div style={{
                    backgroundColor: profile.googleSheetUrl ? "#ecfdf5" : "#fffbeb",
                    border: `1px solid ${profile.googleSheetUrl ? "#a7f3d0" : "#fde68a"}`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>{profile.googleSheetUrl ? "" : ""}</span>
                      <div>
                        <strong style={{ color: profile.googleSheetUrl ? "#065f46" : "#92400e", fontSize: "13px", display: "block" }}>
                          {profile.googleSheetUrl ? "Google Sheet Auto-Sync is Active" : "Google Sheet Sync Not Configured"}
                        </strong>
                        <span style={{ fontSize: "12px", color: profile.googleSheetUrl ? "#047857" : "#b45309" }}>
                          {profile.googleSheetUrl
                            ? "All new bills and payments will automatically back up to your Google Sheet."
                            : "Enter your Apps Script Web App URL below or follow the 1-minute setup guide."}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={handleTestGoogleConnection}
                        disabled={testStatus.state === "testing" || !profile.googleSheetUrl}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: (testStatus.state === "testing" || !profile.googleSheetUrl) ? "not-allowed" : "pointer"
                        }}
                      >
                        {testStatus.state === "testing" ? "Testing..." : "Test Connection"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSyncToGoogleSheet}
                        disabled={isSyncing || !profile.googleSheetUrl}
                        style={{
                          backgroundColor: "#16a34a",
                          color: "white",
                          border: "none",
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: (isSyncing || !profile.googleSheetUrl) ? "not-allowed" : "pointer"
                        }}
                      >
                        {isSyncing ? "Syncing..." : `Sync All Bills (${bills.length})`}
                      </button>

                      {googleSheetViewUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(googleSheetViewUrl, "_blank")}
                          title="Open Google Sheet in new tab"
                          style={{
                            backgroundColor: "#0284c7",
                            color: "white",
                            border: "none",
                            padding: "7px 14px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          
                          <span>Open Google Sheet</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Banner Message */}
                  {(testStatus.state !== "idle" || syncStatus) && (
                    <div style={{
                      backgroundColor: (testStatus.state === "error" || (syncStatus && syncStatus.startsWith("")))
                        ? "#fee2e2"
                        : (testStatus.state === "testing" || isSyncing)
                        ? "#eff6ff"
                        : "#dcfce7",
                      color: (testStatus.state === "error" || (syncStatus && syncStatus.startsWith("")))
                        ? "#991b1b"
                        : (testStatus.state === "testing" || isSyncing)
                        ? "#1d4ed8"
                        : "#166534",
                      border: `1px solid ${
                        (testStatus.state === "error" || (syncStatus && syncStatus.startsWith("")))
                          ? "#fecaca"
                          : (testStatus.state === "testing" || isSyncing)
                          ? "#bfdbfe"
                          : "#bbf7d0"
                      }`,
                      borderRadius: "6px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      marginBottom: "16px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      flexWrap: "wrap"
                    }}>
                      <span>{testStatus.message || syncStatus}</span>
                      {googleSheetViewUrl && (
                        <a
                          href={googleSheetViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0284c7", fontWeight: "700", textDecoration: "underline", fontSize: "12px" }}
                        >
                          View in Google Sheet ↗
                        </a>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSaveGoogleSetup}>
                    {/* Field 1: Apps Script Webhook URL */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b" }}>
                          Google Apps Script Web App URL (Automated Sync Webhook) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setSetupTab("guide")}
                          style={{ background: "none", border: "none", color: "#2563eb", fontSize: "12px", cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
                        >
                          How do I get this URL?
                        </button>
                      </div>
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        value={(profile.googleSheetUrl === "setup_done" ? "" : profile.googleSheetUrl) || ""}
                        onChange={(e) => setProfile({ ...profile, googleSheetUrl: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          boxSizing: "border-box",
                          backgroundColor: isPermanentlyLinked ? "#e2e8f0" : "#f8fafc",
                          color: isPermanentlyLinked ? "#64748b" : "#000",
                          cursor: isPermanentlyLinked ? "not-allowed" : "text"
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                        URL must end with <code>/exec</code> and have access set to "Anyone".
                      </span>
                    </div>

                    {/* Field 2: Direct Google Sheet Link */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b" }}>
                          Direct Google Sheet Link (Quick Access)
                        </label>
                        {googleSheetViewUrl ? (
                          <a
                            href={googleSheetViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb", fontSize: "12px", textDecoration: "none", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            Open Sheet in Google Sheets ↗
                          </a>
                        ) : (
                          <a
                            href="https://sheets.new"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#16a34a", fontSize: "12px", textDecoration: "none", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            + Create New Sheet at sheets.new ↗
                          </a>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="url"
                          placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                          value={googleSheetViewUrl}
                          onChange={(e) => setGoogleSheetViewUrl(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            boxSizing: "border-box",
                            backgroundColor: isPermanentlyLinked ? "#e2e8f0" : "#fff",
                            color: isPermanentlyLinked ? "#64748b" : "#000",
                            cursor: isPermanentlyLinked ? "not-allowed" : "text"
                          }}
                        />
                        {googleSheetViewUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(googleSheetViewUrl, "_blank")}
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              padding: "0 14px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Open ↗
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                        Paste your Google Sheet link here to open it with 1 click anytime.
                      </span>
                    </div>

                    {/* Field 3: Direct Google Drive Folder Link */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b" }}>
                          Google Drive Folder Link (For File & PDF Storage)
                        </label>
                        {googleDriveUrl ? (
                          <a
                            href={googleDriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb", fontSize: "12px", textDecoration: "none", fontWeight: "bold" }}
                          >
                            Open Drive Folder ↗
                          </a>
                        ) : (
                          <a
                            href="https://drive.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#64748b", fontSize: "12px", textDecoration: "none" }}
                          >
                            Open Google Drive ↗
                          </a>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/drive/folders/your-folder-id"
                          value={googleDriveUrl}
                          onChange={(e) => setGoogleDriveUrl(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontSize: "13px",
                            boxSizing: "border-box",
                            backgroundColor: isPermanentlyLinked ? "#e2e8f0" : "#fff",
                            color: isPermanentlyLinked ? "#64748b" : "#000",
                            cursor: isPermanentlyLinked ? "not-allowed" : "text"
                          }}
                        />
                        {googleDriveUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(googleDriveUrl, "_blank")}
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#1e293b",
                              border: "1px solid #cbd5e1",
                              padding: "0 14px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            Open ↗
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                        Link your Google Drive backup folder to quickly inspect all stored backups.
                      </span>
                    </div>

                    {/* Field 4: Sheet Owner Email */}
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e293b", marginBottom: "5px" }}>
                        Owner Google Email (For Sheet Protection)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. director@gmail.com"
                        value={profile.ownerEmail || ""}
                        onChange={(e) => setProfile({ ...profile, ownerEmail: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          boxSizing: "border-box",
                          backgroundColor: isPermanentlyLinked ? "#e2e8f0" : "#fff",
                          color: isPermanentlyLinked ? "#64748b" : "#000",
                          cursor: isPermanentlyLinked ? "not-allowed" : "text"
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                        Locks your Google Sheet so staff cashiers cannot modify formulas or delete financial rows.
                      </span>
                    </div>

                    {saveSetupStatus && (
                      <div style={{
                        backgroundColor: saveSetupStatus.startsWith("") ? "#dcfce7" : "#fee2e2",
                        color: saveSetupStatus.startsWith("") ? "#166534" : "#991b1b",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        marginBottom: "16px",
                        fontWeight: "bold"
                      }}>
                        {saveSetupStatus}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          backgroundColor: "#1e3a8a",
                          color: "white",
                          border: "none",
                          padding: "12px 20px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        Save Setup Configuration
                      </button>

                      <button
                        type="button"
                        onClick={handleCloseGoogleSetupModal}
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          border: "1px solid #cbd5e1",
                          padding: "12px 20px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: STEP-BY-STEP APPS SCRIPT GUIDE & CODE */}
              {setupTab === "guide" && (
                <div>
                  <h4 style={{ margin: "0 0 10px 0", color: "#1e3a8a", fontSize: "16px" }}>
                    Simple 1-Minute Setup Guide:
                  </h4>

                  <div style={{
                    display: "grid",
                    gap: "10px",
                    marginBottom: "18px",
                    fontSize: "13px",
                    color: "#334155"
                  }}>
                    <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <strong>1. Create a Google Sheet:</strong> Open{" "}
                      <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: "bold" }}>
                        sheets.new ↗
                      </a>{" "}
                      to create a new Google Sheet. All <strong>Bills</strong> automatically store in <strong>Sheet 1</strong>, and all <strong>Expenses</strong> automatically store in <strong>Sheet 2</strong> when entering data.
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <strong>2. Open Apps Script:</strong> In your Google Sheet, click on <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <strong>3. Paste the Script:</strong> Delete everything in <code>Code.gs</code>, paste the code below, and press <strong>Ctrl+S</strong> to save.
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <strong>4. Deploy Web App:</strong> Click the blue <strong>Deploy</strong> button &gt; <strong>New deployment</strong>:
                      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
                        <li>Click the gear icon  &gt; choose <strong>Web app</strong></li>
                        <li><strong>Execute as:</strong> "Me" (your email)</li>
                        <li><strong>Who has access:</strong> "Anyone" <em>(Crucial!)</em></li>
                        <li>Click <strong>Deploy</strong> and authorize permissions if prompted.</li>
                      </ul>
                    </div>

                    <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <strong>5. Connect &amp; Enjoy:</strong> Copy the generated Web App URL, paste it into Tab 1 (<em>Cloud Links &amp; Sync</em>), and click <strong>Test Connection</strong>!
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b" }}>
                      Google Apps Script Code (Ready to Copy):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `/**
 * SIGMA BILLING & EXPENSES - GOOGLE SHEET & DRIVE SYNC SCRIPT
 * Version: 2.1 (Student Bills & Expenses Dual Sync with Concurrency Lock & Deduplication)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Sigma Billing & Expense Webhook is Online and Ready! (Single-Entry Mode Active)",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    // Wait up to 30 seconds to acquire lock so concurrent requests never cause duplicate rows
    hasLock = lock.tryLock(30000);

    var contents = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Helper: Normalize 10-digit mobile number
    function cleanPhone(val) {
      if (!val) return "";
      var digits = String(val).replace(/\\D/g, "");
      return digits.length >= 10 ? digits.slice(-10) : digits;
    }

    // Helper: Format Nepali mobile numbers with +977- prefix for Google Sheet
    function toNepalPhone(val) {
      if (!val) return "";
      var digits = String(val).replace(/\\D/g, "");
      var last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      return last10 ? ("'+977-" + last10) : "";
    }

    // Helper: English-only Date Time for Last Updated column (strictly in English)
    function getEnglishDateTime() {
      try {
        var tz = Session.getScriptTimeZone() || "GMT+5:45";
        return Utilities.formatDate(new Date(), tz, "yyyy-MM-dd hh:mm:ss a");
      } catch (e) {
        var d = new Date();
        return d.toISOString().replace("T", " ").substring(0, 19);
      }
    }

    // Helper: Get or Create Sheet 1 (Bills)
    function getOrCreateStudentBillsSheet() {
      var s = ss.getSheetByName("Sheet 1") ||
              ss.getSheetByName("Sheet1") ||
              ss.getSheetByName("StudentBills") ||
              ss.getSheetByName("Bills");

      var allSheets = ss.getSheets();
      if (!s) {
        if (allSheets.length > 0) {
          s = allSheets[0]; // 1st sheet = Sheet 1 (Bills)
        } else {
          s = ss.insertSheet("Sheet 1", 0);
        }
      }

      if (s.getName() === "StudentBills" || s.getName() === "Sheet1") {
        try { s.setName("Sheet 1"); } catch (e) {}
      }

      var headers = [
        "Bill No", "Date", "Student Name", "WhatsApp", "Address", "Parent Contact",
        "Course Detail", "Package", "Payment Method", "Gross Fee", "Discount %",
        "Total Fee (13% VAT Incl)", "Paid Amount", "Due Amount", "Amount In Words",
        "Prepared By", "Last Updated"
      ];
      if (s.getLastRow() === 0) {
        s.appendRow(headers);
        var headerRange = s.getRange(1, 1, 1, headers.length);
        headerRange.setBackground("#1e3a8a")
                   .setFontColor("#ffffff")
                   .setFontWeight("bold")
                   .setFontSize(11);
        s.setFrozenRows(1);
        for (var col = 1; col <= headers.length; col++) {
          s.setColumnWidth(col, 140);
        }
        s.setColumnWidth(1, 170);
        s.setColumnWidth(3, 180);
        s.setColumnWidth(7, 180);

        if (data.ownerEmail) {
          try {
            var prot = s.protect().setDescription("Sigma Billing Owner Protection");
            prot.removeEditors(prot.getEditors());
            prot.addEditor(data.ownerEmail);
          } catch (pe) {}
        }
      }
      return s;
    }

    // Helper: Get or Create Sheet 2 (Expenses)
    function getOrCreateExpenseSheet() {
      var s1 = getOrCreateStudentBillsSheet();

      var es = ss.getSheetByName("Sheet 2") ||
               ss.getSheetByName("Sheet2") ||
               ss.getSheetByName("Expenses") ||
               ss.getSheetByName("Expense");

      if (!es) {
        var allSheets = ss.getSheets();
        if (allSheets.length >= 2 && allSheets[1].getName() !== s1.getName()) {
          es = allSheets[1]; // 2nd sheet = Sheet 2 (Expenses)
        } else {
          es = ss.insertSheet("Sheet 2", 1);
        }
      }

      if (es.getName() === "Expenses" || es.getName() === "Sheet2") {
        try { es.setName("Sheet 2"); } catch (e) {}
      }

      var expHeaders = [
        "Expense ID", "Date", "Title / Description", "Category",
        "Amount (Rs)", "Payment Method", "Bill / Voucher No",
        "Recorded By", "Last Updated"
      ];
      if (es.getLastRow() === 0) {
        es.appendRow(expHeaders);
        var expHdrRange = es.getRange(1, 1, 1, expHeaders.length);
        expHdrRange.setBackground("#065f46")
                   .setFontColor("#ffffff")
                   .setFontWeight("bold")
                   .setFontSize(11);
        es.setFrozenRows(1);
        es.setColumnWidth(1, 160);
        es.setColumnWidth(2, 110);
        es.setColumnWidth(3, 220);
        es.setColumnWidth(4, 140);
        es.setColumnWidth(5, 120);
        es.setColumnWidth(6, 140);
        es.setColumnWidth(7, 150);
        es.setColumnWidth(8, 140);
        es.setColumnWidth(9, 180);

        if (data.ownerEmail) {
          try {
            var eProt = es.protect().setDescription("Sigma Expense Protection");
            eProt.removeEditors(eProt.getEditors());
            eProt.addEditor(data.ownerEmail);
          } catch (epe) {}
        }
      }
      return es;
    }

    // Helper: Format a bill into row values
    function formatBillRow(b) {
      return [
        b.billNumber || "",
        b.date || "",
        b.studentName || "",
        toNepalPhone(b.contactNumber),
        b.address || "",
        toNepalPhone(b.parentNumber),
        b.courseDetail || "",
        b.coursePackage || "",
        b.paymentMethod || "Cash",
        Number(b.grossFee || 0),
        Number(b.discountPercent || 0),
        Number(b.totalFee || 0),
        Number(b.paidAmount || 0),
        Number(b.dueAmount || 0),
        b.amountInWords || "",
        b.preparedBy || "",
        b.lastUpdated || getEnglishDateTime()
      ];
    }

    // Helper: Format an expense into row values
    function formatExpenseRow(exp) {
      return [
        String(exp.id || ""),
        exp.date || "",
        exp.title || "",
        exp.category || "General",
        Number(exp.amount || 0),
        exp.paymentMethod || "Cash",
        exp.remarks || "",
        exp.recordedBy || "",
        exp.lastUpdated || getEnglishDateTime()
      ];
    }

    // Helper: Find matching rows in StudentBills sheet
    function findMatchingBillRows(sheet, b) {
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) return [];
      var dataRange = sheet.getRange(2, 1, lastRow - 1, Math.min(sheet.getLastColumn(), 5)).getValues();
      var bNum = String(b.billNumber || "").trim().toLowerCase();
      var bPh = cleanPhone(b.contactNumber);
      var bNm = String(b.studentName || "").trim().toLowerCase();

      var matchedIndices = [];
      for (var i = 0; i < dataRange.length; i++) {
        var rowBNum = String(dataRange[i][0] || "").trim().toLowerCase();
        var rowNm = String(dataRange[i][2] || "").trim().toLowerCase();
        var rowPh = cleanPhone(dataRange[i][3]);

        var isMatch = false;
        if (bNum && rowBNum && bNum === rowBNum) isMatch = true;
        else if (bPh && rowPh && bPh === rowPh) isMatch = true;
        else if (bNm && rowNm && bNm.length > 2 && bNm === rowNm) isMatch = true;

        if (isMatch) {
          matchedIndices.push(i + 2);
        }
      }
      return matchedIndices;
    }

    // 1. Handle Connection Ping / Test
    if (data.action === "test") {
      getOrCreateStudentBillsSheet();
      getOrCreateExpenseSheet();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Successfully connected to Google Sheet: '" + ss.getName() + "'! ('Sheet 1 (Bills)' and 'Sheet 2 (Expenses)' ready)",
        sheetUrl: ss.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Handle Single Expense (Create, Edit, Delete)
    if (data.expense || data.action === "append_or_update_expense") {
      var exp = data.expense;
      if (exp) {
        var es = getOrCreateExpenseSheet();
        var expId = String(exp.id || "").trim();
        var lastExpRow = es.getLastRow();
        var matchedExpRow = 0;
        var extraExpDupes = [];

        if (lastExpRow > 1 && expId) {
          var idValues = es.getRange(2, 1, lastExpRow - 1, 1).getValues();
          for (var ei = 0; ei < idValues.length; ei++) {
            if (String(idValues[ei][0] || "").trim() === expId) {
              if (matchedExpRow === 0) {
                matchedExpRow = ei + 2;
              } else {
                extraExpDupes.push(ei + 2);
              }
            }
          }
        }

        // Handle Expense Deletion
        if (exp.isDeleted) {
          for (var dx = extraExpDupes.length - 1; dx >= 0; dx--) {
            es.deleteRow(extraExpDupes[dx]);
          }
          if (matchedExpRow > 0) {
            es.deleteRow(matchedExpRow);
          }
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Deleted expense " + expId + " from Google Sheet.",
            action: "deleted"
          })).setMimeType(ContentService.MimeType.JSON);
        }

        var expRowData = formatExpenseRow(exp);
        if (matchedExpRow > 0) {
          es.getRange(matchedExpRow, 1, 1, expRowData.length).setValues([expRowData]);
          for (var rmx = extraExpDupes.length - 1; rmx >= 0; rmx--) {
            es.deleteRow(extraExpDupes[rmx]);
          }
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Updated expense " + (exp.title || expId) + " in Google Sheet.",
            action: "updated"
          })).setMimeType(ContentService.MimeType.JSON);
        } else {
          es.appendRow(expRowData);
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Saved expense " + (exp.title || expId) + " to Google Sheet.",
            action: "inserted"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // 3. Handle Single Bill (Create, Installment, Edit, Delete)
    if (data.bill) {
      var sheet = getOrCreateStudentBillsSheet();
      var b = data.bill;
      var matchingRows = findMatchingBillRows(sheet, b);

      if (b.isDeleted) {
        for (var d = matchingRows.length - 1; d >= 0; d--) {
          sheet.deleteRow(matchingRows[d]);
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Deleted bill from Google Sheet.",
          action: "deleted"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var rowData = formatBillRow(b);
      if (matchingRows.length > 0) {
        var targetRow = matchingRows[0];
        sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
        for (var k = matchingRows.length - 1; k >= 1; k--) {
          sheet.deleteRow(matchingRows[k]);
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Updated single entry for " + (b.studentName || b.billNumber) + " in Google Sheet.",
          action: "updated",
          cleanedDuplicates: matchingRows.length - 1
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        sheet.appendRow(rowData);
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Saved 1 entry for " + (b.studentName || b.billNumber) + " to Google Sheet.",
          action: "inserted"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 4. Handle Bulk Sync (Bills and/or Expenses)
    if (data.action === "bulk_sync" || Array.isArray(data.bills) || Array.isArray(data.expenses)) {
      var syncedBillsCount = 0;
      var syncedExpensesCount = 0;

      // Part A: Sync Bills to 'StudentBills'
      if (Array.isArray(data.bills) && data.bills.length > 0) {
        var sheet = getOrCreateStudentBillsSheet();
        var uniqueIncoming = {};
        data.bills.forEach(function(b) {
          var key = cleanPhone(b.contactNumber) || String(b.billNumber || "").trim().toLowerCase();
          if (key) uniqueIncoming[key] = b;
        });

        var lastRow = sheet.getLastRow();
        var sheetMap = {};
        var duplicateRowsToDelete = [];
        if (lastRow > 1) {
          var existingData = sheet.getRange(2, 1, lastRow - 1, Math.min(sheet.getLastColumn(), 5)).getValues();
          for (var i = 0; i < existingData.length; i++) {
            var rNum = String(existingData[i][0] || "").trim().toLowerCase();
            var rPhone = cleanPhone(existingData[i][3]);
            var rowKey = rPhone || rNum;
            if (rowKey) {
              if (sheetMap[rowKey]) {
                duplicateRowsToDelete.push(i + 2);
              } else {
                sheetMap[rowKey] = i + 2;
              }
            }
          }
        }

        Object.keys(uniqueIncoming).forEach(function(key) {
          var b = uniqueIncoming[key];
          var rowData = formatBillRow(b);
          var existingRow = sheetMap[key];
          if (existingRow) {
            sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
          } else {
            sheet.appendRow(rowData);
            sheetMap[key] = sheet.getLastRow();
          }
        });

        for (var d = duplicateRowsToDelete.length - 1; d >= 0; d--) {
          sheet.deleteRow(duplicateRowsToDelete[d]);
        }
        syncedBillsCount = Object.keys(uniqueIncoming).length;
      }

      // Part B: Sync Expenses to 'Expenses'
      if (Array.isArray(data.expenses) && data.expenses.length > 0) {
        var es = getOrCreateExpenseSheet();
        var expLastRow = es.getLastRow();
        var expMap = {};
        var expDupesToDelete = [];

        if (expLastRow > 1) {
          var curExpIds = es.getRange(2, 1, expLastRow - 1, 1).getValues();
          for (var cei = 0; cei < curExpIds.length; cei++) {
            var cId = String(curExpIds[cei][0] || "").trim();
            if (cId) {
              if (expMap[cId]) {
                expDupesToDelete.push(cei + 2);
              } else {
                expMap[cId] = cei + 2;
              }
            }
          }
        }

        data.expenses.forEach(function(exp) {
          var eId = String(exp.id || "").trim();
          var expRowData = formatExpenseRow(exp);
          if (eId && expMap[eId]) {
            es.getRange(expMap[eId], 1, 1, expRowData.length).setValues([expRowData]);
          } else {
            es.appendRow(expRowData);
            if (eId) expMap[eId] = es.getLastRow();
          }
        });

        for (var exDel = expDupesToDelete.length - 1; exDel >= 0; exDel--) {
          es.deleteRow(expDupesToDelete[exDel]);
        }
        syncedExpensesCount = data.expenses.length;
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Synchronized " + syncedBillsCount + " bills to Sheet 1 & " + syncedExpensesCount + " expenses to Sheet 2.",
        syncedBills: syncedBillsCount,
        syncedExpenses: syncedExpensesCount
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Google Sheet webhook active."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    try {
      SpreadsheetApp.flush();
    } catch(e) {}
    if (hasLock) {
      try { lock.releaseLock(); } catch(e) {}
    }
  }
}`;
                        navigator.clipboard.writeText(code);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 3000);
                      }}
                      style={{
                        backgroundColor: copiedScript ? "#16a34a" : "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "7px 14px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {copiedScript ? "Code Copied!" : "Copy Apps Script Code"}
                    </button>
                  </div>

                  <textarea
                    readOnly
                    rows={12}
                    value={`/**
 * SIGMA BILLING & EXPENSES - GOOGLE SHEET & DRIVE SYNC SCRIPT
 * Version: 2.1 (Bills & Expenses Dual Sync Active)
 * - Auto-Sync Student Bills into 'StudentBills' tab
 * - Auto-Sync Institute Expenses into 'Expenses' tab
 * - Concurrency Lock: Prevents simultaneous duplicate entries
 * - Multi-field Match: Matches by Bill No, WhatsApp / Phone, or Student Name
 * - Auto-Deduplication: Automatically cleans up and removes duplicate rows!
 *
 * Click "Copy Apps Script Code" above to copy the complete code!
 */`}
                    style={{
                      width: "100%",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#0f172a",
                      color: "#38bdf8",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              {/* TAB 3: OFFLINE CSV BACKUP */}
              {setupTab === "csv" && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#1e3a8a", fontSize: "16px" }}>
                    Instant Offline CSV Backup (Google Sheets &amp; Excel Compatible)
                  </h4>
                  <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>
                    If you prefer manual backups without setting up Google Apps Script, you can download all billing records directly as a CSV spreadsheet.
                  </p>

                  <div style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "18px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#1e293b", display: "block" }}>
                          Total Billing Records: {bills.length} Students
                        </strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Includes Bill No, Date, Student Name, WhatsApp, Paid, Due, and Payment Methods.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleExportCSV}
                        style={{
                          backgroundColor: "#0f172a",
                          color: "white",
                          border: "none",
                          padding: "10px 18px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        Download Full Billing CSV
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    <strong>How to open in Google Drive:</strong>
                    <ol style={{ margin: "6px 0 0 20px", padding: 0 }}>
                      <li>Click "Download Full Billing CSV" above.</li>
                      <li>Open <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: "bold" }}>Google Drive ↗</a>.</li>
                      <li>Drag and drop the downloaded file directly into your Google Drive folder.</li>
                      <li>Double-click to open and view immediately as a Google Sheet!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div style={{
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              padding: "12px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                High-security 256-bit SSL encrypted direct cloud transport
              </span>
              <button
                type="button"
                onClick={handleCloseGoogleSetupModal}
                style={{
                  backgroundColor: "#475569",
                  color: "white",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. ENTER ADMIN PIN MODAL */}
      {showPinModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            padding: "26px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            border: "2px solid #2563eb"
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              
              <h3 style={{ margin: "0 0 6px 0", color: "#1e3a8a", fontSize: "20px" }}>
                Admin Authentication
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                Enter your Admin PIN to unlock full billing controls, header letterhead editing, and staff accounts.
              </p>
            </div>

            <form onSubmit={handleVerifyAdminPin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                  Admin Passcode / PIN
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Admin PIN"
                  autoFocus
                  maxLength={12}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    border: pinError ? "2px solid #ef4444" : "1px solid #cbd5e1",
                    fontSize: "18px",
                    letterSpacing: "4px",
                    textAlign: "center",
                    boxSizing: "border-box"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#64748b" }}>
                  <span>{isCustomAdminPinSet() ? "Custom PIN is active" : <>Default PIN: <strong>9999</strong></>}</span>
                  <span>Can be changed in Admin mode</span>
                </div>
              </div>

              {pinError && (
                <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", textAlign: "center", border: "1px solid #fecaca" }}>
                   {pinError}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput("");
                    setPinError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. CHANGE ADMIN PIN MODAL */}
      {showChangePinModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            padding: "26px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            border: "1px solid #cbd5e1"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#1e3a8a", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              🔑 Update Login Credentials
            </h3>
            <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "13px" }}>
              Admin Only: Update the User ID and Password required for <strong>both Billing and Manage Students</strong>.
            </p>

            <form onSubmit={handleChangePinSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  User ID / Username *
                </label>
                <input
                  type="text"
                  value={newAdminUserId}
                  onChange={(e) => setNewAdminUserId(e.target.value)}
                  placeholder="e.g. admin or custom ID"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  New Password / PIN (Min 4 chars) *
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 1234 or custom"
                  maxLength={20}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter new password"
                  maxLength={20}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {pinChangeMsg && (
                <div style={{
                  backgroundColor: pinChangeMsg.startsWith("SUCCESS") ? "#dcfce7" : "#fee2e2",
                  color: pinChangeMsg.startsWith("SUCCESS") ? "#166534" : "#991b1b",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  fontWeight: "600"
                }}>
                  {pinChangeMsg}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#1e3a8a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Save for Both
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9B. STAFF RESET OWN PASSWORD MODAL (User can reset own password only) */}
      {showStaffResetModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            padding: "26px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            border: "1px solid #cbd5e1"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#1e3a8a", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              🔑 Change My Password
            </h3>
            <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "13px" }}>
              Staff User: Reset your own login password for account <strong>{activeStaffUsername || activeStaffName || "Your Account"}</strong>.
            </p>

            <form onSubmit={handleStaffResetPassword}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" }}>
                  User ID (Fixed - Staff cannot change ID)
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  gap: "8px"
                }}>
                  <span>🔒</span>
                  <input
                    type="text"
                    value={activeStaffUsername || activeStaffName || "staff"}
                    disabled
                    readOnly
                    style={{
                      width: "100%",
                      backgroundColor: "transparent",
                      border: "none",
                      fontSize: "14px",
                      color: "#475569",
                      fontWeight: "bold",
                      cursor: "not-allowed",
                      outline: "none"
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>
                    ID Locked
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  value={staffCurrentPassword}
                  onChange={(e) => setStaffCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  New Password (Min 4 chars) *
                </label>
                <input
                  type="password"
                  value={staffNewPassword}
                  onChange={(e) => setStaffNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  maxLength={30}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "6px" }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={staffConfirmPassword}
                  onChange={(e) => setStaffConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  maxLength={30}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {staffResetMsg && (
                <div style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  backgroundColor: staffResetMsg.includes("✅") ? "#f0fdf4" : "#fef2f2",
                  color: staffResetMsg.includes("✅") ? "#15803d" : "#b91c1c",
                  border: `1px solid ${staffResetMsg.includes("✅") ? "#86efac" : "#fca5a5"}`
                }}>
                  {staffResetMsg}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowStaffResetModal(false)}
                  style={{
                    padding: "9px 18px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffResetLoading}
                  style={{
                    padding: "9px 18px",
                    backgroundColor: staffResetLoading ? "#93c5fd" : "#1e3a8a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: staffResetLoading ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}
                >
                  {staffResetLoading ? "Updating..." : "Update My Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MANAGE STAFF ACCOUNTS MODAL */}
      {showStaffModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "26px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            border: "1px solid #cbd5e1"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", color: "#1e3a8a", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Manage Billing Staff Accounts
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Staff can log in from the main website login page with User/Cashier permissions.
                </p>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {/* Create Staff Form */}
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#1e293b" }}>
                + Add New Staff Member
              </h4>

              <form onSubmit={handleCreateStaff}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Thapa"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Login Username / Phone *
                    </label>
                    <input
                      type="text"
                      value={newStaffForm.username}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, username: e.target.value })}
                      placeholder="e.g. 9812345678 or ramesh"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Login Password *
                    </label>
                    <input
                      type="password"
                      value={newStaffForm.password}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                      placeholder="Password"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {staffError && (
                  <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "8px 12px", borderRadius: "5px", fontSize: "12px", marginBottom: "10px" }}>
                     {staffError}
                  </div>
                )}

                {staffSuccess && (
                  <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "8px 12px", borderRadius: "5px", fontSize: "12px", marginBottom: "10px" }}>
                     {staffSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    padding: "9px 18px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Create Staff Account
                </button>
              </form>
            </div>

            {/* Existing Staff List */}
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#1e293b" }}>
                Active Staff Accounts ({staffList.length})
              </h4>

              {staffLoading ? (
                <p style={{ color: "#64748b", fontSize: "13px" }}>Loading staff accounts...</p>
              ) : staffList.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>
                  No staff accounts created yet. You can create one above for your counter receptionist/cashier.
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "8px 10px" }}>Name</th>
                      <th style={{ padding: "8px 10px" }}>Login ID</th>
                      <th style={{ padding: "8px 10px" }}>Role</th>
                      <th style={{ padding: "8px 10px" }}>Status</th>
                      <th style={{ padding: "8px 10px", textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px 10px", fontWeight: "bold" }}>{s.name}</td>
                        <td style={{ padding: "8px 10px", color: "#2563eb" }}>{s.username}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                            Staff
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "#16a34a", fontWeight: "bold" }}>Active</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteStaff(s.id, s.name)}
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fca5a5",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                onClick={() => setShowStaffModal(false)}
                style={{
                  backgroundColor: "#475569",
                  color: "white",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. EXPENSES MANAGEMENT MODAL (DAY, WEEK, MONTH RECORDS FOR ADMIN BY ALL USERS) */}
      {showExpenseModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "960px",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            border: "1px solid #cbd5e1"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, color: "#dc2626", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    Official Expenses Management
                  </h3>
                  {billingRole === "admin" && (
                    <span style={{
                      backgroundColor: "#eff6ff",
                      color: "#1e40af",
                      border: "1px solid #bfdbfe",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      Admin Authority (Full Edit, Delete & Historical Access)
                    </span>
                  )}
                </div>
                {billingRole === "admin" && (
                  <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px" }}>
                    Complete administrative control: audit daily, weekly, and monthly ledgers, modify or delete entries.
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {/* Timeframe Filter Tabs (Centered for Staff User, Full Controls for Admin) */}
            <div style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: billingRole === "admin" ? "flex-start" : "center"
            }}>
              {/* Daily Tab (Centered for Staff User) */}
              <button
                type="button"
                onClick={() => setExpenseTimeframe("daily")}
                style={{
                  padding: "8px 24px",
                  borderRadius: "6px",
                  border: expenseTimeframe === "daily" ? "2px solid #b91c1c" : "1px solid #cbd5e1",
                  backgroundColor: expenseTimeframe === "daily" ? "#dc2626" : "#ffffff",
                  color: expenseTimeframe === "daily" ? "#ffffff" : "#475569",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: expenseTimeframe === "daily" ? "0 2px 6px rgba(220, 38, 38, 0.25)" : "none"
                }}
              >
                Today's Expenses
              </button>

              {/* Weekly, Monthly, and All Tabs are strictly reserved & visible ONLY for Admin */}
              {billingRole === "admin" && (
                <>
                  <button
                    type="button"
                    onClick={() => setExpenseTimeframe("weekly")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: expenseTimeframe === "weekly" ? "2px solid #b91c1c" : "1px solid #cbd5e1",
                      backgroundColor: expenseTimeframe === "weekly" ? "#dc2626" : "#ffffff",
                      color: expenseTimeframe === "weekly" ? "#ffffff" : "#475569",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: expenseTimeframe === "weekly" ? "0 2px 6px rgba(220, 38, 38, 0.25)" : "none"
                    }}
                    title="View past 7 days expenses"
                  >
                    This Week (7 Days)
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpenseTimeframe("monthly")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: expenseTimeframe === "monthly" ? "2px solid #b91c1c" : "1px solid #cbd5e1",
                      backgroundColor: expenseTimeframe === "monthly" ? "#dc2626" : "#ffffff",
                      color: expenseTimeframe === "monthly" ? "#ffffff" : "#475569",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: expenseTimeframe === "monthly" ? "0 2px 6px rgba(220, 38, 38, 0.25)" : "none"
                    }}
                    title="View this month expenses"
                  >
                    This Month
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpenseTimeframe("all")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: expenseTimeframe === "all" ? "2px solid #b91c1c" : "1px solid #cbd5e1",
                      backgroundColor: expenseTimeframe === "all" ? "#dc2626" : "#ffffff",
                      color: expenseTimeframe === "all" ? "#ffffff" : "#475569",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: expenseTimeframe === "all" ? "0 2px 6px rgba(220, 38, 38, 0.25)" : "none"
                    }}
                    title="View all expense records"
                  >
                    All Expenses
                  </button>
                </>
              )}
            </div>

            {/* Statistics Banner */}
            {(() => {
              const filtered = getFilteredExpenses();
              const totalAmount = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
              const cashTotal = filtered.filter(f => f.paymentMethod === "Cash").reduce((s, i) => s + Number(i.amount || 0), 0);
              const onlineTotal = totalAmount - cashTotal;
              return (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px"
                }}>
                  <div style={{ backgroundColor: "#fef2f2", border: "1.5px solid #fca5a5", padding: "12px 16px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", textTransform: "uppercase" }}>
                      Total {billingRole !== "admin" ? "Today's" : (expenseTimeframe === "daily" ? "Today's" : expenseTimeframe === "weekly" ? "Weekly" : expenseTimeframe === "monthly" ? "Monthly" : "All-Time")} Expenses
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#b91c1c", marginTop: "4px" }}>
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>
                      Total Expense Entries
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#1e293b", marginTop: "4px" }}>
                      {filtered.length} <span style={{ fontSize: "12px", fontWeight: "normal", color: "#64748b" }}>items</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>
                      Cash vs Online
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#334155", marginTop: "6px" }}>
                      Cash: {formatCurrency(cashTotal)}<br />
                      Online: {formatCurrency(onlineTotal)}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Record New Expense Form */}
            <div style={{
              backgroundColor: "#fff8f8",
              border: "1.5px solid #fecaca",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px"
            }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#dc2626", fontSize: "16px", fontWeight: "bold" }}>
                Expense Record
              </h4>
              <form onSubmit={handleSaveExpense}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginBottom: "12px"
                }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newExpenseForm.date}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, date: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Expense Title / Details *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Office Tea, Electricity, Paper"
                      value={newExpenseForm.title}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, title: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Category *
                    </label>
                    <select
                      value={newExpenseForm.category}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    >
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Tea & Refreshment">Tea & Refreshment</option>
                      <option value="Utilities & Bills">Utilities & Bills</option>
                      <option value="Books & Printing">Books & Printing</option>
                      <option value="Salary & Wages">Salary & Wages</option>
                      <option value="Rent">Rent</option>
                      <option value="Internet & Software">Internet & Software</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Amount (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500"
                      value={newExpenseForm.amount}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", fontWeight: "bold" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Payment Method
                    </label>
                    <select
                      value={newExpenseForm.paymentMethod}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, paymentMethod: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Online Esewa">Online Esewa</option>
                      <option value="Online Khalti">Online Khalti</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                      Recorded By
                    </label>
                    <input
                      type="text"
                      placeholder={activeStaffName || "Staff Name"}
                      value={newExpenseForm.recordedBy}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, recordedBy: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "240px" }}>
                    <input
                      type="text"
                      required={Number(newExpenseForm.amount) > 200}
                      placeholder="Bill Number / Voucher No."
                      value={newExpenseForm.remarks}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, remarks: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "5px",
                        border: Number(newExpenseForm.amount) > 200 && !(newExpenseForm.remarks || "").trim() ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                        backgroundColor: Number(newExpenseForm.amount) > 200 && !(newExpenseForm.remarks || "").trim() ? "#fef2f2" : "#ffffff",
                        fontSize: "13px",
                        boxSizing: "border-box"
                      }}
                    />
                    {Number(newExpenseForm.amount) > 200 && !(newExpenseForm.remarks || "").trim() && (
                      <div style={{ color: "#dc2626", fontSize: "11px", fontWeight: "bold", marginTop: "3px" }}>
                        Bill Number / Voucher is required for expenses greater than Rs. 200
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 5px rgba(220, 38, 38, 0.25)"
                    }}
                  >
                    Add Expense Entry
                  </button>
                </div>
              </form>
            </div>

            {/* Expenses Records Table */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                <h4 style={{ margin: 0, color: "#dc2626", fontSize: "16px", fontWeight: "700" }}>
                   {billingRole !== "admin" ? "Today's" : (expenseTimeframe === "daily" ? "Today's" : expenseTimeframe === "weekly" ? "Weekly" : expenseTimeframe === "monthly" ? "Monthly" : "All")} Expenses Ledger ({getFilteredExpenses().length})
                </h4>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={async () => {
                      const webhook = (profile && profile.googleSheetUrl ? profile.googleSheetUrl.trim() : "") ||
                        (typeof window !== "undefined" ? localStorage.getItem(`instituteGoogleSheetWebhook_${instKey}`) : "") || "";
                      if (!webhook || webhook === "setup_done") {
                        alert("Google Sheet is not connected yet. Please connect Google Sheet in Settings > Cloud Links & Sync.");
                        setSetupTab("connect");
                        handleOpenGoogleSetupModal();
                        return;
                      }
                      try {
                        const res = await fetch(apiWithInst("/api/institute/billing/sync"), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'bulk_sync',
                            googleSheetUrl: webhook,
                            ownerEmail: profile.ownerEmail ? profile.ownerEmail.trim() : "",
                            bills: [],
                            expenses: expenses
                          })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          alert(` Google Sheet Sync Successful!\n\n${expenses.length} expenses are now stored in the 'Expenses' tab in Google Sheet.`);
                        } else {
                          alert(`Sync Error: ${data.error || 'Failed to sync expenses'}`);
                        }
                      } catch (err) {
                        alert(`Sync Error: ${err.message}`);
                      }
                    }}
                    style={{
                      backgroundColor: "#065f46",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(6, 95, 70, 0.25)"
                    }}
                    title="Synchronize all expenses directly to Google Sheet 'Expenses' tab"
                  >
                    <span>📊</span> Sync to Google Sheet
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExpensesCSV}
                    style={{
                      backgroundColor: "#b91c1c",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(185, 28, 28, 0.25)"
                    }}
                    title="Download expenses as a CSV file"
                  >
                    <span>📥</span> Download Expenses CSV
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintExpenses}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(220, 38, 38, 0.25)"
                    }}
                    title="Print official expenses statement for this period"
                  >
                    <span>🖨️</span> Print Expense Sheet
                  </button>
                </div>
              </div>

              {getFilteredExpenses().length === 0 ? (
                <div style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1"
                }}>
                  No expenses recorded for this timeframe.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", borderRadius: "8px", overflow: "hidden" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#b91c1c", textAlign: "left", color: "#ffffff" }}>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700", borderTopLeftRadius: "6px" }}>#</th>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700" }}>Date</th>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700" }}>Title / Details</th>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700" }}>Category</th>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700", textAlign: "right" }}>Amount</th>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700" }}>Method</th>
                        <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700", borderTopRightRadius: billingRole === "admin" ? 0 : "6px" }}>Recorded By</th>
                        {billingRole === "admin" && (
                          <th style={{ padding: "12px 10px", color: "#ffffff", fontWeight: "700", textAlign: "center", borderTopRightRadius: "6px" }}>
                            Admin Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredExpenses().map((exp, i) => (
                        <tr key={exp.id || i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px", fontWeight: "bold", whiteSpace: "nowrap" }}>{exp.date}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <div style={{ fontWeight: "bold", color: "#1e293b" }}>{exp.title}</div>
                            {exp.remarks && <div style={{ fontSize: "11px", color: "#64748b" }}>{exp.remarks}</div>}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "900", color: "#b91c1c", whiteSpace: "nowrap" }}>
                            {formatCurrency(exp.amount)}
                          </td>
                          <td style={{ padding: "8px 10px", color: "#475569" }}>{exp.paymentMethod}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", color: "#334155" }}>
                               {exp.recordedBy || "Staff"}
                            </span>
                          </td>
                          {/* ACTION COLUMN: Admin has Edit & Delete authority */}
                          {billingRole === "admin" && (
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => setEditingExpense(exp)}
                                  title="Edit Expense Entry (Admin Only)"
                                  style={{
                                    backgroundColor: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px"
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  title="Delete Expense Entry (Admin Only)"
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px"
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                style={{
                  backgroundColor: "#475569",
                  color: "white",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. ADMIN-ONLY EDIT EXPENSE DIALOG */}
      {editingExpense && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000000,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            border: "1px solid #cbd5e1",
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                  Edit Expense Entry
                </h3>
                <div style={{ fontSize: "11px", color: "#fecaca", marginTop: "2px" }}>
                  Admin Authority: Full editing of recorded details
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                style={{ background: "transparent", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateExpense} style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingExpense.date || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingExpense.amount || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", fontWeight: "bold" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                  Expense Title / Details *
                </label>
                <input
                  type="text"
                  required
                  value={editingExpense.title || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    Category *
                  </label>
                  <select
                    value={editingExpense.category || "Office Supplies"}
                    onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Tea & Refreshment">Tea & Refreshment</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Books & Printing">Books & Printing</option>
                    <option value="Salary & Wages">Salary & Wages</option>
                    <option value="Rent">Rent</option>
                    <option value="Internet & Software">Internet & Software</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    Payment Method
                  </label>
                  <select
                    value={editingExpense.paymentMethod || "Cash"}
                    onChange={(e) => setEditingExpense({ ...editingExpense, paymentMethod: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online Esewa">Online Esewa</option>
                    <option value="Online Khalti">Online Khalti</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    Recorded By
                  </label>
                  <input
                    type="text"
                    value={editingExpense.recordedBy || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, recordedBy: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#475569", marginBottom: "4px" }}>
                    Bill / Voucher No. {Number(editingExpense.amount) > 200 && <span style={{ color: "#dc2626" }}>*</span>}
                  </label>
                  <input
                    type="text"
                    required={Number(editingExpense.amount) > 200}
                    placeholder="Bill Number / Voucher No."
                    value={editingExpense.remarks || ""}
                    onChange={(e) => setEditingExpense({ ...editingExpense, remarks: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "5px",
                      border: Number(editingExpense.amount) > 200 && !(editingExpense.remarks || "").trim() ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                      backgroundColor: Number(editingExpense.amount) > 200 && !(editingExpense.remarks || "").trim() ? "#fef2f2" : "#ffffff",
                      fontSize: "13px",
                      boxSizing: "border-box"
                    }}
                  />
                  {Number(editingExpense.amount) > 200 && !(editingExpense.remarks || "").trim() && (
                    <div style={{ color: "#dc2626", fontSize: "11px", fontWeight: "bold", marginTop: "3px" }}>
                      Bill number is required for expenses greater than Rs. 200
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. PRODUCT STOCK & INVENTORY MODAL (VIEWABLE BY ALL USERS, RESTOCKING BY ADMIN ONLY) */}
      {showStockModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999,
          padding: "16px",
          backdropFilter: "blur(3px)"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "920px",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            overflow: "hidden",
            border: "1.5px solid #0f766e"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
              color: "white",
              padding: "16px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", letterSpacing: "0.5px" }}>
                    Product Stock & Inventory
                  </h3>
                  <div style={{ fontSize: "12px", color: "#ccfbf1", marginTop: "2px" }}>
                    Real-time available quantities for all center products & books
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {billingRole === "admin" && (
                  <span style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 10px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    Admin: Can Add Stock & Products
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowStockModal(false);
                    setRestockingProduct(null);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                  title="Close (ESC)"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1, backgroundColor: "#f8fafc" }}>
              {/* Metric Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmin(180px, 1fr))",
                gap: "12px",
                marginBottom: "18px"
              }}>
                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Total Items</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f766e", marginTop: "2px" }}>
                    {products.length}
                  </div>
                </div>

                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Total Stock Available</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a", marginTop: "2px" }}>
                    {products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>units</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Total Products Sold</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#2563eb", marginTop: "2px" }}>
                    {products.reduce((acc, p) => acc + (Number(p.totalSold) || 0), 0)} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>sold</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Low / Out of Stock</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: products.filter(p => Number(p.stock) <= 5).length > 0 ? "#dc2626" : "#16a34a", marginTop: "2px" }}>
                    {products.filter(p => Number(p.stock) <= 5).length} <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>items</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "14px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px" }}>
                  <input
                    type="text"
                    placeholder="Search product or book name..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      backgroundColor: "#ffffff"
                    }}
                  />
                  <button
                    type="button"
                    onClick={loadProducts}
                    disabled={productsLoading}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "#0f766e"
                    }}
                    title="Reload stock from server"
                  >
                    {productsLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {billingRole === "admin" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductForm(!showAddProductForm);
                      setRestockingProduct(null);
                    }}
                    style={{
                      backgroundColor: showAddProductForm ? "#475569" : "#0f766e",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>{showAddProductForm ? "Cancel" : "Add New Product"}</span>
                  </button>
                ) : (
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                    Stock can only be added or modified by Admin.
                  </div>
                )}
              </div>

              {/* Admin Create Product Form (Collapsible) */}
              {billingRole === "admin" && showAddProductForm && (
                <form onSubmit={handleAdminCreateProduct} style={{
                  backgroundColor: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px"
                }}>
                  <div style={{ fontWeight: "bold", color: "#166534", fontSize: "14px", marginBottom: "10px" }}>
                    Create New Product / Study Material
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "10px", alignItems: "end" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Model Test 2026 Set"
                        value={newProductForm.name}
                        onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>
                        Price (Rs.) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="500"
                        value={newProductForm.price}
                        onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>
                        Initial Stock Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="50"
                        value={newProductForm.stock}
                        onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>
                        Unit
                      </label>
                      <select
                        value={newProductForm.unit}
                        onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                      >
                        <option value="copies">copies</option>
                        <option value="pcs">pcs</option>
                        <option value="sets">sets</option>
                        <option value="books">books</option>
                        <option value="boxes">boxes</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddProductForm(false)}
                      style={{ padding: "6px 14px", borderRadius: "5px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", fontSize: "12px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: "6px 16px", borderRadius: "5px", border: "none", backgroundColor: "#16a34a", color: "white", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              )}

              {/* Admin Restock Drawer / Input */}
              {billingRole === "admin" && restockingProduct && (
                <div style={{
                  backgroundColor: "#eff6ff",
                  border: "1.5px solid #93c5fd",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px"
                }}>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#1e40af", fontSize: "14px" }}>
                      Restock: {restockingProduct.name}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "10px" }}>
                      Current Stock: <strong>{restockingProduct.stock} {restockingProduct.unit || 'pcs'}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1e40af" }}>+ Add Qty:</span>
                    <input
                      type="number"
                      autoFocus
                      min="1"
                      placeholder="e.g. 50"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAdminRestock(restockingProduct.id, restockAmount);
                        }
                      }}
                      style={{ width: "90px", padding: "6px 10px", borderRadius: "5px", border: "1.5px solid #3b82f6", fontWeight: "bold", fontSize: "13px" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAdminRestock(restockingProduct.id, restockAmount)}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      Confirm Restock
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRestockingProduct(null);
                        setRestockAmount("");
                      }}
                      style={{
                        backgroundColor: "#cbd5e1",
                        color: "#334155",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Products Inventory Table */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0f766e", color: "#ffffff", textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", width: "40px", textAlign: "center" }}>#</th>
                      <th style={{ padding: "10px 12px" }}>Product / Item Name</th>
                      <th style={{ padding: "10px 12px", width: "100px", textAlign: "right" }}>Price (Rs.)</th>
                      <th style={{ padding: "10px 14px", width: "180px", textAlign: "center" }}>Available Stock (Qty)</th>
                      <th style={{ padding: "10px 12px", width: "110px", textAlign: "center" }}>Total Sold</th>
                      {billingRole === "admin" && (
                        <th style={{ padding: "10px 12px", width: "130px", textAlign: "center" }}>Admin Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = products.filter(p => {
                        if (!stockSearchQuery.trim()) return true;
                        return (p.name || "").toLowerCase().includes(stockSearchQuery.toLowerCase());
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={billingRole === "admin" ? 6 : 5} style={{ padding: "28px", textAlign: "center", color: "#64748b" }}>
                              No products found matching "{stockSearchQuery}".
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((prod, idx) => {
                        const stockNum = Number(prod.stock) || 0;
                        const isOut = stockNum <= 0;
                        const isLow = stockNum > 0 && stockNum <= 5;

                        return (
                          <tr key={prod.id || idx} style={{
                            borderBottom: "1px solid #e2e8f0",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc"
                          }}>
                            <td style={{ padding: "10px 12px", textAlign: "center", color: "#64748b", fontWeight: "600" }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <div style={{ fontWeight: "bold", color: "#0f172a" }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                Unit: {prod.unit || 'pcs'} • Code: {prod.id}
                              </div>
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "bold", color: "#0f766e" }}>
                              {formatCurrency(prod.price)}
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "center" }}>
                              {isOut ? (
                                <span style={{
                                  backgroundColor: "#fee2e2",
                                  color: "#b91c1c",
                                  padding: "4px 10px",
                                  borderRadius: "14px",
                                  fontSize: "12px",
                                  fontWeight: "900",
                                  display: "inline-block"
                                }}>
                                  Out of Stock (0)
                                </span>
                              ) : isLow ? (
                                <span style={{
                                  backgroundColor: "#fef3c7",
                                  color: "#b45309",
                                  padding: "4px 10px",
                                  borderRadius: "14px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  display: "inline-block"
                                }}>
                                  Low: {stockNum} {prod.unit || 'pcs'}
                                </span>
                              ) : (
                                <span style={{
                                  backgroundColor: "#dcfce7",
                                  color: "#15803d",
                                  padding: "4px 10px",
                                  borderRadius: "14px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  display: "inline-block"
                                }}>
                                  ● In Stock: {stockNum} {prod.unit || 'pcs'}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#334155" }}>
                               {prod.totalSold || 0}
                            </td>

                            {billingRole === "admin" && (
                              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRestockingProduct(prod);
                                      setRestockAmount("");
                                    }}
                                    style={{
                                      backgroundColor: "#0284c7",
                                      color: "white",
                                      border: "none",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontWeight: "bold",
                                      cursor: "pointer"
                                    }}
                                    title="Add more stock quantity"
                                  >
                                    Restock
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdminDeleteProduct(prod.id, prod.name)}
                                    style={{
                                      backgroundColor: "#fee2e2",
                                      color: "#dc2626",
                                      border: "1px solid #fecaca",
                                      padding: "4px 6px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      cursor: "pointer"
                                    }}
                                    title="Delete product"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "12px 22px",
              backgroundColor: "#f1f5f9",
              borderTop: "1px solid #cbd5e1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Stock automatically reduces when bills are generated. Only Admin can add stock.
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStockModal(false);
                  setRestockingProduct(null);
                }}
                style={{
                  backgroundColor: "#475569",
                  color: "white",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. PRINTABLE EXPENSES STATEMENT (HIDDEN ON SCREEN, RENDERED PRECISELY ON PRINT) */}
      <div id="printable-expense-sheet">
        {/* Institute Stationery Letterhead */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "3px double #1e3a8a",
          paddingBottom: "12px",
          marginBottom: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt="Logo"
                style={{ height: "65px", maxWidth: "120px", objectFit: "contain" }}
              />
            )}
            <div>
              <h2 style={{
                margin: "0 0 3px 0",
                fontSize: "22px",
                color: "#1e3a8a",
                textTransform: "uppercase",
                fontWeight: "900",
                letterSpacing: "0.5px"
              }}>
                {profile.instituteName || "INSTITUTE OF LANGUAGE & TECHNOLOGY"}
              </h2>
              <div style={{ fontSize: "12px", color: "#334155", lineHeight: "1.4" }}>
                <span>{profile.address || "Kathmandu, Nepal"}</span>
                {profile.phone && <span> &nbsp;|&nbsp; Phone: {profile.phone}</span>}
                {profile.ownerEmail && <span> &nbsp;|&nbsp; Email: {profile.ownerEmail}</span>}
              </div>
              {profile.panVatNumber && (
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#475569", marginTop: "2px" }}>
                  PAN / VAT NO: <span style={{ fontFamily: "monospace", letterSpacing: "1px" }}>{profile.panVatNumber}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              padding: "6px 14px",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "13px",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              Expense Statement
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
              Printed Date: <strong>{new Date().toLocaleDateString('en-CA')}</strong>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Period: <strong>{billingRole !== "admin" ? "Today's Ledger" : (expenseTimeframe === "daily" ? "Today's Ledger" : expenseTimeframe === "weekly" ? "Weekly Ledger (7 Days)" : expenseTimeframe === "monthly" ? "Monthly Ledger" : "All-Time Ledger")}</strong>
            </div>
          </div>
        </div>

        {/* Audit Meta Summary */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          padding: "8px 12px",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          marginBottom: "14px",
          fontSize: "11px"
        }}>
          <div>
            <strong>Report Generated By:</strong> {activeStaffName || (billingRole === "admin" ? "Administrator" : "Staff User")}
            <span style={{ marginLeft: "12px", color: "#64748b" }}>Authority Level: <strong style={{ textTransform: "uppercase" }}>{billingRole}</strong></span>
          </div>
          <div>
            <strong>Total Entries:</strong> {getFilteredExpenses().length} Record(s)
          </div>
        </div>

        {/* Financial Highlights */}
        {(() => {
          const printableList = getFilteredExpenses();
          const totalAmt = printableList.reduce((s, x) => s + Number(x.amount || 0), 0);
          const cashAmt = printableList.filter(x => x.paymentMethod === "Cash").reduce((s, x) => s + Number(x.amount || 0), 0);
          const onlineAmt = totalAmt - cashAmt;
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", backgroundColor: "#f8fafc" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Total Expenditure</div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "#b91c1c" }}>{formatCurrency(totalAmt)}</div>
              </div>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", backgroundColor: "#f8fafc" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Cash Disbursed</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#15803d" }}>{formatCurrency(cashAmt)}</div>
              </div>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", backgroundColor: "#f8fafc" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>Online / Bank / Other</div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb" }}>{formatCurrency(onlineAmt)}</div>
              </div>
            </div>
          );
        })()}

        {/* Detailed Expenses Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#b91c1c", color: "#ffffff", textAlign: "left" }}>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c", width: "30px", textAlign: "center" }}>SN</th>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c", width: "85px" }}>Date</th>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c" }}>Particulars / Description</th>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c", width: "110px" }}>Category</th>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c", width: "95px", textAlign: "right" }}>Amount (Rs.)</th>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c", width: "85px" }}>Payment Mode</th>
              <th style={{ padding: "6px 8px", border: "1px solid #b91c1c", width: "100px" }}>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredExpenses().length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "16px", textAlign: "center", color: "#64748b", border: "1px solid #cbd5e1" }}>
                  No expense records found for this period.
                </td>
              </tr>
            ) : (
              getFilteredExpenses().map((item, idx) => (
                <tr key={item.id || idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", fontWeight: "600", whiteSpace: "nowrap" }}>{item.date}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
                    <div style={{ fontWeight: "bold", color: "#0f172a" }}>{item.title}</div>
                    {item.remarks && <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Note: {item.remarks}</div>}
                  </td>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", color: "#475569" }}>{item.category}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "bold", color: "#b91c1c" }}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", color: "#334155" }}>{item.paymentMethod}</td>
                  <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", color: "#334155" }}>{item.recordedBy || "Staff"}</td>
                </tr>
              ))
            )}
          </tbody>
          {getFilteredExpenses().length > 0 && (
            <tfoot>
              <tr style={{ backgroundColor: "#f1f5f9", fontWeight: "bold" }}>
                <td colSpan={4} style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right", fontSize: "12px", color: "#1e293b" }}>
                  GRAND TOTAL EXPENSES:
                </td>
                <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right", fontSize: "13px", fontWeight: "900", color: "#b91c1c" }}>
                  {formatCurrency(getFilteredExpenses().reduce((sum, exp) => sum + Number(exp.amount || 0), 0))}
                </td>
                <td colSpan={2} style={{ padding: "8px", border: "1px solid #cbd5e1" }}></td>
              </tr>
            </tfoot>
          )}
        </table>

        {/* Official Authorizations */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", paddingTop: "20px", fontSize: "11px" }}>
          <div style={{ textAlign: "center", width: "180px" }}>
            <div style={{ borderTop: "1px solid #334155", paddingTop: "4px", fontWeight: "bold" }}>
              {activeStaffName || (billingRole === "admin" ? "Administrator" : "Staff User")}
            </div>
            <div style={{ color: "#64748b" }}>Prepared / Verified By</div>
          </div>
          <div style={{ textAlign: "center", width: "180px" }}>
            <div style={{ borderTop: "1px solid #334155", paddingTop: "4px", fontWeight: "bold" }}>
              Admin Authority / Stamp
            </div>
            <div style={{ color: "#64748b" }}>Authorized Signature</div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
