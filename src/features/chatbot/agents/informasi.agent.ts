import { ChatAgent, AgentResponse, ChatMessage } from '../types';

export const InformasiAgent: ChatAgent = {
  name: 'Informasi RT Agent',
  intent: 'informasi_rt',
  keywords: [
    'pak rt',
    'kontak',
    'pengurus',
    'nomor',
    'hubungi',
    'telepon',
    'wa',
    'whatsapp',
    'alamat',
    'lokasi',
    'jam buka',
    'jam pelayanan',
    'sekretaris',
    'bendahara',
  ],

  canHandle(message: string): boolean {
    const lower = message.toLowerCase();
    return this.keywords.some((kw) => lower.includes(kw));
  },

  async process(_message: string, _history?: ChatMessage[]): Promise<AgentResponse> {
    const reply = `Berikut informasi kontak & kepengurusan RT 04/RW 09 Kemayoran Kak:\n\n👤 **Ketua RT (Bpk. R Erry Adu Sundaru)**: 0878-7200-4448\n💻 **Sekretaris & IT (Bpk. Swandaru Tirta)**: 0877-8238-0077\n💰 **Bendahara**: Ibu Hj. Nurhayati\n🛡️ **Seksi Keamanan**: Bpk. Bambang Pamungkas (0812-9988-7766)\n📍 **Pos Pelayanan**: Gg. Bugis No. 95, RT 04 / RW 09 Kemayoran\n⏰ **Jam Pelayanan**: Setiap hari 08.00 - 20.00 WIB.`;

    return {
      reply,
      intent: 'informasi_rt',
      confidence: 0.95,
      metadata: { contactPhone: '087872004448' },
    };
  },
};
