const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

// Get dashboard data
router.get("/:userId", getDashboard);

module.exports = router;
