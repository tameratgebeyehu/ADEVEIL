import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import type { AnalyticsState, ActivityEntry } from '@/types/vault.types';

function uid(): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      messagesProtected: 0,
      messagesOpened: 0,
      vaultItemsCreated: 0,
      notesCreated: 0,
      totalSessions: 0,
      lastActiveAt: Date.now(),
      recentActivity: [],

      incrementProtected: () => {
        set(s => ({ messagesProtected: s.messagesProtected + 1 }));
        get().addActivity({ type: 'protected', label: 'Message protected' });
      },
      incrementOpened: () => {
        set(s => ({ messagesOpened: s.messagesOpened + 1 }));
        get().addActivity({ type: 'opened', label: 'Message opened' });
      },
      incrementVaultItem: () => {
        set(s => ({ vaultItemsCreated: s.vaultItemsCreated + 1 }));
        get().addActivity({ type: 'vault_saved', label: 'Saved to vault' });
      },
      incrementNote: () => {
        set(s => ({ notesCreated: s.notesCreated + 1 }));
        get().addActivity({ type: 'note_created', label: 'Note created' });
      },
      startSession: () => {
        set(s => ({ totalSessions: s.totalSessions + 1, lastActiveAt: Date.now() }));
        get().addActivity({ type: 'locked', label: 'Session started' });
      },
      addActivity: (entry) => {
        const full: ActivityEntry = { ...entry, id: uid(), timestamp: Date.now() };
        set(s => ({
          recentActivity: [full, ...s.recentActivity].slice(0, 20), // keep last 20
        }));
      },
      resetAll: () => set({
        messagesProtected: 0,
        messagesOpened: 0,
        vaultItemsCreated: 0,
        notesCreated: 0,
        totalSessions: 0,
        recentActivity: [],
      }),
    }),
    {
      name: 'adeveil-analytics',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
