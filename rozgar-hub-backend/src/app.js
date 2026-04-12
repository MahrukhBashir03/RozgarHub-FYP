// const express = require('express');
// const cors = require('cors');

// const authRoutes = require('./routes/auth.routes');
// const jobRoutes = require('./routes/job.routes');
// const workerRoutes = require('./routes/worker.routes');
// const app = express();
// const aiRoutes = require("./routes/ai.routes");

// app.use("/api/ai", aiRoutes);


// app.use(cors({
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST"],
// }));

// // app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/jobs', jobRoutes);
//  app.use('/api/workers', workerRoutes);
 
// app.get('/', (req, res) => {
//   res.send('RozgarHub API running');
// });

// const jobRequestRoutes = require("./routes/jobRequest.routes");
// app.use("/api/job-requests", jobRequestRoutes);
// module.exports = app;

// app.js
const express = require('express');
const cors = require('cors');

// ─────────────────────────────────────────────────────────────
// IMPORTANT: Sabse pehle models load karo (circular reference avoid karne ke liye)
// ─────────────────────────────────────────────────────────────
require("./models/User");
require("./models/Job");
require("./models/Application");   // ← agar aapne Application model bana liya hai

// Routes
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const workerRoutes = require('./routes/worker.routes');
const aiRoutes = require("./routes/ai.routes");
const jobRequestRoutes = require("./routes/jobRequest.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/job-requests", jobRequestRoutes);
app.use("/api/notifications", notificationRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('RozgarHub API running');
});

module.exports = app;