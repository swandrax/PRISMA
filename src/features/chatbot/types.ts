export type AgentIntentType = 'warga' | 'surat' | 'keuangan' | 'keamanan' | 'informasi_rt' | 'general';

export type AgentStatus = 'idle' | 'routing' | 'thinking' | 'responding' | 'error';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp?: number;
  intent?: AgentIntentType;
  actionUrl?: string;
  userMessageContext?: string;
  responseTimeMs?: number;
}

export interface QuickActionChip {
  id: string;
  label: string;
  prompt: string;
  intent: AgentIntentType;
}

export interface AgentResponse {
  reply: string;
  intent: AgentIntentType;
  confidence: number;
  responseTimeMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatAgent {
  name: string;
  intent: AgentIntentType;
  keywords: string[];
  canHandle(message: string): boolean;
  process(message: string, history?: ChatMessage[]): Promise<AgentResponse>;
}
