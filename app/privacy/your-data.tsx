import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { DATA_STORED, DATA_NEVER_COLLECTED } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

export default function YourDataScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { clearAll } = useVaultStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all vault content. This cannot be undone. Your app settings and PIN will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Vault Content',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Done', 'All vault content has been deleted.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Data</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>
              ADEVeil is honest about what it stores. Here is a complete picture.
            </Text>

            {/* Stored locally */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.dot, { backgroundColor: '#34D399' }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Stored on Your Device</Text>
              </View>
              {DATA_STORED.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#34D399" />
                  <Text style={[styles.rowText, { color: colors.textMuted }]}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Never collected */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Never Collected</Text>
              </View>
              {DATA_NEVER_COLLECTED.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Ionicons name="shield-outline" size={18} color={colors.accent} />
                  <Text style={[styles.rowText, { color: colors.textMuted }]}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Note */}
            <View style={[styles.note, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textMuted }]}>
                ADEVeil does not have access to the internet during normal use. Your data cannot leave your device unless you explicitly share or export it.
              </Text>
            </View>

            {/* Danger zone */}
            <Text style={[styles.dangerLabel, { color: colors.textDim }]}>DELETE DATA</Text>
            <Pressable
              onPress={handleDeleteAll}
              style={[styles.dangerBtn, { backgroundColor: colors.error + '15', borderColor: colors.error + '60' }]}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <View style={styles.dangerText}>
                <Text style={[styles.dangerTitle, { color: colors.error }]}>Delete All Vault Content</Text>
                <Text style={[styles.dangerSub, { color: colors.textMuted }]}>
                  Permanently removes all saved notes and vault items
                </Text>
              </View>
            </Pressable>
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  rowText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  note: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, alignItems: 'flex-start', marginBottom: SPACING.xxl },
  noteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  dangerLabel: { fontFamily: FONTS.semiBold, fontSize: 11, letterSpacing: 1.2, marginBottom: SPACING.md },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg },
  dangerText: { flex: 1 },
  dangerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
  dangerSub: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 2 },
});
