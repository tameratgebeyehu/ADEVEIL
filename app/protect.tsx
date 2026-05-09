import { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Pressable, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { useAppLockStore } from '@/store/appLockStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { Button } from '@/components/ui/Button';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OutputBox } from '@/components/OutputBox';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { protectMessage } from '@/crypto/cryptoService';
import { PROTECTED_TEXT_PREFIX, SELF_DESTRUCT_PREFIX } from '@/crypto/validation';
import { haptics } from '@/services/hapticService';
import { generatePassword } from '@/services/passwordService';
import { STRINGS } from '@/constants/strings';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { useSecureScreen } from '@/hooks/useSecureScreen';

const SD_OPTIONS = [
  { label: '30s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '1 hour', seconds: 3600 },
];

export default function ProtectScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { addItem } = useVaultStore();
  const { sessionPin } = useAppLockStore();
  const { incrementProtected, incrementVaultItem } = useAnalyticsStore();

  useSecureScreen();

  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [sdSeconds, setSdSeconds] = useState(60);
  const [savedToVault, setSavedToVault] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!message.trim()) e.message = STRINGS.errors.emptyMessage;
    if (!password) e.password = STRINGS.errors.emptyPassword;
    else if (password.length < 4) e.password = STRINGS.errors.shortPassword;
    if (password !== confirmPassword) e.confirm = STRINGS.errors.passwordMismatch;
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [message, password, confirmPassword]);

  const handleProtect = async () => {
    if (!validate()) { haptics.error(); return; }
    setLoading(true); setStatus('idle'); setResult(null); setSavedToVault(false);
    try {
      const res = await protectMessage(message.trim(), password);
      if (res.success && res.data) {
        // Wrap in SD format if self-destruct enabled
        let finalText = res.data;
        if (selfDestruct) {
          // Replace ADEV1:: prefix with ADEV1SD<n>::
          finalText = finalText.replace(PROTECTED_TEXT_PREFIX, `${SELF_DESTRUCT_PREFIX}${sdSeconds}::`);
        }
        setResult(finalText);
        setStatus('success');
        haptics.success();
        incrementProtected();
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
      } else { setStatus('error'); haptics.error(); }
    } catch { setStatus('error'); haptics.error(); }
    finally { setLoading(false); }
  };

  const handleSaveToVault = async () => {
    if (!result) return; // nothing to save yet
    addItem({
      title: message.trim().slice(0, 40) || 'Protected Message',
      type: 'message',
      encryptedContent: result,
      tags: [],
      pinned: false,
      favorite: false,
      selfDestructSeconds: selfDestruct ? sdSeconds : undefined,
    });
    haptics.success();
    setSavedToVault(true);
    incrementVaultItem();
  };

  const handleGeneratePassword = () => {
    const pw = generatePassword(16);
    setPassword(pw);
    setConfirmPassword(pw);
    haptics.light();
  };

  const handleClear = () => {
    setMessage(''); setPassword(''); setConfirmPassword('');
    setResult(null); setStatus('idle'); setErrors({});
    setSavedToVault(false); setSelfDestruct(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{STRINGS.protect.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {status === 'success' && <StatusBadge type="success" title={STRINGS.protect.successTitle} subtitle={STRINGS.protect.successSub} />}
            {status === 'error' && <StatusBadge type="error" title="Protection failed" subtitle={STRINGS.errors.protectFailed} />}

            <StyledTextInput
              label="Your Message"
              placeholder={STRINGS.protect.messagePlaceholder}
              value={message}
              onChangeText={t => { setMessage(t); setErrors(e => ({ ...e, message: '' })); }}
              multiline numberOfLines={5} textAlignVertical="top"
              error={errors.message} style={styles.messageInput}
            />

            {/* Password with generator */}
            <View style={styles.passwordRow}>
              <View style={{ flex: 1 }}>
                <StyledTextInput
                  label="Password"
                  placeholder={STRINGS.protect.passwordPlaceholder}
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
                  isPassword error={errors.password}
                />
              </View>
              <Pressable onPress={handleGeneratePassword} style={[styles.genBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Ionicons name="shuffle-outline" size={20} color={colors.accent} />
              </Pressable>
            </View>
            <PasswordStrengthMeter password={password} />

            <StyledTextInput
              label="Confirm Password"
              placeholder={STRINGS.protect.confirmPlaceholder}
              value={confirmPassword}
              onChangeText={t => { setConfirmPassword(t); setErrors(e => ({ ...e, confirm: '' })); }}
              isPassword error={errors.confirm}
            />

            {/* Self-destruct toggle */}
            <View style={[styles.sdCard, { backgroundColor: colors.surface, borderColor: selfDestruct ? colors.error : colors.border }]}>
              <View style={styles.sdRow}>
                <Ionicons name="timer-outline" size={20} color={selfDestruct ? colors.error : colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sdTitle, { color: colors.text }]}>Temporary Secret Message</Text>
                  <Text style={[styles.sdDesc, { color: colors.textMuted }]}>Message disappears after being opened</Text>
                </View>
                <Switch
                  value={selfDestruct}
                  onValueChange={v => { haptics.light(); setSelfDestruct(v); }}
                  trackColor={{ false: colors.border, true: 'rgba(248,113,113,0.3)' }}
                  thumbColor={selfDestruct ? colors.error : colors.textMuted}
                />
              </View>
              {selfDestruct && (
                <View style={styles.sdOptions}>
                  {SD_OPTIONS.map(opt => (
                    <Pressable
                      key={opt.seconds}
                      onPress={() => { haptics.light(); setSdSeconds(opt.seconds); }}
                      style={[styles.sdChip, {
                        backgroundColor: sdSeconds === opt.seconds ? colors.error + '20' : colors.surface2,
                        borderColor: sdSeconds === opt.seconds ? colors.error : colors.border,
                      }]}
                    >
                      <Text style={[styles.sdChipText, { color: sdSeconds === opt.seconds ? colors.error : colors.textMuted }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.btnRow}>
              <Button label={STRINGS.protect.clear} onPress={handleClear} variant="secondary" style={{ flex: 1 }} />
              <Button label={STRINGS.protect.button} onPress={handleProtect} loading={loading} style={{ flex: 2 }} />
            </View>

            {result && (
              <>
                <OutputBox text={result} label="Protected Text" showShare autoClearSeconds={60} />
                <View style={styles.extraBtns}>
                  <Button
                    label={savedToVault ? '✓ Saved to Vault' : 'Save to Vault'}
                    onPress={handleSaveToVault}
                    variant={savedToVault ? 'ghost' : 'secondary'}
                    disabled={savedToVault}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Show QR"
                    onPress={() => router.push({ pathname: '/qr-share', params: { text: result } })}
                    variant="secondary"
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge },
  messageInput: { minHeight: 120, paddingTop: SPACING.lg },
  passwordRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  genBtn: { width: 50, height: 50, borderRadius: RADIUS.lg, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  sdCard: { borderRadius: RADIUS.xl, borderWidth: 1.5, padding: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.md },
  sdRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  sdTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  sdDesc: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 2 },
  sdOptions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  sdChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, borderWidth: 1 },
  sdChipText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  extraBtns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});
