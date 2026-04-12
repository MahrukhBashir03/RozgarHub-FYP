// // const express = require("express");
// // const router = express.Router();
// // const ctrl = require("../controllers/jobRequest.controller");

// // router.post("/", ctrl.createRequest);
// // router.get("/employer/:employerId", ctrl.getByEmployer);
// // router.post("/:id/accept", ctrl.acceptOffer);
// // router.get("/:id", ctrl.getById);

// // module.exports = router;

// // const express = require("express");
// // const router  = express.Router();
// // const JobRequest = require("./models/JobRequest");

// // // POST /api/job-requests  — create new request
// // router.post("/", async (req, res) => {
// //   try {
// //     const { title, description, category, workLocation, pickupLocation,
// //             dropLocation, budgetType, offeredPrice, urgency, employerId } = req.body;

// //     const request = await JobRequest.create({
// //       title, description, category, workLocation, pickupLocation,
// //       dropLocation, budgetType, urgency,
// //       offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
// //       employer: employerId,
// //     });
// //     res.status(201).json(request);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // GET /api/job-requests/employer/:id
// // router.get("/employer/:id", async (req, res) => {
// //   try {
// //     const requests = await JobRequest.find({ employer: req.params.id }).sort({ createdAt: -1 });
// //     res.json(requests);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // POST /api/job-requests/:id/accept  — employer accepts worker offer
// // router.post("/:id/accept", async (req, res) => {
// //   try {
// //     const { workerId, finalPrice } = req.body;
// //     const updated = await JobRequest.findByIdAndUpdate(
// //       req.params.id,
// //       { status: "confirmed", acceptedWorker: workerId, finalPrice },
// //       { new: true }
// //     );
// //     res.json(updated);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // GET /api/job-requests/:id
// // router.get("/:id", async (req, res) => {
// //   try {
// //     const r = await JobRequest.findById(req.params.id).populate("employer","name email");
// //     res.json(r);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // module.exports = router;

// // src/routes/jobRequest.routes.js
// const express = require("express");
// const router = express.Router();
// const Job = require("../models/Job");           // Changed to Job model
// const Application = require("../models/Application"); // Optional - future use

// // POST /api/job-requests  — create new job request
// router.post("/", async (req, res) => {
//   try {
//     const { 
//       title, 
//       description, 
//       category, 
//       workLocation, 
//       pickupLocation,
//       dropLocation, 
//       budgetType, 
//       offeredPrice, 
//       urgency, 
//       employerId,
//       lat,
//       lng
//     } = req.body;

//     const job = await Job.create({
//       employer: employerId,
//       title,
//       description,
//       category,
//       workLocation,
//       lat,
//       lng,
//       salary: offeredPrice ? `Rs. ${offeredPrice}` : "Negotiable",
//       offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
//       urgency: urgency || "flexible",
//       status: "active"
//     });

//     res.status(201).json(job);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET /api/job-requests/employer/:id
// router.get("/employer/:id", async (req, res) => {
//   try {
//     const jobs = await Job.find({ 
//       employer: req.params.id 
//     }).sort({ createdAt: -1 });

//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST /api/job-requests/:id/accept  — employer accepts a worker
// router.post("/:id/accept", async (req, res) => {
//   try {
//     const { workerId, finalPrice } = req.body;

//     const updatedJob = await Job.findByIdAndUpdate(
//       req.params.id,
//       { 
//         status: "completed",           // or "active" depending on your flow
//         selectedWorker: workerId, 
//         finalPrice: finalPrice ? Number(finalPrice) : undefined 
//       },
//       { new: true }
//     ).populate("selectedWorker", "name phone category");

//     if (!updatedJob) {
//       return res.status(404).json({ error: "Job request not found" });
//     }

//     res.json(updatedJob);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET single job request
// router.get("/:id", async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id)
//       .populate("employer", "name email phone")
//       .populate("selectedWorker", "name phone category");

//     if (!job) {
//       return res.status(404).json({ error: "Job not found" });
//     }

//     res.json(job);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

// routes/jobRequest.routes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/jobRequest.controller");

// POST   /api/job-requests              — employer posts a new job request
router.post("/", ctrl.createRequest);

// GET    /api/job-requests/employer/:employerId
// GET    /api/job-requests/employer/:employerId?status=completed
router.get("/employer/:employerId", ctrl.getByEmployer);

// GET    /api/job-requests/worker/:workerId
// Returns all requests this worker was confirmed/accepted for
router.get("/worker/:workerId", ctrl.getByWorker);

// POST   /api/job-requests/:id/accept   — employer confirms a worker
// Body: { workerId, workerName, workerPhone, finalPrice }
router.post("/:id/accept", ctrl.acceptOffer);

// PATCH  /api/job-requests/:id/complete — mark job as completed (called when tracker ends)
router.patch("/:id/complete", ctrl.completeJob);

// PATCH  /api/job-requests/:id/status   — update job status during tracker flow
// Body: { status: "in_progress" | "pending_payment" | "payment_sent" | ... }
router.patch("/:id/status", ctrl.updateStatus);

// GET    /api/job-requests/:id          — get single request
router.get("/:id", ctrl.getById);

module.exports = router;