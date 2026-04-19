"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";
import {
  Briefcase, LogOut, Menu, X, Clock, Send,
  CheckCircle, XCircle, Bell, Search, AlertCircle,
  Phone, Zap, Timer, Edit2, Trash2, FileText,
  Star, MessageSquare, AlertTriangle, ThumbsUp,
  User, Settings, Camera, ChevronRight, Shield,
  MapPin, Mail, Hash, TrendingUp, Award, Lock,
  Eye, EyeOff, Save, RefreshCw
} from "lucide-react";
import JobTracker from "@/components/JobTracker";

const socket = io("http://localhost:5000");
if (typeof window !== "undefined") {
  window._rozgarSocket = socket;
  socket.on("connect", () => console.log("✅ Employer socket CONNECTED"));
  socket.on("disconnect", () => console.log("❌ Employer socket DISCONNECTED"));
}

const JobMap = dynamic(() => import("@/components/JobMap"), { ssr: false });

/* ═══════════════ TRANSLATIONS ═══════════════ */
const LANG = {
  en: {
    dir: "ltr",
    findWorker: "Find a Worker", myRequests: "My Requests", history: "History",
    welcomeBack: "Welcome back", logout: "Logout",
    postJob: "Post a Job Request", postJobSub: "Workers near you will see your request",
    category: "Work Category", jobTitle: "Job Title", jobTitlePlaceholder: "e.g., Fix wiring in bedroom",
    urgency: "Urgency",
    urgent1h: "⚡ Within 1 Hour", urgentToday: "📅 Today", urgentWeek: "📆 This Week", urgentFlex: "🕐 Flexible",
    description: "Description", descPlaceholder: "Describe the work needed... or click Generate with AI ✨",
    generateAI: "✨ Generate with AI", generating: "⏳ Generating...",
    location: "Location", locationPlaceholder: "Work site address / area (e.g., DHA Phase 5, Karachi)",
    pinHint: "📌 Click on the map to pin exact job location:", pinned: "✅ Pinned:",
    pickup: "Pickup", drop: "Drop", pickupPlaceholder: "Pickup location", dropPlaceholder: "Drop location",
    budget: "Budget", fixedBudget: "💰 Fixed Budget", openOffers: "🤝 Open to Offers",
    openOffersDesc: "Workers can send you their best price. You negotiate and choose.",
    jobDuration: "Job Duration", jobDurationPlaceholder: "e.g., 2 hours, 1 day, 3 days",
    durationHint: "Estimated time needed to complete this job",
    saveAsDraft: "Save as Draft", sendRequest: "Post Job", posting: "Posting...", savingDraft: "Saving...",
    cancelRequest: "Cancel Request", searching: "Searching Nearby Workers...", elapsed: "elapsed",
    waitingWorkers: "Waiting for workers to respond...", waitingWorkersDesc: "Workers near you will see your request and can accept it instantly",
    workersReady: "Workers Ready to Start", counterOffers: "💬 Counter Offers",
    confirmedTitle: "Worker Confirmed! 🎉", confirmedSub: "Your worker is on the way",
    postAnother: "Post Another Request", agreedPrice: "Agreed Price", eta: "ETA", etaValue: "~15 min",
    phone: "Phone", status: "Status", enRoute: "En Route",
    yourOffer: "Your Offer", confirmWorker: "Confirm Worker", accept: "Accept", counter: "Counter", send: "Send",
    above: "above your offer", below: "below your offer", counterPricePlaceholder: "Counter price (Rs.)",
    noHistory: "No history yet", noHistorySub: "Completed jobs will appear here",
    noRequests: "No requests yet", noRequestsSub: 'Use "Find Worker" to post your first request',
    loading: "Loading...", navFind: "Find Worker", navRequests: "My Requests", navHistory: "History", navProfile: "Profile",
    selectCategory: "Please select a category first", serverError: "Cannot connect with server", langBtn: "اردو",
    jobSiteLocation: "Job Site Location", acceptedBadge: "✓ ACCEPTED YOUR REQUEST", readyNow: "Ready Now",
    locationFound: "✅ Location found — or click map to adjust:", reliabilityScore: "Reliability Score",
    marketRate: "💡 AI Market Rate", typicalRange: "Typical range", yourOfferLabel: "Your offer",
    offerFair: "✅ Fair offer — workers will respond well", offerLow: "⚠️ Below market — consider raising your offer",
    offerHigh: "ℹ️ Above market — you may get faster responses",
    profileProgress: "Profile Progress", profileComplete: "Profile Complete! 🎉",
    completeYourProfile: "Complete your profile to hire better workers",
    stepRegistered: "Account Registered", stepProfilePhoto: "Profile Photo Uploaded",
    stepCnicDocs: "CNIC Documents Uploaded", stepEmailVerified: "Email Verified",
    stepFirstJob: "First Job Posted", stepVerified: "Account Verified by Admin", tapToPost: "Post a Job →",
    customCategoryLabel: "Describe the Work Type",
    customCategoryPlaceholder: "e.g., Solar Panel, Event Manager, Pest Control...",
    customCategoryHint: "Tell workers what kind of work you need",
    notifications: "Notifications", markAllRead: "Mark all read", clearAll: "Clear all",
    noNotifications: "No notifications yet", notifSubtitle: "Worker responses will appear here",
    draftSaved: "Draft saved!", postPublished: "Job posted — workers notified!", postUpdated: "Job updated!",
    postDeleted: "Post deleted!", confirmDelete: "Delete this post?",
    confirmDeleteMsg: "This cannot be undone.", yes: "Yes, Delete", cancel: "Cancel",
    allPosts: "All", livePosts: "Live", draftPosts: "Drafts",
    editPost: "Edit Post", liveLabel: "LIVE", draftLabel: "DRAFT",
    publishDraft: "🚀 Publish",
    tipProfilePhoto: "Go to Settings → Upload a clear photo of yourself",
    tipCnic: "Go to Settings → Upload front & back of your CNIC",
    tipEmail: "Check your inbox and click the verification link",
    tipFirstJob: "Click 'Post Job' (not 'Save as Draft') — points are only awarded when a job is Published",
    tipVerified: "Our team will review and verify your account within 24 hours",
    boostTitle: "💡 How to boost your profile",
    boostSub: "Complete these steps to get faster worker responses",
    workerPhone: "Worker Phone", workerName: "Worker Name", workerInfo: "Assigned Worker",
    callWorker: "Call Worker", agreedPriceLabel: "Agreed Price",
    rateYourJob: "Rate This Job", rateJobSub: "How was your experience?",
    rateWorker: "Rate the Worker", tapToRate: "Tap a star to rate",
    reportIssue: "Report an Issue (Optional)",
    reportIssueSub: "Something went wrong? Let us know — this is private and helps us improve.",
    issueTypes: ["Work quality was poor", "Worker was late / didn't show", "Worker was rude or unprofessional", "Price dispute", "Job not completed", "Other"],
    issueTypesUr: ["کام کا معیار خراب تھا", "کارکن دیر سے آیا / نہیں آیا", "کارکن بدتمیز تھا", "قیمت کا تنازعہ", "کام مکمل نہیں ہوا", "دیگر"],
    writeComment: "Additional comments (optional)",
    writeCommentPlaceholder: "Tell us more about your experience...",
    submitFeedback: "Submit Feedback", skipFeedback: "Skip for now",
    feedbackThankYou: "Thank you for your feedback! 🙏",
    excellentJob: "Excellent!", goodJob: "Good", averageJob: "Okay", poorJob: "Poor", terribleJob: "Terrible",
    issueReported: "Issue reported — our team will review it.",
    // Profile
    myProfile: "My Profile", editProfile: "Edit Profile", saveChanges: "Save Changes",
    profileSettings: "Profile Settings", accountSettings: "Account Settings",
    fullName: "Full Name", emailAddress: "Email Address", phoneNumber: "Phone Number",
    currentPassword: "Current Password", newPassword: "New Password", confirmPassword: "Confirm Password",
    changePassword: "Change Password", uploadPhoto: "Upload Photo",
    jobsPosted: "Jobs Posted", jobsCompleted: "Jobs Completed", memberSince: "Member Since",
    profileUpdated: "Profile updated successfully!",
    swalProfileUpdated: "Profile Updated!", swalProfileUpdatedText: "Your profile has been saved successfully.",
    swalProfileError: "Error", swalProfileErrorText: "Failed to update profile.",
    swalPwChanged: "Password Changed!", swalPwChangedText: "Your password has been updated successfully.",
    swalPwError: "Error", swalPwErrorText: "Failed to change password.",
    swalDone: "Done!", swalGreat: "Great!",
    pwSecureSubtitle: "Keep your account secure with a strong password",
    pwCheck1: "At least 8 characters", pwCheck2: "Uppercase letter (A-Z)",
    pwCheck3: "Lowercase letter (a-z)", pwCheck4: "Number (0-9)",
    pwCheck5: "Special character (!@#$...)",
    pwWeak: "Weak", pwFair: "Fair", pwStrong: "Strong",
    logoutConfirmTitle: "Logout?", logoutConfirmMsg: "Are you sure you want to logout?",
    logoutConfirm: "Yes, Logout", stayIn: "Stay In",
    negotiateInfo: "Workers will send you their price offers. Review and accept the best one.",
  },
  ur: {
    dir: "rtl",
    findWorker: "کارکن تلاش کریں", myRequests: "میری درخواستیں", history: "تاریخ",
    welcomeBack: "خوش آمدید", logout: "لاگ آؤٹ",
    postJob: "نوکری کی درخواست پوسٹ کریں", postJobSub: "آپ کے قریب کارکن آپ کی درخواست دیکھیں گے",
    category: "کام کی قسم", jobTitle: "نوکری کا عنوان", jobTitlePlaceholder: "مثلاً: کمرے میں وائرنگ ٹھیک کریں",
    urgency: "فوری",
    urgent1h: "⚡ ایک گھنٹے میں", urgentToday: "📅 آج", urgentWeek: "📆 اس ہفتے", urgentFlex: "🕐 لچکدار",
    description: "تفصیل", descPlaceholder: "کام کی تفصیل لکھیں... یا AI سے بنوائیں ✨",
    generateAI: "✨ AI سے بنائیں", generating: "⏳ بن رہا ہے...",
    location: "مقام", locationPlaceholder: "کام کی جگہ کا پتہ (مثلاً: DHA فیز 5، کراچی)",
    pinHint: "📌 نقشے پر کلک کر کے جگہ پن کریں:", pinned: "✅ پن کیا:",
    pickup: "پک اپ", drop: "ڈراپ", pickupPlaceholder: "پک اپ مقام", dropPlaceholder: "ڈراپ مقام",
    budget: "بجٹ", fixedBudget: "💰 مقررہ بجٹ", openOffers: "🤝 آفرز قبول ہیں",
    openOffersDesc: "کارکن اپنی بہترین قیمت بھیجیں گے۔ آپ مذاکرہ کریں اور بہترین منتخب کریں۔",
    jobDuration: "کام کی مدت", jobDurationPlaceholder: "مثلاً: 2 گھنٹے، 1 دن، 3 دن",
    durationHint: "یہ کام مکمل ہونے میں کتنا وقت لگے گا",
    saveAsDraft: "ڈرافٹ محفوظ کریں", sendRequest: "نوکری پوسٹ کریں", posting: "پوسٹ ہو رہا ہے...", savingDraft: "محفوظ ہو رہا ہے...",
    cancelRequest: "درخواست منسوخ کریں", searching: "قریبی کارکن تلاش ہو رہے ہیں...", elapsed: "گزر گئے",
    waitingWorkers: "کارکنوں کے جواب کا انتظار ہے...", waitingWorkersDesc: "قریبی کارکن آپ کی درخواست دیکھیں گے اور قبول کر سکتے ہیں",
    workersReady: "کارکن تیار ہیں", counterOffers: "💬 جوابی پیشکشیں",
    confirmedTitle: "کارکن کی تصدیق! 🎉", confirmedSub: "آپ کا کارکن آ رہا ہے",
    postAnother: "ایک اور درخواست دیں", agreedPrice: "طے شدہ قیمت", eta: "وقت", etaValue: "~15 منٹ",
    phone: "فون", status: "حالت", enRoute: "راستے میں",
    yourOffer: "آپ کی پیشکش", confirmWorker: "کارکن کی تصدیق کریں", accept: "قبول کریں", counter: "جوابی پیشکش", send: "بھیجیں",
    above: "آپ کی پیشکش سے زیادہ", below: "آپ کی پیشکش سے کم", counterPricePlaceholder: "جوابی قیمت (روپے)",
    noHistory: "ابھی کوئی تاریخ نہیں", noHistorySub: "مکمل نوکریاں یہاں دکھیں گی",
    noRequests: "ابھی کوئی درخواست نہیں", noRequestsSub: 'نوکری پوسٹ کرنے کے لیے "کارکن تلاش کریں" استعمال کریں',
    loading: "لوڈ ہو رہا ہے...", navFind: "کارکن تلاش", navRequests: "میری درخواستیں", navHistory: "تاریخ", navProfile: "پروفائل",
    selectCategory: "پہلے قسم منتخب کریں", serverError: "سرور سے رابطہ نہیں ہو سکا", langBtn: "English",
    jobSiteLocation: "کام کی جگہ", acceptedBadge: "✓ درخواست قبول کی", readyNow: "ابھی تیار",
    locationFound: "✅ جگہ مل گئی — یا نقشے پر کلک کریں:", reliabilityScore: "قابل اعتماد اسکور",
    marketRate: "💡 AI مارکیٹ ریٹ", typicalRange: "عام رینج", yourOfferLabel: "آپ کی پیشکش",
    offerFair: "✅ مناسب قیمت — کارکن قبول کریں گے", offerLow: "⚠️ کم قیمت — زیادہ دیں",
    offerHigh: "ℹ️ زیادہ قیمت — جلدی جواب ملے گا",
    profileProgress: "پروفائل پروگریس", profileComplete: "پروفائل مکمل! 🎉",
    completeYourProfile: "بہتر کارکن پانے کے لیے پروفائل مکمل کریں",
    stepRegistered: "اکاؤنٹ رجسٹر", stepProfilePhoto: "پروفائل فوٹو اپلوڈ",
    stepCnicDocs: "شناختی کارڈ اپلوڈ", stepEmailVerified: "ای میل تصدیق",
    stepFirstJob: "پہلی نوکری پوسٹ", stepVerified: "ایڈمن سے تصدیق", tapToPost: "نوکری پوسٹ کریں →",
    customCategoryLabel: "کام کی قسم بیان کریں",
    customCategoryPlaceholder: "مثلاً: سولر پینل، ایونٹ مینیجر، کیڑے مار...",
    customCategoryHint: "کارکنوں کو بتائیں کہ آپ کو کس قسم کا کام چاہیے",
    notifications: "اطلاعات", markAllRead: "سب پڑھا", clearAll: "سب صاف کریں",
    noNotifications: "ابھی کوئی اطلاع نہیں", notifSubtitle: "کارکنوں کے جوابات یہاں دکھیں گے",
    draftSaved: "ڈرافٹ محفوظ!", postPublished: "نوکری پوسٹ — کارکنوں کو اطلاع دی!", postUpdated: "نوکری اپڈیٹ ہو گئی!",
    postDeleted: "پوسٹ حذف!", confirmDelete: "یہ پوسٹ حذف کریں؟",
    confirmDeleteMsg: "یہ عمل واپس نہیں ہو سکتا۔", yes: "ہاں، حذف کریں", cancel: "منسوخ",
    allPosts: "سب", livePosts: "لائیو", draftPosts: "ڈرافٹس",
    editPost: "ترمیم کریں", liveLabel: "لائیو", draftLabel: "ڈرافٹ",
    publishDraft: "🚀 پوسٹ کریں",
    tipProfilePhoto: "سیٹنگز میں جائیں ← اپنی تصویر اپلوڈ کریں",
    tipCnic: "سیٹنگز میں جائیں ← شناختی کارڈ کے دونوں طرف اپلوڈ کریں",
    tipEmail: "اپنا ای میل چیک کریں اور تصدیقی لنک پر کلک کریں",
    tipFirstJob: "'نوکری پوسٹ کریں' بٹن دبائیں (ڈرافٹ نہیں) — پوائنٹس صرف پبلش کرنے پر ملتے ہیں",
    tipVerified: "ہماری ٹیم 24 گھنٹوں میں آپ کا اکاؤنٹ تصدیق کرے گی",
    boostTitle: "💡 پروفائل بہتر کیسے کریں",
    boostSub: "یہ اقدامات مکمل کریں اور جلدی کارکن پائیں",
    workerPhone: "کارکن فون", workerName: "کارکن کا نام", workerInfo: "منتخب کارکن",
    callWorker: "کارکن کو کال کریں", agreedPriceLabel: "طے شدہ قیمت",
    rateYourJob: "نوکری کی درجہ بندی کریں", rateJobSub: "آپ کا تجربہ کیسا رہا؟",
    rateWorker: "کارکن کو درجہ دیں", tapToRate: "ستارے پر ٹیپ کریں",
    reportIssue: "مسئلہ رپورٹ کریں (اختیاری)",
    reportIssueSub: "کچھ غلط ہوا؟ ہمیں بتائیں — یہ نجی ہے اور بہتری میں مددگار ہے۔",
    issueTypes: ["کام کا معیار خراب تھا", "کارکن دیر سے آیا / نہیں آیا", "کارکن بدتمیز تھا", "قیمت کا تنازعہ", "کام مکمل نہیں ہوا", "دیگر"],
    issueTypesUr: ["کام کا معیار خراب تھا", "کارکن دیر سے آیا / نہیں آیا", "کارکن بدتمیز تھا", "قیمت کا تنازعہ", "کام مکمل نہیں ہوا", "دیگر"],
    writeComment: "اضافی تبصرہ (اختیاری)",
    writeCommentPlaceholder: "اپنے تجربے کے بارے میں مزید بتائیں...",
    submitFeedback: "فیڈبیک جمع کریں", skipFeedback: "ابھی نہیں",
    feedbackThankYou: "آپ کی رائے کا شکریہ! 🙏",
    excellentJob: "بہترین!", goodJob: "اچھا", averageJob: "ٹھیک ہے", poorJob: "خراب", terribleJob: "بہت خراب",
    issueReported: "مسئلہ رپورٹ ہو گیا — ہماری ٹیم جائزہ لے گی۔",
    myProfile: "میری پروفائل", editProfile: "ترمیم کریں", saveChanges: "تبدیلیاں محفوظ کریں",
    profileSettings: "پروفائل سیٹنگز", accountSettings: "اکاؤنٹ سیٹنگز",
    fullName: "پورا نام", emailAddress: "ای میل پتہ", phoneNumber: "فون نمبر",
    currentPassword: "موجودہ پاسورڈ", newPassword: "نیا پاسورڈ", confirmPassword: "پاسورڈ کی تصدیق",
    changePassword: "پاسورڈ تبدیل کریں", uploadPhoto: "تصویر اپلوڈ کریں",
    jobsPosted: "پوسٹ کی نوکریاں", jobsCompleted: "مکمل نوکریاں", memberSince: "رکنیت",
    profileUpdated: "پروفائل کامیابی سے اپڈیٹ ہو گئی!",
    swalProfileUpdated: "پروفائل اپڈیٹ ہو گئی!", swalProfileUpdatedText: "آپ کی پروفائل کامیابی سے محفوظ ہو گئی۔",
    swalProfileError: "خرابی", swalProfileErrorText: "پروفائل اپڈیٹ ناکام ہوئی۔",
    swalPwChanged: "پاسورڈ تبدیل ہو گیا!", swalPwChangedText: "آپ کا پاسورڈ کامیابی سے اپڈیٹ ہو گیا۔",
    swalPwError: "خرابی", swalPwErrorText: "پاسورڈ تبدیل کرنے میں ناکامی۔",
    swalDone: "ہو گیا!", swalGreat: "بہت اچھا!",
    pwSecureSubtitle: "مضبوط پاسورڈ سے اکاؤنٹ محفوظ رکھیں",
    pwCheck1: "کم از کم 8 حروف", pwCheck2: "بڑا حرف (A-Z)",
    pwCheck3: "چھوٹا حرف (a-z)", pwCheck4: "نمبر (0-9)",
    pwCheck5: "خاص نشان (!@#$...)",
    pwWeak: "کمزور", pwFair: "ٹھیک ہے", pwStrong: "مضبوط",
    logoutConfirmTitle: "لاگ آؤٹ؟", logoutConfirmMsg: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
    logoutConfirm: "ہاں، لاگ آؤٹ کریں", stayIn: "رہیں",
    negotiateInfo: "کارکن اپنی قیمت بھیجیں گے۔ بہترین قیمت قبول کریں۔",
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
  card: (extra = {}) => ({
    background: "#fff", borderRadius: 18,
    boxShadow: "0 2px 16px rgba(15,23,42,0.07)", overflow: "hidden", ...extra,
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

const CATS = [
  { id: "electrician", label: "Electrician", labelUr: "الیکٹریشن", icon: "⚡" },
  { id: "plumber", label: "Plumber", labelUr: "پلمبر", icon: "🔧" },
  { id: "carpenter", label: "Carpenter", labelUr: "بڑھئی", icon: "🪚" },
  { id: "painter", label: "Painter", labelUr: "پینٹر", icon: "🖌️" },
  { id: "cleaner", label: "Cleaner", labelUr: "صفائی", icon: "🧹" },
  { id: "driver", label: "Driver", labelUr: "ڈرائیور", icon: "🚗" },
  { id: "mason", label: "Mason", labelUr: "راج", icon: "🧱" },
  { id: "welder", label: "Welder", labelUr: "ویلڈر", icon: "🔥" },
  { id: "househelp", label: "House Help", labelUr: "گھریلو مددگار", icon: "🏠" },
  { id: "babysitter", label: "Babysitter", labelUr: "بچوں کی دیکھ بھال", icon: "🧸" },
  { id: "ac_repair", label: "AC Repair", labelUr: "AC مکینک", icon: "❄️" },
  { id: "tutor", label: "Tutor", labelUr: "ٹیوٹر", icon: "📚" },
  { id: "security", label: "Security Guard", labelUr: "سیکیورٹی گارڈ", icon: "🛡️" },
  { id: "gardener", label: "Gardener", labelUr: "مالی", icon: "🌿" },
  { id: "it_support", label: "IT Support", labelUr: "IT سپورٹ", icon: "💻" },
  { id: "cook", label: "Cook", labelUr: "باورچی", icon: "👨‍🍳" },
  { id: "tailor", label: "Tailor", labelUr: "درزی", icon: "🧵" },
  { id: "photographer", label: "Photographer", labelUr: "فوٹوگرافر", icon: "📷" },
  { id: "other", label: "Other", labelUr: "دیگر", icon: "🛠️" },
];

const BLANK = {
  title: "", description: "", category: "electrician",
  customCategory: "", workLocation: "", pickupLocation: "", dropLocation: "",
  budgetType: "fixed", offeredPrice: "", urgency: "flexible",
  jobDuration: "", lat: null, lng: null,
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

/* ═══════════════ PROFILE TAB ═══════════════ */
function ProfileTab({ t, lang, user, userProfile, myPosts, onProfileUpdate }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef(null);
  const [toast, setToast] = useState("");

  const [completedJobs, setCompletedJobs] = useState(0);
  const totalPosted = myPosts.filter(p => p.status === "live").length;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = stored?.id || stored?._id;
    if (!uid) return;
    fetch(`http://localhost:5000/api/job-requests/employer/${uid}?status=completed`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCompletedJobs(data.length); })
      .catch(() => {});
  }, []);
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
  const swal = (opts) => typeof window !== "undefined" && window.Swal && window.Swal.fire(opts);

  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("swal-cdn")) {
      const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css"; document.head.appendChild(link);
      const script = document.createElement("script"); script.id = "swal-cdn"; script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11"; document.head.appendChild(script);
    }
  }, []);

  const handleChangePassword = async () => {
    setChangingPw(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        swal({ title: t.swalPwError, text: data.error || t.swalPwErrorText, icon: "error", confirmButtonColor: "#3b82f6" });
        setChangingPw(false); return;
      }
      swal({ title: t.swalPwChanged, text: t.swalPwChangedText, icon: "success", confirmButtonColor: "#3b82f6", confirmButtonText: t.swalDone });
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (_) { swal({ title: t.swalPwError, text: t.swalPwErrorText, icon: "error", confirmButtonColor: "#3b82f6" }); }
    setChangingPw(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      const res = await fetch("http://localhost:5000/api/auth/update-profile-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const photoUrl = data.user.documents?.profilePhoto;
        if (photoUrl) {
          setPhotoPreview(photoUrl);
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          const updated = { ...stored, documents: { ...(stored.documents || {}), profilePhoto: photoUrl } };
          localStorage.setItem("user", JSON.stringify(updated));
          onProfileUpdate(updated);
        }
        showToastMsg("Profile photo updated!");
      } else {
        showToastMsg(data.error || "Photo upload failed");
      }
    } catch (_) { showToastMsg("Photo upload failed"); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { showToastMsg("Not logged in"); setSaving(false); return; }
      const res = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { swal({ title: t.swalProfileError, text: data.error || t.swalProfileErrorText, icon: "error", confirmButtonColor: "#3b82f6" }); setSaving(false); return; }
      const fresh = data.user || {};
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...stored, ...editForm, ...fresh };
      localStorage.setItem("user", JSON.stringify(updated));
      onProfileUpdate(updated);
      swal({ title: t.swalProfileUpdated, text: t.swalProfileUpdatedText, icon: "success", confirmButtonColor: "#3b82f6", confirmButtonText: t.swalGreat });
    } catch (_) { swal({ title: t.swalProfileError, text: t.swalProfileErrorText, icon: "error", confirmButtonColor: "#3b82f6" }); }
    setSaving(false);
  };

  const docs = userProfile?.documents || {};
  const hasProfilePhoto = !!(docs.profilePhoto || userProfile?.profilePhoto || userProfile?.avatar || photoPreview);
  const hasCnic = !!(docs.cnicFront && docs.cnicBack) || !!(userProfile?.cnicVerified);
  const isEmailVerified = !!(userProfile?.isEmailVerified || userProfile?.emailVerified);
  const isAdminVerified = !!(userProfile?.isVerified || userProfile?.adminVerified);

  const progressSteps = [
    { label: t.stepRegistered, done: true, points: 10 },
    { label: t.stepProfilePhoto, done: hasProfilePhoto, points: 20 },
    { label: t.stepCnicDocs, done: hasCnic, points: 20 },
    { label: t.stepEmailVerified, done: isEmailVerified, points: 10 },
    { label: t.stepFirstJob, done: totalPosted > 0, points: 20 },
    { label: t.stepVerified, done: isAdminVerified, points: 20 },
  ];
  const earned = progressSteps.filter(s => s.done).reduce((a, x) => a + x.points, 0);
  const total = progressSteps.reduce((a, x) => a + x.points, 0);
  const pct = Math.round((earned / total) * 100);

  const avatar = photoPreview || userProfile?.documents?.profilePhoto || userProfile?.avatar || userProfile?.profilePhoto || null;
  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const SECTIONS = [
    { id: "overview", icon: User, label: lang === "ur" ? "جائزہ" : "Overview" },
    { id: "edit", icon: Edit2, label: lang === "ur" ? "پروفائل ترمیم" : "Edit Profile" },
    { id: "security", icon: Lock, label: lang === "ur" ? "سیکیورٹی" : "Security" },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {toast && (
        <div style={{ background: "#0f172a", color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center", marginBottom: 16, animation: "slideUp .3s" }}>
          ✅ {toast}
        </div>
      )}

      {/* Profile Hero Card */}
      <div style={{ background: "linear-gradient(135deg,#0b1526,#1a3255)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(59,130,246,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(139,92,246,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", border: pct === 100 ? "3px solid #3b82f6" : "3px solid rgba(255,255,255,.2)", overflow: "hidden", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {avatar ? (
                <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{initials}</span>
              )}
            </div>
            {pct === 100 && (
              <div title="Verified Profile — 100% Complete" style={{ position: "absolute", top: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#2563eb)", border: "2.5px solid #0b1526", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 900, boxShadow: "0 2px 8px rgba(59,130,246,.5)", zIndex: 2 }}>✓</div>
            )}
            <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "#3b82f6", border: "2px solid #0b1526", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={13} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-.3px" }}>{user?.name || "—"}</h2>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, margin: "0 0 12px" }}>{user?.email}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {isAdminVerified && <span style={{ background: "rgba(34,197,94,.15)", color: "#4ade80", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(74,222,128,.2)" }}>✓ Verified</span>}
              <span style={{ background: "rgba(59,130,246,.15)", color: "#93c5fd", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(147,197,253,.2)" }}>Employer</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 24 }}>
          {[
            { icon: "📋", value: totalPosted, label: t.jobsPosted },
            { icon: "✅", value: completedJobs, label: t.jobsCompleted },
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
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${activeSection === sec.id ? "#3b82f6" : "#e2e8f0"}`, background: activeSection === sec.id ? "#eff6ff" : "#fff", color: activeSection === sec.id ? "#2563eb" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .15s" }}>
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
                <div style={{ fontSize: 28, fontWeight: 900, color: pct >= 80 ? "#3b82f6" : pct >= 50 ? "#6366f1" : "#f59e0b", lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{earned}/{total} pts</div>
              </div>
            </div>
            <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ height: "100%", borderRadius: 99, background: pct >= 80 ? "linear-gradient(90deg,#3b82f6,#2563eb)" : "linear-gradient(90deg,#f59e0b,#d97706)", width: `${pct}%`, transition: "width 1s ease-out" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {progressSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: step.done ? "#f0f9ff" : "#f8fafc", border: `1px solid ${step.done ? "#bae6fd" : "#e2e8f0"}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? "#3b82f6" : "#e2e8f0", fontSize: 11, color: step.done ? "#fff" : "#94a3b8", fontWeight: 800 }}>{step.done ? "✓" : i + 1}</div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: step.done ? 600 : 500, color: step.done ? "#1d4ed8" : "#475569" }}>{step.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.done ? "#2563eb" : "#94a3b8", background: step.done ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>+{step.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Account Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: User, label: "Full Name", value: user?.name || "—" },
                { icon: Mail, label: "Email", value: user?.email || "—" },
                { icon: Phone, label: "Phone", value: userProfile?.phone || user?.phone || "Not set" },
                { icon: Shield, label: "Account Status", value: isAdminVerified ? "Verified ✓" : "Pending Verification" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={15} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{item.label}</div>
                    <div style={{ fontSize: 13.5, color: "#0f172a", fontWeight: 600, marginTop: 1 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveSection("edit")} style={{ ...S.btn("linear-gradient(135deg,#3b82f6,#2563eb)", "#fff", { width: "100%", marginTop: 16 }) }}>
              <Edit2 size={14} /> {t.editProfile}
            </button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE */}
      {activeSection === "edit" && (
        <div style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 2px 14px rgba(0,0,0,.06)", border: "1.5px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 24px" }}>{t.editProfile}</h3>

          {/* Avatar upload in edit */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: "#f8fafc", borderRadius: 14, border: "1.5px solid #e2e8f0", marginBottom: 24 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2.5px solid #e2e8f0" }}>
              {avatar ? <img src={avatar} alt="dp" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{initials}</span>}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{t.uploadPhoto}</p>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>JPG, PNG — Max 5MB</p>
              <button onClick={() => fileRef.current?.click()} style={{ ...S.btn("#eff6ff", "#3b82f6", { padding: "8px 16px", fontSize: 12, border: "1.5px solid #bfdbfe" }) }}>
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
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Lock size={18} color="#3b82f6" />
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
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
                            <span style={{ fontSize: 13, color: c.pass ? "#3b82f6" : "#e2e8f0", flexShrink: 0 }}>●</span>
                            <span style={{ color: c.pass ? "#3b82f6" : "#94a3b8", fontWeight: c.pass ? 600 : 400 }}>{c.label}</span>
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
              onClick={handleChangePassword}
              disabled={changingPw || !isFormValid}
              style={{ ...S.btn("linear-gradient(135deg,#3b82f6,#2563eb)", "#fff", { width: "100%", marginTop: 24, opacity: (changingPw || !isFormValid) ? 0.5 : 1 }) }}>
              <Lock size={15} /> {changingPw ? "Saving..." : t.changePassword}
            </button>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════ POST-JOB FEEDBACK MODAL ═══════════════ */
function PostJobFeedbackModal({ t, lang, open, worker, job, requestId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  if (!open) return null;
  const issueList = lang === "ur" ? t.issueTypesUr : t.issueTypes;
  const starLabels = ["", t.terribleJob, t.poorJob, t.averageJob, t.goodJob, t.excellentJob];
  const starColors = ["", "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#10b981"];
  const toggleIssue = (issue) => setSelectedIssues(prev => prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]);
  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const payload = { requestId, workerId: worker?.workerId, workerName: worker?.workerName, rating, comment, issues: selectedIssues, hasIssue: selectedIssues.length > 0, submittedAt: new Date().toISOString() };
    try { await fetch("http://localhost:5000/api/job-requests/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch (_) {}
    setSubmitted(true); setSubmitting(false);
    setTimeout(() => { onSubmit(payload); onClose(); }, 2200);
  };
  const activeRating = hoverRating || rating;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.3)", animation: "slideUp .4s cubic-bezier(.4,0,.2,1)" }}>
        {submitted ? (
          <div style={{ padding: "52px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>{t.feedbackThankYou}</h2>
            {selectedIssues.length > 0 && <p style={{ fontSize: 13, color: "#64748b", background: "#fef3c7", padding: "10px 16px", borderRadius: 10 }}>⚠️ {t.issueReported}</p>}
          </div>
        ) : (
          <>
            <div style={{ background: "linear-gradient(135deg,#0b1526,#1a3255)", padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "24px 24px 0 0" }}>
              <div><h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>{t.rateYourJob}</h2><p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "4px 0 0" }}>{t.rateJobSub}</p></div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "#fff" }}><X size={17} /></button>
            </div>
            <div style={{ padding: "24px 24px 28px" }}>
              {worker && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f8fafc", borderRadius: 14, marginBottom: 22, border: "1.5px solid #e2e8f0" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{(worker.workerName || "W").charAt(0).toUpperCase()}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>🔧 {worker.workerName}</div><div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{job?.title || job?.category || "Completed Job"}</div></div>
                </div>
              )}
              <div style={{ marginBottom: 22 }}>
                <label style={{ ...S.label, marginBottom: 10 }}>{t.rateWorker}</label>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transition: "transform .15s", transform: activeRating >= star ? "scale(1.2)" : "scale(1)" }}>
                      <Star size={38} fill={activeRating >= star ? (starColors[activeRating] || "#f59e0b") : "none"} color={activeRating >= star ? (starColors[activeRating] || "#f59e0b") : "#cbd5e1"} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
                {activeRating > 0 ? <div style={{ textAlign: "center" }}><span style={{ fontSize: 14, fontWeight: 800, color: starColors[activeRating], background: `${starColors[activeRating]}18`, padding: "4px 16px", borderRadius: 20 }}>{starLabels[activeRating]}</span></div>
                  : <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>{t.tapToRate}</p>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>{t.writeComment}</label>
                <textarea className="inp" value={comment} onChange={e => setComment(e.target.value)} placeholder={t.writeCommentPlaceholder} rows={3} style={{ ...S.input, resize: "none" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <button type="button" onClick={() => setShowIssues(!showIssues)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${selectedIssues.length > 0 ? "#fca5a5" : "#e2e8f0"}`, background: selectedIssues.length > 0 ? "#fef2f2" : "#f8fafc", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={15} color={selectedIssues.length > 0 ? "#ef4444" : "#94a3b8"} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: selectedIssues.length > 0 ? "#dc2626" : "#64748b" }}>{t.reportIssue}</span>
                    {selectedIssues.length > 0 && <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>{selectedIssues.length}</span>}
                  </div>
                  <span style={{ fontSize: 16, color: "#94a3b8" }}>{showIssues ? "▲" : "▼"}</span>
                </button>
                {showIssues && (
                  <div style={{ marginTop: 10, padding: "14px 16px", background: "#fef2f2", borderRadius: 12, border: "1.5px solid #fecaca" }}>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>{t.reportIssueSub}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {issueList.map((issue, idx) => (
                        <button key={idx} type="button" onClick={() => toggleIssue(issue)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${selectedIssues.includes(issue) ? "#ef4444" : "#fecaca"}`, background: selectedIssues.includes(issue) ? "#fee2e2" : "#fff", cursor: "pointer" }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${selectedIssues.includes(issue) ? "#ef4444" : "#fca5a5"}`, background: selectedIssues.includes(issue) ? "#ef4444" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {selectedIssues.includes(issue) && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, color: selectedIssues.includes(issue) ? "#dc2626" : "#475569", fontWeight: selectedIssues.includes(issue) ? 700 : 500 }}>{issue}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={onClose} style={{ ...S.btn("#f1f5f9", "#475569", { flex: 1, border: "1.5px solid #e2e8f0" }) }}>{t.skipFeedback}</button>
                <button type="button" onClick={handleSubmit} disabled={rating === 0 || submitting}
                  style={{ ...S.btn(rating === 0 ? "#e2e8f0" : "linear-gradient(135deg,#3b82f6,#2563eb)", rating === 0 ? "#94a3b8" : "#fff", { flex: 2, opacity: submitting ? 0.7 : 1 }) }}>
                  {submitting ? "..." : <><ThumbsUp size={15} /> {t.submitFeedback}</>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ NOTIFICATION BELL ═══════════════ */
function NotificationBell({ notifications, setNotifications, lang, t }) {
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
    if (msg.includes("accepted") || msg.includes("✅")) return { icon: "✅", bg: "#dcfce7" };
    if (msg.includes("offer") || msg.includes("Rs.")) return { icon: "💬", bg: "#eff6ff" };
    return { icon: "🔔", bg: "#fef3c7" };
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{ background: open ? "#eff6ff" : "#f1f5f9", padding: 8, borderRadius: 10, cursor: "pointer", position: "relative", border: open ? "1.5px solid #bfdbfe" : "1.5px solid transparent", transition: "all .15s" }}>
        <Bell size={17} color={unreadCount > 0 ? "#3b82f6" : "#94a3b8"} />
        {unreadCount > 0 && <div style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, padding: "0 4px", background: "#ef4444", borderRadius: "99px", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, boxShadow: "0 0 0 2px #fff" }}>{unreadCount > 9 ? "9+" : unreadCount}</div>}
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 320, background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(15,23,42,0.15)", border: "1.5px solid #e2e8f0", zIndex: 999, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#0b1526,#1a3255)" }}>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.notifications}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{t.notifSubtitle}</div></div>
            {notifications.length > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: "#93c5fd", background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, padding: "4px 9px", cursor: "pointer", fontWeight: 600 }}>{t.markAllRead}</button>}
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{t.noNotifications}</p>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>{t.notifSubtitle}</p>
              </div>
            ) : notifications.slice().reverse().map((n, i) => {
              const isRead = readIds.has(n.id);
              const { icon, bg } = notifIcon(n.msg);
              return (
                <div key={n.id} onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                  style={{ padding: "12px 16px", borderBottom: i < notifications.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", alignItems: "flex-start", gap: 10, background: isRead ? "#fff" : "#f8faff", cursor: "pointer" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: "#0f172a", fontWeight: isRead ? 400 : 600, lineHeight: 1.45, margin: 0 }}>{n.msg}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>Just now</p>
                  </div>
                  {!isRead && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 4 }} />}
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

/* ═══════════════ EDIT POST MODAL ═══════════════ */
function EditPostModal({ t, lang, open, post, onClose, onSave }) {
  const [form, setForm] = useState(BLANK);
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open && post) setForm({ ...BLANK, ...post }); }, [open, post]);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const geocodeAddress = async (address) => {
    if (!address || address.length < 2) return;
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data[0]) { upd("lat", parseFloat(data[0].lat)); upd("lng", parseFloat(data[0].lon)); }
    } catch (_) {}
    setGeocoding(false);
  };
  const getFinalCat = () => form.category === "other" ? (form.customCategory || "other") : form.category;
  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({ ...form, category: getFinalCat() });
    setSaving(false); onClose();
  };
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ background: "linear-gradient(135deg,#0b1526,#1a3255)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div><h2 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: 0 }}>{t.editPost}</h2><p style={{ color: "rgba(255,255,255,.4)", fontSize: 11.5, margin: "3px 0 0" }}>Edit and update your job post</p></div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "#fff" }}><X size={17} /></button>
        </div>
        <div style={{ padding: "22px 24px 26px" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>{t.category}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7 }}>
              {CATS.map(cat => (
                <button key={cat.id} type="button" onClick={() => upd("category", cat.id)}
                  style={{ padding: "9px 4px", borderRadius: 10, border: `2px solid ${form.category === cat.id ? "#3b82f6" : "#e2e8f0"}`, background: form.category === cat.id ? "#eff6ff" : "#fafbfc", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{cat.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: form.category === cat.id ? "#3b82f6" : "#64748b" }}>{lang === "ur" ? cat.labelUr : cat.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={S.label}>{t.jobTitle}</label>
              <input className="inp" value={form.title} onChange={e => upd("title", e.target.value)} placeholder={t.jobTitlePlaceholder} style={S.input} />
            </div>
            <div>
              <label style={S.label}>{t.urgency}</label>
              <select value={form.urgency} onChange={e => upd("urgency", e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
                <option value="1_hour">{t.urgent1h}</option>
                <option value="today">{t.urgentToday}</option>
                <option value="this_week">{t.urgentWeek}</option>
                <option value="flexible">{t.urgentFlex}</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>{t.description}</label>
            <textarea className="inp" value={form.description} onChange={e => upd("description", e.target.value)} placeholder={t.descPlaceholder} rows={3} style={{ ...S.input, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>{t.budget}</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {["fixed", "open"].map(bt => (
                <button key={bt} type="button" onClick={() => upd("budgetType", bt)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: `2px solid ${form.budgetType === bt ? "#3b82f6" : "#e2e8f0"}`, background: form.budgetType === bt ? "#eff6ff" : "#fafbfc", color: form.budgetType === bt ? "#3b82f6" : "#94a3b8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {bt === "fixed" ? t.fixedBudget : t.openOffers}
                </button>
              ))}
            </div>
            {form.budgetType === "open" && (
              <div style={{ background: "#fffbeb", borderRadius: 10, padding: "12px 14px", border: "1.5px solid #fde68a", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🤝</span>
                <p style={{ fontSize: 12.5, color: "#92400e", margin: 0, lineHeight: 1.55 }}>{t.openOffersDesc}</p>
              </div>
            )}
            {form.budgetType === "fixed" && (
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 700, fontSize: 14 }}>Rs.</span>
                <input className="inp" type="number" value={form.offeredPrice} onChange={e => upd("offeredPrice", e.target.value)} placeholder="0" style={{ ...S.input, paddingLeft: 46 }} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ ...S.btn("#f1f5f9", "#475569", { flex: 1, border: "1.5px solid #e2e8f0" }) }}>{t.cancel}</button>
            <button onClick={handleSave} disabled={saving || !form.title.trim()}
              style={{ ...S.btn("linear-gradient(135deg,#3b82f6,#2563eb)", "#fff", { flex: 2, opacity: saving || !form.title.trim() ? 0.6 : 1 }) }}>
              <CheckCircle size={15} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ DELETE CONFIRM MODAL ═══════════════ */
function DeleteConfirmModal({ t, open, onClose, onConfirm, postTitle }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 360, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, marginBottom: 12, textAlign: "center" }}>🗑️</div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 8 }}>{t.confirmDelete}</h3>
        {postTitle && <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: 6, background: "#f1f5f9", padding: "8px 14px", borderRadius: 10 }}>"{postTitle}"</p>}
        <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 20 }}>{t.confirmDeleteMsg}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...S.btn("#f1f5f9", "#475569", { flex: 1, border: "1.5px solid #e2e8f0" }) }}>{t.cancel}</button>
          <button onClick={onConfirm} style={{ ...S.btn("linear-gradient(135deg,#ef4444,#dc2626)", "#fff", { flex: 1 }) }}>{t.yes}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function EmployerDashboard() {
  const [lang, setLang] = useState("en");
  const t = LANG[lang];

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("find");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [step, setStep] = useState("form");
  const [jobRequest, setJobRequest] = useState(BLANK);
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [workerAccepts, setWorkerAccepts] = useState([]);
  const [confirmedWorker, setConfirmedWorker] = useState(null);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [searchTimer, setSearchTimer] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const timerRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [firstJobPosted, setFirstJobPosted] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [postFilter, setPostFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");
  const toastTimerRef = useRef(null);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackWorker, setFeedbackWorker] = useState(null);
  const [feedbackJob, setFeedbackJob] = useState(null);
  const [feedbackRequestId, setFeedbackRequestId] = useState(null);

  const showToast = (msg) => { setToastMsg(msg); clearTimeout(toastTimerRef.current); toastTimerRef.current = setTimeout(() => setToastMsg(""), 3000); };

  useEffect(() => {
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; return e.returnValue; };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const p = JSON.parse(u);
      setUser(p);
      if (p?.id && typeof window !== "undefined") {
        window.history.replaceState(null, "", `/employer/profile/${p.id}`);
      }
      socket.emit("join", p.id);
      const token = localStorage.getItem("token");
      if (token) {
        fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json()).then(data => {
            const fresh = data.data || data.user;
            if (fresh) {
              setUserProfile(fresh);
              const stored = JSON.parse(localStorage.getItem("user") || "{}");
              localStorage.setItem("user", JSON.stringify({ ...stored, ...fresh }));
            } else setUserProfile(p);
          }).catch(() => setUserProfile(p));
      } else setUserProfile(p);
      fetch(`http://localhost:5000/api/jobs/employer/${p.id}`)
        .then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setFirstJobPosted(true); }).catch(() => {});
      const saved = localStorage.getItem(`myposts_${p.id}`);
      if (saved) { try { setMyPosts(JSON.parse(saved)); } catch (_) {} }
    }
  }, []);

  useEffect(() => { if (user) localStorage.setItem(`myposts_${user.id}`, JSON.stringify(myPosts)); }, [myPosts, user]);

  useEffect(() => {
    socket.on("worker_job_accept", (data) => { setWorkerAccepts(prev => { const exists = prev.find(w => w.workerId === data.workerId); return exists ? prev : [...prev, data]; }); addNotif(`✅ ${data.workerName} accepted your request!`); });
    socket.on("worker_offer", data => { setIncomingOffers(prev => { const ex = prev.find(o => o.workerId === data.workerId); return ex ? prev.map(o => o.workerId === data.workerId ? data : o) : [...prev, data]; }); addNotif(`${data.workerName} offered Rs. ${data.price}`); });
    socket.on("worker_accepted", data => { setConfirmedWorker(data); setStep("tracking"); });
    return () => { socket.off("worker_job_accept"); socket.off("worker_offer"); socket.off("worker_accepted"); };
  }, []);

  useEffect(() => {
    if (step === "searching") { setSearchTimer(0); timerRef.current = setInterval(() => setSearchTimer(s => s + 1), 1000); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const addNotif = msg => setNotifications(p => [...p, { id: Date.now() + Math.random(), msg }]);
  const upd = (k, v) => setJobRequest(p => ({ ...p, [k]: v }));
  const getFinalCategory = () => jobRequest.category === "other" ? (jobRequest.customCategory || "other") : jobRequest.category;

  const refetchProfile = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const fresh = data.data || data.user;
        if (fresh) {
          setUserProfile(fresh);
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({ ...stored, ...fresh }));
        }
      }).catch(() => {});
  };

  const handleSaveAsDraft = async () => {
    if (!jobRequest.title.trim()) { setSubmitError("Please enter a job title to save as draft."); return; }
    setSavingDraft(true);
    const post = { ...jobRequest, category: getFinalCategory(), id: Date.now().toString(), status: "draft", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setMyPosts(prev => [post, ...prev]); showToast(t.draftSaved); setJobRequest(BLANK); setSubmitError(""); setSavingDraft(false);
  };

  const handleSendRequest = async e => {
    e.preventDefault();
    if (!user) return;
    if (jobRequest.category === "other" && !jobRequest.customCategory.trim()) { setSubmitError("Please describe the type of work needed."); return; }
    setSubmitError(""); setSubmitting(true);
    const finalCategory = getFinalCategory();
    const payload = { ...jobRequest, category: finalCategory, employer: user.id, location: jobRequest.workLocation || jobRequest.pickupLocation || "Not specified", salary: jobRequest.budgetType === "fixed" && jobRequest.offeredPrice ? `Rs. ${jobRequest.offeredPrice}` : "Negotiable", type: "temporary", latitude: jobRequest.lat, longitude: jobRequest.lng };
    try {
      const res = await fetch("http://localhost:5000/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || "Failed to post"); setSubmitting(false); return; }
      setFirstJobPosted(true);
      const token = localStorage.getItem("token");
      if (token) { fetch("http://localhost:5000/api/auth/update-profile", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ firstJobPosted: true }) }).then(() => refetchProfile()).catch(() => {}); }
      const post = { ...jobRequest, category: finalCategory, id: data._id || Date.now().toString(), backendId: data._id, status: "live", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setMyPosts(prev => [post, ...prev]);
      let requestId = data._id;
      try {
        const jrRes = await fetch("http://localhost:5000/api/job-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...jobRequest, category: finalCategory, employerId: user.id }) });
        const jrData = await jrRes.json();
        if (jrData._id) requestId = jrData._id;
      } catch (_) {}
      setActiveRequestId(requestId);
      socket.emit("new_job_request", { requestId, employerId: user.id, employerName: user.name, ...jobRequest, category: finalCategory, lat: jobRequest.lat, lng: jobRequest.lng });
      setStep("searching");
    } catch (_) {
      const fakeId = "demo_" + Date.now();
      const post = { ...jobRequest, category: finalCategory, id: fakeId, status: "live", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setMyPosts(prev => [post, ...prev]); setActiveRequestId(fakeId); setFirstJobPosted(true);
      socket.emit("new_job_request", { requestId: fakeId, employerId: user?.id, employerName: user?.name, ...jobRequest, category: finalCategory, lat: jobRequest.lat, lng: jobRequest.lng });
      setStep("searching");
    }
    setSubmitting(false);
  };

  const handlePublishDraft = async (post) => {
    if (!user) return;
    setJobRequest({ ...BLANK, ...post }); setActiveTab("find");
    setWorkerAccepts([]); setIncomingOffers([]); setConfirmedWorker(null); setSubmitError("");
    const finalCategory = post.category || "other";
    const payload = { ...post, category: finalCategory, employer: user.id, location: post.workLocation || post.pickupLocation || "Not specified", salary: post.budgetType === "fixed" && post.offeredPrice ? `Rs. ${post.offeredPrice}` : "Negotiable", type: "temporary", latitude: post.lat, longitude: post.lng };
    try {
      const res = await fetch("http://localhost:5000/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        setFirstJobPosted(true);
        const token = localStorage.getItem("token");
        if (token) { fetch("http://localhost:5000/api/auth/update-profile", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ firstJobPosted: true }) }).then(() => refetchProfile()).catch(() => {}); }
        setMyPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: "live", backendId: data._id, updatedAt: new Date().toISOString() } : p));
        let requestId = data._id;
        try {
          const jrRes = await fetch("http://localhost:5000/api/job-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...post, category: finalCategory, employerId: user.id }) });
          const jrData = await jrRes.json();
          if (jrData._id) requestId = jrData._id;
        } catch (_) {}
        setActiveRequestId(requestId);
        socket.emit("new_job_request", { requestId, employerId: user.id, employerName: user.name, ...post, category: finalCategory, lat: post.lat, lng: post.lng });
        addNotif(`📢 "${post.title}" is now live!`); setStep("searching");
      } else throw new Error("backend error");
    } catch (_) {
      const fakeId = "demo_" + Date.now();
      setMyPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: "live", updatedAt: new Date().toISOString() } : p));
      setFirstJobPosted(true); setActiveRequestId(fakeId);
      socket.emit("new_job_request", { requestId: fakeId, employerId: user?.id, employerName: user?.name, ...post, category: finalCategory, lat: post.lat, lng: post.lng });
      addNotif(`📢 "${post.title}" is now live!`); setStep("searching");
    }
  };

  const handleSaveEdit = async (formData) => {
    const updated = { ...editingPost, ...formData, updatedAt: new Date().toISOString() };
    setMyPosts(prev => prev.map(p => p.id === editingPost.id ? updated : p));
    showToast(t.postUpdated); setEditingPost(null);
  };

  const handleDeletePost = (id) => { setMyPosts(prev => prev.filter(p => p.id !== id)); setDeleteConfirm(null); showToast(t.postDeleted); };

  const handleConfirmWorker = (worker) => {
    try { fetch(`http://localhost:5000/api/job-requests/${activeRequestId}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId: worker.workerId, workerName: worker.workerName, workerPhone: worker.workerPhone || "", finalPrice: jobRequest.offeredPrice }) }); } catch (_) {}
    socket.emit("employer_confirm_worker", { requestId: activeRequestId, workerId: worker.workerId, employerName: user.name, finalPrice: jobRequest.offeredPrice });
    setConfirmedWorker({ ...worker, price: jobRequest.offeredPrice }); setStep("tracking");
  };

  const handleDismissWorker = (worker) => {
    socket.emit("employer_dismiss_worker", { requestId: activeRequestId, workerId: worker.workerId });
    setWorkerAccepts(prev => prev.filter(w => w.workerId !== worker.workerId));
  };

  const handleAcceptOffer = async offer => {
    try { await fetch(`http://localhost:5000/api/job-requests/${activeRequestId}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId: offer.workerId, workerName: offer.workerName, workerPhone: offer.phone || "", finalPrice: offer.price }) }); } catch (_) {}
    socket.emit("employer_accepted", { requestId: activeRequestId, workerId: offer.workerId, employerName: user.name });
    setConfirmedWorker(offer); setStep("tracking");
  };

  const handleRejectOffer = wid => { setIncomingOffers(p => p.filter(o => o.workerId !== wid)); socket.emit("employer_rejected", { requestId: activeRequestId, workerId: wid }); };
  const handleCounterOffer = (offer, price) => socket.emit("employer_counter", { requestId: activeRequestId, workerId: offer.workerId, price, employerName: user.name });

  const handleJobComplete = () => {
    setFeedbackWorker(confirmedWorker);
    setFeedbackJob({ title: jobRequest.title, category: getFinalCategory() });
    setFeedbackRequestId(activeRequestId);
    setShowFeedback(true);
  };

  const resetFlow = () => {
    if (activeRequestId && !activeRequestId.startsWith("demo_")) { fetch(`http://localhost:5000/api/job-requests/${activeRequestId}/complete`, { method: "PATCH" }).catch(() => {}); }
    setStep("form"); setJobRequest(BLANK); setIncomingOffers([]); setWorkerAccepts([]); setConfirmedWorker(null); setActiveRequestId(null);
  };

  const handleFeedbackSubmit = (payload) => {
    setShowFeedback(false);
    if (payload?.hasIssue) showToast(t.issueReported);
    else showToast(t.feedbackThankYou);
    resetFlow();
  };

  const handleFeedbackSkip = () => { setShowFeedback(false); resetFlow(); };

  const handleLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); window.location.href = "/"; };

  const handleProfileUpdate = (updatedUser) => { setUser(updatedUser); setUserProfile(updatedUser); refetchProfile(); };

  if (!user) return <Loader t={t} />;

  const filteredPosts = postFilter === "all" ? myPosts : myPosts.filter(p => p.status === postFilter);

  const NAV = [
    { id: "find", icon: Search, label: t.navFind },
    { id: "requests", icon: Briefcase, label: t.navRequests },
    { id: "history", icon: Clock, label: t.navHistory },
    { id: "profile", icon: User, label: t.navProfile },
  ];

  const avatar = userProfile?.documents?.profilePhoto || userProfile?.avatar || userProfile?.profilePhoto || null;
  const initials = (user.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(1.65)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .inp:focus{border-color:#3b82f6!important;background:#fff!important;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
        .nav-btn:hover{background:rgba(255,255,255,.08)!important}
        .cat-btn:hover{transform:translateY(-2px);border-color:#93c5fd!important}
        .act-btn:hover{opacity:.88;transform:translateY(-1px)}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}
        @media(max-width:600px){.form-5col{grid-template-columns:repeat(2,1fr)!important}.form-2col{grid-template-columns:1fr!important}.main-pad{padding:14px!important}}
        .icon-action:hover{background:#f1f5f9!important;transform:scale(1.08)}
        .post-card:hover{box-shadow:0 4px 20px rgba(15,23,42,0.12)!important}
        .sidebar-link:hover .sidebar-label{opacity:1!important}
      `}</style>

      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#fff", padding: "12px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, animation: "toastIn .3s ease-out", boxShadow: "0 8px 24px rgba(0,0,0,.25)", whiteSpace: "nowrap" }}>
          {toastMsg}
        </div>
      )}

      <div dir={t.dir} style={{ minHeight: "100vh", display: "flex", background: "#f0f4f9", fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "'Outfit', sans-serif" }}>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 99 }} />}

        {/* ── SIDEBAR (fixed height, no stretch, no scroll) ── */}
        <aside style={{
          width: sidebarOpen ? 240 : 64,
          background: "linear-gradient(160deg,#0b1526 0%,#162644 65%,#1a3255 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          transition: "width .28s cubic-bezier(.4,0,.2,1)",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: t.dir === "rtl" ? "auto" : 0,
          right: t.dir === "rtl" ? 0 : "auto",
          height: "100vh",
          zIndex: 100,
          boxShadow: "3px 0 18px rgba(0,0,0,.18)",
          overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
            {sidebarOpen && (
              <div style={{ animation: "fadeIn .25s" }}>
                <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-.4px", background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RozgarHub</div>
                <div style={{ fontSize: 9, opacity: .35, letterSpacing: ".12em", marginTop: 1, color: "#94a3b8" }}>EMPLOYER PORTAL</div>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,.07)", border: "none", color: "#94a3b8", padding: 7, borderRadius: 8, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "hidden" }}>
            {NAV.map(item => (
              <button key={item.id} className="nav-btn"
                onClick={() => { setActiveTab(item.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "11px 13px" : "11px", borderRadius: 10, border: "none", cursor: "pointer", justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", background: activeTab === item.id ? "rgba(59,130,246,.22)" : "transparent", color: activeTab === item.id ? "#93c5fd" : "rgba(255,255,255,.5)", fontWeight: activeTab === item.id ? 700 : 500, fontSize: 13, fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "'Outfit', sans-serif", transition: "all .18s", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", position: "relative" }}>
                <item.icon size={16} />
                {sidebarOpen && <span style={{ animation: "fadeIn .2s" }}>{item.label}</span>}
                {activeTab === item.id && <div style={{ position: "absolute", left: t.dir === "rtl" ? "auto" : 0, right: t.dir === "rtl" ? 0 : "auto", top: "20%", bottom: "20%", width: 3, borderRadius: 99, background: "#3b82f6" }} />}
              </button>
            ))}
          </nav>

          {/* User + Logout at bottom */}
          <div style={{ padding: "8px 8px 12px", borderTop: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
            {/* Profile Button */}
            <button
              onClick={() => { setActiveTab("profile"); if (window.innerWidth < 768) setSidebarOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: 10, border: "none", cursor: "pointer", width: "100%", background: activeTab === "profile" ? "rgba(59,130,246,.15)" : "rgba(255,255,255,.04)", marginBottom: 4, justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", transition: "background .15s" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, overflow: "hidden", border: "2px solid rgba(255,255,255,.12)" }}>
                {avatar ? <img src={avatar} alt="dp" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#fff" }}>{initials}</span>}
              </div>
              {sidebarOpen && (
                <div style={{ overflow: "hidden", textAlign: t.dir === "rtl" ? "right" : "left", animation: "fadeIn .25s" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                </div>
              )}
            </button>

            {/* Logout Button */}
            <button onClick={() => setShowLogoutConfirm(true)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px", borderRadius: 10, border: "none", cursor: "pointer", width: "100%", background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 12.5, fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "'Outfit', sans-serif", justifyContent: sidebarOpen ? (t.dir === "rtl" ? "flex-end" : "flex-start") : "center", flexDirection: t.dir === "rtl" ? "row-reverse" : "row", transition: "background .15s" }}>
              <LogOut size={15} />
              {sidebarOpen && <span style={{ animation: "fadeIn .2s" }}>{t.logout}</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT (push right of fixed sidebar) ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: t.dir === "rtl" ? 0 : (sidebarOpen ? 240 : 64), marginRight: t.dir === "rtl" ? (sidebarOpen ? 240 : 64) : 0, transition: "margin .28s cubic-bezier(.4,0,.2,1)", minWidth: 0 }}>
          {/* Header */}
          <header style={{ background: "#fff", borderBottom: "1px solid #e8edf3", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: "#f1f5f9", border: "none", borderRadius: 9, padding: 8, cursor: "pointer", display: "flex" }}>
                <Menu size={17} color="#475569" />
              </button>
              <div style={{ textAlign: t.dir === "rtl" ? "right" : "left" }}>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {step === "tracking" ? (lang === "ur" ? "نوکری ٹریکنگ" : "Job Tracking") :
                    activeTab === "find" ? `🔍 ${t.navFind}` :
                      activeTab === "requests" ? `📋 ${t.navRequests}` :
                        activeTab === "history" ? `🕐 ${t.navHistory}` :
                          `👤 ${t.navProfile}`}
                </h1>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{t.welcomeBack}, {user.name}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setLang(l => l === "en" ? "ur" : "en")}
                style={{ padding: "7px 14px", borderRadius: 9, border: "2px solid #3b82f6", background: "#eff6ff", color: "#3b82f6", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: lang === "en" ? "'Noto Nastaliq Urdu', serif" : "'Outfit', sans-serif" }}>
                {t.langBtn}
              </button>
              <NotificationBell notifications={notifications} setNotifications={setNotifications} lang={lang} t={t} />
            </div>
          </header>

          {/* Main scroll area */}
          <main className="main-pad" style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
            {step === "tracking" && confirmedWorker && (
              <JobTracker
                role="employer"
                job={{ requestId: activeRequestId, title: jobRequest.title, category: getFinalCategory(), workLocation: jobRequest.workLocation, lat: jobRequest.lat, lng: jobRequest.lng, jobDuration: jobRequest.jobDuration }}
                worker={confirmedWorker}
                employer={{ employerId: user.id, employerName: user.name, employerPhone: user.phone }}
                agreedPrice={confirmedWorker.price || jobRequest.offeredPrice}
                socket={socket}
                onJobComplete={handleJobComplete}
                lang={lang} t={t}
              />
            )}
            {step !== "tracking" && activeTab === "find" && (
              <FindWorkerFlow
                t={t} lang={lang} step={step} jobRequest={jobRequest} upd={upd}
                onSubmit={handleSendRequest} onSaveAsDraft={handleSaveAsDraft}
                workerAccepts={workerAccepts} incomingOffers={incomingOffers}
                onConfirmWorker={handleConfirmWorker} onDismissWorker={handleDismissWorker}
                onAcceptOffer={handleAcceptOffer} onRejectOffer={handleRejectOffer}
                onCounterOffer={handleCounterOffer} onReset={resetFlow}
                searchTimer={searchTimer} submitError={submitError}
                submitting={submitting} savingDraft={savingDraft}
                getFinalCategory={getFinalCategory}
              />
            )}
            {step !== "tracking" && activeTab === "requests" && (
              <RequestsTab
                userId={user.id} t={t} lang={lang}
                userProfile={userProfile}
                firstJobPosted={firstJobPosted || !!(userProfile?.firstJobPosted)}
                onGoPostJob={() => setActiveTab("find")}
                myPosts={myPosts} postFilter={postFilter} filteredPosts={filteredPosts}
                setPostFilter={setPostFilter}
                onEdit={(post) => { setEditingPost(post); setShowEditModal(true); }}
                onDelete={(post) => setDeleteConfirm({ id: post.id, title: post.title })}
                onPublishDraft={handlePublishDraft}
              />
            )}
            {step !== "tracking" && activeTab === "history" && (
              <HistoryTab userId={user.id} t={t} lang={lang} />
            )}
            {step !== "tracking" && activeTab === "profile" && (
              <ProfileTab t={t} lang={lang} user={user} userProfile={userProfile} myPosts={myPosts} onProfileUpdate={handleProfileUpdate} />
            )}
          </main>
        </div>
      </div>

      <EditPostModal t={t} lang={lang} open={showEditModal} post={editingPost} onClose={() => { setShowEditModal(false); setEditingPost(null); }} onSave={handleSaveEdit} />
      <DeleteConfirmModal t={t} open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDeletePost(deleteConfirm.id)} postTitle={deleteConfirm?.title} />
      <LogoutConfirmModal t={t} open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />
      <PostJobFeedbackModal t={t} lang={lang} open={showFeedback} worker={feedbackWorker} job={feedbackJob} requestId={feedbackRequestId} onClose={handleFeedbackSkip} onSubmit={handleFeedbackSubmit} />
    </>
  );
}

/* ═══════════════ REQUESTS TAB ═══════════════ */
function RequestsTab({ userId, t, lang, userProfile, firstJobPosted, onGoPostJob, myPosts, postFilter, filteredPosts, setPostFilter, onEdit, onDelete, onPublishDraft }) {
  const [backendRequests, setBackendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    if (!userId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/job-requests/employer/${userId}`)
      .then(r => r.json())
      .then(data => { const active = Array.isArray(data) ? data.filter(r => r.status !== "completed" && r.status !== "cancelled") : []; setBackendRequests(active); })
      .catch(() => setBackendRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [userId]);

  const urgencyLabel = (u) => ({ "1_hour": "⚡ Within 1 Hour", today: "📅 Today", this_week: "📆 This Week", flexible: "🕐 Flexible" }[u] || u);

  const statusConfig = (status) => {
    const m = {
      pending: { bg: "#fef3c7", color: "#d97706", label: "⏳ PENDING", border: "#fde68a" },
      confirmed: { bg: "#dbeafe", color: "#1d4ed8", label: "✅ CONFIRMED", border: "#bfdbfe" },
      in_progress: { bg: "#ede9fe", color: "#7c3aed", label: "🔧 IN PROGRESS", border: "#ddd6fe" },
      completed: { bg: "#dcfce7", color: "#15803d", label: "✓ COMPLETED", border: "#bbf7d0" },
      cancelled: { bg: "#fee2e2", color: "#dc2626", label: "✗ CANCELLED", border: "#fecaca" },
    };
    return m[status] || { bg: "#f1f5f9", color: "#475569", label: (status || "PENDING").toUpperCase(), border: "#e2e8f0" };
  };

  const liveCount = myPosts.filter(p => p.status === "live").length;
  const draftCount = myPosts.filter(p => p.status === "draft").length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px rgba(15,23,42,0.07)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg,#0b1526,#1a3255)", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0 }}>{lang === "ur" ? "میری پوسٹ کی گئی نوکریاں" : "My Posted Jobs"}</h3>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, margin: "3px 0 0" }}>{lang === "ur" ? "تمام پوسٹ کی گئی اور ڈرافٹ نوکریاں" : "All your posted and draft jobs"}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>🟢 {liveCount} Live</span>
            <span style={{ background: "#fef3c7", color: "#d97706", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>📝 {draftCount} Draft</span>
          </div>
        </div>
        <div style={{ padding: "12px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 6 }}>
          {[{ key: "all", label: `${t.allPosts} (${myPosts.length})` }, { key: "live", label: `${t.livePosts} (${liveCount})` }, { key: "draft", label: `${t.draftPosts} (${draftCount})` }].map(tab => (
            <button key={tab.key} onClick={() => setPostFilter(tab.key)}
              style={{ padding: "6px 14px", borderRadius: 10, border: "1.5px solid", fontSize: 12, fontWeight: 700, cursor: "pointer", borderColor: postFilter === tab.key ? "#3b82f6" : "#e2e8f0", background: postFilter === tab.key ? "#eff6ff" : "#fff", color: postFilter === tab.key ? "#3b82f6" : "#64748b", transition: "all .15s" }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "14px 22px" }}>
          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#475569", marginBottom: 6 }}>{lang === "ur" ? "ابھی کوئی پوسٹ نہیں" : "No posts yet"}</p>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>{lang === "ur" ? "\"کارکن تلاش کریں\" سے نوکری پوسٹ کریں" : "Go to \"Find Worker\" to post your first job"}</p>
              <button onClick={onGoPostJob} style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🔍 {lang === "ur" ? "کارکن تلاش کریں" : "Find a Worker"}</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredPosts.map(post => (
                <div key={post.id} className="post-card" style={{ borderRadius: 14, border: post.status === "draft" ? "2px dashed #fbbf24" : "1.5px solid #e2e8f0", overflow: "hidden", transition: "box-shadow .2s", position: "relative" }}>
                  <div style={{ height: 3, background: post.status === "live" ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#fbbf24,#f59e0b)" }} />
                  <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 7 }}>
                        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 800, background: post.status === "live" ? "#dcfce7" : "#fef3c7", color: post.status === "live" ? "#15803d" : "#d97706" }}>{post.status === "live" ? `🟢 ${t.liveLabel}` : `📝 ${t.draftLabel}`}</span>
                        <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, background: "#f1f5f9", padding: "2px 9px", borderRadius: 20 }}>{post.category}</span>
                        {post.urgency && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, background: "#fef3c7", padding: "2px 9px", borderRadius: 20 }}>{urgencyLabel(post.urgency)}</span>}
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{post.title || "Untitled"}</h4>
                      {post.description && <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 8px", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</p>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12 }}>
                        {post.workLocation && <span style={{ color: "#475569" }}>📍 {post.workLocation}</span>}
                        {post.offeredPrice && <span style={{ color: "#16a34a", fontWeight: 700 }}>💰 Rs. {post.offeredPrice}</span>}
                        {post.budgetType === "open" && <span style={{ color: "#d97706", fontWeight: 700 }}>🤝 Open to Offers</span>}
                        {post.jobDuration && <span style={{ color: "#6366f1", fontWeight: 600 }}>⏱ {post.jobDuration}</span>}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>{post.status === "draft" ? (lang === "ur" ? "محفوظ:" : "Saved:") : (lang === "ur" ? "پوسٹ:" : "Posted:")} {new Date(post.updatedAt || post.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                      {post.status === "draft" && <button onClick={() => onPublishDraft(post)} style={{ padding: "6px 12px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{t.publishDraft}</button>}
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="icon-action" onClick={() => onEdit(post)} title={t.editPost} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}><Edit2 size={13} color="#475569" /></button>
                        <button className="icon-action" onClick={() => onDelete(post)} title={t.yes} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}><Trash2 size={13} color="#ef4444" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>{lang === "ur" ? "فعال درخواستیں" : "Active Requests"}</h3>
        <button onClick={fetchRequests} style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={12} /> {lang === "ur" ? "تازہ کریں" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 36, height: 36, border: "4px solid #dbeafe", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
          <p style={{ color: "#94a3b8", fontSize: 13 }}>{t.loading}</p>
        </div>
      ) : backendRequests.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: "32px 20px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{t.noRequests}</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>{t.noRequestsSub}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {backendRequests.map(req => {
            const sc = statusConfig(req.status);
            return (
              <div key={req._id} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: `1.5px solid ${sc.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{req.title || req.category || "Job Request"}</h4>
                    <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, background: "#f1f5f9", padding: "2px 9px", borderRadius: 20 }}>{req.category}</span>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: sc.bg, color: sc.color, flexShrink: 0, marginLeft: 10 }}>{sc.label}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: req.acceptedWorker ? 12 : 0 }}>
                  {req.workLocation && <span style={{ fontSize: 12.5, color: "#475569" }}>📍 {req.workLocation}</span>}
                  {req.urgency && <span style={{ fontSize: 11.5, color: "#f59e0b", fontWeight: 700, background: "#fef3c7", padding: "2px 9px", borderRadius: 20 }}>{urgencyLabel(req.urgency)}</span>}
                  {req.jobDuration && <span style={{ fontSize: 11.5, color: "#6366f1", fontWeight: 600, background: "#f5f3ff", padding: "2px 9px", borderRadius: 20 }}>⏱ {req.jobDuration}</span>}
                  {req.offeredPrice && <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 700, background: "#f0fdf4", padding: "2px 9px", borderRadius: 20 }}>💰 Rs. {req.offeredPrice}</span>}
                </div>
                {req.acceptedWorker && (
                  <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #86efac", marginTop: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 10px" }}>{t.workerInfo}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{(req.acceptedWorker.name || "W").charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>🔧 {req.acceptedWorker.name || "—"}</div>
                          {req.acceptedWorker.phone && <div style={{ fontSize: 12.5, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>📞 {req.acceptedWorker.phone}</div>}
                        </div>
                      </div>
                      {req.acceptedWorker.phone && (
                        <a href={`tel:${req.acceptedWorker.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                          📞 {t.callWorker}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8" }}>Posted: {new Date(req.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ EMPLOYER PROFILE PROGRESS (in Requests Tab) ═══════════════ */
function EmployerProfileProgress({ t, userProfile, firstJobPosted, onGoPostJob }) {
  const [showTips, setShowTips] = useState(false);
  if (!userProfile) return null;
  const docs = userProfile.documents || {};
  const hasProfilePhoto = !!(docs.profilePhoto || userProfile.profilePhoto || userProfile.avatar);
  const hasCnicFront = !!(docs.cnicFront || userProfile.cnicFront);
  const hasCnicBack = !!(docs.cnicBack || userProfile.cnicBack);
  const hasCnic = !!((hasCnicFront && hasCnicBack) || userProfile.cnicVerified);
  const isEmailVerified = !!(userProfile.isEmailVerified || userProfile.emailVerified);
  const hasFirstJob = !!(firstJobPosted || userProfile.firstJobPosted);
  const isAdminVerified = !!(userProfile.isVerified || userProfile.adminVerified);
  const steps = [
    { key: "registered", label: t.stepRegistered, done: true, points: 10, tip: null },
    { key: "profilePhoto", label: t.stepProfilePhoto, done: hasProfilePhoto, points: 20, tip: t.tipProfilePhoto },
    { key: "cnicDocs", label: t.stepCnicDocs, done: hasCnic, points: 20, tip: t.tipCnic },
    { key: "emailVerified", label: t.stepEmailVerified, done: isEmailVerified, points: 10, tip: t.tipEmail },
    { key: "firstJob", label: t.stepFirstJob, done: hasFirstJob, points: 20, action: onGoPostJob, tip: t.tipFirstJob },
    { key: "verified", label: t.stepVerified, done: isAdminVerified, points: 20, tip: t.tipVerified },
  ];
  const totalPoints = steps.reduce((s, x) => s + x.points, 0);
  const earnedPoints = steps.filter(s => s.done).reduce((s, x) => s + x.points, 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  const isComplete = percentage === 100;
  const barColor = percentage >= 80 ? "#3b82f6" : percentage >= 50 ? "#6366f1" : "#f59e0b";
  const pendingSteps = steps.filter(s => !s.done && s.tip);
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginBottom: 20, border: isComplete ? "2px solid #3b82f6" : "1.5px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>{isComplete ? t.profileComplete : t.profileProgress}</h3>
          {!isComplete && <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>{t.completeYourProfile}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isComplete && pendingSteps.length > 0 && (
            <button onClick={() => setShowTips(s => !s)} style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>
              {showTips ? "✕ Hide" : "💡 Tips"}
            </button>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: barColor, lineHeight: 1 }}>{percentage}%</div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{earnedPoints}/{totalPoints} pts</div>
          </div>
        </div>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ height: "100%", borderRadius: 99, background: isComplete ? "linear-gradient(90deg,#3b82f6,#2563eb)" : `linear-gradient(90deg,${barColor},${barColor}cc)`, width: `${percentage}%`, transition: "width 1s ease-out" }} />
      </div>
      {showTips && pendingSteps.length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#f5f3ff,#eff6ff)", borderRadius: 12, padding: 14, marginBottom: 14, border: "1.5px solid #ddd6fe" }}>
          <p style={{ fontSize: 12.5, fontWeight: 800, color: "#4f46e5", margin: "0 0 10px" }}>{t.boostTitle}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingSteps.map(s => (
              <div key={s.key} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #e0e7ff" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>→</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", margin: "0 0 2px" }}>{s.label}</p>
                  <p style={{ fontSize: 11.5, color: "#64748b", margin: 0 }}>{s.tip}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {s.action && <button onClick={s.action} style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", background: "#ede9fe", border: "none", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>{t.tapToPost}</button>}
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#ede9fe", padding: "2px 8px", borderRadius: 20 }}>+{s.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map(step => (
          <div key={step.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, background: step.done ? "#eff6ff" : "#f8fafc", border: `1px solid ${step.done ? "#bfdbfe" : "#e2e8f0"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? "#3b82f6" : "#e2e8f0", fontSize: 11, color: step.done ? "#fff" : "#94a3b8", fontWeight: 800 }}>{step.done ? "✓" : "○"}</div>
              <span style={{ fontSize: 13, fontWeight: step.done ? 600 : 500, color: step.done ? "#1d4ed8" : "#475569" }}>{step.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: step.done ? "#2563eb" : "#94a3b8", background: step.done ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>+{step.points} pts</span>
              {!step.done && step.action && <button onClick={step.action} style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", border: "none", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>{t.tapToPost}</button>}
            </div>
          </div>
        ))}
      </div>
      {isComplete && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", border: "1.5px solid #93c5fd", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8", margin: 0 }}>🎉 Profile complete! Workers will prioritize your job requests.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ HISTORY TAB ═══════════════ */
function HistoryTab({ userId, t, lang }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/api/job-requests/employer/${userId}?status=completed`)
      .then(r => r.json()).then(data => setHistory(Array.isArray(data) ? data : [])).catch(() => setHistory([])).finally(() => setLoading(false));
  }, [userId]);
  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 40, height: 40, border: "4px solid #dbeafe", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} /><p style={{ color: "#94a3b8", fontSize: 14 }}>{t.loading}</p></div>;
  if (history.length === 0) return <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "center", background: "#fff", borderRadius: 18, padding: 48, boxShadow: "0 2px 16px rgba(0,0,0,.07)" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🕐</div><p style={{ fontWeight: 700, fontSize: 16, color: "#475569", marginBottom: 6 }}>{t.noHistory}</p><p style={{ fontSize: 13, color: "#94a3b8" }}>{t.noHistorySub}</p></div>;
  const starColor = (r) => r >= 4 ? "#22c55e" : r >= 3 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#0b1526,#1a3255)", borderRadius: 18, padding: "18px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div style={{ fontSize: 11, opacity: 0.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>Jobs Completed</div><div style={{ fontSize: 36, fontWeight: 900 }}>{history.length}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, opacity: 0.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>Total Spent</div><div style={{ fontSize: 26, fontWeight: 800 }}>Rs. {history.reduce((sum, r) => sum + Number(r.finalPrice || r.offeredPrice || 0), 0).toLocaleString()}</div></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {history.map(req => (
          <div key={req._id} style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 2px 14px rgba(0,0,0,0.07)", border: "1.5px solid #dcfce7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div><h4 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{req.title || req.category || "Job"}</h4>{req.workLocation && <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>📍 {req.workLocation}</p>}</div>
              <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: "#dcfce7", color: "#15803d", flexShrink: 0, marginLeft: 12 }}>✓ COMPLETED</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              {req.jobDuration && <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, background: "#f5f3ff", padding: "3px 10px", borderRadius: 20 }}>⏱ {req.jobDuration}</span>}
              {(req.finalPrice || req.offeredPrice) && <span style={{ fontSize: 13, fontWeight: 800, color: "#16a34a" }}>💰 Rs. {req.finalPrice || req.offeredPrice}</span>}
              {req.feedback?.rating && <span style={{ fontSize: 12, fontWeight: 700, color: starColor(req.feedback.rating), background: `${starColor(req.feedback.rating)}18`, padding: "3px 10px", borderRadius: 20 }}>{"★".repeat(req.feedback.rating)}{"☆".repeat(5 - req.feedback.rating)} {req.feedback.rating}/5</span>}
            </div>
            {req.acceptedWorker && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{(req.acceptedWorker.name || "W").charAt(0).toUpperCase()}</div>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Worker: {req.acceptedWorker.name || "—"}</div></div>
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8" }}>Completed: {new Date(req.updatedAt || req.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ AI PRICING ═══════════════ */
function PricingSuggestion({ category, location, offeredPrice, lang, t }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (!category || !offeredPrice || String(offeredPrice).length < 3) { setSuggestion(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/ai/price-suggestion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, location, offeredPrice, lang }) });
        const data = await res.json();
        if (data.minRate) setSuggestion(data);
      } catch (_) {}
      setLoading(false);
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [category, location, offeredPrice, lang]);
  if (!offeredPrice || String(offeredPrice).length < 3) return null;
  if (loading) return <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, marginTop: 10 }}><div style={{ width: 13, height: 13, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} /><span style={{ fontSize: 12, color: "#94a3b8" }}>Checking market rates...</span></div>;
  if (!suggestion) return null;
  const cfg = { fair: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", msg: t.offerFair }, low: { color: "#d97706", bg: "#fffbeb", border: "#fde68a", msg: t.offerLow }, high: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", msg: t.offerHigh }, not_specified: { color: "#6366f1", bg: "#f5f3ff", border: "#ddd6fe", msg: "" } }[suggestion.assessment] || { color: "#6366f1", bg: "#f5f3ff", border: "#ddd6fe", msg: "" };
  return (
    <div style={{ marginTop: 10, borderRadius: 12, padding: "14px 16px", background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>{t.marketRate}</span><span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{suggestion.unit === "per day" ? "/day" : `/${suggestion.unit}`}</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{t.typicalRange}:</span><div style={{ flex: 1, background: "#e2e8f0", borderRadius: 99, height: 6 }}><div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${cfg.color}55,${cfg.color})`, width: "100%" }} /></div><span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>Rs. {suggestion.minRate.toLocaleString()} – {suggestion.maxRate.toLocaleString()}</span></div>
      {cfg.msg && <p style={{ fontSize: 12, color: cfg.color, fontWeight: 600, margin: "0 0 6px" }}>{cfg.msg}</p>}
      {suggestion.tipEn && <p style={{ fontSize: 11.5, color: "#64748b", margin: 0, fontStyle: "italic" }}>"{lang === "ur" ? suggestion.tipUr : suggestion.tipEn}"</p>}
    </div>
  );
}

/* ═══════════════ FIND WORKER FLOW ═══════════════ */
function FindWorkerFlow({ t, lang, step, jobRequest, upd, onSubmit, onSaveAsDraft, workerAccepts, incomingOffers, onConfirmWorker, onDismissWorker, onAcceptOffer, onRejectOffer, onCounterOffer, onReset, searchTimer, submitError, submitting, savingDraft, getFinalCategory }) {
  const [counterPrices, setCounterPrices] = useState({});
  const [generating, setGenerating] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const generateDescription = async () => {
    if (!jobRequest.category) { alert(t.selectCategory); return; }
    setGenerating(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/generate-description", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: getFinalCategory(), title: jobRequest.title, location: jobRequest.workLocation, budget: jobRequest.offeredPrice, lang }) });
      const data = await res.json();
      if (data.description) upd("description", data.description);
    } catch (_) { alert(t.serverError); }
    setGenerating(false);
  };

  const parseDescriptionWithNLP = async () => {
    if (!jobRequest.description || jobRequest.description.trim().length < 10) {
      alert(lang === "ur" ? "پہلے تفصیل لکھیں (کم از کم 10 حروف)" : "Please enter a description first (at least 10 characters)");
      return;
    }
    setParsing(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: jobRequest.description })
      });
      const data = await res.json();
      if (data.title)    upd("title", data.title);
      if (data.duration) upd("jobDuration", data.duration);
      if (data.urgency)  upd("urgency", data.urgency);
      if (data.budget && Number(data.budget) > 0) upd("offeredPrice", String(data.budget));
      if (data.location) { upd("workLocation", data.location); geocodeAddress(data.location); }
      if (data.category) {
        const validCats = ["electrician","plumber","carpenter","painter","cleaner","driver","mason","welder","tailor","gardener","cook","security","other"];
        if (validCats.includes(data.category.toLowerCase())) upd("category", data.category.toLowerCase());
      }
    } catch (_) { alert(t.serverError); }
    setParsing(false);
  };

  const geocodeAddress = async (address) => {
    if (!address || address.length < 2) return;
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data && data[0]) { upd("lat", parseFloat(data[0].lat)); upd("lng", parseFloat(data[0].lon)); }
    } catch (_) {}
    setGeocoding(false);
  };

  if (step === "searching") return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ ...S.card(), padding: "30px 24px", marginBottom: 18, textAlign: "center", animation: "slideUp .4s" }}>
        <div style={{ position: "relative", width: 84, height: 84, margin: "0 auto 16px" }}>
          {[0, 10, 20].map(i => <div key={i} style={{ position: "absolute", inset: i, borderRadius: "50%", border: `2.5px solid rgba(59,130,246,${.5 - i * .015})`, animation: `ping 2s ease-out ${i * .3}s infinite` }} />)}
          <div style={{ position: "absolute", inset: 20, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📍</div>
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>{t.searching}</h2>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>{Math.floor(searchTimer / 60)}:{String(searchTimer % 60).padStart(2, "0")} {t.elapsed}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip color="#3b82f6">📍 {jobRequest.workLocation || "Your area"}</Chip>
          <Chip color="#22c55e">💰 {jobRequest.budgetType === "open" ? t.openOffers : `Rs. ${jobRequest.offeredPrice}`}</Chip>
          {jobRequest.jobDuration && <Chip color="#6366f1">⏱ {jobRequest.jobDuration}</Chip>}
        </div>
      </div>
      {workerAccepts.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", animation: "glow 2s infinite" }} />
            {t.workersReady}
            <span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>{workerAccepts.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {workerAccepts.map((worker, i) => <WorkerAcceptCard key={worker.workerId || worker._id || i} t={t} lang={lang} worker={worker} offeredPrice={jobRequest.offeredPrice} onConfirm={() => onConfirmWorker(worker)} onDismiss={() => onDismissWorker(worker)} />)}
          </div>
        </div>
      )}
      {incomingOffers.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            {t.counterOffers}
            <span style={{ background: "#eff6ff", color: "#3b82f6", padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>{incomingOffers.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {incomingOffers.map(offer => <OfferCard key={offer.workerId} t={t} lang={lang} offer={offer} originalPrice={jobRequest.offeredPrice} counterPrice={counterPrices[offer.workerId] || ""} onCounterChange={v => setCounterPrices(p => ({ ...p, [offer.workerId]: v }))} onAccept={() => onAcceptOffer(offer)} onReject={() => onRejectOffer(offer.workerId)} onCounter={() => onCounterOffer(offer, counterPrices[offer.workerId])} />)}
          </div>
        </div>
      )}
      {workerAccepts.length === 0 && incomingOffers.length === 0 && (
        <div style={{ ...S.card(), padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ color: "#475569", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.waitingWorkers}</p>
          <p style={{ color: "#94a3b8", fontSize: 12.5 }}>{t.waitingWorkersDesc}</p>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <button className="act-btn" onClick={onReset} style={{ ...S.btn("#fef2f2", "#ef4444"), border: "1.5px solid #fecaca" }}>{t.cancelRequest}</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "slideUp .4s" }}>
      <div style={S.card()}>
        <div style={{ background: "linear-gradient(135deg,#0b1526,#1a3255)", padding: "22px 26px" }}>
          <h2 style={{ color: "#fff", fontSize: 19, fontWeight: 800, margin: "0 0 4px" }}>{t.postJob}</h2>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12.5 }}>{t.postJobSub}</p>
        </div>
        <form onSubmit={onSubmit} style={{ padding: "24px 26px 28px" }}>
          {submitError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 15px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8, color: "#dc2626", fontSize: 13 }}>
              <AlertCircle size={15} /> {submitError}
            </div>
          )}
          <div style={{ marginBottom: 22 }}>
            <label style={S.label}>{t.category}</label>
            <div className="form-5col" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginTop: 8 }}>
              {CATS.map(cat => (
                <button key={cat.id} type="button" className="cat-btn" onClick={() => upd("category", cat.id)}
                  style={{ padding: "11px 6px", borderRadius: 11, border: `2px solid ${jobRequest.category === cat.id ? "#3b82f6" : "#e2e8f0"}`, background: jobRequest.category === cat.id ? "#eff6ff" : "#fafbfc", cursor: "pointer", textAlign: "center", transition: "all .18s" }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{cat.icon}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: jobRequest.category === cat.id ? "#3b82f6" : "#64748b" }}>{lang === "ur" ? cat.labelUr : cat.label}</div>
                </button>
              ))}
            </div>
            {jobRequest.category === "other" && (
              <div style={{ marginTop: 14, background: "#f5f3ff", borderRadius: 12, padding: "16px", border: "1.5px solid #ddd6fe" }}>
                <label style={{ ...S.label, color: "#6d28d9", marginBottom: 6 }}>🛠️ {t.customCategoryLabel}</label>
                <input className="inp" value={jobRequest.customCategory} onChange={e => upd("customCategory", e.target.value)} placeholder={t.customCategoryPlaceholder} style={{ ...S.input, background: "#fff", borderColor: "#c4b5fd" }} />
                <p style={{ fontSize: 11.5, color: "#7c3aed", marginTop: 6, fontWeight: 500 }}>💡 {t.customCategoryHint}</p>
              </div>
            )}
          </div>
          <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={S.label}>{t.jobTitle}</label>
              <input className="inp" required value={jobRequest.title} onChange={e => upd("title", e.target.value)} placeholder={t.jobTitlePlaceholder} style={S.input} />
            </div>
            <div>
              <label style={S.label}>{t.urgency}</label>
              <select value={jobRequest.urgency} onChange={e => upd("urgency", e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
                <option value="1_hour">{t.urgent1h}</option>
                <option value="today">{t.urgentToday}</option>
                <option value="this_week">{t.urgentWeek}</option>
                <option value="flexible">{t.urgentFlex}</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>{t.jobDuration}</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Timer size={15} color="#94a3b8" /></div>
              <input className="inp" value={jobRequest.jobDuration} onChange={e => upd("jobDuration", e.target.value)} placeholder={t.jobDurationPlaceholder} style={{ ...S.input, paddingLeft: 38 }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {["1 Hour", "2 Hours", "Half Day", "1 Day", "2 Days", "1 Week"].map(d => (
                <button key={d} type="button" onClick={() => upd("jobDuration", d)}
                  style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${jobRequest.jobDuration === d ? "#6366f1" : "#e2e8f0"}`, background: jobRequest.jobDuration === d ? "#f5f3ff" : "#fafbfc", color: jobRequest.jobDuration === d ? "#6366f1" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7, flexWrap: "wrap", gap: 6 }}>
              <label style={{ ...S.label, marginBottom: 0 }}>{t.description}</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" onClick={parseDescriptionWithNLP} disabled={parsing}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 8, border: "none", background: parsing ? "#e2e8f0" : "linear-gradient(135deg,#0ea5e9,#0284c7)", color: parsing ? "#94a3b8" : "#fff", fontSize: 11.5, fontWeight: 700, cursor: parsing ? "not-allowed" : "pointer" }}>
                  {parsing ? (lang === "ur" ? "⏳ پارس ہو رہا ہے..." : "⏳ Parsing...") : (lang === "ur" ? "🔍 NLP سے فارم بھریں" : "🔍 Auto-Fill from Description")}
                </button>
                <button type="button" onClick={generateDescription} disabled={generating}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 8, border: "none", background: generating ? "#e2e8f0" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: generating ? "#94a3b8" : "#fff", fontSize: 11.5, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
                  {generating ? t.generating : t.generateAI}
                </button>
              </div>
            </div>
            <textarea className="inp" required value={jobRequest.description} onChange={e => upd("description", e.target.value)} placeholder={t.descPlaceholder} rows={3} style={{ ...S.input, resize: "vertical" }} />
            {parsing && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#eff6ff", borderRadius: 8, marginTop: 8, border: "1px solid #bfdbfe" }}>
                <div style={{ width: 12, height: 12, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>
                  {lang === "ur" ? "تفصیل پارس ہو رہی ہے — فارم خود بخود بھر جائے گا..." : "Parsing description — fields will auto-fill momentarily..."}
                </span>
              </div>
            )}
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 13, padding: 16, marginBottom: 16, border: "1.5px solid #e8edf3" }}>
            <label style={{ ...S.label, marginBottom: 10 }}>{t.location}</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" required value={jobRequest.workLocation}
                onChange={e => { upd("workLocation", e.target.value); upd("lat", null); upd("lng", null); }}
                onBlur={e => { if (e.target.value) geocodeAddress(e.target.value); }}
                placeholder={t.locationPlaceholder} style={{ ...S.input, background: "#fff", flex: 1 }} />
              <button type="button" onClick={() => geocodeAddress(jobRequest.workLocation)} disabled={geocoding || !jobRequest.workLocation}
                style={{ padding: "0 14px", borderRadius: 10, border: "none", flexShrink: 0, background: geocoding ? "#e2e8f0" : "#3b82f6", color: geocoding ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {geocoding ? "..." : "📍 Find"}
              </button>
            </div>
            <JobMap lat={jobRequest.lat} lng={jobRequest.lng} height={220} label={jobRequest.lat ? "✓ Pinned" : "Click map to pin"} onLocationSelect={({ lat, lng }) => { upd("lat", lat); upd("lng", lng); }} />
            {jobRequest.lat && <p style={{ fontSize: 11.5, color: "#16a34a", marginTop: 8, fontWeight: 600 }}>{t.pinned} {jobRequest.lat.toFixed(4)}, {jobRequest.lng.toFixed(4)}</p>}
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={S.label}>{t.budget}</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {["fixed", "open"].map(bt => (
                <button key={bt} type="button" onClick={() => upd("budgetType", bt)}
                  style={{ flex: 1, padding: "12px", borderRadius: 11, border: `2px solid ${jobRequest.budgetType === bt ? "#3b82f6" : "#e2e8f0"}`, background: jobRequest.budgetType === bt ? "#eff6ff" : "#fafbfc", color: jobRequest.budgetType === bt ? "#3b82f6" : "#94a3b8", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  {bt === "fixed" ? t.fixedBudget : t.openOffers}
                </button>
              ))}
            </div>
            {/* ── OPEN TO OFFERS: meaningful explanation ── */}
            {jobRequest.budgetType === "open" && (
              <div style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", borderRadius: 12, padding: "16px 18px", border: "1.5px solid #fde68a", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid #fde68a" }}>
                    <span style={{ fontSize: 18 }}>🤝</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#92400e", margin: "0 0 4px" }}>How "Open to Offers" Works</p>
                    <p style={{ fontSize: 12.5, color: "#a16207", margin: 0, lineHeight: 1.6 }}>{t.openOffersDesc}</p>
                    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: 20, border: "1px solid #fde68a" }}>📩 Workers send prices</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: 20, border: "1px solid #fde68a" }}>💬 You negotiate</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: 20, border: "1px solid #fde68a" }}>✅ Accept best deal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {jobRequest.budgetType === "fixed" && (
              <>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 700, fontSize: 14 }}>Rs.</span>
                  <input className="inp" required type="number" value={jobRequest.offeredPrice} onChange={e => upd("offeredPrice", e.target.value)} placeholder="0" style={{ ...S.input, paddingLeft: 46 }} />
                </div>
                <PricingSuggestion category={getFinalCategory()} location={jobRequest.workLocation} offeredPrice={jobRequest.offeredPrice} lang={lang} t={t} />
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onSaveAsDraft} disabled={savingDraft || submitting} className="act-btn"
              style={{ ...S.btn("#f8fafc", "#475569", { flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12 }), opacity: savingDraft || submitting ? 0.6 : 1 }}>
              <FileText size={15} /> {savingDraft ? t.savingDraft : t.saveAsDraft}
            </button>
            <button type="submit" disabled={submitting || savingDraft} className="act-btn"
              style={{ ...S.btn("linear-gradient(135deg,#3b82f6,#2563eb)", "#fff", { flex: 2, borderRadius: 12, boxShadow: "0 6px 18px rgba(59,130,246,.32)" }), opacity: submitting || savingDraft ? 0.7 : 1 }}>
              <Send size={16} /> {submitting ? t.posting : t.sendRequest}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════ PWRS BADGE ═══════════════ */
function PWRSBadge({ workerId, workerName, workerRating, lang, t }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!workerId) return;
    fetch("http://localhost:5000/api/ai/worker-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId, name: workerName || "Worker", category: "general", rating: parseFloat(workerRating) || 4.5, totalJobs: 0, completedJobs: 0, responseTimeMinutes: 10, isVerified: true, profileComplete: true }) })
      .then(r => r.json()).then(data => { setScore(data); setLoading(false); }).catch(() => setLoading(false));
  }, [workerId]);
  if (loading) return <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 14, height: 14, border: "2px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 12, color: "#94a3b8" }}>Calculating reliability score...</span></div>;
  if (!score) return null;
  const barColor = score.color || "#16a34a";
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", marginBottom: 14, border: `1.5px solid ${barColor}22` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>🤖 {t.reliabilityScore}</span><span style={{ fontSize: 15, fontWeight: 900, color: barColor }}>{score.score}/100</span></div>
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 7, overflow: "hidden", marginBottom: 8 }}><div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${barColor},${barColor}cc)`, width: `${score.score}%`, transition: "width 1s ease-out" }} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ background: `${barColor}18`, color: barColor, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{lang === "ur" ? score.labelUr : score.label}</span>{score.breakdown?.verifiedScore > 0 && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✅ Verified</span>}</div>
    </div>
  );
}

/* ═══════════════ WORKER ACCEPT CARD ═══════════════ */
function WorkerAcceptCard({ t, lang, worker, offeredPrice, onConfirm, onDismiss }) {
  return (
    <div style={{ ...S.card(), padding: 0, border: "2px solid #22c55e", animation: "slideIn .35s cubic-bezier(.4,0,.2,1)", overflow: "visible", position: "relative" }}>
      <div style={{ position: "absolute", top: -10, right: 16, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: ".06em", boxShadow: "0 2px 8px rgba(34,197,94,.4)" }}>{t.acceptedBadge}</div>
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#059669)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 0 0 3px #dcfce7" }}>
            {worker.workerPhoto ? <img src={worker.workerPhoto} alt={worker.workerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : worker.workerName?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{worker.workerName}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>⭐ {worker.workerRating || "4.8"}</span>{worker.workerExperience && <span style={{ fontSize: 12, color: "#64748b" }}>· {worker.workerExperience} exp</span>}</div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{t.yourOffer}</div><div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>Rs. {offeredPrice || "—"}</div></div>
        </div>
        <PWRSBadge workerId={worker.workerId} workerName={worker.workerName} workerRating={worker.workerRating} lang={lang} t={t} />
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", borderRadius: 8, padding: "5px 10px" }}><Zap size={12} color="#16a34a" /><span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>{t.readyNow}</span></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="act-btn" onClick={onConfirm} style={{ ...S.btn("linear-gradient(135deg,#22c55e,#16a34a)", "#fff", { flex: 1, padding: "13px", fontSize: 14.5, borderRadius: 12, boxShadow: "0 4px 14px rgba(34,197,94,.3)" }) }}><CheckCircle size={16} /> {t.confirmWorker}</button>
          <button className="act-btn" onClick={onDismiss} style={S.btn("#fef2f2", "#ef4444", { padding: "13px 15px", borderRadius: 12, border: "1.5px solid #fecaca" })}><XCircle size={16} /></button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ OFFER CARD ═══════════════ */
function OfferCard({ t, lang, offer, originalPrice, counterPrice, onCounterChange, onAccept, onReject, onCounter }) {
  const [showCounter, setShowCounter] = useState(false);
  const diff = Number(offer.price) - Number(originalPrice);
  const isHigher = diff > 0;
  return (
    <div style={{ ...S.card(), padding: 20, border: `2px solid ${isHigher ? "#fef3c7" : "#dcfce7"}`, animation: "slideUp .3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {offer.workerPhoto ? <img src={offer.workerPhoto} alt={offer.workerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : offer.workerName?.charAt(0)}
        </div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>{offer.workerName}</div><div style={{ fontSize: 12, color: "#64748b" }}>⭐ {offer.rating || "4.7"}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 800, color: isHigher ? "#f59e0b" : "#16a34a" }}>Rs. {offer.price}</div><div style={{ fontSize: 11, color: isHigher ? "#f59e0b" : "#16a34a" }}>{isHigher ? `+${diff} ${t.above}` : `${Math.abs(diff)} ${t.below}`}</div></div>
      </div>
      <PWRSBadge workerId={offer.workerId} workerName={offer.workerName} workerRating={offer.rating} lang={lang} t={t} />
      {offer.message && <div style={{ background: "#f8fafc", borderRadius: 9, padding: "8px 12px", marginBottom: 12, fontSize: 12.5, color: "#475569", fontStyle: "italic" }}>"{offer.message}"</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="act-btn" onClick={onAccept} style={{ ...S.btn("linear-gradient(135deg,#22c55e,#16a34a)", "#fff", { flex: 1, minWidth: 80 }) }}><CheckCircle size={14} /> {t.accept}</button>
        <button className="act-btn" onClick={() => setShowCounter(!showCounter)} style={{ ...S.btn("#f1f5f9", "#475569", { flex: 1, minWidth: 80 }) }}>{t.counter}</button>
        <button className="act-btn" onClick={onReject} style={{ ...S.btn("#fef2f2", "#ef4444", { padding: "13px 15px" }) }}><XCircle size={15} /></button>
      </div>
      {showCounter && (
        <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
          <input type="number" placeholder={t.counterPricePlaceholder} value={counterPrice} onChange={e => onCounterChange(e.target.value)} className="inp" style={{ ...S.input, flex: 1 }} />
          <button className="act-btn" onClick={() => { onCounter(); setShowCounter(false); }} style={S.btn("#3b82f6")}>{t.send}</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ HELPERS ═══════════════ */
function Chip({ color, children }) { return <span style={{ background: `${color}18`, color, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{children}</span>; }
function Loader({ t }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0b1526,#1a3255)", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ opacity: .45, fontSize: 13 }}>{t ? t.loading : "Loading..."}</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
