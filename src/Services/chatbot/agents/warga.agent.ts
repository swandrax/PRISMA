// c:\Users\user\Desktop\prisma\src\services\chatbot\agents\warga.agent.ts
import { ChatAgent, AgentResponse, ChatMessage } from '../types';

export const WargaAgent: ChatAgent = {
  name: 'Warga Agent',
  intent: 'warga',
  keywords: [
    'warga',
    'pendataan',
    'data warga',
    'pindah',
    'warga baru',
    'mutasi',
    'kk baru',
    'keluarga',
    'ktp baru',
    'daftar warga',
  ],

  canHandle(message: string): boolean {
    const lower = message.toLowerCase();
    return this.keywords.some((kw) => lower.includes(kw));
  },

  async process(_message: string, _history?: ChatMessage[]): Promise<AgentResponse> {
    const reply = `Halo Kak! 👥 Terkait **Pendataan Warga RT 04 Kemayoran**:\n\n1. **Warga Baru / Pindahan**:\n   - Wajib lapor 1x24 jam ke Ketua RT (Bpk. R Erry Adu Sundaru).\n   - Menyerahkan salinan KTP dan KK terbaru.\n2. **Registrasi Akun Portal PRISMA**:\n   - Bisa mendaftar online di portal agar data keluarga tercatat digital dan dapat mengakses layanan surat serta info kas secara mandiri.\n\nAda data keluarga yang ingin diperbarui Kak?`;

    return {
      reply,
      intent: 'warga',
      confidence: 0.9,
      metadata: { actionUrl: '/warga' },
    };
  },
};
