"use client";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    stats: [
      { number: "10,000+", label: "Workers" },
      { number: "5,000+", label: "Jobs Posted" },
      { number: "4.9 ★", label: "Rating" },
    ],
  },
  ur: {
    dir: "rtl",
    stats: [
      { number: "10,000+", label: "کارکن" },
      { number: "5,000+", label: "ملازمتیں شائع کی گئیں" },
      { number: "4.9 ★", label: "درجہ بندی" },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

export default function Stats() {
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  return (
    <section className="py-12 bg-white" dir={t.dir}>
      <div className="max-w-6xl mx-auto grid grid-cols-3 text-center gap-6">
        {t.stats.map((stat, i) => (
          <div key={i}>
            <h2 className="text-3xl font-bold text-blue-600" style={lf}>
              {stat.number}
            </h2>
            <p style={lf}>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
