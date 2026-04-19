"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    forgotTitle: "Forgot Password?",
    forgotSubtitle: "Enter your email and we'll send you an OTP",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your registered email",
    sendOtp: "Send OTP",
    sendingOtp: "Sending OTP...",
    invalidEmail: "Please enter a valid email.",
    otpTitle: "Enter OTP",
    otpSentTo: "Code sent to",
    verifyOtp: "Verify OTP",
    verifying: "Verifying...",
    didntReceive: "Didn't receive it?",
    resendOtp: "Resend OTP",
    resending: "Sending...",
    resendIn: "Resend in",
    incompleteOtp: "Please enter the complete 6-digit OTP.",
    newPassTitle: "New Password",
    newPassSubtitle: "Enter your new password below",
    newPassLabel: "New Password",
    newPassPlaceholder: "Create a strong password",
    confirmPassLabel: "Confirm Password",
    confirmPassPlaceholder: "Re-enter new password",
    resetPass: "Reset Password",
    resetting: "Resetting...",
    passMinLength: "Password must meet all requirements.",
    passMismatch: "Passwords do not match.",
    pwWeak: "Weak", pwFair: "Fair", pwStrong: "Strong",
    pwCheck1: "At least 8 characters",
    pwCheck2: "Uppercase letter (A-Z)",
    pwCheck3: "Lowercase letter (a-z)",
    pwCheck4: "Number (0-9)",
    pwCheck5: "Special character (!@#$...)",
    successTitle: "Password Reset!",
    successMsg: "Your password has been reset successfully. You can now login with your new password.",
    goToLogin: "Go to Login",
    rememberPass: "Remember your password?",
    backToLogin: "Back to Login",
    language: "اردو",
  },
  ur: {
    forgotTitle: "پاس ورڈ بھول گئے؟",
    forgotSubtitle: "اپنی ای میل درج کریں، ہم آپ کو OTP بھیجیں گے",
    emailLabel: "ای میل ایڈریس",
    emailPlaceholder: "اپنی رجسٹرڈ ای میل درج کریں",
    sendOtp: "OTP بھیجیں",
    sendingOtp: "OTP بھیجی جا رہی ہے...",
    invalidEmail: "براہ کرم درست ای میل درج کریں۔",
    otpTitle: "OTP درج کریں",
    otpSentTo: "کوڈ بھیجا گیا",
    verifyOtp: "OTP تصدیق کریں",
    verifying: "تصدیق ہو رہی ہے...",
    didntReceive: "موصول نہیں ہوئی؟",
    resendOtp: "OTP دوبارہ بھیجیں",
    resending: "بھیجا جا رہا ہے...",
    resendIn: "دوبارہ بھیجیں",
    incompleteOtp: "براہ کرم 6 ہندسوں کا OTP مکمل درج کریں۔",
    newPassTitle: "نیا پاس ورڈ",
    newPassSubtitle: "نیچے اپنا نیا پاس ورڈ درج کریں",
    newPassLabel: "نیا پاس ورڈ",
    newPassPlaceholder: "مضبوط پاس ورڈ بنائیں",
    confirmPassLabel: "پاس ورڈ کی تصدیق",
    confirmPassPlaceholder: "نیا پاس ورڈ دوبارہ درج کریں",
    resetPass: "پاس ورڈ ری سیٹ کریں",
    resetting: "ری سیٹ ہو رہا ہے...",
    passMinLength: "پاس ورڈ تمام شرائط پوری کرے۔",
    passMismatch: "پاس ورڈ میل نہیں کھاتے۔",
    pwWeak: "کمزور", pwFair: "ٹھیک ہے", pwStrong: "مضبوط",
    pwCheck1: "کم از کم 8 حروف",
    pwCheck2: "بڑا حرف (A-Z)",
    pwCheck3: "چھوٹا حرف (a-z)",
    pwCheck4: "نمبر (0-9)",
    pwCheck5: "خاص نشان (!@#$...)",
    successTitle: "پاس ورڈ ری سیٹ ہو گیا!",
    successMsg: "آپ کا پاس ورڈ کامیابی سے ری سیٹ ہو گیا ہے۔ اب آپ نئے پاس ورڈ سے لاگ ان کر سکتے ہیں۔",
    goToLogin: "لاگ ان پر جائیں",
    rememberPass: "پاس ورڈ یاد ہے؟",
    backToLogin: "لاگ ان پر واپس جائیں",
    language: "English",
  },
};

// ── Step 1: Enter Email ───────────────────────────────────────
function StepEmail({ onNext, t }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) { setError(t.invalidEmail); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onNext(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1e3a8a]">{t.forgotTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{t.forgotSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder={t.emailPlaceholder}
            className="w-full bg-white border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? t.sendingOtp : t.sendOtp}
        </button>
      </form>
    </div>
  );
}

// ── Step 2: Enter OTP ─────────────────────────────────────────
function StepOTP({ email, onNext, t }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else { setCanResend(true); }
  }, [countdown]);

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c);

  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp); setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "") && value) handleVerify(newOtp.join(""));
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); handleVerify(pasted); }
  }

  async function handleVerify(otpString) {
    const otpValue = otpString || otp.join("");
    if (otpValue.length !== 6) { setError(t.incompleteOtp); return; }
    setLoading(true); setError("");
    try { onNext(otpValue); }
    catch (err) { setError(err.message); setOtp(["", "", "", "", "", ""]); inputRefs.current[0]?.focus(); }
    finally { setLoading(false); }
  }

  async function handleResend() {
    if (!canResend) return;
    setResending(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCountdown(60); setCanResend(false);
      setOtp(["", "", "", "", "", ""]); inputRefs.current[0]?.focus();
    } catch (err) { setError(err.message); }
    finally { setResending(false); }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1e3a8a]">{t.otpTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {t.otpSentTo} <span className="font-semibold text-green-500">{maskedEmail}</span>
        </p>
      </div>

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all bg-white
              ${digit ? "border-green-500 bg-green-50 text-green-600" : "border-gray-200"}
              focus:border-green-500 focus:bg-white ${error ? "border-red-300" : ""}`}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg text-center">⚠️ {error}</p>}

      <button
        onClick={() => handleVerify()} disabled={loading || otp.some((d) => d === "")}
        className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t.verifying : t.verifyOtp}
      </button>

      <p className="text-center text-gray-500 text-sm">
        {t.didntReceive}{" "}
        {canResend ? (
          <button onClick={handleResend} disabled={resending} className="text-green-500 font-semibold hover:underline disabled:opacity-50">
            {resending ? t.resending : t.resendOtp}
          </button>
        ) : (
          <span className="text-gray-400">
            {t.resendIn} <span className="font-semibold text-green-500">{countdown}s</span>
          </span>
        )}
      </p>
    </div>
  );
}

// ── Step 3: New Password ──────────────────────────────────────
function StepNewPassword({ email, otp, onDone, t }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwChecks = [
    { label: t.pwCheck1, pass: newPassword.length >= 8 },
    { label: t.pwCheck2, pass: /[A-Z]/.test(newPassword) },
    { label: t.pwCheck3, pass: /[a-z]/.test(newPassword) },
    { label: t.pwCheck4, pass: /\d/.test(newPassword) },
    { label: t.pwCheck5, pass: /[^a-zA-Z0-9]/.test(newPassword) },
  ];
  const passedChecks = pwChecks.filter(c => c.pass).length;
  const pwStrength = newPassword.length === 0 ? null : passedChecks <= 2 ? "weak" : passedChecks <= 4 ? "fair" : "strong";
  const strengthColor = { weak: "#ef4444", fair: "#f59e0b", strong: "#22c55e" };
  const strengthLabel = { weak: t.pwWeak, fair: t.pwFair, strong: t.pwStrong };
  const isValid = passedChecks >= 4 && newPassword === confirmPassword && newPassword.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (passedChecks < 4) { setError(t.passMinLength); return; }
    if (newPassword !== confirmPassword) { setError(t.passMismatch); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1e3a8a]">{t.newPassTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{t.newPassSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">{t.newPassLabel}</label>
          <input
            type={showPass ? "text" : "password"} value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
            placeholder={t.newPassPlaceholder}
            className="w-full bg-white border border-gray-300 p-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
            required
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Password Strength */}
        {newPassword.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            {/* Strength bar */}
            <div className="flex items-center gap-2 mb-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{ background: i <= passedChecks ? strengthColor[pwStrength] : "#e5e7eb" }} />
              ))}
              <span className="text-xs font-bold ml-1 whitespace-nowrap" style={{ color: strengthColor[pwStrength] }}>
                {strengthLabel[pwStrength]}
              </span>
            </div>
            {/* Checks list */}
            <div className="grid grid-cols-1 gap-1.5">
              {pwChecks.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: c.pass ? "#22c55e" : "#d1d5db" }}>
                    {c.pass ? "✓" : "○"}
                  </span>
                  <span className="text-xs" style={{ color: c.pass ? "#15803d" : "#9ca3af", fontWeight: c.pass ? 600 : 400 }}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <label className="block text-sm font-medium text-gray-600 mb-1">{t.confirmPassLabel}</label>
          <input
            type={showConfirm ? "text" : "password"} value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            placeholder={t.confirmPassPlaceholder}
            className="w-full bg-white border border-gray-300 p-3 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
            required
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
            {showConfirm ? "🙈" : "👁️"}
          </button>
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">⚠ {t.passMismatch}</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>}

        <button type="submit" disabled={loading || !isValid}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? t.resetting : t.resetPass}
        </button>
      </form>
    </div>
  );
}

// ── Step 4: Success ───────────────────────────────────────────
function StepSuccess({ onLogin, t }) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[#1e3a8a]">{t.successTitle}</h1>
      <p className="text-gray-500 text-sm">{t.successMsg}</p>
      <button onClick={onLogin}
        className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition duration-300 shadow-md"
      >
        {t.goToLogin}
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#1e3a8a] px-4">

      {/* Language Toggle */}
      <div className="absolute top-20 right-6 flex gap-2 z-20">
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
            lang === "en" ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang("ur")}
          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
            lang === "ur" ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          اردو
        </button>
      </div>

      <div className="w-full max-w-md rounded-3xl shadow-2xl p-10" style={{ backgroundColor: "#e8edf5" }}>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? "w-8 bg-green-500" : s < step ? "w-2 bg-green-300" : "w-2 bg-gray-300"
            }`} />
          ))}
        </div>

        {step === 1 && <StepEmail onNext={(e) => { setEmail(e); setStep(2); }} t={t} />}
        {step === 2 && <StepOTP email={email} onNext={(otp) => { setOtpValue(otp); setStep(3); }} t={t} />}
        {step === 3 && <StepNewPassword email={email} otp={otpValue} onDone={() => setStep(4)} t={t} />}
        {step === 4 && <StepSuccess onLogin={() => router.push("/auth/login")} t={t} />}

        {step < 4 && (
          <p className="text-center text-gray-500 text-sm mt-6">
            {t.rememberPass}{" "}
            <span onClick={() => router.push("/auth/login")} className="text-green-500 cursor-pointer font-medium hover:underline">
              {t.backToLogin}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}