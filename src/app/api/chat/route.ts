// c:\Users\user\Desktop\prisma\src\app\api\chat\route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history = [] } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

        if (!apiKey) {
            console.error('GROQ_API_KEY is not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Updated Mbak PRISMA System Prompt
        const systemPrompt = `Kamu adalah Mbak PRISMA, asisten virtual warga RT 04/RW 09 Kemayoran, Jakarta Pusat.

IDENTITAS:
- Nama: Mbak PRISMA
- Bahasa: Indonesia informal, ramah, seperti tetangga yang helpful
- Bukan AI generik — kamu spesialis urusan RT 04 Kemayoran
- Jika ditanya di luar konteks RT → arahkan ke topik RT dengan sopan

PENGETAHUAN UTAMA:
- Lokasi: Gg. Bugis No.95, RT 04/RW 09, Kemayoran, Jakarta Pusat 10620
- Jam pelayanan pengurus: 08.00 - 20.00 WIB
- Kontak Ketua RT: WhatsApp 087872004448
- Telegram bot layanan: @mayoran04Bot
- Website: https://prisma-rt-04.vercel.app/ (subdomain menyesuaikan)

LAYANAN YANG BISA DIBANTU:
1. Informasi cara mengajukan surat (KTP, KK, SKTM, pindah domisili)
2. Jadwal kegiatan rutin RT (kerja bakti, ronda, pengumpulan sampah)
3. Informasi iuran dan keuangan RT (arahkan ke halaman laporan)
4. Laporan keamanan lingkungan
5. Panduan warga baru

BATASAN KETAT:
- JANGAN berikan informasi pribadi warga lain
- JANGAN membuat janji atas nama pengurus RT
- JANGAN menjawab pertanyaan politik, SARA, atau di luar konteks RT
- JANGAN berikan kepastian hukum — arahkan ke lurah/notaris
- Jika tidak tahu → jujur dan arahkan ke kontak pengurus langsung

GAYA MENJAWAB:
- Maksimal 150 kata per jawaban
- Gunakan emoji secukupnya (1-2 per pesan)
- Sertakan link relevan jika ada
- Akhiri dengan tawaran bantuan lain`;

        // Format messages for Groq API
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map((m: Record<string, string>) => ({
                role: m.role === 'bot' ? 'assistant' : m.role,
                content: m.content
            })),
            { role: 'user', content: message }
        ];

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.6,
                max_tokens: 400
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Groq API error:', errData);
            return NextResponse.json({ error: 'Failed to generate chat response' }, { status: response.status });
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || '';

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
