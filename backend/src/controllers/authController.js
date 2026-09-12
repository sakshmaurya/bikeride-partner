const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { parseIndianPhone } = require("../utils/phone");
const {
  sendOtpSms,
  verifyOtpWithProvider,
  OTP_EXPIRY_MINUTES,
} = require("../services/smsService");

const RESEND_COOLDOWN_SECONDS = Number(
  process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
);

const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const issueToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  return jwt.sign(
    {
      userId: user.id,
      phoneNumber: user.phone_number,
    },
    secret,
    { expiresIn: "30d" }
  );
};

const getLatestOtpRow = async (phoneNumber) => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM otp_verifications
     WHERE phone_number = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [phoneNumber]
  );

  return rows[0] || null;
};

const buildAuthPayload = (user, isNewUser) => {
  let nextStep = "check_onboarding";

  const registrationCompleted = Boolean(
    user.registration_completed
  );

  if (registrationCompleted) {
    if (user.application_status === "approved") {
      nextStep = "dashboard";
    } else if (user.application_status === "under_review") {
      nextStep = "under_review";
    } else {
      nextStep = "dashboard";
    }
  } else if (isNewUser) {
    nextStep = "profile";
  }

  return {
    success: true,
    message: "OTP verified successfully",
    isNewUser,
    userId: user.id,
    token: issueToken(user),
    registrationCompleted,
    applicationStatus: user.application_status,
    nextStep,
  };
};

const sendOtpForPurpose = async (req, res, purpose) => {
  try {
    const phone = parseIndianPhone(
      req.body.phoneNumber || req.body.phone
    );

    if (!phone) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PHONE",
        message: "Please enter a valid Indian phone number",
      });
    }

    // ----------------------------------------------------------
    // Check whether the user already exists
    // ----------------------------------------------------------

    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [phone.local]
    );

    // ----------------------------------------------------------
    // REGISTER
    // Existing account cannot register again
    // ----------------------------------------------------------

    if (purpose === "register" && users.length > 0) {
      return res.status(409).json({
        success: false,
        code: "ACCOUNT_EXISTS",
        message: "Account already exists. Please login to continue.",
      });
    }

    // ----------------------------------------------------------
    // LOGIN
    // Account must already exist
    // ----------------------------------------------------------

    if (purpose === "login" && users.length === 0) {
      return res.status(404).json({
        success: false,
        code: "ACCOUNT_NOT_FOUND",
        message: "No account found for this number. Please register.",
      });
    }

    // ----------------------------------------------------------
    // OTP RESEND COOLDOWN
    // ----------------------------------------------------------

    const existing = await getLatestOtpRow(phone.local);

    if (
      existing &&
      existing.last_sent_at &&
      existing.verified === 0
    ) {
      const elapsed =
        (Date.now() -
          new Date(existing.last_sent_at).getTime()) /
        1000;

      if (elapsed < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          code: "RESEND_COOLDOWN",
          retryAfter: Math.ceil(
            RESEND_COOLDOWN_SECONDS - elapsed
          ),
          message: `Please wait ${Math.ceil(
            RESEND_COOLDOWN_SECONDS - elapsed
          )} seconds before requesting a new OTP`,
        });
      }
    }

    // ==========================================================
    // OTP MODE
    // ==========================================================
    //
    // DEMO MODE:
    // - No SMS is sent
    // - Fixed OTP is used
    // - Default OTP = 123456
    // - Useful for client/local testing
    //
    // REAL MODE:
    // - Existing Twilio / MSG91 code is used
    // - Real SMS OTP is sent
    //
    // FUTURE SWITCH:
    //
    // DEMO:
    //   Keep DEMO block uncommented
    //   Keep REAL line commented
    //
    // REAL:
    //   Comment DEMO block
    //   Uncomment REAL line
    //
    // ==========================================================


    // ==========================================================
    // DEMO OTP — CLIENT / LOCAL TESTING
    // ==========================================================
    //
    // No SMS provider is called.
    // OTP is stored as a bcrypt hash in the database.
    //
    // DEMO OTP comes from:
    // DEMO_OTP=123456
    //
    // ----------------------------------------------------------

    const smsResult = {
      provider: "demo",
      otp: String(process.env.DEMO_OTP || "123456"),
      providerRef: null,
    };


    // ==========================================================
    // REAL OTP — TWILIO / MSG91
    // ==========================================================
    //
    // IMPORTANT:
    // This is the existing real OTP implementation.
    // DO NOT DELETE IT.
    //
    // To enable real OTP later:
    //
    // 1. Comment the DEMO block above.
    //
    // 2. Uncomment this line:
    //
    // const smsResult = await sendOtpSms(phone);
    //
    // ----------------------------------------------------------

    // const smsResult = await sendOtpSms(phone);


    // ----------------------------------------------------------
    // OTP expiry
    // ----------------------------------------------------------

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // ----------------------------------------------------------
    // Store OTP as bcrypt hash
    //
    // Demo:
    //   123456 -> bcrypt hash -> database
    //
    // Real Twilio Verify:
    //   smsResult.otp is null
    //   provider verification is used later
    // ----------------------------------------------------------

    const otpHash = smsResult.otp
      ? await bcrypt.hash(smsResult.otp, 10)
      : null;

    // ----------------------------------------------------------
    // Delete previous unverified OTP
    // ----------------------------------------------------------

    await pool.execute(
      `DELETE FROM otp_verifications
       WHERE phone_number = ?
       AND verified = FALSE`,
      [phone.local]
    );

    // ----------------------------------------------------------
    // Store new OTP verification record
    // ----------------------------------------------------------

    await pool.execute(
      `INSERT INTO otp_verifications
       (
         phone_number,
         otp_hash,
         provider,
         purpose,
         expires_at,
         verified,
         attempt_count,
         last_sent_at
       )
       VALUES (?, ?, ?, ?, ?, FALSE, 0, NOW())`,
      [
        phone.local,
        otpHash,
        smsResult.provider,
        purpose,
        expiresAt,
      ]
    );

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: OTP_EXPIRY_MINUTES * 60,
      resendAfter: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "OTP_SEND_FAILED",
      message: error.message || "Failed to send OTP",
    });
  }
};


// ============================================================
// LOGIN OTP
// ============================================================

const sendOtp = (req, res) =>
  sendOtpForPurpose(req, res, "login");


// ============================================================
// REGISTER OTP
// ============================================================

const registerSendOtp = (req, res) =>
  sendOtpForPurpose(req, res, "register");


// ============================================================
// VERIFY OTP
// ============================================================

const verifyOtp = async (req, res) => {
  try {
    const phone = parseIndianPhone(
      req.body.phoneNumber || req.body.phone
    );

    const otp = String(req.body.otp || "").trim();

    const requestedPurpose =
      req.body.mode === "register"
        ? "register"
        : "login";

    // ----------------------------------------------------------
    // Validate phone
    // ----------------------------------------------------------

    if (!phone) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PHONE",
        message: "Please enter a valid Indian phone number",
      });
    }

    // ----------------------------------------------------------
    // Validate OTP format
    // ----------------------------------------------------------

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_OTP",
        message: "Please enter a valid 6-digit OTP",
      });
    }

    // ----------------------------------------------------------
    // Find latest unverified OTP
    // ----------------------------------------------------------

    const [otpRows] = await pool.execute(
      `SELECT *
       FROM otp_verifications
       WHERE phone_number = ?
       AND verified = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone.local]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({
        success: false,
        code: "OTP_NOT_FOUND",
        message: "Invalid or expired OTP",
      });
    }

    const otpRow = otpRows[0];

    // ----------------------------------------------------------
    // Check expiry
    // ----------------------------------------------------------

    if (
      new Date(otpRow.expires_at).getTime() <=
      Date.now()
    ) {
      return res.status(400).json({
        success: false,
        code: "OTP_EXPIRED",
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ----------------------------------------------------------
    // Check maximum attempts
    // ----------------------------------------------------------

    if (
      Number(otpRow.attempt_count) >=
      MAX_ATTEMPTS
    ) {
      return res.status(429).json({
        success: false,
        code: "OTP_LOCKED",
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // Increase attempt count
    // ----------------------------------------------------------

    await pool.execute(
      `UPDATE otp_verifications
       SET attempt_count = attempt_count + 1
       WHERE id = ?`,
      [otpRow.id]
    );

    // ----------------------------------------------------------
    // OTP Verification
    // ----------------------------------------------------------
    //
    // DEMO OTP:
    // provider = "demo"
    // provider verification returns null
    // bcrypt.compare() verifies the stored demo OTP hash
    //
    // REAL OTP:
    // Twilio / MSG91 provider verification is used
    // Existing implementation remains unchanged
    //
    // ----------------------------------------------------------

    let verified = false;

    const providerResult =
      await verifyOtpWithProvider(
        phone,
        otp,
        otpRow.provider
      );

    if (
      providerResult &&
      providerResult.ok
    ) {
      verified = true;
    } else if (otpRow.otp_hash) {
      verified = await bcrypt.compare(
        otp,
        otpRow.otp_hash
      );
    } else if (
      providerResult &&
      providerResult.ok === false
    ) {
      verified = false;
    }

    // ----------------------------------------------------------
    // Invalid OTP
    // ----------------------------------------------------------

    if (!verified) {
      return res.status(400).json({
        success: false,
        code: "INVALID_OTP",
        message: "Invalid or expired OTP",
      });
    }

    // ----------------------------------------------------------
    // Mark OTP as verified
    // ----------------------------------------------------------

    await pool.execute(
      `UPDATE otp_verifications
       SET verified = TRUE
       WHERE id = ?`,
      [otpRow.id]
    );

    const purpose =
      otpRow.purpose || requestedPurpose;

    // ----------------------------------------------------------
    // Find user
    // ----------------------------------------------------------

    const [users] = await pool.execute(
      `SELECT *
       FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [phone.local]
    );

    // ----------------------------------------------------------
    // USER DOES NOT EXIST
    // ----------------------------------------------------------

    if (users.length === 0) {
      // --------------------------------------------------------
      // Login with unknown number
      // --------------------------------------------------------

      if (purpose === "login") {
        return res.status(404).json({
          success: false,
          code: "ACCOUNT_NOT_FOUND",
          message:
            "No account found for this number. Please register.",
        });
      }

      // --------------------------------------------------------
      // Register new user
      // --------------------------------------------------------

      const [result] = await pool.execute(
        `INSERT INTO users
         (
           phone_number,
           application_status,
           registration_completed
         )
         VALUES (?, 'new', FALSE)`,
        [phone.local]
      );

      const [created] = await pool.execute(
        `SELECT *
         FROM users
         WHERE id = ?`,
        [result.insertId]
      );

      return res
        .status(200)
        .json(
          buildAuthPayload(
            created[0],
            true
          )
        );
    }

    // ----------------------------------------------------------
    // EXISTING USER
    // ----------------------------------------------------------

    return res
      .status(200)
      .json(
        buildAuthPayload(
          users[0],
          false
        )
      );
  } catch (error) {
    console.error(
      "Verify OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendOtp,
  registerSendOtp,
  verifyOtp,
};