import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { useUIStore } from './ui.store';
import { useNavigationStore } from './navigation.store';
import { useOfflineStore } from './offline.store';
import { usePreferencesStore } from './preferences.store';
import { AppPermission } from '@/server/auth/rbac';

describe('Zustand Stores (Client UI State Only)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useUIStore.getState().closeModal();
    useNavigationStore.getState().setCommandPaletteOpen(false);
  });

  it('auth store should manage client user identity and active role view', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    useAuthStore.getState().setUser({
      id: 'usr-1',
      email: 'ketua@prisma.id',
      nama: 'Ketua RT',
      role: 'KETUA_RT',
      permissions: ['surat.approve' as AppPermission],
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.nama).toBe('Ketua RT');
    expect(useAuthStore.getState().activeRoleView).toBe('KETUA_RT');

    // Switch active role preview to WARGA
    useAuthStore.getState().setActiveRoleView('WARGA');
    expect(useAuthStore.getState().activeRoleView).toBe('WARGA');

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('ui store should toggle sidebar and modal state', () => {
    expect(useUIStore.getState().isSidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);

    useUIStore.getState().openModal('AJUKAN_SURAT', { prefill: 'SKCK' });
    expect(useUIStore.getState().activeModal).toBe('AJUKAN_SURAT');
    expect(useUIStore.getState().modalPayload).toEqual({ prefill: 'SKCK' });

    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it('navigation store should toggle command palette and store search query', () => {
    expect(useNavigationStore.getState().isCommandPaletteOpen).toBe(false);

    useNavigationStore.getState().toggleCommandPalette();
    expect(useNavigationStore.getState().isCommandPaletteOpen).toBe(true);

    useNavigationStore.getState().setSearchQuery('surat domisili');
    expect(useNavigationStore.getState().searchQuery).toBe('surat domisili');
  });

  it('offline store should track network status and pending mutation count', () => {
    useOfflineStore.getState().setOnline(false);
    expect(useOfflineStore.getState().isOnline).toBe(false);

    useOfflineStore.getState().setPendingCount(3);
    expect(useOfflineStore.getState().pendingCount).toBe(3);

    useOfflineStore.getState().setOnline(true);
    expect(useOfflineStore.getState().isOnline).toBe(true);
  });

  it('preferences store should store table density and filter drafts', () => {
    expect(usePreferencesStore.getState().tableDensity).toBe('comfortable');

    usePreferencesStore.getState().setTableDensity('compact');
    expect(usePreferencesStore.getState().tableDensity).toBe('compact');

    usePreferencesStore.getState().setWargaFilterDraft({ blok: 'B' });
    expect(usePreferencesStore.getState().wargaFilterDraft.blok).toBe('B');

    usePreferencesStore.getState().resetWargaFilterDraft();
    expect(usePreferencesStore.getState().wargaFilterDraft).toEqual({});
  });
});
