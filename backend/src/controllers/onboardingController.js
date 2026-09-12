const { pool } = require("../config/db");

const getOnboardingStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Get user
    const [users] = await pool.execute(
      `SELECT *
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

    // Get documents
    const [documents] = await pool.execute(
      `SELECT document_type, document_uri, status
       FROM documents
       WHERE user_id = ?`,
      [userId]
    );

    const requiredDocuments = [
      "drivingLicense",
      "aadhaar",
      "pan",
      "rc",
      "insurance",
      "pollution",
    ];

    const uploadedDocuments = documents.filter(
      (document) =>
        document.document_uri &&
        ["uploaded", "verified"].includes(document.status)
    );

    const allDocumentsUploaded = requiredDocuments.every(
      (type) =>
        uploadedDocuments.some(
          (document) => document.document_type === type
        )
    );

    // Check selfie
    const selfieCompleted = Boolean(user.selfie_uri);

    // Check bank details
    const [bankDetails] = await pool.execute(
      `SELECT id
       FROM bank_details
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    const bankDetailsCompleted = bankDetails.length > 0;

    // Check vehicle details
    const [vehicleDetails] = await pool.execute(
      `SELECT id
       FROM vehicle_details
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    const vehicleDetailsCompleted = vehicleDetails.length > 0;

    // Profile completion
    const profileCompleted = Boolean(user.name);

    // Determine next step
    let nextStep = "completed";

    if (!profileCompleted) {
      nextStep = "profile";
    } else if (!allDocumentsUploaded) {
      nextStep = "documents";
    } else if (!selfieCompleted) {
      nextStep = "selfie";
    } else if (!bankDetailsCompleted) {
      nextStep = "bank";
    } else if (!vehicleDetailsCompleted) {
      nextStep = "vehicle";
    }

    const onboardingCompleted =
      profileCompleted &&
      allDocumentsUploaded &&
      selfieCompleted &&
      bankDetailsCompleted &&
      vehicleDetailsCompleted;

    // Update application status and registration completion
    let applicationStatus = user.application_status;

    if (onboardingCompleted && !user.registration_completed) {
      applicationStatus = "under_review";

      await pool.execute(
        `UPDATE users
         SET application_status = 'under_review',
             registration_completed = TRUE
         WHERE id = ?`,
        [userId]
      );
    }

    return res.status(200).json({
      success: true,
      userId: Number(userId),
      onboardingCompleted,
      registrationCompleted: user.registration_completed || onboardingCompleted,
      applicationStatus,
      nextStep,
      progress: {
        profile: profileCompleted,
        documents: allDocumentsUploaded,
        selfie: selfieCompleted,
        bank: bankDetailsCompleted,
        vehicle: vehicleDetailsCompleted,
      },
    });
  } catch (error) {
    console.error("Get Onboarding Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get onboarding status",
    });
  }
};

module.exports = {
  getOnboardingStatus,
};