const express = require("express");

const {
  updateVehicleDetails,
  getVehicleDetails,
} = require("../controllers/vehicleController");

const upload = require("../middleware/vehicleUpload");

const router = express.Router();

// Add / update vehicle details + bike photo
router.put(
  "/:userId",
  upload.single("vehicleImage"),
  updateVehicleDetails
);

// Get vehicle details
router.get("/:userId", getVehicleDetails);

module.exports = router;