const { pool } = require("../config/db");

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, language } = req.body || {};

    console.log("");
    console.log("========================================");
    console.log("📸 [User] Profile Update Request");
    console.log("========================================");
    console.log("👤 User ID:", userId);
    console.log("📦 Request Body:", req.body);
    console.log("📁 Uploaded Selfie:", req.file);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

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

    let selfieUri = null;

    if (req.file) {
      selfieUri =
        `${req.protocol}://${req.get("host")}/uploads/selfies/${req.file.filename}`;

      console.log("📁 Selfie File:", req.file.filename);
      console.log("📦 Selfie Size:", req.file.size);
      console.log("🧾 Selfie MIME:", req.file.mimetype);
      console.log("🔗 Selfie URL:", selfieUri);
    }

    await pool.execute(
      `UPDATE users
       SET name = ?,
           email = ?,
           language = ?,
           selfie_uri = COALESCE(?, selfie_uri)
       WHERE id = ?`,
      [
        name || null,
        email || null,
        language || "English",
        selfieUri,
        userId,
      ]
    );

    const [updatedUsers] = await pool.execute(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    console.log("========================================");
    console.log("✅ User profile updated successfully");
    console.log("========================================");
    console.log("");

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: updatedUsers[0],
    });
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("❌ Update User Profile Error");
    console.error("========================================");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message,
    });
  }
};


// ========================================
// GET USER PROFILE
// ========================================

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("");
    console.log("========================================");
    console.log("👤 [User] Get Profile Request");
    console.log("========================================");
    console.log("👤 User ID:", userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const [users] = await pool.execute(
      `SELECT
        id,
        phone_number,
        language,
        name,
        email,
        selfie_uri,
        application_status,
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

    console.log("✅ User found:", users[0]);

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("❌ Get User Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};


module.exports = {
  updateUserProfile,
  getUserProfile,
};