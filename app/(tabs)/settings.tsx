import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import { useAccessibilityStore, FONT_SCALE_MAP } from '@/store/accessibilityStore';
import { useVaultStore } from '@/store/vaultStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useAppLockStore } from '@/store/appLockStore';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { SearchBar } from '@/components/ui/SearchBar';
import { isPinSet, clearPin } from '@/services/passwordService';
import { clearDecoyPin, isDecoyPinSet } from '@/services/exportService';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import type { LockTimeout, FontScale } from '@/types/vault.types';

interface SettingDef {
  key: string;
  section: string;
  title: string;
  subtitle?: string;
  icon: string;
  keywords: string[];
  type: 'toggle' | 'nav' | 'picker' | 'action';
  danger?: boolean;
}

// All settings defined as data — allows search filtering
const SETTINGS_DEF: SettingDef[] = [
  { key: 'pin', section: 'SECURITY', title: 'Change PIN', subtitle: 'Set or update app lock PIN', icon: 'keypad-outline', keywords: ['pin', 'password', 'lock', 'code'], type: 'nav' },
  { key: 'biometric', section: 'SECURITY', title: 'Biometric Unlock', subtitle: 'Fingerprint or face unlock', icon: 'finger-print-outline', keywords: ['biometric', 'fingerprint', 'face', 'unlock'], type: 'toggle' },
  { key: 'lockNow', section: 'SECURITY', title: 'Lock Now', subtitle: 'Lock the app immediately', icon: 'lock-closed-outline', keywords: ['lock', 'secure'], type: 'action' },
  { key: 'lockTimeout', section: 'SECURITY', title: 'Auto-Lock Timeout', subtitle: 'Lock after inactivity', icon: 'timer-outline', keywords: ['timeout', 'auto lock', 'idle'], type: 'picker' },
  { key: 'shakeToLock', section: 'SECURITY', title: 'Shake to Lock', subtitle: 'Shake device to lock (off by default)', icon: 'phone-portrait-outline', keywords: ['shake', 'gesture', 'lock'], type: 'toggle' },
  { key: 'decoyPin', section: 'SECURITY', title: 'Decoy PIN Setup', subtitle: 'Alternate PIN opens empty vault', icon: 'eye-off-outline', keywords: ['decoy', 'fake', 'hidden', 'pin'], type: 'nav' },
  { key: 'screenshotBlock', section: 'RUNTIME SECURITY', title: 'Block Screenshots', subtitle: 'Prevents screenshots on sensitive screens', icon: 'camera-reverse-outline', keywords: ['screenshot', 'record', 'block', 'privacy'], type: 'toggle' },
  { key: 'autoHideMessages', section: 'RUNTIME SECURITY', title: 'Auto-Hide Messages', subtitle: 'Blur decrypted messages on idle', icon: 'eye-off-outline', keywords: ['hide', 'blur', 'idle', 'timeout'], type: 'toggle' },
  { key: 'autoHideSeconds', section: 'RUNTIME SECURITY', title: 'Auto-Hide Timeout', subtitle: 'Time before blurring', icon: 'hourglass-outline', keywords: ['timeout', 'seconds', 'blur'], type: 'picker' },
  { key: 'viewOnceMode', section: 'RUNTIME SECURITY', title: 'View Once Mode', subtitle: 'Delete messages after closing', icon: 'trash-bin-outline', keywords: ['view once', 'delete', 'temporary'], type: 'toggle' },
  { key: 'showClipboardTimer', section: 'RUNTIME SECURITY', title: 'Clipboard Timer UI', subtitle: 'Show countdown when copying', icon: 'timer-outline', keywords: ['clipboard', 'timer', 'countdown'], type: 'toggle' },
  { key: 'clipboardClearSeconds', section: 'RUNTIME SECURITY', title: 'Clipboard Clear Timeout', subtitle: 'Time before auto-clearing', icon: 'clipboard-outline', keywords: ['clipboard', 'timeout', 'clear'], type: 'picker' },
  { key: 'autoClearClipboard', section: 'PRIVACY', title: 'Auto-Clear Clipboard', subtitle: 'Clears copied text after 60 seconds', icon: 'clipboard-outline', keywords: ['clipboard', 'copy', 'clear'], type: 'toggle' },
  { key: 'privacyBlur', section: 'PRIVACY', title: 'Privacy Blur', subtitle: 'Blur app when switching tasks', icon: 'eye-off-outline', keywords: ['blur', 'privacy', 'screenshot', 'background'], type: 'toggle' },
  { key: 'scanQR', section: 'TOOLS', title: 'Scan QR Code', subtitle: 'Open a protected message via QR', icon: 'scan-outline', keywords: ['qr', 'scan', 'camera'], type: 'nav' },
  { key: 'exportBackup', section: 'BACKUP', title: 'Backup & Restore', subtitle: 'Export encrypted vault backup', icon: 'cloud-download-outline', keywords: ['backup', 'export', 'restore', 'import'], type: 'nav' },
  { key: 'fontSize', section: 'ACCESSIBILITY', title: 'Text Size', subtitle: 'Adjust app font scale', icon: 'text-outline', keywords: ['font', 'text', 'size', 'accessibility', 'large'], type: 'picker' },
  { key: 'highContrast', section: 'ACCESSIBILITY', title: 'High Contrast', subtitle: 'Increase text contrast', icon: 'contrast-outline', keywords: ['contrast', 'accessibility', 'visibility'], type: 'toggle' },
  { key: 'reduceMotion', section: 'ACCESSIBILITY', title: 'Reduce Motion', subtitle: 'Disable animations', icon: 'pulse-outline', keywords: ['motion', 'animation', 'reduce', 'accessibility'], type: 'toggle' },
  { key: 'haptic', section: 'ACCESSIBILITY', title: 'Haptic Feedback', subtitle: 'Vibration on interactions', icon: 'phone-portrait-outline', keywords: ['haptic', 'vibration', 'feedback'], type: 'toggle' },
  { key: 'about', section: 'INFO', title: 'About ADEVeil', icon: 'information-circle-outline', keywords: ['about', 'version', 'info'], type: 'nav' },
  { key: 'privacyCenter', section: 'INFO', title: 'Privacy Center', subtitle: 'How ADEVeil protects you — in plain language', icon: 'shield-checkmark-outline', keywords: ['privacy', 'trust', 'data', 'permissions', 'transparency'], type: 'nav' },
  { key: 'replayOnboarding', section: 'INFO', title: 'View Privacy Intro', subtitle: 'Replay the onboarding slides', icon: 'play-circle-outline', keywords: ['onboarding', 'intro', 'tour', 'slides'], type: 'action' },
  { key: 'reset', section: 'DANGER', title: 'Reset App', subtitle: 'Clear all vault data and settings', icon: 'trash-outline', keywords: ['reset', 'clear', 'delete', 'wipe'], type: 'action', danger: true },
];

const TIMEOUT_OPTIONS: { label: string; value: LockTimeout }[] = [
  { label: 'Immediately', value: 0 },
  { label: '15 seconds', value: 15 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
];

const FONT_OPTIONS: { label: string; value: FontScale }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'xlarge' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, fontScale } = useThemeContext();
  const settings = useSettingsStore();
  const a11y = useAccessibilityStore();
  const { clearAll: clearVault } = useVaultStore();
  const { resetAll: resetAnalytics } = useAnalyticsStore();
  const { lock } = useAppLockStore();
  const [search, setSearch] = useState('');
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  const filtered = search.trim()
    ? SETTINGS_DEF.filter(s => s.keywords.some(k => k.includes(search.toLowerCase())) || s.title.toLowerCase().includes(search.toLowerCase()))
    : SETTINGS_DEF;

  const sections = [...new Set(filtered.map(s => s.section))];

  const getToggleValue = (key: string): boolean => {
    switch (key) {
      case 'biometric': return settings.biometricEnabled;
      case 'autoClearClipboard': return settings.autoClearClipboard;
      case 'privacyBlur': return settings.privacyBlur;
      case 'shakeToLock': return settings.shakeToLock;
      case 'screenshotBlock': return settings.screenshotBlock;
      case 'autoHideMessages': return settings.autoHideMessages;
      case 'viewOnceMode': return settings.viewOnceMode;
      case 'showClipboardTimer': return settings.showClipboardTimer;
      case 'highContrast': return a11y.highContrast;
      case 'reduceMotion': return a11y.reduceMotion;
      case 'haptic': return a11y.hapticEnabled;
      default: return false;
    }
  };

  const handleToggle = (key: string, val: boolean) => {
    haptics.light();
    switch (key) {
      case 'biometric': settings.setBiometricEnabled(val); break;
      case 'autoClearClipboard': settings.setAutoClearClipboard(val); break;
      case 'privacyBlur': settings.setPrivacyBlur(val); break;
      case 'shakeToLock': settings.setShakeToLock(val); break;
      case 'screenshotBlock': settings.setScreenshotBlock(val); break;
      case 'autoHideMessages': settings.setAutoHideMessages(val); break;
      case 'viewOnceMode': settings.setViewOnceMode(val); break;
      case 'showClipboardTimer': settings.setShowClipboardTimer(val); break;
      case 'highContrast': a11y.setHighContrast(val); break;
      case 'reduceMotion': a11y.setReduceMotion(val); break;
      case 'haptic': a11y.setHapticEnabled(val); break;
    }
  };

  const handleNav = (key: string) => {
    haptics.light();
    switch (key) {
      case 'pin': router.push('/change-pin'); break;
      case 'scanQR': router.push('/qr-scan'); break;
      case 'exportBackup': router.push('/export'); break;
      case 'about': router.push('/(tabs)/about'); break;
      case 'decoyPin': router.push('/setup-decoy-pin'); break;
      case 'privacyCenter': router.push('/privacy'); break;
    }
  };

  const handleAction = (key: string) => {
    if (key === 'lockNow') {
      haptics.medium();
      lock();
      router.replace('/app-lock');
    }
    if (key === 'replayOnboarding') {
      router.push('/onboarding');
    }
    if (key === 'reset') {
      Alert.alert('Reset App', 'This clears all settings, vault data, and PINs. Permanent.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything', style: 'destructive',
          onPress: async () => {
            clearVault();
            settings.resetAll();
            resetAnalytics();
            await clearPin();
            await clearDecoyPin();
            // Clear first-launch flags so onboarding shows again
            await AsyncStorage.multiRemove(['hasSeenWelcome', 'ADEV_ONBOARDED']);
            haptics.success();
            Alert.alert('Done', 'App has been fully reset.');
          },
        },
      ]);
    }
  };

  const renderRow = (s: SettingDef) => {
    const isPickerOpen = openPicker === s.key;
    return (
      <View key={s.key}>
        <Pressable
          style={[styles.row, { backgroundColor: s.danger ? colors.errorBg : colors.surface, borderColor: s.danger ? colors.error : colors.border }]}
          onPress={() => {
            if (s.type === 'nav') handleNav(s.key);
            else if (s.type === 'action') handleAction(s.key);
            else if (s.type === 'picker') setOpenPicker(p => p === s.key ? null : s.key);
          }}
        >
          <View style={[styles.rowIcon, { backgroundColor: s.danger ? 'rgba(248,113,113,0.15)' : colors.surface2 }]}>
            <Ionicons name={s.icon as any} size={20} color={s.danger ? colors.error : colors.accent} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: s.danger ? colors.error : colors.text, fontSize: FONT_SIZE.md * fontScale }]}>{s.title}</Text>
            {s.subtitle ? <Text style={[styles.rowSub, { color: colors.textMuted, fontSize: FONT_SIZE.sm * fontScale }]}>{s.subtitle}</Text> : null}
          </View>
          {s.type === 'toggle' && (
            <Switch
              value={getToggleValue(s.key)}
              onValueChange={v => handleToggle(s.key, v)}
              trackColor={{ false: colors.border, true: colors.accentGlow }}
              thumbColor={getToggleValue(s.key) ? colors.accent : colors.textMuted}
            />
          )}
          {(s.type === 'nav' || s.type === 'picker' || (s.type === 'action' && !s.danger)) && (
            <Ionicons name={s.type === 'picker' && isPickerOpen ? 'chevron-up' : 'chevron-forward'} size={18} color={colors.textDim} />
          )}
        </Pressable>

        {/* Inline picker */}
        {s.type === 'picker' && isPickerOpen && (
          <View style={[styles.picker, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            {s.key === 'lockTimeout' && TIMEOUT_OPTIONS.map(opt => (
              <Pressable key={opt.value} onPress={() => { haptics.light(); settings.setLockTimeout(opt.value); setOpenPicker(null); }} style={[styles.pickerItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerText, { color: settings.lockTimeout === opt.value ? colors.accent : colors.text, fontSize: FONT_SIZE.md * fontScale }]}>{opt.label}</Text>
                {settings.lockTimeout === opt.value && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </Pressable>
            ))}
            {s.key === 'autoHideSeconds' && TIMEOUT_OPTIONS.filter(o => o.value > 0).map(opt => (
              <Pressable key={opt.value} onPress={() => { haptics.light(); settings.setAutoHideSeconds(opt.value); setOpenPicker(null); }} style={[styles.pickerItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerText, { color: settings.autoHideSeconds === opt.value ? colors.accent : colors.text, fontSize: FONT_SIZE.md * fontScale }]}>{opt.label}</Text>
                {settings.autoHideSeconds === opt.value && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </Pressable>
            ))}
            {s.key === 'clipboardClearSeconds' && TIMEOUT_OPTIONS.filter(o => o.value > 0).map(opt => (
              <Pressable key={opt.value} onPress={() => { haptics.light(); settings.setClipboardClearSeconds(opt.value); setOpenPicker(null); }} style={[styles.pickerItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerText, { color: settings.clipboardClearSeconds === opt.value ? colors.accent : colors.text, fontSize: FONT_SIZE.md * fontScale }]}>{opt.label}</Text>
                {settings.clipboardClearSeconds === opt.value && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </Pressable>
            ))}
            {s.key === 'fontSize' && FONT_OPTIONS.map(opt => (
              <Pressable key={opt.value} onPress={() => { haptics.light(); a11y.setFontSize(opt.value); setOpenPicker(null); }} style={[styles.pickerItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerText, { color: a11y.fontSize === opt.value ? colors.accent : colors.text, fontSize: FONT_SIZE.md * fontScale }]}>{opt.label}</Text>
                {a11y.fontSize === opt.value && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: colors.text, fontSize: FONT_SIZE.xxl * fontScale }]}>Settings</Text>

          {/* Search */}
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search settings…" />

          {/* Theme */}
          {!search && (
            <>
              <Text style={[styles.sectionHead, { color: colors.textMuted, fontSize: FONT_SIZE.xs * fontScale }]}>APPEARANCE</Text>
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardLabel, { color: colors.textMuted, fontSize: FONT_SIZE.sm * fontScale }]}>Theme</Text>
                <ThemeSelector />
              </View>
            </>
          )}

          {/* Dynamic sections */}
          {sections.map(section => (
            <View key={section}>
              <Text style={[styles.sectionHead, { color: colors.textMuted, fontSize: FONT_SIZE.xs * fontScale }]}>{section}</Text>
              {filtered.filter(s => s.section === section).map(renderRow)}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge, gap: SPACING.xs },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, letterSpacing: -0.5, marginBottom: SPACING.md },
  sectionHead: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs, letterSpacing: 1.5, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, gap: SPACING.md },
  cardLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.xs },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.md },
  rowSub: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 2 },
  picker: { borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: SPACING.xs, overflow: 'hidden' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderBottomWidth: 1 },
  pickerText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.md },
});
