const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    goalCount: {
      type: Number,
      default: 5,
      min: 1,
      max: 50,
    },
  },
  { timestamps: true }
);

goalSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Goal", goalSchema);