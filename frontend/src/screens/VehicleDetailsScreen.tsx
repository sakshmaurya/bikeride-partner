import { File as ExpoFile } from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import CustomInput from '../components/CustomInput';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { isRequired } from '../utils/validation';
import { API_BASE_URL } from '../constants/api';
import { getCurrentUserId } from '../utils/session';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'VehicleDetails'
>;

export default function VehicleDetailsScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.vehicle;

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bikePhoto, setBikePhoto] = useState<string | null>(null);

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load existing vehicle details
  useEffect(() => {
    const loadVehicleDetails = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          setInitialLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/vehicle/${userId}`);
        const data = await response.json();

        if (response.ok && data.success && data.vehicleDetails) {
          const vehicle = data.vehicleDetails;
          setVehicleNumber(vehicle.registration_number || '');
          setVehicleType(vehicle.vehicle_type || '');
          setBikeModel(vehicle.vehicle_model || '');
          setModelYear(vehicle.vehicle_year || '');
          setVehicleColor(vehicle.vehicle_color || '');
          setLicenseNumber(vehicle.license_number || '');
          if (vehicle.vehicle_image_uri) {
            setBikePhoto(vehicle.vehicle_image_uri);
          }
        }
      } catch (error) {
        console.error('Error loading vehicle details:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadVehicleDetails();
  }, []);

  /* ================= VEHICLE NUMBER ================= */

  const isValidVehicleNumber = (value: string): boolean => {
    const cleaned = value
      .trim()
      .toUpperCase()
      .replace(/\s/g, '');

    return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(
      cleaned,
    );
  };

  /* ================= LICENCE ================= */

  const isValidLicenseNumber = (value: string): boolean => {
    const cleaned = value
      .trim()
      .toUpperCase()
      .replace(/\s/g, '');

    return /^[A-Z]{2}[0-9]{2}[0-9A-Z]{10,16}$/.test(
      cleaned,
    );
  };

  /* ================= MODEL YEAR ================= */

  const isValidModelYear = (value: string): boolean => {
    const year = Number(value);
    const currentYear = new Date().getFullYear();

    return (
      /^\d{4}$/.test(value) &&
      year >= 1990 &&
      year <= currentYear
    );
  };

  /* ================= VALIDATION ================= */

  const vehicleNumberValid =
    isValidVehicleNumber(vehicleNumber);

  const licenseValid =
    isValidLicenseNumber(licenseNumber);

  const modelYearValid =
    isValidModelYear(modelYear);

  const formValid =
    vehicleNumberValid &&
    isRequired(vehicleType) &&
    isRequired(bikeModel) &&
    modelYearValid &&
    isRequired(vehicleColor) &&
    licenseValid &&
    !!bikePhoto;

  /* ================= VEHICLE NUMBER ================= */

  const handleVehicleNumberChange = (text: string) => {
    const cleaned = text
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10);

    setVehicleNumber(cleaned);
  };

  /* ================= MODEL YEAR ================= */

  const handleModelYearChange = (text: string) => {
    const cleaned = text
      .replace(/[^0-9]/g, '')
      .slice(0, 4);

    setModelYear(cleaned);
  };

  /* ================= LICENCE ================= */

  const handleLicenseChange = (text: string) => {
    const cleaned = text
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 20);

    setLicenseNumber(cleaned);
  };

  /* ================= PHOTO ================= */

  const pickBikePhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      setBikePhoto(result.assets[0].uri);
    }
  };

  /* ================= CONTINUE ================= */

  const handleContinue = async () => {
  setTouched(true);

  if (!formValid || !bikePhoto || loading) {
    return;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    console.log('❌ Vehicle upload: User ID not found');
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    formData.append('vehicleNumber', vehicleNumber);
    formData.append('vehicleType', vehicleType);
    formData.append('bikeModel', bikeModel);
    formData.append('modelYear', modelYear);
    formData.append('vehicleColor', vehicleColor);
    formData.append('licenseNumber', licenseNumber);

    const fileName =
      bikePhoto.split('/').pop() || 'vehicle.jpg';

    const extension =
      fileName.split('.').pop()?.toLowerCase() || 'jpg';

    const mimeType =
      extension === 'png'
        ? 'image/png'
        : 'image/jpeg';

    const vehicleFile = new ExpoFile(bikePhoto);

    formData.append('vehicleImage', vehicleFile);

    console.log('📤 Uploading vehicle details...');
    console.log('👤 User ID:', userId);

    const response = await fetch(
      `${API_BASE_URL.replace('/api', '')}/api/vehicle/${userId}`,
      {
        method: 'PUT',
        body: formData,
      },
    );

    const data = await response.json();

    console.log('📥 Vehicle response:', data);

    if (!response.ok || !data.success) {
      console.log(
        '❌ Vehicle upload failed:',
        data.message,
      );
      return;
    }

    console.log('✅ Vehicle details uploaded successfully');

    // Mark registration as completed by calling onboarding endpoint
    try {
      const onboardingResponse = await fetch(`${API_BASE_URL}/onboarding/${userId}`);
      const onboardingData = await onboardingResponse.json();

      if (onboardingResponse.ok && onboardingData.success) {
        console.log('✅ Registration marked as completed');
      }
    } catch (error) {
      console.log('⚠️ Could not mark registration as completed:', error);
    }

    // After successful save, check if user is in onboarding or editing
    try {
      const onboardingResponse = await fetch(`${API_BASE_URL}/onboarding/${userId}`);
      const onboardingData = await onboardingResponse.json();

      if (onboardingResponse.ok && onboardingData.success) {
        if (onboardingData.registrationCompleted) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('UnderReview');
        }
      } else {
        navigation.replace('UnderReview');
      }
    } catch (error) {
      console.log('⚠️ Could not check onboarding status:', error);
      navigation.replace('UnderReview');
    }
  } catch (error) {
    console.log(
      '❌ Vehicle upload error:',
      error,
    );
  } finally {
    setLoading(false);
  }
};

  /* ================= ERRORS ================= */

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title={t.title}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.saving}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const vehicleNumberError =
    touched && !vehicleNumberValid
      ? t.vehicleNumberError
      : undefined;

  const vehicleTypeError =
    touched && !isRequired(vehicleType)
      ? t.vehicleTypeError
      : undefined;

  const bikeModelError =
    touched && !isRequired(bikeModel)
      ? t.bikeModelError
      : undefined;

  const modelYearError =
    touched && !modelYearValid
      ? t.modelYearError
      : undefined;

  const vehicleColorError =
    touched && !isRequired(vehicleColor)
      ? t.vehicleColorError
      : undefined;

  const licenseError =
    touched && !licenseValid
      ? t.licenseError
      : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t.title}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ================= HEADER ================= */}

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🏍️</Text>
            </View>

            <Text style={styles.title}>
              {t.subtitle}
            </Text>

            <Text style={styles.description}>
              {t.description}
            </Text>
          </View>

          {/* ================= INFO CARD ================= */}

          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>✓</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {t.vehicle}
              </Text>

              <Text style={styles.infoText}>
                {t.note}
              </Text>
            </View>
          </View>

          {/* ================= BIKE PHOTO ================= */}

          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>
              {t.vehiclePhoto}
            </Text>

            <Pressable
              onPress={pickBikePhoto}
              style={({ pressed }) => [
                styles.photoBox,
                pressed && styles.photoPressed,
              ]}
            >
              {bikePhoto ? (
                <>
                  <Image
                    source={{ uri: bikePhoto }}
                    style={styles.photo}
                  />

                  <View style={styles.changePhoto}>
                    <Text style={styles.changePhotoText}>
                      {t.chooseFromGallery}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.uploadIconCircle}>
                    <Text style={styles.uploadIcon}>
                      ↑
                    </Text>
                  </View>

                  <Text style={styles.uploadTitle}>
                    {t.takePhoto}
                  </Text>

                  <Text style={styles.uploadText}>
                    {t.chooseFromGallery}
                  </Text>

                  <Text style={styles.uploadHint}>
                    JPG or PNG
                  </Text>
                </>
              )}
            </Pressable>

            {touched && !bikePhoto && (
              <Text style={styles.photoError}>
                {t.photoRequired}
              </Text>
            )}
          </View>

          {/* ================= FORM ================= */}

          <View style={styles.form}>

            {/* Vehicle Number */}

            <CustomInput
              label={t.vehicleNumber}
              placeholder={t.enterVehicleNumber}
              value={vehicleNumber}
              onChangeText={handleVehicleNumberChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
              returnKeyType="next"
              error={vehicleNumberError}
            />

            <View style={styles.counterRow}>
              <Text style={styles.counter}>
                {vehicleNumber.length}/10
              </Text>
            </View>

            {/* Vehicle Type */}

            <CustomInput
              label={t.vehicleType}
              placeholder={t.enterVehicleType}
              value={vehicleType}
              onChangeText={setVehicleType}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              error={vehicleTypeError}
            />

            {/* Bike Model */}

            <CustomInput
              label={t.bikeModel}
              placeholder={t.enterBikeModel}
              value={bikeModel}
              onChangeText={setBikeModel}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              error={bikeModelError}
            />

            {/* Model Year */}

            <CustomInput
              label={t.modelYear}
              placeholder={t.enterModelYear}
              value={modelYear}
              onChangeText={handleModelYearChange}
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="next"
              error={modelYearError}
            />

            {/* Vehicle Color */}

            <CustomInput
              label={t.vehicleColor}
              placeholder={t.enterVehicleColor}
              value={vehicleColor}
              onChangeText={setVehicleColor}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              error={vehicleColorError}
            />

            {/* Driving Licence */}

            <CustomInput
              label={t.licenseNumber}
              placeholder={t.enterLicenseNumber}
              value={licenseNumber}
              onChangeText={handleLicenseChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="done"
              error={licenseError}
            />

            <Text style={styles.helper}>
              {t.licenseHelper}
            </Text>

          </View>

          {/* ================= CONTINUE ================= */}

          <View style={styles.bottom}>
            <PrimaryButton
              title={loading ? t.saving : t.continue}
              onPress={handleContinue}
              disabled={!formValid || loading}
              loading={loading}
            />

            <Text style={styles.note}>
              {t.note}
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================================================= */
/* STYLES */
/* ================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  header: {
    alignItems: 'center',
    marginTop: 12,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  icon: {
    fontSize: 34,
  },

  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: FONT_WEIGHT.extraBold,
    textAlign: 'center',
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 340,
  },

  /* ================= INFO ================= */

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIcon: {
    color: COLORS.white,
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
    lineHeight: 16,
    marginTop: 3,
  },

  /* ================= PHOTO ================= */

  photoSection: {
    marginTop: 24,
  },

  sectionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 8,
  },

  photoBox: {
    width: '100%',
    height: 170,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    backgroundColor: COLORS.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  photoPressed: {
    opacity: 0.75,
  },

  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  uploadIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  uploadIcon: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '700',
  },

  uploadTitle: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.bold,
  },

  uploadText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  uploadHint: {
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 5,
  },

  changePhoto: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },

  changePhotoText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },

  photoError: {
    color: COLORS.error,
    fontSize: 10,
    marginTop: 5,
  },

  /* ================= FORM ================= */

  form: {
    marginTop: 24,
  },

  counterRow: {
    alignItems: 'flex-end',
    marginTop: -10,
    marginBottom: 6,
  },

  counter: {
    color: COLORS.textLight,
    fontSize: 10,
  },

  helper: {
    color: COLORS.textLight,
    fontSize: 10,
    lineHeight: 16,
    marginTop: -8,
    marginBottom: 8,
  },

  /* ================= BOTTOM ================= */

  bottom: {
    marginTop: 18,
  },

  note: {
    color: COLORS.textLight,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 15,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },

});
