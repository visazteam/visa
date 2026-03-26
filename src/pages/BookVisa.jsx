import React, { useState, useRef } from "react";
import countries from "../data/countries";

// ===== ثوابت الألوان =====
const C = {
  bg:           "#f1f5f9",
  white:        "#ffffff",
  heroBg:       "#1e3a8a",
  primary:      "#1e3a8a",
  primaryLight: "#eff6ff",
  text:         "#0f172a",
  muted:        "#64748b",
  border:       "#e2e8f0",
  inputBg:      "#f8fafc",
  green:        "#16a34a",
  greenBg:      "#dcfce7",
  greenBorder:  "#86efac",
  orange:       "#d97706",
  orangeBg:     "#fffbeb",
  orangeBorder: "#fde68a",
  red:          "#dc2626",
  redBg:        "#fee2e2",
  // ألوان قسم الوثائق
  docGreen:     "#556e53",
  docCard:      "#29435c",
};

// ===== أنواع التأشيرة =====
const visaTypes = [
  { id: "tourist",  label: "سياحية",   sub: "للسفر والسياحة",    icon: "✈️",  badge: "الأكثر طلباً", badgeType: "red"   },
  { id: "business", label: "أعمال",    sub: "للتجار والمؤتمرات", icon: "💼",  badge: null },
  { id: "study",    label: "دراسة",    sub: "للطلاب والجامعات",  icon: "🎓",  badge: "متاح الآن",    badgeType: "green" },
  { id: "family",   label: "عائلية",   sub: "لم الشمل العائلي",  icon: "👨‍👩‍👧", badge: null },
  { id: "transit",  label: "عبور",     sub: "توقف في دولة أخرى", icon: "🔄",  badge: null },
  { id: "medical",  label: "علاج طبي", sub: "للرحلات الصحية",    icon: "🏥",  badge: null },
];

// ===== مراحل التقديم =====
const STEPS = [
  { n: 1, label: "نوع التأشيرة" },
  { n: 2, label: "الدولة والتفاصيل" },
  { n: 3, label: "الوثائق" },
  { n: 4, label: "الدفع" },
];

// ===== الوثائق المطلوبة حسب نوع التأشيرة =====
const VISA_DOCS = {
  tourist: [
    { id: "passport",     label: "جواز السفر (صورة الصفحة الرئيسية)" },
    { id: "photo",        label: "صورة شخصية (خلفية بيضاء 3×4)" },
    { id: "bank",         label: "كشف حساب بنكي (آخر 3 أشهر)" },
    { id: "hotel",        label: "حجز فندق مؤكد" },
    { id: "flight",       label: "تذكرة طيران ذهاب وإياب" },
  ],
  medical: [
    { id: "passport",     label: "جواز السفر" },
    { id: "photo",        label: "صورة شخصية" },
    { id: "medReport",    label: "تقرير طبي معتمد" },
    { id: "hospLetter",   label: "خطاب من المستشفى المستقبل" },
    { id: "financial",    label: "إثبات القدرة المالية" },
  ],
  study: [
    { id: "passport",     label: "جواز السفر" },
    { id: "photo",        label: "صورة شخصية" },
    { id: "acceptance",   label: "خطاب قبول من الجامعة" },
    { id: "transcripts",  label: "كشف الدرجات الدراسية" },
    { id: "sponsor",      label: "خطاب الكفيل المالي" },
  ],
  business: [
    { id: "passport",     label: "جواز السفر" },
    { id: "photo",        label: "صورة شخصية" },
    { id: "invitation",   label: "خطاب دعوة من الشركة المستضيفة" },
    { id: "commercial",   label: "السجل التجاري" },
    { id: "employer",     label: "خطاب من صاحب العمل" },
  ],
  transit: [
    { id: "passport",     label: "جواز السفر" },
    { id: "flight",       label: "تذكرة الطيران للوجهة النهائية" },
  ],
  family: [
    { id: "passport",     label: "جواز السفر" },
    { id: "photo",        label: "صورة شخصية" },
    { id: "relation",     label: "وثيقة الزواج أو شهادة الميلاد" },
    { id: "kinship",      label: "إثبات صلة القرابة" },
    { id: "invitation",   label: "خطاب الدعوة" },
  ],
};

const SERVICE_FEE  = 5000;
const INSURANCE_FEE = 8000;

// تنسيق الأرقام
function fmt(n) { return n.toLocaleString("en-US"); }

// ===== المكوّن الرئيسي =====
export default function BookVisa({ onNavigate }) {
  const [visa,      setVisa]      = useState(null);
  const [country,   setCountry]   = useState(null);
  const [search,    setSearch]    = useState("");
  const [insurance, setInsurance] = useState(false);
  const [modal,     setModal]     = useState(false);
  const [appId,     setAppId]     = useState("");

  // ===== حالة رفع الملفات: { [docId]: { name, error } | null } =====
  const [uploadedFiles, setUploadedFiles] = useState({});

  // ===== حالة الموافقة على الشروط =====
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    fullName: "", passportNo: "", expiry: "",
    travel: "", duration: "30", travelers: "1", purpose: "",
  });

  // ===== تصفية الدول بالبحث =====
  const filteredCountries = countries.filter(c =>
    !search || c.name.includes(search) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  // ===== الوثائق الحالية حسب نوع التأشيرة المختارة =====
  const currentDocs = VISA_DOCS[visa] || [];

  // ===== حساب عدد الوثائق المرفوعة بنجاح =====
  const uploadedCount = currentDocs.filter(d =>
    uploadedFiles[d.id] && !uploadedFiles[d.id].error
  ).length;
  const totalDocs = currentDocs.length;
  const progressPercent = totalDocs > 0 ? Math.round((uploadedCount / totalDocs) * 100) : 0;
  const allDocsUploaded = uploadedCount === totalDocs && totalDocs > 0;

  // ===== تحديد الخطوة الحالية =====
  const getStep = () => {
    if (!visa) return 1;
    if (!country || !form.fullName || !form.passportNo || !form.expiry || !form.travel) return 2;
    if (!allDocsUploaded) return 3;
    return 4;
  };
  const step = getStep();

  const fee   = country?.visaFree ? 0 : (country?.fee || 0);
  const total = fee + SERVICE_FEE + (insurance ? INSURANCE_FEE : 0);

  const visaLabel = visaTypes.find(v => v.id === visa)?.label || "";

  // ===== التحقق من صحة الملف ورفعه =====
  const handleFileUpload = (docId, file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const maxSizeMB = 5;

    // التحقق من نوع الملف
    if (!allowedTypes.includes(file.type)) {
      setUploadedFiles(prev => ({
        ...prev,
        [docId]: { name: file.name, error: "يُقبل JPG أو PNG أو PDF فقط" },
      }));
      return;
    }

    // التحقق من حجم الملف
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadedFiles(prev => ({
        ...prev,
        [docId]: { name: file.name, error: "الحجم يتجاوز 5MB" },
      }));
      return;
    }

    // الملف صالح — حفظه
    setUploadedFiles(prev => ({
      ...prev,
      [docId]: { name: file.name, error: null },
    }));
  };

  // ===== حذف ملف مرفوع =====
  const clearFile = (docId) => {
    setUploadedFiles(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  // ===== إعادة ضبط الوثائق عند تغيير نوع الفيزا =====
  const handleVisaChange = (visaId) => {
    setVisa(visaId);
    setCountry(null);
    setUploadedFiles({});
    setTermsAccepted(false);
  };

  // ===== تقديم الطلب =====
  const handleSubmit = () => {
    const id = `VISA-IQ-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    setAppId(id);
    setModal(true);
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 16px 60px" }}>

        {/* ===== قسم الهيرو ===== */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          borderRadius: "0 0 20px 20px",
          padding: "32px 28px 36px",
          marginBottom: "20px",
          color: "#ffffff",
        }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 10px 0" }}>
            🛂 طلب تأشيرة إلكترونية
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.85, margin: "0 0 22px 0", lineHeight: 1.75 }}>
            أسهل طريقة للحصول على تأشيرتك — أكمل طلبك وادفع مباشرة من رصيد Super Qi
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={{
              padding: "10px 22px", backgroundColor: "#ffffff", color: "#1e3a8a",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
              cursor: "pointer", fontFamily: "'Cairo',sans-serif",
            }}>
              ابدأ طلبك الآن ←
            </button>
            <button
              style={{
                padding: "10px 22px", backgroundColor: "transparent", color: "#ffffff",
                border: "2px solid rgba(255,255,255,0.5)", borderRadius: "8px",
                fontSize: "14px", fontWeight: "700", cursor: "pointer",
                fontFamily: "'Cairo',sans-serif",
              }}
              onClick={() => onNavigate("track")}
            >
              🔍 تتبع طلب موجود
            </button>
          </div>
        </div>

        {/* ===== شريط تقدم الخطوات ===== */}
        <div style={{
          backgroundColor: C.white, borderRadius: "12px",
          padding: "16px 20px", marginBottom: "20px",
          border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: step > s.n ? C.primary : step === s.n ? "#2563eb" : C.border,
                  color: step >= s.n ? "#ffffff" : C.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "700", flexShrink: 0,
                }}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span style={{
                  fontSize: "12px", fontWeight: step === s.n ? "700" : "500",
                  color: step >= s.n ? C.text : C.muted,
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: "2px", margin: "0 8px",
                  backgroundColor: step > s.n ? C.primary : C.border,
                  borderRadius: "2px",
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ===== القسم 1: نوع التأشيرة ===== */}
        <Card title="اختر نوع التأشيرة" icon="🛂">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {visaTypes.map(v => (
              <button
                key={v.id}
                onClick={() => handleVisaChange(v.id)}
                style={{
                  backgroundColor: visa === v.id ? C.primaryLight : C.white,
                  border: `2px solid ${visa === v.id ? C.primary : C.border}`,
                  borderRadius: "12px", padding: "18px 10px",
                  cursor: "pointer", textAlign: "center",
                  position: "relative", transition: "all 0.2s",
                }}
              >
                {/* شارة التميز */}
                {v.badge && (
                  <span style={{
                    position: "absolute", top: "8px", left: "8px",
                    backgroundColor: v.badgeType === "red" ? C.redBg : C.greenBg,
                    color: v.badgeType === "red" ? C.red : C.green,
                    fontSize: "9px", fontWeight: "700",
                    padding: "2px 7px", borderRadius: "10px",
                  }}>
                    {v.badge}
                  </span>
                )}
                <div style={{ fontSize: "30px", marginBottom: "8px" }}>{v.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "4px" }}>
                  {v.label}
                </div>
                <div style={{ fontSize: "11px", color: C.muted }}>{v.sub}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* ===== القسم 2: اختيار الدولة ===== */}
        {visa && (
          <Card title="اختر الدولة" icon="🌍">
            {/* حقل البحث */}
            <input
              style={{
                width: "100%", padding: "10px 14px",
                border: `1px solid ${C.border}`, borderRadius: "8px",
                fontSize: "14px", color: C.text, backgroundColor: C.inputBg,
                boxSizing: "border-box", outline: "none",
                fontFamily: "'Cairo',sans-serif", marginBottom: "14px",
              }}
              placeholder="🔍 ابحث عن دولة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {/* شبكة بطاقات الدول */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {filteredCountries.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCountry(c)}
                  style={{
                    backgroundColor: country?.id === c.id ? C.primaryLight : C.white,
                    border: `2px solid ${country?.id === c.id ? C.primary : C.border}`,
                    borderRadius: "10px", padding: "12px 8px",
                    cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                  }}
                >
                  {/* رمز الدولة */}
                  <div style={{ fontSize: "20px", fontWeight: "800", color: C.primary, marginBottom: "4px" }}>
                    {c.code}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: C.text, marginBottom: "3px" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: "11px", color: c.visaFree ? C.green : C.muted, fontWeight: c.visaFree ? "700" : "400" }}>
                    {c.visaFree ? "مجاني 🎉" : `د.ع ${fmt(c.fee)}`}
                  </div>
                </button>
              ))}
            </div>

            {/* ===== القسم 3: تفاصيل الطلب ===== */}
            {country && (
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${C.border}` }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: C.text, marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                  📋 تفاصيل الطلب
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <Field label="الاسم الكامل (كما في الجواز)">
                    <FInput placeholder="Ahmed Mahmoud" value={form.fullName}
                      onChange={v => setForm(p => ({ ...p, fullName: v }))} />
                  </Field>
                  <Field label="رقم جواز السفر">
                    <FInput placeholder="A1234567" value={form.passportNo}
                      onChange={v => setForm(p => ({ ...p, passportNo: v }))} />
                  </Field>
                  <Field label="تاريخ انتهاء الجواز">
                    <FInput type="date" value={form.expiry}
                      onChange={v => setForm(p => ({ ...p, expiry: v }))} />
                  </Field>
                  <Field label="تاريخ السفر">
                    <FInput type="date" value={form.travel}
                      onChange={v => setForm(p => ({ ...p, travel: v }))} />
                  </Field>
                  <Field label="مدة الإقامة">
                    <FSelect value={form.duration} onChange={v => setForm(p => ({ ...p, duration: v }))}
                      options={[["7","7 أيام"],["14","14 يوم"],["30","30 يوم"],["60","60 يوم"],["90","90 يوم"]]} />
                  </Field>
                  <Field label="عدد المسافرين">
                    <FSelect value={form.travelers} onChange={v => setForm(p => ({ ...p, travelers: v }))}
                      options={[["1","1 شخص"],["2","2 أشخاص"],["3","3 أشخاص"],["4","4 أشخاص"],["5+","5+ أشخاص"]]} />
                  </Field>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <Field label="الغرض من الزيارة">
                    <FInput
                      placeholder="مثال: سياحة وزيارة إسطنبول وكابادوكيا"
                      value={form.purpose}
                      onChange={v => setForm(p => ({ ...p, purpose: v }))}
                    />
                  </Field>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ===== القسم 4: رفع الوثائق المطلوبة ===== */}
        {/* يظهر فقط بعد اختيار نوع التأشيرة وإدخال بيانات شخصية أساسية */}
        {visa && country && form.fullName && form.passportNo && (
          <Card title={`الوثائق المطلوبة — ${visaLabel}`} icon="📎">

            {/* ===== شريط تقدم رفع الوثائق ===== */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: "8px",
              }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
                  الوثائق المرفوعة:
                  <span style={{ color: C.docGreen, fontWeight: "800", marginRight: "4px" }}>
                    {" "}{uploadedCount} / {totalDocs}
                  </span>
                </span>
                <span style={{ fontSize: "12px", color: C.muted }}>{progressPercent}%</span>
              </div>
              {/* خلفية شريط التقدم */}
              <div style={{
                backgroundColor: C.docCard,
                borderRadius: "8px", height: "10px",
                overflow: "hidden",
              }}>
                {/* ملء الشريط حسب التقدم */}
                <div style={{
                  width: `${progressPercent}%`,
                  backgroundColor: C.docGreen,
                  height: "100%",
                  borderRadius: "8px",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* ===== قائمة الوثائق ===== */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {currentDocs.map((doc) => {
                const fileState = uploadedFiles[doc.id];
                const isUploaded = fileState && !fileState.error;
                const hasError   = fileState && fileState.error;

                // تحديد لون ونمط حدود الصف حسب الحالة
                const rowBorder = isUploaded
                  ? `2px solid ${C.docGreen}`
                  : hasError
                    ? `2px solid ${C.red}`
                    : "2px dashed #94a3b8";

                const rowBg = isUploaded
                  ? "#f0fdf0"
                  : hasError
                    ? C.redBg
                    : C.inputBg;

                return (
                  <div
                    key={doc.id}
                    style={{
                      border: rowBorder,
                      backgroundColor: rowBg,
                      borderRadius: "10px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* اسم الوثيقة */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <span style={{ fontSize: "16px" }}>📄</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
                        {doc.label}
                      </span>
                    </div>

                    {/* منطقة الحالة والأزرار */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>

                      {/* الحالة: لم يُرفع بعد */}
                      {!fileState && (
                        <>
                          <span style={{ fontSize: "11px", color: C.muted }}>لم يُرفع بعد</span>
                          {/* زر رفع الملف — label يغني عن input مرئي */}
                          <label style={{
                            padding: "6px 14px",
                            backgroundColor: C.primary,
                            color: "#ffffff",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "'Cairo',sans-serif",
                            whiteSpace: "nowrap",
                          }}>
                            ارفع الملف
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              style={{ display: "none" }}
                              onChange={e => handleFileUpload(doc.id, e.target.files[0])}
                            />
                          </label>
                        </>
                      )}

                      {/* الحالة: خطأ في الملف */}
                      {hasError && (
                        <>
                          <span style={{
                            fontSize: "11px", color: C.red,
                            fontWeight: "600", maxWidth: "180px",
                          }}>
                            ❌ {fileState.error}
                          </span>
                          {/* زر إعادة المحاولة */}
                          <label style={{
                            padding: "6px 12px",
                            backgroundColor: C.red,
                            color: "#ffffff",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            fontFamily: "'Cairo',sans-serif",
                            whiteSpace: "nowrap",
                          }}>
                            إعادة رفع
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              style={{ display: "none" }}
                              onChange={e => handleFileUpload(doc.id, e.target.files[0])}
                            />
                          </label>
                          <button
                            onClick={() => clearFile(doc.id)}
                            style={{
                              padding: "6px 10px",
                              backgroundColor: "transparent",
                              color: C.muted,
                              border: `1px solid ${C.border}`,
                              borderRadius: "7px",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: "'Cairo',sans-serif",
                            }}
                          >
                            حذف
                          </button>
                        </>
                      )}

                      {/* الحالة: تم الرفع بنجاح */}
                      {isUploaded && (
                        <>
                          <span style={{
                            fontSize: "11px",
                            color: C.docGreen,
                            fontWeight: "700",
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            ✅ {fileState.name} — تم الرفع
                          </span>
                          <button
                            onClick={() => clearFile(doc.id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "transparent",
                              color: C.red,
                              border: `1px solid ${C.red}`,
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontFamily: "'Cairo',sans-serif",
                            }}
                          >
                            حذف
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===== رسالة اكتمال الوثائق ===== */}
            {allDocsUploaded && (
              <div style={{
                marginTop: "14px",
                padding: "10px 14px",
                backgroundColor: "#f0fdf4",
                border: `1px solid ${C.docGreen}`,
                borderRadius: "8px",
                fontSize: "13px",
                color: C.docGreen,
                fontWeight: "700",
                textAlign: "center",
              }}>
                ✅ تم رفع جميع الوثائق المطلوبة — يمكنك المتابعة للدفع
              </div>
            )}
          </Card>
        )}

        {/* ===== القسم 5: الدفع ===== */}
        {visa && country && form.fullName && form.passportNo && form.expiry && form.travel && (
          <Card title="الدفع" icon="💳">
            {/* تفاصيل الرسوم */}
            <FeeRow label={`رسوم التأشيرة — ${country.name}`}
              value={country.visaFree ? "مجاني 🎉" : `د.ع ${fmt(fee)}`} />
            <FeeRow label="رسوم خدمة Ki-Card" value={`د.ع ${fmt(SERVICE_FEE)}`} />

            {/* تأمين السفر (اختياري) */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={insurance}
                  onChange={e => setInsurance(e.target.checked)}
                  style={{ accentColor: C.primary, width: "15px", height: "15px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", color: C.text }}>
                  تأمين السفر{" "}
                  <span style={{ color: C.muted, fontSize: "11px" }}>(اختياري)</span>
                </span>
              </div>
              <span style={{ fontSize: "13px", color: C.muted }}>د.ع {fmt(INSURANCE_FEE)}</span>
            </div>

            {/* المجموع */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0 0 0",
            }}>
              <span style={{ fontSize: "16px", fontWeight: "800", color: C.text }}>المجموع</span>
              <span style={{ fontSize: "22px", fontWeight: "800", color: C.primary }}>
                د.ع {fmt(total)}
              </span>
            </div>

            {/* ===== خانة الموافقة على الشروط ===== */}
            <div style={{
              marginTop: "16px",
              padding: "12px 14px",
              backgroundColor: C.inputBg,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{
                  accentColor: C.docGreen,
                  width: "16px", height: "16px",
                  cursor: "pointer", marginTop: "2px", flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "12px", color: C.muted, lineHeight: 1.7 }}>
                أوافق على{" "}
                <span style={{ color: C.primary, fontWeight: "700" }}>الشروط والأحكام</span>
                {" "}وأقر بأن جميع المعلومات المقدمة صحيحة ودقيقة
              </span>
            </div>

            {/* ===== تنبيه إذا لم تكتمل الوثائق ===== */}
            {!allDocsUploaded && (
              <p style={{
                fontSize: "12px", color: C.orange,
                marginTop: "10px", textAlign: "center",
                fontWeight: "600",
              }}>
                ⚠️ يرجى رفع جميع الوثائق المطلوبة أولاً
              </p>
            )}

            {/* ===== زر الدفع — معطّل حتى اكتمال الوثائق والموافقة على الشروط ===== */}
            <button
              disabled={!allDocsUploaded || !termsAccepted}
              style={{
                width: "100%", padding: "16px", marginTop: "12px",
                backgroundColor: allDocsUploaded && termsAccepted ? C.docGreen : "#94a3b8",
                color: "#ffffff",
                border: "none", borderRadius: "10px",
                fontSize: "16px", fontWeight: "700",
                cursor: allDocsUploaded && termsAccepted ? "pointer" : "not-allowed",
                fontFamily: "'Cairo',sans-serif",
                transition: "background-color 0.3s ease",
                opacity: allDocsUploaded && termsAccepted ? 1 : 0.7,
              }}
              onClick={handleSubmit}
            >
              💳 ادفع الآن من Super Qi
            </button>
            <p style={{ textAlign: "center", color: C.muted, fontSize: "12px", marginTop: "8px" }}>
              🔒 دفع آمن ومشفر من رصيدك
            </p>
          </Card>
        )}
      </div>

      {/* ===== مودال النجاح ===== */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "16px",
        }}>
          <div style={{
            backgroundColor: C.white, borderRadius: "16px",
            padding: "36px 28px", maxWidth: "380px", width: "100%",
            textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ color: C.text, fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
              تم إرسال الطلب بنجاح!
            </h2>
            <div style={{
              backgroundColor: C.primaryLight, borderRadius: "8px",
              padding: "12px 16px", margin: "12px 0",
              color: C.primary, fontSize: "15px", fontWeight: "700",
              letterSpacing: "0.5px", border: `1px solid #bfdbfe`,
            }}>
              {appId}
            </div>
            <p style={{ color: C.muted, fontSize: "13px", lineHeight: 1.7, marginBottom: "20px" }}>
              سيتم إشعارك عبر Super Qi خلال{" "}
              <strong>
                {country?.processingDays === 0 ? "وقت قصير" : `${country?.processingDays} أيام عمل`}
              </strong>
            </p>
            <button
              style={{
                width: "100%", padding: "12px", backgroundColor: C.primary, color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700",
                cursor: "pointer", fontFamily: "'Cairo',sans-serif", marginBottom: "10px",
              }}
              onClick={() => { setModal(false); onNavigate("track"); }}
            >
              🔍 تتبع الطلب
            </button>
            <button
              style={{
                width: "100%", padding: "11px", backgroundColor: "transparent",
                color: C.muted, border: `1px solid ${C.border}`, borderRadius: "8px",
                fontSize: "14px", cursor: "pointer", fontFamily: "'Cairo',sans-serif",
              }}
              onClick={() => setModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== مكوّنات مساعدة =====

function Card({ title, icon, children }) {
  return (
    <div style={{
      backgroundColor: "#ffffff", borderRadius: "12px",
      padding: "20px", marginBottom: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <h2 style={{
        fontSize: "15px", fontWeight: "700", color: "#0f172a",
        marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function FInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 12px",
        border: "1px solid #e2e8f0", borderRadius: "8px",
        fontSize: "13px", color: "#0f172a",
        backgroundColor: "#f8fafc", boxSizing: "border-box",
        outline: "none", fontFamily: "'Cairo',sans-serif",
      }}
    />
  );
}

function FSelect({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px",
          border: "1px solid #e2e8f0", borderRadius: "8px",
          fontSize: "13px", color: "#0f172a",
          backgroundColor: "#f8fafc", boxSizing: "border-box",
          outline: "none", fontFamily: "'Cairo',sans-serif",
          cursor: "pointer", appearance: "none",
        }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <span style={{
        position: "absolute", left: "10px", top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8",
      }}>
        ▾
      </span>
    </div>
  );
}

function FeeRow({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 0", borderBottom: "1px solid #e2e8f0",
    }}>
      <span style={{ fontSize: "13px", color: "#0f172a" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#64748b" }}>{value}</span>
    </div>
  );
}
