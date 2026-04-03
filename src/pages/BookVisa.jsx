import React, { useState, useEffect } from "react";
import { getCountries, submitVisaApplication, uploadDocument } from "../api/visaApi";

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
  green:        "#16a34a",  greenBg:    "#dcfce7",  greenBorder: "#86efac",
  orange:       "#d97706",  orangeBg:   "#fffbeb",  orangeBorder:"#fde68a",
  red:          "#dc2626",  redBg:      "#fee2e2",  redBorder:   "#fca5a5",
  yellow:       "#ca8a04",  yellowBg:   "#fefce8",  yellowBorder:"#fef08a",
};

// ===== أنواع التأشيرات =====
const VISA_TYPES = [
  { id: "tourist",  label: "سياحية",  icon: "✈️",  sub: "للسفر والسياحة"    },
  { id: "business", label: "أعمال",   icon: "💼",  sub: "للتجار والمؤتمرات" },
  { id: "study",    label: "دراسة",   icon: "🎓",  sub: "للطلاب والجامعات"  },
  { id: "family",   label: "عائلية",  icon: "👨‍👩‍👧", sub: "لم الشمل العائلي"  },
  { id: "transit",  label: "عبور",    icon: "🔄",  sub: "توقف في دولة أخرى" },
  { id: "medical",  label: "طبية",    icon: "🏥",  sub: "للرحلات الصحية"    },
];

// ===== وثائق كل نوع تأشيرة =====
const VISA_DOCS = {
  tourist: [
    { id: "passport",      label: "صورة جواز السفر" },
    { id: "photo",         label: "صورة شخصية" },
    { id: "bankStatement", label: "كشف حساب بنكي" },
    { id: "hotelBooking",  label: "حجز فندق" },
    { id: "flightTicket",  label: "تذكرة الطيران" },
    { id: "insurance",     label: "تأمين سفر" },
  ],
  business: [
    { id: "passport",         label: "صورة جواز السفر" },
    { id: "photo",            label: "صورة شخصية" },
    { id: "invitationLetter", label: "خطاب دعوة من الشركة" },
    { id: "bankStatement",    label: "كشف حساب بنكي" },
    { id: "commercialReg",    label: "السجل التجاري" },
    { id: "insurance",        label: "تأمين سفر" },
  ],
  study: [
    { id: "passport",         label: "صورة جواز السفر" },
    { id: "photo",            label: "صورة شخصية" },
    { id: "acceptanceLetter", label: "خطاب القبول الجامعي" },
    { id: "bankStatement",    label: "كشف حساب بنكي" },
    { id: "transcripts",      label: "كشف الدرجات الدراسية" },
    { id: "insurance",        label: "تأمين صحي" },
  ],
  family: [
    { id: "passport",      label: "صورة جواز السفر" },
    { id: "photo",         label: "صورة شخصية" },
    { id: "familyBook",    label: "وثيقة الأسرة" },
    { id: "sponsorId",     label: "هوية الكفيل" },
    { id: "bankStatement", label: "كشف حساب بنكي" },
    { id: "insurance",     label: "تأمين سفر" },
  ],
  transit: [
    { id: "passport",        label: "صورة جواز السفر" },
    { id: "photo",           label: "صورة شخصية" },
    { id: "flightTicket",    label: "تذكرة الطيران (للرحلة النهائية)" },
    { id: "destinationVisa", label: "تأشيرة الوجهة النهائية" },
  ],
  medical: [
    { id: "passport",             label: "صورة جواز السفر" },
    { id: "photo",                label: "صورة شخصية" },
    { id: "medicalReport",        label: "التقرير الطبي" },
    { id: "hospitalAppointment",  label: "موعد المستشفى" },
    { id: "bankStatement",        label: "كشف حساب بنكي" },
    { id: "insurance",            label: "تأمين صحي" },
  ],
};

// ===== خطوات التقديم =====
const STEPS = [
  { n: 1, label: "نوع التأشيرة"    },
  { n: 2, label: "الدولة والتفاصيل" },
  { n: 3, label: "الوثائق"          },
  { n: 4, label: "الدفع"            },
];

const GUARANTEE_COUNTRIES = ["TR", "AE"];
const GUARANTEE_FEE = 10000;

// ===== أنماط مشتركة =====
const BTN_PRIMARY = {
  backgroundColor: C.primary, color: "#ffffff", border: "none",
  borderRadius: "8px", padding: "12px 24px", fontSize: "14px",
  fontWeight: "700", cursor: "pointer", fontFamily: "'Cairo',sans-serif",
  display: "inline-block",
};

const INPUT_STYLE = {
  width: "100%", padding: "10px 12px", border: "1px solid " + C.border,
  borderRadius: "8px", fontSize: "13px", color: C.text,
  backgroundColor: C.inputBg, boxSizing: "border-box",
  outline: "none", fontFamily: "'Cairo',sans-serif",
};

const LABEL_S = { fontSize: "10px", color: C.muted, margin: "0 0 2px" };
const VAL_S   = { fontSize: "13px", fontWeight: "600", color: C.text, margin: 0 };

// ===== المكوّن الرئيسي =====
export default function BookVisa({ agent, onNavigate }) {
  const [visa,          setVisa]          = useState("");
  const [countries,     setCountries]     = useState([]);
  const [country,       setCountry]       = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [familyMembers, setFamilyMembers] = useState([]);
  const [visaGuarantee, setVisaGuarantee] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState("");
  const [success,       setSuccess]       = useState(null);
  const [form,          setForm]          = useState({
    fullName: "", passportNo: "", expiry: "", nationality: "",
    phone: "", email: "", travelDate: "", returnDate: "", travelers: "1",
  });

  useEffect(() => {
    getCountries().then(setCountries).catch(() => {});
  }, []);

  // ===== قيم مشتقة =====
  const currentDocs     = VISA_DOCS[visa] || [];
  const uploadedCount   = currentDocs.filter(d => uploadedFiles[d.id]?.status === "done").length;
  const allDocsUploaded = uploadedCount === currentDocs.length && currentDocs.length > 0;
  const progressPct     = currentDocs.length > 0 ? Math.round((uploadedCount / currentDocs.length) * 100) : 0;
  const travelersNum    = parseInt(form.travelers) || 1;
  const additionalCount = Math.max(0, travelersNum - 1);
  const agentFee        = agent?.agentPrice || 0;
  const total           = agentFee + (visaGuarantee ? GUARANTEE_FEE : 0);
  const showGuarantee   = country && GUARANTEE_COUNTRIES.includes(country.id);
  const visaLabel       = VISA_TYPES.find(v => v.id === visa)?.label || "";

  const filteredCountries = countries.filter(c =>
    !countrySearch ||
    c.name.includes(countrySearch) ||
    c.id.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ===== حساب الخطوة الحالية =====
  function getStep() {
    if (!visa) return 1;
    if (!country || !form.fullName || !form.passportNo || !form.travelDate) return 2;
    if (!allDocsUploaded) return 3;
    return 4;
  }
  const currentStep = getStep();

  // ===== معالجات =====
  function handleVisaChange(visaId) {
    setVisa(visaId);
    setCountry(null);
    setUploadedFiles({});
    setTermsAccepted(false);
    setVisaGuarantee(false);
  }

  async function handleFileUpload(docId, file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadedFiles(prev => ({ ...prev, [docId]: { status: "error", name: file.name, error: "نوع الملف غير مدعوم (jpg/png/pdf فقط)" } }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadedFiles(prev => ({ ...prev, [docId]: { status: "error", name: file.name, error: "حجم الملف يتجاوز 5 ميغابايت" } }));
      return;
    }
    setUploadedFiles(prev => ({ ...prev, [docId]: { status: "loading", name: file.name } }));
    try {
      await uploadDocument(docId, file);
      setUploadedFiles(prev => ({ ...prev, [docId]: { status: "done", name: file.name } }));
    } catch (err) {
      setUploadedFiles(prev => ({ ...prev, [docId]: { status: "error", name: file.name, error: err.message || "فشل الرفع" } }));
    }
  }

  function removeFile(docId) {
    setUploadedFiles(prev => { const n = { ...prev }; delete n[docId]; return n; });
  }

  async function handleSubmit() {
    if (!termsAccepted || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = {
        visa, country: country?.id, agent: agent?.id,
        visaGuarantee, ...form, familyMembers,
        uploadedFiles: Object.keys(uploadedFiles).filter(k => uploadedFiles[k].status === "done"),
      };
      const res = await submitVisaApplication(data);
      setSuccess({ trackingCode: res.trackingCode });
    } catch (err) {
      setSubmitError(err.message || "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setSubmitting(false);
    }
  }

  function updateFamilyMember(index, field, value) {
    setFamilyMembers(prev => {
      const updated = [...prev];
      if (!updated[index]) updated[index] = {};
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function updateForm(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "travelers") {
        const n = Math.max(0, parseInt(value) - 1 || 0);
        setFamilyMembers(arr => {
          const copy = [...arr];
          while (copy.length < n) copy.push({});
          return copy.slice(0, n);
        });
      }
      return next;
    });
  }

  // ===== شاشة النجاح =====
  if (success) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", direction: "rtl", fontFamily: "'Cairo',sans-serif" }}>
        <div style={{ maxWidth: "380px", width: "100%", backgroundColor: C.white, borderRadius: "16px", padding: "36px 28px", textAlign: "center", border: "1px solid " + C.border, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: C.text, margin: "0 0 8px" }}>تم تقديم الطلب!</h2>
          <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 24px" }}>طلبك في طريقه للمعالجة</p>
          <div style={{ backgroundColor: C.primaryLight, border: "1px solid " + C.primary, borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", color: C.muted, margin: "0 0 6px" }}>رمز التتبع</p>
            <p style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: "700", color: C.primary, margin: 0 }}>{success.trackingCode}</p>
          </div>
          {agent && (
            <>
              <p style={{ fontSize: "13px", color: C.text, margin: "0 0 6px" }}>وكيلك: <strong>{agent.name}</strong> سيتولى طلبك</p>
              <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 24px" }}>مدة التسليم المتوقعة: <strong>{agent.deliveryDays}</strong> أيام</p>
            </>
          )}
          <button onClick={() => onNavigate("track")} style={{ ...BTN_PRIMARY, width: "100%", padding: "14px" }}>
            📍 تتبع طلبي
          </button>
        </div>
      </div>
    );
  }

  // ===== الصفحة الرئيسية =====
  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: "80px", direction: "rtl", fontFamily: "'Cairo',sans-serif" }}>
      <div style={{ maxWidth: "430px", margin: "0 auto" }}>

        {/* ===== 1. هيرو ===== */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", borderRadius: "0 0 20px 20px", padding: "32px 28px 36px", marginBottom: "20px", color: "#ffffff" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 8px" }}>🛂 طلب تأشيرة إلكترونية</h1>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: "0 0 24px" }}>أسهل طريقة للحصول على تأشيرتك</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button style={{ backgroundColor: "#ffffff", color: C.primary, border: "none", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
              ابدأ طلبك الآن ←
            </button>
            <button
              onClick={() => onNavigate("track")}
              style={{ backgroundColor: "transparent", color: "#ffffff", border: "2px solid rgba(255,255,255,0.7)", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
            >
              🔍 تتبع طلب موجود
            </button>
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* ===== 2. مؤشر الخطوات ===== */}
          <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: "14px", right: "14px", left: "14px", height: "2px", backgroundColor: C.border, zIndex: 0 }} />
              <div style={{
                position: "absolute", top: "14px", right: "14px", height: "2px",
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                backgroundColor: C.primary, zIndex: 1, transition: "width 0.4s ease",
              }} />
              {STEPS.map(s => (
                <div key={s.n} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", margin: "0 auto 6px",
                    backgroundColor: s.n <= currentStep ? C.primary : C.white,
                    border: "2px solid " + (s.n <= currentStep ? C.primary : C.border),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: "700",
                    color: s.n <= currentStep ? "#ffffff" : C.muted,
                  }}>
                    {s.n < currentStep ? "✓" : s.n}
                  </div>
                  <p style={{ fontSize: "10px", fontWeight: "600", color: s.n === currentStep ? C.primary : C.muted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ===== 3. بانر الوكيل ===== */}
          <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {agent ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: 0 }}>الوكيل المختار</h3>
                  <button
                    onClick={() => onNavigate("agentMarket")}
                    style={{ backgroundColor: "transparent", color: C.primary, border: "1px solid " + C.primary, borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}
                  >
                    تغيير الوكيل
                  </button>
                </div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div><p style={LABEL_S}>الاسم</p><p style={VAL_S}>{agent.name}</p></div>
                  <div><p style={LABEL_S}>التقييم</p><p style={VAL_S}>⭐ {agent.rating}</p></div>
                  <div><p style={LABEL_S}>مدة التسليم</p><p style={VAL_S}>⏱ {agent.deliveryDays} أيام</p></div>
                  <div><p style={LABEL_S}>رسوم الخدمة</p><p style={{ ...VAL_S, color: C.primary, fontWeight: "700" }}>{agentFee.toLocaleString()} د.ع</p></div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 14px" }}>لم تختر وكيلاً بعد — اختر وكيلاً لمعالجة طلبك</p>
                <button onClick={() => onNavigate("agentMarket")} style={{ ...BTN_PRIMARY, padding: "10px 20px" }}>اختر وكيلاً الآن</button>
              </div>
            )}
          </div>

          {/* ===== 4. اختيار نوع التأشيرة ===== */}
          <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 14px" }}>اختر نوع التأشيرة</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {VISA_TYPES.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleVisaChange(v.id)}
                  style={{
                    padding: "12px 6px", borderRadius: "10px", cursor: "pointer",
                    textAlign: "center", fontFamily: "'Cairo',sans-serif",
                    ...(visa === v.id
                      ? { backgroundColor: C.primaryLight, border: "2px solid " + C.primary }
                      : { backgroundColor: C.white, border: "2px solid " + C.border }),
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{v.icon}</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: visa === v.id ? C.primary : C.text, marginBottom: "2px" }}>{v.label}</div>
                  <div style={{ fontSize: "9px", color: C.muted }}>{v.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ===== 5. اختيار الدولة ===== */}
          {visa && (
            <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 14px" }}>اختر الدولة</h3>
              <input
                style={{ ...INPUT_STYLE, marginBottom: "12px" }}
                placeholder="🔍 ابحث عن دولة..."
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
                {filteredCountries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCountry(c)}
                    style={{
                      padding: "10px 4px", borderRadius: "10px", cursor: "pointer",
                      textAlign: "center", fontFamily: "'Cairo',sans-serif",
                      ...(country?.id === c.id
                        ? { backgroundColor: C.primaryLight, border: "2px solid " + C.primary }
                        : { backgroundColor: C.white, border: "2px solid " + C.border }),
                    }}
                  >
                    <div style={{ fontSize: "18px", marginBottom: "3px" }}>{c.flag}</div>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: country?.id === c.id ? C.primary : C.text, marginBottom: "2px" }}>{c.name}</div>
                    <div style={{ fontSize: "9px", color: C.muted }}>{c.fee ? c.fee.toLocaleString() + " د.ع" : "مجاني"}</div>
                  </button>
                ))}
              </div>

              {/* ===== 6. بيانات المتقدم ===== */}
              {country && (
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid " + C.border }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 14px" }}>📋 بيانات المتقدم</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <Field label="الاسم الكامل">
                      <FInput placeholder="الاسم الكامل" value={form.fullName} onChange={v => updateForm("fullName", v)} />
                    </Field>
                    <Field label="رقم جواز السفر">
                      <FInput placeholder="A12345678" value={form.passportNo} onChange={v => updateForm("passportNo", v)} />
                    </Field>
                    <Field label="تاريخ انتهاء الجواز">
                      <FInput type="date" value={form.expiry} onChange={v => updateForm("expiry", v)} />
                    </Field>
                    <Field label="الجنسية">
                      <FInput placeholder="عراقي" value={form.nationality} onChange={v => updateForm("nationality", v)} />
                    </Field>
                    <Field label="رقم الهاتف">
                      <FInput placeholder="07XXXXXXXXX" value={form.phone} onChange={v => updateForm("phone", v)} />
                    </Field>
                    <Field label="البريد الإلكتروني">
                      <FInput type="email" placeholder="email@example.com" value={form.email} onChange={v => updateForm("email", v)} />
                    </Field>
                    <Field label="تاريخ السفر">
                      <FInput type="date" value={form.travelDate} onChange={v => updateForm("travelDate", v)} />
                    </Field>
                    <Field label="تاريخ العودة">
                      <FInput type="date" value={form.returnDate} onChange={v => updateForm("returnDate", v)} />
                    </Field>
                    <Field label="عدد المسافرين">
                      <FSelect
                        value={form.travelers}
                        onChange={v => updateForm("travelers", v)}
                        options={["1","2","3","4","5","6","7","8","9","10"].map(n => ({ value: n, label: n + (n === "1" ? " مسافر" : " مسافرين") }))}
                      />
                    </Field>
                  </div>

                  {/* أفراد العائلة */}
                  {additionalCount > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <h3 style={{ fontSize: "13px", fontWeight: "700", color: C.text, margin: "0 0 12px" }}>👨‍👩‍👧 أفراد العائلة المسافرون</h3>
                      {Array.from({ length: additionalCount }).map((_, i) => (
                        <div key={i} style={{ backgroundColor: C.bg, borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                          <p style={{ fontSize: "11px", fontWeight: "700", color: C.muted, margin: "0 0 8px" }}>المسافر {i + 2}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                            <FInput placeholder="الاسم الكامل" value={familyMembers[i]?.fullName || ""} onChange={v => updateFamilyMember(i, "fullName", v)} />
                            <FInput placeholder="رقم الجواز" value={familyMembers[i]?.passportNo || ""} onChange={v => updateFamilyMember(i, "passportNo", v)} />
                            <FInput type="date" value={familyMembers[i]?.dob || ""} onChange={v => updateFamilyMember(i, "dob", v)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== 7. رفع الوثائق ===== */}
          {visa && country && form.fullName && form.passportNo && (
            <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 8px" }}>
                الوثائق المطلوبة — {visaLabel}
              </h3>

              <div style={{ backgroundColor: C.primaryLight, border: "1px solid " + C.primary + "33", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px", color: C.primary }}>
                📎 سيتم إرسال وثائقك للوكيل مباشرة
              </div>

              {/* شريط التقدم */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: C.muted }}>{uploadedCount} / {currentDocs.length} وثائق مرفوعة</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: C.primary }}>{progressPct}%</span>
                </div>
                <div style={{ height: "6px", backgroundColor: C.border, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: progressPct + "%", backgroundColor: C.primary, borderRadius: "3px", transition: "width 0.4s ease" }} />
                </div>
              </div>

              {/* قائمة الوثائق */}
              {currentDocs.map(doc => {
                const f       = uploadedFiles[doc.id];
                const isDone  = f?.status === "done";
                const isLoad  = f?.status === "loading";
                const isError = f?.status === "error";
                return (
                  <div key={doc.id} style={{
                    padding: "12px 14px", borderRadius: "10px", marginBottom: "8px",
                    border: "2px dashed " + (isDone ? C.greenBorder : isError ? C.redBorder : C.border),
                    backgroundColor: isDone ? C.greenBg : isError ? C.redBg : C.bg,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>📄 {doc.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
                      {!f && (
                        <>
                          <span style={{ fontSize: "11px", color: C.muted }}>لم يُرفع بعد</span>
                          <label style={{ ...BTN_PRIMARY, padding: "7px 14px", fontSize: "12px", cursor: "pointer" }}>
                            ارفع الملف
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => handleFileUpload(doc.id, e.target.files[0])} />
                          </label>
                        </>
                      )}
                      {isLoad && <span style={{ fontSize: "12px", color: C.muted }}>⏳ جاري الرفع...</span>}
                      {isDone && (
                        <>
                          <span style={{ fontSize: "12px", color: C.green }}>✅ {f.name} — تم الرفع</span>
                          <BtnSmall onClick={() => removeFile(doc.id)} danger>حذف</BtnSmall>
                        </>
                      )}
                      {isError && (
                        <>
                          <span style={{ fontSize: "11px", color: C.red }}>❌ {f.error}</span>
                          <label style={{ ...BTN_PRIMARY, padding: "7px 12px", fontSize: "11px", cursor: "pointer" }}>
                            إعادة رفع
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => handleFileUpload(doc.id, e.target.files[0])} />
                          </label>
                          <BtnSmall onClick={() => removeFile(doc.id)} danger>حذف</BtnSmall>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {allDocsUploaded && (
                <div style={{ backgroundColor: C.greenBg, border: "1px solid " + C.greenBorder, borderRadius: "10px", padding: "12px 14px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: C.green }}>
                  ✅ تم رفع جميع الوثائق
                </div>
              )}
            </div>
          )}

          {/* ===== 8. الدفع ===== */}
          {visa && country && form.fullName && form.passportNo && form.travelDate && (
            <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 16px" }}>الدفع</h3>

              <FeeRow label={"رسوم الوكيل" + (agent ? " — " + agent.name : "")} value={agentFee.toLocaleString() + " د.ع"} />

              {showGuarantee && (
                <div style={{ padding: "12px 0", borderBottom: "1px solid " + C.border, marginBottom: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input type="checkbox" checked={visaGuarantee} onChange={e => setVisaGuarantee(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: C.primary }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: C.text, flex: 1 }}>🛡️ ضمان الفيزا (اختياري)</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: C.primary }}>+{GUARANTEE_FEE.toLocaleString()} د.ع</span>
                  </label>
                  {visaGuarantee && (
                    <p style={{ fontSize: "12px", color: C.green, margin: "8px 0 0 26px" }}>
                      نرجع 30,000 د.ع (رسوم الخدمة) عند الرفض
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "2px solid " + C.border, marginTop: "4px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", color: C.text }}>المجموع</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: C.primary }}>{total.toLocaleString()} د.ع</span>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginBottom: "14px" }}>
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: C.primary }} />
                <span style={{ fontSize: "12px", color: C.muted, lineHeight: "1.6" }}>
                  أوافق على الشروط والأحكام وأقر بأن جميع المعلومات صحيحة
                </span>
              </label>

              {!allDocsUploaded && (
                <div style={{ backgroundColor: C.orangeBg, border: "1px solid " + C.orangeBorder, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: C.orange, marginBottom: "12px" }}>
                  ⚠️ يرجى رفع جميع الوثائق أولاً
                </div>
              )}

              {submitError && (
                <div style={{ backgroundColor: C.redBg, border: "1px solid " + C.redBorder, borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: C.red, marginBottom: "12px" }}>
                  ❌ {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!termsAccepted || !allDocsUploaded || submitting}
                style={{
                  width: "100%", padding: "14px",
                  backgroundColor: (termsAccepted && allDocsUploaded && !submitting) ? C.primary : "#94a3b8",
                  color: "#ffffff", border: "none", borderRadius: "8px",
                  fontSize: "15px", fontWeight: "700",
                  cursor: (termsAccepted && allDocsUploaded && !submitting) ? "pointer" : "not-allowed",
                  fontFamily: "'Cairo',sans-serif", marginBottom: "10px",
                }}
              >
                {submitting ? "⏳ جاري الإرسال..." : "تقديم الطلب عبر Ki-Card 💳"}
              </button>

              <p style={{ fontSize: "11px", color: C.muted, textAlign: "center", margin: 0 }}>🔒 دفع آمن ومشفر من رصيدك</p>
            </div>
          )}

        </div>
      </div>

      {/* ===== زر الدعم العائم ===== */}
      <a
        href="https://wa.me/9647800000000"
        style={{
          position: "fixed", bottom: "20px", left: "20px",
          backgroundColor: C.white, color: C.primary,
          border: "1px solid " + C.border,
          borderRadius: "24px", padding: "10px 18px",
          fontSize: "13px", fontWeight: "700",
          textDecoration: "none", zIndex: 500,
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          fontFamily: "'Cairo',sans-serif",
        }}
      >
        💬 دعم 24/7
      </a>
    </div>
  );
}

// ===== مكونات مساعدة =====
function Card({ title, icon, children }) {
  return (
    <div style={{ backgroundColor: C.white, borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid " + C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {title && <h3 style={{ fontSize: "14px", fontWeight: "700", color: C.text, margin: "0 0 14px" }}>{icon ? icon + " " : ""}{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: "600", color: C.muted, margin: "0 0 5px" }}>{label}</p>
      {children}
    </div>
  );
}

function FInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={INPUT_STYLE}
    />
  );
}

function FSelect({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...INPUT_STYLE, appearance: "none", paddingLeft: "28px" }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: C.muted, pointerEvents: "none" }}>▾</span>
    </div>
  );
}

function FeeRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.border }}>
      <span style={{ fontSize: "13px", color: C.muted }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>{value}</span>
    </div>
  );
}

function BtnSmall({ onClick, children, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px", borderRadius: "6px",
        border: "1px solid " + (danger ? C.redBorder : C.border),
        backgroundColor: danger ? C.redBg : C.bg,
        color: danger ? C.red : C.muted,
        fontSize: "11px", fontWeight: "600", cursor: "pointer",
        fontFamily: "'Cairo',sans-serif",
      }}
    >
      {children}
    </button>
  );
}
