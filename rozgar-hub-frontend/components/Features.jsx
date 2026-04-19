"use client";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    aboutBadge: "About Us",
    aboutHeading: "Pakistan's Premier Worker-Employer Platform",
    aboutText:
      "Rozgar Hub was built to solve a simple but critical problem: skilled workers across Pakistan struggle to find consistent work, while employers waste days searching for trustworthy help. We created a platform that puts both sides in control and is fast, transparent, and built for real people.",
    featuresLabel: "Why Choose Us",
    heading: "Everything You Need to Hire or Get Hired",
    subheading: "Rozgar Hub is built from the ground up for Pakistan's workforce — simple, reliable, and available in Urdu and English.",
    features: [
      {
        title: "Fast Hiring",
        description:
          "Browse and connect with skilled workers near you within minutes. No delays, no middlemen — just direct results.",
        color: "green",
      },
      {
        title: "Verified Workers",
        description:
          "Every worker profile includes ratings, work history, and skill verification so you always know who you're hiring.",
        color: "blue",
      },
      {
        title: "Secure & Transparent",
        description:
          "Clear communication, fair wages, and a safe environment for every transaction between workers and employers.",
        color: "green",
      },
      {
        title: "Bilingual Platform",
        description:
          "Fully available in Urdu and English, making the platform accessible to every Pakistani, regardless of background.",
        color: "blue",
      },
      {
        title: "Location-Based Matching",
        description:
          "Our system shows you workers or jobs in your city and neighbourhood, saving time and reducing travel costs.",
        color: "green",
      },
      {
        title: "Free to Join",
        description:
          "Creating a profile as a worker or employer is completely free. Get started in under two minutes.",
        color: "blue",
      },
    ],
  },
  ur: {
    dir: "rtl",
    aboutBadge: "ہمارے بارے میں",
    aboutHeading: "پاکستان کا سب سے بڑا کارکن-آجر پلیٹ فارم",
    aboutText:
      "روزگار ہب ایک سادہ لیکن اہم مسئلے کو حل کرنے کے لیے بنایا گیا تھا: پاکستان بھر میں ہنر مند کارکن مستقل کام تلاش کرنے میں مشکلات کا سامنا کرتے ہیں، جبکہ آجر قابل اعتماد مزدور تلاش کرنے میں دن ضائع کرتے ہیں۔ ہم نے ایک ایسا پلیٹ فارم بنایا جو دونوں فریقوں کو اختیار دیتا ہے۔",
    featuresLabel: "ہمیں کیوں چنیں",
    heading: "بھرتی یا ملازمت کے لیے ہر چیز",
    subheading: "روزگار ہب پاکستان کی افرادی قوت کے لیے بنایا گیا ہے — سادہ، قابل اعتماد، اردو اور انگریزی میں۔",
    features: [
      {
        title: "تیز بھرتی",
        description: "چند منٹوں میں اپنے قریب ہنر مند کارکن تلاش کریں۔ کوئی تاخیر نہیں، کوئی بیچ والا نہیں۔",
        color: "green",
      },
      {
        title: "تصدیق شدہ کارکن",
        description: "ہر کارکن کے پروفائل میں ریٹنگز، کام کی تاریخ اور مہارت کی تصدیق شامل ہے۔",
        color: "blue",
      },
      {
        title: "محفوظ اور شفاف",
        description: "واضح رابطہ، منصفانہ اجرت، اور کارکنوں اور آجروں کے درمیان ہر لین دین کے لیے محفوظ ماحول۔",
        color: "green",
      },
      {
        title: "دو زبانوں میں پلیٹ فارم",
        description: "مکمل طور پر اردو اور انگریزی میں دستیاب، ہر پاکستانی کے لیے قابل رسائی۔",
        color: "blue",
      },
      {
        title: "مقام کی بنیاد پر میچنگ",
        description: "ہمارا نظام آپ کے شہر اور محلے میں کارکن یا ملازمتیں دکھاتا ہے۔",
        color: "green",
      },
      {
        title: "مفت شامل ہوں",
        description: "کارکن یا آجر کے طور پر پروفائل بنانا بالکل مفت ہے۔ دو منٹ سے کم میں شروع کریں۔",
        color: "blue",
      },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

const featureIcons = [
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>,
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>,
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
  </svg>,
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
];

export default function Features() {
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  return (
    <>
      {/* ── About Section ── */}
      <section
        id="about"
        dir={t.dir}
        className="py-24 bg-gradient-to-br from-[#0a1628] to-[#0d1b2e] relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/12 border border-green-500/25 text-green-400 text-sm font-semibold tracking-wide" style={lf}>
                {t.aboutBadge}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-snug" style={isUrdu ? { ...urduFont, lineHeight: "1.7" } : {}}>
                {t.aboutHeading}
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg" style={lf}>
                {t.aboutText}
              </p>
            </div>

            {/* Categories pill tags */}
            <div>
              <p className="text-gray-400 text-sm mb-4 font-medium" style={lf}>
                {language === "ur" ? "ہم جن شعبوں میں خدمات فراہم کرتے ہیں:" : "Categories we cover:"}
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "⚡", en: "Electrician", ur: "الیکٹریشن" },
                  { icon: "🔧", en: "Plumber", ur: "پلمبر" },
                  { icon: "🪚", en: "Carpenter", ur: "بڑھئی" },
                  { icon: "🎨", en: "Painter", ur: "پینٹر" },
                  { icon: "🧹", en: "Cleaner", ur: "صفائی کرنے والا" },
                  { icon: "🚗", en: "Driver", ur: "ڈرائیور" },
                  { icon: "🧱", en: "Mason", ur: "مستری" },
                  { icon: "🔩", en: "Welder", ur: "ویلڈر" },
                  { icon: "🏠", en: "House Help", ur: "گھریلو مددگار" },
                  { icon: "🧸", en: "Babysitter", ur: "بچوں کی دیکھ بھال" },
                  { icon: "❄️", en: "AC Repair", ur: "AC مرمت" },
                  { icon: "📚", en: "Tutor", ur: "ٹیوٹر" },
                  { icon: "🛡️", en: "Security Guard", ur: "سیکیورٹی گارڈ" },
                  { icon: "🌿", en: "Gardener", ur: "مالی" },
                  { icon: "💻", en: "IT Support", ur: "آئی ٹی سپورٹ" },
                  { icon: "🍳", en: "Cook", ur: "باورچی" },
                  { icon: "🧵", en: "Tailor", ur: "درزی" },
                  { icon: "📷", en: "Photographer", ur: "فوٹوگرافر" },
                  { icon: "🔨", en: "Other", ur: "دیگر" },
                ].map((cat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:border-green-500/30 hover:text-white transition-all duration-200 cursor-default"
                    style={lf}
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    {language === "ur" ? cat.ur : cat.en}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        id="features"
        dir={t.dir}
        className="py-24 bg-gradient-to-br from-[#0d1b2e] to-[#0f2040] relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/12 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/12 border border-green-500/20 text-green-400 text-sm font-semibold tracking-wide" style={lf}>
              {t.featuresLabel}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white" style={isUrdu ? { ...urduFont, lineHeight: "1.7" } : {}}>
              {t.heading}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg" style={lf}>
              {t.subheading}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((feature, i) => {
              const isGreen = feature.color === "green";
              return (
                <div
                  key={i}
                  className="group p-7 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/8 hover:border-white/15 hover:from-white/8 hover:to-white/4 transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
                      isGreen
                        ? "bg-green-500/18 text-green-400"
                        : "bg-blue-500/18 text-blue-400"
                    }`}
                  >
                    {featureIcons[i]}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2" style={lf}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed" style={lf}>
                    {feature.description}
                  </p>
                  <div className={`mt-5 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500 ${
                    isGreen ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-indigo-400"
                  }`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}