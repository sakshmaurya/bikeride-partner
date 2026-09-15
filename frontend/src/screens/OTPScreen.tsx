import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import OTPInput from '../components/OTPInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { apiRequest, throwIfApiFailed } from '../utils/api';
import {
  setAuthToken,
  setCurrentUserId,
  setUserData,
} from '../utils/session';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

type OtpResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  userId?: number;
  token?: string;
  registrationCompleted?: boolean;
  applicationStatus?: string;
  nextStep?: string;
};

export default function OTPScreen({ navigation, route }: Props) {
  const { translations } = useLanguage();

  const t = translations.otp;
  const errorMessages = translations.errors;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState('');

  const phoneNumber = route.params.phoneNumber;

  // Login by default if mode is not provided
  const mode = route.params.mode || 'login';

  /*
   * ============================================
   * RESEND OTP TIMER
   * ============================================
   */
  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  /*
   * ============================================
   * OTP SEND ENDPOINT
   * ============================================
   *
   * Register:
   * /auth/register/send-otp
   *
   * Login:
   * /auth/send-otp
   */
  const sendEndpoint =
    mode === 'register'
      ? '/auth/register/send-otp'
      : '/auth/send-otp';

  /*
   * ============================================
   * RESEND OTP
   * ============================================
   */
  const handleResendOTP = async () => {
    if (resendTimer > 0 || resendLoading || loading) {
      return;
    }

    try {
      setResendLoading(true);
      setOtp('');
      setError('');

      const { status, data } = await apiRequest<OtpResponse>(
        sendEndpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber,
          }),
        },
      );

      throwIfApiFailed(
        status,
        data,
        errorMessages.somethingWrong,
      );

      setResendTimer(60);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : errorMessages.network,
      );
    } finally {
      setResendLoading(false);
    }
  };

  /*
   * ============================================
   * VERIFY OTP
   * ============================================
   *
   * REGISTER FLOW:
   * Register → OTP → Approved → Dashboard
   *
   * LOGIN FLOW:
   * Login → OTP → Dashboard
   */
  const handleVerify = async () => {
    if (otp.length !== 6 || loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { status, data } = await apiRequest<OtpResponse>(
        '/auth/verify-otp',
        {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber,
            otp,
            mode,
          }),
        },
      );

      /*
       * Check API response
       */
      throwIfApiFailed(
        status,
        data,
        t.invalidOtp,
      );

      /*
       * User ID is required
       */
      if (!data.userId) {
        throw new Error(t.invalidOtp);
      }

      /*
       * ============================================
       * SAVE LOGIN SESSION
       * ============================================
       */
      await setCurrentUserId(Number(data.userId));

      await setAuthToken(
        data.token || null,
      );

      await setUserData({
        userId: data.userId,
        token: data.token,
        phoneNumber,
      });

      /*
       * ============================================
       * REGISTER FLOW
       * ============================================
       *
       * Register
       *    ↓
       * OTP
       *    ↓
       * Approved
       *    ↓
       * Dashboard
       */
      if (mode === 'register') {
        navigation.replace('ProfileDetails');
        return;
      }

      /*
       * ============================================
       * LOGIN FLOW
       * ============================================
       *
       * Login
       *    ↓
       * OTP
       *    ↓
       * Dashboard
       */
      if (mode === 'login') {
        navigation.replace('Dashboard');
        return;
      }

      /*
       * Fallback
       *
       * If somehow mode is missing/invalid,
       * treat it as login.
       */
      navigation.replace('Dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : errorMessages.somethingWrong,
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================
   * UI
   * ============================================
   */
  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <ScreenHeader
        title={t.title}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {t.subtitle}
          </Text>

          <Text style={styles.description}>
            {t.description}
          </Text>

          <Text style={styles.phone}>
            +91 {phoneNumber}
          </Text>

          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              onChange={setOtp}
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <View style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <Text style={styles.timerText}>
                {t.resendIn} 00:
                {String(resendTimer).padStart(2, '0')}
              </Text>
            ) : (
              <Pressable
                onPress={handleResendOTP}
                disabled={
                  resendLoading || loading
                }
              >
                <Text style={styles.resendButton}>
                  {resendLoading
                    ? t.sendingOtp
                    : t.resendButton}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={
                loading
                  ? t.verifying
                  : t.verify
              }
              onPress={handleVerify}
              disabled={
                otp.length !== 6 || loading
              }
              loading={loading}
            />
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.changeNumber}
          >
            <Text style={styles.changeNumberText}>
              {t.changeNumber}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/*
 * ============================================
 * STYLES
 * ============================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    marginTop: 12,
  },

  phone: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 6,
  },

  otpContainer: {
    width: '100%',
    marginTop: 36,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },

  resendContainer: {
    alignItems: 'center',
    marginTop: 22,
  },

  resendButton: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  timerText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  buttonContainer: {
    width: '100%',
    marginTop: 36,
  },

  changeNumber: {
    alignItems: 'center',
    marginTop: 18,
  },

  changeNumberText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});