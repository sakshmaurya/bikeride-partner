const { pool } = require("../config/db");

const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    console.log("");
    console.log("========================================");
    console.log("📊 [Dashboard] Loading dashboard data");
    console.log("========================================");
    console.log("👤 User ID:", userId);

    // Get user
    const [users] = await pool.execute(
      `SELECT
        id,
        phone_number,
        language,
        name,
        email,
        selfie_uri,
        application_status,
        registration_completed,
        created_at,
        updated_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Get vehicle details
    const [vehicleDetails] = await pool.execute(
      `SELECT *
       FROM vehicle_details
       WHERE user_id = ?`,
      [userId]
    );

    // Get bank details
    const [bankDetails] = await pool.execute(
      `SELECT *
       FROM bank_details
       WHERE user_id = ?`,
      [userId]
    );

    // Get documents
    const [documents] = await pool.execute(
      `SELECT *
       FROM documents
       WHERE user_id = ?
       ORDER BY id ASC`,
      [userId]
    );

    console.log("✅ Dashboard data loaded successfully");

    return res.status(200).json({
      success: true,
      dashboard: {
        user: {
          id: user.id,
          phone_number: user.phone_number,
          language: user.language,
          name: user.name,
          email: user.email,
          selfie_uri: user.selfie_uri,
          application_status: user.application_status,
          registration_completed: user.registration_completed,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        vehicle: vehicleDetails.length > 0 ? vehicleDetails[0] : null,
        bank: bankDetails.length > 0 ? bankDetails[0] : null,
        documents: documents,
        applicationStatus: user.application_status,
        registrationCompleted: user.registration_completed,
      },
    });
  } catch (error) {
    console.error("❌ Get Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};
