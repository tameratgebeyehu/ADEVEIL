// ADEVeil — Future Architecture Stubs
// These types prepare for future cross-device sync without implementing cloud features now.

export interface DevicePair {
  deviceId: string;
  nickname: string;
  publicKey?: string;
  pairedAt: number;
  trusted: boolean;
  lastSeen?: number;
}

export interface SyncPackage {
  version: '1';
  encryptedPayload: string;
  checksum: string;
  createdAt: number;
  deviceId: string;
}

export interface QRPairPayload {
  type: 'pair_request';
  deviceId: string;
  publicKey: string;
  nickname: string;
  expiresAt: number;
}

export type SyncStatus = 'idle' | 'pairing' | 'syncing' | 'error' | 'success';
