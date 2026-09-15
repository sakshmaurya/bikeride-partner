import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';
import { useLanguage } from '../i18n';
import { getCurrentUserId } from '../utils/session';
import { apiRequest } from '../utils/api';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'UnderReview'
>;

export default function UnderReviewScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.review;

  const handleGoHome = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        navigation.replace('Dashboard');
        return;
      }

      const { status, data } = await apiRequest<{
        success?: boolean;
        applicationStatus?: string;
        registrationCompleted?: boolean;
        nextStep?: string;
      }>(`/onboarding/${userId}`);

      if (status >= 200 && status < 300 && data.applicationStatus === 'approved') {
        navigation.replace('Approved');
        return;
      }

      navigation.replace('Dashboard');
    } catch {
      navigation.replace('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ================================================= */}
        {/* TOP ILLUSTRATION */}
        {/* ================================================= */}

        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationOuter}>
            <View style={styles.illustrationInner}>

              {/* Simple document illustration */}
              <View style={styles.document}>
                <View style={styles.documentTop} />

                <View style={styles.documentLine} />
                <View style={styles.documentLineShort} />
                <View style={styles.documentLine} />

                <View style={styles.documentCheck}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <Text style={styles.title}>
          {t.applicationReview}
        </Text>

        <Text style={styles.description}>
          {t.reviewInProgress}
        </Text>

        {/* ================================================= */}
        {/* REVIEW TIME CARD */}
        {/* ================================================= */}

        <View style={styles.reviewCard}>

          <View style={styles.clockCircle}>
            <Text style={styles.clockIcon}>⏱</Text>
          </View>

          <View style={styles.reviewContent}>

            <Text style={styles.reviewTitle}>
              {t.reviewTime}
            </Text>

            <Text style={styles.reviewText}>
              {t.verification}
            </Text>

          </View>

        </View>

        {/* ================================================= */}
        {/* WHAT HAPPENS NEXT */}
        {/* ================================================= */}

        <View style={styles.infoCard}>

          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIcon}>✓</Text>
          </View>

          <View style={styles.infoContent}>

            <Text style={styles.infoTitle}>
              {t.whatHappens}
            </Text>

            <Text style={styles.infoText}>
              {t.approval}
              {'\n\n'}
              {t.notification}
            </Text>

          </View>

        </View>

        {/* ================================================= */}
        {/* HOME BUTTON */}
        {/* ================================================= */}

        <View style={styles.bottom}>

          <PrimaryButton
            title={t.contactSupport}
            onPress={handleGoHome}
          />

          <Text style={styles.footerText}>
            {t.contact}
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({

  /* ================= SCREEN ================= */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },

  /* ================= ILLUSTRATION ================= */

  illustrationWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },

  illustrationOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
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
  },

  /* ================= DOCUMENT ================= */

  document: {
    width: 58,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.blue,
    backgroundColor: COLORS.white,
    paddingTop: 14,
    paddingHorizontal: 10,
    position: 'relative',
  },

  documentTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    backgroundColor: COLORS.blueLight,
    borderBottomLeftRadius: 7,
  },

  documentLine: {
    height: 5,
    width: '100%',
    borderRadius: 3,
    backgroundColor: '#DCE8FC',
    marginBottom: 7,
  },

  documentLineShort: {
    height: 5,
    width: '65%',
    borderRadius: 3,
    backgroundColor: '#DCE8FC',
    marginBottom: 7,
  },

  documentCheck: {
    position: 'absolute',
    right: -13,
    bottom: -10,

    width: 32,
    height: 32,
    borderRadius: 16,

    backgroundColor: COLORS.blue,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 3,
    borderColor: COLORS.white,
  },

  checkText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },

  /* ================= TITLE ================= */

  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: FONT_WEIGHT.extraBold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
  },

  /* ================= REVIEW CARD ================= */

  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.blueLight,

    borderRadius: 16,

    paddingHorizontal: 15,
    paddingVertical: 15,

    marginTop: 25,

    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  clockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: COLORS.blue,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  clockIcon: {
    color: COLORS.white,
    fontSize: 23,
  },

  reviewContent: {
    flex: 1,
  },

  reviewTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.bold,
  },

  reviewText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  /* ================= INFO CARD ================= */

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    backgroundColor: COLORS.white,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: COLORS.border,

    padding: 15,

    marginTop: 16,
  },

  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor: COLORS.blueLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  infoIcon: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: '800',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  infoText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  /* ================= BUTTON ================= */

  bottom: {
    marginTop: 25,
  },

  footerText: {
    color: COLORS.textLight,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 13,
    paddingHorizontal: 15,
  },

});
