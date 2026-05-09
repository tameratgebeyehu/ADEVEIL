import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const CATEGORIES = [
  {
    icon: 'lock-closed-outline' as const,
    color: '#A855F7',
    title: 'Privacy Question',
    body: 'Ask about how ADEVeil handles your data, permissions, or any privacy topic.',
    subject: 'Privacy Question — ADEVeil',
  },
  {
    icon: 'shield-outline' as const,
    color: '#F87171',
    title: 'Security Concern',
    body: 'Found a potential security issue? We take every report seriously and respond promptly.',
    subject: 'Security Concern — ADEVeil',
  },
  {
    icon: 'bug-outline' as const,
    color: '#F59E0B',
    title: 'Report a Bug',
    body: 'Something not working as expected? Let us know and we will investigate.',
    subject: 'Bug Report — ADEVeil',
  },
  {
    icon: 'bulb-outline' as const,
    color: '#34D399',
    title: 'Suggestion',
    body: 'Have an idea for improving ADEVeil or this Privacy Center? We would love to hear it.',
    subject: 'Suggestion — ADEVeil',
  },
];

const SUPPORT_EMAIL = 'adeveil.et@gmail.com';

export default function ContactScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const handleContact = (subject: string) => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
    Linking.canOpenURL(url).then(can => {
      if (can) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Contact Us',
          `Send an email to:\n\n${SUPPORT_EMAIL}\n\nSubject: ${subject}`,
          [{ text: 'OK' }]
        );
      }
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Contact & Feedback</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>
              We welcome questions, concerns, and feedback. Your input helps us build a more trustworthy app.
            </Text>

            {CATEGORIES.map((cat, i) => (
              <Pressable
                key={i}
                onPress={() => handleContact(cat.subject)}
                android_ripple={{ color: colors.surface2 }}
              >
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.iconWrap, { backgroundColor: cat.color + '18' }]}>
                    <Ionicons name={cat.icon} size={22} color={cat.color} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{cat.title}</Text>
                    <Text style={[styles.cardBody, { color: colors.textMuted }]}>{cat.body}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
                </View>
              </Pressable>
            ))}

            {/* Email display */}
            <View style={[styles.emailCard, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.accent} />
              <View style={styles.emailContent}>
                <Text style={[styles.emailLabel, { color: colors.textDim }]}>CONTACT EMAIL</Text>
                <Text style={[styles.emailAddress, { color: colors.text }]}>{SUPPORT_EMAIL}</Text>
              </View>
            </View>

            {/* Promise */}
            <View style={[styles.promise, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.promiseTitle, { color: colors.text }]}>Our promise to you</Text>
              <Text style={[styles.promiseBody, { color: colors.textMuted }]}>
                We read every message. We respond to security concerns as a priority. We do not use your contact information for marketing.
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
  card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, marginBottom: SPACING.md },
  iconWrap: { width: 44, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  cardBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 19 },
  emailCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.md },
  emailContent: { gap: 3 },
  emailLabel: { fontFamily: FONTS.semiBold, fontSize: 10, letterSpacing: 0.8 },
  emailAddress: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.md },
  promise: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, gap: SPACING.sm },
  promiseTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  promiseBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
