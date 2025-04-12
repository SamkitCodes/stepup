// validationHelper.js - Provides validation functions for user input

// Regex for DOB in DD/MM/YYYY format
const dobRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

// Validate the Date of Birth field and check age > 16
export const validateDOB = (dob) => {
  if (!dob) {
    return "Date of birth is required";
  }

  if (!dobRegex.test(dob)) {
    return "DOB must be in DD/MM/YYYY format";
  }

  // Convert dob (DD/MM/YYYY) into a Date object
  const [day, month, year] = dob.split("/").map(Number);
  const dobDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();

  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age <= 16) {
    return "You must be older than 16 to register";
  }

  return "";
};

// Validate the entire registration form
export const validateRegistration = ({ name, email, dob, password }) => {
  const errors = {};

  // Validate Name
  if (!name || name.trim() === "") {
    errors.name = "Name is required";
  }

  // Validate Email
  if (!email || email.trim() === "") {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Email is invalid";
  }

  // Validate Date of Birth using helper function
  const dobError = validateDOB(dob);
  if (dobError) {
    errors.dob = dobError;
  }

  // Validate Password
  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  return errors;
};
