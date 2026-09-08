import { ChatAgent, AgentResponse, ChatMessage } from '../types';

export const KeamananAgent: ChatAgent = {
  name: 'Keamanan Agent',
  intent: 'keamanan',
  keywords: [
    'keamanan',
    'ronda',
    'siskamling',
    'kerja bakti',
    'jadwal ronda',
    'lapor keamanan',
    'kejadian',
    'pencurian',
    'pos ronda',
    'darurat',
    'kebersihan',
  ],

  canHandle(message: string): boolean {
    const lower = message.toLowerCase();
    return this.keywords.some((kw) => lower.includes(kw));
  },

  async process(_message: string, _history?: ChatMessage[]): Promise<AgentResponse> {
    const reply = `Halo Kak! 🛡️ **Informasi Keamanan & Kegiatan RT 04 Kemayoran:**\n\n- **Jadwal Kerja Bakti**: Setiap Minggu pertama awal bulan, pukul 07.00 WIB.\n- **Siskamling / Ronda Malam**: Setiap malam pukul 22.00 - 04.00 WIB di Pos Ronda Gg. Bugis.\n- **Pengaduan & Darurat**: Laporkan gangguan kamtibmas melalui menu **Lapor Keamanan** di portal atau hubungi Pak Bambang Pamungkas (Seksi Keamanan) via WA di 0812-9988-7766.`;

    return {
      reply,
      intent: 'keamanan',
      confidence: 0.95,
      metadata: { actionUrl: '/keamanan' },
    };
  },
};
