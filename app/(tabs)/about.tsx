import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, BackHandler, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeContext } from '@/theme/ThemeContext';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { STRINGS } from '@/constants/strings';
import { haptics } from '@/services/hapticService';

interface PillarProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function PillarItem({ icon, title, description }: PillarProps) {
  const { colors } = useThemeContext();
  return (
    <View style={[styles.pillarRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.pillarIcon, { backgroundColor: colors.accentGlow }]}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <View style={styles.pillarText}>
        <Text style={[styles.pillarTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.pillarDesc, { color: colors.textMuted }]}>{description}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();

  // Intercept the hardware back button on Android so it goes back to Settings
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.navigate('/(tabs)/settings');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router])
  );

  const handleBack = () => {
    haptics.light();
    router.navigate('/(tabs)/settings');
  };

  const openLink = (url: string) => {
    haptics.light();
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={15}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>About</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* App Header */}
          <View style={styles.appHeader}>
            <View style={[styles.iconContainer, { shadowColor: colors.accent }]}>
              <LinearGradient
                colors={colors.gradientPurple}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="lock-closed" size={40} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>ADEVeil</Text>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>
              Version {STRINGS.about.version}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.introContainer}>
            <Text style={[styles.introText, { color: colors.textMuted }]}>
              A secure, isolated digital environment designed to protect your sensitive notes, passwords, and communications.
            </Text>
          </View>

          {/* Core Pillars */}
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>CORE PILLARS</Text>
          
          <PillarItem
            icon="shield-checkmark-outline"
            title="Privacy by Default"
            description="Your data never leaves your device. We do not store, scan, or analyze your content."
          />
          <PillarItem
            icon="wifi-outline"
            title="Offline First"
            description="Designed to function completely disconnected from the internet for maximum security."
          />
          <PillarItem
            icon="eye-off-outline"
            title="Zero Tracking"
            description="No analytics, no telemetry, and no background data collection of any kind."
          />

          {/* Developer Card */}
          <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: SPACING.xl }]}>
            DEVELOPER & SUPPORT
          </Text>
          
          <View style={[styles.devCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.devProfile}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>TG</Text>
              </View>
              <View style={styles.devInfo}>
                <Text style={[styles.devName, { color: colors.text }]}>Tamerat Gebeyehu</Text>
                <Text style={[styles.devTitle, { color: colors.textMuted }]}>Lead Engineer & Designer</Text>
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              <Pressable 
                onPress={() => openLink('https://github.com/tameratgebeyehu')} 
                style={[styles.actionBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
              >
                <Ionicons name="logo-github" size={18} color={colors.text} />
                <Text style={[styles.btnText, { color: colors.text }]}>GitHub</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => openLink('mailto:adeveil.et@gmail.com')} 
                style={[styles.actionBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
              >
                <Ionicons name="mail" size={18} color={colors.text} />
                <Text style={[styles.btnText, { color: colors.text }]}>Contact</Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1 
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.lg },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.huge },

  appHeader: { alignItems: 'center', marginVertical: SPACING.xxl },
  iconContainer: {
    width: 88, height: 88, borderRadius: RADIUS.xxl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
    marginBottom: SPACING.lg,
  },
  iconGradient: {
    flex: 1, borderRadius: RADIUS.xxl, alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontFamily: FONTS.bold, fontSize: 32, letterSpacing: -0.5, marginBottom: 2 },
  versionText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },

  introContainer: { marginBottom: SPACING.xxxl, paddingHorizontal: SPACING.md },
  introText: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, lineHeight: 24, textAlign: 'center' },

  sectionHeading: { fontFamily: FONTS.semiBold, fontSize: 12, letterSpacing: 1.2, marginBottom: SPACING.md, marginLeft: 4 },
  
  pillarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.sm },
  pillarIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pillarText: { flex: 1 },
  pillarTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, marginBottom: 2 },
  pillarDesc: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, lineHeight: 18 },

  devCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.xl },
  devProfile: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
  devInfo: { flex: 1, justifyContent: 'center' },
  devName: { fontFamily: FONTS.bold, fontSize: FONT_SIZE.lg, marginBottom: 2 },
  devTitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm },

  buttonRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, borderWidth: 1 },
  btnText: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.sm },
});
