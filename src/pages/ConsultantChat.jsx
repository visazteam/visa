import React, { useState, useEffect, useRef } from "react";
import { bookConsultantSession } from "../api/visaApi";

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
  green:        "#16a34a",  greenBg: "#dcfce7",
  red:          "#dc2626",
};

// عدد الرسائل المجانية
const FREE_MSG_LIMIT = 3;

// ردود تلقائية من المستشار
const AUTO_REPLIES = [
  "بالتأكيد، يمكنني مساعدتك في هذا الموضوع.",
  "سؤال ممتاز! دعني أشرح لك التفاصيل.",
  "هذا يعتمد على نوع التأشيرة وبلد الوجهة.",
  "في الغالب تستغرق المعالجة من 3 إلى 7 أيام عمل.",
  "يمكنك التواصل معي في أي وقت للمزيد من الاستفسارات.",
  "الوثائق المطلوبة تختلف حسب الجنسية ونوع الفيزا.",
];

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function ConsultantChat({ onNavigate, consultant }) {
  // ===== حالة الدردشة =====
  const [messages,   setMessages]   = useState([
    { role: "consultant", text: `مرحباً! أنا ${consultant?.name || "المستشار"}، كيف أقدر أساعدك؟` },
  ]);
  const [input,      setInput]      = useState("");
  const [freeCount,  setFreeCount]  = useState(0);   // عدد الرسائل المرسلة مجاناً
  const [booked,     setBooked]     = useState(false);
  const [booking,    setBooking]    = useState(false);
  const [bookError,  setBookError]  = useState("");
  const [postCount,  setPostCount]  = useState(0);   // رسائل ما بعد الحجز
  const [rating,     setRating]     = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [timerSec,   setTimerSec]   = useState(0);

  const messagesEndRef = useRef(null);

  // ===== تمرير تلقائي لآخر رسالة =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== مؤقت الجلسة — يبدأ بعد الحجز =====
  useEffect(() => {
    if (!booked) return;
    const id = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [booked]);

  // ===== إرسال رسالة =====
  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    if (!booked) setFreeCount((n) => n + 1);
    else         setPostCount((n) => n + 1);
    // رد تلقائي بعد ثانية
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setMessages((prev) => [...prev, { role: "consultant", text: reply }]);
    }, 1000);
  };

  // ===== حجز جلسة مدفوعة =====
  const handleBook = async () => {
    setBooking(true);
    setBookError("");
    try {
      await bookConsultantSession(consultant?.id);
      setBooked(true);
      setMessages((prev) => [
        ...prev,
        { role: "system", text: "✅ تم الحجز! الجلسة بدأت — تحدث بحرية الآن" },
      ]);
    } catch (err) {
      setBookError(err.message);
    } finally {
      setBooking(false);
    }
  };

  const showBookPrompt = !booked && freeCount >= FREE_MSG_LIMIT;
  const showRating     = booked && postCount >= 5 && !ratingDone;

  const price = consultant ? (consultant.pricePerHour / 1000).toFixed(0) + "k" : "18k";

  return (
    <div style={{
      backgroundColor: C.bg, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      maxWidth: "860px", margin: "0 auto",
    }}>

      {/* ===== هيدر الدردشة ===== */}
      <div style={{
        backgroundColor: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: "12px",
        position: "sticky", top: "56px", zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* زر الرجوع */}
        <button
          onClick={() => onNavigate("consultants")}
          style={{
            background: "none", border: `1px solid ${C.border}`,
            borderRadius: "8px", color: C.muted,
            fontSize: "13px", cursor: "pointer",
            padding: "6px 12px", fontFamily: "'Cairo',sans-serif",
          }}
        >
          → رجوع
        </button>

        {/* دائرة الأحرف */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          backgroundColor: C.primary, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px", fontWeight: "800", color: "#fff",
        }}>
          {consultant?.initials || "م"}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: 0 }}>
            {consultant?.name || "المستشار"}
          </p>
          <p style={{ fontSize: "11px", color: C.green, margin: 0 }}>🟢 متاح الآن</p>
        </div>

        {/* مؤقت الجلسة */}
        {booked && (
          <span style={{
            fontSize: "13px", fontWeight: "700",
            backgroundColor: C.primaryLight, color: C.primary,
            padding: "5px 12px", borderRadius: "12px",
            border: `1px solid #bfdbfe`,
          }}>
            ⏱ {formatTime(timerSec)}
          </span>
        )}
      </div>

      {/* ===== منطقة الرسائل ===== */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 20px 8px",
        display: "flex", flexDirection: "column", gap: "10px",
        minHeight: 0,
      }}>
        {messages.map((msg, i) => {
          /* رسالة النظام */
          if (msg.role === "system") return (
            <div key={i} style={{ textAlign: "center" }}>
              <span style={{
                display: "inline-block",
                backgroundColor: C.primaryLight, color: C.primary,
                fontSize: "12px", fontWeight: "600",
                padding: "6px 16px", borderRadius: "20px",
                border: `1px solid #bfdbfe`,
              }}>
                {msg.text}
              </span>
            </div>
          );

          const isUser = msg.role === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-start" : "flex-end" }}>
              <div style={{
                maxWidth: "75%", padding: "10px 14px",
                backgroundColor: isUser ? C.white : C.primary,
                color:           isUser ? C.text  : "#ffffff",
                borderRadius: isUser ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                fontSize: "13px", lineHeight: 1.65,
                border: isUser ? `1px solid ${C.border}` : "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ===== مطالبة الحجز (بعد 3 رسائل مجانية) ===== */}
      {showBookPrompt && (
        <div style={{
          margin: "8px 20px 12px",
          backgroundColor: C.white, borderRadius: "12px",
          padding: "20px", border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
          <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 6px" }}>
            انتهت رسائلك المجانية الـ {FREE_MSG_LIMIT}
          </p>
          <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 16px" }}>
            احجز جلسة للاستمرار
          </p>
          <p style={{ fontSize: "14px", fontWeight: "600", color: C.text, margin: "0 0 14px" }}>
            {consultant?.name} — {price} د.ع / ساعة
          </p>
          {bookError && (
            <p style={{ fontSize: "12px", color: C.red, margin: "0 0 10px" }}>⚠️ {bookError}</p>
          )}
          <button
            onClick={handleBook}
            disabled={booking}
            style={{
              width: "100%", padding: "13px",
              backgroundColor: booking ? C.muted : C.primary,
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: "700",
              cursor: booking ? "not-allowed" : "pointer",
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            {booking ? "⏳ جاري الحجز..." : "احجز الآن — ادفع بـ Ki-Card 💳"}
          </button>
        </div>
      )}

      {/* ===== نموذج التقييم (بعد الجلسة) ===== */}
      {showRating && (
        <div style={{
          margin: "8px 20px 12px",
          backgroundColor: C.white, borderRadius: "12px",
          padding: "20px", border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 16px" }}>
            كيف كانت تجربتك مع {consultant?.name}؟
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "30px", color: star <= rating ? "#f59e0b" : C.border,
                  transition: "color 0.15s",
                }}
              >
                ★
              </button>
            ))}
          </div>
          <button
            disabled={rating === 0}
            onClick={() => setRatingDone(true)}
            style={{
              padding: "11px 32px",
              backgroundColor: rating > 0 ? C.primary : C.bg,
              color:           rating > 0 ? "#fff"    : C.muted,
              border:          rating > 0 ? "none"    : `1px solid ${C.border}`,
              borderRadius: "10px", fontSize: "14px", fontWeight: "700",
              cursor: rating > 0 ? "pointer" : "not-allowed",
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            إرسال التقييم
          </button>
        </div>
      )}

      {/* ===== شريط الإدخال ===== */}
      {!showBookPrompt && !showRating && (
        <div style={{
          backgroundColor: C.white, borderTop: `1px solid ${C.border}`,
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          {/* عداد الرسائل المجانية */}
          {!booked && (
            <span style={{
              fontSize: "10px", color: C.muted, whiteSpace: "nowrap",
              flexShrink: 0, lineHeight: 1.3, textAlign: "center",
            }}>
              {FREE_MSG_LIMIT - freeCount}<br />مجاني
            </span>
          )}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="اكتب رسالتك..."
            style={{
              flex: 1, padding: "10px 14px",
              border: `1px solid ${C.border}`, borderRadius: "10px",
              fontSize: "13px", color: C.text, backgroundColor: C.inputBg,
              outline: "none", fontFamily: "'Cairo',sans-serif",
            }}
          />

          {/* زر الإرسال */}
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
              backgroundColor: input.trim() ? C.primary : C.bg,
              color:           input.trim() ? "#fff"    : C.muted,
              border: `1px solid ${input.trim() ? C.primary : C.border}`,
              cursor: input.trim() ? "pointer" : "not-allowed",
              fontSize: "16px", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            ←
          </button>
        </div>
      )}
    </div>
  );
}
