import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  Alert, Animated, ActivityIndicator, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAppLockStore } from '@/store/appLockStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useVaultStore } from '@/store/vaultStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import {
  verifyPin, clearPin, loadPinValue,
} from '@/services/passwordService';
import {
  isBiometricAvailable, authenticateWithBiometric, getBiometricLabel,
} from '@/services/biometricService';
import { verifyDecoyPin, clearDecoyPin } from '@/services/exportService';
import { PinPad } from '@/components/PinPad';
import { haptics } from '@/services/hapticService';
import { useSecureScreen } from '@/hooks/useSecureScreen';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ATTEMPTS  = 5;   // lockout after this many wrong PINs
const LOCKOUT_SECS  = 30;  // seconds to wait after lockout
const SHOW_FORGOT   = 3;   // show "Forgot PIN?" after this many failures

export default function AppLockScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { unlock } = useAppLockStore();
  const { biometricEnabled, decoyPinEnabled } = useSettingsStore();
  const { clearAll: clearVault } = useVaultStore();
  const { addActivity, resetAll: resetAnalytics } = useAnalyticsStore();

  useSecureScreen();

  // ─── State ───────────────────────────────────────────────────────────────────
  const [pin, setPin]                     = useState('');
  const [error, setError]                 = useState('');
  const [attempts, setAttempts]           = useState(0);
  const [locked, setLocked]               = useState(false);     // rate-limit lockout
  const [lockSecsLeft, setLockSecsLeft]   = useState(0);
  const [biometricAvail, setBiometricAvail] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');
  const [biometricLoading, setBiometricLoading] = useState(false);

  const lockTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAutoTrigger = useRef(false);
  const shakeAnim      = useRef(new Animated.Value(0)).current;

  // ─── Biometric availability check ────────────────────────────────────────────
  useEffect(() => {
    if (!biometricEnabled) return;

    const checkBiometric = async () => {
      const available = await isBiometricAvailable();
      if (!available) return;

      const label = await getBiometricLabel();
      setBiometricAvail(true);
      setBiometricLabel(label);

      // Auto-trigger once on mount
      if (!didAutoTrigger.current) {
        didAutoTrigger.current = true;
        setTimeout(triggerBiometric, 400);
      }
    };

    checkBiometric();
  }, [biometricEnabled]);

  // ─── Lockout countdown ───────────────────────────────────────────────────────
  const startLockout = useCallback(() => {
    setLocked(true);
    setLockSecsLeft(LOCKOUT_SECS);
    setPin('');
    setError('');

    let remaining = LOCKOUT_SECS;
    lockTimerRef.current = setInterval(() => {
      remaining -= 1;
      setLockSecsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(lockTimerRef.current!);
        setLocked(false);
        setAttempts(0);
        setError('');
      }
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
  }, []);

  // ─── Shake animation ─────────────────────────────────────────────────────────
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0,  duration: 55, useNativeDriver: true }),
    ]).start();
  }, []);

  // ─── Hardware Back Button Blocking ───────────────────────────────────────────
  useEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true; // Prevent default behavior (going back to previous screen)
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  // ─── Unlock with biometric ───────────────────────────────────────────────────
  const triggerBiometric = useCallback(async () => {
    if (biometricLoading) return;
    setBiometricLoading(true);
    try {
      const result = await authenticateWithBiometric('Unlock ADEVeil');
      if (result) {
        const realPin = await loadPinValue(); // real PIN for decryption
        haptics.success();
        unlock(realPin ?? '', false);
        addActivity({ type: 'locked', label: `App unlocked (${biometricLabel})` });
        router.replace('/(tabs)/home');
      } else {
        setError('Biometric not recognised — enter PIN');
      }
    } catch {
      setError('Biometric unavailable — enter PIN');
    } finally {
      setBiometricLoading(false);
    }
  }, [biometricLoading, biometricLabel]);

  // ─── Unlock with PIN ─────────────────────────────────────────────────────────
  const handlePin = useCallback(async (enteredPin: string) => {
    if (locked) return;
    setError('');

    // Verify real PIN
    const realOk = await verifyPin(enteredPin);
    if (realOk) {
      haptics.success();
      setAttempts(0);
      unlock(enteredPin, false);
      addActivity({ type: 'locked', label: 'App unlocked' });
      router.replace('/(tabs)/home');
      return;
    }

    // Verify decoy PIN (if enabled)
    if (decoyPinEnabled) {
      const decoyOk = await verifyDecoyPin(enteredPin);
      if (decoyOk) {
        haptics.success();
        setAttempts(0);
        unlock(enteredPin, true);
        addActivity({ type: 'locked', label: 'Decoy session started' });
        router.replace('/(tabs)/vault');
        return;
      }
    }

    // Wrong PIN
    haptics.error();
    triggerShake();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setPin('');

    if (newAttempts >= MAX_ATTEMPTS) {
      startLockout();
      return;
    }

    const remaining = MAX_ATTEMPTS - newAttempts;
    setError(
      remaining === 1
        ? 'Incorrect PIN — 1 attempt left before lockout'
        : `Incorrect PIN — ${remaining} attempts left`
    );
  }, [locked, attempts, decoyPinEnabled]);

  // ─── Forgot PIN ──────────────────────────────────────────────────────────────
  const handleForgotPin = () => {
    Alert.alert(
      'Reset PIN',
      'This will permanently delete your PIN and ALL vault data. Your encrypted messages and notes cannot be recovered.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            // Reset store FIRST so the auto-lock redirect doesn't loop
            useAppLockStore.setState({ isPinSet: false, isLocked: false, sessionPin: null });
            await clearPin();
            await clearDecoyPin();
            clearVault();
            resetAnalytics();
            await AsyncStorage.multiRemove(['hasSeenWelcome', 'ADEV_ONBOARDED']);
            haptics.medium();
            router.replace('/setup-pin');
          },
        },
      ]
    );
  };

  // Clear error as soon as user starts typing a new digit
  const handlePinChange = (newPin: string) => {
    if (error) setError('');
    setPin(newPin);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>

          {/* Logo */}
          <LinearGradient
            colors={colors.gradientPurple}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="lock-closed" size={36} color="#ffffff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>ADEVeil</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {locked
              ? `Too many attempts — wait ${lockSecsLeft}s`
              : 'Enter your PIN to continue'}
          </Text>

          {/* Error message */}
          {!!error && (
            <Animated.View style={[styles.errorBanner, { backgroundColor: colors.errorBg, transform: [{ translateX: shakeAnim }] }]}>
              <Ionicons name="warning-outline" size={15} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          )}

          {/* Lockout banner */}
          {locked && (
            <View style={[styles.lockoutBanner, { backgroundColor: colors.errorBg, borderColor: colors.error + '40' }]}>
              <Ionicons name="time-outline" size={20} color={colors.error} />
              <Text style={[styles.lockoutText, { color: colors.error }]}>
                Locked for {lockSecsLeft} seconds
              </Text>
            </View>
          )}

          {/* PIN pad (hidden during lockout) */}
          {!locked && (
            <PinPad
              pin={pin}
              onChange={handlePinChange}
              onSubmit={handlePin}
              maxLength={4}
              error={!!error}
            />
          )}

          {/* Bottom actions */}
          <View style={styles.actions}>
            {/* Biometric button */}
            {biometricAvail && !locked && (
              <Pressable
                onPress={triggerBiometric}
                style={({ pressed }) => [
                  styles.bioBtn,
                  {
                    backgroundColor: pressed ? colors.surface3 : colors.surface2,
                    borderColor: colors.border,
                    opacity: biometricLoading ? 0.6 : 1,
                  },
                ]}
                disabled={biometricLoading}
              >
                {biometricLoading ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Ionicons name="finger-print-outline" size={22} color={colors.accent} />
                )}
                <Text style={[styles.bioText, { color: colors.accent }]}>
                  {biometricLoading ? 'Verifying…' : `Use ${biometricLabel}`}
                </Text>
              </Pressable>
            )}

            {/* Forgot PIN — appears after SHOW_FORGOT failed attempts */}
            {attempts >= SHOW_FORGOT && !locked && (
              <Pressable onPress={handleForgotPin} hitSlop={12}>
                <Text style={[styles.forgotText, { color: colors.textMuted }]}>
                  Forgot PIN?
                </Text>
              </Pressable>
            )}

            {/* Always-visible forgot PIN at the bottom (subtle) */}
            {attempts < SHOW_FORGOT && (
              <Pressable onPress={handleForgotPin} hitSlop={12}>
                <Text style={[styles.forgotTextSubtle, { color: colors.textDim }]}>
                  Forgot your PIN?
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
  },

  // Lockout
  lockoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginVertical: SPACING.xl,
  },
  lockoutText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },

  // Actions (biometric + forgot)
  actions: {
    alignItems: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
    width: '100%',
  },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  bioText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
  },
  forgotText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    textDecorationLine: 'underline',
  },
  forgotTextSubtle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
});
