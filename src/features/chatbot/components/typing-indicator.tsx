import * as React from 'react';

export const TypingIndicator: React.FC = React.memo(() => {
  return (
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
  );
});

TypingIndicator.displayName = 'TypingIndicator';
