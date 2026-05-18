const mongoose = require("mongoose");

const sosEventSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "cancelled", "resolved"],
    default: "active",
  },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: "" },
    accuracy: { type: Number, default: null },
  },

  // Related job context (if worker was on a job when SOS triggered)
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    default: null,
  },
  jobRequestId: { type: String, default: null },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // Emergency contacts notified
  contactsNotified: [{
    name: String,
    phone: String,
    email: String,
    relationship: String,
    notifiedAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    smsSent:   { type: Boolean, default: false },
  }],

  // Location history during active SOS (updated via socket)
  locationHistory: [{
    lat: Number,
    lng: Number,
    timestamp: { type: Date, default: Date.now },
  }],

  message: { type: String, default: "" },
  cancelledAt: { type: Date, default: null },
  resolvedAt:  { type: Date, default: null },
  resolvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  adminAlerted: { type: Boolean, default: false },

}, { timestamps: true });

sosEventSchema.index({ worker: 1, createdAt: -1 });
sosEventSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SOSEvent", sosEventSchema);