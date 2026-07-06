import { describe, it, expect } from 'vitest'
import { aiService } from './ai-service'

describe('AI Service Client (Siaga Chatbot Engine)', () => {
    describe('chat (Local/Mock Fallback Engine)', () => {
        it('should route to keuangan when query contains financial keywords', async () => {
            const result = await aiService.chat('Bagaimana cara bayar iuran bulanan?')
            expect(result.intent).toBe('keuangan')
            expect(result.action).toBeDefined()
            expect(result.action?.type).toBe('navigate')
            expect(result.action?.value).toBe('/keuangan/iuran')
            expect(result.response).toContain('iuran bulanan')
        })

        it('should route to laporan_insiden when query contains security/incident keywords', async () => {
            const result = await aiService.chat('Saya mau lapor lampu mati')
            expect(result.intent).toBe('laporan_insiden')
            expect(result.action).toBeDefined()
            expect(result.action?.type).toBe('navigate')
            expect(result.action?.value).toBe('/surat/keamanan')
            expect(result.response).toContain('Form Laporan Keamanan & Insiden')
        })

        it('should link to WhatsApp when query contains contact keywords', async () => {
            const result = await aiService.chat('Boleh minta nomor whatsapp pak RT?')
            expect(result.intent).toBe('hubungi_rt')
            expect(result.action).toBeDefined()
            expect(result.action?.type).toBe('link')
            expect(result.action?.value).toBe('https://wa.me/6287872004448')
        })

        it('should route to general administrasi when asking about letters', async () => {
            const result = await aiService.chat('Bagaimana cara buat surat pengantar?')
            expect(result.intent).toBe('administrasi')
            expect(result.action).toBeDefined()
            expect(result.action?.type).toBe('navigate')
            expect(result.action?.value).toBe('/surat')
        })

        it('should resolve specific letter types (e.g. domisili)', async () => {
            const result = await aiService.chat('Bagaimana cara mengurus surat domisili?')
            expect(result.intent).toBe('surat_domisili')
            expect(result.action).toBeDefined()
            expect(result.action?.type).toBe('navigate')
            expect(result.action?.value).toBe('/surat')
            expect(result.response).toContain('Domisili')
        })

        it('should fall back to general guidance when query is unrecognized', async () => {
            const result = await aiService.chat('Halo, selamat pagi')
            expect(result.intent).toBe('general')
            expect(result.action).toBeUndefined()
        })
    })

    describe('analyzeSentiment (Mock)', () => {
        it('should return mock neutral sentiment', async () => {
            const result = await aiService.analyzeSentiment('Saya senang sekali')
            expect(result.sentiment).toBe('netral')
            expect(result.confidence).toBe(0.75)
        })
    })
})
