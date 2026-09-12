function parseIndianPhone(input) {
  if (input == null) {
    return null;
  }

  let digits = String(input).replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (!/^[6-9][0-9]{9}$/.test(digits)) {
    return null;
  }

  return {
    local: digits,
    e164: `+91${digits}`,
    intl: `91${digits}`,
  };
}

module.exports = {
  parseIndianPhone,
};
