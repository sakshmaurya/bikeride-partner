const express = require("express");

const {
  updateUserProfile,
  getUserProfile,
} = require("../controllers/userController");

const selfieUpload = require("../middleware/selfieUpload");

const router = express.Router();

// Get user profile
router.get(
  "/:userId",
  getUserProfile
);

// Update user profile / upload selfie
router.put(
  "/:userId",
  selfieUpload.single("selfie"),
  updateUserProfile
);

module.exports = router;