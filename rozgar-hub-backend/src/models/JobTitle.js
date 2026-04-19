const mongoose = require("mongoose");

const conditionalFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  label:     { en: String, ur: String },
  type:      { type: String, enum: ["text", "textarea", "select"], default: "text" },
  required:  { type: Boolean, default: false },
  options:   [String],
}, { _id: false });

const jobTitleSchema = new mongoose.Schema(
  {
    name:              { type: String, required: true, trim: true },
    slug:              { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon:              { type: String, default: "🔧" },
    category:          { type: String, default: "general" },
    conditionalFields: [conditionalFieldSchema],
    isActive:          { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobTitle", jobTitleSchema);