import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { TransparencyRow } from '@/components/trust/TransparencyRow';
import { TRANSPARENCY_STATUS } from '@/constants/trust';
import { useSettingsStore } from '@/store/settingsStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

export default function TransparencyScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { privacyBlur, biometricEnabled } = useSettingsStore();
  const { totalSessions } = useAnalyticsStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const liveRows = [
    { label: 'Privacy blur (screen masking)', status: privacyBlur ? 'Active' : 'Disabled', positive: privacyBlur },
    { label: 'Biometric unlock', status: biometricEnabled ? 'Enabled' : 'Disabled', positive: biometricEnabled },
    { label: 'App sessions tracked', status: `${totalSessions} (local only)`, positive: true },
  ];

  const now = new Date();
  const reportDate = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transparency Report</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header card */}
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIcon, { backgroundColor: '#34D39920' }]}>
                <Ionicons name="eye-outline" size={28} color="#34D399" />
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Nothing to hide</Text>
              <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                This report shows the current status of every system that could affect your privacy. Updated automatically.
              </Text>
              <View style={[styles.datePill, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Text style={[styles.dateText, { color: colors.textDim }]}>{reportDate}</Text>
              </View>
            </View>

            {/* Static status */}
            <Text style={[styles.sectionLabel, { color: colors.textDim }]}>APP-WIDE STATUS</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {TRANSPARENCY_STATUS.map((row, i) => (
                <TransparencyRow key={i} label={row.label} status={row.status} positive={row.positive} />
              ))}
            </View>

            {/* Live status */}
            <Text style={[styles.sectionLabel, { color: colors.textDim }]}>YOUR CURRENT SETTINGS</Text>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {liveRows.map((row, i) => (
                <TransparencyRow key={i} label={row.label} status={row.status} positive={row.positive} />
              ))}
            </View>

            {/* Commitment */}
            <View style={[styles.note, { backgroundColor: '#34D39912', borderColor: '#34D39940' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#34D399" />
              <Text style={[styles.noteText, { color: colors.textMuted }]}>
                ADEVeil is designed with a no-collection policy. The data above is generated entirely on your device and is never transmitted anywhere.
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
  heroCard: { borderRadius: RADIUS.xxl, borderWidth: 1, padding: SPACING.xxl, alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xxl },
  heroIcon: { width: 64, height: 64, borderRadius: RADIUS.xxl, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xl },
  heroSub: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
  datePill: { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: 5 },
  dateText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: 11, letterSpacing: 1.2, marginBottom: SPACING.md, marginTop: SPACING.sm },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  note: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start' },
  noteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
