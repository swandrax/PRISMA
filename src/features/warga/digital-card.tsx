import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { maskNIK, maskNoKK, formatDateID } from '@/lib/formatting';
import { ShieldCheck, Printer, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DigitalResidentCardProps {
  prismaId: string;
  nama: string;
  nik: string;
  noKK?: string | null;
  rt: string;
  rw: string;
  alamat: string;
  status: string;
  verificationStatus: string;
  tanggalLahir?: string | Date | null;
  fotoUrl?: string | null;
}

export function DigitalResidentCard({
  prismaId,
  nama,
  nik,
  noKK,
  rt,
  rw,
  alamat,
  status,
  verificationStatus,
  tanggalLahir,
  fotoUrl,
}: DigitalResidentCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://prisma-rt04.pages.dev';
  const qrVerificationUrl = `${baseUrl}/warga/verify/${prismaId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-xl mx-auto">
      {/* Front of Card */}
      <div
        ref={cardRef}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white shadow-2xl border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-xl"
      >
        {/* Holographic accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
              P
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-cyan-300">
                Kartu Identitas Warga Digital
              </h2>
              <p className="text-xs text-slate-300">RT {rt} / RW {rw} • Kelurahan Kemayoran</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{verificationStatus}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Photo & QR */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-md flex items-center justify-center">
              {fotoUrl ? (
                <img src={fotoUrl} alt={nama} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div className="p-2 bg-white rounded-xl shadow-md">
              <QRCodeSVG value={qrVerificationUrl} size={76} level="M" />
            </div>
          </div>

          {/* Details */}
          <div className="sm:col-span-2 space-y-3 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">PRISMA ID</div>
              <div className="font-mono font-bold text-cyan-300 tracking-wide">{prismaId}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Nama Lengkap</div>
              <div className="font-semibold text-white text-base leading-tight">{nama}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">NIK Terproteksi</div>
                <div className="font-mono text-slate-200 text-xs">{maskNIK(nik)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">No. KK</div>
                <div className="font-mono text-slate-200 text-xs">{maskNoKK(noKK)}</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Alamat Domisili</div>
              <div className="text-slate-200 text-xs leading-snug">{alamat}</div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-slate-400">
              <span>Status: <strong className="text-white">{status}</strong></span>
              {tanggalLahir && <span>Lahir: {formatDateID(tanggalLahir)}</span>}
            </div>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span>Otentikasi Kriptografis PRISMA RT 04</span>
          <span>Pindai QR untuk verifikasi resmi</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Cetak Kartu
        </Button>
      </div>
    </div>
  );
}
