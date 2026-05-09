import { create } from 'zustand';
import type { AppLockState } from '@/types/vault.types';

// In-memory only — never persisted
export const useAppLockStore = create<AppLockState>((set) => ({
  isLocked: true,
  isPinSet: false,
  sessionPin: null,
  isDecoySession: false,   // Phase 3: true when decoy PIN used

  unlock: (pin: string, decoy = false) =>
    set({ isLocked: false, sessionPin: pin, isDecoySession: decoy }),

  lock: () =>
    set({ isLocked: true, sessionPin: null, isDecoySession: false }),

  clearSessionPin: () =>
    set({ sessionPin: null }),
}));
