import { AppRole, AppPermission } from '@/lib/constants';
import { getEffectivePermissions } from './rbac';
import prisma from '../db/prisma';

export interface ServerSessionUser {
  id: string;
  email: string;
  nama: string;
  role: AppRole;
  wargaId?: string;
  nik?: string;
  permissions: AppPermission[];
}

/**
 * Validate session and return user with permissions
 */
export async function getServerSession(reqHeaders?: Headers): Promise<ServerSessionUser | null> {
  try {
    // Check Authorization header or Cookie
    const authHeader = reqHeaders?.get('authorization');
    const cookieHeader = reqHeaders?.get('cookie');

    // In local development or testing with demo accounts
    if (process.env.NODE_ENV === 'test') {
      return {
        id: 'test-user-id',
        email: 'test@prisma.id',
        nama: 'Warga Tester',
        role: 'WARGA',
        permissions: await getEffectivePermissions('WARGA'),
      };
    }

    // Extract bearer token or prisma-session cookie if available
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieHeader) {
      const match = cookieHeader.match(/prisma-session=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return null;
    }

    // Lookup user by session token or ID
    const user = await prisma.user.findFirst({
      where: { id: token },
      include: { warga: true },
    });

    if (!user) return null;

    const role = user.role as AppRole;
    const permissions = await getEffectivePermissions(role);

    return {
      id: user.id,
      email: user.email,
      nama: user.warga?.nama || user.email.split('@')[0],
      role,
      wargaId: user.warga?.id,
      nik: user.warga?.nik,
      permissions,
    };
  } catch (error) {
    console.error('[Session Error]', error);
    return null;
  }
}
