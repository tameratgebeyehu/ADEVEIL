import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useThemeContext } from '@/theme/ThemeContext';
import { Button } from '@/components/ui/Button';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SelfDestructBadge } from '@/components/SelfDestructBadge';
import { openMessage } from '@/crypto/cryptoService';
import { validateProtectedText, parseProtectedText, isSelfDestructFormat, buildSelfDestructString } from '@/crypto/validation';
import { copyToClipboard, getFromClipboard } from '@/services/clipboardService';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSecureScreen } from '@/hooks/useSecureScreen';
import { useAutoHide } from '@/hooks/useAutoHide';
import { useClipboardGuard } from '@/hooks/useClipboardGuard';
import { BlurRevealContent } from '@/components/security/BlurRevealContent';
import { ViewOnceViewer } from '@/components/security/ViewOnceViewer';
import { ClipboardGuard } from '@/components/security/ClipboardGuard';
import { haptics } from '@/services/hapticService';
import { STRINGS } from '@/constants/strings';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

export default function OpenScreen() {
  const router = useRouter();
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const { colors } = useThemeContext();
  const settings = useSettingsStore();

  // Runtime Security
  useSecureScreen();
  const { isHidden, reveal, reset: resetHide } = useAutoHide(settings.autoHideSeconds * 1000, settings.autoHideMessages);
  const clipboardGuard = useClipboardGuard(settings.clipboardClearSeconds);

  const [protectedText, setProtectedText] = useState(prefill ?? '');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sdSeconds, setSdSeconds] = useState<number | null>(null);
  const [sdExpired, setSdExpired] = useState(false);
  const [copied, setCopied] = useState(false);
  const { incrementOpened } = useAnalyticsStore();
  const scrollRef = useRef<ScrollView>(null);
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  useEffect(() => { if (prefill) setProtectedText(prefill); }, [prefill]);

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(10, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const handlePaste = async () => {
    const clip = await getFromClipboard();
    if (clip) { setProtectedText(clip); haptics.light(); }
  };

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!protectedText.trim()) e.text = STRINGS.errors.emptyProtectedText;
    else if (!validateProtectedText(protectedText.trim())) e.text = STRINGS.errors.invalidFormat;
    if (!password) e.password = STRINGS.errors.emptyPassword;
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [protectedText, password]);

  const handleOpen = async () => {
    if (!validate()) { haptics.error(); triggerShake(); return; }
    setLoading(true); setStatus('idle'); setResult(null); setSdSeconds(null); setSdExpired(false);

    const trimmed = protectedText.trim();
    const parsed = parseProtectedText(trimmed);

    // For SD format, reconstruct standard ADEV1:: string for the crypto engine
    let cryptoInput = trimmed;
    if (parsed?.selfDestructSeconds) {
      cryptoInput = `ADEV1::${parsed.iv}::${parsed.ciphertext}`;
    }

    try {
      const res = await openMessage(cryptoInput, password);
      if (res.success && res.data) {
        setResult(res.data);
        setStatus('success');
        if (parsed?.selfDestructSeconds) setSdSeconds(parsed.selfDestructSeconds);
        haptics.success();
        incrementOpened();
        resetHide(); // Start auto-hide timer
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
      } else {
        setStatus('error');
        setErrors({ password: STRINGS.errors.wrongPassword });
        haptics.error();
        triggerShake();
      }
    } catch {
      setStatus('error');
      haptics.error();
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await clipboardGuard.doCopy(result, settings.clipboardClearSeconds);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpired = () => {
    setSdExpired(true);
    setResult(null);
    haptics.medium();
  };

  const handleClear = () => {
    setProtectedText(''); setPassword(''); setResult(null);
    setStatus('idle'); setErrors({}); setSdSeconds(null); setSdExpired(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{STRINGS.open.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {status === 'success' && !sdExpired && <StatusBadge type="success" title={STRINGS.open.successTitle} subtitle={STRINGS.open.successSub} />}
            {status === 'error' && <StatusBadge type="error" title={STRINGS.open.errorTitle} subtitle={STRINGS.open.errorSub} />}

            <StyledTextInput
              label="Protected Text"
              placeholder={STRINGS.open.protectedPlaceholder}
              value={protectedText}
              onChangeText={t => { setProtectedText(t); setErrors(e => ({ ...e, text: '' })); }}
              multiline numberOfLines={4} textAlignVertical="top"
              error={errors.text}
              rightAction={{ icon: 'clipboard-outline', onPress: handlePaste }}
            />
            <Pressable onPress={() => router.push('/qr-scan')} style={[styles.qrBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Ionicons name="qr-code-outline" size={18} color={colors.accent} />
              <Text style={[styles.qrText, { color: colors.accent }]}>Scan QR code instead</Text>
            </Pressable>

            <Animated.View style={shakeStyle}>
              <StyledTextInput
                label="Password"
                placeholder={STRINGS.open.passwordPlaceholder}
                value={password}
                onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
                isPassword error={errors.password}
              />
            </Animated.View>

            <View style={styles.btnRow}>
              <Button label={STRINGS.open.clear} onPress={handleClear} variant="secondary" style={{ flex: 1 }} />
              <Button label={STRINGS.open.button} onPress={handleOpen} loading={loading} style={{ flex: 2 }} />
            </View>

            {/* Self-destruct timer */}
            {sdSeconds !== null && result && !sdExpired && (
              <SelfDestructBadge seconds={sdSeconds} onExpired={handleExpired} />
            )}
            {sdExpired && (
              <StatusBadge type="error" title="Message Destroyed" subtitle="This temporary message has been cleared as requested." />
            )}

            {/* Result */}
            {result && !sdExpired && (
              settings.viewOnceMode ? (
                <ViewOnceViewer content={result} onHide={() => { setResult(null); haptics.medium(); }} />
              ) : (
                <BlurRevealContent isHidden={isHidden} onReveal={reveal}>
                  <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.resultHeader}>
                      <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Original Message</Text>
                      <Pressable onPress={handleCopy} style={styles.copyBtn}>
                        <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? colors.success : colors.textMuted} />
                        <Text style={[styles.copyText, { color: copied ? colors.success : colors.textMuted }]}>
                          {copied ? 'Copied!' : 'Copy'}
                        </Text>
                      </Pressable>
                    </View>
                    <Text selectable style={[styles.resultText, { color: colors.text }]}>{result}</Text>
                  </View>
                </BlurRevealContent>
              )
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {settings.showClipboardTimer && (
          <ClipboardGuard 
            isVisible={clipboardGuard.hasCopied} 
            secondsLeft={clipboardGuard.secondsLeft} 
            maxSeconds={settings.clipboardClearSeconds}
            onClear={clipboardGuard.doClear} 
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge },
  qrBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderWidth: 1, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, marginTop: -SPACING.sm, marginBottom: SPACING.md },
  qrText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.lg },
  resultCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, gap: SPACING.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLabel: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  copyText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  resultText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 26 },
});
