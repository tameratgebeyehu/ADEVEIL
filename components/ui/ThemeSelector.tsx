import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeContext } from '@/theme/ThemeContext';
import { THEME_NAMES, THEME_PREVIEW_COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/services/hapticService';
import type { ThemeMode } from '@/types/vault.types';

const THEMES: ThemeMode[] = ['dark', 'amoled', 'light', 'midnight'];

export function ThemeSelector() {
  const { theme, setTheme, colors } = useThemeContext();

  const handleSelect = (t: ThemeMode) => {
    haptics.light();
    setTheme(t);
  };

  return (
    <View style={styles.grid}>
      {THEMES.map(t => {
        const active = t === theme;
        const [bg, accent] = THEME_PREVIEW_COLORS[t];
        return (
          <Pressable
            key={t}
            onPress={() => handleSelect(t)}
            style={[
              styles.option,
              {
                borderColor: active ? colors.accent : colors.border,
                borderWidth: active ? 2 : 1,
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Color preview */}
            <LinearGradient
              colors={[bg, accent]}
              style={styles.preview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text
              style={[
                styles.label,
                { color: active ? colors.accent : colors.textMuted },
              ]}
              numberOfLines={2}
            >
              {THEME_NAMES[t]}
            </Text>
            {active && (
              <View style={[styles.check, { backgroundColor: colors.accent }]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  option: {
    width: '47%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  preview: {
    width: '100%',
    height: 64,
    marginBottom: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  check: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
