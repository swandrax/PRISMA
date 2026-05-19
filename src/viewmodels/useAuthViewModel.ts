"use client"

// ViewModel: useAuthViewModel
// State management untuk Autentikasi dan Otorisasi
// MVVM Pattern — wraps existing security hooks

import { useState, useCallback, useEffect } from 'react';
import {
  type UserRole,
  type LoginRequest,
  type SecureCredentials,
  validateLoginRequest,
  isSessionExpired,
  hasPermission,
} from '@/models/entities/User';

export interface AuthViewState {
  isAuthenticated: boolean;
  credentials: SecureCredentials | null;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  isRateLimited: boolean;
}

const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAuthViewModel() {
  const [state, setState] = useState<AuthViewState>({
    isAuthenticated: false,
    credentials: null,
    isLoading: true,
    error: null,
    loginAttempts: 0,
    isRateLimited: false,
  });

  // Check existing session on mount
  const checkSession = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      if (typeof window === 'undefined') {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const stored = localStorage.getItem('prisma_credentials');
      if (stored) {
        const creds: SecureCredentials = JSON.parse(stored);
        if (!isSessionExpired(creds)) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            credentials: creds,
            isLoading: false,
          }));
          return;
        }
        // Expired — clean up
        localStorage.removeItem('prisma_credentials');
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        credentials: null,
        isLoading: false,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  // Login
  const handleLogin = useCallback(async (request: LoginRequest) => {
    // Validate input
    const validation = validateLoginRequest(request);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Check rate limit
    if (state.isRateLimited) {
      return { success: false, errors: ['Terlalu banyak percobaan. Coba lagi dalam 5 menit.'] };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Import credentials module dynamically (bcrypt-hashed, async)
      const { authenticateDemo } = await import('@/lib/demo-credentials');
      const user = await authenticateDemo(request.email, request.password);

      if (user) {
        const credentials: SecureCredentials = {
          userId: String(user.id || request.email),
          role: (user.role as UserRole) || 'warga',
          sessionToken: crypto.randomUUID?.() ?? `session-${Date.now()}`,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };

        localStorage.setItem('prisma_credentials', JSON.stringify(credentials));
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          credentials,
          isLoading: false,
          loginAttempts: 0,
        }));
        return { success: true, errors: [] };
      }

      // Failed login
      const newAttempts = state.loginAttempts + 1;
      const rateLimited = newAttempts >= MAX_LOGIN_ATTEMPTS;

      setState(prev => ({
        ...prev,
        isLoading: false,
        loginAttempts: newAttempts,
        isRateLimited: rateLimited,
        error: 'Email atau password salah',
      }));

      if (rateLimited) {
        setTimeout(() => {
          setState(prev => ({ ...prev, isRateLimited: false, loginAttempts: 0 }));
        }, RATE_LIMIT_DURATION);
      }

      return { success: false, errors: ['Email atau password salah'] };
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, errors: [`Login gagal: ${error}`] };
    }
  }, [state.loginAttempts, state.isRateLimited]);

  // Logout
  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prisma_credentials');
    }
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      credentials: null,
      error: null,
    }));
  }, []);

  // Check role permission
  const checkPermission = useCallback((requiredRole: UserRole): boolean => {
    if (!state.credentials) return false;
    return hasPermission(state.credentials.role, requiredRole);
  }, [state.credentials]);

  // Get current user role
  const getCurrentRole = useCallback((): UserRole | null => {
    return state.credentials?.role ?? null;
  }, [state.credentials]);

  // Auto-check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return {
    // State
    ...state,

    // Actions
    handleLogin,
    handleLogout,
    checkSession,
    checkPermission,
    getCurrentRole,
  };
}
