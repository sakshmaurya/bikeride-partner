const { pool } = require("../config/db");

const updateVehicleDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      vehicleNumber,
      vehicleType,
      bikeModel,
      modelYear,
      vehicleColor,
      licenseNumber,
    } = req.body || {};

    console.log("");
    console.log("========================================");
    console.log("🏍️ [Vehicle] Update request received");
    console.log("========================================");
    console.log("👤 User ID:", userId);
    console.log("📦 Request Body:", req.body);
    console.log("📁 Vehicle Image:", req.file);

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Validate required fields
    if (
      !vehicleNumber ||
      !vehicleType ||
      !bikeModel ||
      !modelYear ||
      !vehicleColor ||
      !licenseNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle number, type, model, year, color and driving licence number are required",
      });
    }

    // Bike photo is required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Bike photo is required",
      });
    }

    // Validate model year
    const currentYear = new Date().getFullYear();
    const year = Number(modelYear);

    if (
      !/^\d{4}$/.test(String(modelYear)) ||
      year < 1990 ||
      year > currentYear
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle model year",
      });
    }

    // Validate vehicle number
    const cleanedVehicleNumber = vehicleNumber
      .trim()
      .toUpperCase()
      .replace(/\s/g, "");

    if (
      !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(
        cleanedVehicleNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle number",
      });
    }

    // Validate driving licence number
    const cleanedLicenseNumber = licenseNumber
      .trim()
      .toUpperCase()
      .replace(/\s/g, "");

    if (
      !/^[A-Z]{2}[0-9]{2}[0-9A-Z]{10,16}$/.test(
        cleanedLicenseNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid driving licence number",
      });
    }

    // Check user exists
    const [users] = await pool.execute(
      `SELECT id FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Permanent vehicle image URL
    const vehicleImageUri =
      `${req.protocol}://${req.get("host")}/uploads/vehicles/${req.file.filename}`;

    console.log("📁 Vehicle file name:", req.file.filename);
    console.log("📦 Vehicle file size:", req.file.size);
    console.log("🧾 Vehicle MIME type:", req.file.mimetype);
    console.log("🔗 Vehicle image URL:", vehicleImageUri);

    // Insert or update vehicle details
    await pool.execute(
      `INSERT INTO vehicle_details
       (
         user_id,
         vehicle_brand,
         vehicle_type,
         vehicle_model,
         vehicle_year,
         vehicle_color,
         registration_number,
         license_number,
         vehicle_image_uri
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         vehicle_brand = VALUES(vehicle_brand),
         vehicle_type = VALUES(vehicle_type),
         vehicle_model = VALUES(vehicle_model),
         vehicle_year = VALUES(vehicle_year),
         vehicle_color = VALUES(vehicle_color),
         registration_number = VALUES(registration_number),
         license_number = VALUES(license_number),
         vehicle_image_uri = VALUES(vehicle_image_uri),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        vehicleType,
        vehicleType,
        bikeModel,
        year.toString(),
        vehicleColor,
        cleanedVehicleNumber,
        cleanedLicenseNumber,
        vehicleImageUri,
      ]
    );

    // Get updated vehicle details
    const [vehicleDetails] = await pool.execute(
      `SELECT *
       FROM vehicle_details
       WHERE user_id = ?`,
      [userId]
    );

    console.log("========================================");
    console.log("✅ Vehicle details saved successfully");
    console.log("========================================");
    console.log("");

    return res.status(200).json({
      success: true,
      message: "Vehicle details updated successfully",
      vehicleDetails: vehicleDetails[0],
    });
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("❌ Vehicle Details Error");
    console.error("========================================");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle details",
      error: error.message,
    });
  }
};

const getVehicleDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const [vehicleDetails] = await pool.execute(
      `SELECT *
       FROM vehicle_details
       WHERE user_id = ?`,
      [userId]
    );

    if (vehicleDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle details not found",
      });
    }

    return res.status(200).json({
      success: true,
      vehicleDetails: vehicleDetails[0],
    });
  } catch (error) {
    console.error("Get Vehicle Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle details",
      error: error.message,
    });
  }
};

module.exports = {
  updateVehicleDetails,
  getVehicleDetails,
};