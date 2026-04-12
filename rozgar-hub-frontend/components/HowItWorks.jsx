"use client";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    heading: "How It Works",
    steps: [
      {
        number: "1",
        title: "Create Profile",
        description: "Sign up as worker or employer in seconds.",
      },
      {
        number: "2",
        title: "Post or Find Job",
        description: "Employers post jobs. Workers apply instantly.",
      },
      {
        number: "3",
        title: "Get Hired",
        description: "Connect directly and start working.",
      },
    ],
  },
  ur: {
    dir: "rtl",
    heading: "یہ کیسے کام کرتا ہے",
    steps: [
      {
        number: "١",
        title: "پروفائل بنائیں",
        description: "چند سیکنڈوں میں کارکن یا آجر کے طور پر رجسٹر کریں۔",
      },
      {
        number: "٢",
        title: "نوکری پوسٹ کریں یا تلاش کریں",
        description: "آجر نوکری پوسٹ کریں۔ کارکن فوری درخواست دیں۔",
      },
      {
        number: "٣",
        title: "بھرتی ہوں",
        description: "براہ راست رابطہ کریں اور کام شروع کریں۔",
      },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

export default function HowItWorks() {
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  return (
    <section className="py-20 bg-white" dir={t.dir}>
      <div className="max-w-6xl mx-auto px-6 text-center">

        <h2 className="text-3xl font-bold mb-12" style={lf}>
          {t.heading}
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10">
          {t.steps.map((step, i) => (
            <div key={i}>
              <div className="text-indigo-600 text-4xl font-bold mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-2" style={lf}>{step.title}</h3>
              <p className="text-gray-600" style={lf}>{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}