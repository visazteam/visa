import React, { useState } from "react";

// ===== ثوابت الألوان =====
const C = {
  bg:          "#f1f5f9",
  white:       "#ffffff",
  primary:     "#1e3a8a",
  primaryLight:"#eff6ff",
  text:        "#0f172a",
  muted:       "#64748b",
  border:      "#e2e8f0",
  inputBg:     "#f8fafc",
  green:       "#16a34a",  greenBg:   "#dcfce7",  greenBorder:"#86efac",
  orange:      "#d97706",  orangeBg:  "#fffbeb",  orangeBorder:"#fde68a",
  yellow:      "#ca8a04",  yellowBg:  "#fefce8",  yellowBorder:"#fef08a",
  red:         "#dc2626",  redBg:     "#fee2e2",  redBorder:  "#fca5a5",
};

// ===== بيانات الطلبات التجريبية =====
const MOCK = {
  "VISA-IQ-2025-084721": {
    appId: "VISA-IQ-2025-084721", name: "أحمد محمد الجبوري",
    visaType: "سياحية", country: "🇹🇷 تركيا",
    applyDate: "2025-03-01", travelDate: "2025-04-15",
    status: "approved", statusLabel: "مقبولة",
    timeline: [
      { step: "📥 تم استلام الطلب",    date: "2025-03-01", done: true },
      { step: "📋 مراجعة الوثائق",     date: "2025-03-02", done: true },
      { step: "⚙️ معالجة الطلب",      date: "2025-03-03", done: true },
      { step: "✅ الموافقة النهائية",  date: "2025-03-04", done: true },
    ],
  },
  "VISA-IQ-2025-091833": {
    appId: "VISA-IQ-2025-091833", name: "سارة علي الموسوي",
    visaType: "علاج طبي", country: "🇦🇪 الإمارات",
    applyDate: "2025-03-10", travelDate: "2025-04-01",
    status: "processing", statusLabel: "قيد المعالجة",
    timeline: [
      { step: "📥 تم استلام الطلب",    date: "2025-03-10", done: true },
      { step: "📋 مراجعة الوثائق",     date: "2025-03-11", done: true },
      { step: "⚙️ معالجة الطلب",      date: "2025-03-12", done: true, active: true },
      { step: "✅ الموافقة النهائية",  date: "—",          done: false },
    ],
  },
  "VISA-IQ-2025-067412": {
    appId: "VISA-IQ-2025-067412", name: "عمر حسين الكربلائي",
    visaType: "دراسة", country: "🇩🇪 ألمانيا",
    applyDate: "2025-02-20", travelDate: "2025-09-01",
    status: "waiting", statusLabel: "بانتظار وثائق",
    timeline: [
      { step: "📥 تم استلام الطلب",    date: "2025-02-20", done: true },
      { step: "📋 مراجعة الوثائق",     date: "2025-02-22", done: true, active: true },
      { step: "⚙️ معالجة الطلب",      date: "—",          done: false },
      { step: "✅ الموافقة النهائية",  date: "—",          done: false },
    ],
    note: "⚠️ يرجى إرسال خطاب القبول الجامعي لاستكمال معالجة طلبك",
  },
  "VISA-IQ-2025-055109": {
    appId: "VISA-IQ-2025-055109", name: "نور عبدالله الشمري",
    visaType: "أعمال", country: "🇨🇦 كندا",
    applyDate: "2025-01-15", travelDate: "2025-03-01",
    status: "rejected", statusLabel: "مرفوضة",
    timeline: [
      { step: "📥 تم استلام الطلب",    date: "2025-01-15", done: true },
      { step: "📋 مراجعة الوثائق",     date: "2025-01-18", done: true },
      { step: "⚙️ معالجة الطلب",      date: "2025-01-25", done: true },
      { step: "✅ الموافقة النهائية",  date: "2025-02-01", done: true, rejected: true },
    ],
    note: "❌ الوثائق المالية المقدمة لا تلبي الحد الأدنى المطلوب",
  },
};

// ===== ضبط كل حالة =====
const STATUS = {
  approved:   { color: "#16a34a", bg: "#dcfce7", border: "#86efac",  icon: "✅", label: "مقبولة"          },
  processing: { color: "#d97706", bg: "#fffbeb", border: "#fde68a",  icon: "⏳", label: "قيد المعالجة"    },
  waiting:    { color: "#ca8a04", bg: "#fefce8", border: "#fef08a",  icon: "⚠️", label: "بانتظار وثائق"   },
  rejected:   { color: "#dc2626", bg: "#fee2e2", border: "#fca5a5",  icon: "❌", label: "مرفوضة"           },
};

// ===== أرقام التجربة للعرض =====
const HINTS = [
  { code: "VISA-IQ-2025-084721", desc: "تركيا — سياحية",   status: "✅ مقبولة"          },
  { code: "VISA-IQ-2025-091833", desc: "الإمارات — علاج طبي", status: "⏳ قيد المعالجة" },
  { code: "VISA-IQ-2025-067412", desc: "ألمانيا — دراسة",  status: "⚠️ بانتظار وثائق"  },
  { code: "VISA-IQ-2025-055109", desc: "كندا — أعمال",     status: "❌ مرفوضة"           },
];

// حساب نسبة اكتمال الخط الزمني
function calcProgress(timeline) {
  const done = timeline.filter(t => t.done).length;
  return Math.max(0, Math.round(((done - 1) / (timeline.length - 1)) * 100));
}

// ===== المكوّن الرئيسي =====
export default function TrackVisa({ onNavigate }) {
  const [query,    setQuery]    = useState("");
  const [result,   setResult]   = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    const key = query.trim().toUpperCase();
    const found = MOCK[key];
    if (found) { setResult(found); setNotFound(false); }
    else        { setResult(null); setNotFound(true);  }
  };

  const fillCode = (code) => {
    setQuery(code);
    const found = MOCK[code];
    if (found) { setResult(found); setNotFound(false); }
  };

  const cfg      = result ? STATUS[result.status] : null;
  const progress = result ? calcProgress(result.timeline) : 0;

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 16px 60px" }}>

        {/* ===== هيرو ===== */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          borderRadius: "0 0 20px 20px",
          padding: "32px 28px 36px",
          marginBottom: "20px",
          color: "#ffffff",
        }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 8px 0" }}>
            🔍 تتبع حالة طلبك
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: "0 0 20px 0", lineHeight: 1.7 }}>
            أدخل رقم الطلب لمعرفة حالته الحالية ومراحل معالجته
          </p>
          <button
            style={{
              padding: "10px 22px", backgroundColor: "transparent", color: "#ffffff",
              border: "2px solid rgba(255,255,255,0.5)", borderRadius: "8px",
              fontSize: "14px", fontWeight: "700", cursor: "pointer",
              fontFamily: "'Cairo',sans-serif",
            }}
            onClick={() => onNavigate("book")}
          >
            ＋ تقديم طلب جديد
          </button>
        </div>

        {/* ===== قسم البحث ===== */}
        <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: `1px solid ${C.border}` }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, marginBottom: "14px" }}>
            🔎 ابحث عن طلبك
          </h2>

          {/* حقل الإدخال + زر البحث */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <input
              style={{
                flex: 1, padding: "11px 14px",
                border: `1px solid ${C.border}`, borderRadius: "8px",
                fontSize: "14px", color: C.text, backgroundColor: C.inputBg,
                outline: "none", fontFamily: "'Cairo',sans-serif",
                letterSpacing: "0.5px",
              }}
              placeholder="VISA-IQ-2025-XXXXXX"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button
              style={{
                padding: "11px 24px", backgroundColor: C.primary, color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif", whiteSpace: "nowrap",
              }}
              onClick={handleSearch}
            >
              بحث
            </button>
          </div>

          {/* رسالة خطأ */}
          {notFound && (
            <div style={{
              backgroundColor: C.redBg, border: `1px solid ${C.redBorder}`,
              borderRadius: "8px", padding: "12px 16px",
              color: C.red, fontSize: "13px",
            }}>
              ⚠️ رقم الطلب غير موجود، تأكد من الرقم وأعد المحاولة
            </div>
          )}

          {/* ===== صندوق التلميحات ===== */}
          <div style={{
            backgroundColor: "#f8fafc", border: `1px solid ${C.border}`,
            borderRadius: "10px", padding: "14px", marginTop: "14px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: C.primary, marginBottom: "10px" }}>
              💡 أرقام طلبات للتجربة — اضغط لتعبئة تلقائي
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {HINTS.map(h => (
                <button
                  key={h.code}
                  onClick={() => fillCode(h.code)}
                  style={{
                    backgroundColor: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px", padding: "10px 12px",
                    cursor: "pointer", textAlign: "right",
                    transition: "border-color 0.15s",
                    fontFamily: "'Cairo',sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={{ fontSize: "11px", color: C.primary, fontFamily: "monospace", marginBottom: "3px" }}>
                    {h.code}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: C.muted }}>{h.desc}</span>
                    <span style={{ fontSize: "11px", color: C.muted }}>{h.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== نتيجة البحث ===== */}
        {result && cfg && (
          <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", border: `1px solid ${C.border}` }}>

            {/* معلومات الطلب + شارة الحالة */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>
                  {result.name}
                </h2>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: C.muted }}>
                  {result.appId}
                </span>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 16px", borderRadius: "20px",
                backgroundColor: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`,
                fontSize: "14px", fontWeight: "700",
              }}>
                {cfg.icon} {result.statusLabel}
              </span>
            </div>

            {/* تفاصيل الطلب */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
              backgroundColor: "#f8fafc", borderRadius: "8px", padding: "14px",
              marginBottom: "20px",
            }}>
              <InfoCell label="نوع التأشيرة" value={result.visaType} />
              <InfoCell label="الدولة"        value={result.country}  />
              <InfoCell label="تاريخ التقديم" value={result.applyDate}/>
              <InfoCell label="تاريخ السفر"   value={result.travelDate} />
            </div>

            {/* ===== الخط الزمني ===== */}
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "16px" }}>
              مراحل الطلب
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {/* الخط الرابط */}
              <div style={{
                position: "absolute", top: "16px", right: "16px", left: "16px",
                height: "2px", backgroundColor: C.border, zIndex: 0,
              }} />
              {/* الخط الملوّن (التقدم) */}
              <div style={{
                position: "absolute", top: "16px", right: "16px",
                height: "2px", width: `${progress}%`,
                backgroundColor: result.status === "rejected" ? C.red : C.primary,
                zIndex: 1, transition: "width 0.5s ease",
              }} />

              {result.timeline.map((item, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                  {/* دائرة الخطوة */}
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    margin: "0 auto 8px",
                    backgroundColor: item.rejected ? C.red : item.done ? C.primary : C.border,
                    border: item.active ? `3px solid #f59e0b` : "3px solid transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", color: item.done ? "#fff" : C.muted,
                    boxShadow: item.active ? "0 0 0 3px #fef3c7" : "none",
                  }}>
                    {item.done ? (item.rejected ? "✕" : "✓") : i + 1}
                  </div>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: item.done ? C.text : C.muted, margin: "0 0 2px 0" }}>
                    {item.step}
                  </p>
                  <p style={{ fontSize: "10px", color: C.muted, margin: 0 }}>
                    {item.date}
                  </p>
                </div>
              ))}
            </div>

            {/* ملاحظة (انتظار / رفض) */}
            {result.note && (
              <div style={{
                marginTop: "16px", padding: "12px 16px",
                borderRadius: "8px", fontSize: "13px",
                backgroundColor: result.status === "rejected" ? C.redBg : C.yellowBg,
                color: result.status === "rejected" ? C.red : C.yellow,
                border: `1px solid ${result.status === "rejected" ? C.redBorder : C.yellowBorder}`,
              }}>
                {result.note}
              </div>
            )}

            {/* زر حجز جديد */}
            <button
              style={{
                width: "100%", padding: "12px", marginTop: "20px",
                backgroundColor: C.primaryLight, color: C.primary,
                border: `1px solid #bfdbfe`, borderRadius: "8px",
                fontSize: "14px", fontWeight: "700",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif",
              }}
              onClick={() => onNavigate("book")}
            >
              ＋ تقديم طلب جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// خلية معلومات
function InfoCell({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px 0" }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", margin: 0 }}>{value}</p>
    </div>
  );
}
