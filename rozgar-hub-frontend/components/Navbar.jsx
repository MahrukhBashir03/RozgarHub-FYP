"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import { useLanguage } from "../app/context/LanguageContext";

const translations = {
  en: {
    home: "Home",
    about: "About",
    features: "Features",
    howItWorks: "How It Works",
    contact: "Contact",
    login: "Login",
    signUp: "Sign Up",
    language: "اردو",
    title: "Rozgar Hub",
    join: "Join Rozgar Hub",
    choose: "Choose your account type to get started",
    worker: "Register as Worker",
    employer: "Register as Employer",
  },
  ur: {
    home: "ہوم",
    about: "ہمارے بارے میں",
    features: "خصوصیات",
    howItWorks: "یہ کیسے کام کرتا ہے",
    contact: "رابطہ",
    login: "لاگ ان",
    signUp: "سائن اپ",
    language: "English",
    title: "روزگار حب",
    join: "روزگار حب میں شامل ہوں",
    choose: "شروع کرنے کے لیے اپنے اکاؤنٹ کی قسم منتخب کریں",
    worker: "کارکن کے طور پر رجسٹر کریں",
    employer: "آجر کے طور پر رجسٹر کریں",
  },
};

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTo = (id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogin = () => router.push("/auth/login");

  const handleSignUp = () => {
    Swal.fire({
      title: t.join,
      text: t.choose,
      showCancelButton: true,
      confirmButtonText: t.worker,
      cancelButtonText: t.employer,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#1e3a8a",
    }).then((result) => {
      if (result.isConfirmed) router.push("/auth/register/worker");
      else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel)
        router.push("/auth/register/employer");
    });
  };

  const navLinks = [
    { label: t.home, id: "home" },
    { label: t.about, id: "about" },
    { label: t.features, id: "features" },
    { label: t.howItWorks, id: "how-it-works" },
    { label: t.contact, id: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f172a]/95 backdrop-blur-xl shadow-lg shadow-black/40 border-b border-white/8"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => handleScrollTo("home")} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-all duration-300 overflow-hidden p-1">
            <Image src="/logo.png" alt="Rozgar Hub Logo" width={36} height={36} className="object-contain" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-white font-extrabold text-xl tracking-wide">
              {language === "ur" ? t.title : <>Rozgar <span className="text-green-400">Hub</span></>}
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className="relative px-4 py-2 text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-400 rounded-full group-hover:w-4/5 transition-all duration-300" />
            </button>
          ))}

          <button
            onClick={toggleLanguage}
            className="ml-4 px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            {t.language}
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogin}
            className="hidden sm:block px-4 py-2 text-sm text-gray-300 hover:text-white font-medium transition-colors duration-200"
          >
            {t.login}
          </button>

          <button
            onClick={handleSignUp}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            {t.signUp}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden ml-1 p-2 rounded-lg text-white hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-white rounded transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0a1020]/98 backdrop-blur-xl border-t border-white/8 px-5 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10 flex gap-3">
            <button
              onClick={handleLogin}
              className="flex-1 py-2.5 text-sm text-gray-300 hover:text-white border border-white/20 rounded-lg hover:bg-white/5 transition"
            >
              {t.login}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex-1 py-2.5 text-sm text-white/80 bg-white/5 border border-white/15 rounded-lg hover:bg-white/10 transition"
            >
              {t.language}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}