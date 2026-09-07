// c:\Users\user\Desktop\prisma\src\components\chat\ChatHeader.tsx
'use client';

import * as React from 'react';
import { X, Minus, Sparkles } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';

interface ChatHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({ onClose, onMinimize }) => {
  const toggleOpen = useChatStore((s) => s.toggleOpen);
  const toggleMinimized = useChatStore((s) => s.toggleMinimized);
  const agentStatus = useChatStore((s) => s.agentStatus);

  const handleClose = onClose || toggleOpen;
  const handleMinimize = onMinimize || toggleMinimized;

  const isBusy = agentStatus === 'thinking' || agentStatus === 'routing' || agentStatus === 'responding';

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md select-none border-b border-emerald-700/30">
      <div className="flex items-center gap-3 min-w-0">
        {/* Circular MP Avatar */}
        <div className="relative shrink-0">
          <div className="bg-emerald-950 text-white font-bold h-10 w-10 rounded-full flex items-center justify-center border-2 border-emerald-700/50 shadow-inner">
            MP
          </div>
          {/* Online status indicator */}
          <span
            className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full"
            title="Online"
            aria-hidden="true"
          />
        </div>

        {/* Title and Status */}
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
              Mbak PRISMA
            </h2>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
          </div>
          <p className="text-[11px] text-emerald-200/90 font-medium leading-tight truncate">
            {isBusy ? (
              <span className="text-emerald-300 font-semibold animate-pulse">
                Sedang mengetik...
              </span>
            ) : (
              'Asisten Warga RT 04'
            )}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimize}
          aria-label="Kecilkan chat"
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup chat"
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
});

ChatHeader.displayName = 'ChatHeader';
