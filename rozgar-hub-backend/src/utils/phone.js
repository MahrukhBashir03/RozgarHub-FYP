// const normalizePhoneNumber = (phone, defaultCountryCode = "92") => {
//   if (!phone) return null;

//   let digits = String(phone).replace(/\D/g, "");
//   if (!digits) return null;

//   if (digits.startsWith("00")) {
//     digits = digits.substring(2);
//   }

//   if (digits.startsWith(defaultCountryCode)) {
//     return digits;
//   }

//   if (defaultCountryCode === "92") {
//     if (/^03\d{9}$/.test(digits)) {
//       return `92${digits.substring(1)}`;
//     }

//     if (/^3\d{9}$/.test(digits)) {
//       return `92${digits}`;
//     }
//   }

//   if (digits.length <= 10) {
//     return `${defaultCountryCode}${digits}`;
//   }

//   return digits;
// };

// module.exports = { normalizePhoneNumber };
