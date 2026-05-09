import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

interface Props {
  isHidden: boolean;
  onReveal: () => void;
  children: React.ReactNode;
}

/**
 * BlurRevealContent — wraps sensitive content (like decrypted messages)
 * and applies a blur overlay when isHidden is true.
 * Tap the overlay to reveal.
 */
export function BlurRevealContent({ isHidden, onReveal, children }: Props) {
  const { colors, mode } = useThemeContext();
  const blurTint = mode === 'dark' || mode === 'amoled' ? 'dark' : 'light';

  return (
    <View style={styles.container}>
      {children}
      {isHidden && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable style={styles.blurContainer} onPress={onReveal}>
            <BlurView intensity={40} tint={blurTint} style={StyleSheet.absoluteFill} />
            {/* Fallback translucent background if BlurView fails */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, opacity: 0.8 }]} />
            
            <View style={[styles.promptBadge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="eye-off-outline" size={24} color={colors.textMuted} />
              <Text style={[styles.promptText, { color: colors.text }]}>Hidden for privacy</Text>
              <Text style={[styles.promptSubtext, { color: colors.textDim }]}>Tap to reveal message</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.xl, // Match resultCard border radius
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  promptBadge: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  promptText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  promptSubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
});
