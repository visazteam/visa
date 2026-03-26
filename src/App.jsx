import React, { useState } from "react";
import BookVisa from "./pages/BookVisa";
import TrackVisa from "./pages/TrackVisa";

// تحميل خط Cairo
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

export default function App() {
  const [page, setPage] = useState("book");

  return (
    <div dir="rtl" style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif" }}>

      {/* ===== شريط التنقل العلوي ===== */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {/* الشعار */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px" }}>🛂</span>
          <span style={{ fontWeight: "800", color: "#1e3a8a", fontSize: "17px" }}>Visa Z</span>
          <span style={{
            backgroundColor: "#dbeafe", color: "#1e40af",
            fontSize: "10px", padding: "2px 8px",
            borderRadius: "12px", fontWeight: "700",
          }}>
            Super Qi
          </span>
        </div>

        {/* أزرار التنقل */}
        <div style={{ display: "flex", gap: "8px" }}>
          <NavBtn active={page === "book"} onClick={() => setPage("book")}>
            🛂 حجز فيزا
          </NavBtn>
          <NavBtn active={page === "track"} onClick={() => setPage("track")}>
            🔍 تتبع الطلب
          </NavBtn>
        </div>
      </div>

      {/* ===== محتوى الصفحات ===== */}
      {page === "book"  && <BookVisa  onNavigate={setPage} />}
      {page === "track" && <TrackVisa onNavigate={setPage} />}
    </div>
  );
}

// زر التنقل في الهيدر
function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 18px",
        backgroundColor: active ? "#1e3a8a" : "transparent",
        color: active ? "#ffffff" : "#64748b",
        border: "1px solid " + (active ? "#1e3a8a" : "#e2e8f0"),
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "'Cairo', sans-serif",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
