// const JobRequest = require("../models/JobRequest");

// // exports.createRequest = async (req, res) => {
// //   try {
// //     const { title, description, category, pickupLocation, dropLocation, offeredPrice, employerId } = req.body;
// //     const request = await JobRequest.create({
// //       title, description, category, pickupLocation, dropLocation,
// //       offeredPrice, employer: employerId
// //     });
// //     res.status(201).json(request);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// exports.createRequest = async (req, res) => {
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
//       employerId
//     } = req.body;

//     const request = await JobRequest.create({
//       title,
//       description,
//       category,
//       workLocation,
//       pickupLocation,
//       dropLocation,
//       budgetType,
//       offeredPrice,
//       urgency,
//       employer: employerId
//     });

//     res.status(201).json(request);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getByEmployer = async (req, res) => {
//   try {
//     const requests = await JobRequest.find({ employer: req.params.employerId })
//       .sort({ createdAt: -1 });
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.acceptOffer = async (req, res) => {
//   try {
//     const { workerId, finalPrice } = req.body;
//     const request = await JobRequest.findByIdAndUpdate(
//       req.params.id,
//       { status: "confirmed", acceptedWorker: workerId, finalPrice },
//       { new: true }
//     );
//     res.json(request);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const r = await JobRequest.findById(req.params.id).populate("employer", "name email");
//     res.json(r);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// controllers/jobRequest.controller.js
const JobRequest = require("../models/JobRequest");

/* ── Create a new job request ── */
exports.createRequest = async (req, res) => {
  try {
    const {
      title, description, category,
      workLocation, pickupLocation, dropLocation,
      budgetType, offeredPrice, urgency,
      jobDuration,   // ← NEW: job duration field
      employerId,
      lat, lng,
    } = req.body;

    const request = await JobRequest.create({
      title, description, category,
      workLocation, pickupLocation, dropLocation,
      budgetType, urgency,
      jobDuration: jobDuration || "",
      offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
      employer: employerId,
      lat, lng,
      status: "pending",
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("createRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Get all requests by employer (with optional ?status filter) ── */
exports.getByEmployer = async (req, res) => {
  try {
    const filter = { employer: req.params.employerId };
    if (req.query.status) filter.status = req.query.status;

    const requests = await JobRequest.find(filter)
      .populate("acceptedWorker", "name phone category profilePhoto")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("getByEmployer error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Get all requests where this worker was accepted/confirmed ── */
exports.getByWorker = async (req, res) => {
  try {
    const requests = await JobRequest.find({ acceptedWorker: req.params.workerId })
      .populate("employer", "name phone email")
      .sort({ createdAt: -1 });

    // Map to a clean shape the frontend expects
    const result = requests.map(r => ({
      _id:            r._id,
      jobTitle:       r.title || r.category,
      category:       r.category,
      workLocation:   r.workLocation,
      offeredPrice:   r.offeredPrice,
      agreedPrice:    r.finalPrice || r.offeredPrice,
      jobDuration:    r.jobDuration || "",
      status:         r.status,
      employerName:   r.employer?.name  || "",
      employerPhone:  r.employer?.phone || "",
      createdAt:      r.createdAt,
      updatedAt:      r.updatedAt,
      lat:            r.lat,
      lng:            r.lng,
    }));

    res.json(result);
  } catch (err) {
    console.error("getByWorker error:", err);
    res.status(500).json({ error: err.message });
  }
};

/*
  ── Employer accepts a worker and confirms the job ──
  Body: { workerId, workerName, workerPhone, finalPrice }
  We store workerName + workerPhone directly on the JobRequest so
  the Requests tab can display them without a separate Worker populate.
*/
exports.acceptOffer = async (req, res) => {
  try {
    const { workerId, workerName, workerPhone, finalPrice } = req.body;

    const request = await JobRequest.findByIdAndUpdate(
      req.params.id,
      {
        status:         "confirmed",
        acceptedWorker: workerId,
        finalPrice,
        // Cache name + phone so we can render them without a second lookup
        workerName:     workerName  || "",
        workerPhone:    workerPhone || "",
      },
      { new: true }
    ).populate("acceptedWorker", "name phone category");

    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error("acceptOffer error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Mark job as completed ── */
exports.completeJob = async (req, res) => {
  try {
    const request = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error("completeJob error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Update job status (generic PATCH) ── */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending","confirmed","in_progress","pending_payment","payment_sent","completed","cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const request = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    console.error("updateStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ── Get single request by ID ── */
exports.getById = async (req, res) => {
  try {
    const r = await JobRequest.findById(req.params.id)
      .populate("employer",        "name email phone")
      .populate("acceptedWorker",  "name phone category");
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(r);
  } catch (err) {
    console.error("getById error:", err);
    res.status(500).json({ error: err.message });
  }
};