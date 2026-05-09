import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';

interface Props {
  content: string;
  onHide: () => void;
}

/**
 * ViewOnceViewer — extreme privacy mode.
 * Shows decrypted content until hidden, then it's gone permanently.
 * Does not support copying — strictly read-only.
 */
export function ViewOnceViewer({ content, onHide }: Props) {
  const { colors } = useThemeContext();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.error }]}
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Ionicons name="eye-outline" size={16} color={colors.error} />
          <Text style={[styles.badgeText, { color: colors.error }]}>View Once Mode</Text>
        </View>
        <Text style={[styles.subText, { color: colors.textMuted }]}>
          Message will be permanently wiped when closed.
        </Text>
      </View>

      <View style={[styles.contentBox, { backgroundColor: colors.bg }]}>
        <Text selectable={false} style={[styles.text, { color: colors.text }]}>
          {content}
        </Text>
      </View>

      <Pressable 
        style={[styles.hideBtn, { backgroundColor: colors.errorBg }]}
        onPress={() => {
          haptics.medium();
          onHide();
        }}
      >
        <Ionicons name="trash-bin-outline" size={20} color={colors.error} />
        <Text style={[styles.hideBtnText, { color: colors.error }]}>Wipe & Close</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
  contentBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 100,
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  hideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
  },
  hideBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
});
