// c:\Users\user\Desktop\prisma\src\components\chat\ChatbotContainer.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { useChatMessages, useSendMessage, MAX_SESSION_MESSAGES } from '@/queries/chat.queries';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { QuickActions } from './QuickActions';
import { ChatComposer } from './ChatComposer';

export const ChatbotContainer: React.FC = () => {
  const isOpen = useChatStore((s) => s.isOpen);
  const isMinimized = useChatStore((s) => s.isMinimized);
  const toggleOpen = useChatStore((s) => s.toggleOpen);
  const setIsMinimized = useChatStore((s) => s.setIsMinimized);
  const unreadCount = useChatStore((s) => s.unreadCount);
  const agentStatus = useChatStore((s) => s.agentStatus);

  // Session ID persisted per mount
  const [sessionId] = React.useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'session-default-user'
  );

  // Server state managed exclusively through TanStack Query
  const { data: messages = [] } = useChatMessages(sessionId);
  const sendMessageMutation = useSendMessage(sessionId);

  const isBusy =
    agentStatus === 'routing' ||
    agentStatus === 'thinking' ||
    agentStatus === 'responding' ||
    sendMessageMutation.isPending;

  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const isLimitReached = userMessageCount >= MAX_SESSION_MESSAGES;

  const handleSendMessage = React.useCallback(
    (text: string) => {
      if (!text.trim() || isLimitReached || isBusy) return;
      sendMessageMutation.mutate({
        message: text,
        currentMessages: messages,
      });
    },
    [isLimitReached, isBusy, sendMessageMutation, messages]
  );

  return (
    <div
      className="chatbot-root pointer-events-none"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        zIndex: 9999,
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
    >
      {/* Floating Chat Modal / Mobile Fullscreen */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              pointer-events-auto
              fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6
              w-full sm:w-[420px] sm:max-w-[calc(100vw-32px)]
              ${isMinimized ? 'h-auto' : 'h-[100dvh] sm:h-[580px] sm:max-h-[85vh]'}
              flex flex-col
              bg-white dark:bg-slate-950
              border-0 sm:border sm:border-emerald-950/20 dark:sm:border-emerald-500/20
              rounded-none sm:rounded-2xl
              shadow-2xl ring-0 sm:ring-1 sm:ring-black/10
              overflow-hidden
            `}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ChatHeader */}
            <ChatHeader
              onClose={toggleOpen}
              onMinimize={() => setIsMinimized(!isMinimized)}
            />

            {/* When not minimized, display ChatMessages, QuickActions, and ChatComposer */}
            {!isMinimized && (
              <div
                className="flex-1 flex flex-col min-h-0 w-full overflow-hidden"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* ChatMessages */}
                <ChatMessages messages={messages} sessionId={sessionId} />

                {/* QuickActions (horizontal scrolling row, no wrap escaping) */}
                {!isLimitReached && (
                  <QuickActions
                    onSelectAction={handleSendMessage}
                    disabled={isBusy}
                  />
                )}

                {/* ChatComposer */}
                <ChatComposer
                  onSend={handleSendMessage}
                  disabled={isBusy}
                  isLimitReached={isLimitReached}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) Launcher */}
      {!isOpen && (
        <div className="pointer-events-auto fixed bottom-5 right-5 sm:bottom-6 sm:right-6">
          <motion.button
            type="button"
            onClick={toggleOpen}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Buka chat Mbak PRISMA"
            className="relative flex items-center justify-center rounded-full h-14 w-14 shadow-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 active:from-emerald-900 active:to-emerald-950 text-white border-2 border-white dark:border-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/50 transition-all duration-200 cursor-pointer"
          >
            <MessageSquare className="h-6 w-6 text-white" />

            {/* Unread Message Badge */}
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white shadow ring-2 ring-white dark:ring-slate-950 animate-bounce"
                aria-label={`${unreadCount} pesan belum dibaca`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

ChatbotContainer.displayName = 'ChatbotContainer';
export default ChatbotContainer;
