import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

interface PrivacyBadgeProps {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'online' | 'offline' | 'protected' | 'info';
}

const VARIANT_COLORS = {
  online: '#22D3EE',
  offline: '#34D399',
  protected: '#A855F7',
  info: '#94A3B8',
};

export function PrivacyBadge({
  label,
  icon,
  variant = 'protected',
}: PrivacyBadgeProps) {
  const { colors } = useThemeContext();
  const color = VARIANT_COLORS[variant];
  const defaultIcon: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    online: 'wifi-outline',
    offline: 'cloud-offline-outline',
    protected: 'shield-checkmark-outline',
    info: 'information-circle-outline',
  };

  return (
    <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Ionicons name={icon ?? defaultIcon[variant]} size={12} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
