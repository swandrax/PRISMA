import { AgentResponse, ChatMessage } from '../types';
import { intentRouter } from '../agents/router';

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<AgentResponse> {
  return intentRouter.process(message, history);
}
