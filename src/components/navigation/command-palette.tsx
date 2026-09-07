import * as React from 'react';
import { useNavigationStore } from '@/stores/navigation.store';
import { searchGlobal, GlobalSearchResult } from '@/server/services/search.service';
import { Search, X, Users, FileText, DollarSign, ShieldAlert, Bell, ArrowRight, Loader2 } from 'lucide-react';

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, searchQuery, setSearchQuery } = useNavigationStore();
  const [results, setResults] = React.useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Debounced search trigger
  React.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isCommandPaletteOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Warga':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'Surat':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'Keuangan':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'Keamanan':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari warga, surat, transaksi, laporan keamanan, atau pengumuman..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />}
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Nav Suggestions when query is empty */}
        {searchQuery.trim().length < 2 && (
          <div className="p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Navigasi Cepat
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/surat/ajukan"
                onClick={() => setCommandPaletteOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Ajukan Surat Baru</span>
              </a>
              <a
                href="/keamanan/lapor"
                onClick={() => setCommandPaletteOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Lapor Keamanan</span>
              </a>
              <a
                href="/keuangan/iuran"
                onClick={() => setCommandPaletteOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span>Bayar Iuran RT</span>
              </a>
              <a
                href="/layanan/aspirasi"
                onClick={() => setCommandPaletteOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Bell className="w-4 h-4 text-purple-500" />
                <span>Sampaikan Aspirasi</span>
              </a>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800">
            {results.map((res) => (
              <a
                key={`${res.category}-${res.id}`}
                href={res.url}
                onClick={() => setCommandPaletteOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    {getCategoryIcon(res.category)}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {res.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {res.subtitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0 ml-2" />
              </a>
            ))}
          </div>
        )}

        {searchQuery.trim().length >= 2 && results.length === 0 && !isLoading && (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;
          </div>
        )}

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">ESC</kbd> untuk menutup</span>
          <span>Pencarian Cepat PRISMA</span>
        </div>
      </div>
    </div>
  );
}
