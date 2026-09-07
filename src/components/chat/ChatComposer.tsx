// c:\Users\user\Desktop\prisma\src\components\chat\ChatComposer.tsx
'use client';

import * as React from 'react';
import { Send, ShieldAlert } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLimitReached?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = React.memo(
  ({ onSend, disabled = false, isLimitReached = false }) => {
    const inputDraft = useChatStore((s) => s.inputDraft);
    const setInputDraft = useChatStore((s) => s.setInputDraft);
    const resetDraft = useChatStore((s) => s.resetDraft);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (disabled || isLimitReached || !inputDraft.trim()) return;
      const message = inputDraft.trim();
      resetDraft();
      onSend(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <footer
        className="w-full max-w-full min-w-0 p-3 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 shrink-0"
        style={{ boxSizing: 'border-box' }}
      >
        {isLimitReached ? (
          <div
            className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl w-full border border-amber-200/80 dark:border-amber-900/40 justify-center"
            role="alert"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="truncate">Batas maksimum 20 pesan tercapai.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 w-full min-w-0 max-w-full"
            style={{
              display: 'flex',
              gap: '8px',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputDraft}
              onChange={(e) => setInputDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ketik pesan seputar RT 04..."
              className="min-w-0 flex-1 w-full rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/30 transition-all disabled:opacity-50"
              style={{
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                height: '44px',
              }}
            />

            <button
              type="submit"
              disabled={disabled || !inputDraft.trim()}
              aria-label="Kirim pesan"
              className="flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white shadow-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                width: '44px',
                height: '44px',
                flexShrink: 0,
                minWidth: '44px',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </footer>
    );
  }
);

ChatComposer.displayName = 'ChatComposer';
