import React, { useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';

const PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

interface PinPadProps {
  pin: string;
  onChange: (pin: string) => void;
  maxLength?: number;
  onSubmit?: (pin: string) => void;
  error?: boolean;
}

export function PinPad({ pin, onChange, maxLength = 6, onSubmit, error }: PinPadProps) {
  const { colors } = useThemeContext();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    Vibration.vibrate(300);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  React.useEffect(() => { if (error) triggerShake(); }, [error]);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      haptics.light();
      onChange(pin.slice(0, -1));
    } else if (key === '') {
      // empty — disabled
    } else {
      if (pin.length >= maxLength) return;
      haptics.light();
      const next = pin + key;
      onChange(next);
      if (next.length === maxLength && onSubmit) {
        setTimeout(() => onSubmit(next), 100);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* PIN dots */}
      <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < pin.length
                    ? error ? colors.error : colors.accent
                    : colors.border,
                borderColor: i < pin.length
                  ? error ? colors.error : colors.accent
                  : colors.border,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Number pad */}
      {PAD_KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key, ki) => (
            <Pressable
              key={ki}
              onPress={() => handleKey(key)}
              disabled={key === ''}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor:
                    key === ''
                      ? 'transparent'
                      : pressed
                      ? colors.surface3
                      : colors.surface2,
                  borderColor: key === '' ? 'transparent' : colors.border,
                  opacity: key === '' ? 0 : 1,
                },
              ]}
            >
              {key === '⌫' ? (
                <Ionicons name="backspace-outline" size={22} color={colors.text} />
              ) : (
                <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: SPACING.xl },
  dots: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xxl,
  },
});
