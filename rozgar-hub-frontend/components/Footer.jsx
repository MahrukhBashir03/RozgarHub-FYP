"use client";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    tagline:
      "Connecting Pakistan's skilled workforce with trusted employers. Fast, transparent, and built for real people.",
    quickLinksTitle: "Quick Links",
    contactTitle: "Contact Us",
    address: "Lahore, Pakistan",
    copyright: "All rights reserved. Made in Pakistan 🇵🇰",
    quickLinks: [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
    ],
    bottomLinks: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
  ur: {
    dir: "rtl",
    tagline:
      "پاکستان کی ہنر مند افرادی قوت کو قابل اعتماد آجروں سے جوڑنا۔ تیز، شفاف، اور حقیقی لوگوں کے لیے بنایا گیا۔",
    quickLinksTitle: "فوری لنکس",
    contactTitle: "ہم سے رابطہ کریں",
    address: "لاہور، پاکستان",
    copyright: "جملہ حقوق محفوظ ہیں۔ پاکستان میں بنایا گیا 🇵🇰",
    quickLinks: [
      { label: "ہوم", href: "#home" },
      { label: "ہمارے بارے میں", href: "#about" },
      { label: "خصوصیات", href: "#features" },
      { label: "یہ کیسے کام کرتا ہے", href: "#how-it-works" },
    ],
    bottomLinks: [
      { label: "رازداری", href: "#" },
      { label: "شرائط", href: "#" },
    ],
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

export default function Footer() {
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const currentYear = new Date().getFullYear();
  const lf = isUrdu ? urduFont : {};

  return (
    <footer
      id="contact"
      dir={t.dir}
      className="relative bg-gradient-to-br from-[#08131e] via-[#0a1628] to-[#08131e] border-t border-white/10 text-gray-400 overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">

          {/* Brand Column */}
          <div className="space-y-5 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-green-500/25 overflow-hidden p-1">
                <Image src="/logo.png" alt="Rozgar Hub Logo" width={40} height={40} className="object-contain" />
              </div>
              <h3 className="text-white font-extrabold text-xl leading-none tracking-wide">Rozgar <span className="text-green-400">Hub</span></h3>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed" style={lf}>
              {t.tagline}
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4
              className={`font-bold text-white text-sm mb-6 ${
                isUrdu ? "border-r-4 border-green-500 pr-3" : "border-l-4 border-green-500 pl-3"
              }`}
              style={lf}
            >
              {t.quickLinksTitle}
            </h4>
            <ul className="space-y-3">
              {t.quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm flex items-center gap-2 group"
                    style={lf}
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-green-400 transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className={`font-bold text-white text-sm mb-6 ${
                isUrdu ? "border-r-4 border-green-500 pr-3" : "border-l-4 border-green-500 pl-3"
              }`}
              style={lf}
            >
              {t.contactTitle}
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3" dir={t.dir}>
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium" style={lf}>
                      {isUrdu ? "پتہ" : "Address"}
                    </div>
                    <span className="text-sm text-gray-400" style={lf}>{t.address}</span>
                  </div>
                </div>
              </li>

              <li>
                <a href="mailto:usersupportrozgarhub@gmail.com" className="flex items-start gap-3 group" dir={t.dir}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium" style={lf}>
                      {isUrdu ? "ای میل" : "Email"}
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors break-all">
                      usersupportrozgarhub@gmail.com
                    </span>
                  </div>
                </a>
              </li>

              <li>
                <a href="tel:+923211009059" className="flex items-start gap-3 group" dir={t.dir}>
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-green-500/20 transition-colors">
                    <Phone className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium" style={lf}>
                      {isUrdu ? "فون" : "Phone"}
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-green-400 transition-colors">
                      +92 321 1009059
                    </span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center" style={lf}>
            © {currentYear} Rozgar Hub. {t.copyright}
          </p>
        </div>

      </div>
    </footer>
  );
}