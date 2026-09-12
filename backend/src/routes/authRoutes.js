
const express = require("express");

const {
  sendOtp,
  registerSendOtp,
  verifyOtp,
} = require("../controllers/authController");

const router = express.Router();

// Login
router.post("/send-otp", sendOtp);

// Register
router.post("/register/send-otp", registerSendOtp);

// Common OTP verification
router.post("/verify-otp", verifyOtp);

module.exports = router;
