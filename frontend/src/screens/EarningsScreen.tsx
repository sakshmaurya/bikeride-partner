import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Earnings'
>;

type Period = 'Today' | 'Week' | 'Month';

export default function EarningsScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.earnings;

  const [period, setPeriod] =
    useState<Period>('Today');

  const earnings = {
    Today: {
      total: '₹1,240',
      rides: '8',
      distance: '48.6 km',
      online: '6h 20m',
    },
    Week: {
      total: '₹7,850',
      rides: '42',
      distance: '286.4 km',
      online: '32h 15m',
    },
    Month: {
      total: '₹28,450',
      rides: '168',
      distance: '1,124 km',
      online: '126h 40m',
    },
  };

  const current = earnings[period];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            navigation.replace('Dashboard')
          }
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {t.title}
          </Text>

          <Text style={styles.headerSubtitle}>
            {t.subtitle}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>
            ₹
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* PERIOD */}
        <View style={styles.periodContainer}>
          {(
            ['Today', 'Week', 'Month'] as Period[]
          ).map(item => {
            const active =
              period === item;

            return (
              <Pressable
                key={item}
                onPress={() =>
                  setPeriod(item)
                }
                style={[
                  styles.periodButton,
                  active
                    ? styles.periodButtonActive
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    active
                      ? styles.periodTextActive
                      : null,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* TOTAL */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {t.totalEarnings}
          </Text>

          <Text style={styles.totalAmount}>
            {current.total}
          </Text>

          <View style={styles.positiveBadge}>
            <Text
              style={styles.positiveText}
            >
              ↑ 12.5% from previous period
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              🛵
            </Text>

            <Text style={styles.statValue}>
              {current.rides}
            </Text>

            <Text style={styles.statLabel}>
              {t.rides}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              📍
            </Text>

            <Text style={styles.statValue}>
              {current.distance}
            </Text>

            <Text style={styles.statLabel}>
              {t.distance}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              ⏱
            </Text>

            <Text style={styles.statValue}>
              {current.online}
            </Text>

            <Text style={styles.statLabel}>
              {t.online}
            </Text>
          </View>
        </View>

        {/* BREAKDOWN */}
        <Text style={styles.sectionTitle}>
          {t.earningsBreakdown}
        </Text>

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View>
              <Text
                style={styles.breakdownTitle}
              >
                {t.rideEarnings}
              </Text>

              <Text
                style={styles.breakdownSubtitle}
              >
                {t.rideEarningsDesc}
              </Text>
            </View>

            <Text
              style={styles.breakdownAmount}
            >
              {period === 'Today'
                ? '₹1,080'
                : period === 'Week'
                  ? '₹6,820'
                  : '₹24,760'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <View>
              <Text
                style={styles.breakdownTitle}
              >
                {t.incentives}
              </Text>

              <Text
                style={styles.breakdownSubtitle}
              >
                {t.incentivesDesc}
              </Text>
            </View>

            <Text
              style={styles.breakdownAmount}
            >
              {period === 'Today'
                ? '₹100'
                : period === 'Week'
                  ? '₹680'
                  : '₹2,540'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <View>
              <Text
                style={styles.breakdownTitle}
              >
                {t.tips}
              </Text>

              <Text
                style={styles.breakdownSubtitle}
              >
                {t.tipsDesc}
              </Text>
            </View>

            <Text
              style={styles.breakdownAmount}
            >
              {period === 'Today'
                ? '₹60'
                : period === 'Week'
                  ? '₹350'
                  : '₹1,150'}
            </Text>
          </View>
        </View>

        {/* PAYOUT */}
        <Text style={styles.sectionTitle}>
          {t.payoutInformation}
        </Text>

        <View style={styles.payoutCard}>
          <View style={styles.payoutIcon}>
            <Text style={styles.payoutIconText}>
              🏦
            </Text>
          </View>

          <View style={styles.payoutInfo}>
            <Text style={styles.payoutTitle}>
              {t.nextPayout}
            </Text>

            <Text
              style={styles.payoutSubtitle}
            >
              {t.nextPayoutDesc}
            </Text>
          </View>

          <Text style={styles.payoutArrow}>
            ›
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.replace('Dashboard')
          }
        >
          <Text style={styles.navIcon}>
            🏠
          </Text>

          <Text style={styles.navText}>
            {t.home}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.replace('Rides')
          }
        >
          <Text style={styles.navIcon}>
            🛵
          </Text>

          <Text style={styles.navText}>
            {t.rides}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItemActive}
        >
          <Text style={styles.navIconActive}>
            ₹
          </Text>

          <Text
            style={styles.navTextActive}
          >
            {t.earnings}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.replace('Profile')
          }
        >
          <Text style={styles.navIcon}>
            👤
          </Text>

          <Text style={styles.navText}>
            {t.profile}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 36,
  },

  headerCenter: {
    flex: 1,
    marginLeft: SPACING.md,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },

  periodContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },

  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },

  periodText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  periodTextActive: {
    color: COLORS.white,
  },

  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    marginTop: SPACING.lg,
  },

  totalLabel: {
    color: COLORS.white,
    opacity: 0.85,
    fontSize: FONT_SIZE.sm,
  },

  totalAmount: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: FONT_WEIGHT.extraBold,
    marginTop: SPACING.xs,
  },

  positiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: SPACING.md,
  },

  positiveText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 18,
  },

  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.extraBold,
    marginTop: 5,
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extraBold,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },

  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
  },

  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
  },

  breakdownTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  breakdownSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
  },

  breakdownAmount: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },

  payoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  payoutIconText: {
    fontSize: 22,
  },

  payoutInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },

  payoutTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  payoutSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    lineHeight: 17,
    marginTop: 3,
  },

  payoutArrow: {
    color: COLORS.textSecondary,
    fontSize: 28,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  navIcon: {
    fontSize: 19,
    opacity: 0.6,
  },

  navIconActive: {
    fontSize: 19,
  },

  navText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  navTextActive: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 3,
  },
});