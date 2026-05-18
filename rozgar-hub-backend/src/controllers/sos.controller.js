const User     = require("../models/User");
const SOSEvent = require("../models/SOSEvent");
const { sendSOSEmail } = require("../utils/sendEmail");

// ── POST /api/sos/trigger ────────────────────────────────────────────────────
const triggerSOS = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { lat, lng, address, accuracy, jobId, jobRequestId, employerId, message } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Location (lat, lng) is required for SOS." });
    }

    const worker = await User.findById(workerId).select(
      "name phone email emergencyContacts role"
    );
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    
    // Allow SOS if user is a worker OR if they don't have a role set (assume worker)
    if (worker.role === "employer") {
      return res.status(403).json({ error: "Only workers can trigger SOS." });
    }

    // Close any previous active SOS from this worker
    await SOSEvent.updateMany(
      { worker: workerId, status: "active" },
      { status: "cancelled", cancelledAt: new Date() }
    );

    const contactsNotified = [];

    // Build notified contacts list
    for (const contact of worker.emergencyContacts || []) {
      contactsNotified.push({
        name:         contact.name,
        phone:        contact.phone,
        email:        contact.email,
        relationship: contact.relationship,
        notifiedAt:   new Date(),
        emailSent:    false,
        smsSent:      false,
      });
    }

    const sosEvent = await SOSEvent.create({
      worker:     workerId,
      location:   { lat, lng, address: address || "", accuracy: accuracy || null },
      jobId:      jobId      || null,
      jobRequestId: jobRequestId || null,
      employerId: employerId || null,
      contactsNotified,
      locationHistory: [{ lat, lng, timestamp: new Date() }],
      message:    message || "",
      adminAlerted: true,
    });

    // ── Notify emergency contacts via email ──────────────────────────────────
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    for (let i = 0; i < contactsNotified.length; i++) {
      const contact = contactsNotified[i];
      if (contact.email) {
        try {
          await sendSOSEmail({
            toEmail:        contact.email,
            contactName:    contact.name,
            workerName:     worker.name,
            workerPhone:    worker.phone || "N/A",
            lat, lng,
            address:        address || "Unknown",
            mapsUrl,
            message:        message || "",
            sosId:          sosEvent._id.toString(),
          });
          contactsNotified[i].emailSent = true;
        } catch (emailErr) {
          console.error(`SOS email failed for ${contact.email}:`, emailErr.message);
        }
      }
    }

    // Update with email sent status
    await SOSEvent.findByIdAndUpdate(sosEvent._id, { contactsNotified });

    // ── Emit socket event for real-time admin alert ──────────────────────────
    if (req.io) {
      req.io.emit("sos_triggered", {
        sosId:      sosEvent._id,
        workerId:   worker._id,
        workerName: worker.name,
        workerPhone: worker.phone,
        lat, lng,
        address:    address || "",
        message:    message || "",
        timestamp:  new Date(),
      });

      // Also notify employer if active job
      if (employerId) {
        req.io.to(String(employerId)).emit("worker_sos", {
          sosId:      sosEvent._id,
          workerName: worker.name,
          lat, lng,
          address:    address || "",
        });
      }
    }

    res.status(201).json({
      success:    true,
      sosId:      sosEvent._id,
      contactsNotified: contactsNotified.length,
      message:    "SOS triggered. Emergency contacts notified.",
    });
  } catch (err) {
    console.error("triggerSOS error:", err);
    res.status(500).json({ error: "Failed to trigger SOS" });
  }
};

// ── PATCH /api/sos/:sosId/cancel ─────────────────────────────────────────────
const cancelSOS = async (req, res) => {
  try {
    const { sosId } = req.params;
    const workerId  = req.user._id;

    const sosEvent = await SOSEvent.findOneAndUpdate(
      { _id: sosId, worker: workerId, status: "active" },
      { status: "cancelled", cancelledAt: new Date() },
      { new: true }
    );

    if (!sosEvent) {
      return res.status(404).json({ error: "Active SOS not found." });
    }

    if (req.io) {
      req.io.emit("sos_cancelled", { sosId, workerId: String(workerId) });
    }

    res.json({ success: true, message: "SOS cancelled." });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel SOS" });
  }
};

// ── PATCH /api/sos/:sosId/location ───────────────────────────────────────────
const updateSOSLocation = async (req, res) => {
  try {
    const { sosId } = req.params;
    const { lat, lng } = req.body;
    const workerId = req.user._id;

    const sosEvent = await SOSEvent.findOneAndUpdate(
      { _id: sosId, worker: workerId, status: "active" },
      { $push: { locationHistory: { lat, lng, timestamp: new Date() } }, "location.lat": lat, "location.lng": lng },
      { new: true }
    );

    if (!sosEvent) return res.status(404).json({ error: "Active SOS not found." });

    if (req.io) {
      req.io.emit("sos_location_update", { sosId, workerId: String(workerId), lat, lng });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update SOS location" });
  }
};

// ── GET /api/sos/my-history ──────────────────────────────────────────────────
const getMySOSHistory = async (req, res) => {
  try {
    const events = await SOSEvent.find({ worker: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SOS history" });
  }
};

// ── GET /api/sos/active ──────────────────────────────────────────── (admin)
const getActiveSOS = async (req, res) => {
  try {
    const events = await SOSEvent.find({ status: "active" })
      .populate("worker", "name phone email documents.profilePhoto")
      .sort({ createdAt: -1 })
      .lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch active SOS events" });
  }
};

// ── GET /api/sos/all ─────────────────────────────────────────────── (admin)
const getAllSOS = async (req, res) => {
  try {
    const events = await SOSEvent.find({})
      .populate("worker", "name phone email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SOS events" });
  }
};

// ── PATCH /api/sos/:sosId/resolve ─────────────────────────────────── (admin)
const resolveSOS = async (req, res) => {
  try {
    const sosEvent = await SOSEvent.findByIdAndUpdate(
      req.params.sosId,
      { status: "resolved", resolvedAt: new Date(), resolvedBy: req.user._id },
      { new: true }
    );
    if (!sosEvent) return res.status(404).json({ error: "SOS event not found." });
    res.json({ success: true, sosEvent });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve SOS" });
  }
};

// ── PUT /api/sos/emergency-contacts ─────────────────────────────────────────
const updateEmergencyContacts = async (req, res) => {
  try {
    const { contacts } = req.body; // array of { name, phone, email, relationship }
    if (!Array.isArray(contacts) || contacts.length > 5) {
      return res.status(400).json({ error: "Provide 1-5 emergency contacts." });
    }
    for (const c of contacts) {
      if (!c.name || !c.phone) {
        return res.status(400).json({ error: "Each contact needs name and phone." });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emergencyContacts: contacts },
      { new: true }
    ).select("emergencyContacts");

    res.json({ success: true, emergencyContacts: user.emergencyContacts });
  } catch (err) {
    res.status(500).json({ error: "Failed to update emergency contacts" });
  }
};

// ── GET /api/sos/emergency-contacts ─────────────────────────────────────────
const getEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("emergencyContacts");
    res.json(user.emergencyContacts || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emergency contacts" });
  }
};

module.exports = {
  triggerSOS,
  cancelSOS,
  updateSOSLocation,
  getMySOSHistory,
  getActiveSOS,
  getAllSOS,
  resolveSOS,
  updateEmergencyContacts,
  getEmergencyContacts,
};