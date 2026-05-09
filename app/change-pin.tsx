import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAppLockStore } from '@/store/appLockStore';
import {
  verifyPin, savePin, savePinValue, isPinSet,
} from '@/services/passwordService';
import { PinPad } from '@/components/PinPad';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

type Step = 'verify' | 'new' | 'confirm';

const STEP_META: Record<Step, { title: string; subtitle: string; icon: any; btnLabel: string }> = {
  verify:  {
    title: 'Confirm Current PIN',
    subtitle: 'Enter your existing PIN to proceed',
    icon: 'key',
    btnLabel: 'Verify PIN',
  },
  new:     {
    title: 'Set New PIN',
    subtitle: 'Choose a new 4-digit PIN',
    icon: 'add-circle-outline',
    btnLabel: 'Next  →',
  },
  confirm: {
    title: 'Confirm New PIN',
    subtitle: 'Re-enter your new PIN to confirm it',
    icon: 'checkmark',
    btnLabel: 'Save New PIN',
  },
};

const STEPS: Step[] = ['verify', 'new', 'confirm'];

export default function ChangePinScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { unlock } = useAppLockStore();

  const [step, setStep]           = useState<Step>('verify');
  const [skipVerify, setSkipVerify] = useState(false);
  const [pin, setPin]             = useState('');
  const [newPin, setNewPin]       = useState('');
  const [error, setError]         = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [loading, setLoading]     = useState(false);

  // Skip verify step when no PIN is configured yet
  useEffect(() => {
    isPinSet().then(set => {
      if (!set) {
        setSkipVerify(true);
        setStep('new');
      }
    });
  }, []);

  const meta = STEP_META[step];
  const stepsToShow = skipVerify ? (['new', 'confirm'] as Step[]) : STEPS;
  const stepIndex   = stepsToShow.indexOf(step);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const showError = (msg: string, resetPin = true) => {
    haptics.error();
    setError(true);
    setErrorMsg(msg);
    if (resetPin) setTimeout(() => { setError(false); setErrorMsg(''); setPin(''); }, 800);
  };

  const handleVerify = async () => {
    setLoading(true);
    const ok = await verifyPin(pin);
    setLoading(false);

    if (ok) {
      haptics.success();
      setPin('');
      setError(false);
      setErrorMsg('');
      setStep('new');
    } else {
      showError('Incorrect PIN — try again');
    }
  };

  const handleNew = () => {
    haptics.light();
    setNewPin(pin);
    setPin('');
    setError(false);
    setErrorMsg('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (pin !== newPin) {
      showError("PINs don't match — start over");
      setTimeout(() => { setPin(''); setNewPin(''); setStep('new'); }, 900);
      return;
    }

    setLoading(true);
    await savePin(newPin);
    await savePinValue(newPin);
    setLoading(false);

    // Update in-memory store so auto-lock activates
    useAppLockStore.setState({ isPinSet: true });
    unlock(newPin, false);

    haptics.success();
    Alert.alert(
      'PIN Updated',
      'Your new PIN has been saved. Use it next time you open ADEVeil.',
      [{ text: 'Done', onPress: () => router.back() }],
    );
  };

  const handleSubmit = () => {
    if (pin.length < 4) return;
    if (step === 'verify')  return handleVerify();
    if (step === 'new')     return handleNew();
    if (step === 'confirm') return handleConfirm();
  };

  const handlePinChange = (val: string) => {
    if (errorMsg) { setError(false); setErrorMsg(''); }
    setPin(val);
  };

  const goBack = () => {
    if (step === 'confirm') {
      setStep('new');
      setPin('');
      setNewPin('');
      setError(false);
      setErrorMsg('');
    } else {
      router.back();
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>

        {/* Header bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={goBack} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {skipVerify ? 'Set PIN' : 'Change PIN'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Step progress bar */}
        <View style={styles.progress}>
          {stepsToShow.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    i < stepIndex
                      ? colors.success
                      : i === stepIndex
                      ? colors.accent
                      : colors.surface3,
                  flex: 1,
                },
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <LinearGradient
            colors={colors.gradientPurple}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={meta.icon} size={36} color="#ffffff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>{meta.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{meta.subtitle}</Text>

          {/* Error */}
          {!!errorMsg && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorBg }]}>
              <Ionicons name="warning-outline" size={14} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
            </View>
          )}

          {/* PIN pad — no auto-submit; user presses the button */}
          <PinPad
            pin={pin}
            onChange={handlePinChange}
            maxLength={4}
            error={error}
          />

          {/* Explicit confirm button */}
          <View style={styles.btnArea}>
            <Pressable
              onPress={handleSubmit}
              disabled={pin.length < 4 || loading}
              style={({ pressed }) => [
                styles.confirmBtn,
                {
                  backgroundColor:
                    pin.length < 4 || loading
                      ? colors.surface3
                      : colors.accent,
                  opacity: pin.length < 4 ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.confirmBtnText, { color: pin.length < 4 ? colors.textDim : '#fff' }]}>
                {loading ? 'Verifying…' : meta.btnLabel}
              </Text>
              {pin.length === 4 && !loading && (
                <Ionicons
                  name={step === 'confirm' ? 'checkmark-circle-outline' : 'arrow-forward'}
                  size={18}
                  color="#fff"
                />
              )}
            </Pressable>

            {/* Helper hint */}
            <Text style={[styles.hint, { color: colors.textDim }]}>
              {step === 'verify'
                ? 'Enter your current PIN to proceed'
                : step === 'new'
                ? 'Enter 4 digits, then press "Next"'
                : 'Enter the same PIN again to confirm'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  progress: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressSegment: {
    height: 5,
    borderRadius: RADIUS.full,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: SPACING.xs,
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
    gap: SPACING.sm,
    marginTop: SPACING.sm,
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
  hint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});
