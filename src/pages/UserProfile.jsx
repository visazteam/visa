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
  green:        "#16a34a",  greenBg:    "#dcfce7",  greenBorder: "#86efac",
  orange:       "#d97706",  orangeBg:   "#fffbeb",  orangeBorder:"#fde68a",
  yellow:       "#ca8a04",  yellowBg:   "#fefce8",  yellowBorder:"#fef08a",
  red:          "#dc2626",  redBg:      "#fee2e2",  redBorder:   "#fca5a5",
};

// ===== حالات الطلبات =====
const STATUS_MAP = {
  approved:          { color: C.green,  bg: C.greenBg,  border: C.greenBorder,  icon: "✅", label: "مقبولة"        },
  processing:        { color: C.orange, bg: C.orangeBg, border: C.orangeBorder, icon: "⏳", label: "قيد المعالجة"  },
  waiting_documents: { color: C.yellow, bg: C.yellowBg, border: C.yellowBorder, icon: "⚠️", label: "بانتظار وثائق" },
  rejected:          { color: C.red,    bg: C.redBg,    border: C.redBorder,    icon: "❌", label: "مرفوضة"         },
};

// ===== طلبات وهمية =====
const MOCK_ORDERS = [
  { code: "VISA-IQ-2025-084721", country: "تركيا",    visa: "سياحية", agent: "وكالة النخبة",   date: "2025-03-01", status: "approved"          },
  { code: "VISA-IQ-2025-091833", country: "الإمارات", visa: "طبية",   agent: "ميسر للتأشيرات", date: "2025-03-10", status: "processing"        },
  { code: "VISA-IQ-2025-067412", country: "ألمانيا",  visa: "دراسية", agent: "السفر العراقي",  date: "2025-02-20", status: "waiting_documents" },
  { code: "VISA-IQ-2025-055109", country: "كندا",     visa: "أعمال",  agent: "وكالة النخبة",   date: "2025-01-15", status: "rejected"          },
];

// ===== فلاتر الحالة =====
const STATUS_FILTERS = [
  { id: "all",               label: "الكل"           },
  { id: "approved",          label: "مقبولة"          },
  { id: "processing",        label: "قيد المعالجة"   },
  { id: "waiting_documents", label: "بانتظار وثائق"  },
  { id: "rejected",          label: "مرفوضة"          },
];

// ===== المكوّن الرئيسي =====
export default function UserProfile({ onNavigate, onLogout, userEmail = "user@visa.iq" }) {
  // ===== حالة تعديل الملف الشخصي =====
  const [editing,    setEditing]    = useState(false);
  const [fullName,   setFullName]   = useState("أحمد محمد الجبوري");
  const [phone,      setPhone]      = useState("+964 770 123 4567");
  const [tempName,   setTempName]   = useState(fullName);
  const [tempPhone,  setTempPhone]  = useState(phone);

  // ===== حالة الطلبات =====
  const [statusFilter, setStatusFilter] = useState("all");

  // ===== حالة الإعدادات =====
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [emailNotif,    setEmailNotif]    = useState(true);

  // ===== بيانات مشتقة =====
  const initials = fullName.split(" ").slice(0, 2).map((w) => w[0]).join("");
  const filteredOrders = statusFilter === "all"
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter((o) => o.status === statusFilter);

  // ===== إحصائيات =====
  const totalOrders    = MOCK_ORDERS.length;
  const approvedOrders = MOCK_ORDERS.filter((o) => o.status === "approved").length;
  const activeOrders   = MOCK_ORDERS.filter((o) => o.status === "processing" || o.status === "waiting_documents").length;

  // ===== معالجات =====
  function startEdit()  { setTempName(fullName); setTempPhone(phone); setEditing(true);  }
  function cancelEdit() { setEditing(false); }
  function saveEdit()   { setFullName(tempName); setPhone(tempPhone); setEditing(false); }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: "60px", direction: "rtl", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>

      {/* ===== هيرو ===== */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        borderRadius: "0 0 20px 20px",
        padding: "32px 28px 36px",
        marginBottom: "20px",
        color: "#ffffff",
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 6px" }}>👤 حسابي</h1>
        <p style={{ fontSize: "13px", opacity: 0.85, margin: 0 }}>إدارة بياناتك وطلباتك</p>
      </div>

      <div style={{ maxWidth: "430px", margin: "0 auto", padding: "0 16px" }}>

        {/* ═══════════════════════════════════════
            القسم 1: الملف الشخصي
        ═══════════════════════════════════════ */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "20px", marginBottom: "16px",
          border: "1px solid " + C.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>

          {/* الصورة الرمزية + المعلومات */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              backgroundColor: C.primary, color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: "800",
              margin: "0 auto 12px",
            }}>
              {initials}
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: "800", color: C.text, margin: "0 0 4px" }}>
              {fullName}
            </h2>
            <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 4px" }}>{userEmail}</p>
            <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>تاريخ الانضمام: يناير 2025</p>
          </div>

          {/* ===== نموذج التعديل ===== */}
          {editing ? (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.muted, marginBottom: "5px" }}>الاسم الكامل</label>
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  style={INPUT_STYLE}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.muted, marginBottom: "5px" }}>رقم الهاتف</label>
                <input
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  style={{ ...INPUT_STYLE, direction: "ltr", textAlign: "right" }}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.muted, marginBottom: "5px" }}>البريد الإلكتروني</label>
                <input
                  value={userEmail}
                  disabled
                  style={{ ...INPUT_STYLE, color: C.muted, cursor: "not-allowed", direction: "ltr", textAlign: "right" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={saveEdit} style={BTN_PRIMARY}>حفظ التغييرات</button>
                <button onClick={cancelEdit} style={BTN_OUTLINE}>إلغاء</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 8px" }}>{phone}</p>
              <button onClick={startEdit} style={BTN_OUTLINE}>تعديل الملف الشخصي</button>
            </div>
          )}

          {/* ===== إحصائيات ===== */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { label: "الطلبات الكلية",   value: totalOrders,    color: C.primary },
              { label: "مقبولة",            value: approvedOrders, color: C.green   },
              { label: "قيد المعالجة",      value: activeOrders,   color: C.orange  },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: C.bg, borderRadius: "10px",
                padding: "10px 8px", textAlign: "center",
                border: "1px solid " + C.border,
              }}>
                <p style={{ fontSize: "20px", fontWeight: "800", color: stat.color, margin: "0 0 2px" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "10px", color: C.muted, margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            القسم 2: طلباتي السابقة
        ═══════════════════════════════════════ */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "20px", marginBottom: "16px",
          border: "1px solid " + C.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 14px" }}>
            📋 طلباتي
          </h3>

          {/* فلاتر الحالة */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px", marginBottom: "14px" }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: "5px 12px",
                  backgroundColor: statusFilter === f.id ? C.primary : C.bg,
                  color:           statusFilter === f.id ? "#ffffff"  : C.muted,
                  border: "1px solid " + (statusFilter === f.id ? C.primary : C.border),
                  borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "'Cairo',sans-serif", flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* قائمة الطلبات */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredOrders.length === 0 && (
              <p style={{ textAlign: "center", color: C.muted, fontSize: "13px", padding: "20px 0" }}>
                لا يوجد طلبات
              </p>
            )}
            {filteredOrders.map((order) => {
              const cfg = STATUS_MAP[order.status];
              return (
                <div key={order.code} style={{
                  backgroundColor: C.bg, borderRadius: "10px",
                  padding: "12px 14px", border: "1px solid " + C.border,
                }}>
                  {/* الصف العلوي: رمز + شارة */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "monospace", fontSize: "11px",
                      color: C.primary, fontWeight: "700",
                    }}>
                      {order.code}
                    </span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "3px 10px", borderRadius: "14px",
                      backgroundColor: cfg.bg, color: cfg.color,
                      border: "1px solid " + cfg.border,
                      fontSize: "11px", fontWeight: "700",
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* تفاصيل */}
                  <p style={{ fontSize: "13px", fontWeight: "600", color: C.text, margin: "0 0 2px" }}>
                    {order.country} — {order.visa}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: C.muted }}>{order.agent} · {order.date}</span>
                    <button
                      onClick={() => onNavigate("track", order.code)}
                      style={{
                        backgroundColor: "transparent",
                        color: C.primary,
                        border: "1px solid " + C.primary,
                        borderRadius: "6px", padding: "4px 12px",
                        fontSize: "11px", fontWeight: "700",
                        cursor: "pointer", fontFamily: "'Cairo',sans-serif",
                      }}
                    >
                      تتبع
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            القسم 3: الإعدادات
        ═══════════════════════════════════════ */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "20px", marginBottom: "16px",
          border: "1px solid " + C.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 16px" }}>
            ⚙️ الإعدادات
          </h3>

          {/* أزرار التبديل */}
          <ToggleRow
            label="إشعارات واتساب"
            icon="📱"
            value={whatsappNotif}
            onChange={setWhatsappNotif}
          />
          <div style={{ height: "1px", backgroundColor: C.border, margin: "12px 0" }} />
          <ToggleRow
            label="إشعارات البريد الإلكتروني"
            icon="📧"
            value={emailNotif}
            onChange={setEmailNotif}
          />

          {/* منطقة الخطر */}
          <div style={{
            marginTop: "20px", paddingTop: "16px",
            borderTop: "1px solid " + C.border,
          }}>
            <button
              onClick={onLogout}
              style={{
                width: "100%", padding: "11px",
                backgroundColor: "transparent",
                color: C.red, border: "1px solid " + C.red,
                borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.redBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ===== مكوّن زر التبديل =====
function ToggleRow({ label, icon, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "13px", color: C.text, fontWeight: "600" }}>
        {icon} {label}
      </span>
      <button
        onClick={() => onChange((v) => !v)}
        style={{
          width: "46px", height: "26px",
          borderRadius: "13px",
          backgroundColor: value ? C.primary : C.border,
          border: "none", cursor: "pointer",
          position: "relative", transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: "3px",
          right: value ? "3px" : "21px",
          width: "20px", height: "20px",
          borderRadius: "50%", backgroundColor: "#ffffff",
          transition: "right 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ===== أنماط مشتركة =====
const INPUT_STYLE = {
  width: "100%", padding: "10px 12px",
  border: "1px solid " + C.border,
  borderRadius: "8px", fontSize: "13px",
  color: C.text, backgroundColor: C.inputBg,
  boxSizing: "border-box", outline: "none",
  fontFamily: "'Cairo',sans-serif",
};

const BTN_PRIMARY = {
  flex: 1, padding: "10px 16px",
  backgroundColor: C.primary, color: "#ffffff",
  border: "none", borderRadius: "8px",
  fontSize: "13px", fontWeight: "700",
  cursor: "pointer", fontFamily: "'Cairo',sans-serif",
};

const BTN_OUTLINE = {
  flex: 1, padding: "10px 16px",
  backgroundColor: "transparent", color: C.primary,
  border: "1px solid " + C.primary, borderRadius: "8px",
  fontSize: "13px", fontWeight: "700",
  cursor: "pointer", fontFamily: "'Cairo',sans-serif",
};
