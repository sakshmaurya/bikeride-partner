import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useLanguage } from '../i18n';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_WEIGHT } from '../theme/fonts';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Earnings'>;

type Period = 'Today' | 'Week' | 'Month';

const earningsData = {
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

const breakdown = [
  {
    key: 'rideEarnings',
    amount: '₹1,050',
    icon: '↗',
  },
  {
    key: 'incentives',
    amount: '₹120',
    icon: '★',
  },
  {
    key: 'tips',
    amount: '₹70',
    icon: '₹',
  },
] as const;

export default function EarningsScreen({ navigation }: Props) {
  const { translations } = useLanguage();
  const t = translations.earnings;

  const [selectedPeriod, setSelectedPeriod] =
    useState<Period>('Today');

  const current = earningsData[selectedPeriod];

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'Today':
        return t.today;
      case 'Week':
        return t.week;
      case 'Month':
        return t.month;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>₹</Text>
            </View>
          </View>

          <View style={styles.periodTabs}>
            {(['Today', 'Week', 'Month'] as Period[]).map(
              (period) => {
                const selected = selectedPeriod === period;

                return (
                  <Pressable
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    style={[
                      styles.periodTab,
                      selected && styles.selectedPeriodTab,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        selected && styles.selectedPeriodText,
                      ]}
                    >
                      {getPeriodLabel(period)}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>
                  {t.totalEarnings}
                </Text>
                <Text style={styles.heroAmount}>
                  {current.total}
                </Text>
              </View>

              <View style={styles.heroIcon}>
                <Text style={styles.heroIconText}>₹</Text>
              </View>
            </View>

            <View style={styles.heroFooter}>
              <View style={styles.trendBadge}>
                <Text style={styles.trendIcon}>↗</Text>
                <Text style={styles.trendText}>12.5%</Text>
              </View>

              <Text style={styles.periodLabel}>
                {getPeriodLabel(selectedPeriod)}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>↗</Text>
              </View>
              <Text style={styles.statValue}>{current.rides}</Text>
              <Text style={styles.statLabel}>{t.rides}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>⌁</Text>
              </View>
              <Text style={styles.statValue}>
                {current.distance}
              </Text>
              <Text style={styles.statLabel}>{t.distance}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>◷</Text>
              </View>
              <Text style={styles.statValue}>{current.online}</Text>
              <Text style={styles.statLabel}>{t.online}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t.earningsBreakdown}
            </Text>
          </View>

          <View style={styles.breakdownCard}>
            {breakdown.map((item, index) => (
              <View key={item.key}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownIcon}>
                    <Text style={styles.breakdownIconText}>
                      {item.icon}
                    </Text>
                  </View>

                  <View style={styles.breakdownInfo}>
                    <Text style={styles.breakdownTitle}>
                      {t[item.key]}
                    </Text>
                    <Text style={styles.breakdownDescription}>
                      {t[`${item.key}Desc`]}
                    </Text>
                  </View>

                  <Text style={styles.breakdownAmount}>
                    {item.amount}
                  </Text>
                </View>

                {index < breakdown.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t.payoutInformation}
            </Text>
          </View>

          <View style={styles.payoutCard}>
            <View style={styles.payoutIcon}>
              <Text style={styles.payoutIconText}>₹</Text>
            </View>

            <View style={styles.payoutContent}>
              <Text style={styles.payoutTitle}>
                {t.nextPayout}
              </Text>
              <Text style={styles.payoutDescription}>
                {t.nextPayoutDesc}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.navIcon}>⌂</Text>
            <Text style={styles.navText}>{t.home}</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Rides')}
          >
            <Text style={styles.navIcon}>↗</Text>
            <Text style={styles.navText}>{t.rides}</Text>
          </Pressable>

          <Pressable style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Text style={styles.activeNavIconText}>₹</Text>
            </View>
            <Text style={styles.activeNavText}>
              {t.earnings}
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.navIcon}>◯</Text>
            <Text style={styles.navText}>{t.profile}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: COLORS.text,
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 24,
    color: COLORS.text,
  },

  subtitle: {
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 19,
    color: COLORS.white,
  },

  periodTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  periodTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },

  selectedPeriodTab: {
    backgroundColor: COLORS.primary,
  },

  periodText: {
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  selectedPeriodText: {
    color: COLORS.white,
  },

  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroLabel: {
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },

  heroAmount: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 34,
    color: COLORS.white,
    marginTop: 5,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIconText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 23,
    color: COLORS.white,
  },

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },

  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },

  trendIcon: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 13,
    color: COLORS.white,
    marginRight: 5,
  },

  trendText: {
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 11,
    color: COLORS.white,
  },

  periodLabel: {
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginLeft: 10,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  statIconText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 14,
    color: COLORS.primary,
  },

  statValue: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  statLabel: {
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  sectionHeader: {
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 19,
    color: COLORS.text,
  },

  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },

  breakdownIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  breakdownIconText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 17,
    color: COLORS.primary,
  },

  breakdownInfo: {
    flex: 1,
  },

  breakdownTitle: {
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  breakdownDescription: {
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  breakdownAmount: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#ECEEF2',
  },

  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  payoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  payoutIconText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 20,
    color: COLORS.primary,
  },

  payoutContent: {
    flex: 1,
  },

  payoutTitle: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  payoutDescription: {
    fontWeight: FONT_WEIGHT.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E8EAF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
  },

  navIcon: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },

  navText: {
    fontWeight: FONT_WEIGHT.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  activeNavIcon: {
    width: 34,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  activeNavIconText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 16,
    color: COLORS.primary,
  },

  activeNavText: {
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 10,
    color: COLORS.primary,
  },
});
