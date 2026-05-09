import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/theme/ThemeContext';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { SecurityScoreCard } from '@/components/SecurityScoreCard';
import { StatCard } from '@/components/StatCard';
import { useVaultStore } from '@/store/vaultStore';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { useRouter } from 'expo-router';
import { haptics } from '@/services/hapticService';
import { QuickLockBtn } from '@/components/QuickLockBtn';

const PRIVACY_TIPS = [
  'Share your protected text on any app — only the password unlocks it.',
  'Set an auto-lock timeout of 30 seconds for maximum security.',
  'Use the decoy PIN to protect yourself in high-pressure situations.',
  'Enable biometric unlock for fast, secure access.',
  'The clipboard auto-clear removes sensitive text after 60 seconds.',
  'Vault items are encrypted — even if someone takes your phone, they cannot read them.',
  'Use the Secure Workspace for private drafts before encrypting.',
];

function QuickAction({ icon, label, onPress, colors, gradient }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    haptics.light();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <Pressable onPress={press}>
        <LinearGradient colors={gradient} style={[styles.quickCard, { borderColor: 'transparent' }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={icon} size={24} color="#fff" />
          <Text style={styles.quickLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function ActivityItem({ entry, colors }: any) {
  const ICONS: Record<string, string> = {
    protected: 'shield-checkmark-outline',
    opened: 'lock-open-outline',
    vault_saved: 'archive-outline',
    note_created: 'document-text-outline',
    exported: 'cloud-download-outline',
    locked: 'lock-closed-outline',
  };
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={[styles.activityRow, { borderBottomColor: colors.border }]}>
      <Ionicons name={(ICONS[entry.type] ?? 'ellipse-outline') as any} size={16} color={colors.accent} />
      <Text style={[styles.activityLabel, { color: colors.text }]}>{entry.label}</Text>
      <Text style={[styles.activityTime, { color: colors.textDim }]}>{time}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { messagesProtected, messagesOpened, vaultItemsCreated, notesCreated, recentActivity } = useAnalyticsStore();
  const { items } = useVaultStore();
  const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * PRIVACY_TIPS.length));

  const cycleTip = () => {
    haptics.light();
    setTipIndex(i => (i + 1) % PRIVACY_TIPS.length);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Security</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your privacy overview</Text>
            </View>
            <QuickLockBtn />
          </View>

          {/* Score Card */}
          <SecurityScoreCard onPress={() => router.push('/(tabs)/settings')} />

          {/* Stats row */}
          <Text style={[styles.section, { color: colors.textMuted }]}>USAGE STATS</Text>
          <View style={styles.statsRow}>
            <StatCard icon="shield-checkmark-outline" label="Protected" value={messagesProtected} color={colors.accent} />
            <StatCard icon="lock-open-outline" label="Opened" value={messagesOpened} color={colors.accentBlue} />
            <StatCard icon="archive-outline" label="In Vault" value={items.length} color="#34D399" />
            <StatCard icon="document-text-outline" label="Notes" value={notesCreated} color="#FBBF24" />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.section, { color: colors.textMuted }]}>QUICK ACTIONS</Text>
          <View style={styles.quickRow}>
            <QuickAction icon="shield-checkmark-outline" label="Protect" onPress={() => router.push('/protect')} colors={colors} gradient={['#6B5CE7', '#8B6EFF']} />
            <QuickAction icon="lock-open-outline" label="Open" onPress={() => router.push('/open')} colors={colors} gradient={['#4F8EF7', '#38C6D9']} />
          </View>
          <View style={[styles.quickRow, { marginTop: SPACING.sm }]}>
            <QuickAction icon="create-outline" label="Workspace" onPress={() => router.push('/(tabs)/workspace')} colors={colors} gradient={['#A78BFA', '#7C3AED']} />
            <QuickAction icon="qr-code-outline" label="Scan QR" onPress={() => router.push('/qr-scan')} colors={colors} gradient={['#F59E0B', '#D97706']} />
          </View>

          {/* Tip — tappable to cycle */}
          <Pressable
            onPress={cycleTip}
            style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="bulb-outline" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <View style={styles.tipHeaderRow}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>Privacy Tip</Text>
                <Text style={[styles.tipCycle, { color: colors.textDim }]}>
                  {tipIndex + 1}/{PRIVACY_TIPS.length} · tap to cycle
                </Text>
              </View>
              <Text style={[styles.tipText, { color: colors.textMuted }]}>{PRIVACY_TIPS[tipIndex]}</Text>
            </View>
          </Pressable>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <>
              <Text style={[styles.section, { color: colors.textMuted }]}>RECENT ACTIVITY</Text>
              <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {recentActivity.slice(0, 6).map(entry => (
                  <ActivityItem key={entry.id} entry={entry} colors={colors} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: 120, gap: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xxl, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 3 },
  section: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs, letterSpacing: 1.5, marginTop: SPACING.sm },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  quickRow: { flexDirection: 'row', gap: SPACING.sm },
  quickCard: { borderRadius: RADIUS.xl, padding: SPACING.xl, gap: SPACING.sm, alignItems: 'flex-start' },
  quickLabel: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, color: '#fff' },
  tipCard: { flexDirection: 'row', gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, alignItems: 'flex-start' },
  tipHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  tipTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.sm },
  tipCycle: { fontFamily: FONTS.regular, fontSize: 10 },
  tipText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  activityCard: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  activityLabel: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm },
  activityTime: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.xs },
});
