// c:\Users\user\Desktop\prisma\src\services\chatbot\chatbot.service.ts
import { ChatMessage, AgentResponse } from './types';
import { chatbotOrchestrator } from './orchestrator';

export const INITIAL_CHATBOT_MESSAGES: ChatMessage[] = [
  {
    id: 'initial-msg',
    role: 'bot',
    content: 'Halo! Saya Mbak PRISMA 👋 Bisa bantu apa nih seputar layanan RT 04 Kemayoran?',
    timestamp: new Date().toISOString(),
  },
];

export const QUICK_ACTION_CHIPS = [
  { id: 'surat', label: 'Cara Bikin Surat Pengantar', prompt: 'Cara Bikin Surat Pengantar' },
  { id: 'iuran', label: 'Cek Iuran Bulanan', prompt: 'Cek Iuran Bulanan' },
  { id: 'ronda', label: 'Jadwal Ronda & Kerja Bakti', prompt: 'Jadwal Ronda & Kerja Bakti' },
  { id: 'kontak', label: 'Hubungi Pak RT', prompt: 'Hubungi Pak RT' },
  { id: 'warga', label: 'Pendataan Warga Baru', prompt: 'Bagaimana cara pendataan warga baru di RT 04?' },
];

export class ChatbotService {
  public static async sendMessage(
    message: string,
    history: ChatMessage[] = []
  ): Promise<AgentResponse> {
    return chatbotOrchestrator.process(message, history);
  }

  public static getInitialMessages(): ChatMessage[] {
    return [...INITIAL_CHATBOT_MESSAGES];
  }
}
