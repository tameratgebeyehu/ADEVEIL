import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode, LockTimeout } from '@/types/vault.types';

interface SettingsState {
  theme: ThemeMode;
  autoClearClipboard: boolean;
  autoClearSeconds: number;
  lockTimeout: LockTimeout;
  biometricEnabled: boolean;
  privacyBlur: boolean;
  shakeToLock: boolean;
  decoyPinEnabled: boolean;

  // Runtime Security
  screenshotBlock: boolean;
  autoHideMessages: boolean;
  autoHideSeconds: number;
  clipboardClearSeconds: number;
  viewOnceMode: boolean;
  showClipboardTimer: boolean;

  setTheme: (t: ThemeMode) => void;
  setAutoClearClipboard: (v: boolean) => void;
  setAutoClearSeconds: (s: number) => void;
  setLockTimeout: (t: LockTimeout) => void;
  setBiometricEnabled: (v: boolean) => void;
  setPrivacyBlur: (v: boolean) => void;
  setShakeToLock: (v: boolean) => void;
  setDecoyPinEnabled: (v: boolean) => void;
  
  setScreenshotBlock: (v: boolean) => void;
  setAutoHideMessages: (v: boolean) => void;
  setAutoHideSeconds: (s: number) => void;
  setClipboardClearSeconds: (s: number) => void;
  setViewOnceMode: (v: boolean) => void;
  setShowClipboardTimer: (v: boolean) => void;

  resetAll: () => void;
}

const defaults = {
  theme: 'dark' as ThemeMode,
  autoClearClipboard: true,
  autoClearSeconds: 60,
  lockTimeout: 60 as LockTimeout,
  biometricEnabled: false,
  privacyBlur: true,
  shakeToLock: false,
  decoyPinEnabled: false,
  screenshotBlock: true,
  autoHideMessages: true,
  autoHideSeconds: 30,
  clipboardClearSeconds: 60,
  viewOnceMode: false,
  showClipboardTimer: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setTheme: (theme) => set({ theme }),
      setAutoClearClipboard: (autoClearClipboard) => set({ autoClearClipboard }),
      setAutoClearSeconds: (autoClearSeconds) => set({ autoClearSeconds }),
      setLockTimeout: (lockTimeout) => set({ lockTimeout }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setPrivacyBlur: (privacyBlur) => set({ privacyBlur }),
      setShakeToLock: (shakeToLock) => set({ shakeToLock }),
      setDecoyPinEnabled: (decoyPinEnabled) => set({ decoyPinEnabled }),
      
      setScreenshotBlock: (screenshotBlock) => set({ screenshotBlock }),
      setAutoHideMessages: (autoHideMessages) => set({ autoHideMessages }),
      setAutoHideSeconds: (autoHideSeconds) => set({ autoHideSeconds }),
      setClipboardClearSeconds: (clipboardClearSeconds) => set({ clipboardClearSeconds }),
      setViewOnceMode: (viewOnceMode) => set({ viewOnceMode }),
      setShowClipboardTimer: (showClipboardTimer) => set({ showClipboardTimer }),

      resetAll: () => set({ ...defaults }),
    }),
    {
      name: 'adeveil-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
