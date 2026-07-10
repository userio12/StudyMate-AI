import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  presence: 'online' | 'offline';
  setPresence: (presence: 'online' | 'offline') => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      presence: 'online',
      setPresence: (presence) => set({ presence }),
    }),
    {
      name: 'studymate-ui',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => localStorage)
        : undefined,
    },
  ),
);
