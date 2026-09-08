import { ChatAgent, AgentResponse, ChatMessage } from '../types';

export const KeuanganAgent: ChatAgent = {
  name: 'Keuangan Agent',
  intent: 'keuangan',
  keywords: [
    'iuran',
    'keuangan',
    'kas',
    'bayar',
    'tagihan',
    'saldo',
    'uang kas',
    'laporan keuangan',
    'iuran bulanan',
    'cek iuran',
    'transfer',
  ],

  canHandle(message: string): boolean {
    const lower = message.toLowerCase();
    return this.keywords.some((kw) => lower.includes(kw));
  },

  async process(_message: string, _history?: ChatMessage[]): Promise<AgentResponse> {
    const reply = `Halo Kak! 💳 Informasi kas dan pembayaran iuran bulanan RT 04 transparan dan dapat dicek di menu **Keuangan** (https://prisma-rose.vercel.app/keuangan/laporan).\n\n💰 **Rincian Iuran RT 04:**\n- Mencakup dana keamanan malam, kebersihan lingkungan, dan kas sosial warga.\n- Pembayaran dapat ditransfer via QRIS atau rekening resmi RT.\n- Konfirmasi pembayaran atau kendala tagihan bisa menghubungi Bendahara RT (Hj. Nurhayati).`;

    return {
      reply,
      intent: 'keuangan',
      confidence: 0.95,
      metadata: { actionUrl: '/keuangan/laporan' },
    };
  },
};
