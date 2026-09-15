import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useLanguage } from '../i18n';
import type { RootStackParamList } from '../types/navigation';

import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';

import { API_BASE_URL } from '../constants/api';
import { getCurrentUserId } from '../utils/session';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Profile'
>;

type User = {
  id: number;
  phone_number?: string;
  phoneNumber?: string;
  language?: string;
  name?: string;
  email?: string;
  selfie_uri?: string;
  selfieUri?: string;
  application_status?: string;
  applicationStatus?: string;
};

type Vehicle = {
  vehicle_type?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  registration_number?: string;
  license_number?: string;
};

type Bank = {
  bank_account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
};

type Document = {
  document_type: string;
  status?: string;
};

export default function ProfileScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.profilePage;

  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(
    async (showLoader = true) => {
      const userId = await getCurrentUserId();

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const [
          userResponse,
          vehicleResponse,
          bankResponse,
          documentsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${userId}`),
          fetch(`${API_BASE_URL}/vehicle/${userId}`),
          fetch(`${API_BASE_URL}/bank/${userId}`),
          fetch(`${API_BASE_URL}/documents/${userId}`),
        ]);

        const userData = await userResponse.json();
        const vehicleData = await vehicleResponse.json();
        const bankData = await bankResponse.json();
        const documentsData = await documentsResponse.json();

        if (userResponse.ok && userData.success) {
          const apiUser =
            userData.user ||
            userData.data ||
            userData;

          setUser({
            id: apiUser.id ?? Number(userId),
            phone_number:
              apiUser.phone_number ??
              apiUser.phoneNumber ??
              '',
            language: apiUser.language ?? 'English',
            name:
              apiUser.name ??
              apiUser.full_name ??
              apiUser.fullName ??
              '',
            email: apiUser.email ?? '',
            selfie_uri:
              apiUser.selfie_uri ??
              apiUser.selfieUri ??
              '',
            application_status:
              apiUser.application_status ??
              apiUser.applicationStatus ??
              'new',
          });
        }

        if (
          vehicleResponse.ok &&
          vehicleData.success
        ) {
          setVehicle(
            vehicleData.vehicleDetails ||
              vehicleData.vehicle ||
              vehicleData.data ||
              null,
          );
        }

        if (
          bankResponse.ok &&
          bankData.success
        ) {
          setBank(
            bankData.bankDetails ||
              bankData.bank ||
              bankData.data ||
              null,
          );
        }

        if (
          documentsResponse.ok &&
          documentsData.success
        ) {
          setDocuments(
            documentsData.documents || [],
          );
        }
      } catch (error) {
        console.log('❌ Profile loading error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile(false);
  };

  const displayName =
    user?.name?.trim() || 'Partner';

  const displayEmail =
    user?.email?.trim() || t.notAdded;

  const displayPhone =
    user?.phone_number ||
    user?.phoneNumber ||
    t.phoneNotAvailable;

  const displayLanguage =
    user?.language || 'English';

  const displaySelfie =
    user?.selfie_uri ||
    user?.selfieUri;

  const displayStatus =
    user?.application_status ||
    user?.applicationStatus ||
    t.notAvailable;

  const maskAccountNumber = (
    accountNumber?: string,
  ) => {
    if (!accountNumber) {
      return t.notAdded;
    }

    if (accountNumber.length <= 4) {
      return accountNumber;
    }

    return `•••• •••• ${accountNumber.slice(-4)}`;
  };

  const formatStatus = (status?: string) => {
    if (!status) {
      return t.notAvailable;
    }

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char =>
        char.toUpperCase(),
      );
  };

  const getInitials = (name?: string) => {
    if (!name?.trim()) {
      return 'U';
    }

    return name
      .trim()
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
          <Text style={styles.loadingText}>
            {t.loadingProfile}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t.back}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {t.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t.subtitle}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              ◯
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.profileHero}>
            {displaySelfie ? (
              <Image
                source={{ uri: displaySelfie }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.name)}
                </Text>
              </View>
            )}

            <View style={styles.profileHeroInfo}>
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              <Text
                style={styles.phone}
                numberOfLines={1}
              >
                {displayPhone}
              </Text>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {formatStatus(displayStatus)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t.personalInformation}
            </Text>

            <View style={styles.card}>
              <InfoRow
                label={t.name}
                value={displayName}
              />
              <InfoRow
                label={t.phone}
                value={displayPhone}
              />
              <InfoRow
                label={t.email}
                value={displayEmail}
              />
              <InfoRow
                label={t.language}
                value={displayLanguage}
                last
              />
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeadingRow}
              onPress={() =>
                navigation.navigate(
                  'VehicleDetails',
                )
              }
              activeOpacity={0.75}
            >
              <View>
                <Text style={styles.sectionTitle}>
                  {t.vehicle}
                </Text>
                <Text style={styles.sectionHint}>
                  {t.vehicleDetailsNotAvailable}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              {vehicle ? (
                <>
                  <InfoRow
                    label={t.type}
                    value={
                      vehicle.vehicle_type ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.model}
                    value={
                      vehicle.vehicle_model ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.year}
                    value={
                      vehicle.vehicle_year ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.color}
                    value={
                      vehicle.vehicle_color ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.registration}
                    value={
                      vehicle.registration_number ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.drivingLicence}
                    value={
                      vehicle.license_number ||
                      t.notAvailable
                    }
                    last
                  />
                </>
              ) : (
                <EmptyRow
                  text={t.vehicleDetailsNotAvailable}
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeadingRow}
              onPress={() =>
                navigation.navigate(
                  'BankDetails',
                )
              }
              activeOpacity={0.75}
            >
              <View>
                <Text style={styles.sectionTitle}>
                  {t.bankAccount}
                </Text>
                <Text style={styles.sectionHint}>
                  {t.accountNumber}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              {bank ? (
                <>
                  <InfoRow
                    label={t.accountHolder}
                    value={
                      bank.bank_account_name ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.accountNumber}
                    value={maskAccountNumber(
                      bank.account_number,
                    )}
                  />
                  <InfoRow
                    label={t.ifsc}
                    value={
                      bank.ifsc_code ||
                      t.notAvailable
                    }
                  />
                  <InfoRow
                    label={t.bankName}
                    value={
                      bank.bank_name ||
                      t.notAvailable
                    }
                    last
                  />
                </>
              ) : (
                <EmptyRow
                  text={t.bankAccountNotAvailable}
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  {t.documents}
                </Text>
                <Text style={styles.sectionHint}>
                  {documents.length} {t.uploaded}
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {documents.length}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              {documents.length > 0 ? (
                documents.map((document, index) => (
                  <View
                    key={`${document.document_type}-${index}`}
                    style={[
                      styles.documentRow,
                      index === documents.length - 1 &&
                        styles.lastDocumentRow,
                    ]}
                  >
                    <View style={styles.documentIcon}>
                      <Text style={styles.documentIconText}>
                        ✓
                      </Text>
                    </View>

                    <View style={styles.documentInfo}>
                      <Text
                        style={styles.documentName}
                        numberOfLines={1}
                      >
                        {formatStatus(
                          document.document_type,
                        )}
                      </Text>

                      <Text style={styles.documentStatus}>
                        {formatStatus(document.status)}
                      </Text>
                    </View>

                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>
                        ✓
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <EmptyRow text={t.noDocumentsFound} />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  {t.profileVerification}
                </Text>
                <Text style={styles.sectionHint}>
                  {displaySelfie
                    ? t.selfieUploaded
                    : t.selfieNotUploaded}
                </Text>
              </View>

              <View style={styles.verificationIcon}>
                <Text style={styles.verificationIconText}>
                  {displaySelfie ? '✓' : '!'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              {displaySelfie ? (
                <Image
                  source={{ uri: displaySelfie }}
                  style={styles.selfie}
                />
              ) : (
                <View style={styles.selfieEmpty}>
                  <View style={styles.selfieEmptyIcon}>
                    <Text style={styles.selfieEmptyIconText}>
                      !
                    </Text>
                  </View>
                  <Text style={styles.emptyText}>
                    {t.selfieNotUploaded}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() =>
              navigation.navigate('Dashboard')
            }
          >
            <Text style={styles.navIcon}>⌂</Text>
            <Text style={styles.navText}>
              {t.dashboard}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() =>
              navigation.navigate('Rides')
            }
          >
            <Text style={styles.navIcon}>↗</Text>
            <Text style={styles.navText}>
              {t.rides}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() =>
              navigation.navigate('Earnings')
            }
          >
            <Text style={styles.navIcon}>₹</Text>
            <Text style={styles.navText}>
              {t.earnings}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Text style={styles.activeNavIconText}>
                ◯
              </Text>
            </View>
            <Text style={styles.activeNavText}>
              {t.profile}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.lastInfoRow,
      ]}
    >
      <Text
        style={styles.infoLabel}
        numberOfLines={1}
      >
        {label}
      </Text>

      <Text
        style={styles.infoValue}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function EmptyRow({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
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

  headerTitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
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
    fontSize: 19,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },

  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 110,
  },

  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E8EAF0',
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },

  avatarText: {
    fontSize: 25,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },

  profileHeroInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },

  name: {
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  phone: {
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },

  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  sectionHint: {
    marginTop: 3,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  arrow: {
    fontSize: 28,
    color: COLORS.textSecondary,
    marginRight: 3,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginRight: 10,
  },

  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },

  countBadge: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  documentRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },

  lastDocumentRow: {
    borderBottomWidth: 0,
  },

  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  documentIconText: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  documentInfo: {
    flex: 1,
  },

  documentName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },

  documentStatus: {
    marginTop: 3,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  verifiedBadge: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#E9F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  verifiedText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: '#1E8E4D',
  },

  emptyRow: {
    minHeight: 58,
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  verificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verificationIconText: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  selfie: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    marginVertical: SPACING.md,
  },

  selfieEmpty: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selfieEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF4DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  selfieEmptyIconText: {
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    color: '#B77900',
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
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },

  navText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },

  activeNavIcon: {
    width: 34,
    height: 28,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },

  activeNavIconText: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  activeNavText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
});
