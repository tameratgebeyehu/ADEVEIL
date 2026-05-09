import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { TrustCard } from '@/components/trust/TrustCard';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const SECTIONS = [
  { route: 'how-we-protect', icon: 'shield-checkmark-outline' as const, color: '#A855F7', title: 'How We Protect You', sub: 'Simple explanations of how ADEVeil keeps your data safe' },
  { route: 'your-data', icon: 'server-outline' as const, color: '#22D3EE', title: 'Your Data', sub: 'What is stored, what is never collected, and how to delete it' },
  { route: 'offline', icon: 'cloud-offline-outline' as const, color: '#34D399', title: 'Offline Protection', sub: 'How ADEVeil works without an internet connection' },
  { route: 'permissions', icon: 'key-outline' as const, color: '#F59E0B', title: 'App Permissions', sub: 'What permissions we request and exactly why' },
  { route: 'security-tips', icon: 'bulb-outline' as const, color: '#FB923C', title: 'Security Tips', sub: 'Simple advice for protecting your messages and device' },
  { route: 'faq', icon: 'help-circle-outline' as const, color: '#60A5FA', title: 'Frequently Asked Questions', sub: 'Honest answers to common privacy questions' },
  { route: 'transparency', icon: 'eye-outline' as const, color: '#34D399', title: 'Transparency Report', sub: 'Live status of all tracking, sync, and analytics' },
  { route: 'commitment', icon: 'ribbon-outline' as const, color: '#A855F7', title: 'Our Commitment', sub: 'Philosophy, open-source goals, and honest status' },
  { route: 'contact', icon: 'chatbubble-ellipses-outline' as const, color: '#F472B6', title: 'Contact & Feedback', sub: 'Ask questions, report concerns, or suggest improvements' },
];

export default function PrivacyCenterScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIcon, { backgroundColor: colors.accentGlow }]}>
                <Ionicons name="lock-closed" size={36} color={colors.accent} />
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Your privacy is not a feature.
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                It is the foundation of everything ADEVeil does. This center explains — in plain language — exactly how we protect you.
              </Text>
            </View>

            {/* Section label */}
            <Text style={[styles.sectionLabel, { color: colors.textDim }]}>LEARN MORE</Text>

            {/* Navigation cards */}
            {SECTIONS.map(s => (
              <TrustCard
                key={s.route}
                icon={s.icon}
                iconColor={s.color}
                title={s.title}
                subtitle={s.sub}
                showChevron
                onPress={() => router.push(`/privacy/${s.route}` as any)}
              />
            ))}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={[styles.privacySeal, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
                <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
                <Text style={[styles.footerText, { color: colors.accent }]}>
                  ADEVeil does not collect, transmit, or sell your data.
                </Text>
              </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.giant },
  hero: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xl,
    textAlign: 'center',
    lineHeight: 30,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  privacySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  footerText: { 
    fontFamily: FONTS.semiBold, 
    fontSize: 13, 
  },
});
