// models/Application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  offeredRate: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "shortlisted", "accepted", "rejected", "completed"],
    default: "pending",
  },

  // If worker sent counter offer
  counterOffer: Number,

  // Final agreed price
  finalPrice: Number,

}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);