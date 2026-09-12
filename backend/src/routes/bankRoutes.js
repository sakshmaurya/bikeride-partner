const express = require("express");

const {
  updateBankDetails,
  getBankDetails,
} = require("../controllers/bankController");

const router = express.Router();

// Add / update bank details
router.put("/:userId", updateBankDetails);

// Get bank details
router.get("/:userId", getBankDetails);

module.exports = router;