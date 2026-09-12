import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

export default function PermissionsScreen({ navigation }: Props) {
  const { translations } = useLanguage();
  const t = translations.permissions;
  const errorMessages = translations.errors;

  const [loading, setLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [storageGranted, setStorageGranted] = useState(false);

  const requestPermissions = async () => {
    try {
      setLoading(true);

      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const galleryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      let locationOk = false;
      try {
        const Location = await import('expo-location');
        const locationPermission =
          await Location.requestForegroundPermissionsAsync();
        locationOk = locationPermission.status === 'granted';
      } catch {
        locationOk = true;
      }

      setCameraGranted(cameraPermission.status === 'granted');
      setStorageGranted(galleryPermission.status === 'granted');
      setLocationGranted(locationOk);

      if (
        cameraPermission.status !== 'granted' ||
        galleryPermission.status !== 'granted'
      ) {
        Alert.alert(t.title, t.permissionsRequired);
        return;
      }

      navigation.replace('ProfileDetails');
    } catch (error) {
      console.log('Permission error:', error);
      Alert.alert(errorMessages.somethingWrong, t.unableRequestPermissions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t.title}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.subtitle}</Text>
        <Text style={styles.description}>{t.description}</Text>

        <View style={styles.permissionList}>
          <PermissionRow
            icon="📍"
            title={t.location.title}
            description={t.location.description}
            granted={locationGranted}
          />
          <PermissionRow
            icon="📷"
            title={t.camera.title}
            description={t.camera.description}
            granted={cameraGranted}
          />
          <PermissionRow
            icon="🗂️"
            title={t.storage.title}
            description={t.storage.description}
            granted={storageGranted}
          />
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={translations.common.continue}
            onPress={requestPermissions}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PermissionRow({
  icon,
  title,
  description,
  granted,
}: {
  icon: string;
  title: string;
  description: string;
  granted: boolean;
}) {
  return (
    <View style={styles.permissionCard}>
      <View style={styles.permissionIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.permissionContent}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionText}>{description}</Text>
      </View>
      {granted ? <Text style={styles.check}>✓</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.xxl,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: FONT_WEIGHT.extraBold,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 21,
    marginTop: SPACING.md,
  },
  permissionList: {
    marginTop: 28,
    gap: SPACING.md,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  permissionIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  permissionText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    lineHeight: 19,
    marginTop: 3,
  },
  check: {
    color: COLORS.success,
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: 8,
  },
  bottom: {
    marginTop: 'auto',
    paddingTop: 32,
  },
});
