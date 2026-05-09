import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { useAppLockStore } from '@/store/appLockStore';
import { openInternal, protectInternal } from '@/crypto/cryptoService';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

// Matches notes.tsx / workspace.tsx — encryption key when no PIN is configured
const DEVICE_FALLBACK_KEY = '__ADEV_NOPIN__';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeContext();
  const { items, updateItem, addItem, deleteItem, togglePin, toggleFavorite } = useVaultStore();
  const { sessionPin } = useAppLockStore();

  const isNewInit = id === 'new';
  const [currentId, setCurrentId] = useState(id as string);
  const isNew = currentId === 'new';
  const item = items.find(i => i.id === currentId);

  const [title, setTitle] = useState(item?.title || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNewInit);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Decrypt on load
  useEffect(() => {
    if (isNewInit) { setLoading(false); return; }
    if (!item) { setLoading(false); return; }
    openInternal(item.encryptedContent, sessionPin ?? DEVICE_FALLBACK_KEY).then(result => {
      if (result.success && result.data) setContent(result.data);
      setLoading(false);
    });
  }, []);

  // Auto-save after 2 seconds of inactivity
  const triggerAutoSave = (newContent: string, newTitle: string) => {
    setHasChanges(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => save(newContent, newTitle), 2000);
  };

  const save = async (c = content, t = title) => {
    if (!hasChanges) return;
    if (currentId === 'new' && !c.trim() && !t.trim()) return; // Don't save if completely empty new note
    setSaving(true);
    const result = await protectInternal(c, sessionPin ?? DEVICE_FALLBACK_KEY);
    if (result.success && result.data) {
      if (currentId === 'new') {
        const newId = addItem({
          title: t || 'Untitled Note',
          type: 'note',
          encryptedContent: result.data,
          tags: [],
          pinned: false,
          favorite: false,
        });
        setCurrentId(newId);
        router.setParams({ id: newId });
      } else {
        updateItem(currentId, {
          title: t || 'Untitled Note',
          encryptedContent: result.data,
        });
      }
      setHasChanges(false);
    }
    setSaving(false);
  };

  const handleBack = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (hasChanges) await save();
    router.back();
  };

  const handleDelete = () => {
    if (isNew) { router.back(); return; }
    Alert.alert('Delete Note', 'Delete this note permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { haptics.medium(); deleteItem(currentId); router.back(); } },
    ]);
  };

  if (!item && !isNew) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.headerActions}>
            {saving && <Text style={[styles.savingText, { color: colors.textMuted }]}>Saving…</Text>}
            {!saving && hasChanges && <Text style={[styles.savingText, { color: colors.accent }]}>Unsaved</Text>}
            <Pressable onPress={() => { haptics.light(); if(!isNew) togglePin(currentId); }} hitSlop={8}>
              <Ionicons name="pin-outline" size={22} color={item?.pinned ? colors.accent : colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => { haptics.light(); if(!isNew) toggleFavorite(currentId); }} hitSlop={8}>
              <Ionicons name={item?.favorite ? 'star' : 'star-outline'} size={22} color={item?.favorite ? '#FBBF24' : colors.textMuted} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Title */}
          <TextInput
            value={title}
            onChangeText={t => { setTitle(t); triggerAutoSave(content, t); }}
            placeholder="Note title…"
            placeholderTextColor={colors.textDim}
            style={[styles.titleInput, { color: colors.text, borderBottomColor: colors.border }]}
          />

          {/* Content */}
          {loading ? (
            <View style={styles.loadingArea}>
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Decrypting…</Text>
            </View>
          ) : (
            <TextInput
              value={content}
              onChangeText={c => { setContent(c); triggerAutoSave(c, title); }}
              placeholder="Start writing your private note…"
              placeholderTextColor={colors.textDim}
              style={[styles.contentInput, { color: colors.text }]}
              multiline
              textAlignVertical="top"
              autoFocus={!loading && !content}
            />
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.accent} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Encrypted · {content.length} chars
            </Text>
            <Text style={[styles.footerDate, { color: colors.textDim }]}>
              {item ? new Date(item.updatedAt).toLocaleDateString() : 'Just now'}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  savingText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm },
  titleInput: {
    fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, letterSpacing: -0.5,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
  },
  contentInput: {
    flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 26,
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg,
  },
  loadingArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderTopWidth: 1,
  },
  footerText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs, flex: 1 },
  footerDate: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs },
});
