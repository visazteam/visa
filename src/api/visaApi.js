// ===== visaApi.js =====
// جميع استدعاءات API في ملف واحد
// عند جهوزية الباكند: غيّر FALLBACK_MODE إلى false فقط

// ─────────────────────────────────────────────────────────
// وضع الـ Fallback
// true  → بيانات وهمية (mock) بدون اتصال بالباكند
// false → اتصال حقيقي بالباكند عبر JWT
// ─────────────────────────────────────────────────────────
const FALLBACK_MODE = true;  // ← غيّر إلى false عند جهوزية الباكند

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5201";

// تأخير لمحاكاة زمن الشبكة (في وضع Fallback فقط)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────
// مساعد داخلي: استدعاء API مع JWT تلقائياً
// يُستخدم فقط عند FALLBACK_MODE = false
// جميع endpoints تتطلب Authorization: Bearer {token}
// ─────────────────────────────────────────────────────────
async function apiCall(method, path, body = null) {
  const token = localStorage.getItem("visaz_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };
  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "حدث خطأ في الاتصال بالخادم");
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────
// 1. جلب قائمة الوكلاء
//    REAL → GET /api/agents
//           لا يوجد query params في الباكند — الفلترة تتم على الفرونتند
//    FALLBACK → بيانات وهمية مع فلترة محلية
// ─────────────────────────────────────────────────────────
export async function getAgents(filters = {}) {
  if (FALLBACK_MODE) {
    await delay(800);
    let agents = [...MOCK_AGENTS];
    if (filters.visaType && filters.visaType !== "all") {
      agents = agents.filter((a) => a.specialties.includes(filters.visaType));
    }
    return agents;
  }

  // وضع حقيقي: GET /api/agents — فلترة على الفرونتند
  const all = await apiCall("GET", "/api/agents");
  if (filters.visaType && filters.visaType !== "all") {
    return all.filter((a) =>
      Array.isArray(a.specialties) && a.specialties.includes(filters.visaType)
    );
  }
  return all;
}

// ─────────────────────────────────────────────────────────
// 2. تقديم طلب تأشيرة
//    REAL → POST /api/visa/apply
//           body: CreateVisaApplicationDto
//    FALLBACK → رمز تتبع وهمي بعد 1500ms
// ─────────────────────────────────────────────────────────
export async function submitVisaApplication(data) {
  if (FALLBACK_MODE) {
    await delay(1500);
    const code = `VISA-IQ-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    return { success: true, trackingCode: code, message: "تم تقديم الطلب بنجاح" };
  }

  // وضع حقيقي: POST /api/visa/apply
  // الباكند يُرجع { id (GUID), ... } — استخدم id كرمز تتبع
  return apiCall("POST", "/api/visa/apply", data);
}

// ─────────────────────────────────────────────────────────
// 3. تتبع حالة الطلب
//    REAL → GET /api/visa/{id}/status
//           id هو GUID من الباكند (وليس VISA-IQ-xxx)
//    FALLBACK → بحث في MOCK_TRACKING بالرمز النصي
// ─────────────────────────────────────────────────────────
export async function trackVisaApplication(trackingCode) {
  if (FALLBACK_MODE) {
    await delay(700);
    const result = MOCK_TRACKING[trackingCode.trim().toUpperCase()];
    if (!result) throw new Error("رقم الطلب غير موجود");
    return result;
  }

  // وضع حقيقي: GET /api/visa/{id}/status
  // trackingCode يجب أن يكون GUID من الباكند
  return apiCall("GET", `/api/visa/${trackingCode}/status`);
}

// ─────────────────────────────────────────────────────────
// 4. رفع وثيقة
//    الوثائق تذهب للوكيل مباشرة — ليس للسفارة
//    TODO: confirm endpoint with backend team
//          لا يوجد endpoint موثق للـ documents حتى الآن
//    FALLBACK → دائماً (حتى يُؤكَّد الـ endpoint)
// ─────────────────────────────────────────────────────────
export async function uploadDocument(file, docType, _orderId) {
  // TODO: confirm endpoint with backend team
  // المتوقع: POST /api/orders/{orderId}/documents أو /api/visa/{orderId}/documents
  await delay(800);
  return {
    success:  true,
    fileUrl:  `https://cdn.visaz.iq/docs/${Date.now()}_${file.name}`,
    fileName: file.name,
    docType,
  };
}

// ─────────────────────────────────────────────────────────
// 5. جلب قائمة الدول
//    لا يوجد /api/countries في الباكند — دائماً بيانات محلية
// ─────────────────────────────────────────────────────────
export async function getCountries() {
  // لا يوجد endpoint للدول في الباكند — بيانات ثابتة موثقة لحاملي الجواز العراقي
  await delay(200);
  return MOCK_COUNTRIES;
}

// ─────────────────────────────────────────────────────────
// 6. جلب قائمة المستشارين
//    REAL → GET /api/consultants
//           لا يوجد query params — الفلترة على الفرونتند
//    FALLBACK → بيانات وهمية مع فلترة محلية
// ─────────────────────────────────────────────────────────
export async function getConsultants(specialty = "") {
  if (FALLBACK_MODE) {
    await delay(600);
    if (!specialty || specialty === "all") return MOCK_CONSULTANTS;
    return MOCK_CONSULTANTS.filter((c) => c.specialty === specialty);
  }

  // وضع حقيقي: GET /api/consultants — فلترة على الفرونتند
  const all = await apiCall("GET", "/api/consultants");
  if (!specialty || specialty === "all") return all;
  return all.filter((c) => c.specialty === specialty);
}

// ─────────────────────────────────────────────────────────
// 7. حجز جلسة مع مستشار
//    REAL → POST /api/consultants/{consultantId}/book
//           body: {} (BookConsultantDto — تأكد من الـ DTO مع الباكند)
//    FALLBACK → session id وهمي بعد 1000ms
// ─────────────────────────────────────────────────────────
export async function bookConsultantSession(consultantId) {
  if (FALLBACK_MODE) {
    await delay(1000);
    const sessionId = `SESSION-${Date.now()}`;
    return { success: true, sessionId, message: "تم حجز الجلسة بنجاح" };
  }

  // وضع حقيقي: POST /api/consultants/{consultantId}/book
  // consultantId يجب أن يكون GUID
  return apiCall("POST", `/api/consultants/${consultantId}/book`, {});
}

// ═══════════════════════════════════════════════════════════════
// البيانات الوهمية — تُستخدم فقط عند FALLBACK_MODE = true
// ═══════════════════════════════════════════════════════════════

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

// بيانات الدول — موثقة لحاملي الجواز العراقي (لا يوجد endpoint في الباكند)
const MOCK_COUNTRIES = [
  { id: "TR", name: "تركيا",    flag: "🇹🇷", fee: 45000, visaFree: false, processingDays: 3 },
  { id: "AE", name: "الإمارات", flag: "🇦🇪", fee: 35000, visaFree: false, processingDays: 3 },
  { id: "MY", name: "ماليزيا",  flag: "🇲🇾", fee: 0,     visaFree: true,  processingDays: 1, note: "دخول مجاني"   },
  { id: "TN", name: "تونس",     flag: "🇹🇳", fee: 0,     visaFree: true,  processingDays: 1, note: "15 يوم مجاني" },
  { id: "GE", name: "جورجيا",   flag: "🇬🇪", fee: 20000, visaFree: false, processingDays: 7 },
  { id: "IR", name: "إيران",    flag: "🇮🇷", fee: 0,     visaFree: true,  processingDays: 1, note: "دخول مجاني"   },
  { id: "JO", name: "الأردن",   flag: "🇯🇴", fee: 30000, visaFree: false, processingDays: 5 },
];

// بيانات التتبع الوهمية — تُستخدم في Fallback فقط
// في الباكند الحقيقي: الـ ID هو GUID وليس VISA-IQ-xxx
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
      { label: "📥 تم استلام الطلب",   date: "2025-03-01", done: true },
      { label: "📋 مراجعة الوثائق",    date: "2025-03-02", done: true },
      { label: "⚙️ معالجة الطلب",     date: "2025-03-03", done: true },
      { label: "✅ الموافقة النهائية", date: "2025-03-04", done: true },
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
      { label: "📥 تم استلام الطلب",   date: "2025-03-10", done: true },
      { label: "📋 مراجعة الوثائق",    date: "2025-03-11", done: true },
      { label: "⚙️ معالجة الطلب",     date: "2025-03-12", done: true, active: true },
      { label: "✅ الموافقة النهائية", date: "—",          done: false },
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
      { label: "📥 تم استلام الطلب",   date: "2025-02-20", done: true },
      { label: "📋 مراجعة الوثائق",    date: "2025-02-22", done: true, active: true },
      { label: "⚙️ معالجة الطلب",     date: "—",          done: false },
      { label: "✅ الموافقة النهائية", date: "—",          done: false },
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
      { label: "📥 تم استلام الطلب",   date: "2025-01-15", done: true },
      { label: "📋 مراجعة الوثائق",    date: "2025-01-18", done: true },
      { label: "⚙️ معالجة الطلب",     date: "2025-01-25", done: true },
      { label: "✅ الموافقة النهائية", date: "2025-02-01", done: true, rejected: true },
    ],
  },
};

const MOCK_CONSULTANTS = [
  { id: "c1", name: "أحمد الموسوي", initials: "أم", specialty: "turkey",  specialtyLabel: "🇹🇷 تركيا / أوروبا",    rating: 4.9, sessionCount: 142, pricePerHour: 18000, available: true  },
  { id: "c2", name: "سارة الجبوري", initials: "سج", specialty: "uae",     specialtyLabel: "🇦🇪 الإمارات / الخليج", rating: 4.6, sessionCount: 89,  pricePerHour: 12000, available: true  },
  { id: "c3", name: "عمر فاضل",     initials: "عف", specialty: "study",   specialtyLabel: "🎓 دراسة أوروبا",       rating: 4.3, sessionCount: 56,  pricePerHour:  8000, available: false },
  { id: "c4", name: "نور الهاشمي",  initials: "نه", specialty: "medical", specialtyLabel: "🏥 طبي / علاجي",        rating: 4.7, sessionCount: 103, pricePerHour: 15000, available: true  },
];
