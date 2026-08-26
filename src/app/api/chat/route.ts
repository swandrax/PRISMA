// c:\Users\user\Desktop\prisma\src\app\api\chat\route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history = [] } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        const aiGatewayApiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
        const groqModelEnv = process.env.GROQ_MODEL;

        // Supported Groq models list with priority
        const groqCandidateModels = [
            groqModelEnv && groqModelEnv !== 'GPT-OSS-120B' ? groqModelEnv : null,
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
            'gemma2-9b-it'
        ].filter(Boolean) as string[];

        // System Prompt for Mbak PRISMA
        const systemPrompt = `Kamu adalah Mbak PRISMA, asisten virtual ramah dan solutif warga RT 04/RW 09 Kemayoran, Jakarta Pusat.

IDENTITAS & KARAKTER:
- Nama: Mbak PRISMA
- Bahasa: Indonesia informal, ramah, santun, dan sangat membantu
- Spesialisasi: Seluruh urusan administrasi, keamanan, dan kegiatan warga RT 04 Kemayoran

INFORMASI UTAMA RT 04 KEMAYORAN:
- Lokasi: Gg. Bugis No. 95, RT 04 / RW 09, Kemayoran, Jakarta Pusat 10620
- Jam Pelayanan Pengurus: Setiap hari pukul 08.00 - 20.00 WIB
- Ketua RT 04: Bpk. R Erry Adu Sundaru (WhatsApp: 087872004448)
- Sekretaris & IT: Bpk. Swandaru Tirta (WhatsApp: 087782380077)
- Bendahara: Hj. Nurhayati
- Seksi Keamanan: Bambang Pamungkas
- Seksi Humas: Dra. Siti Aminah
- Portal Resmi: https://prisma-rose.vercel.app/

LAYANAN UTAMA:
1. Surat Pengantar (KTP, KK, SKCK, SKTM, Surat Keterangan Domisili, Keterangan Usaha, Kematian)
2. Iuran Warga & Kas RT (Bisa dicek di menu Keuangan)
3. Laporan Keamanan (Menu Lapor Keamanan)
4. Ronda & Kerja Bakti Rutin

PANDUAN JAWABAN:
- Berikan penjelasan langkah demi langkah yang jelas dan ringkas.
- Sertakan kontak WhatsApp pengurus jika warga butuh tindak lanjut mendesak.
- Gunakan emoji ramah (1-2 per pesan).
- Maksimal 150-200 kata per jawaban.`;

        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...history.map((m: Record<string, string>) => ({
                role: m.role === 'bot' ? 'assistant' : m.role,
                content: m.content
            })),
            { role: 'user', content: message }
        ];

        let reply: string | null = null;

        // 1. Try Groq API with fallback models
        if (groqApiKey) {
            for (const modelName of groqCandidateModels) {
                try {
                    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${groqApiKey}`
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages: formattedMessages,
                            temperature: 0.6,
                            max_tokens: 500
                        })
                    });

                    if (groqRes.ok) {
                        const data = await groqRes.json();
                        reply = data.choices?.[0]?.message?.content || null;
                        if (reply) break;
                    } else {
                        const errorDetail = await groqRes.text();
                        console.warn(`Groq model ${modelName} failed:`, errorDetail);
                    }
                } catch (groqErr) {
                    console.warn(`Groq request error on model ${modelName}:`, groqErr);
                }
            }
        }

        // 2. Fallback to Neon AI Gateway if Groq did not return a reply
        if (!reply && aiGatewayApiKey) {
            try {
                const aiGatewayRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${aiGatewayApiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: formattedMessages,
                        temperature: 0.6,
                        max_tokens: 500
                    })
                });

                if (aiGatewayRes.ok) {
                    const data = await aiGatewayRes.json();
                    reply = data.choices?.[0]?.message?.content || null;
                }
            } catch (gatewayErr) {
                console.warn('AI Gateway request error:', gatewayErr);
            }
        }

        // 3. Fallback: Intelligent Local Rule-Based Engine (Zero-Downtime Guarantee)
        if (!reply) {
            const lowerMsg = message.toLowerCase();

            if (lowerMsg.includes('surat') || lowerMsg.includes('pengantar') || lowerMsg.includes('domisili') || lowerMsg.includes('skck') || lowerMsg.includes('ktp') || lowerMsg.includes('sktm')) {
                reply = `Halo Kak! 😊 Untuk membuat **Surat Pengantar RT**, Kakak bisa langsung masuk ke menu **Layanan Surat** di portal PRISMA (https://prisma-rose.vercel.app/surat).\n\n📄 **Syarat umum:**\n1. Foto KTP & Kartu Keluarga (KK)\n2. Tentukan keperluan (Domisili, SKCK, SKTM, atau Keterangan Usaha)\n\nSetelah diajukan, surat akan langsung diproses oleh Sekretaris RT atau Pak RT (Bpk. R Erry Adu Sundaru di WA: 087872004448). Ada yang bisa dibantu lagi Kak?`;
            } else if (lowerMsg.includes('iuran') || lowerMsg.includes('keuangan') || lowerMsg.includes('kas') || lowerMsg.includes('bayar')) {
                reply = `Halo Kak! 💳 Informasi kas dan pembayaran iuran bulanan RT 04 transparan dan dapat dicek di menu **Keuangan** (https://prisma-rose.vercel.app/keuangan/laporan).\n\nBesaran iuran RT meliputi dana keamanan, kebersihan, dan kas sosial. Konfirmasi pembayaran juga bisa dilakukan langsung melalui portal atau menghubungi Bendahara RT (Hj. Nurhayati).`;
            } else if (lowerMsg.includes('ronda') || lowerMsg.includes('keamanan') || lowerMsg.includes('kerja bakti') || lowerMsg.includes('jadwal')) {
                reply = `Halo Kak! 🛡️ **Jadwal Kegiatan RT 04 Kemayoran:**\n- **Kerja Bakti**: Setiap Minggu pertama awal bulan pukul 07.00 WIB.\n- **Siskamling / Ronda Malam**: Setiap malam pukul 22.00 - 04.00 WIB.\n\nJika ada hal mencurigakan atau pengaduan kamtibmas, Kakak bisa lapor di menu **Lapor Keamanan** atau kontak Pak Bambang (Seksi Keamanan) via WA 081299887766.`;
            } else if (lowerMsg.includes('pak rt') || lowerMsg.includes('kontak') || lowerMsg.includes('nomor') || lowerMsg.includes('hubungi') || lowerMsg.includes('telepon')) {
                reply = `Berikut kontak pengurus RT 04 Kemayoran Kak:\n\n👤 **Ketua RT (Bpk. R Erry Adu Sundaru)**: 0878-7200-4448\n💻 **Sekretaris & IT (Bpk. Swandaru Tirta)**: 0877-8238-0077\n📍 **Alamat Kantor/Pos**: Gg. Bugis No. 95, RT 04/RW 09 Kemayoran\n⏰ **Jam Pelayanan**: 08.00 - 20.00 WIB.`;
            } else {
                reply = `Halo Kak! Saya Mbak PRISMA, asisten warga RT 04 Kemayoran. 😊\n\nKakak bisa tanya saya seputar:\n1. 📄 Pembuatan Surat Pengantar (Domisili, SKCK, Usaha, dll)\n2. 💰 Cek Kas & Pembayaran Iuran Warga\n3. 🛡️ Jadwal Ronda & Laporan Keamanan Lingkungan\n4. 📞 Kontak Langsung Pengurus RT\n\nSilakan ketik pertanyaan Kakak ya!`;
            }
        }

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        console.error('Chat API Error:', error);
        return NextResponse.json({
            reply: 'Halo Kak! Saya Mbak PRISMA. Sistem sedang melakukan sinkronisasi, namun Kakak tetap bisa mengajukan surat di menu Layanan Surat atau menghubungi Pak RT via WhatsApp: 087872004448 ya! 🙏'
        });
    }
}
