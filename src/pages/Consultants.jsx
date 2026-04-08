import React, { useState, useEffect } from "react";
import { getConsultants } from "../api/visaApi";

// ===== ثوابت الألوان =====
const C = {
  bg:           "#f1f5f9",
  white:        "#ffffff",
  primary:      "#1e3a8a",
  primaryLight: "#eff6ff",
  text:         "#0f172a",
  muted:        "#64748b",
  border:       "#e2e8f0",
  inputBg:      "#f8fafc",
  green:        "#16a34a",  greenBg:  "#dcfce7",
  red:          "#dc2626",  redBg:    "#fee2e2",  redBorder: "#fca5a5",
};

// ===== فلاتر التخصص =====
const SPECIALTY_FILTERS = [
  { id: "all",     label: "الكل"       },
  { id: "turkey",  label: "🇹🇷 تركيا"  },
  { id: "uae",     label: "🇦🇪 إمارات" },
  { id: "study",   label: "🎓 دراسة"   },
  { id: "medical", label: "🏥 طبي"     },
];

function fmt(n) { return n.toLocaleString("en-US"); }

export default function Consultants({ onNavigate, onSelectConsultant }) {
  const [consultants, setConsultants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [specialty,   setSpecialty]   = useState("all");
  const [search,      setSearch]      = useState("");

  // ===== جلب المستشارين عند تغيير التخصص =====
  useEffect(() => {
    setLoading(true);
    setError("");
    getConsultants(specialty)
      .then((data) => { setConsultants(data); setLoading(false); })
      .catch((e)   => { setError(e.message);  setLoading(false); });
  }, [specialty]);

  // ===== فلترة بالبحث النصي =====
  const filtered = consultants.filter((c) =>
    !search ||
    c.name.includes(search) ||
    c.specialtyLabel.includes(search)
  );

  // ===== اختيار مستشار والانتقال للدردشة =====
  const handleSelect = (consultant) => {
    onSelectConsultant(consultant);
    onNavigate("consultantChat");
  };

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
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 10px" }}>
            👨‍💼 مستشارو السفر
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: 0, lineHeight: 1.75 }}>
            تحدث مع متخصص قبل تقديم طلبك
          </p>
        </div>

        {/* ===== البحث والفلاتر ===== */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "18px 20px", marginBottom: "16px",
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {/* حقل البحث */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ابحث عن تخصص أو اسم مستشار..."
            style={{
              width: "100%", padding: "10px 14px",
              border: `1px solid ${C.border}`, borderRadius: "8px",
              fontSize: "13px", color: C.text, backgroundColor: C.inputBg,
              outline: "none", fontFamily: "'Cairo',sans-serif",
              boxSizing: "border-box", marginBottom: "14px",
            }}
          />

          {/* فلاتر التخصص */}
          <div style={{
            display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none",
          }}>
            {SPECIALTY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSpecialty(f.id)}
                style={{
                  padding: "7px 14px", borderRadius: "20px", whiteSpace: "nowrap",
                  backgroundColor: specialty === f.id ? C.primary : "transparent",
                  color:           specialty === f.id ? "#fff"    : C.muted,
                  border: `1px solid ${specialty === f.id ? C.primary : C.border}`,
                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif", flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== تحميل ===== */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
            <p style={{ fontSize: "14px", margin: 0 }}>جاري تحميل المستشارين...</p>
          </div>
        )}

        {/* ===== خطأ ===== */}
        {error && (
          <div style={{
            backgroundColor: C.redBg, border: `1px solid ${C.redBorder}`,
            borderRadius: "10px", padding: "14px",
            color: C.red, fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ===== شبكة بطاقات المستشارين (عمودان) ===== */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                <p style={{ fontSize: "14px", margin: 0 }}>لا يوجد مستشارون لهذا التخصص</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      backgroundColor: C.white, borderRadius: "12px",
                      padding: "18px 14px", border: `1px solid ${C.border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      display: "flex", flexDirection: "column", gap: "10px",
                      opacity: c.available ? 1 : 0.6,
                    }}
                  >
                    {/* دائرة الأحرف + حالة التوفر */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        backgroundColor: C.primary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px", fontWeight: "800", color: "#fff",
                      }}>
                        {c.initials}
                      </div>
                      <span style={{
                        fontSize: "11px", fontWeight: "700",
                        color: c.available ? C.green : C.red,
                      }}>
                        {c.available ? "🟢 متاح" : "🔴 مشغول"}
                      </span>
                    </div>

                    {/* الاسم والتخصص */}
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>
                        {c.specialtyLabel}
                      </p>
                    </div>

                    {/* التقييم وعدد الجلسات */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: C.text, fontWeight: "600" }}>
                        ⭐ {c.rating}
                      </span>
                      <span style={{ fontSize: "11px", color: C.muted }}>
                        {c.sessionCount} جلسة
                      </span>
                    </div>

                    {/* السعر */}
                    <p style={{ fontSize: "13px", fontWeight: "700", color: C.primary, margin: 0 }}>
                      {fmt(c.pricePerHour)} د.ع / ساعة
                    </p>

                    {/* زر التواصل */}
                    <button
                      disabled={!c.available}
                      onClick={() => handleSelect(c)}
                      style={{
                        width: "100%", padding: "10px",
                        backgroundColor: c.available ? "transparent" : C.bg,
                        color:           c.available ? C.primary      : C.muted,
                        border: c.available
                          ? `2px solid ${C.primary}`
                          : `1px solid ${C.border}`,
                        borderRadius: "8px", fontSize: "13px", fontWeight: "700",
                        cursor: c.available ? "pointer" : "not-allowed",
                        fontFamily: "'Cairo',sans-serif",
                      }}
                    >
                      {c.available ? "تواصل مجاناً" : "غير متاح"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
