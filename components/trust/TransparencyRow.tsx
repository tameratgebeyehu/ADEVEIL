import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

interface TransparencyRowProps {
  label: string;
  status: string;
  positive?: boolean;
}

export function TransparencyRow({ label, status, positive = true }: TransparencyRowProps) {
  const { colors } = useThemeContext();
  const chipColor = positive ? '#34D399' : '#F87171';

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.chip, { backgroundColor: chipColor + '20', borderColor: chipColor + '60' }]}>
        <Text style={[styles.status, { color: chipColor }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  label: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
  chip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  status: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
