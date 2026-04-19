"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

const T = {
  en: {
    title: "What can you do?",
    subtitle: "Select the skills/jobs you can perform. You can choose multiple.",
    proficiencyLabel: "Your level",
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    saveBtn: "Save Skills & Continue",
    skipBtn: "Skip for now",
    saving: "Saving...",
    noSkillWarning: "Please select at least one skill.",
    successTitle: "Skills Saved!",
    successText: "Your profile is now set up. Employers with matching jobs will find you.",
    errorTitle: "Could not save skills",
    loadError: "Could not load job titles. Please refresh.",
    conditional: {
      vehicleType: "Vehicle Type",
      licenseNumber: "License Number (optional)",
      educationLevel: "Your Education Level",
      subjects: "Subjects You Can Teach (optional)",
      gradeLevels: "Grade Levels (optional)",
      experience: "Years of Experience (optional)",
    },
    categories: {
      transport: "Transport",
      education: "Education",
      trades: "Skilled Trades",
      cleaning: "Cleaning",
      construction: "Construction",
      outdoor: "Outdoor",
      food: "Food",
      security: "Security",
      general: "General",
    },
  },
  ur: {
    title: "آپ کیا کام کر سکتے ہیں؟",
    subtitle: "اپنی مہارتیں منتخب کریں۔ آپ ایک سے زیادہ منتخب کر سکتے ہیں۔",
    proficiencyLabel: "آپ کی سطح",
    beginner: "شروعاتی",
    intermediate: "درمیانی",
    expert: "ماہر",
    saveBtn: "مہارتیں محفوظ کریں",
    skipBtn: "ابھی چھوڑیں",
    saving: "محفوظ ہو رہا ہے...",
    noSkillWarning: "براہ کرم کم از کم ایک مہارت منتخب کریں۔",
    successTitle: "مہارتیں محفوظ ہو گئیں!",
    successText: "آپ کا پروفائل تیار ہے۔ ملتی جلتی نوکریوں والے آجر آپ کو تلاش کریں گے۔",
    errorTitle: "مہارتیں محفوظ نہ ہو سکیں",
    loadError: "جاب ٹائٹل لوڈ نہیں ہو سکے۔ براہ کرم ریفریش کریں۔",
    conditional: {
      vehicleType: "گاڑی کی قسم",
      licenseNumber: "لائسنس نمبر (اختیاری)",
      educationLevel: "آپ کی تعلیم",
      subjects: "آپ کے مضامین (اختیاری)",
      gradeLevels: "درجے (اختیاری)",
      experience: "تجربے کے سال (اختیاری)",
    },
    categories: {
      transport: "ٹرانسپورٹ",
      education: "تعلیم",
      trades: "ہنر",
      cleaning: "صفائی",
      construction: "تعمیر",
      outdoor: "بیرونی",
      food: "کھانا",
      security: "سیکیورٹی",
      general: "عام",
    },
  },
};

const PROFICIENCY_COLORS = {
  beginner:     "bg-blue-100 text-blue-700 border-blue-300",
  intermediate: "bg-yellow-100 text-yellow-700 border-yellow-300",
  expert:       "bg-green-100 text-green-700 border-green-300",
};

export default function WorkerSkillsPage() {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [jobTitles, setJobTitles]     = useState([]);
  const [selected, setSelected]       = useState({});
  // selected shape: { [slug]: { proficiency: "intermediate", extraData: {} } }
  const [loading, setLoading]         = useState(false);
  const [fetchError, setFetchError]   = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  // Group titles by category
  const grouped = jobTitles.reduce((acc, jt) => {
    const cat = jt.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(jt);
    return acc;
  }, {});

  useEffect(() => {
    fetch(`${API}/api/job-titles`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setJobTitles(data);
        else setFetchError(true);
      })
      .catch(() => setFetchError(true));
  }, []);

  function toggleSkill(jt) {
    setValidationMsg("");
    setSelected((prev) => {
      if (prev[jt.slug]) {
        const next = { ...prev };
        delete next[jt.slug];
        return next;
      }
      return { ...prev, [jt.slug]: { proficiency: "intermediate", extraData: {} } };
    });
  }

  function setProficiency(slug, level) {
    setSelected((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], proficiency: level },
    }));
  }

  function setExtraField(slug, fieldName, value) {
    setSelected((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        extraData: { ...prev[slug].extraData, [fieldName]: value },
      },
    }));
  }

  async function handleSave() {
    const slugs = Object.keys(selected);
    if (slugs.length === 0) {
      setValidationMsg(t.noSkillWarning);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }

    const skills = slugs.map((slug) => {
      const jt = jobTitles.find((j) => j.slug === slug);
      return {
        slug,
        name:        jt?.name || slug,
        proficiency: selected[slug].proficiency,
        extraData:   selected[slug].extraData,
      };
    });

    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/update-skills`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ skills }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/worker/profile");
    } catch (err) {
      setValidationMsg(err.message || t.errorTitle);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#172554] to-[#0f172a] px-4 py-10"
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      {/* Lang toggle */}
      <div className="flex justify-end max-w-2xl mx-auto mb-4 gap-2">
        {["en", "ur"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
              lang === l ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {l === "en" ? "EN" : "اردو"}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛠️</div>
          <h1 className="text-2xl font-bold text-[#1e3a8a]">{t.title}</h1>
          <p className="text-gray-500 text-sm mt-2">{t.subtitle}</p>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 text-sm mb-6">
            {t.loadError}
          </div>
        )}

        {/* Job title chips grouped by category */}
        {Object.entries(grouped).map(([cat, titles]) => (
          <div key={cat} className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              {t.categories[cat] || cat}
            </h3>
            <div className="flex flex-wrap gap-2">
              {titles.map((jt) => {
                const isSelected = !!selected[jt.slug];
                return (
                  <button
                    key={jt.slug}
                    type="button"
                    onClick={() => toggleSkill(jt)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all shadow-sm ${
                      isSelected
                        ? "bg-green-500 border-green-500 text-white scale-105 shadow-green-200"
                        : "bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    <span>{jt.icon}</span>
                    <span>{jt.name}</span>
                    {isSelected && <span className="ml-1 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Conditional expansion for selected skills in this category */}
            {titles
              .filter((jt) => selected[jt.slug] && jt.conditionalFields?.length > 0)
              .map((jt) => (
                <div
                  key={`extra-${jt.slug}`}
                  className="mt-3 ml-1 bg-green-50 border border-green-200 rounded-xl p-4 space-y-3"
                >
                  <p className="text-sm font-semibold text-green-700">
                    {jt.icon} {jt.name} — {lang === "ur" ? "اضافی معلومات" : "Additional Info"}
                  </p>

                  {/* Proficiency selector */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t.proficiencyLabel}</p>
                    <div className="flex gap-2">
                      {["beginner", "intermediate", "expert"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setProficiency(jt.slug, level)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            selected[jt.slug]?.proficiency === level
                              ? PROFICIENCY_COLORS[level] + " border-2"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {t[level]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional fields */}
                  {jt.conditionalFields.map((cf) => (
                    <div key={cf.fieldName}>
                      <label className="block text-xs text-gray-600 mb-1">
                        {cf.label?.[lang] || t.conditional[cf.fieldName] || cf.fieldName}
                        {cf.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {cf.type === "select" ? (
                        <select
                          value={selected[jt.slug]?.extraData?.[cf.fieldName] || ""}
                          onChange={(e) => setExtraField(jt.slug, cf.fieldName, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <option value="">— Select —</option>
                          {cf.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : cf.type === "textarea" ? (
                        <textarea
                          rows={2}
                          value={selected[jt.slug]?.extraData?.[cf.fieldName] || ""}
                          onChange={(e) => setExtraField(jt.slug, cf.fieldName, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={selected[jt.slug]?.extraData?.[cf.fieldName] || ""}
                          onChange={(e) => setExtraField(jt.slug, cf.fieldName, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        ))}

        {/* Proficiency selector for selected skills WITHOUT conditional fields */}
        {Object.keys(selected).length > 0 && (
          <div className="mb-6">
            {Object.keys(selected)
              .filter((slug) => {
                const jt = jobTitles.find((j) => j.slug === slug);
                return jt && (!jt.conditionalFields || jt.conditionalFields.length === 0);
              })
              .map((slug) => {
                const jt = jobTitles.find((j) => j.slug === slug);
                return (
                  <div key={`prof-${slug}`} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-base">{jt?.icon}</span>
                    <span className="text-sm font-semibold text-gray-700 flex-1">{jt?.name}</span>
                    <div className="flex gap-1">
                      {["beginner", "intermediate", "expert"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setProficiency(slug, level)}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                            selected[slug]?.proficiency === level
                              ? PROFICIENCY_COLORS[level] + " border-2"
                              : "bg-white text-gray-400 border-gray-200"
                          }`}
                        >
                          {t[level]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Selected count */}
        {Object.keys(selected).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center text-sm text-green-700 font-semibold mb-4">
            {Object.keys(selected).length} {lang === "ur" ? "مہارتیں منتخب" : "skill(s) selected"}
          </div>
        )}

        {/* Validation message */}
        {validationMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center text-sm text-red-600 mb-4">
            {validationMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.push("/worker/profile")}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition text-sm"
          >
            {t.skipBtn}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-2 flex-grow-[2] py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? t.saving : t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
}