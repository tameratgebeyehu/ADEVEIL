import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { COLORS } from '@/constants/colors';
import { analyzePassword } from '@/services/passwordService';
import type { PasswordStrength } from '@/types/vault.types';

interface PasswordStrengthMeterProps {
  password: string;
}

const STRENGTH_CONFIG: Record<PasswordStrength, { color: string; label: string; bars: number }> = {
  'weak': { color: COLORS.error, label: 'Weak', bars: 1 },
  'fair': { color: COLORS.warning, label: 'Fair', bars: 2 },
  'strong': { color: '#34D399', label: 'Strong', bars: 3 },
  'very-strong': { color: '#10B981', label: 'Very Strong', bars: 4 },
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { strength, feedback } = analyzePassword(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <View style={styles.container}>
      {/* 4-segment bar */}
      <View style={styles.bars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: i <= config.bars ? config.color : COLORS.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Label + feedback */}
      <View style={styles.textRow}>
        <Text style={[styles.strengthLabel, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={styles.feedback}>{feedback}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  bars: {
    flexDirection: 'row',
    gap: SPACING.xs,
    height: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  strengthLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
  },
  feedback: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
});
