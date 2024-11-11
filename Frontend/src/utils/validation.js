// utils/validation.js

export const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  
  export const validatePassword = (password) => {
    // Example: Password must be at least 6 characters long
    return password.length >= 6;
  };
  