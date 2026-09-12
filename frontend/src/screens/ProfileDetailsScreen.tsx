import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { API_BASE_URL } from '../constants/api';
import { getCurrentUserId } from '../utils/session';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';

import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ProfileDetails'
>;

export default function ProfileDetailsScreen({
  navigation,
}: Props) {
  // ========================================
  // LANGUAGE
  // ========================================

  const { translations: t, language } = useLanguage();

  // ========================================
  // STATE
  // ========================================

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // ========================================
  // LOAD PROFILE
  // ========================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = await getCurrentUserId();

      console.log('👤 Profile Load User ID:', userId);

      if (!userId) {
        Alert.alert(
          t.common?.error || 'Error',
          t.profile?.userIdNotFound ||
            'User ID not found. Please login again.',
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}`,
      );

      const data = await response.json();

      console.log('📥 Profile response:', data);

      if (
        response.ok &&
        data.success &&
        data.user
      ) {
        setName(data.user.name || '');
        setEmail(data.user.email || '');
      } else {
        console.log(
          '❌ Failed to load profile:',
          data,
        );
      }
    } catch (error) {
      console.error(
        '❌ Load Profile Error:',
        error,
      );

      Alert.alert(
        t.common?.error || 'Error',
        t.profile?.loadProfileError ||
          'Unable to load your profile.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = () => {
    let valid = true;

    setNameError('');
    setEmailError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // ======================================
    // NAME VALIDATION
    // ======================================

    if (!trimmedName) {
      setNameError(
        t.profile?.nameRequired ||
          'Please enter your full name',
      );

      valid = false;
    } else if (trimmedName.length < 2) {
      setNameError(
        t.profile?.nameMinLength ||
          'Name must be at least 2 characters',
      );

      valid = false;
    }

    // ======================================
    // EMAIL VALIDATION
    // ======================================

    if (!trimmedEmail) {
      setEmailError(
        t.profile?.emailRequired ||
          'Please enter your email address',
      );

      valid = false;
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmedEmail)) {
        setEmailError(
          t.profile?.emailInvalid ||
            'Please enter a valid email address',
        );

        valid = false;
      }
    }

    return valid;
  };

  // ========================================
  // SAVE PROFILE
  // ========================================

  const handleContinue = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const userId = await getCurrentUserId();

      console.log('');
      console.log(
        '========================================',
      );
      console.log('📤 Saving Profile');
      console.log(
        '========================================',
      );
      console.log('👤 User ID:', userId);
      console.log('👤 Name:', name.trim());
      console.log('📧 Email:', email.trim());
      console.log('🌐 Language:', language);

      // ======================================
      // USER ID CHECK
      // ======================================

      if (!userId) {
        Alert.alert(
          t.common?.error || 'Error',
          t.profile?.userIdNotFound ||
            'User ID not found. Please login again.',
        );

        return;
      }

      // ======================================
      // SAVE API
      // ======================================

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),

            // Send currently selected language
            language,
          }),
        },
      );

      const data = await response.json();

      console.log(
        '📥 Save response:',
        data,
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            t.profile?.saveProfileError ||
            'Failed to save profile',
        );
      }

      console.log(
        '========================================',
      );
      console.log(
        '✅ Profile saved successfully',
      );
      console.log(
        '========================================',
      );

      // ======================================
      // SUCCESS ALERT
      // ======================================

      Alert.alert(
        t.profile?.profileSaved ||
          'Profile Saved',

        t.profile?.profileSavedMessage ||
          'Your profile details have been saved successfully.',

        [
          {
            text:
              t.profile?.continue ||
              'Continue',

            onPress: async () => {
              try {
                const currentUserId =
                  await getCurrentUserId();

                // ==================================
                // USER ID NOT FOUND
                // ==================================

                if (!currentUserId) {
                  navigation.replace(
                    'Documents',
                  );

                  return;
                }

                console.log(
                  '🔍 Checking registration status...',
                );

                // ==================================
                // CHECK ONBOARDING STATUS
                // ==================================

                const onboardingResponse =
                  await fetch(
                    `${API_BASE_URL}/onboarding/${currentUserId}`,
                  );

                const onboardingData =
                  await onboardingResponse.json();

                console.log(
                  '📋 Onboarding response:',
                  onboardingData,
                );

                // ==================================
                // REGISTRATION COMPLETED
                // ==================================

                if (
                  onboardingResponse.ok &&
                  onboardingData.success &&
                  onboardingData.registrationCompleted
                ) {
                  console.log(
                    '✅ Registration already completed',
                  );

                  navigation.replace(
                    'Dashboard',
                  );
                }

                // ==================================
                // CONTINUE ONBOARDING
                // ==================================

                else {
                  console.log(
                    '➡️ Continuing onboarding → Documents',
                  );

                  navigation.replace(
                    'Documents',
                  );
                }
              } catch (error) {
                console.error(
                  '❌ Onboarding status error:',
                  error,
                );

                // ==================================
                // FALLBACK
                // ==================================

                navigation.replace(
                  'Documents',
                );
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error(
        '❌ Save Profile Error:',
        error,
      );

      Alert.alert(
        t.common?.error || 'Error',
        error?.message ||
          t.profile?.saveProfileError ||
          'Unable to save profile. Please try again.',
      );
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title={
            t.profile?.title ||
            'Profile Details'
          }
          onBack={() => navigation.goBack()}
        />

        <View
          style={styles.loadingContainer}
        >
          <Text
            style={styles.loadingText}
          >
            {t.profile?.loading ||
              'Loading profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // MAIN SCREEN
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <ScreenHeader
          title={
            t.profile?.title ||
            'Profile Details'
          }
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ================================= */}
          {/* INTRO CARD */}
          {/* ================================= */}

          <View style={styles.introCard}>
            <View
              style={styles.profileIcon}
            >
              <Text
                style={
                  styles.profileIconText
                }
              >
                👤
              </Text>
            </View>

            <View
              style={styles.introText}
            >
              <Text style={styles.title}>
                {t.profile?.description ||
                  'Complete your profile'}
              </Text>

              <Text
                style={styles.description}
              >
                {t.profile?.description ||
                  'Add your basic details to continue with your BikeRide Partner registration.'}
              </Text>
            </View>
          </View>

          {/* ================================= */}
          {/* PERSONAL INFORMATION */}
          {/* ================================= */}

          <Text
            style={styles.sectionTitle}
          >
            {t.profile?.personalInformation ||
              'Personal Information'}
          </Text>

          <View style={styles.formCard}>
            {/* ================================= */}
            {/* NAME */}
            {/* ================================= */}

            <View
              style={styles.inputGroup}
            >
              <Text style={styles.label}>
                {t.profile?.fullName ||
                  'Full Name'}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  nameError
                    ? styles.inputWrapperError
                    : null,
                ]}
              >
                <Text
                  style={styles.inputIcon}
                >
                  👤
                </Text>

                <TextInput
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    setNameError('');
                  }}
                  placeholder={
                    t.profile?.namePlaceholder ||
                    'Enter your full name'
                  }
                  placeholderTextColor={
                    COLORS.textLight
                  }
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                />
              </View>

              {nameError ? (
                <Text
                  style={styles.errorText}
                >
                  {nameError}
                </Text>
              ) : null}
            </View>

            {/* ================================= */}
            {/* EMAIL */}
            {/* ================================= */}

            <View
              style={styles.inputGroup}
            >
              <Text style={styles.label}>
                {t.profile?.emailAddress ||
                  'Email Address'}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  emailError
                    ? styles.inputWrapperError
                    : null,
                ]}
              >
                <Text
                  style={styles.inputIcon}
                >
                  ✉️
                </Text>

                <TextInput
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  placeholder={
                    t.profile?.emailPlaceholder ||
                    'Enter your email address'
                  }
                  placeholderTextColor={
                    COLORS.textLight
                  }
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                />
              </View>

              {emailError ? (
                <Text
                  style={styles.errorText}
                >
                  {emailError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* ================================= */}
          {/* INFO CARD */}
          {/* ================================= */}

          <View style={styles.infoCard}>
            <Text
              style={styles.infoIcon}
            >
              ✓
            </Text>

            <Text
              style={styles.infoText}
            >
              {t.profile?.infoText ||
                'Make sure your name and email address are correct. These details will be used for your partner account.'}
            </Text>
          </View>

          {/* ================================= */}
          {/* CONTINUE BUTTON */}
          {/* ================================= */}

          <View
            style={styles.buttonContainer}
          >
            <PrimaryButton
              title={
                t.profile?.continue ||
                'Continue'
              }
              onPress={handleContinue}
              loading={saving}
            />
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
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    padding: SPACING.xxl,
    paddingBottom: SPACING.huge,
  },

  // ======================================
  // INTRO
  // ======================================

  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor:
      COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },

  profileIconText: {
    fontSize: 30,
  },

  introText: {
    flex: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight:
      FONT_WEIGHT.extraBold,
    marginBottom: SPACING.xs,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },

  // ======================================
  // SECTION
  // ======================================

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },

  // ======================================
  // FORM CARD
  // ======================================

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },

  inputGroup: {
    marginBottom: SPACING.xl,
  },

  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },

  inputWrapper: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },

  inputWrapperError: {
    borderColor: '#E53935',
  },

  inputIcon: {
    fontSize: 19,
    marginRight: SPACING.sm,
  },

  input: {
    flex: 1,
    height: 54,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    paddingHorizontal: SPACING.xs,
  },

  errorText: {
    color: '#E53935',
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },

  // ======================================
  // INFO CARD
  // ======================================

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },

  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },

  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },

  // ======================================
  // BUTTON
  // ======================================

  buttonContainer: {
    marginTop: SPACING.xxl,
  },

  // ======================================
  // LOADING
  // ======================================

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