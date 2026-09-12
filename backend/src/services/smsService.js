const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_LENGTH = 6;

const isConfigured = () => {
  const provider = String(process.env.SMS_PROVIDER || "")
    .trim()
    .toLowerCase();

  if (provider === "twilio") {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        (process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_FROM)
    );
  }

  if (provider === "msg91") {
    return Boolean(
      process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID
    );
  }

  return false;
};

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(crypto.randomInt(min, max + 1));
};

const sendViaMsg91 = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const sender = process.env.MSG91_SENDER_ID || undefined;

  const response = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile: phone.intl,
      otp,
      otp_expiry: OTP_EXPIRY_MINUTES,
      sender,
      realTimeResponse: "1",
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || (data.type && data.type === "error")) {
    const message =
      data.message || data.msg || "MSG91 failed to send OTP";
    const error = new Error(message);
    error.status = 502;
    throw error;
  }

  return { provider: "msg91", providerRef: data.request_id || null };
};

const verifyViaMsg91 = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;

  const response = await fetch(
    "https://control.msg91.com/api/v5/otp/verify",
    {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        mobile: phone.intl,
        otp,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.type === "error") {
    return { ok: false, message: data.message || "Invalid OTP" };
  }

  return { ok: true };
};

const sendViaTwilio = async (phone, otp) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const from = process.env.TWILIO_FROM;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  if (verifySid) {
    const body = new URLSearchParams({
      To: phone.e164,
      Channel: "sms",
    });

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message || "Twilio Verify failed to send OTP"
      );
      error.status = 502;
      throw error;
    }

    return {
      provider: "twilio_verify",
      providerRef: data.sid || null,
      storesOtp: false,
    };
  }

  const body = new URLSearchParams({
    To: phone.e164,
    From: from,
    Body: `Your BikeRide Partner OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Twilio failed to send SMS");
    error.status = 502;
    throw error;
  }

  return {
    provider: "twilio_sms",
    providerRef: data.sid || null,
    storesOtp: true,
  };
};

const verifyViaTwilio = async (phone, otp) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!verifySid) {
    return null;
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({
    To: phone.e164,
    Code: otp,
  });

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status !== "approved") {
    return { ok: false, message: data.message || "Invalid OTP" };
  }

  return { ok: true };
};

const sendOtpSms = async (phone) => {
  if (!isConfigured()) {
    const error = new Error(
      "SMS provider is not configured. Add SMS credentials in backend .env."
    );
    error.status = 503;
    error.code = "SMS_NOT_CONFIGURED";
    throw error;
  }

  const provider = String(process.env.SMS_PROVIDER || "")
    .trim()
    .toLowerCase();

  const otp = generateOtp();

  if (provider === "msg91") {
    const result = await sendViaMsg91(phone, otp);
    return {
      ...result,
      otp,
      storesOtp: true,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    };
  }

  if (provider === "twilio") {
    const result = await sendViaTwilio(phone, otp);
    return {
      ...result,
      otp: result.storesOtp === false ? null : otp,
      storesOtp: result.storesOtp !== false,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    };
  }

  const error = new Error(
    "Unsupported SMS_PROVIDER. Use msg91 or twilio."
  );
  error.status = 500;
  throw error;
};

const verifyOtpWithProvider = async (phone, otp, storedProvider) => {
  if (storedProvider === "twilio_verify") {
    return verifyViaTwilio(phone, otp);
  }

  if (storedProvider === "msg91") {
    const result = await verifyViaMsg91(phone, otp);
    return result;
  }

  return null;
};

module.exports = {
  isConfigured,
  sendOtpSms,
  verifyOtpWithProvider,
  OTP_EXPIRY_MINUTES,
};
