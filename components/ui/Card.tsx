import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/colors';
import { RADIUS, SPACING } from '@/constants/spacing';
import { useThemeContext } from '@/theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glass';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { isDark } = useThemeContext();

  const bgMap = {
    default: isDark ? COLORS.surface : COLORS.light.surface,
    elevated: isDark ? COLORS.surface2 : COLORS.light.surface2,
    glass: isDark ? COLORS.glass : COLORS.light.glass,
  };

  const borderMap = {
    default: isDark ? COLORS.border : COLORS.light.border,
    elevated: isDark ? COLORS.borderLight : COLORS.light.borderLight,
    glass: isDark ? COLORS.borderLight : COLORS.light.borderLight,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgMap[variant],
          borderColor: borderMap[variant],
        },
        variant === 'elevated' && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
