import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, UserCheck, AlertCircle, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kebijakan Privasi & Perlindungan Data Pribadi",
  description: "Kebijakan Privasi dan Perlindungan Data Pribadi warga PRISMA RT 04/RW 09 Kemayoran sesuai UU No. 27 Tahun 2022 (UU PDP).",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "27 Agustus 2026";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            Pembaruan Terakhir: {lastUpdated}
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Kepatuhan UU No. 27 Tahun 2022 (UU PDP)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kebijakan Privasi & Perlindungan Data Pribadi
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Platform Realisasi Informasi, Sistem Manajemen & Administrasi (<strong>PRISMA</strong>) RT 04 / RW 09 Kelurahan Kemayoran berkomitmen penuh untuk melindungi privasi, kerahasiaan, dan keamanan data pribadi seluruh warga sesuai dengan peraturan perundang-undangan Republik Indonesia.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid gap-6">
          {/* 1. Pengendali Data Pribadi */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white font-bold">1. Pengendali Data Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2 leading-relaxed">
              <p>
                Pengendali Data Pribadi atas pemrosesan data dalam platform ini adalah <strong>Pengurus Rukun Tetangga 04 / Rukun Warga 09</strong>, Kelurahan Kemayoran, Kecamatan Kemayoran, Kota Administrasi Jakarta Pusat.
              </p>
              <p>
                Platform ini dikembangkan dan dikelola secara mandiri sebagai inisiatif digital non-komersial guna mempercepat pelayanan administrasi kependudukan, transparansi keuangan kas lingkungan, dan keamanan warga RT 04.
              </p>
            </CardContent>
          </Card>

          {/* 2. Jenis Data Pribadi yang Dikumpulkan */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white font-bold">2. Data Pribadi yang Kami Kumpulkan</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>Kami hanya mengumpulkan data yang relevan dan dibutuhkan untuk pelayanan warga, meliputi:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Data Identitas Umum:</strong> Nama lengkap, nomor telepon (WhatsApp), alamat rumah/blok, status tempat tinggal, dan foto identitas.</li>
                <li><strong>Data Kependudukan Spesifik:</strong> Nomor Induk Kependudukan (NIK), Nomor Kartu Keluarga (No KK), tempat & tanggal lahir (hanya dikumpulkan saat warga mengajukan surat pengantar resmi).</li>
                <li><strong>Data Transaksi Keuangan Lingkungan:</strong> Riwayat pembayaran iuran kas RT, bukti transfer, dan donasi kegiatan sosial lingkungan.</li>
                <li><strong>Data Laporan & Aduan:</strong> Deskripsi laporan keamanan, lokasi insiden, dan foto bukti yang dikirimkan warga.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Tujuan Pemrosesan Data */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Eye className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white font-bold">3. Tujuan dan Dasar Pemrosesan Data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2 leading-relaxed">
              <p>Data pribadi Anda diproses semata-mata untuk tujuan:</p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                <li>Penerbitan surat pengantar RT resmi (Surat Kematian, SKTM, Pindah Domisili, Keterangan Umum).</li>
                <li>Pencatatan dan pelaporan transparansi keuangan kas RT 04 yang dapat diaudit secara akuntabel.</li>
                <li>Tindak lanjut dan verifikasi laporan keamanan serta ketertiban lingkungan.</li>
                <li>Penyampaian informasi penting, jadwal kegiatan, dan pengumuman darurat warga.</li>
              </ol>
              <p className="pt-2 text-xs text-emerald-400/90 font-medium">
                Kami menjamin bahwa data pribadi warga TIDAK AKAN PERNAH dijual, disewakan, atau diserahkan kepada pihak ketiga untuk kepentingan komersial, periklanan, atau pemasaran.
              </p>
            </CardContent>
          </Card>

          {/* 4. Keamanan & Perlindungan Teknis */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white font-bold">4. Langkah Keamanan & Perlindungan Teknis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2 leading-relaxed">
              <p>Untuk melindungi data pribadi dari akses tanpa hak, pengubahan, atau kebocoran, kami menerapkan:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Enkripsi In-Transit:</strong> Seluruh komunikasi data dilindungi dengan protokol HTTPS / TLS 1.3 dan header HSTS ketat.</li>
                <li><strong>Enkripsi At-Rest:</strong> Database serverless dan penyimpanan berkas diamankan dengan enkripsi standar AES-256.</li>
                <li><strong>Kontrol Akses Berbasis Peran (RBAC):</strong> Hanya pengurus RT berwenang yang dapat mengakses rincian NIK dan dokumen lengkap.</li>
                <li><strong>Masking Informasi Sensitif:</strong> Tampilan publik secara otomatis menyamarkan saldo, nomor identitas, dan data sensitif.</li>
                <li><strong>Pencatatan Jejak Audit (Audit Logging):</strong> Setiap aktivitas pendaftaran dan perubahan data terekam secara sistematis.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Hak-Hak Warga sebagai Subjek Data */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white font-bold">5. Hak-Hak Anda Berdasarkan UU PDP</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2 leading-relaxed">
              <p>Sebagai Subjek Data Pribadi (Pasal 5 s.d. 13 UU No. 27/2022), setiap warga RT 04 berhak untuk:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Hak Akses:</strong> Meminta konfirmasi dan salinan data pribadi yang tersimpan di sistem.</li>
                <li><strong>Hak Pemutakhiran/Koreksi:</strong> Memperbaiki kesalahan data identitas, nomor telepon, atau data keluarga.</li>
                <li><strong>Hak Penghapusan (Right to Erasure):</strong> Meminta penghapusan data apabila sudah tidak berdomisili di RT 04 (setelah kewajiban administrasi tuntas).</li>
                <li><strong>Hak Menarik Persetujuan:</strong> Menarik kembali persetujuan pemrosesan data tertentu dengan konsekuensi pembatasan layanan online terkait.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Kontak & Pengaduan */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Phone className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white font-bold">6. Layanan Pengaduan & Kontak Perlindungan Data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-4 leading-relaxed">
              <p>
                Jika Anda memiliki pertanyaan, keberatan, atau ingin menggunakan hak Anda terkait data pribadi, silakan hubungi sekretariat RT 04:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Ketua RT 04 RW 09</span>
                  <p className="text-white font-medium text-sm">Bpk. R Erry Adu Sundaru</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                    <Phone className="h-3.5 w-3.5 text-green-400" />
                    +62 878-7200-4448
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Admin & IT Specialist</span>
                  <p className="text-white font-medium text-sm">Swandaru Tirta</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                    <Mail className="h-3.5 w-3.5 text-blue-400" />
                    swandrax@gmail.com
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-green-400" />
                    +62 877-8238-0077
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Sekretariat: Gg. Bugis No. 95, Kemayoran, Jakarta Pusat 10620</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
