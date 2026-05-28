"use client"

/**
 * useAuth Hook — Supabase Auth integration for React components
 * SEC-006 FIX: Centralized auth hook replacing scattered localStorage checks.
 * 
 * Usage:
 *   const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (!isAuthenticated) return <Redirect to="/auth/login" />;
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import {
    signInWarga,
    signUpWarga,
    signInPengurus,
    signUpPengurus,
    signInAdmin,
    signUpAdmin,
    signOut as authSignOut,
    getCurrentUser,
    onAuthStateChange,
    resetPassword as authResetPassword,
    type AuthUser,
    type AuthResult,
} from '../lib/supabase-auth';

// ============================================
// Auth Context
// ============================================

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    signIn: (email: string, password: string, role?: 'warga'|'pengurus'|'admin') => Promise<AuthResult>;
    signUp: (email: string, password: string, metadata: { nama: string; noTelepon?: string }, role?: 'warga'|'pengurus'|'admin') => Promise<AuthResult>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<AuthResult>;
    clearError: () => void;

    // Permission checks
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// Auth Provider
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize: check for existing session
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (mounted) {
                    setUser(currentUser);
                    setIsLoading(false);
                }
            } catch {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChange((authUser: AuthUser | null) => {
            if (mounted) {
                setUser(authUser);
                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    // Sign in
    const handleSignIn = useCallback(async (email: string, password: string, role: 'warga'|'pengurus'|'admin' = 'warga'): Promise<AuthResult> => {
        setError(null);
        setIsLoading(true);

        let result;
        if (role === 'admin') result = await signInAdmin(email, password);
        else if (role === 'pengurus') result = await signInPengurus(email, password);
        else result = await signInWarga(email, password);

        if (result.success && result.user) {
            setUser(result.user);
        } else if (result.error) {
            setError(result.error);
        }

        setIsLoading(false);
        return result;
    }, []);

    // Sign up
    const handleSignUp = useCallback(async (
        email: string,
        password: string,
        metadata: { nama: string; noTelepon?: string },
        role: 'warga'|'pengurus'|'admin' = 'warga'
    ): Promise<AuthResult> => {
        setError(null);
        setIsLoading(true);

        let result;
        if (role === 'admin') result = await signUpAdmin(email, password, metadata);
        else if (role === 'pengurus') result = await signUpPengurus(email, password, metadata);
        else result = await signUpWarga(email, password, metadata);

        if (result.success && result.user) {
            setUser(result.user);
        } else if (result.error) {
            setError(result.error);
        }

        setIsLoading(false);
        return result;
    }, []);

    // Sign out
    const handleSignOut = useCallback(async () => {
        setIsLoading(true);
        await authSignOut();
        setUser(null);
        setError(null);
        setIsLoading(false);
    }, []);

    // Reset password
    const handleResetPassword = useCallback(async (email: string): Promise<AuthResult> => {
        setError(null);
        const result = await authResetPassword(email);
        if (result.error) setError(result.error);
        return result;
    }, []);

    // Clear error
    const clearError = useCallback(() => setError(null), []);

    // Role check
    const hasRole = useCallback((role: string): boolean => {
        if (!user) return false;
        const hierarchy: Record<string, number> = { admin: 3, pengurus: 2, staff: 2, warga: 1 };
        return (hierarchy[user.role] || 0) >= (hierarchy[role] || 0);
    }, [user]);

    // Permission check
    const hasPermission = useCallback((permission: string): boolean => {
        if (!user) return false;
        return user.permissions.includes(permission);
    }, [user]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        clearError,
        hasRole,
        hasPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// useAuth Hook
// ============================================

/**
 * Access auth state and actions from any component.
 * Must be used within an AuthProvider.
 * 
 * Falls back to standalone mode if no provider is found (for gradual migration).
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    const standalone = useAuthStandalone();

    // Prefer context if AuthProvider is available
    return context || standalone;
}

/**
 * Standalone auth hook (no provider needed).
 * Useful during migration period.
 */
function useAuthStandalone(): AuthContextType {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        getCurrentUser().then((u: AuthUser | null) => {
            if (mounted) {
                setUser(u);
                setIsLoading(false);
            }
        }).catch(() => {
            if (mounted) setIsLoading(false);
        });

        const unsubscribe = onAuthStateChange((u: AuthUser | null) => {
            if (mounted) {
                setUser(u);
                setIsLoading(false);
            }
        });

        return () => { mounted = false; unsubscribe(); };
    }, []);

    const handleSignIn = useCallback(async (email: string, password: string, role: 'warga'|'pengurus'|'admin' = 'warga') => {
        setError(null);
        setIsLoading(true);
        let result;
        if (role === 'admin') result = await signInAdmin(email, password);
        else if (role === 'pengurus') result = await signInPengurus(email, password);
        else result = await signInWarga(email, password);
        
        if (result.success && result.user) setUser(result.user);
        else if (result.error) setError(result.error);
        setIsLoading(false);
        return result;
    }, []);

    const handleSignOut = useCallback(async () => {
        await authSignOut();
        setUser(null);
        setIsLoading(false);
    }, []);

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn: handleSignIn,
        signUp: async () => ({ success: false, error: 'Provider required for signUp' }),
        signOut: handleSignOut,
        resetPassword: async () => ({ success: false, error: 'Provider required' }),
        clearError: () => setError(null),
        hasRole: (role: string) => {
            if (!user) return false;
            const h: Record<string, number> = { admin: 3, pengurus: 2, staff: 2, warga: 1 };
            return (h[user.role] || 0) >= (h[role] || 0);
        },
        hasPermission: (perm: string) => user?.permissions.includes(perm) ?? false,
    };
}

// ============================================
// Route Protection Component
// ============================================

interface RequireAuthProps {
    children: ReactNode;
    requiredRole?: string;
    requiredPermission?: string;
    fallback?: ReactNode;
    redirectTo?: string;
}

/**
 * Protect routes that require authentication.
 * 
 * Usage:
 *   <RequireAuth requiredRole="admin">
 *     <AdminDashboard />
 *   </RequireAuth>
 */
export function RequireAuth({
    children,
    requiredRole,
    requiredPermission,
    fallback,
}: RequireAuthProps) {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
    const redirectRef = useRef(false);

    // Redirect to login if not authenticated (after loading)
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !redirectRef.current) {
            redirectRef.current = true;
            window.location.assign('/auth/login');
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
                    <p className="text-muted-foreground">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                </div>
            </div>
        );
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
                    <p className="text-muted-foreground">
                        Anda tidak memiliki izin &quot;{requiredPermission}&quot;.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
