import { describe, it, expect } from 'vitest';
import { roleHasPermission, authorize } from './rbac';
import { PERMISSIONS } from '@/lib/constants';

describe('RBAC & Permission Authorization', () => {
  it('SUPER_ADMIN should have all permissions', () => {
    expect(roleHasPermission('SUPER_ADMIN', PERMISSIONS.WARGA_DELETE)).toBe(true);
    expect(roleHasPermission('SUPER_ADMIN', PERMISSIONS.SURAT_APPROVE)).toBe(true);
    expect(roleHasPermission('SUPER_ADMIN', PERMISSIONS.ADMIN_AUDIT)).toBe(true);
  });

  it('WARGA should have basic citizen permissions but not admin privileges', () => {
    expect(roleHasPermission('WARGA', PERMISSIONS.SURAT_CREATE)).toBe(true);
    expect(roleHasPermission('WARGA', PERMISSIONS.KEAMANAN_CREATE)).toBe(true);
    expect(roleHasPermission('WARGA', PERMISSIONS.IURAN_PAY)).toBe(true);

    // Should NOT have administrative actions
    expect(roleHasPermission('WARGA', PERMISSIONS.SURAT_APPROVE)).toBe(false);
    expect(roleHasPermission('WARGA', PERMISSIONS.WARGA_DELETE)).toBe(false);
    expect(roleHasPermission('WARGA', PERMISSIONS.ADMIN_AUDIT)).toBe(false);
  });

  it('BENDAHARA should have financial management permissions', () => {
    expect(roleHasPermission('BENDAHARA', PERMISSIONS.KEUANGAN_READ)).toBe(true);
    expect(roleHasPermission('BENDAHARA', PERMISSIONS.IURAN_VERIFY)).toBe(true);
    expect(roleHasPermission('BENDAHARA', PERMISSIONS.KEUANGAN_APPROVE)).toBe(true);
  });

  it('authorize should throw forbidden error when role lacks permission', () => {
    expect(() => authorize('WARGA', PERMISSIONS.ADMIN_AUDIT)).toThrow(/Forbidden/);
    expect(() => authorize('KETUA_RT', PERMISSIONS.SURAT_APPROVE)).not.toThrow();
  });
});
