import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { RootStackParamList } from '../types/navigation';
import { FONT_WEIGHT } from '../theme/fonts';
import { getCurrentUserId } from '../utils/session';
import { apiRequest } from '../utils/api';
import { resolvePostAuthRoute } from '../utils/helpers';
import { useLanguage } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

type OnboardingResponse = {
  success?: boolean;
  registrationCompleted?: boolean;
  applicationStatus?: string;
  nextStep?: string;
};

export default function SplashScreen({ navigation }: Props) {
  const { translations } = useLanguage();
  const t = translations.splash;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userId = await getCurrentUserId();

        if (!userId) {
          setTimeout(() => {
            navigation.replace('Language');
          }, 1800);
          return;
        }

        const { status, data } = await apiRequest<OnboardingResponse>(
          `/onboarding/${userId}`,
        );

        if (status >= 200 && status < 300 && data.success) {
          navigation.replace(
            resolvePostAuthRoute({
              registrationCompleted: data.registrationCompleted,
              applicationStatus: data.applicationStatus,
              nextStep: data.nextStep,
            }),
          );
          return;
        }

        navigation.replace('Language');
      } catch (error) {
        console.error('Session check error:', error);
        setTimeout(() => {
          navigation.replace('Language');
        }, 1800);
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.logoSection,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        <View style={styles.scooterWrapper}>
          <Text style={styles.scooter}>🛵</Text>
        </View>

        <Text style={styles.logoTitle}>{t.bikeride}</Text>
        <Text style={styles.partner}>{t.partner}</Text>
      </Animated.View>

      <View style={styles.loadingSection}>
        <ActivityIndicator size="small" color="#F5C400" />
        <Text style={styles.loadingText}>{t.checkingSession}</Text>
      </View>

      <View style={styles.city}>
        <View style={[styles.building, styles.b1]} />
        <View style={[styles.building, styles.b2]} />
        <View style={[styles.building, styles.b3]} />
        <View style={[styles.building, styles.b4]} />
        <View style={[styles.building, styles.b5]} />
        <View style={[styles.building, styles.b6]} />
        <View style={[styles.building, styles.b7]} />
        <View style={[styles.building, styles.b8]} />
        <View style={[styles.building, styles.b9]} />
        <View style={[styles.building, styles.b10]} />
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06245F',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35,
  },
  scooterWrapper: {
    width: 110,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scooter: {
    fontSize: 58,
  },
  logoTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: FONT_WEIGHT.extraBold,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  partner: {
    color: '#F5C400',
    fontSize: 16,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 1,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 8,
    opacity: 0.95,
  },
  city: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    opacity: 0.18,
  },
  building: {
    width: 28,
    backgroundColor: '#0A367F',
    marginHorizontal: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  b1: { height: 30 },
  b2: { height: 48 },
  b3: { height: 36 },
  b4: { height: 63 },
  b5: { height: 42 },
  b6: { height: 70 },
  b7: { height: 50 },
  b8: { height: 62 },
  b9: { height: 40 },
  b10: { height: 55 },
  version: {
    position: 'absolute',
    bottom: 18,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FONT_WEIGHT.medium,
    opacity: 0.8,
  },
});
