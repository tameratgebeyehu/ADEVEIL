import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';
import { useThemeContext } from '@/theme/ThemeContext';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}: ButtonProps) {
  const { isDark } = useThemeContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    haptics.light();
    onPress();
  }, [disabled, loading, onPress]);

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={isDisabled}
          style={{ opacity: isDisabled ? 0.5 : 1 }}
        >
          <LinearGradient
            colors={COLORS.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                {icon}
                <Text style={styles.primaryLabel}>{label}</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={isDisabled}
          style={[
            styles.secondaryBtn,
            {
              borderColor: isDark ? COLORS.border : COLORS.light.border,
              backgroundColor: isDark ? COLORS.surface2 : COLORS.light.surface2,
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <>
              {icon}
              <Text style={[styles.secondaryLabel, { color: isDark ? COLORS.text : COLORS.light.text }]}>
                {label}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'ghost') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={isDisabled}
          style={{ opacity: isDisabled ? 0.4 : 1, padding: SPACING.md, alignItems: 'center' }}
        >
          <Text style={[styles.ghostLabel, { color: COLORS.accent }]}>{label}</Text>
        </Pressable>
      </Animated.View>
    );
  }

  // danger
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        style={[styles.dangerBtn, { opacity: isDisabled ? 0.5 : 1 }]}
      >
        <Text style={styles.dangerLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    height: 54,
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  primaryLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    color: '#fff',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  secondaryLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    letterSpacing: 0.3,
  },
  ghostLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.md,
  },
  dangerBtn: {
    height: 50,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  dangerLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
  },
});
