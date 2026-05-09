import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

interface StatCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string | number;
  color?: string;
  small?: boolean;
}

export function StatCard({ icon, label, value, color, small }: StatCardProps) {
  const { colors } = useThemeContext();
  const accent = color ?? colors.accent;

  return (
    <View style={[
      styles.card,
      small && styles.cardSmall,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
        <Ionicons name={icon} size={small ? 18 : 22} color={accent} />
      </View>
      <Text style={[styles.value, { color: colors.text, fontSize: small ? FONT_SIZE.xl : FONT_SIZE.xxl }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textMuted, fontSize: small ? 10 : FONT_SIZE.xs }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg,
    alignItems: 'center', gap: SPACING.sm, flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardSmall: { padding: SPACING.md },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: FONTS.bold, letterSpacing: -0.5 },
  label: { fontFamily: FONTS.regular, textAlign: 'center' },
});
