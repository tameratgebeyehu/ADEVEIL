import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { TRUST_PRINCIPLES } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

export default function HowWeProtectScreen() {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>How We Protect You</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>
              ADEVeil uses modern protection technology. Here is what that means in plain language.
            </Text>

            {TRUST_PRINCIPLES.map((p, i) => (
              <View
                key={i}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.accent + '18' }]}>
                  <Ionicons name={p.icon} size={24} color={colors.accent} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.cardBody, { color: colors.textMuted }]}>{p.body}</Text>
              </View>
            ))}

            <View style={[styles.note, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textMuted }]}>
                ADEVeil uses industry-standard protection technology. We deliberately avoid technical terms because they are often used to impress rather than inform.
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
  iconWrap: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  cardBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 22 },
  note: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start', marginTop: SPACING.md },
  noteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
