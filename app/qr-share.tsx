import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { QRDisplay } from '@/components/QRDisplay';
import { useSecureScreen } from '@/hooks/useSecureScreen';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { SPACING } from '@/constants/spacing';

export default function QRShareScreen() {
  const { text } = useLocalSearchParams<{ text: string }>();
  const router = useRouter();
  const { colors } = useThemeContext();

  // Allow screenshots on this screen only — users need to save/share the QR image
  useSecureScreen({ allowCaptures: true });

  if (!text) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.centered}>
          <Text style={[styles.error, { color: colors.error }]}>No protected text provided.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.accent, fontFamily: FONTS.medium }}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Share via QR</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            The recipient scans this with ADEVeil and enters the password to open the message.
          </Text>
          <QRDisplay value={text} size={240} />
          <View style={[styles.secNote, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
            <Text style={[styles.secText, { color: colors.textMuted }]}>
              The password is never embedded in the QR code — only the protected text is.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { padding: 20, gap: 20, paddingBottom: 60 },
  hint: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 22, textAlign: 'center' },
  secNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, borderWidth: 1, padding: 16 },
  secText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20, flex: 1 },
  error: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
});
