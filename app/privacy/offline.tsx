import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { OFFLINE_FEATURES } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const FEATURE_COLORS = ['#A855F7', '#22D3EE', '#34D399', '#F59E0B'];

export default function OfflineScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Offline Protection</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 48 }}>📡</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Works Without Internet</Text>
              <Text style={[styles.heroBody, { color: colors.textMuted }]}>
                ADEVeil was built from the ground up to work offline. Your messages are protected and opened on your device — no network connection required.
              </Text>
            </View>

            {/* Feature cards */}
            {OFFLINE_FEATURES.map((f, i) => (
              <View
                key={i}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.iconWrap, { backgroundColor: FEATURE_COLORS[i] + '18' }]}>
                  <Ionicons name={f.icon} size={24} color={FEATURE_COLORS[i]} />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{f.title}</Text>
                  <Text style={[styles.cardBody, { color: colors.textMuted }]}>{f.body}</Text>
                </View>
              </View>
            ))}

            {/* Summary */}
            <View style={[styles.summary, { backgroundColor: '#34D39918', borderColor: '#34D39940' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#34D399" />
              <Text style={[styles.summaryText, { color: colors.text }]}>
                ADEVeil makes no network requests during normal use. Your data stays on your device because it never has a reason to leave.
              </Text>
            </View>
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
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.giant, gap: SPACING.md },
  hero: { borderRadius: RADIUS.xxl, borderWidth: 1, padding: SPACING.xxl, alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  heroTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xl, textAlign: 'center' },
  heroBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl },
  iconWrap: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1, gap: SPACING.xs },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  cardBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  summary: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start' },
  summaryText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
