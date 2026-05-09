import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '@/theme/ThemeContext';
import { ONBOARDING_SLIDES } from '@/constants/trust';
import { FONTS, FONT_SIZE } from '@/constants/typography';
import { RADIUS, SPACING } from '@/constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = 'ADEV_ONBOARDED';
const WELCOME_KEY = 'hasSeenWelcome';

const INTRO_PHRASES = ["No tracking.", "No ads.", "No surprises.", "Pure privacy."];

function CinematicPhrase({ phrase, onComplete }: { phrase: string, onComplete: () => void }) {
  const { colors } = useThemeContext();
  const chars = phrase.split('');
  
  // Create an animated value for each character
  const animValues = useRef(chars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let isMounted = true;
    
    // 1. Enter animation: Staggered spring (scales up, fades in, flips from 90deg)
    const enterAnimations = animValues.map((anim) => 
      Animated.spring(anim, { toValue: 1, friction: 6, tension: 45, useNativeDriver: true })
    );

    Animated.stagger(30, enterAnimations).start(() => {
      // 2. Hold phase
      setTimeout(() => {
        if (!isMounted) return;
        
        // 3. Exit animation: Staggered exit (floats up, fades out, flips to -90deg)
        const exitAnimations = animValues.map((anim) => 
          Animated.timing(anim, { toValue: 2, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        );
        
        Animated.stagger(25, exitAnimations).start(() => {
          if (!isMounted) return;
          onComplete();
        });
      }, 1500);
    });
    
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {chars.map((char, i) => {
        const opacity = animValues[i].interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0, 1, 0]
        });
        const translateY = animValues[i].interpolate({
          inputRange: [0, 1, 2],
          outputRange: [20, 0, -20]
        });
        const scale = animValues[i].interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0.3, 1, 1.2]
        });
        const rotateX = animValues[i].interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['90deg', '0deg', '-90deg']
        });

        return (
          <Animated.Text 
            key={i} 
            style={[
              styles.animatedPhraseChar, 
              { 
                color: colors.accent, 
                opacity, 
                transform: [{ translateY }, { scale }, { rotateX }] 
              }
            ]}
          >
            {char === ' ' ? '\u00A0' : char}
          </Animated.Text>
        );
      })}
    </View>
  );
}



function AnimatedIntro() {
  const { colors } = useThemeContext();
  const [index, setIndex] = useState(0);
  
  // Icon breathing animation
  const breatheAnim = useRef(new Animated.Value(1)).current;
  // Icon tilt animation
  const tiltAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous soft pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.05, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

    // Smooth pendulum tilt
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: -1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    ).start();
  }, []);

  const rotate = tiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg']
  });

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[
        styles.emojiWrap, 
        { 
          backgroundColor: colors.accentGlow, 
          borderColor: colors.border, 
          borderWidth: 0,
          transform: [{ scale: breatheAnim }, { rotate }]
        }
      ]}>
        <Ionicons name="shield-checkmark" size={64} color={colors.accent} />
      </Animated.View>
      <View style={styles.textBlock}>
        <Text style={[styles.slideTitle, { color: colors.text }]}>Welcome to ADEVeil</Text>
        
        {/* The wrapper handles height so layout doesn't jump during animation */}
        <View style={{ height: 40, marginTop: SPACING.md, alignItems: 'center', justifyContent: 'center' }}>
          <CinematicPhrase 
            key={index} // Changing key forces component remount for fresh animations
            phrase={INTRO_PHRASES[index]} 
            onComplete={() => setIndex((prev) => (prev + 1) % INTRO_PHRASES.length)} 
          />
        </View>
      </View>
    </View>
  );
}

function AnimatedSlide({ slide, index, scrollX, colors }: any) {
  const center = index * SCREEN_WIDTH;
  
  // Interpolation ranges for elements that snap into place at center
  const snapInputRange = [
    center - SCREEN_WIDTH, 
    center - (SCREEN_WIDTH * 0.15), 
    center, 
    center + (SCREEN_WIDTH * 0.15), 
    center + SCREEN_WIDTH
  ];

  // 1. Gesture-driven animations tied to user's swipe
  const iconScale = scrollX.interpolate({
    inputRange: snapInputRange,
    outputRange: [0.4, 1.15, 1, 1.15, 0.4], // 1.15 creates a bounce overshoot!
    extrapolate: 'clamp'
  });

  const opacity = scrollX.interpolate({
    inputRange: snapInputRange,
    outputRange: [-0.2, 1, 1, 1, -0.2],
    extrapolate: 'clamp'
  });

  const textTranslateY = scrollX.interpolate({
    inputRange: snapInputRange,
    outputRange: [40, 0, 0, 0, 40],
    extrapolate: 'clamp'
  });

  const bodyTranslateY = scrollX.interpolate({
    inputRange: snapInputRange,
    outputRange: [50, 0, 0, 0, 50],
    extrapolate: 'clamp'
  });

  const rotateY = scrollX.interpolate({
    inputRange: [center - SCREEN_WIDTH, center, center + SCREEN_WIDTH],
    outputRange: ['180deg', '0deg', '-180deg'],
    extrapolate: 'clamp'
  });

  // 2. Continuous ambient physics (floating)
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: -1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-12, 12]
  });

  const rotate = floatAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-8deg', '8deg']
  });

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Icon */}
      <Animated.View style={[
        styles.emojiWrap, 
        { 
          backgroundColor: slide.accent + '25', 
          borderColor: slide.accent + '50',
          opacity,
          transform: [
            { scale: iconScale }, 
            { translateY: floatY }, 
            { rotate },
            { rotateY }
          ]
        }
      ]}>
        <Ionicons name={slide.icon} size={60} color={slide.accent} />
      </Animated.View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Animated.Text style={[
          styles.slideTitle, 
          { color: colors.text, opacity, transform: [{ translateY: textTranslateY }] }
        ]}>
          {slide.title}
        </Animated.Text>

        <Animated.Text style={[
          styles.slideBody, 
          { color: colors.textMuted, opacity, transform: [{ translateY: bodyTranslateY }] }
        ]}>
          {slide.body}
        </Animated.Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  // Track scroll position for gesture-driven animations
  const scrollX = useRef(new Animated.Value(0)).current;

  const totalSlides = ONBOARDING_SLIDES.length + 1;
  const isLast = activeIndex === totalSlides - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  const goNext = () => {
    if (isLast) {
      handleFinish();
      return;
    }
    const nextIndex = activeIndex + 1;
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const handleFinish = async () => {
    // Mark both keys as seen so the welcome splash is also skipped
    await AsyncStorage.multiSet([
      [ONBOARDING_KEY, 'true'],
      [WELCOME_KEY, 'true'],
    ]);
    // Go directly to home — no extra welcome splash
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safe}>
        {/* Skip */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <Pressable onPress={handleFinish} hitSlop={12}>
            <Text style={[styles.skip, { color: colors.textDim }]}>Skip</Text>
          </Pressable>
        </View>

        {/* Slides */}
        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          <AnimatedIntro />
          {ONBOARDING_SLIDES.map((slide, i) => (
            <AnimatedSlide 
              key={i + 1} 
              slide={slide} 
              index={i + 1} 
              scrollX={scrollX} 
              colors={colors} 
            />
          ))}
        </Animated.ScrollView>

        {/* Bottom controls */}
        <View style={styles.controls}>
          {/* Dots */}
          <View style={styles.dots}>
            {Array.from({ length: totalSlides }).map((_, i) => {
              // The first slide uses the primary accent, others use their specific accents
              const dotColor = i === 0 ? colors.accent : ONBOARDING_SLIDES[i - 1].accent;
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === activeIndex ? dotColor : colors.surface3,
                      width: i === activeIndex ? 24 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Next / Done */}
          <Pressable
            onPress={goNext}
            style={[
              styles.nextBtn, 
              { backgroundColor: activeIndex === 0 ? colors.accent : ONBOARDING_SLIDES[activeIndex - 1].accent }
            ]}
          >
            <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  skip: { fontFamily: FONTS.medium, fontSize: FONT_SIZE.md },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxxl, gap: SPACING.xxxl },
  emojiWrap: { width: 120, height: 120, borderRadius: RADIUS.xxl + 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  textBlock: { alignItems: 'center', gap: SPACING.lg },
  slideTitle: { fontFamily: FONTS.bold, fontSize: 24, textAlign: 'center', lineHeight: 32 },
  animatedPhraseChar: { fontFamily: FONTS.semiBold, fontSize: 28, textAlign: 'center' },
  slideBody: { fontFamily: FONTS.regular, fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 24 },
  controls: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl, gap: SPACING.xl },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  dot: { height: 8, borderRadius: RADIUS.full },
  nextBtn: { borderRadius: RADIUS.full, paddingVertical: SPACING.lg, alignItems: 'center' },
  nextText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md, color: '#fff' },
});
