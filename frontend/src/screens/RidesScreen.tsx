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
  'Rides'
>;

type RideStatus =
  | 'New'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled';

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
    time: 'Today, 10:30 AM',
    status: 'Completed',
  },
  {
    id: 'BR1002',
    pickup: 'Gomti Nagar',
    destination: 'Indira Nagar',
    customer: 'Amit',
    amount: '₹185',
    distance: '8.4 km',
    time: 'Today, 12:15 PM',
    status: 'Completed',
  },
  {
    id: 'BR1003',
    pickup: 'Alambagh',
    destination: 'Charbagh',
    customer: 'Priya',
    amount: '₹95',
    distance: '4.1 km',
    time: 'Yesterday, 6:20 PM',
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

export default function RidesScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.rides;

  const [selectedTab, setSelectedTab] =
    useState<'All' | RideStatus>('All');

  const filteredRides =
    selectedTab === 'All'
      ? rides
      : rides.filter(
          ride => ride.status === selectedTab,
        );

  const getStatusStyle = (
    status: RideStatus,
  ) => {
    switch (status) {
      case 'Completed':
        return styles.completedStatus;

      case 'Ongoing':
        return styles.ongoingStatus;

      case 'New':
        return styles.newStatus;

      case 'Cancelled':
        return styles.cancelledStatus;

      default:
        return styles.completedStatus;
    }
  };

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
            🛵
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              24
            </Text>

            <Text style={styles.summaryLabel}>
              {t.totalRides}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              22
            </Text>

            <Text style={styles.summaryLabel}>
              {t.completed}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              ₹3,850
            </Text>

            <Text style={styles.summaryLabel}>
              {t.earnings}
            </Text>
          </View>
        </View>

        {/* FILTER */}
        <Text style={styles.sectionTitle}>
          {t.rideHistory}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.tabsContainer
          }
        >
          {tabs.map(tab => {
            const active =
              selectedTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() =>
                  setSelectedTab(tab)
                }
                style={[
                  styles.tab,
                  active
                    ? styles.activeTab
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    active
                      ? styles.activeTabText
                      : null,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* RIDES */}
        {filteredRides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🛵
            </Text>

            <Text style={styles.emptyTitle}>
              {t.noRidesFound}
            </Text>

            <Text style={styles.emptyText}>
              {t.noRidesInCategory}
            </Text>
          </View>
        ) : (
          filteredRides.map(ride => (
            <View
              key={ride.id}
              style={styles.rideCard}
            >
              {/* TOP */}
              <View style={styles.rideTop}>
                <View>
                  <Text style={styles.rideId}>
                    {t.rideNumber.replace('{id}', ride.id)}
                  </Text>

                  <Text style={styles.rideTime}>
                    {ride.time}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(
                      ride.status,
                    ),
                  ]}
                >
                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {ride.status}
                  </Text>
                </View>
              </View>

              {/* ROUTE */}
              <View style={styles.routeContainer}>
                <View style={styles.routeLine}>
                  <View
                    style={styles.pickupDot}
                  />

                  <View
                    style={styles.routeDash}
                  />

                  <View
                    style={styles.destinationDot}
                  />
                </View>

                <View
                  style={styles.routeText}
                >
                  <Text
                    style={
                      styles.locationLabel
                    }
                  >
                    {t.pickup}
                  </Text>

                  <Text
                    style={
                      styles.locationText
                    }
                  >
                    {ride.pickup}
                  </Text>

                  <View
                    style={
                      styles.locationGap
                    }
                  />

                  <Text
                    style={
                      styles.locationLabel
                    }
                  >
                    {t.destination}
                  </Text>

                  <Text
                    style={
                      styles.locationText
                    }
                  >
                    {ride.destination}
                  </Text>
                </View>
              </View>

              {/* CUSTOMER */}
              <View
                style={styles.customerRow}
              >
                <View
                  style={styles.customerAvatar}
                >
                  <Text>
                    👤
                  </Text>
                </View>

                <View
                  style={styles.customerInfo}
                >
                  <Text
                    style={
                      styles.customerLabel
                    }
                  >
                    {t.customer}
                  </Text>

                  <Text
                    style={
                      styles.customerName
                    }
                  >
                    {ride.customer}
                  </Text>
                </View>

                <View
                  style={styles.amountContainer}
                >
                  <Text
                    style={styles.amount}
                  >
                    {ride.amount}
                  </Text>

                  <Text
                    style={styles.distance}
                  >
                    {ride.distance}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
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
          style={styles.navItemActive}
        >
          <Text style={styles.navIconActive}>
            🛵
          </Text>

          <Text
            style={styles.navTextActive}
          >
            {t.rides}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.replace('Earnings')
          }
        >
          <Text style={styles.navIcon}>
            ₹
          </Text>

          <Text style={styles.navText}>
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
    fontSize: 21,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },

  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.border,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extraBold,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },

  tabsContainer: {
    paddingBottom: SPACING.md,
  },

  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  tabText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  activeTabText: {
    color: COLORS.white,
  },

  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },

  rideTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  rideId: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },

  rideTime: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 20,
  },

  completedStatus: {
    backgroundColor: '#E8F5E9',
  },

  ongoingStatus: {
    backgroundColor: '#E3F2FD',
  },

  newStatus: {
    backgroundColor: '#FFF3E0',
  },

  cancelledStatus: {
    backgroundColor: '#FFEBEE',
  },

  statusText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  routeContainer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },

  routeLine: {
    width: 24,
    alignItems: 'center',
    paddingTop: 4,
  },

  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  routeDash: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.border,
    marginVertical: 3,
  },

  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: COLORS.text,
  },

  routeText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  locationLabel: {
    color: COLORS.textLight,
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
  },

  locationText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 2,
  },

  locationGap: {
    height: 16,
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
  },

  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  customerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  customerLabel: {
    color: COLORS.textLight,
    fontSize: 9,
  },

  customerName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 2,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.extraBold,
  },

  distance: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.huge,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
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