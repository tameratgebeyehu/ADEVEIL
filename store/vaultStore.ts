import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import type { VaultItem, VaultFolder, VaultState } from '@/types/vault.types';

function generateId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      items: [],
      folders: [],

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

      addFolder: (folder) => {
        const id = generateId();
        const now = Date.now();
        const newFolder: VaultFolder = { ...folder, id, createdAt: now };
        set(s => ({ folders: [...s.folders, newFolder] }));
        return id;
      },

      importItem: (item) => {
        set(s => {
          if (s.items.some(i => i.id === item.id)) return s;
          return { items: [item, ...s.items] };
        });
      },

      importFolder: (folder) => {
        set(s => {
          if (s.folders.some(f => f.id === folder.id)) return s;
          return { folders: [...s.folders, folder] };
        });
      },

      deleteFolder: (id) => {
        // Move items out of the deleted folder
        set(s => ({
          folders: s.folders.filter(f => f.id !== id),
          items: s.items.map(i => i.folderId === id ? { ...i, folderId: undefined } : i),
        }));
      },

      clearAll: () => set({ items: [], folders: [] }),
    }),
    {
      name: 'adeveil-vault',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
