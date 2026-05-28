// c:\Users\user\Desktop\prisma\src\lib\telegram\notifications.ts
import { bot } from './bot';

const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_GROUP_ID;

export async function notifyNewSurat(data: any) {
    if (!adminChatId) return;

    const message = `
🚨 <b>PENGAJUAN SURAT BARU</b> 🚨

<b>Jenis Surat:</b> ${data.jenis}
<b>Nama Pemohon:</b> ${data.nama_pemohon || 'Warga RT 04'}
<b>Status:</b> ⏳ Menunggu Diproses

Mohon pengurus segera memeriksa dashboard admin PRISMA.
<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/surat">Buka Dashboard Admin</a>
    `.trim();

    await bot.sendMessageWithKeyboard(adminChatId, message, [
        [{ text: 'Lihat Detail', url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/surat` }]
    ]);
}

export async function notifySuratStatus(data: any) {
    // If we have the user's telegram chat id stored, we can notify them directly. 
    // For now, this notifies the admin group or if user_chat_id is passed.
    const targetChatId = data.user_chat_id || adminChatId;
    if (!targetChatId) return;

    let statusEmoji = '🔄';
    if (data.status === 'selesai') statusEmoji = '✅';
    else if (data.status === 'ditolak') statusEmoji = '❌';

    const message = `
📝 <b>UPDATE STATUS SURAT</b>

<b>Jenis Surat:</b> ${data.jenis}
<b>Status Baru:</b> ${statusEmoji} ${data.status.toUpperCase()}
${data.catatan ? `<b>Catatan:</b> ${data.catatan}` : ''}

Cek status selengkapnya di aplikasi PRISMA.
    `.trim();

    await bot.sendMessage(targetChatId, message);
}

export async function notifyNewTransaksi(data: any) {
    if (!adminChatId) return;

    const isPemasukan = data.jenis === 'pemasukan';
    const typeEmoji = isPemasukan ? '📈' : '📉';
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.jumlah);

    const message = `
💰 <b>TRANSAKSI BARU</b>

<b>Jenis:</b> ${typeEmoji} ${data.jenis.toUpperCase()}
<b>Kategori:</b> ${data.kategori}
<b>Jumlah:</b> ${formattedAmount}
<b>Deskripsi:</b> ${data.deskripsi}

Catatan keuangan PRISMA telah diperbarui.
    `.trim();

    await bot.sendMessage(adminChatId, message);
}
