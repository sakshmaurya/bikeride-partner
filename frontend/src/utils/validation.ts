export const isValidPhone = (phone: string): boolean => {
  const cleanedPhone = phone.trim();

  return /^[6-9][0-9]{9}$/.test(cleanedPhone);
};

export const isValidOTP = (otp: string): boolean => {
  const cleanedOTP = otp.trim();

  return /^[0-9]{6}$/.test(cleanedOTP);
};

export const isValidIFSC = (ifsc: string): boolean => {
  const cleanedIFSC = ifsc.trim().toUpperCase();

  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanedIFSC);
};

export const isValidAccountNumber = (
  accountNumber: string,
): boolean => {
  const cleanedAccountNumber = accountNumber.trim();

  return /^[0-9]{9,18}$/.test(cleanedAccountNumber);
};

export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};