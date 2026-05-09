import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { STRINGS } from '@/constants/strings';
import { Button } from '@/components/ui/Button';
import { haptics } from '@/services/hapticService';

const { width } = Dimensions.get('window');
const WELCOME_KEY = 'hasSeenWelcome';
const ONBOARDING_KEY = 'ADEV_ONBOARDED';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Check if already onboarded — skip straight to home
    AsyncStorage.getItem(WELCOME_KEY).then(val => {
      if (val === 'true') router.replace('/(tabs)/home');
    });

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
    ]).start();
  }, []);

  const handleStart = async () => {
    haptics.medium();
    // Sync both keys so they're always consistent
    await AsyncStorage.multiSet([
      [WELCOME_KEY, 'true'],
      [ONBOARDING_KEY, 'true'],
    ]);
    router.replace('/(tabs)/home');
  };

  const handleLearnMore = async () => {
    haptics.light();
    // Sync both keys
    await AsyncStorage.multiSet([
      [WELCOME_KEY, 'true'],
      [ONBOARDING_KEY, 'true'],
    ]);
    router.replace('/(tabs)/about');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0F0F1E', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Decorative glow circles */}
      <View style={[styles.glowCircle, styles.glowTop]} />
      <View style={[styles.glowCircle, styles.glowBottom]} />

      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo mark */}
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <LinearGradient
              colors={COLORS.gradientPurple}
              style={styles.logoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="lock-closed" size={44} color="#ffffff" />
            </LinearGradient>
          </Animated.View>

          {/* App name */}
          <Text style={styles.appName}>{STRINGS.appName}</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>{STRINGS.welcome.subtitle}</Text>

          {/* Decorative divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          {/* Feature pills */}
          <View style={styles.pills}>
            {['Offline', 'No Tracking', 'AES-256'].map(f => (
              <View key={f} style={styles.pill}>
                <Text style={styles.pillText}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom buttons */}
        <Animated.View style={[styles.btnContainer, { opacity: fadeAnim }]}>
          <Button
            label={STRINGS.welcome.getStarted}
            onPress={handleStart}
            variant="primary"
          />
          <Button
            label={STRINGS.welcome.learnMore}
            onPress={handleLearnMore}
            variant="ghost"
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: SPACING.xl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  glowTop: {
    backgroundColor: COLORS.accent,
    top: -80,
    left: -60,
  },
  glowBottom: {
    backgroundColor: COLORS.accentBlue,
    bottom: -80,
    right: -60,
  },

  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },

  appName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.display,
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: SPACING.lg,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.5,
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },

  pills: { flexDirection: 'row', gap: SPACING.sm },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.glass,
  },
  pillText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  btnContainer: {
    paddingBottom: SPACING.xl,
    gap: SPACING.xs,
  },
});
