// const express = require("express");
// const router = express.Router();
// const Job = require("../models/Job");
// const Bid = require("../models/Bid");

// // ==============================
// // CREATE JOB (Employer)
// // ==============================
// router.post("/", async (req, res) => {
//   try {
//     const job = await Job.create(req.body);
//     res.status(201).json(job);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ==============================
// // GET ALL JOBS (Workers)
// // ==============================
// router.get("/", async (req, res) => {
//   try {
//     const jobs = await Job.find({ status: "open" })
//       .populate("employer", "name email");

//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ==============================
// // GET EMPLOYER JOBS
// // ==============================
// router.get("/employer/:id", async (req, res) => {
//   try {
//     const jobs = await Job.find({ employer: req.params.id });
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ==============================
// // WORKER APPLIES TO JOB
// // ==============================
// router.post("/apply", async (req, res) => {
//   try {
//     const { jobId, workerId, proposedRate, message } = req.body;

//     const bid = await Bid.create({
//       job: jobId,
//       worker: workerId,
//       proposedRate,
//       message,
//     });

//     res.status(201).json({
//       message: "Offer sent successfully",
//       bid,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ==============================
// // GET BIDS FOR A JOB (Employer)
// // ==============================
// router.get("/bids/:jobId", async (req, res) => {
//   try {
//     const bids = await Bid.find({ job: req.params.jobId })
//       .populate("worker", "name email");

//     res.json(bids);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ==============================
// // EMPLOYER ACCEPTS A BID
// // ==============================
// router.post("/accept", async (req, res) => {
//   try {
//     const { bidId } = req.body;

//     const bid = await Bid.findById(bidId).populate("job");

//     if (!bid) {
//       return res.status(404).json({ error: "Bid not found" });
//     }

//     // Update Job
//     bid.job.status = "in-progress";
//     bid.job.acceptedWorker = bid.worker;
//     await bid.job.save();

//     // Update Bid
//     bid.status = "accepted";
//     await bid.save();

//     // Reject other bids
//     await Bid.updateMany(
//       { job: bid.job._id, _id: { $ne: bidId } },
//       { status: "rejected" }
//     );

//     res.json({ message: "Worker accepted successfully" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Bid = require("../models/Bid");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ==============================
// CREATE JOB (Employer)
// ==============================
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET ALL JOBS (Workers) — with skill-based filtering
// Query: ?all=true  → skip skill filter (show everything)
// ==============================
router.get("/", async (req, res) => {
  try {
    let query = { status: "open" };

    // Try to identify the requesting worker via Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ") && req.query.all !== "true") {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const worker = await User.findById(decoded.id).select("role skills").lean();

        if (worker?.role === "worker" && worker.skills?.length > 0) {
          const slugs = worker.skills.map((s) => s.slug);
          query.category = { $in: slugs };
        }
      } catch (_) {
        // Invalid token — show all jobs
      }
    }

    const jobs = await Job.find(query).populate("employer", "name email");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET EMPLOYER JOBS
// ==============================
router.get("/employer/:id", async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.params.id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// WORKER APPLIES TO JOB
// ==============================
router.post("/apply", async (req, res) => {
  try {
    const { jobId, workerId, proposedRate, message } = req.body;

    const bid = await Bid.create({
      job: jobId,
      worker: workerId,
      proposedRate,
      message,
    });

    res.status(201).json({
      message: "Offer sent successfully",
      bid,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET BIDS FOR A JOB (Employer)
// ==============================
router.get("/bids/:jobId", async (req, res) => {
  try {
    const bids = await Bid.find({ job: req.params.jobId })
      .populate("worker", "name email");

    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// EMPLOYER ACCEPTS A BID
// ==============================
router.post("/accept", async (req, res) => {
  try {
    const { bidId } = req.body;

    const bid = await Bid.findById(bidId).populate("job");

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Update Job
    bid.job.status = "in-progress";
    bid.job.acceptedWorker = bid.worker;
    await bid.job.save();

    // Update Bid
    bid.status = "accepted";
    await bid.save();

    // Reject other bids
    await Bid.updateMany(
      { job: bid.job._id, _id: { $ne: bidId } },
      { status: "rejected" }
    );

    res.json({ message: "Worker accepted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

