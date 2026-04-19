const express = require("express");
const router = express.Router();
const WorkerProfile = require("../models/WorkerProfile");
const User = require("../models/User");
const { buildProfileUpdate } = require("../utils/profileProgress");

// Create or Update Availability
router.post("/", async (req, res) => {
  try {
    const workerId = req.body.worker;
    const existing = await WorkerProfile.findOne({ worker: workerId });

    let profile;
    if (existing) {
      profile = await WorkerProfile.findOneAndUpdate(
        { worker: workerId },
        req.body,
        { new: true }
      );
    } else {
      profile = await WorkerProfile.create(req.body);
    }

    // Update User: set category from skill, mark availability posted, award 15 pts (once)
    if (workerId) {
      const worker = await User.findById(workerId);
      if (worker) {
        const isFirstAvailability = !worker.availabilityPosted && !worker.availabilityPointsAwarded;
        const skillName = req.body.skill || req.body.category || worker.category;
        await User.findByIdAndUpdate(
          workerId,
          {
            $set: {
              availabilityPosted: true,
              ...(skillName ? { category: skillName.toLowerCase().trim() } : {}),
              ...(isFirstAvailability ? { availabilityPointsAwarded: true } : {}),
            },
            ...(isFirstAvailability ? { $inc: { points: 15 } } : {}),
          }
        );

        // Rebuild and save profile progress
        const refreshed = await User.findById(workerId);
        if (refreshed) {
          const { profileProgress } = buildProfileUpdate(refreshed);
          await User.findByIdAndUpdate(workerId, { $set: { profileProgress } });
        }
      }
    }

    res.status(existing ? 200 : 201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all available workers (for employer)
router.get("/", async (req, res) => {
  try {
    const workers = await WorkerProfile.find()
      .populate("worker", "name email phone documents");
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;