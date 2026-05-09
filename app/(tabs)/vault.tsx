import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { useAppLockStore } from '@/store/appLockStore';
import { VaultCard } from '@/components/VaultCard';
import { Button } from '@/components/ui/Button';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { haptics } from '@/services/hapticService';
import { useSecureScreen } from '@/hooks/useSecureScreen';
import { QuickLockBtn } from '@/components/QuickLockBtn';

type FilterTab = 'all' | 'messages' | 'notes' | 'favorites';

export default function VaultScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { items, toggleFavorite, deleteItem } = useVaultStore();
  const { sessionPin, isLocked } = useAppLockStore();

  useSecureScreen();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const filtered = items.filter(item => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'messages' && item.type === 'message') ||
      (filter === 'notes' && item.type === 'note') ||
      (filter === 'favorites' && item.favorite);
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pinned = filtered.filter(i => i.pinned);
  const unpinned = filtered.filter(i => !i.pinned);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Item', `Delete "${title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { haptics.medium(); deleteItem(id); },
      },
    ]);
  };

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'messages', label: 'Messages' },
    { key: 'notes', label: 'Notes' },
    { key: 'favorites', label: 'Favorites' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Vault</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {items.length} {items.length === 1 ? 'item' : 'items'} stored
              </Text>
            </View>
            <QuickLockBtn />
          </View>

          {/* Search bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search vault…"
              placeholderTextColor={colors.textDim}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {/* Filter tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {FILTER_TABS.map(tab => (
              <Pressable
                key={tab.key}
                onPress={() => { haptics.light(); setFilter(tab.key); }}
                style={[
                  styles.tab,
                  {
                    backgroundColor: filter === tab.key ? colors.accent : colors.surface2,
                    borderColor: filter === tab.key ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tabText, { color: filter === tab.key ? '#fff' : colors.textMuted }]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Pinned items */}
          {pinned.length > 0 && (
            <>
              <Text style={[styles.section, { color: colors.textMuted }]}>PINNED</Text>
              {pinned.map(item => (
                <VaultCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/vault/${item.id}`)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              ))}
            </>
          )}

          {/* Regular items */}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && (
                <Text style={[styles.section, { color: colors.textMuted }]}>ALL ITEMS</Text>
              )}
              {unpinned.map(item => (
                <VaultCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/vault/${item.id}`)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              ))}
            </>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="lock-closed" size={56} color={colors.textMuted} style={{ marginBottom: SPACING.lg }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {search ? 'No matches found' : 'Your vault is empty'}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {search
                  ? 'Try a different search term'
                  : 'Protect a message and save it here for quick access later.'}
              </Text>
              {!search && (
                <Button
                  label="Protect a Message"
                  onPress={() => router.push('/protect')}
                  style={{ marginTop: SPACING.xl, width: '80%' }}
                />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, padding: 0 },
  tabs: { marginBottom: SPACING.xl },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  tabText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  section: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs, letterSpacing: 1.5, marginBottom: SPACING.md, marginTop: SPACING.md },
  empty: { alignItems: 'center', paddingTop: SPACING.huge },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xl, marginBottom: SPACING.sm },
  emptyDesc: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22, paddingHorizontal: SPACING.xl },
});
