import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const PRINCIPLES = [
  {
    icon: 'eye-off-outline' as const,
    color: '#A855F7',
    title: 'We show you everything',
    body: 'ADEVeil is transparent about what it does. This Privacy Center exists because we believe you deserve to understand the tool you are trusting.',
  },
  {
    icon: 'code-slash-outline' as const,
    color: '#22D3EE',
    title: 'Open source is our goal',
    body: 'We intend to open-source the core ADEVeil codebase so it can be independently reviewed. We are not there yet — but it is a commitment we are working toward.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    color: '#34D399',
    title: 'No false claims',
    body: 'ADEVeil does not claim to be "military-grade," "unbreakable," or "fully anonymous." These terms are marketing — not facts. We prefer honest language.',
  },
  {
    icon: 'people-outline' as const,
    color: '#F59E0B',
    title: 'Built for humans',
    body: 'Privacy tools should not require a cybersecurity degree. ADEVeil is designed for everyday people who want a simple, trustworthy way to protect their messages.',
  },
];

const HONEST_STATUS = [
  { label: 'Open source', status: 'Planned', note: 'Not yet published' },
  { label: 'Independent security audit', status: 'Planned', note: 'Not yet conducted' },
  { label: 'Bug bounty program', status: 'Planned', note: 'Not yet launched' },
  { label: 'Privacy policy', status: 'Available', note: 'In app and on website' },
];

export default function CommitmentScreen() {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Our Commitment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>
              Here is what we believe — and an honest account of where we are today.
            </Text>

            {/* Principles */}
            {PRINCIPLES.map((p, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.iconWrap, { backgroundColor: p.color + '18' }]}>
                  <Ionicons name={p.icon} size={22} color={p.color} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.cardBody, { color: colors.textMuted }]}>{p.body}</Text>
              </View>
            ))}

            {/* Honest status table */}
            <Text style={[styles.sectionLabel, { color: colors.textDim }]}>HONEST STATUS</Text>
            <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {HONEST_STATUS.map((row, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, { borderBottomColor: colors.border, borderBottomWidth: i < HONEST_STATUS.length - 1 ? 1 : 0 }]}
                >
                  <View style={styles.tableLeft}>
                    <Text style={[styles.tableLabel, { color: colors.text }]}>{row.label}</Text>
                    <Text style={[styles.tableNote, { color: colors.textDim }]}>{row.note}</Text>
                  </View>
                  <View style={[
                    styles.statusChip,
                    { backgroundColor: row.status === 'Available' ? '#34D39920' : '#F59E0B20', borderColor: row.status === 'Available' ? '#34D39960' : '#F59E0B60' }
                  ]}>
                    <Text style={[styles.statusText, { color: row.status === 'Available' ? '#34D399' : '#F59E0B' }]}>
                      {row.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Closing note */}
            <View style={[styles.note, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="ribbon-outline" size={18} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textMuted }]}>
                We would rather be honest about what we have not done yet than claim achievements we cannot verify. Trust is earned — not marketed.
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
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.giant },
  intro: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 24, marginBottom: SPACING.xl },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, marginBottom: SPACING.md, gap: SPACING.md },
  iconWrap: { width: 44, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  cardBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 22 },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: 11, letterSpacing: 1.2, marginBottom: SPACING.md, marginTop: SPACING.sm },
  tableCard: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.md },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, gap: SPACING.md },
  tableLeft: { flex: 1, gap: 2 },
  tableLabel: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
  tableNote: { fontFamily: FONTS.regular, fontSize: 11 },
  statusChip: { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 11, letterSpacing: 0.3 },
  note: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start' },
  noteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
