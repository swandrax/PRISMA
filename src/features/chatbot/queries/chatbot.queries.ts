import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../api/chat';
import { useChatbotStore } from '../stores/chatbot.store';

export const CHAT_QUERY_KEY = (sessionId: string) => ['chatbot', 'messages', sessionId] as const;

export const MAX_SESSION_MESSAGES = 20;

export const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: 'initial-msg',
  role: 'bot',
  content: 'Halo! Saya Mbak PRISMA, asisten warga RT 04 Kemayoran. Ada yang bisa saya bantu terkait surat, iuran, pendataan, atau info kegiatan RT?',
  timestamp: Date.now(),
  intent: 'general',
};

export function useChatMessages(sessionId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: CHAT_QUERY_KEY(sessionId),
    queryFn: () => [INITIAL_BOT_MESSAGE],
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();
  const setAgentStatus = useChatbotStore((s) => s.setAgentStatus);
  const isOpen = useChatbotStore((s) => s.isOpen);
  const incrementUnread = useChatbotStore((s) => s.incrementUnread);

  return useMutation({
    mutationFn: async ({
      message,
      currentMessages,
    }: {
      message: string;
      currentMessages: ChatMessage[];
    }) => {
      setAgentStatus('routing');
      const response = await sendChatMessage(message, currentMessages);
      return response;
    },
    onMutate: async ({ message }) => {
      await queryClient.cancelQueries({ queryKey: CHAT_QUERY_KEY(sessionId) });
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(CHAT_QUERY_KEY(sessionId)) || [];

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      queryClient.setQueryData<ChatMessage[]>(CHAT_QUERY_KEY(sessionId), [...previousMessages, userMsg]);
      setAgentStatus('thinking');

      return { previousMessages };
    },
    onSuccess: (data, variables) => {
      setAgentStatus('responding');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: data.reply,
        timestamp: Date.now(),
        intent: data.intent,
        actionUrl: (data.metadata?.actionUrl as string) || undefined,
        userMessageContext: variables.message,
        responseTimeMs: data.responseTimeMs,
      };

      queryClient.setQueryData<ChatMessage[]>(CHAT_QUERY_KEY(sessionId), (old = []) => [...old, botMsg]);

      if (!isOpen) {
        incrementUnread();
      }

      setTimeout(() => {
        setAgentStatus('idle');
      }, 300);
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(CHAT_QUERY_KEY(sessionId), context.previousMessages);
      }
      setAgentStatus('error');

      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'system',
        content: 'Terjadi gangguan jaringan saat menghubungi asisten AI. Silakan coba kembali atau hubungi pengurus RT.',
        timestamp: Date.now(),
      };

      queryClient.setQueryData<ChatMessage[]>(CHAT_QUERY_KEY(sessionId), (old = []) => [...old, fallbackMsg]);

      setTimeout(() => {
        setAgentStatus('idle');
      }, 1500);
    },
  });
}
