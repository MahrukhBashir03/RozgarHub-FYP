"use client";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Wrench, Building2, Check } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

const content = {
  en: {
    dir: "ltr",
    sectionBadge: "Who Is This For?",
    heading: "Built for",
    headingWorker: "Workers",
    headingEmployer: "Employers",
    subheading: "Whether you're looking for your next job or searching for skilled help, Rozgar Hub is designed with you in mind.",
    workerTitle: "For Workers",
    workerSubtitle: "Find work near you",
    workerDesc: "Create your profile, set your rates, and start receiving job requests from employers in your area. No middlemen, no waiting at labor chowks.",
    workerBenefits: [
      "Electricians, plumbers, masons, carpenters",
      "House cleaners, cooks, domestic helpers",
      "Painters, gardeners, AC technicians",
      "Drivers, delivery personnel",
      "Tailors, beauticians, skilled women",
      "Construction workers, daily wagers",
    ],
    workerBtn: "Register as Worker",
    workerAlert: {
      title: "Register as Worker",
      text: "You'll be able to find jobs near you and set your own rates!",
      confirmText: "Continue to Registration",
      cancelText: "Cancel",
    },
    employerTitle: "For Employers",
    employerSubtitle: "Hire verified workers",
    employerDesc: "Post job requirements, browse verified worker profiles, negotiate rates, and hire the right person for any task — all in minutes.",
    employerBenefits: [
      "Homeowners needing repairs",
      "Small business owners",
      "Construction site managers",
      "Event organizers",
      "Shops and restaurants",
      "Anyone needing skilled help",
    ],
    employerBtn: "Post a Job",
    employerAlert: {
      title: "Post a Job",
      text: "Post your job requirements and hire verified workers instantly!",
      confirmText: "Continue to Registration",
      cancelText: "Cancel",
    },
  },
  ur: {
    dir: "rtl",
    sectionBadge: "یہ کس کے لیے ہے؟",
    heading: "کے لیے بنایا گیا",
    headingWorker: "کارکن",
    headingEmployer: "آجر",
    subheading: "چاہے آپ اپنی اگلی ملازمت تلاش کر رہے ہوں یا ماہر مدد تلاش کر رہے ہوں، روزگار ہب آپ کے لیے ڈیزائن کیا گیا ہے۔",
    workerTitle: "کارکنوں کے لیے",
    workerSubtitle: "اپنے قریب کام تلاش کریں",
    workerDesc: "اپنی پروفائل بنائیں، اپنی شرح طے کریں، اور اپنے علاقے میں آجروں سے ملازمت کی درخواستیں حاصل کریں۔ کوئی درمیانی نہیں، لیبر چوپالوں پر انتظار نہیں۔",
    workerBenefits: [
      "الیکٹریشن، پلمبر، بنائی، بڑھئی",
      "گھر کی صفائی کرنے والے، باورچی، گھریلو مددگار",
      "پینٹر، ماہر, ایئی کنڈیشننگ ٹیکنیشن",
      "ڈرائیور، ڈیلیوری اہلکار",
      "درزی، خوبصورتی کی متخصص، ماہر خواتین",
      "تعمیراتی کارکن، روزمرہ کے مزدور",
    ],
    workerBtn: "کارکن کے طور پر رجسٹر کریں",
    workerAlert: {
      title: "کارکن کے طور پر رجسٹر کریں",
      text: "آپ اپنے قریب ملازمتیں تلاش کر سکیں گے اور اپنی شرح طے کر سکیں گے!",
      confirmText: "رجسٹریشن کے لیے جاری رکھیں",
      cancelText: "منسوخ کریں",
    },
    employerTitle: "آجروں کے لیے",
    employerSubtitle: "تصدیق شدہ کارکنوں کو کرائے پر لیں",
    employerDesc: "ملازمت کی ضروریات شائع کریں، تصدیق شدہ کارکنوں کی پروفائلیں دیکھیں، شرح پر غور کریں، اور کسی بھی کام کے لیے صحیح شخص کو کرائے پر لیں — سب کچھ منٹوں میں۔",
    employerBenefits: [
      "مکان کی مرمت کی ضرورت والے",
      "چھوٹے کاروباری مالکان",
      "تعمیراتی سائٹ منیجر",
      "تقریب کے منتظمین",
      "دکانیں اور ریستوران",
      "ماہر مدد کی ضرورت والا کوئی بھی",
    ],
    employerBtn: "کام شائع کریں",
    employerAlert: {
      title: "کام شائع کریں",
      text: "اپنی ملازمت کی ضروریات شائع کریں اور فوری طور پر تصدیق شدہ کارکنوں کو کرائے پر لیں!",
      confirmText: "رجسٹریشن کے لیے جاری رکھیں",
      cancelText: "منسوخ کریں",
    },
  },
};

const urduFont = { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: "2" };

export default function UserTypes() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = content[language];
  const isUrdu = language === "ur";
  const lf = isUrdu ? urduFont : {};

  const handleWorkerClick = () => {
    Swal.fire({
      title: t.workerAlert.title,
      text: t.workerAlert.text,
      icon: "info",
      iconColor: "#3b82f6",
      confirmButtonText: t.workerAlert.confirmText,
      confirmButtonColor: "#3b82f6",
      showCancelButton: true,
      cancelButtonText: t.workerAlert.cancelText,
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/auth/register/worker");
      }
    });
  };

  const handleEmployerClick = () => {
    Swal.fire({
      title: t.employerAlert.title,
      text: t.employerAlert.text,
      icon: "info",
      iconColor: "#10b981",
      confirmButtonText: t.employerAlert.confirmText,
      confirmButtonColor: "#10b981",
      showCancelButton: true,
      cancelButtonText: t.employerAlert.cancelText,
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/auth/register/employer");
      }
    });
  };

  return (
    <section
      id="user-types"
      className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden"
      dir={t.dir}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-4" style={lf}>
            {t.sectionBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900" style={lf}>
            {t.heading} <span className="text-blue-600">{t.headingWorker}</span> &{" "}
            <span className="text-green-600">{t.headingEmployer}</span>
          </h2>
          <p className="text-lg text-gray-600" style={lf}>
            {t.subheading}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Worker Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={lf}>
                  {t.workerTitle}
                </h3>
                <p className="text-gray-600" style={lf}>{t.workerSubtitle}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6" style={lf}>
              {t.workerDesc}
            </p>

            <ul className="space-y-3 mb-8">
              {t.workerBenefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-gray-700" style={lf}>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleWorkerClick}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2"
              style={lf}
            >
              <Wrench className="w-5 h-5" />
              {t.workerBtn}
            </button>
          </div>

          {/* Employer Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={lf}>
                  {t.employerTitle}
                </h3>
                <p className="text-gray-600" style={lf}>{t.employerSubtitle}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6" style={lf}>
              {t.employerDesc}
            </p>

            <ul className="space-y-3 mb-8">
              {t.employerBenefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700" style={lf}>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleEmployerClick}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center gap-2"
              style={lf}
            >
              <Building2 className="w-5 h-5" />
              {t.employerBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}