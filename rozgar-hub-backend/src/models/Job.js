// const mongoose = require("mongoose");

// const jobSchema = new mongoose.Schema(
//   {
//     employer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     title: {
//       type: String,
//       required: true,
//     },

//     description: {
//       type: String,
//       required: true,
//     },

//     location: {
//       type: String,
//       required: true,
//     },

//     // 🔥 ADD THESE TWO FOR GPS
//     latitude: {
//       type: Number,
//       default: null,
//     },

//     longitude: {
//       type: Number,
//       default: null,
//     },

//     salary: {
//       type: String,
//       required: true,
//     },

//     type: {
//       type: String,
//       enum: ["full-time", "part-time", "contract", "temporary"],
//       default: "full-time",
//     },

//     status: {
//       type: String,
//       enum: ["open", "in-progress", "completed"],
//       default: "open",
//     },

//     acceptedWorker: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Job", jobSchema);


// models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: String,

  category: {
    type: String,
    required: true,   // electrician, cleaner, driver, etc.
  },

  workLocation: String,
  lat: Number,
  lng: Number,

  salary: String,           // e.g. "Rs. 1500" or "Negotiable"
  offeredPrice: Number,

  urgency: {
    type: String,
    enum: ["1_hour", "today", "this_week", "flexible"],
    default: "flexible",
  },

  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },

  // Optional: selected worker
  selectedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  finalPrice: Number,

}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);