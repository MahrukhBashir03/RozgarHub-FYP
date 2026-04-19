"use client";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    badge: "Simple Process",
    heading: "How It Works",
    subheading: "Get started in three easy steps, whether you're looking for work or hiring talent.",
    workerTitle: "For Workers",
    employerTitle: "For Employers",
    workerSteps: [
      {
        number: "01",
        title: "Create Your Profile",
        description:
          "Sign up for free and build your profile. Add your skills, experience, location, and a photo so employers can find and trust you.",
        icon: "👤",
      },
      {
        number: "02",
        title: "Browse & Apply",
        description:
          "Search job listings in your area. Apply directly with one click- no CV needed, no complicated forms.",
        icon: "🔍",
      },
      {
        number: "03",
        title: "Get Hired & Earn",
        description:
          "Connect directly with the employer, agree on terms, and start earning. Your reputation grows with every completed job.",
        icon: "✅",
      },
    ],
    employerSteps: [
      {
        number: "01",
        title: "Post Your Job",
        description:
          "Describe the work you need done, set your location, and specify the skills required. Takes less than two minutes.",
        icon: "📋",
      },
      {
        number: "02",
        title: "Review Applicants",
        description:
          "Browse profiles, check ratings and work history, and shortlist the best candidates for your job.",
        icon: "👥",
      },
      {
        number: "03",
        title: "Hire & Get It Done",
        description:
          "Contact your chosen worker directly, confirm the details, and get the job done, fast and reliably.",
        icon: "🤝",
      },
    ],
  },
  ur: {
    dir: "rtl",
    badge: "آسان عمل",
    heading: "یہ کیسے کام کرتا ہے",
    subheading: "تین آسان مراحل میں شروع کریں — چاہے آپ کام تلاش کر رہے ہوں یا ملازم رکھنا چاہتے ہوں۔",
    workerTitle: "کارکنوں کے لیے",
    employerTitle: "آجروں کے لیے",
    workerSteps: [
      {
        number: "٠١",
        title: "اپنا پروفائل بنائیں",
        description: "مفت رجسٹر کریں اور اپنا پروفائل بنائیں۔ اپنی مہارتیں، تجربہ، مقام اور تصویر شامل کریں۔",
        icon: "👤",
      },
      {
        number: "٠٢",
        title: "تلاش کریں اور درخواست دیں",
        description: "اپنے علاقے میں ملازمت کی فہرست تلاش کریں۔ ایک کلک سے براہ راست درخواست دیں۔",
        icon: "🔍",
      },
      {
        number: "٠٣",
        title: "بھرتی ہوں اور کمائیں",
        description: "آجر سے براہ راست رابطہ کریں، شرائط طے کریں اور کمانا شروع کریں۔",
        icon: "✅",
      },
    ],
    employerSteps: [
      {
        number: "٠١",
        title: "نوکری پوسٹ کریں",
        description: "کام بیان کریں، اپنا مقام سیٹ کریں اور مطلوبہ مہارتیں بتائیں۔ دو منٹ سے کم میں۔",
        icon: "📋",
      },
      {
        number: "٠٢",
        title: "درخواست دہندگان کا جائزہ لیں",
        description: "پروفائلز دیکھیں، ریٹنگز اور کام کی تاریخ چیک کریں اور بہترین امیدواروں کو شارٹ لسٹ کریں۔",
        icon: "👥",
      },
      {
        number: "٠٣",
        title: "بھرتی کریں اور کام کروائیں",
        description: "منتخب کارکن سے براہ راست رابطہ کریں، تفصیلات کی تصدیق کریں اور کام کروائیں۔",
        icon: "🤝",
      },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

function StepCard({ step, index, accent, lf }) {
  return (
    <div className="relative flex gap-5">
      {index < 2 && (
        <div className="absolute top-14 left-6 w-0.5 h-full -mb-4 bg-gradient-to-b from-white/12 to-transparent" />
      )}

      <div className="shrink-0 z-10">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg ${
            accent === "green"
              ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/30"
              : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30"
          }`}
        >
          {step.icon}
        </div>
      </div>

      <div className="pb-10">
        <div className={`text-xs font-bold mb-1 ${accent === "green" ? "text-green-400/60" : "text-blue-400/60"}`}>
          {step.number}
        </div>
        <h4 className="text-white font-bold text-lg mb-2" style={lf}>{step.title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed" style={lf}>{step.description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  return (
    <section
      id="how-it-works"
      dir={t.dir}
      className="py-24 bg-gradient-to-br from-[#0a1628] to-[#0d1b2e] relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/12 border border-green-500/25 text-green-400 text-sm font-semibold" style={lf}>
            {t.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white" style={isUrdu ? { ...urduFont, lineHeight: "1.7" } : {}}>
            {t.heading}
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg" style={lf}>
            {t.subheading}
          </p>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Workers Column */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/6 to-transparent border border-green-500/15 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-green-500/15">
              <div className="w-10 h-10 rounded-xl bg-green-500/18 flex items-center justify-center text-xl">
                👷
              </div>
              <h3 className="text-white font-extrabold text-xl" style={lf}>{t.workerTitle}</h3>
            </div>
            {t.workerSteps.map((step, i) => (
              <StepCard key={i} step={step} index={i} accent="green" lf={lf} />
            ))}
          </div>

          {/* Employers Column */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/6 to-transparent border border-blue-500/15 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-blue-500/15">
              <div className="w-10 h-10 rounded-xl bg-blue-500/18 flex items-center justify-center text-xl">
                🏢
              </div>
              <h3 className="text-white font-extrabold text-xl" style={lf}>{t.employerTitle}</h3>
            </div>
            {t.employerSteps.map((step, i) => (
              <StepCard key={i} step={step} index={i} accent="blue" lf={lf} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}