import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PinPad } from '@/components/PinPad';
import { useThemeContext } from '@/theme/ThemeContext';
import { savePin, savePinValue } from '@/services/passwordService';
import { useAppLockStore } from '@/store/appLockStore';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

type Step = 'enter' | 'confirm';

export default function SetupPinScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { unlock } = useAppLockStore();

  const [step, setStep]         = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]       = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEnter = step === 'enter';
  const activePin = isEnter ? firstPin : confirmPin;

  // ─── Step 1: advance to confirm ───────────────────────────────────────────────
  const handleFirst = () => {
    if (firstPin.length < 4) return;
    haptics.light();
    setStep('confirm');
    setConfirmPin('');
    setError(false);
    setErrorMsg('');
  };

  // ─── Step 2: save PIN ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (confirmPin.length < 4) return;

    if (confirmPin !== firstPin) {
      haptics.error();
      setError(true);
      setErrorMsg("PINs don't match — try again");
      setTimeout(() => {
        setError(false);
        setErrorMsg('');
        setConfirmPin('');
        setFirstPin('');
        setStep('enter');
      }, 800);
      return;
    }

    // Save hash (verification) + raw value (biometric decryption)
    await savePin(firstPin);
    await savePinValue(firstPin);

    // Update the in-memory store so auto-lock triggers on next background
    useAppLockStore.setState({ isPinSet: true });
    unlock(firstPin, false);

    haptics.success();
    Alert.alert(
      'PIN Set!',
      'Your vault is now protected. You can also enable biometrics in Settings.',
      [{ text: 'Get Started', onPress: () => router.replace('/(tabs)/home') }],
    );
  };

  // ─── Skip (no PIN) ────────────────────────────────────────────────────────────
  const handleSkip = () => {
    haptics.light();
    unlock('', false);
    router.replace('/(tabs)/home');
  };

  // ─── PIN change handler — clears error on first new digit ────────────────────
  const handlePinChange = (val: string) => {
    if (errorMsg) { setError(false); setErrorMsg(''); }
    if (isEnter) setFirstPin(val);
    else setConfirmPin(val);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>

        {/* Progress dots */}
        <View style={styles.progress}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <View style={[styles.dot, { backgroundColor: isEnter ? colors.surface3 : colors.accent }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={colors.gradientPurple}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={isEnter ? "key" : "checkmark"} size={36} color="#ffffff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            {isEnter ? 'Create Your PIN' : 'Confirm Your PIN'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isEnter
              ? 'Choose a 4-digit PIN to lock ADEVeil'
              : 'Re-enter the same PIN to confirm it'}
          </Text>
        </View>

        {/* Error banner */}
        {!!errorMsg && (
          <View style={[styles.errorBanner, { backgroundColor: colors.errorBg }]}>
            <Ionicons name="warning-outline" size={14} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
          </View>
        )}

        {/* PIN pad — no onSubmit, explicit button below handles submission */}
        <PinPad
          pin={activePin}
          onChange={handlePinChange}
          maxLength={4}
          error={error}
          // intentionally no onSubmit — user must press the button below
        />

        {/* Explicit confirm button — enabled only when 4 digits entered */}
        <View style={styles.btnArea}>
          <Pressable
            onPress={isEnter ? handleFirst : handleConfirm}
            disabled={activePin.length < 4}
            style={({ pressed }) => [
              styles.confirmBtn,
              {
                backgroundColor:
                  activePin.length < 4
                    ? colors.surface3
                    : colors.accent,
                opacity: activePin.length < 4 ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.confirmBtnText, { color: activePin.length < 4 ? colors.textDim : '#fff' }]}>
              {isEnter ? 'Next  →' : 'Set PIN'}
            </Text>
            {activePin.length === 4 && (
              <Ionicons
                name={isEnter ? 'arrow-forward' : 'checkmark-circle-outline'}
                size={18}
                color={activePin.length < 4 ? colors.textDim : '#fff'}
              />
            )}
          </Pressable>

          {/* Skip — only on first step */}
          {isEnter && (
            <Pressable onPress={handleSkip} hitSlop={12}>
              <Text style={[styles.skipText, { color: colors.textDim }]}>
                Skip for now
              </Text>
            </Pressable>
          )}

          {/* Back to re-enter — on confirm step */}
          {!isEnter && (
            <Pressable
              onPress={() => { setStep('enter'); setFirstPin(''); setConfirmPin(''); setError(false); setErrorMsg(''); }}
              hitSlop={12}
            >
              <Text style={[styles.skipText, { color: colors.textDim }]}>
                ← Start over
              </Text>
            </Pressable>
          )}
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  progress: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.lg,
  },
  dot: {
    width: 32,
    height: 6,
    borderRadius: RADIUS.full,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xxl,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
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
  btnArea: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  confirmBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  confirmBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    letterSpacing: 0.3,
  },
  skipText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
});
