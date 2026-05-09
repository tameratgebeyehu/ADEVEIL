import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { COLORS } from '@/constants/colors';

interface SelfDestructBadgeProps {
  seconds: number;
  onExpired: () => void;
}

export function SelfDestructBadge({ seconds, onExpired }: SelfDestructBadgeProps) {
  const [remaining, setRemaining] = useState(seconds);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Countdown
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          pulse.stop();
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { clearInterval(interval); pulse.stop(); };
  }, []);

  const formatTime = (s: number) => {
    if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${s}s`;
  };

  const urgencyColor = remaining <= 10 ? COLORS.error : remaining <= 30 ? COLORS.warning : '#FBBF24';

  return (
    <Animated.View
      style={[
        styles.badge,
        { borderColor: urgencyColor, backgroundColor: urgencyColor + '15' },
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <Ionicons name="timer-outline" size={16} color={urgencyColor} />
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: urgencyColor }]}>Temporary Secret Message</Text>
        <Text style={[styles.timer, { color: urgencyColor }]}>
          Disappears in {formatTime(remaining)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  textArea: { flex: 1 },
  title: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
  timer: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xl, marginTop: 2 },
});
