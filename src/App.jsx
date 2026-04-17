import React, { useState } from "react";
import Login          from "./pages/Login";
import AgentMarket    from "./pages/AgentMarket";
import BookVisa       from "./pages/BookVisa";
import TrackVisa      from "./pages/TrackVisa";
import Consultants    from "./pages/Consultants";
import ConsultantChat from "./pages/ConsultantChat";
import UserProfile    from "./pages/UserProfile";

// تحميل خط Cairo
const _link = document.createElement("link");
_link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap";
_link.rel  = "stylesheet";
document.head.appendChild(_link);

// ===== ثوابت الألوان =====
const C = {
  nav:     "#ffffff",
  primary: "#1e3a8a",
  text:    "#0f172a",
  muted:   "#64748b",
  border:  "#e2e8f0",
  bg:      "#f1f5f9",
  red:     "#dc2626",
};

export default function App() {
  const [page,           setPage]           = useState("login");
  const [userRole,       setUserRole]       = useState(null);    // مستخدم / وكيل / إدارة
  const [agentData,      setAgentData]      = useState(null);
  const [consultantData, setConsultantData] = useState(null);
  const [trackCode,      setTrackCode]      = useState("");      // رمز التتبع من الملف الشخصي

  // ===== تسجيل الدخول =====
  function handleLogin(role) {
    setUserRole(role);
    if (role === "مستخدم") {
      setPage("agentMarket");
    } else {
      // وكيل / إدارة — قريباً
      alert(`Dashboard الـ${role} قريباً! 🚀`);
    }
  }

  // ===== تسجيل الخروج =====
  function handleLogout() {
    setUserRole(null);
    setAgentData(null);
    setConsultantData(null);
    setPage("login");
  }

  // ===== التنقل بين الصفحات =====
  function navigate(p, data) {
    if (p === "track" && typeof data === "string") {
      setTrackCode(data);
    }
    setPage(p);
  }

  // ===== صفحة تسجيل الدخول لا تُظهر شريط التنقل =====
  if (page === "login") {
    return <Login onLogin={handleLogin} />;
  }

  const isUser = userRole === "مستخدم";

  return (
    <div
      dir="rtl"
      style={{
        backgroundColor: C.bg,
        minHeight: "100vh",
        fontFamily: "'Cairo','Segoe UI',sans-serif",
      }}
    >
      {/* ===== شريط التنقل العلوي ===== */}
      <div style={{
        backgroundColor: C.nav,
        borderBottom: "1px solid " + C.border,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        {/* الشعار */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          onClick={() => navigate("agentMarket")}
        >
          <span style={{ fontSize: "20px" }}>🛂</span>
          <span style={{ fontWeight: "800", color: C.primary, fontSize: "17px" }}>Visa Z</span>
          <span style={{
            backgroundColor: "#dbeafe",
            color: "#1e40af",
            fontSize: "10px", padding: "2px 8px",
            borderRadius: "10px", fontWeight: "700",
          }}>
            Super Qi
          </span>
        </div>

        {/* أزرار التنقل */}
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <NavBtn
            active={page === "agentMarket" || page === "book"}
            onClick={() => navigate("agentMarket")}
          >
            🏪 احجز فيزا
          </NavBtn>
          <NavBtn
            active={page === "track"}
            onClick={() => navigate("track")}
          >
            📍 تتبع
          </NavBtn>
          <NavBtn
            active={page === "consultants" || page === "consultantChat"}
            onClick={() => navigate("consultants")}
          >
            👨‍💼 مستشار
          </NavBtn>

          {/* زر الملف الشخصي — للمستخدم فقط */}
          {isUser && (
            <NavBtn
              active={page === "profile"}
              onClick={() => navigate("profile")}
            >
              👤 حسابي
            </NavBtn>
          )}

          {/* زر الخروج */}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              backgroundColor: "transparent",
              color: C.red,
              border: "1px solid " + C.red,
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "'Cairo',sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            خروج
          </button>
        </div>
      </div>

      {/* ===== محتوى الصفحات ===== */}
      {page === "agentMarket" && (
        <AgentMarket
          onNavigate={navigate}
          onSelectAgent={(data) => {
            setAgentData(data);
            navigate("book");
          }}
        />
      )}
      {page === "book" && (
        <BookVisa
          onNavigate={navigate}
          agent={agentData}
        />
      )}
      {page === "track" && (
        <TrackVisa
          onNavigate={navigate}
          initialCode={trackCode}
        />
      )}
      {page === "consultants" && (
        <Consultants
          onNavigate={navigate}
          onSelectConsultant={(data) => {
            setConsultantData(data);
            navigate("consultantChat");
          }}
        />
      )}
      {page === "consultantChat" && (
        <ConsultantChat
          onNavigate={navigate}
          consultant={consultantData}
        />
      )}
      {page === "profile" && (
        <UserProfile
          onNavigate={navigate}
          onLogout={handleLogout}
          userEmail="user@visa.iq"
        />
      )}
    </div>
  );
}

// ===== زر التنقل =====
function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        backgroundColor: active ? C.primary : "transparent",
        color:           active ? "#ffffff"  : C.muted,
        border: "1px solid " + (active ? C.primary : C.border),
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "'Cairo',sans-serif",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
