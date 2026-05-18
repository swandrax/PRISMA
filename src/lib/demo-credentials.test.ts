import { describe, it, expect } from 'vitest'
import {
    authenticateDemo,
    getDemoUserByEmail,
    hasPermission,
    DEMO_USERS,
    BETA_CONFIG
} from './demo-credentials'

describe('Demo Credentials System', () => {
    describe('DEMO_USERS (public export)', () => {
        it('should be an empty array (credentials never exposed in UI)', () => {
            expect(DEMO_USERS).toEqual([])
            expect(DEMO_USERS.length).toBe(0)
        })
    })

    describe('authenticateDemo', () => {
        it('should authenticate valid admin credentials', () => {
            const user = authenticateDemo('rerry@prisma.dev', 'Pr1sm4RT04!')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('admin')
            expect(user?.nama).toBe('R Erry Adu Sundaru')
        })

        it('should authenticate valid warga credentials', () => {
            const user = authenticateDemo('warga@prisma.dev', 'W4rg4RT04!')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('warga')
        })

        it('should authenticate pengurus (sekretaris) credentials', () => {
            const user = authenticateDemo('sekretaris@prisma.dev', 'S3kr3t4r1s!')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('pengurus')
        })

        it('should authenticate pengurus (bendahara) credentials', () => {
            const user = authenticateDemo('bendahara@prisma.dev', 'B3nd4h4r4!')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('pengurus')
        })

        it('should authenticate guest/tamu credentials', () => {
            const user = authenticateDemo('tamu@prisma.dev', 'T4muRT04!')
            expect(user).not.toBeNull()
            expect(user?.role).toBe('warga')
        })

        it('should be case-insensitive for email', () => {
            const user1 = authenticateDemo('RERRY@PRISMA.DEV', 'Pr1sm4RT04!')
            const user2 = authenticateDemo('Rerry@Prisma.Dev', 'Pr1sm4RT04!')
            expect(user1).not.toBeNull()
            expect(user2).not.toBeNull()
        })

        it('should return null for invalid password', () => {
            const user = authenticateDemo('rerry@prisma.dev', 'wrongpassword')
            expect(user).toBeNull()
        })

        it('should return null for non-existent email', () => {
            const user = authenticateDemo('nonexistent@prisma.dev', 'password')
            expect(user).toBeNull()
        })

        it('should return null for empty inputs', () => {
            expect(authenticateDemo('', '')).toBeNull()
            expect(authenticateDemo('rerry@prisma.dev', '')).toBeNull()
        })

        it('should be case-SENSITIVE for password', () => {
            const user = authenticateDemo('rerry@prisma.dev', 'pr1sm4rt04!')
            expect(user).toBeNull()
        })
    })

    describe('getDemoUserByEmail', () => {
        it('should find admin user by email', () => {
            const user = getDemoUserByEmail('rerry@prisma.dev')
            expect(user).not.toBeNull()
            expect(user?.nama).toBe('R Erry Adu Sundaru')
            expect(user?.role).toBe('admin')
        })

        it('should find bendahara by email', () => {
            const user = getDemoUserByEmail('bendahara@prisma.dev')
            expect(user).not.toBeNull()
            expect(user?.nama).toBe('Bendahara RT 04')
        })

        it('should return null for non-existent email', () => {
            const user = getDemoUserByEmail('unknown@prisma.dev')
            expect(user).toBeNull()
        })

        it('should handle email with whitespace', () => {
            const user = getDemoUserByEmail('  rerry@prisma.dev  ')
            expect(user).not.toBeNull()
        })
    })

    describe('hasPermission', () => {
        it('should return true for admin with all documented permissions', () => {
            const admin = getDemoUserByEmail('rerry@prisma.dev')!
            expect(hasPermission(admin, 'manage_finance')).toBe(true)
            expect(hasPermission(admin, 'manage_users')).toBe(true)
            expect(hasPermission(admin, 'manage_surat')).toBe(true)
            expect(hasPermission(admin, 'audit_logs')).toBe(true)
        })

        it('should return false for admin with unlisted permission', () => {
            const admin = getDemoUserByEmail('rerry@prisma.dev')!
            expect(hasPermission(admin, 'nonexistent_permission')).toBe(false)
        })

        it('should return true for bendahara with finance permission', () => {
            const bendahara = getDemoUserByEmail('bendahara@prisma.dev')!
            expect(hasPermission(bendahara, 'manage_finance')).toBe(true)
            expect(hasPermission(bendahara, 'view_reports')).toBe(true)
        })

        it('should return false for warga with admin permissions', () => {
            const warga = getDemoUserByEmail('warga@prisma.dev')!
            expect(hasPermission(warga, 'manage_finance')).toBe(false)
            expect(hasPermission(warga, 'manage_users')).toBe(false)
        })

        it('should return true for warga with own permissions', () => {
            const warga = getDemoUserByEmail('warga@prisma.dev')!
            expect(hasPermission(warga, 'view_reports')).toBe(true)
            expect(hasPermission(warga, 'create_surat')).toBe(true)
            expect(hasPermission(warga, 'report_security')).toBe(true)
        })

        it('should return true for guest with view_reports only', () => {
            const guest = getDemoUserByEmail('tamu@prisma.dev')!
            expect(hasPermission(guest, 'view_reports')).toBe(true)
            expect(hasPermission(guest, 'manage_finance')).toBe(false)
            expect(hasPermission(guest, 'create_surat')).toBe(false)
        })
    })

    describe('BETA_CONFIG', () => {
        it('should have version string', () => {
            expect(BETA_CONFIG.version).toBeDefined()
            expect(typeof BETA_CONFIG.version).toBe('string')
        })

        it('should have prisma.dev domain', () => {
            expect(BETA_CONFIG.domain).toBe('prisma.dev')
        })

        it('should have demoLogin disabled (no UI)', () => {
            expect(BETA_CONFIG.features.demoLogin).toBe(false)
        })

        it('should have required features enabled', () => {
            expect(BETA_CONFIG.features.customFinanceInput).toBe(true)
            expect(BETA_CONFIG.features.realtimeAnalysis).toBe(true)
            expect(BETA_CONFIG.features.budgetMonitoring).toBe(true)
        })
    })
})
