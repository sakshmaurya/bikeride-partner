import React, { useMemo, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Rides'>;

type RideStatus = 'New' | 'Ongoing' | 'Completed' | 'Cancelled';

type Ride = {
  id: string;
  pickup: string;
  destination: string;
  customer: string;
  amount: string;
  distance: string;
  time: string;
  status: RideStatus;
};

const rides: Ride[] = [
  {
    id: 'BR1001',
    pickup: 'Hazratganj',
    destination: 'Aliganj',
    customer: 'Rahul',
    amount: '₹145',
    distance: '6.2 km',
    time: '10:30 AM',
    status: 'Completed',
  },
  {
    id: 'BR1002',
    pickup: 'Gomti Nagar',
    destination: 'Indira Nagar',
    customer: 'Amit',
    amount: '₹185',
    distance: '8.4 km',
    time: '12:15 PM',
    status: 'Completed',
  },
  {
    id: 'BR1003',
    pickup: 'Alambagh',
    destination: 'Charbagh',
    customer: 'Priya',
    amount: '₹95',
    distance: '4.1 km',
    time: '6:20 PM',
    status: 'Cancelled',
  },
];

const tabs: Array<'All' | RideStatus> = [
  'All',
  'New',
  'Ongoing',
  'Completed',
  'Cancelled',
];

const getStatusTone = (status: RideStatus) => {
  switch (status) {
    case 'Completed':
      return {
        background: '#E9F8EF',
        text: '#1E8E4D',
        dot: '#2EAF62',
      };
    case 'Ongoing':
      return {
        background: '#FFF4DF',
        text: '#B77900',
        dot: '#F2A900',
      };
    case 'New':
      return {
        background: '#E9F1FF',
        text: '#356AE6',
        dot: '#4A7CF3',
      };
    default:
      return {
        background: '#FDEBEC',
        text: '#C7444E',
        dot: '#D85B64',
      };
  }
};

export default function RidesScreen({ navigation }: Props) {
  const { translations } = useLanguage();
  const t = translations.rides;

  const [selectedTab, setSelectedTab] =
    useState<'All' | RideStatus>('All');

  const filteredRides = useMemo(() => {
    if (selectedTab === 'All') {
      return rides;
    }

    return rides.filter((ride) => ride.status === selectedTab);
  }, [selectedTab]);

  const getTabLabel = (tab: 'All' | RideStatus) => {
    switch (tab) {
      case 'All':
        return t.all;
      case 'New':
        return t.new;
      case 'Ongoing':
        return t.ongoing;
      case 'Completed':
        return t.completed;
      case 'Cancelled':
        return t.cancelled;
    }
  };

  const getStatusLabel = (status: RideStatus) => {
    switch (status) {
      case 'New':
        return t.new;
      case 'Ongoing':
        return t.ongoing;
      case 'Completed':
        return t.completed;
      case 'Cancelled':
        return t.cancelled;
    }
  };

  const completedRides = rides.filter(
    (ride) => ride.status === 'Completed',
  ).length;

  const totalEarnings = rides.reduce((total, ride) => {
    if (ride.status !== 'Cancelled') {
      return total + Number(ride.amount.replace(/[^\d]/g, ''));
    }

    return total;
  }, 0);

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
              accessibilityLabel={t.back}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>↗</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.summaryLabel}>{t.totalRides}</Text>
                <Text style={styles.summaryValue}>{rides.length}</Text>
              </View>

              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>
                  {completedRides} {t.completed}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.earningsRow}>
              <View style={styles.earningsIcon}>
                <Text style={styles.earningsIconText}>₹</Text>
              </View>

              <View>
                <Text style={styles.summarySmallLabel}>
                  {t.earnings}
                </Text>
                <Text style={styles.earningsValue}>
                  ₹{totalEarnings.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t.rideHistory}</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredRides.length} {t.rides}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => {
              const selected = selectedTab === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={[
                    styles.tab,
                    selected && styles.selectedTab,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selected && styles.selectedTabText,
                    ]}
                  >
                    {getTabLabel(tab)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.rideList}>
            {filteredRides.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>↗</Text>
                </View>

                <Text style={styles.emptyTitle}>
                  {t.noRidesFound}
                </Text>

                <Text style={styles.emptyText}>
                  {t.noRidesInCategory}
                </Text>
              </View>
            ) : (
              filteredRides.map((ride) => {
                const tone = getStatusTone(ride.status);

                return (
                  <View key={ride.id} style={styles.rideCard}>
                    <View style={styles.rideTop}>
                      <View>
                        <Text style={styles.rideNumber}>
                          {t.rideNumber.replace(
                            '{id}',
                            ride.id,
                          )}
                        </Text>
                        <Text style={styles.rideTime}>
                          {ride.time}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: tone.background },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: tone.dot },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: tone.text },
                          ]}
                        >
                          {getStatusLabel(ride.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.route}>
                      <View style={styles.routeRail}>
                        <View
                          style={[
                            styles.routeDot,
                            styles.pickupDot,
                          ]}
                        />
                        <View style={styles.routeLine} />
                        <View
                          style={[
                            styles.routeDot,
                            styles.destinationDot,
                          ]}
                        />
                      </View>

                      <View style={styles.routeContent}>
                        <View style={styles.locationBlock}>
                          <Text style={styles.locationLabel}>
                            {t.pickup}
                          </Text>
                          <Text
                            style={styles.location}
                            numberOfLines={1}
                          >
                            {ride.pickup}
                          </Text>
                        </View>

                        <View style={styles.locationBlock}>
                          <Text style={styles.locationLabel}>
                            {t.destination}
                          </Text>
                          <Text
                            style={styles.location}
                            numberOfLines={1}
                          >
                            {ride.destination}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.rideFooter}>
                      <View style={styles.customerBlock}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {ride.customer.charAt(0)}
                          </Text>
                        </View>

                        <View>
                          <Text style={styles.customerLabel}>
                            {t.customer}
                          </Text>
                          <Text style={styles.customerName}>
                            {ride.customer}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.fareBlock}>
                        <Text style={styles.fare}>
                          {ride.amount}
                        </Text>
                        <Text style={styles.distance}>
                          {ride.distance}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
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

          <Pressable style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Text style={styles.activeNavIconText}>↗</Text>
            </View>
            <Text style={styles.activeNavText}>{t.rides}</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text style={styles.navIcon}>₹</Text>
            <Text style={styles.navText}>{t.earnings}</Text>
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
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 24,
    color: COLORS.text,
  },

  subtitle: {
    fontFamily: FONT_WEIGHT.regular,
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
    fontSize: 21,
    color: COLORS.white,
    fontFamily: FONT_WEIGHT.bold,
  },

  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },

  summaryValue: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 34,
    color: COLORS.white,
    marginTop: 3,
  },

  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  summaryBadgeText: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 12,
    color: COLORS.white,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginVertical: SPACING.md,
  },

  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  earningsIconText: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 19,
    color: COLORS.white,
  },

  summarySmallLabel: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
  },

  earningsValue: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 20,
    color: COLORS.white,
    marginTop: 2,
  },

  sectionHeader: {
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 20,
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  tabsContent: {
    paddingBottom: SPACING.md,
    gap: 8,
  },

  tab: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E6E8EE',
  },

  selectedTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tabText: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  selectedTabText: {
    color: COLORS.white,
  },

  rideList: {
    gap: SPACING.md,
  },

  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  rideTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },

  rideNumber: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  rideTime: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 11,
  },

  route: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },

  routeRail: {
    width: 22,
    alignItems: 'center',
    paddingTop: 5,
  },

  routeDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 3,
    backgroundColor: COLORS.white,
  },

  pickupDot: {
    borderColor: COLORS.primary,
  },

  destinationDot: {
    borderColor: '#E05260',
  },

  routeLine: {
    width: 1,
    flex: 1,
    minHeight: 34,
    backgroundColor: '#D9DCE4',
    marginVertical: 3,
  },

  routeContent: {
    flex: 1,
    marginLeft: 8,
    gap: 16,
  },

  locationBlock: {
    minHeight: 40,
  },

  locationLabel: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 9,
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 3,
  },

  location: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 14,
    color: COLORS.text,
  },

  rideFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ECEEF2',
    paddingTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  customerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  avatarText: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 14,
    color: COLORS.primary,
  },

  customerLabel: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  customerName: {
    fontFamily: FONT_WEIGHT.medium,
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },

  fareBlock: {
    alignItems: 'flex-end',
  },

  fare: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 18,
    color: COLORS.primary,
  },

  distance: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyIconText: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 23,
    color: COLORS.primary,
  },

  emptyTitle: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  emptyText: {
    fontFamily: FONT_WEIGHT.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
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
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },

  navText: {
    fontFamily: FONT_WEIGHT.medium,
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
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 17,
    color: COLORS.primary,
  },

  activeNavText: {
    fontFamily: FONT_WEIGHT.bold,
    fontSize: 10,
    color: COLORS.primary,
  },
});
