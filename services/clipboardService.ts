import * as Clipboard from 'expo-clipboard';

let autoClearTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Copies text to clipboard. If autoClearSeconds > 0, clears after that delay.
 */
export async function copyToClipboard(
  text: string,
  autoClearSeconds = 0
): Promise<void> {
  await Clipboard.setStringAsync(text);

  // Cancel any existing auto-clear timer
  if (autoClearTimer) {
    clearTimeout(autoClearTimer);
    autoClearTimer = null;
  }

  if (autoClearSeconds > 0) {
    autoClearTimer = setTimeout(async () => {
      try {
        const current = await Clipboard.getStringAsync();
        // Only clear if clipboard still has our text (user may have copied something else)
        if (current === text) {
          await Clipboard.setStringAsync('');
        }
      } catch {}
      autoClearTimer = null;
    }, autoClearSeconds * 1000);
  }
}

/**
 * Reads current clipboard content.
 */
export async function readClipboard(): Promise<string> {
  return Clipboard.getStringAsync();
}

/** Alias used by Phase 2 screens. */
export const getFromClipboard = readClipboard;
