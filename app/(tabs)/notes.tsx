import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { useAppLockStore } from '@/store/appLockStore';
import { protectMessage } from '@/crypto/cryptoService';
import { Button } from '@/components/ui/Button';
import { haptics } from '@/services/hapticService';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import type { VaultItem } from '@/types/vault.types';
import { QuickLockBtn } from '@/components/QuickLockBtn';

// Matches workspace.tsx — used when no PIN is configured
const DEVICE_FALLBACK_KEY = '__ADEV_NOPIN__';

export default function NotesScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { items, addItem, deleteItem } = useVaultStore();
  const { sessionPin } = useAppLockStore();
  const [search, setSearch] = useState('');

  const notes = items.filter(i => i.type === 'note');
  const filtered = notes.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  const handleNewNote = () => {
    haptics.medium();
    router.push('/note/new');
  };

  const renderNoteCard = (item: VaultItem) => {
    const date = new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return (
      <Pressable
        key={item.id}
        onPress={() => { haptics.light(); router.push(`/note/${item.id}`); }}
        style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.noteHeader}>
          {item.pinned && <Ionicons name="pin" size={14} color={colors.text} style={{ marginRight: 4 }} />}
          <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={[styles.noteDate, { color: colors.textDim }]}>{date}</Text>
        </View>
        <View style={styles.noteFooter}>
          <View style={[styles.encBadge, { borderColor: colors.border }]}>
            <Ionicons name="lock-closed" size={10} color={colors.accent} />
            <Text style={[styles.encText, { color: colors.accent }]}>Protected</Text>
          </View>
          {item.favorite && <Ionicons name="star" size={14} color="#FBBF24" />}
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} style={{ marginLeft: 'auto' }} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {notes.length} encrypted {notes.length === 1 ? 'note' : 'notes'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
              <Pressable
                onPress={handleNewNote}
                style={[styles.newBtn, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </Pressable>
              <QuickLockBtn />
            </View>
          </View>

          {/* Search */}
          <View style={[styles.searchBar, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search notes…"
              placeholderTextColor={colors.textDim}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {search ? <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={colors.textMuted} /></Pressable> : null}
          </View>

          {/* Pinned */}
          {pinned.length > 0 && (
            <>
              <Text style={[styles.section, { color: colors.textMuted }]}>PINNED</Text>
              {pinned.map(renderNoteCard)}
            </>
          )}

          {/* All notes */}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && <Text style={[styles.section, { color: colors.textMuted }]}>ALL NOTES</Text>}
              {unpinned.map(renderNoteCard)}
            </>
          )}

          {/* Empty */}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="document-text" size={56} color={colors.textMuted} style={{ marginBottom: SPACING.lg }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {search ? 'No notes found' : 'No secret notes yet'}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {search ? 'Try a different search.' : 'Create a note. It stays encrypted and private on your device.'}
              </Text>
              {!search && (
                <Button label="New Note" onPress={handleNewNote} style={{ marginTop: SPACING.xl, width: '70%' }} />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 3 },
  newBtn: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.xl, borderWidth: 1,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, marginBottom: SPACING.lg,
  },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, padding: 0 },
  section: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs, letterSpacing: 1.5, marginBottom: SPACING.md, marginTop: SPACING.sm },
  noteCard: {
    borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl,
    marginBottom: SPACING.sm, gap: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, flex: 1 },
  noteDate: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs },
  noteFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  encBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  encText: { fontFamily: FONTS.semiBold, fontSize: 10 },
  empty: { alignItems: 'center', paddingTop: SPACING.huge },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xl, marginBottom: SPACING.sm },
  emptyDesc: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22, paddingHorizontal: SPACING.xl },
});
