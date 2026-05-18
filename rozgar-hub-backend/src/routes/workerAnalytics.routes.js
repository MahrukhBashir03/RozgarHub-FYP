const express = require("express");
const router = express.Router();
const JobRequest = require("../models/JobRequest"); // ← correct model
const Goal = require("../models/Goal");

// ─────────────────────────────────────────────────────
// GET /api/worker-analytics/stats?workerId=xxx
// Returns: completedToday, completedWeek, totalCompleted, activeJobs
// ─────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const { workerId } = req.query;
    if (!workerId) return res.status(400).json({ error: "workerId required" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [completedToday, completedWeek, totalCompleted, activeJobs] =
      await Promise.all([
        JobRequest.countDocuments({
          acceptedWorker: workerId,
          status: "completed",
          updatedAt: { $gte: todayStart, $lt: todayEnd },
        }),
        JobRequest.countDocuments({
          acceptedWorker: workerId,
          status: "completed",
          updatedAt: { $gte: weekStart },
        }),
        JobRequest.countDocuments({
          acceptedWorker: workerId,
          status: "completed",
        }),
        JobRequest.countDocuments({
          acceptedWorker: workerId,
          status: "confirmed",
        }),
      ]);

    res.json({ completedToday, completedWeek, totalCompleted, activeJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/worker-analytics/weekly-stats?workerId=xxx
// Returns: days (last 7), streak, goalCount
// ─────────────────────────────────────────────────────
router.get("/weekly-stats", async (req, res) => {
  try {
    const { workerId } = req.query;
    if (!workerId) return res.status(400).json({ error: "workerId required" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const latestGoal = await Goal.findOne({ workerId }).sort({ date: -1 }).lean();
    const goalCount = latestGoal?.goalCount ?? 5;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await JobRequest.countDocuments({
        acceptedWorker: workerId,
        status: "completed",
        updatedAt: { $gte: dayStart, $lt: dayEnd },
      });

      days.push({
        date: dayStart.toISOString().split("T")[0],
        label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      });
    }

    // Streak: consecutive days (skip today if still 0) where count >= goal
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const isToday = days[i].date === todayStr;
      if (isToday && days[i].count === 0) continue;
      if (days[i].count >= goalCount) streak++;
      else break;
    }

    res.json({ days, streak, goalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/worker-analytics/goal?workerId=xxx
// ─────────────────────────────────────────────────────
router.get("/goal", async (req, res) => {
  try {
    const { workerId } = req.query;
    if (!workerId) return res.status(400).json({ error: "workerId required" });
    const today = new Date().toISOString().split("T")[0];
    const goal = await Goal.findOne({ workerId, date: today }).lean();
    res.json(goal ?? { goalCount: 5, date: today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────
// POST /api/worker-analytics/goal
// Body: { workerId, goalCount }
// ─────────────────────────────────────────────────────
router.post("/goal", async (req, res) => {
  try {
    const { workerId, goalCount } = req.body;
    if (!workerId) return res.status(400).json({ error: "workerId required" });
    const today = new Date().toISOString().split("T")[0];
    const goal = await Goal.findOneAndUpdate(
      { workerId, date: today },
      { workerId, date: today, goalCount: Math.max(1, Number(goalCount) || 5) },
      { upsert: true, new: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;