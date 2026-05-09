import 'react-native-get-random-values';
import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, AppState, LogBox } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useThemeContext } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppLockStore } from '@/store/appLockStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { isPinSet } from '@/services/passwordService';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { PrivacyPlaceholder } from '@/components/security/PrivacyPlaceholder';
import { secureLogger } from '@/services/secureLogger';
import { Accelerometer } from 'expo-sensors';
import { useGlobalScreenshotBlock } from '@/hooks/useSecureScreen';

const ONBOARDING_KEY = 'ADEV_ONBOARDED';

SplashScreen.preventAutoHideAsync();

// Suppress harmless dev warning when biometric or backgrounding fails to activate keep-awake
LogBox.ignoreLogs(['Unable to activate keep awake']);

function RootLayoutInner() {
  const router = useRouter();
  const { colors, isDark, reduceMotion, fontScale } = useThemeContext();
  const { privacyBlur, lockTimeout, shakeToLock } = useSettingsStore();
  const { isLocked, lock, isPinSet: storeIsPinSet } = useAppLockStore();
  const { startSession } = useAnalyticsStore();
  const [blurred, setBlurred] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRedirectedToLock = useRef(false);

  // Apply/remove screenshot block globally whenever the setting changes
  useGlobalScreenshotBlock();

  // ─── Auto-redirect to lock screen whenever isLocked becomes true ───────────
  useEffect(() => {
    if (isLocked && storeIsPinSet) {
      // Prevent double-redirect if already heading there
      if (!hasRedirectedToLock.current) {
        hasRedirectedToLock.current = true;
        router.replace('/app-lock');
      }
    } else {
      hasRedirectedToLock.current = false;
    }
  }, [isLocked, storeIsPinSet]);

  // Privacy blur + auto-lock on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (privacyBlur) setBlurred(state === 'background' || state === 'inactive');

      if (state === 'background' && storeIsPinSet && lockTimeout > 0) {
        inactivityTimer.current = setTimeout(() => lock(), lockTimeout * 1000);
      } else if (state === 'active') {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        setBlurred(false);
      }
    });
    return () => sub.remove();
  }, [privacyBlur, lockTimeout, storeIsPinSet]);

  // Shake to lock (expo-sensors)
  useEffect(() => {
    if (!shakeToLock) return;
    let lastLock = 0;
    Accelerometer.setUpdateInterval(200);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > 2.5 && now - lastLock > 3000) {
        lastLock = now;
        lock();
      }
    });
    return () => sub.remove();
  }, [shakeToLock]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: reduceMotion ? 'none' : 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="app-lock" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="setup-pin" />
        <Stack.Screen name="change-pin" options={{ presentation: 'card' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="protect" options={{ presentation: 'card' }} />
        <Stack.Screen name="open" options={{ presentation: 'card' }} />
        <Stack.Screen name="qr-share" options={{ presentation: 'modal' }} />
        <Stack.Screen name="qr-scan" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="export" options={{ presentation: 'card' }} />
        <Stack.Screen name="setup-decoy-pin" options={{ presentation: 'card' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="vault/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="note/[id]" options={{ presentation: 'card' }} />
      </Stack>

      {blurred && privacyBlur && (
        <PrivacyPlaceholder />
      )}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!fontsLoaded) return;
    
    // Override console logs in production using secureLogger
    if (!__DEV__) {
      console.log = secureLogger.log;
      console.warn = secureLogger.warn;
    }

    const init = async () => {
      const [pinSet, onboarded] = await Promise.all([
        isPinSet(),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      useAppLockStore.setState({ isPinSet: pinSet });

      // If no PIN is set yet, unlock immediately so the user can navigate freely
      if (!pinSet) useAppLockStore.getState().unlock('');

      useAnalyticsStore.getState().startSession();
      setReady(true);
      await SplashScreen.hideAsync();

      if (!onboarded) {
        // First-time user — show onboarding
        router.replace('/onboarding');
      } else if (pinSet) {
        // Returning user with PIN — show lock screen
        router.replace('/app-lock');
      }
      // Otherwise expo-router defaults to index → /(tabs)/home (via hasSeenWelcome check)
    };
    init();
  }, [fontsLoaded]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blurOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
});
