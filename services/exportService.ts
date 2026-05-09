import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { protectMessage, openMessage } from '@/crypto/cryptoService';
import type { VaultItem, VaultFolder } from '@/types/vault.types';

const DECOY_PIN_KEY = 'adeveil_decoy_pin_hash';

// ─── Decoy PIN ────────────────────────────────────────────────────────────────

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `adeveil-decoy-v1-${pin}`
  );
}

export async function saveDecoyPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(DECOY_PIN_KEY, hash);
}

export async function isDecoyPinSet(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(DECOY_PIN_KEY);
  return hash !== null;
}

export async function verifyDecoyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(DECOY_PIN_KEY);
  if (!stored) return false;
  return (await hashPin(pin)) === stored;
}

export async function clearDecoyPin(): Promise<void> {
  await SecureStore.deleteItemAsync(DECOY_PIN_KEY);
}

// ─── Encrypted Backup Export ──────────────────────────────────────────────────

interface BackupPackage {
  version: '1';
  items: VaultItem[];
  folders: VaultFolder[];
  exportedAt: number;
}

const BACKUP_PREFIX = 'ADEVBAK1::';

/**
 * Encrypts vault data and saves as a shareable .adevbackup file.
 */
export async function exportVault(
  items: VaultItem[],
  folders: VaultFolder[],
  backupPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const pkg: BackupPackage = { version: '1', items, folders, exportedAt: Date.now() };
    const json = JSON.stringify(pkg);
    const result = await protectMessage(json, backupPassword);
    if (!result.success || !result.data) return { success: false, error: 'Encryption failed' };

    // Replace ADEV1:: with ADEVBAK1::
    const backupStr = result.data.replace('ADEV1::', BACKUP_PREFIX);

    const filename = `ADEVeil-Backup-${Date.now()}.adevbackup`;
    const uri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, backupStr, { encoding: FileSystem.EncodingType.UTF8 });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Save ADEVeil Backup' });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Export failed' };
  }
}

/**
 * Reads and decrypts an .adevbackup file.
 */
export async function importVault(
  backupPassword: string
): Promise<{ success: boolean; data?: BackupPackage; error?: string }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return { success: false, error: 'Cancelled' };
    }

    const uri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });

    if (!content.startsWith(BACKUP_PREFIX)) {
      return { success: false, error: 'Not a valid ADEVeil backup file' };
    }

    // Replace ADEVBAK1:: back to ADEV1:: for the crypto engine
    const cryptoStr = content.replace(BACKUP_PREFIX, 'ADEV1::');
    const decResult = await openMessage(cryptoStr, backupPassword);

    if (!decResult.success || !decResult.data) {
      return { success: false, error: 'Wrong password or corrupted backup' };
    }

    const pkg: BackupPackage = JSON.parse(decResult.data);
    if (pkg.version !== '1') return { success: false, error: 'Unsupported backup version' };

    return { success: true, data: pkg };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Import failed' };
  }
}
