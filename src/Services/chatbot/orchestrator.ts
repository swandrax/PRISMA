// c:\Users\user\Desktop\prisma\src\services\chatbot\orchestrator.ts
import { ChatAgent, AgentResponse, ChatMessage, AgentIntentType } from './types';
import { SuratAgent } from './agents/surat.agent';
import { KeuanganAgent } from './agents/keuangan.agent';
import { WargaAgent } from './agents/warga.agent';
import { KeamananAgent } from './agents/keamanan.agent';
import { InformasiRTAgent } from './agents/informasi-rt.agent';

export class ChatbotOrchestrator {
  private static instance: ChatbotOrchestrator;
  private agents: ChatAgent[] = [];

  private constructor() {
    // Register specialized domain agents
    this.registerAgent(SuratAgent);
    this.registerAgent(KeuanganAgent);
    this.registerAgent(WargaAgent);
    this.registerAgent(KeamananAgent);
    this.registerAgent(InformasiRTAgent);
  }

  public static getInstance(): ChatbotOrchestrator {
    if (!ChatbotOrchestrator.instance) {
      ChatbotOrchestrator.instance = new ChatbotOrchestrator();
    }
    return ChatbotOrchestrator.instance;
  }

  public registerAgent(agent: ChatAgent): void {
    this.agents.push(agent);
  }

  /**
   * Identifies the primary intent from the user message
   */
  public routeIntent(message: string): AgentIntentType {
    for (const agent of this.agents) {
      if (agent.canHandle(message)) {
        return agent.intent;
      }
    }
    return 'general';
  }

  /**
   * Dispatches the message to the corresponding specialized subagent
   */
  public async dispatchToAgent(
    message: string,
    history: ChatMessage[] = []
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    const intent = this.routeIntent(message);
    const targetAgent = this.agents.find((a) => a.intent === intent);

    if (targetAgent) {
      const response = await targetAgent.process(message, history);
      return {
        ...response,
        responseTimeMs: Date.now() - startTime,
      };
    }

    // Default general response
    return {
      reply: `Halo Kak! Saya Mbak PRISMA, asisten warga RT 04 Kemayoran. 😊\n\nKakak bisa tanya saya seputar:\n1. 📄 Pembuatan Surat Pengantar (Domisili, SKCK, Usaha, Kematian)\n2. 💰 Cek Kas & Pembayaran Iuran Warga\n3. 👥 Pendataan Warga Baru & Kartu Keluarga\n4. 🛡️ Jadwal Ronda & Laporan Keamanan Lingkungan\n5. 📞 Kontak Langsung Pengurus RT\n\nSilakan pilih opsi cepat di bawah atau ketik langsung pertanyaan Kakak ya!`,
      intent: 'general',
      confidence: 0.8,
      responseTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Main orchestrator processing pipeline:
   * 1. Try server API /api/chat (Groq / AI Gateway)
   * 2. Fallback to specialized local subagents if network or server error occurs
   */
  public async process(
    message: string,
    history: ChatMessage[] = []
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    const intent = this.routeIntent(message);

    try {
      const rollingHistory = history.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: rollingHistory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
          return {
            reply: data.reply,
            intent,
            confidence: 0.98,
            responseTimeMs: Date.now() - startTime,
          };
        }
      }
    } catch {
      // Network or API route unreachable, fallback to local agents
    }

    // High availability fallback to local specialized agents
    return this.dispatchToAgent(message, history);
  }
}

export const chatbotOrchestrator = ChatbotOrchestrator.getInstance();
