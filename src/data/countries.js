// بيانات الدول مع رمز الدولة وسعر بالدينار العراقي وأيام المعالجة

const countries = [
  { id: "turkey",      code: "TR", name: "تركيا",          flag: "🇹🇷", fee: 45000,  processingDays: 3,  visaTypes: ["tourist","business","study"] },
  { id: "uae",         code: "AE", name: "الإمارات",        flag: "🇦🇪", fee: 85000,  processingDays: 2,  visaTypes: ["tourist","business","medical"] },
  { id: "malaysia",    code: "MY", name: "ماليزيا",         flag: "🇲🇾", fee: 25000,  processingDays: 3,  visaTypes: ["tourist","business"] },
  { id: "georgia",     code: "GE", name: "جورجيا",          flag: "🇬🇪", fee: 15000,  processingDays: 0,  visaTypes: ["tourist","business","study","medical","transit","family"], visaFree: true },
  { id: "azerbaijan",  code: "AZ", name: "أذربيجان",        flag: "🇦🇿", fee: 20000,  processingDays: 5,  visaTypes: ["tourist","business"] },
  { id: "jordan",      code: "JO", name: "الأردن",           flag: "🇯🇴", fee: 30000,  processingDays: 3,  visaTypes: ["tourist","business","medical"] },
  { id: "iran",        code: "IR", name: "إيران",            flag: "🇮🇷", fee: 10000,  processingDays: 3,  visaTypes: ["tourist","religious"] },
  { id: "tunisia",     code: "TN", name: "تونس",             flag: "🇹🇳", fee: 22000,  processingDays: 4,  visaTypes: ["tourist","study"] },
  { id: "germany",     code: "DE", name: "ألمانيا",          flag: "🇩🇪", fee: 120000, processingDays: 15, visaTypes: ["tourist","study","business"] },
  { id: "uk",          code: "GB", name: "المملكة المتحدة", flag: "🇬🇧", fee: 150000, processingDays: 15, visaTypes: ["tourist","study","business"] },
  { id: "canada",      code: "CA", name: "كندا",             flag: "🇨🇦", fee: 130000, processingDays: 30, visaTypes: ["tourist","study","business"] },
  { id: "france",      code: "FR", name: "فرنسا",            flag: "🇫🇷", fee: 120000, processingDays: 15, visaTypes: ["tourist","study"] },
  { id: "italy",       code: "IT", name: "إيطاليا",          flag: "🇮🇹", fee: 115000, processingDays: 12, visaTypes: ["tourist","study"] },
  { id: "thailand",    code: "TH", name: "تايلاند",          flag: "🇹🇭", fee: 35000,  processingDays: 5,  visaTypes: ["tourist"] },
];

export default countries;
