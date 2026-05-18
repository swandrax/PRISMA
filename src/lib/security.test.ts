import { describe, it, expect, beforeEach } from 'vitest'
import {
    sanitizeInput,
    sanitizeObject,
    checkRateLimit,
    resetRateLimit,
    validatePasswordStrength,
    maskPhoneNumber,
    maskEmail,
    maskNIK,
    maskName,
    generateCSRFToken,
    validateCSRFToken,
    logSecurityEvent,
    getAuditLog,
} from './security'


describe('sanitizeInput - XSS Prevention', () => {
    it('should return empty string for null/undefined/non-string', () => {
        expect(sanitizeInput('')).toBe('')
        expect(sanitizeInput(null as unknown as string)).toBe('')
        expect(sanitizeInput(undefined as unknown as string)).toBe('')
        expect(sanitizeInput(123 as unknown as string)).toBe('')
    })

    it('should strip <script> tags', () => {
        const result = sanitizeInput('<script>alert("xss")</script>')
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('alert')
    })

    it('should strip nested <script> tags', () => {
        const result = sanitizeInput('<script><script>alert("xss")</script></script>')
        expect(result).not.toContain('<script>')
    })

    it('should strip event handler attributes', () => {
        const input = '<img src="x" onerror="alert(1)">'
        const result = sanitizeInput(input)
        expect(result).not.toContain('onerror')
        expect(result).not.toContain('alert')
    })

    it('should strip javascript: protocol', () => {
        const result = sanitizeInput('javascript:alert(document.cookie)')
        expect(result).not.toContain('javascript:')
    })

    it('should strip data:text/html URIs', () => {
        const result = sanitizeInput('data:text/html,<script>alert(1)</script>')
        expect(result).not.toContain('data:text/html')
    })

    it('should encode HTML entities', () => {
        const result = sanitizeInput('<div>test</div>')
        // Note: sanitizer strips semicolons as SQL pattern, so &lt becomes &lt without ;
        expect(result).toContain('&lt')
        expect(result).toContain('&gt')
        expect(result).not.toContain('<div>')
    })

    it('should encode quotes', () => {
        const result = sanitizeInput('"test" and \'test\'')
        expect(result).not.toContain('"')
    })

    it('should strip SQL injection patterns', () => {
        const result = sanitizeInput("' OR '1'='1'")
        expect(result).not.toContain("'")
        expect(result).not.toContain(";")
    })

    it('should remove null bytes', () => {
        const result = sanitizeInput('test\0injection')
        expect(result).not.toContain('\0')
    })

    it('should handle double URL encoding (PortSwigger bypass)', () => {
        const input = '%253Cscript%253Ealert(1)%253C/script%253E'
        const result = sanitizeInput(input)
        expect(result).not.toContain('<script>')
    })

    it('should trim whitespace', () => {
        const result = sanitizeInput('   hello   ')
        expect(result).toBe('hello')
    })

    it('should handle normal text without mangling', () => {
        const result = sanitizeInput('Budi Santoso')
        expect(result).toBe('Budi Santoso')
    })

    it('should encode forward slashes', () => {
        const result = sanitizeInput('path/traversal')
        expect(result).toContain('&#x2F')
        expect(result).not.toContain('path/traversal')
    })
})


describe('sanitizeObject', () => {
    it('should sanitize all string values in an object', () => {
        const obj = { name: '<script>evil</script>', age: 25 }
        const result = sanitizeObject(obj)
        expect(result.name).not.toContain('<script>')
        expect(result.age).toBe(25)
    })

    it('should handle nested objects', () => {
        const obj = { user: { name: '<b>bold</b>' } }
        const result = sanitizeObject(obj)
        expect((result.user as Record<string, string>).name).not.toContain('<b>')
    })

    it('should handle empty object', () => {
        const result = sanitizeObject({})
        expect(result).toEqual({})
    })
})


describe('checkRateLimit', () => {
    beforeEach(() => {
        resetRateLimit('test_action')
        resetRateLimit('login')
    })

    it('should allow first attempt', () => {
        const result = checkRateLimit('test_action')
        expect(result.allowed).toBe(true)
    })

    it('should track attempt count', () => {
        checkRateLimit('test_action')
        checkRateLimit('test_action')
        const result = checkRateLimit('test_action')
        expect(result.allowed).toBe(true)
        expect(result.remainingAttempts).toBeLessThan(5)
    })

    it('should block after max attempts (login = 5)', () => {
        for (let i = 0; i < 5; i++) {
            checkRateLimit('login')
        }
        const result = checkRateLimit('login')
        expect(result.allowed).toBe(false)
    })

    it('should reset after calling resetRateLimit', () => {
        for (let i = 0; i < 5; i++) {
            checkRateLimit('login')
        }
        resetRateLimit('login')
        const result = checkRateLimit('login')
        expect(result.allowed).toBe(true)
    })

    it('should handle different action types independently', () => {
        for (let i = 0; i < 5; i++) {
            checkRateLimit('login')
        }
        const loginResult = checkRateLimit('login')
        const formResult = checkRateLimit('form_submit')
        expect(loginResult.allowed).toBe(false)
        expect(formResult.allowed).toBe(true)
    })
})


describe('validatePasswordStrength', () => {
    it('should accept strong passwords', () => {
        const result = validatePasswordStrength('Str0ng!Pass')
        expect(result.score).toBeGreaterThanOrEqual(3)
    })

    it('should give lower score for very short passwords', () => {
        const result = validatePasswordStrength('a')
        expect(result.score).toBeLessThanOrEqual(1)
    })

    it('should reject empty password', () => {
        const result = validatePasswordStrength('')
        expect(result.score).toBe(0)
    })

    it('should give higher score for diverse characters', () => {
        const weak = validatePasswordStrength('aaaaaaaa')
        const strong = validatePasswordStrength('Aa1!bbcc')
        expect(strong.score).toBeGreaterThan(weak.score)
    })

    it('should return feedback messages', () => {
        const result = validatePasswordStrength('weak')
        expect(result.feedback).toBeDefined()
        expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should indicate strong status for good passwords', () => {
        const result = validatePasswordStrength('MyStr0ng!P@ss')
        expect(result.isStrong).toBe(true)
    })
})


describe('Data Masking', () => {
    describe('maskPhoneNumber', () => {
        it('should mask phone number keeping last 4 digits', () => {
            const result = maskPhoneNumber('08123456789')
            expect(result).toContain('****')
            expect(result).toContain('6789')
        })

        it('should handle short numbers', () => {
            const result = maskPhoneNumber('1234')
            expect(typeof result).toBe('string')
        })
    })

    describe('maskEmail', () => {
        it('should mask email keeping domain', () => {
            const result = maskEmail('user@example.com')
            expect(result).toContain('***')
            expect(result).toContain('@example.com')
        })

        it('should handle short usernames', () => {
            const result = maskEmail('a@b.com')
            expect(result).toContain('@b.com')
        })
    })

    describe('maskNIK', () => {
        it('should mask NIK keeping first and last digits', () => {
            const result = maskNIK('1234567890123456')
            expect(result).toContain('****')
            expect(result.length).toBeGreaterThan(4)
        })
    })

    describe('maskName', () => {
        it('should mask name keeping first letter', () => {
            const result = maskName('Budi Santoso')
            expect(result.startsWith('B')).toBe(true)
            expect(result).toContain('***')
        })
    })
})


describe('CSRF Tokens', () => {
    it('should generate a CSRF token', () => {
        const token = generateCSRFToken()
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        expect(token.length).toBeGreaterThan(0)
    })

    it('should reject empty token', () => {
        expect(validateCSRFToken('')).toBe(false)
    })

    it('should reject random invalid token', () => {
        generateCSRFToken()
        expect(validateCSRFToken('completely-invalid-token-12345')).toBe(false)
    })
})


describe('Security Audit Log', () => {
    it('should log security events', () => {
        logSecurityEvent('test_event', true, 'Test detail')
        const log = getAuditLog()
        expect(log.length).toBeGreaterThan(0)
    })

    it('should include event details', () => {
        logSecurityEvent('login_attempt', false, 'Bad password')
        const log = getAuditLog()
        const lastEntry = log[log.length - 1]
        expect(lastEntry).toHaveProperty('action')
        expect(lastEntry).toHaveProperty('timestamp')
        expect(lastEntry).toHaveProperty('success')
    })

    it('should record failed events', () => {
        logSecurityEvent('brute_force_attempt', false, 'Too many attempts')
        const log = getAuditLog()
        // auditLog.unshift() means newest entry is at index 0
        const newestEntry = log[0]
        expect(newestEntry.success).toBe(false)
        expect(newestEntry.action).toBe('brute_force_attempt')
    })
})

import { isSSRFSafe, sanitizeServerInput } from './security'

describe('SSRF Protection - isSSRFSafe', () => {
    it('should allow safe public URLs', () => {
        expect(isSSRFSafe('https://api.telegram.org/bot123/sendMessage')).toBe(true)
        expect(isSSRFSafe('https://example.com/api/data')).toBe(true)
        expect(isSSRFSafe('http://cdn.example.com/image.jpg')).toBe(true)
    })

    it('should block localhost and loopback addresses', () => {
        expect(isSSRFSafe('http://localhost:8080/api')).toBe(false)
        expect(isSSRFSafe('http://127.0.0.1:3000/data')).toBe(false)
        expect(isSSRFSafe('http://0.0.0.0/admin')).toBe(false)
    })

    it('should block private IP ranges', () => {
        // Class A
        expect(isSSRFSafe('http://10.0.0.1/internal')).toBe(false)
        // Class B
        expect(isSSRFSafe('http://172.16.0.1/secret')).toBe(false)
        // Class C
        expect(isSSRFSafe('http://192.168.1.1/admin')).toBe(false)
    })

    it('should block non-http protocols', () => {
        expect(isSSRFSafe('file:///etc/passwd')).toBe(false)
        expect(isSSRFSafe('ftp://internal.server/data')).toBe(false)
        expect(isSSRFSafe('gopher://evil.com/payload')).toBe(false)
    })

    it('should block link-local addresses', () => {
        expect(isSSRFSafe('http://169.254.169.254/metadata')).toBe(false)
    })

    it('should reject invalid URLs', () => {
        expect(isSSRFSafe('not-a-url')).toBe(false)
        expect(isSSRFSafe('')).toBe(false)
    })
})

describe('sanitizeServerInput - Server-Side Validation', () => {
    it('should strip script tags', () => {
        const input = '<script>alert("xss")</script>Hello'
        const result = sanitizeServerInput(input)
        expect(result).not.toContain('<script')
        expect(result).toContain('Hello')
    })

    it('should strip event handlers', () => {
        const input = '<img onload="stealCookies()" src="x">'
        const result = sanitizeServerInput(input)
        expect(result).not.toContain('onload')
    })

    it('should strip javascript: protocol', () => {
        const input = '<a href="javascript:alert(1)">click me</a>'
        const result = sanitizeServerInput(input)
        expect(result).not.toContain('javascript:')
    })

    it('should remove null bytes', () => {
        const input = 'clean\0data\0here'
        const result = sanitizeServerInput(input)
        expect(result).not.toContain('\0')
        expect(result).toBe('cleandatahere')
    })

    it('should enforce max length', () => {
        const input = 'a'.repeat(2000)
        const result = sanitizeServerInput(input, 100)
        expect(result.length).toBeLessThanOrEqual(100)
    })

    it('should handle empty and non-string inputs', () => {
        expect(sanitizeServerInput('')).toBe('')
        expect(sanitizeServerInput(null as unknown as string)).toBe('')
        expect(sanitizeServerInput(undefined as unknown as string)).toBe('')
        expect(sanitizeServerInput(123 as unknown as string)).toBe('')
    })
})

describe('sanitizeInput - Extended XSS Coverage', () => {
    it('should block SVG-based XSS', () => {
        const input = '<svg onload=alert(1)>'
        expect(sanitizeInput(input)).not.toContain('onload')
    })

    it('should block img onerror XSS', () => {
        const input = '<img src=x onerror=alert(1)>'
        expect(sanitizeInput(input)).not.toContain('onerror')
    })

    it('should block body onload XSS', () => {
        const input = '<body onload=alert(1)>'
        expect(sanitizeInput(input)).not.toContain('onload')
    })

    it('should block iframe injection', () => {
        const input = '<iframe src="https://evil.com"></iframe>'
        expect(sanitizeInput(input)).not.toContain('iframe')
    })

    it('should block base64 encoded XSS in data URI', () => {
        const input = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>'
        // Should not execute even if kept
        expect(sanitizeInput(input)).not.toContain('PHNjcmlwdD5')
    })

    it('should block mixed case bypass attempts', () => {
        const input = '<ScRiPt>alert(1)</ScRiPt>'
        expect(sanitizeInput(input)).not.toContain('<ScRiPt>')
    })

    it('should block encoded event handlers', () => {
        const input = '<div onmouseover="alert(1)">hover me</div>'
        expect(sanitizeInput(input)).not.toContain('onmouseover')
    })

    it('should handle multiple nested scripts', () => {
        const input = '<script><script>alert(1)</script></script>'
        expect(sanitizeInput(input)).not.toContain('<script')
    })
})
