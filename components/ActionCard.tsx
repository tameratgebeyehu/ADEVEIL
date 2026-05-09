import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';
import { useThemeContext } from '@/theme/ThemeContext';

interface ActionCardProps {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string];
  onPress: () => void;
}

export function ActionCard({
  title,
  description,
  iconName,
  gradientColors,
  onPress,
}: ActionCardProps) {
  const { isDark } = useThemeContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const handlePress = useCallback(() => {
    haptics.medium();
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : COLORS.light.surface,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : COLORS.light.border,
            },
          ]}
        >
          {/* Icon circle with gradient */}
          <LinearGradient
            colors={gradientColors}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={iconName} size={28} color="#fff" />
          </LinearGradient>

          {/* Text */}
          <View style={styles.textArea}>
            <Text style={[styles.title, { color: isDark ? COLORS.text : COLORS.light.text }]}>
              {title}
            </Text>
            <Text style={[styles.desc, { color: isDark ? COLORS.textMuted : COLORS.light.textMuted }]}>
              {description}
            </Text>
          </View>

          {/* Arrow */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? COLORS.textDim : '#AAAACC'}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: { flex: 1 },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.lg,
    marginBottom: 4,
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: 19,
  },
});
