// // Password validation with constraints
// const validatePassword = (password) => {
//   const errors = [];

//   // Check minimum length (8 characters)
//   if (password.length < 8) {
//     errors.push("Password must be at least 8 characters long");
//   }

//   // Check for special characters
//   if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
//     errors.push("Password must contain at least one special character (!@#$%^&*)");
//   }

//   // Optional: Check for uppercase
//   if (!/[A-Z]/.test(password)) {
//     errors.push("Password must contain at least one uppercase letter");
//   }

//   // Optional: Check for lowercase
//   if (!/[a-z]/.test(password)) {
//     errors.push("Password must contain at least one lowercase letter");
//   }

//   // Optional: Check for numbers
//   if (!/\d/.test(password)) {
//     errors.push("Password must contain at least one number");
//   }

//   return {
//     isValid: errors.length === 0,
//     errors,
//   };
// };

// module.exports = { validatePassword };
