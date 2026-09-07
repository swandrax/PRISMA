import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Image, Calendar, Tag } from 'lucide-react';

export const Route = createFileRoute('/galeri/')({
  component: GaleriPage,
});

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Kerja Bakti & Pembersihan Saluran Blok A',
    date: '24 Agustus 2026',
    category: 'Kegiatan Warga',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    title: 'Peringatan HUT RI & Lomba Anak Balai Warga',
    date: '17 Agustus 2026',
    category: 'Perayaan',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    title: 'Penyuluhan Posyandu & Cek Kesehatan Gratis',
    date: '10 Juli 2026',
    category: 'Kesehatan',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
  },
];

function GaleriPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
          <Image className="w-3.5 h-3.5" />
          <span>Dokumentasi Guyub Rukun RT 04</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Galeri Aktivitas & Komunitas
        </h1>
        <p className="text-xs text-slate-500">
          Momen kebersamaan, bakti sosial, dan dokumentasi gotong royong warga RT 04 / RW 09.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {item.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
