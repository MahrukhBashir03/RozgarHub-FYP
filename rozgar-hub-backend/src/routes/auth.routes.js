const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
  registerWorker,
  registerEmployer,
  verifyOTP,
  resendOTP,
  resendEmailOTP,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  uploadDriverLicense,
  updateProfile,
  changePassword,
  updateProfilePhoto,
  updateSkills,
} = require("../controllers/auth.controller");

const {
  uploadWorkerDocs,
  uploadEmployerDocs,
  uploadDriverLicense: uploadDriverLicenseMiddleware,
  uploadProfilePhoto: uploadProfilePhotoMiddleware,
} = require("../middleware/upload.middleware");
const { detectFraud } = require("../middleware/fraud.middleware");
const { verifyToken } = require("../middleware/auth.middleware");

// ── Rate Limiters ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { error: "Too many OTP requests. Try again after 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many registration attempts. Try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Worker Register ───────────────────────────────────────────
router.post("/register/worker",
  registerLimiter,
  uploadWorkerDocs,
  detectFraud,
  registerWorker
);

// ── Employer Register ─────────────────────────────────────────
router.post("/register/employer",
  registerLimiter,
  uploadEmployerDocs,
  detectFraud,
  registerEmployer
);

// ── OTP ───────────────────────────────────────────────────────
router.post("/verify-otp",       otpLimiter, verifyOTP);
router.post("/resend-otp",       otpLimiter, resendOTP);
router.post("/resend-email-otp", otpLimiter, resendEmailOTP);

// ── Login ─────────────────────────────────────────────────────
router.post("/login", loginLimiter, login);
router.post("/google", googleLogin);

// ── Password Reset ────────────────────────────────────────────
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password",  otpLimiter, resetPassword);

// ── Profile (both /profile and /me work) ─────────────────────
router.get("/profile", verifyToken, getProfile);
router.get("/me",      verifyToken, getProfile);

// ── Update Profile flags ──────────────────────────────────────
// PATCH /api/auth/update-profile
// Body: { availabilityPosted, firstJobPosted, … }
router.patch("/update-profile", verifyToken, updateProfile);

// ── Change Password ───────────────────────────────────────────
router.post("/change-password", verifyToken, changePassword);

// ── Update Profile Photo ──────────────────────────────────────
router.post("/update-profile-photo", verifyToken, uploadProfilePhotoMiddleware, updateProfilePhoto);

// ── Driver License Upload ─────────────────────────────────────
router.post(
  "/upload-driver-license",
  verifyToken,
  uploadDriverLicenseMiddleware,
  uploadDriverLicense
);

// ── Worker Skills ─────────────────────────────────────────────
router.patch("/update-skills", verifyToken, updateSkills);

module.exports = router;