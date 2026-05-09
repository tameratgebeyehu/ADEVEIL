import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';

interface Props {
  isVisible: boolean;
  secondsLeft: number;
  onClear: () => void;
  maxSeconds?: number;
}

/**
 * ClipboardGuard — floating notification shown after copying sensitive text.
 * Displays a live countdown ring and a manual "Clear Now" button.
 */
export function ClipboardGuard({ isVisible, secondsLeft, onClear, maxSeconds = 60 }: Props) {
  const { colors } = useThemeContext();
  const progress = useSharedValue(1);

  // Animate progress bar
  useEffect(() => {
    if (isVisible && secondsLeft > 0) {
      progress.value = withTiming(secondsLeft / maxSeconds, { duration: 1000, easing: Easing.linear });
    } else if (!isVisible) {
      progress.value = 1;
    }
  }, [secondsLeft, isVisible, maxSeconds, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify().damping(15)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.container, { backgroundColor: colors.surface2, borderColor: colors.border }]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.accentGlow }]}>
        <Ionicons name="copy-outline" size={20} color={colors.accent} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Copied to clipboard</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Auto-clears in <Text style={{ color: colors.text, fontFamily: FONTS.medium }}>{secondsLeft}s</Text>
        </Text>
      </View>

      <Pressable 
        style={[styles.clearBtn, { backgroundColor: colors.surface3 }]}
        onPress={() => {
          haptics.light();
          onClear();
        }}
      >
        <Text style={[styles.clearText, { color: colors.text }]}>Clear</Text>
      </Pressable>

      {/* Progress Bar at the bottom edge */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.accent }, barStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden', // so progress bar stays inside border radius
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  clearText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressFill: {
    height: '100%',
  },
});
