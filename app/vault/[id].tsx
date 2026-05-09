import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { useAppLockStore } from '@/store/appLockStore';
import { openMessage, openInternal } from '@/crypto/cryptoService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SelfDestructBadge } from '@/components/SelfDestructBadge';
import { Button } from '@/components/ui/Button';
import { copyToClipboard } from '@/services/clipboardService';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

// Fallback key used when no PIN is set (matches notes.tsx & workspace.tsx)
const DEVICE_FALLBACK_KEY = '__ADEV_NOPIN__';

export default function VaultItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeContext();
  const { items, deleteItem, togglePin, toggleFavorite } = useVaultStore();
  const { sessionPin } = useAppLockStore();

  const item = items.find(i => i.id === id);
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  // For 'message' type items (encrypted with a custom password, not sessionPin)
  const [needsPassword, setNeedsPassword] = useState(false);
  const [manualPassword, setManualPassword] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    if (!item) return;

    if (item.type === 'note') {
      // Notes encrypted with sessionPin — use fast internal path
      decrypt(sessionPin ?? DEVICE_FALLBACK_KEY, 'internal');
    } else {
      // Messages from protect.tsx are encrypted with a user-defined password
      // We don't know that password here, so ask the user.
      setNeedsPassword(true);
      setLoading(false);
    }
  }, [item]);

  const decrypt = async (key: string, mode: 'internal' | 'external' = 'external') => {
    if (!item) return;
    setLoading(true);
    const result = mode === 'internal'
      ? await openInternal(item.encryptedContent, key)
      : await openMessage(item.encryptedContent, key);
    if (result.success && result.data) {
      setDecrypted(result.data);
      setNeedsPassword(false);
      setManualError('');
    } else {
      setDecrypted(null);
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async () => {
    if (!manualPassword) { setManualError('Enter the password'); return; }
    setManualLoading(true);
    setManualError('');
    const result = await openMessage(item!.encryptedContent, manualPassword);
    if (result.success && result.data) {
      setDecrypted(result.data);
      setNeedsPassword(false);
    } else {
      haptics.error();
      setManualError('Wrong password — try again');
    }
    setManualLoading(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', 'This will permanently delete this item from your vault.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { haptics.medium(); deleteItem(id!); router.back(); },
      },
    ]);
  };

  const handleCopy = async () => {
    if (!decrypted) return;
    await copyToClipboard(decrypted, 60);
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpired = () => {
    setExpired(true);
    setDecrypted(null);
    deleteItem(id!);
  };

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.centered}>
          <Text style={[styles.title, { color: colors.text }]}>Item not found</Text>
          <Button label="Go Back" onPress={() => router.back()} variant="ghost" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Vault Item'}
          </Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => toggleFavorite(id!)} hitSlop={8}>
              <Ionicons
                name={item.favorite ? 'star' : 'star-outline'}
                size={22}
                color={item.favorite ? '#FBBF24' : colors.textMuted}
              />
            </Pressable>
            <Pressable onPress={() => togglePin(id!)} hitSlop={8}>
              <Ionicons name="pin-outline" size={22} color={item.pinned ? colors.accent : colors.textMuted} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Self-destruct timer */}
          {item.selfDestructSeconds && decrypted && !expired && (
            <SelfDestructBadge seconds={item.selfDestructSeconds} onExpired={handleExpired} />
          )}

          {expired && (
            <StatusBadge type="error" title="Message Destroyed" subtitle="This temporary message no longer exists." />
          )}

          {/* Loading spinner */}
          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Opening…</Text>
            </View>
          )}

          {/* Password prompt for 'message' type items */}
          {needsPassword && !decrypted && !expired && (
            <View style={[styles.passwordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={28} color={colors.accent} />
              <Text style={[styles.passwordCardTitle, { color: colors.text }]}>
                Enter message password
              </Text>
              <Text style={[styles.passwordCardDesc, { color: colors.textMuted }]}>
                This message was protected with a custom password. Enter it to view the content.
              </Text>
              <TextInput
                value={manualPassword}
                onChangeText={t => { setManualPassword(t); setManualError(''); }}
                placeholder="Enter password…"
                placeholderTextColor={colors.textDim}
                secureTextEntry
                autoFocus
                style={[styles.passwordInput, {
                  color: colors.text,
                  backgroundColor: colors.surface2,
                  borderColor: manualError ? colors.error : colors.border,
                }]}
                onSubmitEditing={handlePasswordSubmit}
                returnKeyType="go"
              />
              {manualError ? (
                <Text style={[styles.manualError, { color: colors.error }]}>{manualError}</Text>
              ) : null}
              <Button
                label="Open Message"
                onPress={handlePasswordSubmit}
                loading={manualLoading}
              />
            </View>
          )}

          {/* Decrypted content */}
          {decrypted && !expired && (
            <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text selectable style={[styles.contentText, { color: colors.text }]}>
                {decrypted}
              </Text>
              <Pressable onPress={handleCopy} style={styles.copyBtn}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? colors.success : colors.textMuted} />
                <Text style={[styles.copyText, { color: copied ? colors.success : colors.textMuted }]}>
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: colors.textDim }]}>
              Created {new Date(item.createdAt).toLocaleString()}
            </Text>
            {item.updatedAt !== item.createdAt && (
              <Text style={[styles.metaText, { color: colors.textDim }]}>
                Updated {new Date(item.updatedAt).toLocaleString()}
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', gap: SPACING.md },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge },
  loadingWrap: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xl },
  loadingText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm },
  passwordCard: {
    borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl,
    alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.lg,
  },
  passwordCardTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  passwordCardDesc: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 20 },
  passwordInput: {
    width: '100%', borderRadius: RADIUS.lg, borderWidth: 1,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontFamily: FONTS.regular, fontSize: FONT_SIZE.md,
  },
  manualError: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  content: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, marginBottom: SPACING.lg },
  contentText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 26, marginBottom: SPACING.lg },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  copyText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xl },
  meta: { gap: 4 },
  metaText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs },
});
