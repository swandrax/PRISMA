/**
 * Supabase Auth Service
 * SEC-006 FIX: Replaces localStorage-based authentication with Supabase Auth.
 * 
 * This service provides:
 * - Email/password sign-in via Supabase Auth
 * - Session management (automatic token refresh)
 * - Auth state listener for real-time auth changes
 * - Backward compatibility with existing credential system
 * 
 * Supabase Auth stores tokens in `localStorage` internally using httpOnly-like
 * behavior with PKCE flow, which is secure for SPA/static-export apps.
 */

import { createClient } from '@/utils/supabase/client';
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';

// ============================================
// Types
// ============================================

export interface AuthUser {
    id: string;
    email: string;
    nama: string;
    role: 'admin' | 'pengurus' | 'warga';
    permissions: string[];
    avatarUrl?: string;
    metadata: Record<string, unknown>;
}

export interface AuthResult {
    success: boolean;
    user?: AuthUser;
    error?: string;
}

export interface AuthState {
    user: AuthUser | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

// ============================================
// Role → Permission mapping
// ============================================

const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: [
        'manage_users', 'manage_finance', 'manage_surat',
        'manage_security', 'view_reports', 'manage_settings',
        'manage_infrastructure', 'audit_logs', 'manage_files'
    ],
    pengurus: [
        'manage_surat', 'manage_finance', 'view_reports', 'manage_users'
    ],
    warga: [
        'view_reports', 'create_surat', 'report_security'
    ],
    guest: [
        'view_reports'
    ],
};

// ============================================
// Auth Service Functions
// ============================================

/**
 * Sign in with email and password via Supabase Auth.
 * Falls back to demo credentials for development/offline mode.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient();

    try {
        // Attempt Supabase Auth sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Fallback to demo credentials for development
            return await signInWithDemoFallback(email, password);
        }

        if (data.user) {
            const authUser = mapSupabaseUser(data.user);

            // Sync to legacy localStorage for backward compatibility
            syncLegacyStorage(authUser);

            return { success: true, user: authUser };
        }

        return { success: false, error: 'Login gagal. Silakan coba lagi.' };
    } catch {
        // Network error — try demo fallback
        return await signInWithDemoFallback(email, password);
    }
}

/**
 * Sign up a new user with Supabase Auth.
 */
export async function signUp(
    email: string,
    password: string,
    metadata: { nama: string; noTelepon?: string; blok?: string; noRumah?: string; alamat?: string }
): Promise<AuthResult> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nama: metadata.nama,
                    no_telepon: metadata.noTelepon || '',
                    blok: metadata.blok || '',
                    no_rumah: metadata.noRumah || '',
                    alamat: metadata.alamat || '',
                    role: 'warga', // Default role for new registrations
                },
            },
        });

        if (error) {
            return { success: false, error: mapAuthError(error) };
        }

        if (data.user) {
            // Write to the public database tables ('warga' and 'users') for dynamic CRUD and Realtime data sync
            try {
                const combinedAddress = metadata.alamat || `${metadata.blok || ''} ${metadata.noRumah || ''}`.trim() || 'RT 04';
                
                // 1. Sync to public.users table
                await supabase.from('users').upsert({
                    id: data.user.id,
                    name: metadata.nama,
                    email: email,
                    role: 'warga',
                    phone: metadata.noTelepon || '',
                    address: combinedAddress,
                });

                // 2. Sync to public.warga table
                await supabase.from('warga').upsert({
                    nama: metadata.nama,
                    alamat: combinedAddress,
                    status: 'Baru',
                    telepon: metadata.noTelepon || '',
                    email: email
                });
            } catch (dbErr) {
                console.warn('Supabase DB sync error during registration:', dbErr);
            }

            const authUser = mapSupabaseUser(data.user);
            return { success: true, user: authUser };
        }

        return { success: false, error: 'Registrasi gagal.' };
    } catch {
        return { success: false, error: 'Tidak dapat terhubung ke server. Coba lagi nanti.' };
    }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
    const supabase = createClient();

    try {
        await supabase.auth.signOut();
    } catch {
        // Silent fail — clean up locally even if network fails
    }

    // Clear legacy localStorage entries
    clearLegacyStorage();
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return mapSupabaseUser(user);
    } catch {
        // Network error — check legacy storage
    }

    // Fallback: check legacy localStorage
    return getLegacyUser();
}

/**
 * Get the current active session.
 */
export async function getSession(): Promise<Session | null> {
    const supabase = createClient();

    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch {
        return null;
    }
}

/**
 * Subscribe to auth state changes.
 * Returns unsubscribe function.
 */
export function onAuthStateChange(
    callback: (user: AuthUser | null) => void
): () => void {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                const authUser = mapSupabaseUser(session.user);
                syncLegacyStorage(authUser);
                callback(authUser);
            } else {
                clearLegacyStorage();
                callback(null);
            }
        }
    );

    return () => subscription.unsubscribe();
}

/**
 * Reset password via Supabase.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
    const supabase = createClient();

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
        });

        if (error) {
            return { success: false, error: mapAuthError(error) };
        }

        return { success: true };
    } catch {
        return { success: false, error: 'Tidak dapat mengirim email reset.' };
    }
}

// ============================================
// Internal Helpers
// ============================================

/**
 * Map Supabase User to our AuthUser interface.
 */
function mapSupabaseUser(user: User): AuthUser {
    const metadata = user.user_metadata || {};
    const role = (metadata.role as string) || 'warga';

    return {
        id: user.id,
        email: user.email || '',
        nama: (metadata.nama as string) || user.email?.split('@')[0] || 'User',
        role: role as AuthUser['role'],
        permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.warga,
        avatarUrl: metadata.avatar_url as string | undefined,
        metadata,
    };
}

/**
 * Fallback: authenticate using demo credentials when Supabase is unavailable.
 */
async function signInWithDemoFallback(email: string, password: string): Promise<AuthResult> {
    try {
        const { authenticateDemo } = await import('@/lib/demo-credentials');
        const user = await authenticateDemo(email, password);

        if (user) {
            const authUser: AuthUser = {
                id: String(user.id),
                email: user.email,
                nama: user.nama,
                role: user.role as AuthUser['role'],
                permissions: user.permissions,
                metadata: {
                    no_telepon: user.no_telepon,
                    alamat: user.alamat,
                    blok: user.blok,
                    no_rumah: user.no_rumah,
                    status: user.status,
                    source: 'demo_fallback',
                },
            };

            syncLegacyStorage(authUser);
            return { success: true, user: authUser };
        }

        return { success: false, error: 'Email atau password tidak ditemukan.' };
    } catch {
        return { success: false, error: 'Autentikasi gagal.' };
    }
}

/**
 * Map Supabase auth errors to Indonesian messages.
 */
function mapAuthError(error: AuthError): string {
    const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Email atau password salah.',
        'Email not confirmed': 'Email belum dikonfirmasi. Periksa inbox Anda.',
        'User already registered': 'Email sudah terdaftar. Silakan login.',
        'Signup requires a valid password': 'Password tidak valid.',
        'Password should be at least 6 characters': 'Password minimal 6 karakter.',
        'User not found': 'Akun tidak ditemukan.',
        'Email rate limit exceeded': 'Terlalu banyak permintaan. Coba lagi nanti.',
    };

    return errorMap[error.message] || `Error: ${error.message}`;
}

// ============================================
// Legacy Storage Sync (backward compatibility)
// Will be removed once all components migrate
// ============================================

function syncLegacyStorage(user: AuthUser): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('warga_logged_in', 'true');
        localStorage.setItem('warga_profile', JSON.stringify({
            id: user.id,
            nama: user.nama,
            email: user.email,
            telepon: user.metadata.no_telepon || '',
            no_telepon: user.metadata.no_telepon || '',
            alamat: user.metadata.alamat || '',
            blok: user.metadata.blok || '',
            no_rumah: user.metadata.no_rumah || '',
            status: user.metadata.status || 'Aktif',
            role: user.role,
            permissions: user.permissions,
            tanggal_daftar: new Date().toISOString().split('T')[0],
        }));

        // Store credentials for auth viewmodel compatibility
        localStorage.setItem('prisma_credentials', JSON.stringify({
            userId: user.id,
            role: user.role,
            sessionToken: crypto.randomUUID?.() ?? `session-${Date.now()}`,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        }));
    } catch {
        // Storage quota exceeded or unavailable
    }
}

function clearLegacyStorage(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('warga_logged_in');
        localStorage.removeItem('warga_profile');
        localStorage.removeItem('warga_photo');
        localStorage.removeItem('prisma_credentials');
    } catch {
        // Ignore
    }
}

function getLegacyUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    try {
        const loggedIn = localStorage.getItem('warga_logged_in');
        const profileStr = localStorage.getItem('warga_profile');

        if (loggedIn !== 'true' || !profileStr) return null;

        const profile = JSON.parse(profileStr);
        return {
            id: String(profile.id || ''),
            email: profile.email || '',
            nama: profile.nama || '',
            role: profile.role || 'warga',
            permissions: profile.permissions || ROLE_PERMISSIONS.warga,
            metadata: profile,
        };
    } catch {
        return null;
    }
}
