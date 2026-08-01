import { describe, it, expect } from 'vitest'
import {
    calculatePaymentStatus,
    getIuranComplianceRate,
    generateQRPaymentData,
    validatePaymentProof,
    calculateEventBudgetVariance,
    generateAuditSchedule,
    calculateAuditScore,
    calculateVotingResult,
    generateWhatsAppMessage,
    getWhatsAppShareUrl,
    formatRupiah,
    PaymentMethod,
    EventBudget,
    AuditRecord,
    InfrastructureProposal,
    PublicReport
} from './strategic-recommendations'

describe('Strategic Recommendations Utilities', () => {
    describe('calculatePaymentStatus', () => {
        it('should return on_time if day is before or equal to due date', () => {
            const date = new Date('2026-07-05') // Day 5
            expect(calculatePaymentStatus(10, date, 5)).toBe('on_time')
        })

        it('should return grace_period if day is within grace period', () => {
            const date = new Date('2026-07-12') // Day 12
            expect(calculatePaymentStatus(10, date, 5)).toBe('grace_period')
        })

        it('should return overdue if day is past grace period', () => {
            const date = new Date('2026-07-16') // Day 16
            expect(calculatePaymentStatus(10, date, 5)).toBe('overdue')
        })
    })

    describe('getIuranComplianceRate', () => {
        it('should calculate compliance rate correctly', () => {
            expect(getIuranComplianceRate(80, 100)).toBe(80)
            expect(getIuranComplianceRate(15, 30)).toBe(50)
        })

        it('should return 0 when total households is 0 to avoid division by zero', () => {
            expect(getIuranComplianceRate(5, 0)).toBe(0)
        })
    })

    describe('generateQRPaymentData', () => {
        it('should generate JSON data for bank transfer', () => {
            const method: PaymentMethod = {
                id: 'bca',
                name: 'Transfer BCA',
                type: 'bank_transfer',
                accountNumber: '1234567890',
                accountName: 'RT 04',
                isActive: true
            }
            const result = generateQRPaymentData(method, 10000, 'Budi', 'Juli')
            const parsed = JSON.parse(result)
            expect(parsed.bank).toBe('Transfer BCA')
            expect(parsed.account).toBe('1234567890')
            expect(parsed.amount).toBe(10000)
            expect(parsed.reference).toBe('IURAN-Juli-Budi')
        })

        it('should generate QRIS url with query params', () => {
            const method: PaymentMethod = {
                id: 'qris',
                name: 'QRIS',
                type: 'qris',
                qrCodeUrl: 'https://example.com/qr.png',
                isActive: true
            }
            const result = generateQRPaymentData(method, 10000, 'Budi', 'Juli')
            expect(result).toContain('https://example.com/qr.png?amount=10000&ref=IURAN-Juli')
        })

        it('should return transaction ID for unsupported cash payments', () => {
            const method: PaymentMethod = {
                id: 'cash',
                name: 'Tunai',
                type: 'cash',
                isActive: true
            }
            const result = generateQRPaymentData(method, 10000, 'Budi', 'Juli')
            expect(result).toMatch(/^TRX-\d+$/)
        })
    })

    describe('validatePaymentProof', () => {
        it('should allow valid image formats within size limit', () => {
            const file = new File([''], 'proof.png', { type: 'image/png' })
            Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB
            expect(validatePaymentProof(file)).toEqual({ valid: true, message: 'File valid' })
        })

        it('should reject invalid file types', () => {
            const file = new File([''], 'proof.pdf', { type: 'application/pdf' })
            expect(validatePaymentProof(file).valid).toBe(false)
        })

        it('should reject files exceeding 5MB', () => {
            const file = new File([''], 'proof.jpg', { type: 'image/jpeg' })
            Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }) // 6MB
            expect(validatePaymentProof(file).valid).toBe(false)
        })
    })

    describe('calculateEventBudgetVariance', () => {
        it('should return on_budget status when variance is small', () => {
            const budget: EventBudget = {
                id: '1',
                eventName: 'Test',
                eventDate: '2026-07-06',
                allocatedBudget: 1000,
                actualExpense: 1050,
                status: 'completed'
            }
            const result = calculateEventBudgetVariance(budget)
            expect(result.status).toBe('on_budget')
            expect(result.percentage).toBe(5)
        })

        it('should return over status when expense exceeds budget by > 10%', () => {
            const budget: EventBudget = {
                id: '2',
                eventName: 'Test Over',
                eventDate: '2026-07-06',
                allocatedBudget: 1000,
                actualExpense: 1150,
                status: 'completed'
            }
            const result = calculateEventBudgetVariance(budget)
            expect(result.status).toBe('over')
            expect(result.percentage).toBe(15)
        })

        it('should return under status when expense is below budget by > 10%', () => {
            const budget: EventBudget = {
                id: '3',
                eventName: 'Test Under',
                eventDate: '2026-07-06',
                allocatedBudget: 1000,
                actualExpense: 850,
                status: 'completed'
            }
            const result = calculateEventBudgetVariance(budget)
            expect(result.status).toBe('under')
            expect(result.percentage).toBe(-15)
        })
    })

    describe('generateAuditSchedule', () => {
        it('should return 4 quarter entries for the specified year', () => {
            const schedule = generateAuditSchedule(2026)
            expect(schedule.length).toBe(4)
            expect(schedule[0].quarter).toBe('Q1-2026')
            expect(schedule[3].quarter).toBe('Q4-2026')
        })
    })

    describe('calculateAuditScore', () => {
        it('should return 100 when there are no findings', () => {
            const record: AuditRecord = {
                id: '1',
                quarter: 'Q1-2026',
                year: 2026,
                auditDate: '2026-03-31',
                auditors: ['A', 'B'],
                findings: [],
                status: 'completed'
            }
            expect(calculateAuditScore(record)).toBe(100)
        })

        it('should subtract penalty for unresolved findings', () => {
            const record: AuditRecord = {
                id: '2',
                quarter: 'Q1-2026',
                year: 2026,
                auditDate: '2026-03-31',
                auditors: ['A'],
                findings: [
                    { category: 'A', description: 'Low', severity: 'low', recommendation: 'R', resolved: false },
                    { category: 'B', description: 'Medium', severity: 'medium', recommendation: 'R', resolved: false },
                    { category: 'C', description: 'High', severity: 'high', recommendation: 'R', resolved: true } // resolved has no penalty
                ],
                status: 'completed'
            }
            // Low penalty: 5, Medium penalty: 15. Total penalty = 20. Score = 80.
            expect(calculateAuditScore(record)).toBe(80)
        })

        it('should clamp score to minimum of 0', () => {
            const record: AuditRecord = {
                id: '3',
                quarter: 'Q1-2026',
                year: 2026,
                auditDate: '2026-03-31',
                auditors: ['A'],
                findings: [
                    { category: 'A', description: 'H1', severity: 'high', recommendation: 'R', resolved: false },
                    { category: 'B', description: 'H2', severity: 'high', recommendation: 'R', resolved: false },
                    { category: 'C', description: 'H3', severity: 'high', recommendation: 'R', resolved: false },
                    { category: 'D', description: 'H4', severity: 'high', recommendation: 'R', resolved: false },
                    { category: 'E', description: 'H5', severity: 'high', recommendation: 'R', resolved: false }
                ],
                status: 'completed'
            }
            // 5 * 25 = 125 penalty. Score should clamp to 0.
            expect(calculateAuditScore(record)).toBe(0)
        })
    })

    describe('calculateVotingResult', () => {
        it('should return pending with 0% approval when there are no votes', () => {
            const proposal: InfrastructureProposal = {
                id: '1',
                title: 'Test',
                description: 'D',
                category: 'security',
                estimatedCost: 1000,
                priority: 'medium',
                proposedBy: 'Warga',
                proposedDate: '2026-07-06',
                votesFor: 0,
                votesAgainst: 0,
                status: 'proposed'
            }
            expect(calculateVotingResult(proposal)).toEqual({ result: 'pending', approvalPercentage: 0 })
        })

        it('should return approved when approval percentage >= 60%', () => {
            const proposal: InfrastructureProposal = {
                id: '1',
                title: 'Test',
                description: 'D',
                category: 'security',
                estimatedCost: 1000,
                priority: 'medium',
                proposedBy: 'Warga',
                proposedDate: '2026-07-06',
                votesFor: 6,
                votesAgainst: 4, // 60%
                status: 'voting'
            }
            expect(calculateVotingResult(proposal).result).toBe('approved')
        })

        it('should return rejected when approval percentage < 40%', () => {
            const proposal: InfrastructureProposal = {
                id: '1',
                title: 'Test',
                description: 'D',
                category: 'security',
                estimatedCost: 1000,
                priority: 'medium',
                proposedBy: 'Warga',
                proposedDate: '2026-07-06',
                votesFor: 3,
                votesAgainst: 7, // 30%
                status: 'voting'
            }
            expect(calculateVotingResult(proposal).result).toBe('rejected')
        })

        it('should return pending when approval percentage is between 40% and 60%', () => {
            const proposal: InfrastructureProposal = {
                id: '1',
                title: 'Test',
                description: 'D',
                category: 'security',
                estimatedCost: 1000,
                priority: 'medium',
                proposedBy: 'Warga',
                proposedDate: '2026-07-06',
                votesFor: 5,
                votesAgainst: 5, // 50%
                status: 'voting'
            }
            expect(calculateVotingResult(proposal).result).toBe('pending')
        })
    })

    describe('generateWhatsAppMessage & getWhatsAppShareUrl', () => {
        it('should format WhatsApp message and URL correctly', () => {
            const report: PublicReport = {
                id: '1',
                month: 'Juli',
                year: 2026,
                summary: 'Laporan bulanan aman',
                totalIncome: 1000000,
                totalExpense: 800000,
                balance: 200000,
                publishedAt: '2026-07-06T12:00:00Z',
                whatsappSent: false,
                views: 5
            }
            const msg = generateWhatsAppMessage(report)
            expect(msg).toContain('LAPORAN KEUANGAN RT 04 RW 09 KEMAYORAN')
            expect(msg).toContain('Juli 2026')
            expect(msg).toContain('1.000.000')

            const url = getWhatsAppShareUrl(msg)
            expect(url).toContain('https://wa.me/?text=')
        })
    })

    describe('formatRupiah', () => {
        it('should format numbers into Rupiah currency style', () => {
            const formatted = formatRupiah(1500000)
            expect(formatted).toContain('Rp')
            expect(formatted).toContain('1.500.000')
        })
    })
})
