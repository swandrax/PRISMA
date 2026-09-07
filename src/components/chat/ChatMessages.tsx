// c:\Users\user\Desktop\prisma\src\components\chat\ChatMessages.tsx
'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ChatMessage } from '@/Services/chatbot/types';
import ChatFeedback from '@/components/ai/ChatFeedback';
import { useChatStore } from '@/stores/chat.store';

interface ChatMessagesProps {
  messages: ChatMessage[];
  sessionId: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = React.memo(
  ({ messages, sessionId }) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const agentStatus = useChatStore((s) => s.agentStatus);

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
        {messages.map((m, index) => {
          if (m.role === 'system') {
            return (
              <div key={m.id || index} className="flex justify-center my-2 w-full">
                <div
                  className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-center text-xs leading-relaxed text-amber-800 dark:text-amber-300 shadow-sm flex flex-col items-center gap-2 max-w-[92%]"
                  style={{
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="font-medium text-center">{m.content}</p>
                  <a
                    href="https://wa.me/6287872004448?text=Halo%20Pak%20RT%20Erry%2C%20saya%20warga%20RT%2004%20ingin%20bertanya%20mengenai..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors shadow-sm mt-1"
                  >
                    Hubungi Pak RT via WA
                  </a>
                </div>
              </div>
            );
          }

          const isBot = m.role === 'bot';

          return (
            <div
              key={m.id || index}
              className={`flex flex-col w-full ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`
                  rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm
                  ${
                    isBot
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                      : 'bg-emerald-800 text-white rounded-tr-none'
                  }
                `}
                style={{
                  maxWidth: '85%',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                <p className="whitespace-pre-line m-0">{m.content}</p>
              </div>

              {/* Bot response feedback */}
              {isBot && m.id !== 'initial-msg' && m.userMessageContext && m.responseTimeMs && (
                <div className="mt-1 px-1">
                  <ChatFeedback
                    sessionId={sessionId}
                    userMessage={m.userMessageContext}
                    aiResponse={m.content}
                    responseTimeMs={m.responseTimeMs}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start w-full">
            <div
              className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-3 rounded-tl-none flex items-center gap-1.5 shadow-sm"
              aria-label="Mbak PRISMA sedang mengetik"
            >
              <span className="w-2 h-2 bg-emerald-700/70 dark:bg-emerald-400/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-emerald-700/70 dark:bg-emerald-400/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-emerald-700/70 dark:bg-emerald-400/80 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';
