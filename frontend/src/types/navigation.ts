export type RootStackParamList = {
  // ================================
  // Splash & Welcome
  // ================================

  Splash: undefined;
  Language: undefined;
  Welcome: undefined;

  // ================================
  // Authentication
  // ================================

  Login: undefined;

  Register: undefined;

  OTP: {
    phoneNumber: string;
    mode?: 'login' | 'register';
  };

  // ================================
  // Onboarding
  // ================================

  Permissions: undefined;

  ProfileDetails: undefined;

  Documents: undefined;

  Selfie: undefined;

  BankDetails: undefined;

  VehicleDetails: undefined;

  UnderReview: undefined;

  Approved: undefined;

  // ================================
  // Partner App
  // ================================

  Dashboard: undefined;

  Rides: undefined;

  Earnings: undefined;

  Profile: undefined;
};