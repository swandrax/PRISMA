import * as React from 'react';
import { useChatbotStore } from '../stores/chatbot.store';
import { QuickActionChip } from '../types';

export const DEFAULT_QUICK_ACTION_CHIPS: QuickActionChip[] = [
  {
    id: 'chip-surat',
    label: '📄 Bikin Surat Pengantar',
    prompt: 'Bagaimana cara mengajukan surat pengantar domisili atau SKCK online di PRISMA?',
    intent: 'surat',
  },
  {
    id: 'chip-iuran',
    label: '💰 Cek Iuran Kas RT',
    prompt: 'Berapa besaran iuran bulanan RT 04 dan bagaimana cara membayarnya?',
    intent: 'keuangan',
  },
  {
    id: 'chip-keamanan',
    label: '🛡️ Jadwal Ronda & Pos',
    prompt: 'Kapan jadwal ronda malam siskamling dan siapa kontak pos keamanan?',
    intent: 'keamanan',
  },
  {
    id: 'chip-warga',
    label: '👥 Pendataan Warga',
    prompt: 'Bagaimana syarat pendaftaran warga baru atau pindahan di RT 04 Kemayoran?',
    intent: 'warga',
  },
  {
    id: 'chip-pak-rt',
    label: '📞 Kontak Pengurus RT',
    prompt: 'Boleh minta kontak nomor WhatsApp Pak RT dan pengurus RT 04?',
    intent: 'informasi_rt',
  },
];

export interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = React.memo(
  ({ onSelectAction, disabled = false }) => {
    const setSelectedQuickAction = useChatbotStore((s) => s.setSelectedQuickAction);
    const selectedQuickAction = useChatbotStore((s) => s.selectedQuickAction);

    const handleClick = (id: string, prompt: string) => {
      if (disabled) return;
      setSelectedQuickAction(id);
      onSelectAction(prompt);
    };

    return (
      <nav
        aria-label="Aksi Cepat"
        className="w-full max-w-full min-w-0 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800 shrink-0 py-2.5"
        style={{ boxSizing: 'border-box' }}
      >
        <div
          className="quick-actions flex gap-2 overflow-x-auto max-w-full min-w-0 px-3 scrollbar-none no-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            maxWidth: '100%',
            minWidth: 0,
            paddingInline: '12px',
            boxSizing: 'border-box',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {DEFAULT_QUICK_ACTION_CHIPS.map((chip) => {
            const isSelected = selectedQuickAction === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                disabled={disabled}
                onClick={() => handleClick(chip.id, chip.prompt)}
                className={`
                  quick-action flex-none inline-flex items-center justify-center
                  rounded-full border px-3 py-1.5 text-xs font-semibold
                  transition-all duration-150 cursor-pointer select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                      : 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                  }
                `}
                style={{
                  flex: '0 0 auto',
                  whiteSpace: 'nowrap',
                  minHeight: '34px',
                  boxSizing: 'border-box',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
);

QuickActions.displayName = 'QuickActions';
