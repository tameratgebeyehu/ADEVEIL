import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { SECURITY_TIPS } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const CAT_COLORS = ['#A855F7', '#22D3EE', '#34D399', '#F59E0B', '#FB923C'];

export default function SecurityTipsScreen() {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Security Tips</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>
              Simple habits that make a big difference. No technical knowledge required.
            </Text>

            {SECURITY_TIPS.map((cat, i) => (
              <View key={i} style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.catHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: CAT_COLORS[i] + '18' }]}>
                    <Ionicons name={cat.icon} size={20} color={CAT_COLORS[i]} />
                  </View>
                  <Text style={[styles.catTitle, { color: colors.text }]}>{cat.category}</Text>
                </View>
                {cat.tips.map((tip, j) => (
                  <View key={j} style={styles.tip}>
                    <View style={[styles.bullet, { backgroundColor: CAT_COLORS[i] }]} />
                    <Text style={[styles.tipText, { color: colors.textMuted }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={[styles.footer, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="heart-outline" size={18} color={colors.accent} />
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Good security habits are more effective than any tool. ADEVeil gives you the protection — you provide the good habits.
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
  section: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, marginBottom: SPACING.md, gap: SPACING.md },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  iconWrap: { width: 40, height: 40, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  footer: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start', marginTop: SPACING.md },
  footerText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
