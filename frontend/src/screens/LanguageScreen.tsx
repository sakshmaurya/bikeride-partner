import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '../components/PrimaryButton';

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../theme/colors';
import { FONT_WEIGHT } from '../theme/fonts';

import {
  LanguageCode,
  LANGUAGE_NAMES,
  useLanguage,
} from '../i18n';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Language'
>;

const languageIds: LanguageCode[] = [
  'en',
  'hi',
  'gu',
  'ta',
  'te',
];

export default function LanguageScreen({
  navigation,
}: Props) {
  /* =====================================================
     GLOBAL LANGUAGE
  ===================================================== */

  const {
    language,
    translations,
    setLanguage,
    loading: languageLoading,
  } = useLanguage();

  /* =====================================================
     LOCAL SELECTION
  ===================================================== */

  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>(language);

  const [saving, setSaving] = useState(false);

  /* =====================================================
     SYNC WITH SAVED LANGUAGE
  ===================================================== */

  useEffect(() => {
    if (!languageLoading) {
      setSelectedLanguage(language);
    }
  }, [language, languageLoading]);

  /* =====================================================
     LANGUAGE SELECT
  ===================================================== */

  const handleSelectLanguage = (
    languageId: LanguageCode,
  ) => {
    setSelectedLanguage(languageId);
  };

  /* =====================================================
     BACK
     Language -> Welcome
  ===================================================== */

  const handleBack = () => {
    navigation.replace('Welcome');
  };

  /* =====================================================
     CONTINUE
  ===================================================== */

  const handleContinue = async () => {
    if (saving || languageLoading) {
      return;
    }

    try {
      setSaving(true);

      // Update AsyncStorage + Global LanguageContext
      await setLanguage(selectedLanguage);

      // Go to Welcome with selected language
      navigation.replace('Welcome');
    } catch (error) {
      console.error(
        'Language change error:',
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  const isDisabled =
    languageLoading || saving;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <View style={styles.screen}>

        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backPressed,
            ]}
            hitSlop={12}
            disabled={saving}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </Pressable>
        </View>

        {/* ================= CONTENT ================= */}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* ================= HEADING ================= */}

          <View style={styles.heading}>
            <Text style={styles.title}>
              {translations.language.title}
            </Text>

            <Text style={styles.subtitle}>
              {translations.language.subtitle}
            </Text>
          </View>

          {/* ================= LANGUAGE LIST ================= */}

          <View style={styles.languageList}>
            {languageIds.map((languageId) => {
              const selected =
                selectedLanguage === languageId;

              return (
                <Pressable
                  key={languageId}
                  onPress={() =>
                    handleSelectLanguage(
                      languageId,
                    )
                  }
                  style={({ pressed }) => [
                    styles.languageRow,
                    pressed &&
                      styles.languagePressed,
                  ]}
                  disabled={isDisabled}
                >

                  {/* ================= RADIO ================= */}

                  <View
                    style={[
                      styles.radio,
                      selected &&
                        styles.radioSelected,
                    ]}
                  >
                    {selected && (
                      <View
                        style={styles.radioDot}
                      />
                    )}
                  </View>

                  {/* ================= LANGUAGE ================= */}

                  <Text
                    style={[
                      styles.languageName,
                      selected &&
                        styles.languageNameSelected,
                    ]}
                  >
                    {LANGUAGE_NAMES[languageId]}
                  </Text>

                </Pressable>
              );
            })}
          </View>

        </ScrollView>

        {/* ================= BOTTOM BUTTON ================= */}

        <View style={styles.bottom}>
          <PrimaryButton
            title={
              saving
                ? translations.common.loading
                : translations.common.continue
            }
            onPress={handleContinue}
            disabled={isDisabled}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* ================= SCREEN ================= */

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /* ================= HEADER ================= */

  header: {
    height: 58,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  backPressed: {
    opacity: 0.5,
  },

  backArrow: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 34,
  },

  /* ================= SCROLL ================= */

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 30,
  },

  /* ================= HEADING ================= */

  heading: {
    marginBottom: 28,
  },

  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: -0.2,
  },

  subtitle: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.regular,
    marginTop: 9,
  },

  /* ================= LANGUAGE LIST ================= */

  languageList: {
    width: '100%',
  },

  languageRow: {
    height: 57,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  languagePressed: {
    opacity: 0.65,
  },

  /* ================= RADIO ================= */

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D9DDE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  radioSelected: {
    borderColor: COLORS.blue,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
  },

  /* ================= LANGUAGE TEXT ================= */

  languageName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.medium,
  },

  languageNameSelected: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.semibold,
  },

  /* ================= BOTTOM ================= */

  bottom: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
});