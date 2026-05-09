import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAppLockStore } from '@/store/appLockStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useVaultStore } from '@/store/vaultStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';

export type SecurityLevel = 'basic' | 'good' | 'strong' | 'maximum';

interface ScoreResult {
  score: number;
  level: SecurityLevel;
  label: string;
  color: string;
  breakdown: { label: string; earned: boolean; points: number }[];
}

export function computeSecurityScore(opts: {
  isPinSet: boolean;
  biometricEnabled: boolean;
  autoClearClipboard: boolean;
  privacyBlur: boolean;
  lockTimeout: number;
  decoyPinEnabled: boolean;
  vaultItemCount: number;
}): ScoreResult {
  const checks = [
    { label: 'PIN Lock enabled', earned: opts.isPinSet, points: 25 },
    { label: 'Biometric unlock', earned: opts.biometricEnabled, points: 15 },
    { label: 'Clipboard auto-clear', earned: opts.autoClearClipboard, points: 15 },
    { label: 'Privacy blur', earned: opts.privacyBlur, points: 10 },
    { label: 'Auto-lock timeout', earned: opts.lockTimeout <= 60, points: 15 },
    { label: 'Vault in use', earned: opts.vaultItemCount > 0, points: 10 },
    { label: 'Decoy protection', earned: opts.decoyPinEnabled, points: 10 },
  ];

  const score = Math.min(
    checks.reduce((s, c) => s + (c.earned ? c.points : 0), 0),
    100
  );

  let level: SecurityLevel;
  let label: string;
  let color: string;

  if (score < 40) { level = 'basic'; label = 'Basic'; color = '#F87171'; }
  else if (score < 70) { level = 'good'; label = 'Good'; color = '#FBBF24'; }
  else if (score < 90) { level = 'strong'; label = 'Strong'; color = '#34D399'; }
  else { level = 'maximum'; label = 'Maximum'; color = '#10B981'; }

  return { score, level, label, color, breakdown: checks };
}

interface SecurityScoreCardProps {
  onPress?: () => void;
}

export function SecurityScoreCard({ onPress }: SecurityScoreCardProps) {
  const { colors } = useThemeContext();
  const { isPinSet } = useAppLockStore();
  const { biometricEnabled, autoClearClipboard, privacyBlur, lockTimeout, decoyPinEnabled } = useSettingsStore();
  const { items } = useVaultStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const result = computeSecurityScore({
    isPinSet,
    biometricEnabled,
    autoClearClipboard,
    privacyBlur,
    lockTimeout,
    decoyPinEnabled,
    vaultItemCount: items.length,
  });

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: result.score / 100,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [result.score]);

  const arcWidth = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPress={() => { haptics.light(); onPress?.(); }}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {/* Score header */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>Privacy Protection Level</Text>
          <Text style={[styles.levelText, { color: result.color }]}>{result.label}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: result.color + '20', borderColor: result.color + '40' }]}>
          <Text style={[styles.scoreNum, { color: result.color }]}>{result.score}</Text>
          <Text style={[styles.scoreMax, { color: result.color + '99' }]}>/100</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.barBg, { backgroundColor: colors.surface3 }]}>
        <Animated.View
          style={[styles.barFill, { width: arcWidth, backgroundColor: result.color }]}
        />
      </View>

      {/* Breakdown */}
      <View style={styles.checks}>
        {result.breakdown.map((c, i) => (
          <View key={i} style={styles.checkRow}>
            <Ionicons
              name={c.earned ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={c.earned ? result.color : colors.textDim}
            />
            <Text style={[styles.checkText, { color: c.earned ? colors.text : colors.textDim }]}>
              {c.label}
            </Text>
            <Text style={[styles.checkPts, { color: c.earned ? result.color : colors.textDim }]}>
              +{c.points}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xxl, borderWidth: 1, padding: SPACING.xl, gap: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  levelText: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, marginTop: 4 },
  scoreBadge: { borderRadius: RADIUS.xl, borderWidth: 1, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  scoreNum: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl },
  scoreMax: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  checks: { gap: SPACING.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checkText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, flex: 1 },
  checkPts: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs },
});
