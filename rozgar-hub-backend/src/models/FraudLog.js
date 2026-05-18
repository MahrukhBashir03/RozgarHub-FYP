const mongoose = require("mongoose");

const fraudLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  eventType: {
    type: String,
    enum: [
      "fake_account_attempt",
      "duplicate_cnic",
      "duplicate_phone",
      "suspicious_email",
      "suspicious_name",
      "location_anomaly",
      "spam_job_posting",
      "repeated_complaints",
      "multi_account_detected",
      "suspicious_registration",
      "account_suspended",
    ],
    required: true,
  },

  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },

  description: { type: String, required: true },

  metadata: {
    ip: String,
    userAgent: String,
    location: String,
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    flagCount: Number,
    extra: mongoose.Schema.Types.Mixed,
  },

  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolvedAt: { type: Date, default: null },
  notes: { type: String, default: "" },

}, { timestamps: true });

fraudLogSchema.index({ userId: 1, createdAt: -1 });
fraudLogSchema.index({ eventType: 1, resolved: 1 });
fraudLogSchema.index({ severity: 1, resolved: 1, createdAt: -1 });

module.exports = mongoose.model("FraudLog", fraudLogSchema);