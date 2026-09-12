const { pool } = require("../config/db");

const updateBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      bankAccountName,
      accountNumber,
      ifscCode,
      bankName,
    } = req.body || {};

    console.log("");
    console.log("========================================");
    console.log("🏦 [Bank] Update request received");
    console.log("========================================");
    console.log("👤 User ID:", userId);
    console.log("📦 Request Body:", req.body);

    // ========================================
    // USER ID VALIDATION
    // ========================================

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !bankAccountName ||
      !accountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Account holder name, account number, IFSC code and bank name are required",
      });
    }

    // ========================================
    // ACCOUNT NUMBER VALIDATION
    // ========================================

    if (!/^[0-9]{9,18}$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Account number must contain 9 to 18 digits",
      });
    }

    // ========================================
    // IFSC VALIDATION
    // ========================================

    const cleanedIFSC = ifscCode
      .trim()
      .toUpperCase();

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanedIFSC)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC code",
      });
    }

    // ========================================
    // CHECK USER
    // ========================================

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

    // ========================================
    // INSERT / UPDATE BANK DETAILS
    // ========================================

    await pool.execute(
      `INSERT INTO bank_details
       (
         user_id,
         bank_account_name,
         account_number,
         ifsc_code,
         bank_name
       )
       VALUES (?, ?, ?, ?, ?)

       ON DUPLICATE KEY UPDATE
         bank_account_name = VALUES(bank_account_name),
         account_number = VALUES(account_number),
         ifsc_code = VALUES(ifsc_code),
         bank_name = VALUES(bank_name),
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        bankAccountName.trim(),
        accountNumber,
        cleanedIFSC,
        bankName.trim(),
      ]
    );

    // ========================================
    // FETCH SAVED DATA
    // ========================================

    const [bankDetails] = await pool.execute(
      `SELECT
        id,
        user_id,
        bank_account_name,
        account_number,
        ifsc_code,
        bank_name,
        created_at,
        updated_at
       FROM bank_details
       WHERE user_id = ?`,
      [userId]
    );

    console.log("========================================");
    console.log("✅ Bank details saved successfully");
    console.log("========================================");
    console.log("");

    return res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      bankDetails: bankDetails[0],
    });
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("❌ Update Bank Details Error");
    console.error("========================================");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,
      message: "Failed to update bank details",
      error: error.message,
    });
  }
};


// ========================================
// GET BANK DETAILS
// ========================================

const getBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(
      "🏦 [Bank] Get details for user:",
      userId
    );

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const [bankDetails] = await pool.execute(
      `SELECT
        id,
        user_id,
        bank_account_name,
        account_number,
        ifsc_code,
        bank_name,
        created_at,
        updated_at
       FROM bank_details
       WHERE user_id = ?`,
      [userId]
    );

    if (bankDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found",
      });
    }

    return res.status(200).json({
      success: true,
      bankDetails: bankDetails[0],
    });
  } catch (error) {
    console.error(
      "❌ Get Bank Details Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bank details",
      error: error.message,
    });
  }
};


module.exports = {
  updateBankDetails,
  getBankDetails,
};