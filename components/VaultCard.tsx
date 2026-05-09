import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import type { VaultItem } from '@/types/vault.types';
import { haptics } from '@/services/hapticService';

interface VaultCardProps {
  item: VaultItem;
  onPress: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export function VaultCard({ item, onPress, onToggleFavorite }: VaultCardProps) {
  const { colors } = useThemeContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  const typeConfig = item.type === 'message'
    ? { icon: 'shield-checkmark-outline' as const, label: 'Message', color: colors.accent }
    : { icon: 'document-text-outline' as const, label: 'Note', color: colors.accentBlue };

  const date = new Date(item.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => { haptics.light(); onPress(); }}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        {/* Type badge + favorite */}
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: typeConfig.color + '20', borderColor: typeConfig.color + '40' }]}>
            <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} />
            <Text style={[styles.badgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
          </View>
          <Pressable onPress={() => { haptics.light(); onToggleFavorite?.(); }} hitSlop={10}>
            <Ionicons
              name={item.favorite ? 'star' : 'star-outline'}
              size={18}
              color={item.favorite ? '#FBBF24' : colors.textDim}
            />
          </Pressable>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.pinned ? '📌 ' : ''}{item.title || 'Untitled'}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          {item.selfDestructSeconds ? (
            <View style={styles.sdBadge}>
              <Ionicons name="timer-outline" size={11} color={colors.error} />
              <Text style={[styles.sdText, { color: colors.error }]}>Temporary</Text>
            </View>
          ) : null}
          <Text style={[styles.date, { color: colors.textDim }]}>{date}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: 10, letterSpacing: 0.3 },
  title: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  footer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sdBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  sdText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.xs },
  date: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs, marginLeft: 'auto' },
});
