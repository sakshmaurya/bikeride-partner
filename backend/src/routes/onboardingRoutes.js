const express = require("express");

const {
  getOnboardingStatus,
} = require("../controllers/onboardingController");

const router = express.Router();

// Get onboarding progress/status
router.get("/:userId", getOnboardingStatus);

module.exports = router;