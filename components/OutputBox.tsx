import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { copyToClipboard } from '@/services/clipboardService';
import { shareText } from '@/services/shareService';
import { haptics } from '@/services/hapticService';
import { useThemeContext } from '@/theme/ThemeContext';
import { STRINGS } from '@/constants/strings';

interface OutputBoxProps {
  text: string;
  label?: string;
  showShare?: boolean;
  autoClearSeconds?: number;
}

export function OutputBox({
  text,
  label = 'Protected Text',
  showShare = true,
  autoClearSeconds = 0,
}: OutputBoxProps) {
  const { isDark, autoClear } = useThemeContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text, autoClear ? autoClearSeconds || 60 : 0);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      haptics.light();
      await shareText(text);
    } catch {
      Alert.alert('Share Error', 'Could not open share sheet.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.surface2 : COLORS.light.surface2,
          borderColor: COLORS.accent,
        },
      ]}
    >
      {/* Label */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={16} color={COLORS.accent} />
        <Text style={[styles.label, { color: COLORS.accent }]}>{label}</Text>
      </View>

      {/* Protected text */}
      <Text
        selectable
        style={[styles.text, { color: isDark ? COLORS.text : COLORS.light.text }]}
        numberOfLines={6}
      >
        {text}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleCopy}
          style={[styles.actionBtn, { borderColor: isDark ? COLORS.border : COLORS.light.border }]}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={18}
            color={copied ? COLORS.success : (isDark ? COLORS.text : COLORS.light.text)}
          />
          <Text
            style={[
              styles.actionLabel,
              { color: copied ? COLORS.success : (isDark ? COLORS.text : COLORS.light.text) },
            ]}
          >
            {copied ? STRINGS.protect.copied : STRINGS.protect.copy}
          </Text>
        </Pressable>

        {showShare && (
          <Pressable
            onPress={handleShare}
            style={[styles.actionBtn, { borderColor: isDark ? COLORS.border : COLORS.light.border }]}
          >
            <Ionicons name="share-outline" size={18} color={isDark ? COLORS.text : COLORS.light.text} />
            <Text style={[styles.actionLabel, { color: isDark ? COLORS.text : COLORS.light.text }]}>
              {STRINGS.protect.share}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  actionLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
  },
});
