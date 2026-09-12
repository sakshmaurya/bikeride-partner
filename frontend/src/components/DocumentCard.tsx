import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { FONT_SIZE } from '../theme/fonts';
import { RADIUS } from '../theme/dimensions';
import { SPACING } from '../theme/spacing';
import { DocumentData } from '../types/documents';

interface DocumentCardProps {
  document: DocumentData;
  onPress: () => void;
}

export default function DocumentCard({
  document,
  onPress,
}: DocumentCardProps) {
  const uploaded = Boolean(document.uri);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>▣</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {document.title}
        </Text>

        <Text style={styles.subtitle}>
          {document.subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.action,
          uploaded && styles.uploaded,
        ]}
      >
        <Text
          style={[
            styles.actionText,
            uploaded && styles.uploadedText,
          ]}
        >
          {uploaded ? '✓' : 'Upload'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
  },

  pressed: {
    opacity: 0.8,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFF3E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  iconText: {
    color: COLORS.primary,
    fontSize: 20,
  },

  content: {
    flex: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },

  action: {
    minWidth: 62,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },

  actionText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },

  uploaded: {
    backgroundColor: '#DCFCE7',
  },

  uploadedText: {
    color: COLORS.success,
    fontSize: 18,
  },
});