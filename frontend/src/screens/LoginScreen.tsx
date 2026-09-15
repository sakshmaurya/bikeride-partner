import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { isValidPhone } from '../utils/validation';
import {
  apiRequest,
  throwIfApiFailed,
  ApiError,
} from '../utils/api';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

type SendOtpResponse = {
  success?: boolean;
  message?: string;
  code?: string;
};

export default function LoginScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();

  const t = translations.login;
  const welcome = translations.welcome;
  const errorMessages = translations.errors;

  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  /*
   * ============================================
   * PHONE VALIDATION
   * ============================================
   */
  const isValid = isValidPhone(phone);

  /*
   * ============================================
   * PHONE INPUT
   * ============================================
   *
   * Only numbers are allowed.
   * Maximum 10 digits.
   */
  const handlePhoneChange = (text: string) => {
    const sanitizedPhone = text
      .replace(/[^0-9]/g, '')
      .slice(0, 10);

    setPhone(sanitizedPhone);
    setTouched(false);
    setServerError('');
  };

  /*
   * ============================================
   * LOGIN → SEND OTP
   * ============================================
   *
   * Login
   *   ↓
   * Send OTP
   *   ↓
   * OTP Screen
   */
  const handleContinue = async () => {
    setTouched(true);
    setServerError('');

    /*
     * Don't continue with invalid phone
     */
    if (!isValid || loading) {
      return;
    }

    try {
      setLoading(true);

      const { status, data } =
        await apiRequest<SendOtpResponse>(
          '/auth/send-otp',
          {
            method: 'POST',
            body: JSON.stringify({
              phoneNumber: phone,
            }),
          },
        );

      /*
       * ============================================
       * ACCOUNT NOT FOUND
       * ============================================
       */
      if (
        status === 404 ||
        data.code === 'ACCOUNT_NOT_FOUND'
      ) {
        setServerError(t.accountNotFound);
        return;
      }

      /*
       * ============================================
       * OTHER API ERRORS
       * ============================================
       */
      throwIfApiFailed(
        status,
        data,
        t.unableToSendOtp,
      );

      /*
       * ============================================
       * LOGIN OTP SCREEN
       * ============================================
       *
       * IMPORTANT:
       * mode MUST be "login".
       *
       * OTP screen uses this to decide:
       *
       * Login → OTP → Dashboard
       */
      navigation.navigate('OTP', {
        phoneNumber: phone,
        mode: 'login',
      });
    } catch (error) {
      /*
       * Handle account-not-found returned
       * through ApiError as well.
       */
      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        setServerError(t.accountNotFound);
        return;
      }

      /*
       * Network / unknown error
       */
      setServerError(
        error instanceof Error
          ? error.message
          : errorMessages.network,
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

          <Text style={styles.label}>
            {t.phoneNumber}
          </Text>

          <View
            style={[
              styles.phoneContainer,
              touched &&
                !isValid &&
                styles.phoneError,
            ]}
          >
            <Text style={styles.countryCode}>
              +91
            </Text>

            <View style={styles.divider} />

            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder={t.enterPhone}
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
              style={styles.input}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/*
           * ========================================
           * PHONE VALIDATION ERROR
           * ========================================
           */}
          {touched &&
          phone.length > 0 &&
          !isValid ? (
            <Text style={styles.errorText}>
              {t.invalidPhone}
            </Text>
          ) : null}

          {/*
           * ========================================
           * SERVER ERROR
           * ========================================
           */}
          {serverError ? (
            <View style={styles.serverErrorBox}>
              <Text style={styles.serverErrorText}>
                {serverError}
              </Text>

              {serverError ===
              t.accountNotFound ? (
                <Pressable
                  onPress={() =>
                    navigation.navigate(
                      'Register',
                    )
                  }
                  disabled={loading}
                >
                  <Text
                    style={
                      styles.goToRegister
                    }
                  >
                    {t.register}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/*
           * ========================================
           * BOTTOM SECTION
           * ========================================
           */}
          <View style={styles.bottomSection}>
            <PrimaryButton
              title={
                loading
                  ? t.sendingOtp
                  : t.continue
              }
              onPress={handleContinue}
              disabled={!isValid || loading}
              loading={loading}
            />

            <Text style={styles.terms}>
              {welcome.termsPrefix}
            </Text>

            <View style={styles.termsRow}>
              <Text style={styles.link}>
                {welcome.terms}
              </Text>

              <Text style={styles.and}>
                {' '}
                {welcome.and}{' '}
              </Text>

              <Text style={styles.link}>
                {welcome.privacy}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/*
 * ================================================
 * STYLES
 * ================================================
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
    paddingBottom: 28,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    marginTop: 10,
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 36,
    marginBottom: 10,
  },

  phoneContainer: {
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },

  phoneError: {
    borderColor: COLORS.error,
  },

  countryCode: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: FONT_WEIGHT.semibold,
  },

  divider: {
    width: 1,
    height: 22,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 16,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 8,
  },

  serverErrorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: COLORS.error,
  },

  serverErrorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 19,
  },

  goToRegister: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 8,
  },

  bottomSection: {
    marginTop: 'auto',
    paddingTop: 40,
  },

  terms: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: 16,
  },

  termsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },

  and: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
  },
});