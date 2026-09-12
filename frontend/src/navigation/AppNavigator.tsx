import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';

// ============================================
// AUTH / ONBOARDING
// ============================================

import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/LanguageScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPScreen from '../screens/OTPScreen';

import PermissionsScreen from '../screens/PermissionsScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import SelfieScreen from '../screens/SelfieScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import VehicleDetailsScreen from '../screens/VehicleDetailsScreen';
import UnderReviewScreen from '../screens/UnderReviewScreen';
import ApprovedScreen from '../screens/ApprovedScreen';

// ============================================
// PARTNER APP
// ============================================

import DashboardScreen from '../screens/DashboardScreen';
import RidesScreen from '../screens/RidesScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* ========================================
            AUTHENTICATION
        ======================================== */}

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="Language"
          component={LanguageScreen}
        />

        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="OTP"
          component={OTPScreen}
        />

        {/* ========================================
            PARTNER ONBOARDING
        ======================================== */}

        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
        />

        <Stack.Screen
          name="ProfileDetails"
          component={ProfileDetailsScreen}
        />

        <Stack.Screen
          name="Documents"
          component={DocumentsScreen}
        />

        <Stack.Screen
          name="Selfie"
          component={SelfieScreen}
        />

        <Stack.Screen
          name="BankDetails"
          component={BankDetailsScreen}
        />

        <Stack.Screen
          name="VehicleDetails"
          component={VehicleDetailsScreen}
        />

        <Stack.Screen
          name="UnderReview"
          component={UnderReviewScreen}
        />

        <Stack.Screen
          name="Approved"
          component={ApprovedScreen}
        />

        {/* ========================================
            PARTNER APP
        ======================================== */}

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />

        <Stack.Screen
          name="Rides"
          component={RidesScreen}
        />

        <Stack.Screen
          name="Earnings"
          component={EarningsScreen}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}