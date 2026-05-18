const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  category: {
    type: String,
    enum: [
      "fraud",
      "harassment",
      "fake_profile",
      "non_payment",
      "no_show",
      "spam",
      "inappropriate_behavior",
      "safety_concern",
      "other",
    ],
    required: true,
  },

  description: { type: String, required: true },

  evidence: [String], // Cloudinary URLs for screenshots etc.

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    default: null,
  },

  status: {
    type: String,
    enum: ["pending", "investigating", "resolved", "dismissed"],
    default: "pending",
  },

  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },

  adminNotes: { type: String, default: "" },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolvedAt: { type: Date, default: null },

}, { timestamps: true });

complaintSchema.index({ reportedUser: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ reportedBy: 1, reportedUser: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);