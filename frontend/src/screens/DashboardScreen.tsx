
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';

import { COLORS } from '../theme/colors';
import { FONT_WEIGHT } from '../theme/fonts';

import { API_BASE_URL } from '../constants/api';

import {
  getCurrentUserId,
  clearCurrentUserId,
} from '../utils/session';

import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Dashboard'
>;

type UserData = {
  id: number;
  phone_number: string;
  language: string;
  name: string | null;
  email: string | null;
  selfie_uri: string | null;
  application_status: string;
  registration_completed: boolean;
  created_at: string;
  updated_at: string;
};

type VehicleData = {
  vehicle_brand?: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_color: string;
  registration_number: string;
  license_number: string;
  vehicle_image_uri: string | null;
};

type DocumentData = {
  id: number;
  document_type: string;
  document_uri: string | null;
  status: string;
};

type BankData = {
  id: number;
  user_id: number;
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id?: string | null;
};

export default function DashboardScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();

  const t = translations.dashboard;

  const [user, setUser] =
    useState<UserData | null>(null);

  const [vehicle, setVehicle] =
    useState<VehicleData | null>(null);

  const [documents, setDocuments] =
    useState<DocumentData[]>([]);

  const [bank, setBank] =
    useState<BankData | null>(null);

  const [isOnline, setIsOnline] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadDashboard = async () => {
    const userId = await getCurrentUserId();

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/${userId}`,
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const dashboard =
          data.dashboard;

        setUser(dashboard.user);
        setVehicle(dashboard.vehicle);
        setBank(dashboard.bank);
        setDocuments(
          dashboard.documents || [],
        );
      }
    } catch (error) {
      console.log(
        'Dashboard error:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = async () => {
    await clearCurrentUserId();

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Splash',
        },
      ],
    });
  };

  const displayName =
    user?.name?.trim() || 'Partner';

  const verifiedDocuments =
    documents.filter(
      item =>
        item.status === 'verified',
    ).length;

  const maskAccountNumber = (
    accountNumber: string,
  ) => {
    if (!accountNumber) {
      return 'Not available';
    }

    if (accountNumber.length <= 4) {
      return `•••• ${accountNumber}`;
    }

    return `•••• •••• ${accountNumber.slice(
      -4,
    )}`;
  };

  const getStatusText = () => {
    switch (
      user?.application_status
    ) {
      case 'approved':
        return t.accountVerified;

      case 'under_review':
        return t.underReview;

      case 'rejected':
        return t.rejected;

      case 'incomplete':
        return t.incomplete;

      default:
        return t.accountActive;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loading}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={styles.loadingText}
          >
            {translations.common.loading}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.headerProfile}
          onPress={() =>
            navigation.navigate(
              'Profile',
            )
          }
        >
          {user?.selfie_uri ? (
            <Image
              source={{
                uri: user.selfie_uri,
              }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={styles.avatarPlaceholder}
            >
              <Text
                style={styles.avatarText}
              >
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}

          <View
            style={styles.headerInfo}
          >
            <Text
              style={styles.greeting}
            >
              {t.greeting} 👋
            </Text>

            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <Text
              style={styles.partner}
            >
              {t.partner}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={
            styles.notificationButton
          }
        >
          <Text
            style={
              styles.notificationIcon
            }
          >
            🔔
          </Text>

          <View
            style={styles.notificationDot}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ONLINE STATUS */}

        <View
          style={[
            styles.onlineCard,
            isOnline &&
              styles.onlineCardOnline,
          ]}
        >
          <View
            style={styles.onlineLeft}
          >
            <View
              style={[
                styles.onlineCircle,
                isOnline &&
                  styles.onlineCircleOnline,
              ]}
            >
              <View
                style={[
                  styles.onlineDot,
                  isOnline &&
                    styles.onlineDotOnline,
                ]}
              />
            </View>

            <View
              style={styles.onlineInfo}
            >
              <Text
                style={styles.onlineTitle}
              >
                {isOnline
                  ? t.online
                  : t.offline}
              </Text>

              <Text
                style={styles.onlineSubtitle}
              >
                {isOnline
                  ? t.onlineDesc
                  : t.offlineDesc}
              </Text>
            </View>
          </View>

          <Switch
            value={isOnline}
            onValueChange={
              setIsOnline
            }
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary,
            }}
            thumbColor={
              COLORS.white
            }
          />
        </View>

        {/* TODAY SUMMARY */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            {t.todaysRides}
          </Text>

          <Text
            style={styles.todayText}
          >
            {t.today}
          </Text>
        </View>

        <View
          style={styles.statsRow}
        >
          <View
            style={styles.statCard}
          >
            <View
              style={styles.statIcon}
            >
              <Text>🚕</Text>
            </View>

            <Text
              style={styles.statValue}
            >
              0
            </Text>

            <Text
              style={styles.statLabel}
            >
              {t.todaysRides}
            </Text>
          </View>

          <View
            style={styles.statCard}
          >
            <View
              style={styles.statIcon}
            >
              <Text>₹</Text>
            </View>

            <Text
              style={styles.statValue}
            >
              ₹0
            </Text>

            <Text
              style={styles.statLabel}
            >
              {t.todaysEarnings}
            </Text>
          </View>

          <View
            style={styles.statCard}
          >
            <View
              style={styles.statIcon}
            >
              <Text>⭐</Text>
            </View>

            <Text
              style={styles.statValue}
            >
              5.0
            </Text>

            <Text
              style={styles.statLabel}
            >
              {t.rating}
            </Text>
          </View>
        </View>

        {/* RIDE REQUEST */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            {t.rideRequests}
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate(
                'Rides',
              )
            }
          >
            <Text
              style={
                styles.viewAll
              }
            >
              {t.viewAll}
            </Text>
          </Pressable>
        </View>

        <View
          style={styles.requestCard}
        >
          <View
            style={
              styles.requestIcon
            }
          >
            <Text>📍</Text>
          </View>

          <View
            style={
              styles.requestContent
            }
          >
            <Text
              style={
                styles.requestTitle
              }
            >
              {isOnline
                ? t.rideRequests
                : t.offline}
            </Text>

            <Text
              style={
                styles.requestSubtitle
              }
            >
              {isOnline
                ? t.waitingRequests
                : t.goOnlineRequests}
            </Text>
          </View>

          <View
            style={
              isOnline
                ? styles.liveBadge
                : styles.offlineBadge
            }
          >
            <Text
              style={
                isOnline
                  ? styles.liveText
                  : styles.offlineText
              }
            >
              {isOnline
                ? t.live
                : 'OFF'}
            </Text>
          </View>
        </View>

        {/* VEHICLE */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            {t.myVehicle}
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate(
                'VehicleDetails',
              )
            }
          >
            <Text
              style={
                styles.viewAll
              }
            >
              {t.vehicleDetails}
            </Text>
          </Pressable>
        </View>

        <View
          style={styles.vehicleCard}
        >
          {vehicle?.vehicle_image_uri ? (
            <Image
              source={{
                uri:
                  vehicle.vehicle_image_uri,
              }}
              style={
                styles.vehicleImage
              }
            />
          ) : (
            <View
              style={
                styles.vehiclePlaceholder
              }
            >
              <Text
                style={
                  styles.vehicleEmoji
                }
              >
                🏍️
              </Text>
            </View>
          )}

          <View
            style={
              styles.vehicleInfo
            }
          >
            <View
              style={
                styles.vehicleTitleRow
              }
            >
              <Text
                style={
                  styles.vehicleName
                }
              >
                {vehicle?.vehicle_model ||
                  'Vehicle'}
              </Text>

              <View
                style={
                  styles.verifiedBadge
                }
              >
                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  ✓ {t.verified}
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.vehicleType
              }
            >
              {vehicle?.vehicle_type ||
                'Bike'}
            </Text>

            <Text
              style={
                styles.vehicleNumber
              }
            >
              {vehicle?.registration_number ||
                'Not available'}
            </Text>
          </View>
        </View>

        {/* VEHICLE DETAILS */}

        {vehicle && (
          <View
            style={
              styles.vehicleDetails
            }
          >
            <View
              style={
                styles.vehicleDetail
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                Year
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {vehicle.vehicle_year}
              </Text>
            </View>

            <View
              style={
                styles.vehicleDetail
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                Color
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {vehicle.vehicle_color}
              </Text>
            </View>

            <View
              style={
                styles.vehicleDetail
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                Licence
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {vehicle.license_number
                  ?.slice(-4)
                  .padStart(
                    vehicle
                      .license_number
                      .length,
                    '•',
                  )}
              </Text>
            </View>
          </View>
        )}

        {/* VERIFICATION */}

        <View
          style={
            styles.verificationCard
          }
        >
          <View
            style={
              styles.verificationIcon
            }
          >
            <Text>✓</Text>
          </View>

          <View
            style={
              styles.verificationContent
            }
          >
            <Text
              style={
                styles.verificationTitle
              }
            >
              {getStatusText()}
            </Text>

            <Text
              style={
                styles.verificationText
              }
            >
              {user?.application_status ===
              'approved'
                ? t.documentsVerified
                : t.beingProcessed}
            </Text>
          </View>
        </View>

        {/* ACCOUNT */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            {t.account}
          </Text>
        </View>

        <View
          style={styles.accountCard}
        >
          {/* DOCUMENTS */}

          <Pressable
            style={styles.accountRow}
            onPress={() =>
              navigation.navigate(
                'Documents',
              )
            }
          >
            <View
              style={styles.accountIcon}
            >
              <Text>📄</Text>
            </View>

            <View
              style={styles.accountContent}
            >
              <Text
                style={
                  styles.accountTitle
                }
              >
                {t.documents}
              </Text>

              <Text
                style={
                  styles.accountSubtitle
                }
              >
                {documents.length}{' '}
                {t.documentsUploaded.replace(
                  '{count}',
                  '',
                ).trim()}{' '}
                •{' '}
                {verifiedDocuments}{' '}
                {t.documentsVerified
                  .replace(
                    '• {count}',
                    '',
                  )
                  .trim()}
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </Pressable>

          <View
            style={styles.divider}
          />

          {/* BANK */}

          <Pressable
            style={styles.accountRow}
            onPress={() =>
              navigation.navigate(
                'BankDetails',
              )
            }
          >
            <View
              style={styles.accountIcon}
            >
              <Text>🏦</Text>
            </View>

            <View
              style={styles.accountContent}
            >
              <Text
                style={
                  styles.accountTitle
                }
              >
                {t.bankAccount}
              </Text>

              <Text
                style={
                  styles.accountSubtitle
                }
              >
                {bank
                  ? `${bank.bank_account_name} • ${maskAccountNumber(
                      bank.account_number,
                    )}`
                  : t.bankNotAdded}
              </Text>
            </View>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </Pressable>

          <View
            style={styles.divider}
          />

          {/* SELFIE */}

          <Pressable
            style={styles.accountRow}
            onPress={() =>
              navigation.navigate(
                'Selfie',
              )
            }
          >
            <View
              style={styles.selfieIcon}
            >
              {user?.selfie_uri ? (
                <Image
                  source={{
                    uri: user.selfie_uri,
                  }}
                  style={
                    styles.selfieImage
                  }
                />
              ) : (
                <Text>🤳</Text>
              )}
            </View>

            <Text
              style={styles.accountSubtitle}
            >
              {user?.selfie_uri
                ? t.uploaded
                : t.notUploaded}
            </Text>

            <Text
              style={styles.arrow}
            >
              ›
            </Text>
          </Pressable>
        </View>

        {/* QUICK ACTIONS */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            {t.quickActions}
          </Text>
        </View>

        <View
          style={styles.quickActions}
        >
          <Pressable
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate(
                'Rides',
              )
            }
          >
            <Text
              style={styles.quickEmoji}
            >
              🚕
            </Text>

            <Text
              style={
                styles.quickTitle
              }
            >
              {t.myRides}
            </Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate(
                'Earnings',
              )
            }
          >
            <Text
              style={styles.quickEmoji}
            >
              💰
            </Text>

            <Text
              style={
                styles.quickTitle
              }
            >
              {t.todaysEarnings}
            </Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate(
                'Profile',
              )
            }
          >
            <Text
              style={styles.quickEmoji}
            >
              👤
            </Text>

            <Text
              style={
                styles.quickTitle
              }
            >
              {t.profile}
            </Text>
          </Pressable>
        </View>

        {/* LOGOUT */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutText}
          >
            {t.logout}
          </Text>
        </Pressable>

        <Text
          style={styles.footer}
        >
          {t.footer} • {t.tagline}
        </Text>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View
        style={styles.bottomNav}
      >
        <Pressable
          style={styles.navItem}
        >
          <Text
            style={[
              styles.navIcon,
              styles.activeNavIcon,
            ]}
          >
            🏠
          </Text>

          <Text
            style={[
              styles.navLabel,
              styles.activeNavLabel,
            ]}
          >
            {t.home}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Rides',
            )
          }
        >
          <Text style={styles.navIcon}>
            🚕
          </Text>

          <Text
            style={styles.navLabel}
          >
            {t.rides}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Earnings',
            )
          }
        >
          <Text style={styles.navIcon}>
            ₹
          </Text>

          <Text
            style={styles.navLabel}
          >
            {t.earnings}
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              'Profile',
            )
          }
        >
          <Text style={styles.navIcon}>
            👤
          </Text>

          <Text
            style={styles.navLabel}
          >
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
    backgroundColor: '#F7F9FC',
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
  },

  headerInfo: {
    marginLeft: 11,
    flex: 1,
  },

  greeting: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 1,
  },

  partner: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 1,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: {
    fontSize: 19,
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },

  onlineCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  onlineCardOnline: {
    backgroundColor: '#EAF8EF',
  },

  onlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  onlineCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineCircleOnline: {
    backgroundColor: COLORS.success,
  },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.textLight,
  },

  onlineDotOnline: {
    backgroundColor: COLORS.white,
  },

  onlineInfo: {
    marginLeft: 12,
    flex: 1,
  },

  onlineTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  onlineSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  sectionTitle: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  todayText: {
    color: COLORS.textLight,
    fontSize: 11,
  },

  viewAll: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: FONT_WEIGHT.extraBold,
    marginTop: 8,
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },

  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  requestContent: {
    flex: 1,
    marginLeft: 11,
  },

  requestTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  requestSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },

  liveBadge: {
    backgroundColor: '#EAF8EF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  liveText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
  },

  offlineBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  offlineText: {
    color: COLORS.textLight,
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
  },

  vehicleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  vehicleImage: {
    width: 92,
    height: 72,
    borderRadius: 12,
  },

  vehiclePlaceholder: {
    width: 92,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vehicleEmoji: {
    fontSize: 30,
  },

  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },

  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },

  verifiedBadge: {
    backgroundColor: '#EAF8EF',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  verifiedText: {
    color: COLORS.success,
    fontSize: 8,
    fontWeight: FONT_WEIGHT.bold,
  },

  vehicleType: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  vehicleNumber: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 5,
  },

  vehicleDetails: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  vehicleDetail: {
    flex: 1,
  },

  detailLabel: {
    color: COLORS.textLight,
    fontSize: 10,
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 3,
  },

  verificationCard: {
    backgroundColor: '#EAF8EF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  verificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verificationContent: {
    flex: 1,
    marginLeft: 11,
  },

  verificationTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  verificationText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },

  accountRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selfieIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selfieImage: {
    width: 42,
    height: 42,
  },

  accountContent: {
    flex: 1,
    marginLeft: 11,
  },

  accountTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  accountSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  arrow: {
    color: COLORS.textLight,
    fontSize: 25,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 20,
  },

  quickAction: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },

  quickEmoji: {
    fontSize: 23,
  },

  quickTitle: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 7,
  },

  logoutButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1CACA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  logoutText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },

  footer: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 18,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 5,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },

  navIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },

  activeNavIcon: {
    transform: [
      {
        scale: 1.05,
      },
    ],
  },

  navLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  activeNavLabel: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});
