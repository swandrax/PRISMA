"use client"

import { useState, useCallback, useEffect } from 'react'
import {
    secureStorage,
    sanitizeInput,
    sanitizeObject,
    checkRateLimit,
    resetRateLimit,
    maskPhoneNumber,
    maskEmail,
    maskNIK,
    maskName,
    storeCredentials,
    getCredentials,
    clearCredentials,
    validatePasswordStrength,
    logSecurityEvent,
    secureFetch,
    type SecureCredentials,
    type PasswordStrength
} from './security'

// ============================================
// SECURE AUTH HOOK
// ============================================

interface SecureAuthState {
    isAuthenticated: boolean
    user: SecureCredentials | null
    isLoading: boolean
    error: string | null
}

export function useSecureAuth() {
    const [state, setState] = useState<SecureAuthState>({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        error: null
    })

    // Check existing session on mount
    useEffect(() => {
        const checkSession = () => {
            const credentials = getCredentials()
            if (credentials && credentials.expiresAt > Date.now()) {
                setState({
                    isAuthenticated: true,
                    user: credentials,
                    isLoading: false,
                    error: null
                })
                logSecurityEvent('session_restore', true)
            } else {
                setState(prev => ({ ...prev, isLoading: false }))
                if (credentials) {
                    clearCredentials() // Expired session
                }
            }
        }
        setTimeout(checkSession, 0)
    }, [])

    const login = useCallback(async (
        identifier: string,
        password: string,
        role: 'admin' | 'staff' | 'warga'
    ): Promise<boolean> => {
        // Rate limit check
        const rateCheck = checkRateLimit('login', 5, 60000, 300000)
        if (!rateCheck.allowed) {
            setState(prev => ({
                ...prev,
                error: `Terlalu banyak percobaan. Coba lagi pada ${rateCheck.blockedUntil?.toLocaleTimeString()}`
            }))
            logSecurityEvent('login_rate_limited', false, identifier)
            return false
        }

        // Sanitize inputs
        const sanitizedId = sanitizeInput(identifier)
        const sanitizedPass = sanitizeInput(password)

        // Validate password strength for new accounts
        const _pwdStrength = validatePasswordStrength(sanitizedPass)

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            // Simulated authentication - replace with actual API call
            // In production, this would be: await secureFetch('/api/auth/login', {...})

            // SEC-007 FIX: Use CSPRNG for session token
            const tokenBytes = new Uint8Array(32)
            crypto.getRandomValues(tokenBytes)
            const sessionToken = Array.from(tokenBytes, b => b.toString(16).padStart(2, '0')).join('')

            const credentials: SecureCredentials = {
                userId: sanitizedId,
                role,
                sessionToken,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }

            storeCredentials(credentials)

            setState({
                isAuthenticated: true,
                user: credentials,
                isLoading: false,
                error: null
            })

            resetRateLimit('login')
            logSecurityEvent('login_success', true, `Role: ${role}`)

            return true
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Login gagal'
            setState(prev => ({ ...prev, isLoading: false, error: msg }))
            logSecurityEvent('login_failed', false, identifier)
            return false
        }
    }, [])

    const logout = useCallback(() => {
        clearCredentials()
        setState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
        })
        logSecurityEvent('logout', true)

        // Clear any sensitive data from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('warga_logged_in')
            localStorage.removeItem('warga_profile')
            localStorage.removeItem('warga_photo')
        }
    }, [])

    return {
        ...state,
        login,
        logout,
        checkPasswordStrength: validatePasswordStrength
    }
}

// ============================================
// SECURE DATA MASKING HOOK
// ============================================

interface MaskedData {
    phone: string
    email: string
    nik: string
    name: string
}

export function useDataMasking() {
    const [showSensitive, setShowSensitive] = useState(false)

    const maskData = useCallback((data: {
        phone?: string
        email?: string
        nik?: string
        name?: string
    }): MaskedData => {
        if (showSensitive) {
            return {
                phone: data.phone || '',
                email: data.email || '',
                nik: data.nik || '',
                name: data.name || ''
            }
        }

        return {
            phone: maskPhoneNumber(data.phone || ''),
            email: maskEmail(data.email || ''),
            nik: maskNIK(data.nik || ''),
            name: maskName(data.name || '')
        }
    }, [showSensitive])

    const toggleVisibility = useCallback(() => {
        setShowSensitive(prev => {
            logSecurityEvent('toggle_sensitive_data', true, `visible: ${!prev}`)
            return !prev
        })
    }, [])

    return {
        maskData,
        showSensitive,
        toggleVisibility
    }
}

// ============================================
// SECURE FORM HOOK
// ============================================

interface SecureFormOptions {
    sanitize?: boolean
    validateOnChange?: boolean
    rateLimitSubmit?: boolean
}

export function useSecureForm<T extends Record<string, string>>(
    initialValues: T,
    options: SecureFormOptions = {}
) {
    const { sanitize = true, rateLimitSubmit = true } = options
    const [values, setValues] = useState<T>(initialValues)
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = useCallback((field: keyof T, value: string) => {
        const processedValue = sanitize ? sanitizeInput(value) : value
        setValues(prev => ({ ...prev, [field]: processedValue }))

        // Clear error on change
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }, [sanitize, errors])

    const handleSubmit = useCallback(async (
        onSubmit: (values: T) => Promise<void>
    ) => {
        if (rateLimitSubmit) {
            const rateCheck = checkRateLimit('form_submit', 10, 60000)
            if (!rateCheck.allowed) {
                setErrors({ submit: 'Terlalu banyak percobaan' } as Partial<Record<keyof T, string>>)
                return
            }
        }

        setIsSubmitting(true)
        try {
            const sanitizedValues = sanitize ? sanitizeObject(values) : values
            await onSubmit(sanitizedValues as T)
            logSecurityEvent('form_submit', true)
        } catch (error) {
            logSecurityEvent('form_submit', false)
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }, [values, sanitize, rateLimitSubmit])

    const reset = useCallback(() => {
        setValues(initialValues)
        setErrors({})
    }, [initialValues])

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        reset,
        setErrors
    }
}

// ============================================
// SECURE API HOOK
// ============================================

interface SecureApiState<T> {
    data: T | null
    isLoading: boolean
    error: string | null
}

export function useSecureApi<T>() {
    const [state, setState] = useState<SecureApiState<T>>({
        data: null,
        isLoading: false,
        error: null
    })

    const execute = useCallback(async (
        url: string,
        options: RequestInit = {}
    ): Promise<T | null> => {
        setState({ data: null, isLoading: true, error: null })

        try {
            const response = await secureFetch(url, options)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json() as T
            setState({ data, isLoading: false, error: null })
            logSecurityEvent('api_request', true, url)
            return data
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Request failed'
            setState({ data: null, isLoading: false, error: msg })
            logSecurityEvent('api_request', false, `${url}: ${msg}`)
            return null
        }
    }, [])

    return { ...state, execute }
}

// ============================================
// PASSWORD STRENGTH HOOK
// ============================================

export function usePasswordStrength(password: string): PasswordStrength {
    if (!password) {
        return { score: 0, feedback: [], isStrong: false }
    }
    return validatePasswordStrength(password)
}

// ============================================
// SECURE STORAGE HOOK
// ============================================

export function useSecureStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(() => {
        const stored = secureStorage.get<T>(key)
        return stored !== null ? stored : defaultValue
    })

    const setSecureValue = useCallback((newValue: T) => {
        setValue(newValue)
        secureStorage.set(key, newValue, { encrypt: true })
    }, [key])

    const removeValue = useCallback(() => {
        setValue(defaultValue)
        secureStorage.remove(key)
    }, [key, defaultValue])

    return [value, setSecureValue, removeValue] as const
}
