/**
 * Calculate profile progress percentage for a user
 * @param {Object} user - User document
 * @returns {Object} - Progress breakdown and percentage
 */
const calculateProfileProgress = (user) => {
  const progress = {
    profilePhoto: user.documents?.profilePhoto ? 100 : 0,
    documents: user.documents?.cnicFront && user.documents?.cnicBack ? 100 : 0,
    category: user.category ? 100 : 0,
    drivingLicense: 0, // Only for drivers
    firstPost: 0, // Only for employers
  };

  // For workers: check if driving license required
  if (user.role === "worker" && user.category === "driver") {
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
    // Worker requirements: photo (20%), documents (20%), category (20%), license (20%), points from jobs (20%)
    total = 5;
    completed += progress.profilePhoto > 0 ? 1 : 0;
    completed += progress.documents > 0 ? 1 : 0;
    completed += progress.category > 0 ? 1 : 0;

    if (user.category === "driver") {
      completed += progress.drivingLicense > 0 ? 1 : 0;
    } else {
      completed += 1; // Skip license requirement
    }

    // 20% from having experience/jobs
    completed += user.points > 0 ? 1 : 0;
  } else if (user.role === "employer") {
    // Employer requirements: photo (33%), documents (33%), first post (34%)
    total = 3;
    completed += progress.profilePhoto > 0 ? 1 : 0;
    completed += progress.documents > 0 ? 1 : 0;
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
      profilePhoto: result.breakdown.profilePhoto > 0,
      documents: result.breakdown.documents > 0,
      category: result.breakdown.category > 0,
      drivingLicense: result.breakdown.drivingLicense > 0,
      firstPost: result.breakdown.firstPost > 0,
      profilePercentage: result.percentage,
    },
  };
};

module.exports = { calculateProfileProgress, buildProfileUpdate };
