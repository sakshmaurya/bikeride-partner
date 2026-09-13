import React from 'react';
import {
  SafeAreaView,
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

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Approved'
>;

export default function ApprovedScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.approved;

  /*
   * Register flow:
   * Register → OTP → Approved → Dashboard
   */
  const handleStart = () => {
    navigation.replace('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}

        <View style={styles.iconWrapper}>
          <View style={styles.outerCircle}>
            <View style={styles.iconCircle}>
              <Text style={styles.check}>✓</Text>
            </View>
          </View>
        </View>

        {/* Heading */}

        <Text style={styles.title}>
          {t.youAreApproved}
        </Text>

        <Text style={styles.description}>
          {t.congratulations}
        </Text>

        {/* Status */}

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusCheck}>
              ✓
            </Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {t.partnerAccountActive}
            </Text>

            <Text style={styles.statusText}>
              {t.readyToStart}
            </Text>
          </View>
        </View>

        {/* Benefits */}

        <View style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>
            {t.whatsNext}
          </Text>

          {/* Benefit 1 */}

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Text style={styles.emoji}>
                🏍️
              </Text>
            </View>

            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>
                {t.startAcceptingRides}
              </Text>

              <Text style={styles.benefitText}>
                {t.startAcceptingRidesDesc}
              </Text>
            </View>
          </View>

          {/* Benefit 2 */}

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Text style={styles.emoji}>
                💰
              </Text>
            </View>

            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>
                {t.earnOnEveryRide}
              </Text>

              <Text style={styles.benefitText}>
                {t.earnOnEveryRideDesc}
              </Text>
            </View>
          </View>

          {/* Benefit 3 */}

          <View style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Text style={styles.emoji}>
                ⭐
              </Text>
            </View>

            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>
                {t.buildYourRating}
              </Text>

              <Text style={styles.benefitText}>
                {t.buildYourRatingDesc}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Summary */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {t.verificationComplete}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t.identityDocuments}
            </Text>

            <Text style={styles.summaryValue}>
              {t.verified}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t.selfieVerification}
            </Text>

            <Text style={styles.summaryValue}>
              {t.verified}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t.bankDetails}
            </Text>

            <Text style={styles.summaryValue}>
              {t.verified}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t.vehicleDetails}
            </Text>

            <Text style={styles.summaryValue}>
              {t.verified}
            </Text>
          </View>
        </View>

        {/* Bottom */}

        <View style={styles.bottom}>
          <PrimaryButton
            title={t.startRiding}
            onPress={handleStart}
          />

          <Text style={styles.footerText}>
            {t.welcomeToCommunity}
          </Text>
        </View>
      </ScrollView>
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

  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.huge,
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  outerCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  check: {
    color: COLORS.white,
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 58,
  },

  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extraBold,
    textAlign: 'center',
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xxl,
  },

  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  statusCheck: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: '800',
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },

  statusText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    lineHeight: 18,
    marginTop: 4,
  },

  benefitsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    marginTop: SPACING.xxl,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.lg,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },

  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  emoji: {
    fontSize: 21,
  },

  benefitContent: {
    flex: 1,
  },

  benefitTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  benefitText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    lineHeight: 18,
    marginTop: 3,
  },

  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },

  summaryTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },

  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    flex: 1,
  },

  summaryValue: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },

  bottom: {
    marginTop: SPACING.xxl,
  },

  footerText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});