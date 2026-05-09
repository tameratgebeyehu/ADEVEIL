import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAppLockStore } from '@/store/appLockStore';
import { haptics } from '@/services/hapticService';
import { copyToClipboard } from '@/services/clipboardService';
import { RADIUS } from '@/constants/spacing';

export function PanicButton() {
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
        'You need to set up a 4-digit App PIN before you can use the Panic Button to lock the app.',
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
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={600}
        style={[styles.btn, { backgroundColor: colors.errorBg, borderColor: colors.error }]}
      >
        <Ionicons name="shield-outline" size={20} color={colors.error} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 90, right: 20, zIndex: 100 },
  btn: {
    width: 48, height: 48, borderRadius: RADIUS.full,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
});
