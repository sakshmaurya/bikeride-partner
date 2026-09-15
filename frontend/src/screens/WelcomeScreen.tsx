import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import PrimaryButton from '../components/PrimaryButton';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_WEIGHT } from '../theme/fonts';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

const { width } = Dimensions.get('window');

export default function WelcomeScreen({
  navigation,
}: Props) {
  /*
   * ================================
   * LANGUAGE
   * ================================
   */

  const { translations } = useLanguage();
  const t = translations.welcome;

  /*
   * ================================
   * BACK
   * ================================
   */

  const handleBack = () => {
    navigation.replace('Language');
  };

  /*
   * ================================
   * LOGIN
   * ================================
   */

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  /*
   * ================================
   * REGISTER
   * ================================
   */

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <View style={styles.container}>

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <View style={styles.header}>

          {/* Back Button */}

          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backPressed,
            ]}
            hitSlop={12}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          {/* BikeRide Logo */}

          <View style={styles.logo}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Right Space */}

          <View style={styles.headerRight} />

        </View>

        {/* ===================================== */}
        {/* SCROLL CONTENT */}
        {/* ===================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ================================= */}
          {/* HERO */}
          {/* ================================= */}

          <LinearGradient
            colors={[
              COLORS.blueLight,
              '#F6F9FF',
              '#FFFFFF',
            ]}
            locations={[0, 0.65, 1]}
            style={styles.hero}
          >

            {/* Illustration */}

            <View style={styles.illustrationOuter}>

              <View style={styles.illustrationInner}>

                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.bikeImage}
                  resizeMode="contain"
                />

              </View>

            </View>

            {/* Hero Title */}

            <Text style={styles.heroTitle}>
              {t.heroTitle}
            </Text>

            {/* Hero Subtitle */}

            <Text style={styles.heroSubtitle}>
              {t.heroSubtitle}
            </Text>

          </LinearGradient>

          {/* ================================= */}
          {/* MAIN CONTENT */}
          {/* ================================= */}

          <View style={styles.content}>

            {/* Main Heading */}

            <Text style={styles.title}>
              {t.title}
            </Text>

            {/* Description */}

            <Text style={styles.description}>
              {t.description}
            </Text>

            {/* ================================= */}
            {/* BENEFITS */}
            {/* ================================= */}

            <View style={styles.benefits}>

              <Benefit
                icon="⏰"
                title={t.benefits.flexibleHours.title}
                description={
                  t.benefits.flexibleHours.description
                }
              />

              <Benefit
                icon="💰"
                title={t.benefits.earnMore.title}
                description={
                  t.benefits.earnMore.description
                }
              />

              <Benefit
                icon="🚀"
                title={t.benefits.easyStart.title}
                description={
                  t.benefits.easyStart.description
                }
              />

            </View>

            {/* ================================= */}
            {/* AUTH BUTTONS */}
            {/* ================================= */}

            <View style={styles.buttons}>

              {/* LOGIN */}

              <PrimaryButton
                title={t.login}
                onPress={handleLogin}
              />

              {/* REGISTER */}

              <Pressable
                onPress={handleRegister}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed && styles.registerPressed,
                ]}
              >
                <Text style={styles.registerText}>
                  {t.register}
                </Text>
              </Pressable>

            </View>

            {/* ================================= */}
            {/* TERMS */}
            {/* ================================= */}

            <Text style={styles.terms}>
              {t.termsPrefix}
              {'\n'}

              <Text style={styles.termsLink}>
                {t.terms}
              </Text>

              {` ${t.and} `}

              <Text style={styles.termsLink}>
                {t.privacy}
              </Text>
            </Text>

          </View>

        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

/* ================================================= */
/* BENEFIT COMPONENT */
/* ================================================= */

interface BenefitProps {
  icon: string;
  title: string;
  description: string;
}

function Benefit({
  icon,
  title,
  description,
}: BenefitProps) {
  return (
    <View style={styles.benefit}>

      {/* Icon */}

      <View style={styles.benefitIcon}>

        <Text style={styles.benefitEmoji}>
          {icon}
        </Text>

      </View>

      {/* Text */}

      <View style={styles.benefitText}>

        <Text style={styles.benefitTitle}>
          {title}
        </Text>

        <Text style={styles.benefitDescription}>
          {description}
        </Text>

      </View>

    </View>
  );
}

/* ================================================= */
/* STYLES */
/* ================================================= */

const styles = StyleSheet.create({

  /* ================================= */
  /* SCREEN */
  /* ================================= */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* ================================= */
  /* HEADER */
  /* ================================= */

  header: {
    height: 58,
    paddingHorizontal: 20,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 38,
    height: 38,

    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backPressed: {
    opacity: 0.5,
  },

  backArrow: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 34,
  },

  logo: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: COLORS.blue,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',
  },

  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  headerRight: {
    width: 38,
  },

  /* ================================= */
  /* HERO */
  /* ================================= */

  hero: {
    width: width - 40,
    minHeight: 315,

    alignSelf: 'center',

    borderRadius: 26,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 28,
    paddingVertical: 32,

    marginTop: 10,
  },

  /* ================================= */
  /* OUTER CIRCLE */
  /* ================================= */

  illustrationOuter: {
    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: '#DBEAFE',

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ================================= */
  /* INNER CIRCLE */
  /* ================================= */

  illustrationInner: {
    width: 120,
    height: 120,

    borderRadius: 60,

    backgroundColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 4,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    overflow: 'hidden',
  },

  bikeImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },

  /* ================================= */
  /* HERO TEXT */
  /* ================================= */

  heroTitle: {
    color: COLORS.text,

    fontSize: 26,
    fontWeight: FONT_WEIGHT.extraBold,

    marginTop: 27,

    textAlign: 'center',
  },

  heroSubtitle: {
    color: COLORS.textSecondary,

    fontSize: 13,
    lineHeight: 20,

    textAlign: 'center',

    marginTop: 9,

    maxWidth: 300,
  },

  /* ================================= */
  /* CONTENT */
  /* ================================= */

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  title: {
    color: COLORS.text,

    fontSize: 22,
    fontWeight: FONT_WEIGHT.extraBold,

    letterSpacing: -0.3,
  },

  description: {
    color: COLORS.textSecondary,

    fontSize: 13,
    lineHeight: 21,

    marginTop: 9,

    maxWidth: 350,
  },

  /* ================================= */
  /* BENEFITS */
  /* ================================= */

  benefits: {
    marginTop: 26,
  },

  benefit: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'flex-start',

    marginBottom: 18,
  },

  benefitIcon: {
    width: 48,
    height: 48,

    borderRadius: 14,

    backgroundColor: COLORS.blueLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,

    flexShrink: 0,
  },

  benefitEmoji: {
    fontSize: 22,
  },

  benefitText: {
    flex: 1,
    minWidth: 0,

    paddingTop: 1,
    paddingRight: 4,
  },

  benefitTitle: {
    color: COLORS.text,

    fontSize: 14,
    lineHeight: 21,

    fontWeight: FONT_WEIGHT.bold,

    flexShrink: 1,
  },

  benefitDescription: {
    color: COLORS.textLight,

    fontSize: 11,
    lineHeight: 17,

    marginTop: 3,

    flexShrink: 1,
  },

  /* ================================= */
  /* BUTTONS */
  /* ================================= */

  buttons: {
    marginTop: 20,
    gap: 12,
  },

  registerButton: {
    width: '100%',
    height: 54,

    borderRadius: 10,

    backgroundColor: COLORS.white,

    borderWidth: 1.5,
    borderColor: COLORS.blue,

    alignItems: 'center',
    justifyContent: 'center',
  },

  registerPressed: {
    backgroundColor: COLORS.blueLight,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  registerText: {
    color: COLORS.blue,

    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
  },

  /* ================================= */
  /* TERMS */
  /* ================================= */

  terms: {
    color: COLORS.textLight,

    fontSize: 10,
    lineHeight: 16,

    textAlign: 'center',

    marginTop: 15,

    paddingHorizontal: 8,

    flexShrink: 1,
  },

  termsLink: {
    color: COLORS.blue,

    fontWeight: FONT_WEIGHT.semibold,
  },

});