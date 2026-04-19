// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     role: {
//       type: String,
//       enum: ["worker", "employer"],
//       required: true,
//     },

//     phone: {
//       type: String,
//       default: null,
//     },

//     cnic: {
//       type: String,
//       required: true,
//       unique: true,
//       match: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
//     },

//     cnicImage: {
//       type: String,
//       default: null,
//     },

//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },

//     otp: {
//       type: String,
//       default: null,
//       select: false,
//     },

//     otpExpiry: {
//       type: Date,
//       default: null,
//       select: false,
//     },

//     otpAttempts: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["worker", "employer"],
      required: true,
    },

    phone: {
      type: String,
      default: null,
    },

    cnic: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
    },

    // ── Worker/Employer category (e.g. electrician, driver, plumber) ──
    category: {
      type: String,
      default: null,
    },

    // ── Worker skills (multi-select from JobTitle slugs) ──
    skills: [
      {
        slug:        { type: String, required: true },
        name:        { type: String, required: true },
        proficiency: { type: String, enum: ["beginner", "intermediate", "expert"], default: "intermediate" },
        extraData:   { type: mongoose.Schema.Types.Mixed, default: {} },
        _id:         false,
      },
    ],

    // ── Uploaded Documents (Cloudinary URLs) ──
    documents: {
      profilePhoto: {
        type: String,
        default: null,
      },
      cnicFront: {
        type: String,
        default: null,
      },
      cnicBack: {
        type: String,
        default: null,
      },
      drivingLicense: {
        type: String,
        default: null, // only required if category === "driver"
      },
    },

    // ── Verification Status ──
    isVerified: {
      type: Boolean,
      default: false, // admin manually verifies after reviewing documents
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    // ── Points for profile completion milestones ──
    points: {
      type: Number,
      default: 0,
    },

    // ── Flags for profile progress tracking ──
    availabilityPosted: {
      type: Boolean,
      default: false,
    },

    availabilityPointsAwarded: {
      type: Boolean,
      default: false,
    },

    driverLicensePointsAwarded: {
      type: Boolean,
      default: false,
    },

    jobsPosted: {
      type: Number,
      default: 0,
    },

    // ── Old single cnicImage field kept for backward compatibility ──
    cnicImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);