const User      = require("../models/User");
const Job       = require("../models/Job");
const FraudLog  = require("../models/FraudLog");
const Complaint = require("../models/Complaint");
const { isSuspiciousEmail } = require("../middleware/fraud.middleware");

// ── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── AI Fraud Score Calculator ────────────────────────────────────────────────
async function computeFraudScore(user) {
  const flags = [];
  let score = 0;

  // 1. Suspicious email (10 pts)
  if (isSuspiciousEmail(user.email)) {
    flags.push("suspicious_email");
    score += 10;
  }

  // 2. Incomplete profile after 7 days (5 pts)
  const ageDays = (Date.now() - new Date(user.createdAt)) / 86400000;
  if (ageDays > 7 && !user.documents?.profilePhoto) {
    flags.push("no_profile_photo_after_7_days");
    score += 5;
  }
  if (ageDays > 7 && !user.documents?.cnicFront) {
    flags.push("no_cnic_docs_after_7_days");
    score += 5;
  }

  // 3. Repeated complaints (up to 40 pts)
  const complaints = await Complaint.countDocuments({ reportedUser: user._id });
  if (complaints >= 5) { score += 40; flags.push("5+_complaints"); }
  else if (complaints >= 3) { score += 25; flags.push("3-4_complaints"); }
  else if (complaints >= 1) { score += 10; flags.push("1-2_complaints"); }

  // 4. Location anomaly (20 pts) — rapid location change
  if (user.loginHistory && user.loginHistory.length >= 2) {
    const recent = user.loginHistory.slice(-10);
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];
      if (prev.lat && curr.lat) {
        const distKm = haversineKm(prev.lat, prev.lng, curr.lat, curr.lng);
        const timeDiff = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 3600000; // hours
        if (timeDiff > 0 && distKm / timeDiff > 500) {
          // Moved >500 km/h — physically impossible
          flags.push("impossible_location_change");
          score += 20;
          break;
        }
        if (timeDiff < 1 && distKm > 300) {
          // >300km change in <1 hour
          flags.push("suspicious_location_jump");
          score += 15;
          break;
        }
      }
    }
  }

  // 5. Spam job postings — employer posts >10 jobs in 24h (20 pts)
  if (user.role === "employer") {
    const yesterday = new Date(Date.now() - 86400000);
    const recentJobCount = await Job.countDocuments({
      employer: user._id,
      createdAt: { $gte: yesterday },
    });
    if (recentJobCount > 10) { score += 20; flags.push("spam_job_posting_10+"); }
    else if (recentJobCount > 5) { score += 10; flags.push("spam_job_posting_5+"); }
  }

  // 6. Multiple accounts from same registration IP (15 pts)
  if (user.registrationIP) {
    const sameIPCount = await User.countDocuments({
      registrationIP: user.registrationIP,
      _id: { $ne: user._id },
    });
    if (sameIPCount >= 3) { score += 15; flags.push("3+_accounts_same_ip"); }
    else if (sameIPCount >= 2) { score += 8; flags.push("2_accounts_same_ip"); }
  }

  // 7. Not email verified after 48h (5 pts)
  if (!user.isEmailVerified && ageDays > 2) {
    flags.push("email_not_verified");
    score += 5;
  }

  // 8. Account was previously suspended (10 pts)
  const prevSuspensions = await FraudLog.countDocuments({
    userId: user._id,
    eventType: "account_suspended",
  });
  if (prevSuspensions > 0) { score += 10; flags.push("previously_suspended"); }

  return { score: Math.min(score, 100), flags };
}

// ── GET /api/fraud/score/:userId ─────────────────────────────────────────────
const getUserFraudScore = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { score, flags } = await computeFraudScore(user);

    const riskLevel =
      score >= 70 ? "critical" :
      score >= 50 ? "high" :
      score >= 25 ? "medium" : "low";

    await User.findByIdAndUpdate(user._id, { fraudScore: score, fraudFlags: flags });

    res.json({ userId: user._id, name: user.name, score, riskLevel, flags });
  } catch (err) {
    console.error("Fraud score error:", err);
    res.status(500).json({ error: "Failed to compute fraud score" });
  }
};

// ── POST /api/fraud/analyze-all ─────────────────────────────────────── (admin)
const analyzeAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const results = [];

    for (const user of users) {
      const { score, flags } = await computeFraudScore(user);
      const riskLevel =
        score >= 70 ? "critical" :
        score >= 50 ? "high" :
        score >= 25 ? "medium" : "low";

      await User.findByIdAndUpdate(user._id, { fraudScore: score, fraudFlags: flags });

      if (score > 0) {
        results.push({ userId: user._id, name: user.name, email: user.email, role: user.role, score, riskLevel, flags });
      }
    }

    results.sort((a, b) => b.score - a.score);
    res.json({ analyzed: users.length, flagged: results.length, results });
  } catch (err) {
    console.error("analyzeAllUsers error:", err);
    res.status(500).json({ error: "Batch analysis failed" });
  }
};

// ── GET /api/fraud/flagged ────────────────────────────────────────────── (admin)
const getFlaggedUsers = async (req, res) => {
  try {
    const minScore = parseInt(req.query.minScore) || 25;
    const users = await User.find({ fraudScore: { $gte: minScore } })
      .select("name email role fraudScore fraudFlags isSuspended complaintsCount createdAt")
      .sort({ fraudScore: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flagged users" });
  }
};

// ── GET /api/fraud/logs ─────────────────────────────────────────────── (admin)
const getFraudLogs = async (req, res) => {
  try {
    const logs = await FraudLog.find({})
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fraud logs" });
  }
};

// ── PATCH /api/fraud/suspend/:userId ─────────────────────────────────── (admin)
const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isSuspended: true, suspendedReason: reason || "Suspended by admin", suspendedAt: new Date() },
      { new: true }
    ).select("name email isSuspended suspendedReason");

    if (!user) return res.status(404).json({ error: "User not found" });

    await FraudLog.create({
      userId: user._id,
      eventType: "account_suspended",
      severity: "high",
      description: `Account suspended by admin. Reason: ${reason || "Unspecified"}`,
      metadata: { extra: { suspendedBy: req.user?._id } },
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to suspend user" });
  }
};

// ── PATCH /api/fraud/unsuspend/:userId ────────────────────────────────── (admin)
const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isSuspended: false, suspendedReason: null, suspendedAt: null },
      { new: true }
    ).select("name email isSuspended");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to unsuspend user" });
  }
};

// ── POST /api/fraud/complaints ───────────────────────────────────────────────
const fileComplaint = async (req, res) => {
  try {
    const { reportedUserId, category, description, jobId } = req.body;
    const reporterId = req.user._id;

    if (String(reporterId) === String(reportedUserId)) {
      return res.status(400).json({ error: "You cannot report yourself." });
    }

    // Prevent duplicate complaints from same reporter for same user in 24h
    const existing = await Complaint.findOne({
      reportedBy: reporterId,
      reportedUser: reportedUserId,
      createdAt: { $gte: new Date(Date.now() - 86400000) },
    });
    if (existing) {
      return res.status(400).json({ error: "You already filed a complaint against this user in the last 24 hours." });
    }

    const complaint = await Complaint.create({
      reportedBy: reporterId,
      reportedUser: reportedUserId,
      category,
      description,
      jobId: jobId || null,
    });

    // Increment complaint counter on the reported user
    const reportedUser = await User.findByIdAndUpdate(
      reportedUserId,
      { $inc: { complaintsCount: 1 } },
      { new: true }
    );

    // Auto-flag if complaints hit threshold
    if (reportedUser && reportedUser.complaintsCount >= 3) {
      await FraudLog.create({
        userId: reportedUserId,
        eventType: "repeated_complaints",
        severity: reportedUser.complaintsCount >= 5 ? "critical" : "high",
        description: `User has received ${reportedUser.complaintsCount} complaints.`,
        metadata: { flagCount: reportedUser.complaintsCount },
      });

      // Auto-suspend if 5+ complaints
      if (reportedUser.complaintsCount >= 5 && !reportedUser.isSuspended) {
        await User.findByIdAndUpdate(reportedUserId, {
          isSuspended: true,
          suspendedReason: "Auto-suspended: 5+ complaints received",
          suspendedAt: new Date(),
        });
      }
    }

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    console.error("fileComplaint error:", err);
    res.status(500).json({ error: "Failed to file complaint" });
  }
};

// ── GET /api/fraud/complaints ──────────────────────────────────────── (admin)
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate("reportedBy",   "name email role")
      .populate("reportedUser", "name email role fraudScore isSuspended")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

// ── PATCH /api/fraud/complaints/:id/resolve ─────────────────────────── (admin)
const resolveComplaint = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve complaint" });
  }
};

// ── GET /api/fraud/stats ──────────────────────────────────────────── (admin)
const getFraudStats = async (req, res) => {
  try {
    const [
      totalFlagged,
      suspended,
      criticalRisk,
      highRisk,
      pendingComplaints,
      totalComplaints,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments({ fraudScore: { $gte: 25 } }),
      User.countDocuments({ isSuspended: true }),
      User.countDocuments({ fraudScore: { $gte: 70 } }),
      User.countDocuments({ fraudScore: { $gte: 50, $lt: 70 } }),
      Complaint.countDocuments({ status: "pending" }),
      Complaint.countDocuments({}),
      FraudLog.find({ resolved: false }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      totalFlagged, suspended, criticalRisk, highRisk,
      pendingComplaints, totalComplaints, recentLogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fraud stats" });
  }
};

module.exports = {
  getUserFraudScore,
  analyzeAllUsers,
  getFlaggedUsers,
  getFraudLogs,
  suspendUser,
  unsuspendUser,
  fileComplaint,
  getAllComplaints,
  resolveComplaint,
  getFraudStats,
  computeFraudScore,
};