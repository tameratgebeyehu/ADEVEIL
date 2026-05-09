import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { blockCapture, allowCapture, addScreenshotListener } from '@/services/screenCaptureService';

/**
 * useSecureScreen — blocks screenshots/recording on mount.
 *
 * By default the screen is ALWAYS secured regardless of the global setting
 * (the setting only controls whether to secure ALL screens globally, but
 * sensitive screens like protect/open/vault/app-lock are always protected).
 *
 * Pass `allowCaptures: true` to explicitly ALLOW captures on that screen
 * (used on the QR share page so users can screenshot/save the QR code).
 */
export function useSecureScreen(options: {
  allowCaptures?: boolean;
  showToastOnScreenshot?: (cb: () => void) => void;
} = {}) {
  const { screenshotBlock } = useSettingsStore();

  useEffect(() => {
    let unsub: { remove: () => void } | null = null;

    if (options.allowCaptures) {
      // Explicitly allow captures for this screen (QR share)
      allowCapture();
    } else {
      // Block captures — always on sensitive screens
      blockCapture();

      if (options.showToastOnScreenshot) {
        unsub = addScreenshotListener(options.showToastOnScreenshot(() => {}));
      }
    }

    return () => {
      if (options.allowCaptures) {
        // Re-block when leaving the QR screen if the global setting is on
        if (screenshotBlock) blockCapture();
      } else {
        allowCapture();
      }
      unsub?.remove();
    };
  }, [screenshotBlock, options.allowCaptures]);
}

/**
 * useGlobalScreenshotBlock — applied globally in _layout.tsx.
 * Watches the screenshotBlock setting and blocks/allows at the app level.
 */
export function useGlobalScreenshotBlock() {
  const { screenshotBlock } = useSettingsStore();

  useEffect(() => {
    if (screenshotBlock) {
      blockCapture();
    } else {
      allowCapture();
    }
  }, [screenshotBlock]);
}
