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

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_WEIGHT } from '../theme/fonts';
import { API_BASE_URL } from '../constants/api';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Register'
>;

type RegisterOtpResponse = {
  success?: boolean;
  message?: string;
  code?: string;
};

export default function RegisterScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();

  const t = translations.register;
  const errorMessages = translations.errors;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  /*
   * ============================================
   * PHONE VALIDATION
   * ============================================
   *
   * Indian mobile number:
   * - Exactly 10 digits
   * - Starts with 6, 7, 8 or 9
   */
  const isValid =
    phoneNumber.length === 10 &&
    /^[6-9][0-9]{9}$/.test(phoneNumber);

  /*
   * ============================================
   * PHONE CHANGE
   * ============================================
   */
  const handlePhoneChange = (text: string) => {
    const cleaned = text
      .replace(/\D/g, '')
      .slice(0, 10);

    setPhoneNumber(cleaned);

    /*
     * Clear server error when user
     * starts editing the phone number.
     */
    if (serverError) {
      setServerError('');
    }

    /*
     * Keep validation state clean while typing.
     */
    if (touched) {
      setTouched(false);
    }
  };

  /*
   * ============================================
   * REGISTER → SEND OTP
   * ============================================
   *
   * Register
   *    ↓
   * Send OTP
   *    ↓
   * OTP
   *    ↓
   * Approved
   *    ↓
   * Dashboard
   */
  const handleContinue = async () => {
    setTouched(true);
    setServerError('');

    /*
     * Don't call API for invalid number.
     */
    if (!isValid || loading) {
      return;
    }

    try {
      setLoading(true);

      console.log('');
      console.log('========================================');
      console.log('📱 REGISTER - SEND OTP');
      console.log('========================================');
      console.log('Phone:', phoneNumber);
      console.log(
        'URL:',
        `${API_BASE_URL}/auth/register/send-otp`,
      );

      const response = await fetch(
        `${API_BASE_URL}/auth/register/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
          }),
        },
      );

      /*
       * Safely parse JSON.
       */
      let data: RegisterOtpResponse = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        '📥 Register OTP Response:',
        data,
      );

      console.log(
        '📊 Status:',
        response.status,
      );

      /*
       * ============================================
       * ACCOUNT ALREADY EXISTS
       * ============================================
       */
      if (
        response.status === 409 ||
        data.code === 'ACCOUNT_EXISTS'
      ) {
        setServerError(t.accountExists);
        return;
      }

      /*
       * ============================================
       * OTHER BACKEND ERRORS
       * ============================================
       */
      if (!response.ok || data.success === false) {
        setServerError(
          data.message ||
            t.sendOtp ||
            errorMessages.somethingWrong,
        );

        return;
      }

      /*
       * ============================================
       * OTP SENT SUCCESSFULLY
       * ============================================
       */
      console.log(
        '✅ Registration OTP sent successfully',
      );

      /*
       * IMPORTANT:
       * mode MUST be "register".
       *
       * OTP Screen will then do:
       *
       * Register → OTP → Approved
       */
      navigation.navigate('OTP', {
        phoneNumber,
        mode: 'register',
      });
    } catch (error) {
      console.error(
        '❌ Register OTP Error:',
        error,
      );

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
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={12}
            disabled={loading}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {t.title}
          </Text>

          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* ICON */}

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              🏍️
            </Text>
          </View>

          {/* TITLE */}

          <Text style={styles.title}>
            {t.subtitle}
          </Text>

          <Text style={styles.subtitle}>
            {t.description}
          </Text>

          {/* FORM */}

          <View style={styles.form}>
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
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder={t.enterPhone}
                placeholderTextColor={
                  COLORS.textLight
                }
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            {/* PHONE VALIDATION / COUNTER */}

            <View style={styles.counterRow}>
              <Text
                style={
                  touched && !isValid
                    ? styles.errorText
                    : styles.helperText
                }
              >
                {touched && !isValid
                  ? t.invalidPhone
                  : t.phoneHelper}
              </Text>

              <Text style={styles.counter}>
                {phoneNumber.length}/10
              </Text>
            </View>

            {/* SERVER ERROR */}

            {serverError ? (
              <View style={styles.serverErrorBox}>
                <Text
                  style={styles.serverErrorIcon}
                >
                  ⚠️
                </Text>

                <View
                  style={styles.serverErrorContent}
                >
                  <Text
                    style={styles.serverErrorText}
                  >
                    {serverError}
                  </Text>

                  <Pressable
                    onPress={() =>
                      navigation.navigate('Login')
                    }
                    disabled={loading}
                    style={
                      styles.goToLoginButton
                    }
                  >
                    <Text
                      style={
                        styles.goToLoginText
                      }
                    >
                      {t.goToLogin}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>

          {/* BENEFITS */}

          <View style={styles.benefits}>
            <Benefit
              icon="💰"
              title={
                t.benefits.earnOnEveryRide.title
              }
              text={
                t.benefits.earnOnEveryRide
                  .description
              }
            />

            <Benefit
              icon="⏰"
              title={
                t.benefits.flexibleWorking.title
              }
              text={
                t.benefits.flexibleWorking
                  .description
              }
            />

            <Benefit
              icon="🛡️"
              title={
                t.benefits.secureAccount.title
              }
              text={
                t.benefits.secureAccount
                  .description
              }
            />
          </View>

          {/* BUTTON */}

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={
                loading
                  ? t.sendingOtp
                  : t.createAccount
              }
              onPress={handleContinue}
              disabled={!isValid || loading}
              loading={loading}
            />
          </View>

          {/* LOGIN */}

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              {t.alreadyAccount}
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate('Login')
              }
              hitSlop={8}
              disabled={loading}
            >
              <Text style={styles.loginLink}>
                {t.login}
              </Text>
            </Pressable>
          </View>

          {/* TERMS */}

          <Text style={styles.terms}>
            {t.termsPrefix}
            {'\n'}

            <Text style={styles.termsLink}>
              {t.terms}
            </Text>

            {' '}
            {t.and}
            {' '}

            <Text style={styles.termsLink}>
              {t.privacy}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/*
 * ============================================
 * BENEFIT COMPONENT
 * ============================================
 */

interface BenefitProps {
  icon: string;
  title: string;
  text: string;
}

function Benefit({
  icon,
  title,
  text,
}: BenefitProps) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}>
        <Text style={styles.benefitEmoji}>
          {icon}
        </Text>
      </View>

      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>
          {title}
        </Text>

        <Text style={styles.benefitText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/*
 * ============================================
 * STYLES
 * ============================================
 */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backArrow: {
    fontSize: 36,
    lineHeight: 36,
    color: COLORS.text,
    fontWeight: '300',
  },

  headerTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  headerRight: {
    width: 40,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 35,
  },

  iconContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.blueLight,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 42,
  },

  title: {
    marginTop: 28,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 15,
  },

  form: {
    marginTop: 48,
  },

  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 10,
  },

  phoneContainer: {
    height: 58,
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
    height: 25,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 16,
  },

  counterRow: {
    marginTop: 7,
    minHeight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  helperText: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 11,
  },

  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 11,
  },

  counter: {
    color: COLORS.textLight,
    fontSize: 11,
  },

  serverErrorBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  serverErrorIcon: {
    fontSize: 18,
    marginRight: 10,
  },

  serverErrorContent: {
    flex: 1,
  },

  serverErrorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 19,
  },

  goToLoginButton: {
    marginTop: 9,
    alignSelf: 'flex-start',
  },

  goToLoginText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  benefits: {
    marginTop: 32,
  },

  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  benefitIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  benefitEmoji: {
    fontSize: 21,
  },

  benefitContent: {
    flex: 1,
  },

  benefitTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.bold,
  },

  benefitText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  buttonContainer: {
    marginTop: 12,
  },

  loginRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  loginText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  loginLink: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  terms: {
    marginTop: 18,
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 10,
    lineHeight: 16,
  },

  termsLink: {
    color: COLORS.blue,
    fontWeight: FONT_WEIGHT.semibold,
  },
});