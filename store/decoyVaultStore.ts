import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import type { VaultItem, VaultState } from '@/types/vault.types';

// Decoy vault — stored under a separate key
// Visually identical to the real vault but completely isolated

function generateId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

type DecoyVaultState = Omit<VaultState, 'folders' | 'addFolder' | 'deleteFolder'>;

export const useDecoyVaultStore = create<DecoyVaultState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = generateId();
        const now = Date.now();
        set(s => ({ items: [{ ...item, id, createdAt: now, updatedAt: now }, ...s.items] }));
        return id;
      },

      updateItem: (id, patch) => {
        set(s => ({
          items: s.items.map(i => i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i),
        }));
      },

      deleteItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

      togglePin: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) get().updateItem(id, { pinned: !item.pinned });
      },

      toggleFavorite: (id) => {
        const item = get().items.find(i => i.id === id);
        if (item) get().updateItem(id, { favorite: !item.favorite });
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'adeveil-vault-decoy', // different key from real vault
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
