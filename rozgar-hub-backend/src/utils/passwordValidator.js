// Password validation constraints
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  uppercase: true, // At least 1 A-Z
  lowercase: true, // At least 1 a-z
  number: true,    // At least 1 0-9
  specialChar: true, // At least 1 !@#$%^&*
};

const SPECIAL_CHAR_REGEX = /[!@#$%^&*]/;

/**
 * Validate password against constraints
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: [] }
 */
const validatePassword = (password) => {
  const errors = [];

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  // Check uppercase
  if (PASSWORD_REQUIREMENTS.uppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter (A-Z)");
  }

  // Check lowercase
  if (PASSWORD_REQUIREMENTS.lowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter (a-z)");
  }

  // Check number
  if (PASSWORD_REQUIREMENTS.number && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least 1 number (0-9)");
  }

  // Check special character
  if (PASSWORD_REQUIREMENTS.specialChar && !SPECIAL_CHAR_REGEX.test(password)) {
    errors.push("Password must contain at least 1 special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get password strength details for frontend (checklist)
 * @param {string} password - Password to check
 * @returns {object} - Constraint status object
 */
const getPasswordStrengthDetails = (password) => {
  return {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: SPECIAL_CHAR_REGEX.test(password),
  };
};

/**
 * Calculate password strength score
 * @param {string} password - Password to evaluate
 * @returns {number} - Strength score 0-5
 */
const getPasswordStrengthScore = (password) => {
  const details = getPasswordStrengthDetails(password);
  return Object.values(details).filter(Boolean).length;
};

module.exports = {
  validatePassword,
  getPasswordStrengthDetails,
  getPasswordStrengthScore,
  PASSWORD_REQUIREMENTS,
};
