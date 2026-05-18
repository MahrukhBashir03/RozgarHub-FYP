const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const JobRequest = require("../models/JobRequest");

// GET /job/:jobId — employer fetches applicants for a posted job
// Must be registered BEFORE /:workerId to avoid route collision
router.get("/job/:jobId", async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate("worker", "name phone category profilePhoto")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / — worker applies to a job from the Browse tab
router.post("/", async (req, res) => {
  try {
    const { job, worker, offeredRate } = req.body;
    if (!job || !worker || !offeredRate) {
      return res.status(400).json({ error: "job, worker, and offeredRate are required." });
    }
    const existing = await Application.findOne({ job, worker });
    if (existing) {
      return res.status(409).json({ error: "You have already applied to this job." });
    }
    const application = await Application.create({ job, worker, offeredRate: Number(offeredRate) });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/accept — employer accepts an application
// Creates a confirmed JobRequest so the job tracker flow can proceed
router.post("/:id/accept", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: "job", select: "title description category workLocation lat lng employer salary urgency" })
      .populate("worker", "name phone");

    if (!application) return res.status(404).json({ error: "Application not found." });
    if (application.status === "accepted") {
      return res.status(409).json({ error: "Application already accepted." });
    }

    application.status = "accepted";
    application.finalPrice = application.offeredRate;
    await application.save();

    const jobRequest = await JobRequest.create({
      title:          application.job.title,
      description:    application.job.description || "",
      category:       application.job.category,
      workLocation:   application.job.workLocation || "",
      offeredPrice:   application.offeredRate,
      employer:       application.job.employer,
      status:         "confirmed",
      acceptedWorker: application.worker._id,
      finalPrice:     application.offeredRate,
      workerName:     application.worker.name  || "",
      workerPhone:    application.worker.phone || "",
      lat:            application.job.lat,
      lng:            application.job.lng,
    });

    res.json({ application, jobRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:workerId — worker fetches all their Browse Job applications
router.get("/:workerId", async (req, res) => {
  try {
    const applications = await Application.find({ worker: req.params.workerId })
      .populate({
        path: "job",
        select: "title category workLocation salary status employer urgency lat lng",
        populate: { path: "employer", select: "name" },
      })
      .sort({ createdAt: -1 });

    const result = applications.map(app => ({
      _id:          app._id,
      jobId:        app.job?._id,
      title:        app.job?.title        || "",
      category:     app.job?.category     || "",
      workLocation: app.job?.workLocation || "",
      salary:       app.job?.salary       || "",
      urgency:      app.job?.urgency      || "",
      offeredRate:  app.offeredRate,
      finalPrice:   app.finalPrice,
      status:       app.status,
      jobStatus:    app.job?.status       || "active",
      employerName: app.job?.employer?.name || "",
      source:       "browse",
      createdAt:    app.createdAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
