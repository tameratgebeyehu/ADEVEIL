import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { PERMISSIONS } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const PERM_COLORS = ['#22D3EE', '#A855F7', '#F59E0B', '#34D399'];

export default function PermissionsScreen() {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>App Permissions</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>
              ADEVeil only requests permissions when they are genuinely needed. Here is what each one is for — and what it is not used for.
            </Text>

            {PERMISSIONS.map((p, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Permission header */}
                <View style={styles.permHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: PERM_COLORS[i] + '18' }]}>
                    <Ionicons name={p.icon} size={22} color={PERM_COLORS[i]} />
                  </View>
                  <View style={styles.permTitleRow}>
                    <Text style={[styles.permName, { color: colors.text }]}>{p.name}</Text>
                    <View style={[styles.optionalChip, { borderColor: colors.border, backgroundColor: colors.surface2 }]}>
                      <Text style={[styles.optionalText, { color: colors.textDim }]}>Optional</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Why */}
                <View style={styles.row}>
                  <Ionicons name="help-circle-outline" size={16} color={colors.accent} />
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.textDim }]}>WHY</Text>
                    <Text style={[styles.rowText, { color: colors.textMuted }]}>{p.why}</Text>
                  </View>
                </View>

                {/* When */}
                <View style={styles.row}>
                  <Ionicons name="time-outline" size={16} color={colors.accent} />
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: colors.textDim }]}>WHEN</Text>
                    <Text style={[styles.rowText, { color: colors.textMuted }]}>{p.when}</Text>
                  </View>
                </View>

                {/* Not used for */}
                <View style={[styles.notUsedRow, { backgroundColor: '#34D39910', borderColor: '#34D39930' }]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#34D399" />
                  <Text style={[styles.rowText, { color: '#34D399', flex: 1 }]}>{p.notUsed}</Text>
                </View>
              </View>
            ))}

            <View style={[styles.note, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textMuted }]}>
                All permissions are optional. Declining them does not affect the core protect and open features.
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
  permHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconWrap: { width: 44, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  permTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  permName: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, flex: 1 },
  optionalChip: { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  optionalText: { fontFamily: FONTS.medium, fontSize: 10, letterSpacing: 0.3 },
  divider: { height: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  rowContent: { flex: 1, gap: 3 },
  rowLabel: { fontFamily: FONTS.semiBold, fontSize: 10, letterSpacing: 0.8 },
  rowText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 19 },
  notUsedRow: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start', borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md },
  note: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start', marginTop: SPACING.md },
  noteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
