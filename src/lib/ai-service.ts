/**
 * PRISMA AI Service Client
 * Calls local Ollama AI via /api/chat endpoint
 * Falls back to mock responses when backend is unavailable
 */

import { sanitizeServerInput } from './security';
import { MockDB } from './mockDatabase';

// Types
export interface SentimentResult {
    text: string;
    sentiment: 'positif' | 'netral' | 'negatif';
    confidence: number;
    method: string;
}

export interface ChatResponse {
    user_input: string;
    response: string;
    intent: string;
    confidence: number;
    action?: {
        type: 'navigate' | 'link';
        label: string;
        value: string;
    };
    reasoning?: string;
}

export interface PredictionResult {
    predictions: number[];
    months_ahead: number;
    trend: 'naik' | 'turun' | 'stabil';
    confidence: number;
}

export interface ChurnPrediction {
    warga_id: string;
    churn_probability: number;
    risk_level: 'tinggi' | 'sedang' | 'rendah';
}

export interface ActivityRecommendation {
    id: string;
    name: string;
    score: number;
    reason?: string;
}

export interface ClusterResult {
    citizen_id: string;
    segment: string;
    segment_id: number;
}

// Mock responses for surat-related queries (fallback)
const SURAT_RESPONSES: Record<string, string> = {
    'domisili': 'Untuk Surat Keterangan Domisili, Anda memerlukan: nama lengkap, alamat, dan lama tinggal. Silakan download template "Surat Keterangan Domisili" di daftar template.',
    'sktm': 'Untuk SKTM (Surat Keterangan Tidak Mampu), Anda perlu menyiapkan: nama, alamat, pekerjaan, dan penghasilan. Template tersedia di kategori Administrasi.',
    'pindah': 'Untuk Surat Pengantar Pindah Domisili, siapkan: nama, alamat asal, alamat tujuan, dan alasan pindah.',
    'kematian': 'Untuk Surat Keterangan Kematian, diperlukan: nama almarhum, tanggal meninggal, tempat meninggal, dan penyebab.',
    'umum': 'Untuk Surat Keterangan RT Umum/Kelakuan Baik, cukup siapkan: nama, alamat, dan keperluan surat.',
    'keamanan': 'Untuk Laporan Keamanan, Anda perlu mengisi: kronologi kejadian, tanggal kejadian, nama pelapor, dan nomor telepon.',
};

// API Client — Real Groq + Mock Fallback
class AIServiceClient {
    private get chatApiUrl(): string {
        if (typeof window !== 'undefined') {
            if (process.env.NEXT_PUBLIC_CHAT_API_URL) {
                return process.env.NEXT_PUBLIC_CHAT_API_URL;
            }
            const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000/api/v1';
            return `${gatewayUrl}/ai/chat`;
        }
        return '/api/chat';
    }

    /**
     * Chat with PRISMA virtual assistant (Ollama AI)
     * Falls back to mock if backend is unavailable
     */
    async chat(message: string): Promise<ChatResponse> {
        // SEC-FIX AI-1: Sanitize user input before sending to LLM
        const sanitizedMessage = sanitizeServerInput(message, 2000);

        try {
            const res = await fetch(this.chatApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: sanitizedMessage }),
            });

            if (res.ok) {
                const data = await res.json();
                // SEC-FIX AI-4: Sanitize LLM response to prevent stored XSS
                const safeReply = sanitizeServerInput(data.reply || 'Tidak ada respons.', 5000);
                return {
                    user_input: sanitizedMessage,
                    response: safeReply,
                    intent: data.intent || 'ai_response',
                    confidence: 0.95,
                    action: data.action
                };
            }
        } catch {
            // Fall through to mock
        }

        // Fallback: RAG + Guardrails + Reasoning
        return this._mockChatWithRAG(sanitizedMessage);
    }

    private _mockChatWithRAG(message: string): ChatResponse {
        const lowerMessage = message.toLowerCase();

        // 1. Input Guardrails Check
        const guardrail = this._runInputGuardrails(message);
        if (!guardrail.passed) {
            const reasoning = `[INPUT GUARDRAILS] Menganalisis keamanan teks input...\n⚠️ BLOCKED: ${guardrail.reason}\n[REASONING] Menghentikan proses penjawaban untuk keamanan.`;
            return {
                user_input: message,
                response: `Maaf, saya tidak dapat menjawab pertanyaan tersebut. Alasan: ${guardrail.reason}`,
                intent: 'blocked',
                confidence: 1.0,
                reasoning
            };
        }

        let response = '';
        let intent = 'general';
        let action: ChatResponse['action'] = undefined;
        const reasoningSteps: string[] = [
            `[INPUT GUARDRAILS] Validasi input berhasil. Pertanyaan terverifikasi aman dan relevan dengan lingkungan RT 04.`
        ];

        // 2. Local RAG Retrieval & Logic
        let matchedLetterType = false;
        for (const [key, value] of Object.entries(SURAT_RESPONSES)) {
            if (lowerMessage.includes(key)) {
                reasoningSteps.push(`[REASONING] Mendeteksi pengajuan surat spesifik: ${key}.`);
                response = value;
                intent = `surat_${key}`;
                action = { type: 'navigate', label: 'Buat Surat', value: '/surat' };
                matchedLetterType = true;
                break;
            }
        }

        if (matchedLetterType) {
            // Already handled
        }
        else if (lowerMessage.includes('pengurus') || lowerMessage.includes('ketua rt') || lowerMessage.includes('sekretaris') || lowerMessage.includes('bendahara')) {
            reasoningSteps.push(`[REASONING] Menemukan kata kunci terkait struktur organisasi.`);
            reasoningSteps.push(`[RAG RETRIEVAL] Mengambil daftar pengurus aktif dari MockDB.getPengurus().`);

            try {
                const pengurus = MockDB.getPengurus();
                reasoningSteps.push(`[RAG CONTEXT] Berhasil mengambil ${pengurus.length} data pengurus.`);

                const list = pengurus.map(p => `- ${p.jabatan}: ${p.nama} (Periode ${p.periode})`).join('\n');
                response = `Berikut adalah susunan Pengurus RT 04 RW 09 Kemayoran:\n\n${list}\n\nUntuk informasi detail atau kontak pengurus, silakan hubungi Pak RT langsung.`;
                intent = 'pengurus';
                action = { type: 'link', label: 'Hubungi Ketua RT via WA', value: 'https://wa.me/6287872004448' };
            } catch {
                reasoningSteps.push(`[RAG ERROR] Gagal mengakses MockDB, menggunakan data statis fallback.`);
                response = `Pengurus RT 04 RW 09 Kemayoran:\n- Ketua RT: Rerry Adusundaru\n- Sekretaris: Sekretaris RT 04\n- Bendahara: Bendahara RT 04`;
                intent = 'pengurus';
            }
        }
        else if (lowerMessage.includes('warga') || lowerMessage.includes('penduduk') || lowerMessage.includes('kk') || lowerMessage.includes('statistik')) {
            reasoningSteps.push(`[REASONING] Mendeteksi pertanyaan mengenai demografi/statistik warga.`);
            reasoningSteps.push(`[RAG RETRIEVAL] Membaca data statistik dari MockDB.getStatistik().`);

            try {
                const stats = MockDB.getStatistik();
                reasoningSteps.push(`[RAG CONTEXT] Demografi retrieved: Total Warga = ${stats.totalWarga}, Total KK = ${stats.totalKK}.`);

                response = `Berdasarkan data kependudukan digital RT 04 Kemayoran:\n- Total Warga: ${stats.totalWarga} jiwa\n- Estimasi Kepala Keluarga (KK): ${stats.totalKK} KK\n- Warga Tetap: ${stats.wargaAktif} jiwa\n- Pendatang Baru: ${stats.pendatangBaru} jiwa\n\nData ini diperbarui secara otomatis setiap kali ada pendaftaran warga baru.`;
                intent = 'statistik_warga';
                action = { type: 'navigate', label: 'Lihat Data Administrasi', value: '/layanan/administrasi' };
            } catch {
                reasoningSteps.push(`[RAG ERROR] Gagal mengakses data kependudukan MockDB.`);
                response = `Saat ini sistem pencatatan warga sedang offline. Namun secara umum terdapat sekitar 15-20 warga aktif yang terdaftar di RT 04.`;
                intent = 'statistik_warga';
            }
        }
        else if (lowerMessage.includes('iuran') || lowerMessage.includes('kas') || lowerMessage.includes('keuangan') || lowerMessage.includes('biaya') || lowerMessage.includes('bayar')) {
            reasoningSteps.push(`[REASONING] Mendeteksi kata kunci keuangan, iuran warga, atau kas RT.`);
            reasoningSteps.push(`[RAG RETRIEVAL] Mengambil laporan kas bulan terbaru dari MockDB.getFinanceReports().`);

            try {
                const reports = MockDB.getFinanceReports();
                const latest = reports[reports.length - 1];
                reasoningSteps.push(`[RAG CONTEXT] Data laporan keuangan kas periode ${latest.bulan} ${latest.tahun} berhasil diambil.`);

                const formatCur = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

                response = `Ringkasan Laporan Kas RT 04 (Periode ${latest.bulan} ${latest.tahun}):\n- Saldo Awal: ${formatCur(latest.saldo_awal)}\n- Total Pemasukan: ${formatCur(latest.total_pemasukan)}\n- Total Pengeluaran: ${formatCur(latest.total_pengeluaran)}\n- Saldo Akhir (Kas Bersih): ${formatCur(latest.saldo_akhir)}\n\nIuran bulanan warga ditetapkan sebesar Rp 10.000 per rumah. Pembayaran dapat ditransfer ke rekening RT atau via QRIS.`;
                intent = 'keuangan';
                action = { type: 'navigate', label: 'Rincian Kas & Bayar Iuran', value: '/keuangan/iuran' };
            } catch {
                reasoningSteps.push(`[RAG ERROR] Gagal mengambil laporan keuangan dari MockDB.`);
                response = `Anda dapat melihat laporan keuangan kas RT 04 Kemayoran secara transparan dan melakukan pembayaran iuran warga di menu Keuangan.`;
                intent = 'keuangan';
                action = { type: 'navigate', label: 'Cek Kas & Iuran', value: '/keuangan/iuran' };
            }
        }
        else if (lowerMessage.includes('lapor') || lowerMessage.includes('lampu') || lowerMessage.includes('sampah') || lowerMessage.includes('keamanan') || lowerMessage.includes('insiden') || lowerMessage.includes('maling')) {
            reasoningSteps.push(`[REASONING] Mengidentifikasi laporan insiden atau pengaduan keamanan/infrastruktur.`);
            reasoningSteps.push(`[RAG RETRIEVAL] Membaca insiden terbaru dari MockDB.getSecurityReports() untuk referensi.`);

            try {
                const reports = MockDB.getSecurityReports();
                reasoningSteps.push(`[RAG CONTEXT] Ditemukan ${reports.length} laporan insiden di lingkungan.`);

                response = `Untuk melaporkan gangguan keamanan (seperti pencurian), lampu jalan padam, atau masalah kebersihan di wilayah RT 04, silakan buat laporan resmi di menu Keamanan & Laporan Insiden.\n\nSistem mencatat ada ${reports.length} insiden aktif yang sedang ditangani oleh pengurus.`;
                intent = 'laporan_insiden';
                action = { type: 'navigate', label: 'Buat Laporan Insiden', value: '/surat/keamanan' };
            } catch {
                response = `Untuk melaporkan insiden kebersihan, ketertiban warga, atau fasilitas jalan rusak, silakan isi form pengaduan keamanan.`;
                intent = 'laporan_insiden';
                action = { type: 'navigate', label: 'Buka Form Pelaporan', value: '/surat/keamanan' };
            }
        }
        else if (lowerMessage.includes('surat') || lowerMessage.includes('administrasi') || lowerMessage.includes('pengantar')) {
            reasoningSteps.push(`[REASONING] Mendeteksi kata kunci administrasi surat pengantar warga secara umum.`);
            reasoningSteps.push(`[RAG RETRIEVAL] Mengambil daftar template surat pengantar aktif dari MockDB.getTemplates().`);

            try {
                const templates = MockDB.getTemplates();
                reasoningSteps.push(`[RAG CONTEXT] Ditemukan ${templates.length} template surat yang aktif.`);

                const list = templates.map(t => `- ${t.title} (Kategori: ${t.category})`).join('\n');
                response = `PRISMA melayani administrasi surat pengantar digital secara mandiri. Berikut surat yang tersedia:\n${list}\n\nSilakan pilih salah satu surat di halaman Layanan Surat untuk mengisi formulir secara digital.`;
                intent = 'administrasi';
                action = { type: 'navigate', label: 'Pilih & Buat Surat', value: '/surat' };
            } catch {
                response = `PRISMA menyediakan pembuatan Surat Pengantar Domisili, SKTM (Surat Keterangan Tidak Mampu), Surat Pindah, dll.`;
                intent = 'administrasi';
                action = { type: 'navigate', label: 'Buka Layanan Surat', value: '/surat' };
            }
        }
        else if (lowerMessage.includes('hubungi') || lowerMessage.includes('rt') || lowerMessage.includes('kontak') || lowerMessage.includes('wa') || lowerMessage.includes('whatsapp') || lowerMessage.includes('telepon')) {
            reasoningSteps.push(`[REASONING] Mengidentifikasi kontak langsung pengurus.`);
            response = `Jika ada keperluan mendesak atau darurat, bapak/ibu dapat menghubungi Ketua RT 04 (Bp. Rerry Adusundaru) secara langsung melalui nomor WhatsApp resmi.`;
            intent = 'hubungi_rt';
            action = { type: 'link', label: 'Hubungi via WhatsApp', value: 'https://wa.me/6287872004448' };
        }
        else {
            reasoningSteps.push(`[REASONING] Kata kunci spesifik tidak ditemukan. Memberikan panduan penggunaan umum.`);
            response = `Halo! Saya Siaga, asisten virtual warga RT 04. Saya dapat membantu bapak/ibu mencari informasi kependudukan, memeriksa iuran bulanan & kas RT, membuat surat pengantar digital, atau melaporkan insiden lingkungan. Silakan ketik apa yang ingin Anda tanyakan!`;
            intent = 'general';
        }

        // 3. Output Guardrails Check (PII masking)
        reasoningSteps.push(`[OUTPUT GUARDRAILS] Memeriksa respon terhadap kebocoran PII atau data sensitif...`);
        const piiCheckPattern = /\b\d{16}\b/; // Simple NIK pattern check
        if (piiCheckPattern.test(response)) {
            reasoningSteps.push(`[OUTPUT GUARDRAILS] Peringatan: Respon mengandung angka 16 digit mirip NIK! Menyaring data.`);
            response = response.replace(piiCheckPattern, '****************');
        }
        reasoningSteps.push(`[OUTPUT GUARDRAILS] Verifikasi respon sukses. Data aman untuk ditampilkan.`);

        return {
            user_input: message,
            response,
            intent,
            confidence: 0.8,
            action,
            reasoning: reasoningSteps.join('\n')
        };
    }

    private _runInputGuardrails(message: string): { passed: boolean; reason?: string } {
        const text = message.toLowerCase();

        // 1. Off-topic check (must relate to RT 04 Kemayoran, warga, keuangan, surat, keamanan, or PRISMA)
        const allowedKeywords = [
            'rt', 'rw', 'warga', 'tetangga', 'iuran', 'kas', 'keuangan', 'laporan', 'saldo',
            'surat', 'pengantar', 'sktm', 'domisili', 'pindah', 'kematian', 'administrasi',
            'lapor', 'insiden', 'keamanan', 'maling', 'lampu', 'sampah', 'ronda', 'pos', 'bantuan',
            'cara', 'bagaimana', 'budi', 'siti', 'ahmad', 'dewi', 'eko', 'rerry', 'pengurus',
            'sekretaris', 'bendahara', 'kemayoran', 'prisma', 'halo', 'hai', 'pagi', 'siang', 'sore',
            'malam', 'tanya', 'fitur', 'menu', 'aplikasi'
        ];

        const hasKeyword = allowedKeywords.some(kw => text.includes(kw));

        // Prompt injection checks / code injection
        const harmfulPatterns = [/hack/i, /admin pass/i, /select \* from/i, /<script>/i];
        const isHarmful = harmfulPatterns.some(pattern => pattern.test(message));
        if (isHarmful) {
            return {
                passed: false,
                reason: 'Deteksi upaya injeksi kode atau manipulasi perintah sistem (Prompt Injection/SQL Injection).'
            };
        }

        // Off-topic topics check
        const offTopicKeywords = ['crypto', 'bitcoin', 'javascript', 'python', 'resep', 'masak', 'game', 'cheat', 'politik', 'presiden'];
        const isOffTopic = offTopicKeywords.some(kw => text.includes(kw));
        if (isOffTopic && !hasKeyword) {
            return {
                passed: false,
                reason: 'Pertanyaan di luar topik tata kelola RT 04 Kemayoran (Off-Topic Guardrail).'
            };
        }

        return { passed: true };
    }

    /**
     * Analyze sentiment (Mock)
     */
    async analyzeSentiment(text: string): Promise<SentimentResult> {
        return {
            text,
            sentiment: 'netral',
            confidence: 0.75,
            method: 'mock'
        };
    }

    /**
     * Check if AI backend (Ollama) is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const res = await fetch(this.chatApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'ping' }),
            });
            return res.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const aiService = new AIServiceClient();

// Export class for custom instances
export { AIServiceClient };

// Utility functions
export function getSentimentColor(sentiment: string): string {
    const colors: Record<string, string> = {
        positif: 'text-green-600 bg-green-100',
        netral: 'text-gray-600 bg-gray-100',
        negatif: 'text-red-600 bg-red-100',
    };
    return colors[sentiment] || colors.netral;
}

export function getRiskColor(riskLevel: string): string {
    const colors: Record<string, string> = {
        tinggi: 'text-red-600 bg-red-100',
        sedang: 'text-yellow-600 bg-yellow-100',
        rendah: 'text-green-600 bg-green-100',
    };
    return colors[riskLevel] || colors.rendah;
}

export function getTrendIcon(trend: string): string {
    const icons: Record<string, string> = {
        naik: '📈',
        turun: '📉',
        stabil: '➡️',
    };
    return icons[trend] || icons.stabil;
}
