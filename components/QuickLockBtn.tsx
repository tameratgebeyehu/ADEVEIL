import React, { useRef } from 'react';
import { StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAppLockStore } from '@/store/appLockStore';
import { haptics } from '@/services/hapticService';
import { copyToClipboard } from '@/services/clipboardService';

export function QuickLockBtn() {
  const { colors } = useThemeContext();
  const { lock, isPinSet } = useAppLockStore();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    haptics.medium();
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (!isPinSet) {
      Alert.alert(
        'App PIN Required',
        'You need to set up a 4-digit App PIN before you can use the Quick Lock.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set PIN', onPress: () => router.push('/setup-pin') }
        ]
      );
      return;
    }

    // Instant lock
    lock();
    router.replace('/app-lock');
  };

  const handleLongPress = () => {
    haptics.error();

    if (!isPinSet) {
      Alert.alert(
        'App PIN Required',
        'You need to set up a 4-digit App PIN before you can use the Emergency Hide feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set PIN', onPress: () => router.push('/setup-pin') }
        ]
      );
      return;
    }

    Alert.alert(
      '⚠️ Emergency Hide',
      'This will immediately lock ADEVeil and clear your clipboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide Now',
          style: 'destructive',
          onPress: async () => {
            await copyToClipboard(''); // clear clipboard
            lock();
            router.replace('/app-lock');
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={600}
        style={styles.btn}
        hitSlop={12}
      >
        <Ionicons name="lock-closed-outline" size={24} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
});
