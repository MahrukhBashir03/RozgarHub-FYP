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

  // ── NEW: analytics / productivity fields ──
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  deadline: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: "",
  },

}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
