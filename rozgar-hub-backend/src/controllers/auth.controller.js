// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const { OAuth2Client } = require("google-auth-library");
// const { sendOTPEmail } = require("../utils/sendEmail");
// const { validatePassword } = require("../utils/passwordValidator");
// const { buildProfileUpdate } = require("../utils/profileProgress");

// const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// const generateToken = (userId) =>
//   jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // ─────────────────────────────────────────────────────────────
// // WORKER REGISTER
// // ─────────────────────────────────────────────────────────────
// exports.registerWorker = async (req, res) => {
//   try {
//     console.log("BODY:", req.body);
//     console.log("FILES:", req.files);

//     const { name, email, password, phone, cnic } = req.body;

//     // ── Validate password ──
//     const passwordValidation = validatePassword(password);
//     if (!passwordValidation.isValid) {
//       return res.status(400).json({
//         error: "Password does not meet requirements",
//         details: passwordValidation.errors,
//       });
//     }

//     // ── Validate files are uploaded ──
//     if (!req.files || !req.files.profilePhoto || !req.files.cnicFront || !req.files.cnicBack) {
//       return res.status(400).json({ error: "All documents (profilePhoto, CNIC front and back) are required." });
//     }

//     // Duplicate email check
//     const existingEmail = await User.findOne({ email: email.toLowerCase() });
//     if (existingEmail) {
//       if (!existingEmail.isEmailVerified) {
//         const emailOtp = generateOTP();
//         existingEmail.otp = emailOtp;
//         existingEmail.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//         existingEmail.otpAttempts = 0;
//         await existingEmail.save({ validateBeforeSave: false });
//         await sendOTPEmail(email, emailOtp, existingEmail.name);
//         return res.status(200).json({
//           message: "Account not verified. OTP sent to email.",
//           requiresVerification: true,
//           email,
//         });
//       }
//       return res.status(409).json({ error: "Email already registered." });
//     }

//     // Duplicate CNIC check
//     if (cnic) {
//       const existingCnic = await User.findOne({ cnic });
//       if (existingCnic) {
//         return res.status(409).json({ error: "CNIC already registered." });
//       }
//     }

//     const emailOtp = generateOTP();

//     // ── Extract Cloudinary URLs from uploaded files ──
//     // multer-storage-cloudinary stores the URL in .path, not .secure_url
//     const documents = {
//       profilePhoto: req.files.profilePhoto[0].path,
//       cnicFront:    req.files.cnicFront[0].path,
//       cnicBack:     req.files.cnicBack[0].path,
//       drivingLicense: null,
//     };

//     console.log("Documents to save:", documents); // verify URLs are real

//     // ── Initialize profile progress ──
//     const profileProgress = {
//       profilePhoto: true,
//       documents: true,
//       category: false,
//       drivingLicense: false,
//       firstPost: false,
//       profilePercentage: 40,
//     };

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password,
//       phone: phone || null,
//       cnic: cnic || null,
//       role: "worker",
//       otp: emailOtp,
//       otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
//       isEmailVerified: false,
//       documents,
//       profileProgress,
//       points: 50,
//     });

//     await sendOTPEmail(email, emailOtp, name);

//     res.status(201).json({
//       message: "Worker registered! OTP sent to your email.",
//       requiresVerification: true,
//       email: user.email,
//     });
//   } catch (err) {
//     console.error("registerWorker error:", err.message);
//     res.status(400).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // EMPLOYER REGISTER
// // ─────────────────────────────────────────────────────────────
// exports.registerEmployer = async (req, res) => {
//   try {
//     const { name, email, password, phone, cnic } = req.body;

//     // ── Validate password ──
//     const passwordValidation = validatePassword(password);
//     if (!passwordValidation.isValid) {
//       return res.status(400).json({
//         error: "Password does not meet requirements",
//         details: passwordValidation.errors,
//       });
//     }

//     // ── Validate files are uploaded ──
//     if (!req.files || !req.files.profilePhoto || !req.files.cnicFront || !req.files.cnicBack) {
//       return res.status(400).json({ error: "All documents (profilePhoto, CNIC front and back) are required." });
//     }

//     // Duplicate email check
//     const existingEmail = await User.findOne({ email: email.toLowerCase() });
//     if (existingEmail) {
//       if (!existingEmail.isEmailVerified) {
//         const emailOtp = generateOTP();
//         existingEmail.otp = emailOtp;
//         existingEmail.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//         existingEmail.otpAttempts = 0;
//         await existingEmail.save({ validateBeforeSave: false });
//         await sendOTPEmail(email, emailOtp, existingEmail.name);
//         return res.status(200).json({
//           message: "Account not verified. OTP sent to email.",
//           requiresVerification: true,
//           email,
//         });
//       }
//       return res.status(409).json({ error: "Email already registered." });
//     }

//     // Duplicate CNIC check
//     if (cnic) {
//       const existingCnic = await User.findOne({ cnic });
//       if (existingCnic) {
//         return res.status(409).json({ error: "CNIC already registered." });
//       }
//     }

//     const emailOtp = generateOTP();

//     // ── Extract Cloudinary URLs from uploaded files ──
//     // multer-storage-cloudinary stores the URL in .path, not .secure_url
//     const documents = {
//       profilePhoto: req.files.profilePhoto[0].path,
//       cnicFront:    req.files.cnicFront[0].path,
//       cnicBack:     req.files.cnicBack[0].path,
//       drivingLicense: null,
//     };

//     console.log("Documents to save:", documents); // verify URLs are real

//     const profileProgress = {
//       profilePhoto: true,
//       documents: true,
//       category: false,
//       drivingLicense: false,
//       firstPost: false,
//       profilePercentage: 67,
//     };

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password,
//       phone: phone || null,
//       cnic: cnic || null,
//       role: "employer",
//       otp: emailOtp,
//       otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
//       isEmailVerified: false,
//       documents,
//       profileProgress,
//       points: 50,
//     });

//     await sendOTPEmail(email, emailOtp, name);

//     res.status(201).json({
//       message: "Employer registered! OTP sent to your email.",
//       requiresVerification: true,
//       email: user.email,
//     });
//   } catch (err) {
//     console.error("registerEmployer error:", err.message);
//     res.status(400).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // VERIFY OTP (Email only)
// // ─────────────────────────────────────────────────────────────
// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, emailOtp, otp } = req.body;
//     const submittedOtp = emailOtp || otp;

//     if (!email || !submittedOtp) {
//       return res.status(400).json({
//         error: "Email and OTP are required."
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

//     if (!user) {
//       return res.status(404).json({ error: "No account found." });
//     }

//     if (user.isEmailVerified) {
//       return res.status(400).json({ error: "Already verified. Please login." });
//     }

//     // ── Verify Email OTP ──
//     if (user.otpAttempts >= 5) {
//       return res.status(429).json({ error: "Too many email OTP attempts. Request a new OTP." });
//     }

//     if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
//       return res.status(400).json({ error: "Email OTP expired. Request a new one." });
//     }

//     if (submittedOtp !== user.otp) {
//       user.otpAttempts += 1;
//       await user.save({ validateBeforeSave: false });
//       return res.status(400).json({
//         error: `Wrong OTP. ${5 - user.otpAttempts} attempts left.`,
//       });
//     }

//     user.isEmailVerified = true;
//     user.otp = null;
//     user.otpExpiry = null;
//     user.otpAttempts = 0;
//     await user.save({ validateBeforeSave: false });

//     const token = generateToken(user._id);

//     res.status(200).json({
//       message: "Email verified! Welcome to Rozgar Hub.",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         isEmailVerified: user.isEmailVerified,
//         profileComplete: user.profileComplete || false,
//       },
//     });
//   } catch (err) {
//     console.error("verifyOTP error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // RESEND OTP (Email only)
// // ─────────────────────────────────────────────────────────────
// exports.resendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: "Email is required." });

//     const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

//     if (!user) return res.status(404).json({ error: "No account found." });
//     if (user.isEmailVerified) return res.status(400).json({ error: "Email already verified." });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//     user.otpAttempts = 0;

//     await user.save({ validateBeforeSave: false });
//     await sendOTPEmail(email, otp, user.name);
//     res.status(200).json({ message: "OTP resent.", emailSent: true });
//   } catch (err) {
//     console.error("resendOTP error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // RESEND EMAIL OTP
// // ─────────────────────────────────────────────────────────────
// exports.resendEmailOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: "Email is required." });

//     const user = await User.findOne({ email: email.toLowerCase() }).select(
//       "+otp +otpExpiry"
//     );

//     if (!user) return res.status(404).json({ error: "No account found." });
//     if (user.isEmailVerified) return res.status(400).json({ error: "Email already verified." });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//     user.otpAttempts = 0;
//     await user.save({ validateBeforeSave: false });

//     await sendOTPEmail(email, otp, user.name);

//     res.status(200).json({ message: "New OTP sent to your email." });
//   } catch (err) {
//     console.error("resendEmailOTP error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // LOGIN
// // ─────────────────────────────────────────────────────────────
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required." });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Not verified → resend OTP
//     if (!user.isEmailVerified) {
//       const otp = generateOTP();
//       user.otp = otp;
//       user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//       user.otpAttempts = 0;
//       await user.save({ validateBeforeSave: false });
//       await sendOTPEmail(email, otp, user.name);
//       return res.status(403).json({
//         message: "Email not verified. OTP sent to your email.",
//         requiresVerification: true,
//         email: user.email,
//       });
//     }

//     if (password !== user.password) {
//       return res.status(401).json({ message: "Invalid password." });
//     }

//     const token = generateToken(user._id);

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         isEmailVerified: user.isEmailVerified,
//         profileComplete: user.profileComplete || false,
//       },
//     });
//   } catch (err) {
//     console.error("login error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // GET CURRENT USER  (GET /api/auth/me)
// // ─────────────────────────────────────────────────────────────
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
//     if (!user) return res.status(404).json({ error: "User not found." });
//     res.status(200).json({ user });
//   } catch (err) {
//     console.error("getMe error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // UPDATE PROFILE  (PUT /api/auth/profile)
// // ─────────────────────────────────────────────────────────────
// exports.updateProfile = async (req, res) => {
//   try {
//     const {
//       name, email, phone, city, address, gender, age,
//       cnicNumber, trade, experience, hourlyRate, bio,
//       availability, skills, companyName, businessType, howMany,
//       documents, profileComplete, profileScore,
//     } = req.body;

//     const currentUser = await User.findById(req.user.id);
//     if (!currentUser) return res.status(404).json({ error: "User not found." });

//     // Check email uniqueness if changing email
//     if (email && email.toLowerCase() !== currentUser.email) {
//       const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
//       if (emailTaken) return res.status(409).json({ error: "Email already in use." });
//     }

//     const updatePayload = {
//       ...(name         && { name }),
//       ...(email        && { email: email.toLowerCase() }),
//       ...(phone        && { phone }),
//       ...(city         && { city }),
//       ...(address      && { address }),
//       ...(gender       && { gender }),
//       ...(age          && { age }),
//       ...(cnicNumber   && { cnicNumber }),
//       ...(trade        && { trade }),
//       ...(experience   && { experience }),
//       ...(hourlyRate   && { hourlyRate }),
//       ...(bio          && { bio }),
//       ...(availability && { availability }),
//       ...(skills       && { skills }),
//       ...(companyName  && { companyName }),
//       ...(businessType && { businessType }),
//       ...(howMany      && { howMany }),
//       ...(documents    && { documents }),
//       ...(profileScore !== undefined && { profileScore }),
//       profileComplete: profileComplete ?? true,
//     };

//     const previewUser = { ...currentUser.toObject(), ...updatePayload };
//     updatePayload.profileProgress = buildProfileUpdate(previewUser).profileProgress;

//     const updated = await User.findByIdAndUpdate(
//       req.user.id,
//       updatePayload,
//       { new: true, select: "-password -otp -otpExpiry" }
//     );

//     res.status(200).json({ message: "Profile updated.", user: updated });
//   } catch (err) {
//     console.error("updateProfile error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // FORGOT PASSWORD
// // ─────────────────────────────────────────────────────────────
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: "Email is required." });

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) return res.status(404).json({ error: "No account found with this email." });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
//     user.otpAttempts = 0;
//     await user.save({ validateBeforeSave: false });

//     await sendOTPEmail(email, otp, user.name);

//     res.status(200).json({ message: "OTP sent to your email.", email: user.email });
//   } catch (err) {
//     console.error("forgotPassword error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // RESET PASSWORD
// // ─────────────────────────────────────────────────────────────
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     if (!email || !otp || !newPassword) {
//       return res.status(400).json({ error: "Email, OTP and new password are required." });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: "Password must be at least 6 characters." });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

//     if (!user) return res.status(404).json({ error: "No account found." });

//     if (user.otpAttempts >= 5) {
//       return res.status(429).json({ error: "Too many attempts. Request a new OTP." });
//     }

//     if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
//       return res.status(400).json({ error: "OTP expired. Please request a new one." });
//     }

//     if (otp !== user.otp) {
//       user.otpAttempts += 1;
//       await user.save({ validateBeforeSave: false });
//       return res.status(400).json({
//         error: `Wrong OTP. ${5 - user.otpAttempts} attempts left.`,
//       });
//     }

//     user.password = newPassword;
//     user.otp = null;
//     user.otpExpiry = null;
//     user.otpAttempts = 0;
//     await user.save({ validateBeforeSave: false });

//     res.status(200).json({ message: "Password reset successful! You can now login." });
//   } catch (err) {
//     console.error("resetPassword error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // GET PROFILE (GET /api/auth/profile)
// // ─────────────────────────────────────────────────────────────
// exports.getProfile = async (req, res) => {
//   try {
//     let user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     const profileUpdate = buildProfileUpdate(user);
//     const profileChanged =
//       JSON.stringify(user.profileProgress || {}) !== JSON.stringify(profileUpdate.profileProgress);

//     if (profileChanged) {
//       user = await User.findByIdAndUpdate(
//         req.user.id,
//         { $set: { profileProgress: profileUpdate.profileProgress } },
//         { new: true, select: "-password -otp -otpExpiry" }
//       );
//     }

//     res.status(200).json({ success: true, data: user });
//   } catch (err) {
//     console.error("getProfile error:", err.message);
//     res.status(500).json({ success: false, message: "Failed to fetch profile", error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // CHANGE PASSWORD  (POST /api/auth/change-password)
// // ─────────────────────────────────────────────────────────────
// exports.changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ error: "Current and new password are required." });
//     }
//     if (newPassword.length < 6) {
//       return res.status(400).json({ error: "New password must be at least 6 characters." });
//     }
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ error: "User not found." });
//     if (currentPassword !== user.password) {
//       return res.status(401).json({ error: "Current password is incorrect." });
//     }
//     user.password = newPassword;
//     await user.save({ validateBeforeSave: false });
//     res.status(200).json({ message: "Password changed successfully." });
//   } catch (err) {
//     console.error("changePassword error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // UPDATE PROFILE PHOTO  (POST /api/auth/update-profile-photo)
// // ─────────────────────────────────────────────────────────────
// exports.updateProfilePhoto = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Profile photo is required." });
//     }
//     const photoUrl = req.file.path;
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { $set: { "documents.profilePhoto": photoUrl } },
//       { new: true, select: "-password -otp -otpExpiry" }
//     );
//     if (!user) return res.status(404).json({ error: "User not found." });
//     res.status(200).json({ message: "Profile photo updated.", user });
//   } catch (err) {
//     console.error("updateProfilePhoto error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // GOOGLE LOGIN  (POST /api/auth/google)
// // ─────────────────────────────────────────────────────────────
// exports.googleLogin = async (req, res) => {
//   try {
//     const { credential } = req.body;
//     if (!credential) return res.status(400).json({ error: "Google credential is required." });

//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const { email } = ticket.getPayload();

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(404).json({ error: "No account found. Please register with email first." });
//     }

//     if (!user.isEmailVerified) {
//       user.isEmailVerified = true;
//       await user.save({ validateBeforeSave: false });
//     }

//     const token = generateToken(user._id);
//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         isEmailVerified: true,
//         profileComplete: user.profileComplete || false,
//       },
//     });
//   } catch (err) {
//     console.error("googleLogin error:", err.message);
//     res.status(401).json({ error: "Invalid Google credential." });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// // UPLOAD DRIVER LICENSE
// // ─────────────────────────────────────────────────────────────
// exports.uploadDriverLicense = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Driver license document is required." });
//     }

//     // multer-storage-cloudinary stores the URL in .path, not .secure_url
//     const driverLicenseUrl = req.file.path;

//     const existingUser = await User.findById(req.user._id).select("-password -otp -otpExpiry");
//     if (!existingUser) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     const isFirstLicenseUpload = !existingUser.documents?.drivingLicense && !existingUser.driverLicensePointsAwarded;

//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//         $set: {
//           "documents.drivingLicense": driverLicenseUrl,
//           "profileProgress.drivingLicense": true,
//           ...(isFirstLicenseUpload ? { driverLicensePointsAwarded: true } : {}),
//         },
//         ...(isFirstLicenseUpload ? { $inc: { points: 15 } } : {}),
//       },
//       { new: true, select: "-password -otp -otpExpiry" }
//     );

//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     const refreshedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       { $set: { profileProgress: buildProfileUpdate(user).profileProgress } },
//       { new: true, select: "-password -otp -otpExpiry" }
//     );

//     res.status(200).json({
//       message: "Driver license uploaded successfully!",
//       user: refreshedUser,
//       pointsAwarded: isFirstLicenseUpload ? 15 : 0,
//       totalPoints: refreshedUser.points,
//     });
//   } catch (err) {
//     console.error("uploadDriverLicense error:", err.message);
//     res.status(400).json({ error: err.message });
//   }
// };

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { sendOTPEmail } = require("../utils/sendEmail");
const { validatePassword } = require("../utils/passwordValidator");
const { buildProfileUpdate } = require("../utils/profileProgress");

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────
// WORKER REGISTER
// ─────────────────────────────────────────────────────────────
exports.registerWorker = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { name, email, password, phone, cnic } = req.body;

    // ── Validate password ──
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
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
        await existingEmail.save({ validateBeforeSave: false });
        await sendOTPEmail(email, emailOtp, existingEmail.name);
        return res.status(200).json({
          message: "Account not verified. OTP sent to email.",
          requiresVerification: true,
          email,
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
    // multer-storage-cloudinary stores the URL in .path, not .secure_url
    const documents = {
      profilePhoto: req.files.profilePhoto[0].path,
      cnicFront:    req.files.cnicFront[0].path,
      cnicBack:     req.files.cnicBack[0].path,
      drivingLicense: null,
    };

    console.log("Documents to save:", documents); // verify URLs are real

    // ── Initialize profile progress ──
    const profileProgress = {
      profilePhoto: true,
      documents: true,
      category: false,
      drivingLicense: false,
      firstPost: false,
      profilePercentage: 40,
    };

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || null,
      cnic: cnic || null,
      role: "worker",
      otp: emailOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isEmailVerified: false,
      documents,
      profileProgress,
      points: 50,
    });

    await sendOTPEmail(email, emailOtp, name);

    res.status(201).json({
      message: "Worker registered! OTP sent to your email.",
      requiresVerification: true,
      email: user.email,
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

    // ── Validate password ──
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
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
        await existingEmail.save({ validateBeforeSave: false });
        await sendOTPEmail(email, emailOtp, existingEmail.name);
        return res.status(200).json({
          message: "Account not verified. OTP sent to email.",
          requiresVerification: true,
          email,
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
    // multer-storage-cloudinary stores the URL in .path, not .secure_url
    const documents = {
      profilePhoto: req.files.profilePhoto[0].path,
      cnicFront:    req.files.cnicFront[0].path,
      cnicBack:     req.files.cnicBack[0].path,
      drivingLicense: null,
    };

    console.log("Documents to save:", documents); // verify URLs are real

    const profileProgress = {
      profilePhoto: true,
      documents: true,
      category: false,
      drivingLicense: false,
      firstPost: false,
      profilePercentage: 67,
    };

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || null,
      cnic: cnic || null,
      role: "employer",
      otp: emailOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isEmailVerified: false,
      documents,
      profileProgress,
      points: 50,
    });

    await sendOTPEmail(email, emailOtp, name);

    res.status(201).json({
      message: "Employer registered! OTP sent to your email.",
      requiresVerification: true,
      email: user.email,
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
      name, email, phone, city, address, gender, age,
      cnicNumber, trade, experience, hourlyRate, bio,
      availability, skills, companyName, businessType, howMany,
      documents, profileComplete, profileScore,
    } = req.body;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ error: "User not found." });

    // Check email uniqueness if changing email
    if (email && email.toLowerCase() !== currentUser.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
      if (emailTaken) return res.status(409).json({ error: "Email already in use." });
    }

    const updatePayload = {
      ...(name         && { name }),
      ...(email        && { email: email.toLowerCase() }),
      ...(phone        && { phone }),
      ...(city         && { city }),
      ...(address      && { address }),
      ...(gender       && { gender }),
      ...(age          && { age }),
      ...(cnicNumber   && { cnicNumber }),
      ...(trade        && { trade }),
      ...(experience   && { experience }),
      ...(hourlyRate   && { hourlyRate }),
      ...(bio          && { bio }),
      ...(availability && { availability }),
      ...(skills       && { skills }),
      ...(companyName  && { companyName }),
      ...(businessType && { businessType }),
      ...(howMany      && { howMany }),
      ...(documents    && { documents }),
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
// CHANGE PASSWORD  (POST /api/auth/change-password)
// ─────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (currentPassword !== user.password) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("changePassword error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE PHOTO  (POST /api/auth/update-profile-photo)
// ─────────────────────────────────────────────────────────────
exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Profile photo is required." });
    }
    const photoUrl = req.file.path;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { "documents.profilePhoto": photoUrl } },
      { new: true, select: "-password -otp -otpExpiry" }
    );
    if (!user) return res.status(404).json({ error: "User not found." });
    res.status(200).json({ message: "Profile photo updated.", user });
  } catch (err) {
    console.error("updateProfilePhoto error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GOOGLE LOGIN  (POST /api/auth/google)
// ─────────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential is required." });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email } = ticket.getPayload();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "No account found. Please register with email first." });
    }

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
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
        isEmailVerified: true,
        profileComplete: user.profileComplete || false,
      },
    });
  } catch (err) {
    console.error("googleLogin error:", err.message);
    res.status(401).json({ error: "Invalid Google credential." });
  }
};

// ─────────────────────────────────────────────────────────────
// UPLOAD DRIVER LICENSE
// ─────────────────────────────────────────────────────────────
exports.uploadDriverLicense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Driver license document is required." });
    }

    // multer-storage-cloudinary stores the URL in .path, not .secure_url
    const driverLicenseUrl = req.file.path;

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

// ─────────────────────────────────────────────────────────────
// UPDATE WORKER SKILLS
// PATCH /api/auth/update-skills
// Body: { skills: [{ slug, name, proficiency, extraData }] }
// ─────────────────────────────────────────────────────────────
exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: "skills must be an array." });
    }

    const sanitized = skills.map((s) => ({
      slug:        String(s.slug || "").toLowerCase().trim(),
      name:        String(s.name || "").trim(),
      proficiency: ["beginner", "intermediate", "expert"].includes(s.proficiency)
        ? s.proficiency
        : "intermediate",
      extraData:   s.extraData && typeof s.extraData === "object" ? s.extraData : {},
    })).filter((s) => s.slug && s.name);

    // Also set category to first skill's slug for backward-compat with job matching
    const categoryUpdate = sanitized.length > 0 ? { category: sanitized[0].slug } : {};

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { skills: sanitized, ...categoryUpdate } },
      { new: true, select: "-password -otp -otpExpiry" }
    );

    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "Skills updated successfully.", user });
  } catch (err) {
    console.error("updateSkills error:", err.message);
    res.status(500).json({ error: err.message });
  }
};