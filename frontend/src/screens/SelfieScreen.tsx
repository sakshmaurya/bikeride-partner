import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';
import { API_BASE_URL } from '../constants/api';
import { getCurrentUserId } from '../utils/session';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Selfie'
>;

export default function SelfieScreen({
  navigation,
}: Props) {
  const { translations } = useLanguage();
  const t = translations.selfie;

  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [photoUri, setPhotoUri] = useState<string | null>(
    null,
  );

  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!permission) {
      return;
    }

    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const takeSelfie = async () => {
    if (!cameraRef.current || capturing || uploading) {
      return;
    }

    try {
      setCapturing(true);

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } catch (error) {
      console.log('Selfie capture error:', error);

      Alert.alert(
        t.cameraError,
        t.cameraErrorDesc,
      );
    } finally {
      setCapturing(false);
    }
  };

  const retakeSelfie = () => {
    if (uploading) {
      return;
    }

    setPhotoUri(null);
  };

  const uploadSelfie = async () => {
    if (!photoUri) {
      Alert.alert(
        t.selfieRequired,
        t.selfieRequiredDesc,
      );
      return;
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      Alert.alert(
        translations.common.sessionExpired,
        translations.common.loginAgain,
      );
      return;
    }

    try {
      setUploading(true);

      const fileName =
        photoUri.split('/').pop() ||
        `selfie-${Date.now()}.jpg`;

      const extension =
        fileName.split('.').pop()?.toLowerCase() || 'jpg';

      const mimeType =
        extension === 'png'
          ? 'image/png'
          : extension === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

      const formData = new FormData();

      const selfieFile = new File(photoUri);

      formData.append('selfie', selfieFile);

      const url = `${API_BASE_URL.replace(
        /\/api$/,
        '',
      )}/api/users/${userId}`;

      console.log('');
      console.log('========================================');
      console.log('📸 Uploading selfie...');
      console.log('========================================');
      console.log('👤 User ID:', userId);
      console.log('📁 File:', fileName);
      console.log('🔗 URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      console.log('📥 Selfie upload response:', data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to upload selfie',
        );
      }

      console.log('✅ Selfie uploaded successfully');
      console.log('🔗 Saved URL:', data.user?.selfie_uri);

      Alert.alert(
        t.uploaded,
        t.selfieUploadedSuccess,
        [
          {
            text: translations.common.continue,
            onPress: async () => {
              // Check if user is in onboarding or editing
              const userId = await getCurrentUserId();
              if (userId) {
                try {
                  const response = await fetch(`${API_BASE_URL}/onboarding/${userId}`);
                  const data = await response.json();
                  if (data.success && data.registrationCompleted) {
                    navigation.replace('Dashboard');
                  } else {
                    navigation.replace('BankDetails');
                  }
                } catch {
                  navigation.replace('BankDetails');
                }
              } else {
                navigation.replace('BankDetails');
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error(
        '❌ Selfie upload error:',
        error,
      );

      Alert.alert(
        t.uploadError,
        error?.message || t.uploadErrorDesc,
      );
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (!photoUri) {
      Alert.alert(
        t.selfieRequired,
        t.selfieRequiredDesc,
      );
      return;
    }

    uploadSelfie();
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Preparing camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="Selfie Verification"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionEmoji}>
              📷
            </Text>
          </View>

          <Text style={styles.permissionTitle}>
            Camera permission required
          </Text>

          <Text style={styles.permissionDescription}>
            We need access to your camera to take a selfie
            for identity verification.
          </Text>

          {permission.canAskAgain ? (
            <PrimaryButton
              title="Allow Camera"
              onPress={requestPermission}
            />
          ) : (
            <Text style={styles.settingsText}>
              Please enable camera permission from your
              device settings.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Selfie Verification"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Take a selfie
        </Text>

        <Text style={styles.description}>
          Position your face inside the circle and make
          sure you have good lighting.
        </Text>

        {/* Camera / Preview */}
        <View style={styles.cameraWrapper}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.camera}
              resizeMode="cover"
            />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="picture"
            />
          )}

          {/* Face guide */}
          {!photoUri && (
            <View style={styles.overlay}>
              <View style={styles.faceGuide} />
            </View>
          )}
        </View>

        {!photoUri ? (
          <>
            <Text style={styles.instruction}>
              Keep your face clearly visible
            </Text>

            <Pressable
              onPress={takeSelfie}
              disabled={capturing || uploading}
              style={({ pressed }) => [
                styles.captureButton,
                pressed && styles.capturePressed,
                (capturing || uploading) &&
                  styles.captureDisabled,
              ]}
            >
              <View style={styles.captureInner}>
                {capturing ? (
                  <ActivityIndicator
                    color={COLORS.primary}
                  />
                ) : (
                  <View style={styles.cameraIcon}>
                    <Text style={styles.cameraIconText}>
                      📷
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>

            <Text style={styles.captureText}>
              Tap to take selfie
            </Text>
          </>
        ) : (
          <View style={styles.previewSection}>
            <View style={styles.successRow}>
              <View style={styles.successCircle}>
                <Text style={styles.successCheck}>
                  ✓
                </Text>
              </View>

              <View>
                <Text style={styles.successTitle}>
                  Selfie captured
                </Text>

                <Text style={styles.successText}>
                  Make sure your face is clearly visible.
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={retakeSelfie}
                disabled={uploading}
                style={[
                  styles.retakeButton,
                  uploading &&
                    styles.retakeButtonDisabled,
                ]}
              >
                <Text style={styles.retakeText}>
                  Retake
                </Text>
              </Pressable>

              <View style={styles.continueButton}>
                {uploading ? (
                  <View style={styles.uploadingButton}>
                    <ActivityIndicator
                      color={COLORS.white}
                    />

                    <Text style={styles.uploadingText}>
                      Uploading...
                    </Text>
                  </View>
                ) : (
                  <PrimaryButton
                    title="Continue"
                    onPress={handleContinue}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.md,
  },

  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extraBold,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: 340,
  },

  cameraWrapper: {
    width: '100%',
    aspectRatio: 0.78,
    maxHeight: 430,
    marginTop: SPACING.xxl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.text,
  },

  camera: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  faceGuide: {
    width: 210,
    height: 270,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 110,
    backgroundColor: 'transparent',
  },

  instruction: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    borderWidth: 5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },

  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIconText: {
    fontSize: 25,
  },

  capturePressed: {
    transform: [{ scale: 0.94 }],
  },

  captureDisabled: {
    opacity: 0.6,
  },

  captureText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm,
  },

  previewSection: {
    width: '100%',
    marginTop: SPACING.lg,
  },

  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  successCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  successCheck: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: FONT_WEIGHT.bold,
  },

  successTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  successText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },

  retakeButton: {
    height: 52,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  retakeButtonDisabled: {
    opacity: 0.5,
  },

  retakeText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  continueButton: {
    flex: 1,
  },

  uploadingButton: {
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  uploadingText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
  },

  permissionContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },

  permissionEmoji: {
    fontSize: 42,
  },

  permissionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extraBold,
    textAlign: 'center',
  },

  permissionDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },

  settingsText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    textAlign: 'center',
  },
});