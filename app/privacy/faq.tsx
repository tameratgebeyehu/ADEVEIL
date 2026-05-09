import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { AccordionItem } from '@/components/trust/AccordionItem';
import { FAQ_ITEMS } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

export default function FAQScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const [query, setQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  // Filter FAQ by query
  const filtered = FAQ_ITEMS.filter(
    item =>
      !query.trim() ||
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>FAQ</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Search bar */}
            <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={18} color={colors.textDim} />
              <Text
                style={[styles.searchInput, { color: query ? colors.text : colors.textDim }]}
                onPress={() => {}}
              >
                {query || 'Search questions…'}
              </Text>
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textDim} />
                </Pressable>
              ) : null}
            </View>

            {/* Quick filters */}
            <View style={styles.filters}>
              {['All', 'Privacy', 'Data', 'Passwords', 'Open source'].map(f => (
                <Pressable
                  key={f}
                  onPress={() => setQuery(f === 'All' ? '' : f)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: (f === 'All' ? !query : query === f) ? colors.accent : colors.surface2,
                      borderColor: (f === 'All' ? !query : query === f) ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: (f === 'All' ? !query : query === f) ? '#fff' : colors.textMuted }]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Results count */}
            <Text style={[styles.count, { color: colors.textDim }]}>
              {filtered.length} question{filtered.length !== 1 ? 's' : ''}
            </Text>

            {/* Accordion items */}
            {filtered.length > 0 ? (
              filtered.map((item, i) => (
                <AccordionItem key={i} question={item.q} answer={item.a} searchQuery={query} />
              ))
            ) : (
              <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search-outline" size={32} color={colors.textDim} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No questions match "{query}"</Text>
                <Pressable onPress={() => setQuery('')}>
                  <Text style={[styles.clearText, { color: colors.accent }]}>Clear search</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.giant },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.md },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  filterChip: { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: 6 },
  filterText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  count: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  empty: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xxxl, alignItems: 'center', gap: SPACING.md },
  emptyText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, textAlign: 'center' },
  clearText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
});
