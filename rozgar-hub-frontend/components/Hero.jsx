"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    badge: "🚀 Connecting Workers & Employers Across Pakistan",
    heading1: "Find",
    headingHighlight: "Skilled Workers",
    heading2: "Near You, Instantly",
    description:
      "Rozgar Hub bridges the gap between daily wage workers, electricians, plumbers, and skilled professionals with employers seeking quality service. Fast, trusted, and efficient hiring.",
    workerBtn: "I'm Looking for Work",
    employerBtn: "I Need Workers",
    card: [
      { title: "Quick Connect", sub: "Find workers in minutes" },
      { title: "Verified Profiles", sub: "Trusted & skill-verified workers" },
      { title: "Location-Based", sub: "Find nearby workers instantly" },
    ],
  },
  ur: {
    dir: "rtl",
    badge: "🚀 پاکستان بھر میں کارکنوں اور آجروں کو جوڑنا",
    heading1: "تلاش کریں",
    headingHighlight: "ہنر مند کارکن",
    heading2: "اپنے قریب، فوری طور پر",
    description:
      "روزگار ہب روزانہ اجرت کے کارکنوں، الیکٹریشنوں، پلمبروں اور ہنر مند پیشہ وروں کو معیاری خدمات کے خواہشمند آجروں سے جوڑتا ہے۔ تیز، قابل اعتماد اور مؤثر بھرتی۔",
    workerBtn: "مجھے کام چاہیے",
    employerBtn: "مجھے کارکن چاہییں",
    card: [
      { title: "فوری بھرتی", sub: "چند منٹوں میں کارکن تلاش کریں" },
      { title: "تصدیق شدہ پروفائلز", sub: "قابل اعتماد اور تصدیق شدہ کارکن" },
      { title: "مقام کی بنیاد پر", sub: "قریبی کارکن فوری تلاش کریں" },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

const cardIcons = [
  <svg key="lightning" className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>,
  <svg key="shield" className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>,
  <svg key="location" className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
];

export default function Hero() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  return (
    <section
      id="home"
      dir={t.dir}
      className="min-h-screen flex items-center bg-gradient-to-br from-[#0d1b2e] via-[#0f2040] to-[#0a1628] text-white px-6 md:px-10 relative overflow-hidden pt-24 pb-16"
    >
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-900/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Left Content */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/12 border border-green-500/25 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-sm font-medium" style={lf}>
                {t.badge}
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
              style={isUrdu ? { ...urduFont, lineHeight: "1.8" } : {}}
            >
              {t.heading1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-emerald-400">
                {t.headingHighlight}
              </span>{" "}
              {t.heading2}
            </h1>

            <p className="text-lg text-gray-300/90 leading-relaxed max-w-xl" style={lf}>
              {t.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => router.push("/auth/register/worker")}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl overflow-hidden shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2" style={lf}>
                  {t.workerBtn}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <button
                onClick={() => router.push("/auth/register/employer")}
                className="group px-8 py-4 border-2 border-blue-500/50 text-blue-300 font-semibold rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm bg-blue-500/5"
              >
                <span className="flex items-center justify-center gap-2" style={lf}>
                  {t.employerBtn}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>

          </div>

          {/* Right Card Panel */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-green-500/8 to-transparent border border-green-500/15 rounded-3xl -rotate-3" />
              <div className="absolute -top-2 -left-2 w-full h-full bg-gradient-to-br from-blue-500/8 to-transparent border border-blue-500/15 rounded-3xl rotate-1" />

              <div className="relative bg-gradient-to-br from-white/8 to-white/3 border border-white/12 rounded-3xl backdrop-blur-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/8">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span className="text-white font-black text-lg">R</span>
                  </div>
                  <div className="text-white font-bold text-sm">Rozgar Hub</div>
                </div>

                <div className="space-y-4">
                  {t.card.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/6 transition-all duration-200 cursor-default" dir={t.dir}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        i === 1 ? "bg-blue-500/20" : "bg-green-500/20"
                      }`}>
                        {cardIcons[i]}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm" style={lf}>{item.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5" style={lf}>{item.sub}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}