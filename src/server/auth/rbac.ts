import { AppRole, AppPermission, DEFAULT_ROLE_PERMISSIONS } from '@/lib/constants';
import prisma from '../db/prisma';

export type { AppRole, AppPermission };

/**
 * Check whether a specific role has a permission.
 */
export function roleHasPermission(role: AppRole, permission: AppPermission): boolean {
  const allowed = DEFAULT_ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Resolve all effective permissions for a user from database or defaults
 */
import { Role } from '@prisma/client';

export async function getEffectivePermissions(role: AppRole): Promise<AppPermission[]> {
  try {
    // Check if custom RolePermission mappings exist in DB
    const dbRolePermissions = await prisma.rolePermission.findMany({
      where: { role: role as unknown as Role },
      include: { permission: true },
    });

    if (dbRolePermissions && dbRolePermissions.length > 0) {
      return dbRolePermissions.map((rp) => rp.permission.name as AppPermission);
    }
  } catch {
    // Fallback gracefully to default constants if db table isn't migrated yet
  }

  return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

/**
 * Authorize an action. Throws an error if user lacks permission.
 */
export function authorize(role: AppRole, permission: AppPermission): void {
  if (!roleHasPermission(role, permission)) {
    throw new Error(`Forbidden: Role '${role}' lacks permission '${permission}'`);
  }
}
