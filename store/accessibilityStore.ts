import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FontScale } from '@/types/vault.types';

interface AccessibilityState {
  fontSize: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  hapticEnabled: boolean;

  setFontSize: (s: FontScale) => void;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
  reset: () => void;
}

const FONT_SCALE_MAP: Record<FontScale, number> = {
  small: 0.85,
  normal: 1.0,
  large: 1.15,
  xlarge: 1.3,
};

export { FONT_SCALE_MAP };

const defaults = {
  fontSize: 'normal' as FontScale,
  highContrast: false,
  reduceMotion: false,
  hapticEnabled: true,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...defaults,
      setFontSize: (fontSize) => set({ fontSize }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
      reset: () => set({ ...defaults }),
    }),
    {
      name: 'adeveil-accessibility',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
