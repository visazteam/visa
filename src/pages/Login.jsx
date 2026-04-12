import React, { useState } from "react";

// ===== ثوابت الألوان — نفس النمط الأزرق =====
const C = {
  bg:           "#f1f5f9",
  white:        "#ffffff",
  primary:      "#1e3a8a",
  primaryLight: "#eff6ff",
  text:         "#0f172a",
  muted:        "#64748b",
  border:       "#e2e8f0",
  inputBg:      "#f8fafc",
  red:          "#dc2626",
  redBg:        "#fee2e2",
  redBorder:    "#fca5a5",
};

// ===== بيانات الدخول التجريبية =====
const MOCK_USERS = {
  "user@visa.iq":  { password: "123456", role: "مستخدم" },
  "agent@visa.iq": { password: "123456", role: "وكيل"   },
  "admin@visa.iq": { password: "123456", role: "إدارة"  },
};

// ===== الأدوار المتاحة =====
const ROLES = ["مستخدم", "وكيل", "إدارة"];

// ===== المكوّن الرئيسي =====
export default function Login({ onLogin }) {
  const [role,        setRole]        = useState("مستخدم");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // ===== التحقق من صحة المدخلات =====
  function validate() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return false;
    }
    return true;
  }

  // ===== معالج تسجيل الدخول =====
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    // محاكاة استدعاء API
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);

    const user = MOCK_USERS[email.toLowerCase()];
    if (!user || user.password !== password || user.role !== role) {
      setError("البريد أو كلمة المرور غير صحيحة ❌");
      return;
    }

    // نجاح الدخول — تمرير الدور للـ App
    onLogin(role);
  }

  return (
    <div
      dir="rtl"
      style={{
        backgroundColor: C.bg,
        minHeight: "100vh",
        fontFamily: "'Cairo','Segoe UI',sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ===== البانر العلوي ===== */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        padding: "40px 24px 48px",
        textAlign: "center",
        color: "#ffffff",
      }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🛂</div>
        <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 8px" }}>Visa Z</h1>
        <p style={{ fontSize: "14px", opacity: 0.85, margin: "0 0 4px" }}>
          منصة حجز التأشيرات الإلكترونية
        </p>
        <p style={{
          fontSize: "11px", opacity: 0.65, margin: 0,
          backgroundColor: "rgba(255,255,255,0.12)",
          display: "inline-block", padding: "3px 12px",
          borderRadius: "10px", marginTop: "8px",
        }}>
          مدعومة من Super Qi
        </p>
      </div>

      {/* ===== كارد تسجيل الدخول ===== */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 16px 40px",
        marginTop: "-24px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: C.white,
          borderRadius: "16px",
          padding: "28px 24px",
          border: "1px solid " + C.border,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>

          {/* ===== اختيار الدور ===== */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", color: C.muted, margin: "0 0 10px", fontWeight: "600" }}>
              اختر نوع حسابك
            </p>
            <div style={{
              display: "flex", gap: "8px",
              backgroundColor: C.bg,
              borderRadius: "10px",
              padding: "4px",
            }}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    backgroundColor: role === r ? C.primary : "transparent",
                    color:           role === r ? "#ffffff"  : C.muted,
                    border:    "none",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "'Cairo',sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ===== نموذج الدخول ===== */}
          <form onSubmit={handleLogin} noValidate>

            {/* البريد الإلكتروني */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: C.text, marginBottom: "6px" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid " + C.border,
                  borderRadius: "8px", fontSize: "13px",
                  color: C.text, backgroundColor: C.inputBg,
                  boxSizing: "border-box", outline: "none",
                  fontFamily: "'Cairo',sans-serif",
                  direction: "ltr", textAlign: "right",
                }}
              />
            </div>

            {/* كلمة المرور */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: C.text, marginBottom: "6px" }}>
                كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "10px 40px 10px 12px",
                    border: "1px solid " + C.border,
                    borderRadius: "8px", fontSize: "13px",
                    color: C.text, backgroundColor: C.inputBg,
                    boxSizing: "border-box", outline: "none",
                    fontFamily: "'Cairo',sans-serif",
                    direction: "ltr", textAlign: "right",
                  }}
                />
                {/* زر إظهار/إخفاء كلمة المرور */}
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute", left: "10px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", fontSize: "16px",
                    color: C.muted, padding: "0",
                    lineHeight: 1,
                  }}
                  title={showPass ? "إخفاء" : "إظهار"}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* نسيت كلمة المرور */}
            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <button
                type="button"
                style={{
                  background: "none", border: "none",
                  color: C.primary, fontSize: "12px",
                  fontWeight: "600", cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif",
                  padding: 0,
                }}
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div style={{
                backgroundColor: C.redBg,
                border: "1px solid " + C.redBorder,
                borderRadius: "8px", padding: "10px 14px",
                color: C.red, fontSize: "13px",
                marginBottom: "16px", textAlign: "center",
              }}>
                {error}
              </div>
            )}

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                backgroundColor: loading ? C.muted : C.primary,
                color: "#ffffff", border: "none",
                borderRadius: "8px", fontSize: "15px",
                fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Cairo',sans-serif",
                transition: "background 0.2s",
              }}
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          {/* ===== تلميح بيانات الدخول التجريبية ===== */}
          <div style={{
            marginTop: "20px",
            backgroundColor: C.primaryLight,
            border: "1px solid " + C.border,
            borderRadius: "10px", padding: "12px 14px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: C.primary, margin: "0 0 6px" }}>
              💡 بيانات تجريبية
            </p>
            {Object.entries(MOCK_USERS).map(([em, u]) => (
              <button
                key={em}
                type="button"
                onClick={() => { setEmail(em); setPassword(u.password); setRole(u.role); setError(""); }}
                style={{
                  display: "block", width: "100%",
                  background: "none", border: "none",
                  textAlign: "right", cursor: "pointer",
                  padding: "3px 0", fontFamily: "'Cairo',sans-serif",
                }}
              >
                <span style={{ fontSize: "11px", color: C.muted }}>
                  {em} — {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
