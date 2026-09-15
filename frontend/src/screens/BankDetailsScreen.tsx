import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';

import {
  isRequired,
  isValidAccountNumber,
  isValidIFSC,
} from '../utils/validation';

import { API_BASE_URL } from '../constants/api';
import { getCurrentUserId } from '../utils/session';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'BankDetails'
>;

export default function BankDetailsScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.bank;

  const [accountHolder, setAccountHolder] =
    useState('');

  const [accountNumber, setAccountNumber] =
    useState('');

  const [confirmAccountNumber, setConfirmAccountNumber] =
    useState('');

  const [ifsc, setIfsc] = useState('');

  const [bankName, setBankName] =
    useState('');

  const [touched, setTouched] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  // ========================================
  // LOAD EXISTING BANK DETAILS
  // ========================================

  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          setInitialLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/bank/${userId}`);
        const data = await response.json();

        if (response.ok && data.success && data.bankDetails) {
          const bank = data.bankDetails;
          setAccountHolder(bank.bank_account_name || '');
          setAccountNumber(bank.account_number || '');
          setConfirmAccountNumber(bank.account_number || '');
          setIfsc(bank.ifsc_code || '');
          setBankName(bank.bank_name || '');
        }
      } catch (error) {
        console.error('Error loading bank details:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadBankDetails();
  }, []);

  // ========================================
  // VALIDATION
  // ========================================

  const accountHolderValid =
    isRequired(accountHolder);

  const accountNumberValid =
    isValidAccountNumber(accountNumber);

  const confirmAccountValid =
    isValidAccountNumber(
      confirmAccountNumber,
    ) &&
    accountNumber ===
      confirmAccountNumber;

  const ifscValid =
    isValidIFSC(ifsc);

  const bankNameValid =
    isRequired(bankName);

  const formValid =
    accountHolderValid &&
    accountNumberValid &&
    confirmAccountValid &&
    ifscValid &&
    bankNameValid;

  // ========================================
  // INPUT HANDLERS
  // ========================================

  const handleAccountHolderChange = (
    text: string,
  ) => {
    setAccountHolder(text);
  };

  const handleAccountNumberChange = (
    text: string,
  ) => {
    const cleaned = text
      .replace(/[^0-9]/g, '')
      .slice(0, 18);

    setAccountNumber(cleaned);
  };

  const handleConfirmAccountChange = (
    text: string,
  ) => {
    const cleaned = text
      .replace(/[^0-9]/g, '')
      .slice(0, 18);

    setConfirmAccountNumber(
      cleaned,
    );
  };

  const handleIFSCChange = (
    text: string,
  ) => {
    const cleaned = text
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 11);

    setIfsc(cleaned);
  };

  const handleBankNameChange = (
    text: string,
  ) => {
    setBankName(text);
  };

  // ========================================
  // SAVE BANK DETAILS
  // ========================================

  const handleContinue = async () => {
    setTouched(true);

    // Don't continue if form is invalid
    if (!formValid) {
      return;
    }

    // Prevent multiple API requests
    if (loading) {
      return;
    }

    Keyboard.dismiss();

    try {
      setLoading(true);

      // ====================================
      // GET CURRENT USER
      // ====================================

      const userId =
        await getCurrentUserId();

      console.log('');
      console.log(
        '========================================',
      );
      console.log(
        '🏦 [Bank] Saving bank details',
      );
      console.log(
        '========================================',
      );
      console.log(
        '👤 User ID:',
        userId,
      );

      if (!userId) {
        Alert.alert(
          translations.common.sessionExpired,
          translations.common.loginAgain,
          [
            {
              text: translations.common.ok,
              onPress: () =>
                navigation.replace(
                  'Login',
                ),
            },
          ],
        );

        return;
      }

      // ====================================
      // API REQUEST
      // ====================================

      const url =
        `${API_BASE_URL}/bank/${userId}`;

      console.log(
        '🌐 API URL:',
        url,
      );

      const payload = {
        bankAccountName:
          accountHolder.trim(),

        accountNumber:
          accountNumber.trim(),

        ifscCode:
          ifsc.trim().toUpperCase(),

        bankName:
          bankName.trim(),
      };

      console.log(
        '📦 Bank payload:',
        {
          ...payload,
          accountNumber:
            '********',
        },
      );

      const response =
        await fetch(url, {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload,
          ),
        });

      console.log(
        '📡 Response status:',
        response.status,
      );

      // ====================================
      // READ RESPONSE
      // ====================================

      let data: any = null;

      try {
        data =
          await response.json();
      } catch (jsonError) {
        console.error(
          '❌ Invalid JSON response:',
          jsonError,
        );
      }

      console.log(
        '📥 Response:',
        data,
      );

      // ====================================
      // API ERROR
      // ====================================

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Failed to save bank details (${response.status})`,
        );
      }

      // ====================================
      // SUCCESS
      // ====================================

      console.log(
        '========================================',
      );
      console.log(
        '✅ Bank details saved successfully',
      );
      console.log(
        '========================================',
      );
      console.log('');

      Alert.alert(
        translations.common.success,
        t.saved,
        [
          {
            text: translations.common.continue,
            onPress: async () => {
              // Check if user is in onboarding or editing
              const userId = await getCurrentUserId();
              if (userId) {
                try {
                  const response = await fetch(`${API_BASE_URL}/onboarding/${userId}`);
                  const data = await response.json();
                  if (data.success && data.registrationCompleted) {
                    navigation.replace('Dashboard');
                  } else {
                    navigation.replace('VehicleDetails');
                  }
                } catch {
                  navigation.replace('VehicleDetails');
                }
              } else {
                navigation.replace('VehicleDetails');
              }
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    } catch (error: any) {
      console.error(
        '❌ Bank details save error:',
        error,
      );

      Alert.alert(
        translations.common.error,
        error?.message || translations.errors.somethingWrong,
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ERROR MESSAGES
  // ========================================

  const accountHolderError =
    touched &&
    !accountHolderValid
      ? t.accountHolderRequired
      : undefined;

  const accountNumberError =
    touched &&
    !accountNumberValid
      ? t.invalidAccountNumber
      : undefined;

  const confirmAccountError =
    touched &&
    !confirmAccountValid
      ? t.accountsDontMatch
      : undefined;

  const ifscError =
    touched &&
    !ifscValid
      ? t.invalidIfsc
      : undefined;

  const bankNameError =
    touched &&
    !bankNameValid
      ? t.bankNameRequired
      : undefined;

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title={t.title}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.saving}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScreenHeader
        title={t.title}
        onBack={() =>
          navigation.goBack()
        }
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
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ================= HEADER ================= */}

          <View style={styles.header}>
            <View
              style={
                styles.iconCircle
              }
            >
              <Text
                style={styles.icon}
              >
                🏦
              </Text>
            </View>

            <Text
              style={styles.title}
            >
              {t.subtitle}
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {t.description}
            </Text>
          </View>

          {/* ================= SECURITY ================= */}

          <View
            style={
              styles.securityCard
            }
          >
            <Text
              style={
                styles.securityIcon
              }
            >
              🔒
            </Text>

            <View
              style={
                styles.securityContent
              }
            >
              <Text
                style={
                  styles.securityTitle
                }
              >
                {t.security.title}
              </Text>

              <Text
                style={
                  styles.securityText
                }
              >
                {t.security.description}
              </Text>
            </View>
          </View>

          {/* ================= FORM ================= */}

          <View
            style={styles.form}
          >
            {/* Account Holder */}

            <CustomInput
              label={t.accountHolder}
              placeholder={t.enterAccountHolder}
              value={accountHolder}
              onChangeText={
                handleAccountHolderChange
              }
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              error={
                accountHolderError
              }
            />

            {/* Account Number */}

            <CustomInput
              label={t.accountNumber}
              placeholder={t.enterAccountNumber}
              value={accountNumber}
              onChangeText={
                handleAccountNumberChange
              }
              keyboardType="number-pad"
              maxLength={18}
              returnKeyType="next"
              error={
                accountNumberError
              }
            />

            <View
              style={
                styles.counterRow
              }
            >
              <Text
                style={
                  styles.counter
                }
              >
                {accountNumber.length}/18
              </Text>
            </View>

            {/* Confirm Account */}

            <CustomInput
              label={t.confirmAccountNumber}
              placeholder={t.enterConfirmAccount}
              value={
                confirmAccountNumber
              }
              onChangeText={
                handleConfirmAccountChange
              }
              keyboardType="number-pad"
              maxLength={18}
              returnKeyType="next"
              error={
                confirmAccountError
              }
            />

            {/* IFSC */}

            <CustomInput
              label={t.ifsc}
              placeholder={t.enterIfsc}
              value={ifsc}
              onChangeText={
                handleIFSCChange
              }
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={11}
              returnKeyType="next"
              error={ifscError}
            />

            <Text
              style={styles.helper}
            >
              {t.ifscHelper}
            </Text>

            {/* Bank Name */}

            <CustomInput
              label={t.bankName}
              placeholder={t.enterBankName}
              value={bankName}
              onChangeText={
                handleBankNameChange
              }
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              error={
                bankNameError
              }
            />
          </View>

          {/* ================= CONTINUE ================= */}

          <View
            style={styles.bottom}
          >
            <PrimaryButton
              title={
                loading
                  ? t.saving
                  : t.continue
              }
              onPress={
                handleContinue
              }
              disabled={
                !formValid ||
                loading
              }
            />

            <Text
              style={styles.note}
            >
              {t.note}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal:
      SPACING.xxl,
    paddingTop:
      SPACING.lg,
    paddingBottom:
      SPACING.huge,
  },

  header: {
    alignItems: 'center',
    marginTop:
      SPACING.lg,
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor:
      COLORS.primaryLight,
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom:
      SPACING.lg,
  },

  icon: {
    fontSize: 38,
  },

  title: {
    color: COLORS.text,
    fontSize:
      FONT_SIZE.xxl,
    fontWeight:
      FONT_WEIGHT.extraBold,
    textAlign: 'center',
  },

  description: {
    color:
      COLORS.textSecondary,
    fontSize:
      FONT_SIZE.sm,
    lineHeight: 21,
    textAlign: 'center',
    marginTop:
      SPACING.sm,
    maxWidth: 350,
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:
      SPACING.xxl,
    padding:
      SPACING.lg,
    borderRadius:
      RADIUS.lg,
    backgroundColor:
      COLORS.primaryLight,
  },

  securityIcon: {
    fontSize: 24,
    marginRight:
      SPACING.md,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    color: COLORS.text,
    fontSize:
      FONT_SIZE.sm,
    fontWeight:
      FONT_WEIGHT.bold,
  },

  securityText: {
    color:
      COLORS.textSecondary,
    fontSize:
      FONT_SIZE.xs,
    lineHeight: 18,
    marginTop: 3,
  },

  form: {
    marginTop:
      SPACING.xxl,
  },

  counterRow: {
    alignItems:
      'flex-end',
    marginTop:
      -SPACING.md,
    marginBottom:
      SPACING.sm,
  },

  counter: {
    color:
      COLORS.textLight,
    fontSize:
      FONT_SIZE.xs,
  },

  helper: {
    color:
      COLORS.textLight,
    fontSize:
      FONT_SIZE.xs,
    marginTop:
      -SPACING.md,
    marginBottom:
      SPACING.lg,
  },

  bottom: {
    marginTop:
      SPACING.lg,
  },

  note: {
    color:
      COLORS.textLight,
    fontSize:
      FONT_SIZE.xs,
    lineHeight: 17,
    textAlign: 'center',
    marginTop:
      SPACING.md,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});
