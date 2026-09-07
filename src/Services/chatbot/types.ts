// c:\Users\user\Desktop\prisma\src\services\chatbot\types.ts

export type AgentIntentType =
  | 'surat'
  | 'keuangan'
  | 'warga'
  | 'keamanan'
  | 'informasi_rt'
  | 'general';

export type MessageRole = 'bot' | 'user' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
  responseTimeMs?: number;
  userMessageContext?: string;
  intent?: AgentIntentType;
}

export interface AgentResponse {
  reply: string;
  intent: AgentIntentType;
  confidence: number;
  metadata?: Record<string, unknown>;
  responseTimeMs?: number;
}

export interface ChatAgent {
  name: string;
  intent: AgentIntentType;
  keywords: string[];
  canHandle(message: string): boolean;
  process(message: string, history?: ChatMessage[]): Promise<AgentResponse>;
}
