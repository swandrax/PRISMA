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
import { secureStorage, storeCredentials } from './security';

// ============================================
// Types
// ============================================

export interface DbUserProfile {
    id?: string;
    name?: string;
    nama?: string;
    email?: string;
    role?: string;
    phone?: string;
    no_telepon?: string;
    address?: string;
    alamat?: string;
    avatar_url?: string;
    [key: string]: unknown;
}

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
 * Base sign-in function that validates role.
 */
async function _signInWithRole(email: string, password: string, expectedRole: string): Promise<AuthResult> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            const isNetworkError = 
                error.message?.includes('fetch') || 
                error.message?.includes('NetworkError') || 
                error.message?.includes('Failed to fetch') ||
                error.status === 0;

            if (isNetworkError) {
                return { 
                    success: false, 
                    error: 'Koneksi internet terganggu. Silakan coba lagi.' 
                };
            }

            // Check for unconfirmed email specifically
            const isUnconfirmedEmail = 
                error.message?.includes('Email not confirmed') || 
                error.message?.includes('confirm') ||
                (error.status === 400 && error.message?.includes('confirm'));

            if (isUnconfirmedEmail) {
                return { 
                    success: false, 
                    error: 'Alamat email Anda belum dikonfirmasi. Silakan periksa inbox email Anda untuk mengaktifkan akun.' 
                };
            }

            // ONLY fall back to demo in development environment
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Supabase sign-in failed: ${error.message}. Falling back to demo credentials in development mode.`);
                return await signInWithDemoFallback(email, password, expectedRole);
            }

            return { success: false, error: mapAuthError(error) };
        }

        if (data.user) {
            // Retrieve profile from public.users as the primary source of truth for role and details
            let dbUser: DbUserProfile | null = null;
            try {
                const { data: profile, error: dbErr } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                if (!dbErr && profile) {
                    dbUser = profile as DbUserProfile;
                } else if (dbErr) {
                    console.warn('Gagal membaca profil pengguna dari database:', dbErr.message);
                }
            } catch (dbCatch) {
                console.warn('Kesalahan saat memuat profil dari database:', dbCatch);
            }

            const authUser = mapSupabaseUser(data.user, dbUser);
            
            // Verifikasi Role (Cegah Bentrok Data)
            if (authUser.role !== expectedRole) {
                await supabase.auth.signOut();
                return { 
                    success: false, 
                    error: `Akses ditolak. Akun dengan email ini terdaftar dengan peran '${authUser.role}', bukan sebagai '${expectedRole}'.` 
                };
            }

            syncLegacyStorage(authUser);
            return { success: true, user: authUser };
        }

        return { success: false, error: 'Login gagal. Silakan coba lagi.' };
    } catch (catchErr: unknown) {
        console.error('signIn exception:', catchErr);
        
        // ONLY fall back to demo in development environment
        if (process.env.NODE_ENV === 'development') {
            return await signInWithDemoFallback(email, password, expectedRole);
        }
        
        return { 
            success: false, 
            error: 'Tidak dapat menghubungi server. Silakan coba beberapa saat lagi.' 
        };
    }
}

export async function signInAdmin(email: string, password: string): Promise<AuthResult> {
    return _signInWithRole(email, password, 'admin');
}

export async function signInPengurus(email: string, password: string): Promise<AuthResult> {
    return _signInWithRole(email, password, 'pengurus');
}

export async function signInWarga(email: string, password: string): Promise<AuthResult> {
    return _signInWithRole(email, password, 'warga');
}

/**
 * Base sign-up function.
 */
/**
 * Helper to retry an operation with exponential backoff.
 */
async function retryUpsert(
    operation: () => Promise<{ error: unknown }>,
    maxRetries = 3,
    delayMs = 1000
): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { error } = await operation();
            if (!error) return true;
            console.warn(`Sinkronisasi DB gagal (Percobaan ${attempt}/${maxRetries}):`, error);
        } catch (err) {
            console.warn(`Sinkronisasi DB melempar kesalahan (Percobaan ${attempt}/${maxRetries}):`, err);
        }
        if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
        }
    }
    return false;
}

async function _signUpWithRole(
    email: string,
    password: string,
    metadata: { nama: string; noTelepon?: string; blok?: string; noRumah?: string; alamat?: string },
    role: 'admin' | 'pengurus' | 'warga'
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
                    role: role,
                },
            },
        });

        if (error) {
            const isNetworkError = 
                error.message?.includes('fetch') || 
                error.message?.includes('NetworkError') || 
                error.message?.includes('Failed to fetch') ||
                error.status === 0;

            if (isNetworkError) {
                return { 
                    success: false, 
                    error: 'Koneksi jaringan terganggu. Silakan periksa koneksi internet Anda dan coba lagi.' 
                };
            }

            if (error.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
                console.error('Supabase 403 Error: Kemungkinan API key salah atau RLS policy belum dikonfigurasi.', error);
                return { 
                    success: false, 
                    error: 'Registrasi gagal (403). Hubungi pengurus RT - konfigurasi server atau kebijakan keamanan (RLS) perlu diperbaiki.' 
                };
            }
            
            return { success: false, error: mapAuthError(error) };
        }

        if (data.user) {
            try {
                const combinedAddress = metadata.alamat || `${metadata.blok || ''} ${metadata.noRumah || ''}`.trim() || 'RT 04';
                
                // 1. Synchronize to public.users table (try SQLite schema first, fall back to Standard)
                let usersSynced = false;
                
                // Try SQLite schema
                const sqliteUserPayload = {
                    id: data.user.id,
                    nama: metadata.nama,
                    email: email,
                    role: role,
                    no_telepon: metadata.noTelepon || '',
                    alamat: combinedAddress,
                };
                
                const syncSqlite = await retryUpsert(() => 
                    supabase.from('users').upsert(sqliteUserPayload)
                );
                
                if (syncSqlite) {
                    usersSynced = true;
                } else {
                    console.warn('SQLite schema sync failed or column mismatch on public.users. Retrying with Standard schema...');
                    // Try Standard schema
                    const standardUserPayload = {
                        id: data.user.id,
                        name: metadata.nama,
                        email: email,
                        role: role,
                        phone: metadata.noTelepon || '',
                        address: combinedAddress,
                    };
                    const syncStandard = await retryUpsert(() => 
                        supabase.from('users').upsert(standardUserPayload)
                    );
                    if (syncStandard) {
                        usersSynced = true;
                    }
                }

                if (!usersSynced) {
                    console.error('Gagal menyelaraskan tabel public.users dengan skema apa pun setelah beberapa percobaan.');
                }

                // 2. Synchronize to public.warga table (try with email column first, fall back to without email)
                if (role === 'warga') {
                    let wargaSynced = false;
                    
                    // Try with email column
                    const fullWargaPayload = {
                        nama: metadata.nama,
                        alamat: combinedAddress,
                        status: 'Baru',
                        telepon: metadata.noTelepon || '',
                        email: email,
                    };
                    
                    const syncFullWarga = await retryUpsert(() => 
                        supabase.from('warga').upsert(fullWargaPayload)
                    );
                    
                    if (syncFullWarga) {
                        wargaSynced = true;
                    } else {
                        console.warn('Warga sync with email column failed. Retrying without email column...');
                        // Try without email column
                        const leanWargaPayload = {
                            nama: metadata.nama,
                            alamat: combinedAddress,
                            status: 'Baru',
                            telepon: metadata.noTelepon || '',
                        };
                        const syncLeanWarga = await retryUpsert(() => 
                            supabase.from('warga').upsert(leanWargaPayload)
                        );
                        if (syncLeanWarga) {
                            wargaSynced = true;
                        }
                    }
                    
                    if (!wargaSynced) {
                        console.error('Gagal menyelaraskan tabel public.warga dengan skema apa pun setelah beberapa percobaan.');
                    }
                }
            } catch (dbErr) {
                console.error('Terjadi kesalahan tidak terduga saat sinkronisasi database:', dbErr);
            }

            const authUser = mapSupabaseUser(data.user);
            return { success: true, user: authUser };
        }

        return { success: false, error: 'Registrasi gagal.' };
    } catch {
        return { success: false, error: 'Tidak dapat terhubung ke server. Coba lagi nanti.' };
    }
}

export async function signUpAdmin(email: string, password: string, metadata: { nama: string; noTelepon?: string; blok?: string; noRumah?: string; alamat?: string }): Promise<AuthResult> {
    return _signUpWithRole(email, password, metadata, 'admin');
}

export async function signUpPengurus(email: string, password: string, metadata: { nama: string; noTelepon?: string; blok?: string; noRumah?: string; alamat?: string }): Promise<AuthResult> {
    return _signUpWithRole(email, password, metadata, 'pengurus');
}

export async function signUpWarga(email: string, password: string, metadata: { nama: string; noTelepon?: string; blok?: string; noRumah?: string; alamat?: string }): Promise<AuthResult> {
    return _signUpWithRole(email, password, metadata, 'warga');
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

/**
 * Update user profile details and profile photo without requiring Supabase PostgreSQL database schema modifications.
 * Utilizes Supabase Auth user_metadata JSONB and browser-side secureStorage for large files like photos.
 */
export async function updateProfile(
    metadata: { nama: string; noTelepon?: string; alamat?: string; avatarUrl?: string },
    profilePhotoBase64?: string
): Promise<AuthResult> {
    const supabase = createClient();

    try {
        // 1. Update standard metadata inside Supabase Auth user_metadata (JSONB block in auth.users)
        // This is managed natively by Supabase Auth and doesn't require any DB schema alterations!
        const { data, error } = await supabase.auth.updateUser({
            data: {
                nama: metadata.nama,
                no_telepon: metadata.noTelepon || '',
                alamat: metadata.alamat || '',
                avatar_url: metadata.avatarUrl || '',
            }
        });

        if (error) {
            console.error('Supabase auth.updateUser error:', error.message);
            // Return failure if Supabase rejects it
            return { success: false, error: mapAuthError(error) };
        }

        if (data.user) {
            // 2. Save the base64 photo locally in our encrypted secureStorage
            // Large base64 files are saved locally to prevent exceeding Supabase Auth metadata limits (typically 32KB).
            if (typeof window !== 'undefined' && profilePhotoBase64) {
                try {
                    localStorage.setItem('warga_photo', profilePhotoBase64);
                    secureStorage.set('warga_photo', profilePhotoBase64, { encrypt: true });
                } catch (storeErr) {
                    console.warn('Gagal menyimpan foto profil ke penyimpanan lokal:', storeErr);
                }
            }

            // 3. Try to sync to the public database tables as a background fallback.
            // If the public tables are missing columns or RLS blocks it, we catch it and ignore it
            // because we are fully utilizing Supabase Auth metadata and local storage as our source of truth!
            try {
                const combinedAddress = metadata.alamat || '';
                
                // Try SQLite schema first
                const sqlitePayload = {
                    id: data.user.id,
                    nama: metadata.nama,
                    no_telepon: metadata.noTelepon || '',
                    alamat: combinedAddress,
                };
                
                const syncSqlite = await supabase.from('users').upsert(sqlitePayload);
                if (syncSqlite.error) {
                    // Fallback to Standard schema
                    const standardPayload = {
                        id: data.user.id,
                        name: metadata.nama,
                        phone: metadata.noTelepon || '',
                        address: combinedAddress,
                    };
                    await supabase.from('users').upsert(standardPayload);
                }

                // Sync to public.warga if they are a resident
                const authUser = mapSupabaseUser(data.user);
                if (authUser.role === 'warga') {
                    const fullWargaPayload = {
                        nama: metadata.nama,
                        alamat: combinedAddress,
                        telepon: metadata.noTelepon || '',
                        email: data.user.email || '',
                    };
                    const syncWarga = await supabase.from('warga').upsert(fullWargaPayload);
                    if (syncWarga.error) {
                        const leanWargaPayload = {
                            nama: metadata.nama,
                            alamat: combinedAddress,
                            telepon: metadata.noTelepon || '',
                        };
                        await supabase.from('warga').upsert(leanWargaPayload);
                    }
                }
            } catch (dbErr) {
                console.warn('Non-blocking DB sync failure during profile update:', dbErr);
            }

            const updatedUser = mapSupabaseUser(data.user);
            syncLegacyStorage(updatedUser);

            return { success: true, user: updatedUser };
        }

        return { success: false, error: 'Gagal memperbarui profil.' };
    } catch (catchErr) {
        console.error('updateProfile exception:', catchErr);
        return { success: false, error: 'Tidak dapat terhubung ke server autentikasi.' };
    }
}

// ============================================
// Internal Helpers
// ============================================

/**
 * Map Supabase User to our AuthUser interface.
 */
function mapSupabaseUser(user: User, dbUser?: DbUserProfile | null): AuthUser {
    const metadata = user.user_metadata || {};
    // Primary from public.users table, secondary from user_metadata, fallback to 'warga'
    const role = (dbUser?.role as string) || (metadata.role as string) || 'warga';
    const nama = (dbUser?.name as string) || (metadata.nama as string) || user.email?.split('@')[0] || 'User';

    return {
        id: user.id,
        email: user.email || (dbUser?.email as string) || '',
        nama: nama,
        role: role as AuthUser['role'],
        permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.warga,
        avatarUrl: (dbUser?.avatar_url as string) || (metadata.avatar_url as string | undefined),
        metadata: {
            ...metadata,
            ...(dbUser || {}),
        },
    };
}

/**
 * Fallback: authenticate using demo credentials when Supabase is unavailable.
 */
async function signInWithDemoFallback(email: string, password: string, expectedRole: string): Promise<AuthResult> {
    try {
        const { authenticateDemo } = await import('@/lib/demo-credentials');
        const user = await authenticateDemo(email, password);

        if (user) {
            if (user.role !== expectedRole) {
                return { success: false, error: `Akses ditolak. Email ini tidak terdaftar sebagai ${expectedRole}.` };
            }

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
        'Signups not allowed for this instance': 'Pendaftaran tidak diizinkan. Hubungi admin.',
        'Database error saving new user': 'Gagal menyimpan data. Coba lagi nanti.',
        'Invalid API key': 'Konfigurasi server salah. Hubungi admin.',
    };

    // Check for partial matches (some errors have dynamic messages)
    for (const [key, value] of Object.entries(errorMap)) {
        if (error.message?.includes(key)) return value;
    }

    return errorMap[error.message] || `Error: ${error.message}`;
}

// ============================================
// Legacy Storage Sync (backward compatibility)
// Will be removed once all components migrate
// ============================================

function syncLegacyStorage(user: AuthUser): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('warga_logged_in', 'true'); // Simple flag only (non-sensitive)
        document.cookie = "warga_session=true; path=/; max-age=86400; SameSite=Lax; secure";

        // SEC-FIX: Store profile in encrypted secureStorage instead of plaintext localStorage
        const profileData = {
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
        };
        secureStorage.set('warga_profile', profileData, { encrypt: true, expiry: 24 * 60 * 60 * 1000 });

        // SEC-FIX: Store credentials using encrypted storeCredentials()
        storeCredentials({
            userId: user.id,
            role: user.role === 'admin' ? 'admin' : (user.role === 'pengurus' ? 'staff' : 'warga'),
            sessionToken: crypto.randomUUID?.() ?? `session-${Date.now()}`,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });
    } catch {
        // Storage quota exceeded or unavailable
    }
}

function clearLegacyStorage(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('warga_logged_in');
        document.cookie = "warga_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        localStorage.removeItem('warga_profile');
        localStorage.removeItem('warga_photo');
        localStorage.removeItem('prisma_credentials');
        // SEC-FIX: Also clear encrypted secure storage
        secureStorage.remove('warga_profile');
        secureStorage.remove('warga_photo');
        secureStorage.clear();
    } catch {
        // Ignore
    }
}

function getLegacyUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    try {
        const loggedIn = localStorage.getItem('warga_logged_in');
        if (loggedIn !== 'true') return null;

        // SEC-FIX: Try secureStorage first, then fallback to plaintext localStorage
        const secureProfile = secureStorage.get<Record<string, unknown>>('warga_profile');
        const profile = secureProfile || (() => {
            const raw = localStorage.getItem('warga_profile');
            return raw ? JSON.parse(raw) : null;
        })();

        if (!profile) return null;

        return {
            id: String(profile.id || ''),
            email: (profile.email as string) || '',
            nama: (profile.nama as string) || '',
            role: (profile.role as AuthUser['role']) || 'warga',
            permissions: (profile.permissions as string[]) || ROLE_PERMISSIONS.warga,
            metadata: profile as Record<string, unknown>,
        };
    } catch {
        return null;
    }
}
