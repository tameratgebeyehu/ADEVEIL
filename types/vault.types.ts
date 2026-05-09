// ADEVeil Phase 3 — Extended Type Definitions

export type VaultItemType = 'message' | 'note';

export interface VaultFolder {
  id: string;
  name: string;
  color: string;   // hex color
  icon: string;    // emoji
  createdAt: number;
}

export interface VaultItem {
  id: string;
  title: string;               // Unencrypted — for search
  type: VaultItemType;
  encryptedContent: string;    // ADEV1:: format
  tags: string[];
  folderId?: string;           // Phase 3: folder grouping
  pinned: boolean;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  selfDestructSeconds?: number;
  wordCount?: number;          // Phase 3: metadata
}

export interface VaultState {
  items: VaultItem[];
  folders: VaultFolder[];
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateItem: (id: string, patch: Partial<VaultItem>) => void;
  deleteItem: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addFolder: (folder: Omit<VaultFolder, 'id' | 'createdAt'>) => string;
  importItem: (item: VaultItem) => void;
  importFolder: (folder: VaultFolder) => void;
  deleteFolder: (id: string) => void;
  clearAll: () => void;
}

// App Lock
export type LockTimeout = 0 | 15 | 30 | 60 | 300 | 1800 | 3600;

export interface AppLockState {
  isLocked: boolean;
  isPinSet: boolean;
  sessionPin: string | null;
  isDecoySession: boolean;     // Phase 3: decoy vault active
  unlock: (pin: string, decoy?: boolean) => void;
  lock: () => void;
  clearSessionPin: () => void;
}

// Theme
export type ThemeMode = 'dark' | 'amoled' | 'light' | 'midnight';

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  accent: string;
  accentLight: string;
  accentBlue: string;
  accentGlow: string;
  text: string;
  textMuted: string;
  textDim: string;
  textInverse: string;
  border: string;
  borderLight: string;
  glass: string;
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  gradientPurple: readonly [string, string];
  gradientBg: readonly [string, string];
  isDark: boolean;
}

// Password
export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';
export interface PasswordAnalysis {
  strength: PasswordStrength;
  score: number;
  feedback: string;
}

// Accessibility (Phase 3)
export type FontScale = 'small' | 'normal' | 'large' | 'xlarge';

export interface AccessibilitySettings {
  fontSize: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  hapticEnabled: boolean;
}

// Analytics (Phase 3 — local only)
export interface AnalyticsState {
  messagesProtected: number;
  messagesOpened: number;
  vaultItemsCreated: number;
  notesCreated: number;
  totalSessions: number;
  lastActiveAt: number;
  recentActivity: ActivityEntry[];
  incrementProtected: () => void;
  incrementOpened: () => void;
  incrementVaultItem: () => void;
  incrementNote: () => void;
  startSession: () => void;
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  resetAll: () => void;
}

export interface ActivityEntry {
  id: string;
  type: 'protected' | 'opened' | 'vault_saved' | 'note_created' | 'exported' | 'locked';
  label: string;
  timestamp: number;
}

// Future sync architecture (Phase 3 — types only)
export interface DevicePair {
  deviceId: string;
  publicKey?: string;
  pairedAt: number;
  nickname: string;
  trusted: boolean;
}

export interface SyncPackage {
  version: string;
  encryptedPayload: string;
  checksum: string;
  createdAt: number;
}

// Future AI architecture (types only)
export interface AIAssistant {
  model: string;
  isLocal: boolean;
  capabilities: ('tag' | 'summarize' | 'search')[];
}

export interface SmartTag {
  text: string;
  confidence: number;
  source: 'ai' | 'user';
}
