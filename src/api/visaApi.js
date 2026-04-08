// ===== visaApi.js =====
// جميع استدعاءات API في ملف واحد
// عند جهوزية الباكند: غيّر BASE_URL فقط، الباقي يعمل تلقائياً

const BASE_URL = "https://api.visaz.iq/v1";

// تأخير لمحاكاة زمن الشبكة
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────
// بيانات تجريبية: الوكلاء
// ─────────────────────────────────────────────────────────
const MOCK_AGENTS = [
  {
    id: "a1",
    name: "وكالة النخبة",
    initials: "نخ",
    rating: 4.9,
    reviewCount: 312,
    price: 48000,
    deliveryDays: 3,
    specialties: ["tourist", "business"],
    specialtyLabel: "تركيا / أوروبا",
    verified: true,
    available: true,
  },
  {
    id: "a2",
    name: "ميسر للتأشيرات",
    initials: "مس",
    rating: 4.6,
    reviewCount: 178,
    price: 43000,
    deliveryDays: 5,
    specialties: ["tourist", "study", "business", "medical", "family", "transit"],
    specialtyLabel: "جميع الأنواع",
    verified: true,
    available: true,
  },
  {
    id: "a3",
    name: "السفر العراقي",
    initials: "سع",
    rating: 4.2,
    reviewCount: 94,
    price: 55000,
    deliveryDays: 1,
    specialties: ["tourist"],
    specialtyLabel: "تركيا فقط",
    verified: false,
    available: true,
  },
  {
    id: "a4",
    name: "نور السفر",
    initials: "نس",
    rating: 4.8,
    reviewCount: 201,
    price: 50000,
    deliveryDays: 2,
    specialties: ["family", "medical", "tourist"],
    specialtyLabel: "الإمارات / الخليج",
    verified: true,
    available: false,
  },
];

// ─────────────────────────────────────────────────────────
// بيانات تجريبية: الدول (بيانات موثقة لحاملي الجواز العراقي)
// ─────────────────────────────────────────────────────────
const MOCK_COUNTRIES = [
  { id: "TR", name: "تركيا",    flag: "🇹🇷", fee: 45000, visaFree: false, processingDays: 3 },
  { id: "AE", name: "الإمارات", flag: "🇦🇪", fee: 35000, visaFree: false, processingDays: 3 },
  { id: "MY", name: "ماليزيا",  flag: "🇲🇾", fee: 0,     visaFree: true,  processingDays: 1, note: "دخول مجاني"  },
  { id: "TN", name: "تونس",     flag: "🇹🇳", fee: 0,     visaFree: true,  processingDays: 1, note: "15 يوم مجاني" },
  { id: "GE", name: "جورجيا",   flag: "🇬🇪", fee: 20000, visaFree: false, processingDays: 7 },
  { id: "IR", name: "إيران",    flag: "🇮🇷", fee: 0,     visaFree: true,  processingDays: 1, note: "دخول مجاني"  },
  { id: "JO", name: "الأردن",   flag: "🇯🇴", fee: 30000, visaFree: false, processingDays: 5 },
];

// ─────────────────────────────────────────────────────────
// بيانات تجريبية: تتبع الطلبات
// الوكيل يحدّث الحالة من Dashboard الخاص به
// ─────────────────────────────────────────────────────────
const MOCK_TRACKING = {
  "VISA-IQ-2025-084721": {
    trackingCode: "VISA-IQ-2025-084721",
    applicantName: "أحمد محمد الجبوري",
    visaType: "سياحية",
    country: "🇹🇷 تركيا",
    agentName: "وكالة النخبة",
    submittedDate: "2025-03-01",
    travelDate: "2025-04-15",
    expectedDelivery: "2025-04-04",
    status: "approved",
    statusLabel: "مقبولة",
    steps: [
      { label: "📥 تم استلام الطلب",    date: "2025-03-01", done: true },
      { label: "📋 مراجعة الوثائق",     date: "2025-03-02", done: true },
      { label: "⚙️ معالجة الطلب",      date: "2025-03-03", done: true },
      { label: "✅ الموافقة النهائية",  date: "2025-03-04", done: true },
    ],
  },
  "VISA-IQ-2025-091833": {
    trackingCode: "VISA-IQ-2025-091833",
    applicantName: "سارة علي الموسوي",
    visaType: "طبية",
    country: "🇦🇪 الإمارات",
    agentName: "ميسر للتأشيرات",
    submittedDate: "2025-03-10",
    travelDate: "2025-04-01",
    expectedDelivery: "2025-03-25",
    status: "processing",
    statusLabel: "قيد المعالجة",
    steps: [
      { label: "📥 تم استلام الطلب",    date: "2025-03-10", done: true },
      { label: "📋 مراجعة الوثائق",     date: "2025-03-11", done: true },
      { label: "⚙️ معالجة الطلب",      date: "2025-03-12", done: true, active: true },
      { label: "✅ الموافقة النهائية",  date: "—",          done: false },
    ],
  },
  "VISA-IQ-2025-067412": {
    trackingCode: "VISA-IQ-2025-067412",
    applicantName: "عمر حسين الكربلائي",
    visaType: "دراسية",
    country: "🇩🇪 ألمانيا",
    agentName: "السفر العراقي",
    submittedDate: "2025-02-20",
    travelDate: "2025-09-01",
    expectedDelivery: "2025-03-20",
    status: "waiting_documents",
    statusLabel: "بانتظار وثائق",
    note: "⚠️ يرجى إرسال خطاب القبول الجامعي لاستكمال معالجة طلبك",
    steps: [
      { label: "📥 تم استلام الطلب",    date: "2025-02-20", done: true },
      { label: "📋 مراجعة الوثائق",     date: "2025-02-22", done: true, active: true },
      { label: "⚙️ معالجة الطلب",      date: "—",          done: false },
      { label: "✅ الموافقة النهائية",  date: "—",          done: false },
    ],
  },
  "VISA-IQ-2025-055109": {
    trackingCode: "VISA-IQ-2025-055109",
    applicantName: "نور عبدالله الشمري",
    visaType: "أعمال",
    country: "🇨🇦 كندا",
    agentName: "وكالة النخبة",
    submittedDate: "2025-01-15",
    travelDate: "2025-03-01",
    expectedDelivery: "2025-02-15",
    status: "rejected",
    statusLabel: "مرفوضة",
    note: "❌ الوثائق المالية المقدمة لا تلبي الحد الأدنى المطلوب",
    steps: [
      { label: "📥 تم استلام الطلب",    date: "2025-01-15", done: true },
      { label: "📋 مراجعة الوثائق",     date: "2025-01-18", done: true },
      { label: "⚙️ معالجة الطلب",      date: "2025-01-25", done: true },
      { label: "✅ الموافقة النهائية",  date: "2025-02-01", done: true, rejected: true },
    ],
  },
};

// ─────────────────────────────────────────────────────────
// بيانات تجريبية: المستشارون
// ─────────────────────────────────────────────────────────
const MOCK_CONSULTANTS = [
  { id: "c1", name: "أحمد الموسوي", initials: "أم", specialty: "turkey",  specialtyLabel: "🇹🇷 تركيا / أوروبا",    rating: 4.9, sessionCount: 142, pricePerHour: 18000, available: true  },
  { id: "c2", name: "سارة الجبوري", initials: "سج", specialty: "uae",     specialtyLabel: "🇦🇪 الإمارات / الخليج", rating: 4.6, sessionCount: 89,  pricePerHour: 12000, available: true  },
  { id: "c3", name: "عمر فاضل",     initials: "عف", specialty: "study",   specialtyLabel: "🎓 دراسة أوروبا",       rating: 4.3, sessionCount: 56,  pricePerHour:  8000, available: false },
  { id: "c4", name: "نور الهاشمي",  initials: "نه", specialty: "medical", specialtyLabel: "🏥 طبي / علاجي",        rating: 4.7, sessionCount: 103, pricePerHour: 15000, available: true  },
];

// ─────────────────────────────────────────────────────────
// 1. جلب قائمة الوكلاء
//    GET /api/agents?country=TR&visaType=tourist
//    يُستخدم لاحقاً من Dashboard الوكيل أيضاً
// ─────────────────────────────────────────────────────────
export async function getAgents(filters = {}) {
  try {
    await delay(800);
    let agents = [...MOCK_AGENTS];
    if (filters.visaType) {
      agents = agents.filter((a) => a.specialties.includes(filters.visaType));
    }
    return agents;
  } catch (err) {
    throw new Error("تعذّر تحميل الوكلاء");
  }
}

// ─────────────────────────────────────────────────────────
// 2. تقديم طلب تأشيرة
//    POST /api/orders/create
//    يُستقبل في Dashboard الوكيل للمعالجة
// ─────────────────────────────────────────────────────────
export async function submitVisaApplication(data) {
  try {
    await delay(1500);
    const code = `VISA-IQ-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    return { success: true, trackingCode: code, message: "تم تقديم الطلب بنجاح" };
  } catch (err) {
    throw new Error("تعذّر تقديم الطلب، حاول مرة أخرى");
  }
}

// ─────────────────────────────────────────────────────────
// 3. تتبع حالة الطلب
//    GET /api/orders/track/{trackingCode}
//    الوكيل يحدّث الحالة من Dashboard الخاص به
// ─────────────────────────────────────────────────────────
export async function trackVisaApplication(trackingCode) {
  try {
    await delay(700);
    const result = MOCK_TRACKING[trackingCode.trim().toUpperCase()];
    if (!result) throw new Error("رقم الطلب غير موجود");
    return result;
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────
// 4. رفع وثيقة — الوثائق تذهب للوكيل مباشرة وليس للسفارة
//    POST /api/orders/{orderId}/documents
// ─────────────────────────────────────────────────────────
export async function uploadDocument(file, docType, orderId) {
  try {
    await delay(800);
    return {
      success: true,
      fileUrl: `https://cdn.visaz.iq/docs/${Date.now()}_${file.name}`,
      fileName: file.name,
      docType,
    };
  } catch (err) {
    throw new Error("تعذّر رفع الملف");
  }
}

// ─────────────────────────────────────────────────────────
// 5. جلب قائمة الدول
//    GET /api/countries
//    بيانات موثقة لحاملي الجواز العراقي
// ─────────────────────────────────────────────────────────
export async function getCountries() {
  try {
    await delay(400);
    return MOCK_COUNTRIES;
  } catch (err) {
    throw new Error("تعذّر تحميل قائمة الدول");
  }
}

// ─────────────────────────────────────────────────────────
// 6. جلب قائمة المستشارين
//    GET /api/consultants?specialty=turkey
// ─────────────────────────────────────────────────────────
export async function getConsultants(specialty = "") {
  try {
    await delay(600);
    if (!specialty || specialty === "all") return MOCK_CONSULTANTS;
    return MOCK_CONSULTANTS.filter((c) => c.specialty === specialty);
  } catch (err) {
    throw new Error("تعذّر تحميل المستشارين");
  }
}

// ─────────────────────────────────────────────────────────
// 7. حجز جلسة مع مستشار
//    POST /api/consultants/book
// ─────────────────────────────────────────────────────────
export async function bookConsultantSession(consultantId) {
  try {
    await delay(1000);
    const sessionId = `SESSION-${Date.now()}`;
    return { success: true, sessionId, message: "تم حجز الجلسة بنجاح" };
  } catch (err) {
    throw new Error("تعذّر حجز الجلسة");
  }
}
