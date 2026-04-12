"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordStrengthChecker from "@/components/PasswordStrengthChecker";

// ── SweetAlert2 loader ────────────────────────────────────────
function useSwal() {
  useEffect(() => {
    if (document.getElementById("swal-css")) return;
    const link = document.createElement("link");
    link.id = "swal-css";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "swal-js";
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    document.head.appendChild(script);
  }, []);

  return (opts) => {
    if (typeof window !== "undefined" && window.Swal) {
      return window.Swal.fire(opts);
    }
  };
}

const T = {
  en: {
    fixErrors: "Please fix the errors",
    docsMissing: "Documents Missing",
    uploadNow: "Upload Now",
    fileTooLarge: "File Too Large",
    fileTooLargeText: "Maximum file size is 5MB. Please choose a smaller file.",
    invalidFileType: "Invalid File Type",
    invalidFileTypeText: "Only JPG, PNG, WEBP, and PDF files are allowed.",
    regBlocked: "Registration Blocked 🚫",
    emailAlreadyReg: "Email Already Registered",
    emailAlreadyRegText: "This email is already in use. Please login or use a different email.",
    goToLogin: "Go to Login",
    tryAnotherEmail: "Try Another Email",
    cnicAlreadyReg: "CNIC Already Registered",
    cnicAlreadyRegText: "This CNIC is already associated with an account.",
    docsUploaded: "Documents Uploaded! ✅",
    docsUploadedHtml: (email) => `OTP sent to <strong>${email}</strong><br><small>Check your inbox</small>`,
    enterOTP: "Enter OTP",
    regFailed: "Registration Failed",
    somethingWentWrong: "Something went wrong. Please try again.",
    invalidOTP: "Invalid OTP",
    invalidOTPText: "Please enter the 6-digit OTP sent to your email.",
    otpExpired: "OTP Expired ⏰",
    otpExpiredText: "Your OTP has expired. Please request a new one.",
    resendOTP: "Resend OTP",
    tooManyAttempts: "Too Many Attempts 🔒",
    wrongOTP: "Wrong OTP ❌",
    wrongOTPText: "The OTP you entered is incorrect.",
    regComplete: "Registration Complete! 🎉",
    regCompleteHtml: (name) => `Welcome to RozgarHub, <strong>${name}</strong>!<br>Your account is being reviewed.`,
    goToDash: "Go to Dashboard",
    verifyFail: "Verification Failed",
    otpResent: "OTP Resent! 📧",
    otpResentText: (email) => `A new OTP has been sent to ${email}`,
    failResend: "Failed to Resend",
    workerReg: "Worker Registration",
    fullName: "Full Name",
    email: "Email",
    otpVerify: "OTP will be sent for verification",
    password: "Password (must be strong)",
    phone: "Phone (03XXXXXXXXX)",
    cnic: "CNIC (12345-1234567-1)",
    continue: "Continue →",
    docVerification: "Document Verification",
    upload: "Upload clear photos. Stored securely and reviewed by admin only.",
    profilePhoto: "Profile Photo",
    clearFace: "Clear face photo, no sunglasses",
    cnicFront: "CNIC Front",
    cnicFrontHint: "Front side of your National ID Card",
    cnicBack: "CNIC Back",
    cnicBackHint: "Back side of your National ID Card",
    uploading: "Uploading...",
    register: "Register →",
    back: "← Back",
    editing: "← Edit Documents",
    otpSent: "OTP sent to",
    checkInbox: "Check your inbox and enter the 6-digit code",
    enterOtpLabel: "Enter OTP",
    otpExpires: "OTP expires in 10 minutes",
    verify: "Verify & Complete Registration",
    verifying: "Verifying...",
  },
  ur: {
    fixErrors: "براہ کرم خرابیوں کو ٹھیک کریں",
    docsMissing: "دستاویزات موجود نہیں",
    uploadNow: "اب اپ لوڈ کریں",
    fileTooLarge: "فائل بہت بڑی ہے",
    fileTooLargeText: "زیادہ سے زیادہ فائل سائز 5MB ہے۔ براہ کرم چھوٹی فائل منتخب کریں۔",
    invalidFileType: "غلط فائل کی قسم",
    invalidFileTypeText: "صرف JPG, PNG, WEBP، اور PDF فائلوں کی اجازت ہے۔",
    regBlocked: "رجسٹریشن بند 🚫",
    emailAlreadyReg: "ای میل پہلے سے رجسٹرڈ ہے",
    emailAlreadyRegText: "یہ ای میل پہلے سے استعمال ہو رہی ہے۔ براہ کرم لاگ ان کریں یا مختلف ای میل استعمال کریں۔",
    goToLogin: "لاگ ان کریں",
    tryAnotherEmail: "دوسری ای میل آزمائیں",
    cnicAlreadyReg: "CNIC پہلے سے رجسٹرڈ ہے",
    cnicAlreadyRegText: "یہ CNIC پہلے سے کسی اکاؤنٹ سے منسلک ہے۔",
    docsUploaded: "دستاویزات اپ لوڈ ہو گئیں! ✅",
    docsUploadedHtml: (email) => `OTP <strong>${email}</strong> کو بھیجا گیا<br><small>اپنا انباکس چیک کریں</small>`,
    enterOTP: "OTP درج کریں",
    regFailed: "رجسٹریشن ناکام",
    somethingWentWrong: "کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔",
    invalidOTP: "غلط OTP",
    invalidOTPText: "براہ کرم اپنی ای میل کو بھیجا گیا 6 ہندسے OTP درج کریں۔",
    otpExpired: "OTP میعاد ختم ہو گیا ⏰",
    otpExpiredText: "آپ کا OTP میعاد ختم ہو گیا ہے۔ براہ کرم نیا OTP مانگیں۔",
    resendOTP: "OTP دوبارہ بھیجیں",
    tooManyAttempts: "بہت زیادہ کوششیں 🔒",
    wrongOTP: "غلط OTP ❌",
    wrongOTPText: "آپ کے درج کردہ OTP غلط ہیں۔",
    regComplete: "رجسٹریشن مکمل! 🎉",
    regCompleteHtml: (name) => `RozgarHub میں خوش آمدید، <strong>${name}</strong>!<br>آپ کے اکاؤنٹ کا جائزہ لیا جا رہا ہے۔`,
    goToDash: "ڈیش بورڈ پر جائیں",
    verifyFail: "تصدیق ناکام",
    otpResent: "OTP دوبارہ بھیج دیا گیا! 📧",
    otpResentText: (email) => `ایک نیا OTP ${email} کو بھیجا گیا ہے`,
    failResend: "دوبارہ بھیجنے میں ناکام",
    workerReg: "کارکن کی رجسٹریشن",
    fullName: "مکمل نام",
    email: "ای میل",
    otpVerify: "تصدیق کے لیے OTP بھیجا جائے گا",
    password: "پاس ورڈ (مضبوط ہونا چاہیے)",
    phone: "فون (03XXXXXXXXX)",
    cnic: "CNIC (12345-1234567-1)",
    continue: "جاری رکھیں →",
    docVerification: "دستاویز کی تصدیق",
    upload: "واضح تصویریں اپ لوڈ کریں۔ محفوظ طریقے سے ذخیرہ کیا جاتا ہے اور صرف ایڈمن کی طرف سے جائزہ لیا جاتا ہے۔",
    profilePhoto: "پروفائل فوٹو",
    clearFace: "صاف چہرے کی تصویر، کوئی عینک نہ ہو",
    cnicFront: "CNIC کا اگلا حصہ",
    cnicFrontHint: "آپ کے قومی شناخت کارڈ کا اگلا حصہ",
    cnicBack: "CNIC کا پچھلا حصہ",
    cnicBackHint: "آپ کے قومی شناخت کارڈ کا پچھلا حصہ",
    uploading: "اپ لوڈ ہو رہا ہے...",
    register: "رجسٹر کریں →",
    back: "← واپس",
    editing: "← دستاویزات میں ترمیم کریں",
    otpSent: "OTP کو بھیجا گیا",
    checkInbox: "اپنا انباکس چیک کریں اور 6 ہندسے کوڈ درج کریں",
    enterOtpLabel: "OTP درج کریں",
    otpExpires: "OTP 10 منٹ میں منقطع ہو جائے گا",
    verify: "تصدیق کریں اور رجسٹریشن مکمل کریں",
    verifying: "تصدیق ہو رہی ہے...",
  },
};

export default function WorkerRegisterPage() {
  const router = useRouter();
  const swal = useSwal();
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [step, setStep] = useState("form");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", cnic: "",
  });

  const [files, setFiles] = useState({
    profilePhoto: null, cnicFront: null, cnicBack: null,
  });
  const [previews, setPreviews] = useState({
    profilePhoto: null, cnicFront: null, cnicBack: null,
  });

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    constraints: {},
    score: 0,
  });

  // ── Step 1 validation ──
  function validateForm() {
    const e = {};
    if (!form.name.trim())                        e.name     = "Name required";
    if (!form.email.includes("@"))                e.email    = "Valid email required";
    if (!passwordStrength.isValid)                e.password = "Password does not meet requirements";
    if (!/^03\d{9}$/.test(form.phone))            e.phone    = "Format: 03XXXXXXXXX";
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))  e.cnic     = "Format: 12345-1234567-1";
    setErrors(e);

    // SweetAlert for validation errors
    if (Object.keys(e).length > 0) {
      swal({
        title: t.fixErrors,
        html: Object.values(e).map(err => `• ${err}`).join("<br>"),
        icon: "warning",
        confirmButtonColor: "#f97316",
        confirmButtonText: "OK, got it",
      });
    }

    return Object.keys(e).length === 0;
  }

  // ── Step 2 validation ──
  function validateDocs() {
    const e = {};
    if (!files.profilePhoto) e.profilePhoto = "Profile photo is required";
    if (!files.cnicFront)    e.cnicFront    = "CNIC front image is required";
    if (!files.cnicBack)     e.cnicBack     = "CNIC back image is required";
    setErrors(e);

    if (Object.keys(e).length > 0) {
      swal({
        title: t.docsMissing,
        html: Object.values(e).map(err => `📎 ${err}`).join("<br>"),
        icon: "warning",
        confirmButtonColor: "#f97316",
        confirmButtonText: t.uploadNow,
      });
    }

    return Object.keys(e).length === 0;
  }

  function handleFileChange(field, e) {
    const file = e.target.files[0];
    if (!file) return;

    // File size check — 5MB
    if (file.size > 5 * 1024 * 1024) {
      swal({
        title: t.fileTooLarge,
        text: t.fileTooLargeText,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    // File type check
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      swal({
        title: t.invalidFileType,
        text: t.invalidFileTypeText,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setFiles(prev => ({ ...prev, [field]: file }));
    setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }

  function handleFormNext(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setStep("docs");
  }

  async function handleDocsSubmit(e) {
    e.preventDefault();
    if (!validateDocs()) return;
    setLoading(true);
    setUploadProgress("Uploading documents to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("name",         form.name);
      formData.append("email",        form.email);
      formData.append("password",     form.password);
      formData.append("phone",        form.phone);
      formData.append("cnic",         form.cnic);
      formData.append("role",         "worker");
      formData.append("profilePhoto", files.profilePhoto);
      formData.append("cnicFront",    files.cnicFront);
      formData.append("cnicBack",     files.cnicBack);

      setUploadProgress("Registering account...");

      const res = await fetch("http://localhost:5000/api/auth/register/worker", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // ── Fraud detection block ──
        if (data.error?.includes("blocked") || data.error?.includes("suspicious")) {
          swal({
            title: t.regBlocked,
            text: data.error,
            icon: "error",
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Contact Support",
          });
          return;
        }

        // ── Duplicate email ──
        if (data.error?.includes("Email already")) {
          swal({
            title: t.emailAlreadyReg,
            text: t.emailAlreadyRegText,
            icon: "warning",
            confirmButtonColor: "#f97316",
            showCancelButton: true,
            confirmButtonText: t.goToLogin,
            cancelButtonText: t.tryAnotherEmail,
          }).then(r => {
            if (r.isConfirmed) router.push("/auth/login");
          });
          return;
        }

        // ── Duplicate CNIC ──
        if (data.error?.includes("CNIC already")) {
          swal({
            title: t.cnicAlreadyReg,
            text: t.cnicAlreadyRegText,
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
          return;
        }

        // ── Generic error ──
        throw new Error(data.error);
      }

      // ── Success — OTP sent ──
      setUploadProgress("");
      swal({
        title: t.docsUploaded,
        html: t.docsUploadedHtml(form.email),
        icon: "success",
        confirmButtonColor: "#16a34a",
        confirmButtonText: t.enterOTP,
        timer: 3000,
        timerProgressBar: true,
      }).then(() => setStep("otp"));

    } catch (err) {
      setUploadProgress("");
      swal({
        title: t.regFailed,
        text: err.message || t.somethingWentWrong,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      swal({
        title: t.invalidOTP,
        text: t.invalidOTPText,
        icon: "warning",
        confirmButtonColor: "#f97316",
      });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        // ── OTP expired ──
        if (data.error?.includes("expired")) {
          swal({
            title: t.otpExpired,
            text: t.otpExpiredText,
            icon: "warning",
            confirmButtonColor: "#f97316",
            confirmButtonText: t.resendOTP,
          }).then(() => handleResend());
          return;
        }

        // ── Too many attempts ──
        if (data.error?.includes("Too many")) {
          swal({
            title: t.tooManyAttempts,
            text: data.error,
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
          return;
        }

        // ── Wrong OTP ──
        swal({
          title: t.wrongOTP,
          text: data.error || t.wrongOTPText,
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
        return;
      }

      // ── OTP verified — success ──
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      await swal({
        title: t.regComplete,
        html: t.regCompleteHtml(form.name),
        icon: "success",
        confirmButtonColor: "#16a34a",
        confirmButtonText: t.goToDash,
        timer: 3000,
        timerProgressBar: true,
      });

      router.push("/worker/profile");

    } catch (err) {
      swal({
        title: t.verifyFail,
        text: err.message || t.somethingWentWrong,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResend() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      swal({
        title: t.otpResent,
        text: t.otpResentText(form.email),
        icon: "success",
        confirmButtonColor: "#16a34a",
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (err) {
      swal({
        title: t.failResend,
        text: err.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  }

  const steps = ["form", "docs", "otp"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a8a] via-[#172554] to-[#0f172a] px-4 py-10">
      <div className="max-w-lg w-full bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl space-y-6 border border-white/20">

        {/* Progress Bar */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step === s
                  ? "bg-orange-500 text-white"
                  : steps.indexOf(step) > i
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"}`}>
                {steps.indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && (
                <div className={`w-12 h-1 rounded transition-all
                  ${steps.indexOf(step) > i ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-center flex-1 text-[#1e3a8a]">{t.workerReg}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                lang === "en"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                lang === "ur"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              اردو
            </button>
          </div>
        </div>

        {/* ── STEP 1: Basic Info ── */}
        {step === "form" && (
          <form onSubmit={handleFormNext} className="space-y-4">
            <Input placeholder={t.fullName} value={form.name} error={errors.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />

            <div>
              <Input placeholder={t.email} value={form.email} error={errors.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">📧 {t.otpVerify}</p>
            </div>

            <Input type="password" placeholder={t.password} value={form.password}
              error={errors.password}
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                setErrors(prev => ({ ...prev, password: null }));
              }} />
            <PasswordStrengthChecker 
              password={form.password} 
              onStrengthChange={setPasswordStrength}
            />

            <Input placeholder={t.phone} value={form.phone} error={errors.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />

            <Input placeholder={t.cnic} value={form.cnic} error={errors.cnic}
              onChange={e => setForm({ ...form, cnic: e.target.value })} />

            <button type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md">
              {t.continue}
            </button>
          </form>
        )}

        {/* ── STEP 2: Documents ── */}
        {step === "docs" && (
          <form onSubmit={handleDocsSubmit} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-blue-700 text-sm font-semibold">📋 Document Verification</p>
              <p className="text-blue-600 text-xs mt-1">
                Upload clear photos. Stored securely and reviewed by admin only.
              </p>
            </div>

            <FileUpload label="Profile Photo" hint="Clear face photo, no sunglasses"
              accept="image/*" preview={previews.profilePhoto} error={errors.profilePhoto}
              onChange={e => handleFileChange("profilePhoto", e)} />

            <FileUpload label="CNIC Front" hint="Front side of your National ID Card"
              accept="image/*,.pdf" preview={previews.cnicFront} error={errors.cnicFront}
              onChange={e => handleFileChange("cnicFront", e)} />

            <FileUpload label="CNIC Back" hint="Back side of your National ID Card"
              accept="image/*,.pdf" preview={previews.cnicBack} error={errors.cnicBack}
              onChange={e => handleFileChange("cnicBack", e)} />

            {uploadProgress && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-orange-600 text-sm font-medium">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("form")}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Uploading..." : "Register →"}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: OTP ── */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
              <p className="text-green-700 text-sm font-semibold">
                ✅ OTP sent to <span className="font-bold">{form.email}</span>
              </p>
              <p className="text-green-600 text-xs mt-1">Check your inbox and enter the 6-digit code</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Enter OTP</label>
              <input type="text" inputMode="numeric" maxLength={6}
                placeholder="Enter 6-digit OTP" value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setErrors({}); }}
                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 transition text-center text-2xl font-bold tracking-widest border-gray-300 focus:border-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">OTP expires in 10 minutes</p>
            </div>

            <button type="submit" disabled={otpLoading}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {otpLoading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <div className="flex justify-between text-sm">
              <button type="button" onClick={handleResend}
                className="text-orange-500 hover:underline">Resend OTP</button>
              <button type="button"
                onClick={() => { setStep("docs"); setOtp(""); setErrors({}); }}
                className="text-gray-400 hover:underline">← Edit Documents</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <div>
      <input {...props}
        className={`w-full border p-3 rounded-lg outline-none transition focus:ring-2 focus:ring-orange-400
          ${error ? "border-red-500" : "border-gray-300 focus:border-orange-400"}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FileUpload({ label, hint, accept, preview, error, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition
        ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50"}`}
        style={{ minHeight: preview ? "auto" : "100px" }}>
        {preview ? (
          <div className="w-full p-2">
            <img src={preview} alt={label} className="w-full max-h-40 object-contain rounded-lg" />
            <p className="text-xs text-center text-orange-500 mt-2 font-medium">✓ Uploaded — click to change</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 px-4 text-center">
            <span className="text-3xl mb-2">📷</span>
            <p className="text-sm text-gray-500 font-medium">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF — max 5MB</p>
          </div>
        )}
        <input type="file" accept={accept} onChange={onChange} className="hidden" />
      </label>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}