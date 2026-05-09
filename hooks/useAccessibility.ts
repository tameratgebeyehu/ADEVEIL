/**
 * useAccessibility — provides derived accessibility values used by all screens.
 *
 * fontScale   — numeric multiplier (0.85 / 1.0 / 1.15 / 1.3)
 * highContrast — boolean; when true, screens should use stronger contrast colors
 * reduceMotion — boolean; when true, skip LayoutAnimations & heavy transitions
 * hapticEnabled — boolean; hapticService reads this directly from the store
 */
import { useAccessibilityStore, FONT_SCALE_MAP } from '@/store/accessibilityStore';

export function useAccessibility() {
  const { fontSize, highContrast, reduceMotion, hapticEnabled } = useAccessibilityStore();

  return {
    fontScale: FONT_SCALE_MAP[fontSize],
    highContrast,
    reduceMotion,
    hapticEnabled,
  };
}
