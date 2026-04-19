"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";
import {
  Briefcase, CheckCircle, LogOut, Menu, X,
  MapPin, DollarSign, Bell, PlusCircle,
  ThumbsUp, ThumbsDown, MessageSquare, Search, SlidersHorizontal,
  Upload, Car, User, Settings, Camera, Lock, Mail, Phone,
  Eye, EyeOff, Save, Shield, Star, Edit2, RefreshCw
} from "lucide-react";
import JobTracker from "@/components/JobTracker";

const JobMap = dynamic(() => import("@/components/JobMap"), { ssr: false });

const socket = io("http://localhost:5000");
if (typeof window !== "undefined") {
  window._rozgarSocket = socket;
  socket.on("connect",    () => console.log("✅ Worker socket CONNECTED"));
  socket.on("disconnect", () => console.log("❌ Worker socket DISCONNECTED"));
}

const API = "http://localhost:5000";

const T = {
  en: {
    dir: "ltr", brand: "RozgarHub", role: "WORKER",
    navRequests: "Job Requests", navApplied: "My Applications",
    navBrowse: "Browse Jobs", navHistory: "Job History", navAvail: "Post Availability",
    navProfile: "Profile",
    logout: "Logout", online: "Online",
    headerRequests: "Incoming Requests", headerApplied: "My Applications",
    headerBrowse: "Browse Jobs", headerHistory: "Job History", welcomeBack: "Welcome back",
    waitingTitle: "Waiting for job requests...",
    waitingDesc: "When an employer posts a job in your area, it will pop up automatically.",
    incomingTitle: "New request incoming!", incomingDesc: "Check the popup to respond.",
    recentNotifs: "Recent Notifications", noApps: "No applications yet.",
    appliedOn: "Applied", recently: "recently", pending: "Pending", shortlisted: "Shortlisted",
    applyNow: "Apply Now", applyFor: "Apply for Job",
    employerListedRate: "Employer Listed Rate", yourOffer: "Your Offer (PKR)",
    aboveRate: "above listed rate", belowRate: "below listed rate",
    matchingRate: "Matching employer's listed rate",
    submitApp: "Submit Application", newJobRequest: "New Job Request", employerOffer: "EMPLOYER OFFER",
    acceptJob: "Accept Job", declineJob: "Decline",
    counterOffer: "Counter Offer", sendCounter: "Send Counter",
    offerSent: "Counter Offer Sent! Waiting for employer...",
    yourOfferWas: "Your counter offer:", counterReceived: "EMPLOYER COUNTER OFFER",
    yourOfferWasLabel: "Your offer was",
    accept: "Accept", reject: "Reject",
    jobConfirmed: "Job Confirmed!", jobConfirmedDesc: "Get ready to go to the job site",
    viewJobDetails: "Track Job",
    offerRejected: "Not Selected", offerRejectedDesc: "The employer chose another worker",
    close: "Close", dismissed: "Request Dismissed",
    dismissedDesc: "The employer dismissed your acceptance",
    postAvailTitle: "Post Your Availability",
    skillLabel: "Your Skill / Trade", skillPlaceholder: "e.g., Electrician, Plumber, Driver",
    expLabel: "Years of Experience", expPlaceholder: "e.g., 5 years",
    rateLabel: "Hourly Rate (PKR)", ratePlaceholder: "e.g., 500",
    locLabel: "Your Location", locPlaceholder: "e.g., Karachi, Lahore",
    descLabel: "Description", descPlaceholder: "Describe your skills...",
    postBtn: "Post Availability", cancelBtn: "Cancel",
    driverLicenseSection: "Driver License (Required for Drivers)",
    driverLicenseHint: "Upload your driving license — it will be saved to your profile and earn you points.",
    uploadLicenseBtn: "Upload License", licenseUploaded: "License Uploaded!",
    licenseUploading: "Uploading...", chooseLicense: "Choose license image or PDF",
    swalPosted: "Posted!", swalPostedText: "Availability updated.",
    swalError: "Error", swalErrorText: "Failed to post.",
    swalSavedLocally: "Saved Locally", swalSavedLocallyText: "Saved locally.",
    swalAppSent: "Application Sent!", swalAppSentText: "Submitted. We'll notify you.",
    swalOops: "Oops!", swalAlreadyApplied: "You may have already applied.",
    swalRejectCounter: "Reject Counter?", swalRejectCounterText: "Are you sure?",
    swalYesReject: "Yes, Reject", swalGoBack: "Go Back",
    swalLogout: "Logout?", swalLogoutText: "Are you sure you want to logout?",
    swalYesLogout: "Yes, Logout", swalGreat: "Great!", langToggle: "اردو",
    swalProfileUpdated: "Profile Updated!", swalProfileUpdatedText: "Your profile has been saved successfully.",
    swalProfileError: "Error", swalProfileErrorText: "Failed to update profile.",
    swalPwChanged: "Password Changed!", swalPwChangedText: "Your password has been updated successfully.",
    swalPwError: "Error", swalPwErrorText: "Failed to change password.",
    pwSecureSubtitle: "Keep your account secure with a strong password",
    pwCheck1: "At least 8 characters", pwCheck2: "Uppercase letter (A-Z)",
    pwCheck3: "Lowercase letter (a-z)", pwCheck4: "Number (0-9)",
    pwCheck5: "Special character (!@#$...)",
    pwWeak: "Weak", pwFair: "Fair", pwStrong: "Strong",
    optionalCounter: "Enter counter price (Rs.)...",
    counterNote: "Propose a different price instead",
    aiFilterPlaceholder: "e.g. Electrician in Lahore under 2000, urgent",
    aiFilterBtn: "Apply Filter", aiFiltering: "Finding jobs...",
    activeFilters: "Active Filters", clearFilters: "Clear",
    noJobsFound: "No jobs found", noJobsFoundSub: "Try a different search or clear filters",
    noHistory: "No completed jobs yet", noHistorySub: "Finished jobs will appear here",
    profileProgress: "Profile Progress", profileComplete: "Profile Complete! 🎉",
    completeYourProfile: "Complete your profile to get more jobs",
    stepRegistered: "Account Registered",
    stepProfilePhoto: "Profile Photo Uploaded",
    stepCnicDocs: "CNIC Documents Uploaded",
    stepAvailability: "Availability Posted",
    stepLicense: "Driving License Uploaded",
    stepVerified: "Admin Verified",
    tapToComplete: "Tap to complete",
    trackingHeader: "Job In Progress",
    notifications: "Notifications",
    notifSubtitle: "Job alerts will appear here",
    markAllRead: "Mark all read",
    clearAll: "Clear all",
    noNotifications: "No notifications yet",
    tipProfilePhoto: "Go to Profile → Upload a clear photo of yourself",
    tipCnic: "Go to Profile → Upload front & back of your CNIC",
    tipAvailability: "Click 'Post Availability' in the sidebar to post your skills",
    tipLicense: "In Post Availability form, upload your driving license",
    tipVerified: "Our team will review and verify your account within 24 hours",
    boostTitle: "💡 How to get more jobs",
    boostSub: "Complete these steps to appear in more employer searches",
    skillFilterOn: "Showing jobs matching your skill",
    skillFilterOff: "Show all jobs",
    yourSkill: "Your skill",
    removeFilter: "Remove filter",
    appliedViaRequest: "📩 Employer Request",
    appliedViaBrowse: "📝 Browse Apply",
    agreedPriceLabel: "Agreed Price",
    yourOfferLabel: "Your Offer",
    noAppsDesc: "Jobs you apply to and employer requests you accept will appear here",
    confirmed: "Confirmed", callEmployer: "Call Employer",
    rateExperience: "Rate Your Experience",
    howWasExperience: "How was working with",
    commentOptional: "Leave a comment (optional)",
    commentPlaceholder: "Share any issues, highlights, or feedback about this job...",
    skipRating: "Skip for now",
    submitRating: "Submit Rating",
    ratingLabels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"],
    yourRatingLabel: "Your Rating",
    yourFeedbackLabel: "Your Feedback",
    ratedOn: "Rated",
    noRatingYet: "Not rated yet",
    rateNow: "Rate Now",
    // Profile
    myProfile: "My Profile", editProfile: "Edit Profile", saveChanges: "Save Changes",
    fullName: "Full Name", emailAddress: "Email Address", phoneNumber: "Phone Number",
    currentPassword: "Current Password", newPassword: "New Password", confirmPassword: "Confirm Password",
    changePassword: "Change Password", uploadPhoto: "Upload Photo",
    jobsApplied: "Applied", jobsCompleted: "Completed", memberSince: "Member Since",
    profileUpdated: "Profile updated successfully!",
    logoutConfirmTitle: "Logout?", logoutConfirmMsg: "Are you sure you want to logout?",
    logoutConfirm: "Yes, Logout", stayIn: "Stay In",
  },
  ur: {
    dir: "rtl", brand: "روزگار ہب", role: "ورکر",
    navRequests: "نوکری کی درخواستیں", navApplied: "میری درخواستیں",
    navBrowse: "نوکریاں دیکھیں", navHistory: "نوکری کی تاریخ", navAvail: "دستیابی پوسٹ کریں",
    navProfile: "پروفائل",
    logout: "لاگ آؤٹ", online: "آن لائن",
    headerRequests: "آنے والی درخواستیں", headerApplied: "میری درخواستیں",
    headerBrowse: "نوکریاں دیکھیں", headerHistory: "نوکری کی تاریخ", welcomeBack: "خوش آمدید",
    waitingTitle: "نوکری کی درخواستوں کا انتظار ہے...",
    waitingDesc: "جب آپ کے علاقے میں کوئی نوکری پوسٹ ہوگی، خود بخود آجائے گی",
    incomingTitle: "نئی درخواست آ رہی ہے!", incomingDesc: "پاپ اپ میں جواب دیں",
    recentNotifs: "حالیہ اطلاعات", noApps: "ابھی کوئی درخواست نہیں",
    appliedOn: "درخواست دی", recently: "حال ہی میں", pending: "زیر التواء", shortlisted: "منتخب",
    applyNow: "ابھی درخواست دیں", applyFor: "نوکری کے لیے درخواست",
    employerListedRate: "آجر کی مقررہ شرح", yourOffer: "آپ کی پیشکش (روپے)",
    aboveRate: "مقررہ شرح سے زیادہ", belowRate: "مقررہ شرح سے کم",
    matchingRate: "آجر کی مقررہ شرح کے برابر",
    submitApp: "درخواست جمع کریں", newJobRequest: "نئی نوکری کی درخواست", employerOffer: "آجر کی پیشکش",
    acceptJob: "نوکری قبول کریں", declineJob: "رد کریں",
    counterOffer: "جوابی پیشکش", sendCounter: "بھیجیں",
    offerSent: "جوابی پیشکش بھیج دی گئی!",
    yourOfferWas: "آپ کی جوابی پیشکش:", counterReceived: "آجر کی جوابی پیشکش",
    yourOfferWasLabel: "آپ کی پیشکش تھی",
    accept: "قبول کریں", reject: "رد کریں",
    jobConfirmed: "نوکری کی تصدیق!", jobConfirmedDesc: "کام کی جگہ پر جانے کے لیے تیار ہوں",
    viewJobDetails: "نوکری ٹریک کریں",
    offerRejected: "منتخب نہیں ہوئے", offerRejectedDesc: "آجر نے دوسرا ورکر منتخب کیا",
    close: "بند کریں", dismissed: "درخواست واپس",
    dismissedDesc: "آجر نے آپ کی قبولیت رد کر دی",
    postAvailTitle: "اپنی دستیابی پوسٹ کریں",
    skillLabel: "آپ کی مہارت / پیشہ", skillPlaceholder: "مثلاً: الیکٹریشن، پلمبر، ڈرائیور",
    expLabel: "تجربے کے سال", expPlaceholder: "مثلاً: ۵ سال",
    rateLabel: "فی گھنٹہ اجرت (روپے)", ratePlaceholder: "مثلاً: ۵۰۰",
    locLabel: "آپ کا مقام", locPlaceholder: "مثلاً: کراچی، لاہور",
    descLabel: "تفصیل", descPlaceholder: "اپنی مہارتیں بیان کریں...",
    postBtn: "دستیابی پوسٹ کریں", cancelBtn: "منسوخ کریں",
    driverLicenseSection: "ڈرائیونگ لائسنس (ڈرائیوروں کے لیے ضروری)",
    driverLicenseHint: "اپنا لائسنس اپلوڈ کریں — پروفائل میں محفوظ ہو جائے گا اور پوائنٹس ملیں گے",
    uploadLicenseBtn: "لائسنس اپلوڈ کریں", licenseUploaded: "لائسنس اپلوڈ ہو گیا!",
    licenseUploading: "اپلوڈ ہو رہا ہے...", chooseLicense: "لائسنس تصویر یا PDF منتخب کریں",
    swalPosted: "پوسٹ ہو گئی!", swalPostedText: "دستیابی اپڈیٹ ہو گئی",
    swalError: "خرابی", swalErrorText: "پوسٹ کرنے میں ناکامی",
    swalSavedLocally: "مقامی طور پر محفوظ", swalSavedLocallyText: "مقامی طور پر محفوظ کیا گیا",
    swalAppSent: "درخواست بھیج دی!", swalAppSentText: "جمع ہو گئی",
    swalOops: "افسوس!", swalAlreadyApplied: "شاید پہلے ہی درخواست دے چکے ہیں",
    swalRejectCounter: "جوابی پیشکش رد کریں؟", swalRejectCounterText: "کیا آپ واقعی؟",
    swalYesReject: "ہاں، رد کریں", swalGoBack: "واپس جائیں",
    swalLogout: "لاگ آؤٹ؟", swalLogoutText: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
    swalYesLogout: "ہاں، لاگ آؤٹ", swalGreat: "بہت اچھا!", langToggle: "English",
    swalProfileUpdated: "پروفائل اپڈیٹ ہو گئی!", swalProfileUpdatedText: "آپ کی پروفائل کامیابی سے محفوظ ہو گئی۔",
    swalProfileError: "خرابی", swalProfileErrorText: "پروفائل اپڈیٹ ناکام ہوئی۔",
    swalPwChanged: "پاسورڈ تبدیل ہو گیا!", swalPwChangedText: "آپ کا پاسورڈ کامیابی سے اپڈیٹ ہو گیا۔",
    swalPwError: "خرابی", swalPwErrorText: "پاسورڈ تبدیل کرنے میں ناکامی۔",
    pwSecureSubtitle: "مضبوط پاسورڈ سے اکاؤنٹ محفوظ رکھیں",
    pwCheck1: "کم از کم 8 حروف", pwCheck2: "بڑا حرف (A-Z)",
    pwCheck3: "چھوٹا حرف (a-z)", pwCheck4: "نمبر (0-9)",
    pwCheck5: "خاص نشان (!@#$...)",
    pwWeak: "کمزور", pwFair: "ٹھیک ہے", pwStrong: "مضبوط",
    optionalCounter: "جوابی قیمت درج کریں (روپے)...",
    counterNote: "مختلف قیمت تجویز کریں",
    aiFilterPlaceholder: "مثلاً: لاہور میں الیکٹریشن، ۲۰۰۰ سے کم، فوری",
    aiFilterBtn: "AI سے تلاش کریں", aiFiltering: "نوکریاں ڈھونڈ رہے ہیں...",
    activeFilters: "فعال فلٹر", clearFilters: "صاف کریں",
    noJobsFound: "کوئی نوکری نہیں ملی", noJobsFoundSub: "مختلف تلاش کریں یا فلٹر صاف کریں",
    noHistory: "ابھی کوئی مکمل نوکری نہیں", noHistorySub: "مکمل نوکریاں یہاں دکھیں گی",
    profileProgress: "پروفائل پروگریس", profileComplete: "پروفائل مکمل! 🎉",
    completeYourProfile: "زیادہ نوکریاں پانے کے لیے پروفائل مکمل کریں",
    stepRegistered: "اکاؤنٹ رجسٹر",
    stepProfilePhoto: "پروفائل فوٹو اپلوڈ",
    stepCnicDocs: "شناختی کارڈ اپلوڈ",
    stepAvailability: "دستیابی پوسٹ",
    stepLicense: "ڈرائیونگ لائسنس اپلوڈ",
    stepVerified: "ایڈمن سے تصدیق",
    tapToComplete: "مکمل کریں",
    trackingHeader: "نوکری جاری ہے",
    notifications: "اطلاعات",
    notifSubtitle: "نوکری کی اطلاعات یہاں دکھیں گی",
    markAllRead: "سب پڑھا",
    clearAll: "سب صاف کریں",
    noNotifications: "ابھی کوئی اطلاع نہیں",
    tipProfilePhoto: "پروفائل میں جائیں ← اپنی تصویر اپلوڈ کریں",
    tipCnic: "پروفائل میں جائیں ← شناختی کارڈ کے دونوں طرف اپلوڈ کریں",
    tipAvailability: "سائیڈبار میں 'دستیابی پوسٹ کریں' پر کلک کریں",
    tipLicense: "دستیابی فارم میں اپنا ڈرائیونگ لائسنس اپلوڈ کریں",
    tipVerified: "ہماری ٹیم 24 گھنٹوں میں آپ کا اکاؤنٹ تصدیق کرے گی",
    boostTitle: "💡 زیادہ نوکریاں کیسے پائیں",
    boostSub: "یہ اقدامات مکمل کریں اور آجروں کی تلاش میں نظر آئیں",
    skillFilterOn: "آپ کی مہارت کے مطابق نوکریاں",
    skillFilterOff: "تمام نوکریاں دکھائیں",
    yourSkill: "آپ کی مہارت",
    removeFilter: "فلٹر ہٹائیں",
    appliedViaRequest: "📩 آجر کی درخواست",
    appliedViaBrowse: "📝 براؤز سے درخواست",
    agreedPriceLabel: "طے شدہ قیمت",
    yourOfferLabel: "آپ کی پیشکش",
    noAppsDesc: "آپ کی درخواستیں اور آجر کی تصدیق شدہ نوکریاں یہاں دکھیں گی",
    confirmed: "تصدیق شدہ", callEmployer: "آجر کو کال کریں",
    rateExperience: "تجربہ ریٹ کریں",
    howWasExperience: "کے ساتھ کام کیسا رہا",
    commentOptional: "تبصرہ کریں (اختیاری)",
    commentPlaceholder: "اس نوکری کے بارے میں کوئی بھی مسئلہ یا تجربہ شیئر کریں...",
    skipRating: "ابھی چھوڑیں",
    submitRating: "ریٹنگ جمع کریں",
    ratingLabels: ["", "خراب", "ٹھیک", "اچھا", "بہت اچھا", "شاندار!"],
    yourRatingLabel: "آپ کی ریٹنگ",
    yourFeedbackLabel: "آپ کا تبصرہ",
    ratedOn: "ریٹ کیا",
    noRatingYet: "ابھی ریٹنگ نہیں دی",
    rateNow: "ابھی ریٹ کریں",
    myProfile: "میری پروفائل", editProfile: "ترمیم کریں", saveChanges: "تبدیلیاں محفوظ کریں",
    fullName: "پورا نام", emailAddress: "ای میل پتہ", phoneNumber: "فون نمبر",
    currentPassword: "موجودہ پاسورڈ", newPassword: "نیا پاسورڈ", confirmPassword: "پاسورڈ کی تصدیق",
    changePassword: "پاسورڈ تبدیل کریں", uploadPhoto: "تصویر اپلوڈ کریں",
    jobsApplied: "درخواستیں", jobsCompleted: "مکمل نوکریاں", memberSince: "رکنیت",
    profileUpdated: "پروفائل کامیابی سے اپڈیٹ ہو گئی!",
    logoutConfirmTitle: "لاگ آؤٹ؟", logoutConfirmMsg: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
    logoutConfirm: "ہاں، لاگ آؤٹ کریں", stayIn: "رہیں",
  }
};

const S = {
  btn: (bg, color = "#fff", extra = {}) => ({
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "13px 20px", borderRadius: 12, border: "none",
    background: bg, color, fontFamily: "'Outfit', sans-serif",
    fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s, transform 0.15s",
    ...extra,
  }),
  label: {
    fontSize: 11.5, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 7,
  },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
    fontFamily: "'Outfit', sans-serif", outline: "none",
    boxSizing: "border-box", background: "#fafbfc", transition: "border-color 0.2s",
  },
};

/* ═══════════════ LOGOUT CONFIRM MODAL ═══════════════ */
function LogoutConfirmModal({ t, open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 360, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", animation: "slideUp .3s" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#fef2f2,#fee2e2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "2px solid #fecaca" }}>
            <LogOut size={24} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{t.logoutConfirmTitle}</h3>
          <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6 }}>{t.logoutConfirmMsg}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...S.btn("#f1f5f9", "#475569", { flex: 1, border: "1.5px solid #e2e8f0" }) }}>{t.stayIn}</button>
          <button onClick={onConfirm} style={{ ...S.btn("linear-gradient(135deg,#ef4444,#dc2626)", "#fff", { flex: 1 }) }}>
            <LogOut size={15} /> {t.logoutConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ WORKER PROFILE TAB ═══════════════ */
function WorkerProfileTab({ t, lang, user, userProfile, appliedJobs, jobHistory, onPostAvail, onProfileUpdate }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [toast, setToast] = useState("");
  const fileRef = useRef(null);

  const completedCount = (jobHistory || []).length;
  const appliedCount = (appliedJobs || []).length;
  const memberDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-PK", { month: "long", year: "numeric" })
    : "2024";

  useEffect(() => {
    if (userProfile || user) {
      setEditForm({
        name: (userProfile || user)?.name || "",
        email: (userProfile || user)?.email || "",
        phone: (userProfile || user)?.phone || "",
      });
    }
  }, [userProfile, user]);

  const showToastMsg = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API}/api/auth/update-profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(editForm),
        });
      }
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...stored, ...editForm };
      localStorage.setItem("user", JSON.stringify(updated));
      onProfileUpdate(updated);
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({ title: t.swalProfileUpdated, text: t.swalProfileUpdatedText, icon: "success", confirmButtonColor: "#16a34a", confirmButtonText: t.swalGreat });
      } else {
        showToastMsg(t.profileUpdated);
      }
    } catch (_) {
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire({ title: t.swalProfileError, text: t.swalProfileErrorText, icon: "error", confirmButtonColor: "#16a34a" });
      } else {
        showToastMsg(t.profileUpdated);
      }
    }
    setSaving(false);
  };

  const profile = userProfile || user || {};
  const docs = profile.documents || {};
  const skillRaw = (profile.category || profile.skill || profile.trade || "").toLowerCase();
  const isDriver = skillRaw.includes("driver");
  const hasProfilePhoto = !!(docs.profilePhoto || profile.profilePhoto || profile.avatar || photoPreview);
  const hasCnic = !!(docs.cnicFront && docs.cnicBack) || !!(profile.cnicVerified);
  const isEmailVerified = !!(profile.isEmailVerified || profile.emailVerified);
  const isAdminVerified = !!(profile.isVerified || profile.adminVerified);
  const isAvailPosted = !!(profile.availabilityPosted || profile.availabilityId || profile.profileProgress?.availability || profile.category);
  const hasLicense = !!(docs.drivingLicense || profile.drivingLicense);

  const progressSteps = [
    { label: t.stepRegistered, done: true, points: 10 },
    { label: lang === "ur" ? "ای میل تصدیق" : "Email Verified", done: isEmailVerified, points: 15 },
    { label: t.stepProfilePhoto, done: hasProfilePhoto, points: 20 },
    { label: t.stepCnicDocs, done: hasCnic, points: 20 },
    { label: t.stepAvailability, done: isAvailPosted, points: 15, action: onPostAvail },
    ...(isDriver ? [{ label: t.stepLicense, done: hasLicense, points: 15 }] : []),
    { label: t.stepVerified, done: isAdminVerified, points: 20 },
  ];
  const earned = progressSteps.filter(s => s.done).reduce((a, x) => a + x.points, 0);
  const total = progressSteps.reduce((a, x) => a + x.points, 0);
  const pct = Math.round((earned / total) * 100);

  const avatar = photoPreview || profile?.avatar || profile?.profilePhoto || null;
  const initials = (user?.name || "W").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const SECTIONS = [
    { id: "overview", icon: User, label: lang === "ur" ? "جائزہ" : "Overview" },
    { id: "edit", icon: Edit2, label: lang === "ur" ? "پروفائل ترمیم" : "Edit Profile" },
    { id: "security", icon: Lock, label: lang === "ur" ? "سیکیورٹی" : "Security" },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {toast && (
        <div style={{ background: "#064e3b", color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center", marginBottom: 16, animation: "slideUp .3s" }}>
          ✅ {toast}
        </div>
      )}

      {/* Hero Card */}
      <div style={{ background: "linear-gradient(135deg,#064e3b,#065f46,#047857)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(52,211,153,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(5,150,105,0.12)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", border: pct === 100 ? "3px solid #22c55e" : "3px solid rgba(255,255,255,.2)", overflow: "hidden", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{initials}</span>}
            </div>
            {pct === 100 && (
              <div title="Verified Profile — 100% Complete" style={{ position: "absolute", top: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "2.5px solid #065f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 900, boxShadow: "0 2px 8px rgba(22,163,74,.5)", zIndex: 2 }}>✓</div>
            )}
            <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "#34d399", border: "2px solid #064e3b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={13} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-.3px" }}>{user?.name || "—"}</h2>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, margin: "0 0 4px" }}>{user?.email}</p>
            {skillRaw && <p style={{ color: "#6ee7b7", fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>🔧 {skillRaw.charAt(0).toUpperCase() + skillRaw.slice(1)}</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {isAdminVerified && <span style={{ background: "rgba(52,211,153,.15)", color: "#6ee7b7", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(110,231,183,.2)" }}>✓ Verified</span>}
              <span style={{ background: "rgba(52,211,153,.1)", color: "#34d399", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(52,211,153,.2)" }}>Worker</span>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 24 }}>
          {[
            { icon: "📝", value: appliedCount, label: t.jobsApplied },
            { icon: "✅", value: completedCount, label: t.jobsCompleted },
            { icon: "📅", value: memberDate, label: t.memberSince, small: true },
          ].map((stat, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: stat.small ? 12 : 22, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Nav */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${activeSection === sec.id ? "#16a34a" : "#e2e8f0"}`, background: activeSection === sec.id ? "#f0fdf4" : "#fff", color: activeSection === sec.id ? "#15803d" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
            <sec.icon size={14} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeSection === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile Progress */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>{t.profileProgress}</h3>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{t.completeYourProfile}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: pct >= 80 ? "#16a34a" : pct >= 50 ? "#3b82f6" : "#f59e0b", lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{earned}/{total} pts</div>
              </div>
            </div>
            <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ height: "100%", borderRadius: 99, background: pct >= 80 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#f59e0b,#d97706)", width: `${pct}%`, transition: "width 1s ease-out" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {progressSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: step.done ? "#f0fdf4" : "#f8fafc", border: `1px solid ${step.done ? "#bbf7d0" : "#e2e8f0"}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? "#22c55e" : "#e2e8f0", fontSize: 11, color: step.done ? "#fff" : "#94a3b8", fontWeight: 800 }}>{step.done ? "✓" : i + 1}</div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: step.done ? 600 : 500, color: step.done ? "#15803d" : "#475569" }}>{step.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.done ? "#16a34a" : "#94a3b8", background: step.done ? "#dcfce7" : "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>+{step.points} pts</span>
                  {!step.done && step.action && (
                    <button onClick={step.action} style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", border: "none", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>
                      {t.tapToComplete} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Card */}
          {(() => {
            const workerSkills = profile?.skills || [];
            const PROF_COLOR = { beginner: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }, intermediate: { bg: "#fefce8", text: "#854d0e", border: "#fde68a" }, expert: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" } };
            return (
              <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    🛠️ {lang === "ur" ? "میری مہارتیں" : "My Skills"}
                  </h3>
                  <a href="/auth/register/worker/skills" style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textDecoration: "none", background: "#f0fdf4", padding: "4px 12px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                    {lang === "ur" ? "ترمیم" : "Edit Skills"}
                  </a>
                </div>
                {workerSkills.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", margin: "0 0 12px" }}>
                      {lang === "ur" ? "کوئی مہارت نہیں۔ ابھی شامل کریں!" : "No skills added yet."}
                    </p>
                    <a href="/auth/register/worker/skills" style={{ display: "inline-block", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 20, textDecoration: "none" }}>
                      {lang === "ur" ? "مہارتیں شامل کریں" : "Add Skills"}
                    </a>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {workerSkills.map((sk) => {
                      const c = PROF_COLOR[sk.proficiency] || PROF_COLOR.intermediate;
                      return (
                        <div key={sk.slug} style={{ display: "flex", alignItems: "center", gap: 6, background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 99, padding: "5px 14px" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{sk.name}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: c.text, opacity: 0.7, textTransform: "capitalize" }}>· {sk.proficiency}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Quick Info */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Account Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: User, label: "Full Name", value: user?.name || "—" },
                { icon: Mail, label: "Email", value: user?.email || "—" },
                { icon: Phone, label: "Phone", value: profile?.phone || user?.phone || "Not set" },
                { icon: Shield, label: "Skill / Trade", value: skillRaw ? skillRaw.charAt(0).toUpperCase() + skillRaw.slice(1) : "Not set" },
                { icon: Shield, label: "Account Status", value: isAdminVerified ? "Verified ✓" : "Pending Verification" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={15} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{item.label}</div>
                    <div style={{ fontSize: 13.5, color: "#0f172a", fontWeight: 600, marginTop: 1 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveSection("edit")} style={{ ...S.btn("linear-gradient(135deg,#22c55e,#16a34a)", "#fff", { width: "100%", marginTop: 16 }) }}>
              <Edit2 size={14} /> {t.editProfile}
            </button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE */}
      {activeSection === "edit" && (
        <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 24px" }}>{t.editProfile}</h3>
          {/* Avatar upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: "#f8fafc", borderRadius: 14, border: "1.5px solid #e2e8f0", marginBottom: 24 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", border: pct === 100 ? "3px solid #22c55e" : "2.5px solid #e2e8f0" }}>
                {avatar ? <img src={avatar} alt="dp" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{initials}</span>}
              </div>
              {pct === 100 && (
                <div title="Verified Profile" style={{ position: "absolute", bottom: 0, right: -2, width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 900, boxShadow: "0 2px 6px rgba(22,163,74,.4)" }}>✓</div>
              )}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{t.uploadPhoto}</p>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>JPG, PNG — Max 5MB</p>
              <button onClick={() => fileRef.current?.click()} style={{ ...S.btn("#f0fdf4", "#16a34a", { padding: "8px 16px", fontSize: 12, border: "1.5px solid #86efac" }) }}>
                <Camera size={13} /> Choose Photo
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={S.label}>{t.fullName}</label>
              <div style={{ position: "relative" }}>
                <User size={15} color="#94a3b8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input className="inp" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} style={{ ...S.input, paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={S.label}>{t.emailAddress}</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#94a3b8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input className="inp" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} style={{ ...S.input, paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={S.label}>{t.phoneNumber}</label>
              <div style={{ position: "relative" }}>
                <Phone size={15} color="#94a3b8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                <input className="inp" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+92 300 0000000" style={{ ...S.input, paddingLeft: 38 }} />
              </div>
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} style={{ ...S.btn("linear-gradient(135deg,#22c55e,#16a34a)", "#fff", { width: "100%", marginTop: 24, opacity: saving ? 0.7 : 1 }) }}>
            <Save size={15} /> {saving ? "Saving..." : t.saveChanges}
          </button>
        </div>
      )}

      {/* SECURITY */}
      {activeSection === "security" && (() => {
        const pw = pwForm.newPw || "";
        const pwChecks = [
          { label: t.pwCheck1, pass: pw.length >= 8 },
          { label: t.pwCheck2, pass: /[A-Z]/.test(pw) },
          { label: t.pwCheck3, pass: /[a-z]/.test(pw) },
          { label: t.pwCheck4, pass: /\d/.test(pw) },
          { label: t.pwCheck5, pass: /[^a-zA-Z0-9]/.test(pw) },
        ];
        const passedChecks = pwChecks.filter(c => c.pass).length;
        const pwStrength = pw.length === 0 ? null : passedChecks <= 2 ? "weak" : passedChecks <= 4 ? "fair" : "strong";
        const strengthColor = { weak: "#ef4444", fair: "#f59e0b", strong: "#16a34a" };
        const strengthLabel = { weak: t.pwWeak, fair: t.pwFair, strong: t.pwStrong };
        const isFormValid = pwForm.current && pw && pwForm.newPw === pwForm.confirm && passedChecks >= 4;
        return (
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Lock size={18} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{t.changePassword}</h3>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{t.pwSecureSubtitle}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { key: "current", label: t.currentPassword },
                { key: "newPw", label: t.newPassword },
                { key: "confirm", label: t.confirmPassword },
              ].map(field => (
                <div key={field.key}>
                  <label style={S.label}>{field.label}</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} color="#94a3b8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      className="inp"
                      type={showPw[field.key] ? "text" : "password"}
                      value={pwForm[field.key]}
                      onChange={e => setPwForm(p => ({ ...p, [field.key]: e.target.value }))}
                      style={{ ...S.input, paddingLeft: 38, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, [field.key]: !p[field.key] }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                      {showPw[field.key] ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                  {field.key === "newPw" && pw.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= passedChecks ? strengthColor[pwStrength] : "#e2e8f0", transition: "background .3s" }} />
                        ))}
                        <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor[pwStrength], marginLeft: 6, whiteSpace: "nowrap" }}>{strengthLabel[pwStrength]}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {pwChecks.map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                            <span style={{ fontSize: 13, color: c.pass ? "#16a34a" : "#e2e8f0", flexShrink: 0 }}>●</span>
                            <span style={{ color: c.pass ? "#16a34a" : "#94a3b8", fontWeight: c.pass ? 600 : 400 }}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8, fontWeight: 600 }}>⚠ Passwords do not match</p>
            )}
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch(`${API}/api/auth/change-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to change password");
                  if (typeof window !== "undefined" && window.Swal) {
                    window.Swal.fire({ title: t.swalPwChanged, text: t.swalPwChangedText, icon: "success", confirmButtonColor: "#16a34a", confirmButtonText: t.swalGreat });
                  }
                  setPwForm({ current: "", newPw: "", confirm: "" });
                } catch (err) {
                  if (typeof window !== "undefined" && window.Swal) {
                    window.Swal.fire({ title: t.swalPwError, text: err.message, icon: "error", confirmButtonColor: "#ef4444" });
                  }
                }
              }}
              disabled={!isFormValid}
              style={{ ...S.btn("linear-gradient(135deg,#16a34a,#059669)", "#fff", { width: "100%", marginTop: 24, opacity: !isFormValid ? 0.5 : 1 }) }}>
              <Lock size={15} /> {t.changePassword}
            </button>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════ STAR DISPLAY ═══════════════ */
function StarDisplay({ rating, size = 15 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

/* ═══════════════ RATING MODAL ═══════════════ */
function RatingModal({ t, lang, open, jobTitle, targetName, price, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  useEffect(() => { if (open) { setRating(0); setHovered(0); setComment(""); } }, [open]);
  if (!open) return null;
  const active = hovered || rating;
  const labelColor = active >= 4 ? "#16a34a" : active === 3 ? "#3b82f6" : active === 2 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 24, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", animation: "slideUp .35s ease-out" }}>
        <div style={{ background: "linear-gradient(135deg,#064e3b,#065f46)", padding: "26px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>⭐</div>
          <h3 style={{ color: "#fff", fontSize: 19, fontWeight: 800, margin: "0 0 6px" }}>{t.rateExperience}</h3>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>{jobTitle}</p>
          {price && <p style={{ color: "#6ee7b7", fontSize: 13, fontWeight: 700, margin: "4px 0 0" }}>Rs. {price}</p>}
        </div>
        <div style={{ padding: "24px 28px 28px" }}>
          <p style={{ fontSize: 14, color: "#475569", textAlign: "center", marginBottom: 20, lineHeight: 1.5 }}>
            {t.howWasExperience} <strong style={{ color: "#0f172a" }}>{targetName}</strong>?
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 38, lineHeight: 1, transform: active >= star ? "scale(1.2)" : "scale(1)", transition: "transform 0.12s ease", color: active >= star ? "#f59e0b" : "#e2e8f0" }}>
                ★
              </button>
            ))}
          </div>
          {active > 0
            ? <p style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: labelColor, marginBottom: 18 }}>{t.ratingLabels[active]}</p>
            : <div style={{ height: 34, marginBottom: 18 }} />}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8 }}>{t.commentOptional}</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={t.commentPlaceholder} rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#0f172a", lineHeight: 1.5 }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onSkip} style={{ flex: 1, padding: "13px", borderRadius: 13, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.skipRating}</button>
            <button onClick={() => onSubmit(rating, comment.trim())} disabled={rating === 0}
              style={{ flex: 2, padding: "13px", borderRadius: 13, border: "none", background: rating > 0 ? "linear-gradient(135deg,#16a34a,#059669)" : "#e2e8f0", color: rating > 0 ? "#fff" : "#94a3b8", fontSize: 14, fontWeight: 800, cursor: rating > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              {t.submitRating}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ NOTIFICATION BELL ═══════════════ */
function NotificationBell({ notifications, setNotifications, t }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;
  const markAllRead = (e) => { e.stopPropagation(); setReadIds(new Set(notifications.map(n => n.id))); };
  const clearAll = (e) => { e.stopPropagation(); setNotifications([]); setReadIds(new Set()); setOpen(false); };
  const notifIcon = (msg) => {
    if (msg.includes("confirmed") || msg.includes("accepted") || msg.includes("✅")) return { icon: "✅", bg: "#dcfce7" };
    if (msg.includes("offer") || msg.includes("counter")) return { icon: "💬", bg: "#eff6ff" };
    if (msg.includes("job") || msg.includes("New") || msg.includes("📩")) return { icon: "📩", bg: "#fef3c7" };
    return { icon: "🔔", bg: "#f1f5f9" };
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: open ? "#dcfce7" : "rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 20, cursor: "pointer", border: open ? "1.5px solid #86efac" : "1.5px solid transparent", transition: "all .15s", position: "relative" }}>
        <Bell size={16} color={unreadCount > 0 ? "#34d399" : "rgba(255,255,255,0.6)"} />
        {unreadCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, padding: "0 4px", background: "#ef4444", borderRadius: "99px", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, boxShadow: "0 0 0 2px #065f46" }}>{unreadCount > 9 ? "9+" : unreadCount}</div>}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 320, background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: "1.5px solid #e2e8f0", zIndex: 999, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#064e3b,#065f46)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.notifications}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{t.notifSubtitle}</div></div>
            {notifications.length > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: "#6ee7b7", background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, padding: "4px 9px", cursor: "pointer", fontWeight: 600 }}>{t.markAllRead}</button>}
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div><p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{t.noNotifications}</p><p style={{ fontSize: 12, color: "#94a3b8" }}>{t.notifSubtitle}</p></div>
            ) : notifications.slice().reverse().map((n, i) => {
              const isRead = readIds.has(n.id);
              const { icon, bg } = notifIcon(n.msg);
              return (
                <div key={n.id} onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                  style={{ padding: "12px 16px", borderBottom: i < notifications.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", alignItems: "flex-start", gap: 10, background: isRead ? "#fff" : "#f8fff8", cursor: "pointer" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: "#0f172a", fontWeight: isRead ? 400 : 600, lineHeight: 1.45, margin: 0 }}>{n.msg}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>Just now</p>
                  </div>
                  {!isRead && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", flexShrink: 0, marginTop: 4 }} />}
                </div>
              );
            })}
          </div>
          {notifications.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center" }}>
              <button onClick={clearAll} style={{ fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontWeight: 600 }}>{t.clearAll}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN DASHBOARD ═══════════════ */
export default function WorkerDashboard() {
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [incomingRequest, setIncomingRequest] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTimer, setPopupTimer] = useState(30);
  const timerRef = useRef(null);
  const [popupState, setPopupState] = useState(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [employerCounter, setEmployerCounter] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  const activeRequestRef = useRef(null);

  const [confirmedJob, setConfirmedJob] = useState(null);
  const [showTracker, setShowTracker] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [offeredRate, setOfferedRate] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);

  const [showAvailModal, setShowAvailModal] = useState(false);
  const [availability, setAvailability] = useState({ skill: "", experience: "", hourlyRate: "", location: "", description: "", status: "available" });
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingJobInfo, setRatingJobInfo] = useState(null);

  const swal = (opts) => typeof window !== "undefined" && window.Swal && window.Swal.fire(opts);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = "Your active session will be lost if you reload."; return e.returnValue; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    if (document.getElementById("swal-cdn")) return;
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css"; document.head.appendChild(link);
    const script = document.createElement("script"); script.id = "swal-cdn"; script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11"; document.head.appendChild(script);
  }, []);

  const refetchProfile = (token) => {
    const tk = token || localStorage.getItem("token");
    if (!tk) return;
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.json())
      .then(d => {
        const fresh = d.data || d.user;
        if (fresh) {
          setUserProfile(fresh);
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({ ...stored, ...fresh }));
        }
      }).catch(() => {});
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const u = JSON.parse(stored);
    setUser(u);
    if (u?.id && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/worker/profile/${u.id}`);
    }
    socket.emit("join", u.id);
    socket.emit("worker_online", { workerId: u.id, name: u.name });
    const token = localStorage.getItem("token");
    if (token) refetchProfile(token); else setUserProfile(u);
    fetch(`${API}/api/applications/${u.id}`).then(r => r.json()).then(setAppliedJobs).catch(() => {});
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}/api/job-requests/worker/${u.id}`, { headers })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const accepted = data.filter(r => ["accepted", "confirmed", "in_progress", "completed"].includes(r.status));
        setAppliedJobs(prev => {
          const ids = new Set(prev.map(x => x._id));
          const merged = [...prev];
          accepted.forEach(r => {
            if (!ids.has(r._id)) merged.push({ _id: r._id, job: { title: r.jobTitle || r.title || r.category, workLocation: r.workLocation || r.location }, status: r.status, offeredRate: r.agreedPrice || r.offeredPrice, agreedPrice: r.agreedPrice || r.offeredPrice, createdAt: r.createdAt, source: "request", employerName: r.employerName, employerPhone: r.employerPhone || "" });
          });
          return merged;
        });
        const completed = data.filter(r => r.status === "completed");
        setJobHistory(completed.map(r => {
          const review = getStoredReview(r._id);
          return { _id: r._id, title: r.jobTitle || r.title || r.category || "Job", workLocation: r.workLocation || r.location || "", employerName: r.employerName || "", agreedPrice: r.agreedPrice || r.offeredPrice || "", completedAt: r.updatedAt || r.createdAt, myRating: review.workerRating || 0, myComment: review.workerComment || "" };
        }));
      }).catch(() => {});
  }, []);

  useEffect(() => {
    socket.on("new_job_request", (data) => {
      if (showTracker) return;
      const reqId = data.requestId || data._id || `req_${Date.now()}`;
      const normalized = { ...data, requestId: reqId };
      setPendingRequests(prev => {
        if (prev.some(r => r.requestId === reqId)) return prev;
        return [{ ...normalized, cardState: null, cardCounter: data.offeredPrice || "", cardEmployerCounter: null }, ...prev];
      });
      setIncomingRequest(normalized);
      addNotif(`📩 New job: ${data.title || data.category}`);
    });
    socket.on("employer_confirm_worker", (data) => {
      const req = activeRequestRef.current;
      if (req) {
        const finalPrice = data.finalPrice || req.cardCounter || req.offeredPrice;
        setPendingRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, cardState: "confirmed" } : r));
        setConfirmedJob({ request: req, price: finalPrice });
        setAppliedJobs(prev => {
          const exists = prev.some(a => a._id === req.requestId);
          if (exists) return prev.map(a => a._id === req.requestId ? { ...a, status: "confirmed", agreedPrice: finalPrice } : a);
          return [{ _id: req.requestId, job: { title: req.title || req.category, workLocation: req.workLocation }, status: "confirmed", offeredRate: finalPrice, agreedPrice: finalPrice, createdAt: new Date().toISOString(), source: "request", employerName: req.employerName, employerPhone: req.employerPhone || "" }, ...prev];
        });
      }
      addNotif("✅ You have been confirmed for the job!");
    });
    socket.on("employer_accepted", () => {
      const req = activeRequestRef.current;
      if (req) {
        const finalPrice = req.cardCounter || req.offeredPrice;
        setPendingRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, cardState: "confirmed" } : r));
        setConfirmedJob({ request: req, price: finalPrice });
        setAppliedJobs(prev => {
          const exists = prev.some(a => a._id === req.requestId);
          if (exists) return prev.map(a => a._id === req.requestId ? { ...a, status: "confirmed", agreedPrice: finalPrice } : a);
          return [{ _id: req.requestId, job: { title: req.title || req.category, workLocation: req.workLocation }, status: "confirmed", offeredRate: finalPrice, agreedPrice: finalPrice, createdAt: new Date().toISOString(), source: "request", employerName: req.employerName, employerPhone: req.employerPhone || "" }, ...prev];
        });
      }
      addNotif("✅ Your offer was accepted!");
    });
    socket.on("request_taken_not_selected", () => {
      const req = activeRequestRef.current;
      if (req) setPendingRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, cardState: "rejected" } : r));
    });
    socket.on("employer_rejected", () => {
      const req = activeRequestRef.current;
      if (req) setPendingRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, cardState: "rejected" } : r));
    });
    socket.on("employer_counter", (data) => {
      const req = activeRequestRef.current;
      if (req) setPendingRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, cardState: "counter_received", cardEmployerCounter: data } : r));
      addNotif(`💬 Employer sent a counter offer: Rs. ${data.price}`);
    });
    socket.on("employer_dismiss_worker", () => {
      const req = activeRequestRef.current;
      if (req) setPendingRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, cardState: "dismissed" } : r));
      addNotif("Request was dismissed by employer");
    });
    return () => { socket.off("new_job_request"); socket.off("employer_confirm_worker"); socket.off("employer_accepted"); socket.off("request_taken_not_selected"); socket.off("employer_rejected"); socket.off("employer_counter"); socket.off("employer_dismiss_worker"); };
  }, [showTracker]);

  useEffect(() => {
    if (showPopup && popupState === null) {
      setPopupTimer(30);
      timerRef.current = setInterval(() => setPopupTimer(prev => { if (prev <= 1) { clearInterval(timerRef.current); dismissPopup(); return 0; } return prev - 1; }), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [showPopup, popupState]);

  const addNotif = (msg) => setNotifications(p => [...p, { id: Date.now() + Math.random(), msg }]);
  const dismissPopup = () => { setShowPopup(false); setPopupState(null); setCounterPrice(""); setEmployerCounter(null); };
  const openTracker = () => { setShowPopup(false); setShowTracker(true); setPopupState(null); };

  const handleCardAccept = (request) => {
    activeRequestRef.current = request;
    setIncomingRequest(request);
    socket.emit("worker_job_accept", { requestId: request.requestId, employerId: request.employerId, workerId: user.id, workerName: user.name, workerRating: "4.8", workerPhone: user.phone || "", workerPhoto: userProfile?.documents?.profilePhoto || null });
    setPendingRequests(prev => prev.map(r => r.requestId === request.requestId ? { ...r, cardState: "accepted_waiting" } : r));
  };
  const handleCardDecline = (request) => {
    socket.emit("worker_job_decline", { requestId: request.requestId, workerId: user.id });
    setPendingRequests(prev => prev.filter(r => r.requestId !== request.requestId));
  };
  const handleCardShowCounter = (requestId) => {
    setPendingRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, cardState: "counter_input" } : r));
  };
  const handleCardCounterChange = (requestId, value) => {
    setPendingRequests(prev => prev.map(r => r.requestId === requestId ? { ...r, cardCounter: value } : r));
  };
  const handleCardSendCounter = (request) => {
    if (!request.cardCounter) { swal({ title: "Enter a price", icon: "warning" }); return; }
    activeRequestRef.current = request;
    setIncomingRequest(request);
    socket.emit("worker_offer", { requestId: request.requestId, employerId: request.employerId, workerId: user.id, workerName: user.name, price: request.cardCounter, rating: "4.8", phone: user.phone, workerPhoto: userProfile?.documents?.profilePhoto || null });
    setPendingRequests(prev => prev.map(r => r.requestId === request.requestId ? { ...r, cardState: "counter_sent" } : r));
  };
  const handleCardAcceptCounter = (request) => {
    socket.emit("worker_accepted", { requestId: request.requestId, employerId: request.employerId, workerId: user.id, workerName: user.name, price: request.cardEmployerCounter.price, phone: user.phone });
    setConfirmedJob({ request, price: request.cardEmployerCounter.price });
    setPendingRequests(prev => prev.map(r => r.requestId === request.requestId ? { ...r, cardState: "confirmed" } : r));
  };
  const handleCardRejectCounter = (request) => {
    swal({ title: t.swalRejectCounter, text: t.swalRejectCounterText, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280", confirmButtonText: t.swalYesReject, cancelButtonText: t.swalGoBack })
      .then(res => { if (res.isConfirmed) { socket.emit("worker_rejected_counter", { requestId: request.requestId, employerId: request.employerId, workerId: user.id }); setPendingRequests(prev => prev.filter(r => r.requestId !== request.requestId)); } });
  };
  const handleCardDismiss = (requestId) => {
    setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
  };

  const getStoredReview = (jobId) => { try { return JSON.parse(localStorage.getItem(`job_review_${jobId}`) || "{}"); } catch { return {}; } };
  const saveWorkerReview = (jobId, rating, comment) => {
    try {
      const existing = getStoredReview(jobId);
      localStorage.setItem(`job_review_${jobId}`, JSON.stringify({ ...existing, workerRating: rating, workerComment: comment, workerRatedAt: new Date().toISOString() }));
    } catch (e) { console.error(e); }
  };

  const handleTrackerComplete = () => {
    if (confirmedJob) {
      const jobId = confirmedJob.request?.requestId || Date.now().toString();
      const entry = { _id: jobId, title: confirmedJob.request?.title || confirmedJob.request?.category || "Job", workLocation: confirmedJob.request?.workLocation || "", employerName: confirmedJob.request?.employerName || "", agreedPrice: confirmedJob.price || "", completedAt: new Date().toISOString(), myRating: 0, myComment: "" };
      setJobHistory(prev => [entry, ...prev]);
      setAppliedJobs(prev => prev.map(a => a._id === confirmedJob.request?.requestId ? { ...a, status: "completed" } : a));
      setRatingJobInfo({ jobId, jobTitle: entry.title, employerName: entry.employerName, price: confirmedJob.price });
      setShowRatingModal(true);
    } else finishClose();
  };

  const handleRatingSubmit = (rating, comment) => {
    if (ratingJobInfo && rating > 0) { saveWorkerReview(ratingJobInfo.jobId, rating, comment); setJobHistory(prev => prev.map(j => j._id === ratingJobInfo.jobId ? { ...j, myRating: rating, myComment: comment } : j)); }
    finishClose();
  };

  const handleRatingSkip = () => finishClose();
  const finishClose = () => { setShowRatingModal(false); setRatingJobInfo(null); setShowTracker(false); setConfirmedJob(null); setIncomingRequest(null); };
  const handleReRate = (job) => { setRatingJobInfo({ jobId: job._id, jobTitle: job.title, employerName: job.employerName, price: job.agreedPrice }); setShowRatingModal(true); };

  const handleAcceptJob = () => { socket.emit("worker_job_accept", { requestId: incomingRequest.requestId, employerId: incomingRequest.employerId, workerId: user.id, workerName: user.name, workerRating: "4.8", workerPhone: user.phone || "", workerPhoto: userProfile?.documents?.profilePhoto || null }); setPopupState("accepted_waiting"); };
  const handleDeclineJob = () => { socket.emit("worker_job_decline", { requestId: incomingRequest.requestId, workerId: user.id }); dismissPopup(); setIncomingRequest(null); };
  const handleSendCounter = () => { if (!counterPrice) { swal({ title: "Enter a price", icon: "warning" }); return; } socket.emit("worker_offer", { requestId: incomingRequest.requestId, employerId: incomingRequest.employerId, workerId: user.id, workerName: user.name, price: counterPrice, rating: "4.8", phone: user.phone, workerPhoto: userProfile?.documents?.profilePhoto || null }); setPopupState("counter_sent"); };
  const handleAcceptEmployerCounter = () => { socket.emit("worker_accepted", { requestId: incomingRequest.requestId, employerId: incomingRequest.employerId, workerId: user.id, workerName: user.name, price: employerCounter.price, phone: user.phone, workerPhoto: userProfile?.documents?.profilePhoto || null }); setConfirmedJob({ request: incomingRequest, price: employerCounter.price }); setPopupState("confirmed"); };
  const handleRejectEmployerCounter = () => { swal({ title: t.swalRejectCounter, text: t.swalRejectCounterText, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280", confirmButtonText: t.swalYesReject, cancelButtonText: t.swalGoBack }).then(r => { if (r.isConfirmed) { socket.emit("worker_rejected_counter", { requestId: incomingRequest.requestId, employerId: incomingRequest.employerId, workerId: user.id }); dismissPopup(); setIncomingRequest(null); } }); };

  const uploadLicenseToBackend = async (file) => {
    if (!file) return false;
    const token = localStorage.getItem("token");
    if (!token) { swal({ title: "Login required", icon: "warning" }); return false; }
    setLicenseUploading(true);
    try {
      const fd = new FormData(); fd.append("drivingLicense", file);
      const res = await fetch(`${API}/api/auth/upload-driver-license`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) { setLicenseUploaded(true); refetchProfile(token); return true; }
      else { swal({ title: "Upload failed", text: data.error || "Try again", icon: "error" }); return false; }
    } catch (err) { swal({ title: "Upload error", text: err.message, icon: "error" }); return false; }
    finally { setLicenseUploading(false); }
  };

  const handlePostAvailability = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const isDriver = availability.skill.toLowerCase().includes("driver");
    if (isDriver && !licenseUploaded && licenseFile) await uploadLicenseToBackend(licenseFile);
    try {
      const res = await fetch(`${API}/api/workers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...availability, worker: user.id }) });
      setShowAvailModal(false);
      if (token) {
        try { await fetch(`${API}/api/auth/update-profile`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ availabilityPosted: true }) }); } catch (_) {}
        refetchProfile(token);
      } else setUserProfile(prev => prev ? { ...prev, availabilityPosted: true } : prev);
      if (res.ok) swal({ title: t.swalPosted, text: t.swalPostedText, icon: "success" });
      else swal({ title: t.swalError, text: t.swalErrorText, icon: "error" });
    } catch (_) { setShowAvailModal(false); setUserProfile(prev => prev ? { ...prev, availabilityPosted: true } : prev); swal({ title: t.swalSavedLocally, text: t.swalSavedLocallyText, icon: "info" }); }
  };

  const handleApplyJob = async (jobId, rate) => {
    const res = await fetch(`${API}/api/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job: jobId, worker: user.id, offeredRate: rate }) });
    const data = await res.json();
    if (!res.ok) { swal({ title: t.swalOops, text: data.error || t.swalAlreadyApplied, icon: "error" }); return; }
    setShowApplyModal(false);
    swal({ title: t.swalAppSent, html: `<strong>Rs. ${rate}</strong> — ${t.swalAppSentText}`, icon: "success" });
  };

  const handleLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); window.location.href = "/"; };

  const handleProfileUpdate = (updatedUser) => { setUser(updatedUser); };

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#064e3b,#065f46)" }}>
      <div style={{ width: 56, height: 56, border: "4px solid #34d399", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isDriverSkill = availability.skill.toLowerCase().includes("driver");
  const mergedProfile = userProfile || user;
  const headerTitle = showTracker ? t.trackingHeader : activeTab === "requests" ? t.headerRequests : activeTab === "applied" ? t.headerApplied : activeTab === "history" ? t.headerHistory : activeTab === "profile" ? t.myProfile : t.headerBrowse;

  const avatar = mergedProfile?.avatar || mergedProfile?.profilePhoto || null;
  const initials = (user.name || "W").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const pendingRequestCount = pendingRequests.filter(r => !["confirmed", "rejected", "dismissed"].includes(r.cardState)).length;
  const NAV = [
    { id: "requests", icon: Bell, label: t.navRequests, badge: pendingRequestCount },
    { id: "applied", icon: CheckCircle, label: t.navApplied },
    { id: "history", icon: Briefcase, label: t.navHistory },
    { id: "browse", icon: Search, label: t.navBrowse },
    { id: "profile", icon: User, label: t.navProfile },
  ];

  return (
    <div dir={t.dir} style={{ minHeight: "100vh", display: "flex", background: "#f0f4f8", fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu',serif" : "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        .inp:focus{border-color:#16a34a!important;background:#fff!important;box-shadow:0 0 0 3px rgba(22,163,74,.12)}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}
        .nav-btn:hover{background:rgba(255,255,255,.08)!important}
      `}</style>

      <RatingModal t={t} lang={lang} open={showRatingModal} jobTitle={ratingJobInfo?.jobTitle || ""} targetName={ratingJobInfo?.employerName || (lang === "ur" ? "آجر" : "Employer")} price={ratingJobInfo?.price} onSubmit={handleRatingSubmit} onSkip={handleRatingSkip} />
      <LogoutConfirmModal t={t} open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />


      {showApplyModal && selectedJob && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", maxHeight: "88vh", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div><p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>{t.applyFor}</p><h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "6px 0 0" }}>{selectedJob.title}</h3></div>
              <button onClick={() => setShowApplyModal(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer" }}><X size={18} color="#fff" /></button>
            </div>
            <div style={{ padding: 28, overflowY: "auto", flex: 1 }}>
              <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>{t.employerListedRate}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Rs. {String(selectedJob.salary).replace(/^Rs\.\s*/i, "")}</span>
              </div>
              {selectedJob.location && <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><MapPin size={15} color="#3b82f6" /><span style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>{selectedJob.location}</span></div>}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{t.yourOffer}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setOfferedRate(p => String(Math.max(0, Number(p) - 100)))} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: "#f1f5f9", fontSize: 22, fontWeight: 700, cursor: "pointer" }}>−</button>
                  <input type="number" value={offeredRate} onChange={e => setOfferedRate(e.target.value)} style={{ width: 130, textAlign: "center", border: "2px solid #16a34a", borderRadius: 12, padding: "10px 0", fontSize: 22, fontWeight: 800, color: "#0f172a", outline: "none" }} />
                  <button onClick={() => setOfferedRate(p => String(Number(p) + 100))} style={{ width: 42, height: 42, borderRadius: 10, border: "none", background: "#f1f5f9", fontSize: 22, fontWeight: 700, cursor: "pointer" }}>+</button>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{Number(offeredRate) > Number(selectedJob.salary) ? `Rs. ${Number(offeredRate) - Number(selectedJob.salary)} ${t.aboveRate}` : Number(offeredRate) < Number(selectedJob.salary) ? `Rs. ${Number(selectedJob.salary) - Number(offeredRate)} ${t.belowRate}` : t.matchingRate}</p>
              </div>
              <button onClick={() => handleApplyJob(selectedJob._id, offeredRate)} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>{t.submitApp}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FIXED SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 72,
        background: "linear-gradient(180deg,#064e3b 0%,#065f46 60%,#047857 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(.4,0,.2,1)",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: t.dir === "rtl" ? "auto" : 0,
        right: t.dir === "rtl" ? 0 : "auto",
        height: "100vh",
        zIndex: 100,
        overflow: "hidden",
        boxShadow: "2px 0 18px rgba(0,0,0,.18)",
      }}>
        {/* Brand */}
        <div style={{ padding: "20px 16px 14px", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          {sidebarOpen && (
            <div style={{ animation: "fadeIn .25s" }}>
              <div style={{ fontSize: 18, fontWeight: 900, background: "linear-gradient(90deg,#34d399,#6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.brand}</div>
              <div style={{ fontSize: 9, opacity: 0.4, marginTop: 2, color: "#94a3b8", letterSpacing: ".12em" }}>{t.role}</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: 7, borderRadius: 8, cursor: "pointer", display: "flex", flexShrink: 0 }}>
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "hidden" }}>
          {NAV.map(item => (
            <button key={item.id} className="nav-btn"
              onClick={() => { setActiveTab(item.id); setShowTracker(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarOpen ? "11px 13px" : "11px", borderRadius: 10, border: "none", cursor: "pointer", background: activeTab === item.id && !showTracker ? "rgba(52,211,153,0.18)" : "transparent", color: activeTab === item.id && !showTracker ? "#34d399" : "rgba(255,255,255,0.55)", fontWeight: activeTab === item.id && !showTracker ? 700 : 400, fontSize: 13.5, transition: "all 0.18s", justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu',serif" : "'Outfit',sans-serif", position: "relative" }}>
              <item.icon size={17} />
              {item.badge > 0 && (
                <div style={{ position: "absolute", top: 4, right: sidebarOpen ? 10 : 4, minWidth: 18, height: 18, borderRadius: 99, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", lineHeight: 1 }}>
                  {item.badge}
                </div>
              )}
              {sidebarOpen && <span style={{ animation: "fadeIn .2s" }}>{item.label}</span>}
              {activeTab === item.id && !showTracker && <div style={{ position: "absolute", left: t.dir === "rtl" ? "auto" : 0, right: t.dir === "rtl" ? 0 : "auto", top: "18%", bottom: "18%", width: 3, borderRadius: 99, background: "#34d399" }} />}
            </button>
          ))}
          <button onClick={() => setShowAvailModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarOpen ? "11px 13px" : "11px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(251,146,60,0.18)", color: "#fb923c", fontWeight: 600, fontSize: 13, marginTop: 6, justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu',serif" : "'Outfit',sans-serif" }}>
            <PlusCircle size={17} />
            {sidebarOpen && <span style={{ animation: "fadeIn .2s" }}>{t.navAvail}</span>}
          </button>
          {confirmedJob && !showTracker && (
            <button onClick={() => setShowTracker(true)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: sidebarOpen ? "11px 13px" : "11px", borderRadius: 10, border: "2px solid rgba(34,197,94,0.45)", cursor: "pointer", background: "rgba(34,197,94,0.15)", color: "#34d399", fontWeight: 700, fontSize: 13, marginTop: 6, justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", animation: "pulse 2s infinite" }}>
              🔧{sidebarOpen && <span style={{ animation: "fadeIn .2s" }}>{t.trackingHeader}</span>}
            </button>
          )}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "8px 8px 12px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          {/* Profile Button */}
          <button
            onClick={() => { setActiveTab("profile"); setShowTracker(false); }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: 10, border: "none", cursor: "pointer", width: "100%", background: activeTab === "profile" ? "rgba(52,211,153,.15)" : "rgba(255,255,255,.04)", marginBottom: 4, justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", transition: "background .15s" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, overflow: "hidden", border: "2px solid rgba(255,255,255,.12)" }}>
              {avatar ? <img src={avatar} alt="dp" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff" }}>{initials}</span>}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: "hidden", textAlign: t.dir === "rtl" ? "right" : "left", animation: "fadeIn .25s" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
              </div>
            )}
          </button>

          {/* Logout */}
          <button onClick={() => setShowLogoutConfirm(true)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px", borderRadius: 10, border: "none", cursor: "pointer", width: "100%", background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 12.5, fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu',serif" : "'Outfit',sans-serif", justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", transition: "background .15s" }}>
            <LogOut size={15} />
            {sidebarOpen && <span style={{ animation: "fadeIn .2s" }}>{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN (offset for fixed sidebar) ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: t.dir === "rtl" ? 0 : (sidebarOpen ? 240 : 72),
        marginRight: t.dir === "rtl" ? (sidebarOpen ? 240 : 72) : 0,
        transition: "margin .28s cubic-bezier(.4,0,.2,1)",
        minWidth: 0,
      }}>
        {/* Header */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "#f1f5f9", border: "none", borderRadius: 9, padding: 8, cursor: "pointer", display: "flex" }}>
              <Menu size={17} color="#475569" />
            </button>
            <div style={{ textAlign: t.dir === "rtl" ? "right" : "left" }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{headerTitle}</h1>
              <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0" }}>{t.welcomeBack}, {user.name}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setLang(l => l === "en" ? "ur" : "en")} style={{ padding: "6px 16px", borderRadius: 20, border: "2px solid #16a34a", background: "#fff", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: lang === "en" ? "'Noto Nastaliq Urdu',serif" : "'Outfit',sans-serif" }}>{t.langToggle}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", padding: "6px 14px", borderRadius: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>{t.online}</span>
            </div>
            <NotificationBell notifications={notifications} setNotifications={setNotifications} t={t} />
          </div>
        </header>

        {/* Main scroll area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {showTracker && confirmedJob && (
            <JobTracker role="worker"
              job={{ requestId: confirmedJob.request?.requestId, title: confirmedJob.request?.title, category: confirmedJob.request?.category, workLocation: confirmedJob.request?.workLocation, lat: confirmedJob.request?.lat, lng: confirmedJob.request?.lng }}
              worker={{ workerId: user?.id, workerName: user?.name, workerPhone: user?.phone }}
              employer={{ employerId: confirmedJob.request?.employerId, employerName: confirmedJob.request?.employerName }}
              agreedPrice={confirmedJob.price} socket={socket} onJobComplete={handleTrackerComplete} lang={lang} t={t} />
          )}
          {!showTracker && activeTab === "requests" && <RequestsTab t={t} lang={lang} notifications={notifications} pendingRequests={pendingRequests} userProfile={mergedProfile} onPostAvail={() => setShowAvailModal(true)} onCardAccept={handleCardAccept} onCardDecline={handleCardDecline} onCardShowCounter={handleCardShowCounter} onCardCounterChange={handleCardCounterChange} onCardSendCounter={handleCardSendCounter} onCardAcceptCounter={handleCardAcceptCounter} onCardRejectCounter={handleCardRejectCounter} onCardDismiss={handleCardDismiss} onOpenTracker={() => setShowTracker(true)} />}
          {!showTracker && activeTab === "applied" && <AppliedTab t={t} applied={appliedJobs} lang={lang} userProfile={mergedProfile} onPostAvail={() => setShowAvailModal(true)} />}
          {!showTracker && activeTab === "history" && <HistoryTab t={t} history={jobHistory} lang={lang} userProfile={mergedProfile} onPostAvail={() => setShowAvailModal(true)} onReRate={handleReRate} />}
          {!showTracker && activeTab === "browse" && <BrowseTab t={t} lang={lang} userId={user.id} userProfile={mergedProfile} onPostAvail={() => setShowAvailModal(true)} onOpenApplyModal={(job) => { setSelectedJob(job); setOfferedRate(String(job.salary || "")); setShowApplyModal(true); }} />}
          {!showTracker && activeTab === "profile" && <WorkerProfileTab t={t} lang={lang} user={user} userProfile={userProfile} appliedJobs={appliedJobs} jobHistory={jobHistory} onPostAvail={() => setShowAvailModal(true)} onProfileUpdate={handleProfileUpdate} />}
        </main>
      </div>

      {/* Availability Modal */}
      {showAvailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t.postAvailTitle}</h3>
              <button onClick={() => setShowAvailModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}><X size={18} /></button>
            </div>
            <form onSubmit={handlePostAvailability} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[{ key: "skill", label: t.skillLabel, placeholder: t.skillPlaceholder }, { key: "experience", label: t.expLabel, placeholder: t.expPlaceholder }, { key: "hourlyRate", label: t.rateLabel, placeholder: t.ratePlaceholder }, { key: "location", label: t.locLabel, placeholder: t.locPlaceholder }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input required value={availability[f.key]} onChange={e => setAvailability({ ...availability, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{t.descLabel}</label>
                <textarea required value={availability.description} onChange={e => setAvailability({ ...availability, description: e.target.value })} rows={3} placeholder={t.descPlaceholder} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              {isDriverSkill && (
                <div style={{ background: "#f0f9ff", borderRadius: 14, padding: 18, border: "2px solid #bae6fd" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Car size={18} color="#0369a1" /><span style={{ fontSize: 14, fontWeight: 700, color: "#0369a1" }}>{t.driverLicenseSection}</span></div>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14, marginTop: 0 }}>{t.driverLicenseHint}</p>
                  {licenseUploaded ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#dcfce7", borderRadius: 10, border: "1.5px solid #86efac" }}><CheckCircle size={16} color="#16a34a" /><span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{t.licenseUploaded}</span></div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#fff", border: "2px dashed #7dd3fc", borderRadius: 10, cursor: "pointer" }}>
                        <Upload size={16} color="#0369a1" />
                        <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 600 }}>{licenseFile ? licenseFile.name : t.chooseLicense}</span>
                        <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setLicenseFile(f); }} />
                      </label>
                      {licenseFile && (
                        <button type="button" disabled={licenseUploading} onClick={() => uploadLicenseToBackend(licenseFile)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 10, border: "none", background: licenseUploading ? "#e2e8f0" : "linear-gradient(135deg,#0369a1,#0284c7)", color: licenseUploading ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 13, cursor: licenseUploading ? "not-allowed" : "pointer" }}>
                          {licenseUploading ? <><div style={{ width: 14, height: 14, border: "2px solid #94a3b8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />{t.licenseUploading}</> : <><Upload size={14} />{t.uploadLicenseBtn}</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: 14, background: "linear-gradient(135deg,#16a34a,#059669)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{t.postBtn}</button>
                <button type="button" onClick={() => setShowAvailModal(false)} style={{ padding: "14px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontSize: 14, cursor: "pointer" }}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ PROFILE PROGRESS (for non-profile tabs) ═══════════════ */
function ProfileProgress({ t, userProfile, onPostAvail }) {
  const [showTips, setShowTips] = useState(false);
  const profile = userProfile || {};
  if (!profile._id && !profile.id && !profile.name) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, marginBottom: 20, border: "1.5px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><div style={{ height: 16, width: 150, background: "#f1f5f9", borderRadius: 8, marginBottom: 6 }} /><div style={{ height: 12, width: 220, background: "#f1f5f9", borderRadius: 8 }} /></div>
          <div style={{ height: 28, width: 52, background: "#f1f5f9", borderRadius: 8 }} />
        </div>
        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 99, marginBottom: 18 }} />
        {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 50, background: "#f8fafc", borderRadius: 12, border: "1.5px solid #e2e8f0", marginBottom: 10 }} />)}
      </div>
    );
  }
  const docs = profile.documents || {};
  const skillRaw = (profile.category || profile.skill || profile.trade || "").toLowerCase();
  const isDriver = skillRaw.includes("driver");
  const hasProfilePhoto = !!(docs.profilePhoto || profile.profilePhoto || profile.avatar);
  const hasCnicFront = !!(docs.cnicFront || profile.cnicFront);
  const hasCnicBack = !!(docs.cnicBack || profile.cnicBack);
  const hasCnic = !!((hasCnicFront && hasCnicBack) || profile.cnicVerified);
  const hasLicense = !!(docs.drivingLicense || profile.drivingLicense || profile.licenseVerified);
  const isAvailPosted = !!(profile.availabilityPosted || profile.availabilityId || profile.profileProgress?.availability || profile.category);
  const hasFirstJob = !!(profile.firstJobAccepted || profile.firstJobCompleted || profile.jobsCompleted > 0);
  const isAdminVerified = !!(profile.isVerified || profile.adminVerified);
  const steps = [
    { key: "registered", label: t.stepRegistered, done: true, points: 10, tip: null },
    { key: "profilePhoto", label: t.stepProfilePhoto, done: hasProfilePhoto, points: 20, tip: t.tipProfilePhoto },
    { key: "cnicDocs", label: t.stepCnicDocs, done: hasCnic, points: 20, tip: t.tipCnic },
    { key: "availability", label: t.stepAvailability, done: isAvailPosted, points: 15, action: onPostAvail, tip: t.tipAvailability },
    ...(isDriver ? [{ key: "license", label: t.stepLicense, done: hasLicense, points: 15, tip: t.tipLicense }] : []),
    { key: "firstJob", label: t.dir === "rtl" ? "پہلی نوکری مکمل" : "First Job Completed", done: hasFirstJob, points: 15, tip: t.dir === "rtl" ? "جب آپ پہلی نوکری مکمل کریں پوائنٹس خود ملیں گے" : "Accept and complete your first job" },
    { key: "verified", label: t.stepVerified, done: isAdminVerified, points: 20, tip: t.tipVerified },
  ];
  const totalPoints = steps.reduce((s, x) => s + x.points, 0);
  const earnedPoints = steps.filter(s => s.done).reduce((s, x) => s + x.points, 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  const isComplete = percentage === 100;
  const barColor = percentage >= 80 ? "#16a34a" : percentage >= 50 ? "#3b82f6" : "#f59e0b";
  const pendingSteps = steps.filter(s => !s.done && s.tip);
  const cnicDetail = !hasCnic && (hasCnicFront || hasCnicBack) ? `(${hasCnicFront ? "✓ Front" : "✗ Front"} · ${hasCnicBack ? "✓ Back" : "✗ Back"})` : null;
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginBottom: 20, border: isComplete ? "2px solid #22c55e" : "1.5px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>{isComplete ? t.profileComplete : t.profileProgress}</h3>
          {!isComplete && <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>{t.completeYourProfile}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isComplete && pendingSteps.length > 0 && (
            <button onClick={() => setShowTips(s => !s)} style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>
              {showTips ? (t.dir === "rtl" ? "✕ بند" : "✕ Hide") : "💡 Tips"}
            </button>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: barColor, lineHeight: 1 }}>{percentage}%</div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{earnedPoints}/{totalPoints} pts</div>
          </div>
        </div>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ height: "100%", borderRadius: 99, background: isComplete ? "linear-gradient(90deg,#22c55e,#16a34a)" : `linear-gradient(90deg,${barColor},${barColor}cc)`, width: `${percentage}%`, transition: "width 1s ease-out" }} />
      </div>
      {showTips && pendingSteps.length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 12, padding: 14, marginBottom: 14, border: "1.5px solid #86efac" }}>
          <p style={{ fontSize: 12.5, fontWeight: 800, color: "#15803d", margin: "0 0 10px" }}>{t.boostTitle}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingSteps.map(s => (
              <div key={s.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>→</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: "0 0 2px" }}>{s.label}</p>
                  <p style={{ fontSize: 11.5, color: "#64748b", margin: 0 }}>{s.tip}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {s.action && <button onClick={s.action} style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", border: "none", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>{t.tapToComplete} →</button>}
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 20 }}>+{s.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map(step => (
          <div key={step.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, background: step.done ? "#f0fdf4" : "#f8fafc", border: `1px solid ${step.done ? "#bbf7d0" : "#e2e8f0"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? "#22c55e" : "#e2e8f0", fontSize: 11, color: step.done ? "#fff" : "#94a3b8" }}>{step.done ? "✓" : "○"}</div>
              <div>
                <span style={{ fontSize: 13, fontWeight: step.done ? 600 : 500, color: step.done ? "#15803d" : "#475569" }}>{step.label}</span>
                {step.key === "cnicDocs" && cnicDetail && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 6 }}>{cnicDetail}</span>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: step.done ? "#16a34a" : "#94a3b8", background: step.done ? "#dcfce7" : "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>+{step.points} pts</span>
              {!step.done && step.action && <button onClick={step.action} style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", border: "none", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>{t.tapToComplete} →</button>}
            </div>
          </div>
        ))}
      </div>
      {isComplete && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", border: "1.5px solid #86efac", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#15803d", margin: 0 }}>🎉 {t.dir === "rtl" ? "آپ کا پروفائل مکمل ہے! آپ کو زیادہ نوکریاں ملیں گی۔" : "Your profile is 100% complete! You'll appear in more employer searches."}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ REQUESTS TAB ═══════════════ */
function RequestsTab({ t, lang, notifications, pendingRequests, userProfile, onPostAvail, onCardAccept, onCardDecline, onCardShowCounter, onCardCounterChange, onCardSendCounter, onCardAcceptCounter, onCardRejectCounter, onCardDismiss, onOpenTracker }) {
  const activeCount = (pendingRequests || []).filter(r => !["confirmed", "rejected", "dismissed"].includes(r.cardState)).length;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{lang === "ur" ? "نوکری کی درخواستیں" : "Job Requests"}</h2>
          {activeCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#16a34a", padding: "4px 12px", borderRadius: 20, border: "1px solid #86efac" }}>{activeCount} {lang === "ur" ? "نئی" : "New"}</span>}
        </div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{lang === "ur" ? "آجروں کی طرف سے آنے والی نوکری کی درخواستیں" : "Incoming job requests from employers appear here as cards"}</p>
      </div>

      {(!pendingRequests || pendingRequests.length === 0) ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1.5px solid #e2e8f0" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 34 }}>📭</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{t.waitingTitle}</h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{t.waitingDesc}</p>
          {notifications.length > 0 && (
            <div style={{ marginTop: 28, textAlign: "left" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>{t.recentNotifs}</h4>
              {notifications.slice(-5).reverse().map(n => (
                <div key={n.id} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 10, fontSize: 13, color: "#475569", marginBottom: 8, border: "1px solid #e2e8f0" }}>{n.msg}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {pendingRequests.map(req => (
            <JobRequestCard key={req.requestId} t={t} lang={lang} req={req}
              onAccept={() => onCardAccept(req)}
              onDecline={() => onCardDecline(req)}
              onShowCounter={() => onCardShowCounter(req.requestId)}
              onCounterChange={(v) => onCardCounterChange(req.requestId, v)}
              onSendCounter={() => onCardSendCounter(req)}
              onAcceptCounter={() => onCardAcceptCounter(req)}
              onRejectCounter={() => onCardRejectCounter(req)}
              onDismiss={() => onCardDismiss(req.requestId)}
              onOpenTracker={onOpenTracker}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ APPLIED TAB ═══════════════ */
function AppliedTab({ t, applied, lang, userProfile, onPostAvail }) {
  const statusStyle = (s) => {
    if (s === "completed") return { bg: "#dcfce7", color: "#15803d" };
    if (["confirmed", "accepted", "in_progress"].includes(s)) return { bg: "#dbeafe", color: "#1d4ed8" };
    if (s === "shortlisted") return { bg: "#fef3c7", color: "#d97706" };
    if (s === "rejected") return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#f1f5f9", color: "#475569" };
  };
  const statusLabel = (s) => {
    const m = { confirmed: "✅ CONFIRMED", accepted: "✅ ACCEPTED", in_progress: "🔧 IN PROGRESS", completed: "✓ COMPLETED", rejected: "✗ REJECTED", shortlisted: "⭐ SHORTLISTED", pending: "⏳ PENDING" };
    return m[s] || (s || "pending").toUpperCase().replace(/_/g, " ");
  };
  const confirmedCount = (applied || []).filter(a => ["confirmed", "accepted", "in_progress"].includes(a.status)).length;
  const pendingCount = (applied || []).filter(a => !a.status || a.status === "pending").length;
  const completedCount = (applied || []).filter(a => a.status === "completed").length;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {(!applied || applied.length === 0) ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", color: "#94a3b8" }}>
          <CheckCircle size={52} style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: "#475569", marginBottom: 8 }}>{t.noApps}</p>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>{t.noAppsDesc}</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[{ label: lang === "ur" ? "تصدیق شدہ" : "Confirmed", value: confirmedCount, bg: "#dbeafe", color: "#1d4ed8", icon: "✅" }, { label: lang === "ur" ? "زیر التواء" : "Pending", value: pendingCount, bg: "#fef3c7", color: "#d97706", icon: "⏳" }, { label: lang === "ur" ? "مکمل" : "Completed", value: completedCount, bg: "#dcfce7", color: "#15803d", icon: "✓" }].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {applied.map((app, i) => {
              const job = app.job || {};
              const { bg, color } = statusStyle(app.status);
              const isRequest = app.source === "request";
              const isConfirmed = ["confirmed", "accepted", "in_progress", "completed"].includes(app.status);
              return (
                <div key={app._id || i} style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1.5px solid ${isConfirmed ? "#bfdbfe" : "#e2e8f0"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, background: isRequest ? "#ede9fe" : "#e0f2fe", color: isRequest ? "#7c3aed" : "#0369a1", padding: "2px 10px", borderRadius: 20 }}>{isRequest ? t.appliedViaRequest : t.appliedViaBrowse}</span></div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#0f172a" }}>{job.title || app.title || "Job Request"}</h4>
                      {(job.workLocation || app.workLocation) && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 3 }}>📍 {job.workLocation || app.workLocation}</p>}
                      {(app.employerName || job.employer?.name) && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 3 }}>👤 {app.employerName || job.employer?.name}</p>}
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(app.createdAt || Date.now()).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color, flexShrink: 0, marginLeft: 12 }}>{statusLabel(app.status)}</span>
                  </div>
                  {(app.offeredRate || app.agreedPrice) && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: isConfirmed ? 10 : 0 }}>
                      {app.offeredRate && <span style={{ fontSize: 12.5, color: "#475569", background: "#f1f5f9", padding: "4px 12px", borderRadius: 20 }}>💬 {t.yourOfferLabel}: Rs. {app.offeredRate}</span>}
                      {app.agreedPrice && app.agreedPrice !== app.offeredRate && <span style={{ fontSize: 12.5, color: "#1d4ed8", fontWeight: 700, background: "#eff6ff", padding: "4px 12px", borderRadius: 20 }}>🤝 {t.agreedPriceLabel}: Rs. {app.agreedPrice}</span>}
                    </div>
                  )}
                  {isConfirmed && (
                    <div style={{ marginTop: 10, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", borderRadius: 12, padding: "12px 16px", border: "1.5px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 3px" }}>{app.status === "completed" ? (lang === "ur" ? "✓ نوکری مکمل" : "✓ Job Completed") : (lang === "ur" ? "✅ آپ تصدیق شدہ ہیں" : "✅ You're confirmed for this job")}</p>
                        {(app.employerName || job.employer?.name) && <p style={{ fontSize: 12.5, color: "#475569", margin: 0 }}>👤 {app.employerName || job.employer?.name}</p>}
                      </div>
                      {/* Phone only visible during active job — hidden after completion */}
                      {app.employerPhone && ["confirmed", "accepted", "in_progress"].includes(app.status) && (
                        <a href={`tel:${app.employerPhone}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 8px rgba(59,130,246,.3)" }}>📞 {t.callEmployer}</a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════ HISTORY TAB ═══════════════ */
function HistoryTab({ t, history, lang, userProfile, onPostAvail, onReRate }) {
  const getStoredReview = (jobId) => { try { return JSON.parse(localStorage.getItem(`job_review_${jobId}`) || "{}"); } catch { return {}; } };
  const total = (history || []).reduce((s, j) => s + Number(String(j.agreedPrice).replace(/[^0-9]/g, "") || 0), 0);
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {(!history || history.length === 0) ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", color: "#94a3b8" }}>
          <Briefcase size={52} style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: "#475569", marginBottom: 8 }}>{t.noHistory}</p>
          <p style={{ fontSize: 14 }}>{t.noHistorySub}</p>
        </div>
      ) : (
        <>
          <div style={{ background: "linear-gradient(135deg,#064e3b,#065f46)", borderRadius: 16, padding: "18px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div><div style={{ fontSize: 12, opacity: 0.6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>{lang === "ur" ? "مکمل نوکریاں" : "Jobs Completed"}</div><div style={{ fontSize: 32, fontWeight: 900 }}>{history.length}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, opacity: 0.6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>{lang === "ur" ? "کل کمائی" : "Total Earned"}</div><div style={{ fontSize: 24, fontWeight: 800 }}>Rs. {total.toLocaleString()}</div></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {history.map((job, i) => {
              const review = (job.myRating > 0) ? { workerRating: job.myRating, workerComment: job.myComment } : getStoredReview(job._id);
              const hasRating = review.workerRating > 0;
              return (
                <div key={job._id || i} style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid #dcfce7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: "#0f172a" }}>{job.title || "Job"}</h4>
                      {job.workLocation && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>📍 {job.workLocation}</p>}
                      {job.employerName && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>👤 {job.employerName}</p>}
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>✅ {lang === "ur" ? "مکمل:" : "Completed:"} {new Date(job.completedAt || Date.now()).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#15803d", flexShrink: 0, marginLeft: 12 }}>{lang === "ur" ? "مکمل" : "COMPLETED"}</span>
                  </div>
                  {job.agreedPrice && (
                    <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#f0fdf4", borderRadius: 10 }}>
                      <span style={{ fontSize: 15, color: "#16a34a", fontWeight: 800 }}>💰 {lang === "ur" ? "کمائی:" : "Earned:"} Rs. {job.agreedPrice}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 14 }}>
                    {hasRating ? (
                      <div style={{ background: "linear-gradient(135deg,#fefce8,#fef9c3)", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #fde68a" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: review.workerComment ? 10 : 0 }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>
                              {lang === "ur" ? `${t.yourRatingLabel} — ${job.employerName || "آجر"}` : `${t.yourRatingLabel} for ${job.employerName || "Employer"}`}
                            </p>
                            <StarDisplay rating={review.workerRating} size={18} />
                            <span style={{ fontSize: 12, color: "#92400e", fontWeight: 700, marginLeft: 6 }}>({t.ratingLabels[review.workerRating]})</span>
                          </div>
                          <button onClick={() => onReRate(job)} style={{ fontSize: 11, fontWeight: 700, color: "#92400e", background: "rgba(251,191,36,0.2)", border: "1px solid #fde68a", borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>
                            {lang === "ur" ? "تبدیل کریں" : "Edit"}
                          </button>
                        </div>
                        {review.workerComment && (
                          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 12px", border: "1px solid #fde68a" }}>
                            <p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>"{review.workerComment}"</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0" }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", margin: 0 }}>{t.noRatingYet}</p>
                          <p style={{ fontSize: 11, color: "#cbd5e1", margin: "2px 0 0" }}>{lang === "ur" ? "اس آجر کو ریٹ کریں" : "Rate your experience with this employer"}</p>
                        </div>
                        <button onClick={() => onReRate(job)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ⭐ {t.rateNow}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════ BROWSE TAB ═══════════════ */
function BrowseTab({ t, lang, userId, onOpenApplyModal, userProfile, onPostAvail }) {
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtering, setFiltering] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [skillFilterActive, setSkillFilterActive] = useState(true);
  const workerSkill = ((userProfile?.skill || userProfile?.category || userProfile?.trade || "").toLowerCase().trim());
  useEffect(() => { fetch(`${API}/api/jobs`).then(r => r.json()).then(d => { const jobs = Array.isArray(d) ? d : []; setAllJobs(jobs); }).catch(() => {}); }, []);
  useEffect(() => {
    if (activeFilters) return;
    if (skillFilterActive && workerSkill) {
      setFilteredJobs(allJobs.filter(j => (j.category || j.type || "").toLowerCase().includes(workerSkill) || workerSkill.split(" ").some(w => (j.category || j.type || j.title || "").toLowerCase().includes(w)) || (j.title || "").toLowerCase().includes(workerSkill)));
    } else { setFilteredJobs(allJobs); }
  }, [allJobs, skillFilterActive, workerSkill, activeFilters]);
  const handleAIFilter = async () => {
    if (!searchQuery.trim()) return;
    setFiltering(true);
    try {
      const res = await fetch(`${API}/api/ai/smart-filter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: searchQuery }) });
      const f = await res.json();
      setActiveFilters(f);
      let r = [...allJobs];
      if (f.category) r = r.filter(j => (j.category || j.type || "").toLowerCase().includes(f.category.toLowerCase()) || (j.title || "").toLowerCase().includes(f.category.toLowerCase()));
      if (f.location) r = r.filter(j => (j.location || "").toLowerCase().includes(f.location.toLowerCase()));
      if (f.minBudget > 0) r = r.filter(j => Number(String(j.salary).replace(/[^0-9]/g, "")) >= f.minBudget);
      if (f.maxBudget > 0) r = r.filter(j => Number(String(j.salary).replace(/[^0-9]/g, "")) <= f.maxBudget);
      if (f.keywords?.length) r = r.filter(j => f.keywords.some(kw => (j.title || "").toLowerCase().includes(kw.toLowerCase()) || (j.description || "").toLowerCase().includes(kw.toLowerCase())));
      setFilteredJobs(r);
    } catch (e) { console.error(e); }
    setFiltering(false);
  };
  const clearFilters = () => {
    setActiveFilters(null); setSearchQuery("");
    if (skillFilterActive && workerSkill) setFilteredJobs(allJobs.filter(j => (j.category || j.type || "").toLowerCase().includes(workerSkill) || workerSkill.split(" ").some(w => (j.category || j.type || j.title || "").toLowerCase().includes(w))));
    else setFilteredJobs(allJobs);
  };
  const toggleSkillFilter = () => { setSkillFilterActive(n => !n); setActiveFilters(null); setSearchQuery(""); };
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {workerSkill && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderRadius: 12, background: skillFilterActive ? "#f0fdf4" : "#f8fafc", border: `1.5px solid ${skillFilterActive ? "#86efac" : "#e2e8f0"}`, marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: skillFilterActive ? "#16a34a" : "#94a3b8", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: skillFilterActive ? "#15803d" : "#64748b" }}>{skillFilterActive ? `${t.skillFilterOn}: ${workerSkill.charAt(0).toUpperCase() + workerSkill.slice(1)}` : t.skillFilterOff}</span>
          </div>
          <button onClick={toggleSkillFilter} style={{ fontSize: 12, fontWeight: 700, color: skillFilterActive ? "#16a34a" : "#64748b", background: skillFilterActive ? "#dcfce7" : "#f1f5f9", border: "none", borderRadius: 20, padding: "5px 14px", cursor: "pointer" }}>
            {skillFilterActive ? `✕ ${t.removeFilter}` : `✓ ${t.yourSkill}: ${workerSkill}`}
          </button>
        </div>
      )}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 14px" }}>
            <SlidersHorizontal size={16} color="#6366f1" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAIFilter()} placeholder={t.aiFilterPlaceholder} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, outline: "none", color: "#0f172a" }} />
            {searchQuery && <button onClick={clearFilters} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }}>×</button>}
          </div>
          <button onClick={handleAIFilter} disabled={filtering || !searchQuery.trim()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 12, border: "none", background: filtering || !searchQuery.trim() ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: filtering || !searchQuery.trim() ? "#94a3b8" : "#fff", fontSize: 13, fontWeight: 700, cursor: filtering || !searchQuery.trim() ? "not-allowed" : "pointer" }}>
            <Search size={14} />{filtering ? t.aiFiltering : t.aiFilterBtn}
          </button>
        </div>
        {activeFilters && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".06em" }}>{t.activeFilters}:</span>
            {activeFilters.category && <FC label={`📂 ${activeFilters.category}`} />}
            {activeFilters.location && <FC label={`📍 ${activeFilters.location}`} />}
            {activeFilters.minBudget > 0 && <FC label={`💰 Rs.${activeFilters.minBudget}+`} />}
            {activeFilters.maxBudget > 0 && <FC label={`💰 Max Rs.${activeFilters.maxBudget}`} />}
            {activeFilters.keywords?.map(k => <FC key={k} label={`🔍 ${k}`} />)}
            <button onClick={clearFilters} style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, background: "#fef2f2", border: "none", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>{t.clearFilters}</button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filteredJobs.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#475569", marginBottom: 4 }}>{t.noJobsFound}</p>
            <p style={{ fontSize: 13, marginBottom: skillFilterActive && workerSkill ? 16 : 0 }}>{t.noJobsFoundSub}</p>
            {skillFilterActive && workerSkill && <button onClick={toggleSkillFilter} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.skillFilterOff}</button>}
          </div>
        ) : filteredJobs.map(job => (
          <div key={job._id} style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div><h4 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>{job.title}</h4><p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{job.employer?.name}</p></div>
              <span style={{ background: "#eff6ff", color: "#3b82f6", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{job.type || job.category}</span>
            </div>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 14, lineHeight: 1.5 }}>{job.description}</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              {job.location && <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} />{job.location}</span>}
              {job.salary && <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={14} />Rs. {job.salary}</span>}
              {job.urgency && <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600, background: "#fef3c7", padding: "2px 10px", borderRadius: 20 }}>⚡ {job.urgency}</span>}
            </div>
            <button onClick={() => onOpenApplyModal(job)} style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#16a34a,#059669)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t.applyNow}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FC({ label }) { return <span style={{ background: "#f0f0fe", color: "#4f46e5", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid #e0e0fc" }}>{label}</span>; }

/* ═══════════════ JOB REQUEST CARD ═══════════════ */
function JobRequestCard({ t, lang, req, onAccept, onDecline, onShowCounter, onCounterChange, onSendCounter, onAcceptCounter, onRejectCounter, onDismiss, onOpenTracker }) {
  const isInitial = req.cardState === null;
  const isConfirmed = req.cardState === "confirmed";
  const isRejected = req.cardState === "rejected";
  const isDismissed = req.cardState === "dismissed";
  const isDone = isConfirmed || isRejected || isDismissed;
  const isNegotiating = ["accepted_waiting", "counter_sent", "counter_received"].includes(req.cardState);

  const accentColor = isConfirmed ? "#22c55e" : isRejected || isDismissed ? "#ef4444" : isNegotiating ? "#3b82f6" : "#22c55e";
  const borderColor = isConfirmed ? "#86efac" : isRejected || isDismissed ? "#fecaca" : isNegotiating ? "#bfdbfe" : "#e2e8f0";

  const statusLabel = isConfirmed
    ? (lang === "ur" ? "✅ تصدیق شدہ" : "✅ Confirmed")
    : isRejected ? (lang === "ur" ? "❌ منتخب نہیں" : "❌ Not Selected")
    : isDismissed ? (lang === "ur" ? "⚠ برخاست" : "⚠ Dismissed")
    : req.cardState === "accepted_waiting" ? (lang === "ur" ? "⏳ تصدیق کا انتظار" : "⏳ Awaiting Confirmation")
    : req.cardState === "counter_sent" ? (lang === "ur" ? "💬 پیشکش بھیجی گئی" : "💬 Offer Sent")
    : req.cardState === "counter_received" ? (lang === "ur" ? "🔄 جوابی پیشکش موصول" : "🔄 Counter Received")
    : req.cardState === "counter_input" ? (lang === "ur" ? "✏ قیمت درج کریں" : "✏ Enter Your Price")
    : t.newJobRequest;

  return (
    <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: `2px solid ${borderColor}`, overflow: "hidden", animation: "slideUp 0.3s ease-out" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${accentColor},${accentColor}99)` }} />
      <div style={{ padding: 24 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: ".08em" }}>{statusLabel}</span>
          </div>
          {isDone && (
            <button onClick={onDismiss} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b" }}>
              ✕ {lang === "ur" ? "ہٹائیں" : "Remove"}
            </button>
          )}
        </div>

        {/* Job details */}
        <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius: 14, padding: 18, marginBottom: 14, color: "#fff" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 8px", textTransform: "capitalize" }}>{req.title || req.category}</h3>
          {req.description && (
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", margin: "0 0 12px", lineHeight: 1.55 }}>
              {req.description.length > 140 ? req.description.slice(0, 140) + "…" : req.description}
            </p>
          )}
          {req.workLocation && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.1)", borderRadius: 8, padding: "5px 10px" }}>
              <MapPin size={11} color="#60a5fa" />
              <span style={{ fontSize: 12, color: "#e2e8f0" }}>{req.workLocation}</span>
            </div>
          )}
        </div>

        {/* Employer offer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "12px 16px", background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #86efac" }}>
          <div>
            <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 800, marginBottom: 2, textTransform: "uppercase", letterSpacing: ".06em" }}>{t.employerOffer}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Rs. {req.offeredPrice || "Open"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{req.employerName}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{req.category}</div>
          </div>
        </div>

        {/* Action area */}
        {isInitial && req.budgetType === "open" && (
          <div style={{ background: "#eff6ff", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #bfdbfe", marginBottom: 4 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: "#1d4ed8", margin: "0 0 10px" }}>
              💬 {lang === "ur" ? "آجر آفرز قبول کر رہا ہے — اپنا ریٹ بتائیں" : "Employer is open to offers — send your price to negotiate"}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onShowCounter} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
                <MessageSquare size={15} />{lang === "ur" ? "ریٹ بھیجیں" : "Send Your Rate"}
              </button>
              <button onClick={onDecline} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 11, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <ThumbsDown size={14} />{t.declineJob}
              </button>
            </div>
          </div>
        )}

        {isInitial && req.budgetType !== "open" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <button onClick={onAccept} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                <ThumbsUp size={16} />{t.acceptJob}
              </button>
              <button onClick={onDecline} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px", borderRadius: 12, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <ThumbsDown size={14} />{t.declineJob}
              </button>
            </div>
            <button onClick={onShowCounter} style={{ width: "100%", padding: "10px", borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <MessageSquare size={13} />{t.counterNote}
            </button>
          </>
        )}

        {req.cardState === "counter_input" && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>{t.counterOffer}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="number" value={req.cardCounter} onChange={e => onCounterChange(e.target.value)} placeholder={t.optionalCounter} autoFocus style={{ flex: 1, padding: "12px 14px", borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" }} />
              <button onClick={onSendCounter} style={{ padding: "12px 16px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t.sendCounter}</button>
            </div>
            <button onClick={onDecline} style={{ width: "100%", padding: "10px", borderRadius: 11, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.declineJob}</button>
          </div>
        )}

        {req.cardState === "accepted_waiting" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 44, height: 44, border: "4px solid #dcfce7", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 4 }}>{lang === "ur" ? "درخواست قبول!" : "Request Accepted!"}</p>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>{lang === "ur" ? "آجر کی تصدیق کا انتظار ہے..." : "Waiting for employer to confirm you..."}</p>
          </div>
        )}

        {req.cardState === "counter_sent" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 44, height: 44, border: "4px solid #dbeafe", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 4 }}>{t.offerSent}</p>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>{t.yourOfferWas} Rs. {req.cardCounter}</p>
          </div>
        )}

        {req.cardState === "counter_received" && req.cardEmployerCounter && (
          <div>
            <div style={{ background: "#fef3c7", borderRadius: 12, padding: 14, marginBottom: 12, border: "1.5px solid #fcd34d" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#d97706", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{t.counterReceived}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 2 }}>Rs. {req.cardEmployerCounter.price}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{t.yourOfferWasLabel} Rs. {req.cardCounter}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onAcceptCounter} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.accept} Rs. {req.cardEmployerCounter.price}</button>
              <button onClick={onRejectCounter} style={{ padding: "12px 14px", borderRadius: 12, border: "none", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.reject}</button>
            </div>
          </div>
        )}

        {isConfirmed && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 46, marginBottom: 8 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{t.jobConfirmed}</h3>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 16 }}>{t.jobConfirmedDesc}</p>
            <button onClick={onOpenTracker} style={{ padding: "13px", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>🔧 {t.viewJobDetails}</button>
          </div>
        )}

        {isRejected && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 38, marginBottom: 8 }}>😔</div>
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 4 }}>{t.offerRejected}</p>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 14 }}>{t.offerRejectedDesc}</p>
            <button onClick={onDismiss} style={{ padding: "9px 24px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontSize: 13, cursor: "pointer" }}>{t.close}</button>
          </div>
        )}

        {isDismissed && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🔄</div>
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 4 }}>{t.dismissed}</p>
            <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 14 }}>{t.dismissedDesc}</p>
            <button onClick={onDismiss} style={{ padding: "9px 24px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontSize: 13, cursor: "pointer" }}>{t.close}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ JOB REQUEST POPUP ═══════════════ */
function JobRequestPopup({ t, request, popupState, popupTimer, counterPrice, setCounterPrice, employerCounter, onAcceptJob, onDeclineJob, onShowCounter, onSendCounter, onAcceptEmployerCounter, onRejectEmployerCounter, onDismiss, onOpenTracker, userId }) {
  const timerPct = (popupTimer / 30) * 100;
  const isInitial = popupState === null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: 26, width: "100%", maxWidth: 460, boxShadow: "0 32px 80px rgba(0,0,0,0.35)", overflow: "hidden", maxHeight: "92vh", overflowY: "auto" }}>
        {isInitial && <div style={{ height: 5, background: "#e2e8f0", overflow: "hidden" }}><div style={{ height: "100%", width: `${timerPct}%`, transition: "width 1s linear", background: timerPct > 33 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#ef4444,#dc2626)" }} /></div>}
        <div style={{ padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} /><span style={{ fontSize: 12, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".08em" }}>{t.newJobRequest}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{isInitial && <span style={{ fontSize: 13, fontWeight: 700, color: timerPct > 33 ? "#64748b" : "#ef4444" }}>⏱ {popupTimer}s</span>}<button onClick={onDismiss} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: 7, cursor: "pointer" }}><X size={15} color="#64748b" /></button></div>
          </div>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", borderRadius: 16, padding: 20, marginBottom: 16, color: "#fff" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>{request.title || request.category}</h3>
            {request.description && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 14px", lineHeight: 1.5 }}>{request.description}</p>}
            {request.workLocation && <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.08)", borderRadius: 8, padding: "5px 10px", width: "fit-content" }}><MapPin size={12} color="#60a5fa" /><span style={{ fontSize: 12 }}>{request.workLocation}</span></div>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "14px 18px", background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #86efac" }}>
            <div><div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginBottom: 2 }}>{t.employerOffer}</div><div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>Rs. {request.offeredPrice || "Open"}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 700 }}>{request.employerName}</div><div style={{ fontSize: 11, color: "#64748b" }}>{request.category}</div></div>
          </div>
          {isInitial && request.budgetType === "open" && (
            <div style={{ background: "#eff6ff", borderRadius: 13, padding: "14px 16px", border: "1.5px solid #bfdbfe" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", margin: "0 0 12px" }}>💬 Employer is open to offers — send your price to negotiate</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onShowCounter} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}><MessageSquare size={17} />Send Your Rate</button>
                <button onClick={onDeclineJob} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px", borderRadius: 13, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer" }}><ThumbsDown size={15} />{t.declineJob}</button>
              </div>
            </div>
          )}
          {isInitial && request.budgetType !== "open" && <>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onAcceptJob} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}><ThumbsUp size={17} />{t.acceptJob}</button>
              <button onClick={onDeclineJob} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px", borderRadius: 13, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer" }}><ThumbsDown size={15} />{t.declineJob}</button>
            </div>
            <button onClick={onShowCounter} style={{ width: "100%", marginTop: 10, padding: "11px", borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><MessageSquare size={14} />{t.counterNote}</button>
          </>}
          {popupState === "counter_input" && <div><label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>{t.counterOffer}</label><div style={{ display: "flex", gap: 8 }}><input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} placeholder={t.optionalCounter} autoFocus style={{ flex: 1, padding: "13px 14px", borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" }} /><button onClick={onSendCounter} style={{ padding: "13px 18px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t.sendCounter}</button></div><button onClick={onDeclineJob} style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 11, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.declineJob}</button></div>}
          {popupState === "accepted_waiting" && <div style={{ textAlign: "center", padding: "8px 0" }}><div style={{ width: 52, height: 52, border: "4px solid #dcfce7", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} /><p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 4 }}>Request Accepted!</p><p style={{ fontSize: 13, color: "#64748b" }}>Waiting for employer to confirm you...</p></div>}
          {popupState === "counter_sent" && <div style={{ textAlign: "center", padding: "8px 0" }}><div style={{ width: 52, height: 52, border: "4px solid #dbeafe", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} /><p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 4 }}>{t.offerSent}</p><p style={{ fontSize: 13, color: "#64748b" }}>{t.yourOfferWas} Rs. {counterPrice}</p></div>}
          {popupState === "counter_received" && employerCounter && <div><div style={{ background: "#fef3c7", borderRadius: 12, padding: 16, marginBottom: 14, border: "1.5px solid #fcd34d" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 4 }}>{t.counterReceived}</div><div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", marginBottom: 2 }}>Rs. {employerCounter.price}</div><div style={{ fontSize: 12, color: "#64748b" }}>{t.yourOfferWasLabel} Rs. {counterPrice}</div></div><div style={{ display: "flex", gap: 10 }}><button onClick={onAcceptEmployerCounter} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t.accept} Rs. {employerCounter.price}</button><button onClick={onRejectEmployerCounter} style={{ padding: "13px 16px", borderRadius: 12, border: "none", background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.reject}</button></div></div>}
          {popupState === "confirmed" && <div style={{ textAlign: "center", padding: "12px 0" }}><div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div><h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{t.jobConfirmed}</h3><p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{t.jobConfirmedDesc}</p><button onClick={onOpenTracker} style={{ padding: "13px 32px", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>🔧 {t.viewJobDetails}</button></div>}
          {popupState === "rejected" && <div style={{ textAlign: "center", padding: "12px 0" }}><div style={{ fontSize: 42, marginBottom: 10 }}>😔</div><p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 4 }}>{t.offerRejected}</p><p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{t.offerRejectedDesc}</p><button onClick={onDismiss} style={{ padding: "10px 28px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontSize: 14, cursor: "pointer" }}>{t.close}</button></div>}
          {popupState === "dismissed" && <div style={{ textAlign: "center", padding: "12px 0" }}><div style={{ fontSize: 36, marginBottom: 10 }}>🔄</div><p style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 4 }}>{t.dismissed}</p><p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{t.dismissedDesc}</p><button onClick={onDismiss} style={{ padding: "10px 28px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontSize: 14, cursor: "pointer" }}>{t.close}</button></div>}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}