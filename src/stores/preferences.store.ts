import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesStoreState {
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  wargaFilterDraft: {
    status?: string;
    blok?: string;
    search?: string;
  };
  setTableDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  setWargaFilterDraft: (filters: Partial<PreferencesStoreState['wargaFilterDraft']>) => void;
  resetWargaFilterDraft: () => void;
}

export const usePreferencesStore = create<PreferencesStoreState>()(
  persist(
    (set) => ({
      tableDensity: 'comfortable',
      wargaFilterDraft: {},
      setTableDensity: (density) => set({ tableDensity: density }),
      setWargaFilterDraft: (filters) =>
        set((s) => ({ wargaFilterDraft: { ...s.wargaFilterDraft, ...filters } })),
      resetWargaFilterDraft: () => set({ wargaFilterDraft: {} }),
    }),
    {
      name: 'prisma-user-preferences',
    }
  )
);
