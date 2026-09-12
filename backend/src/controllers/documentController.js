const { pool } = require("../config/db");

// =========================================================
// UPDATE / UPLOAD DOCUMENT
// =========================================================

const updateDocument = async (req, res) => {
  try {
    const { userId } = req.params;

    // IMPORTANT:
    // multipart/form-data mein req.body available
    // hona chahiye after multer middleware.
    const { documentType } = req.body || {};

    console.log("");
    console.log("========================================");
    console.log("📥 [Documents] Upload request received");
    console.log("========================================");

    console.log("👤 User ID:", userId);
    console.log("📄 Document Type:", documentType);
    console.log("📦 Request Body:", req.body);
    console.log("📁 Uploaded File:", req.file);

    // -------------------------------------------------------
    // VALIDATE DOCUMENT TYPE
    // -------------------------------------------------------

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "documentType is required",
      });
    }

    // -------------------------------------------------------
    // VALIDATE FILE
    // -------------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document image is required",
      });
    }

    console.log("📁 File name:", req.file.filename);
    console.log("📦 File size:", req.file.size);
    console.log("🧾 MIME type:", req.file.mimetype);
    console.log("📂 File path:", req.file.path);

    // -------------------------------------------------------
    // CREATE PUBLIC FILE URL
    // -------------------------------------------------------

    const documentUri =
      `${req.protocol}://${req.get("host")}/uploads/documents/${req.file.filename}`;

    console.log("🔗 Document URL:", documentUri);

    // -------------------------------------------------------
    // SAVE DOCUMENT IN DATABASE
    // -------------------------------------------------------

    await pool.query(
      `
      INSERT INTO documents
        (
          user_id,
          document_type,
          document_uri,
          status
        )
      VALUES
        (?, ?, ?, 'uploaded')
      ON DUPLICATE KEY UPDATE
        document_uri = VALUES(document_uri),
        status = 'uploaded',
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        documentType,
        documentUri,
      ]
    );

    // -------------------------------------------------------
    // GET SAVED DOCUMENT
    // -------------------------------------------------------

    const [rows] = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE user_id = ?
        AND document_type = ?
      `,
      [
        userId,
        documentType,
      ]
    );

    console.log("========================================");
    console.log("✅ Document saved successfully");
    console.log("========================================");
    console.log("");

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      document: rows[0],
    });

  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("❌ Document upload error");
    console.error("========================================");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

// =========================================================
// GET USER DOCUMENTS
// =========================================================

const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(
      "📄 [Documents] Loading documents for user:",
      userId
    );

    const [documents] = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE user_id = ?
      ORDER BY id ASC
      `,
      [userId]
    );

    console.log(
      "✅ [Documents] Documents found:",
      documents.length
    );

    return res.status(200).json({
      success: true,
      documents,
    });

  } catch (error) {
    console.error(
      "❌ Get documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

module.exports = {
  updateDocument,
  getUserDocuments,
};