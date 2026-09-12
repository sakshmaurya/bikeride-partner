import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { FONT_SIZE } from '../theme/fonts';
import { SPACING } from '../theme/spacing';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightText?: string;
  onRightPress?: () => void;
}

export default function ScreenHeader({
  title,
  onBack,
  rightText,
  onRightPress,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.right]}>
        {rightText ? (
          <Pressable onPress={onRightPress}>
            <Text style={styles.rightText}>
              {rightText}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },

  side: {
    width: 40,
    justifyContent: 'center',
  },

  right: {
    alignItems: 'flex-end',
  },

  back: {
    fontSize: 36,
    lineHeight: 36,
    color: COLORS.text,
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },

  rightText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
});