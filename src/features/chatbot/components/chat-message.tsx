import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import ChatFeedback from '@/components/ai/ChatFeedback';

export interface ChatMessageProps {
  message: ChatMessageType;
  sessionId: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, sessionId }) => {
  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-2 w-full">
        <div
          className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-center text-xs leading-relaxed text-amber-800 dark:text-amber-300 shadow-sm flex flex-col items-center gap-2 max-w-[92%]"
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="font-medium text-center">{message.content}</p>
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

  const isBot = message.role === 'bot';

  return (
    <div className={`flex flex-col w-full ${isBot ? 'items-start' : 'items-end'}`}>
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
        <p className="whitespace-pre-line m-0">{message.content}</p>
      </div>

      {isBot && message.id !== 'initial-msg' && message.userMessageContext && message.responseTimeMs && (
        <div className="mt-1 px-1">
          <ChatFeedback
            sessionId={sessionId}
            userMessage={message.userMessageContext}
            aiResponse={message.content}
            responseTimeMs={message.responseTimeMs}
          />
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
