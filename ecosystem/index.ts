/**
 * ADE Ecosystem — Module Index
 * 
 * Prepares the architecture for the future ADE ecosystem expansion:
 * - ADEVeil Vault
 * - ADEVeil Notes
 * - ADEVeil Share
 * - ADEVeil Workspace
 * - ADEVeil Sync (future)
 * - ADEVeil Desktop (future)
 */

// Re-export core services for ecosystem consumers
export { protectMessage, openMessage } from '@/crypto/cryptoService';
export { useVaultStore } from '@/store/vaultStore';
export { useAnalyticsStore } from '@/store/analyticsStore';
export { exportVault, importVault } from '@/services/exportService';

// Ecosystem module identifiers
export const ADE_ECOSYSTEM_VERSION = '3.0.0';

export const ADE_MODULES = {
  VAULT: 'ADEVeil.Vault',
  NOTES: 'ADEVeil.Notes',
  SHARE: 'ADEVeil.Share',
  WORKSPACE: 'ADEVeil.Workspace',
  SYNC: 'ADEVeil.Sync',       // future
  DESKTOP: 'ADEVeil.Desktop', // future
} as const;

export type ADEModule = (typeof ADE_MODULES)[keyof typeof ADE_MODULES];
