/**
 * cacheCleanupService — utilities for wiping sensitive runtime state.
 *
 * JS cannot truly zero-fill memory like C/C++, but we can:
 * - Null out references so GC can collect
 * - Schedule timed wipes
 * - Clear any expo-file-system temp files
 */

import * as FileSystem from 'expo-file-system';
import { secureLogger } from './secureLogger';

/**
 * Schedules a callback to run after delayMs and returns a cancel handle.
 */
export function scheduleWipe(callback: () => void, delayMs: number): () => void {
  const timer = setTimeout(() => {
    try {
      callback();
      secureLogger.log('Scheduled wipe executed');
    } catch (e) {
      secureLogger.error('Wipe callback failed', e);
    }
  }, delayMs);
  return () => clearTimeout(timer);
}

/**
 * Attempts to delete a file from the cache directory.
 * Used for temporary export files.
 */
export async function deleteTempFile(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      secureLogger.log('Temp file deleted');
    }
  } catch (e) {
    secureLogger.error('Failed to delete temp file', e);
  }
}

/**
 * Clears all files in the app's cache directory.
 */
export async function clearAllTempFiles(): Promise<void> {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;
    const files = await FileSystem.readDirectoryAsync(cacheDir);
    await Promise.all(
      files.map(f => FileSystem.deleteAsync(`${cacheDir}${f}`, { idempotent: true }))
    );
    secureLogger.log(`Cleared ${files.length} temp file(s)`);
  } catch (e) {
    secureLogger.error('Failed to clear temp files', e);
  }
}
