// ADEVeil TypeScript Types

export interface CryptoResult {
  success: boolean;
  data?: string;
  error?: CryptoErrorCode;
}

export type CryptoErrorCode =
  | 'WRONG_PASSWORD'
  | 'INVALID_FORMAT'
  | 'EMPTY_INPUT'
  | 'UNKNOWN_ERROR';

export interface ProtectedMessage {
  version: number;      // Protocol version
  iv: string;          // Base64-encoded IV
  ciphertext: string;  // Base64-encoded encrypted data
}

// Future: QR, File, Image protection types
export type ProtectionMode = 'text' | 'file' | 'image';

export interface ProtectOptions {
  mode: ProtectionMode;
  autoClearAfter?: number; // seconds
}
