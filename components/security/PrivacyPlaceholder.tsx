import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { SPACING } from '@/constants/spacing';

/**
 * PrivacyPlaceholder — branded overlay shown in App Switcher.
 * Keeps app previews completely safe from shoulder surfing / caching.
 */
export function PrivacyPlaceholder() {
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      {/* Dark gradient base */}
      <LinearGradient
        colors={[colors.bg, colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          <Ionicons name="lock-closed" size={48} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>ADEVeil</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Content hidden for privacy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Ensure it sits above absolutely everything
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xxl,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.md,
  },
});
