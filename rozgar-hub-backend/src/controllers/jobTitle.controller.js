const JobTitle = require("../models/JobTitle");

const SEED_DATA = [
  {
    name: "Driver", slug: "driver", icon: "🚗", category: "transport",
    conditionalFields: [
      { fieldName: "vehicleType", label: { en: "Vehicle Type", ur: "گاڑی کی قسم" }, type: "select", required: true, options: ["Car", "Motorcycle", "Rickshaw", "Van", "Truck"] },
      { fieldName: "licenseNumber", label: { en: "Driving License Number", ur: "ڈرائیونگ لائسنس نمبر" }, type: "text", required: false },
    ],
  },
  {
    name: "Tutor", slug: "tutor", icon: "📚", category: "education",
    conditionalFields: [
      { fieldName: "educationLevel", label: { en: "Your Education Level", ur: "آپ کی تعلیم" }, type: "select", required: true, options: ["Matric", "Intermediate", "Bachelor", "Master", "PhD"] },
      { fieldName: "subjects", label: { en: "Subjects You Can Teach", ur: "آپ کے مضامین" }, type: "text", required: false },
      { fieldName: "gradeLevels", label: { en: "Grade Levels", ur: "درجے" }, type: "select", required: false, options: ["Primary (1–5)", "Middle (6–8)", "Matric (9–10)", "FSc/ICS (11–12)", "University"] },
    ],
  },
  { name: "Electrician", slug: "electrician", icon: "⚡", category: "trades", conditionalFields: [] },
  { name: "Plumber",     slug: "plumber",     icon: "🔧", category: "trades", conditionalFields: [] },
  { name: "Carpenter",   slug: "carpenter",   icon: "🪵", category: "trades", conditionalFields: [] },
  { name: "Painter",     slug: "painter",     icon: "🖌️", category: "trades", conditionalFields: [] },
  { name: "Cleaner",     slug: "cleaner",     icon: "🧹", category: "cleaning", conditionalFields: [] },
  { name: "Mason",       slug: "mason",       icon: "🧱", category: "construction", conditionalFields: [] },
  { name: "Welder",      slug: "welder",      icon: "⚙️", category: "trades", conditionalFields: [] },
  { name: "Mechanic",    slug: "mechanic",    icon: "🔩", category: "trades", conditionalFields: [] },
  { name: "Gardener",    slug: "gardener",    icon: "🌿", category: "outdoor", conditionalFields: [] },
  { name: "Cook",        slug: "cook",        icon: "👨‍🍳", category: "food", conditionalFields: [] },
  { name: "Security Guard", slug: "security-guard", icon: "🛡️", category: "security", conditionalFields: [] },
  { name: "Pest Control",   slug: "pest-control",   icon: "🐛", category: "cleaning", conditionalFields: [] },
  {
    name: "Solar Technician", slug: "solar-technician", icon: "☀️", category: "trades",
    conditionalFields: [
      { fieldName: "experience", label: { en: "Years of Solar Experience", ur: "سولر تجربہ" }, type: "select", required: false, options: ["Less than 1 year", "1–2 years", "3–5 years", "5+ years"] },
    ],
  },
];

// GET /api/job-titles — returns all active job titles
exports.getAll = async (req, res) => {
  try {
    const titles = await JobTitle.find({ isActive: true }).select("-__v").lean();
    res.json(titles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/job-titles/seed — seeds initial data (safe: skips existing slugs)
exports.seed = async (req, res) => {
  try {
    let inserted = 0;
    for (const item of SEED_DATA) {
      const exists = await JobTitle.findOne({ slug: item.slug });
      if (!exists) {
        await JobTitle.create(item);
        inserted++;
      }
    }
    res.json({ message: `Seeded ${inserted} new job titles.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};