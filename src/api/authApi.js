// ===== authApi.js =====
// إدارة المصادقة — تسجيل الدخول والخروج وحالة الجلسة
// نفس مفتاح FALLBACK_MODE الموجود في visaApi.js

// ─────────────────────────────────────────────────────────
// وضع الـ Fallback
// true  → بيانات وهمية (mock) بدون اتصال بالباكند
// false → اتصال حقيقي بالباكند
// ─────────────────────────────────────────────────────────
const FALLBACK_MODE = true;  // ← غيّر إلى false عند جهوزية الباكند

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5201";

// تأخير لمحاكاة زمن الشبكة
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// مفاتيح التخزين المحلي
const TOKEN_KEY = "visaz_token";
const USER_KEY  = "visaz_user";

// ─────────────────────────────────────────────────────────
// بيانات تجريبية — تُستخدم فقط عند FALLBACK_MODE = true
// ─────────────────────────────────────────────────────────
const MOCK_AUTH = {
  "user@visa.iq":  { password: "123456", token: "mock-token-user",  role: "مستخدم", name: "أحمد محمد الجبوري" },
  "agent@visa.iq": { password: "123456", token: "mock-token-agent", role: "وكيل",   name: "وكيل تجريبي"       },
  "admin@visa.iq": { password: "123456", token: "mock-token-admin", role: "إدارة",  name: "مدير النظام"        },
};

// ─────────────────────────────────────────────────────────
// تسجيل الدخول
// REAL → POST /api/auth/login
// FALLBACK → تحقق من MOCK_AUTH
// يحفظ التوكن وبيانات المستخدم في localStorage
// ─────────────────────────────────────────────────────────
export async function login(email, password) {
  if (FALLBACK_MODE) {
    await delay(1500);
    const user = MOCK_AUTH[email.toLowerCase()];
    if (!user || user.password !== password) {
      throw new Error("البريد أو كلمة المرور غير صحيحة");
    }
    const data = { token: user.token, role: user.role, name: user.name, email };
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  }

  // وضع حقيقي: POST /api/auth/login
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "البريد أو كلمة المرور غير صحيحة");
  }
  const data = await res.json();
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
}

// ─────────────────────────────────────────────────────────
// تسجيل المستخدم الجديد
// POST /api/auth/register
// ─────────────────────────────────────────────────────────
export async function register(userData) {
  if (FALLBACK_MODE) {
    await delay(1000);
    return { success: true, message: "تم إنشاء الحساب (تجريبي)" };
  }
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "فشل إنشاء الحساب");
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────
// تسجيل الخروج — مسح التخزين المحلي
// ─────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─────────────────────────────────────────────────────────
// جلب التوكن الحالي
// ─────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ─────────────────────────────────────────────────────────
// التحقق من حالة تسجيل الدخول
// ─────────────────────────────────────────────────────────
export function isLoggedIn() {
  return !!getToken();
}

// ─────────────────────────────────────────────────────────
// جلب بيانات المستخدم المحفوظة
// ─────────────────────────────────────────────────────────
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}
