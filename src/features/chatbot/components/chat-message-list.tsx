import * as React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { ChatMessage } from './chat-message';
import { TypingIndicator } from './typing-indicator';
import { useChatbotStore } from '../stores/chatbot.store';

export interface ChatMessageListProps {
  messages: ChatMessageType[];
  sessionId: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = React.memo(
  ({ messages, sessionId }) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const agentStatus = useChatbotStore((s) => s.agentStatus);

    const isTyping =
      agentStatus === 'routing' ||
      agentStatus === 'thinking' ||
      agentStatus === 'responding';

    const scrollToBottom = React.useCallback(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, []);

    React.useEffect(() => {
      scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    return (
      <div
        ref={scrollContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Riwayat percakapan"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-3.5 bg-slate-50 dark:bg-slate-900/50"
        style={{
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.map((m, index) => (
          <ChatMessage
            key={m.id || index}
            message={m}
            sessionId={sessionId}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    );
  }
);

ChatMessageList.displayName = 'ChatMessageList';
