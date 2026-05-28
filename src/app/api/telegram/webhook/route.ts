// c:\Users\user\Desktop\prisma\src\app\api\telegram\webhook\route.ts
import { NextResponse } from 'next/server';
import { bot } from '@/lib/telegram/bot';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(request: Request) {
    // 1. Verify Secret Token
    const secretToken = request.headers.get('x-telegram-bot-api-secret-token');
    if (WEBHOOK_SECRET && secretToken !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        
        // Only handle messages
        if (!body.message || !body.message.text) {
            return NextResponse.json({ status: 'ignored' });
        }

        const chatId = body.message.chat.id;
        const text = body.message.text.trim();

        // 2. Simple Rate Limiting Check (max 10 requests per minute per chat)
        const { data: rlData, error: rlError } = await supabase
            .from('rate_limits')
            .select('*')
            .eq('chat_id', chatId)
            .single();

        const now = new Date();
        let shouldProcess = true;

        if (rlData) {
            const windowStart = new Date(rlData.window_start);
            const diffMinutes = (now.getTime() - windowStart.getTime()) / 60000;

            if (diffMinutes < 1) {
                if (rlData.count >= 10) {
                    shouldProcess = false;
                    // Only warn once
                    if (rlData.count === 10) {
                        await bot.sendMessage(chatId, "⚠️ Anda mengirim terlalu banyak permintaan. Silakan tunggu 1 menit.");
                    }
                    await supabase.from('rate_limits').update({ count: rlData.count + 1 }).eq('chat_id', chatId);
                } else {
                    await supabase.from('rate_limits').update({ count: rlData.count + 1 }).eq('chat_id', chatId);
                }
            } else {
                // Reset window
                await supabase.from('rate_limits').update({ count: 1, window_start: now.toISOString() }).eq('chat_id', chatId);
            }
        } else {
            // First time
            await supabase.from('rate_limits').insert([{ chat_id: chatId, count: 1, window_start: now.toISOString() }]);
        }

        if (!shouldProcess) {
            return NextResponse.json({ status: 'rate_limited' });
        }

        // 3. Process Commands
        if (text.startsWith('/start')) {
            const welcomeMsg = `Halo! Saya Mbak Prisma, asisten virtual RT 04 Kemayoran.\n\nBerikut perintah yang tersedia:\n/pengumuman - Info terbaru\n/keuangan - Saldo Kas RT\n/status [ID] - Cek status surat\n/bantuan - Cara penggunaan`;
            await bot.sendMessage(chatId, welcomeMsg);
        } 
        else if (text.startsWith('/pengumuman')) {
            const { data } = await supabase.from('pengumuman').select('*').order('tanggal', { ascending: false }).limit(3);
            if (data && data.length > 0) {
                let msg = '📢 <b>PENGUMUMAN TERBARU</b>\n\n';
                data.forEach((p, i) => {
                    msg += `${i+1}. <b>${p.judul}</b>\n${p.isi.substring(0, 50)}...\n\n`;
                });
                await bot.sendMessage(chatId, msg);
            } else {
                await bot.sendMessage(chatId, 'Belum ada pengumuman terbaru.');
            }
        }
        else if (text.startsWith('/keuangan')) {
            const { data } = await supabase.from('keuangan_bulanan').select('*').order('tahun', { ascending: false }).order('bulan', { ascending: false }).limit(1).single();
            if (data) {
                const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
                const msg = `💰 <b>INFO KAS RT 04</b>\n\nSaldo Saat Ini: <b>${formatter.format(data.saldo)}</b>\nBulan: ${data.bulan} ${data.tahun}`;
                await bot.sendMessage(chatId, msg);
            } else {
                await bot.sendMessage(chatId, 'Data keuangan belum tersedia.');
            }
        }
        else if (text.startsWith('/status')) {
            const parts = text.split(' ');
            if (parts.length < 2) {
                await bot.sendMessage(chatId, 'Format salah. Gunakan: <code>/status ID_SURAT</code>');
            } else {
                const id = parts[1];
                const { data } = await supabase.from('pengajuan_surat').select('*').eq('id', id).single();
                if (data) {
                    await bot.sendMessage(chatId, `📝 <b>STATUS SURAT (${id})</b>\n\nJenis: ${data.jenis}\nStatus: <b>${data.status.toUpperCase()}</b>`);
                } else {
                    await bot.sendMessage(chatId, `Surat dengan ID ${id} tidak ditemukan.`);
                }
            }
        }
        else if (text.startsWith('/bantuan')) {
            const helpMsg = `Bantuan PRISMA RT 04:\n\n1. Web: ${process.env.NEXT_PUBLIC_SITE_URL}\n2. Ajukan surat dari website, Anda akan dapat ID unik untuk dicek via bot.\n3. Pertanyaan lain hubungi pengurus RT.`;
            await bot.sendMessage(chatId, helpMsg);
        }
        else {
            await bot.sendMessage(chatId, "Maaf, perintah tidak dikenali. Ketik /bantuan untuk daftar perintah.");
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
