const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");

// ── Models ─────────────────────────────────────────────────────
require("./models/User");
require("./models/Job");
require("./models/Application");
require("./models/JobTitle");
require("./models/SOSEvent");

const app = express();

// ── Security ───────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

// ── Body parsers ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── req.io middleware (set by server.js after io is created) ───
// Controllers like sos.controller.js use req.io to emit events.
// server.js calls app.use((req,res,next)=>{ req.io=io; next(); })
// AFTER requiring this file, so req.io is available in all routes.

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth",             require("./routes/auth.routes"));
app.use("/api/jobs",             require("./routes/job.routes"));
app.use("/api/workers",          require("./routes/worker.routes"));
app.use("/api/chat",             require("./routes/chat.routes"));
app.use("/api/ai",               require("./routes/ai.routes"));
app.use("/api/admin",            require("./routes/admin.routes"));
app.use("/api/job-requests",     require("./routes/jobRequest.routes"));
app.use("/api/job-titles",       require("./routes/jobTitle.routes"));
app.use("/api/notifications",    require("./routes/notification.routes"));
app.use("/api/applications",     require("./routes/application.routes"));
app.use("/api/worker-analytics", require("./routes/workerAnalytics.routes"));
app.use("/api/sos",              require("./routes/sos.routes")); // ← was missing from server.js

// ── Health check ───────────────────────────────────────────────
app.get("/", (req, res) => res.send("RozgarHub API running"));

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ error: "File too large. Maximum 5MB allowed." });
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;