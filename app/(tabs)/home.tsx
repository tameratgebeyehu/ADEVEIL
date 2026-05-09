import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { STRINGS } from '@/constants/strings';
import { ActionCard } from '@/components/ActionCard';
import { useThemeContext } from '@/theme/ThemeContext';
import { useVaultStore } from '@/store/vaultStore';
import { haptics } from '@/services/hapticService';
import { QuickLockBtn } from '@/components/QuickLockBtn';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const { items } = useVaultStore();

  const [showTip, setShowTip] = useState(true);

  // Entrance animations
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('hideHomeTip').then(val => {
      if (val === 'true') setShowTip(false);
    });

    Animated.stagger(100, [
      Animated.timing(fadeAnim1, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim2, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim3, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim4, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismissTip = async () => {
    haptics.light();
    setShowTip(false);
    await AsyncStorage.setItem('hideHomeTip', 'true');
  };

  const greeting = getGreeting();
  const vaultCount = items.length;

  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Decorative Glow Elements */}
      <View style={[styles.glowTop, { backgroundColor: colors.accent }]} />
      <View style={[styles.glowRight, { backgroundColor: colors.accentBlue }]} />

      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <Animated.View style={[styles.header, slideUp(fadeAnim1)]}>
            <LinearGradient
              colors={colors.gradientPurple}
              style={styles.miniLogo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="lock-closed" size={20} color="#ffffff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, { color: colors.text }]}>{STRINGS.appName}</Text>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting}</Text>
            </View>
            <View style={[styles.securityPill, { backgroundColor: colors.accentGlow, borderColor: colors.accent + '40' }]}>
              <Ionicons name="shield-checkmark" size={12} color={colors.accent} />
              <Text style={[styles.securityPillText, { color: colors.accent }]}>Secure</Text>
            </View>
            <QuickLockBtn />
          </Animated.View>

          {/* Quick actions */}
          <Animated.View style={[styles.quickRow, slideUp(fadeAnim2)]}>
            <Pressable
              onPress={() => { haptics.light(); router.push('/qr-scan'); }}
              style={[styles.quickBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="qr-code-outline" size={24} color={colors.accent} />
              <Text style={[styles.quickLabel, { color: colors.text }]}>Scan QR</Text>
            </Pressable>
            <Pressable
              onPress={() => { haptics.light(); router.push('/(tabs)/vault'); }}
              style={[styles.quickBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="lock-closed-outline" size={24} color={colors.accentBlue} />
              <Text style={[styles.quickLabel, { color: colors.text }]}>Vault</Text>
            </Pressable>
            <Pressable
              onPress={() => { haptics.light(); router.push('/(tabs)/notes'); }}
              style={[styles.quickBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="document-text-outline" size={24} color={colors.success} />
              <Text style={[styles.quickLabel, { color: colors.text }]}>Notes</Text>
            </Pressable>
          </Animated.View>

          {/* Section label */}
          <Animated.Text style={[styles.sectionLabel, { color: colors.textMuted }, slideUp(fadeAnim3)]}>ACTIONS</Animated.Text>

          {/* Action Cards */}
          <Animated.View style={slideUp(fadeAnim3)}>
          <ActionCard
            title={STRINGS.home.protectTitle}
            description={STRINGS.home.protectDesc}
            iconName="shield-checkmark-outline"
            gradientColors={['#6B5CE7', '#8B6EFF']}
            onPress={() => router.push('/protect')}
          />
          <ActionCard
            title={STRINGS.home.openTitle}
            description={STRINGS.home.openDesc}
            iconName="lock-open-outline"
            gradientColors={['#4F8EF7', '#38C6D9']}
            onPress={() => router.push('/open')}
          />
          </Animated.View>

          {/* Tip card */}
          {showTip && (
            <Animated.View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }, slideUp(fadeAnim4)]}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={24} color={colors.accent} style={{ marginBottom: SPACING.xs }} />
                <Pressable onPress={dismissTip} hitSlop={12}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
              <Text style={[styles.tipTitle, { color: colors.text }]}>How it works</Text>
              <Text style={[styles.tipText, { color: colors.textMuted }]}>
                Protect your message with a password, then share the locked text anywhere.
                The recipient opens it in ADEVeil using the same password.
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.xl },
  miniLogo: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  appName: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.xl, letterSpacing: -0.5 },
  greeting: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 2 },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  securityPillText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs },
  quickRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  glowTop: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    opacity: 0.15, top: -100, left: -100, transform: [{ scale: 1.5 }],
  },
  glowRight: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    opacity: 0.12, top: -50, right: -100, transform: [{ scale: 1.5 }],
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  quickLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.xs },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xs, letterSpacing: 1.5, marginBottom: SPACING.lg },
  tipCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl, marginTop: SPACING.md },
  tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tipTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, marginBottom: SPACING.sm },
  tipText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
