import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

/**
 * Opens the native share sheet with the given text.
 * Creates a temporary .txt file to enable sharing on Android.
 */
export async function shareText(text: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) return;

  // Write to a temp file so Android share sheet works properly
  const fileUri = `${FileSystem.cacheDirectory}adeveil_protected.txt`;
  await FileSystem.writeAsStringAsync(fileUri, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/plain',
    dialogTitle: 'Share Protected Message',
  });
}
