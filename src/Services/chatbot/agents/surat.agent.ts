// c:\Users\user\Desktop\prisma\src\services\chatbot\agents\surat.agent.ts
import { ChatAgent, AgentResponse, ChatMessage } from '../types';

export const SuratAgent: ChatAgent = {
  name: 'Surat Agent',
  intent: 'surat',
  keywords: [
    'surat',
    'pengantar',
    'domisili',
    'skck',
    'ktp',
    'sktm',
    'kartu keluarga',
    'keterangan usaha',
    'kematian',
    'bikin surat',
    'buat surat',
    'cetak surat',
  ],

  canHandle(message: string): boolean {
    const lower = message.toLowerCase();
    return this.keywords.some((kw) => lower.includes(kw));
  },

  async process(message: string, _history?: ChatMessage[]): Promise<AgentResponse> {
    const lower = message.toLowerCase();
    let reply = `Halo Kak! 😊 Untuk membuat **Surat Pengantar RT**, Kakak bisa langsung masuk ke menu **Layanan Surat** di portal PRISMA (https://prisma-rose.vercel.app/surat).\n\n📄 **Syarat umum pengajuan:**\n1. Foto KTP & Kartu Keluarga (KK)\n2. Tentukan keperluan surat (Domisili, SKCK, SKTM, atau Keterangan Usaha)\n\nSetelah diajukan, surat akan langsung diverifikasi dan ditandatangani oleh Sekretaris RT atau Pak RT (Bpk. R Erry Adu Sundaru di WA: 087872004448). Ada yang bisa dibantu lagi Kak?`;

    if (lower.includes('domisili')) {
      reply = `Halo Kak! 📄 Untuk **Surat Keterangan Domisili RT 04**:\n1. Siapkan foto KTP & Kartu Keluarga\n2. Masuk ke portal PRISMA bagian Layanan Surat\n3. Pilih jenis "Surat Keterangan Domisili"\n4. Isi alamat lengkap tempat tinggal di RT 04\n\nSurat dapat langsung diunduh atau diambil setelah disetujui Pak RT (0878-7200-4448).`;
    } else if (lower.includes('skck')) {
      reply = `Halo Kak! 👮‍♂️ Untuk **Surat Pengantar SKCK**:\n1. Lampirkan identitas KTP & KK RT 04\n2. Masuk ke menu Layanan Surat di portal PRISMA\n3. Cantumkan keperluan pembuatan SKCK (misal: melamar pekerjaan)\n4. Setelah disahkan Pak RT, bawa surat pengantar ke Kelurahan & Polsek setempat.`;
    }

    return {
      reply,
      intent: 'surat',
      confidence: 0.95,
      metadata: { actionUrl: '/surat' },
    };
  },
};
