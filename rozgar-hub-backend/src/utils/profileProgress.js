/**
 * Calculate profile progress percentage for a user
 * @param {Object} user - User document
 * @returns {Object} - Progress breakdown and percentage
 */
const calculateProfileProgress = (user) => {
  const isDriver = user.role === "worker" && (user.category === "driver" || (user.skills || []).some(s => s.slug === "driver"));

  const progress = {
    profilePhoto:    user.documents?.profilePhoto ? 100 : 0,
    documents:       user.documents?.cnicFront && user.documents?.cnicBack ? 100 : 0,
    emailVerified:   user.isEmailVerified ? 100 : 0,
    availability:    user.availabilityPosted || user.category ? 100 : 0,
    drivingLicense:  0, // Only for drivers
    firstPost:       0, // Only for employers
  };

  // For workers: check if driving license uploaded (only required for drivers)
  if (isDriver) {
    progress.drivingLicense = user.documents?.drivingLicense ? 100 : 0;
  }

  // For employers: check if posted first job
  if (user.role === "employer") {
    progress.firstPost = user.jobsPosted > 0 ? 100 : 0;
  }

  // Calculate percentage based on role
  let total = 0;
  let completed = 0;

  if (user.role === "worker") {
    // Steps: registered(always), emailVerified, photo, cnic, availability, license(drivers), adminVerified
    total = isDriver ? 6 : 5;
    completed += 1; // registered — always done
    completed += progress.emailVerified > 0 ? 1 : 0;
    completed += progress.profilePhoto > 0 ? 1 : 0;
    completed += progress.documents > 0 ? 1 : 0;
    completed += progress.availability > 0 ? 1 : 0;
    if (isDriver) completed += progress.drivingLicense > 0 ? 1 : 0;
  } else if (user.role === "employer") {
    // Steps: registered(always), photo, cnic, emailVerified, firstPost, adminVerified
    total = 5;
    completed += 1; // registered
    completed += progress.profilePhoto > 0 ? 1 : 0;
    completed += progress.documents > 0 ? 1 : 0;
    completed += progress.emailVerified > 0 ? 1 : 0;
    completed += progress.firstPost > 0 ? 1 : 0;
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    breakdown: progress,
    percentage,
    completed,
    total,
    isComplete: percentage === 100,
  };
};

const buildProfileUpdate = (user) => {
  const result = calculateProfileProgress(user);

  return {
    profileProgress: {
      profilePhoto:    result.breakdown.profilePhoto > 0,
      documents:       result.breakdown.documents > 0,
      emailVerified:   result.breakdown.emailVerified > 0,
      availability:    result.breakdown.availability > 0,
      drivingLicense:  result.breakdown.drivingLicense > 0,
      firstPost:       result.breakdown.firstPost > 0,
      profilePercentage: result.percentage,
    },
  };
};

module.exports = { calculateProfileProgress, buildProfileUpdate };
