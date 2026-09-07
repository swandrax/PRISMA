import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Video, ShieldCheck, Camera, Wifi } from 'lucide-react';

export const Route = createFileRoute('/cctv/')({
  component: CCTVMonitorPage,
});

const CCTV_CAMERAS = [
  { id: 'CAM-01', name: 'Pos Satpam Gerbang Utama (RT 04)', status: 'ONLINE', block: 'Gerbang Depan' },
  { id: 'CAM-02', name: 'Perempatan Jalan Blok A & B', status: 'ONLINE', block: 'Blok A/B' },
  { id: 'CAM-03', name: 'Taman Bermain & Balai Warga', status: 'ONLINE', block: 'Fasum' },
  { id: 'CAM-04', name: 'Gang Ujung Blok C (Jalan Keluar)', status: 'ONLINE', block: 'Blok C' },
];

function CCTVMonitorPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
          <Video className="w-3.5 h-3.5" />
          <span>Pengawasan Digital Real-Time</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Titik Pantau CCTV Lingkungan RT 04
        </h1>
        <p className="text-xs text-slate-500">
          Kamera keamanan publik terintegrasi untuk keamanan bersama seluruh warga.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CCTV_CAMERAS.map((cam) => (
          <div
            key={cam.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm space-y-3"
          >
            <div className="relative aspect-video bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4">
              <Camera className="w-10 h-10 text-slate-600 mb-2" />
              <span className="text-xs font-mono">LIVE FEED ENCRYPTED STREAM</span>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{cam.status}</span>
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500">
                {cam.id} • 1080p 30fps
              </div>
            </div>

            <div className="p-4 pt-1 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{cam.name}</h3>
                <p className="text-xs text-slate-500">Area: {cam.block}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
