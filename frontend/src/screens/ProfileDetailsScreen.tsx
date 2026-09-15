import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const { translations: t, language } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

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

  const validateForm = () => {
    let valid = true;

    setNameError('');
    setEmailError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

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
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            language,
          }),
        },
      );

      const data = await response.json();

      console.log('📥 Save response:', data);

      if (!response.ok || !data.success) {
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

                if (!currentUserId) {
                  navigation.replace('Documents');
                  return;
                }

                console.log(
                  '🔍 Checking registration status...',
                );

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

                if (
                  onboardingResponse.ok &&
                  onboardingData.success &&
                  onboardingData.registrationCompleted
                ) {
                  console.log(
                    '✅ Registration already completed',
                  );

                  navigation.replace('Dashboard');
                } else {
                  console.log(
                    '➡️ Continuing onboarding → Documents',
                  );

                  navigation.replace('Documents');
                }
              } catch (error) {
                console.error(
                  '❌ Onboarding status error:',
                  error,
                );

                navigation.replace('Documents');
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
    } finally {
      setSaving(false);
    }
  };

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

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingCircle}>
              <Text style={styles.loadingIcon}>
                👤
              </Text>
            </View>

            <Text style={styles.loadingTitle}>
              {t.profile?.loading ||
                'Loading profile...'}
            </Text>

            <View style={styles.loadingLine} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const nameInputStyle = [
    styles.inputWrapper,
    nameFocused && styles.inputWrapperFocused,
    nameError && styles.inputWrapperError,
  ];

  const emailInputStyle = [
    styles.inputWrapper,
    emailFocused && styles.inputWrapperFocused,
    emailError && styles.inputWrapperError,
  ];

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
        <ScreenHeader
          title={
            t.profile?.title ||
            'Profile Details'
          }
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* PROFILE INTRO */}

          <View style={styles.heroCard}>
            <View style={styles.heroAccent} />

            <View style={styles.heroContent}>
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>
                  👤
                </Text>
              </View>

              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>
                  {t.profile?.description ||
                    'Complete your profile'}
                </Text>

                <Text style={styles.heroDescription}>
                  {t.profile?.description ||
                    'Add your basic details to continue with your BikeRide Partner registration.'}
                </Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressDotActive}>
                <Text style={styles.progressCheck}>
                  ✓
                </Text>
              </View>

              <View style={styles.progressLineActive} />

              <View style={styles.progressDot}>
                <Text style={styles.progressNumber}>
                  2
                </Text>
              </View>

              <View style={styles.progressLine} />

              <View style={styles.progressDot}>
                <Text style={styles.progressNumber}>
                  3
                </Text>
              </View>
            </View>
          </View>

          {/* SECTION HEADER */}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />

            <View>
              <Text style={styles.sectionTitle}>
                {t.profile?.personalInformation ||
                  'Personal Information'}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {t.profile?.infoText ||
                  'Enter your details to continue'}
              </Text>
            </View>
          </View>

          {/* FORM */}

          <View style={styles.formCard}>
            {/* NAME */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.profile?.fullName ||
                  'Full Name'}
              </Text>

              <View style={nameInputStyle}>
                <View style={styles.inputIconContainer}>
                  <Text style={styles.inputIcon}>
                    👤
                  </Text>
                </View>

                <TextInput
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    setNameError('');
                  }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
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
                  returnKeyType="next"
                />
              </View>

              {nameError ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorIcon}>
                    !
                  </Text>

                  <Text style={styles.errorText}>
                    {nameError}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* EMAIL */}

            <View style={styles.inputGroupLast}>
              <Text style={styles.label}>
                {t.profile?.emailAddress ||
                  'Email Address'}
              </Text>

              <View style={emailInputStyle}>
                <View style={styles.inputIconContainer}>
                  <Text style={styles.inputIcon}>
                    ✉
                  </Text>
                </View>

                <TextInput
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
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
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>

              {emailError ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorIcon}>
                    !
                  </Text>

                  <Text style={styles.errorText}>
                    {emailError}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* PRIVACY / INFO */}

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>
                ✓
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {t.profile?.profileSaved ||
                  'Profile Information'}
              </Text>

              <Text style={styles.infoText}>
                {t.profile?.infoText ||
                  'Make sure your name and email address are correct. These details will be used for your partner account.'}
              </Text>
            </View>
          </View>

          {/* CONTINUE */}

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={
                t.profile?.continue ||
                'Continue'
              }
              onPress={handleContinue}
              loading={saving}
            />
          </View>

          <Text style={styles.footerText}>
            {t.profile?.description ||
              'Your information is securely stored.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.md,
    paddingBottom: 36,
  },

  // HERO

  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.xxl,
  },

  heroAccent: {
    height: 5,
    backgroundColor: COLORS.primary,
  },

  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  profileIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },

  profileIconText: {
    fontSize: 30,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extraBold,
    marginBottom: 6,
  },

  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },

  progressDotActive: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCheck: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  progressNumber: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
  },

  progressLineActive: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: 7,
  },

  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 7,
  },

  // SECTION

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  sectionIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },

  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
  },

  // FORM

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

  inputGroupLast: {
    marginBottom: 0,
  },

  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },

  inputWrapper: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },

  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },

  inputWrapperError: {
    borderColor: '#E53935',
  },

  inputIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  inputIcon: {
    fontSize: 17,
  },

  input: {
    flex: 1,
    minHeight: 56,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 0,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  errorIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#E53935',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 17,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    marginRight: 6,
    overflow: 'hidden',
  },

  errorText: {
    flex: 1,
    color: '#E53935',
    fontSize: FONT_SIZE.xs,
  },

  // INFO

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },

  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  infoIcon: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 4,
  },

  infoText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },

  // BUTTON

  buttonContainer: {
    marginTop: SPACING.xxl,
  },

  footerText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.lg,
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },

  loadingCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    padding: SPACING.xxl,
  },

  loadingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },

  loadingIcon: {
    fontSize: 28,
  },

  loadingTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },

  loadingLine: {
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.lg,
  },
});
