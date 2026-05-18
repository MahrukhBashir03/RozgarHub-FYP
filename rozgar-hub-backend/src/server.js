require("dotenv").config();
const http       = require("http");
const { Server } = require("socket.io");
const connectDB  = require("./config/db");

// ── Load models first (avoid circular reference issues) ────────
require("./models/User");
require("./models/Job");
require("./models/Application");
require("./models/JobTitle");
require("./models/SOSEvent");

// ── Single express app from app.js (has ALL routes) ────────────
const app    = require("./app");
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ── Attach io to every request so controllers can use req.io ───
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── Socket handler ─────────────────────────────────────────────
require("./socket/socketHandler")(io);

// ── Database + auto-seed job titles ───────────────────────────
connectDB().then(async () => {
  try {
    const JobTitle = require("./models/JobTitle");
    const count    = await JobTitle.countDocuments();
    if (count === 0) {
      const JobTitleCtrl = require("./controllers/jobTitle.controller");
      const fakeRes = {
        json: (d) => console.log("✅ Job titles seeded:", d.message),
      };
      await JobTitleCtrl.seed({}, fakeRes);
    }
  } catch (e) {
    console.error("Job title seed error:", e.message);
  }
}).catch(() => {});

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready ✅`);
});