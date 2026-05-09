import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

interface StatusBadgeProps {
  type: 'success' | 'error' | 'loading';
  title: string;
  subtitle?: string;
}

export function StatusBadge({ type, title, subtitle }: StatusBadgeProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15 }),
    ]).start();
  }, []);

  const config = {
    success: {
      bg: COLORS.successBg,
      border: COLORS.success,
      icon: 'checkmark-circle' as const,
      iconColor: COLORS.success,
    },
    error: {
      bg: COLORS.errorBg,
      border: COLORS.error,
      icon: 'alert-circle' as const,
      iconColor: COLORS.error,
    },
    loading: {
      bg: 'rgba(107,92,231,0.1)',
      border: COLORS.accent,
      icon: 'time-outline' as const,
      iconColor: COLORS.accent,
    },
  }[type];

  return (
    <Animated.View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Ionicons name={config.icon} size={22} color={config.iconColor} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: config.iconColor }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  textContainer: { flex: 1 },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
