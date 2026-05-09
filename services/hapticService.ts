import * as Haptics from 'expo-haptics';
import { useAccessibilityStore } from '@/store/accessibilityStore';

/**
 * haptics — All haptic calls check the global hapticEnabled setting.
 * If the user has turned off haptic feedback in Settings → Accessibility,
 * all vibrations are silently skipped.
 */

function isEnabled() {
  return useAccessibilityStore.getState().hapticEnabled;
}

export const haptics = {
  light:   () => { if (isEnabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
  medium:  () => { if (isEnabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); },
  heavy:   () => { if (isEnabled()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); },
  success: () => { if (isEnabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
  warning: () => { if (isEnabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); },
  error:   () => { if (isEnabled()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); },
};
