import React, { useState } from "react";
import { trackVisaApplication } from "../api/visaApi";

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
  green:        "#16a34a",  greenBg:    "#dcfce7",  greenBorder: "#86efac",
  orange:       "#d97706",  orangeBg:   "#fffbeb",  orangeBorder:"#fde68a",
  yellow:       "#ca8a04",  yellowBg:   "#fefce8",  yellowBorder:"#fef08a",
  red:          "#dc2626",  redBg:      "#fee2e2",  redBorder:   "#fca5a5",
};

// ===== حالات الطلبات =====
const STATUS = {
  approved:          { color: C.green,  bg: C.greenBg,  border: C.greenBorder,  icon: "✅", label: "مقبولة"         },
  processing:        { color: C.orange, bg: C.orangeBg, border: C.orangeBorder, icon: "⏳", label: "قيد المعالجة"   },
  waiting_documents: { color: C.yellow, bg: C.yellowBg, border: C.yellowBorder, icon: "⚠️", label: "بانتظار وثائق"  },
  rejected:          { color: C.red,    bg: C.redBg,    border: C.redBorder,    icon: "❌", label: "مرفوضة"          },
};

// ===== أرقام تجريبية =====
const HINTS = [
  { code: "VISA-IQ-2025-084721", desc: "تركيا — سياحية",   status: "✅ مقبولة"         },
  { code: "VISA-IQ-2025-091833", desc: "الإمارات — طبية",  status: "⏳ قيد المعالجة"   },
  { code: "VISA-IQ-2025-067412", desc: "ألمانيا — دراسية", status: "⚠️ بانتظار وثائق" },
  { code: "VISA-IQ-2025-055109", desc: "كندا — أعمال",     status: "❌ مرفوضة"          },
];

// حساب نسبة اكتمال الخط الزمني
function calcProgress(steps) {
  const done = steps.filter((s) => s.done).length;
  return Math.max(0, Math.round(((done - 1) / (steps.length - 1)) * 100));
}

// ===== المكوّن الرئيسي =====
export default function TrackVisa({ onNavigate, initialCode = "" }) {
  const [query,   setQuery]   = useState(initialCode);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // ===== البحث باستخدام API =====
  const handleSearch = async (code) => {
    const key = (code || query).trim();
    if (!key) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await trackVisaApplication(key);
      setResult(data);
    } catch (err) {
      setError(err.message || "رقم الطلب غير موجود");
    } finally {
      setLoading(false);
    }
  };

  // ===== ملء رمز من التلميحات =====
  const fillCode = (code) => {
    setQuery(code);
    handleSearch(code);
  };

  const cfg      = result ? STATUS[result.status] : null;
  const progress = result ? calcProgress(result.steps) : 0;

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: "60px", direction: "rtl", fontFamily: "'Cairo',sans-serif" }}>

      {/* ===== هيرو ===== */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        borderRadius: "0 0 20px 20px",
        padding: "32px 28px 36px",
        marginBottom: "20px",
        color: "#ffffff",
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 8px" }}>📍 تتبع طلبك</h1>
        <p style={{ fontSize: "13px", opacity: 0.85, margin: 0 }}>أدخل رقم الطلب لمعرفة حالته ومراحل معالجته</p>
      </div>

      <div style={{ maxWidth: "430px", margin: "0 auto", padding: "0 16px" }}>

        {/* ===== قسم البحث ===== */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "20px", marginBottom: "16px",
          border: "1px solid " + C.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 14px" }}>
            🔎 ابحث عن طلبك
          </h2>

          {/* حقل الإدخال + زر البحث */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            <input
              style={{
                flex: 1, padding: "10px 12px",
                border: "1px solid " + C.border,
                borderRadius: "8px", fontSize: "13px", color: C.text,
                backgroundColor: C.inputBg, outline: "none",
                fontFamily: "'Cairo',sans-serif", letterSpacing: "0.5px",
              }}
              placeholder="VISA-IQ-2025-XXXXXX"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: loading ? C.muted : C.primary,
                color: "#fff", border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Cairo',sans-serif", whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
            >
              {loading ? "⏳" : "بحث"}
            </button>
          </div>

          {/* رسالة خطأ */}
          {error && (
            <div style={{
              backgroundColor: C.redBg, border: "1px solid " + C.redBorder,
              borderRadius: "8px", padding: "12px 14px",
              color: C.red, fontSize: "13px", marginBottom: "12px",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* صندوق التلميحات */}
          <div style={{
            backgroundColor: C.primaryLight, border: "1px solid " + C.border,
            borderRadius: "10px", padding: "14px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: C.primary, margin: "0 0 10px" }}>
              💡 أرقام طلبات للتجربة — اضغط لتعبئة تلقائي
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {HINTS.map((h) => (
                <button
                  key={h.code}
                  onClick={() => fillCode(h.code)}
                  style={{
                    backgroundColor: C.white, border: "1px solid " + C.border,
                    borderRadius: "8px", padding: "10px",
                    cursor: "pointer", textAlign: "right",
                    fontFamily: "'Cairo',sans-serif",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={{ fontSize: "10px", color: C.primary, fontFamily: "monospace", marginBottom: "3px" }}>
                    {h.code}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: C.muted }}>{h.desc}</span>
                    <span style={{ fontSize: "10px", color: C.muted }}>{h.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== مؤشر التحميل ===== */}
        {loading && (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.muted }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏳</div>
            <p style={{ fontSize: "13px", margin: 0 }}>جاري البحث...</p>
          </div>
        )}

        {/* ===== نتيجة البحث ===== */}
        {result && cfg && (
          <div style={{
            backgroundColor: C.white, borderRadius: "12px",
            padding: "20px", border: "1px solid " + C.border,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>

            {/* اسم المتقدم + شارة الحالة */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: "16px",
              flexWrap: "wrap", gap: "10px",
            }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>
                  {result.applicantName}
                </h2>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: C.muted }}>
                  {result.trackingCode}
                </span>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "5px 14px", borderRadius: "20px",
                backgroundColor: cfg.bg, color: cfg.color,
                border: "1px solid " + cfg.border,
                fontSize: "13px", fontWeight: "700",
              }}>
                {cfg.icon} {result.statusLabel}
              </span>
            </div>

            {/* تفاصيل الطلب */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "10px", backgroundColor: C.bg,
              borderRadius: "10px", padding: "12px",
              marginBottom: "18px",
              border: "1px solid " + C.border,
            }}>
              <InfoCell label="نوع التأشيرة"    value={result.visaType}         />
              <InfoCell label="الدولة"           value={result.country}          />
              <InfoCell label="وكيلك"            value={result.agentName}        />
              <InfoCell label="تاريخ التقديم"    value={result.submittedDate}    />
              <InfoCell label="تاريخ السفر"      value={result.travelDate}       />
              <InfoCell label="التسليم المتوقع"  value={result.expectedDelivery} highlight />
            </div>

            {/* الخط الزمني */}
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: C.text, margin: "0 0 16px" }}>
              مراحل الطلب
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {/* الخط الرابط الخلفي */}
              <div style={{
                position: "absolute", top: "14px", right: "14px", left: "14px",
                height: "2px", backgroundColor: C.border, zIndex: 0,
              }} />
              {/* الخط الملون حسب التقدم */}
              <div style={{
                position: "absolute", top: "14px", right: "14px",
                height: "2px", width: `${progress}%`,
                backgroundColor: result.status === "rejected" ? C.red : C.primary,
                zIndex: 1, transition: "width 0.5s ease",
              }} />

              {result.steps.map((item, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    margin: "0 auto 8px",
                    backgroundColor: item.rejected ? C.red : item.done ? C.primary : C.white,
                    border: `2px solid ${item.active ? "#f59e0b" : item.done ? C.primary : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: "700",
                    color: item.done ? "#fff" : C.muted,
                    boxShadow: item.active ? "0 0 0 3px rgba(245,158,11,0.25)" : "none",
                  }}>
                    {item.done ? (item.rejected ? "✕" : "✓") : i + 1}
                  </div>
                  <p style={{ fontSize: "10px", fontWeight: "600", color: item.done ? C.text : C.muted, margin: "0 0 2px" }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: "9px", color: C.muted, margin: 0 }}>{item.date}</p>
                </div>
              ))}
            </div>

            {/* ملاحظة الانتظار أو الرفض */}
            {result.note && (
              <div style={{
                marginTop: "14px", padding: "10px 14px", borderRadius: "8px", fontSize: "12px",
                backgroundColor: result.status === "rejected" ? C.redBg    : C.yellowBg,
                color:           result.status === "rejected" ? C.red      : C.yellow,
                border: `1px solid ${result.status === "rejected" ? C.redBorder : C.yellowBorder}`,
              }}>
                {result.note}
              </div>
            )}

            {/* إشعار واتساب */}
            <div style={{
              marginTop: "14px", padding: "10px 14px",
              backgroundColor: C.primaryLight, border: "1px solid " + C.border,
              borderRadius: "8px", fontSize: "12px", color: C.muted,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span>🔔</span>
              <span>ستصلك رسالة واتساب عند كل تحديث</span>
            </div>

            {/* زر طلب جديد */}
            <button
              onClick={() => onNavigate("agentMarket")}
              style={{
                width: "100%", padding: "12px", marginTop: "16px",
                backgroundColor: C.primary, color: "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: "700",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif",
              }}
            >
              ＋ تقديم طلب جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== خلية معلومات =====
function InfoCell({ label, value, highlight }) {
  return (
    <div>
      <p style={{ fontSize: "10px", color: C.muted, margin: "0 0 2px" }}>{label}</p>
      <p style={{
        fontSize: "12px", fontWeight: "600", margin: 0,
        color: highlight ? C.primary : C.text,
      }}>
        {value || "—"}
      </p>
    </div>
  );
}
