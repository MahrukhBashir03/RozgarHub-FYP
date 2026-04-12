const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "job_request",      // New job request
        "job_accepted",     // Job was accepted
        "job_declined",     // Job was declined
        "counter_offer",    // Counter offer received
        "application",      // Worker applied for job
        "profile_update",   // Profile update reminder
        "document_required", // Driver license needed
        "points_earned",    // Points milestone
        "message",          // Direct message
        "system",           // System notification
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Reference to job, application, or other entity
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedModel: {
      type: String,
      enum: ["Job", "Application", "JobRequest", "User"],
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for efficient notification queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
