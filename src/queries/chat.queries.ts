// c:\Users\user\Desktop\prisma\src\queries\chat.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { ChatMessage } from '@/Services/chatbot/types';
import { ChatbotService, INITIAL_CHATBOT_MESSAGES } from '@/Services/chatbot/chatbot.service';
import { useChatStore } from '@/stores/chat.store';

export const MAX_SESSION_MESSAGES = 20;

export function useChatMessages(sessionId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: queryKeys.chat.messages(sessionId),
    queryFn: () => {
      // Return cached in-memory messages or default initial greeting
      return INITIAL_CHATBOT_MESSAGES;
    },
    staleTime: Infinity, // messages state in query cache managed dynamically
    gcTime: 1000 * 60 * 60 * 24, // keep for 24h
    initialData: INITIAL_CHATBOT_MESSAGES,
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();
  const setAgentStatus = useChatStore((s) => s.setAgentStatus);
  const isOpen = useChatStore((s) => s.isOpen);
  const incrementUnreadCount = useChatStore((s) => s.incrementUnreadCount);

  return useMutation({
    mutationFn: async ({
      message,
      currentMessages,
    }: {
      message: string;
      currentMessages: ChatMessage[];
    }) => {
      setAgentStatus('thinking');
      const response = await ChatbotService.sendMessage(message, currentMessages);
      setAgentStatus('responding');
      return { response, message };
    },
    onMutate: async ({ message }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.chat.messages(sessionId) });

      const previousMessages =
        queryClient.getQueryData<ChatMessage[]>(queryKeys.chat.messages(sessionId)) ||
        INITIAL_CHATBOT_MESSAGES;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message.trim(),
        timestamp: new Date().toISOString(),
      };

      const userCount = previousMessages.filter((m) => m.role === 'user').length + 1;

      let nextMessages = [...previousMessages, userMessage];

      // Check session rate limit
      if (userCount >= MAX_SESSION_MESSAGES) {
        const limitMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content:
            'Sesi tanya jawab Anda hari ini sudah mencapai batas 20 pesan. Jika masih ada pertanyaan penting, silakan hubungi Pak RT langsung melalui WhatsApp.',
          timestamp: new Date().toISOString(),
        };
        nextMessages = [...nextMessages, limitMessage];
      }

      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.messages(sessionId),
        nextMessages
      );

      setAgentStatus('routing');

      return { previousMessages, isLimitReached: userCount >= MAX_SESSION_MESSAGES };
    },
    onSuccess: ({ response, message }, _vars, context) => {
      if (context?.isLimitReached) {
        setAgentStatus('idle');
        return;
      }

      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        content: response.reply,
        timestamp: new Date().toISOString(),
        responseTimeMs: response.responseTimeMs,
        userMessageContext: message,
        intent: response.intent,
      };

      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.messages(sessionId),
        (old = []) => [...old, botMessage]
      );

      if (!isOpen) {
        incrementUnreadCount();
      }

      setAgentStatus('idle');
    },
    onError: (_err, _vars, context) => {
      setAgentStatus('error');
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.chat.messages(sessionId),
          context.previousMessages
        );
      }
      setTimeout(() => setAgentStatus('idle'), 2000);
    },
  });
}
