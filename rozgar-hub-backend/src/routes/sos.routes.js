const express = require("express");
const router  = express.Router();

const { verifyToken } = require("../middleware/auth.middleware");

const {
  triggerSOS,
  cancelSOS,
  updateSOSLocation,
  getMySOSHistory,
  getActiveSOS,
  getAllSOS,
  resolveSOS,
  updateEmergencyContacts,
  getEmergencyContacts,
} = require("../controllers/sos.controller");

// ── Emergency Contacts (User Routes) ──────────────────────────
router.get("/emergency-contacts", verifyToken, getEmergencyContacts);
router.put("/emergency-contacts", verifyToken, updateEmergencyContacts);

// ── Trigger & Manage SOS (Worker Routes) ──────────────────────
router.post("/trigger", verifyToken, triggerSOS);
router.patch("/:sosId/cancel", verifyToken, cancelSOS);
router.patch("/:sosId/location", verifyToken, updateSOSLocation);
router.get("/my-history", verifyToken, getMySOSHistory);

// ── Admin Routes ──────────────────────────────────────────────
router.get("/active", verifyToken, getActiveSOS);      // Admin only
router.get("/all", verifyToken, getAllSOS);            // Admin only
router.patch("/:sosId/resolve", verifyToken, resolveSOS); // Admin only

module.exports = router;
