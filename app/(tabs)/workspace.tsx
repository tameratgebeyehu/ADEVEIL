import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Alert,
  LayoutAnimation, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { useAppLockStore } from '@/store/appLockStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { protectInternal } from '@/crypto/cryptoService';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { QuickLockBtn } from '@/components/QuickLockBtn';

const FOCUS_DURATION = 25 * 60; // 25 min in seconds

// Used as encryption key when no app PIN is set — ensures drafts are always
// encrypted at rest even without a user PIN, consistent with the Notes screen.
const DEVICE_FALLBACK_KEY = '__ADEV_NOPIN__';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WorkspaceScreen() {
  const router = useRouter();
  const { colors, reduceMotion } = useThemeContext();
  const { addItem } = useVaultStore();
  const { sessionPin } = useAppLockStore();
  const { incrementNote, addActivity } = useAnalyticsStore();

  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerLeft, setTimerLeft] = useState(FOCUS_DURATION);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const toggleFocusMode = (enable: boolean) => {
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusMode(enable);
  };

  useEffect(() => {
    if (timerActive && timerLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerLeft(s => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            haptics.success();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSave = async () => {
    if (!text.trim()) return;
    const encryptionKey = sessionPin ?? DEVICE_FALLBACK_KEY;
    const result = await protectInternal(text.trim(), encryptionKey);
    if (result.success && result.data) {
      addItem({
        title: title.trim() || `Workspace Draft — ${new Date().toLocaleDateString()}`,
        type: 'note',
        encryptedContent: result.data,
        tags: ['workspace'],
        pinned: false,
        favorite: false,
        wordCount,
      });
      incrementNote();
      addActivity({ type: 'note_created', label: 'Workspace draft saved' });
      setSaved(true);
      haptics.success();
    }
  };

  const handleBack = () => {
    if (text.trim() && !saved) {
      Alert.alert('Save Draft?', 'Your workspace text will be encrypted and saved to Notes.', [
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        { text: 'Save & Exit', onPress: async () => { await handleSave(); router.back(); } },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: focusMode ? '#000' : colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        {!focusMode && (
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={handleBack} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title…"
              placeholderTextColor={colors.textDim}
              style={[styles.titleInput, { color: colors.text }]}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={() => { haptics.light(); toggleFocusMode(true); }} style={styles.iconBtn}>
                <Ionicons name="expand-outline" size={20} color={colors.textMuted} />
              </Pressable>
              <QuickLockBtn />
            </View>
          </View>
        )}

        {/* Focus mode top bar */}
        {focusMode && (
          <View style={styles.focusBar}>
            <Pressable onPress={() => toggleFocusMode(false)} hitSlop={12}>
              <Ionicons name="contract-outline" size={20} color="rgba(255,255,255,0.4)" />
            </Pressable>
            {timerActive
              ? <Text style={styles.focusTimer}>{formatTime(timerLeft)}</Text>
              : <Pressable onPress={() => { setTimerLeft(FOCUS_DURATION); setTimerActive(true); haptics.light(); }} hitSlop={12}>
                  <Text style={styles.focusStart}>Start 25 min focus</Text>
                </Pressable>
            }
            <Pressable onPress={handleSave} hitSlop={12}>
              <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={20} color={saved ? '#34D399' : 'rgba(255,255,255,0.4)'} />
            </Pressable>
          </View>
        )}

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TextInput
            value={text}
            onChangeText={t => { setText(t); setSaved(false); }}
            placeholder={focusMode ? '' : 'Start writing your private draft…\n\nYour text is encrypted when saved.'}
            placeholderTextColor={focusMode ? 'transparent' : colors.textDim}
            style={[
              styles.editor,
              { color: focusMode ? 'rgba(255,255,255,0.9)' : colors.text },
              focusMode && styles.editorFocus,
            ]}
            multiline
            textAlignVertical="top"
            autoFocus
            scrollEnabled
          />

          {/* Footer */}
          {!focusMode && (
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.accent} />
              <Text style={[styles.footerStat, { color: colors.textMuted }]}>
                {wordCount} words · {charCount} chars
              </Text>
              <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: saved ? colors.success + '20' : colors.accent }]}>
                <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={16} color={saved ? colors.success : '#fff'} />
                <Text style={[styles.saveBtnText, { color: saved ? colors.success : '#fff' }]}>
                  {saved ? 'Saved!' : 'Encrypt & Save'}
                </Text>
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleInput: { flex: 1, fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg, padding: 0 },
  focusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  focusTimer: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.lg, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  focusStart: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.3)' },
  editor: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 28, padding: SPACING.xl, textAlignVertical: 'top' },
  editorFocus: { fontFamily: FONTS.regular, fontSize: 18, lineHeight: 32, paddingHorizontal: SPACING.xxxl },
  footer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderTopWidth: 1 },
  footerStat: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  saveBtnText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
});
