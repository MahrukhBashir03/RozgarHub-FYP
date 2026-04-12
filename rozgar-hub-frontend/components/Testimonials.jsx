"use client";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    heading: "What People Say",
    reviews: [
      {
        name: "Ahmed Khan",
        role: "Electrician",
        text: "Rozgar Hub helped me find daily work near my home.",
      },
      {
        name: "Ayesha Bibi",
        role: "Tailor",
        text: "Now I get work without middlemen taking my money.",
      },
      {
        name: "Usman Ali",
        role: "Employer",
        text: "Hiring skilled workers is fast and reliable.",
      },
    ],
  },
  ur: {
    dir: "rtl",
    heading: "لوگ کیا کہتے ہیں",
    reviews: [
      {
        name: "احمد خان",
        role: "الیکٹریشن",
        text: "روزگار ہب نے مجھے اپنے گھر کے قریب روز مرہ کے کام تلاش کرنے میں مدد کی۔",
      },
      {
        name: "عائشہ بی بی",
        role: "دارزی",
        text: "اب مجھے درمیانیوں کے بغیر کام ملتا ہے جو میرے پیسے لیتے ہیں۔",
      },
      {
        name: "عثمان علی",
        role: "آجر",
        text: "ماہر کارکنوں کو کرائے پر لینا تیز اور قابل اعتماد ہے۔",
      },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

export default function Testimonials() {
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  return (
    <section className="py-20 bg-white" dir={t.dir}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12" style={lf}>
          {t.heading}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {t.reviews.map((r, i) => (
            <div
              key={i}
              className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <p className="text-gray-700 mb-4" style={lf}>
                "{r.text}"
              </p>
              <h4 className="font-semibold" style={lf}>
                {r.name}
              </h4>
              <span className="text-sm text-gray-500" style={lf}>
                {r.role}
              </span>
              <div className="text-yellow-500 mt-2">★★★★★</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
