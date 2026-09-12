import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';
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
  vehicle_image_uri?: string;
};

type Bank = {
  bank_account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
};

type Document = {
  document_type: string;
  document_uri?: string;
  status?: string;
};

export default function ProfileScreen({
  navigation,
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);
  const [bank, setBank] =
    useState<Bank | null>(null);
  const [documents, setDocuments] =
    useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const loadProfile = useCallback(
    async (showLoader = true) => {
      const userId = await getCurrentUserId();

      if (!userId) {
        console.log(
          '❌ Profile: User ID not found',
        );

        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        console.log(
          '👤 Loading profile for user:',
          userId,
        );

        const [
          userResponse,
          vehicleResponse,
          bankResponse,
          documentsResponse,
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/users/${userId}`,
          ),
          fetch(
            `${API_BASE_URL}/vehicle/${userId}`,
          ),
          fetch(
            `${API_BASE_URL}/bank/${userId}`,
          ),
          fetch(
            `${API_BASE_URL}/documents/${userId}`,
          ),
        ]);

        const userData =
          await userResponse.json();

        const vehicleData =
          await vehicleResponse.json();

        const bankData =
          await bankResponse.json();

        const documentsData =
          await documentsResponse.json();

        console.log(
          '👤 User API Response:',
          JSON.stringify(userData, null, 2),
        );

        console.log(
          '🏍️ Vehicle API Response:',
          JSON.stringify(
            vehicleData,
            null,
            2,
          ),
        );

        console.log(
          '🏦 Bank API Response:',
          JSON.stringify(
            bankData,
            null,
            2,
          ),
        );

        console.log(
          '📄 Documents API Response:',
          JSON.stringify(
            documentsData,
            null,
            2,
          ),
        );

        // -----------------------------
        // USER
        // -----------------------------

        if (
          userResponse.ok &&
          userData.success
        ) {
          /*
           * Backend may return:
           *
           * {
           *   success: true,
           *   user: {...}
           * }
           *
           * OR
           *
           * {
           *   success: true,
           *   data: {...}
           * }
           */

          const apiUser =
            userData.user ||
            userData.data ||
            userData;

          setUser({
            id:
              apiUser.id ??
              Number(userId),

            phone_number:
              apiUser.phone_number ??
              apiUser.phoneNumber ??
              '',

            language:
              apiUser.language ??
              'English',

            name:
              apiUser.name ??
              apiUser.full_name ??
              apiUser.fullName ??
              '',

            email:
              apiUser.email ??
              '',

            selfie_uri:
              apiUser.selfie_uri ??
              apiUser.selfieUri ??
              '',

            application_status:
              apiUser.application_status ??
              apiUser.applicationStatus ??
              'new',
          });
        } else {
          console.log(
            '❌ User API failed:',
            userData,
          );
        }

        // -----------------------------
        // VEHICLE
        // -----------------------------

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

        // -----------------------------
        // BANK
        // -----------------------------

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

        // -----------------------------
        // DOCUMENTS
        // -----------------------------

        if (
          documentsResponse.ok &&
          documentsData.success
        ) {
          setDocuments(
            documentsData.documents || [],
          );
        }
      } catch (error) {
        console.log(
          '❌ Profile loading error:',
          error,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile(false);
  };

  const maskAccountNumber = (
    accountNumber?: string,
  ) => {
    if (!accountNumber) {
      return 'Not added';
    }

    if (accountNumber.length <= 4) {
      return accountNumber;
    }

    return `•••• •••• ${accountNumber.slice(
      -4,
    )}`;
  };

  const formatStatus = (
    status?: string,
  ) => {
    if (!status) {
      return 'Not available';
    }

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char =>
        char.toUpperCase(),
      );
  };

  const getInitials = (
    name?: string,
  ) => {
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
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text
            style={styles.loadingText}
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    user?.name?.trim() || 'Partner';

  const displayEmail =
    user?.email?.trim() || 'Not added';

  const displayPhone =
    user?.phone_number ||
    user?.phoneNumber ||
    'Phone not available';

  const displayLanguage =
    user?.language || 'English';

  const displaySelfie =
    user?.selfie_uri ||
    user?.selfieUri;

  const displayStatus =
    user?.application_status ||
    user?.applicationStatus;

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Profile */}

        <View
          style={styles.profileSection}
        >
          {displaySelfie ? (
            <Image
              source={{
                uri: displaySelfie,
              }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text
                style={styles.avatarText}
              >
                {getInitials(
                  user?.name,
                )}
              </Text>
            </View>
          )}

          <Text style={styles.name}>
            {displayName}
          </Text>

          <Text style={styles.phone}>
            {displayPhone}
          </Text>

          <View
            style={styles.statusBadge}
          >
            <Text
              style={styles.statusText}
            >
              {formatStatus(
                displayStatus,
              )}
            </Text>
          </View>
        </View>

        {/* Personal Information */}

        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
          >
            Personal Information
          </Text>

          <InfoRow
            label="Name"
            value={displayName}
          />

          <InfoRow
            label="Phone"
            value={displayPhone}
          />

          <InfoRow
            label="Email"
            value={displayEmail}
          />

          <InfoRow
            label="Language"
            value={displayLanguage}
          />
        </View>

        {/* Vehicle */}

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              'VehicleDetails',
            )
          }
        >
          <View
            style={styles.cardHeader}
          >
            <Text
              style={styles.cardTitle}
            >
              Vehicle
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </View>

          {vehicle ? (
            <>
              <InfoRow
                label="Type"
                value={
                  vehicle.vehicle_type ||
                  'Not available'
                }
              />

              <InfoRow
                label="Model"
                value={
                  vehicle.vehicle_model ||
                  'Not available'
                }
              />

              <InfoRow
                label="Year"
                value={
                  vehicle.vehicle_year ||
                  'Not available'
                }
              />

              <InfoRow
                label="Color"
                value={
                  vehicle.vehicle_color ||
                  'Not available'
                }
              />

              <InfoRow
                label="Registration"
                value={
                  vehicle.registration_number ||
                  'Not available'
                }
              />

              <InfoRow
                label="Driving Licence"
                value={
                  vehicle.license_number ||
                  'Not available'
                }
              />
            </>
          ) : (
            <Text
              style={styles.emptyText}
            >
              Vehicle details not available
            </Text>
          )}
        </TouchableOpacity>

        {/* Bank Account */}

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              'BankDetails',
            )
          }
        >
          <View
            style={styles.cardHeader}
          >
            <Text
              style={styles.cardTitle}
            >
              Bank Account
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </View>

          {bank ? (
            <>
              <InfoRow
                label="Account Holder"
                value={
                  bank.bank_account_name ||
                  'Not available'
                }
              />

              <InfoRow
                label="Account Number"
                value={maskAccountNumber(
                  bank.account_number,
                )}
              />

              <InfoRow
                label="IFSC"
                value={
                  bank.ifsc_code ||
                  'Not available'
                }
              />

              <InfoRow
                label="Bank Name"
                value={
                  bank.bank_name ||
                  'Not available'
                }
              />
            </>
          ) : (
            <Text
              style={styles.emptyText}
            >
              Bank account not available
            </Text>
          )}
        </TouchableOpacity>

        {/* Documents */}

        <View style={styles.card}>
          <View
            style={styles.cardHeader}
          >
            <Text
              style={styles.cardTitle}
            >
              Documents
            </Text>

            <Text
              style={
                styles.documentCount
              }
            >
              {documents.length} uploaded
            </Text>
          </View>

          {documents.length > 0 ? (
            documents.map(document => (
              <View
                key={
                  document.document_type
                }
                style={
                  styles.documentRow
                }
              >
                <View
                  style={
                    styles.documentIcon
                  }
                >
                  <Text
                    style={styles.iconText}
                  >
                    📄
                  </Text>
                </View>

                <View
                  style={
                    styles.documentInfo
                  }
                >
                  <Text
                    style={
                      styles.documentName
                    }
                  >
                    {formatStatus(
                      document.document_type,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.documentStatus
                    }
                  >
                    {formatStatus(
                      document.status,
                    )}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text
              style={styles.emptyText}
            >
              No documents found
            </Text>
          )}
        </View>

        {/* Selfie */}

        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
          >
            Profile Verification
          </Text>

          {displaySelfie ? (
            <Image
              source={{
                uri: displaySelfie,
              }}
              style={styles.selfie}
            />
          ) : (
            <Text
              style={styles.emptyText}
            >
              Selfie not uploaded
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 36,
    color: COLORS.text,
    lineHeight: 40,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  headerSpacer: {
    width: 40,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },

  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: SPACING.md,
  },

  avatarText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },

  name: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  phone: {
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  statusBadge: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.lg,
    backgroundColor:
      COLORS.primaryLight,
  },

  statusText: {
    fontSize: FONT_SIZE.sm,
    fontWeight:
      FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  arrow: {
    fontSize: 28,
    color: COLORS.textSecondary,
  },

  documentCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight:
      FONT_WEIGHT.semibold,
  },

  infoRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    borderBottomWidth: 1,
    borderBottomColor:
      '#EEEEEE',
  },

  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: FONT_SIZE.sm,
    fontWeight:
      FONT_WEIGHT.semibold,
    color: COLORS.text,
  },

  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    paddingVertical: SPACING.sm,
  },

  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  documentIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor:
      COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },

  iconText: {
    fontSize: 20,
  },

  documentInfo: {
    flex: 1,
  },

  documentName: {
    fontSize: FONT_SIZE.sm,
    fontWeight:
      FONT_WEIGHT.semibold,
    color: COLORS.text,
  },

  documentStatus: {
    marginTop: 3,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  selfie: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
});