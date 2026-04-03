import React, { useState, useEffect } from "react";
import { getAgents } from "../api/visaApi";

// ===== ثوابت الألوان — نفس نمط الصفحات الأخرى =====
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
  red:          "#dc2626",  redBg:      "#fee2e2",  redBorder:   "#fca5a5",
};

// ===== فلاتر الدول =====
const COUNTRY_FILTERS = [
  { id: "all", label: "🌍 الكل"        },
  { id: "TR",  label: "🇹🇷 تركيا"      },
  { id: "AE",  label: "🇦🇪 الإمارات"   },
  { id: "MY",  label: "🇲🇾 ماليزيا"    },
  { id: "GE",  label: "🇬🇪 جورجيا"     },
  { id: "JO",  label: "🇯🇴 الأردن"     },
];

// ===== فلاتر نوع التأشيرة =====
const VISA_FILTERS = [
  { id: "all",      label: "الكل"    },
  { id: "tourist",  label: "سياحية"  },
  { id: "study",    label: "دراسية"  },
  { id: "business", label: "عمل"     },
  { id: "medical",  label: "طبية"    },
  { id: "family",   label: "عائلية"  },
];

const SORT_LABELS = { rating: "التقييم ↓", price: "السعر ↑", delivery: "أسرع تسليم" };

function fmt(n) { return n.toLocaleString("en-US"); }

export default function AgentMarket({ onNavigate, onSelectAgent }) {
  const [agents,        setAgents]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [visaFilter,    setVisaFilter]    = useState("all");
  const [sortBy,        setSortBy]        = useState("rating");

  // ===== جلب الوكلاء عند تغيير الفلاتر =====
  useEffect(() => {
    const filters = {};
    if (visaFilter    !== "all") filters.visaType = visaFilter;
    if (countryFilter !== "all") filters.country  = countryFilter;
    setLoading(true);
    setError("");
    getAgents(filters)
      .then((data) => { setAgents(data); setLoading(false); })
      .catch((e)   => { setError(e.message); setLoading(false); });
  }, [visaFilter, countryFilter]);

  // ===== ترتيب الوكلاء =====
  const sorted = [...agents].sort((a, b) => {
    if (sortBy === "rating")   return b.rating - a.rating;
    if (sortBy === "price")    return a.price - b.price;
    if (sortBy === "delivery") return a.deliveryDays - b.deliveryDays;
    return 0;
  });

  const cycleSortBy = () =>
    setSortBy((s) => s === "rating" ? "price" : s === "price" ? "delivery" : "rating");

  // ===== اختيار وكيل والانتقال لصفحة الحجز =====
  const handleSelect = (agent) => {
    onSelectAgent({
      agentId:           agent.id,
      agentName:         agent.name,
      agentRating:       agent.rating,
      agentPrice:        agent.price,
      agentDeliveryDays: agent.deliveryDays,
    });
    onNavigate("book");
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
            🏪 سوق الفيزا
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: "0 0 22px", lineHeight: 1.75 }}>
            اختار وكيلك المناسب وابدأ طلبك
          </p>
          <button
            style={{
              padding: "10px 22px", backgroundColor: "#ffffff", color: "#1e3a8a",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
              cursor: "pointer", fontFamily: "'Cairo',sans-serif",
            }}
          >
            تقديم طلب جديد +
          </button>
        </div>

        {/* ===== بطاقة الفلاتر ===== */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "18px 20px", marginBottom: "16px",
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {/* فلاتر الدول */}
          <p style={{ fontSize: "12px", fontWeight: "600", color: C.muted, marginBottom: "10px" }}>الدولة</p>
          <div style={{
            display: "flex", gap: "8px", overflowX: "auto",
            scrollbarWidth: "none", marginBottom: "16px",
          }}>
            {COUNTRY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setCountryFilter(f.id)}
                style={{
                  padding: "7px 14px", borderRadius: "20px", whiteSpace: "nowrap",
                  backgroundColor: countryFilter === f.id ? C.primary : "transparent",
                  color:           countryFilter === f.id ? "#fff"    : C.muted,
                  border: `1px solid ${countryFilter === f.id ? C.primary : C.border}`,
                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif", flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* فلاتر نوع التأشيرة */}
          <p style={{ fontSize: "12px", fontWeight: "600", color: C.muted, marginBottom: "10px" }}>نوع التأشيرة</p>
          <div style={{
            display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none",
          }}>
            {VISA_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setVisaFilter(f.id)}
                style={{
                  padding: "7px 14px", borderRadius: "20px", whiteSpace: "nowrap",
                  backgroundColor: visaFilter === f.id ? C.primary : "transparent",
                  color:           visaFilter === f.id ? "#fff"    : C.muted,
                  border: `1px solid ${visaFilter === f.id ? C.primary : C.border}`,
                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  fontFamily: "'Cairo',sans-serif", flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== شريط الترتيب ===== */}
        {!loading && !error && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "14px",
          }}>
            <span style={{ fontSize: "13px", color: C.muted }}>
              <span style={{ color: C.text, fontWeight: "700" }}>{sorted.length}</span> وكيل متاح
            </span>
            <button
              onClick={cycleSortBy}
              style={{
                padding: "7px 14px", backgroundColor: C.white,
                color: C.text, border: `1px solid ${C.border}`,
                borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif",
              }}
            >
              ترتيب: {SORT_LABELS[sortBy]}
            </button>
          </div>
        )}

        {/* ===== تحميل ===== */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
            <p style={{ fontSize: "14px", margin: 0 }}>جاري تحميل الوكلاء...</p>
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

        {/* ===== لا يوجد وكلاء ===== */}
        {!loading && !error && sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <p style={{ fontSize: "14px", margin: 0 }}>لا يوجد وكلاء لهذه الفلترة</p>
          </div>
        )}

        {/* ===== بطاقات الوكلاء ===== */}
        {!loading && !error && sorted.map((agent) => (
          <div
            key={agent.id}
            style={{
              backgroundColor: C.white, borderRadius: "12px",
              padding: "20px", marginBottom: "14px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              opacity: agent.available ? 1 : 0.6,
            }}
          >
            {/* رأس البطاقة: صورة + اسم + شارة التوثيق */}
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" }}>
              {/* دائرة الأحرف الأولى */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                backgroundColor: C.primary, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "800", color: "#ffffff",
              }}>
                {agent.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: C.text }}>
                    {agent.name}
                  </span>
                  {agent.verified && (
                    <span style={{
                      fontSize: "10px", fontWeight: "700", padding: "2px 8px",
                      borderRadius: "10px", backgroundColor: C.greenBg,
                      color: C.green, border: `1px solid ${C.greenBorder}`,
                    }}>
                      ✓ موثق
                    </span>
                  )}
                  {!agent.available && (
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                      backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`,
                    }}>
                      غير متاح
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: C.muted }}>{agent.specialtyLabel}</span>
              </div>
            </div>

            {/* إحصائيات الوكيل */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              backgroundColor: C.bg, borderRadius: "10px",
              padding: "12px", marginBottom: "16px", gap: "8px",
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: C.muted, margin: "0 0 3px" }}>التقييم</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: 0 }}>
                  ⭐ {agent.rating}
                  <span style={{ fontSize: "10px", color: C.muted, fontWeight: "400" }}>
                    {" "}({agent.reviewCount})
                  </span>
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: C.muted, margin: "0 0 3px" }}>التسليم</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: 0 }}>
                  ⏱ {agent.deliveryDays === 1 ? "24 ساعة" : `${agent.deliveryDays} أيام`}
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: C.muted, margin: "0 0 3px" }}>الرسوم</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: C.primary, margin: 0 }}>
                  {fmt(agent.price)} <span style={{ fontSize: "10px" }}>د.ع</span>
                </p>
              </div>
            </div>

            {/* زر الاختيار */}
            <button
              disabled={!agent.available}
              onClick={() => handleSelect(agent)}
              style={{
                width: "100%", padding: "13px",
                backgroundColor: agent.available ? C.primary : C.bg,
                color:           agent.available ? "#ffffff" : C.muted,
                border: agent.available ? "none" : `1px solid ${C.border}`,
                borderRadius: "10px", fontSize: "14px", fontWeight: "700",
                cursor: agent.available ? "pointer" : "not-allowed",
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {agent.available ? "اختار هذا الوكيل ←" : "غير متاح حالياً"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
