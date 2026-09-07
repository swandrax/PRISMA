import { create } from 'zustand';

interface NavigationStoreState {
  isCommandPaletteOpen: boolean;
  searchQuery: string;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setSearchQuery: (query: string) => void;
}

export const useNavigationStore = create<NavigationStoreState>()((set) => ({
  isCommandPaletteOpen: false,
  searchQuery: '',
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
