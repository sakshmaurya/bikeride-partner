export const maskPhoneNumber = (phone: string): string => {
  if (phone.length !== 10) {
    return phone;
  }

  return `${phone.slice(0, 2)}XXXXXX${phone.slice(-2)}`;
};

export const maskAccountNumber = (
  accountNumber: string,
): string => {
  if (accountNumber.length < 4) {
    return accountNumber;
  }

  return `${'*'.repeat(
    accountNumber.length - 4,
  )}${accountNumber.slice(-4)}`;
};

export const formatVehicleNumber = (
  registrationNumber: string,
): string => {
  return registrationNumber
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
};

type OnboardingLike = {
  registrationCompleted?: boolean;
  applicationStatus?: string;
  nextStep?: string;
};

export const resolvePostAuthRoute = (
  data: OnboardingLike,
): 
  | 'Dashboard'
  | 'UnderReview'
  | 'Approved'
  | 'Permissions'
  | 'Documents'
  | 'Selfie'
  | 'BankDetails'
  | 'VehicleDetails' => {
  if (data.registrationCompleted) {
    if (data.applicationStatus === 'approved') {
      return 'Dashboard';
    }

    if (data.applicationStatus === 'under_review') {
      return 'UnderReview';
    }

    return 'Dashboard';
  }

  switch (data.nextStep) {
    case 'documents':
      return 'Documents';
    case 'selfie':
      return 'Selfie';
    case 'bank':
      return 'BankDetails';
    case 'vehicle':
      return 'VehicleDetails';
    case 'under_review':
      return 'UnderReview';
    case 'dashboard':
      return 'Dashboard';
    case 'profile':
    default:
      return 'Permissions';
  }
};
