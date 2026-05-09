/**
 * screenCaptureService — wraps expo-screen-capture.
 *
 * Blocks screenshots and screen recording on sensitive screens.
 * Uses FLAG_SECURE on Android.
 *
 * Call blockCapture() on screen mount, allowCapture() on unmount.
 */

import * as ScreenCapture from 'expo-screen-capture';

let blockCount = 0; // ref-count so nested calls don't prematurely re-allow

export async function blockCapture(): Promise<void> {
  try {
    blockCount++;
    if (blockCount === 1) {
      await ScreenCapture.preventScreenCaptureAsync();
    }
  } catch {
    // expo-screen-capture may not be available in Expo Go — fail silently
  }
}

export async function allowCapture(): Promise<void> {
  try {
    blockCount = Math.max(0, blockCount - 1);
    if (blockCount === 0) {
      await ScreenCapture.allowScreenCaptureAsync();
    }
  } catch {}
}

export function addScreenshotListener(
  callback: () => void
): { remove: () => void } {
  try {
    const sub = ScreenCapture.addScreenshotListener(callback);
    return { remove: () => sub.remove() };
  } catch {
    return { remove: () => {} };
  }
}
