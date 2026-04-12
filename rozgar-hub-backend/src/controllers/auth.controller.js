const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTPEmail } = require("../utils/sendEmail");
const { normalizePhoneNumber } = require("../utils/phone");
const { validatePassword } = require("../utils/passwordValidator");
const { buildProfileUpdate } = require("../utils/profileProgress");

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─────────────────────────────────────────────────────────────
// WORKER REGISTER
// ─────────────────────────────────────────────────────────────
exports.registerWorker = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { name, email, password, phone, cnic } = req.body;
    const normalizedPhone = normalizePhoneNumber(phone, "92");

    // ── Validate password ──
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
    }

    // ── Validate phone is provided ──
    if (!phone || !normalizedPhone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    // ── Validate files are uploaded ──
    if (!req.files || !req.files.profilePhoto || !req.files.cnicFront || !req.files.cnicBack) {
      return res.status(400).json({ error: "All documents (profilePhoto, CNIC front and back) are required." });
    }

    // Duplicate email check
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      if (!existingEmail.isEmailVerified) {
        const emailOtp = generateOTP();
        existingEmail.otp = emailOtp;
        existingEmail.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        existingEmail.otpAttempts = 0;
        existingEmail.isPhoneVerified = true;
        await existingEmail.save({ validateBeforeSave: false });
        await sendOTPEmail(email, emailOtp, existingEmail.name);
        return res.status(200).json({
          message: "Account not verified. OTP sent to email.",
          requiresVerification: true,
          email,
          phone: existingEmail.phone,
        });
      }
      return res.status(409).json({ error: "Email already registered." });
    }

    // Duplicate CNIC check
    if (cnic) {
      const existingCnic = await User.findOne({ cnic });
      if (existingCnic) {
        return res.status(409).json({ error: "CNIC already registered." });
      }
    }

    const emailOtp = generateOTP();

    // ── Extract Cloudinary URLs from uploaded files ──
    const documents = {
      profilePhoto: req.files.profilePhoto[0].secure_url,
      cnicFront: req.files.cnicFront[0].secure_url,
      cnicBack: req.files.cnicBack[0].secure_url,
      drivingLicense: null,
    };

    // ── Initialize profile progress ──
    const profileProgress = {
      profilePhoto: true, // We just uploaded it
      documents: true,    // We have CNIC docs
      category: false,
      drivingLicense: false,
      firstPost: false,
      profilePercentage: 40, // 2 out of 5 completed for workers
    };

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: normalizedPhone,
      cnic: cnic || null,
      role: "worker",
      otp: emailOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isEmailVerified: false,
      isPhoneVerified: true,
      documents,
      profileProgress,
      points: 50, // Award 50 points for completing registration with documents
    });

    await sendOTPEmail(email, emailOtp, name);

    res.status(201).json({
      message: "Worker registered! OTP sent to your email.",
      requiresVerification: true,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    console.error("registerWorker error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// EMPLOYER REGISTER
// ─────────────────────────────────────────────────────────────
exports.registerEmployer = async (req, res) => {
  try {
    const { name, email, password, phone, cnic } = req.body;
    const normalizedPhone = normalizePhoneNumber(phone, "92");

    // ── Validate password ──
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
    }

    // ── Validate phone is provided ──
    if (!phone || !normalizedPhone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    // ── Validate files are uploaded ──
    if (!req.files || !req.files.profilePhoto || !req.files.cnicFront || !req.files.cnicBack) {
      return res.status(400).json({ error: "All documents (profilePhoto, CNIC front and back) are required." });
    }

    // Duplicate email check
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      if (!existingEmail.isEmailVerified) {
        const emailOtp = generateOTP();
        existingEmail.otp = emailOtp;
        existingEmail.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        existingEmail.otpAttempts = 0;
        existingEmail.isPhoneVerified = true;
        await existingEmail.save({ validateBeforeSave: false });
        await sendOTPEmail(email, emailOtp, existingEmail.name);
        return res.status(200).json({
          message: "Account not verified. OTP sent to email.",
          requiresVerification: true,
          email,
          phone: existingEmail.phone,
        });
      }
      return res.status(409).json({ error: "Email already registered." });
    }

    // Duplicate CNIC check
    if (cnic) {
      const existingCnic = await User.findOne({ cnic });
      if (existingCnic) {
        return res.status(409).json({ error: "CNIC already registered." });
      }
    }

    const emailOtp = generateOTP();

    // ── Extract Cloudinary URLs from uploaded files ──
    const documents = {
      profilePhoto: req.files.profilePhoto[0].secure_url,
      cnicFront: req.files.cnicFront[0].secure_url,
      cnicBack: req.files.cnicBack[0].secure_url,
      drivingLicense: null,
    };

    // ── Initialize profile progress ──
    const profileProgress = {
      profilePhoto: true, // We just uploaded it
      documents: true,    // We have CNIC docs
      category: false,
      drivingLicense: false,
      firstPost: false,
      profilePercentage: 67, // 2 out of 3 completed for employers
    };

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: normalizedPhone,
      cnic: cnic || null,
      role: "employer",
      otp: emailOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isEmailVerified: false,
      isPhoneVerified: true,
      documents,
      profileProgress,
      points: 50, // Award 50 points for completing registration with documents
    });

    await sendOTPEmail(email, emailOtp, name);

    res.status(201).json({
      message: "Employer registered! OTP sent to your email.",
      requiresVerification: true,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    console.error("registerEmployer error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// VERIFY OTP (Email only)
// ─────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, emailOtp, otp } = req.body;
    const submittedOtp = emailOtp || otp;

    if (!email || !submittedOtp) {
      return res.status(400).json({
        error: "Email and OTP are required."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({ error: "No account found." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Already verified. Please login." });
    }

    // ── Verify Email OTP ──
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ error: "Too many email OTP attempts. Request a new OTP." });
    }

    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: "Email OTP expired. Request a new one." });
    }

    if (submittedOtp !== user.otp) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        error: `Wrong OTP. ${5 - user.otpAttempts} attempts left.`,
      });
    }

    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Email verified! Welcome to Rozgar Hub.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        profileComplete: user.profileComplete || false,
      },
    });
  } catch (err) {
    console.error("verifyOTP error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// RESEND OTP (Email only)
// ─────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

    if (!user) return res.status(404).json({ error: "No account found." });
    if (user.isEmailVerified) return res.status(400).json({ error: "Email already verified." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    user.isPhoneVerified = true;

    await user.save({ validateBeforeSave: false });
    await sendOTPEmail(email, otp, user.name);
    res.status(200).json({ message: "OTP resent.", emailSent: true });
  } catch (err) {
    console.error("resendOTP error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// RESEND EMAIL OTP
// ─────────────────────────────────────────────────────────────
exports.resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+otp +otpExpiry"
    );

    if (!user) return res.status(404).json({ error: "No account found." });
    if (user.isEmailVerified) return res.status(400).json({ error: "Email already verified." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (err) {
    console.error("resendEmailOTP error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Not verified → resend OTP
    if (!user.isEmailVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      await sendOTPEmail(email, otp, user.name);
      return res.status(403).json({
        message: "Email not verified. OTP sent to your email.",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        profileComplete: user.profileComplete || false,
      },
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET CURRENT USER  (GET /api/auth/me)
// ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.status(200).json({ user });
  } catch (err) {
    console.error("getMe error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE  (PUT /api/auth/profile)
// ─────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const {
      name, phone, city, address, gender, age,
      cnicNumber, trade, experience, hourlyRate, bio,
      availability, skills, companyName, businessType, howMany,
      documents, profileComplete, profileScore,
    } = req.body;

    const normalizedPhone = phone ? normalizePhoneNumber(phone, "92") : undefined;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ error: "User not found." });

    const updatePayload = {
      ...(name        && { name }),
      ...(phone       && { phone: normalizedPhone || phone }),
      ...(city        && { city }),
      ...(address     && { address }),
      ...(gender      && { gender }),
      ...(age         && { age }),
      ...(cnicNumber  && { cnicNumber }),
      ...(trade       && { trade }),
      ...(experience  && { experience }),
      ...(hourlyRate  && { hourlyRate }),
      ...(bio         && { bio }),
      ...(availability && { availability }),
      ...(skills      && { skills }),
      ...(companyName && { companyName }),
      ...(businessType && { businessType }),
      ...(howMany     && { howMany }),
      ...(documents   && { documents }),
      ...(profileScore !== undefined && { profileScore }),
      profileComplete: profileComplete ?? true,
    };

    const previewUser = { ...currentUser.toObject(), ...updatePayload };
    updatePayload.profileProgress = buildProfileUpdate(previewUser).profileProgress;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updatePayload,
      { new: true, select: "-password -otp -otpExpiry" }
    );

    res.status(200).json({ message: "Profile updated.", user: updated });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "No account found with this email." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ message: "OTP sent to your email.", email: user.email });
  } catch (err) {
    console.error("forgotPassword error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

    if (!user) return res.status(404).json({ error: "No account found." });

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ error: "Too many attempts. Request a new OTP." });
    }

    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (otp !== user.otp) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        error: `Wrong OTP. ${5 - user.otpAttempts} attempts left.`,
      });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password reset successful! You can now login." });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE (GET /api/auth/profile)
// ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profileUpdate = buildProfileUpdate(user);
    const profileChanged =
      JSON.stringify(user.profileProgress || {}) !== JSON.stringify(profileUpdate.profileProgress);

    if (profileChanged) {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { profileProgress: profileUpdate.profileProgress } },
        { new: true, select: "-password -otp -otpExpiry" }
      );
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPLOAD DRIVER LICENSE
// ─────────────────────────────────────────────────────────────
exports.uploadDriverLicense = async (req, res) => {
  try {
    // Check if file uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Driver license document is required." });
    }

    // Get Cloudinary URL from multer
    const driverLicenseUrl = req.file.secure_url;

    // Update user document
    const existingUser = await User.findById(req.user._id).select("-password -otp -otpExpiry");
    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const isFirstLicenseUpload = !existingUser.documents?.drivingLicense && !existingUser.driverLicensePointsAwarded;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "documents.drivingLicense": driverLicenseUrl,
          "profileProgress.drivingLicense": true,
          ...(isFirstLicenseUpload ? { driverLicensePointsAwarded: true } : {}),
        },
        ...(isFirstLicenseUpload ? { $inc: { points: 15 } } : {}),
      },
      { new: true, select: "-password -otp -otpExpiry" }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const refreshedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profileProgress: buildProfileUpdate(user).profileProgress } },
      { new: true, select: "-password -otp -otpExpiry" }
    );

    res.status(200).json({
      message: "Driver license uploaded successfully!",
      user: refreshedUser,
      pointsAwarded: isFirstLicenseUpload ? 15 : 0,
      totalPoints: refreshedUser.points,
    });
  } catch (err) {
    console.error("uploadDriverLicense error:", err.message);
    res.status(400).json({ error: err.message });
  }
};
