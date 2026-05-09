import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const UPCOMING_FEATURES = [
  { icon: 'cloud-upload-outline',  label: 'Encrypted Cloud Backup' },
  { icon: 'phone-portrait-outline', label: 'Cross-Device Sync' },
  { icon: 'refresh-outline',        label: 'One-Tap Restore' },
  { icon: 'lock-closed-outline',    label: 'Zero-Knowledge Storage' },
];

export default function ExportScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Backup & Restore</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Icon */}
          <LinearGradient
            colors={colors.gradientPurple}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cloud-outline" size={42} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>Coming Soon</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Secure backup and restore is currently in development. Your data is always safe on your device.
          </Text>

          {/* Feature list */}
          <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.featureHeading, { color: colors.textMuted }]}>WHAT'S COMING</Text>
            {UPCOMING_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name={f.icon as any} size={18} color={colors.accent} />
                </View>
                <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
            <Text style={[styles.noteText, { color: colors.textMuted }]}>
              Your vault data is encrypted and stored only on this device. No data ever leaves without your knowledge.
            </Text>
          </View>
        </View>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  body: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: SPACING.xl, gap: SPACING.xl,
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6B5CE7', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, letterSpacing: -0.5 },
  subtitle: {
    fontFamily: FONTS.regular, fontSize: FONT_SIZE.md,
    textAlign: 'center', lineHeight: 22,
  },
  featureCard: {
    width: '100%', borderRadius: RADIUS.xl, borderWidth: 1,
    padding: SPACING.xl, gap: SPACING.md,
  },
  featureHeading: {
    fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs, letterSpacing: 1.5, marginBottom: SPACING.xs,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.md },
  noteCard: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start',
    gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg,
  },
  noteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
